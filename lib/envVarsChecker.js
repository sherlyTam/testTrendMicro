module.exports = (env) => {
  const required = ['USER_TABLE', 'KMS_PASSWORD_ENCRYPT_KEY'];
  const missing = [];

  required.forEach((reqVar) => {
    if (!env[reqVar]) {
      missing.push(reqVar);
    }
  });
  return missing;
};
