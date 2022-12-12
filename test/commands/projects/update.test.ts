import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import path from 'path'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import * as projectsModule from '../../../src/api/ProjectsAPIClient'
import { IGlobalAuthConfiguration } from '../../../src/IGlobalAuthConfiguration'
import { IProjectConfiguration } from '../../../src/IProjectConfiguration'

const expect = chai.expect
chai.use(sinonChai)

const globalConfig: IGlobalAuthConfiguration = {
  selectedWorkspace: 'workspace_id',
  selectedWorkspaceDataResidency: 'eu',
  tokenInfo: {
    refreshToken: 'refresh_token',
    scope: 'console openid',
  },
}

// Stubs
// for filesystem
let existsSyncStub: any
let readJsonStub: any

const projectConfigPath = path.join(process.cwd(), 'tru.json')

const projectConfig: IProjectConfiguration = {
  project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
  name: 'My test project',
  created_at: '2020-06-01T16:43:30+00:00',
  credentials: [
    {
      client_id: 'project client id',
      client_secret: 'project client secret',
      scopes: ['phone_check'],
    },
  ],
}
const projectResource: projectsModule.IProjectResource = {
  project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
  name: 'My test project',
  mode: 'live',
  disabled: false,
  created_at: '2020-06-01T16:43:30+00:00',
  updated_at: '2020-06-01T16:43:30+00:00',
  _embedded: {
    credentials: [
      {
        client_id: 'project client id',
        scopes: ['phone_check'],
        created_at: '2020-06-01T16:43:30+00:00',
      },
    ],
  },
  configuration: {
    phone_check: {
      callback_url: 'https:www.example.com',
    },
  },
  _links: {
    self: {
      href: 'https://eu.api.tru.id/console/v0.1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003',
    },
    my_credentials: {
      href: 'https://eu.api.tru.id/console/v0.1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003/credentials',
    },
  },
}

const testToken = test.nock('https://login.tru.id', (api) => {
  api
    .post(
      new RegExp('/oauth2/token'),
      'grant_type=refresh_token&refresh_token=refresh_token&client_id=cli_hq',
    )
    .reply(200, {
      refresh_token: 'refresh_token',
      access_token: 'access_token_new',
      expires_in: 3599,
      scope: 'console offline_access openid',
      token_type: 'bearer',
    })
})

