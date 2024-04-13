import type { PreSignUpTriggerEvent } from 'aws-lambda'

export async function handler (event: PreSignUpTriggerEvent) {
  if (process.env.AUTO_VERIFY_USERS) {
    event.response.autoConfirmUser = true
    event.response.autoVerifyEmail = true
  }

  return event
}
