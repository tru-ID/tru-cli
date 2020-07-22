import * as sinon from 'ts-sinon'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import {stringToSnakeCase} from '../src/utilities'

describe('stringToSnakeCase', () => {
    it('should convert a string to snake-case', () => {
        expect( stringToSnakeCase('My Project') ).to.equal('my_project')
        expect( stringToSnakeCase('My  Project') ).to.equal('my_project')
        expect( stringToSnakeCase('   My    Project   ') ).to.equal('my_project')
    })
})