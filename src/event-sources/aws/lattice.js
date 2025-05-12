const url = require('url');
const { getEventBody, getCommaDelimitedHeaders } = require('../utils');

function getRequestValuesFromLatticeEvent({ event }) {
  const { httpMethod, path, queryStringParameters, headers, body, isBase64Encoded } = event;

  const formattedPath = url.format({
    pathname: path,
    query: queryStringParameters,
  });

  const parsedHeaders = {};
  Object.entries(headers || {}).forEach(([key, value]) => {
    parsedHeaders[key.toLowerCase()] = value;
  });

  let parsedBody;
  if (body) {
    parsedBody = getEventBody({ event });
    parsedHeaders['content-length'] = Buffer.byteLength(parsedBody, isBase64Encoded ? 'base64' : 'utf8');
  }

  return {
    method: httpMethod,
    headers: parsedHeaders,
    body: parsedBody,
    remoteAddress: event.requestContext?.http?.sourceIp || '',
    path: formattedPath,
  };
}

function getResponseToLattice({ statusCode, body, headers = {}, isBase64Encoded = false }) {
  if (headers['transfer-encoding'] === 'chunked') {
    throw new Error('chunked encoding is not supported by AWS VPC Lattice');
  }

  const responseToLattice = {
    statusCode,
    body,
    isBase64Encoded,
    headers: getCommaDelimitedHeaders({ headersMap: headers }),
  };

  return responseToLattice;
}

module.exports = {
  getRequest: getRequestValuesFromLatticeEvent,
  getResponse: getResponseToLattice,
};