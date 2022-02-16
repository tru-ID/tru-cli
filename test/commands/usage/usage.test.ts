import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import MockDate from 'mockdate'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import * as httpClientModule from '../../../src/api/HttpClient'
import {
  IListUsageResource,
  UsageResource,
} from '../../../src/api/UsageAPIClient'
import { ConsoleLogger } from '../../../src/helpers/ConsoleLogger'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import { buildConsoleString } from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

describe('usage', () => {
  let readJsonStub: any
  let consoleLoggerInfoStub: any

  let httpClientGetStub: any

  const expectedUserConfig: IGlobalConfiguration = {
    defaultWorkspaceClientId: 'my client id',
    defaultWorkspaceClientSecret: 'my client secret',
    defaultWorkspaceDataResidency: 'eu',
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

  const testParams = [
    { command: 'usage:daily', subpath: 'daily' },
    { command: 'usage:monthly', subpath: 'monthly' },
    { command: 'usage:hourly', subpath: 'hourly' },
  ]

  beforeEach(() => {
    sinon
      .stub(fs, 'existsSync')
      .withArgs(sinon.match(new RegExp(/config.json/)))
      .returns(true)

    readJsonStub = sinon.stub(fs, 'readJson')

    readJsonStub
      .withArgs(sinon.match(sinon.match(new RegExp(/config.json/))))
      .resolves(expectedUserConfig)

    httpClientGetStub = sinon.stub(httpClientModule.HttpClient.prototype, 'get')
    httpClientGetStub
      .withArgs(
        '/console/v0.1/workspaces/default/usage/daily',
        sinon.match.any,
        sinon.match.any,
      )
      .resolves(listUsageResource)
    httpClientGetStub
      .withArgs(
        `/console/v0.1/workspaces/default/usage/monthly`,
        sinon.match.any,
        sinon.match.any,
      )
      .resolves(listUsageResource)
    httpClientGetStub
      .withArgs(
        `/console/v0.1/workspaces/default/usage/hourly`,
        sinon.match.any,
        sinon.match.any,
      )
      .resolves(listUsageResource)

    consoleLoggerInfoStub = sinon.stub(ConsoleLogger.prototype, 'info')
    MockDate.set('2020-01-01')
  })

  afterEach(() => {
    sinon.restore()
    MockDate.reset()
  })

  testParams.forEach(({ command, subpath }) => {
    test
      .command([command, '--search=date=2020-10-01', '--group-by=product_id'])
      .it(
        `${command} should call /console/v0.1/workspaces/default/usage/${subpath}`,
        () => {
          expect(httpClientGetStub).to.be.calledWith(
            `/console/v0.1/workspaces/default/usage/${subpath}`,
            {
              search: 'date=2020-10-01',
              group_by: 'product_id',
              page: 1,
              size: 10,
            },
            sinon.match.any,
          )
        },
      )
  })

  testParams.forEach(({ command }) => {
    test
      .command([command, '--search=date=2020-10-01'])
      .it(`${command} should contain header table output`, () => {
        const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

        expect(consoleOutputString).to.contain('amount')
        expect(consoleOutputString).to.contain('counter')
        expect(consoleOutputString).to.contain('date')
        expect(consoleOutputString).to.contain('currency')
      })
  })

  {
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
      test
        .command([command, '--group-by=product_id'])
        .it(
          `${command} should call /console/v0.1/workspaces/default/usage/${subpath} with correct default search`,
          () => {
            expect(httpClientGetStub).to.be.calledWith(
              `/console/v0.1/workspaces/default/usage/${subpath}`,
              {
                search: searchParam,
                group_by: 'product_id',
                page: 1,
                size: 10,
              },
              sinon.match.any,
            )
          },
        )
    })
  }

  testParams.forEach(({ command }) => {
    test
      .command([command, '--search=date=2020-10-01', '--output=csv'])
      .it('should contain correct values', () => {
        const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

        expect(consoleOutputString).to.contain('amount,date,currency,counter')
        expect(consoleOutputString).to.contain('10,2020-10-03,API,10')
        expect(consoleOutputString).to.contain('20,2020-10-02,API,20')
      })
  })
})
