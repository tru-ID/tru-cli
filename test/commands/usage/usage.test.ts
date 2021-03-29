import { test } from '@oclif/test'
import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import * as fs from 'fs-extra'

import * as usageApiClientModules from '../../../src/api/UsageAPIClient';
import { UsageResource, IListUsageResource } from '../../../src/api/UsageAPIClient';
import IGlobalConfiguration from '../../../src/IGlobalConfiguration';
import { APIConfiguration } from '../../../src/api/APIConfiguration';
import { ConsoleLogger } from '../../../src/helpers/ConsoleLogger'
import * as httpClientModule from '../../../src/api/HttpClient';
import { buildConsoleString } from '../../test_helpers'
import MockDate from 'mockdate'

describe('usage', () => {

    let readJsonStub: any
    let consoleLoggerInfoStub: any

    let httpClientGetStub: any


    let expectedUserConfig: IGlobalConfiguration = {
        defaultWorkspaceClientId: 'my client id',
        defaultWorkspaceClientSecret: 'my client secret',
        defaultWorkspaceDataResidency: 'eu'
    }

    let usageResources: UsageResource[] = [

        {
            amount: 10,
            date: "2020-10-03",
            currency: "API",
            counter: 10
        },

        {
            amount: 20,
            date: "2020-10-02",
            currency: "API",
            counter: 20
        }

    ];

    let listUsageResource: IListUsageResource = {
        _embedded: {
            usage: usageResources
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
    };


    const testParams = [
        { command: 'usage:daily', subpath: "daily" },
        { command: 'usage:monthly', subpath: "monthly" },
        { command: 'usage:hourly', subpath: "hourly" }]

    beforeEach(() => {
        sinon.default.stub(fs, 'existsSync').withArgs(sinon.default.match(new RegExp(/config.json/))).returns(true)

        readJsonStub = sinon.default.stub(fs, 'readJson')

        readJsonStub.withArgs(
            sinon.default.match(sinon.default.match(new RegExp(/config.json/))))
            .resolves(expectedUserConfig)

        httpClientGetStub = sinon.default.stub(httpClientModule.HttpClient.prototype, 'get')
        httpClientGetStub.withArgs('/console/v0.1/workspaces/default/usage/daily', sinon.default.match.any, sinon.default.match.any).resolves(listUsageResource)
        httpClientGetStub.withArgs(`/console/v0.1/workspaces/default/usage/monthly`, sinon.default.match.any, sinon.default.match.any).resolves(listUsageResource)
        httpClientGetStub.withArgs(`/console/v0.1/workspaces/default/usage/hourly`, sinon.default.match.any, sinon.default.match.any).resolves(listUsageResource)

        consoleLoggerInfoStub = sinon.default.stub(ConsoleLogger.prototype, 'info')
        MockDate.set('2020-01-01');

    })

    afterEach(() => {
        sinon.default.restore()
        MockDate.reset();
    })


    testParams.forEach(({ command, subpath }) => {
        test
            .command([command, '--search=date=2020-10-01', '--group-by=product_id'])
            .it(`${command} should call /console/v0.1/workspaces/default/usage/${subpath}`, ctx => {
                expect(httpClientGetStub).to.be.calledWith(`/console/v0.1/workspaces/default/usage/${subpath}`, {
                    search: 'date=2020-10-01',
                    group_by: 'product_id',
                    page: 1,
                    size: 10
                }, sinon.default.match.any)
            })
    })



    testParams.forEach(({ command }) => {
        test
            .command([command, '--search=date=2020-10-01'])
            .it(`${command} should contain header table output`, (ctx) => {
                const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

                expect(consoleOutputString).to.contain('amount')
                expect(consoleOutputString).to.contain('counter')
                expect(consoleOutputString).to.contain('date')
                expect(consoleOutputString).to.contain('currency')
            })
    })



    {
        let params = [
            { command: 'usage:daily', subpath: "daily", searchParam: 'date>=2020-01-01' },
            { command: 'usage:monthly', subpath: "monthly", searchParam: 'date>=2020-01' },
            { command: 'usage:hourly', subpath: "hourly", searchParam: 'date>=2020-01-01T00' }
        ]

        params.forEach(({ command, subpath, searchParam }) => {
            test
                .command([command, '--group-by=product_id'])
                .it(`${command} should call /console/v0.1/workspaces/default/usage/${subpath} with correct default search`, ctx => {
                    expect(httpClientGetStub).to.be.calledWith(`/console/v0.1/workspaces/default/usage/${subpath}`, {
                        search: searchParam,
                        group_by: 'product_id',
                        page: 1,
                        size: 10
                    }, sinon.default.match.any)
                })
        })
    }




    testParams.forEach(({ command }) => {

        test
            .command([command, '--search=date=2020-10-01', '--output=csv'])
            .it('should contain correct values', (ctx) => {
                const consoleOutputString = buildConsoleString(consoleLoggerInfoStub)

                expect(consoleOutputString).to.contain('amount,date,currency,counter')
                expect(consoleOutputString).to.contain('10,2020-10-03,API,10')
                expect(consoleOutputString).to.contain('20,2020-10-02,API,20')

            })
    })


})
