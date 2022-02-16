import { test } from '@oclif/test'
import createError from 'axios/lib/core/createError'
import chai from 'chai'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import * as projectsModule from '../../../src/api/ProjectsAPIClient'
import { IProjectResource } from '../../../src/api/ProjectsAPIClient'
import PhoneChecksCreate from '../../../src/commands/phonechecks/create'
import CommandWithProjectConfig from '../../../src/helpers/CommandWithProjectConfig'
import * as consoleLoggerModule from '../../../src/helpers/ConsoleLogger'
import { phoneCheckCallbackUrlFlag } from '../../../src/helpers/ProjectFlags'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'

const expect = chai.expect
chai.use(sinonChai)

let projectsApiCreateStub: any = null

const expectedUserConfig: IGlobalConfiguration = {
  defaultWorkspaceClientId: 'my client id',
  defaultWorkspaceClientSecret: 'my client secret',
  defaultWorkspaceDataResidency: 'eu',
}

const expectedUserConfigWithOverride: IGlobalConfiguration = {
  ...expectedUserConfig,
  apiBaseUrlOverride: 'https://eu-dev.api-dev.tru.id',
}

// Stubs
let existsSyncStub: any
let projectConfigFileCreationStub: any
let readJsonStub: any
let consoleLoggerConstructorStub: any
let consoleLoggerDebugStub: any
let consoleLoggerWarnStub: any
let consoleLoggerErrorStub: any
let phoneCheckCreateRunStub: any

const newProjectName = 'My First Project'
const expectedProjectDirectoryName = 'my_first_project'
const expectedProjectFullPath = `${process.cwd()}/${expectedProjectDirectoryName}`
const expectedProjectConfigFileFullPath = `${expectedProjectFullPath}/tru.json`

const createProjectAPIResponse: IProjectResource = {
  project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
  name: newProjectName,
  mode: 'live',
  created_at: '2020-06-01T16:43:30+00:00',
  updated_at: '2020-06-01T16:43:30+00:00',
  credentials: [
    {
      client_id: '6779ef20e75817b79602',
      client_secret: 'dzi1v4osLNr5vv0.2mnvcKM37.',
      created_at: '2020-06-01T16:43:30+00:00',
    },
  ],
  _links: {
    self: {
      href: 'https://eu.api.tru.id/console/v1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003',
    },
  },
}

const expectedProjectConfigJson: any = {
  ...createProjectAPIResponse,
}
delete expectedProjectConfigJson._links

