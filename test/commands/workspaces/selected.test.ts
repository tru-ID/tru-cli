import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { IWorkspaceResource } from '../../../src/api/WorkspacesAPIClient'
import { IGlobalAuthConfiguration } from '../../../src/IGlobalAuthConfiguration'

const expect = chai.expect
chai.use(sinonChai)

describe('workspaces selected', () => {
  let readJsonStub: any

  const globalConfig: IGlobalAuthConfiguration = {
    selectedWorkspace: 'workspace_id',
    selectedWorkspaceDataResidency: 'eu',
    tokenInfo: {
      refreshToken: 'refresh_token',
      scope: 'console offline_access openid',
    },
  }

  const workspaceResource: IWorkspaceResource = {
    workspace_id: 'workspace_id',
    name: 'Aristoula Workspace',
    data_residency: 'EU',
    created_at: '2020-08-12T22:30:29+0000',
    updated_at: '2020-08-12T22:30:29+0000',
    _links: {
      self: {
        href: 'https://eu.api.tru.id/console/v0.2/workspaces/workspace_id',
      },
    },
    _embedded: {
      balance: {
        currency: 'API',
        amount_available: 40,
        amount_reserved: -1,
      },
      me: {
        role: 'ADMIN',
        name: 'Brown',
      },
    },
  }

  beforeEach(() => {
    sinon
      .stub(fs, 'existsSync')
      .withArgs(sinon.match(new RegExp(/config.json/)))
      .returns(true)

    readJsonStub = sinon.stub(fs, 'readJson')

    readJsonStub
      .withArgs(sinon.match(sinon.match(new RegExp(/config.json/))))
      .resolves(globalConfig)

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
    .nock('https://login.tru.id', (api) => {
      api
        .post(
          new RegExp('/oauth2/token'),
          'grant_type=refresh_token&refresh_token=refresh_token&client_id=cli_hq',
        )
        .delayConnection(6000)
        .delayBody(6000)
        .reply(200, {
          refresh_token: 'refresh_token_new',
          access_token: 'access_token_new',
          expires_in: 3599,
          scope: 'console offline_access openid',
          token_type: 'bearer',
        })
    })
    .nock('https://eu.api.tru.id', (api) => {
      api
        .persist()
        .get(
          new RegExp(
            `/console/v0.2/workspaces/${globalConfig.selectedWorkspace}`,
          ),
        )
        .reply(200, workspaceResource)
    })
    .stdout()
    .command(['workspaces:selected'])
    .it(
      'outputs result of a single resource to cli.table when response time is 6s',
      (ctx) => {
        expect(ctx.stdout).to.contain(workspaceResource.data_residency)
        expect(ctx.stdout).to.contain(workspaceResource.workspace_id)
        expect(ctx.stdout).to.contain(
          workspaceResource._embedded.balance.currency,
        )
        expect(ctx.stdout).to.contain(
          workspaceResource._embedded.balance.amount_available,
        )
      },
    )
})
