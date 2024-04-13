import * as cdk from 'aws-cdk-lib/core'
import type { Node } from 'constructs'

interface NodeEnvProps {
  node?: Node
  env?: string
}

export interface CdkJsonEnvironmentConfig {
  [environment: string]: CdkJsonEnvironmentConfigEnvironment
}
interface CdkJsonEnvironmentConfigEnvironment {
  profile: string
  region: string
  auth: CdkJsonEnvironmentConfigAuth
  logRetentionInDays: number
  email: CdkJsonEnvironmentConfigEmail
  api?: CdkJsonEnvironmentConfigApi
  ui?: CdkJsonEnvironmentConfigUi
  monitoring?: CdkJsonEnvironmentConfigMonitoring
  isSourceMapsEnabled?: boolean
}

interface CdkJsonEnvironmentConfigAuth {
  autoVerifyUsers?: boolean
  googleClientId?: string
  googleClientSecret?: string
}

interface CdkJsonEnvironmentConfigEmail {
  organizationInviteEmail: string
  verifyUserEmail?: string
  sandboxApprovedToEmails?: string[]
  verifiedDomain?: string
}

interface CdkJsonEnvironmentConfigApi {
  domainName: string
  validationDomain: string
}

interface CdkJsonEnvironmentConfigUi {
  domainName: string
}

interface CdkJsonEnvironmentConfigMonitoring {
  isDashboardEnabled?: boolean
  isAlarmsEnabled?: boolean
  alarmNotificationEmail?: string
}

export function getEnvironmentConfig(node: Node): CdkJsonEnvironmentConfigEnvironment {
  const env = getEnvironmentName(node)
  const environmentConfig = node.getContext('environmentConfig')[env]

  if (!environmentConfig) {
    throw new Error(`Missing environment config for ${env}`)
  }

  return environmentConfig
}

export function getEnvironmentName(node: Node) {
  return node.tryGetContext('env') || 'development'
}

export function getIsProd({ node, env = node ? getEnvironmentName(node) : undefined }: NodeEnvProps) {
  return env === 'production'
}

export function getIsProdish({ node, env = node ? getEnvironmentName(node) : undefined }: NodeEnvProps) {
  return ['staging', 'production'].includes(env)
}

export function getIsDev({ node, env = node ? getEnvironmentName(node) : undefined }: NodeEnvProps) {
  return env === 'development'
}

// Source maps are extremely slow; don't run in prod
export function getIsSourceMapsEnabled({ node }: { node: Node }) {
  const environmentConfig = getEnvironmentConfig(node)
  return environmentConfig.isSourceMapsEnabled ?? getIsDev({ node })
}

export function getIsPointInTimeRecoveryEnabled({ node, env = node ? getEnvironmentName(node) : undefined }: NodeEnvProps) {
  return getIsProdish({ env })
}

export function getRemovalPolicy({ node, env = node ? getEnvironmentName(node) : undefined }: NodeEnvProps) {
  // NOTE: During initial setup of staging and prod environments, it's beneficial to start with Deletion Protection off and
  // and Removal Policy set to Destroy. This way, if things go wrong during setup, it's easy to tear down and start again.
  // Once you have stable staging and production environments, remove these early return statements.
  return cdk.RemovalPolicy.DESTROY
  return getIsDev({ env }) ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN
}

export function getIsDeletionProtectionEnabled({ node, env = node ? getEnvironmentName(node) : undefined }: NodeEnvProps) {
  return false
  return getIsProdish({ env })
}
