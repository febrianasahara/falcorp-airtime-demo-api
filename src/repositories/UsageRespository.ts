import { Repository, UsageRecord } from "@febrianasahara/automated-accounts-core"
import moment = require("moment")

class UsageRespository extends Repository<UsageRecord>{

  public async getClientUsageHistory (clientId: string) : Promise<UsageRecord[]>{
  
    const response = await this.db.collection(this.tableName)
  
      .where('clientId', '==', clientId)
      .get()
    if (response.empty) {
      return new Array<UsageRecord>()
    } else {
      const list = new Array<UsageRecord>()
      this.logger.info('USER HAS EXECUTED ' + response.docs.length + ' TIMES')
      response.docs.forEach((doc) => {
        list.push(doc.data() as UsageRecord)
      })
      return list
    }
  }

  public async getClientCurrentUsage (clientId: string) : Promise<UsageRecord[]>{

    // current date
    const now = moment(new Date()).utc()
    // first day of current month
    let mo = (now.month()+1).toString()
    if(now.month()+1<10){
      mo = '0'+ mo.toString()
    }
    const st =`01/${mo}/${now.year()}`
    const day1 = moment(new Date(st)).utc()

    const response = await this.db.collection(this.tableName)
      .where('clientId', '==', clientId)
      .get()
    if (response.empty) {
      return new Array<UsageRecord>()
    } else {
      const list = new Array<UsageRecord>()
      response.docs.forEach((doc) => {
        const item = doc.data() as UsageRecord
        if(item.dateCreated>= day1.valueOf()){
          list.push(item)
        }
      })
      return list
    }
  }

  public async getClientPreviousMonthUsage (clientId: string) : Promise<UsageRecord[]>{

    // date of previous month
    const prevMonth = moment(new Date()).subtract(1, 'month')

    // first day of previous month
    const day1 = moment(new Date(`${prevMonth.month()+1}-01-${prevMonth.year()}`)).utc() 
    // last day of previous month
    const day2 = moment(new Date(`${prevMonth.month()+1}-${prevMonth.daysInMonth()}-${prevMonth.year()}`)).utc()
  
    const response = await this.db.collection(this.tableName)
      .where('clientId', '==', clientId)
      .get()
    if (response.empty) {
      return new Array<UsageRecord>()
    } else {
      const list = new Array<UsageRecord>()
      response.docs.forEach((doc) => {
        const item = doc.data() as UsageRecord
        if(item.dateCreated>= day1.valueOf() && item.dateCreated<= day2.valueOf()){
          list.push(item)
        } 
      })
      return list
    }
  }

}

export { UsageRespository }
