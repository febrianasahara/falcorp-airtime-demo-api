"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const express_1 = require("express");
/**
 * Base controller that handles abstracted logic common to all controllers in the application
 */
class Controller {
    /**
     * The controller constructor is responsible for setting up the router and initialising the routes to the the
     * implementing controller
     * @constructor
     */
    constructor(logger) {
        this.logger = logger;
        this.router = express_1.Router();
        this.setRoutes();
    }
    /**
     * Get the router object for the controller
     */
    getRoutes() {
        this.logger.debug('Retrieving routes for controller');
        return this.router;
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map