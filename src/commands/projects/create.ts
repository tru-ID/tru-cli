import {flags} from '@oclif/command'
import CommandWithConfig from '../commandWithConfig'
import * as inquirer from 'inquirer'
import {Projects} from '../../api/projects'
import {APIConfiguration} from '../../api/APIConfiguration'
import {stringToSnakeCase} from '../../utilities'
import { string } from '@oclif/command/lib/flags'
import * as fs from 'fs-extra'

export default class Create extends CommandWithConfig {
  static description = 'Creates a new Project'

  static examples = [
    `$ 4auth project:create
What is the name of the project?: My first project
Creating Project "My first project"
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [
    {
        name: 'name',
        required: false, // caught upon running and then user is prompted
        description: 'the name of the project to create'
    }
]

  async run() {
    const {args} = this.parse(Create)

    if(!args.name) {
        const response:any = await inquirer.prompt([
          {
            name: 'projectName',
            message: 'What is the name of the project?',
            type: 'input'
          }
        ])
        args.name = response['projectName']
    }
    this.log(`Creating Project "${args.name}"`)

    const projectsAPI = new Projects(
        new APIConfiguration({
            clientId: 'client_id',
            clientSecret: 'client_secret', 
            baseUrl: 'https://localhost:4010'
        })
    )
    const projectCreationResult = await projectsAPI.create({
        name: args.name
    })

    const directoryName = stringToSnakeCase(args.name)
    const directoryToCreate = `${process.cwd()}/${directoryName}`
    if(fs.existsSync(directoryToCreate)) {
        this.error(`Cannot create project directory "${directoryToCreate}" because a directory with that name already exists.\n` +
                   `Please choose another name for your project.`, {exit: 1})
    }
    else {
      const configFileFullPathToCreate = `${directoryToCreate}/4auth.json`
      try {
        // Save the project configuration to match the Project resource excluding the _links property
        const projectConfig = {
          ...projectCreationResult.data
        }
        delete projectConfig._links
        await fs.outputJson(configFileFullPathToCreate, projectConfig, {spaces: '\t'})
      }
      catch(error) {
        this.error(`An unexpected error occurred: ${error}`, {exit: 1})
      }
    }
  }

}