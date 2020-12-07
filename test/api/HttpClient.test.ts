import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

import {APIConfiguration} from '../../src/api/APIConfiguration'
import {HttpClient, ICreateTokenResponse} from '../../src/api/HttpClient';
import * as qs from 'querystring'
import { request } from 'http';
import { debug } from 'console';

const expect = chai.expect;
chai.use(sinonChai);

describe('APIConfiguration', () => {

    const defaultClientId:string = 'my_client_id'
    const defaultClientSecret:string = 'my_client_secret'
    const defaultBaseUrl:string = 'https://example.com/api'

    function createDefaultAPIConfiguration():APIConfiguration {
        return new APIConfiguration({
            clientId: defaultClientId,
            clientSecret: defaultClientSecret,
            scopes: ['a_scope'],
            baseUrl: defaultBaseUrl
        })
    }

    describe('logging', () => {
        let apiConfig:APIConfiguration
        let client:HttpClient
        let axiosPostStub:any
        let debugStub:any

        const path = '/some/path'
        const params = {a:'param_value'}
        const headers = {b:'header_value'}

        beforeEach(() => {
            sinon.default.stub(axios, 'create').returns(axios)
            axiosPostStub = sinon.default.stub(axios, 'post')
            axiosPostStub.resolves({data:{}}) // default handling of /token

            debugStub = sinon.default.stub(console, 'debug')
            apiConfig = createDefaultAPIConfiguration()
            client = new HttpClient(apiConfig, console)
        })
    
        afterEach(() => {
            sinon.default.restore()
        })


        it('logRequest should debug log the request', async () => {

            const requestConfig: AxiosRequestConfig = {
                baseURL: apiConfig.baseUrl,
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
                headers: requestConfig.headers
            })
        })

        it('logResponse: should debug log the response', async () => {

            const response: AxiosResponse = {
                status: 200,
                statusText: 'OK',
                data: {},
                headers: {},
                config: {}
            }
            const expectedLog = {
                statusCode: response.status,
                headers: response.headers,
                data: response.data
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

        let apiConfig:APIConfiguration
        let client:HttpClient
        let axiosPostStub:any

        const path = '/some/path'
        const params = {a:'param_value'}
        const headers = {b:'header_value'}
        const accessToken = 'i am an access token'

        beforeEach(() => {
            sinon.default.stub(axios, 'create').returns(axios)
            axiosPostStub = sinon.default.stub(axios, 'post')
            axiosPostStub.resolves({data:{}}) // default handling of /token

            apiConfig = createDefaultAPIConfiguration()
            client = new HttpClient(apiConfig, console)
        })
    
        afterEach(() => {
            sinon.default.restore()
        })

        it('get/proxy should proxy path, params and headers on to axios.get', async () => {
            const axiosGetStub = sinon.default.stub(axios, 'get').resolves({data:{}})

            await client.get(path, params, headers)

            expect(axiosGetStub).to.have.been.calledWith(
                    path,
                    sinon.default.match.has('headers', sinon.default.match.has('b', headers.b))
                    .and(sinon.default.match.has('params', sinon.default.match.has('a', params.a)))
            )
        })

        it('get/auth: should add Bearer Authorization to the headers', async () => {
            axiosPostStub.withArgs('/oauth2/v1/token', sinon.default.match.any, sinon.default.match.any)
                .resolves({data: {access_token: accessToken}})
            const axiosGetStub = sinon.default.stub(axios, 'get').resolves({data:{}})

            await client.get(path, params, headers)

            expect(axiosGetStub).to.have.been.calledWith(
                    path,
                    sinon.default.match.has(
                        'headers', sinon.default.match.has('Authorization', `Bearer ${accessToken}`)
                    )
            )
                    
        })
        
    })

    describe('post', () => {

        beforeEach(() => {
            sinon.default.stub(axios, 'create').returns(axios)
        })
    
        afterEach(() => {
            sinon.default.restore()
        })

        it('should proxy path, params and headers on to axios.post', async () => {
            const axiosPostStub = sinon.default.stub(axios, 'post').resolves({data:{}})

            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const path = '/some/path'
            const params = {a:'param'}
            const headers = {b:'header'}
            await client.post(path, params, headers)

            expect(axiosPostStub).to.have.been.calledWith(
                    path,
                    params,
                    sinon.default.match.has('headers', sinon.default.match.has('b', headers.b)
                )
            )
        })

        it('should add Bearer Authorization to the headers', async () => {
            const accessToken = 'i am an access token'
            const axiosPostStub = sinon.default.stub(axios, 'post')
            axiosPostStub.withArgs('/oauth2/v1/token', sinon.default.match.any, sinon.default.match.any).resolves({data: {access_token: accessToken}})
            axiosPostStub.resolves({data:{}})

            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const path = '/some/path'
            const params = {a:'param'}
            const headers = {b:'header'}
            await client.post(path, params, headers)

            expect(axiosPostStub).to.have.been.calledWith(
                    sinon.default.match.any,
                    sinon.default.match.any,
                    sinon.default.match.has('headers', sinon.default.match.has('Authorization', `Bearer ${accessToken}`)
                )
            )
        })
    })

    describe('patch', () => {

        let axiosPostStub:any

        beforeEach(() => {
            sinon.default.stub(axios, 'create').returns(axios)

            axiosPostStub = sinon.default.stub(axios, 'post')
            axiosPostStub.resolves({data:{}}) // default handling of /token
        })
    
        afterEach(() => {
            sinon.default.restore()
        })

        it('should proxy path, operations and headers on to axios.patch', async () => {
            const axiosPatchStub = sinon.default.stub(axios, 'patch').resolves({data:{}})

            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const path = '/some/path'
            const operations = [
                {
                    op: 'replace',
                    path: '/configuration/phone_check/callback_url'
                }
            ]
            const headers = {b:'header'}
            await client.patch(path, operations, headers)

            expect(axiosPatchStub).to.have.been.calledWith(
                    path,
                    operations,
                    sinon.default.match.has('headers', sinon.default.match.has('b', headers.b)
                )
            )
        })

        it('should add Bearer Authorization to the headers', async () => {
            const accessToken = 'i am an access token'
            axiosPostStub.withArgs('/oauth2/v1/token', sinon.default.match.any, sinon.default.match.any).resolves({data: {access_token: accessToken}})

            const axiosPatchStub = sinon.default.stub(axios, 'patch').resolves({data:{}})

            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const path = '/some/path'
            const operations = [
                {
                    op: 'replace',
                    path: '/configuration/phone_check/callback_url'
                }
            ]
            const headers = {b:'header'}
            await client.patch(path, operations, headers)

            expect(axiosPatchStub).to.have.been.calledWith(
                    sinon.default.match.any,
                    sinon.default.match.any,
                    sinon.default.match.has('headers', sinon.default.match.has('Authorization', `Bearer ${accessToken}`)
                )
            )
        })
    })

    describe('createAccessToken', () => {

        beforeEach(() => {
            sinon.default.stub(axios, 'create').returns(axios)
        })

        afterEach(() => {
            sinon.default.restore()
        })

        it('should get an Access Token from the /oauth2/v1/token endpoint', async () => {
            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const axiosPostStub = sinon.default.stub(axios, 'post').resolves({data:{}})

            await client.createAccessToken()

            expect(axiosPostStub).has.been.calledWith(
                '/oauth2/v1/token',
                sinon.default.match.any,
                sinon.default.match.any
            )
        })

        it('should get an Access Token from the /oauth2/v1/token endpoint with expected scopes', async () => {
            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const axiosPostStub = sinon.default.stub(axios, 'post').resolves({data:{}})

            await client.createAccessToken()

            expect(axiosPostStub).has.been.calledWith(
                '/oauth2/v1/token',
                sinon.default.match(new RegExp(`scope=${apiConfig.scopes}`)),
                sinon.default.match.any
            )
        })

        it('should use basic authentication when creating an Access Token', async () => {
            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const authString = client.generateBasicAuth()

            const axiosPostStub = sinon.default.stub(axios, 'post').resolves({data:{}})

            await client.createAccessToken()

            expect(axiosPostStub).has.been.calledWith(
                sinon.default.match.any,
                sinon.default.match.any,
                sinon.default.match.has(
                    'headers', sinon.default.match.has('Authorization', `Basic ${authString}`)
                )
            )
        })

        it('should return a ICreateTokenResponse with all populated properties', async () => {
            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const accessTokenDataResponse = {
                "access_token": "2YotnFZFEjr1zCsicMWpAA",
                "id_token": "eyJhbGciOiJSUzINiImtpZCI6InB1Ympx",
                "expires_in": 3600,
                "token_type": "bearer",
                "refresh_token": "tGzv3JOkF0XG5Qx2TlKWIA",
                "scope": "projects"
            }

            const axiosPostStub = sinon.default.stub(axios, 'post').resolves( {data: accessTokenDataResponse} )

            const response:ICreateTokenResponse = await client.createAccessToken()

            expect(response.access_token).to.equal(accessTokenDataResponse.access_token)
            expect(response.id_token).to.equal(accessTokenDataResponse.id_token)
            expect(response.expires_in).to.equal(accessTokenDataResponse.expires_in)
            expect(response.token_type).to.equal(accessTokenDataResponse.token_type)
            expect(response.refresh_token).to.equal(accessTokenDataResponse.refresh_token)
            expect(response.scope).to.equal(accessTokenDataResponse.scope)
        })

        it('should cache token', async () => {
            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const accessTokenDataResponse = {
                "access_token": "2YotnFZFEjr1zCsicMWpAA",
                "id_token": "eyJhbGciOiJSUzINiImtpZCI6InB1Ympx",
                "expires_in": 3600,
                "token_type": "bearer",
                "refresh_token": "tGzv3JOkF0XG5Qx2TlKWIA",
                "scope": "projects"
            }

            const accessTokenDataResponse2 = {
                "access_token": "accesstoken2",
                "id_token": "idToken2",
                "expires_in": 3600,
                "token_type": "bearer",
                "refresh_token": "refreshtoken2",
                "scope": "projects"
            }

            let axiosstub = sinon.default.stub(axios, 'post').resolves( {data: accessTokenDataResponse} )

            let response:ICreateTokenResponse = await client.createAccessToken()

            expect(response.access_token).to.equal(accessTokenDataResponse.access_token)
            expect(response.id_token).to.equal(accessTokenDataResponse.id_token)
            expect(response.expires_in).to.equal(accessTokenDataResponse.expires_in)
            expect(response.token_type).to.equal(accessTokenDataResponse.token_type)
            expect(response.refresh_token).to.equal(accessTokenDataResponse.refresh_token)
            expect(response.scope).to.equal(accessTokenDataResponse.scope)


            axiosstub.restore()
            sinon.default.stub(axios, 'post').resolves( {data: accessTokenDataResponse2} )

            response = await client.createAccessToken()

            expect(response.access_token).to.equal(accessTokenDataResponse.access_token)
            expect(response.id_token).to.equal(accessTokenDataResponse.id_token)
            expect(response.expires_in).to.equal(accessTokenDataResponse.expires_in)
            expect(response.token_type).to.equal(accessTokenDataResponse.token_type)
            expect(response.refresh_token).to.equal(accessTokenDataResponse.refresh_token)
            expect(response.scope).to.equal(accessTokenDataResponse.scope)



        })

    })

    describe('generateBasicAuth', () => {
        it('should create basic auth string in Base64(client_id:client_secret) format', () => {
            const expectedToBeEncoded = `${defaultClientId}:${defaultClientSecret}`
            const expectedBase64String = Buffer.from(expectedToBeEncoded).toString('base64')

            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const actualBase64String = client.generateBasicAuth()

            expect(actualBase64String).to.equal(expectedBase64String)
        })

    })
})