import { test } from '@oclif/test'
import * as path from 'path';
import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import * as fs from 'fs-extra'
import * as inquirer from 'inquirer'
import * as qrcode from 'qrcode-terminal'

import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import * as subscriberCheckAPIClientModules from '../../../src/api/SubscriberCheckAPIClient'
import { IProjectConfiguration } from '../../../src/IProjectConfiguration'
import * as consoleLoggerModule from '../../../src/helpers/ConsoleLogger'
import CommandWithProjectConfig from '../../../src/helpers/CommandWithProjectConfig'
import { ICreateTokenResponse } from '../../../src/api/HttpClient';
import { OAuth2APIClient } from '../../../src/api/OAuth2APIClient';
import { ICreateCheckResponse, CheckResource } from '../../../src/api/ChecksAPIClient';
import { CheckStatus } from '../../../src/api/CheckStatus';

import * as phoneCheckAPIClientModules from '../../../src/api/PhoneChecksAPIClient'


let globalConfig: IGlobalConfiguration = {
  defaultWorkspaceClientId: 'my client id',
  defaultWorkspaceClientSecret: 'my client secret',
  defaultWorkspaceDataResidency: 'eu',
  phoneCheckWorkflowRetryMillisecondsOverride: 500, // override to speed up tests
  subscriberCheckWorkflowRetryMillisecondsOverride: 500
}

const overrideQrCodeHandlerConfig = {
  ...globalConfig,
  qrCodeUrlHandlerOverride: 'http://example.com/thing/blah?u={CHECK_URL}&c={CHECK_ID}&t={ACCESS_TOKEN}'
}

const createSubscriberCheckResponse: ICreateCheckResponse = {
  check_id: "c69bc0e6-a429-11ea-bb37-0242ac130002",
  status: CheckStatus.ACCEPTED,
  match: false,
  charge_amount: 1,
  charge_currency: "API",
  created_at: "2020-06-01T16:43:30+00:00",
  ttl: 60,
  _links: {
    self: {
      href: "https://us.api.tru.id/subscriber_check/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002"
    },
    check_url: {
      href: "https://us.api.tru.id/subscriber_check/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002/redirect"
    }
  },
  snapshot_balance: 100
}

const subscriberCheckMatchedResource: subscriberCheckAPIClientModules.SubscriberCheckResource = {
  check_id: "c69bc0e6-a429-11ea-bb37-0242ac130002",
  status: CheckStatus.COMPLETED,
  match: true,
  charge_amount: 1,
  charge_currency: "API",
  created_at: "2020-06-01T16:43:30+00:00",
  updated_at: "2020-06-01T16:43:30+00:00",
  no_sim_change: true,
  _links: {
    self: {
      href: "https://us.api.tru.id/subscriber_check/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002"
    }
  }
}

const subscriberCheckExpiredResource: subscriberCheckAPIClientModules.SubscriberCheckResource = {
  check_id: "c69bc0e6-a429-11ea-bb37-0242ac130002",
  status: CheckStatus.EXPIRED,
  match: false,
  charge_amount: 1,
  charge_currency: "API",
  created_at: "2020-06-01T16:43:30+00:00",
  updated_at: "2020-06-01T16:43:30+00:00",
  no_sim_change: false,
  _links: {
    self: {
      href: "https://us.api.tru.id/subscriber_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002"
    }
  }
}

const subscriberCheckPendingResource: ICreateCheckResponse = {
  check_id: "c69bc0e6-a429-11ea-bb37-0242ac130002",
  status: CheckStatus.PENDING,
  match: false,
  charge_amount: 1,
  charge_currency: "API",
  created_at: "2020-06-01T16:43:30+00:00",
  ttl: 60,
  _links: {
    self: {
      href: "https://us.api.tru.id/subscriber_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002"
    },
    check_url: {
      href: "https://us.api.tru.id/subscriber_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002/redirect"
    }
  },
  snapshot_balance: 100
}

const createPhoneCheckResponse: ICreateCheckResponse = {
  check_id: "c69bc0e6-a429-11ea-bb37-0242ac130002",
  status: CheckStatus.ACCEPTED,
  match: false,
  charge_amount: 1,
  charge_currency: "API",
  created_at: "2020-06-01T16:43:30+00:00",
  ttl: 60,
  _links: {
    self: {
      href: "https://us.api.tru.id/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002"
    },
    check_url: {
      href: "https://us.api.tru.id/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002/redirect"
    }
  },
  snapshot_balance: 100
}

