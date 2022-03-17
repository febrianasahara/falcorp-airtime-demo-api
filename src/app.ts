import { MenuController } from './controllers/MenuController';
import { AppFactory } from './factories/app-factory';
import { ExpressServer } from './services/express-server';
require('dotenv').config()
const startService = async () => {
  // controllers
  const menuController = new MenuController();

  // Application
  const app = AppFactory.getInstance(menuController);
  const expressServer = new ExpressServer(app);

  expressServer.run().catch((error: Error) => console.log(error.message));
};

Promise.resolve().then(startService).catch(console.error);
