import { expect, test } from '@oclif/test'

describe('phonechecks:list', () => {

	test
		.command(['phonechecks:list'])
		.it('it should instantiate PhoneChecksAPIClient with expected arguments', ctx => {
			fail('Test not implemented')
		})

	test
		.command(['phonechecks:list'])
		.it('should call PhoneChecksAPIClient.list() if optional check_id argment is not supplied', ctx => {
			fail('Test not implemented')
		})

	test
		.command(['phonechecks:list'])
		.it('should call PhoneChecksAPIClient(checkId) if optional check_id argment is supplied', ctx => {
			fail('Test not implemented')
		})
})
