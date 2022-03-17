/* eslint-disable prefer-const */
import { UsageRecord, BillingBracket, Repository, Client } from "@febrianasahara/automated-accounts-core"
import { LoggerFactory } from "@febrianasahara/internal-logging-shared-lib"
import Logger = require("bunyan")
import moment = require("moment")
import { UsageRespository } from "../repositories/UsageRespository"
class BillingService{
  logger: Logger
  constructor (protected repo: UsageRespository, protected billRepo: Repository<BillingBracket>, protected clientRepo: Repository<Client>, loggerFactory: LoggerFactory){
    this.logger = loggerFactory.getNamedLogger('api-client-service')
  }

  public GetCurrentUsageReport (clientId: string): Promise<unknown>{
    const now = moment(new Date()).utc()
    // first day of current month
    const day1 = moment(new Date(`${now.month()+1}-01-${now.year()}`)).utc()
    let billConfig: BillingBracket
    const report= {
      totalUsage: 0,
      totalReconcilliations: 0,
      totalAutomations: 0,
      billAmountUSD: 0,
      totalIncomeReconciled: 0,
      totalIncomeIssued: 0,
      month: day1.format('MMMM'),
      billAmountExchanged: 0,
      clientCurrency: 'USD',
      startDate: day1.format('YYYY ddd MMM DD HH:mm'),
      endDate: now.format('YYYY ddd MMM DD HH:mm'),
      usage: new Array<UsageRecord>()
    }
    const getClient = ()=>{
      return this.clientRepo.getByDocId(clientId)
    }
    const getBillingConfig = (client: Client) => {
      return this.billRepo.getByDocId(client.subscriptionId)
    }

    const getCurrentUsage = (billingConfig: BillingBracket)=>{
      billConfig = billingConfig
      this.logger.info('USING BILLING : ', billConfig)
      return this.repo.getClientCurrentUsage(clientId)
    }

    const calculateTotals = async (usage:UsageRecord[])=>{
      report.usage = usage
      usage.forEach((record)=>{
        if('INVOICE-PAID' === record.chargeAction){
          report.totalIncomeReconciled += record.transactionAmount
          report.totalReconcilliations ++
          report.billAmountUSD+= billConfig.reconcilliationCost
        } 
        report.totalAutomations ++
        report.billAmountUSD+= billConfig.baseCost
        report.totalIncomeIssued += record.transactionAmount
        report.clientCurrency = billConfig.currency

      })

      return 
    }

    const returnResponse = async ()=>{
      return report
    }

    return getClient().then(getBillingConfig)
      .then(getCurrentUsage)
      .then(calculateTotals)
      .then(returnResponse)

  }

  public GetInvoiceUsageReport (clientId: string): Promise<unknown>{
    const prevMonth = moment(new Date()).subtract(1, 'month')

    // first day of previous month
    const day1 = moment(new Date(`${prevMonth.month()+1}-01-${prevMonth.year()}`)).utc() 
    // last day of previous month
    const day2 = moment(new Date(`${prevMonth.month()+1}-${prevMonth.daysInMonth()}-${prevMonth.year()}`)).utc()
  
    let billConfig: BillingBracket
    const report= {
      totalUsage: 0,
      totalReconcilliations: 0,
      totalAutomations: 0,
      billAmountUSD: 0,
      totalIncomeReconciled: 0,
      totalIncomeIssued: 0,
      billAmountExchanged: 0,
      clientCurrency: 'USD',
      month: day1.format('MMMM'),
      startDate: day1.format('YYYY ddd MMM DD HH:mm'),
      endDate: day2.format('YYYY ddd MMM DD HH:mm'),
      usage: new Array<UsageRecord>()
    }
    const getClient = ()=>{
      return this.clientRepo.getByDocId(clientId)
    }
    const getBillingConfig = (client: Client) => {
      return this.billRepo.getByDocId(client.subscriptionId)
    }
    const getCurrentUsage = (billingConfig: BillingBracket)=>{
      billConfig = billingConfig
      this.logger.info('USING BILLING : ', billConfig)
      return this.repo.getClientPreviousMonthUsage(clientId)
    }

    const calculateTotals = async (usage:UsageRecord[])=>{
      report.usage = usage
      usage.forEach((record)=>{
        if('INVOICE-PAID' === record.chargeAction){
          report.totalIncomeReconciled += record.transactionAmount
          report.totalReconcilliations ++
          report.billAmountUSD+= billConfig.reconcilliationCost
        } 
        report.totalAutomations ++
        report.billAmountUSD+= billConfig.baseCost
        report.totalIncomeIssued += record.transactionAmount
        report.clientCurrency = billConfig.currency

      })

      return 
    }

    const returnResponse = async ()=>{
      return report
    }

    return getClient().then(getBillingConfig)
      .then(getCurrentUsage)
      .then(calculateTotals)
      .then(returnResponse)

  }

