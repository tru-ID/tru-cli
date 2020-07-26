import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

import {ProjectsAPIClient} from '../../src/api/ProjectsAPIClient'
import {APIConfiguration} from '../../src/api/APIConfiguration';
import * as httpClientModule from '../../src/api/HttpClient'

const expect = chai.expect;
chai.use(sinonChai);

describe('API: projects', () => {
    const projectName:string = 'a project'
    const accessToken:string = 'i am an access token'

    let httpClientConstructorStub:any = null
    let httpClientPostStub:any = null

    const apiConfig = new APIConfiguration({
        clientId: 'client_id',
        clientSecret: 'client_secret',
        scopes: ['phone_check'],
        baseUrl: 'https://example.com/api'
    })

    function createDefaultProjectsAPI():ProjectsAPIClient {
        return new ProjectsAPIClient(apiConfig, console)
    }

    beforeEach(() => {
        httpClientPostStub = sinon.default.stub(httpClientModule.HttpClient.prototype, 'post')
        httpClientPostStub.withArgs('/console/v0.1/projects', sinon.default.match.any, sinon.default.match.any).resolves({name: projectName})
    })

    afterEach(() => {
        sinon.default.restore()
    })

    it('should create a HTTPClient with expected arguments', () => {
        httpClientConstructorStub = sinon.default.stub(httpClientModule, 'HttpClient')
        const projectsAPI:ProjectsAPIClient = new ProjectsAPIClient(apiConfig, console)

        expect(httpClientConstructorStub).to.have.been.calledWith(apiConfig, console)
    })

    it('should make a request to create a project with the expected name', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        const projectName:string = 'a unique project name'
        await projectsAPI.create({name: projectName})

        expect(httpClientPostStub).to.have.been.calledWith(sinon.default.match.any, {name: projectName}, sinon.default.match.any)
    })

    it('should make a request to create a project with the expected API endpoint path', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        const projectName:string = 'a unique project name'
        await projectsAPI.create({name: projectName})

        expect(httpClientPostStub).to.have.been.calledWith('/console/v0.1/projects', sinon.default.match.any, sinon.default.match.any)
    })
})