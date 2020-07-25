import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

import axios from 'axios'

import {APIConfiguration} from '../../src/api/APIConfiguration'
import {HttpClient, ICreateTokenResponse} from '../../src/api/HttpClient';
import * as qs from 'querystring'

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

        it('should debug log the POST request', async () => {   
            const accessToken = 'i am an access token'
            const path = '/some/path'
            const params = {a:'param'}
            const headers = {b:'header'}
            
            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const debugStub = sinon.default.stub(console, 'debug')
            axios.defaults.baseURL = apiConfig.baseUrl
            const axiosPostStub = sinon.default.stub(axios, 'post')
            axiosPostStub.withArgs('/oauth2/v1/token', sinon.default.match.any, sinon.default.match.any).resolves({data: {access_token: accessToken}})
            axiosPostStub.resolves({data:{}})

            await client.post(path, params, headers)

            expect(debugStub).has.been.calledWith('Request:', {
                baseUrl: apiConfig.baseUrl,
                method: 'post',
                path: path,
                parameters: params,
                headers: {
                    ...headers,
                    'Authorization': `Bearer ${accessToken}`
                }
            })
        })

        it('should debug log the POST response', async () => {            
            const accessToken = 'i am an access token'
            const path = '/some/path'
            
            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const debugStub = sinon.default.stub(console, 'debug')
            axios.defaults.baseURL = apiConfig.baseUrl
            const axiosPostStub = sinon.default.stub(axios, 'post')
            axiosPostStub.withArgs(path, sinon.default.match.any, sinon.default.match.any).resolves({data: {access_token: accessToken}})
            axiosPostStub.resolves({status: 201, data:{}})

            await client.post(path, {}, {})

            expect(debugStub).has.been.calledWith('Response:', {statusCode: 201, data: {}})
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

        it('should debug log the Access Token request', async () => {            
            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const expectedAuthString = client.generateBasicAuth()
            const expectedParams = qs.stringify({
                grant_type: 'client_credentials',
                scope: apiConfig.scopes,
            })

            const debugStub = sinon.default.stub(console, 'debug')
            axios.defaults.baseURL = apiConfig.baseUrl
            const axiosPostStub = sinon.default.stub(axios, 'post').resolves({data:{}})

            await client.createAccessToken()

            expect(debugStub).has.been.calledWith('Request:', {
                baseUrl: apiConfig.baseUrl,
                method: 'post',
                path: '/oauth2/v1/token',
                parameters: expectedParams,
                headers: {
                    'Authorization': `Basic ${expectedAuthString}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
        })

        it('should debug log the Access Token response', async () => {            
            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            const client:HttpClient = new HttpClient(apiConfig, console)

            const debugStub = sinon.default.stub(console, 'debug')
            axios.defaults.baseURL = apiConfig.baseUrl
            const axisResponse = {status: 200, data: {}}
            const expectedResponse = {statusCode: 200, data: {}}
            sinon.default.stub(axios, 'post').resolves(axisResponse)

            await client.createAccessToken()

            expect(debugStub).has.been.calledWith('Response:', expectedResponse)
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