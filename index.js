const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'collection';

exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  let body;
  let statusCode = '200';
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    switch (event.requestContext.http.method) {
      case 'GET':
        body = await dynamo.scan({ TableName: TABLE_NAME }).promise();
        break;
      case 'POST':
        const { name, description } = JSON.parse(event.body);
        await dynamo
          .put({
            TableName: TABLE_NAME,
            Item: {
              id: context.awsRequestId,
              name,
              description,
            },
          })
          .promise();
        body = JSON.stringify({ id: context.awsRequestId });
        break;
      default:
        throw new Error(
          `Unsupported method "${event.requestContext.http.method}"`
        );
    }
  } catch (err) {
    statusCode = '400';
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
