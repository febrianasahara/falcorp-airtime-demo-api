import { ConfigClient, QuickbooksAuthConfiguration, QuickbooksClientConfiguration, Repository } from "@febrianasahara/automated-accounts-core"
import { LoggerFactory } from "@febrianasahara/internal-logging-shared-lib"
import { Invoice, OAuthToken, QuickbooksService } from "@febrianasahara/quickbooks-shared-lib"
import Logger = require("bunyan") 
import moment from "moment"

const APP_SECRET = process.env.APP_SECRET ?? ''
class InvoiceService{
  logger: Logger
  constructor (protected repo: Repository<QuickbooksClientConfiguration>, protected configClient: ConfigClient, protected service: QuickbooksService, loggerFactory: LoggerFactory){
    this.logger = loggerFactory.getNamedLogger('api-client-service')
  }

  private authenticate (clientId: string){
    let config: QuickbooksClientConfiguration
    let authConfig: QuickbooksAuthConfiguration

    const getQbAuthConfig = ()=>{
      return this.configClient.getAppConfig(APP_SECRET).then((appConfig)=>{
        return appConfig.quickbooks
      })
    }

    const getClientConfig = (res: QuickbooksAuthConfiguration)=>{
      authConfig = res
      return this.repo.getByDocId(clientId)
    }

    const makeApiCall = (cfg: QuickbooksClientConfiguration) => {

      config = cfg
      const issued = moment(new Date(cfg.access_credentials.date_issued as number)).utc()
      const exp = moment(new Date(cfg.access_credentials.date_issued as number)).utc()
      // get time access token expires
      const accessTokenExpiry = issued.add(cfg.access_credentials.expires_in, 'seconds')
      const refreshTokenExpiry = exp.add(cfg.access_credentials.x_refresh_token_expires_in, 'seconds')
      const now = moment(new Date()).utc()
   
      // check the time difference for each
      const accessValidation = accessTokenExpiry.diff(now, 'minutes') 
      const refreshValidation = refreshTokenExpiry.diff(now, 'minutes')
   
      // if there are MORE than 6 mins left - return access code
      this.logger.info('############################################')
      this.logger.info('FETCHING CLIENT ACCESS TOKEN - MULTIPLE CASE')
      this.logger.info('############################################')
      this.logger.info('access token mins: ', accessValidation)
      this.logger.info('refresh token mins: ', refreshValidation)
             
      if(accessValidation >= 6){
        this.logger.info('MORE THAN 6 MINUTES ON THE CLOCK - FETCH FROM DB')

        return Promise.resolve(cfg.access_credentials)

      } else if(refreshValidation >= 6){
        // refresh existing token
        this.logger.info('MAKING REFRESH API CALL', cfg.access_credentials)
        return this.service.refreshToken(cfg.access_credentials.refresh_token, authConfig.clientId, authConfig.clientSecret)
              
      } else{
        // get a new token altogether
        this.logger.info('YOU NEED TO GET A NEW AUTH TOKEN')
        return this.service.getOauthToken(cfg.quickbooks_auth_code, authConfig.clientId, authConfig.clientSecret, authConfig.callbackUrl)
       
      }

    }

    const getConfigToUpdate = async (token:OAuthToken) => {
      const response = config
      
      response.access_credentials.access_token = token.access_token
      response.access_credentials.expires_in = token.expires_in
      response.access_credentials.refresh_token = token.refresh_token
      response.access_credentials.token_type = token.token_type
      response.access_credentials.x_refresh_token_expires_in = token.x_refresh_token_expires_in
      response.access_credentials.date_issued = moment(new Date()).utc()
        .valueOf()

      return response
   
    }

    const storeToken = (toSave:QuickbooksClientConfiguration) => {
      this.logger.info('Updating Quickbooks refresh token for : ', clientId)

      return this.repo.update(toSave)
    }

    return getQbAuthConfig()
      .then(getClientConfig)
      .then(makeApiCall)
      .then(getConfigToUpdate)
      .then(storeToken)
    
  }
  
  public getInvoiceQueue (clientId: string): Promise<Invoice[]>{
  
    const getInvoices = (token: QuickbooksClientConfiguration) =>{
      return this.service.getOverdueInvoicesForClient(token.access_credentials.access_token, token.quickbooks_realm)
    }

    return this.authenticate(clientId)
      .then(getInvoices)
    
  }

}

export { InvoiceService }
