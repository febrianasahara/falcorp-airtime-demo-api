import express = require('express')
import cors = require('cors')
//import helmet = require('helmet')
import * as HTTPContext from 'express-http-context'


import { AvailabilityController } from '../controllers/MenuController'
import { BracketController } from '../controllers/BracketController'
import { CallbackController } from '../controllers/CallbackController'
import { ConfigClientController } from '../controllers/ClientConfigController'
import { ClientsController } from '../controllers/ClientsController'
import { ExclusionsController } from '../controllers/ExclusionsController'
import { InvoiceController } from '../controllers/InvoiceController'
import { QuickbooksSetupController } from '../controllers/QuickbooksSetupController'
import { CorrelationIdMiddleware } from '../middleware/correlation-id-middleware'
import { BaseController } from '../controllers/BaseController'

/**
 * App Factory creates and initializes and new instance of the application
 */
class AppFactory {
  /**
   * Get a configured application instance
   */
  public static getInstance(clientsController: ClientsController,
    platformAvailabilityController: AvailabilityController, callbacks: CallbackController,
    configController: ConfigClientController, invoiceController: InvoiceController,
    bracketController: BracketController, exController: ExclusionsController,
    qbSetupController: QuickbooksSetupController, base: BaseController): express.Express {
    const app: express.Express = express()

   // app.use(helmet())
    app.use(HTTPContext.middleware)
    app.use(CorrelationIdMiddleware.getMiddleware())

    app.use('/clients', clientsController.getRoutes())
    app.use('/availability', platformAvailabilityController.getRoutes())
    app.use('/clients/config', configController.getRoutes())
    app.use('/billing/brackets', bracketController.getRoutes())
    app.use('/clients/invoices', invoiceController.getRoutes())
    app.use('/callbacks', callbacks.getRoutes())
    app.use('/invoices/exclusions', exController.getRoutes())
    app.use('/quickbooks', qbSetupController.getRoutes())
    app.use(cors())
    app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Credentials', 'true')
      res.header('Access-Control-Allow-Methods', 'POST, GET,PUT, DELETE OPTIONS')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      next()
    })

    return app
  }
}

export { AppFactory }
