export const handler = async (event, context) => {
  if (event.triggerSource === 'CustomMessage_SignUp') {
    return handleVerifyUserEmail(event)
  }

  // TODO: CustomMessage_ForgotPassword

  return event
}

function handleVerifyUserEmail(event) {
  const { codeParameter, userAttributes } = event.request
  const verifyLink = `https://example.com/verify?email=${encodeURIComponent(userAttributes.email)}&code=${codeParameter}`

  const emailMessage = `<div style='text-align: center'>
  <p>Please verify your email address to complete account setup.</p>
  <p>Your verification code is</p>
  <h3>${codeParameter}</h3>
  <p>Navigate to <a href="${verifyLink}">${verifyLink}</a>.</p>
</div>`
  event.response.emailMessage = emailMessage
  event.response.emailSubject ='Verify your Todo account ✅'

  return event
}