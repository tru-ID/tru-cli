import {flags} from '@oclif/command'
import ILogger from './ILogger'

const PHONECHECK_CALLBACK_URL_FLAG_NAME = 'phonecheck-callback'
const REMOVE_PHONECHECK_CALLBACK_URL_FLAG_NAME = 'remove-phonecheck-callback'
const PROJECT_MODE_FLAG_NAME = 'mode'

export const phoneCheckCallbackUrlFlag = {
  flagName: PHONECHECK_CALLBACK_URL_FLAG_NAME,
  flag: {
    'phonecheck-callback': flags.string({
      description: 'set a callback to be invoked when a Phone Check reaches an end state',
      exclusive: [REMOVE_PHONECHECK_CALLBACK_URL_FLAG_NAME]
    })
  }
}

export const removePhoneCheckCallbackFlag = {
  flagName: REMOVE_PHONECHECK_CALLBACK_URL_FLAG_NAME,
  flag: {
    'remove-phonecheck-callback': flags.boolean({
      description: 'remove the Phone Check callback configuration from the Project',
      default: false,
      exclusive: [PHONECHECK_CALLBACK_URL_FLAG_NAME]
    })
  }
}

export const phoneCheckCallbackUrlFlagValidation = (url: string, logger: ILogger): boolean => {
    let validated = true
    try{
      const callbackUrl = new URL(url)

      if(callbackUrl.protocol === 'http:') {
        logger.warn(`"${phoneCheckCallbackUrlFlag.flagName}" was detected to be HTTP. Please consider updated to be HTTPS.`)
      }
    }
    catch(error) {
      logger.error(`"${phoneCheckCallbackUrlFlag.flagName}" must be a valid URL`)
      validated = false
    }
    return validated
}

export const projectModeFlag = {
  flagName: PROJECT_MODE_FLAG_NAME,
  flag: {
    'mode': flags.string({
      description: 'Set the project mode to "live" or "sandbox"',
      options: ['live', 'sandbox']
    })
  }
}