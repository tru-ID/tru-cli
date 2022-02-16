import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import path from 'path'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { ICreateTokenResponse } from '../../../src/api/HttpClient'
import * as apiModule from '../../../src/api/OAuth2APIClient'
import { OAuth2APIClient } from '../../../src/api/OAuth2APIClient'
import { IProjectResource } from '../../../src/api/ProjectsAPIClient'
import CommandWithProjectConfig from '../../../src/helpers/CommandWithProjectConfig'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'

const expect = chai.expect
chai.use(sinonChai)

let constructorStub: any = null
let apiClientStub: any = null

const expectedUserConfig: IGlobalConfiguration = {
  defaultWorkspaceClientId: 'my client id',
  defaultWorkspaceClientSecret: 'my client secret',
  defaultWorkspaceDataResidency: 'eu',
}

const accessToken: ICreateTokenResponse = {
  access_token: 'i am an access token',
  id_token: 'adfasdfa',
  expires_in: 60,
  token_type: 'bearer',
  refresh_token: 'fadfadfa',
  scope: 'projects',
}

// Stubs
let existsSyncStub: any
let readJsonStub: any

const newProjectName = 'My First Project'
const expectedProjectDirectoryName = 'my_first_project'
const expectedProjectFullPath = path.join(
  process.cwd(),
  expectedProjectDirectoryName,
)
const expectedProjectConfigFileFullPath = path.join(
  expectedProjectFullPath,
  'tru.json',
)
const expectedCurrentWorkingDirectoryConfig = path.join(
  process.cwd(),
  'tru.json',
)

const projectAPIResponse: IProjectResource = {
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
      scopes: ['sim_check', 'phone_check', 'subscriber_check'],
    },
  ],
  _links: {
    self: {
      href: 'https://eu.api.tru.id/console/v1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003',
    },
  },
}

const oldProjectConfig: any = {
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
  ...projectAPIResponse,
}
delete expectedProjectConfigJson._links

describe('Command: oauth2:create', () => {
  beforeEach(() => {
    existsSyncStub = sinon.stub(fs, 'existsSync')
    existsSyncStub
      .withArgs(sinon.match(new RegExp(/config.json/)))
      .returns(true)

    apiClientStub = sinon.stub(OAuth2APIClient.prototype, 'create')
    apiClientStub.resolves(accessToken)

    readJsonStub = sinon.stub(fs, 'readJson')
    readJsonStub
      .withArgs(sinon.match(new RegExp(/config.json/)))
      .resolves(expectedUserConfig)
  })

  afterEach(() => {
    sinon.restore()
  })

  test
    .do(() => {
      existsSyncStub
        .withArgs(expectedCurrentWorkingDirectoryConfig)
        .returns(false)
      constructorStub = sinon.spy(apiModule, 'OAuth2APIClient')
    })
    .command(['oauth2:token'])
    .it(
      `should use workspace credentials when the --${CommandWithProjectConfig.projectDirFlagName} flag is not set`,
      () => {
        expect(constructorStub).to.have.been.calledWith(
          sinon.match
            .has('clientId', expectedUserConfig.defaultWorkspaceClientId)
            .and(
              sinon.match.has(
                'clientSecret',
                expectedUserConfig.defaultWorkspaceClientSecret,
              ),
            )
            .and(
              sinon.match.has('scopes', 'workspaces projects usage balances'),
            ),
        )
      },
    )

  test
    .do(() => {
      constructorStub = sinon.spy(apiModule, 'OAuth2APIClient')

      readJsonStub
        .withArgs(expectedProjectConfigFileFullPath)
        .resolves(expectedProjectConfigJson)
    })
    .command([
      'oauth2:token',
      `--${CommandWithProjectConfig.projectDirFlagName}`,
      expectedProjectFullPath,
    ])
    .it(
      `should use project credentials when the --${CommandWithProjectConfig.projectDirFlagName} flag is set`,
      () => {
        expect(constructorStub).to.have.been.calledWith(
          sinon.match
            .has('clientId', expectedProjectConfigJson.credentials[0].client_id)
            .and(
              sinon.match.has(
                'clientSecret',
                expectedProjectConfigJson.credentials[0].client_secret,
              ),
            )
            .and(
              sinon.match.has(
                'scopes',
                expectedProjectConfigJson.credentials[0].scopes.join(' '),
              ),
            ),
        )
      },
    )

  test
    .do(() => {
      constructorStub = sinon.spy(apiModule, 'OAuth2APIClient')

      readJsonStub
        .withArgs(expectedProjectConfigFileFullPath)
        .resolves(oldProjectConfig)
    })
    .command([
      'oauth2:token',
      `--${CommandWithProjectConfig.projectDirFlagName}`,
      expectedProjectFullPath,
    ])
    .it(
      `should use default project credentials when the --${CommandWithProjectConfig.projectDirFlagName} flag is set and no scopes in credentials is there`,
      () => {
        expect(constructorStub).to.have.been.calledWith(
          sinon.match
            .has('clientId', oldProjectConfig.credentials[0].client_id)
            .and(
              sinon.match.has(
                'clientSecret',
                oldProjectConfig.credentials[0].client_secret,
              ),
            )
            .and(sinon.match.has('scopes', 'phone_check')),
        )
      },
    )

  test
    .do(() => {
      constructorStub = sinon.spy(apiModule, 'OAuth2APIClient')

      readJsonStub
        .withArgs(expectedProjectConfigFileFullPath)
        .resolves(expectedProjectConfigJson)
    })
    .command([
      'oauth2:token',
      `--${CommandWithProjectConfig.projectDirFlagName}`,
      expectedProjectFullPath,
    ])
    .it(
      `should call the client to create an access token when project config is used`,
      () => {
        expect(apiClientStub).to.have.been.called
      },
    )

  test
    .do(() => {
      constructorStub = sinon.spy(apiModule, 'OAuth2APIClient')
    })
    .command(['oauth2:token'])
    .it(
      `should call the client to create an access token when workspace config is used`,
      () => {
        expect(apiClientStub).to.have.been.called
      },
    )
})
