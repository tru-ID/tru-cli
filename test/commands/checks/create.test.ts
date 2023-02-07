import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import path from 'path'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { CheckStatus } from '../../../src/api/CheckStatus'
import CommandWithProjectConfig from '../../../src/helpers/CommandWithProjectConfig'
import {
  accessToken,
  globalConfig,
  projectConfig,
  projectConfigFileLocation,
} from '../../test_helpers'
import { CreateSubscriberCheckResponse } from '../../../src/api/SubscriberCheckAPIClient'
import { CreatePhoneCheckResponse } from '../../../src/api/PhoneChecksAPIClient'

const expect = chai.expect
chai.use(sinonChai)

const createSubscriberCheckResponse: CreateSubscriberCheckResponse = {
  check_id: 'c69bc0e6-a429-11ea-bb37-0242ac130002',
  url: 'https://us.api.tru.id/subscriber_check/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002/redirect',
  status: CheckStatus.ACCEPTED,
  charge_amount: 1,
  charge_currency: 'API',
  created_at: '2020-06-01T16:43:30+00:00',
  ttl: 60,
  _links: {
    self: {
      href: 'https://us.api.tru.id/subscriber_check/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002',
    },
    check_url: {
      href: 'https://us.api.tru.id/subscriber_check/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002/redirect',
    },
  },
  snapshot_balance: 100,
}

const createPhoneCheckResponse: CreatePhoneCheckResponse = {
  check_id: 'c69bc0e6-a429-11ea-bb37-0242ac130002',
  url: 'https://us.api.tru.id/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002/redirect',
  status: CheckStatus.ACCEPTED,
  charge_amount: 1,
  charge_currency: 'API',
  created_at: '2020-06-01T16:43:30+00:00',
  ttl: 60,
  _links: {
    self: {
      href: 'https://us.api.tru.id/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002',
    },
    check_url: {
      href: 'https://us.api.tru.id/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002/redirect',
    },
  },
  snapshot_balance: 100,
}

let existsSyncStub: any
let readJsonStub: any
let inquirerStub: any

const phoneNumberToTest = '447700900000'

const params = [
  {
    typeOfCheck: 'SubscriberCheck',
    command: 'subscriberchecks:create',
    scope: 'subscriber_check',
  },
  {
    command: 'phonechecks:create',
    typeOfCheck: 'PhoneCheck',
    scope: 'phone_check',
  },
]

