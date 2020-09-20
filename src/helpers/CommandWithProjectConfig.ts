import { flags } from '@oclif/command'
import * as fs from 'fs-extra'
import * as path from 'path'

import CommandWithGlobalConfig from './CommandWithGlobalConfig'
import { IProjectConfiguration } from '../IProjectConfiguration'

export default abstract class CommandWithProjectConfig extends CommandWithGlobalConfig {

	static projectDirFlagName = 'project_dir'

	static projectDirFlag = flags.string({
		description: 'The directory that contains the 4auth.json Project configuration file'
	})

	static flags = {
		...CommandWithGlobalConfig.flags,
		project_dir: CommandWithProjectConfig.projectDirFlag	
	}

  	projectConfig?: IProjectConfiguration

  	async init() {
    	await super.init()
	}
	  
	async loadProjectConfig() {
		const projectDirectory = this.flags[CommandWithProjectConfig.projectDirFlagName] ?? process.cwd()
		const projectConfigFullPath = path.join(projectDirectory, '4auth.json')
		const projectConfigExists = fs.existsSync(projectConfigFullPath)
    	if (projectConfigExists === false) {
      		this.log(`A project configuration file does not exist at "${projectConfigFullPath}".\n` +
        			'Please provide a valid directory path or run `4auth projects:create` to create a project and associated configuration file.')
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