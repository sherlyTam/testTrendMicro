const Joi = require('joi');

const user = {
  firstName: Joi.string().alphanum(),
  lastName: Joi.string().alphanum(),
  userName: Joi.string().alphanum().required(),
  email: Joi.string().email().required(),
  credentials: Joi.string().min(8).required(),
};

module.exports = {
  schemas: {
    user,
  },
};
