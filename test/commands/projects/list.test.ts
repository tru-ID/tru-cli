import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import {
  IListProjectsResponse,
  IProjectResource,
} from '../../../src/api/ProjectsAPIClient'
import { globalConfig, testToken } from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

const projectResource: IProjectResource = {
  project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
  name: 'My test project',
  mode: 'live',
  disabled: false,
  created_at: '2020-06-01T16:43:30+00:00',
  updated_at: '2020-06-01T16:43:30+00:00',
  _embedded: {
    credentials: [
      {
        client_id: 'project client id',
        client_secret: 'project client secret',
        scopes: ['phone_check'],
        created_at: '2020-06-01T16:43:30+00:00',
      },
    ],
  },
  _links: {
    self: {
      href: 'https://eu.api.tru.id/console/v0.1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003',
    },
    my_credentials: {
      href: 'https://eu.api.tru.id/console/v0.1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003/credentials',
    },
  },
}

const projectsListResource: IListProjectsResponse = {
  _links: {
    first: { href: '' },
    last: { href: '' },
    next: { href: '' },
    prev: { href: '' },
    self: { href: '' },
  },
  _embedded: {
    projects: [projectResource],
  },
  page: {
    number: 1,
    size: 1,
    total_elements: 1,
    total_pages: 1,
  },
}

let readJsonStub: any

describe('projects:list', () => {
  beforeEach(() => {
    sinon
      .stub(fs, 'existsSync')
      .withArgs(sinon.match(new RegExp(/config.json/)))
      .returns(true)

    readJsonStub = sinon.stub(fs, 'readJson')
    readJsonStub.resolves(globalConfig)

    sinon
      .stub(fs, 'outputJson')
      .withArgs(
        sinon.match(new RegExp(/config.json/)),
        sinon.match.any,
        sinon.match.any,
      )
      .resolves(globalConfig)
  })

  afterEach(() => {
    sinon.restore()
  })

  testToken
    .nock('https://eu.api.tru.id', (api) =>
      api
        .get(
          new RegExp(
            `/console/v0.2/workspaces/${globalConfig.selectedWorkspace}/projects*`,
          ),
        )
        .reply(200, projectsListResource),
    )
    .stdout()
    .command(['projects:list'])
    .it('should list projects', (ctx) => {
      expect(ctx.stdout).to.contain('name')
      expect(ctx.stdout).to.contain('project_id')
      expect(ctx.stdout).to.contain('created_at')
      expect(ctx.stdout).to.contain('Page 1 of 1')
      expect(ctx.stdout).to.contain('Projects: 1 to 1 of 1')
      expect(ctx.stdout).to.contain(projectResource.name)
      expect(ctx.stdout).to.contain(projectResource.project_id)
      expect(ctx.stdout).to.contain(projectResource.created_at)
    })

  testToken
    .nock('https://eu.api.tru.id', (api) =>
      api
        .get(
          new RegExp(
            `/console/v0.2/workspaces/${globalConfig.selectedWorkspace}/projects/projects_id_value*`,
          ),
        )
        .reply(200, projectResource),
    )
    .stdout()
    .command(['projects:list', 'projects_id_value'])
    .it(
      'should call ProjectsAPIClient.get(project_id) if optional projects_id argment is supplied',
      (ctx) => {
        expect(ctx.stdout).to.contain(projectResource.name)
        expect(ctx.stdout).to.contain(projectResource.project_id)
        expect(ctx.stdout).to.contain(projectResource.created_at)
      },
    )
})
