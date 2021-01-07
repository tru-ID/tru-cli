import {expect, test} from '@oclif/test'
import * as sinon from 'ts-sinon'

import * as fs from 'fs-extra'
import * as inquirer from 'inquirer'

describe('hooks', () => {

  let existsSyncStub:any = null
  let outputFileStub:any = null
  let inquirerPromptStub:any = null
  const expectedUserConfig = {
    defaultWorkspaceClientId: 'my client id',
    defaultWorkspaceClientSecret: 'my client secret',
    defaultWorkspaceDataResidency: 'eu'
  }

  function setupDefaultPromptResponses(_inquirerPromptStub:any) {
    _inquirerPromptStub
      .onCall(0).resolves({defaultWorkspaceClientId: expectedUserConfig.defaultWorkspaceClientId})
    _inquirerPromptStub
      .onCall(1).resolves({defaultWorkspaceClientSecret: expectedUserConfig.defaultWorkspaceClientSecret})
    _inquirerPromptStub
      .onCall(2).resolves({defaultWorkspaceDataResidency: expectedUserConfig.defaultWorkspaceDataResidency})
  }

  afterEach(() => {
    sinon.default.restore();
  });

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
    outputFileStub = sinon.default.stub(fs, 'outputFile')
    inquirerPromptStub = sinon.default.stub(inquirer, 'prompt')
    setupDefaultPromptResponses(inquirerPromptStub)
  })
  .hook('init')
  .it('should create a new config file if one does not exist', () => {
    expect(outputFileStub.called).to.be.true
  })

  test
  .do(() => {
    existsSyncStub = sinon.default.stub(fs, 'existsSync').withArgs(sinon.default.match(new RegExp(/config.json/))).returns(false)
    outputFileStub = sinon.default.stub(fs, 'outputFile')
    inquirerPromptStub = sinon.default.stub(inquirer, 'prompt')
    setupDefaultPromptResponses(inquirerPromptStub)
  })
  .hook('init')
  .it('should create a new config file with expected contents if one does not exist', () => {
    const expectedString:string = JSON.stringify(expectedUserConfig, null, 2)
    expect(outputFileStub.getCall(0).args[1]).to.equal(expectedString)
  })

})