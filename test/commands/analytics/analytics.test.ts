import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import MockDate from 'mockdate'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import {
  AnalyticsResource,
  IListAnalyticsResource,
} from '../../../src/api/AnalyticsAPIClient'
import { ConsoleLogger } from '../../../src/helpers/ConsoleLogger'
import { IGlobalAuthConfiguration } from '../../../src/IGlobalAuthConfiguration'
import { buildConsoleString } from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

const globalConfig: IGlobalAuthConfiguration = {
  selectedWorkspace: 'workspace_id',
  selectedWorkspaceDataResidency: 'eu',
  tokenInfo: {
    refreshToken: 'refresh_token',
    scope: 'console offline_access openid',
  },
}

const analyticsResourcesPck: AnalyticsResource[] = [
  {
    product_id: 'PCK',
    workspace_id: 'workspace_id',
    status: 'COMPLETED',
    match: true,
    counter: 10,
    date: '2020-10-03',
  },

  {
    product_id: 'PCK',
    workspace_id: 'workspace_id',
    status: 'ERROR',
    match: false,
    counter: 20,
    date: '2020-10-02',
  },
]

const analyticsResourcesSck: AnalyticsResource[] = [
  {
    product_id: 'SCK',
    workspace_id: 'workspace_id',
    status: 'COMPLETED',
    no_sim_change: true,
    counter: 10,
    date: '2020-10-03',
  },

  {
    product_id: 'SCK',
    workspace_id: 'workspace_id',
    status: 'ERROR',
    no_sim_change: false,
    counter: 20,
    date: '2020-10-02',
  },
]

const analyticsResourcesSuk: AnalyticsResource[] = [
  {
    product_id: 'SUK',
    workspace_id: 'workspace_id',
    status: 'COMPLETED',
    match: true,
    no_sim_change: true,
    counter: 10,
    date: '2020-10-03',
  },

  {
    product_id: 'SUK',
    workspace_id: 'workspace_id',
    status: 'ERROR',
    match: false,
    no_sim_change: false,
    counter: 20,
    date: '2020-10-02',
  },
]

const listAnalyticsResourcePck: IListAnalyticsResource = {
  _embedded: {
    analytics: analyticsResourcesPck,
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

const listAnalyticsResourceSck: IListAnalyticsResource = {
  _embedded: {
    analytics: analyticsResourcesSck,
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

const listAnalyticsResourceSuk: IListAnalyticsResource = {
  _embedded: {
    analytics: analyticsResourcesSuk,
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

describe('analytics', () => {
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
    {
      command: 'analytics:pck:daily',
      subpath: 'pck/daily',
      responseList: listAnalyticsResourcePck,
    },
    {
      command: 'analytics:pck:monthly',
      subpath: 'pck/monthly',
      responseList: listAnalyticsResourcePck,
    },
    {
      command: 'analytics:pck:hourly',
      subpath: 'pck/hourly',
      responseList: listAnalyticsResourcePck,
    },
    {
      command: 'analytics:sck:daily',
      subpath: 'sck/daily',
      responseList: listAnalyticsResourceSck,
    },
    {
      command: 'analytics:sck:monthly',
      subpath: 'sck/monthly',
      responseList: listAnalyticsResourceSck,
    },
    {
      command: 'analytics:sck:hourly',
      subpath: 'sck/hourly',
      responseList: listAnalyticsResourceSck,
    },
    {
      command: 'analytics:suk:daily',
      subpath: 'suk/daily',
      responseList: listAnalyticsResourceSuk,
    },
    {
      command: 'analytics:suk:monthly',
      subpath: 'suk/monthly',
      responseList: listAnalyticsResourceSuk,
    },
    {
      command: 'analytics:suk:hourly',
      subpath: 'suk/hourly',
      responseList: listAnalyticsResourceSuk,
    },
  ]

  testParams.forEach(({ command, subpath, responseList }) => {
    testWorkspaceTokenNock
      .nock('https://eu.api.tru.id', (api) => {
        api
          .persist()
          .get(
            new RegExp(
              `console/v0.2/workspaces/workspace_id/analytics/${subpath}`,
            ),
          )
          .query({
            search: 'date>=2020-10-01',
            page: 1,
            size: 10,
          })
          .reply(200, responseList)
      })
      .command([command, '--search=date>=2020-10-01'])
      .it(
        `${command} should call with correct params /console/v0.2/workspaces/workspace_id/analytics/${subpath}`,
        () => {
          const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

          expect(consoleOutputString).to.contain('product_id')
          expect(consoleOutputString).to.contain('workspace_id')
          expect(consoleOutputString).to.contain('status')
          expect(consoleOutputString).to.contain('counter')
          expect(consoleOutputString).to.contain('date')
          if (!subpath.includes('sck'))
            expect(consoleOutputString).to.contain('match')
          if (!subpath.includes('pck'))
            expect(consoleOutputString).to.contain('no_sim_change')
        },
      )
  })

  testParams.forEach(({ command, subpath, responseList }) => {
    testWorkspaceTokenNock
      .nock('https://eu.api.tru.id', (api) => {
        api
          .persist()
          .get(
            new RegExp(
              `console/v0.2/workspaces/workspace_id/analytics/${subpath}`,
            ),
          )
          .query({
            search: 'date>=2020-10-01',
            page: 1,
            size: 10,
          })
          .reply(200, responseList)
      })
      .command([command, '--search=date>=2020-10-01', '--output=csv'])
      .it('table should contain correct values', () => {
        const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

        if (subpath.includes('pck')) {
          expect(consoleOutputString).to.contain(
            'product_id,workspace_id,status,match,counter,date',
          )
          expect(consoleOutputString).to.contain(
            'PCK,workspace_id,COMPLETED,true,10,2020-10-03',
          )
          expect(consoleOutputString).to.contain(
            'PCK,workspace_id,ERROR,false,20,2020-10-02',
          )
          return
        }

        if (subpath.includes('sck')) {
          expect(consoleOutputString).to.contain(
            'product_id,workspace_id,status,no_sim_change,counter,date',
          )
          expect(consoleOutputString).to.contain(
            'SCK,workspace_id,COMPLETED,true,10,2020-10-03',
          )
          expect(consoleOutputString).to.contain(
            'SCK,workspace_id,ERROR,false,20,2020-10-02',
          )
          return
        }

        if (subpath.includes('suk')) {
          expect(consoleOutputString).to.contain(
            'product_id,workspace_id,status,match,no_sim_change,counter,date',
          )
          expect(consoleOutputString).to.contain(
            'SUK,workspace_id,COMPLETED,true,true,10,2020-10-03',
          )
          expect(consoleOutputString).to.contain(
            'SUK,workspace_id,ERROR,false,false,20,2020-10-02',
          )
          return
        }
      })
  })
})
