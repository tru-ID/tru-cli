import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { IListCheckResource } from '../../../src/api/ChecksAPIClient'
import { CheckStatus } from '../../../src/api/CheckStatus'
import * as subscriberCheckAPIClientModules from '../../../src/api/SubscriberCheckAPIClient'
import {
  accessToken,
  globalConfig,
  projectConfig,
  projectConfigFileLocation,
} from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

const subscriberCheckResource: subscriberCheckAPIClientModules.SubscriberCheckResource =
  {
    _links: {
      self: {
        href: 'https://us.api.tru.id/subscriber_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002',
      },
    },
    charge_amount: 1,
    charge_currency: 'API',
    check_id: 'c69bc0e6-a429-11ea-bb37-0242ac130002',
    created_at: '2020-06-01T16:43:30+00:00',
    updated_at: '2020-06-01T16:43:30+00:00',
    match: false,
    no_sim_change: true,
    status: CheckStatus.ACCEPTED,
  }

const subscriberListCheckResource: IListCheckResource<subscriberCheckAPIClientModules.SubscriberCheckResource> =
  {
    _embedded: {
      checks: [subscriberCheckResource],
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

describe('subscriberchecks:list', () => {
  let readJsonStub: any

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
          .get(new RegExp('/subscriber_check/v0.1/checks*'))
          .reply(200, subscriberListCheckResource),
      )
      .do(() => {
        readJsonStub.withArgs(sinon.match(projectConfigFileLocation)).resolves({
          ...projectConfig,
          data_residency: config_data_residency,
        })
      })
      .stdout()
      .command(['subscriberchecks:list'])
      .it(`should display results for ${data_residency}`, (ctx) => {
        expect(ctx.stdout).to.contain('check_id')
        expect(ctx.stdout).to.contain('created_at')
        expect(ctx.stdout).to.contain('status')
        expect(ctx.stdout).to.contain('match')
        expect(ctx.stdout).to.contain('charge_currency')
        expect(ctx.stdout).to.contain('charge_amount')
        expect(ctx.stdout).to.contain('no_sim_change')
        expect(ctx.stdout).to.contain('Page 1 of 1')
        expect(ctx.stdout).to.contain('SubscriberChecks: 1 to 1 of 1')
        expect(ctx.stdout).to.contain(subscriberCheckResource.check_id)
        expect(ctx.stdout).to.contain(subscriberCheckResource.created_at)
        expect(ctx.stdout).to.contain(subscriberCheckResource.charge_amount)
        expect(ctx.stdout).to.contain(subscriberCheckResource.charge_currency)
        expect(ctx.stdout).to.contain(subscriberCheckResource.match)
        expect(ctx.stdout).to.contain(subscriberCheckResource.status)
        expect(ctx.stdout).to.contain(subscriberCheckResource.no_sim_change)
      })
  })

  test
    .nock('https://eu.api.tru.id', (api) =>
      api
        .persist()
        .post(new RegExp('/oauth2/v1/token*'))
        .reply(200, accessToken)
        .get('/subscriber_check/v0.1/checks/check_id_value')
        .reply(200, subscriberCheckResource),
    )
    .stdout()
    .command(['subscriberchecks:list', 'check_id_value'])
    .it(
      'should call SubscriberChecksAPIClient.get(checkId) if optional check_id argment is supplied',
      (ctx) => {
        expect(ctx.stdout).to.contain(subscriberCheckResource.check_id)
        expect(ctx.stdout).to.contain(subscriberCheckResource.created_at)
        expect(ctx.stdout).to.contain(subscriberCheckResource.charge_amount)
        expect(ctx.stdout).to.contain(subscriberCheckResource.charge_currency)
        expect(ctx.stdout).to.contain(subscriberCheckResource.match)
        expect(ctx.stdout).to.contain(subscriberCheckResource.status)
        expect(ctx.stdout).to.contain(subscriberCheckResource.no_sim_change)
      },
    )
})
