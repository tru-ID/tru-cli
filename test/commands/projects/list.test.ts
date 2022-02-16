import { test } from '@oclif/test'
import chai from 'chai'
import fs from 'fs-extra'
import sinonChai from 'sinon-chai'
import sinon from 'ts-sinon'
import { APIConfiguration } from '../../../src/api/APIConfiguration'
import * as projectsAPIClientModules from '../../../src/api/ProjectsAPIClient'
import { ConsoleLogger } from '../../../src/helpers/ConsoleLogger'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import { IProjectConfiguration } from '../../../src/IProjectConfiguration'
import { buildConsoleString } from '../../test_helpers'

const expect = chai.expect
chai.use(sinonChai)

describe('projects:list', () => {
  let projectsApiClientConstructorStub: any
  let projectsApiClientListStub: any
  let projectsApiClientGetStub: any
  let readJsonStub: any
  let consoleLoggerInfoStub: any

  const expectedUserConfig: IGlobalConfiguration = {
    defaultWorkspaceClientId: 'my client id',
    defaultWorkspaceClientSecret: 'my client secret',
    defaultWorkspaceDataResidency: 'eu',
  }

  const projectConfigFileLocation = `${process.cwd()}/tru.json`

  const projectConfig: IProjectConfiguration = {
    project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
    name: 'My test project',
    created_at: '2020-06-01T16:43:30+00:00',
    updated_at: '2020-06-01T16:43:30+00:00',
    credentials: [
      {
        client_id: 'project client id',
        client_secret: 'project client secret',
        created_at: '2020-06-01T16:43:30+00:00',
      },
    ],
  }

  const projectResource: projectsAPIClientModules.IProjectResource = {
    ...projectConfig,
    mode: 'live',
    _links: {
      self: {
        href: 'https://eu.api.tru.id/console/v0.1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003',
      },
    },
  }

  const projectsListResource: projectsAPIClientModules.IListProjectsResponse = {
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

  beforeEach(() => {
    sinon
      .stub(fs, 'existsSync')
      .withArgs(sinon.match(new RegExp(/config.json/)))
      .returns(true)

    readJsonStub = sinon.stub(fs, 'readJson')

    readJsonStub
      .withArgs(sinon.match(sinon.match(new RegExp(/config.json/))))
      .resolves(expectedUserConfig)

    readJsonStub
      .withArgs(sinon.match(projectConfigFileLocation))
      .resolves(projectConfig)

    projectsApiClientListStub = sinon.stub(
      projectsAPIClientModules.ProjectsAPIClient.prototype,
      'list',
    )
    projectsApiClientListStub.resolves(projectsListResource)

    projectsApiClientGetStub = sinon.stub(
      projectsAPIClientModules.ProjectsAPIClient.prototype,
      'get',
    )
    projectsApiClientGetStub.resolves(projectResource)

    consoleLoggerInfoStub = sinon.stub(ConsoleLogger.prototype, 'info')
  })

  afterEach(() => {
    sinon.restore()
  })

  test
    .do(() => {
      projectsApiClientConstructorStub = sinon.spy(
        projectsAPIClientModules,
        'ProjectsAPIClient',
      )
    })
    .command(['projects:list'])
    .it(
      'projects/list/ProjectsAPIClient: it should instantiate ProjectsAPIClient with expected arguments',
      () => {
        expect(projectsApiClientConstructorStub).to.be.calledWith(
          sinon.match.instanceOf(APIConfiguration),
        )
      },
    )

  test
    .command(['projects:list'])
    .it(
      'projects/list/ProjectsAPIClient.list: should call ProjectsAPIClient.list() if optional project_id argment is not supplied',
      () => {
        expect(projectsApiClientListStub).to.be.called
      },
    )

  test
    .command(['projects:list'])
    .it('should contain header table output', () => {
      const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

      expect(consoleOutputString).to.contain('name')
      expect(consoleOutputString).to.contain('project_id')
      expect(consoleOutputString).to.contain('created_at')
    })

  test.command(['projects:list']).it('should contain pagination output', () => {
    const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

    expect(consoleOutputString).to.contain('Page 1 of 1')
    expect(consoleOutputString).to.contain('Projects: 1 to 1 of 1')
  })

  test
    .command(['projects:list'])
    .it('outputs resource list to cli.table', () => {
      const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

      expect(consoleOutputString).to.contain(projectResource.name)
      expect(consoleOutputString).to.contain(projectResource.project_id)
      expect(consoleOutputString).to.contain(projectResource.created_at)
    })

  test
    .command(['projects:list', 'projects_id_value'])
    .it(
      'should call ProjectsAPIClient.get(project_id) if optional projects_id argment is supplied',
      () => {
        expect(projectsApiClientGetStub).to.be.calledWith('projects_id_value')
      },
    )

  test
    .command(['projects:list', 'projects_id_value'])
    .it('outputs result of a single resource to cli.table', () => {
      const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

      expect(consoleOutputString).to.contain(projectResource.name)
      expect(consoleOutputString).to.contain(projectResource.project_id)
      expect(consoleOutputString).to.contain(projectResource.created_at)
    })
})
