import {test} from '@oclif/test'
import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import * as fs from 'fs-extra'
import * as inquirer from 'inquirer'

import * as apiModule from '../../../src/api/OAuth2APIClient'
import { OAuth2APIClient } from '../../../src/api/OAuth2APIClient'
import {ICreateProjectResponse} from '../../../src/api/ProjectsAPIClient'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import * as consoleLoggerModule from '../../../src/helpers/ConsoleLogger'
import CommandWithProjectConfig from '../../../src/helpers/CommandWithProjectConfig';
import { APIConfiguration } from '../../../src/api/APIConfiguration';
import { ICreateTokenResponse } from '../../../src/api/HttpClient';

let constructorStub:any = null
let apiClientStub: any = null

let expectedUserConfig:IGlobalConfiguration = {
  defaultWorkspaceClientId: 'my client id',
  defaultWorkspaceClientSecret: 'my client secret',
  defaultWorkspaceDataResidency: 'eu'
}

const accessToken: ICreateTokenResponse = {
  access_token: 'i am an access token',
  id_token: 'adfasdfa',
  expires_in: 60,
  token_type: 'bearer',
  refresh_token: 'fadfadfa',
  scope: 'projects'
}

// Stubs
let existsSyncStub:any
let projectConfigFileCreationStub:any
let readJsonStub:any
let consoleLoggerConstructorStub:any
let consoleLoggerDebugStub:any

const newProjectName: string = 'My First Project'
const expectedProjectDirectoryName = 'my_first_project'
const expectedProjectFullPath = `${process.cwd()}/${expectedProjectDirectoryName}`
const expectedProjectConfigFileFullPath = `${expectedProjectFullPath}/4auth.json`

const createProjectAPIResponse: ICreateProjectResponse = {
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
  ],
  "_links": {
    "self": {
      "href": "https://eu.api.4auth.io/console/v1/projects/c69bc0e6-a429-11ea-bb37-0242ac130003"
    }
  }
}

const expectedProjectConfigJson: any = {
  ... createProjectAPIResponse,
}
delete expectedProjectConfigJson._links

describe('Command: oauth2:create', () => {

  beforeEach(() => {
    existsSyncStub = sinon.default.stub(fs, 'existsSync').withArgs(sinon.default.match(new RegExp(/config.json/))).returns(true)

    apiClientStub = sinon.default.stub(OAuth2APIClient.prototype, 'create')
    apiClientStub.resolves(accessToken)

    readJsonStub = sinon.default.stub(fs, 'readJson')
    readJsonStub.resolves(expectedUserConfig)
  })
  
  afterEach(() => {
    sinon.default.restore()
  });

  test
  .do( () => {  
    constructorStub = sinon.default.spy(apiModule, 'OAuth2APIClient')
  })
  .command(['oauth2:token'])
  .it(`should use workspace credentials when the --${CommandWithProjectConfig.projectDirFlagName} flag is not set`, ctx => {
    expect(constructorStub).to.have.been.calledWith(
      sinon.default.match.has('clientId', expectedUserConfig.defaultWorkspaceClientId)
      .and(sinon.default.match.has('clientSecret', expectedUserConfig.defaultWorkspaceClientSecret))
    )
  })

  test
  .do( () => {  
    constructorStub = sinon.default.spy(apiModule, 'OAuth2APIClient')

    readJsonStub.withArgs(expectedProjectConfigFileFullPath).resolves(expectedProjectConfigJson)
  })
  .command(['oauth2:token', `--${CommandWithProjectConfig.projectDirFlagName}`, expectedProjectFullPath])
  .it(`should use project credentials when the --${CommandWithProjectConfig.projectDirFlagName} flag is set`, ctx => {
    expect(constructorStub).to.have.been.calledWith(
      sinon.default.match.has('clientId', expectedProjectConfigJson.credentials[0].client_id)
      .and(sinon.default.match.has('clientSecret', expectedProjectConfigJson.credentials[0].client_secret))
    )
  })

  test
  .do( () => {  
    constructorStub = sinon.default.spy(apiModule, 'OAuth2APIClient')

    readJsonStub.withArgs(expectedProjectConfigFileFullPath).resolves(expectedProjectConfigJson)
  })
  .command(['oauth2:token', `--${CommandWithProjectConfig.projectDirFlagName}`, expectedProjectFullPath])
  .it(`should call the client to create an access token when project config is used`, ctx => {
    expect(apiClientStub).to.have.been.called
  })

  test
  .do( () => {  
    constructorStub = sinon.default.spy(apiModule, 'OAuth2APIClient')
  })
  .command(['oauth2:token'])
  .it(`should call the client to create an access token when workspace config is used`, ctx => {
    expect(apiClientStub).to.have.been.called
  })

})
