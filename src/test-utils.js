const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');

AWS.config.update({ region: 'ap-southeast-2' });
AWSMock.setSDKInstance(AWS);

const faker = require('faker');
const uuid = require('uuid');

// fake env variables
process.env.USER_TABLE = faker.random.word();
process.env.KMS_PASSWORD_ENCRYPT_KEY = faker.random.word();

// Mock user model
const getMockInputUser = () => {
  return {
    firstName: faker.random.alpha(10),
    lastName: faker.random.alpha(10),
    userName: faker.random.alphaNumeric(10),
    email: `${faker.random.alphaNumeric(5)}@test.com`,
    credentials: faker.random.alphaNumeric(15),
  };
};
module.exports.getMockInputUser = getMockInputUser;

const mockInputUserOne = getMockInputUser();
const mockInputUserTwo = getMockInputUser();

module.exports.mockInputUserOne = mockInputUserOne;
module.exports.mockInputUserTwo = mockInputUserTwo;

const getRandomMockedInputUser = () => {
  return Math.random() > 0.5 ? mockInputUserOne : mockInputUserTwo;
};
module.exports.getRandomMockedInputUser = getRandomMockedInputUser;

const getMockUser = () => {
  return {
    id: uuid.v1(),
    firstName: faker.random.alpha(10),
    lastName: faker.random.alpha(10),
    userName: faker.random.alphaNumeric(10),
    email: `${faker.random.alphaNumeric(5)}@test.com`,
  };
};
module.exports.getMockUser = getMockUser;

const mockUserOne = getMockUser();
const mockUserTwo = getMockUser();

module.exports.mockUserOne = mockUserOne;
module.exports.mockUserTwo = mockUserTwo;

const mockUserList = [mockUserOne, mockUserTwo];
module.exports.mockUserList = mockUserList;

const mockTableSchema = {
  table: {
    tableName: process.env.USER_TABLE,
  },
};
module.exports.mockTableSchema = mockTableSchema;

AWSMock.mock('DynamoDB.DocumentClient', 'scan', async () => {
  if (process.env.USER_TABLE === 'error') {
    throw new Error('Internal Server Error');
  }

  return { Items: mockUserList };
});

AWSMock.mock('DynamoDB.DocumentClient', 'put', async () => {
  if (
    process.env.USER_TABLE === 'error' || process.env.USER_TABLE === 'error'
  ) {
    throw new Error('Internal Server Error');
  }

  return 'Success';
});

AWSMock.mock('KMS', 'encrypt', async () => {
  return { CiphertextBlob: faker.random.alphaNumeric(30) };
});
