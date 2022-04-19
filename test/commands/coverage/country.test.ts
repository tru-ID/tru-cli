import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import * as coverageAPIClientModules from '../../../src/api/CoverageAPIClient'
import {
  accessToken,
  globalConfig,
  projectConfig,
  projectConfigFileLocation,
} from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

const reachableCountryCode = 'US'
const unreachableCountryCode = 'IT'

let existsSyncStub: any
let readJsonStub: any

const reachResponse: coverageAPIClientModules.ICoverageCountryResponse = {
  country_code: 'US',
  dialing_code: 1,
  products: [
    {
      product_id: 'PCK',
      product_name: 'Phone Check',
      coverage: 'FULL',
      networks: [
        {
          network_id: '123123',
          network_name: 'ACME Networks',
          prices: [{ currency: 'API', amount: 1 }],
        },
      ],
    },
  ],
}

describe('coverage:country', () => {
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
          .get(new RegExp(`/coverage/v0.1/countries/${reachableCountryCode}`))
          .reply(200, reachResponse),
      )
      .do(() => {
        readJsonStub
          .withArgs(sinon.match(projectConfigFileLocation))
          .resolves({ ...projectConfig, data_residency: config_data_residency })
      })
      .stdout()
      .command(['coverage:country', reachableCountryCode])
      .it(
        `outputs result to cli.table for data_residency ${data_residency}`,
        (ctx) => {
          expect(ctx.stdout).to.contain(reachResponse.products[0].product_name)
          expect(ctx.stdout).to.contain(
            reachResponse.products[0].networks?.[0].network_id,
          )
          expect(ctx.stdout).to.contain(
            reachResponse.products[0].networks?.[0].network_name,
          )
          expect(ctx.stdout).to.contain(
            reachResponse.products[0].networks?.[0].prices?.[0].currency,
          )
          expect(ctx.stdout).to.contain(
            reachResponse.products[0].networks?.[0].prices?.[0].amount,
          )
        },
      )
  })

  test
    .nock('https://eu.api.tru.id', (api) =>
      api
        .persist()
        .post(new RegExp('/oauth2/v1/token*'))
        .reply(200, accessToken)
        .get(new RegExp(`/coverage/v0.1/countries/${unreachableCountryCode}`))
        .reply(404, {
          detail: 'No Reach',
        }),
    )
    .stdout()
    .command(['coverage:country', unreachableCountryCode])
    .it('outputs no reach result', (ctx) => {
      expect(ctx.stdout).to.contain('No reach')
    })

  test
    .do(() => {
      const projectWithoutRequiredScope = { ...projectConfig }
      projectWithoutRequiredScope.credentials[0].scopes = []
      readJsonStub
        .withArgs(sinon.match(projectConfigFileLocation))
        .resolves(projectWithoutRequiredScope)
    })
    .command(['coverage:country', 'anything'])
    .exit(1)
    .it('project must have coverage scope')
})
