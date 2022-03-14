import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import path from 'path'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { CheckStatus } from '../../../src/api/CheckStatus'
import * as simchecks from '../../../src/api/SimCheckAPIClient'
import CommandWithProjectConfig from '../../../src/helpers/CommandWithProjectConfig'
import {
  accessToken,
  globalConfig,
  projectConfig,
  projectConfigFileLocation,
} from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

const phoneNumberToTest = '447700900000'

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

let existsSyncStub: any
let inquirerStub: any
let readJsonStub: any

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
      .nock('https://eu.api.tru.id', (api) =>
        api
          .persist()
          .post(new RegExp('/oauth2/v1/token*'))
          .reply(200, accessToken)
          .post('/sim_check/v0.1/checks', { phone_number: phoneNumberToTest })
          .reply(200, createSimCheckResponse),
      )
      .do(() => {
        readJsonStub
          .withArgs(sinon.match(customProjectConfigFullPath))
          .resolves(projectConfig)
      })
      .stdout()
      .command([
        'simchecks:create',
        phoneNumberToTest,
        `--${CommandWithProjectConfig.projectDirFlagName}=${customProjectConfigDirPath}`,
      ])
      .it(
        `'simchecks:create' -- should load the project configuration from the location specified by the ${CommandWithProjectConfig.projectDirFlagName} flag`,
        (ctx) => {
          expect(readJsonStub).to.have.been.calledWith(
            customProjectConfigFullPath,
          )
          expect(ctx.stdout).to.contain(`status: COMPLETED`)
          expect(ctx.stdout).to.contain(`no_sim_change: false`)
        },
      )
  }

  test
    .nock('https://eu.api.tru.id', (api) =>
      api
        .persist()
        .post(new RegExp('/oauth2/v1/token*'))
        .reply(200, accessToken)
        .post('/sim_check/v0.1/checks', { phone_number: phoneNumberToTest })
        .reply(200, createSimCheckResponse),
    )
    .do(() => {
      inquirerStub.resolves({ phone_number: phoneNumberToTest })
    })
    .stdout()
    .command(['simchecks:create'])
    .it(
      `'simchecks:create' -- prompts the user for a SIMCheck to check when an inline argument is not provided`,
      (ctx) => {
        expect(readJsonStub).to.have.been.calledWith(projectConfigFileLocation)
        expect(inquirerStub).to.have.been.calledWith([
          {
            name: 'phone_number',
            message: `Please enter the phone number you would like to SIMCheck`,
            type: 'input',
            filter: sinon.match.func,
            validate: sinon.match.func,
          },
        ])
        expect(ctx.stdout).to.contain(`status: COMPLETED`)
        expect(ctx.stdout).to.contain(`no_sim_change: false`)
      },
    )

  test
    .nock('https://eu.api.tru.id', (api) =>
      api
        .persist()
        .post(new RegExp('/oauth2/v1/token*'))
        .reply(200, accessToken)
        .post('/sim_check/v0.1/checks', { phone_number: phoneNumberToTest })
        .reply(200, {
          ...createSimCheckResponse,
          status: CheckStatus.ERROR,
        }),
    )
    .stdout()
    .command(['simchecks:create', phoneNumberToTest, '--debug'])
    .exit(1)
    .it(
      `'simchecks:create' -- logs a SIMCheck that has status of ERROR`,
      (ctx) => {
        expect(ctx.stdout).to.contain(
          `The SIMCheck could not be created. The SIMCheck status is ERROR`,
        )
      },
    )
})
