const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
AWS.config.update({region:'ap-southeast-2'});
const util = require('util');
const user = require('../src/api/user.js');
const eventStub = require('./stubs/eventApiGatewayCreateUser.json');

const handlerSubmit = util.promisify(user.submit);
const handlerList = util.promisify(user.list);

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
    AWSMock.mock('DynamoDB', 'putItem', (method, _, callback) => {
      callback(null, "Successfully created Item!");
    });
  });

  afterEach(() => {
    delete process.env.USER_TABLE;
    delete process.env.KMS_PASSWORD_ENCRYPT_KEY;
  });

  test('Replies back with a JSON for get', async() => {
    process.env.USER_TABLE = 'foo';
    process.env.KMS_PASSWORD_ENCRYPT_KEY = 'bar';

    const event = eventStub;
    const context = {};

    const result = await handlerList(event, context);
    expect(result).resolves.toMatchSnapshot();
  });

  test('Replies back with success message for put', async() => {
    process.env.USER_TABLE = 'foo';
    process.env.KMS_PASSWORD_ENCRYPT_KEY = 'bar';

    const event = eventStub;
    const context = {};

    const result = await handlerSubmit(event, context);
    expect(result).resolves.toMatchSnapshot();
  });
});
