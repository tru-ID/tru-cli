import chai from 'chai'
import sinonChai from 'sinon-chai'
import { stringToSnakeCase } from '../src/utilities'

const expect = chai.expect
chai.use(sinonChai)

describe('stringToSnakeCase', () => {
  it('should convert a string to snake-case', () => {
    expect(stringToSnakeCase('My Project')).to.equal('my_project')
    expect(stringToSnakeCase('My  Project')).to.equal('my_project')
    expect(stringToSnakeCase('   My    Project   ')).to.equal('my_project')
  })
})
