import {Hook} from '@oclif/config'
import * as fs from 'fs-extra'
import * as path from 'path'
import cli from 'cli-ux'
import * as inquirer from 'inquirer'
import IGlobalConfiguration from '../../IGlobalConfiguration'

interface RequiredConfiguration{
  defaultWorkspaceClientId: ConfigurationObject
  defaultWorkspaceClientSecret: ConfigurationObject
  defaultWorkspaceDataResidency: ConfigurationObject
  [index: string]: any
}

interface ConfigurationObject {
  notSetValue: any
  defaultValue: any
  prompt: string
  [index: string]: any
}

interface JSONConfig {
  [index: string]: any
}

const requiredConfiguation:RequiredConfiguration = {
  defaultWorkspaceClientId: {
    notSetValue: null,
    defaultValue: null,
    prompt: 'Please provide your workspace `client_id`. Hint: http://4auth.io/console/getting-started',
  },
  defaultWorkspaceClientSecret: {
    notSetValue: null,
    defaultValue: null,
    prompt: 'Please provide your workspace `client_secret`. Hint: http://4auth.io/console/getting-started'
  },
  defaultWorkspaceDataResidency: {
    notSetValue: null,
    defaultValue: 'eu',
    prompt: 'Please provide your workspace data residency. Hint: http://4auth.io/console/getting-started'
  }
}

const hook: Hook<'init'> = async function (opts) {

  const configFileLocation:string = path.join(this.config.configDir, 'config.json')

  // If the user configuration file does not exist, create it
  if(!fs.existsSync(configFileLocation)) {
    this.log('Welcome to the 4Auth CLI! Let\'s start by configuring the CLI')
    await promptForMissingConfig({}, configFileLocation)
  }
  else {
    // Ensure default values have been updated by the user
    const userConfig:IGlobalConfiguration = await fs.readJson(configFileLocation)
    await promptForMissingConfig(userConfig, configFileLocation)
  }
}

async function promptForMissingConfig(existingConfig:IGlobalConfiguration, configFileLocation:string) {

  let writeRequired:boolean = false
  for await (const configItem of Object.keys(requiredConfiguation)) {
    // If the current configuration value indicates it's never been set
    if(existingConfig[configItem] === requiredConfiguation[configItem].notSetValue || existingConfig[configItem] === undefined) {

      // existingConfig[configItem] = await cli.prompt(requiredConfiguation[configItem].prompt)

      const response:any = await inquirer.prompt([
        {
          name: configItem,
          message: requiredConfiguation[configItem].prompt,
          type: 'input',
          default: requiredConfiguation[configItem].defaultValue
        }
      ])
      existingConfig[configItem] = response[configItem]

      writeRequired = true
    }
  }

  if(writeRequired) {
    cli.action.start('Thanks. Writing your updated configuration')
    await fs.outputFile(configFileLocation, JSON.stringify(existingConfig, null, 2))
    await cli.wait() // show brief working indicator for user reassurance
    cli.action.stop()
  }
}

export default hook
