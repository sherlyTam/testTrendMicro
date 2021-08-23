const { getMockInputUser, getRandomMockedInputUser } = require('./test-utils');
const { create } = require('./create');

beforeEach(() => {
  process.env.USER_TABLE = 'foo';
  process.env.KMS_PASSWORD_ENCRYPT_KEY = 'bar';
});

afterEach(() => {
  delete process.env.USER_TABLE;
  delete process.env.KMS_PASSWORD_ENCRYPT_KEY;
});

test('create - ensure getRandomMockedInputUser returns a value ', async () => {
  const user1 = getRandomMockedInputUser();
  const user2 = getRandomMockedInputUser();
  expect(user1).not.toBe(undefined);
  expect(user2).not.toBe(undefined);
});

test('create - should create a user', async () => {
  const user = getRandomMockedInputUser();
  const event = {
    body: JSON.stringify(user),
  };
  const res = await create(event);

  expect(res.statusCode).toBe(201);
});

test('create - should fail on an missing env variable', async () => {
  const user = getMockInputUser();
  const event = {
    body: JSON.stringify(user),
  };
  const oldValue = process.env.USER_TABLE;
  delete process.env.USER_TABLE;

  const res = await create(event);

  expect(res.statusCode).toBe(400);
  process.env.USER_TABLE = oldValue;
});

test('create - should fail on an invalid request', async () => {
  const user = getMockInputUser();
  user.firstName = '1@3';
  const event = {
    body: JSON.stringify(user),
  };
  const res = await create(event);

  expect(res.statusCode).toBe(400);
  expect(res.body).toBe('Failed validation, incorrect User data provided');
});

test('create - should fail on a DynamoDB error', async () => {
  const oldValue = process.env.USER_TABLE;

  process.env.USER_TABLE = 'error';

  const user = getRandomMockedInputUser();
  const event = {
    body: JSON.stringify(user),
  };
  const res = await create(event);

  expect(res.statusCode).toBe(501);
  expect(res.body).toBe('Couldn\'t create the user');

  process.env.USER_TABLE = oldValue;
});
