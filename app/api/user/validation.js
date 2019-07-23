const config = require('../../config');

/**
 * @typedef {Object} ValidationResult
 * @prop {Boolean} valid
 * @prop {String} message
 */

/**
 * @param {String} username
 * @returns {ValidationResult}
 */
module.exports.username = function validateUsername(username) {
  if(typeof username !== 'string' || !username) return ({
    valid: false,
    message: '\'username\' was not a string'
  });

  let pat = config.api.v1.user.validation.username['pattern'],
    min = config.api.v1.user.validation.username['min-length'],
    max = config.api.v1.user.validation.username['max-length'];

  let message = '\'' + username + '\' is not a valid username. \n'
    + 'It shold match the following pattern ' + pat + ' '
    + 'and it should have between ' + min + ' and ' + max + ' characters.';

  return ({
    valid: username.length >= min
      && username.length <= max
      && pat.test(username),
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