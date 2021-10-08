import axios from 'axios'

export function stringToSnakeCase(value: string) {
  return value.trim().replace(new RegExp(/\s+/g), '_').toLowerCase()
}

export function logApiError(
  log: (message?: string, ...args: any[]) => void,
  error: any,
) {
  if (axios.isAxiosError(error)) {
    log(
      'API Error:',
      `${error.toString()} ${
        error.response?.data ? JSON.stringify(error.response.data, null, 2) : ''
      }`,
    )
  } else {
    log('API Error (no response):', error)
  }
}
