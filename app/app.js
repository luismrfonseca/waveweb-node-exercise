const configurationManager = require('./managers/configuration.manager');
const loggerManager = require('./managers/logger.manager');

const app = {
  initialize: async () => {
    app.logger = loggerManager.getLogger(); // logger with default configurations
    app.logger.debug('[App] Initialize');

    app.config = await configurationManager.getConfiguration();
    app.logger = loggerManager.getLogger(app.config.logs); // logger with custom configurations

    app.apiServer = require('./api-server/api-server');
    await app.apiServer.initialize(app.config);
  },
};

module.exports = app;
