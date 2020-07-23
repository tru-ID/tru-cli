import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

import axios from 'axios'

import {ProjectsAPIClient} from '../../src/api/ProjectsAPIClient'
import {APIConfiguration} from '../../src/api/APIConfiguration';

const expect = chai.expect;
chai.use(sinonChai);

describe('API: projects', () => {
    const projectName:string = 'a project'
    const accessToken:string = 'i am an access token'

    let axiosPostStub:any = null

    function createDefaultProjectsAPI():ProjectsAPIClient {
        return new ProjectsAPIClient(
                    new APIConfiguration({
                        clientId: 'client_id',
                        clientSecret: 'client_secret', 
                        baseUrl: 'https://example.com/api'
                    })
                )
    }

    beforeEach(() => {
        sinon.default.stub(axios, 'create').returns(axios)
        axiosPostStub = sinon.default.stub(axios, 'post')
    
        axiosPostStub.withArgs('/oauth2/v1/token', sinon.default.match.any, sinon.default.match.any).resolves({data: {access_token: accessToken}})
        axiosPostStub.withArgs('/console/v0.1/projects', sinon.default.match.any, sinon.default.match.any).resolves({name: projectName})
    })

    afterEach(() => {
        sinon.default.restore()
    })

    it('should make a request to create a Project with an access token', async () => {

        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        const result = await projectsAPI.create({name: projectName})

        expect(axiosPostStub).to.have.been.calledWith(
            sinon.default.match.any,
            sinon.default.match.any,
            sinon.default.match((arg) => {
                return arg.headers['Authorization'] === `Bearer ${accessToken}`
            })
        )

    })

    it('should create a project with the expected name', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        const projectName:string = 'a unique project name'
        await projectsAPI.create({name: projectName})

        expect(axiosPostStub).to.have.been.calledWith(sinon.default.match.any, {name: projectName}, sinon.default.match.any)
    })

    it('should create a project with the expected API endpoint path', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        const projectName:string = 'a unique project name'
        await projectsAPI.create({name: projectName})

        expect(axiosPostStub).to.have.been.calledWith('/console/v0.1/projects', sinon.default.match.any, sinon.default.match.any)
    })
})