import { flags } from '@oclif/command'
import { cli } from 'cli-ux'
import * as Config from '@oclif/config'

import { APIConfiguration } from '../../api/APIConfiguration'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import ILogger from '../../helpers/ILogger'
import { SubscriberCheckAPIClient, SubscriberCheckResource } from '../../api/SubscriberCheckAPIClient'
import ChecksListCommand from '../../helpers/ChecksListCommand'
import { AbstractChecksApiClient, CheckResource, ICreateCheckResponse } from '../../api/ChecksAPIClient';

export default class SubscriberCheckList extends ChecksListCommand<ICreateCheckResponse> {

  static description = 'Lists details for all SubscriberChecks or a specific SubscriberCheck if the a check-id argument is passed'

  static args = [
    {
      name: 'check_id',
      required: false,
      description: 'The check_id for the SubscriberCheck to list'
    }
  ]

  static flags = {
    ...ChecksListCommand.flags
  }

  constructor(argv: string[], config: Config.IConfig) {
    super("SubscriberCheck", "subscriber_check", argv, config)
  }


  parseCommand() {
    return this.parse(SubscriberCheckList);
  }

  getApiClient(apiConfiguration: APIConfiguration, logger: ILogger) {
    return new SubscriberCheckAPIClient(apiConfiguration, logger)
  }

  displayResults(resources: SubscriberCheckResource[]) {
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
      match: {
        header: 'match'
      },
      charge_currency: {
        header: 'charge_currency'
      },
      charge_amount: {
        header: 'charge_amount'
      },
      updated_at: {
        header: 'updated_at',
        extended: true
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
