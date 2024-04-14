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

// const COGNITO_USER_POOL_JWKS_ENDPOINT = `https://cognito-idp.us-west-2.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`
// const COGNITO_USER_POOL_JWKS = {
//   keys: [
//     {
//       alg: 'RS256',
//       e: 'AQAB',
//       kid: 'RQ0/M1soNZXXA3k3E57kGC0mLlIiPCiLPKTTmT/Fb/Q=',
//       kty: 'RSA',
//       n: 'yip8NDEpPVcKT3lc2GEZk12VdZFPHJwA1lOqqhNmW8DR11z0Di0f90pc-Upu5dKVGgWgFd6oMEOPBmfzIaFZQm30I0v_6UXhoNsAglTAcXKBRB5OEZ5TgcLM5JcFmndzi9WL4p55fA92OTS6-y-GOIc2t8ppwngtoBvwpbTeCqbOflWS41mFTf6pQ-qoaIaKer8Itr6pDGGm-JdsWNGoDaIIA7fmu_RfP_r8f0aa0ZLImT3kaMQZ-S0hTJo3FyE0Dpo8AWDfOVnYAolYAS97e7SZ_Lo5mPrCzzrh4Iic1MoeAeu6uWAhFhvambOXefBYzpxiGWe3n-cfhVebUlciiw',
//       use: 'sig',
//     },
//     {
//       alg: 'RS256',
//       e: 'AQAB',
//       kid: 'L1k6dj0o/kOmg0xQ66FWZyNofi28rG6UCiOBB9wHS4k=',
//       kty: 'RSA',
//       n: 'rK3HqRyVPndtnN9fTCnOnXj0GNIMjtow0bqezmnh--S8JZQopTcvBnb3ZI6j07IMmlngd_DymuRXTffP0QueqhYBXwKscj2mhTr-Wn1SnDNKiHVAZvFvIrIXQy5tLydIYPg6o02T5v-XXYCGvrFpQwFLx6Xj-MAicyBqE4U0Z-cA4PJJqCLhuKMXfFsDFolmY3gpvT44Z7_pehw7C8jKMlLRb8qMkcz1-Pg_caQLGUFGqUu7t-5hGRHiHmE4uPMTRODOLNbmrmsYjuCiAUo89UBo06WSAilBesteAXKKpQaJs93mxXyrfia91sw4Wvy9_nKcpmx12uxXRpHsXTWupw',
//       use: 'sig',
//     },
//   ],
// }
// const jwks = JSON.parse(readFileSync('jwks.json', { encoding: 'utf-8' }))
// idTokenVerifier.cacheJwks(COGNITO_USER_POOL_JWKS)

// export async function getCognitoUserPoolJwks() {
//   return COGNITO_USER_POOL_JWKS
// }