  public GetInvoiceHistory (clientId: string, months: number): Promise<unknown>{
    if(months>12){
      throw new Error('Please enter valid time frame')
    }
   
    let billConfig: BillingBracket
    const reports = new Array<unknown>()

    const getClient = ()=>{
      return this.clientRepo.getByDocId(clientId)
    }
    const getBillingConfig = (client: Client) => {
      return this.billRepo.getByDocId(client.subscriptionId)
    }

    const getFullHistory = (billingConfig: BillingBracket)=>{
      billConfig = billingConfig
      this.logger.info('USING BILLING : ', billConfig)
      return this.repo.getClientUsageHistory(clientId)
    }

    const calculateTotals = async (usage:UsageRecord[])=>{
      for (let i=0;i<months;i++){
        const prevMonth = moment(new Date()).subtract(i, 'month')

        // first day of previous month
        const day1 = moment(new Date(`${prevMonth.month()+1}-01-${prevMonth.year()}`)).utc() 
        // last day of previous month
        const day2 = moment(new Date(`${prevMonth.month()+1}-${prevMonth.daysInMonth()}-${prevMonth.year()}`)).utc()
        let report= {
          totalUsage: 0,
          totalReconcilliations: 0,
          totalAutomations: 0,
          billAmountUSD: 0,
          totalIncomeReconciled: 0,
          totalIncomeIssued: 0,
          totalInvoices: 0,
          billAmountExchanged: 0,
          clientCurrency: 'USD',
          month: day1.format('MMMM'),
          startDate: day1.format('MMMM DD, YYYY'),
          endDate: day2.format('MMMM DD, YYYY'),
          usage: new Array<UsageRecord>()
        }
     
        let lastAccountingRef =""
        report.usage = new Array<UsageRecord>()
           
        for(let x=0;x<usage.length;x++){
          const record = usage[x]
         
          if(record.dateCreated >= day1.valueOf() && record.dateCreated <= day2.valueOf() ){
            if(`INVOICE-PAID` === record.chargeAction){
              report.totalIncomeReconciled += record.transactionAmount
              report.totalReconcilliations ++
              report.billAmountUSD+= billConfig.reconcilliationCost
              report.totalAutomations ++
            }else{
              if(record.accountingRef!==lastAccountingRef){
                lastAccountingRef = record.accountingRef
                report.totalInvoices ++
                report.totalIncomeIssued += record.transactionAmount
                report.clientCurrency = billConfig.currency
              
              }
              report.totalAutomations ++
              report.billAmountUSD+= billConfig.baseCost
              
            }
            report.usage.push(record)
            console.log('ADDED: ', record)
           
          }

        }
        reports.push(report)
      }
      return 
    }

    const returnResponse = async ()=>{
      return reports
    }

    return getClient().
      then(getBillingConfig)
      .then(getFullHistory)
      .then(calculateTotals)
      .then(returnResponse)

  }
  
}

export { BillingService }
