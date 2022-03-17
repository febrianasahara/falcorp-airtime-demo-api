import { QuickbooksClientConfiguration, Repository } from "@febrianasahara/automated-accounts-core"
import { LoggerFactory } from "@febrianasahara/internal-logging-shared-lib"
import { QuickbooksService } from "@febrianasahara/quickbooks-shared-lib"
import Logger = require("bunyan")
class QuickbooksSetupService{
  logger: Logger
  constructor (protected repo: Repository<QuickbooksClientConfiguration>, protected service: QuickbooksService, loggerFactory: LoggerFactory){
    this.logger = loggerFactory.getNamedLogger('quickbooks-setup-service')
  }

  public setupAccount (clientId: string): Promise<any>{

    let cfg:QuickbooksClientConfiguration
    const getConfig =()=>{
      return this.repo.getByDocId(clientId)
    }

    const createAccount =(config:QuickbooksClientConfiguration)=>{
      cfg = config
      return this.service.createAfreconExpenseAccount(config.access_credentials.access_token, config.quickbooks_realm)
    }

    const updateAccountRef =(account: any)=>{
      cfg.afrecon_account_ref = account.Id
      return this.repo.update(cfg)
    }

    return getConfig()
      .then(createAccount)
      .then(updateAccountRef)
  }

  public setupVendor (clientId: string): Promise<any>{

    let cfg:QuickbooksClientConfiguration
    const getConfig =()=>{
      return this.repo.getByDocId(clientId)
    }

    const createAccount =(config:QuickbooksClientConfiguration)=>{
      cfg = config
      return this.service.createAfreconAsVendor(config.access_credentials.access_token, config.quickbooks_realm)
    }

    const updateAccountRef =(vendor: any)=>{
      cfg.afrecon_vendor_ref = vendor.Id
      return this.repo.update(cfg)
    }

    return getConfig()
      .then(createAccount)
      .then(updateAccountRef)
  }

}

export { QuickbooksSetupService }
