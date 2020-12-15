import * as Config from '@oclif/config'
import { APIConfiguration } from '../../api/APIConfiguration'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import ILogger from '../../helpers/ILogger'
import { ConsoleLogger, LogLevel } from '../../helpers/ConsoleLogger'
import { validate, transform, promptForNumber } from '../../helpers/phone'
import * as inquirer from 'inquirer'
import { ISimCheckResource, SimCheckAPIClient } from '../../api/SimCheckAPIClient'
import { CheckStatus } from '../../api/CheckStatus';

const QR_CODE_LINK_HANDLER_URL = `https://r.tru.id?u={CHECK_URL}&c={CHECK_ID}&t={ACCESS_TOKEN}`

export default class SimChecksCreate extends CommandWithProjectConfig {

    static description = 'Create SIMChecks within a Project'


    static flags = {
        ...CommandWithProjectConfig.flags
    }

    static args = [
        {
            name: 'phone_number',
            required: false, // caught upon running and then user is prompted
            description: 'The phone number to perform the SIMCheck on'
        }
    ]

    logger?: ILogger

    typeOfCheck = "SIMCheck"

    tokenScope = "sim_check"

    constructor(argv: string[], config: Config.IConfig) {
        super(argv, config)
    }

    parseCommand() {
        return this.parse(SimChecksCreate);
    }

    async run() {
        const result = this.parseCommand();
        this.args = result.args
        this.flags = result.flags
        await this.loadProjectConfig()

        // TODO: move to CommandWithGlobalConfig
        this.logger = new ConsoleLogger(!this.flags.debug ? LogLevel.info : LogLevel.debug)
        this.logger.debug('--debug', true)

        if (this.args.phone_number === undefined) {
            const response = await promptForNumber(this.typeOfCheck)

            this.args.phone_number = response['phone_number']
        }

        this.log(`Creating ${this.typeOfCheck} for ${this.args.phone_number}\n`)

        let apiConfiguration = new APIConfiguration({
            clientId: this.projectConfig?.credentials[0].client_id,
            clientSecret: this.projectConfig?.credentials[0].client_secret,
            scopes: [this.tokenScope],
            baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.tru.id`
        })

        let simCheckApiClient = this.getApiClient(apiConfiguration, this.logger)

        let response: ISimCheckResource;

        try {
            response = await simCheckApiClient.create({
                phone_number: this.args.phone_number
            })

        } catch (error) {
            this.log('API Error:',
                `${error.toString()} ${(error.response && error.response.data ? JSON.stringify(error.response.data, null, 2) : '')}`)
            this.exit(1)
        }

        if (response.status == CheckStatus.COMPLETED) {

            this.log(`\tstatus: ${response.status}`)
            this.log(`\tno_sim_change: ${response.no_sim_change}`)
            this.log(`\tlast_sim_change_at: ${response.last_sim_change_at}`)
        }
        else {
            this.log(`The ${this.typeOfCheck} could not be created. The ${this.typeOfCheck} status is ${response.status}`)
            this.exit(1)
        }

    }

    getApiClient(apiConfiguration: APIConfiguration, logger: ILogger): SimCheckAPIClient {
        return new SimCheckAPIClient(apiConfiguration, logger)
    }


}