const loggerManager = require('./logger.manager');

const getConfigurationFromFile = (configuration = {}) => {
  return Promise.resolve(Object.assign(configuration, require('../../config/config.json')));
};

module.exports = {
  getConfiguration: async () => {
    loggerManager.getLogger().debug('[ConfigurationManager] getConfiguration');

    return await getConfigurationFromFile()
      .then(config => {
        if (process.env.NODE_ENV === 'development') {
          // In order to work without https
          config.session = config.session || {};
          config.session.cookie = config.session.cookie || {};
          config.session.cookie.secure = false;
        }

        config.authtication = {
          // secrectKey: require('crypto').randomBytes(64).toString('hex'),
          secrectKey: process.env.SECRECTKEY,
        };

        return config;
      });
  },
};
