import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { readFileSync } from 'fs'
import { COGNITO_USER_POOL_ID, COGNITO_USER_POOL_CLIENT_ID } from '../config'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'

assertHasRequiredEnvVars(['COGNITO_USER_POOL_ID', 'COGNITO_USER_POOL_CLIENT_ID'])

export const idTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: 'id',
  clientId: COGNITO_USER_POOL_CLIENT_ID,
})
