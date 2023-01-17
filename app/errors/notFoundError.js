const R = require('ramda');
const DefaultlError = require('./defaultError');

const HTTP_NOT_FOUND_ERROR_CODE = 404;

const template = (scope) => !R.isNil(scope) ? R.toLower(`errors.api.${scope}.not_found`) : undefined;

class NotFoundError extends DefaultlError {
  constructor (message, i18nToken, ...args) {
    super(HTTP_NOT_FOUND_ERROR_CODE, message, template(i18nToken), ...args);
    Error.captureStackTrace(this, NotFoundError);
  }
}

module.exports = NotFoundError;
