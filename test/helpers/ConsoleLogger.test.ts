import * as chai from 'chai'
import * as sinon from 'ts-sinon'
import * as sinonChai from 'sinon-chai'

const expect = chai.expect
chai.use(sinonChai)

import { ConsoleLogger, LogLevel } from '../../src/helpers/ConsoleLogger'

describe('constructor', () => {
  afterEach(() => {
    sinon.default.restore()
  })

  it('should use LogLevel.info by default', () => {
    const logger = new ConsoleLogger()
    expect(logger.loglevel).to.be.equal(LogLevel.info)
  })

  it('should set the loglevel', () => {
    const logger = new ConsoleLogger(LogLevel.debug)
    expect(logger.loglevel).to.be.equal(LogLevel.debug)
  })

  it('should use global.console as the underlying logger', () => {
    const consoleInfoStub = sinon.default.stub(global.console, 'info')

    const logger = new ConsoleLogger()
    const msg = 'hello'
    logger.info(msg)
    expect(consoleInfoStub).to.have.been.calledWith(msg)
  })

  it('should only log at info level when LogLevel.info is set', () => {
    const consoleInfoStub = sinon.default.stub(global.console, 'info')
    const consoleDebugStub = sinon.default.stub(global.console, 'debug')

    const logger = new ConsoleLogger(LogLevel.info)
    const msg = 'hello'
    logger.info(msg)
    logger.debug(msg)
    expect(consoleInfoStub).to.have.been.calledWith(msg)
    expect(consoleDebugStub).to.not.have.been.called
  })

  it('should log at info and debug level when LogLevel.debug is set', () => {
    const consoleInfoStub = sinon.default.stub(global.console, 'info')
    const consoleDebugStub = sinon.default.stub(global.console, 'debug')

    const logger = new ConsoleLogger(LogLevel.debug)
    const msg = 'hello'
    logger.info(msg)
    logger.debug(msg)
    expect(consoleInfoStub).to.have.been.calledWith(msg)
    expect(consoleDebugStub).to.have.been.calledWith(msg)
  })
})
