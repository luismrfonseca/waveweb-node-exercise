const app = require('./app/app');

(async () => {
  await app.initialize();
  app.logger.debug(`[Main] app.config ${app.config ? JSON.stringify(app.config) : 'not loaded'}`);
  app.logger.debug(`[Main] app.logger ${app.logger ? 'created' : 'missing'}`);
  app.logger.debug(`[Main] app.apiServer ${app.apiServer ? 'inititalized' : 'missing'}`);
})();
