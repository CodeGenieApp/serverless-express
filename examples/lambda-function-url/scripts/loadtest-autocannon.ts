import autocannon from 'autocannon'

const scenarios = [
  {
    name: 'Lambda Function URL',
    // endpoint: 'https://d4nnw44cddanflk7kv3r3xbbke0uvnis.lambda-url.us-west-2.on.aws', // dev
    endpoint: 'https://dbnmtkykig3vobqu6f73dbgiam0qxeot.lambda-url.us-west-2.on.aws', // prod
  },
  {
    name: 'Lambda Function URL behind CloudFront',
    // endpoint: 'https://dthdcw7dsiu7v.cloudfront.net', // dev
    endpoint: 'https://d17bj8zz01o4vw.cloudfront.net', // prod
  },
  {
    name: 'API Gateway HTTP API with Cognito Authorizer',
    // endpoint: 'https://0c8qrs3t4l.execute-api.us-west-2.amazonaws.com', // dev
    endpoint: 'https://1cql2qj0ki.execute-api.us-west-2.amazonaws.com', // prod
  },
]
const results: any = {}
for (const scenario of scenarios) {
  console.info(`Running ${scenario.name}`)
  const result = await autocannon({
    url: `${scenario.endpoint}/todo-lists`,
    amount: 10,
    headers: {
      // authorization: // dev
      //   'eyJraWQiOiJSUTBcL00xc29OWlhYQTNrM0U1N2tHQzBtTGxJaVBDaUxQS1RUbVRcL0ZiXC9RPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzOGExMTNiMC00MDYxLTcwZDQtZjVlMy1hNjIwMzVkYjY0MTUiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl9NSVFobWNBNXYiLCJjb2duaXRvOnVzZXJuYW1lIjoiMzhhMTEzYjAtNDA2MS03MGQ0LWY1ZTMtYTYyMDM1ZGI2NDE1IiwidXNlcklkIjoiMzhhMTEzYjAtNDA2MS03MGQ0LWY1ZTMtYTYyMDM1ZGI2NDE1Iiwib3JpZ2luX2p0aSI6IjJmMDI2MzM3LTk2MGItNDNlNS04ODg2LTQ1YjU3MTFhMjUxNSIsImF1ZCI6Ijdjb3ZkZ3BjazlnMHFsajkzZm05M24wcG5qIiwiZXZlbnRfaWQiOiJmOThiZmQwOC0wYzliLTRkMmItYTY1Yi0wMmM4NWM3NTY1NzciLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTcxMzAxMTAzNCwibmFtZSI6IkJyZXR0IiwiZXhwIjoxNzEzMDk3NDM0LCJpYXQiOjE3MTMwMTEwMzQsImp0aSI6Ijg0OTM3OGQyLTFlNGQtNDA0OC05MGQwLTMwMzFhNjk5MDAyZiIsImVtYWlsIjoiYnJldHQuai5hbmRyZXdzQGdtYWlsLmNvbSJ9.fgX0UIGKI6zGUkA-osdJmr_YfQ6TZjQMSq3FAg1BkRf_iXwUHvt3K3Yd4XEelVFrJfMvsa_8hNVbAX2Ss1EHsb52-URoZsm0GZd66tG8NWtT6ee1DCRjfD_UHRGfmrOgn7K006y1d-LSmxcmsRcaI3nDtoAAwTwiKWbmZVf-nj0_N-CdbmiekKayCuYo9n_UMzjI_gZ2HONhHUPWycbBSm0I43ctR4-t8qhSfzMD1LonpFzMgFFZdppzHNK1-WCshpjU7ialR6RkNlxzg8wOFi8FS5PFnq6U0H7unyNjF52Fd_KoflEnGZeK8vvuBkYk847EcktXPTk8MSN7hdZX7w',
      // prod
      authorization:
        'eyJraWQiOiI5Vm45RkZITHJJckdKUUZYalNlY2dcL1B5XC9zVTBQa2E4cTQwWXVibjF5OVU9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI3OGUxZDM2MC0wMGMxLTcwOTYtZDE0MC0yOThmNjViNDI1NmMiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl82YlhqdkE0UWMiLCJjb2duaXRvOnVzZXJuYW1lIjoiNzhlMWQzNjAtMDBjMS03MDk2LWQxNDAtMjk4ZjY1YjQyNTZjIiwidXNlcklkIjoiNzhlMWQzNjAtMDBjMS03MDk2LWQxNDAtMjk4ZjY1YjQyNTZjIiwib3JpZ2luX2p0aSI6IjA3NzE2YjA3LTM3YjMtNDgyMi05ZjlhLTEwNWU5MDgwZDZkMCIsImF1ZCI6IjVkNWFob2hkczQ4ODJ1YTE1bnFuM3ZzY3I4IiwiZXZlbnRfaWQiOiIwZDU1YWYzNC1hZDkwLTQ5ZjgtODcxZi1lODg0ZjMyYTI3ZGQiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTcxMzAyMDIwMiwibmFtZSI6IkJyZXR0IiwiZXhwIjoxNzEzMTMzNjM1LCJpYXQiOjE3MTMwNDcyMzYsImp0aSI6ImRhM2ZiNWEyLTQ1ZGYtNDBmNS04M2Y0LWY2YWU4OWNkMjg4ZSIsImVtYWlsIjoiYnJldHQuai5hbmRyZXdzQGdtYWlsLmNvbSJ9.FUXsYC2Q-yaeak8cFfuocFSTWTrxEwRZsLlgvF8W5AC8mjUeauRbu_WP31VPPLoZ7oav7VFA5CscQbuokzma01p9VyR2am3QO4vNimhWxoWb9QohlMkljYFDphwl5svc4zC8XzLOh4Pyd_-IwgrzS7l2pR2_BJ9tSD9pWwV3R6ixmu4Z3yQzfOaVmZXGJuI-LFl0fDMNzk08gtVatxFJJ0nOW3n8vAsAE2Fo9Uh9_Ug1fae_n5rKBXH135FmLo_npYFkt9fRoEQ8k5xpBuxGB-UJae2CRMmbNRJ5PYabQ-DZH1AYb4rRbSGeOYV1iiY-lWw1-qLOBj0fX7TS3evEzQ',
    },
  })
  // console.log(result)
  results[scenario.name] = {
    // min: result.latency.min,
    mean: result.latency.mean,
    max: result.latency.max,
    errors: result.errors,
    non2xx: result.non2xx,
  }
}

console.table(results)
