import { Hook } from '@oclif/core'
import figlet from 'figlet'
import fs from 'fs-extra'
import { custom } from 'openid-client'
import path from 'path'
import chalk = require('chalk')

custom.setHttpOptionsDefaults({
  timeout: 7000,
})

const hook: Hook<'init'> = async function (opts) {
  const loginCommand = 'login'

  // Oclif captures the output of commands in order to update the README during prepack
  if (
    process.env.npm_lifecycle_event &&
    (process.env.npm_lifecycle_event === 'prepack' ||
      process.env.npm_lifecycle_event === 'version')
  )
    return

  if (opts.id === loginCommand) {
    return
  }

  // User is running login command. Allow this to proceed without check.
  const configFileLocation: string = path.join(
    this.config.configDir,
    'config.json',
  )

  // If the user configuration file does not exist, create it
  const configExists = fs.existsSync(configFileLocation)
  if (configExists === false) {
    this.log(
      figlet.textSync('tru.ID CLI', {
        font: 'Slant',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    )

    this.log("Welcome to the tru.ID CLI! Let's start by configuring the CLI")
    this.log('')
    this.log(`Please run ${chalk.green(`tru ${loginCommand}`)}`)
    this.log('')
    this.exit(1)
  }
}

export default hook
