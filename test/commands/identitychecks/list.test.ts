import { test } from '@oclif/test'
import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import * as fs from 'fs-extra'

import * as identityCheckAPIClientModules from '../../../src/api/IdentityCheckAPIClient'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration';
import { IProjectConfiguration } from '../../../src/IProjectConfiguration';
import { APIConfiguration } from '../../../src/api/APIConfiguration';
import { ConsoleLogger } from '../../../src/helpers/ConsoleLogger'

import { buildConsoleString } from '../../test_helpers'
import { IListCheckResource } from '../../../src/api/ChecksAPIClient';
import { CheckStatus } from '../../../src/api/CheckStatus';
import * as httpClientModule from '../../../src/api/HttpClient';

describe('identitychecks:list', () => {

	let identityChecksApiClientConstructorStub: any
	let httpClientGetStub: any
	let readJsonStub: any
	let consoleLoggerInfoStub: any

	let expectedUserConfig: IGlobalConfiguration = {
		defaultWorkspaceClientId: 'my client id',
		defaultWorkspaceClientSecret: 'my client secret',
		defaultWorkspaceDataResidency: 'eu'
	}

	const projectConfigFileLocation = `${process.cwd()}/tru.json`

	const projectConfig: IProjectConfiguration = {
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

	const identityCheckResource: identityCheckAPIClientModules.IdentityCheckResource = {
		_links: {
			self: {
				href: 'https://us.api.tru.id/identity_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002'
			}
		},
		charge_amount: 1,
		charge_currency: 'API',
		check_id: 'c69bc0e6-a429-11ea-bb37-0242ac130002',
		created_at: '2020-06-01T16:43:30+00:00',
		updated_at: '2020-06-01T16:43:30+00:00',
		match: false,
		no_sim_change: true,
		last_sim_change_at: '2020-01-01T16:43:30+00:00',
		status: CheckStatus.ACCEPTED,
	}

	const identityListCheckResource: IListCheckResource<identityCheckAPIClientModules.IdentityCheckResource> = {
		_embedded: {
			checks: [
				identityCheckResource
			]
		},
		_links: {
			first: { href: '' },
			last: { href: '' },
			next: { href: '' },
			prev: { href: '' },
			self: { href: '' }
		},
		page: {
			number: 1,
			size: 1,
			total_elements: 1,
			total_pages: 1
		}
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



		httpClientGetStub = sinon.default.stub(httpClientModule.HttpClient.prototype, 'get')
		httpClientGetStub.withArgs('/identity_check/v0.1/checks', sinon.default.match.any, sinon.default.match.any).resolves(identityListCheckResource)
		httpClientGetStub.withArgs(`/identity_check/v0.1/checks/${identityCheckResource.check_id}`, sinon.default.match.any, sinon.default.match.any).resolves(identityCheckResource)
		httpClientGetStub.withArgs(`/identity_check/v0.1/checks/check_id_value`, sinon.default.match.any, sinon.default.match.any).resolves(identityCheckResource)

		consoleLoggerInfoStub = sinon.default.stub(ConsoleLogger.prototype, 'info')
	})

	afterEach(() => {
		sinon.default.restore()
	})

	test
		.do(() => {
			identityChecksApiClientConstructorStub = sinon.default.spy(identityCheckAPIClientModules, 'IdentityCheckAPIClient')
		})
		.command(['identitychecks:list'])
		.it('identitychecks/list/IdentityCheckAPIClient: it should instantiate IdentityCheckAPIClient with expected arguments', ctx => {
			expect(identityChecksApiClientConstructorStub).to.be.calledWith(
				sinon.default.match.instanceOf(APIConfiguration)
			)
		})

	test
		.command(['identitychecks:list'])
		.it('identitychecks/list/IdentityCheckAPIClient.list: should call IdentityCheckAPIClient.list() if optional check_id argment is not supplied', ctx => {
			expect(httpClientGetStub).to.be.calledWith('/identity_check/v0.1/checks', sinon.default.match.any, sinon.default.match.any)

		})

	test
		.command(['identitychecks:list', 'check_id_value'])
		.it('should call IdentityChecksAPIClient.get(checkId) if optional check_id argment is supplied', ctx => {
			expect(httpClientGetStub).to.be.calledWith('/identity_check/v0.1/checks/check_id_value', sinon.default.match.any, sinon.default.match.any)
		})

	test
		.command(['identitychecks:list'])
		.it('should contain header table output', (ctx) => {
			const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

			expect(consoleOutputString).to.contain('check_id')
			expect(consoleOutputString).to.contain('created_at')
			expect(consoleOutputString).to.contain('status')
			expect(consoleOutputString).to.contain('match')
			expect(consoleOutputString).to.contain('charge_currency')
			expect(consoleOutputString).to.contain('charge_amount')
			expect(consoleOutputString).to.contain('no_sim_change')
		})

	test
		.command(['identitychecks:list'])
		.it('should contain pagination output', (ctx) => {
			const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

			expect(consoleOutputString).to.contain('Page 1 of 1')
			expect(consoleOutputString).to.contain('Identity Checks: 1 to 1 of 1')
		})

	test
		.command(['identitychecks:list'])
		.it('outputs resource list to cli.table', (ctx) => {
			const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

			expect(consoleOutputString).to.contain(identityCheckResource.check_id)
			expect(consoleOutputString).to.contain(identityCheckResource.created_at)
			expect(consoleOutputString).to.contain(identityCheckResource.charge_amount)
			expect(consoleOutputString).to.contain(identityCheckResource.charge_currency)
			expect(consoleOutputString).to.contain(identityCheckResource.match)
			expect(consoleOutputString).to.contain(identityCheckResource.status)
			expect(consoleOutputString).to.contain(identityCheckResource.no_sim_change)
		})

	test
		.command(['identitychecks:list', 'check_id_value'])
		.it('outputs result of a single resource to cli.table', (ctx) => {
			const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

			expect(consoleOutputString).to.contain(identityCheckResource.check_id)
			expect(consoleOutputString).to.contain(identityCheckResource.created_at)
			expect(consoleOutputString).to.contain(identityCheckResource.charge_amount)
			expect(consoleOutputString).to.contain(identityCheckResource.charge_currency)
			expect(consoleOutputString).to.contain(identityCheckResource.match)
			expect(consoleOutputString).to.contain(identityCheckResource.status)
			expect(consoleOutputString).to.contain(identityCheckResource.no_sim_change)
		})
})
