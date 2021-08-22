const AWSMock = require('aws-sdk-mock');
const util = require('util');
const AWS = require('aws-sdk');
const userLambda = require('../src/api/user.js');
const eventStub = require('./stubs/eventApiGatewayCreateUser.json');

const handler = util.promisify(userLambda);

describe('User service test: Dynamodb mock for successful operations', () => {
  beforeAll(() => {
    AWSMock.mock('DynamoDB', 'getItem', (method, _, callback) => {
      callback(null, {
        firstName: 'test',
        lastName: 'user',
        userName: 'test1',
        email: 'testxx@test.com',
        password: '@123as',
      });
    });
  });

  afterEach(() => {
    delete process.env.USER_TABLE;
    delete process.env.KMS_PASSWORD_ENCRYPT_KEY;
  });

  afterAll(() => {
    AWS.restore('DynamoDb');
  });

  test('Replies back with a JSON for get', () => {
    process.env.USER_TABLE = 'foo';
    process.env.KMS_PASSWORD_ENCRYPT_KEY = 'bar';

    const event = eventStub;
    const context = {};

    const result = handler(event, context);
    expect(result).resolves.toMatchSnapshot();
  });
});
