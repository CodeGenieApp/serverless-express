declare function getRequestValuesFromAlbEvent({ event }: {
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
declare function getResponseToAlb({ statusCode, body, headers, isBase64Encoded }: {
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
export { getRequestValuesFromAlbEvent as getRequest, getResponseToAlb as getResponse };