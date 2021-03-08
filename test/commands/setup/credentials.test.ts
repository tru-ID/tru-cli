import { test } from '@oclif/test'
import * as sinon from 'ts-sinon'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import { ConsoleLogger } from '../../../src/helpers/ConsoleLogger'

const expect = chai.expect
chai.use(sinonChai)

import * as fs from 'fs-extra'
import { buildConsoleString } from '../../test_helpers'
import IGlobalConfiguration from '../../../src/IGlobalConfiguration'

describe('setup:credentials', () => {

    let workspaceId = 'workspaceId'
    let workspaceSecret = 'workspaceSecret'
    let dataResidency = 'eu'
    let commandArgs = [workspaceId, workspaceSecret, dataResidency]

    let outputJsonStub: any
    let readJsonStub: any

    beforeEach(() => {
        let expectedUserConfig: IGlobalConfiguration = {
            defaultWorkspaceClientId: 'my client id',
            defaultWorkspaceClientSecret: 'my client secret',
            defaultWorkspaceDataResidency: 'eu'
        }
        sinon.default.stub(fs, 'existsSync').withArgs(sinon.default.match(new RegExp(/config.json/))).returns(true)

        readJsonStub = sinon.default.stub(fs, 'readJson')
        readJsonStub.withArgs(
            sinon.default.match(sinon.default.match(new RegExp(/config.json/))))
            .resolves(expectedUserConfig)
        outputJsonStub = sinon.default.stub(fs, 'outputJson')
    })

    afterEach(() => {
        sinon.default.restore()
    })

    test
        .do(() => {
            outputJsonStub.resolves()
        })
        .stdout()
        .command(['setup:credentials', ...commandArgs])
        .it('should write workspace credentials to global config file', (ctx) => {
            expect(ctx.stdout).to.contain('new credentials were written to')
        });

    test
        .do((_ctx) => {
            let error = {
                message: 'permission error',
                code: 'EPERM'
            }
            outputJsonStub.rejects(error)
        })
        .stdout()
        .command(['setup:credentials', ...commandArgs])
        .exit(1)
        .it('should handle missing write permissions for global config file')
})