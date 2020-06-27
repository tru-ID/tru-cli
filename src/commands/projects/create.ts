import {flags} from '@oclif/command'
import CommandWithConfig from '../commandWithConfig'
import cli from 'cli-ux'
import Projects from '../../api/projects'
import APIConfiguration from '../../api/APIConfiguration'

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
        args.name = await cli.prompt('What is the name of the project?')
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

    console.log(projectCreationResult.data)
  }
}