describe('PhoneCheck and SubscriberCheck Create Scenarios', () => {
  beforeEach(() => {
    existsSyncStub = sinon.stub(fs, 'existsSync')
    existsSyncStub
      .withArgs(sinon.match(new RegExp(/config.json/)))
      .returns(true)

    readJsonStub = sinon.stub(fs, 'readJson')

    readJsonStub
      .withArgs(sinon.match(sinon.match(new RegExp(/config.json/))))
      .resolves(globalConfig)

    readJsonStub
      .withArgs(sinon.match(projectConfigFileLocation))
      .resolves(projectConfig)

    inquirerStub = sinon.stub(inquirer, 'prompt')
  })

  afterEach(() => {
    sinon.restore()
  })

  {
    params.forEach(({ command }) => {
      test
        .do(() => {
          existsSyncStub.withArgs(projectConfigFileLocation).returns(false)
        })
        .stdout()
        .command([command, phoneNumberToTest])
        .exit(1)
        .it(
          `${command} -- an error is logged when the process.cwd() project configuration is not present`,
          (ctx) => {
            expect(ctx.stdout).to.contain(
              `A project configuration file does not exist at "${projectConfigFileLocation}"`,
            )
          },
        )
    })
  }

  {
    const customProjectConfigDirPath = path.join('alternative', 'path', 'to')
    const customProjectConfigFullPath = path.join(
      'alternative',
      'path',
      'to',
      'tru.json',
    )

    params.forEach(({ command, scope }) => {
      test
        .nock('https://eu.api.tru.id', (api) =>
          api
            .persist()
            .post(new RegExp('/oauth2/v1/token*'))
            .reply(200, accessToken)
            .post(new RegExp(`/${scope}/v0.1/checks*`), {
              phone_number: phoneNumberToTest,
            })
            .reply(
              200,
              scope === 'subscriber_check'
                ? createSubscriberCheckResponse
                : createPhoneCheckResponse,
            ),
        )
        .do(() => {
          readJsonStub
            .withArgs(sinon.match(customProjectConfigFullPath))
            .resolves(projectConfig)
        })
        .stdout()
        .command([
          command,
          phoneNumberToTest,
          `--${CommandWithProjectConfig.projectDirFlagName}=${customProjectConfigDirPath}`,
        ])
        .it(
          `${command} -- should load the project configuration from the location specified by the ${CommandWithProjectConfig.projectDirFlagName} flag`,
          () => {
            expect(readJsonStub).to.have.been.calledWith(
              customProjectConfigFullPath,
            )
          },
        )
    })
  }

  {
    params.forEach(({ command, scope }) => {
      test
        .nock('https://eu.api.tru.id', (api) =>
          api
            .persist()
            .post(new RegExp('/oauth2/v1/token*'))
            .reply(200, accessToken)
            .post(new RegExp(`/${scope}/v0.1/checks*`), {
              phone_number: phoneNumberToTest,
            })
            .reply(
              200,
              scope === 'subscriber_check'
                ? createSubscriberCheckResponse
                : createPhoneCheckResponse,
            ),
        )
        .command([command, phoneNumberToTest])
        .it(`${command} -- project configuration is read`, () => {
          expect(readJsonStub).to.have.been.calledWith(
            projectConfigFileLocation,
          )
        })
    })
  }

  {
    params.forEach(({ command, typeOfCheck, scope }) => {
      test
        .nock('https://eu.api.tru.id', (api) =>
          api
            .persist()
            .post(new RegExp('/oauth2/v1/token*'))
            .reply(200, accessToken)
            .post(new RegExp(`/${scope}/v0.1/checks*`), {
              phone_number: phoneNumberToTest,
            })
            .reply(
              200,
              scope === 'subscriber_check'
                ? createSubscriberCheckResponse
                : createPhoneCheckResponse,
            ),
        )
        .do(() => {
          inquirerStub.resolves({ phone_number: phoneNumberToTest })
        })
        .command([command])
        .it(
          `${command} -- prompts the user for a ${typeOfCheck} to check when an inline argument is not provided`,
          () => {
            expect(inquirerStub).to.have.been.calledWith([
              {
                name: 'phone_number',
                message: `Please enter the phone number you would like to ${typeOfCheck}`,
                type: 'input',
                filter: sinon.match.func,
                validate: sinon.match.func,
              },
            ])
          },
        )
    })
  }

  {
    const params = [
      {
        typeOfCheck: 'SubscriberCheck',
        command: 'subscriberchecks:create',
        scope: 'subscriber_check',
      },
      {
        command: 'phonechecks:create',
        typeOfCheck: 'PhoneCheck',
        scope: 'phone_check',
      },
    ]
    params.forEach(({ command, typeOfCheck, scope }) => {
      test
        .nock('https://eu.api.tru.id', (api) =>
          api
            .persist()
            .post(new RegExp('/oauth2/v1/token*'))
            .reply(200, accessToken)
            .post(new RegExp(`/${scope}/v0.1/checks*`), {
              phone_number: phoneNumberToTest,
            })
            .reply(
              200,
              scope === 'subscriber_check'
                ? createSubscriberCheckResponse
                : createPhoneCheckResponse,
            ),
        )
        .stdout()
        .command([command, phoneNumberToTest])
        .it(`${command} -- perform ${typeOfCheck}`, (ctx) => {
          expect(ctx.stdout).to.contain(`${typeOfCheck} ACCEPTED`)
        })
    })
  }

  {
    const params = [
      {
        typeOfCheck: 'SubscriberCheck',
        command: 'subscriberchecks:create',
        scope: 'subscriber_check',
      },
      {
        command: 'phonechecks:create',
        typeOfCheck: 'PhoneCheck',
        scope: 'phone_check',
      },
    ]
    params.forEach(({ command, typeOfCheck, scope }) => {
      test
        .nock('https://in.api.tru.id', (api) =>
          api
            .persist()
            .post(new RegExp('/oauth2/v1/token*'))
            .reply(200, accessToken)
            .post(new RegExp(`/${scope}/v0.1/checks*`), {
              phone_number: phoneNumberToTest,
            })
            .reply(
              200,
              scope === 'subscriber_check'
                ? createSubscriberCheckResponse
                : createPhoneCheckResponse,
            ),
        )
        .do(() => {
          readJsonStub
            .withArgs(sinon.match(projectConfigFileLocation))
            .resolves({ ...projectConfig, data_residency: 'in' })
        })
        .stdout()
        .command([command, phoneNumberToTest])
        .it(
          `${command} -- perform ${typeOfCheck} for data_residency in`,
          (ctx) => {
            expect(ctx.stdout).to.contain(`${typeOfCheck} ACCEPTED`)
          },
        )
    })
  }

  {
    const params = [
      {
        typeOfCheck: 'SubscriberCheck',
        command: 'subscriberchecks:create',
        scope: 'subscriber_check',
      },
      {
        command: 'phonechecks:create',
        typeOfCheck: 'PhoneCheck',
        scope: 'phone_check',
      },
    ]
    params.forEach(({ command, typeOfCheck, scope }) => {
      test
        .nock('https://eu.api.tru.id', (api) =>
          api
            .persist()
            .post(new RegExp('/oauth2/v1/token*'))
            .reply(200, accessToken)
            .post(new RegExp(`/${scope}/v0.1/checks*`), {
              phone_number: phoneNumberToTest,
            })
            .reply(
              200,
              scope === 'subscriber_check'
                ? {
                    ...createSubscriberCheckResponse,
                    status: CheckStatus.ERROR,
                  }
                : { ...createPhoneCheckResponse, status: CheckStatus.ERROR },
            ),
        )
        .stdout()
        .command([command, phoneNumberToTest, '--debug'])
        .it(
          `${command} -- logs a ${typeOfCheck} that has status of ERROR`,
          (ctx) => {
            expect(ctx.stdout).to.contain(
              `The ${typeOfCheck} could not be created. The ${typeOfCheck} status is ERROR`,
            )
          },
        )
    })
  }
})
