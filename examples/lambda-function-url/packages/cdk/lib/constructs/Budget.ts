import { Construct } from 'constructs'
import { aws_budgets as budgets } from 'aws-cdk-lib'
import { getEnvironmentConfig, getEnvironmentName } from '../environment-config'
import getTagsMap from '../getTagsMap'

export default class Budget extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    const envName = getEnvironmentName(this.node)
    const environmentConfig = getEnvironmentConfig(this.node)
    const tagsMap = getTagsMap(envName)
    new budgets.CfnBudget(this, 'MonthlyBudget', {
      budget: {
        budgetType: 'COST',
        timeUnit: 'MONTHLY', // QUARTERLY | ANNUALLY
        budgetLimit: {
          amount: 10,
          unit: 'USD',
        },
        costFilters: {
          TagKeyValue: [`user:app$${tagsMap.app}`, `user:environment$${tagsMap.environment}`],
        },
      },
      notificationsWithSubscribers: environmentConfig.monitoring?.alarmNotificationEmail ? [
        {
          notification: {
            comparisonOperator: 'GREATER_THAN',
            threshold: 50,
            thresholdType: 'PERCENTAGE',
            notificationType: 'ACTUAL', // FORECASTED
          },
          subscribers: [
            {
              subscriptionType: 'EMAIL',
              address: environmentConfig.monitoring.alarmNotificationEmail,
            },
          ],
        },
      ] : undefined,
    })
  }
}