describe('Command: projects:create', () => {
  beforeEach(() => {
    existsSyncStub = sinon
      .stub(fs, 'existsSync')
      .withArgs(sinon.match(new RegExp(/config.json/)))
      .returns(true)

    readJsonStub = sinon.stub(fs, 'readJson')
    readJsonStub.resolves(expectedUserConfig)

    sinon.stub(inquirer, 'prompt').resolves({ projectName: newProjectName })

    projectsApiCreateStub = sinon.stub(
      projectsModule.ProjectsAPIClient.prototype,
      'create',
    )
    projectsApiCreateStub
      .withArgs({ name: newProjectName })
      .resolves(createProjectAPIResponse)

    phoneCheckCreateRunStub = sinon.stub(PhoneChecksCreate, 'run')
  })

  afterEach(() => {
    sinon.restore()
  })

  test
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(expectedProjectConfigFileFullPath))
        .returns(false)
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()
    })
    .command(['projects:create'])
    .it('prompts for the name of a project', () => {
      expect(projectsApiCreateStub).to.have.been.calledWith({
        name: newProjectName,
      })
    })

  test
    .do(() => {
      projectsApiCreateStub
        .withArgs({ name: 'inline arg name' })
        .resolves(createProjectAPIResponse)
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()
    })
    .command(['projects:create', 'inline arg name'])
    .it('uses the inline argument for the name project', () => {
      expect(projectsApiCreateStub).to.have.been.calledWith({
        name: 'inline arg name',
      })
    })

  let projectConstructorStub: any
  test
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(expectedProjectConfigFileFullPath))
        .returns(false)
      sinon.stub(fs, 'outputJson').resolves()

      projectConstructorStub = sinon.spy(projectsModule, 'ProjectsAPIClient')
    })
    .command(['projects:create', newProjectName])
    .it(
      'should instantiate a Project API object with configuration based on global configuration',
      () => {
        expect(projectConstructorStub).to.have.been.calledWith(
          sinon.match
            .has('clientId', expectedUserConfig.defaultWorkspaceClientId)
            .and(
              sinon.match.has(
                'clientSecret',
                expectedUserConfig.defaultWorkspaceClientSecret,
              ),
            )
            .and(
              sinon.match.has(
                'baseUrl',
                `https://${expectedUserConfig.defaultWorkspaceDataResidency}.api.tru.id`,
              ),
            ),
          sinon.match.instanceOf(consoleLoggerModule.ConsoleLogger),
        )
      },
    )

  test
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(expectedProjectConfigFileFullPath))
        .returns(false)
      sinon.stub(fs, 'outputJson').resolves()

      projectConstructorStub = sinon.spy(projectsModule, 'ProjectsAPIClient')
    })
    .command(['projects:create', newProjectName])
    .it(
      'should instantiate a Project API object with configuration based on global configuration',
      () => {
        expect(projectConstructorStub).to.have.been.calledWith(
          sinon.match
            .has('clientId', expectedUserConfig.defaultWorkspaceClientId)
            .and(
              sinon.match.has(
                'clientSecret',
                expectedUserConfig.defaultWorkspaceClientSecret,
              ),
            )
            .and(
              sinon.match.has(
                'baseUrl',
                `https://${expectedUserConfig.defaultWorkspaceDataResidency}.api.tru.id`,
              ),
            ),
        )
      },
    )

  test
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(expectedProjectConfigFileFullPath))
        .returns(false)
      sinon.stub(fs, 'outputJson').resolves()

      projectConstructorStub = sinon.spy(projectsModule, 'ProjectsAPIClient')
    })
    .command(['projects:create', newProjectName])
    .it(
      'should instantiate a Project API object with scopes of `projects`',
      () => {
        expect(projectConstructorStub).to.have.been.calledWith(
          sinon.match.has('scopes', 'projects'),
        )
      },
    )

  test
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(expectedProjectConfigFileFullPath))
        .returns(false)
      sinon.stub(fs, 'outputJson').resolves()

      // change default test behaviour for this specific test
      readJsonStub.restore()
      readJsonStub = sinon.stub(fs, 'readJson')
      readJsonStub.resolves(expectedUserConfigWithOverride)

      projectConstructorStub = sinon.spy(projectsModule, 'ProjectsAPIClient')
    })
    .command(['projects:create', newProjectName])
    .it(
      'should instantiate a Project API object with configuration based on global configuration with apiBaseUrlOverride',
      () => {
        expect(projectConstructorStub).to.have.been.calledWith(
          sinon.match
            .has(
              'clientId',
              expectedUserConfigWithOverride.defaultWorkspaceClientId,
            )
            .and(
              sinon.match.has(
                'clientSecret',
                expectedUserConfigWithOverride.defaultWorkspaceClientSecret,
              ),
            )
            .and(
              sinon.match.has(
                'baseUrl',
                `${expectedUserConfigWithOverride.apiBaseUrlOverride}`,
              ),
            ),
        )
      },
    )

  test
    .do(() => {
      projectsApiCreateStub
        .withArgs({ name: 'Error Project' })
        .throws(createError('Boom!', { foo: 'bar' }))
    })
    .stdout()
    .command(['projects:create', 'Error Project'])
    .exit(1)
    .it(
      'provides user feedback if there is an error with the Projects API',
      (ctx) => {
        expect(ctx.stdout).to.contain('API Error')
      },
    )

  test
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(expectedProjectConfigFileFullPath))
        .returns(true)
    })
    .command(['projects:create', newProjectName])
    .exit(1)
    .it(
      'errors if the specific project directory already contains a tru.json file',
    )

  test
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(expectedProjectConfigFileFullPath))
        .returns(false)
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.throws()
    })
    .command(['projects:create', newProjectName])
    .exit(1)
    .it('errors if an exception occurs when creating the project directory')

  test
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(expectedProjectConfigFileFullPath))
        .returns(false)

      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()
    })
    .command(['projects:create', newProjectName])
    .it(
      'creates a tru.json project configuration file with the Project resource contents',
      () => {
        expect(projectConfigFileCreationStub).to.have.been.calledWith(
          expectedProjectConfigFileFullPath,
          sinon.match(expectedProjectConfigJson),
        )
      },
    )

  const customProjectDir = 'path/to/a/custom/dir'
  const customProjectConfigFilePath = `${customProjectDir}/tru.json`
  test
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(customProjectConfigFilePath))
        .returns(false)

      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()
    })
    .command([
      'projects:create',
      newProjectName,
      `--${CommandWithProjectConfig.projectDirFlagName}=${customProjectDir}`,
    ])
    .it(
      `creates a tru.json project configuration file in the location specified by the ${CommandWithProjectConfig.projectDirFlagName} flag`,
      () => {
        expect(projectConfigFileCreationStub).to.have.been.calledWith(
          customProjectConfigFilePath,
          sinon.match(expectedProjectConfigJson),
        )
      },
    )

  test
    .do(() => {
      existsSyncStub.withArgs(expectedProjectConfigFileFullPath).returns(false)

      projectsApiCreateStub
        .withArgs({ name: createProjectAPIResponse.name })
        .resolves(createProjectAPIResponse)
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()
    })
    .command(['projects:create', createProjectAPIResponse.name])
    .it(
      'creates a tru.json project configuration file stripping the _links contents',
      () => {
        expect(projectConfigFileCreationStub).to.have.been.calledWith(
          expectedProjectConfigFileFullPath,
          sinon.match((value) => {
            return value._links === undefined
          }),
        )
      },
    )

  test
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(expectedProjectConfigFileFullPath))
        .returns(false)

      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()
    })
    .stdout()
    .command(['projects:create', newProjectName])
    .it('informs the user of successful creation of the project', (ctx) => {
      expect(ctx.stdout).to.contain(
        `Project configuration saved to "${expectedProjectConfigFileFullPath}".`,
      )
    })

  test
    .do(() => {
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()

      consoleLoggerConstructorStub = sinon.spy(
        consoleLoggerModule,
        'ConsoleLogger',
      )
    })
    .stdout()
    .command(['projects:create', newProjectName])
    .it('should set the ConsoleLogger to log at info level by default', () => {
      expect(consoleLoggerConstructorStub).to.have.been.calledWith(
        consoleLoggerModule.LogLevel.info,
      )
    })

  test
    .do(() => {
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()

      consoleLoggerConstructorStub = sinon.spy(
        consoleLoggerModule,
        'ConsoleLogger',
      )
    })
    .stdout()
    .command(['projects:create', newProjectName, `--debug`])
    .it(
      'should set the ConsoleLogger level to debug when the debug flag is set',
      () => {
        expect(consoleLoggerConstructorStub).to.have.been.calledWith(
          consoleLoggerModule.LogLevel.debug,
        )
      },
    )

  test
    .do(() => {
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()

      consoleLoggerDebugStub = sinon.stub(
        consoleLoggerModule.ConsoleLogger.prototype,
        'debug',
      )
    })
    .stdout()
    .command(['projects:create', newProjectName, `--debug`])
    .it('should log that debug is set when the --debug flag is passed', () => {
      expect(consoleLoggerDebugStub).to.have.been.calledWith('--debug', true)
    })

  test
    .do(() => {
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()

      consoleLoggerErrorStub = sinon.stub(
        consoleLoggerModule.ConsoleLogger.prototype,
        'error',
      )
    })
    .command([
      'projects:create',
      newProjectName,
      '--phonecheck-callback',
      `i am not a url`,
    ])
    .exit()
    .it(
      'should show an error message if an invalid URL is supplied for the --phonecheck-callback flag',
      () => {
        expect(consoleLoggerErrorStub).to.have.been.calledWith(
          `"${phoneCheckCallbackUrlFlag.flagName}" must be a valid URL`,
        )
      },
    )

  test
    .do(() => {
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()

      consoleLoggerWarnStub = sinon.stub(
        consoleLoggerModule.ConsoleLogger.prototype,
        'warn',
      )

      phoneCheckCreateRunStub.resolves()
    })
    .command([
      'projects:create',
      newProjectName,
      '--phonecheck-callback',
      `http://example.com/callback`,
    ])
    .it(
      'should log a warning if the URL provided is HTTP and not HTTPS',
      () => {
        expect(consoleLoggerWarnStub).to.have.been.calledWith(
          `"${phoneCheckCallbackUrlFlag.flagName}" was detected to be HTTP. Please consider updated to be HTTPS.`,
        )
      },
    )

  test
    .do(() => {
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()

      consoleLoggerWarnStub = sinon.stub(
        consoleLoggerModule.ConsoleLogger.prototype,
        'warn',
      )

      phoneCheckCreateRunStub.resolves()
    })
    .command([
      'projects:create',
      newProjectName,
      '--phonecheck-callback',
      `http://example.com/callback`,
    ])
    .it(
      'should log a warning if the URL provided is HTTP and not HTTPS',
      () => {
        expect(consoleLoggerWarnStub).to.have.been.calledWith(
          '"phonecheck-callback" was detected to be HTTP. Please consider updated to be HTTPS.',
        )
      },
    )

  test
    .do(() => {
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()

      phoneCheckCreateRunStub.resolves()
    })
    .command([
      'projects:create',
      newProjectName,
      '--phonecheck-callback',
      `https://example.com/callback`,
    ])
    .it(
      'should create a Project with the expected callback_url configuration',
      () => {
        expect(projectsApiCreateStub).to.have.been.calledWith({
          name: newProjectName,
          configuration: {
            phone_check: {
              callback_url: 'https://example.com/callback',
            },
          },
        })
      },
    )

  test
    .do(() => {
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()
    })
    .command(['projects:create', newProjectName, '--mode', `cheese`])
    .exit(2)
    .it('should exit if an invalid --mode value is supplied')

  test
    .do(() => {
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()
    })
    .command(['projects:create', newProjectName, '--mode', `sandbox`])
    .it('should create a Project with mode=sandbox', () => {
      expect(projectsApiCreateStub).to.have.been.calledWith({
        name: newProjectName,
        mode: 'sandbox',
      })
    })

  test
    .do(() => {
      projectConfigFileCreationStub = sinon.stub(fs, 'outputJson')
      projectConfigFileCreationStub.resolves()

      phoneCheckCreateRunStub.resolves()
    })
    .command(['projects:create', newProjectName, '--mode', `live`])
    .it('should create a Project with mode=live', () => {
      expect(projectsApiCreateStub).to.have.been.calledWith({
        name: newProjectName,
        mode: 'live',
      })
    })
})
