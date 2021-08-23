const ddb = require('serverless-dynamodb-client');
const AWS = require('aws-sdk');
const checker = require('../lib/envVarsChecker');

AWS.config.setPromisesDependency(require('bluebird'));

module.exports.list = async (event) => {
  const dynamoDb = ddb.doc;
  console.log('Receieved request submit user details. Event is', event);

  // ensure env vars set
  const missing = checker(process.env);
  if (missing.length) {
    const vars = missing.join(', ');
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: `Missing required environment variables: ${vars}`,
    };
  }

  const params = {
    TableName: process.env.USER_TABLE,
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
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t fetch any users.',
    };
  }
};
