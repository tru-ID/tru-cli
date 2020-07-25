import {test} from '@oclif/test'
import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import * as fs from 'fs-extra'

import * as phoneCheckAPIClientModules from '../../../src/api/PhoneChecksAPIClient'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration';
import { IProjectConfiguration } from '../../../src/IProjectConfiguration';
import { APIConfiguration } from '../../../src/api/APIConfiguration';

describe('phonechecks:list', () => {

	let phoneChecksApiClientConstructorStub:any
	let phoneChecksApiClientListStub:any
	let phoneChecksApiClientGetStub:any
	let readJsonStub:any

	let expectedUserConfig:IGlobalConfiguration = {
		defaultWorkspaceClientId: 'my client id',
		defaultWorkspaceClientSecret: 'my client secret',
		defaultWorkspaceDataResidency: 'eu'
	  }

	const projectConfigFileLocation = `${process.cwd()}/4auth.json`

	const projectConfig:IProjectConfiguration = {
		project_id: "c69bc0e6-a429-11ea-bb37-0242ac130003",
		name: "My test project",
		created_at: "2020-06-01T16:43:30+00:00",
		updated_at: "2020-06-01T16:43:30+00:00",
		credentials: [
		  {
			client_id: "project client id",
			client_secret: "project client secret",
			created_at: "2020-06-01T16:43:30+00:00"
		  }
		]
	}

	beforeEach(() => {
		sinon.default.stub(fs, 'existsSync').withArgs(sinon.default.match(new RegExp(/config.json/))).returns(true)

		readJsonStub = sinon.default.stub(fs, 'readJson')

		readJsonStub.withArgs(
		sinon.default.match(sinon.default.match(new RegExp(/config.json/))))
			.resolves(expectedUserConfig)

		readJsonStub.withArgs(
		sinon.default.match(projectConfigFileLocation))
			.resolves(projectConfig)

		phoneChecksApiClientListStub =
			sinon.default.stub(phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype, 'list')
		
		phoneChecksApiClientGetStub =
			sinon.default.stub(phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype, 'get')
	})

	afterEach(() => {
		sinon.default.restore()
	})

	test
		.do( () => {
			phoneChecksApiClientConstructorStub = sinon.default.spy(phoneCheckAPIClientModules, 'PhoneChecksAPIClient')
		})
		.command(['phonechecks:list'])
		.it('phonechecks/list/PhoneChecksAPIClient: it should instantiate PhoneChecksAPIClient with expected arguments', ctx => {
			expect(phoneChecksApiClientConstructorStub).to.be.calledWith(
				sinon.default.match.instanceOf(APIConfiguration)
			)
		})

	test
		.command(['phonechecks:list'])
		.it('phonechecks/list/PhoneChecksAPIClient.list: should call PhoneChecksAPIClient.list() if optional check_id argment is not supplied', ctx => {
			expect(phoneChecksApiClientListStub).to.be.called
		})

	test
		.command(['phonechecks:list', 'check_id_value'])
		.it('should call PhoneChecksAPIClient.get(checkId) if optional check_id argment is supplied', ctx => {
			expect(phoneChecksApiClientGetStub).to.be.calledWith('check_id_value')
		})
})
