import { PlatformAvailability } from "@febrianasahara/automated-accounts-core"
import { LoggerFactory } from "@febrianasahara/internal-logging-shared-lib"
import Logger = require("bunyan")
import { AvailabilityRespository } from "../repositories/AvailabilityRepository"
class AvailabilityService{
  logger: Logger
  constructor (protected repo: AvailabilityRespository, loggerFactory: LoggerFactory){
    this.logger = loggerFactory.getNamedLogger('api-client-service')
  }

  public getByCountry (country: string): Promise<PlatformAvailability[]>{

    return this.repo.getByCountry(country)
  }

  public getByCountryAndType (country: string, type: string): Promise<PlatformAvailability[]>{

    return this.repo.getByCountryAndType(country, type)
  }

}

export { AvailabilityService }
