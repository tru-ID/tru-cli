import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import {
  CheckTraceResource,
  IListCheckTracesResource,
} from '../../../src/api/TraceAPIClient'
import {
  accessToken,
  globalConfig,
  projectConfig,
  projectConfigFileLocation,
} from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

describe('checks:traces', () => {
  let readJsonStub: any

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
      .resolves(globalConfig)

    readJsonStub
      .withArgs(sinon.match(projectConfigFileLocation))
      .resolves(projectConfig)
  })

  afterEach(() => {
    sinon.restore()
  })

  testParams.forEach(({ command, basepath, version }) => {
    test
      .nock('https://eu.api.tru.id', (api) =>
        api
          .persist()
          .post(new RegExp('/oauth2/v1/token*'))
          .reply(200, accessToken)
          .get(new RegExp(`/${basepath}/v0.1/checks/check_id_value/traces`))
          .reply(200, listTraceResource),
      )
      .stdout()
      .command([command, 'check_id_value'])
      .it(
        `${command} should call /${basepath}/${version}/checks/check_id_value/traces`,
        (ctx) => {
          expect(ctx.stdout).to.contain('trace_id')
          expect(ctx.stdout).to.contain('timestamp')
          expect(ctx.stdout).to.contain('message')
        },
      )
  })

  testParams.forEach(({ command, basepath }) => {
    test
      .nock('https://eu.api.tru.id', (api) =>
        api
          .persist()
          .post(new RegExp('/oauth2/v1/token*'))
          .reply(200, accessToken)
          .get(new RegExp(`/${basepath}/v0.1/checks/check_id_value/traces`))
          .reply(200, listTraceResource),
      )
      .stdout()
      .command([command, 'check_id_value', '-x'])
      .it(`${command} should contain header table output`, (ctx) => {
        expect(ctx.stdout).to.contain('trace_id')
        expect(ctx.stdout).to.contain('timestamp')
        expect(ctx.stdout).to.contain('message')
        expect(ctx.stdout).to.contain('attributes')
      })
  })

  testParams.forEach(({ command, basepath }) => {
    test
      .nock('https://eu.api.tru.id', (api) =>
        api
          .persist()
          .post(new RegExp('/oauth2/v1/token*'))
          .reply(200, accessToken)
          .get(new RegExp(`/${basepath}/v0.1/checks/check_id_value/traces`))
          .reply(200, listTraceResource),
      )
      .stdout()
      .command([command, 'check_id_value', '--output=csv'])
      .it('should contain correct values', (ctx) => {
        expect(ctx.stdout).to.contain('trace_id,timestamp,message')
        expect(ctx.stdout).to.contain(
          '123,2021-02-03T15:04:30.630Z,Check create: phone number is routable',
        )
        expect(ctx.stdout).to.contain(
          '123,2021-02-03T15:04:30.698Z,Check balance: authorized',
        )
        expect(ctx.stdout).to.contain(
          '123,2021-02-03T15:04:30.705Z,Check create: contacting supplier',
        )
      })
  })
})
