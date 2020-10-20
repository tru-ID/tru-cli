import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

import {ICreateProjectResponse, ProjectsAPIClient} from '../../src/api/ProjectsAPIClient'
import {APIConfiguration} from '../../src/api/APIConfiguration';
import * as httpClientModule from '../../src/api/HttpClient'

const expect = chai.expect;
chai.use(sinonChai);

describe('API: projects', () => {
    const projectName:string = 'a project'
    const accessToken:string = 'i am an access token'

    let httpClientConstructorStub:any = null
    let httpClientPostStub:any = null
    let httpClientPatchStub:any = null
    let httpClientGetStub:any = null

    const apiConfig = new APIConfiguration({
        clientId: 'client_id',
        clientSecret: 'client_secret',
        scopes: ['phone_check'],
        baseUrl: 'https://example.com/api'
    })


    function createDefaultProjectsAPI():ProjectsAPIClient {
        return new ProjectsAPIClient(apiConfig, console)
    }

    // ensure a new object instance is returned for each usage
    // this is important when determining at PATCH operations
    function getProjectObject(): ICreateProjectResponse {
        return {
            "project_id": "c69bc0e6-a429-11ea-bb37-0242ac130003",
            "name": "my project",
            "mode": "live",
            "created_at": "2020-06-01T16:43:30+00:00",
            "updated_at": "2020-06-01T16:43:30+00:00",
            "credentials": [
              {
                "client_id": "6779ef20e75817b79602",
                "client_secret": "dzi1v4osLNr5vv0.2mnvcKM37.",
                "created_at": "2020-06-01T16:43:30+00:00"
              }
            ],
            "_links": {
              "self": {
                "href": "https://eu.api.tru.id/console/v1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003"
              }
            }
          }
    }

    beforeEach(() => {
        httpClientPostStub = sinon.default.stub(httpClientModule.HttpClient.prototype, 'post')
        httpClientPostStub.withArgs('/console/v0.1/projects', sinon.default.match.any, sinon.default.match.any).resolves({name: projectName})

        httpClientPatchStub = sinon.default.stub(httpClientModule.HttpClient.prototype, 'patch')

        httpClientGetStub = sinon.default.stub(httpClientModule.HttpClient.prototype, 'get')
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

    it('should make a request to get the existing project with the provided project_id', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        httpClientGetStub.resolves(getProjectObject())

        const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
        await projectsAPI.update(projectId, {
            configuration: {
                phone_check: {
                    callback_url: 'https://example.com/callback'
                }
            }
        })

        expect(httpClientGetStub).to.have.been.calledWith(`/console/v0.1/projects/${projectId}`, sinon.default.match.any, sinon.default.match.any)
    })

    it('should make a request to patch a project with the expected API endpoint path', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        httpClientGetStub.resolves(getProjectObject())

        const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
        await projectsAPI.update(projectId, {
            configuration: {
                phone_check: {
                    callback_url: 'https://example.com/callback'
                }
            }
        })

        expect(httpClientPatchStub).to.have.been.calledWith(`/console/v0.1/projects/${projectId}`, sinon.default.match.any, sinon.default.match.any)
    })


    it('should make a request to patch a project with an add operation', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        httpClientGetStub.resolves(getProjectObject())

        const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
        await projectsAPI.update(projectId, {
            configuration: {
                phone_check: {
                    callback_url: 'https://example.com/callback'
                }
            }
        })

        expect(httpClientPatchStub).to.have.been.calledWith(sinon.default.match.any, [
            {
                op: 'add',
                path: '/configuration',
                value: {
                    phone_check: {
                        callback_url: 'https://example.com/callback'
                    }
                }
            }
        ],
        sinon.default.match.any)
    })

    it('should make a request to patch a project with a replace operation', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        const project = getProjectObject()
        project.configuration = {
            phone_check: {
                callback_url: 'https://example.com/callback'
            }
        }
        httpClientGetStub.resolves(project)

        const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
        await projectsAPI.update(projectId, {
            configuration: {
                phone_check: {
                    callback_url: 'https://example.com/updated_callback'
                }
            }
        })

        expect(httpClientPatchStub).to.have.been.calledWith(sinon.default.match.any, [
            {
                op: 'replace',
                path: '/configuration/phone_check/callback_url',
                value: 'https://example.com/updated_callback'
            }
        ],
        sinon.default.match.any)
    })

    it('should make a request to patch a project with a replace operation', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        const project = getProjectObject()
        project.configuration = {
            phone_check: {
                callback_url: 'https://example.com/callback'
            }
        }
        httpClientGetStub.resolves(project)

        const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
        await projectsAPI.update(projectId, {
            configuration: {
                phone_check: {
                    callback_url: 'https://example.com/updated_callback'
                }
            }
        })

        expect(httpClientPatchStub).to.have.been.calledWith(sinon.default.match.any, [
            {
                op: 'replace',
                path: '/configuration/phone_check/callback_url',
                value: 'https://example.com/updated_callback'
            }
        ],
        sinon.default.match.any)
    })

    it('should make a request to patch a project with a remove operation', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        const project = getProjectObject()
        project.configuration = {
            phone_check: {
                callback_url: 'https://example.com/updated_callback'
            }
        }
        httpClientGetStub.resolves(project)

        const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
        await projectsAPI.update(projectId, {
            configuration: {
                phone_check: {}
            }
        })

        expect(httpClientPatchStub).to.have.been.calledWith(sinon.default.match.any, [
            {
                op: 'remove',
                path: '/configuration/phone_check/callback_url'
            }
        ],
        sinon.default.match.any)
    })

    it('should make a request to patch a project with an replace operation for "mode" -> "sandbox"', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        const project = getProjectObject()
        httpClientGetStub.resolves(project)

        const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
        await projectsAPI.update(projectId, {
            mode: 'sandbox'
        })

        expect(httpClientPatchStub).to.have.been.calledWith(sinon.default.match.any, [
            {
                op: 'replace',
                path: '/mode',
                value: 'sandbox'
            }
        ],
        sinon.default.match.any)
    })

    it('should make a request with multiple patch operations', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        const project = getProjectObject()
        httpClientGetStub.resolves(project)

        const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
        await projectsAPI.update(projectId, {
            mode: 'sandbox',
            configuration: {
                phone_check: {
                    callback_url: 'https://example.com/updated_callback'
                }
            }
        })

        expect(httpClientPatchStub).to.have.been.calledWith(sinon.default.match.any, [
            {
                op: 'replace',
                path: '/mode',
                value: 'sandbox'
            },
            {
                op: 'add',
                path: '/configuration',
                value: {
                    phone_check: {
                        callback_url: 'https://example.com/updated_callback'
                    }
                }
            }
        ],
        sinon.default.match.any)
    })

    it('should query project resources', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        await projectsAPI.list()

        expect(httpClientGetStub).to.have.been.calledWith('/console/v0.1/projects', sinon.default.match.any, sinon.default.match.any)
    })

    it('should query project resources with the sort parameter', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        await projectsAPI.list({sort: 'name,asc'})

        expect(httpClientGetStub).to.have.been.calledWith('/console/v0.1/projects', sinon.default.match.has('sort', 'name,asc'), sinon.default.match.any)
    })

    it('should query project resources with the search parameter', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        await projectsAPI.list({search: 'name==p*'})

        expect(httpClientGetStub).to.have.been.calledWith('/console/v0.1/projects', sinon.default.match.has('search', 'name==p*'), sinon.default.match.any)
    })

    it('should query project resources with the page parameter', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        await projectsAPI.list({page: 1})

        expect(httpClientGetStub).to.have.been.calledWith('/console/v0.1/projects', sinon.default.match.has('page', 1), sinon.default.match.any)
    })

    it('should query project resources with the size parameter', async () => {
        const projectsAPI:ProjectsAPIClient = createDefaultProjectsAPI()

        await projectsAPI.list({size: 100})

        expect(httpClientGetStub).to.have.been.calledWith('/console/v0.1/projects', sinon.default.match.has('size', 100), sinon.default.match.any)
    })
})
