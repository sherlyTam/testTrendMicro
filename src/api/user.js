'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const R = require('ramda');
const checker = require('../lib/envVarsChecker')

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const kms = new AWS.KMS();


module.exports.submit = (event, context, callback) => {
    console.log("Receieved request submit user details. Event is", event);

    const missing = checker(process.env);
  
    if (missing.length) {
      const vars = missing.join(', ');
      return `Missing required environment variables: ${vars}`;
    }
    const requestBody = JSON.parse(event.body);
    const firstName = requestBody.firstName;
    const lastName = requestBody.lastName;
    const userName = requestBody.userName;
    const credentials = requestBody.credentials;
    const email = requestBody.email;

    const userSubmissionFx = R.pipeP(encryptUserPasswordP, submitUserP)

    userSubmissionFx(userInfo(firstName, lastName, userName, email, credentials))
        .then(res => {
            console.log(`Successfully submitted ${firstName}(${email}) user to system`);
            callback(null, successResponseBuilder(
                JSON.stringify({
                    message: `Sucessfully submitted user with email ${email}`,
                    userId: res.id
                }))
            );
        })
        .catch(err => {
            console.error('Failed to submit user to system', err);
            callback(null, failureResponseBuilder(
                409,
                JSON.stringify({
                    message: `Unable to submit user with email ${email}`
                })
            ))
        });
};


module.exports.list = (event, context, callback) => {
    console.log("Receieved request to list all users. Event is", event);
    var params = {
        TableName: process.env.USER_TABLE,
        ProjectionExpression: "id, firstName, lastName, userName, email"
    };
    const onScan = (err, data) => {
        if (err) {
            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Scan succeeded.");
            return callback(null, successResponseBuilder(JSON.stringify({
                users: data.Items
            })
            ));
        }
    };
    dynamoDb.scan(params, onScan);
};

const submitUserP = user => {
    console.log('submitUserP() Submitting user to system');
    const userItem = {
        TableName: process.env.USER_TABLE,
        Item: user,
    };
    return dynamoDb.put(userItem)
        .promise()
        .then(res => user);
};

const encryptUserPasswordP = user => {

    var params = {
        KeyId: process.env.KMS_PASSWORD_ENCRYPT_KEY,
        Plaintext: user.credentials
    };

    return kms.encrypt(params).promise().then(data => {
        user.credentials = data.CiphertextBlob.toString('base64');
        return user;
    });
};

const successResponseBuilder = (body) => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: body
    };
};

const failureResponseBuilder = (statusCode, body) => {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: body
    };
};

const userInfo = (firstName, lastName, userName, email, credentials) => {
    return {
      id: uuid.v1(),
      firstName: firstName,
      lastName: lastName,
      userName: userName,
      email: email,
      credentials: credentials
}};