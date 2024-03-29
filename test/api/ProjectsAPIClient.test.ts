import chai from 'chai'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import * as httpClientModule from '../../src/api/HttpClient'
import {
  IProjectCreateResource,
  ProjectsAPIClient,
} from '../../src/api/ProjectsAPIClient'
import { DummyTokenManager } from '../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

describe('API: projects', () => {
  const projectName = 'a project'
  const workspaceId = 'a_workspace_id'
  const tokenManager = new DummyTokenManager()

  let httpClientPostStub: any = null
  let httpClientPatchStub: any = null
  let httpClientGetStub: any = null

  function createDefaultProjectsAPI(): ProjectsAPIClient {
    return new ProjectsAPIClient(tokenManager, 'https://eu.api.tru.id', console)
  }

  // ensure a new object instance is returned for each usage
  // this is important when determining at PATCH operations
  function getProjectObject(): IProjectCreateResource {
    return {
      project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
      name: 'my project',
      mode: 'live',
      disabled: false,
      created_at: '2020-06-01T16:43:30+00:00',
      updated_at: '2020-06-01T16:43:30+00:00',
      _embedded: {
        credentials: [
          {
            client_id: '6779ef20e75817b79602',
            client_secret: 'dzi1v4osLNr5vv0.2mnvcKM37.',
            scopes: ['console'],
            created_at: '2020-06-01T16:43:30+00:00',
          },
        ],
      },
      _links: {
        self: {
          href: 'https://eu.api.tru.id/console/v1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003',
        },
        my_credentials: {
          href: 'https://eu.api.tru.id/console/v1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003/credentials',
        },
      },
    }
  }

  beforeEach(() => {
    httpClientPostStub = sinon.stub(
      httpClientModule.HttpClient.prototype,
      'post',
    )
    httpClientPostStub
      .withArgs(
        `/console/v0.2/workspaces/${workspaceId}/projects`,
        sinon.match.any,
        sinon.match.any,
      )
      .resolves({ name: projectName })

    httpClientPatchStub = sinon.stub(
      httpClientModule.HttpClient.prototype,
      'patch',
    )

    httpClientGetStub = sinon.stub(httpClientModule.HttpClient.prototype, 'get')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should make a request to create a project with the expected name', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    const projectName = 'a unique project name'
    await projectsAPI.create(workspaceId, { name: projectName })

    expect(httpClientPostStub).to.have.been.calledWith(
      sinon.match.any,
      { name: projectName },
      sinon.match.any,
    )
  })

  it('should make a request to create a project with the expected API endpoint path', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    const projectName = 'a unique project name'
    await projectsAPI.create(workspaceId, { name: projectName })

    expect(httpClientPostStub).to.have.been.calledWith(
      `/console/v0.2/workspaces/${workspaceId}/projects`,
      sinon.match.any,
      sinon.match.any,
    )
  })

  it('should make a request to get the existing project with the provided project_id', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    httpClientGetStub.resolves(getProjectObject())

    const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
    await projectsAPI.update(workspaceId, projectId, {
      configuration: {
        phone_check: {
          callback_url: 'https://example.com/callback',
        },
      },
    })

    expect(httpClientGetStub).to.have.been.calledWith(
      `/console/v0.2/workspaces/${workspaceId}/projects/${projectId}`,
      sinon.match.any,
      sinon.match.any,
    )
  })

  it('should make a request to patch a project with the expected API endpoint path', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    httpClientGetStub.resolves(getProjectObject())

    const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
    await projectsAPI.update(workspaceId, projectId, {
      configuration: {
        phone_check: {
          callback_url: 'https://example.com/callback',
        },
      },
    })

    expect(httpClientPatchStub).to.have.been.calledWith(
      `/console/v0.2/workspaces/${workspaceId}/projects/${projectId}`,
      sinon.match.any,
      sinon.match.any,
    )
  })

  it('should make a request to patch a project with an add operation', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    httpClientGetStub.resolves(getProjectObject())

    const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
    await projectsAPI.update(workspaceId, projectId, {
      configuration: {
        phone_check: {
          callback_url: 'https://example.com/callback',
        },
      },
    })

    expect(httpClientPatchStub).to.have.been.calledWith(
      sinon.match.any,
      [
        {
          op: 'add',
          path: '/configuration',
          value: {
            phone_check: {
              callback_url: 'https://example.com/callback',
            },
          },
        },
      ],
      sinon.match.any,
    )
  })

  it('should make a request to patch a project with a replace operation', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    const project = getProjectObject()
    project.configuration = {
      phone_check: {
        callback_url: 'https://example.com/callback',
      },
    }
    httpClientGetStub.resolves(project)

    const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
    await projectsAPI.update(workspaceId, projectId, {
      configuration: {
        phone_check: {
          callback_url: 'https://example.com/updated_callback',
        },
      },
    })

    expect(httpClientPatchStub).to.have.been.calledWith(
      sinon.match.any,
      [
        {
          op: 'replace',
          path: '/configuration/phone_check/callback_url',
          value: 'https://example.com/updated_callback',
        },
      ],
      sinon.match.any,
    )
  })

  it('should make a request to patch a project with a replace operation', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    const project = getProjectObject()
    project.configuration = {
      phone_check: {
        callback_url: 'https://example.com/callback',
      },
    }
    httpClientGetStub.resolves(project)

    const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
    await projectsAPI.update(workspaceId, projectId, {
      configuration: {
        phone_check: {
          callback_url: 'https://example.com/updated_callback',
        },
      },
    })

    expect(httpClientPatchStub).to.have.been.calledWith(
      sinon.match.any,
      [
        {
          op: 'replace',
          path: '/configuration/phone_check/callback_url',
          value: 'https://example.com/updated_callback',
        },
      ],
      sinon.match.any,
    )
  })

  it('should make a request to patch a project with a remove operation', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    const project = getProjectObject()
    project.configuration = {
      phone_check: {
        callback_url: 'https://example.com/updated_callback',
      },
    }
    httpClientGetStub.resolves(project)

    const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
    await projectsAPI.update(workspaceId, projectId, {
      configuration: {
        phone_check: {},
      },
    })

    expect(httpClientPatchStub).to.have.been.calledWith(
      sinon.match.any,
      [
        {
          op: 'remove',
          path: '/configuration/phone_check/callback_url',
        },
      ],
      sinon.match.any,
    )
  })

  it('should make a request to patch a project with an replace operation for "mode" -> "sandbox"', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    const project = getProjectObject()
    httpClientGetStub.resolves(project)

    const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
    await projectsAPI.update(workspaceId, projectId, {
      mode: 'sandbox',
    })

    expect(httpClientPatchStub).to.have.been.calledWith(
      sinon.match.any,
      [
        {
          op: 'replace',
          path: '/mode',
          value: 'sandbox',
        },
      ],
      sinon.match.any,
    )
  })

  it('should make a request with multiple patch operations', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    const project = getProjectObject()
    httpClientGetStub.resolves(project)

    const projectId = 'f0f5fb8e-db1c-4e75-bae8-cvxcvxcv'
    await projectsAPI.update(workspaceId, projectId, {
      mode: 'sandbox',
      configuration: {
        phone_check: {
          callback_url: 'https://example.com/updated_callback',
        },
      },
    })

    expect(httpClientPatchStub).to.have.been.calledWith(
      sinon.match.any,
      [
        {
          op: 'replace',
          path: '/mode',
          value: 'sandbox',
        },
        {
          op: 'add',
          path: '/configuration',
          value: {
            phone_check: {
              callback_url: 'https://example.com/updated_callback',
            },
          },
        },
      ],
      sinon.match.any,
    )
  })

  it('should query project resources', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    await projectsAPI.list(workspaceId)

    expect(httpClientGetStub).to.have.been.calledWith(
      `/console/v0.2/workspaces/${workspaceId}/projects`,
      sinon.match.any,
      sinon.match.any,
    )
  })

  it('should query project resources with the sort parameter', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    await projectsAPI.list(workspaceId, { sort: 'name,asc' })

    expect(httpClientGetStub).to.have.been.calledWith(
      `/console/v0.2/workspaces/${workspaceId}/projects`,
      sinon.match.has('sort', 'name,asc'),
      sinon.match.any,
    )
  })

  it('should query project resources with the search parameter', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    await projectsAPI.list(workspaceId, { search: 'name==p*' })

    expect(httpClientGetStub).to.have.been.calledWith(
      `/console/v0.2/workspaces/${workspaceId}/projects`,
      sinon.match.has('search', 'name==p*'),
      sinon.match.any,
    )
  })

  it('should query project resources with the page parameter', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    await projectsAPI.list(workspaceId, { page: 1 })

    expect(httpClientGetStub).to.have.been.calledWith(
      `/console/v0.2/workspaces/${workspaceId}/projects`,
      sinon.match.has('page', 1),
      sinon.match.any,
    )
  })

  it('should query project resources with the size parameter', async () => {
    const projectsAPI: ProjectsAPIClient = createDefaultProjectsAPI()

    await projectsAPI.list(workspaceId, { size: 100 })

    expect(httpClientGetStub).to.have.been.calledWith(
      `/console/v0.2/workspaces/${workspaceId}/projects`,
      sinon.match.has('size', 100),
      sinon.match.any,
    )
  })
})
