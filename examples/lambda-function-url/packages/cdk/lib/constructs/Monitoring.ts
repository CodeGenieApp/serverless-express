import { Construct } from 'constructs'
import {
  Alarm,
  AlarmRule,
  AlarmState,
  AlarmStatusWidget,
  CompositeAlarm,
  Dashboard,
  GraphWidget,
  Metric,
  TextWidget,
  TextWidgetBackground,
} from 'aws-cdk-lib/aws-cloudwatch'
import { IFunction } from 'aws-cdk-lib/aws-lambda'
import { IHttpApi } from 'aws-cdk-lib/aws-apigatewayv2'
import { IApp } from '@aws-cdk/aws-amplify-alpha'
import { ITableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { Topic } from 'aws-cdk-lib/aws-sns'
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions'
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions'
import { getEnvironmentConfig } from '../environment-config'

interface DashboardProps {
  amplifyApp: IApp
  api: IHttpApi
  userPoolId: string
  userPoolClientId: string
  functions: Array<IFunction>
  tables: Array<ITableV2>
}

export default class Monitoring extends Construct {
  public readonly dashboard?: Dashboard
  public readonly alarmSnsTopic?: Topic
  constructor(scope: Construct, id: string, props: DashboardProps) {
    super(scope, id)
    if (!this.getIsAlarmsEnabled() && !this.getIsDashboardEnabled()) {
      return
    }

    if (this.getIsAlarmsEnabled()) {
      this.alarmSnsTopic = new Topic(scope, 'AlarmTopic')
      const environmentConfig = getEnvironmentConfig(this.node)

      if (environmentConfig.monitoring!.alarmNotificationEmail) {
        this.alarmSnsTopic.addSubscription(new EmailSubscription(environmentConfig.monitoring!.alarmNotificationEmail))
      }
    }

    if (this.getIsDashboardEnabled()) {
      this.dashboard = new Dashboard(this, 'Dashboard', {
        start: '-P10D',
      })

      const { alarms: apiAlarms } = this.addApiWidgets({ api: props.api })
      const { alarms: lambdaAlarms } = this.addLambdaWidgets({ functions: props.functions })
      this.addTableWidgets({ tables: props.tables })
      this.addCognitoWidgets({ userPoolId: props.userPoolId, userPoolClientId: props.userPoolClientId })
      this.addWebAppWidgets({ amplifyApp: props.amplifyApp })

      if (this.getIsAlarmsEnabled()) {
        this.addAlarmStatusWidget({ alarms: [...(apiAlarms as Array<Alarm>), ...(lambdaAlarms as Array<Alarm>)] })
      }
    }
  }

  getIsAlarmsEnabled() {
    const environmentConfig = getEnvironmentConfig(this.node)

    // NOTE: isAlarmsEnabled requires isDashboardEnabled to also be true, since the logic within also creates the metrics.
    // While it's possible to decouple, in practice it's unlikely that you would want Alarms without Dashboards, so
    // it's better to keep the code simpler.
    return environmentConfig.monitoring?.isDashboardEnabled && environmentConfig.monitoring?.isAlarmsEnabled
  }

  getIsDashboardEnabled() {
    const environmentConfig = getEnvironmentConfig(this.node)
    return environmentConfig.monitoring?.isDashboardEnabled
  }

  addHeading(heading: string) {
    if (this.dashboard) {
      this.dashboard.addWidgets(
        new TextWidget({
          markdown: `# ${heading}`,
          width: 24,
          height: 1,
          background: TextWidgetBackground.TRANSPARENT,
        })
      )
    }
  }

  subscribeAlarm(alarm: Alarm | CompositeAlarm) {
    if (this.alarmSnsTopic) {
      alarm.addAlarmAction(new SnsAction(this.alarmSnsTopic))
    }
  }

  addApiWidgets({ api }: { api: IHttpApi }) {
    this.addHeading('API Gateway')
    const clientErrorsMetric = api.metricClientError()
    const serverErrorsMetric = api.metricServerError()
    const isAlarmsEnabled = this.getIsAlarmsEnabled()
    let clientErrorsAlarm, serverErrorsAlarm

    if (isAlarmsEnabled) {
      clientErrorsAlarm = clientErrorsMetric.createAlarm(this, 'ApiClientErrorsAlarm', {
        evaluationPeriods: 3,
        threshold: 10,
      })
      this.subscribeAlarm(clientErrorsAlarm)
      serverErrorsAlarm = serverErrorsMetric.createAlarm(this, 'ApiServerErrorsAlarm', {
        evaluationPeriods: 1,
        threshold: 1,
      })
      this.subscribeAlarm(serverErrorsAlarm)
    }

    this.dashboard!.addWidgets(
      new GraphWidget({
        width: 12,
        left: [clientErrorsMetric, serverErrorsMetric],
        leftAnnotations: isAlarmsEnabled ? [clientErrorsAlarm!.toAnnotation(), serverErrorsAlarm!.toAnnotation()] : undefined,
      }),
      new GraphWidget({
        width: 12,
        left: [api.metricLatency(), api.metricIntegrationLatency()],
      }),
      new GraphWidget({
        width: 12,
        left: [api.metricCount()],
      }),
      new GraphWidget({
        width: 12,
        left: [api.metricDataProcessed()],
      })
    )

    return {
      alarms: isAlarmsEnabled ? [serverErrorsAlarm, clientErrorsAlarm] : undefined,
    }
  }

  addLambdaWidgets({ functions }: { functions: Array<IFunction> }) {
    this.addHeading('Lambda Functions')
    const errorMetrics = functions.map((fn) => ({ fn, metric: fn.metricErrors() }))
    const throttleMetrics = functions.map((fn) => ({ fn, metric: fn.metricThrottles() }))
    const isAlarmsEnabled = this.getIsAlarmsEnabled()
    let errorAlarms, throttleAlarms

    if (isAlarmsEnabled) {
      errorAlarms = errorMetrics.map((errorMetric) =>
        errorMetric.metric.createAlarm(this, `ErrorAlarm${errorMetric.fn.node.id}`, {
          evaluationPeriods: 1,
          threshold: 1,
        })
      )
      throttleAlarms = throttleMetrics.map((throttleMetric) =>
        throttleMetric.metric.createAlarm(this, `ThrottleAlarm${throttleMetric.fn.node.id}`, {
          evaluationPeriods: 1,
          threshold: 1,
        })
      )
      // NOTE: Composite Alarms cost $0.50/month
      const errorCompositeAlarm = new CompositeAlarm(this, 'ErrorCompositeAlarm', {
        alarmRule: AlarmRule.anyOf(
          ...errorAlarms.map((errorAlarm) => AlarmRule.fromAlarm(errorAlarm, AlarmState.ALARM)),
          ...throttleAlarms.map((throttleAlarm) => AlarmRule.fromAlarm(throttleAlarm, AlarmState.ALARM))
        ),
      })
      this.subscribeAlarm(errorCompositeAlarm)
    }

    const lambdaWidgetHeight = 4 + functions.length
    this.dashboard!.addWidgets(
      new GraphWidget({
        height: lambdaWidgetHeight,
        width: 8,
        liveData: true,
        left: [
          ...functions.map((fn) => fn.metricDuration()),
          ...functions.map((fn) =>
            fn.metricDuration({
              statistic: 'P95',
            })
          ),
        ],
      }),
      new GraphWidget({
        height: lambdaWidgetHeight,
        width: 8,
        liveData: true,
        left: functions.map((fn) => fn.metricInvocations()),
      }),
      new GraphWidget({
        height: lambdaWidgetHeight,
        width: 8,
        liveData: true,
        left: errorMetrics.map((m) => m.metric),
        right: throttleMetrics.map((m) => m.metric),
        leftAnnotations: errorAlarms ? [errorAlarms[0].toAnnotation()] : undefined,
      })
    )

    return {
      alarms: isAlarmsEnabled ? [...errorAlarms!, ...throttleAlarms!] : undefined,
    }
  }

  addTableWidgets({ tables }: { tables: Array<ITableV2> }) {
    this.addHeading('DynamoDB Tables')
    const tableWidgetHeight = 4 + tables.length
    this.dashboard!.addWidgets(
      new GraphWidget({
        height: tableWidgetHeight,
        width: 12,
        liveData: true,
        left: tables.map((table) => table.metricConditionalCheckFailedRequests()),
      }),
      new GraphWidget({
        height: tableWidgetHeight,
        width: 12,
        liveData: true,
        left: tables.map((table) => table.metricConsumedReadCapacityUnits()),
      }),
      new GraphWidget({
        height: tableWidgetHeight,
        width: 12,
        liveData: true,
        left: tables.map((table) => table.metricConsumedWriteCapacityUnits()),
      }),
      new GraphWidget({
        height: tableWidgetHeight,
        width: 12,
        liveData: true,
        left: tables.map((table) => table.metricUserErrors()),
      })
    )
  }

  addCognitoWidgets({ userPoolId, userPoolClientId }: { userPoolId: string; userPoolClientId: string }) {
    this.addHeading('Cognito')
    const dimensionsMap = {
      UserPool: userPoolId,
      UserPoolClient: userPoolClientId,
    }
    this.dashboard!.addWidgets(
      new GraphWidget({
        width: 8,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/Cognito',
            metricName: 'TokenRefreshSuccesses',
            dimensionsMap,
          }),
        ],
      }),
      new GraphWidget({
        width: 8,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/Cognito',
            metricName: 'SignUpSuccesses',
            dimensionsMap,
          }),
        ],
      }),
      new GraphWidget({
        width: 8,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/Cognito',
            metricName: 'SignInSuccesses',
            dimensionsMap,
          }),
        ],
      })
    )
  }

  addWebAppWidgets({ amplifyApp }: { amplifyApp: IApp }) {
    this.addHeading('Web App')
    const dimensionsMap = {
      App: amplifyApp.appId,
    }
    this.dashboard!.addWidgets(
      new GraphWidget({
        width: 12,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/AmplifyHosting',
            metricName: 'Requests',
            dimensionsMap,
          }),
        ],
      }),
      new GraphWidget({
        width: 12,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/AmplifyHosting',
            metricName: 'Latency',
            dimensionsMap,
          }),
        ],
      }),
      new GraphWidget({
        width: 12,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/AmplifyHosting',
            metricName: 'BytesDownloaded',
            dimensionsMap,
          }),
          new Metric({
            namespace: 'AWS/AmplifyHosting',
            metricName: 'BytesUploaded',
            dimensionsMap,
          }),
        ],
      }),
      new GraphWidget({
        width: 12,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/AmplifyHosting',
            metricName: '4xxErrors',
            dimensionsMap,
          }),
          new Metric({
            namespace: 'AWS/AmplifyHosting',
            metricName: '5xxErrors',
            dimensionsMap,
          }),
        ],
      })
    )
  }

  addAlarmStatusWidget({ alarms }: { alarms: Array<Alarm> }) {
    this.addHeading('Alarms')
    const alarmStatusWidgetHeight = 1 + Math.ceil(alarms.length / 6)
    this.dashboard!.addWidgets(
      new AlarmStatusWidget({
        alarms,
        width: 24,
        height: alarmStatusWidgetHeight,
      })
    )
  }
}
