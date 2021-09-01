export function getEventSource({ eventSourceName }: {
  eventSourceName: any;
}): {
  getRequest: ({ event }: {
      event: any;
  }) => {
      method: any;
      headers: {
          'content-length': number;
      };
      body: Buffer;
      remoteAddress: any;
      path: string;
  };
  getResponse: ({ statusCode, body, headers, isBase64Encoded }: {
      statusCode: any;
      body: any;
      headers: any;
      isBase64Encoded: any;
  }) => {
      statusCode: any;
      body: any;
      multiValueHeaders: {};
      isBase64Encoded: any;
  };
} | {
  getRequest: ({ event }: {
      event: any;
  }) => {
      method: any;
      headers: {
          cookie: any;
          'content-length': number;
      };
      body: Buffer;
      remoteAddress: any;
      path: string;
  };
  getResponse: ({ statusCode, body, headers, isBase64Encoded, response }: {
      statusCode: any;
      body: any;
      headers?: {};
      isBase64Encoded?: boolean;
      response?: {};
  }) => {
      statusCode: any;
      body: any;
      isBase64Encoded: boolean;
  };
} | {
  getRequest: ({ event }: {
      event: any;
  }) => {
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
  getResponse: ({ statusCode, body, headers, isBase64Encoded }: {
      statusCode: any;
      body: any;
      headers: any;
      isBase64Encoded: any;
  }) => {
      status: any;
      body: any;
      headers: {};
      bodyEncoding: string;
  };
};
import awsApiGatewayV1EventSource = require("./aws/api-gateway-v1");
import awsApiGatewayV2EventSource = require("./aws/api-gateway-v2");
import awsAlbEventSource = require("./aws/alb");
import awsLambdaEdgeEventSource = require("./aws/lambda-edge");
export { awsApiGatewayV1EventSource, awsApiGatewayV2EventSource, awsAlbEventSource, awsLambdaEdgeEventSource };