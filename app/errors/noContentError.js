const DefaultlError = require('./defaultError');

const HTTP_NO_CONTEND_ERROR_CODE = 204;

class NoContentError extends DefaultlError {
  constructor (...args) {
    super(HTTP_NO_CONTEND_ERROR_CODE, ...args);
    Error.captureStackTrace(this, NoContentError);
  }
}

module.exports = NoContentError;
