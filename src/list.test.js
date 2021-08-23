const { mockUserList } = require('./test-utils');
const { list } = require('./list');

test('list - should get a list of users', async () => {
  const event = {};
  const res = await list(event);

  expect(res.statusCode).toBe(200);
  expect(JSON.parse(res.body)).toEqual(mockUserList);
});

test('create - should fail on an missing env variable', async () => {
  const event = {};
  const oldValue = process.env.USER_TABLE;
  delete process.env.USER_TABLE;

  const res = await list(event);

  expect(res.statusCode).toBe(400);
  process.env.USER_TABLE = oldValue;
});

test('list - should fail on a DynamoDB error', async () => {
  const oldUsersTable = process.env.USER_TABLE;

  process.env.USER_TABLE = 'error';

  const event = {};
  const res = await list(event);

  expect(res.statusCode).toBe(501);
  expect(res.body).toEqual('Couldn\'t fetch any users.');

  process.env.USER_TABLE = oldUsersTable;
});
