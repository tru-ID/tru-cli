import { test } from '@oclif/test'
import * as chai from 'chai'
import * as fs from 'fs-extra'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'ts-sinon'
import { OAuth2APIClient } from '../../../src/api/OAuth2APIClient'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'

const expect = chai.expect
chai.use(sinonChai)

describe('setup:credentials', () => {
  let workspaceId = 'workspaceId'
  let workspaceSecret = 'workspaceSecret'
  let dataResidency = 'eu'
  let commandArgs = [workspaceId, workspaceSecret, dataResidency]

  let outputJsonStub: any
  let readJsonStub: any
  let apiClientStub: any

  beforeEach(() => {
    let expectedUserConfig: IGlobalConfiguration = {
      defaultWorkspaceClientId: 'my client id',
      defaultWorkspaceClientSecret: 'my client secret',
      defaultWorkspaceDataResidency: 'eu',
    }
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
    outputJsonStub = sinon.default.stub(fs, 'outputJson')
    apiClientStub = sinon.default.stub(OAuth2APIClient.prototype, 'create')
  })

  afterEach(() => {
    sinon.default.restore()
  })

  test
    .do(() => {
      outputJsonStub.resolves()
      apiClientStub.resolves()
    })
    .stdout()
    .command(['setup:credentials', ...commandArgs])
    .it('should write workspace credentials to global config file', (ctx) => {
      expect(ctx.stdout).to.contain('new credentials were written to')
    })

  test
    .do(() => {
      let error = {
        message: 'I used weird permission',
      }
      outputJsonStub.resolves()
      apiClientStub.rejects(error)
    })
    .stdout()
    .command(['setup:credentials', ...commandArgs])
    .exit(1)
    .it('should handle failed to create workspace credentials')

  test
    .do((_ctx) => {
      let error = {
        message: 'permission error',
        code: 'EPERM',
      }
      outputJsonStub.rejects(error)
      apiClientStub.resolves()
    })
    .stdout()
    .command(['setup:credentials', ...commandArgs])
    .exit(1)
    .it('should handle missing write permissions for global config file')
})
