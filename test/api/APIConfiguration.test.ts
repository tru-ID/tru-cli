import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

import axios from 'axios'

import {APIConfiguration} from '../../src/api/APIConfiguration';

const expect = chai.expect;
chai.use(sinonChai);

describe('APIConfiguration', () => {

    const defaultClientId:string = 'my_client_id'
    const defaultClientSecret:string = 'my_client_secret'
    const defaultBaseUrl:string = 'https://example.com/api'
    const defaultScopes:string[] = ['projects', 'phone_check']

    function createDefaultAPIConfiguration():APIConfiguration {
        return new APIConfiguration({
            clientId: defaultClientId,
            clientSecret: defaultClientSecret,
            scopes: defaultScopes,
            baseUrl: defaultBaseUrl
        })
    }

    describe('contructor', () => {
        
        it('should set properties upon creation', () => {
            const apiConfig:APIConfiguration = createDefaultAPIConfiguration()
            expect(apiConfig.clientId).to.equal(defaultClientId)
            expect(apiConfig.clientSecret).to.equal(defaultClientSecret)
            expect(apiConfig.scopes).to.equal(defaultScopes.join(' '))
            expect(apiConfig.baseUrl).to.equal(defaultBaseUrl)
        })
    })
})