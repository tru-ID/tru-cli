import {expect, test} from '@oclif/test'
import * as sinon from 'ts-sinon'
import * as fs from 'fs-extra'
import * as inquirer from 'inquirer'

describe('hooks', () => {
  
  let existsSyncStub:any = null
  let outputFileStub:any = null
  let inquirerPromptStub:any = null
  let expectedUserConfig = {
    defaultWorkspaceClientId: 'my client id',
    defaultWorkspaceClientSecret: 'my client secret',
    defaultWorkspaceDataResidency: 'eu'
  }

  test
  .do(() => {
    existsSyncStub = sinon.default.stub(fs, 'existsSync').returns(true)
  })
  .hook('init')
  .do(() => {})
  .it('checks that a user configuration file exists', () => {
    expect(existsSyncStub.called).to.be.true
  })

  test
  .do(() => {
    existsSyncStub = sinon.default.stub(fs, 'existsSync').returns(false)
    outputFileStub = sinon.default.stub(fs, 'outputFile')
    inquirerPromptStub = sinon.default.stub(inquirer, 'prompt')
    inquirerPromptStub
      .onCall(0).resolves({defaultWorkspaceClientId: expectedUserConfig.defaultWorkspaceClientId})
    inquirerPromptStub
      .onCall(1).resolves({defaultWorkspaceClientSecret: expectedUserConfig.defaultWorkspaceClientSecret})
    inquirerPromptStub
      .onCall(2).resolves({defaultWorkspaceDataResidency: expectedUserConfig.defaultWorkspaceDataResidency})
  })
  .hook('init')
  .it('should create a new config file with expected contents if one does not exist', () => {
    const expectedString:string = JSON.stringify(expectedUserConfig, null, 2)
    expect(outputFileStub.getCall(0).args[1]).to.equal(expectedString)
  })

  afterEach(() => {
    sinon.default.restore();
  });

})
