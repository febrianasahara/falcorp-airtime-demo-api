"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppFactory = void 0;
const express = require("express");
const cors = require("cors");
const correlation_id_middleware_1 = require("../middleware/correlation-id-middleware");
/**
 * App Factory creates and initializes and new instance of the application
 */
class AppFactory {
    /**
     * Get a configured application instance
     */
    static getInstance(menuController) {
        const app = express();
        app.use(correlation_id_middleware_1.CorrelationIdMiddleware.getMiddleware());
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
exports.AppFactory = AppFactory;
//# sourceMappingURL=app-factory.js.map