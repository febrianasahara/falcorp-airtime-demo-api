import { PlatformAvailability, Repository } from "@febrianasahara/automated-accounts-core"

class AvailabilityRespository extends Repository<PlatformAvailability>{

  public async getByCountry (country: string) : Promise<PlatformAvailability[]>{
    const response = await this.db.collection(this.tableName).where('supportedCountries', 'array-contains', country.toLowerCase())
      .get()
    if (response.empty) {
      return new Array<PlatformAvailability>()
    } else {
      const list = new Array<PlatformAvailability>()
      response.docs.forEach((doc) => {
        list.push(doc.data() as PlatformAvailability)
      })
      return list
    }
  }

  public async getByCountryAndType (country: string, type: string) : Promise<PlatformAvailability[]>{
    const response = await this.db.collection(this.tableName)
      .where('supportedCountries', 'array-contains', country.toLowerCase())
      .where('type', '==', type)
      .get()
    if (response.empty) {
      return new Array<PlatformAvailability>()
    } else {
      const list = new Array<PlatformAvailability>()
      response.docs.forEach((doc) => {
        list.push(doc.data() as PlatformAvailability)
      })
      return list
    }
  }
}

export { AvailabilityRespository }
