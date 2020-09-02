import * as chai from 'chai';
import * as sinon from 'ts-sinon'
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import {validate, transform} from '../../src/helpers/phone'

describe('phone', () => {

    describe('validate', () => {

        it('should validate UK phone number beginning 44', () => {
            expect(validate('447700900000')).to.be.true
        })

        it('should validate UK phone number beginning +44', () => {
            expect(validate('+447700900000')).to.be.true
        })

        it('should validate UK phone number with spaces', () => {
            expect(validate('44 7700 900 000')).to.be.true
        })

        it('should not validate UK phone number with no country code', () => {
            expect(validate('07700 900000')).to.be.false
        })

        it('should validate UK phone number with parenthesis', () => {
            expect(validate('+44 (7700) 900 000')).to.be.true
        })

        it('should validate US phone number with prefix in partenthesis', () => {
            expect(validate('(817) 569-8900')).to.be.true
        })

        it('should validate US phone number with + and prefix in partenthesis', () => {
            expect(validate('+1 (415) 555-0100')).to.be.true
        })

    })

    describe('transform', () => {
        it('should transform basic US phone number with country prefix', () => {
            expect(transform('+1817569-8900')).to.be.equal('+18175698900')
        })

        it('should transform US phone number with prefix in partenthesis to being with +', () => {
            expect(transform('(817) 569-8900')).to.be.equal('+18175698900')
        })

        it('should transform UK phone number with prefix in partenthesis to being with +', () => {
            expect(transform('44 (7700) 900 000')).to.be.equal('+447700900000')
        })

        it('should transform UK phone number to beging with +', () => {
            expect(transform('447700900000')).to.be.equal('+447700900000')
        })
    })

})