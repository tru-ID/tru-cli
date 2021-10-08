import { test } from '@oclif/test'
import * as chai from 'chai'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'ts-sinon'
import * as coverageAPIClientModules from '../../../src/api/CoverageAPIClient'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import { IProjectConfiguration } from '../../../src/IProjectConfiguration'

const expect = chai.expect
chai.use(sinonChai)

describe('coverage:reach', () => {
  const reachableIp = 'mobileIpAddress'
  const unreachableIp = 'unreachableIp'

  const globalConfig: IGlobalConfiguration = {
    defaultWorkspaceClientId: 'clientID',
    defaultWorkspaceClientSecret: 'clientSecret',
    defaultWorkspaceDataResidency: 'eu',
  }

  const projectConfigFileLocation = path.join(process.cwd(), 'tru.json')
  const projectConfig: IProjectConfiguration = {
    project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
    name: 'My test project',
    created_at: '2020-06-01T16:43:30+00:00',
    updated_at: '2020-06-01T16:43:30+00:00',
    credentials: [
      {
        client_id: 'project client id',
        client_secret: 'project client secret',
        scopes: ['coverage'],
        created_at: '2020-06-01T16:43:30+00:00',
      },
    ],
  }

  const existsSyncStub: any = sinon.default.stub(fs, 'existsSync')
  const coverageAPIReachStub: any = sinon.default.stub(
    coverageAPIClientModules.CoverageAPIClient.prototype,
    'reach',
  )
  const readJsonStub: any = sinon.default.stub(fs, 'readJson')

  beforeEach(() => {
    existsSyncStub
      .withArgs(sinon.default.match(new RegExp(/config.json/)))
      .returns(true)

    readJsonStub
      .withArgs(
        sinon.default.match(sinon.default.match(new RegExp(/config.json/))),
      )
      .resolves(globalConfig)

    readJsonStub
      .withArgs(sinon.default.match(projectConfigFileLocation))
      .resolves(projectConfig)
  })

  test
    .add('mockedResponse', () => {
      const reachResponse: coverageAPIClientModules.ICoverageReachResponse = {
        network_id: '1234',
        network_name: 'ACME',
        country_code: 'US',
        products: [{ product_id: 'PCK', product_name: 'Phone Check' }],
      }

      coverageAPIReachStub.withArgs(reachableIp).resolves(reachResponse)

      return reachResponse
    })
    .stdout()
    .command(['coverage:reach', reachableIp])
    .it('outputs result to cli.table', (ctx) => {
      expect(ctx.stdout).to.contain(ctx.mockedResponse.country_code)
      expect(ctx.stdout).to.contain(ctx.mockedResponse.network_id)
      expect(ctx.stdout).to.contain(ctx.mockedResponse.network_name)
      expect(ctx.stdout).to.contain(ctx.mockedResponse.products[0].product_name)
    })

  test
    .do((_ctx) => {
      coverageAPIReachStub.withArgs(unreachableIp).resolves(undefined)
    })
    .stdout()
    .command(['coverage:reach', unreachableIp])
    .it('outputs no reach result', (ctx) => {
      expect(ctx.stdout).to.contain('No reach')
    })

  test
    .do((_ctx) => {
      let projectWithoutRequiredScope = { ...projectConfig }
      projectWithoutRequiredScope.credentials[0].scopes = []
      readJsonStub
        .withArgs(sinon.default.match(projectConfigFileLocation))
        .resolves(projectWithoutRequiredScope)
    })
    .command(['coverage:reach', 'noReachIpAddress'])
    .exit(1)
    .it('project must have coverage scope')
})
