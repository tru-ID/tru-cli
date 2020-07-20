import {test} from '@oclif/test'
import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import * as fs from 'fs-extra'
import * as inquirer from 'inquirer'
import * as projectsModule from '../../src/api/projects'

let inquirerPromptStub:any = null
let projectsApiCreateStub:any = null

let expectedUserConfig = {
  defaultWorkspaceClientId: 'my client id',
  defaultWorkspaceClientSecret: 'my client secret',
  defaultWorkspaceDataResidency: 'eu'
}

let existsSyncStub:any = null
let projectConfigFileCreationStub:any
let newProjectName: string = 'My First Project'
let expectedProjectDirectoryName = 'my_first_project'
const expectedProjectFullPath = `${process.cwd()}/${expectedProjectDirectoryName}`
const expectedProjectConfigFileFullPath = `${expectedProjectFullPath}/4auth.json`
const projectConfigJson = {
  "project_id": "c69bc0e6-a429-11ea-bb37-0242ac130003",
  "name": newProjectName,
  "created_at": "2020-06-01T16:43:30+00:00",
  "updated_at": "2020-06-01T16:43:30+00:00",
  "credentials": [
    {
      "client_id": "6779ef20e75817b79602",
      "client_secret": "dzi1v4osLNr5vv0.2mnvcKM37.",
      "created_at": "2020-06-01T16:43:30+00:00"
    }
  ]
}

const projectNameWithLinks = newProjectName + ' with links'
const expectedProjectConfigFileFullPathWithLinks = `${process.cwd()}/${expectedProjectDirectoryName}_with_links/4auth.json`
const projectConfigJsonWithLinks = {
  "project_id": "c69bc0e6-a429-11ea-bb37-0242ac130003",
  "name": projectNameWithLinks,
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
      "href": "https://eu.api.4auth.io/console/v1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003"
    }
  }
}

describe('Command: projects:create', () => {

  beforeEach(() => {
    existsSyncStub = sinon.default.stub(fs, 'existsSync')
    existsSyncStub.withArgs(sinon.default.match(new RegExp(/config.json/))).returns(true)

    sinon.default.stub(fs, 'readJson').resolves(expectedUserConfig)
    sinon.default.stub(inquirer, 'prompt').resolves({'projectName': newProjectName})
    
    projectsApiCreateStub = sinon.default.stub(projectsModule.Projects.prototype, 'create')
    projectsApiCreateStub.withArgs({name: newProjectName}).resolves({data: projectConfigJson})
  })
  
  afterEach(() => {
    sinon.default.restore()
  });

  test
  .do( () => {  
    existsSyncStub.withArgs(sinon.default.match(expectedProjectFullPath)).returns(false)
    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.resolves()
  })
  .command(['projects:create'])
  .it('prompts for the name of a project', ctx => {
    expect(projectsApiCreateStub).to.have.been.calledWith({name: newProjectName})
  })

  test
  .do( () => {
    existsSyncStub.withArgs(sinon.default.match(expectedProjectFullPath)).returns(false)
    sinon.default.stub(fs, 'mkdir').resolves()

    const inlineArgProject = {
      ...projectConfigJson
    }
    inlineArgProject.name = 'inline arg name'

    projectsApiCreateStub.withArgs({name: 'inline arg name'}).resolves({data: projectConfigJson})
    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.resolves()
  })
  .command(['projects:create', 'inline arg name'])
  .it('uses the inline argument for the name project', ctx => {
    expect(projectsApiCreateStub).to.have.been.calledWith({name: 'inline arg name'})
  })

  test
  .do( () => {
    existsSyncStub.withArgs(sinon.default.match(expectedProjectFullPath)).returns(true)
  })
  .command(['projects:create', 'My First Project'])
  .exit(1)
  .it('errors if a directory matching the target project directory name already exists')

  test
  .do( () => {
    existsSyncStub.withArgs(sinon.default.match(expectedProjectFullPath)).returns(false)
    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.throws()
  })
  .command(['projects:create', 'My First Project'])
  .exit(1)
  .it('errors if an exception occurs when creating the project directory')

  test
  .do( () => {
    existsSyncStub.withArgs(sinon.default.match(expectedProjectFullPath)).returns(false)

    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.resolves()
  })
  .command(['projects:create', 'My First Project'])
  .it('creates a 4auth.json project configuration file with the Project resource contents', ctx => {
    expect(projectConfigFileCreationStub).to.have.been.calledWith(
      expectedProjectConfigFileFullPath,
      sinon.default.match(projectConfigJson)
    )
  })

  test
  .do( () => {
    existsSyncStub.withArgs(expectedProjectConfigFileFullPathWithLinks).returns(false)

    projectsApiCreateStub.withArgs({name: projectConfigJsonWithLinks.name}).resolves({data: projectConfigJsonWithLinks})
    projectConfigFileCreationStub = sinon.default.stub(fs, 'outputJson')
    projectConfigFileCreationStub.resolves()
  })
  .command(['projects:create', projectConfigJsonWithLinks.name])
  .it('creates a 4auth.json project configuration file stripping the _links contents', ctx => {

    const expectedSavedConfig = {
      ...projectConfigJsonWithLinks
    }
    delete expectedSavedConfig._links

    expect(projectConfigFileCreationStub).to.have.been.calledWith(
      expectedProjectConfigFileFullPathWithLinks,
      sinon.default.match(expectedSavedConfig)
    )
  })

})
