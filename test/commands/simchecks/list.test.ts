import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { CheckStatus } from '../../../src/api/CheckStatus'
import * as simchecks from '../../../src/api/SimCheckAPIClient'
import { IGlobalAuthConfiguration } from '../../../src/IGlobalAuthConfiguration'
import { IProjectConfiguration } from '../../../src/IProjectConfiguration'
import { accessToken, projectConfigFileLocation } from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

describe('simchecks:list', () => {
  let readJsonStub: any

  const globalConfig: IGlobalAuthConfiguration = {
    selectedWorkspace: 'workspace_id',
    selectedWorkspaceDataResidency: 'eu',
    tokenInfo: {
      refreshToken: 'refresh_token',
      scope: 'console openid',
    },
  }

  const projectConfig: IProjectConfiguration = {
    project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
    name: 'My test project',
    created_at: '2020-06-01T16:43:30+00:00',
    credentials: [
      {
        client_id: 'project client id',
        client_secret: 'project client secret',
        scopes: ['sim_check'],
      },
    ],
  }

  const simCheckResource: simchecks.ISimCheckResource = {
    _links: {
      self: {
        href: 'https://us.api.tru.id/sim_Checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002',
      },
    },
    charge_amount: 1,
    charge_currency: 'API',
    check_id: 'c69bc0e6-a429-11ea-bb37-0242ac130002',
    created_at: '2020-06-01T16:43:30+00:00',
    no_sim_change: true,
    status: CheckStatus.COMPLETED,
  }

  const listResource: simchecks.IListSimCheckResource = {
    _embedded: {
      checks: [simCheckResource],
    },
    _links: {
      first: { href: '' },
      last: { href: '' },
      next: { href: '' },
      prev: { href: '' },
      self: { href: '' },
    },
    page: {
      number: 1,
      size: 1,
      total_elements: 1,
      total_pages: 1,
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
          .get(new RegExp('/sim_check/v0.1/checks*'))
          .reply(200, listResource),
      )
      .do(() => {
        readJsonStub.withArgs(sinon.match(projectConfigFileLocation)).resolves({
          ...projectConfig,
          data_residency: config_data_residency,
        })
      })
      .stdout()
      .command(['simchecks:list', '--no-truncate'])
      .it(
        `should display fields if optional check_id argument is not supplied for data residency ${data_residency}`,
        (ctx) => {
          expect(ctx.stdout).to.contain('check_id')
          expect(ctx.stdout).to.contain('created_at')
          expect(ctx.stdout).to.contain('status')
          expect(ctx.stdout).to.contain('charge_currency')
          expect(ctx.stdout).to.contain('charge_amount')
          expect(ctx.stdout).to.contain('no_sim_change')
          expect(ctx.stdout).to.contain('Page 1 of 1')
          expect(ctx.stdout).to.contain('SIMChecks: 1 to 1 of 1')
          expect(ctx.stdout).to.contain(simCheckResource.check_id)
          expect(ctx.stdout).to.contain(simCheckResource.created_at)
          expect(ctx.stdout).to.contain(simCheckResource.charge_amount)
          expect(ctx.stdout).to.contain(simCheckResource.charge_currency)
          expect(ctx.stdout).to.contain(simCheckResource.status)
          expect(ctx.stdout).to.contain(simCheckResource.no_sim_change)
        },
      )
  })

  test
    .nock('https://eu.api.tru.id', (api) =>
      api
        .persist()
        .post(new RegExp('/oauth2/v1/token*'))
        .reply(200, accessToken)
        .get(new RegExp(`/sim_check/v0.1/checks/${simCheckResource.check_id}*`))
        .reply(200, simCheckResource),
    )
    .stdout()
    .command([
      'simchecks:list',
      `${simCheckResource.check_id}`,
      '--no-truncate',
    ])
    .it(
      `should display fields if optional check_id argment is supplied`,
      (ctx) => {
        expect(ctx.stdout).to.contain('check_id')
        expect(ctx.stdout).to.contain('created_at')
        expect(ctx.stdout).to.contain('status')
        expect(ctx.stdout).to.contain('charge_currency')
        expect(ctx.stdout).to.contain('charge_amount')
        expect(ctx.stdout).to.contain('no_sim_change')
        expect(ctx.stdout).to.contain(simCheckResource.check_id)
        expect(ctx.stdout).to.contain(simCheckResource.created_at)
        expect(ctx.stdout).to.contain(simCheckResource.charge_amount)
        expect(ctx.stdout).to.contain(simCheckResource.charge_currency)
        expect(ctx.stdout).to.contain(simCheckResource.status)
        expect(ctx.stdout).to.contain(simCheckResource.no_sim_change)
      },
    )
})
