import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { OAuth2APIClient } from '../../../src/api/OAuth2APIClient'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'

const expect = chai.expect
chai.use(sinonChai)

describe('setup:credentials', () => {
  const workspaceId = 'workspaceId'
  const workspaceSecret = 'workspaceSecret'
  const dataResidency = 'eu'
  const commandArgs = [workspaceId, workspaceSecret, dataResidency]

  let outputJsonStub: any
  let readJsonStub: any
  let apiClientStub: any

  beforeEach(() => {
    const expectedUserConfig: IGlobalConfiguration = {
      defaultWorkspaceClientId: 'my client id',
      defaultWorkspaceClientSecret: 'my client secret',
      defaultWorkspaceDataResidency: 'eu',
    }
    sinon
      .stub(fs, 'existsSync')
      .withArgs(sinon.match(new RegExp(/config.json/)))
      .returns(true)

    readJsonStub = sinon.stub(fs, 'readJson')
    readJsonStub
      .withArgs(sinon.match(sinon.match(new RegExp(/config.json/))))
      .resolves(expectedUserConfig)
    outputJsonStub = sinon.stub(fs, 'outputJson')
    apiClientStub = sinon.stub(OAuth2APIClient.prototype, 'create')
  })

  afterEach(() => {
    sinon.restore()
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
      const error = {
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
      const error = new Error('permission error') as NodeJS.ErrnoException
      error.code = 'EPERM'
      outputJsonStub.rejects(error)
      apiClientStub.resolves()
    })
    .stdout()
    .command(['setup:credentials', ...commandArgs])
    .exit(1)
    .it('should handle missing write permissions for global config file')
})
