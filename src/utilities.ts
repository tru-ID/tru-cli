import { Command } from '@oclif/core'
import axios from 'axios'

export function stringToSnakeCase(value: string) {
  return value.trim().replace(new RegExp(/\s+/g), '_').toLowerCase()
}

export function logApiError(command: Command, error: any) {
  if (axios.isAxiosError(error)) {
    command.log(
      'API Error:',
      `${error.toString()} ${
        error.response?.data ? JSON.stringify(error.response.data, null, 2) : ''
      }`,
    )
  } else {
    command.log('API Error (no response):', error)
  }
}
