import {test} from '@oclif/test'
import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import * as fs from 'fs-extra'
import * as inquirer from 'inquirer'

import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import * as phoneCheckAPIClientModules from '../../../src/api/PhoneChecksAPIClient'
import {IProjectConfiguration} from '../../../src/IProjectConfiguration'
import * as consoleLoggerModule from '../../../src/helpers/ConsoleLogger'
import CommandWithProjectConfig from '../../../src/helpers/CommandWithProjectConfig'

let expectedUserConfig:IGlobalConfiguration = {
  defaultWorkspaceClientId: 'my client id',
  defaultWorkspaceClientSecret: 'my client secret',
  defaultWorkspaceDataResidency: 'eu'
}

let createPhoneCheckResponse:phoneCheckAPIClientModules.ICreatePhoneCheckResponse = {
    check_id: "c69bc0e6-a429-11ea-bb37-0242ac130002",
    check_url: "https://example.com/check_url",
    status: phoneCheckAPIClientModules.PhoneCheckStatus.ACCEPTED,
    match: false,
    charge_amount: 1,
    charge_currency: "API",
    created_at: "2020-06-01T16:43:30+00:00",
    ttl: 60,
    _links: {
      self: {
        href: "https://us.api.4auth.io/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002"
      },
      check_url: {
        href: "https://us.api.4auth.io/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002/redirect"
      }
    },
    snapshot_balance: 100
}

let existsSyncStub:any
let readJsonStub:any
let inquirerStub:any
let phoneCheckAPIClientCreateStub:any

