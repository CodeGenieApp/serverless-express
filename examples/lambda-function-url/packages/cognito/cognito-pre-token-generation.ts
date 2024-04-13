import type { PreTokenGenerationTriggerEvent } from 'aws-lambda'
import { createUser, getUser, updateUser } from '../api/controllers/user'

export async function handler (event: PreTokenGenerationTriggerEvent) {
  const {
    sub: userId,
    email,
    name,
  } = event.request.userAttributes

  let user: any = await getUser({ userId })

  if (!user) {
    user = await createUser({
      userId,
      user: {
        name,
        email,
      },
    })
  }

  event.response.claimsOverrideDetails = {
    claimsToAddOrOverride: {
      userId: user.data.userId,
    },
  }

  return event
}
