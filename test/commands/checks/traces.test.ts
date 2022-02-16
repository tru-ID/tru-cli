import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
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
    {
      command: 'subscriberchecks:traces',
      basepath: 'subscriber_check',
      version: 'v0.1',
    },
    { command: 'phonechecks:traces', basepath: 'phone_check', version: 'v0.1' },
    { command: 'simchecks:traces', basepath: 'sim_check', version: 'v0.1' },
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

    readJsonStub
      .withArgs(sinon.match(projectConfigFileLocation))
      .resolves(projectConfig)

    httpClientGetStub = sinon.stub(httpClientModule.HttpClient.prototype, 'get')
    httpClientGetStub
      .withArgs(
        `/phone_check/v0.1/checks/check_id_value/traces`,
        sinon.match.any,
        sinon.match.any,
      )
      .resolves(listTraceResource)
    httpClientGetStub
      .withArgs(
        `/sim_check/v0.1/checks/check_id_value/traces`,
        sinon.match.any,
        sinon.match.any,
      )
      .resolves(listTraceResource)
    httpClientGetStub
      .withArgs(
        `/subscriber_check/v0.1/checks/check_id_value/traces`,
        sinon.match.any,
        sinon.match.any,
      )
      .resolves(listTraceResource)

    consoleLoggerInfoStub = sinon.stub(ConsoleLogger.prototype, 'info')
  })

  afterEach(() => {
    sinon.restore()
  })

  testParams.forEach(({ command, basepath, version }) => {
    test
      .command([command, 'check_id_value'])
      .it(
        `${command} should call /${basepath}/${version}/checks/check_id_value/traces`,
        () => {
          expect(httpClientGetStub).to.be.calledWith(
            `/${basepath}/${version}/checks/check_id_value/traces`,
            sinon.match.any,
            sinon.match.any,
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
