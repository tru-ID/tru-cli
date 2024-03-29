import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import path from 'path'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { ICoverageReachResponse } from '../../../src/api/CoverageAPIClient'
import { IGlobalAuthConfiguration } from '../../../src/IGlobalAuthConfiguration'
import { IProjectConfiguration } from '../../../src/IProjectConfiguration'
import { accessToken } from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

const reachableIp = 'mobileIpAddress'
const unreachableIp = 'unreachableIp'

const globalConfig: IGlobalAuthConfiguration = {
  selectedWorkspace: 'workspace_id',
  selectedWorkspaceDataResidency: 'eu',
  tokenInfo: {
    refreshToken: 'refresh_token',
    scope: 'console openid',
  },
}

const projectConfigFileLocation = path.join(process.cwd(), 'tru.json')
const projectConfig: IProjectConfiguration = {
  project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
  name: 'My test project',
  created_at: '2020-06-01T16:43:30+00:00',
  credentials: [
    {
      client_id: 'project client id',
      client_secret: 'project client secret',
      scopes: ['coverage'],
    },
  ],
}

const reachResponse: ICoverageReachResponse = {
  network_id: '1234',
  network_name: 'ACME',
  country_code: 'US',
  products: [{ product_id: 'PCK', product_name: 'Phone Check' }],
}

let existsSyncStub: any
let readJsonStub: any

describe('coverage:reach', () => {
  beforeEach(() => {
    existsSyncStub = sinon.stub(fs, 'existsSync')
    readJsonStub = sinon.stub(fs, 'readJson')
    existsSyncStub
      .withArgs(sinon.match(new RegExp(/config.json/)))
      .returns(true)

    readJsonStub
      .withArgs(sinon.match(sinon.match(new RegExp(/config.json/))))
      .resolves(globalConfig)

    readJsonStub
      .withArgs(sinon.match(projectConfigFileLocation))
      .resolves(projectConfig)
  })

  afterEach(() => {
    sinon.restore()
  })

  const dataResidency = [
    {
      data_residency: 'in',
      config_data_residency: 'in',
    },
    {
      data_residency: 'eu',
      config_data_residency: undefined,
    },
  ]
  dataResidency.forEach(({ data_residency, config_data_residency }) => {
    test
      .nock(`https://${data_residency}.api.tru.id`, (api) =>
        api
          .persist()
          .post(new RegExp('/oauth2/v1/token*'))
          .reply(200, accessToken)
          .get(new RegExp('/coverage/v0.1/device_ips/.*'))
          .reply(200, reachResponse),
      )
      .do(() => {
        readJsonStub
          .withArgs(sinon.match(projectConfigFileLocation))
          .resolves({ ...projectConfig, data_residency: config_data_residency })
      })
      .stdout()
      .command(['coverage:reach', reachableIp])
      .it('outputs result to cli.table', (ctx) => {
        expect(ctx.stdout).to.contain(reachResponse.country_code)
        expect(ctx.stdout).to.contain(reachResponse.network_id)
        expect(ctx.stdout).to.contain(reachResponse.network_name)
        expect(ctx.stdout).to.contain(reachResponse.products[0].product_name)
      })

    test
      .stdout()
      .nock('https://eu.api.tru.id', (api) =>
        api
          .persist()
          .post(new RegExp('/oauth2/v1/tokens*'))
          .reply(200, accessToken)
          .get('/coverage/v0.1/device_ips/unreachableIp')
          .reply(200),
      )
      .command(['coverage:reach', unreachableIp])
      .it('outputs no reach result', (ctx) => {
        expect(ctx.stdout).to.contain('No reach')
      })
  })

  test
    .do((_ctx) => {
      const projectWithoutRequiredScope = { ...projectConfig }
      projectWithoutRequiredScope.credentials[0].scopes = []
      readJsonStub
        .withArgs(sinon.match(projectConfigFileLocation))
        .resolves(projectWithoutRequiredScope)
    })
    .command(['coverage:reach', 'noReachIpAddress'])
    .exit(1)
    .it('project must have coverage scope')
})
