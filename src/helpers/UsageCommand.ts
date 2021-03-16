import { cli } from 'cli-ux'
import { flags } from '@oclif/command'
import * as Config from '@oclif/config'
import { APIConfiguration } from '../api/APIConfiguration'
import { UsageApiClient, UsageResource } from '../api/UsageAPIClient'
import ILogger from '../helpers/ILogger';
import CommandWithGlobalConfig from '../helpers/CommandWithGlobalConfig'


export default class UsageCommand extends CommandWithGlobalConfig {

    static flags = {
        ...CommandWithGlobalConfig.flags,
        ...cli.table.flags(),
        'search': flags.string({
            description: 'The RSQL query for usage. date is required.',
            required: true
        }),
        'group-by': flags.string({
            description: 'Group results by one or more fields e.g product_id or project_id or product_id,project_id',
            required: false,

        }),
    }

    tokenScope: string

    typeOfUsage: string

    constructor(argv: string[], config: Config.IConfig, typeOfUsage: string) {
        super(argv, config);
        this.tokenScope = 'usage';
        this.typeOfUsage = typeOfUsage;
    }


    getApiClient(apiConfiguration: APIConfiguration, logger: ILogger): UsageApiClient {

        return new UsageApiClient(apiConfiguration, logger);

    }

    displayResults(resources: UsageResource[]) {

        //Dynamic add columns

        let columns: { [k: string]: any } = {}

        let params = Object.getOwnPropertyNames(resources[0])

        for (let param of params) {

            columns[`${param}`] = {
                header: `${param}`
            }

        }

        cli.table(resources, columns, {
            printLine: (s: any) => { this.logger!.info(s) },
            ...this.flags, // parsed flags
        })


    }

    async run() {

        const result = this.parse(UsageCommand);

        this.args = result.args
        this.flags = result.flags

        await super.run();

        let apiConfiguration = new APIConfiguration({
            clientId: this.globalConfig?.defaultWorkspaceClientId,
            clientSecret: this.globalConfig?.defaultWorkspaceClientSecret,
            scopes: [this.tokenScope],
            baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.tru.id`
        })


        const apiCheckClient = this.getApiClient(apiConfiguration, this.logger);


        let usageParams = {
            search: this.flags.search,
            group_by: this.flags[`group-by`]
        };


        try {

            let listResource = await apiCheckClient.getUsage(usageParams, this.typeOfUsage);

            this.displayResults(listResource._embedded.usage);

        }
        catch (error) {
            this.log('API Error:',
                `${error.toString()} ${(error.response && error.response.data ? JSON.stringify(error.response.data, null, 2) : '')}`)
            this.exit(1)
        }

    }

}
