import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import path from 'path'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { ICreateCheckResponse } from '../../../src/api/ChecksAPIClient'
import { CheckStatus } from '../../../src/api/CheckStatus'
import { ICreateTokenResponse } from '../../../src/api/HttpClient'
import { OAuth2APIClient } from '../../../src/api/OAuth2APIClient'
import * as phoneCheckAPIClientModules from '../../../src/api/PhoneChecksAPIClient'
import * as subscriberCheckAPIClientModules from '../../../src/api/SubscriberCheckAPIClient'
import CommandWithProjectConfig from '../../../src/helpers/CommandWithProjectConfig'
import * as consoleLoggerModule from '../../../src/helpers/ConsoleLogger'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import { IProjectConfiguration } from '../../../src/IProjectConfiguration'

const expect = chai.expect
chai.use(sinonChai)

const globalConfig: IGlobalConfiguration = {
  defaultWorkspaceClientId: 'my client id',
  defaultWorkspaceClientSecret: 'my client secret',
  defaultWorkspaceDataResidency: 'eu',
  phoneCheckWorkflowRetryMillisecondsOverride: 500, // override to speed up tests
  subscriberCheckWorkflowRetryMillisecondsOverride: 500,
}

const createSubscriberCheckResponse: ICreateCheckResponse = {
  check_id: 'c69bc0e6-a429-11ea-bb37-0242ac130002',
  status: CheckStatus.ACCEPTED,
  match: false,
  charge_amount: 1,
  charge_currency: 'API',
  created_at: '2020-06-01T16:43:30+00:00',
  ttl: 60,
  _links: {
    self: {
      href: 'https://us.api.tru.id/subscriber_check/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002',
    },
    check_url: {
      href: 'https://us.api.tru.id/subscriber_check/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002/redirect',
    },
  },
  snapshot_balance: 100,
}

const createPhoneCheckResponse: ICreateCheckResponse = {
  check_id: 'c69bc0e6-a429-11ea-bb37-0242ac130002',
  status: CheckStatus.ACCEPTED,
  match: false,
  charge_amount: 1,
  charge_currency: 'API',
  created_at: '2020-06-01T16:43:30+00:00',
  ttl: 60,
  _links: {
    self: {
      href: 'https://us.api.tru.id/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002',
    },
    check_url: {
      href: 'https://us.api.tru.id/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002/redirect',
    },
  },
  snapshot_balance: 100,
}

let existsSyncStub: any
let readJsonStub: any
let inquirerStub: any
let subscriberCheckAPIClientCreateStub: any
let phoneCheckAPIClientCreateStub: any
let oauth2CreateStub: any

const phoneNumberToTest = '447700900000'
const projectConfigFileLocation = path.join(process.cwd(), 'tru.json')
const projectConfig: IProjectConfiguration = {
  project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
  name: 'My test project',
  created_at: '2020-06-01T16:43:30+00:00',
  updated_at: '2020-06-01T16:43:30+00:00',
  credentials: [
    {
      client_id: 'project client id',
      client_secret: 'project client secret',
      created_at: '2020-06-01T16:43:30+00:00',
    },
  ],
}

const qrCodeHandlerAccessTokenResponse: ICreateTokenResponse = {
  access_token: 'i am an access token',
  id_token: 'adfasdfa',
  expires_in: 60,
  token_type: 'bearer',
  refresh_token: 'fadfadfa',
  scope: 'projects',
}

