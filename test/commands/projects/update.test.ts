import {test} from '@oclif/test'
import * as path from 'path';
import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import * as fs from 'fs-extra'

import * as projectsModule from '../../../src/api/ProjectsAPIClient'
import {ICreateProjectResponse} from '../../../src/api/ProjectsAPIClient'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import * as consoleLoggerModule from '../../../src/helpers/ConsoleLogger'

let projectsApiUpdateStub:any = null

let expectedUserConfig:IGlobalConfiguration = {
  defaultWorkspaceClientId: 'my client id',
  defaultWorkspaceClientSecret: 'my client secret',
  defaultWorkspaceDataResidency: 'eu'
}

// Stubs
let existsSyncStub:any
let readJsonStub:any
let consoleLoggerInfoStub:any
let consoleLoggerWarnStub:any
let consoleLoggerErrorStub:any

const workingDirectoryProjectConfigPath = path.join(process.cwd(),'tru.json')

const createProjectAPIResponse: ICreateProjectResponse = {
  "project_id": "c69bc0e6-a429-11ea-bb37-0242ac130003",
  "name": "my project",
  "mode": "live",
  "created_at": "2020-06-01T16:43:30+00:00",
  "updated_at": "2020-06-01T16:43:30+00:00",
  "credentials": [
    {
      "client_id": "6779ef20e75817b79602",
      "client_secret": "dzi1v4osLNr5vv0.2mnvcKM37.",
      "created_at": "2020-06-01T16:43:30+00:00"
    }
  ],
  "_links": {
    "self": {
      "href": "https://eu.api.tru.id/console/v1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003"
    }
  }
}

const expectedProjectConfigJson: any = {
  ... createProjectAPIResponse,
}
delete expectedProjectConfigJson._links

