const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

let logger;

const defaultConfiguration = { level: 'debug' };
const consoleTransport = new winston.transports.Console({ format: winston.format.colorize({ all: true }) });

const updateConfiguration = (configuration) => {
  if (configuration) {
    logger.level = configuration.level || 'debug';
    consoleTransport.level = logger.level;
    logger.debug('[LoggerManager] updateConfiguration');

    if (configuration.logToFile) {
      logger.clear();
      logger.add(consoleTransport);
      logger.add(new DailyRotateFile({
        level: logger.level,
        filename: `${process.env.NODE_ENV || 'development'}-%DATE%.log`,
        dirname: 'logs',
        datePattern: 'YYYY-MM-DD',
      }));
      logger.debug('[LoggerManager] logToFile');
    }
  }
};

const createLogger = () => {
  logger = winston.createLogger(defaultConfiguration);
  logger.format = winston.format.combine(
    winston.format.padLevels(),
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} ${info.level} ${info.message}`),
  );
  logger.add(consoleTransport);
  logger.debug('[LoggerManager] createLogger');
};

createLogger();

module.exports = {
  getLogger: (configuration) => {
    updateConfiguration(configuration);

    return logger;
  },
  logApiServerRequests: (req, res, next) => {
    res.on('finish', () => {
      const tokens = {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        httpVersion: req.httpVersion,
        status: res.statusCode,
        contentLength: res._contentLength ? res._contentLength : '-',
        referrer: '-',
        userAgent: req.headers && req.headers['user-agent'] ? req.headers['user-agent'] : '-',
      };

      const message = `${tokens.ip} "${tokens.method} ${tokens.url} HTTP/${tokens.httpVersion}" ${tokens.status} ${tokens.contentLength} "${tokens.referrer}" "${tokens.userAgent}"`;

      tokens.status >= 400 ? logger.error(message) : logger.info(message);
    });
    next();
  },
};
