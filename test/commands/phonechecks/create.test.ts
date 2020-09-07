import {test} from '@oclif/test'
import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import * as fs from 'fs-extra'
import * as inquirer from 'inquirer'
import * as qrcode from 'qrcode-terminal'

import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import * as phoneCheckAPIClientModules from '../../../src/api/PhoneChecksAPIClient'
import {IProjectConfiguration} from '../../../src/IProjectConfiguration'
import * as consoleLoggerModule from '../../../src/helpers/ConsoleLogger'
import CommandWithProjectConfig from '../../../src/helpers/CommandWithProjectConfig'

let globalConfig:IGlobalConfiguration = {
  defaultWorkspaceClientId: 'my client id',
  defaultWorkspaceClientSecret: 'my client secret',
  defaultWorkspaceDataResidency: 'eu',
  phoneCheckWorkflowRetryMillisecondsOverride: 500 // override to speed up tests
}

const overrideQrCodeHandlerConfig = {
  ...globalConfig,
  qrCodeUrlHandlerOverride: 'http://example.com/thing/blah?x={CHECK_URL}'
}

let createPhoneCheckResponse:phoneCheckAPIClientModules.ICreatePhoneCheckResponse = {
    check_id: "c69bc0e6-a429-11ea-bb37-0242ac130002",
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

let phoneCheckMatchedResource:phoneCheckAPIClientModules.IPhoneCheckResource = {
  check_id: "c69bc0e6-a429-11ea-bb37-0242ac130002",
  status: phoneCheckAPIClientModules.PhoneCheckStatus.COMPLETED,
  match: true,
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
  }
}

let phoneCheckExpiredResource:phoneCheckAPIClientModules.IPhoneCheckResource = {
  check_id: "c69bc0e6-a429-11ea-bb37-0242ac130002",
  status: phoneCheckAPIClientModules.PhoneCheckStatus.EXPIRED,
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
  }
}

let phoneCheckPendingResource:phoneCheckAPIClientModules.IPhoneCheckResource = {
  check_id: "c69bc0e6-a429-11ea-bb37-0242ac130002",
  status: phoneCheckAPIClientModules.PhoneCheckStatus.PENDING,
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
  }
}

let existsSyncStub:any
let readJsonStub:any
let inquirerStub:any
let phoneCheckAPIClientCreateStub:any
let phoneCheckAPIClientGetStub:any
let qrCodeGenerateSpy:any

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
        .resolves(globalConfig)

    readJsonStub.withArgs(
      sinon.default.match(projectConfigFileLocation))
        .resolves(projectConfig)

    inquirerStub = sinon.default.stub(inquirer, 'prompt')
    
    // PhoneCheckClient
    phoneCheckAPIClientCreateStub = sinon.default.stub(phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype, 'create')
    phoneCheckAPIClientCreateStub.resolves(createPhoneCheckResponse)

    phoneCheckAPIClientGetStub = sinon.default.stub(phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype, 'get')

    // QR Code
    qrCodeGenerateSpy = sinon.default.spy(qrcode, 'generate')
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
    expect(ctx.stdout).to.contain(`A project configuration file does not exist at "${projectConfigFileLocation}"`)
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
        type: 'input',
        filter: sinon.default.match.func,
        validate: sinon.default.match.func
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
      sinon.default.match.has('baseUrl', `https://${globalConfig.defaultWorkspaceDataResidency}.api.4auth.io`),
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

  describe('phonechecks:create --workflow', () => {

    test
    .do( () => {
      phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource)
    })
    .command(['phonechecks:create', phoneNumberToTest, '--workflow'])
    .it('creates a QR code', () => {
      expect(qrCodeGenerateSpy).to.have.been.called
    })

    test
    .do( () => {
      phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource)
    })
    .command(['phonechecks:create', phoneNumberToTest, '--workflow'])
    .it('creates a QR code with expected URL', () => {
      expect(qrCodeGenerateSpy).to.have.been.calledWith(`http://r.4auth.io?u=${encodeURIComponent(createPhoneCheckResponse._links.check_url.href)}`, sinon.default.match.any)
    })
    
    test
    .do( () => {
      readJsonStub.restore()
      readJsonStub = sinon.default.stub(fs, 'readJson')
    
      readJsonStub.withArgs(
        sinon.default.match(sinon.default.match(new RegExp(/config.json/))))
        .resolves(overrideQrCodeHandlerConfig)
      
      readJsonStub.withArgs(
        sinon.default.match(projectConfigFileLocation))
        .resolves(projectConfig)
        
        phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource)
    })
    .command(['phonechecks:create', phoneNumberToTest, '--workflow'])
    .it('creates a QR code with expected URL override', () => {
      const expectedUrl = overrideQrCodeHandlerConfig.qrCodeUrlHandlerOverride.replace('{CHECK_URL}', `${encodeURIComponent(createPhoneCheckResponse._links.check_url.href)}`)
      expect(qrCodeGenerateSpy).to.have.been.calledWith(expectedUrl, sinon.default.match.any)
    })
        
    test
    .do( () => {
      phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource)
    })
    .command(['phonechecks:create', phoneNumberToTest, '--workflow', '--skip-qrcode-handler'])
    .it('creates a QR code with expected URL skipping r.4auth.io', () => {
      expect(qrCodeGenerateSpy).to.have.been.calledWith(createPhoneCheckResponse._links.check_url.href, sinon.default.match.any)
    })
        
    test
    .do( () => {
      phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource)
    })
    .command(['phonechecks:create', phoneNumberToTest, '--workflow'])
    .it('checks the status of the PhoneCheck', () => {
      expect(phoneCheckAPIClientGetStub).to.have.been.calledWith(createPhoneCheckResponse.check_id)
    })

    test
    .do( () => {
      phoneCheckAPIClientGetStub.resolves(phoneCheckMatchedResource)
    })
    .stdout()
    .command(['phonechecks:create', phoneNumberToTest, '--workflow'])
    .it('completed status and match result are logged', (ctx) => {
      expect(ctx.stdout).to.contain(`match:\ttrue`)
      expect(ctx.stdout).to.contain(`status:\tCOMPLETED`)
    })

    test
    .do( () => {
      phoneCheckAPIClientGetStub.onCall(0).resolves(phoneCheckPendingResource)
      phoneCheckAPIClientGetStub.onCall(1).resolves(phoneCheckMatchedResource)
    })
    .command(['phonechecks:create', phoneNumberToTest, '--workflow'])
    .it('checks the status of the PhoneCheck again if the first check status is not a final state', () => {
      expect(phoneCheckAPIClientGetStub).to.have.been.calledTwice
    })

    test
    .do( () => {
      phoneCheckAPIClientGetStub.resolves(phoneCheckExpiredResource)
    })
    .stdout()
    .command(['phonechecks:create', phoneNumberToTest, '--workflow'])
    .it('exits if the phone check expires', (ctx) => {
      expect(ctx.stdout).to.contain(`status:\tEXPIRED`)
    })

  })

})
