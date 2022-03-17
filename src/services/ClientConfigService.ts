/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountingPlatforms, AppConfig, Client, ConfigClient, DatabaseTables, DpoConfiguration, QuickbooksClientConfiguration } from "@febrianasahara/automated-accounts-core"
import { Gateways } from "@febrianasahara/automated-accounts-core/dist/enum/enums"
import { BaseRequest, DirectpayOnlineService, DPOAPIRequest, MerchantServices, SplitAllocations, SplitAllocationsDescription, XPayBalanceRequest, XpayBalanceResult, XpayRequest, XpayResult } from "@febrianasahara/directpay-online-shared-lib"
import { LoggerFactory } from "@febrianasahara/internal-logging-shared-lib"
import Logger = require("bunyan")
import * as admin from 'firebase-admin'
import moment from "moment"
const APP_SECRET = process.env.APP_SECRET ?? ''

class ClientConfigService{
  logger: Logger
  constructor (protected db: admin.firestore.Firestore, protected dpo: DirectpayOnlineService, protected configClient: ConfigClient,  loggerFactory: LoggerFactory){
    this.logger = loggerFactory.getNamedLogger('api-client-service')
  }

  private async getClient (id: string){
    return this.db.collection(DatabaseTables.CLIENT).doc(id)
      .get()
      .then((result:FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>)=>{
        if(result.exists){
          return result.data() as Client
        }else{
          throw new Error('Unable to find client')
        }
      })
  }
  private async getQuickbooksConfig (id: string){
    return this.db.collection(DatabaseTables.QUICKBOOKS_CONFIGURATION).doc(id)
      .get()
      .then((result:FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>)=>{
        if(result.exists){
          return result.data() as QuickbooksClientConfiguration
        }else{
          return null
        }
      })
  }

  private async getDPOConfig (id: string){
    return this.db.collection(DatabaseTables.DPO_CONFIGURATION).doc(id)
      .get()
      .then((result:FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>)=>{
        if(result.exists){
          return result.data() as DpoConfiguration
        }else{
          return null
        }
      })
  }

  public getAccountingConfig (clientId: string): Promise<any>{

    const execute = (client: Client)=> {
      switch(client.accounting_platform){
        case AccountingPlatforms.QUICKBOOKS:
          return this.getQuickbooksConfig(client.id)
        default:
          return this.getQuickbooksConfig(client.id)
      }
    }

    return this.getClient(clientId).then(execute)
   
  }

  public getGatewayConfig (clientId: string): Promise<any>{

    const execute = (client: Client)=> {
      switch(client.gateway){
        case Gateways.DPO:
          return this.getDPOConfig(client.id)
        default:
          return this.getDPOConfig(client.id)
      }
    }

    return this.getClient(clientId).then(execute)
   
  }

  public linkToDPO (clientId: string, companyToken: string, providerToken: string): Promise<DpoConfiguration>{
    let appConfig: AppConfig
    let services:MerchantServices
    const getConfig = ()=>{
      return this.configClient.getAppConfig(APP_SECRET).then((res)=>{
        appConfig = res
      })
    }
    const getServices = (): Promise<DPOAPIRequest<MerchantServices>> =>{
      const request: DPOAPIRequest<BaseRequest> = {
        API3G: {
          CompanyToken: companyToken,
          Request: 'getServices'
        }
      }
      return this.dpo.performApiRequest<MerchantServices>(request)
    }
    const getXpayBalance = (result: DPOAPIRequest<MerchantServices>) =>{
      services = result.API3G
      const request: DPOAPIRequest<XPayBalanceRequest> = {
        API3G: {
          CompanyToken: companyToken,
          Request: 'getBalance',
          Currency: 'USD'
        }
      }
      this.logger.info('getting XPAY BALANCE : ', request)
      return this.dpo.performApiRequest<XpayBalanceResult>(request)
    }

    const build_XPAYAllocations = async(balance: DPOAPIRequest<XpayBalanceResult>) =>{
      // check balance and negate function
      this.logger.info('XPAY BALANCE: ', balance.API3G)
      if(balance.API3G.CompanyBalance){
        const amountUSD = parseFloat(balance.API3G.CompanyBalance)
        if(amountUSD <= 0.01){
          // add to negative XpayBalance
          
            throw new Error('Unable to Connect - INSUFFICIENT BALANCE')
       
          
        }
        this.logger.info('CLIENT HAS SUFFICIENT FUNDS - AYEYE RIGHT NOW!!!!')
      }
      const allocations = new Array<SplitAllocationsDescription>()
     
      allocations.push({
        ProviderToken: appConfig.DPO.providerToken,
        Amount: (0.1).toFixed(2),
        Currency:'USD',
        Service: appConfig.DPO.serviceId,
        Description: 'Afrecon - Connection Test'
      })

      return allocations
    }

    const build_XPAYRequest = async(splits: Array<SplitAllocationsDescription>)=>{
      const allocations: SplitAllocations = {
        Allocation: splits
      }
      const request: XpayRequest = {
        CompanyToken: companyToken,
        ProviderToken: providerToken,
        Request: 'executeXpay',
        Allocations: allocations
      }
      const result: DPOAPIRequest<XpayRequest> = {
        API3G: request
      }
      return result
    }
    const executeXpayRequest = (request: DPOAPIRequest<XpayRequest>) => {
      this.logger.info('XPAY REQUEST: ', request.API3G)
      return this.dpo.performApiRequest<XpayResult>(request)
    }

    const saveServices = (result : DPOAPIRequest<XpayResult>)=>{
      this.logger.info('DPO-GET_SERVICES', result)
      if(result.API3G.Result!==`000`){
        throw new Error(result.API3G.ResultExplanation);
        
      }
      
        const defaultService = services.Services.Service[0]
        const config:DpoConfiguration = {
          id: clientId,
          active: true,
          published:true,
          dateCreated: moment(new Date()).utc()
            .valueOf(),
          lastUpdated: moment(new Date()).utc()
            .valueOf(),
          clientId,
          allowDebitOrder:'n',
          companyToken,
          merchantConfig:{
            providerToken,
            serviceDescription: defaultService.ServiceName,
            serviceId: Number.parseInt(defaultService.ServiceID)
          }
        }
        return this.db.collection(DatabaseTables.DPO_CONFIGURATION).doc(clientId)
          .set(config)
          .then(()=>{
            return config
          })
      
    }

    return getConfig().then(getServices)
    .then(getXpayBalance)
    .then(build_XPAYAllocations)
    .then(build_XPAYRequest)
    .then(executeXpayRequest)
    .then(saveServices)

  }

  
}

export { ClientConfigService }
