import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import MockDate from 'mockdate'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import {
  IListUsageResource,
  UsageResource,
} from '../../../src/api/UsageAPIClient'
import { ConsoleLogger } from '../../../src/helpers/ConsoleLogger'
import { IGlobalAuthConfiguration } from '../../../src/IGlobalAuthConfiguration'
import { buildConsoleString } from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

const globalConfig: IGlobalAuthConfiguration = {
  selectedWorkspace: 'workspace_id',
  selectWorkspaceDataResidency: 'eu',
  tokenInfo: {
    refresh_token: 'refresh_token',
    scope: 'console offline_access openid',
  },
}

const usageResources: UsageResource[] = [
  {
    amount: 10,
    date: '2020-10-03',
    currency: 'API',
    counter: 10,
  },

  {
    amount: 20,
    date: '2020-10-02',
    currency: 'API',
    counter: 20,
  },
]

const listUsageResource: IListUsageResource = {
  _embedded: {
    usage: usageResources,
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
const testWorkspaceTokenNock = test.nock('https://login.tru.id', (api) => {
  api
    .persist()
    .post(
      new RegExp('/oauth2/token'),
      'grant_type=refresh_token&refresh_token=refresh_token&client_id=cli_hq',
    )
    .reply(200, {
      refresh_token: 'refresh_token',
      access_token: 'access_token',
      expires_in: 3599,
      scope: 'console offline_access openid',
      token_type: 'bearer',
    })
})

describe('usage', () => {
  let readJsonStub: any
  let consoleLoggerInfoStub: any

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
    consoleLoggerInfoStub = sinon.stub(ConsoleLogger.prototype, 'info')
    MockDate.set('2020-01-01')
  })

  afterEach(() => {
    sinon.restore()
    MockDate.reset()
  })

  const testParams = [
    { command: 'usage:daily', subpath: 'daily' },
    { command: 'usage:monthly', subpath: 'monthly' },
    { command: 'usage:hourly', subpath: 'hourly' },
  ]

  testParams.forEach(({ command, subpath }) => {
    testWorkspaceTokenNock
      .nock('https://eu.api.tru.id', (api) => {
        api
          .persist()
          .get(
            new RegExp(`console/v0.2/workspaces/workspace_id/usage/${subpath}`),
          )
          .query({
            search: 'date==2020-10-01',
            group_by: 'product_id',
            page: 1,
            size: 10,
          })
          .reply(200, listUsageResource)
      })
      .command([command, '--search=date==2020-10-01', '--group-by=product_id'])
      .it(
        `${command} should call with correct params /console/v0.2/workspaces/workspace_id/usage/${subpath}`,
        () => {
          const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

          expect(consoleOutputString).to.contain('amount')
          expect(consoleOutputString).to.contain('counter')
          expect(consoleOutputString).to.contain('date')
          expect(consoleOutputString).to.contain('currency')
        },
      )
  })

  testParams.forEach(({ command, subpath }) => {
    testWorkspaceTokenNock
      .nock('https://eu.api.tru.id', (api) => {
        api
          .persist()
          .get(
            new RegExp(`console/v0.2/workspaces/workspace_id/usage/${subpath}`),
          )
          .query({
            search: 'date==2020-10-01',
            page: 1,
            size: 10,
          })
          .reply(200, listUsageResource)
      })
      .command([command, '--search=date==2020-10-01', '--output=csv'])
      .it('table should contain correct values', () => {
        const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

        expect(consoleOutputString).to.contain('amount,date,currency,counter')
        expect(consoleOutputString).to.contain('10,2020-10-03,API,10')
        expect(consoleOutputString).to.contain('20,2020-10-02,API,20')
      })
  })

  const params = [
    {
      command: 'usage:daily',
      subpath: 'daily',
      searchParam: 'date>=2020-01-01',
    },
    {
      command: 'usage:monthly',
      subpath: 'monthly',
      searchParam: 'date>=2020-01',
    },
    {
      command: 'usage:hourly',
      subpath: 'hourly',
      searchParam: 'date>=2020-01-01',
    },
  ]

  params.forEach(({ command, subpath, searchParam }) => {
    testWorkspaceTokenNock
      .nock('https://eu.api.tru.id', (api) => {
        api
          .persist()
          .get(
            new RegExp(`console/v0.2/workspaces/workspace_id/usage/${subpath}`),
          )
          .query({
            search: `${searchParam}`,
            group_by: 'product_id',
            page: 1,
            size: 10,
          })
          .reply(200, listUsageResource)
      })
      .command([command, '--group-by=product_id'])
      .it(
        `${command} should call /console/v0.2/workspaces/workspace_id/usage/${subpath} with correct default search`,
        () => {
          const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

          expect(consoleOutputString).to.contain('amount')
          expect(consoleOutputString).to.contain('counter')
          expect(consoleOutputString).to.contain('date')
          expect(consoleOutputString).to.contain('currency')
        },
      )
  })
})
