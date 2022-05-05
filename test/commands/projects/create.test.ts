import { CliUx } from '@oclif/core'
import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { IProjectResource } from '../../../src/api/ProjectsAPIClient'
import CommandWithProjectConfig from '../../../src/helpers/CommandWithProjectConfig'
import { IGlobalAuthConfiguration } from '../../../src/IGlobalAuthConfiguration'
import { IProjectConfiguration } from '../../../src/IProjectConfiguration'
import { testToken } from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

const globalConfig: IGlobalAuthConfiguration = {
  selectedWorkspace: 'workspace_id',
  selectedWorkspaceDataResidency: 'in',
  tokenInfo: {
    refreshToken: 'refresh_token',
    scope: 'console openid',
  },
}

// Stubs
let existsSyncStub: any
let readJsonStub: any
let outputJsonStub: any

const newProjectName = 'My First Project'
const expectedProjectConfigFileFullPath = `${process.cwd()}/my_first_project/tru.json`

const createProjectAPIResponse: IProjectResource = {
  project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
  name: newProjectName,
  mode: 'live',
  disabled: false,
  created_at: '2020-06-01T16:43:30+00:00',
  updated_at: '2020-06-01T16:43:30+00:00',
  _embedded: {
    credentials: [
      {
        client_id: '6779ef20e75817b79602',
        client_secret: 'dzi1v4osLNr5vv0.2mnvcKM37.',
        scopes: ['phone_check'],
        created_at: '2020-06-01T16:43:30+00:00',
      },
    ],
  },
  _links: {
    self: {
      href: 'https://eu.api.tru.id/console/v1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003',
    },
    my_credentials: {
      href: 'https://eu.api.tru.id/console/v1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003/credentials',
    },
  },
}

const expectedProjectConfigJson: IProjectConfiguration = {
  project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
  name: newProjectName,
  created_at: '2020-06-01T16:43:30+00:00',
  credentials: [
    {
      client_id: '6779ef20e75817b79602',
      client_secret: 'dzi1v4osLNr5vv0.2mnvcKM37.',
      scopes: ['phone_check'],
    },
  ],
  data_residency: 'in',
}

