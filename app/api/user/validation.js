const config = require('../../config');

/**
 * @typedef {Object} ValidationResult
 * @prop {Boolean} valid
 * @prop {String} message
 */

/**
 * @param {String} login
 * @returns {ValidationResult}
 */
module.exports.login = function validateLogin(login) {
  if(typeof login !== 'string' || !login) return ({
    valid: false,
    message: '\'login\' was not a string'
  });

  let pat = config.api.v1.user.validation.login['pattern'],
    min = config.api.v1.user.validation.login['min-length'],
    max = config.api.v1.user.validation.login['max-length'];

  let message = '\'' + login + '\' is not a valid login. \n'
    + 'It shold match the following pattern ' + pat + ' '
    + 'and it should have between ' + min + ' and ' + max + ' characters.';

  return ({
    valid: login.length >= min
      && login.length <= max
      && pat.test(login),
    message
  });
};

/**
 * @param {String} password
 * @returns {ValidationResult}
 */
module.exports.password = function validatePassword(password) {
  if(typeof password !== 'string' || !password) return ({
    valid: false,
    message: '\'password\' was not a string'
  });

  let pat = config.api.v1.user.validation.password['pattern'],
    min = config.api.v1.user.validation.password['min-length'],
    max = config.api.v1.user.validation.password['max-length'];

  let message = '\'' + password + '\' is not a valid password. \n'
    + 'It should match the following pattern ' + pat + ' '
    + 'and it should have between ' + min + 'and ' + max + ' characters.';

  return ({
    valid: password.length >= min
      && password.length <= max
      && pat.test(password),
    message
  });
};