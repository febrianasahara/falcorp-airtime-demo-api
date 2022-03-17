import { AppFactory } from './factories/app-factory'
import { ExpressServer } from './services/express-server'
import { Repository, Client, DatabaseTables, QuickbooksClientConfiguration, BillingBracket, InvoiceExclusion, ProcessLog, ConfigClient, SQSService } from '@febrianasahara/automated-accounts-core'
import { DirectpayOnlineService } from '@febrianasahara/directpay-online-shared-lib'
import { LoggerConfiguration, LoggerFactory } from '@febrianasahara/internal-logging-shared-lib'
import { AvailabilityController } from './controllers/MenuController'
import { BracketController } from './controllers/BracketController'
import { CallbackController } from './controllers/CallbackController'
import { ConfigClientController } from './controllers/ClientConfigController'
import { ClientsController } from './controllers/ClientsController'
import { ExclusionsController } from './controllers/ExclusionsController'
import { InvoiceController } from './controllers/InvoiceController'
import { QuickbooksSetupController } from './controllers/QuickbooksSetupController'
import { AvailabilityRespository } from './repositories/AvailabilityRepository'
import { UsageRespository } from './repositories/UsageRespository'
import { AvailabilityService } from './services/AvailabilityService'
import { ClientConfigService } from './services/ClientConfigService'
import { ClientService } from './services/ClientsService'
import { InvoiceService } from './services/InvoiceService'
import { QuickbooksSetupService } from './services/QuickbooksSetupService'
import { QuickbooksService } from '@febrianasahara/quickbooks-shared-lib'
import { BillingService } from './services/BillingService'
import { BaseController } from './controllers/BaseController'

const FIREBASE_SECRET = process.env.FIREBASE_SECRET ?? 'info'
const APP_SECRET = process.env.APP_SECRET ?? 'info'
const region = process.env.AWS_REGION ?? 'eu-west-2'
const loggerConfig: LoggerConfiguration = {
  logglySubdomain: process.env.LOGGLY_SUBDOMAIN ?? 'info',
  logglyToken: process.env.LOGGLY_TOKEN ?? 'info',
  level: process.env.LOG_LEVEL ?? 'info'
}
const loggerFactory = new LoggerFactory(loggerConfig)
const configClient = new ConfigClient(region, loggerFactory)

const processLogger = loggerFactory.getNamedLogger('AFRECON-APP-API-ROOT')
/**
 * Start the HTTP service
 */
const startService = async () => {
  const admin = await configClient.getAdminApp(FIREBASE_SECRET)
  const appConfig = await configClient.getAppConfig(APP_SECRET)
  const db = admin.firestore()
  try {
    db.settings({ ignoreUndefinedProperties: true })
  } catch (err) {

  }
  const clientsRepo = new Repository<Client>(db, DatabaseTables.CLIENT, loggerFactory)
  const configRepo = new Repository<QuickbooksClientConfiguration>(db, DatabaseTables.QUICKBOOKS_CONFIGURATION, loggerFactory)
  const bracketRepo = new Repository<BillingBracket>(db, DatabaseTables.SUBSCRIPTIONS, loggerFactory)
  const exRepo = new Repository<InvoiceExclusion>(db, DatabaseTables.QUICKBOOKS_EXCLUSIONS, loggerFactory)
  const logRepo = new Repository<ProcessLog>(db, DatabaseTables.QUICKBOOKS_PROCESSING_LOGS, loggerFactory)

  const availabilityRepo = new AvailabilityRespository(db, DatabaseTables.PLATFORM_AVAILABILITY, loggerFactory)

  const usageRepo = new UsageRespository(db, DatabaseTables.USAGE, loggerFactory)

  const dpo = new DirectpayOnlineService(loggerFactory)
  const quickbooks = new QuickbooksService(loggerFactory, '', '', 'sandbox')
  const configClientService = new ClientConfigService(db, dpo, configClient, loggerFactory)
  // services
  const invoiceService = new InvoiceService(configRepo, configClient, quickbooks, loggerFactory)



  const clientsService = new ClientService(clientsRepo, admin.storage(), loggerFactory)
  const platformService = new AvailabilityService(availabilityRepo, loggerFactory)
  const billing = new BillingService(usageRepo, bracketRepo, clientsRepo, loggerFactory)

  const qbSetup = new QuickbooksSetupService(configRepo, quickbooks, loggerFactory)
  const pubsubService = new SQSService(region)

  // controllers
  const baseCtrl = new BaseController(loggerFactory)
  const clientsController = new ClientsController(clientsService, billing, loggerFactory)
  const platformAvailabilityController = new AvailabilityController(platformService, loggerFactory)
  const callbacks = new CallbackController(appConfig, loggerFactory)
  const configController = new ConfigClientController(configClientService, loggerFactory)
  const invoiceController = new InvoiceController(invoiceService, loggerFactory)
  const bracketController = new BracketController(bracketRepo, loggerFactory)
  const exController = new ExclusionsController(exRepo, logRepo, db, pubsubService, loggerFactory)
  const qbSetupController = new QuickbooksSetupController(qbSetup, loggerFactory)

  // Application
  const app = AppFactory.getInstance(clientsController, platformAvailabilityController, callbacks,
    configController, invoiceController,
    bracketController, exController, qbSetupController, baseCtrl)
  const expressServer = new ExpressServer(app, loggerFactory)

  expressServer.run()
    .catch((error: Error) => processLogger.error('Process error', { message: error.message }))
}

Promise.resolve()
  .then(startService)
  .catch(processLogger.error)
