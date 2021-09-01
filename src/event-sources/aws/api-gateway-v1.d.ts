declare function getRequestValuesFromApiGatewayEvent({ event }: {
  event: any;
}): {
  method: any;
  headers: {
      'content-length': number;
  };
  body: Buffer;
  remoteAddress: any;
  path: string;
};
declare function getResponseToApiGateway({ statusCode, body, headers, isBase64Encoded }: {
  statusCode: any;
  body: any;
  headers: any;
  isBase64Encoded: any;
}): {
  statusCode: any;
  body: any;
  multiValueHeaders: {};
  isBase64Encoded: any;
};
export { getRequestValuesFromApiGatewayEvent as getRequest, getResponseToApiGateway as getResponse };