const phoneNumberToTest = '447700900000'
const projectConfigFileLocation = `${process.cwd()}/4auth.json`
const projectConfig:IProjectConfiguration = {
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

describe('phonechecks:create', () => {

  beforeEach(() => {
    existsSyncStub = sinon.default.stub(fs, 'existsSync')
    existsSyncStub.withArgs(sinon.default.match(new RegExp(/config.json/))).returns(true)
    
    readJsonStub = sinon.default.stub(fs, 'readJson')

    readJsonStub.withArgs(
      sinon.default.match(sinon.default.match(new RegExp(/config.json/))))
        .resolves(expectedUserConfig)

    readJsonStub.withArgs(
      sinon.default.match(projectConfigFileLocation))
        .resolves(projectConfig)

    inquirerStub = sinon.default.stub(inquirer, 'prompt')
    
    phoneCheckAPIClientCreateStub = sinon.default.stub(phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype, 'create')
    phoneCheckAPIClientCreateStub.resolves(createPhoneCheckResponse)
  })

  afterEach(() => {
    sinon.default.restore()
  })

  test
  .do(() => {
    existsSyncStub.withArgs(projectConfigFileLocation).returns(false)
  })
  .stdout()
  .command(['phonechecks:create', phoneNumberToTest])
  .exit(1)
  .it('an error is logged when the process.cwd() project configuration is not present', ctx => {
    expect(ctx.stdout).to.contain(`A project configuration files does not exist at "${projectConfigFileLocation}"`)
  })

  let customProjectConfigDirPath = 'alternative/path/to/'
  let customProjectConfigFullPath = 'alternative/path/to/4auth.json'
  test
  .do(() => {
    readJsonStub.withArgs(
      sinon.default.match(customProjectConfigFullPath))
        .resolves(projectConfig)
  })
  .stdout()
  .command(['phonechecks:create', phoneNumberToTest, `--${CommandWithProjectConfig.projectDirFlagName}=${customProjectConfigDirPath}`])
  .it(`should load the project configuration from the location specified by the ${CommandWithProjectConfig.projectDirFlagName} flag`, ctx => {
    expect(readJsonStub).to.have.been.calledWith(customProjectConfigFullPath)
  })
  test
  .command(['phonechecks:create', phoneNumberToTest])
  .it('project configuration is read', ctx => {
    expect(readJsonStub).to.have.been.calledWith(projectConfigFileLocation)
  })

  test
  .do(() => {
    inquirerStub.resolves({'phone_number': phoneNumberToTest})
  })
  .command(['phonechecks:create'])
  .it('prompts the user for a phone number to check when an inline argument is not provided', ctx => {
    expect(inquirerStub).to.have.been.calledWith([
      {
        name: 'phone_number',
        message: 'Please enter the phone number you would like to Phone Check',
        type: 'input'
      }
    ])
  })

  let phoneChecksApiClientConstructorStub:any
  test
  .do( () => {
    phoneChecksApiClientConstructorStub = sinon.default.spy(phoneCheckAPIClientModules, 'PhoneChecksAPIClient')
  })
  .command(['phonechecks:create', phoneNumberToTest])
  .it('should instantiate a PhoneChecksAPIClient object with project configuration', ctx => {
    expect(phoneChecksApiClientConstructorStub).to.have.been.calledWith(
        sinon.default.match.has('clientId', projectConfig.credentials[0].client_id).and(
          sinon.default.match.has('clientSecret', projectConfig.credentials[0].client_secret)),
        sinon.default.match.any
    )
  })

  test
  .do( () => {
    phoneChecksApiClientConstructorStub = sinon.default.spy(phoneCheckAPIClientModules, 'PhoneChecksAPIClient')
  })
  .command(['phonechecks:create', phoneNumberToTest])
  .it('should instantiate a PhoneChecksAPIClient object with `projects` scopes', ctx => {
    expect(phoneChecksApiClientConstructorStub).to.have.been.calledWith(
      sinon.default.match.has('scopes', 'phone_check'),
      sinon.default.match.any
    )
  })

  test
  .do( () => {
    phoneChecksApiClientConstructorStub = sinon.default.spy(phoneCheckAPIClientModules, 'PhoneChecksAPIClient')
  })
  .command(['phonechecks:create', phoneNumberToTest])
  .it('should instantiate a PhoneChecksAPIClient object with global baseUrl configuration', ctx => {
    expect(phoneChecksApiClientConstructorStub).to.have.been.calledWith(
      sinon.default.match.has('baseUrl', `https://${expectedUserConfig.defaultWorkspaceDataResidency}.api.4auth.io`),
      sinon.default.match.any
    )
  })

  test
  .do( () => {
    phoneChecksApiClientConstructorStub = sinon.default.spy(phoneCheckAPIClientModules, 'PhoneChecksAPIClient')
  })
  .command(['phonechecks:create', phoneNumberToTest])
  .it('should instantiate a PhoneChecksAPIClient object with a logger', ctx => {
    expect(phoneChecksApiClientConstructorStub).to.have.been.calledWith(
      sinon.default.match.any,
      sinon.default.match.instanceOf(consoleLoggerModule.ConsoleLogger)
    )
  })

  test
  .command(['phonechecks:create', phoneNumberToTest, '--debug'])
  .it('calls the PhoneCheckAPIClient with the supplied phone number', ctx => {
    expect(phoneCheckAPIClientCreateStub).to.have.been.calledWith({phone_number:phoneNumberToTest})
  })

  test
  .stdout()
  .command(['phonechecks:create', phoneNumberToTest, '--debug'])
  .it('logs a successfully created Phone Check', ctx => {
    expect(ctx.stdout).to.contain('Phone Check ACCEPTED')
  })

  test
  .do(() => {
    phoneCheckAPIClientCreateStub.restore()
    phoneCheckAPIClientCreateStub = sinon.default.stub(phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype, 'create')
    phoneCheckAPIClientCreateStub.resolves({
      ...createPhoneCheckResponse,
      status: phoneCheckAPIClientModules.PhoneCheckStatus.ERROR
    })
  })
  .stdout()
  .command(['phonechecks:create', phoneNumberToTest, '--debug'])
  .exit(1)
  .it('logs a Phone Check that has status of ERROR', ctx => {
    expect(ctx.stdout).to.contain('The Phone Check could not be created. The Phone Check status is ERROR')
  })

})
