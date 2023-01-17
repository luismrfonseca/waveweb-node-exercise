const R = require("ramda");
const app = require('../app');
const { version } = require("../../package-lock.json");
const loggerManager = require("../managers/logger.manager");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const NotFoundError = require("../errors/notFoundError");
const pagination = require("../middleware/pagination");
let articles = require("../../data/articles.json");
let authors = require("../../data/authors.json");
let countries = require("../../data/countries.json");
const { throws } = require("assert");

const corsOptions = {
  origin: true,
  methods: "GET,PUT,POST,DELETE,OPTIONS",
  allowedHeaders:
    "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization",
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

const apiServer = express();
let logger;

apiServer.initialize = async (configuration) => {
  logger = loggerManager.getLogger();
  logger.debug("[ApiServer] Initialize");

  apiServer.use(express.json({ limit: "100mb" }));
  apiServer.use(
    express.urlencoded({
      limit: "100mb",
      extended: true,
      parameterLimit: 1000000,
    })
  );
  apiServer.use(loggerManager.logApiServerRequests);
  // parse application/x-www-form-urlencoded
  apiServer.use(bodyParser.json({ limit: "100mb" }));
  apiServer.use(
    bodyParser.urlencoded({
      limit: "100mb",
      extended: true,
      parameterLimit: 1000000,
    })
  );
  apiServer.use(cors(corsOptions));

  // Endpoints
  apiServer.get("/", (req, res, next) => {
    res.send({ status: 200, message: "Express is working" });
  });

  apiServer.get("/error", (req, res, next) => {
    next(Error("An error in an existing endpoint"));
  });

  const GetAllAuthors = () => {
    return new Promise((resolve, reject) => {
      data = R.map((auth) => {
        auth.articles = R.filter((a) => a.author_id === auth.id)(articles);
        auth.country = countries[auth.country_code.toLowerCase()];

        return auth;
      })(authors);

      resolve(data);
    });
  };

  apiServer.get("/authors", (req, res, next) => {
    return GetAllAuthors()
      .then((data) => res.json({ data }))
      .catch((error) => {
        loggerManager
          .getLogger()
          .error(`[Authors][List] ${error.message || error}`);

        if (error.status === 404) {
          return next(
            new NotFoundError("Não existem authors", "GetAllAuthors")
          );
        } else {
          return next(new Error(error.message, "GetAllAuthors"));
        }
      });
  });

  apiServer.post("/articles", (req, res, next) => {
    if (R.isEmpty(req.body) || req.body.length <= 0) {
      return res
        .status(500)
        .json({ status: 500, message: "Invalid body payload" });
    }

    const newArticle = req.body;

    if (R.isNil(newArticle.title) || R.isEmpty(newArticle.title)) {
      return res
        .status(500)
        .json({ status: 500, message: "Invalid title article" });
    }

    return new Promise((resolve, reject) => {
      // Add author if not exists
      const author = R.filter(
        (a) => a.name.toLowerCase() === newArticle.author.toLowerCase()
      )(authors);
      let authorId = 0;
      if (R.isEmpty(author)) {
        authorId = R.apply(Math.max, R.map((a) => a.id)(authors)) + 1;
        authors.push({
          id: authorId,
          name: newArticle.author,
          country_code: newArticle.country_code || "",
        });
      } else {
        if (R.length(author) == 1) {
          authorId = author[0].id;
        } else {
          authorId = author.id;
        }
      }

      // Add Article
      const articleId = R.apply(Math.max, R.map((a) => a.id)(articles)) + 1;
      articles.push({
        id: articleId,
        author_id: authorId,
        title: newArticle.title,
      });

      resolve();
    })
      .then(() => GetAllAuthors())
      .then((data) => res.json({ data }))
      .catch((error) => {
        loggerManager
          .getLogger()
          .error(`[Authors][List] ${error.message || error}`);

        return next(new Error(error.message, "CreateArticles"));
      });
  });

  apiServer.put("/articles", (req, res, next) => {
    if (R.isEmpty(req.body) || req.body.length <= 0) {
      return res
        .status(500)
        .json({ status: 500, message: "Invalid body payload" });
    }

    const updateArticles = req.body.articles;
    const updateAuthors = req.body.authors;

    return new Promise((resolve, reject) => {
      if (!R.isEmpty(updateArticles) && R.length(updateArticles) > 0) {
        R.map((update) => {
          const indexArticles = R.findIndex(R.propEq("id", update.id))(
            articles
          );

          if (indexArticles >= 0) {
            articles[indexArticles].title =
              update.title || articles[indexArticles].title;
            articles[indexArticles].author_id =
              update.author_id || articles[indexArticles].author_id;
          }
        })(updateArticles);
      }

      if (!R.isEmpty(updateAuthors) && R.length(updateAuthors) > 0) {
        R.map((update) => {
          const indexAuthor = R.findIndex(R.propEq("id", update.id))(authors);

          if (indexAuthor >= 0) {
            authors[indexAuthor].name =
              update.name || authors[indexAuthor].name;
            authors[indexAuthor].country_code =
              update.country_code || authors[indexAuthor].country_code;
          }
        })(updateAuthors);
      }
      resolve();
    })
      .then(() => GetAllAuthors())
      .then((data) => res.json({ data }))
      .catch((error) => {
        loggerManager
          .getLogger()
          .error(`[ArticlesAndAuthors][Update] ${error.message || error}`);

        return next(new Error(error.message, "UpdateArticlesAndAuthors"));
      });
  });

  apiServer.delete("/articles", (req, res, next) => {
    if (R.isEmpty(req.body) || req.body.length <= 0) {
      return res
        .status(500)
        .json({ status: 500, message: "Invalid body payload" });
    }

    const deleteArticles = req.body.articles;

    return new Promise((resolve, reject) => {
      if (!R.isEmpty(deleteArticles) && R.length(deleteArticles) > 0) {
        R.map((delArticleId) => {
          const index = R.findIndex(R.propEq("id", delArticleId))(articles);

          if (index >= 0) {
            articles.splice(index, 1);
          }
        })(deleteArticles);
      }

      resolve();
    })
      .then(() => GetAllAuthors())
      .then((data) => res.json({ data }))
      .catch((error) => {
        loggerManager
          .getLogger()
          .error(`[Articles][Delete] ${error.message || error}`);

        return next(new Error(error.message, "DeleteArticles"));
      });
  });

  apiServer.get("/endpoint_a", pagination, (req, res, next) => {
    let sort = R.path([ 'query', 'sort' ])(req);
    const order = R.path([ 'query', 'order' ])(req);
    let per_page = R.path([ 'query', 'per_page' ])(req);
    let nextPage = res.locals.paginate.href();
    if (!R.includes('per_page', nextPage) && R.includes('limit', nextPage)){
      nextPage = R.replace('limit','per_page', nextPage)
    }
    let page = R.pathOr(1, [ 'query', 'page' ])(req);

    per_page = parseInt(per_page) || app.config.pagination.defaultLimit;
    page = parseInt(page);

    return new Promise((resolve, reject) => {
      let data = R.map((auth) => {
        auth.articles = R.filter((a) => a.author_id === auth.id)(articles);
        auth.country = countries[auth.country_code.toLowerCase()];

        return auth;
      })(authors);

      if (sort.toLowerCase() === "asc") {
        data = R.sort(R.ascend(R.prop(order)))(data);
      } else if (sort.toLowerCase() === "desc") {
        data = R.sort(R.descend(R.prop(order)))(data);
      }

      data = data.splice((per_page || 0) * ((page || 1) - 1), per_page);

      resolve(data);
    })
      .then((data) => {
        const missingItems = R.length(articles) - ((page - 1)* per_page);
        if (missingItems + per_page < 0) {
          throw new NoContentError();
        }

        return res.json({
          articles: data,
          next: per_page > 0 && missingItems > 0 ? app.config.api.url + nextPage : undefined,
          count: R.length(articles),
        }); 
      })
      .catch((error) => {
        loggerManager
          .getLogger()
          .error(`[Articles][Delete] ${error.message || error}`);

        return next(new Error(error.message, "DeleteArticles"));
      });
  });

  apiServer.use(function (req, res, next) {
    next();
  });

  // No Endpoint found
  apiServer.use(function (req, res, next) {
    next({ status: 404, message: "Content not found" });
  });

  // catch 404 and forward to error handler
  apiServer.use((req, res, next) =>
    next(new NotFoundError("Endpoint not found"))
  );

  // error handler
  apiServer.use((err, req, res, next) => {
    const {
      status = 500,
      message = "Something went wrong",
      i18nToken: i18n_key = undefined,
    } = err;

    if (status < 400) {
      loggerManager.getLogger().info(R.toString(`${err.message}`));
    } else if (status >= 400 && status < 500) {
      if (status === 404) {
        loggerManager.getLogger().warn(R.toString(err.message));
      } else {
        loggerManager
          .getLogger()
          .warn(R.toString(`${err.message} - ${err.stack}`));
      }
    } else {
      loggerManager
        .getLogger()
        .error(R.toString(`${err.message} - ${err.stack}`));
    }

    return res.status(status).json({ status, message, i18n_key });
  });

  // start listening
  const port =
    process.env.PORT ||
    (configuration.server && configuration.server.port) ||
    "3000";
  const host =
    process.env.HOST ||
    (configuration.server && configuration.server.host) ||
    "localhost";
  const server = apiServer.listen(port, host);
  server.on("listening", () => {
    let message = "[ApiServer] Start listening\n";
    message += "  ********************************************\n";
    message += `  * Node Express v${version}\n`;
    message += `  * API Server listening on ${port}\n`;
    message += "  * Ctrl-C to shutdown API Server\n";
    message += "  *";
    logger.info(message);
  });
};

module.exports = apiServer;
