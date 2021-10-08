import { Hook } from '@oclif/config'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as figlet from 'figlet'
import chalk = require('chalk')

const hook: Hook<'init'> = async function (opts) {
  const setupCommand = 'setup:credentials'

  // Oclif captures the output of commands in order to update the README during prepack
  if (
    process.env.npm_lifecycle_event &&
    (process.env.npm_lifecycle_event === 'prepack' ||
      process.env.npm_lifecycle_event === 'version')
  )
    return

  // User is running setup command. Allow this to proceed without check.
  if (opts.id !== setupCommand) {
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
      this.log(
        `Please run ${chalk.green(
          `tru ${setupCommand}`,
        )} with the credentials found via https://developer.tru.id/console`,
      )
      this.log('')
      this.exit(1)
    }
  }
}

export default hook