describe('Command: projects:create', () => {
  beforeEach(() => {
    existsSyncStub = sinon
      .stub(fs, 'existsSync')
      .withArgs(sinon.match(new RegExp(/config.json/)))
      .returns(true)

    readJsonStub = sinon.stub(fs, 'readJson')
    readJsonStub.resolves(globalConfig)

    outputJsonStub = sinon
      .stub(fs, 'outputJson')
      .withArgs(
        sinon.match(new RegExp(/tru.json/)),
        sinon.match.any,
        sinon.match.any,
      )
      .resolves()
  })

  afterEach(() => {
    sinon.restore()
  })

  testToken
    .nock('https://in.api.tru.id', (api) => {
      api
        .persist()
        .post(new RegExp('/console/v0.2/workspaces/workspace_id/projects'), {
          name: 'My First Project',
        })
        .matchHeader('Authorization', 'Bearer access_token_new')
        .reply(200, createProjectAPIResponse)
    })
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(expectedProjectConfigFileFullPath))
        .returns(false)
    })
    .stub(CliUx.ux, 'prompt', () => async () => 'My First Project')
    .stdout()
    .command(['projects:create'])
    .it('prompts for the name of a project and config is created', (ctx) => {
      expect(outputJsonStub).to.have.been.calledWith(
        expectedProjectConfigFileFullPath,
        sinon.match(expectedProjectConfigJson),
      )
      expect(ctx.stdout).to.contain(
        `Project configuration saved to "${expectedProjectConfigFileFullPath}`,
      )
    })

  testToken
    .nock('https://in.api.tru.id', (api) => {
      api
        .persist()
        .post(new RegExp('/console/v0.2/workspaces/workspace_id/projects'), {
          name: 'My Inline Project',
        })
        .matchHeader('Authorization', 'Bearer access_token_new')
        .reply(200, {
          ...createProjectAPIResponse,
          name: 'My Inline Project',
        })
    })
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(expectedProjectConfigFileFullPath))
        .returns(false)
    })
    .command(['projects:create', 'My Inline Project'])
    .it('uses the inline argument for the name project')

  testToken
    .nock('https://in.api.tru.id', (api) => {
      api
        .persist()
        .post(new RegExp('/console/v0.2/workspaces/workspace_id/projects'), {
          name: 'My First Project',
        })
        .matchHeader('Authorization', 'Bearer access_token_new')
        .reply(200, createProjectAPIResponse)
    })
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(expectedProjectConfigFileFullPath))
        .returns(true)
    })
    .stderr()
    .command(['projects:create', newProjectName])
    .catch((err) => {
      expect(err.message).to.contain(
        'Cannot create project. A Project configuration file (tru.json) already exists',
      )
    })
    .it(
      'should throw error if the specific project directory already contains a tru.json file',
    )

  testToken
    .nock('https://in.api.tru.id', (api) => {
      api
        .persist()
        .post(new RegExp('/console/v0.2/workspaces/workspace_id/projects'), {
          name: 'My First Project',
        })
        .matchHeader('Authorization', 'Bearer access_token_new')
        .reply(200, createProjectAPIResponse)
    })
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(expectedProjectConfigFileFullPath))
        .returns(false)
      outputJsonStub.throws()
    })
    .stderr()
    .command(['projects:create', 'My First Project'])
    .catch((err) => {
      expect(err.message).to.contain(
        'An unexpected error occurred: Error: Error',
      )
    })
    .it(
      'should throw error if an exception occurs when creating the project directory',
    )

  const customProjectDir = 'path/to/a/custom/dir'
  const customProjectConfigFilePath = `${customProjectDir}/tru.json`
  testToken
    .nock('https://in.api.tru.id', (api) => {
      api
        .persist()
        .post(new RegExp('/console/v0.2/workspaces/workspace_id/projects'), {
          name: 'My First Project',
        })
        .matchHeader('Authorization', 'Bearer access_token_new')
        .reply(200, createProjectAPIResponse)
    })
    .do(() => {
      existsSyncStub
        .withArgs(sinon.match(customProjectConfigFilePath))
        .returns(false)

      outputJsonStub.reset()

      outputJsonStub
        .withArgs(
          sinon.match(customProjectConfigFilePath),
          sinon.match.any,
          sinon.match.any,
        )
        .resolves()
    })
    .command([
      'projects:create',
      newProjectName,
      `--${CommandWithProjectConfig.projectDirFlagName}=${customProjectDir}`,
    ])
    .it(
      `creates a tru.json project configuration file in the location specified by the ${CommandWithProjectConfig.projectDirFlagName} flag`,
      () => {
        expect(outputJsonStub).to.have.been.calledWith(
          customProjectConfigFilePath,
          sinon.match(expectedProjectConfigJson),
        )
      },
    )

  test
    .stdout()
    .stderr()
    .command([
      'projects:create',
      newProjectName,
      '--phonecheck-callback',
      `i am not a url`,
    ])
    .exit()
    .it(
      'should show an error message if an invalid URL is supplied for the --phonecheck-callback flag',
      (ctx) => {
        expect(ctx.stderr).to.contain(
          '"phonecheck-callback" must be a valid URL',
        )
      },
    )

  testToken
    .nock('https://in.api.tru.id', (api) => {
      api
        .persist()
        .post(new RegExp('/console/v0.2/workspaces/workspace_id/projects'), {
          name: 'My First Project',
          configuration: {
            phone_check: {
              callback_url: `http://example.com/callback`,
            },
          },
        })
        .matchHeader('Authorization', 'Bearer access_token_new')
        .reply(200, createProjectAPIResponse)
    })
    .stderr()
    .stdout()
    .command([
      'projects:create',
      newProjectName,
      '--phonecheck-callback',
      `http://example.com/callback`,
    ])
    .it(
      'should log a warning if the URL provided is HTTP and not HTTPS',
      (ctx) => {
        expect(ctx.stderr).to.contain(
          `"phonecheck-callback" was detected to be HTTP. Please consider updated to be HTTPS.`,
        )
      },
    )

  test
    .stderr()
    .command(['projects:create', newProjectName, '--mode', `cheese`])
    .catch((err) => {
      expect(err.message).to.contain(
        '--mode=cheese to be one of: live, sandbox',
      )
    })
    .it('should exit if an invalid --mode value is supplied')

  const modeParams = [{ mode: 'sandbox' }, { mode: 'live' }]
  modeParams.forEach(({ mode }) => {
    testToken
      .nock('https://in.api.tru.id', (api) => {
        api
          .persist()
          .post(new RegExp('/console/v0.2/workspaces/workspace_id/projects'), {
            name: 'My First Project',
            mode: mode,
          })
          .matchHeader('Authorization', 'Bearer access_token_new')
          .reply(200, createProjectAPIResponse)
      })
      .command(['projects:create', newProjectName, '--mode', mode])
      .it(`should create a Project with mode=${mode}`)
  })
})
