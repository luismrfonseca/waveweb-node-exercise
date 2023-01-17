const R = require('ramda');
const app = require('../app');
const paginate = require('express-paginate');

const paginationHandler = (req, res, next) => {
  const defaultLimit = R.pathOr(5, [ 'config',  'pagination', 'defaultLimit' ], app);
  const maxLimit = R.pathOr(10, [ 'config', 'pagination', 'maxLimit' ], app);

  return paginate.middleware(defaultLimit, maxLimit)(req, res, next);
};

module.exports = paginationHandler;