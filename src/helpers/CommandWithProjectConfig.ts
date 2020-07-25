import Command, { flags } from '@oclif/command'
import * as fs from 'fs-extra'
import * as path from 'path'

import CommandWithGlobalConfig from './CommandWithGlobalConfig'
import { IProjectConfiguration } from '../IProjectConfiguration'
import { Output } from '@oclif/parser'

export default abstract class CommandWithProjectConfig extends CommandWithGlobalConfig {

	static flags = {
		...CommandWithGlobalConfig.flags,
		'project-config': flags.string({
			description: 'Path to the Project configuration file',
		}),
		
	}

  	projectConfig?: IProjectConfiguration

  	async init() {
    	super.init()
	}
	  
	async loadConfig() {
		const projectConfigFullPath = this.flags['project-config'] ?? path.join(process.cwd(), '4auth.json')
    	if (fs.existsSync(projectConfigFullPath) === false) {
      		this.log('The current working directory does not have a project configuration file (4auth.json).\n' +
        			'Please run `4auth projects:create` to create a project and associated configuration file.')
        	this.exit(1)
    	}
    	try {
      		this.projectConfig = await fs.readJson(projectConfigFullPath)
    	}
    	catch (error) {
			this.log('There was a problem loading the 4auth.json configuration file',
            	`${error.toString()} ${JSON.stringify(error)}`)
      		this.exit(1)
    	}
	}
}