import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { APIConfiguration } from '../../../src/api/APIConfiguration'
import { CheckStatus } from '../../../src/api/CheckStatus'
import * as httpClientModule from '../../../src/api/HttpClient'
import * as simchecks from '../../../src/api/SimCheckAPIClient'
import { ConsoleLogger } from '../../../src/helpers/ConsoleLogger'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import { IProjectConfiguration } from '../../../src/IProjectConfiguration'
import { buildConsoleString } from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

describe('simchecks:list', () => {
  let simChecksApiClientConstructorStub: any
  let readJsonStub: any
  let consoleLoggerInfoStub: any
  let httpClientGetStub: any

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
      .resolves(expectedUserConfig)

    readJsonStub
      .withArgs(sinon.match(projectConfigFileLocation))
      .resolves(projectConfig)

    httpClientGetStub = sinon.stub(httpClientModule.HttpClient.prototype, 'get')
    httpClientGetStub
      .withArgs('/sim_check/v0.1/checks', sinon.match.any, sinon.match.any)
      .resolves(listResource)
    httpClientGetStub
      .withArgs(
        `/sim_check/v0.1/checks/${simCheckResource.check_id}`,
        sinon.match.any,
        sinon.match.any,
      )
      .resolves(simCheckResource)
    httpClientGetStub
      .withArgs(
        `/sim_check/v0.1/checks/check_id_value`,
        sinon.match.any,
        sinon.match.any,
      )
      .resolves(simCheckResource)

    consoleLoggerInfoStub = sinon.stub(ConsoleLogger.prototype, 'info')
  })

  afterEach(() => {
    sinon.restore()
  })

  test
    .do(() => {
      simChecksApiClientConstructorStub = sinon.spy(
        simchecks,
        'SimCheckAPIClient',
      )
    })
    .command(['simchecks:list'])
    .it(
      'SimCheckAPIClient: it should instantiate SimCheckAPIClient with expected arguments',
      () => {
        expect(simChecksApiClientConstructorStub).to.be.calledWith(
          sinon.match.instanceOf(APIConfiguration),
        )
      },
    )

  test
    .command(['simchecks:list'])
    .it(
      'SimCheckAPIClient: should call SimCheckAPIClient.list() if optional check_id argment is not supplied',
      () => {
        expect(httpClientGetStub).to.be.calledWith(
          '/sim_check/v0.1/checks',
          sinon.match.any,
          sinon.match.any,
        )
      },
    )

  test
    .command(['simchecks:list', 'check_id_value'])
    .it(
      'should call SimCheckAPIClient.get(checkId) if optional check_id argment is supplied',
      () => {
        expect(httpClientGetStub).to.be.calledWith(
          '/sim_check/v0.1/checks/check_id_value',
          sinon.match.any,
          sinon.match.any,
        )
      },
    )

  test
    .command(['simchecks:list'])
    .it('should contain header table output', () => {
      const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

      expect(consoleOutputString).to.contain('check_id')
      expect(consoleOutputString).to.contain('created_at')
      expect(consoleOutputString).to.contain('status')
      expect(consoleOutputString).to.contain('charge_currency')
      expect(consoleOutputString).to.contain('charge_amount')
      expect(consoleOutputString).to.contain('no_sim_change')
    })

  test
    .command(['simchecks:list'])
    .it('should contain pagination output', () => {
      const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

      expect(consoleOutputString).to.contain('Page 1 of 1')
      expect(consoleOutputString).to.contain('SIMChecks: 1 to 1 of 1')
    })

  test
    .command(['simchecks:list'])
    .it('outputs resource list to cli.table', () => {
      const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

      expect(consoleOutputString).to.contain(simCheckResource.check_id)
      expect(consoleOutputString).to.contain(simCheckResource.created_at)
      expect(consoleOutputString).to.contain(simCheckResource.charge_amount)
      expect(consoleOutputString).to.contain(simCheckResource.charge_currency)
      expect(consoleOutputString).to.contain(simCheckResource.status)
      expect(consoleOutputString).to.contain(simCheckResource.no_sim_change)
    })

  test
    .command(['simchecks:list', `${simCheckResource.check_id}`])
    .it('outputs result of a single resource to cli.table', () => {
      const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

      expect(consoleOutputString).to.contain(simCheckResource.check_id)
      expect(consoleOutputString).to.contain(simCheckResource.created_at)
      expect(consoleOutputString).to.contain(simCheckResource.charge_amount)
      expect(consoleOutputString).to.contain(simCheckResource.charge_currency)
      expect(consoleOutputString).to.contain(simCheckResource.status)
      expect(consoleOutputString).to.contain(simCheckResource.no_sim_change)
    })
})
