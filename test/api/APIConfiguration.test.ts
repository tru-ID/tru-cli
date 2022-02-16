import { test } from '@oclif/test'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import { APIConfiguration } from '../../src/api/APIConfiguration'

const expect = chai.expect
chai.use(sinonChai)

describe('APIConfiguration', () => {
  const defaultClientId = 'my_client_id'
  const defaultClientSecret = 'my_client_secret'
  const defaultBaseUrl = 'https://example.com/api'
  const defaultScopes: string[] = ['projects', 'phone_check']

  function createDefaultAPIConfiguration(): APIConfiguration {
    return new APIConfiguration({
      clientId: defaultClientId,
      clientSecret: defaultClientSecret,
      scopes: defaultScopes,
      baseUrl: defaultBaseUrl,
    })
  }

  describe('contructor', () => {
    test.it('should set properties upon creation', () => {
      const apiConfig: APIConfiguration = createDefaultAPIConfiguration()
      expect(apiConfig.clientId).to.equal(defaultClientId)
      expect(apiConfig.clientSecret).to.equal(defaultClientSecret)
      expect(apiConfig.scopes).to.equal(defaultScopes.join(' '))
      expect(apiConfig.baseUrl).to.equal(defaultBaseUrl)
    })
  })
})
