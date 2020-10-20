import {Hook} from '@oclif/config'
import * as fs from 'fs-extra'
import * as path from 'path'
import cli from 'cli-ux'
import * as inquirer from 'inquirer'
import * as figlet from 'figlet';

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
    prompt: 'Please provide your workspace `client_id`'
  },
  defaultWorkspaceClientSecret: {
    notSetValue: null,
    defaultValue: null,
    prompt: 'Please provide your workspace `client_secret`'
  },
  defaultWorkspaceDataResidency: {
    notSetValue: null,
    defaultValue: 'eu',
    prompt: 'Please provide your workspace data residency'
  }
}

const hook: Hook<'init'> = async function (opts) {

  // Oclif captures the output of commands in order to update the README during prepack
  if(process.env.npm_lifecycle_event && process.env.npm_lifecycle_event === 'prepack') return

  const configFileLocation:string = path.join(this.config.configDir, 'config.json')

  // If the user configuration file does not exist, create it
  if(!fs.existsSync(configFileLocation)) {
    this.log(figlet.textSync('tru CLI', {
      font: 'Slant',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    }))

    this.log('Welcome to the tru CLI! Let\'s start by configuring the CLI')
    this.log('')
    this.log('Configuration values can be found via http://tru.id/console/getting-started')
    this.log('')
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
    cli.log('')
    cli.action.start(`Thanks! Writing your updated configuration to ${configFileLocation}`)
    await fs.outputFile(configFileLocation, JSON.stringify(existingConfig, null, 2))
    await cli.wait() // show brief working indicator for user reassurance
    cli.action.stop()
    cli.log('')
  }
}

export default hook