describe('Command: projects:update', () => {

  beforeEach(() => {
    existsSyncStub = sinon.default.stub(fs, 'existsSync')
    existsSyncStub.withArgs( sinon.default.match( new RegExp(/config.json/)) ).returns(true)

    readJsonStub = sinon.default.stub(fs, 'readJson')
    readJsonStub.withArgs( sinon.default.match( new RegExp(/config.json/)) ).resolves(expectedUserConfig)

    projectsApiUpdateStub = sinon.default.stub(projectsModule.ProjectsAPIClient.prototype, 'update')
  })

  afterEach(() => {
    sinon.default.restore()
  });

  test
  .do( () => {
    existsSyncStub.withArgs(workingDirectoryProjectConfigPath).returns(false)
    consoleLoggerErrorStub = sinon.default.stub(consoleLoggerModule.ConsoleLogger.prototype, 'error')
  })
  .command(['projects:update'])
  .exit(1)
  .it('should exit if no project ID arg has been passed and there is no local project configuration')

  test
  .do( () => {
    existsSyncStub.withArgs(workingDirectoryProjectConfigPath).returns(true)
    readJsonStub.withArgs(workingDirectoryProjectConfigPath).resolves(expectedProjectConfigJson)
    consoleLoggerErrorStub = sinon.default.stub(consoleLoggerModule.ConsoleLogger.prototype, 'error')
  })
  .command(['projects:update', '--phonecheck-callback', `https://example.com/callback`])
  .it('should load local project configuration if no project ID arg is provided', () => {
    expect(existsSyncStub).to.have.been.calledWith(workingDirectoryProjectConfigPath)
  })

  test
  .do( () => {
    existsSyncStub.withArgs(workingDirectoryProjectConfigPath).returns(true)
    readJsonStub.withArgs(workingDirectoryProjectConfigPath).resolves(expectedProjectConfigJson)
    consoleLoggerErrorStub = sinon.default.stub(consoleLoggerModule.ConsoleLogger.prototype, 'error')
  })
  .command(['projects:update', '--phonecheck-callback', `https://example.com/callback`])
  .it('YYY should use project ID from local project configuration if no project ID arg is provided', () => {
    expect(projectsApiUpdateStub).to.have.been.calledWith(createProjectAPIResponse.project_id, sinon.default.match.any)
  })

  test
  .do( () => {
    existsSyncStub.withArgs(workingDirectoryProjectConfigPath).returns(true)
    readJsonStub.withArgs(workingDirectoryProjectConfigPath).resolves(expectedProjectConfigJson)
    consoleLoggerErrorStub = sinon.default.stub(consoleLoggerModule.ConsoleLogger.prototype, 'error')
  })
  .command(['projects:update', 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'])
  .exit(1)
  .it('shows error message if local config is loaded but no update flags are provided', ctx => {
    expect(consoleLoggerErrorStub).to.have.been.calledWith('At least one flag must be supplied to indicate the update to be applied to the Project')
  })

  test
  .do( () => {
    consoleLoggerErrorStub = sinon.default.stub(consoleLoggerModule.ConsoleLogger.prototype, 'error')
  })
  .command(['projects:update', 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'])
  .exit(1)
  .it('shows error message if no update flags are provided', ctx => {
    expect(consoleLoggerErrorStub).to.have.been.calledWith('At least one flag must be supplied to indicate the update to be applied to the Project')
  })

  test
  .do( () => {
    consoleLoggerErrorStub = sinon.default.stub(console, 'log')
  })
  .command(['projects:update', 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'])
  .exit(1)
  .it('shows help message if no update flags are provided', ctx => {
    expect(consoleLoggerErrorStub).to.have.been.calledWith(sinon.default.match('show CLI help'))
  })

  test
  .do( () => {
    consoleLoggerErrorStub = sinon.default.stub(consoleLoggerModule.ConsoleLogger.prototype, 'error')
  })
  .command(['projects:update', createProjectAPIResponse.project_id, '--phonecheck-callback', `i am not a url`])
  .exit(1)
  .it('should show an error message if an invalid URL is supplied for the --phonecheck-callback flag', () => {
    expect(consoleLoggerErrorStub).to.have.been.calledWith('"phonecheck-callback" must be a valid URL')
  })

  test
  .do( () => {
    consoleLoggerErrorStub = sinon.default.stub(consoleLoggerModule.ConsoleLogger.prototype, 'error')
  })
  .command(['projects:update', createProjectAPIResponse.project_id, '--phonecheck-callback', ``])
  .exit(1)
  .it('should show an error message if an empty string is supplied for the --phonecheck-callback flag', () => {
    expect(consoleLoggerErrorStub).to.have.been.calledWith('"phonecheck-callback" must be a valid URL')
  })

  test
  .do( () => {
    consoleLoggerWarnStub = sinon.default.stub(consoleLoggerModule.ConsoleLogger.prototype, 'warn')

    projectsApiUpdateStub.resolves()
  })
  .command(['projects:update', createProjectAPIResponse.project_id, '--phonecheck-callback', `http://example.com/callback`])
  .it('should log a warning if the URL provided is HTTP and not HTTPS', ctx => {
    expect(consoleLoggerWarnStub).to.have.been.calledWith('"phonecheck-callback" was detected to be HTTP. Please consider updated to be HTTPS.')
  })

  test
  .do( () => {
    projectsApiUpdateStub.resolves(createProjectAPIResponse)
  })
  .command(['projects:update', createProjectAPIResponse.project_id, '--phonecheck-callback', 'https://example.com/callback'])
  .it('should call the API client `update` is called to update existing project', ctx => {
    expect(projectsApiUpdateStub).to.have.been.calledWith(createProjectAPIResponse.project_id, {
      configuration: {
        phone_check: {
          callback_url: 'https://example.com/callback'
        }
      }
    })
  })

  test
  .do( () => {
    projectsApiUpdateStub.resolves(createProjectAPIResponse)

    consoleLoggerInfoStub = sinon.default.stub(consoleLoggerModule.ConsoleLogger.prototype, 'info')
  })
  .command(['projects:update', createProjectAPIResponse.project_id, '--phonecheck-callback', 'https://example.com/callback'])
  .it('should inform the user that the update was successful', ctx => {
    expect(consoleLoggerInfoStub).to.have.been.calledWith('✅ Project updated')
  })

  test
  .do( () => {
    projectsApiUpdateStub.resolves(createProjectAPIResponse)
  })
  .command(['projects:update', createProjectAPIResponse.project_id, '--phonecheck-callback', 'https://example.com/callback', '--remove-phonecheck-callback'])
  .exit(2)
  .it('should error if --phonecheck-callback and --remove-phonecheck-callback are used together')

  test
  .do( () => {
    projectsApiUpdateStub.resolves(createProjectAPIResponse)
  })
  .command(['projects:update', createProjectAPIResponse.project_id, '--remove-phonecheck-callback'])
  .it('should call the API client with the callback_url removed', ctx => {
    expect(projectsApiUpdateStub).to.have.been.calledWith(createProjectAPIResponse.project_id, {
      configuration: {
        phone_check: {}
      }
    })
  })

  test
  .do( () => {
  })
  .command(['projects:update', createProjectAPIResponse.project_id, '--mode', `cheese`])
  .exit(2)
  .it('should exit if an invalid --mode value is supplied')

  test
  .do( () => {
    projectsApiUpdateStub.resolves(createProjectAPIResponse)
  })
  .command(['projects:update', createProjectAPIResponse.project_id, '--mode', 'sandbox'])
  .it('should call the API client with mode of sandbox', ctx => {
    expect(projectsApiUpdateStub).to.have.been.calledWith(createProjectAPIResponse.project_id, {
      mode: 'sandbox'
    })
  })


  test
  .do( () => {
    projectsApiUpdateStub.resolves(createProjectAPIResponse)
  })
  .command(['projects:update', createProjectAPIResponse.project_id, '--mode', 'live'])
  .it('should call the API client with mode of live', ctx => {
    expect(projectsApiUpdateStub).to.have.been.calledWith(createProjectAPIResponse.project_id, {
      mode: 'live'
    })
  })

})
