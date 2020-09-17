import {flags} from '@oclif/command'
import ILogger from './ILogger'

export const phoneCheckCallbackUrlFlag = {
  'phonecheck-callback-url': flags.string({
    description: 'callback to be invoked when a Phone Check reaches an end state',
  })
}

export const phoneCheckCallbackUrlFlagValidation = (url: string, logger: ILogger): boolean => {
    let validated = true

    if(url.length > 0) {
      try{
        const callbackUrl = new URL(url)

        if(callbackUrl.protocol === 'http:') {
          logger.warn('"phonecheck-callback-url" was detected to be HTTP. Please consider updated to be HTTPS.')
        }
      }
      catch(error) {
        logger.error('"phonecheck-callback-url" must be a valid URL')
        validated = false
      }
    }
    else {
      // value of "" means removing it
    }

    return validated
}