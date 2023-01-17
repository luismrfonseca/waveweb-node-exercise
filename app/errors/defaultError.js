class DefaultlError extends Error {
  constructor (statusCode, statusMessage, i18nToken, ...args) {
    if (Number.isNaN(statusCode)) {
      super(statusCode, statusMessage, i18nToken, ...args);
    } else {
      super(statusMessage, ...args);
      this.status = statusCode;
      this.i18nToken = i18nToken;
    }

    Error.captureStackTrace(this, DefaultlError);
  }
}

module.exports = DefaultlError;
