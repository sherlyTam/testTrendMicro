const AWS = require('aws-sdk');
const checker = require('../lib/envVarsChecker');

AWS.config.setPromisesDependency(require('bluebird'));

module.exports.list = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  console.log('Receieved request submit user details. Event is', event);

  // ensure env vars set
  const missing = checker(process.env);
  if (missing.length) {
    const vars = missing.join(', ');
    return {
      statusCode: 400,
      body: `Missing required environment variables: ${vars}`,
    };
  }

  const params = {
    TableName: process.env.USER_TABLE,
    ProjectionExpression: 'id, firstName, lastName, userName, email',
  };

  try {
    const res = await dynamoDb.scan(params).promise();
    const users = res.Items;
    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  } catch (err) {
    console.error(`Failed to retreive users from dynamodb ${err}`);
    return {
      statusCode: err.statusCode || 501,
      body: 'Couldn\'t fetch any users.',
    };
  }
};
