import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import {
  CheckResource,
  IListCheckResource,
} from '../../../src/api/ChecksAPIClient'
import { CheckStatus } from '../../../src/api/CheckStatus'
import {
  accessToken,
  globalConfig,
  projectConfig,
  projectConfigFileLocation,
} from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

describe('phonechecks:list', () => {
  let readJsonStub: any

  const phoneCheckResource: CheckResource = {
    _links: {
      self: {
        href: 'https://us.api.tru.id/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002',
      },
    },
    charge_amount: 1,
    charge_currency: 'API',
    check_id: 'c69bc0e6-a429-11ea-bb37-0242ac130002',
    created_at: '2020-06-01T16:43:30+00:00',
    updated_at: '2020-06-01T16:43:30+00:00',
    match: false,
    status: CheckStatus.EXPIRED,
  }

  const checksListResource: IListCheckResource<CheckResource> = {
    _embedded: {
      checks: [phoneCheckResource],
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

  test
    .nock('https://eu.api.tru.id', (api) =>
      api
        .persist()
        .post(new RegExp('/oauth2/v1/token*'))
        .reply(200, accessToken)
        .get(new RegExp(`/phone_check/v0.1/checks*`))
        .reply(200, checksListResource),
    )
    .stdout()
    .command(['phonechecks:list'])
    .it('should contain header table output', (ctx) => {
      expect(ctx.stdout).to.contain('check_id')
      expect(ctx.stdout).to.contain('created_at')
      expect(ctx.stdout).to.contain('status')
      expect(ctx.stdout).to.contain('match')
      expect(ctx.stdout).to.contain('charge_currency')
      expect(ctx.stdout).to.contain('charge_amount')

      expect(ctx.stdout).to.contain('Page 1 of 1')
      expect(ctx.stdout).to.contain('PhoneChecks: 1 to 1 of 1')

      expect(ctx.stdout).to.contain(phoneCheckResource.check_id)
      expect(ctx.stdout).to.contain(phoneCheckResource.created_at)
      expect(ctx.stdout).to.contain(phoneCheckResource.charge_amount)
      expect(ctx.stdout).to.contain(phoneCheckResource.charge_currency)
      expect(ctx.stdout).to.contain(phoneCheckResource.match)
      expect(ctx.stdout).to.contain(phoneCheckResource.status)
    })

  test
    .nock('https://eu.api.tru.id', (api) =>
      api
        .persist()
        .post(new RegExp('/oauth2/v1/token*'))
        .reply(200, accessToken)
        .get(new RegExp(`/phone_check/v0.1/checks*`))
        .reply(200, phoneCheckResource),
    )
    .stdout()
    .command(['phonechecks:list', 'check_id_value'])
    .it('outputs result of a single resource to cli.table', (ctx) => {
      expect(ctx.stdout).to.contain(phoneCheckResource.check_id)
      expect(ctx.stdout).to.contain(phoneCheckResource.created_at)
      expect(ctx.stdout).to.contain(phoneCheckResource.charge_amount)
      expect(ctx.stdout).to.contain(phoneCheckResource.charge_currency)
      expect(ctx.stdout).to.contain(phoneCheckResource.match)
      expect(ctx.stdout).to.contain(phoneCheckResource.status)
    })
})
