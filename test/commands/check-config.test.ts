import {expect, test} from '@oclif/test'
import * as sinon from 'ts-sinon'

import * as fs from 'fs-extra'

describe('hooks', () => {
  let existsSyncStub: any = null
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
    existsSyncStub = sinon.default.stub(fs, 'existsSync').withArgs(sinon.default.match(new RegExp(/config.json/))).returns(true)
    sinon.default.stub(fs, 'readJson').resolves(expectedUserConfig)
  })
  .hook('init')
  .it('checks that a user configuration file exists', () => {
    expect(existsSyncStub.called).to.be.true
  })

  test
  .do(() => {
    existsSyncStub = sinon.default.stub(fs, 'existsSync').withArgs(sinon.default.match(new RegExp(/config.json/))).returns(false)
  })
  .stdout()
  .hook('init')
  .exit(1)
  .it('should instruct the user to go to tru.id/console', ctx => {
    expect(ctx.stdout).to.contain('Welcome to the tru.ID CLI!')
    expect(ctx.stdout).to.contain('tru.id/console')
  })
})
