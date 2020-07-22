import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

import {APIConfiguration, ICreateTokenResponse} from '../../src/api/APIConfiguration';

import axios from 'axios'
import { assert } from 'console';

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
            baseUrl: defaultBaseUrl
        })
    }

    describe('contructor', () => {
        
        it('should set properties upon creation', () => {
            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            expect(apiConfig.clientId).to.equal(defaultClientId)
            expect(apiConfig.clientSecret).to.equal(defaultClientSecret)
            expect(apiConfig.baseUrl).to.equal(defaultBaseUrl)
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

            const axiosPostStub = sinon.default.stub(axios, 'post').resolves({data:{}})

            await apiConfig.createAccessToken()

            expect(axiosPostStub).has.been.calledWith(
                '/oauth2/v1/token',
                sinon.default.match.any,
                sinon.default.match.any
            )
        })

        it('should use basic authentication when creating an Access Token', async () => {
            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()

            const authString = apiConfig.generateBasicAuth()

            const axiosPostStub = sinon.default.stub(axios, 'post').resolves({data:{}})

            await apiConfig.createAccessToken()

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

            const accessTokenDataResponse = {
                "access_token": "2YotnFZFEjr1zCsicMWpAA",
                "id_token": "eyJhbGciOiJSUzINiImtpZCI6InB1Ympx",
                "expires_in": 3600,
                "token_type": "bearer",
                "refresh_token": "tGzv3JOkF0XG5Qx2TlKWIA",
                "scope": "projects"
            }

            const axiosPostStub = sinon.default.stub(axios, 'post').resolves( {data: accessTokenDataResponse} )

            const response:ICreateTokenResponse = await apiConfig.createAccessToken()

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

            const actualBase64String = apiConfig.generateBasicAuth()

            expect(actualBase64String).to.equal(expectedBase64String)
        })

    })
})