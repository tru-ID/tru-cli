import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import path from 'path'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { CheckStatus } from '../../../src/api/CheckStatus'
import * as httpClientModule from '../../../src/api/HttpClient'
import * as simchecks from '../../../src/api/SimCheckAPIClient'
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

const createSimCheckResponse: simchecks.ICreateSimCheckResponse = {
  check_id: 'c69bc0e6-a429-11ea-bb37-0242ac130002',
  status: CheckStatus.COMPLETED,
  charge_amount: 1,
  charge_currency: 'API',
  created_at: '2020-06-01T16:43:30+00:00',
  no_sim_change: false,
  _links: {
    self: {
      href: 'https://us.api.tru.id/sim_check/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002',
    },
  },
  snapshot_balance: 100,
}

const command = 'simchecks:create'
const typeOfCheck = 'SIMCheck'
const clientName = 'SimCheckApiClient'
const scope = 'sim_check'

let existsSyncStub: any
let readJsonStub: any
let inquirerStub: any
let httpClientPostStub: any

describe('SIMCheck Create Scenarios', () => {
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

    // SimCheckClient

    httpClientPostStub = sinon.stub(
      httpClientModule.HttpClient.prototype,
      'post',
    )
    httpClientPostStub
      .withArgs('/sim_check/v0.1/checks', sinon.match.any, sinon.match.any)
      .resolves(createSimCheckResponse)

    sinon.stub(httpClientModule.HttpClient.prototype, 'get')
  })

  afterEach(() => {
    sinon.restore()
  })

  {
    const customProjectConfigDirPath = path.join('alternative', 'path', 'to')
    const customProjectConfigFullPath = path.join(
      'alternative',
      'path',
      'to',
      'tru.json',
    )
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
  }

  test
    .command([command, phoneNumberToTest])
    .it(`${command} -- project configuration is read`, () => {
      expect(readJsonStub).to.have.been.calledWith(projectConfigFileLocation)
    })

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

  {
    let constructorStub: any

    test
      .do(() => {
        constructorStub = sinon.spy(simchecks, 'SimCheckAPIClient')
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
  }

  {
    let constructorStub: any
    test
      .do(() => {
        constructorStub = sinon.spy(simchecks, 'SimCheckAPIClient')
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
  }

  {
    let constructorStub: any

    test
      .do(() => {
        constructorStub = sinon.spy(simchecks, 'SimCheckAPIClient')
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
  }

  {
    let constructorStub: any

    test
      .do(() => {
        constructorStub = sinon.spy(simchecks, 'SimCheckAPIClient')
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
  }

  {
    let apiClientStub: any
    test
      .do(() => {
        apiClientStub = httpClientPostStub
      })
      .command([command, phoneNumberToTest, '--debug'])
      .it(
        `${command} -- calls the ${clientName} with the supplied phone number`,
        () => {
          expect(apiClientStub).to.have.been.calledWith(
            '/sim_check/v0.1/checks',
            { phone_number: phoneNumberToTest },
            sinon.match.any,
          )
        },
      )
  }

  test
    .stdout()
    .command([command, phoneNumberToTest, '--debug'])
    .it(`${command} --logs a successfully created ${typeOfCheck}`, (ctx) => {
      expect(ctx.stdout).to.contain(`status: COMPLETED`)
      expect(ctx.stdout).to.contain(`no_sim_change: false`)
    })

  test
    .do(() => {
      httpClientPostStub
        .withArgs('/sim_check/v0.1/checks', sinon.match.any, sinon.match.any)
        .resolves({
          ...createSimCheckResponse,
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
