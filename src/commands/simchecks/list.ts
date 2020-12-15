import { flags } from '@oclif/command'
import { cli } from 'cli-ux'
import * as Config from '@oclif/config'

import { APIConfiguration } from '../../api/APIConfiguration'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import ILogger from '../../helpers/ILogger'
import { ConsoleLogger, LogLevel } from '../../helpers/ConsoleLogger'
import { displayPagination } from '../../helpers/ux'
import { IListSimCheckResource, ISimCheckResource, SimCheckAPIClient } from '../../api/SimCheckAPIClient'

export default class SimCheckList extends CommandWithProjectConfig {
    static description = 'Lists details for all SIMChecks or a specific SIMCheck if the a check-id argument is passed'

    static pageNumberFlag = flags.integer({
        description: `The page number to return in the list resource. Ignored if the "check_id" argument is used.`,
        default: 1
    })
    static pageSizeFlag = flags.integer({
        description: 'The page size to return in list resource request. Ignored if the "check_id" argument is used.',
        default: 10
    })
    static searchFlag = flags.string({
        description: 'A RSQL search query. To ensure correct parsing put your query in quotes. For example "--search \'status==COMPLETED\'". Ignored if the "check_id" argument is used.'
    })
    static sortFlag = flags.string({
        description: 'Sort query in the form "{parameter_name},{direction}". For example, "created_at,asc" or "created_at,desc". Ignored if the "check_id" argument is used.',
    })

    static flags = {
        ...CommandWithProjectConfig.flags,
        ...cli.table.flags(),
        page_number: SimCheckList.pageNumberFlag,
        page_size: SimCheckList.pageSizeFlag,
        search: SimCheckList.searchFlag,
        sort: SimCheckList.sortFlag
    }

    static args = [
        {
            name: 'check_id',
            required: false,
            description: 'The check_id for the SIMCheck to list'
        }
    ]

    logger?: ILogger

    tokenScope = 'sim_check'

    typeOfCheck = 'SIMCheck'


    parseCommand() {
        return this.parse(SimCheckList);
    }

    getApiClient(apiConfiguration: APIConfiguration, logger: ILogger) {
        return new SimCheckAPIClient(apiConfiguration, logger)
    }

    async run() {

        const result = this.parseCommand()
        this.args = result.args
        this.flags = result.flags
        await this.loadProjectConfig()

        // TODO: move to CommandWithGlobalConfig
        this.logger = new ConsoleLogger(!this.flags.debug ? LogLevel.info : LogLevel.debug)
        this.logger.debug('--debug', true)


        let apiConfiguration = new APIConfiguration({
            clientId: this.projectConfig?.credentials[0].client_id,
            clientSecret: this.projectConfig?.credentials[0].client_secret,
            scopes: [this.tokenScope],
            baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.tru.id`
        })

        const apiCheckClient = this.getApiClient(apiConfiguration, this.logger);

        if (this.args.check_id) {
            let singleResource: ISimCheckResource
            try {
                singleResource = await apiCheckClient.get(this.args.check_id)

                this.displayResults([singleResource])
            }
            catch (error) {
                this.log('API Error:',
                    `${error.toString()} ${(error.response && error.response.data ? JSON.stringify(error.response.data, null, 2) : '')}`)
                this.exit(1)
            }
        }
        else {
            let listResource: IListSimCheckResource
            try {
                listResource = await apiCheckClient.list({
                    page: this.flags.page_number,
                    size: this.flags.page_size,
                    search: this.flags.search,
                    sort: this.flags.sort
                })

                this.displayResults(listResource._embedded.checks)
                displayPagination(this.logger, listResource.page, `${this.typeOfCheck}s`)
            }
            catch (error) {
                this.log('API Error:',
                    `${error.toString()} ${(error.response && error.response.data ? JSON.stringify(error.response.data, null, 2) : '')}`)
                this.exit(1)
            }
        }
    }

    displayResults(resources: ISimCheckResource[]) {
        cli.table(resources, {
            check_id: {
                header: 'check_id'
            },
            created_at: {
                header: 'created_at'
            },
            status: {
                header: 'status'
            },
            charge_currency: {
                header: 'charge_currency'
            },
            charge_amount: {
                header: 'charge_amount'
            },
            no_sim_change: {
                header: 'no_sim_change',
            },
            last_sim_change_at: {
                header: 'last_sim_change_at',
            },
            url: {
                extended: true,
                header: '_links.self.href',
                get: row => row._links.self.href
            }
        }, {
            printLine: (s: any) => { this.logger!.info(s) },
            ...this.flags, // parsed flags
        })
    }
}
