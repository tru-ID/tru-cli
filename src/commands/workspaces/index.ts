import { cli } from 'cli-ux'

import { APIConfiguration } from '../../api/APIConfiguration'
import { WorkspacesAPIClient, IWorkspaceResource } from '../../api/WorkspacesAPIClient'
import CommandWithGlobalConfig from '../../helpers/CommandWithGlobalConfig'

export default class WorkspaceDefault extends CommandWithGlobalConfig {
    static description = 'Displays default workspace information'

    static flags = {
        ...CommandWithGlobalConfig.flags,
        output: cli.table.flags().output,
        "no-header": cli.table.flags()["no-header"],
        "no-truncate": cli.table.flags()["no-truncate"]
    }


    async run() {
        this.flags = this.parse(WorkspaceDefault).flags

        await super.run();

        const workspacesAPIClient = new WorkspacesAPIClient(new APIConfiguration({
            clientId: this.globalConfig?.defaultWorkspaceClientId,
            clientSecret: this.globalConfig?.defaultWorkspaceClientSecret,
            scopes: ['workspaces'],
            baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.tru.id`
        }),
            this.logger
        )

        let singleResource: IWorkspaceResource
        try {
            singleResource = await workspacesAPIClient.get('default')

            this.displayResults([singleResource])
        }
        catch (error) {
            this.log('API Error:',
                `${error.toString()} ${(error.response && error.response.data ? JSON.stringify(error.response.data, null, 2) : '')}`)
            this.exit(1)
        }
    }

    displayResults(resources: IWorkspaceResource[]) {
        cli.table(resources, {
            credentials_client_id: {
                header: 'credentials.client_id',
                get: row => row.credentials.client_id
            },
            data_residency: {
                header: 'data_residency'
            },
            'balance.amount_available': {
                header: 'balance.amount_available',
                get: row => row._embedded.balance.amount_available
            },
            'balance.currency': {
                header: 'balance.currency',
                get: row => row._embedded.balance.currency
            },
            created_at: {
                header: 'created_at'
            }
        }, {
            printLine: (s: any) => { this.logger!.info(s) },
            ...this.flags, // parsed flags
        })
    }

}
