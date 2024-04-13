import { NodejsFunction, NodejsFunctionProps, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { getEnvironmentConfig, getIsSourceMapsEnabled } from '../environment-config'
import { LogGroup, LogGroupProps } from 'aws-cdk-lib/aws-logs'
import { resolve } from 'node:path'

interface CustomNodejsFunctionProps {
  logGroup?: LogGroupProps
  function: NodejsFunctionProps
}

export default class CustomNodejsFunction extends Construct {
  readonly logGroup: LogGroup
  readonly function: NodejsFunction
  constructor(scope: Construct, id: string, props: CustomNodejsFunctionProps) {
    super(scope, id)
    const { logRetentionInDays } = getEnvironmentConfig(this.node)
    const isSourceMapsEnabled = getIsSourceMapsEnabled({ node: this.node })

    this.logGroup = new LogGroup(this, `${id}LogGroup`, {
      retention: logRetentionInDays,
      ...props.logGroup,
    })

    this.function = new NodejsFunction(this, `${id}Function`, {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: props.function.entry,
      timeout: Duration.seconds(10),
      memorySize: 1024,
      logGroup: this.logGroup,
      ...props.function,
      bundling: {
        sourceMap: isSourceMapsEnabled,
        format: OutputFormat.ESM,
        target: 'esnext',
        tsconfig: resolve('../../tsconfig.json'),
        banner: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
        ...props.function.bundling,
      },
      environment: {
        NODE_OPTIONS: isSourceMapsEnabled ? '--enable-source-maps' : '',
        ...props.function.environment,
      },
    })
  }
}
