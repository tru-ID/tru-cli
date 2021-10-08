import { test } from '@oclif/test'
import * as chai from 'chai'
import * as fs from 'fs-extra'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'ts-sinon'
import * as httpClientModule from '../../../src/api/HttpClient'
import {
  CheckTraceResource,
  IListCheckTracesResource,
} from '../../../src/api/TraceAPIClient'
import { ConsoleLogger } from '../../../src/helpers/ConsoleLogger'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import { IProjectConfiguration } from '../../../src/IProjectConfiguration'
import { buildConsoleString } from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

describe('checks:traces', () => {
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

  const traceResource: CheckTraceResource = {
    trace_id: '123',
    logs: [
      {
        timestamp: '2021-02-03T15:04:30.630Z',
        message: 'Check create: phone number is routable',
        attributes: {
          MNO: '12345',
        },
      },
      {
        timestamp: '2021-02-03T15:04:30.698Z',
        message: 'Check balance: authorized',
        attributes: {
          amount: 1,
          currency: 'EUR',
        },
      },
      {
        timestamp: '2021-02-03T15:04:30.705Z',
        message: 'Check create: contacting supplier',
        attributes: {
          MNO: '12345',
        },
      },
    ],
    _links: {
      self: {
        href: '/anycheck/v0.1/checks/check_id_value/traces/123',
      },
    },
  }

  const listTraceResource: IListCheckTracesResource = {
    _embedded: {
      traces: [traceResource],
    },

    _links: {
      self: {
        href: '/anycheck/v0.1/checks/check_id_value/traces',
      },
    },
  }

  const testParams = [
    { command: 'subscriberchecks:traces', basepath: 'subscriber_check' },
    { command: 'phonechecks:traces', basepath: 'phone_check' },
    { command: 'simchecks:traces', basepath: 'sim_check' },
  ]

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
        `/phone_check/v0.1/checks/check_id_value/traces`,
        sinon.default.match.any,
        sinon.default.match.any,
      )
      .resolves(listTraceResource)
    httpClientGetStub
      .withArgs(
        `/sim_check/v0.1/checks/check_id_value/traces`,
        sinon.default.match.any,
        sinon.default.match.any,
      )
      .resolves(listTraceResource)
    httpClientGetStub
      .withArgs(
        `/subscriber_check/v0.1/checks/check_id_value/traces`,
        sinon.default.match.any,
        sinon.default.match.any,
      )
      .resolves(listTraceResource)

    consoleLoggerInfoStub = sinon.default.stub(ConsoleLogger.prototype, 'info')
  })

  afterEach(() => {
    sinon.default.restore()
  })

  testParams.forEach(({ command, basepath }) => {
    test
      .command([command, 'check_id_value'])
      .it(
        `${command} should call /${basepath}/v0.1/checks/check_id_value/traces`,
        () => {
          expect(httpClientGetStub).to.be.calledWith(
            `/${basepath}/v0.1/checks/check_id_value/traces`,
            sinon.default.match.any,
            sinon.default.match.any,
          )
        },
      )
  })

  testParams.forEach(({ command }) => {
    test
      .command([command, 'check_id_value'])
      .it(`${command} should contain header table output`, () => {
        const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

        expect(consoleOutputString).to.contain('trace_id')
        expect(consoleOutputString).to.contain('timestamp')
        expect(consoleOutputString).to.contain('message')
      })
  })

  testParams.forEach(({ command }) => {
    test
      .command([command, 'check_id_value', '-x'])
      .it(`${command} should contain header table output`, () => {
        const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

        expect(consoleOutputString).to.contain('trace_id')
        expect(consoleOutputString).to.contain('timestamp')
        expect(consoleOutputString).to.contain('message')
        expect(consoleOutputString).to.contain('attributes')
      })
  })

  testParams.forEach(({ command }) => {
    test
      .command([command, 'check_id_value', '--output=csv'])
      .it('should contain correct values', () => {
        const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

        expect(consoleOutputString).to.contain('trace_id,timestamp,message')
        expect(consoleOutputString).to.contain(
          '123,2021-02-03T15:04:30.630Z,Check create: phone number is routable',
        )
        expect(consoleOutputString).to.contain(
          '123,2021-02-03T15:04:30.698Z,Check balance: authorized',
        )
        expect(consoleOutputString).to.contain(
          '123,2021-02-03T15:04:30.705Z,Check create: contacting supplier',
        )
      })
  })
})
