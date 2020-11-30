import { test } from '@oclif/test'
import * as sinon from 'ts-sinon'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import { ConsoleLogger } from '../../../src/helpers/ConsoleLogger'

const expect = chai.expect
chai.use(sinonChai)

import * as fs from 'fs-extra'
import { buildConsoleString } from '../../test_helpers'

describe('setup:credentials', () => {

    let workspaceId = 'workspaceId'
    let workspaceSecret = 'workspaceSecret'
    let dataResidency = 'eu'
    let commandArgs = [workspaceId, workspaceSecret, dataResidency]

    let outputJsonStub: any

    afterEach(() => {
        sinon.default.restore()
    })

    test
        .stdout()
        .command(['setup:credentials', ...commandArgs])
        .it('should write workspace credentials to global config file', (ctx) => {
            expect(ctx.stdout).to.contain('new credentials were written to')
        });

    test
        .do((_ctx) => {
            outputJsonStub = sinon.default.stub(fs, 'outputJson')
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