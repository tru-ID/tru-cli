import { flags } from '@oclif/command'
import {getHelpClass} from '@oclif/plugin-help'

import * as fs from 'fs-extra'
import * as path from 'path'

import CommandWithGlobalConfig from './CommandWithGlobalConfig'
import { IProjectConfiguration } from '../IProjectConfiguration'
import { Command } from '@oclif/config'

export default abstract class CommandWithProjectConfig extends CommandWithGlobalConfig {

	static projectDirFlagName = 'project-dir'

	static projectDirFlag = flags.string({
		description: 'The directory that contains the tru.json Project configuration file'
	})

	static flags = {
		...CommandWithGlobalConfig.flags,
		'project-dir': CommandWithProjectConfig.projectDirFlag
	}

  	projectConfig?: IProjectConfiguration

  	async init() {
    	await super.init()
	}

	async loadProjectConfig() {
		const projectDirectory = this.flags[CommandWithProjectConfig.projectDirFlagName] ?? process.cwd()
		const projectConfigFullPath = path.join(projectDirectory, 'tru.json')
		const projectConfigExists = fs.existsSync(projectConfigFullPath)
    	if (projectConfigExists === false) {
      		this.log(`A project configuration file does not exist at "${projectConfigFullPath}".\n` +
        			'Please provide a valid directory path or run `tru projects:create` to create a project and associated configuration file.')
        	this.exit(1)
    	}
    	try {
      		this.projectConfig = await fs.readJson(projectConfigFullPath)
    	}
    	catch (error) {
			this.log('There was a problem loading the tru.json configuration file',
            	`${error.toString()} ${JSON.stringify(error)}`)
      		this.exit(1)
    	}
	}

	showCommandHelp({exitCode = 0}: {exitCode: number}) {
		const HelpClass = getHelpClass(this.config)
		const help = new HelpClass(this.config);
		const cmd = this.config.findCommand(this.id as string) as Command
		help.showCommandHelp(cmd, this.config.topics)
        
        return this.exit(exitCode);
	  }
}
