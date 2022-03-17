import express = require('express');
import cors = require('cors');

import { MenuController } from '../controllers/MenuController';
import { CorrelationIdMiddleware } from '../middleware/correlation-id-middleware';
/**
 * App Factory creates and initializes and new instance of the application
 */
class AppFactory {
  /**
   * Get a configured application instance
   */
  public static getInstance(menuController: MenuController): express.Express {
    const app: express.Express = express();

    app.use(CorrelationIdMiddleware.getMiddleware());

    app.use('/menu', menuController.getRoutes());
    app.use(cors());
    app.use(function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'POST, GET,PUT, DELETE OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    return app;
  }
}

export { AppFactory };
