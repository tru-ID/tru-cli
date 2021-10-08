import { test } from '@oclif/test'
import * as chai from 'chai'
import * as fs from 'fs-extra'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'ts-sinon'
import { APIConfiguration } from '../../../src/api/APIConfiguration'
import { IListCheckResource } from '../../../src/api/ChecksAPIClient'
import { CheckStatus } from '../../../src/api/CheckStatus'
import * as httpClientModule from '../../../src/api/HttpClient'
import * as subscriberCheckAPIClientModules from '../../../src/api/SubscriberCheckAPIClient'
import { ConsoleLogger } from '../../../src/helpers/ConsoleLogger'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import { IProjectConfiguration } from '../../../src/IProjectConfiguration'
import { buildConsoleString } from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

describe('subscriberchecks:list', () => {
  let subscriberChecksApiClientConstructorStub: any
  let httpClientGetStub: any
  let readJsonStub: any
  let consoleLoggerInfoStub: any

  const expectedUserConfig: IGlobalConfiguration = {
    defaultWorkspaceClientId: 'my client id',
    defaultWorkspaceClientSecret: 'my client secret',
    defaultWorkspaceDataResidency: 'eu',
  }

  const projectConfigFileLocation = `${process.cwd()}/tru.json`

  const projectConfig: IProjectConfiguration = {
    project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
    name: 'My test project',
    created_at: '2020-06-01T16:43:30+00:00',
    updated_at: '2020-06-01T16:43:30+00:00',
    credentials: [
      {
        client_id: 'project client id',
        client_secret: 'project client secret',
        created_at: '2020-06-01T16:43:30+00:00',
      },
    ],
  }

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

  beforeEach(() => {
    sinon.default
      .stub(fs, 'existsSync')
      .withArgs(sinon.default.match(new RegExp(/config.json/)))
      .returns(true)

    readJsonStub = sinon.default.stub(fs, 'readJson')

    readJsonStub
      .withArgs(
        sinon.default.match(sinon.default.match(new RegExp(/config.json/))),
      )
      .resolves(expectedUserConfig)

    readJsonStub
      .withArgs(sinon.default.match(projectConfigFileLocation))
      .resolves(projectConfig)

    httpClientGetStub = sinon.default.stub(
      httpClientModule.HttpClient.prototype,
      'get',
    )
    httpClientGetStub
      .withArgs(
        '/subscriber_check/v0.1/checks',
        sinon.default.match.any,
        sinon.default.match.any,
      )
      .resolves(subscriberListCheckResource)
    httpClientGetStub
      .withArgs(
        `/subscriber_check/v0.1/checks/${subscriberCheckResource.check_id}`,
        sinon.default.match.any,
        sinon.default.match.any,
      )
      .resolves(subscriberCheckResource)
    httpClientGetStub
      .withArgs(
        `/subscriber_check/v0.1/checks/check_id_value`,
        sinon.default.match.any,
        sinon.default.match.any,
      )
      .resolves(subscriberCheckResource)

    consoleLoggerInfoStub = sinon.default.stub(ConsoleLogger.prototype, 'info')
  })

  afterEach(() => {
    sinon.default.restore()
  })

  test
    .do(() => {
      subscriberChecksApiClientConstructorStub = sinon.default.spy(
        subscriberCheckAPIClientModules,
        'SubscriberCheckAPIClient',
      )
    })
    .command(['subscriberchecks:list'])
    .it(
      'subscriberchecks/list/SubscriberCheckAPIClient: it should instantiate SubscriberCheckAPIClient with expected arguments',
      () => {
        expect(subscriberChecksApiClientConstructorStub).to.be.calledWith(
          sinon.default.match.instanceOf(APIConfiguration),
        )
      },
    )

  test
    .command(['subscriberchecks:list'])
    .it(
      'subscriberchecks/list/SubscriberCheckAPIClient.list: should call SubscriberCheckAPIClient.list() if optional check_id argment is not supplied',
      () => {
        expect(httpClientGetStub).to.be.calledWith(
          '/subscriber_check/v0.1/checks',
          sinon.default.match.any,
          sinon.default.match.any,
        )
      },
    )

  test
    .command(['subscriberchecks:list', 'check_id_value'])
    .it(
      'should call SubscriberChecksAPIClient.get(checkId) if optional check_id argment is supplied',
      () => {
        expect(httpClientGetStub).to.be.calledWith(
          '/subscriber_check/v0.1/checks/check_id_value',
          sinon.default.match.any,
          sinon.default.match.any,
        )
      },
    )

  test
    .command(['subscriberchecks:list'])
    .it('should contain header table output', () => {
      const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

      expect(consoleOutputString).to.contain('check_id')
      expect(consoleOutputString).to.contain('created_at')
      expect(consoleOutputString).to.contain('status')
      expect(consoleOutputString).to.contain('match')
      expect(consoleOutputString).to.contain('charge_currency')
      expect(consoleOutputString).to.contain('charge_amount')
      expect(consoleOutputString).to.contain('no_sim_change')
    })

  test
    .command(['subscriberchecks:list'])
    .it('should contain pagination output', () => {
      const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

      expect(consoleOutputString).to.contain('Page 1 of 1')
      expect(consoleOutputString).to.contain('SubscriberChecks: 1 to 1 of 1')
    })

  test
    .command(['subscriberchecks:list'])
    .it('outputs resource list to cli.table', () => {
      const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

      expect(consoleOutputString).to.contain(subscriberCheckResource.check_id)
      expect(consoleOutputString).to.contain(subscriberCheckResource.created_at)
      expect(consoleOutputString).to.contain(
        subscriberCheckResource.charge_amount,
      )
      expect(consoleOutputString).to.contain(
        subscriberCheckResource.charge_currency,
      )
      expect(consoleOutputString).to.contain(subscriberCheckResource.match)
      expect(consoleOutputString).to.contain(subscriberCheckResource.status)
      expect(consoleOutputString).to.contain(
        subscriberCheckResource.no_sim_change,
      )
    })

  test
    .command(['subscriberchecks:list', 'check_id_value'])
    .it('outputs result of a single resource to cli.table', () => {
      const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

      expect(consoleOutputString).to.contain(subscriberCheckResource.check_id)
      expect(consoleOutputString).to.contain(subscriberCheckResource.created_at)
      expect(consoleOutputString).to.contain(
        subscriberCheckResource.charge_amount,
      )
      expect(consoleOutputString).to.contain(
        subscriberCheckResource.charge_currency,
      )
      expect(consoleOutputString).to.contain(subscriberCheckResource.match)
      expect(consoleOutputString).to.contain(subscriberCheckResource.status)
      expect(consoleOutputString).to.contain(
        subscriberCheckResource.no_sim_change,
      )
    })
})
