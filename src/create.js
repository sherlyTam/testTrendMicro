const Joi = require('joi');
const uuid = require('uuid');
const ddb = require('serverless-dynamodb-client');
const AWS = require('aws-sdk');
const checker = require('../lib/envVarsChecker');

AWS.config.setPromisesDependency(require('bluebird'));

const config = require('./config');

const schema = Joi.object().keys(config.schemas.user);

const encryptUserPasswordP = (credentials) => {
  const kms = new AWS.KMS();
  const params = {
    KeyId: process.env.KMS_PASSWORD_ENCRYPT_KEY,
    Plaintext: credentials,
  };
  return kms.encrypt(params).promise().then((data) => {
    return data.CiphertextBlob.toString('base64');
  });
};

module.exports.create = async (event) => {
  const dynamoDb = ddb.doc;

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

  // ensure valid data is passed
  const data = JSON.parse(event.body);
  const certificate = schema.validate(data);

  if (certificate.error) {
    console.error(`Failed validation for input data - ${certificate.error}`);
    return {
      statusCode: 400,
      body: 'Failed validation, incorrect User data provided',
    };
  }

  // encrypt credentials
  const encryptedCredentials = await encryptUserPasswordP(data.credentials);

  const params = {
    TableName: process.env.USER_TABLE,
    Item: {
      id: uuid.v1(),
      firstName: data.firstName,
      lastName: data.lastName,
      userName: data.userName,
      email: data.email,
      credentials: encryptedCredentials,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 201,
      body: JSON.stringify(params.Item),
    };
  } catch (err) {
    console.error(`Failed to create user ${err}`);
    return {
      statusCode: err.statusCode || 501,
      body: 'Couldn\'t create the user',
    };
  }
};
