declare function getRequestValuesFromLambdaEdgeEvent({ event }: {
  event: any;
}): {
  method: any;
  path: string;
  headers: {
      'content-length': number;
  };
  body: Buffer;
  remoteAddress: any;
  host: any;
  hostname: any;
};
declare function getResponseToLambdaEdge({ statusCode, body, headers, isBase64Encoded }: {
  statusCode: any;
  body: any;
  headers: any;
  isBase64Encoded: any;
}): {
  status: any;
  body: any;
  headers: {};
  bodyEncoding: string;
};
export { getRequestValuesFromLambdaEdgeEvent as getRequest, getResponseToLambdaEdge as getResponse };