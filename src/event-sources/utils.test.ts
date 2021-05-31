const { getEventSourceNameBasedOnEvent } = require("./utils");

/**
This is an event delivered by `sam local start-api`,
using Type:HttpApi, with SAM CLI version 1.18.0.
*/
const sam_httpapi_event = {
  version: "2.0",
  routeKey: "GET /",
  rawPath: "/",
  rawQueryString: "",
  cookies: [],
  headers: {
    Host: "localhost:9000",
    "User-Agent": "curl/7.64.1",
    Accept: "*/*",
    "X-Forwarded-Proto": "http",
    "X-Forwarded-Port": "9000",
  },
  queryStringParameters: {},
  requestContext: {
    accountId: "123456789012",
    apiId: "1234567890",
    http: {
      method: "GET",
      path: "/",
      protocol: "HTTP/1.1",
      sourceIp: "127.0.0.1",
      userAgent: "Custom User Agent String",
    },
    requestId: "aacf57f7-2fce-4069-a1f2-7cb4726dc028",
    routeKey: "GET /",
    stage: null,
  },
  body: "",
  pathParameters: {},
  stageVariables: null,
  isBase64Encoded: false,
};

describe("getEventSourceNameBasedOnEvent", () => {
  test("throws error on empty event", () => {
    expect(() => getEventSourceNameBasedOnEvent({ event: {} })).toThrow(
      "Unable to determine event source based on event."
    );
  });

  test("recognizes sam local HttpApi event", () => {
    const result = getEventSourceNameBasedOnEvent({ event: sam_httpapi_event });
    expect(result).toEqual("AWS_API_GATEWAY_V2");
  });
});

module.exports = {
  sam_httpapi_event,
};