describe('Command: projects:update', () => {
  beforeEach(() => {
    existsSyncStub = sinon
      .stub(fs, 'existsSync')
      .withArgs(sinon.match(new RegExp(/config.json/)))
      .returns(true)
      .withArgs(sinon.match(new RegExp(/tru.json/)))
      .returns(true)

    readJsonStub = sinon.stub(fs, 'readJson')

    readJsonStub
      .withArgs(sinon.match(sinon.match(new RegExp(/config.json/))))
      .resolves(globalConfig)

    readJsonStub
      .withArgs(sinon.match(sinon.match(new RegExp(/tru.json/))))
      .resolves(projectConfig)

    sinon
      .stub(fs, 'outputJson')
      .withArgs(
        sinon.match(new RegExp(/config.json/)),
        sinon.match.any,
        sinon.match.any,
      )
      .resolves()
  })

  afterEach(() => {
    sinon.restore()
  })

  test
    .do(() => {
      existsSyncStub.withArgs(projectConfigPath).returns(false)
    })
    .stdout()
    .command([
      'projects:update',
      '--phonecheck-callback',
      `https://example.com/callback`,
    ])
    .exit(1)
    .it(
      'should exit if no project ID arg has been passed and there is no local project configuration',
      (ctx) => {
        expect(ctx.stdout).to.contain(
          `A project configuration file does not exist`,
        )
      },
    )

  testToken
    .nock('https://eu.api.tru.id', (api) => {
      api
        .get(
          `/console/v0.2/workspaces/workspace_id/projects/${projectResource.project_id}`,
        )
        .matchHeader('Authorization', 'Bearer access_token_new')
        .reply(200, projectResource)
        .patch(
          `/console/v0.2/workspaces/workspace_id/projects/${projectResource.project_id}`,
          [
            {
              op: 'replace',
              path: '/configuration/phone_check/callback_url',
              value: 'https://example.com/callback',
            },
          ],
        )
        .matchHeader('Authorization', 'Bearer access_token_new')
        .matchHeader('Content-Type', 'application/json-patch+json')
        .reply(200, projectResource)
    })
    .command([
      'projects:update',
      '--phonecheck-callback',
      `https://example.com/callback`,
    ])
    .it(
      `should use project ID from local project configuration if no project ID arg is provided' `,
    )

  test
    .stdout()
    .stderr()
    .command(['projects:update', projectResource.project_id])
    .exit(1)
    .it('should fail if no flags are provided', (ctx) => {
      expect(ctx.stderr).to.contain(
        'At least one flag must be supplied to indicate the update to be applied to the Project',
      )
    })

  test
    .stdout()
    .stderr()
    .command([
      'projects:update',
      projectResource.project_id,
      '--phonecheck-callback',
      `i am not a url`,
    ])
    .exit(1)
    .it(
      'should show an error message if an invalid URL is supplied for the --phonecheck-callback flag',
      (ctx) => {
        expect(ctx.stderr).to.contain(
          '"phonecheck-callback" must be a valid URL',
        )
      },
    )

  testToken
    .nock('https://eu.api.tru.id', (api) => {
      api
        .get(
          `/console/v0.2/workspaces/workspace_id/projects/${projectResource.project_id}`,
        )
        .matchHeader('Authorization', 'Bearer access_token_new')
        .reply(200, projectResource)
        .patch(
          `/console/v0.2/workspaces/workspace_id/projects/${projectResource.project_id}`,
          [
            {
              op: 'replace',
              path: '/configuration/phone_check/callback_url',
              value: 'http://example.com/callback',
            },
          ],
        )
        .matchHeader('Authorization', 'Bearer access_token_new')
        .matchHeader('Content-Type', 'application/json-patch+json')
        .reply(200, projectResource)
    })
    .stderr()
    .stdout()
    .command([
      'projects:update',
      projectResource.project_id,
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
    .command([
      'projects:update',
      projectResource.project_id,
      '--phonecheck-callback',
      'https://example.com/callback',
      '--remove-phonecheck-callback',
    ])
    .catch((err) => {
      expect(err.message).to.contain(
        '--remove-phonecheck-callback=true cannot also be provided when using --phonecheck-callback',
      )
    })
    .it(
      'should error if --phonecheck-callback and --remove-phonecheck-callback are used together',
    )

  testToken
    .nock('https://eu.api.tru.id', (api) => {
      api
        .get(
          `/console/v0.2/workspaces/workspace_id/projects/${projectResource.project_id}`,
        )
        .matchHeader('Authorization', 'Bearer access_token_new')
        .reply(200, projectResource)
        .patch(
          `/console/v0.2/workspaces/workspace_id/projects/${projectResource.project_id}`,
          [{ op: 'remove', path: '/configuration/phone_check/callback_url' }],
        )
        .matchHeader('Authorization', 'Bearer access_token_new')
        .matchHeader('Content-Type', 'application/json-patch+json')
        .reply(200, projectResource)
    })
    .command([
      'projects:update',
      projectResource.project_id,
      '--remove-phonecheck-callback',
    ])
    .it(`should update project when removing phonecheck-callback `)

  test
    .stderr()
    .command([
      'projects:update',
      projectResource.project_id,
      '--mode',
      `cheese`,
    ])
    .catch((err) => {
      expect(err.message).to.contain(
        '--mode=cheese to be one of: live, sandbox',
      )
    })
    .it('should exit if an invalid --mode value is supplied')

  const modeParams = [
    { mode: 'sandbox', previousMode: 'live' },
    { mode: 'live', previousMode: 'sandbox' },
  ]
  modeParams.forEach(({ mode, previousMode }) => {
    testToken
      .nock('https://eu.api.tru.id', (api) => {
        api
          .get(
            `/console/v0.2/workspaces/workspace_id/projects/${projectResource.project_id}`,
          )
          .matchHeader('Authorization', 'Bearer access_token_new')
          .reply(200, {
            ...projectResource,
            mode: previousMode,
          })
          .patch(
            `/console/v0.2/workspaces/workspace_id/projects/${projectResource.project_id}`,
            [{ op: 'replace', path: '/mode', value: `${mode}` }],
          )
          .matchHeader('Authorization', 'Bearer access_token_new')
          .matchHeader('Content-Type', 'application/json-patch+json')
          .reply(200, projectResource)
      })
      .stdout()
      .command(['projects:update', projectResource.project_id, '--mode', mode])
      .it(`should update project with mode=${mode}`, (ctx) => {
        expect(ctx.stdout).to.contain('✅ Project updated')
      })
  })
})
