const headers = { "Access-Control-Allow-Origin": "*" };

const commonResponse = (status: number, body: string) => ({
  statusCode: status,
  headers,
  body
});

export default commonResponse;
