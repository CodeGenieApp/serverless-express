interface Framework {
  sendRequest: (handler: { request: any; response: any }) => void;
}

export default Framework;
