const checker = require('../src/lib/envVarsChecker');

describe('Utility library envVarsChecker', () => {
  test('The helper exists', () => {
    expect(checker).toBeTruthy();
  });

  test('Asks for both USER_TABLE and KMS_PASSWORD_ENCRYPT_KEY environment variables', () => {
    const input = {};
    const result = checker(input);
    expect(result).toEqual(['USER_TABLE', 'KMS_PASSWORD_ENCRYPT_KEY']);
  });

  test('Asks for a missing USER_TABLE environment variables', () => {
    const input = {
      KMS_PASSWORD_ENCRYPT_KEY: 'foo',
    };
    const result = checker(input);
    expect(result).toEqual(['USER_TABLE']);
  });

  test('Asks for a missing KMS_PASSWORD_ENCRYPT_KEY environment variables', () => {
    const input = {
      USER_TABLE: 'foo',
    };
    const result = checker(input);
    expect(result).toEqual(['KMS_PASSWORD_ENCRYPT_KEY']);
  });
});
