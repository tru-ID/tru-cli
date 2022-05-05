import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { HttpClient } from '../../src/api/HttpClient'
import { accessToken as token, DummyTokenManager } from '../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

describe('APIConfiguration', () => {
  const tokenManager = new DummyTokenManager()

  describe('logging', () => {
    let client: HttpClient
    let axiosPostStub: any
    let debugStub: any

    const path = '/some/path'
    const params = { a: 'param_value' }
    const headers = { b: 'header_value' }

    beforeEach(() => {
      sinon.stub(axios, 'create').returns(axios)
      axiosPostStub = sinon.stub(axios, 'post')
      axiosPostStub.resolves({ data: {} }) // default handling of /token

      debugStub = sinon.stub(console, 'debug')
      client = new HttpClient(tokenManager, 'https://eu.api.tru.id', console)
    })

    afterEach(() => {
      sinon.restore()
    })

    it('logRequest should debug log the request', async () => {
      const requestConfig: AxiosRequestConfig = {
        baseURL: "'https://eu.api.tru.id'",
        method: 'get',
        url: path,
        headers: headers,
        params: params,
      }

      client.logRequest(requestConfig)

      expect(debugStub).has.been.calledWith('Request:', {
        baseUrl: requestConfig.baseURL,
        method: requestConfig.method,
        url: requestConfig.url,
        body: requestConfig.data,
        parameters: requestConfig.params,
        headers: requestConfig.headers,
      })
    })

    it('logResponse: should debug log the response', async () => {
      const response: AxiosResponse = {
        status: 200,
        statusText: 'OK',
        data: {},
        headers: {},
        config: {},
      }
      const expectedLog = {
        statusCode: response.status,
        headers: response.headers,
        data: '{}',
      }

      client.logResponse(response)

      expect(debugStub).has.been.calledWith('Response:', expectedLog)
    })

    it('logError: should debug log the error', async () => {
      const error = new Error()
      client.logError(error)

      expect(debugStub).has.been.calledWith('Error:', error)
    })
  })

  describe('get', () => {
    let client: HttpClient
    let axiosPostStub: any

    const path = '/some/path'
    const params = { a: 'param_value' }
    const headers = { b: 'header_value' }

    beforeEach(() => {
      sinon.stub(axios, 'create').returns(axios)
      axiosPostStub = sinon.stub(axios, 'post')
      axiosPostStub.resolves({ data: {} }) // default handling of /token

      client = new HttpClient(tokenManager, 'https://eu.api.tru.id', console)
    })

    afterEach(() => {
      sinon.restore()
    })

    it('get/proxy should proxy path, params and headers on to axios.get', async () => {
      const axiosGetStub = sinon.stub(axios, 'get').resolves({ data: {} })

      await client.get(path, params, headers)

      expect(axiosGetStub).to.have.been.calledWith(
        path,
        sinon.match
          .has('headers', sinon.match.has('b', headers.b))
          .and(sinon.match.has('params', sinon.match.has('a', params.a))),
      )
    })

    it('get/auth: should add Bearer Authorization to the headers', async () => {
      axiosPostStub
        .withArgs('/oauth2/v1/token', sinon.match.any, sinon.match.any)
        .resolves({ data: { access_token: token.access_token } })
      const axiosGetStub = sinon.stub(axios, 'get').resolves({ data: {} })

      await client.get(path, params, headers)

      expect(axiosGetStub).to.have.been.calledWith(
        path,
        sinon.match.has(
          'headers',
          sinon.match.has('Authorization', `Bearer ${token.access_token}`),
        ),
      )
    })
  })

  describe('post', () => {
    beforeEach(() => {
      sinon.stub(axios, 'create').returns(axios)
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should proxy path, params and headers on to axios.post', async () => {
      const axiosPostStub = sinon.stub(axios, 'post').resolves({ data: {} })

      const client: HttpClient = new HttpClient(
        tokenManager,
        'https://eu.api.tru.id',
        console,
      )

      const path = '/some/path'
      const params = { a: 'param' }
      const headers = { b: 'header' }
      await client.post(path, params, headers)

      expect(axiosPostStub).to.have.been.calledWith(
        path,
        params,
        sinon.match.has('headers', sinon.match.has('b', headers.b)),
      )
    })

    it('should add Bearer Authorization to the headers', async () => {
      const axiosPostStub = sinon.stub(axios, 'post')
      axiosPostStub
        .withArgs('/oauth2/v1/token', sinon.match.any, sinon.match.any)
        .resolves({ data: { access_token: token.access_token } })
      axiosPostStub.resolves({ data: {} })

      const client: HttpClient = new HttpClient(
        tokenManager,
        'https://eu.api.tru.id',
        console,
      )

      const path = '/some/path'
      const params = { a: 'param' }
      const headers = { b: 'header' }
      await client.post(path, params, headers)

      expect(axiosPostStub).to.have.been.calledWith(
        sinon.match.any,
        sinon.match.any,
        sinon.match.has(
          'headers',
          sinon.match.has('Authorization', `Bearer ${token.access_token}`),
        ),
      )
    })
  })

  describe('patch', () => {
    let axiosPostStub: any

    beforeEach(() => {
      sinon.stub(axios, 'create').returns(axios)

      axiosPostStub = sinon.stub(axios, 'post')
      axiosPostStub.resolves({ data: {} }) // default handling of /token
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should proxy path, operations and headers on to axios.patch', async () => {
      const axiosPatchStub = sinon.stub(axios, 'patch').resolves({ data: {} })

      const client: HttpClient = new HttpClient(
        tokenManager,
        'https://eu.api.tru.id',
        console,
      )

      const path = '/some/path'
      const operations = [
        {
          op: 'replace',
          path: '/configuration/phone_check/callback_url',
        },
      ]
      const headers = { b: 'header' }
      await client.patch(path, operations, headers)

      expect(axiosPatchStub).to.have.been.calledWith(
        path,
        operations,
        sinon.match.has('headers', sinon.match.has('b', headers.b)),
      )
    })

    it('should add Bearer Authorization to the headers', async () => {
      axiosPostStub
        .withArgs('/oauth2/v1/token', sinon.match.any, sinon.match.any)
        .resolves({ data: { access_token: token.access_token } })

      const axiosPatchStub = sinon.stub(axios, 'patch').resolves({ data: {} })

      const client: HttpClient = new HttpClient(
        tokenManager,
        'https://eu.api.tru.id',
        console,
      )

      const path = '/some/path'
      const operations = [
        {
          op: 'replace',
          path: '/configuration/phone_check/callback_url',
        },
      ]
      const headers = { b: 'header' }
      await client.patch(path, operations, headers)

      expect(axiosPatchStub).to.have.been.calledWith(
        sinon.match.any,
        sinon.match.any,
        sinon.match.has(
          'headers',
          sinon.match.has('Authorization', `Bearer ${token.access_token}`),
        ),
      )
    })
  })
})
