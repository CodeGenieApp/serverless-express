import { App, Tags } from 'aws-cdk-lib'
import TodoStack from '../lib/cdk-stack'
import { getEnvironmentName, getEnvironmentConfig, getIsProdish } from '../lib/environment-config'
import getTagsMap from '../lib/getTagsMap'

const app = new App()
const isTerminationProtectionEnabled = getIsProdish({ node: app.node })
const envName = getEnvironmentName(app.node)
const environmentConfig = getEnvironmentConfig(app.node)
const region = environmentConfig.region || 'us-west-2'

new TodoStack(app, `Todo-${envName}`, {
  terminationProtection: isTerminationProtectionEnabled,
  env: {
    region,
  },
})

const tagsMap = getTagsMap(envName)
Object.entries(tagsMap).forEach(([tagKey, tagValue]) => {
  Tags.of(app).add(tagKey, tagValue)
})
