import {test} from '@oclif/test'
import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import * as fs from 'fs-extra'

import * as workspacesAPIClientModules from '../../../src/api/WorkspacesAPIClient'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration';
import { APIConfiguration } from '../../../src/api/APIConfiguration';
import {ConsoleLogger} from '../../../src/helpers/ConsoleLogger'

import {buildConsoleString} from '../../test_helpers'

describe('workspaces', () => {

	let workspacesApiClientConstructorStub:any
	let workspacesApiClientGetStub:any
	let readJsonStub:any
	let consoleLoggerInfoStub:any

	let expectedUserConfig:IGlobalConfiguration = {
		defaultWorkspaceClientId: 'my client id',
		defaultWorkspaceClientSecret: 'my client secret',
		defaultWorkspaceDataResidency: 'eu'
	  }

	const workspaceResource: workspacesAPIClientModules.IWorkspaceResource = {
		data_residency: 'EU',
		credentials: {
		  client_id: '15130453-f35d-48b3-a3d4-8bd9bca121f5',
		  created_at: '2020-08-12T22:30:29+0000'
		},
		created_at: '2020-08-12T22:30:29+0000',
		_links: {
		  self: { href: 'https://eu.api.tru.id/console/v0.1/workspaces/default' }
		},
		_embedded: {
		  balance: {
			currency: 'API',
			_links: {
				self: {
					href: ''
				}
			},
			amount_available: 40,
			amount_reserved: -1
		  }
		}
	  }

	beforeEach(() => {
		sinon.default.stub(fs, 'existsSync').withArgs(sinon.default.match(new RegExp(/config.json/))).returns(true)

		readJsonStub = sinon.default.stub(fs, 'readJson')

		readJsonStub.withArgs(
			sinon.default.match(sinon.default.match(new RegExp(/config.json/))))
			.resolves(expectedUserConfig)

		workspacesApiClientGetStub =
			sinon.default.stub(workspacesAPIClientModules.WorkspacesAPIClient.prototype, 'get')
		workspacesApiClientGetStub.resolves(workspaceResource)

		consoleLoggerInfoStub = sinon.default.stub(ConsoleLogger.prototype, 'info')
	})

	afterEach(() => {
		sinon.default.restore()
	})

	test
		.do( () => {
			workspacesApiClientConstructorStub = sinon.default.spy(workspacesAPIClientModules, 'WorkspacesAPIClient')
		})
		.command(['workspaces'])
		.it('projects/list/ProjectsAPIClient: it should instantiate ProjectsAPIClient with expected arguments', ctx => {
			expect(workspacesApiClientConstructorStub).to.be.calledWith(
				sinon.default.match.instanceOf(APIConfiguration)
			)
		})

	test
		.command(['workspaces'])
		.it('should call ProjectsAPIClient.get("default")', ctx => {
			expect(workspacesApiClientGetStub).to.be.calledWith('default')
		})

	test
		.command(['workspaces'])
		.it('outputs result of a single resource to cli.table', (ctx) => {
			const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

			expect(consoleOutputString).to.contain(workspaceResource.data_residency)
			expect(consoleOutputString).to.contain(workspaceResource.created_at)
			expect(consoleOutputString).to.contain(workspaceResource._embedded.balance.currency)
			expect(consoleOutputString).to.contain(workspaceResource._embedded.balance.amount_available)
		})
})
