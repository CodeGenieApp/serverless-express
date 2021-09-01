declare function getRequestValuesFromApiGatewayEvent({ event }: {
  event: any;
}): {
  method: any;
  headers: {
      cookie: any;
      'content-length': number;
  };
  body: Buffer;
  remoteAddress: any;
  path: string;
};
declare function getResponseToApiGateway({ statusCode, body, headers, isBase64Encoded, response }: {
  statusCode: any;
  body: any;
  headers?: {};
  isBase64Encoded?: boolean;
  response?: {};
}): {
  statusCode: any;
  body: any;
  isBase64Encoded: boolean;
};
export { getRequestValuesFromApiGatewayEvent as getRequest, getResponseToApiGateway as getResponse };