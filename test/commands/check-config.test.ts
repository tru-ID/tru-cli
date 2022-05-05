import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { IGlobalAuthConfiguration } from '../../src/IGlobalAuthConfiguration'

const expect = chai.expect
chai.use(sinonChai)

let existsSyncStub: any = null
const expectedUserConfig: IGlobalAuthConfiguration = {
  selectedWorkspace: 'workspace_id',
  selectedWorkspaceDataResidency: 'eu',
  tokenInfo: {
    refreshToken: 'refresh_token',
    scope: 'console',
  },
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
    .it('should instruct the user to login', (ctx) => {
      expect(ctx.stdout).to.contain('Welcome to the tru.ID CLI!')
      expect(ctx.stdout).to.contain('Please run tru login')
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
})