const phoneCheckMatchedResource: CheckResource = {
  check_id: "c69bc0e6-a429-11ea-bb37-0242ac130002",
  status: CheckStatus.COMPLETED,
  match: true,
  charge_amount: 1,
  charge_currency: "API",
  created_at: "2020-06-01T16:43:30+00:00",
  updated_at: "2020-06-01T16:44:00+00:00",
  _links: {
    self: {
      href: "https://us.api.tru.id/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002"
    }
  }
}

const phoneCheckExpiredResource: CheckResource = {
  check_id: "c69bc0e6-a429-11ea-bb37-0242ac130002",
  status: CheckStatus.EXPIRED,
  match: false,
  charge_amount: 1,
  charge_currency: "API",
  created_at: "2020-06-01T16:43:30+00:00",
  updated_at: "2020-06-01T16:43:30+00:00",
  _links: {
    self: {
      href: "https://us.api.tru.id/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002"
    }
  }
}

const phoneCheckPendingResource: ICreateCheckResponse = {
  check_id: "c69bc0e6-a429-11ea-bb37-0242ac130002",
  status: CheckStatus.PENDING,
  match: false,
  charge_amount: 1,
  charge_currency: "API",
  created_at: "2020-06-01T16:43:30+00:00",
  ttl: 60,
  _links: {
    self: {
      href: "https://us.api.tru.id/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002"
    },
    check_url: {
      href: "https://us.api.tru.id/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002/redirect"
    }
  },
  snapshot_balance: 40
}

let existsSyncStub: any
let readJsonStub: any
let inquirerStub: any
let subscriberCheckAPIClientCreateStub: any
let SubscriberCheckAPIClientGetStub: any
let phoneCheckAPIClientCreateStub: any
let phoneCheckAPIClientGetStub: any
let oauth2CreateStub: any
let qrCodeGenerateSpy: any

const phoneNumberToTest = '447700900000'
const projectConfigFileLocation = path.join(process.cwd(),'tru.json')
const projectConfig: IProjectConfiguration = {
  project_id: "c69bc0e6-a429-11ea-bb37-0242ac130003",
  name: "My test project",
  created_at: "2020-06-01T16:43:30+00:00",
  updated_at: "2020-06-01T16:43:30+00:00",
  credentials: [
    {
      client_id: "project client id",
      client_secret: "project client secret",
      created_at: "2020-06-01T16:43:30+00:00"
    }
  ]
}

const qrCodeHandlerAccessTokenResponse: ICreateTokenResponse = {
  access_token: 'i am an access token',
  id_token: 'adfasdfa',
  expires_in: 60,
  token_type: 'bearer',
  refresh_token: 'fadfadfa',
  scope: 'projects'
}


