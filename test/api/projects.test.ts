import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

import {Projects} from '../../src/api/projects'
import {APIConfiguration} from '../../src/api/APIConfiguration';

import axios from 'axios'

const expect = chai.expect;
chai.use(sinonChai);

describe('API: projects', () => {
    const projectName:string = 'a project'
    const accessToken:string = 'i am an access token'

    let axiosPostStub:any = null

    function createDefaultProjectsAPI():Projects {
        return new Projects(
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
    
        axiosPostStub.withArgs('/token', sinon.default.match.any, sinon.default.match.any).resolves({data: {access_token: accessToken}})
        axiosPostStub.withArgs('/projects', sinon.default.match.any, sinon.default.match.any).resolves({name: projectName})
    })

    afterEach(() => {
        sinon.default.restore()
    })

    it('should make a request to create a Project with an access token', async () => {

        const projectsAPI:Projects = createDefaultProjectsAPI()

        const result = await projectsAPI.create({name: projectName})

        expect(axiosPostStub).to.have.been.calledWith(
            '/projects',
            sinon.default.match.has('name', projectName),
            sinon.default.match((arg) => {
                return arg.headers['Authorization'] === `Bearer ${accessToken}`
            })
        )

    })

    it('should create a project with the expected name', async () => {
        const projectsAPI:Projects = createDefaultProjectsAPI()

        const projectName:string = 'a unique project name'
        await projectsAPI.create({name: projectName})

        expect(axiosPostStub).to.have.been.calledWith('/projects', {name: projectName}, sinon.default.match.any)
    })
})