describe('PhoneCheck and SubscriberCheck Create Scenarios', () => {
  beforeEach(() => {
    existsSyncStub = sinon.stub(fs, 'existsSync')
    existsSyncStub
      .withArgs(sinon.match(new RegExp(/config.json/)))
      .returns(true)

    readJsonStub = sinon.stub(fs, 'readJson')

    readJsonStub
      .withArgs(sinon.match(sinon.match(new RegExp(/config.json/))))
      .resolves(globalConfig)

    readJsonStub
      .withArgs(sinon.match(projectConfigFileLocation))
      .resolves(projectConfig)

    inquirerStub = sinon.stub(inquirer, 'prompt')

    // SubscriberCheckClient
    subscriberCheckAPIClientCreateStub = sinon.stub(
      subscriberCheckAPIClientModules.SubscriberCheckAPIClient.prototype,
      'create',
    )
    subscriberCheckAPIClientCreateStub.resolves(createSubscriberCheckResponse)
    sinon.stub(
      subscriberCheckAPIClientModules.SubscriberCheckAPIClient.prototype,
      'get',
    )

    // PhoneCheckClient
    phoneCheckAPIClientCreateStub = sinon.stub(
      phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype,
      'create',
    )
    phoneCheckAPIClientCreateStub.resolves(createPhoneCheckResponse)

    sinon.stub(phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype, 'get')

    // QR Code
    oauth2CreateStub = sinon.stub(OAuth2APIClient.prototype, 'create')
    oauth2CreateStub.resolves(qrCodeHandlerAccessTokenResponse)
  })

  afterEach(() => {
    sinon.restore()
  })

  {
    const params = [
      { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
      { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' },
    ]
    params.forEach(({ command }) => {
      test
        .do(() => {
          // jest.setTimeout(30000)
          existsSyncStub.withArgs(projectConfigFileLocation).returns(false)
        })
        .stdout()
        .command([command, phoneNumberToTest])
        .exit(1)
        .it(
          `${command} -- an error is logged when the process.cwd() project configuration is not present`,
          (ctx) => {
            expect(ctx.stdout).to.contain(
              `A project configuration file does not exist at "${projectConfigFileLocation}"`,
            )
          },
        )
    })
  }

  {
    const customProjectConfigDirPath = path.join('alternative', 'path', 'to')
    const customProjectConfigFullPath = path.join(
      'alternative',
      'path',
      'to',
      'tru.json',
    )
    const params = [
      { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
      { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' },
    ]
    params.forEach(({ command }) => {
      test
        .do(() => {
          readJsonStub
            .withArgs(sinon.match(customProjectConfigFullPath))
            .resolves(projectConfig)
        })
        .stdout()
        .command([
          command,
          phoneNumberToTest,
          `--${CommandWithProjectConfig.projectDirFlagName}=${customProjectConfigDirPath}`,
        ])
        .it(
          `${command} -- should load the project configuration from the location specified by the ${CommandWithProjectConfig.projectDirFlagName} flag`,
          () => {
            expect(readJsonStub).to.have.been.calledWith(
              customProjectConfigFullPath,
            )
          },
        )
    })
  }

  {
    const params = [
      { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
      { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' },
    ]

    params.forEach(({ command }) => {
      test
        .command([command, phoneNumberToTest])
        .it(`${command} -- project configuration is read`, () => {
          expect(readJsonStub).to.have.been.calledWith(
            projectConfigFileLocation,
          )
        })
    })
  }

  {
    const params = [
      { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
      { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' },
    ]

    params.forEach(({ command, typeOfCheck }) => {
      test
        .do(() => {
          inquirerStub.resolves({ phone_number: phoneNumberToTest })
        })
        .command([command])
        .it(
          `${command} -- prompts the user for a ${typeOfCheck} to check when an inline argument is not provided`,
          () => {
            expect(inquirerStub).to.have.been.calledWith([
              {
                name: 'phone_number',
                message: `Please enter the phone number you would like to ${typeOfCheck}`,
                type: 'input',
                filter: sinon.match.func,
                validate: sinon.match.func,
              },
            ])
          },
        )
    })
  }

  {
    let constructorStub: any
    const params = [
      {
        command: 'subscriberchecks:create',
        clientName: 'SubscriberCheckAPIClient',
      },
      { command: 'phonechecks:create', clientName: 'PhoneChecksAPIClient' },
    ]
    params.forEach(({ command, clientName }) => {
      test
        .do(() => {
          constructorStub = getConstructorApiClientSpy(clientName)
        })
        .command([command, phoneNumberToTest])
        .it(
          `${command} -- should instantiate a ${clientName} object with project configuration`,
          () => {
            expect(constructorStub).to.have.been.calledWith(
              sinon.match
                .has('clientId', projectConfig.credentials[0].client_id)
                .and(
                  sinon.match.has(
                    'clientSecret',
                    projectConfig.credentials[0].client_secret,
                  ),
                ),
              sinon.match.any,
            )
          },
        )
    })
  }

  {
    let constructorStub: any
    const params = [
      {
        command: 'subscriberchecks:create',
        clientName: 'SubscriberCheckAPIClient',
        scope: 'subscriber_check',
      },
      {
        command: 'phonechecks:create',
        clientName: 'PhoneChecksAPIClient',
        scope: 'phone_check',
      },
    ]
    params.forEach(({ command, clientName, scope }) => {
      test
        .do(() => {
          constructorStub = getConstructorApiClientSpy(clientName)
        })
        .command([command, phoneNumberToTest])
        .it(
          `${command} -- should instantiate a ${clientName}  with ${scope} scopes`,
          () => {
            expect(constructorStub).to.have.been.calledWith(
              sinon.match.has('scopes', scope),
              sinon.match.any,
            )
          },
        )
    })
  }

  {
    let constructorStub: any
    const params = [
      {
        command: 'subscriberchecks:create',
        clientName: 'SubscriberCheckAPIClient',
      },
      { command: 'phonechecks:create', clientName: 'PhoneChecksAPIClient' },
    ]
    params.forEach(({ command, clientName }) => {
      test
        .do(() => {
          constructorStub = getConstructorApiClientSpy(clientName)
        })
        .command([command, phoneNumberToTest])
        .it(
          `${command} --should instantiate a ${clientName} object with global baseUrl configuration`,
          () => {
            expect(constructorStub).to.have.been.calledWith(
              sinon.match.has(
                'baseUrl',
                `https://${globalConfig.defaultWorkspaceDataResidency}.api.tru.id`,
              ),
              sinon.match.any,
            )
          },
        )
    })
  }

  {
    let constructorStub: any
    const params = [
      {
        command: 'subscriberchecks:create',
        clientName: 'SubscriberCheckAPIClient',
      },
      { command: 'phonechecks:create', clientName: 'PhoneChecksAPIClient' },
    ]
    params.forEach(({ command, clientName }) => {
      test
        .do(() => {
          constructorStub = getConstructorApiClientSpy(clientName)
        })
        .command([command, phoneNumberToTest])
        .it(
          `${command} -- should instantiate a ${clientName} object with a logger`,
          () => {
            expect(constructorStub).to.have.been.calledWith(
              sinon.match.any,
              sinon.match.instanceOf(consoleLoggerModule.ConsoleLogger),
            )
          },
        )
    })
  }

  {
    let apiClientStub: any
    const params = [
      {
        command: 'subscriberchecks:create',
        clientName: 'SubscriberCheckAPIClient',
      },
      { command: 'phonechecks:create', clientName: 'PhoneChecksAPIClient' },
    ]
    params.forEach(({ command, clientName }) => {
      test
        .do(() => {
          apiClientStub = getApiClientStub(clientName)
        })
        .command([command, phoneNumberToTest, '--debug'])
        .it(
          `${command} -- calls the ${clientName} with the supplied phone number`,
          () => {
            expect(apiClientStub).to.have.been.calledWith({
              phone_number: phoneNumberToTest,
            })
          },
        )
    })
  }

  {
    const params = [
      { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
      { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' },
    ]
    params.forEach(({ command, typeOfCheck }) => {
      test
        .stdout()
        .command([command, phoneNumberToTest, '--debug'])
        .it(
          `${command} --logs a successfully created ${typeOfCheck}`,
          (ctx) => {
            expect(ctx.stdout).to.contain(`${typeOfCheck} ACCEPTED`)
          },
        )
    })
  }

  {
    const params = [
      { command: 'subscriberchecks:create', typeOfCheck: 'SubscriberCheck' },
      { command: 'phonechecks:create', typeOfCheck: 'PhoneCheck' },
    ]
    params.forEach(({ command, typeOfCheck }) => {
      test
        .do(() => {
          subscriberCheckAPIClientCreateStub.restore()
          subscriberCheckAPIClientCreateStub = sinon.stub(
            subscriberCheckAPIClientModules.SubscriberCheckAPIClient.prototype,
            'create',
          )
          subscriberCheckAPIClientCreateStub.resolves({
            ...createSubscriberCheckResponse,
            status: CheckStatus.ERROR,
          })

          phoneCheckAPIClientCreateStub.restore()
          phoneCheckAPIClientCreateStub = sinon.stub(
            phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype,
            'create',
          )
          phoneCheckAPIClientCreateStub.resolves({
            ...createPhoneCheckResponse,
            status: CheckStatus.ERROR,
          })
        })
        .stdout()
        .command([command, phoneNumberToTest, '--debug'])
        .exit(1)
        .it(
          `${command} -- logs a ${typeOfCheck} that has status of ERROR`,
          (ctx) => {
            expect(ctx.stdout).to.contain(
              `The ${typeOfCheck} could not be created. The ${typeOfCheck} status is ERROR`,
            )
          },
        )
    })
  }

  function getConstructorApiClientSpy(clientName: string) {
    let constructorStub: any
    switch (clientName) {
      case 'SubscriberCheckAPIClient':
        constructorStub = sinon.spy(
          subscriberCheckAPIClientModules,
          'SubscriberCheckAPIClient',
        )
        break
      case 'PhoneChecksAPIClient':
        constructorStub = sinon.spy(
          phoneCheckAPIClientModules,
          'PhoneChecksAPIClient',
        )
        break
    }
    return constructorStub
  }

  function getApiClientStub(clientName: string): any {
    let apiClientStub: any
    switch (clientName) {
      case 'SubscriberCheckAPIClient':
        apiClientStub = subscriberCheckAPIClientCreateStub
        break
      case 'PhoneChecksAPIClient':
        apiClientStub = phoneCheckAPIClientCreateStub
        break
    }
    return apiClientStub
  }
})
