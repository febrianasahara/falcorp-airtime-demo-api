"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MenuController_1 = require("./controllers/MenuController");
const app_factory_1 = require("./factories/app-factory");
const express_server_1 = require("./services/express-server");
require('dotenv').config();
const startService = async () => {
    // controllers
    const menuController = new MenuController_1.MenuController();
    // Application
    const app = app_factory_1.AppFactory.getInstance(menuController);
    const expressServer = new express_server_1.ExpressServer(app);
    expressServer.run().catch((error) => console.log(error.message));
};
Promise.resolve().then(startService).catch(console.error);
//# sourceMappingURL=app.js.map