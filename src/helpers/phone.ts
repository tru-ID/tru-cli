import phone = require('phone')

export const validate = (number: string): boolean => {
    number = transform(number)
    const result = phone(number)
    if(result[1]) {
        return true
    }
    return false
}

export const transform = (number: string): string => {
    number = number.trim()
    const firstChar = number.charAt(0)
    if(firstChar !== '+' && firstChar !== '(') {
        // phone will try to detect the country code if there's a plus prefix
        number = '+' + number
    }
    const result = phone(number)
    return result[0] || number
}