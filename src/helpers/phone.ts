import phone = require('phone')
import * as inquirer from 'inquirer'

export const validate = (number: string): boolean => {
  number = transform(number)
  const result = phone(number)
  if (result[1]) {
    return true
  }
  return false
}

export const transform = (number: string): string => {
  number = number.trim()
  const firstChar = number.charAt(0)
  if (firstChar !== '+' && firstChar !== '(') {
    // phone will try to detect the country code if there's a plus prefix
    number = '+' + number
  }
  const result = phone(number)
  return result[0] || number
}

export const promptForNumber = async (typeOfCheck: string) => {
  return await inquirer.prompt([
    {
      name: 'phone_number',
      message: `Please enter the phone number you would like to ${typeOfCheck}`,
      type: 'input',
      validate: (input) => {
        if (validate(input)) {
          return true
        }
        return (
          'The phone number needs to be in E.164 format. For example, +447700900000 or +14155550100. ' +
          'Or a format that can be converted to E164. For example, 44 7700 900000 or 1 (415) 555-0100.'
        )
      },
      filter: transform,
    },
  ])
}
