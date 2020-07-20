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

beforeEach(() => {
  existsSyncStub = sinon.default.stub(fs, 'existsSync')
  sinon.default.stub(fs, 'readJson').resolves(expectedUserConfig)
  sinon.default.stub(inquirer, 'prompt').resolves({'projectName': 'hello'})
  projectsApiCreateStub = sinon.default.stub(projectsModule.Projects.prototype, 'create').resolves({data: {name: 'hello'}})
})

afterEach(() => {
  console.log('>>>>>>>>>>>>>>>>>>>> restored')
  sinon.default.restore()
});

describe('Command: projects:create', () => {
  test
  .do( () => {
    existsSyncStub.returns(true)
  })
  .command(['projects:create'])
  .it('prompts for the name of a project', ctx => {
    expect(projectsApiCreateStub).to.have.been.calledWith({name: 'hello'})
  })

  // test
  // .stdout()
  // .command(['tet', '--name', 'jeff'])
  // .it('runs hello --name jeff', ctx => {
  //   expect(ctx.stdout).to.contain('hello jeff')
  // })
})
