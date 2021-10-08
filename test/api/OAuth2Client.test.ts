import * as sinon from 'ts-sinon'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'

import { OAuth2APIClient } from '../../src/api/OAuth2APIClient'
import { APIConfiguration } from '../../src/api/APIConfiguration'
import * as httpClientModule from '../../src/api/HttpClient'

const expect = chai.expect
chai.use(sinonChai)

describe('API: projects', () => {
  const projectName: string = 'a project'
  const accessToken: httpClientModule.ICreateTokenResponse = {
    access_token: 'i am an access token',
    id_token: 'adfasdfa',
    expires_in: 60,
    token_type: 'bearer',
    refresh_token: 'fadfadfa',
    scope: 'projects',
  }

  let createAccessTokenStub: any = null

  const apiConfig = new APIConfiguration({
    clientId: 'client_id',
    clientSecret: 'client_secret',
    scopes: ['phone_check'],
    baseUrl: 'https://example.com/api',
  })

  function createDefaultOAuth2API(): OAuth2APIClient {
    return new OAuth2APIClient(apiConfig, console)
  }

  beforeEach(() => {
    createAccessTokenStub = sinon.default.stub(
      httpClientModule.HttpClient.prototype,
      'createAccessToken',
    )
    createAccessTokenStub.resolves(accessToken)
  })

  afterEach(() => {
    sinon.default.restore()
  })

  it('should call createAccessToken on HttpClient', async () => {
    const api: OAuth2APIClient = createDefaultOAuth2API()

    await api.create()

    expect(createAccessTokenStub).to.have.been.called
  })
})
