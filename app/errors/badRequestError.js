const DefaultlError = require('./defaultError');

const HTTP_BAD_REQUEST_ERROR_CODE = 400;

class BadRequestError extends DefaultlError {
  constructor (...args) {
    super(HTTP_BAD_REQUEST_ERROR_CODE, ...args);
    Error.captureStackTrace(this, BadRequestError);
  }
}

module.exports = BadRequestError;
