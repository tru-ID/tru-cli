import { test } from '@oclif/test'
import * as chai from 'chai'
import * as fs from 'fs-extra'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'ts-sinon'
import { OAuth2APIClient } from '../../src/api/OAuth2APIClient'

const expect = chai.expect
chai.use(sinonChai)

describe('hooks', () => {
  let existsSyncStub: any = null
  let outputJsonStub: any = null
  let apiClientStub: any = null
  const expectedUserConfig = {
    defaultWorkspaceClientId: 'my client id',
    defaultWorkspaceClientSecret: 'my client secret',
    defaultWorkspaceDataResidency: 'eu',
  }

  afterEach(() => {
    sinon.default.restore()
  })

  test
    .do(() => {
      existsSyncStub = sinon.default
        .stub(fs, 'existsSync')
        .withArgs(sinon.default.match(new RegExp(/config.json/)))
        .returns(true)
      sinon.default.stub(fs, 'readJson').resolves(expectedUserConfig)
    })
    .hook('init')
    .it('checks that a user configuration file exists', () => {
      expect(existsSyncStub.called).to.be.true
    })

  test
    .do(() => {
      existsSyncStub = sinon.default
        .stub(fs, 'existsSync')
        .withArgs(sinon.default.match(new RegExp(/config.json/)))
        .returns(false)
    })
    .stdout()
    .hook('init')
    .exit(1)
    .it('should instruct the user to go to developer.tru.id/console', (ctx) => {
      expect(ctx.stdout).to.contain('Welcome to the tru.ID CLI!')
      expect(ctx.stdout).to.contain('developer.tru.id/console')
    })

  test
    .do(() => {
      existsSyncStub = sinon.default
        .stub(fs, 'existsSync')
        .withArgs(sinon.default.match(new RegExp(/config.json/)))
        .returns(false)
    })
    .stdout()
    .command('phonechecks:create')
    .exit(1)
    .it(
      'should instruct the user to go to developer.tru.id/console when no config file is present and a command is run',
      (ctx) => {
        expect(ctx.stdout).to.contain('Welcome to the tru.ID CLI!')
        expect(ctx.stdout).to.contain('developer.tru.id/console')
      },
    )

  test
    .do(() => {
      existsSyncStub = sinon.default
        .stub(fs, 'existsSync')
        .withArgs(sinon.default.match(new RegExp(/config.json/)))
        .returns(false)
      outputJsonStub = sinon.default.stub(fs, 'outputJson').resolves()
      apiClientStub = sinon.default
        .stub(OAuth2APIClient.prototype, 'create')
        .resolves()
    })
    .command([
      'setup:credentials',
      expectedUserConfig.defaultWorkspaceClientId,
      expectedUserConfig.defaultWorkspaceClientSecret,
      expectedUserConfig.defaultWorkspaceDataResidency,
    ])
    .it(
      'should NOT instruct the user to setup the CLI if the user is running the `setup:credentials` command',
      () => {
        expect(outputJsonStub).to.have.been.calledWith(
          sinon.default.match.any,
          expectedUserConfig,
          sinon.default.match.any,
        )
      },
    )
})
