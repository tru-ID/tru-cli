import {test} from '@oclif/test'
import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import * as fs from 'fs-extra'
import * as inquirer from 'inquirer'

import * as projectsModule from '../../../src/api/ProjectsAPIClient'
import {ICreateProjectResponse} from '../../../src/api/ProjectsAPIClient'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import * as consoleLoggerModule from '../../../src/helpers/ConsoleLogger'
import CommandWithProjectConfig from '../../../src/helpers/CommandWithProjectConfig';

let projectsApiCreateStub:any = null

let expectedUserConfig:IGlobalConfiguration = {
  defaultWorkspaceClientId: 'my client id',
  defaultWorkspaceClientSecret: 'my client secret',
  defaultWorkspaceDataResidency: 'eu'
}

let expectedUserConfigWithOverride:IGlobalConfiguration = {
  ...expectedUserConfig,
  apiBaseUrlOverride: 'https://eu-dev.api-dev.4auth.io'
}

// Stubs
let existsSyncStub:any
let projectConfigFileCreationStub:any
let readJsonStub:any
let consoleLoggerConstructorStub:any
let consoleLoggerDebugStub:any

const newProjectName: string = 'My First Project'
const expectedProjectDirectoryName = 'my_first_project'
const expectedProjectFullPath = `${process.cwd()}/${expectedProjectDirectoryName}`
const expectedProjectConfigFileFullPath = `${expectedProjectFullPath}/4auth.json`

const createProjectAPIResponse: ICreateProjectResponse = {
  "project_id": "c69bc0e6-a429-11ea-bb37-0242ac130003",
  "name": newProjectName,
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
      "href": "https://eu.api.4auth.io/console/v1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003"
    }
  }
}

const expectedProjectConfigJson: any = {
  ... createProjectAPIResponse,
}
delete expectedProjectConfigJson._links

