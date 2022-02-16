import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { OAuth2APIClient } from '../../src/api/OAuth2APIClient'

const expect = chai.expect
chai.use(sinonChai)

let existsSyncStub: any = null
let outputJsonStub: any = null
const expectedUserConfig = {
  defaultWorkspaceClientId: 'my client id',
  defaultWorkspaceClientSecret: 'my client secret',
  defaultWorkspaceDataResidency: 'eu',
}

describe('hooks', () => {
  afterEach(() => {
    sinon.restore()
  })

  test
    .do(() => {
      existsSyncStub = sinon
        .stub(fs, 'existsSync')
        .withArgs(sinon.match(new RegExp(/config.json/)))
        .returns(true)
      sinon.stub(fs, 'readJson').resolves(expectedUserConfig)
    })
    .hook('init')
    .it('checks that a user configuration file exists', () => {
      expect(existsSyncStub.called).to.be.true
    })

  test
    .stdout()
    .do(() => {
      existsSyncStub = sinon
        .stub(fs, 'existsSync')
        .withArgs(sinon.match(new RegExp(/config.json/)))
        .returns(false)
    })
    .hook('init')
    .it('should instruct the user to go to developer.tru.id/console', (ctx) => {
      expect(ctx.stdout).to.contain('Welcome to the tru.ID CLI!')
      expect(ctx.stdout).to.contain('developer.tru.id/console')
    })

  test
    .skip()
    .do(() => {
      existsSyncStub = sinon
        .stub(fs, 'existsSync')
        .withArgs(sinon.match(new RegExp(/config.json/)))
        .returns(false)
    })
    .stdout()
    .command(['phonechecks:create'])
    .hook('init')

    .it(
      'should instruct the user to go to developer.tru.id/console when no config file is present and a command is run',
      (ctx) => {
        expect(ctx.stdout).to.contain('Welcome to the tru.ID CLI!')
        expect(ctx.stdout).to.contain('developer.tru.id/console')
      },
    )

  test
    .do(() => {
      existsSyncStub = sinon
        .stub(fs, 'existsSync')
        .withArgs(sinon.match(new RegExp(/config.json/)))
        .returns(false)
      outputJsonStub = sinon.stub(fs, 'outputJson').resolves()
      sinon.stub(OAuth2APIClient.prototype, 'create').resolves()
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
          sinon.match.any,
          expectedUserConfig,
          sinon.match.any,
        )
      },
    )
})