describe('PhoneCheck and SubscriberCheck Create Scenarios', () => {

  beforeEach(() => {
    existsSyncStub = sinon.default.stub(fs, 'existsSync')
    existsSyncStub.withArgs(sinon.default.match(new RegExp(/config.json/))).returns(true)

    readJsonStub = sinon.default.stub(fs, 'readJson')

    readJsonStub.withArgs(
      sinon.default.match(sinon.default.match(new RegExp(/config.json/))))
      .resolves(globalConfig)

    readJsonStub.withArgs(
      sinon.default.match(projectConfigFileLocation))
      .resolves(projectConfig)

    inquirerStub = sinon.default.stub(inquirer, 'prompt')

    // SubscriberCheckClient
    subscriberCheckAPIClientCreateStub = sinon.default.stub(subscriberCheckAPIClientModules.SubscriberCheckAPIClient.prototype, 'create')
    subscriberCheckAPIClientCreateStub.resolves(createSubscriberCheckResponse)
    SubscriberCheckAPIClientGetStub = sinon.default.stub(subscriberCheckAPIClientModules.SubscriberCheckAPIClient.prototype, 'get')

    // PhoneCheckClient
    phoneCheckAPIClientCreateStub = sinon.default.stub(phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype, 'create')
    phoneCheckAPIClientCreateStub.resolves(createPhoneCheckResponse)

    phoneCheckAPIClientGetStub = sinon.default.stub(phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype, 'get')

    // QR Code
    oauth2CreateStub = sinon.default.stub(OAuth2APIClient.prototype, 'create')
    oauth2CreateStub.resolves(qrCodeHandlerAccessTokenResponse)
    qrCodeGenerateSpy = sinon.default.spy(qrcode, 'generate')
  })

  afterEach(() => {
    sinon.default.restore()
  })

  {
    let params = [
      { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
      { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' }
    ]
    params.forEach(({ command }) => {
      test
        .do(() => {
          jest.setTimeout(30000);
          existsSyncStub.withArgs(projectConfigFileLocation).returns(false)
        })
        .stdout()
        .command([command, phoneNumberToTest])
        .exit(1)
        .it(`${command} -- an error is logged when the process.cwd() project configuration is not present`, ctx => {
          expect(ctx.stdout).to.contain(`A project configuration file does not exist at "${projectConfigFileLocation}"`)
        })

    })
  }


  {
    let customProjectConfigDirPath = path.join('alternative','path','to')
    let customProjectConfigFullPath = path.join('alternative','path','to', 'tru.json')
    let params = [
      { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
      { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' }
    ]
    params.forEach(({ command }) => {
      test
        .do(() => {
          readJsonStub.withArgs(
            sinon.default.match(customProjectConfigFullPath))
            .resolves(projectConfig)
        })
        .stdout()
        .command([command, phoneNumberToTest, `--${CommandWithProjectConfig.projectDirFlagName}=${customProjectConfigDirPath}`])
        .it(`${command} -- should load the project configuration from the location specified by the ${CommandWithProjectConfig.projectDirFlagName} flag`, ctx => {
          expect(readJsonStub).to.have.been.calledWith(customProjectConfigFullPath)
        })
    })
  }


  {
    let params = [
      { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
      { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' }
    ]

    params.forEach(({ command }) => {
      test
        .command([command, phoneNumberToTest])
        .it(`${command} -- project configuration is read`, ctx => {
          expect(readJsonStub).to.have.been.calledWith(projectConfigFileLocation)
        })
    })
  }

  {
    let params = [
      { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
      { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' }
    ]

    params.forEach(({ command, typeOfCheck }) => {
      test
        .do(() => {
          inquirerStub.resolves({ 'phone_number': phoneNumberToTest })
        })
        .command([command])
        .it(`${command} -- prompts the user for a ${typeOfCheck} to check when an inline argument is not provided`, ctx => {
          expect(inquirerStub).to.have.been.calledWith([
            {
              name: 'phone_number',
              message: `Please enter the phone number you would like to ${typeOfCheck}`,
              type: 'input',
              filter: sinon.default.match.func,
              validate: sinon.default.match.func
            }
          ])
        })
    })
  }

  {
    let constructorStub: any
    let params = [
      { command: 'subscriberchecks:create', clientName: 'SubscriberCheckAPIClient' },
      { command: 'phonechecks:create', clientName: 'PhoneChecksAPIClient' }
    ]
    params.forEach(({ command, clientName }) => {
      test
        .do(() => {
          constructorStub = getConstructorApiClientSpy(clientName);
        })
        .command([command, phoneNumberToTest])
        .it(`${command} -- should instantiate a ${clientName} object with project configuration`, ctx => {
          expect(constructorStub).to.have.been.calledWith(
            sinon.default.match.has('clientId', projectConfig.credentials[0].client_id).and(
              sinon.default.match.has('clientSecret', projectConfig.credentials[0].client_secret)),
            sinon.default.match.any
          )
        })
    })
  }


  {
    let constructorStub: any
    let params = [
      { command: 'subscriberchecks:create', clientName: 'SubscriberCheckAPIClient', scope: 'subscriber_check' },
      { command: 'phonechecks:create', clientName: 'PhoneChecksAPIClient', scope: 'phone_check' }
    ]
    params.forEach(({ command, clientName, scope }) => {
      test
        .do(() => {
          constructorStub = getConstructorApiClientSpy(clientName);
        })
        .command([command, phoneNumberToTest])
        .it(`${command} -- should instantiate a ${clientName}  with ${scope} scopes`, ctx => {
          expect(constructorStub).to.have.been.calledWith(
            sinon.default.match.has('scopes', scope),
            sinon.default.match.any
          )
        })
    })
  }

  {
    let constructorStub: any
    let params = [
      { command: 'subscriberchecks:create', clientName: 'SubscriberCheckAPIClient' },
      { command: 'phonechecks:create', clientName: 'PhoneChecksAPIClient' }
    ]
    params.forEach(({ command, clientName }) => {
      test
        .do(() => {
          constructorStub = getConstructorApiClientSpy(clientName);
        })
        .command([command, phoneNumberToTest])
        .it(`${command} --should instantiate a ${clientName} object with global baseUrl configuration`, ctx => {
          expect(constructorStub).to.have.been.calledWith(
            sinon.default.match.has('baseUrl', `https://${globalConfig.defaultWorkspaceDataResidency}.api.tru.id`),
            sinon.default.match.any
          )
        })
    })
  }

  {
    let constructorStub: any
    let params = [
      { command: 'subscriberchecks:create', clientName: 'SubscriberCheckAPIClient' },
      { command: 'phonechecks:create', clientName: 'PhoneChecksAPIClient' }
    ]
    params.forEach(({ command, clientName }) => {
      test
        .do(() => {
          constructorStub = getConstructorApiClientSpy(clientName);
        })
        .command([command, phoneNumberToTest])
        .it(`${command} -- should instantiate a ${clientName} object with a logger`, ctx => {
          expect(constructorStub).to.have.been.calledWith(
            sinon.default.match.any,
            sinon.default.match.instanceOf(consoleLoggerModule.ConsoleLogger)
          )
        })
    })
  }

  {
    let apiClientStub: any
    let params = [
      { command: 'subscriberchecks:create', clientName: 'SubscriberCheckAPIClient' },
      { command: 'phonechecks:create', clientName: 'PhoneChecksAPIClient' }
    ]
    params.forEach(({ command, clientName }) => {
      test
        .do(() => {
          apiClientStub = getApiClientStub(clientName);
        })
        .command([command, phoneNumberToTest, '--debug'])
        .it(`${command} -- calls the ${clientName} with the supplied phone number`, ctx => {
          expect(apiClientStub).to.have.been.calledWith({ phone_number: phoneNumberToTest })
        })
    })
  }

  {
    let params = [
      { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
      { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' }
    ]
    params.forEach(({ command, typeOfCheck }) => {
      test
        .stdout()
        .command([command, phoneNumberToTest, '--debug'])
        .it(`${command} --logs a successfully created ${typeOfCheck}`, ctx => {
          expect(ctx.stdout).to.contain(`${typeOfCheck} ACCEPTED`)
        })
    })
  }

  {
    let params = [
      { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
      { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' }
    ]
    params.forEach(({ command, typeOfCheck }) => {
      test
        .do(() => {

          subscriberCheckAPIClientCreateStub.restore()
          subscriberCheckAPIClientCreateStub = sinon.default.stub(subscriberCheckAPIClientModules.SubscriberCheckAPIClient.prototype, 'create')
          subscriberCheckAPIClientCreateStub.resolves({
            ...createSubscriberCheckResponse,
            status: CheckStatus.ERROR
          })

          phoneCheckAPIClientCreateStub.restore()
          phoneCheckAPIClientCreateStub = sinon.default.stub(phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype, 'create')
          phoneCheckAPIClientCreateStub.resolves({
            ...createPhoneCheckResponse,
            status: CheckStatus.ERROR
          })

        })
        .stdout()
        .command([command, phoneNumberToTest, '--debug'])
        .exit(1)
        .it(`${command} -- logs a ${typeOfCheck} that has status of ERROR`, ctx => {
          expect(ctx.stdout).to.contain(`The ${typeOfCheck} could not be created. The ${typeOfCheck} status is ERROR`)
        })
    })
  }

  describe('checks:create --workflow', () => {
    {
      let params = [
        { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
        { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' }
      ]
      params.forEach(({ command, typeOfCheck }) => {
        test
          .do(() => {
            SubscriberCheckAPIClientGetStub.resolves(subscriberCheckMatchedResource);
            phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource);
          })
          .command([command, phoneNumberToTest, '--workflow'])
          .it(`${command} creates a QR code`, () => {
            expect(qrCodeGenerateSpy).to.have.been.called
          })
      })
    }

    {
      let params = [
        { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck', response: createSubscriberCheckResponse },
        { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck', response: createPhoneCheckResponse }
      ]
      params.forEach(({ command, typeOfCheck, response }) => {
        test
          .do(() => {
            SubscriberCheckAPIClientGetStub.resolves(subscriberCheckMatchedResource)
            phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource)
          })
          .command([command, phoneNumberToTest, '--workflow'])
          .it(`${command} creates a QR code with expected URL`, () => {
            expect(qrCodeGenerateSpy).to.have.been.calledWith(
              `https://r.tru.id?u=${encodeURIComponent(response._links.check_url.href)}` +
              `&c=${response.check_id}` +
              `&t=${qrCodeHandlerAccessTokenResponse.access_token}`,
              sinon.default.match.any)
          })
      })
    }

    {
      let params = [
        { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck', response: createSubscriberCheckResponse },
        { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck', response: createPhoneCheckResponse }
      ]
      params.forEach(({ command, typeOfCheck, response }) => {
        test
          .do(() => {
            SubscriberCheckAPIClientGetStub.resolves(subscriberCheckMatchedResource)
            phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource)
          })
          .command([command, phoneNumberToTest, '--workflow', '--debug'])
          .it(`${command} creates a QR code with debug in the URL if the debug flag is set`, () => {
            expect(qrCodeGenerateSpy).to.have.been.calledWith(
              `https://r.tru.id?u=${encodeURIComponent(response._links.check_url.href)}` +
              `&c=${response.check_id}` +
              `&t=${qrCodeHandlerAccessTokenResponse.access_token}` +
              `&debug=true`,
              sinon.default.match.any)
          })
      })
    }

    {
      let params = [
        { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
        { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' }
      ]
      params.forEach(({ command, typeOfCheck }) => {

        test
          .do(() => {
            SubscriberCheckAPIClientGetStub.resolves(subscriberCheckMatchedResource)
            phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource)
            oauth2CreateStub.restore()

            oauth2CreateStub = sinon.default.stub(OAuth2APIClient.prototype, 'create')
            oauth2CreateStub.throws()
          })
          .command([command, phoneNumberToTest, '--workflow', '--debug'])
          .exit(1)
          .it(`${command} -- should handle an access token creation failure`)
      })
    }

    {
      let params = [
        { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck', response: createSubscriberCheckResponse },
        { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck', response: createPhoneCheckResponse }
      ]
      params.forEach(({ command, typeOfCheck, response }) => {
        test
          .do(() => {
            readJsonStub.restore()
            readJsonStub = sinon.default.stub(fs, 'readJson')

            readJsonStub.withArgs(
              sinon.default.match(sinon.default.match(new RegExp(/config.json/))))
              .resolves(overrideQrCodeHandlerConfig)

            readJsonStub.withArgs(
              sinon.default.match(projectConfigFileLocation))
              .resolves(projectConfig)

            SubscriberCheckAPIClientGetStub.resolves(subscriberCheckMatchedResource)
            phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource)
          })
          .command([command, phoneNumberToTest, '--workflow'])
          .it(`${command} creates a QR code with expected URL override`, () => {
            const expectedUrl = overrideQrCodeHandlerConfig.qrCodeUrlHandlerOverride
              .replace('{CHECK_URL}', `${encodeURIComponent(response._links.check_url.href)}`)
              .replace('{CHECK_ID}', response.check_id)
              .replace('{ACCESS_TOKEN}', qrCodeHandlerAccessTokenResponse.access_token)

            expect(qrCodeGenerateSpy).to.have.been.calledWith(expectedUrl, sinon.default.match.any)
          })
      })
    }

    {
      let params = [
        { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck', response: createSubscriberCheckResponse },
        { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck', response: createPhoneCheckResponse }
      ]
      params.forEach(({ command, typeOfCheck, response }) => {
        test
          .do(() => {
            SubscriberCheckAPIClientGetStub.resolves(subscriberCheckMatchedResource)
            phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource)
          })
          .command([command, phoneNumberToTest, '--workflow', '--skip-qrcode-handler'])
          .it(`${command} -- creates a QR code with expected URL skipping r.tru.id`, () => {
            expect(qrCodeGenerateSpy).to.have.been.calledWith(response._links.check_url.href, sinon.default.match.any)
          })
      })
    }

    {
      let checkApiClientStub: any
      let params = [
        { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck', response: createSubscriberCheckResponse },
        { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck', response: createPhoneCheckResponse }
      ]
      params.forEach(({ command, typeOfCheck, response }) => {
        test
          .do(() => {
            SubscriberCheckAPIClientGetStub.resolves(subscriberCheckMatchedResource)
            phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource)

            switch (typeOfCheck) {
              case "SubscriberCheck":
                checkApiClientStub = SubscriberCheckAPIClientGetStub
                break;
              case "PhoneCheck":
                checkApiClientStub = phoneCheckAPIClientGetStub
                break;
            }
          })
          .command([command, phoneNumberToTest, '--workflow'])
          .it(`${command} checks the status of the ${typeOfCheck}`, () => {
            expect(checkApiClientStub).to.have.been.calledWith(response.check_id)
          })
      })
    }

    test
    .do(() => {
      phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource)
    })
    .stdout()
    .command(['phonechecks:create', phoneNumberToTest, '--workflow'])
    .it(`phonechecks:create completed status and match result are logged`, (ctx) => {
      expect(ctx.stdout).to.contain(`match:  true`)
      expect(ctx.stdout).to.contain(`status:  COMPLETED`)
    })

    test
    .do(() => {
      SubscriberCheckAPIClientGetStub.resolves(subscriberCheckMatchedResource)
    })
    .stdout()
    .command(['subscriberchecks:create', phoneNumberToTest, '--workflow'])
    .it(`subscriberchecks:create completed status and match result are logged`, (ctx) => {
      expect(ctx.stdout).to.contain(`match:  true`)
      expect(ctx.stdout).to.contain(`no_sim_change:  true`)
    })

    {
      let checkApiClientStub: any
      let params = [
        { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
        { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' }
      ]
      params.forEach(({ command, typeOfCheck }) => {
        test
          .do(() => {

            SubscriberCheckAPIClientGetStub.onCall(0).resolves(subscriberCheckPendingResource)
            SubscriberCheckAPIClientGetStub.onCall(1).resolves(subscriberCheckMatchedResource)

            phoneCheckAPIClientGetStub.onCall(0).resolves(phoneCheckPendingResource)
            phoneCheckAPIClientGetStub.onCall(1).resolves(phoneCheckMatchedResource)

            switch (typeOfCheck) {
              case "SubscriberCheck":
                checkApiClientStub = SubscriberCheckAPIClientGetStub
                break;
              case "PhoneCheck":
                checkApiClientStub = phoneCheckAPIClientGetStub
                break;
            }

          })
          .command([command, phoneNumberToTest, '--workflow'])
          .it(`${command} -- checks the status of the ${typeOfCheck} again if the first check status is not a final state`, () => {
            expect(checkApiClientStub).to.have.been.calledTwice
          })
      })
    }

    {
      let params = [
        { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
        { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' }
      ]
      params.forEach(({ command, typeOfCheck }) => {

        test
          .do(() => {
            SubscriberCheckAPIClientGetStub.resolves(subscriberCheckExpiredResource)
            phoneCheckAPIClientGetStub.resolves(phoneCheckExpiredResource)

          })
          .stdout()
          .command([command, phoneNumberToTest, '--workflow'])
          .it(`${command} exits if the ${typeOfCheck} expires`, (ctx) => {
            expect(ctx.stdout).to.contain(`status:  EXPIRED`)
          })

      })
    }
  })

  function getConstructorApiClientSpy(clientName: string) {
    let constructorStub: any
    switch (clientName) {
      case 'SubscriberCheckAPIClient':
        constructorStub = sinon.default.spy(subscriberCheckAPIClientModules, 'SubscriberCheckAPIClient');
        break;
      case 'PhoneChecksAPIClient':
        constructorStub = sinon.default.spy(phoneCheckAPIClientModules, 'PhoneChecksAPIClient');
        break;
    }
    return constructorStub;
  }

  function getApiClientStub(clientName: string): any {
    let apiClientStub: any
    switch (clientName) {
      case 'SubscriberCheckAPIClient':
        apiClientStub = subscriberCheckAPIClientCreateStub;
        break;
      case 'PhoneChecksAPIClient':
        apiClientStub = phoneCheckAPIClientCreateStub;
        break;
    }
    return apiClientStub;
  }
})