describe('Command: projects:create', () => {

  beforeEach(() => {
    existsSyncStub = sinon.default.stub(fs, 'existsSync').withArgs(sinon.default.match(new RegExp(/config.json/))).returns(true)

    readJsonStub = sinon.default.stub(fs, 'readJson')
    readJsonStub.resolves(expectedUserConfig)

    sinon.default.stub(inquirer, 'prompt').resolves({'projectName': newProjectName})
    
    projectsApiCreateStub = sinon.default.stub(projectsModule.ProjectsAPIClient.prototype, 'create')
    projectsApiCreateStub.withArgs({name: newProjectName}).resolves(createProjectAPIResponse)
  })
  
  afterEach(() => {
    sinon.default.restore()
  });

  test
  .do( () => {  
    existsSyncStub.withArgs(sinon.default.match(expectedProjectConfigFileFullPath)).returns(false)
    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.resolves()
  })
  .command(['projects:create'])
  .it('prompts for the name of a project', ctx => {
    expect(projectsApiCreateStub).to.have.been.calledWith({name: newProjectName})
  })

  test
  .do( () => {
    projectsApiCreateStub.withArgs({name: 'inline arg name'}).resolves(createProjectAPIResponse)
    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.resolves()
  })
  .command(['projects:create', 'inline arg name'])
  .it('uses the inline argument for the name project', ctx => {
    expect(projectsApiCreateStub).to.have.been.calledWith({name: 'inline arg name'})
  })

  let projectConstructorStub:any
  test
  .do( () => {
    existsSyncStub.withArgs(sinon.default.match(expectedProjectConfigFileFullPath)).returns(false)
    sinon.default.stub(fs, 'outputJson').resolves()

    projectConstructorStub = sinon.default.spy(projectsModule, 'ProjectsAPIClient')
  })
  .command(['projects:create', newProjectName])
  .it('should instantiate a Project API object with configuration based on global configuration', ctx => {
    expect(projectConstructorStub).to.have.been.calledWith(
      sinon.default.match.has('clientId', expectedUserConfig.defaultWorkspaceClientId).and(
        sinon.default.match.has('clientSecret', expectedUserConfig.defaultWorkspaceClientSecret)).and(
        sinon.default.match.has('baseUrl', `https://${expectedUserConfig.defaultWorkspaceDataResidency}.api.4auth.io`)),
      sinon.default.match.instanceOf(consoleLoggerModule.ConsoleLogger)
    )
  })

  test
  .do( () => {
    existsSyncStub.withArgs(sinon.default.match(expectedProjectConfigFileFullPath)).returns(false)
    sinon.default.stub(fs, 'outputJson').resolves()

    projectConstructorStub = sinon.default.spy(projectsModule, 'ProjectsAPIClient')
  })
  .command(['projects:create', newProjectName])
  .it('should instantiate a Project API object with configuration based on global configuration', ctx => {
    expect(projectConstructorStub).to.have.been.calledWith(
      sinon.default.match.has('clientId', expectedUserConfig.defaultWorkspaceClientId).and(
      sinon.default.match.has('clientSecret', expectedUserConfig.defaultWorkspaceClientSecret)).and(
      sinon.default.match.has('baseUrl', `https://${expectedUserConfig.defaultWorkspaceDataResidency}.api.4auth.io`))
    )
  })

  test
  .do( () => {
    existsSyncStub.withArgs(sinon.default.match(expectedProjectConfigFileFullPath)).returns(false)
    sinon.default.stub(fs, 'outputJson').resolves()

    projectConstructorStub = sinon.default.spy(projectsModule, 'ProjectsAPIClient')
  })
  .command(['projects:create', newProjectName])
  .it('should instantiate a Project API object with scopes of `projects`', ctx => {
    expect(projectConstructorStub).to.have.been.calledWith(
      sinon.default.match.has('scopes', 'projects')
    )
  })

  test
  .do( () => {
    existsSyncStub.withArgs(sinon.default.match(expectedProjectConfigFileFullPath)).returns(false)
    sinon.default.stub(fs, 'outputJson').resolves()

    // change default test behaviour for this specific test
    readJsonStub.restore() 
    readJsonStub = sinon.default.stub(fs, 'readJson')
    readJsonStub.resolves(expectedUserConfigWithOverride)

    projectConstructorStub = sinon.default.spy(projectsModule, 'ProjectsAPIClient')
  })
  .command(['projects:create', newProjectName])
  .it('should instantiate a Project API object with configuration based on global configuration with apiBaseUrlOverride', ctx => {
    expect(projectConstructorStub).to.have.been.calledWith(
      sinon.default.match.has('clientId', expectedUserConfigWithOverride.defaultWorkspaceClientId).and(
      sinon.default.match.has('clientSecret', expectedUserConfigWithOverride.defaultWorkspaceClientSecret)).and(
      sinon.default.match.has('baseUrl', `${expectedUserConfigWithOverride.apiBaseUrlOverride}`))
    )
  })

  test
  .do( () => {  
    projectsApiCreateStub.withArgs({name: 'Error Project'}).throws()
  })
  .stdout()
  .command(['projects:create', 'Error Project'])
  .exit(1)
  .it('provides user feedback if there is an error with the Projects API', ctx => {
    expect(ctx.stdout).to.contain('API Error')
  })

  test
  .do( () => {
    existsSyncStub.withArgs(sinon.default.match(expectedProjectConfigFileFullPath)).returns(true)
  })
  .command(['projects:create', newProjectName])
  .exit(1)
  .it('errors if the specific project directory already contains a 4auth.json file')

  test
  .do( () => {
    existsSyncStub.withArgs(sinon.default.match(expectedProjectConfigFileFullPath)).returns(false)
    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.throws()
  })
  .command(['projects:create', newProjectName])
  .exit(1)
  .it('errors if an exception occurs when creating the project directory')

  test
  .do( () => {
    existsSyncStub.withArgs(sinon.default.match(expectedProjectConfigFileFullPath)).returns(false)

    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.resolves()
  })
  .command(['projects:create', newProjectName])
  .it('creates a 4auth.json project configuration file with the Project resource contents', ctx => {
    expect(projectConfigFileCreationStub).to.have.been.calledWith(
      expectedProjectConfigFileFullPath,
      sinon.default.match(expectedProjectConfigJson)
    )
  })

  const customProjectDir = 'path/to/a/custom/dir'
  const customProjectConfigFilePath = `${customProjectDir}/4auth.json`
  test
  .do( () => {
    existsSyncStub.withArgs(sinon.default.match(customProjectConfigFilePath)).returns(false)

    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.resolves()
  })
  .command(['projects:create', newProjectName, `--${CommandWithProjectConfig.projectDirFlagName}=${customProjectDir}`])
  .it(`creates a 4auth.json project configuration file in the location specified by the ${CommandWithProjectConfig.projectDirFlagName} flag`, ctx => {
    expect(projectConfigFileCreationStub).to.have.been.calledWith(
      customProjectConfigFilePath,
      sinon.default.match(expectedProjectConfigJson)
    )
  })

  test
  .do( () => {
    existsSyncStub.withArgs(expectedProjectConfigFileFullPath).returns(false)

    projectsApiCreateStub.withArgs({name: createProjectAPIResponse.name}).resolves(createProjectAPIResponse)
    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.resolves()
  })
  .command(['projects:create', createProjectAPIResponse.name])
  .it('creates a 4auth.json project configuration file stripping the _links contents', ctx => {

    expect(projectConfigFileCreationStub).to.have.been.calledWith(
      expectedProjectConfigFileFullPath,
      sinon.default.match((value) => {
        return value._links === undefined
      })
      
    )
  })

  test
  .do( () => {
    existsSyncStub.withArgs(sinon.default.match(expectedProjectConfigFileFullPath)).returns(false)

    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.resolves()
  })
  .stdout()
  .command(['projects:create', newProjectName])
  .it('informs the user of successful creation of the project', ctx => {
    expect(ctx.stdout).to.contain(`Project configuration saved to "${expectedProjectConfigFileFullPath}".`)
  })

  test
  .do( () => {
    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.resolves()

    consoleLoggerConstructorStub = sinon.default.spy(consoleLoggerModule, 'ConsoleLogger')
  })
  .stdout()
  .command(['projects:create', newProjectName])
  .it('should set the ConsoleLogger to log at info level by default', ctx => {
    expect(consoleLoggerConstructorStub).to.have.been.calledWith(consoleLoggerModule.LogLevel.info)
  })

  test
  .do( () => {
    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.resolves()

    consoleLoggerConstructorStub = sinon.default.spy(consoleLoggerModule, 'ConsoleLogger')
  })
  .stdout()
  .command(['projects:create', newProjectName, `--debug`])
  .it('should set the ConsoleLogger level to debug when the debug flag is set', ctx => {
    expect(consoleLoggerConstructorStub).to.have.been.calledWith(consoleLoggerModule.LogLevel.debug)
  })

  test
  .do( () => {
    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.resolves()

    consoleLoggerDebugStub = sinon.default.stub(consoleLoggerModule.ConsoleLogger.prototype, 'debug')
  })
  .stdout()
  .command(['projects:create', newProjectName, `--debug`])
  .it('should log that debug is set when the --debug flag is passed', ctx => {
    expect(consoleLoggerDebugStub).to.have.been.calledWith('--debug', true)
  })

})
