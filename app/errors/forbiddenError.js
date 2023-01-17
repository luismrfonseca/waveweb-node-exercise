const DefaultlError = require('./defaultError');

const HTTP_BAD_REQUEST_ERROR_CODE = 403;

class ForbiddenError extends DefaultlError {
  constructor (...args) {
    super(HTTP_BAD_REQUEST_ERROR_CODE, ...args);
    Error.captureStackTrace(this, ForbiddenError);
  }
}

module.exports = ForbiddenError;
