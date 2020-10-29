import { test } from '@oclif/test'
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
import { ConsoleLogger } from '../../../src/helpers/ConsoleLogger'

import { buildConsoleString } from '../../test_helpers'
import { CheckResource, IListCheckResource } from '../../../src/api/ChecksAPIClient';
import { CheckStatus } from '../../../src/api/CheckStatus';


describe('phonechecks:list', () => {

	let phoneChecksApiClientConstructorStub: any
	let phoneChecksApiClientListStub: any
	let phoneChecksApiClientGetStub: any
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

	const phoneCheckResource: CheckResource = {
		_links: {
			self: {
				href: 'https://us.api.tru.id/phone_checks/v0.1/checks/c69bc0e6-a429-11ea-bb37-0242ac130002'
			}
		},
		charge_amount: 1,
		charge_currency: 'API',
		check_id: 'c69bc0e6-a429-11ea-bb37-0242ac130002',
		created_at: '2020-06-01T16:43:30+00:00',
		updated_at: '2020-06-01T16:43:30+00:00',
		match: false,
		status: CheckStatus.EXPIRED,
	}

	const checksListResource: IListCheckResource<CheckResource> = {
		_embedded: {
			checks: [
				phoneCheckResource
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

		phoneChecksApiClientListStub =
			sinon.default.stub(phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype, 'list')
		phoneChecksApiClientListStub.resolves(checksListResource)

		phoneChecksApiClientGetStub =
			sinon.default.stub(phoneCheckAPIClientModules.PhoneChecksAPIClient.prototype, 'get')
		phoneChecksApiClientGetStub.resolves(phoneCheckResource)

		consoleLoggerInfoStub = sinon.default.stub(ConsoleLogger.prototype, 'info')
	})

	afterEach(() => {
		sinon.default.restore()
	})

	test
		.do(() => {
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

	test
		.command(['phonechecks:list'])
		.it('should contain header table output', (ctx) => {
			const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

			expect(consoleOutputString).to.contain('check_id')
			expect(consoleOutputString).to.contain('created_at')
			expect(consoleOutputString).to.contain('status')
			expect(consoleOutputString).to.contain('match')
			expect(consoleOutputString).to.contain('charge_currency')
			expect(consoleOutputString).to.contain('charge_amount')
		})

	test
		.command(['phonechecks:list'])
		.it('should contain pagination output', (ctx) => {
			const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

			expect(consoleOutputString).to.contain('Page 1 of 1')
			expect(consoleOutputString).to.contain('Phone Checks: 1 to 1 of 1')
		})

	test
		.command(['phonechecks:list'])
		.it('outputs resource list to cli.table', (ctx) => {
			const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

			expect(consoleOutputString).to.contain(phoneCheckResource.check_id)
			expect(consoleOutputString).to.contain(phoneCheckResource.created_at)
			expect(consoleOutputString).to.contain(phoneCheckResource.charge_amount)
			expect(consoleOutputString).to.contain(phoneCheckResource.charge_currency)
			expect(consoleOutputString).to.contain(phoneCheckResource.match)
			expect(consoleOutputString).to.contain(phoneCheckResource.status)
		})

	test
		.command(['phonechecks:list', 'check_id_value'])
		.it('outputs result of a single resource to cli.table', (ctx) => {
			const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

			expect(consoleOutputString).to.contain(phoneCheckResource.check_id)
			expect(consoleOutputString).to.contain(phoneCheckResource.created_at)
			expect(consoleOutputString).to.contain(phoneCheckResource.charge_amount)
			expect(consoleOutputString).to.contain(phoneCheckResource.charge_currency)
			expect(consoleOutputString).to.contain(phoneCheckResource.match)
			expect(consoleOutputString).to.contain(phoneCheckResource.status)
		})
})
