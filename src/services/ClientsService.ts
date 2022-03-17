import { Client, Repository, UserRole } from "@febrianasahara/automated-accounts-core"
import { LoggerFactory } from "@febrianasahara/internal-logging-shared-lib"
import Logger = require("bunyan")
import * as admin from 'firebase-admin'
import moment = require("moment")
class ClientService {
  logger: Logger
  constructor(protected repo: Repository<Client>, protected storage: admin.storage.Storage, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.getNamedLogger('api-client-service')
  }

  public getClientById(id: string): Promise<Client> {

    const validateInput = async () => {
      if (!id) {
        throw new Error('Params missing "Id"')
      }
    }
    const performRequest = () => {
      return this.repo.getByDocId(id)
    }

    return validateInput()
      .then(performRequest)
  }

  public login(id: string): Promise<Client> {

    const validateInput = async () => {
      if (!id) {
        throw new Error('Params missing "Id"')
      }
    }

    const performRequest = () => {
      return this.repo.getByDocId(id)
    }

    const evaluateSession = async (client: Client) => {
      // if(client.accounting_platform === AccountingPlatforms.QUICKBOOKS){
      //   this.session.startSession(client.id)
      // }
      return client
    }

    return validateInput()
      .then(performRequest)
      .then(evaluateSession)
  }

  public getAllActiveClients(): Promise<Client[]> {

    return this.repo.getAll(true, true)
  }

  public getAllUnpublishedClients(): Promise<Client[]> {

    return this.repo.getAll(true, false)
  }

  public registerNewClient(id: string, companyName: string, companyDesc: string, contactNo: string, contactPerson: string, contactEmail: string, country: string, platform: string, gateway: string, logo: Buffer): Promise<any> {

    const validateInput = async () => {
      if (!id) {
        throw new Error('Params missing "Id"')
      }
      if (!logo) {
        throw new Error('Logo is required. Please upload a logo')
      }
    }

    const uploadImage = async () => {
      // Create a root reference
      const bucket = this.storage.bucket()
      const file = bucket.file(`company/logo/${id}.png`)
      return file.save(logo).then(() => {
        const url = file.publicUrl()
        this.logger.info('File URL', url)
        return url
      })
        .catch((error) => {
          this.logger.error('Upload error: ', error)
          return ''
        })
    }

    const buildObject = async (logoUrl: string) => {
      const client: Client = {
        id,
        companyName,
        companyDesc,
        contactNumber: contactNo,
        contactEmail,
        contactPerson,
        countryOfRegistration: country,
        accounting_platform: platform,
        gateway,
        active: true,
        published: false,
        billingDay: -1,
        role: UserRole.REGISTERED,
        agent_code: '',
        customEmailEnabled: false,
        customEmailTemplate: -1,
        logoUrl: logoUrl,
        subscriptionId: '',
        dateCreated: moment(new Date()).utc()
          .valueOf(),
        lastUpdated: moment(new Date()).utc()
          .valueOf(),
        payoutDay: 0,
        allowDebitOrder: false
      }
      return performRequest(client)
    }
    const performRequest = (client: Client) => {
      return this.repo.save(client)
    }

    return validateInput()
      .then(uploadImage)
      .then(buildObject)
      .then(performRequest)
  }

  public update(client: Client): Promise<Client> {
    return this.repo.update(client)
  }

  public updateLogo(id: string, logo: Buffer): Promise<Client> {
    const uploadImage = async () => {
      // Create a root reference
      const bucket = this.storage.bucket()
      const file = bucket.file(`company/logo/${id}.png`)
      return file.save(logo).then(() => {
        const url = file.publicUrl()
        this.logger.info('File URL', url)
        return url
      })
        .catch((error) => {
          this.logger.error('Upload error: ', error)
          return ''
        })
    }

    const updateClient = (url: string): Promise<Client> => {
      return this.repo.getByDocId(id).then((res) => {
        res.logoUrl = url
        return this.repo.update(res)
      })
    }

    return uploadImage()
      .then(updateClient)

  }

}

export { ClientService }
