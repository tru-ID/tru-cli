import { test } from '@oclif/test'
import * as chai from 'chai'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'ts-sinon'
import * as coverageAPIClientModules from '../../../src/api/CoverageAPIClient'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'
import { IProjectConfiguration } from '../../../src/IProjectConfiguration'

const expect = chai.expect
chai.use(sinonChai)

describe('coverage:country', () => {
    const reachableCountryCode = 'US'
    const unreachableIp = 'IT'

    const globalConfig: IGlobalConfiguration = {
        defaultWorkspaceClientId: 'clientID',
        defaultWorkspaceClientSecret: 'clientSecret',
        defaultWorkspaceDataResidency: 'eu',
    }

    const projectConfigFileLocation = path.join(process.cwd(), 'tru.json')
    const projectConfig: IProjectConfiguration = {
        project_id: "c69bc0e6-a429-11ea-bb37-0242ac130003",
        name: "My test project",
        created_at: "2020-06-01T16:43:30+00:00",
        updated_at: "2020-06-01T16:43:30+00:00",
        credentials: [
            {
                client_id: "project client id",
                client_secret: "project client secret",
                scopes: ["coverage"],
                created_at: "2020-06-01T16:43:30+00:00"
            }
        ]
    }

    const existsSyncStub: any = sinon.default.stub(fs, 'existsSync')
    const coverageAPICountryReachStub: any = sinon.default.stub(coverageAPIClientModules.CoverageAPIClient.prototype, 'countryReach')
    const readJsonStub: any = sinon.default.stub(fs, 'readJson')

    beforeEach(() => {
        existsSyncStub.withArgs(sinon.default.match(new RegExp(/config.json/))).returns(true)

        readJsonStub.withArgs(
            sinon.default.match(sinon.default.match(new RegExp(/config.json/))))
            .resolves(globalConfig)

        readJsonStub.withArgs(
            sinon.default.match(projectConfigFileLocation))
            .resolves(projectConfig)
    })

    test
        .add('mockedResponse', () => {
            const reachResponse: coverageAPIClientModules.ICoverageCountryResponse = {
                country_code: 'US',
                dialing_code: 1,
                products: [{
                    product_id: 'PCK',
                    product_name: 'Phone Check',
                    coverage: 'FULL',
                    networks: [{
                        network_id: '123123',
                        network_name: 'ACME Networks',
                        prices: [{ currency: 'API', amount: 1 }]
                    }]
                }]
            }

            coverageAPICountryReachStub
                .withArgs(reachableCountryCode)
                .resolves(reachResponse)

            return reachResponse
        })
        .stdout()
        .command(['coverage:country', reachableCountryCode])
        .it('outputs result to cli.table', (ctx) => {
            expect(ctx.stdout).to.contain(ctx.mockedResponse.products[0].product_name)
            expect(ctx.stdout).to.contain(ctx.mockedResponse.products[0].networks[0].network_id)
            expect(ctx.stdout).to.contain(ctx.mockedResponse.products[0].networks[0].network_name)
            expect(ctx.stdout).to.contain(ctx.mockedResponse.products[0].networks[0].prices[0].currency)
            expect(ctx.stdout).to.contain(ctx.mockedResponse.products[0].networks[0].prices[0].amount)
        })

    test
        .do((_ctx) => {
            coverageAPICountryReachStub
                .withArgs(unreachableIp)
                .resolves(undefined)
        })
        .stdout()
        .command(['coverage:country', unreachableIp])
        .it('outputs no reach result', (ctx) => {
            expect(ctx.stdout).to.contain('No reach')
        })

    test
        .do((_ctx) => {

            let projectWithoutRequiredScope = { ...projectConfig }
            projectWithoutRequiredScope.credentials[0].scopes = []
            readJsonStub.withArgs(
                sinon.default.match(projectConfigFileLocation))
                .resolves(projectWithoutRequiredScope)
        })
        .command(['coverage:country', 'anything'])
        .exit(1)
        .it('project must have coverage scope')
})