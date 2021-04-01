The [**tru.ID**](https://tru.id) CLI

<!-- [![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/4auth-cli.svg)](https://npmjs.org/package/4auth-cli)
[![Downloads/week](https://img.shields.io/npm/dw/4auth-cli.svg)](https://npmjs.org/package/4auth-cli)
[![License](https://img.shields.io/npm/l/4auth-cli.svg)](https://github.com/4auth/4auth-cli/blob/master/package.json) -->

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
* [Development](#development)
<!-- tocstop -->
# Usage

Every run of the CLI will check to see if all required configuration is in place.

<!-- usage -->
```sh-session
$ npm install -g @tru_id/cli
$ tru COMMAND
running command...
$ tru (-v|--version|version)
@tru_id/cli/0.9.0 linux-x64 node-v14.5.0
$ tru --help [COMMAND]
USAGE
  $ tru COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`tru coverage:country CODE`](#tru-coveragecountry-code)
* [`tru coverage:reach DEVICE-IP`](#tru-coveragereach-device-ip)
* [`tru help [COMMAND]`](#tru-help-command)
* [`tru oauth2:token`](#tru-oauth2token)
* [`tru phonechecks:create [PHONE_NUMBER]`](#tru-phonecheckscreate-phone_number)
* [`tru phonechecks:list [CHECK_ID]`](#tru-phonecheckslist-check_id)
* [`tru phonechecks:traces CHECK_ID`](#tru-phonecheckstraces-check_id)
* [`tru plugins`](#tru-plugins)
* [`tru plugins:install PLUGIN...`](#tru-pluginsinstall-plugin)
* [`tru plugins:link PLUGIN`](#tru-pluginslink-plugin)
* [`tru plugins:uninstall PLUGIN...`](#tru-pluginsuninstall-plugin)
* [`tru plugins:update`](#tru-pluginsupdate)
* [`tru projects:create [NAME]`](#tru-projectscreate-name)
* [`tru projects:list [PROJECT_ID]`](#tru-projectslist-project_id)
* [`tru projects:update [PROJECT-ID]`](#tru-projectsupdate-project-id)
* [`tru setup:credentials CLIENT-ID CLIENT-SECRET DATA-RESIDENCY`](#tru-setupcredentials-client-id-client-secret-data-residency)
* [`tru simchecks:create [PHONE_NUMBER]`](#tru-simcheckscreate-phone_number)
* [`tru simchecks:list [CHECK_ID]`](#tru-simcheckslist-check_id)
* [`tru simchecks:traces CHECK_ID`](#tru-simcheckstraces-check_id)
* [`tru subscriberchecks:create [PHONE_NUMBER]`](#tru-subscribercheckscreate-phone_number)
* [`tru subscriberchecks:list [CHECK_ID]`](#tru-subscribercheckslist-check_id)
* [`tru subscriberchecks:traces CHECK_ID`](#tru-subscribercheckstraces-check_id)
* [`tru usage:daily`](#tru-usagedaily)
* [`tru usage:hourly`](#tru-usagehourly)
* [`tru usage:monthly`](#tru-usagemonthly)
* [`tru workspaces`](#tru-workspaces)

## `tru coverage:country CODE`

Retrieve country based coverage and prices

```
USAGE
  $ tru coverage:country CODE

ARGUMENTS
  CODE  two letter code ISO 3166-1 alpha-2 or country dialing code

OPTIONS
  -h, --help                 show CLI help
  -x, --extended             show extra columns
  --columns=columns          only show provided columns (comma-separated)
  --csv                      output is csv format [alias: --output=csv]
  --debug                    Enables debug logging for the CLI
  --filter=filter            filter property by partial string matching, ex: name=foo
  --no-header                hide table header from output
  --no-truncate              do not truncate output to fit screen
  --output=csv|json|yaml     output in a more machine friendly format
  --project-dir=project-dir  The directory that contains the tru.json Project configuration file
  --sort=sort                property to sort by (prepend '-' for descending)
```

_See code: [src/commands/coverage/country.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/coverage/country.ts)_

## `tru coverage:reach DEVICE-IP`

Find if a certain device ip is reachable

```
USAGE
  $ tru coverage:reach DEVICE-IP

ARGUMENTS
  DEVICE-IP  The device ip in ipv4 or ipv6 format

OPTIONS
  -h, --help                 show CLI help
  -x, --extended             show extra columns
  --columns=columns          only show provided columns (comma-separated)
  --csv                      output is csv format [alias: --output=csv]
  --debug                    Enables debug logging for the CLI
  --filter=filter            filter property by partial string matching, ex: name=foo
  --no-header                hide table header from output
  --no-truncate              do not truncate output to fit screen
  --output=csv|json|yaml     output in a more machine friendly format
  --project-dir=project-dir  The directory that contains the tru.json Project configuration file
  --sort=sort                property to sort by (prepend '-' for descending)
```

_See code: [src/commands/coverage/reach.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/coverage/reach.ts)_

## `tru help [COMMAND]`

display help for tru

```
USAGE
  $ tru help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `tru oauth2:token`

Creates an OAuth2 token

```
USAGE
  $ tru oauth2:token

OPTIONS
  -h, --help                 show CLI help
  -x, --extended             show extra columns
  --debug                    Enables debug logging for the CLI
  --no-header                hide table header from output
  --no-truncate              do not truncate output to fit screen
  --output=csv|json|yaml     output in a more machine friendly format
  --project-dir=project-dir  The directory that contains the tru.json Project configuration file

EXAMPLES
  # use workspace credentials to create token
  $ tru oauth2:token

  # use project credentials to create token
  $ tru oauth2:token --project-dir path/to/project

  # assign a token to a variable in shell
  $ TOKEN=$(tru oauth2:token --project-dir path/to/project --no-header)
  $ echo $TOKEN
  Emesua0F7gj3qOaav7UaKaBwefaaefaAxlrdGom_mb3U.78Od2d9XpvTQbd44eM1Uf7nzz9e9nezs5TRjPmpDnMc
```

_See code: [src/commands/oauth2/token.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/oauth2/token.ts)_

## `tru phonechecks:create [PHONE_NUMBER]`

Creates a PhoneCheck within a project

```
USAGE
  $ tru phonechecks:create [PHONE_NUMBER]

ARGUMENTS
  PHONE_NUMBER  The phone number to perform the Check on

OPTIONS
  -h, --help                 show CLI help
  --debug                    Enables debug logging for the CLI
  --project-dir=project-dir  The directory that contains the tru.json Project configuration file
  --skip-qrcode-handler      Skips using the tru hosted QR code handler with the `check_url`
  --workflow                 Execute the Check Workflow from the CLI
```

_See code: [src/commands/phonechecks/create.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/phonechecks/create.ts)_

## `tru phonechecks:list [CHECK_ID]`

Lists details for all PhoneChecks or a specific PhoneCheck if the a check-id argument is passed

```
USAGE
  $ tru phonechecks:list [CHECK_ID]

ARGUMENTS
  CHECK_ID  The check_id for the PhoneCheck to list

OPTIONS
  -h, --help                 show CLI help
  -x, --extended             show extra columns
  --columns=columns          only show provided columns (comma-separated)
  --csv                      output is csv format [alias: --output=csv]
  --debug                    Enables debug logging for the CLI
  --filter=filter            filter property by partial string matching, ex: name=foo
  --no-header                hide table header from output
  --no-truncate              do not truncate output to fit screen
  --output=csv|json|yaml     output in a more machine friendly format

  --page_number=page_number  [default: 1] The page number to return in the list resource. Ignored if the "check_id"
                             argument is used.

  --page_size=page_size      [default: 10] The page size to return in list resource request. Ignored if the "check_id"
                             argument is used.

  --project-dir=project-dir  The directory that contains the tru.json Project configuration file

  --search=search            A RSQL search query. To ensure correct parsing put your query in quotes. For example
                             "--search 'status==COMPLETED'". Ignored if the "check_id" argument is used.

  --sort=sort                Sort query in the form "{parameter_name},{direction}". For example, "created_at,asc" or
                             "created_at,desc". Ignored if the "check_id" argument is used.
```

_See code: [src/commands/phonechecks/list.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/phonechecks/list.ts)_

## `tru phonechecks:traces CHECK_ID`

Get the traces of a PhoneCheck

```
USAGE
  $ tru phonechecks:traces CHECK_ID

ARGUMENTS
  CHECK_ID  The check_id for which we want to get the traces

OPTIONS
  -h, --help                 show CLI help
  -x, --extended             show extra columns
  --columns=columns          only show provided columns (comma-separated)
  --csv                      output is csv format [alias: --output=csv]
  --debug                    Enables debug logging for the CLI
  --filter=filter            filter property by partial string matching, ex: name=foo
  --no-header                hide table header from output
  --no-truncate              do not truncate output to fit screen
  --output=csv|json|yaml     output in a more machine friendly format
  --project-dir=project-dir  The directory that contains the tru.json Project configuration file
  --sort=sort                property to sort by (prepend '-' for descending)
  --trace-id=trace-id        The trace-id for which we want to get the logs
```

_See code: [src/commands/phonechecks/traces.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/phonechecks/traces.ts)_

## `tru plugins`

list installed plugins

```
USAGE
  $ tru plugins

OPTIONS
  --core  show core plugins

EXAMPLE
  $ tru plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/index.ts)_

## `tru plugins:install PLUGIN...`

installs a plugin into the CLI

```
USAGE
  $ tru plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  plugin to install

OPTIONS
  -f, --force    yarn install with force flag
  -h, --help     show CLI help
  -v, --verbose

DESCRIPTION
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command 
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in 
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ tru plugins:add

EXAMPLES
  $ tru plugins:install myplugin 
  $ tru plugins:install https://github.com/someuser/someplugin
  $ tru plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/install.ts)_

## `tru plugins:link PLUGIN`

links a plugin into the CLI for development

```
USAGE
  $ tru plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

DESCRIPTION
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello' 
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLE
  $ tru plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/link.ts)_

## `tru plugins:uninstall PLUGIN...`

removes a plugin from the CLI

```
USAGE
  $ tru plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

ALIASES
  $ tru plugins:unlink
  $ tru plugins:remove
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/uninstall.ts)_

## `tru plugins:update`

update installed plugins

```
USAGE
  $ tru plugins:update

OPTIONS
  -h, --help     show CLI help
  -v, --verbose
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/update.ts)_

## `tru projects:create [NAME]`

Creates a new Project

```
USAGE
  $ tru projects:create [NAME]

ARGUMENTS
  NAME  the name of the project to create

OPTIONS
  -h, --help                                 show CLI help
  --debug                                    Enables debug logging for the CLI
  --mode=live|sandbox                        Set the project mode to "live" or "sandbox"
  --phonecheck-callback=phonecheck-callback  set a callback to be invoked when a PhoneCheck reaches an end state
  --project-dir=project-dir                  The directory that contains the tru.json Project configuration file
  --quickstart                               Create a Project and also create a PhoneCheck in workflow mode.

EXAMPLES
  $ tru projects:create
  What is the name of the project?: My first project
  Creating Project "My first project"

  $ tru projects:create --phonecheck-callback https://example.com/callback
  $ tru projects:create --mode sandbox
  $ tru projects:create --mode live
```

_See code: [src/commands/projects/create.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/projects/create.ts)_

## `tru projects:list [PROJECT_ID]`

Lists details for all Projects or a Projects that match a given criteria

```
USAGE
  $ tru projects:list [PROJECT_ID]

ARGUMENTS
  PROJECT_ID  The project_id for the Project to retrieve

OPTIONS
  -h, --help                 show CLI help
  -x, --extended             show extra columns
  --columns=columns          only show provided columns (comma-separated)
  --csv                      output is csv format [alias: --output=csv]
  --debug                    Enables debug logging for the CLI
  --filter=filter            filter property by partial string matching, ex: name=foo
  --no-header                hide table header from output
  --no-truncate              do not truncate output to fit screen
  --output=csv|json|yaml     output in a more machine friendly format

  --page_number=page_number  [default: 1] The page number to return in the list resource. Ignored if the "project_id"
                             argument is used.

  --page_size=page_size      [default: 10] The page size to return in list resource request. Ignored if the "project_id"
                             argument is used.

  --search=search            A RSQL search query. To ensure correct parsing put your query in quotes. For example
                             "--search 'name=p*'". Ignored if the "check_id" argument is used.

  --sort=sort                Sort query in the form "{parameter_name},{direction}". For example, "created_at,asc" or
                             "created_at,desc". Ignored if the "check_id" argument is used.
```

_See code: [src/commands/projects/list.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/projects/list.ts)_

## `tru projects:update [PROJECT-ID]`

Update an existing Project

```
USAGE
  $ tru projects:update [PROJECT-ID]

ARGUMENTS
  PROJECT-ID  the ID of the project to update

OPTIONS
  -h, --help                                 show CLI help
  --debug                                    Enables debug logging for the CLI
  --mode=live|sandbox                        Set the project mode to "live" or "sandbox"
  --phonecheck-callback=phonecheck-callback  set a callback to be invoked when a PhoneCheck reaches an end state
  --project-dir=project-dir                  The directory that contains the tru.json Project configuration file
  --remove-phonecheck-callback               remove the PhoneCheck callback configuration from the Project

EXAMPLES
  $ tru projects:update --phonecheck-callback https://example.com/callback
  $ tru projects:update --remove-phonecheck-callback
  $ tru projects:update --mode sandbox
  $ tru projects:update --mode live
```

_See code: [src/commands/projects/update.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/projects/update.ts)_

## `tru setup:credentials CLIENT-ID CLIENT-SECRET DATA-RESIDENCY`

Setup the CLI with workspace credentials

```
USAGE
  $ tru setup:credentials CLIENT-ID CLIENT-SECRET DATA-RESIDENCY

ARGUMENTS
  CLIENT-ID       the workspace credentials id
  CLIENT-SECRET   the workspace credentials secret
  DATA-RESIDENCY  the data residency of this workspace e.g. EU
```

_See code: [src/commands/setup/credentials.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/setup/credentials.ts)_

## `tru simchecks:create [PHONE_NUMBER]`

Create SIMChecks within a Project

```
USAGE
  $ tru simchecks:create [PHONE_NUMBER]

ARGUMENTS
  PHONE_NUMBER  The phone number to perform the SIMCheck on

OPTIONS
  -h, --help                 show CLI help
  --debug                    Enables debug logging for the CLI
  --project-dir=project-dir  The directory that contains the tru.json Project configuration file
```

_See code: [src/commands/simchecks/create.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/simchecks/create.ts)_

## `tru simchecks:list [CHECK_ID]`

Lists details for all SIMChecks or a specific SIMCheck if the a check-id argument is passed

```
USAGE
  $ tru simchecks:list [CHECK_ID]

ARGUMENTS
  CHECK_ID  The check_id for the SIMCheck to list

OPTIONS
  -h, --help                 show CLI help
  -x, --extended             show extra columns
  --columns=columns          only show provided columns (comma-separated)
  --csv                      output is csv format [alias: --output=csv]
  --debug                    Enables debug logging for the CLI
  --filter=filter            filter property by partial string matching, ex: name=foo
  --no-header                hide table header from output
  --no-truncate              do not truncate output to fit screen
  --output=csv|json|yaml     output in a more machine friendly format

  --page_number=page_number  [default: 1] The page number to return in the list resource. Ignored if the "check_id"
                             argument is used.

  --page_size=page_size      [default: 10] The page size to return in list resource request. Ignored if the "check_id"
                             argument is used.

  --project-dir=project-dir  The directory that contains the tru.json Project configuration file

  --search=search            A RSQL search query. To ensure correct parsing put your query in quotes. For example
                             "--search 'status==COMPLETED'". Ignored if the "check_id" argument is used.

  --sort=sort                Sort query in the form "{parameter_name},{direction}". For example, "created_at,asc" or
                             "created_at,desc". Ignored if the "check_id" argument is used.
```

_See code: [src/commands/simchecks/list.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/simchecks/list.ts)_

## `tru simchecks:traces CHECK_ID`

Get the traces of a SIMCheck

```
USAGE
  $ tru simchecks:traces CHECK_ID

ARGUMENTS
  CHECK_ID  The check_id for which we want to get the traces

OPTIONS
  -h, --help                 show CLI help
  -x, --extended             show extra columns
  --columns=columns          only show provided columns (comma-separated)
  --csv                      output is csv format [alias: --output=csv]
  --debug                    Enables debug logging for the CLI
  --filter=filter            filter property by partial string matching, ex: name=foo
  --no-header                hide table header from output
  --no-truncate              do not truncate output to fit screen
  --output=csv|json|yaml     output in a more machine friendly format
  --project-dir=project-dir  The directory that contains the tru.json Project configuration file
  --sort=sort                property to sort by (prepend '-' for descending)
  --trace-id=trace-id        The trace-id for which we want to get the logs
```

_See code: [src/commands/simchecks/traces.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/simchecks/traces.ts)_

## `tru subscriberchecks:create [PHONE_NUMBER]`

Creates SubscriberChecks within a project

```
USAGE
  $ tru subscriberchecks:create [PHONE_NUMBER]

ARGUMENTS
  PHONE_NUMBER  The phone number to perform the Check on

OPTIONS
  -h, --help                 show CLI help
  --debug                    Enables debug logging for the CLI
  --project-dir=project-dir  The directory that contains the tru.json Project configuration file
  --skip-qrcode-handler      Skips using the tru hosted QR code handler with the `check_url`
  --workflow                 Execute the Check Workflow from the CLI
```

_See code: [src/commands/subscriberchecks/create.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/subscriberchecks/create.ts)_

## `tru subscriberchecks:list [CHECK_ID]`

Lists details for all SubscriberChecks or a specific SubscriberCheck if the a check-id argument is passed

```
USAGE
  $ tru subscriberchecks:list [CHECK_ID]

ARGUMENTS
  CHECK_ID  The check_id for the SubscriberCheck to list

OPTIONS
  -h, --help                 show CLI help
  -x, --extended             show extra columns
  --columns=columns          only show provided columns (comma-separated)
  --csv                      output is csv format [alias: --output=csv]
  --debug                    Enables debug logging for the CLI
  --filter=filter            filter property by partial string matching, ex: name=foo
  --no-header                hide table header from output
  --no-truncate              do not truncate output to fit screen
  --output=csv|json|yaml     output in a more machine friendly format

  --page_number=page_number  [default: 1] The page number to return in the list resource. Ignored if the "check_id"
                             argument is used.

  --page_size=page_size      [default: 10] The page size to return in list resource request. Ignored if the "check_id"
                             argument is used.

  --project-dir=project-dir  The directory that contains the tru.json Project configuration file

  --search=search            A RSQL search query. To ensure correct parsing put your query in quotes. For example
                             "--search 'status==COMPLETED'". Ignored if the "check_id" argument is used.

  --sort=sort                Sort query in the form "{parameter_name},{direction}". For example, "created_at,asc" or
                             "created_at,desc". Ignored if the "check_id" argument is used.
```

_See code: [src/commands/subscriberchecks/list.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/subscriberchecks/list.ts)_

## `tru subscriberchecks:traces CHECK_ID`

Get the traces of a SubscriberCheck

```
USAGE
  $ tru subscriberchecks:traces CHECK_ID

ARGUMENTS
  CHECK_ID  The check_id for which we want to get the traces

OPTIONS
  -h, --help                 show CLI help
  -x, --extended             show extra columns
  --columns=columns          only show provided columns (comma-separated)
  --csv                      output is csv format [alias: --output=csv]
  --debug                    Enables debug logging for the CLI
  --filter=filter            filter property by partial string matching, ex: name=foo
  --no-header                hide table header from output
  --no-truncate              do not truncate output to fit screen
  --output=csv|json|yaml     output in a more machine friendly format
  --project-dir=project-dir  The directory that contains the tru.json Project configuration file
  --sort=sort                property to sort by (prepend '-' for descending)
  --trace-id=trace-id        The trace-id for which we want to get the logs
```

_See code: [src/commands/subscriberchecks/traces.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/subscriberchecks/traces.ts)_

## `tru usage:daily`

Get Daily Usage. The date range defaults to current date.

```
USAGE
  $ tru usage:daily

OPTIONS
  -h, --help                 show CLI help
  -x, --extended             show extra columns
  --columns=columns          only show provided columns (comma-separated)
  --csv                      output is csv format [alias: --output=csv]
  --debug                    Enables debug logging for the CLI
  --filter=filter            filter property by partial string matching, ex: name=foo
  --group-by=group-by        Group results by one or more fields e.g product_id or project_id or product_id,project_id
  --no-header                hide table header from output
  --no-truncate              do not truncate output to fit screen
  --output=csv|json|yaml     output in a more machine friendly format
  --page_number=page_number  [default: 1] The page number to return in the list resource.
  --page_size=page_size      [default: 10] The page size to return in list resource request.
  --search=search            The RSQL query for usage. date is required e.g --search='date>=2021-03-29'
  --sort=sort                property to sort by (prepend '-' for descending)
```

_See code: [src/commands/usage/daily.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/usage/daily.ts)_

## `tru usage:hourly`

Get Hourly Usage. The date range defaults to current date.

```
USAGE
  $ tru usage:hourly

OPTIONS
  -h, --help                 show CLI help
  -x, --extended             show extra columns
  --columns=columns          only show provided columns (comma-separated)
  --csv                      output is csv format [alias: --output=csv]
  --debug                    Enables debug logging for the CLI
  --filter=filter            filter property by partial string matching, ex: name=foo
  --group-by=group-by        Group results by one or more fields e.g product_id or project_id or product_id,project_id
  --no-header                hide table header from output
  --no-truncate              do not truncate output to fit screen
  --output=csv|json|yaml     output in a more machine friendly format
  --page_number=page_number  [default: 1] The page number to return in the list resource.
  --page_size=page_size      [default: 10] The page size to return in list resource request.
  --search=search            The RSQL query for usage. date is required e.g --search='date>=2021-03-29'
  --sort=sort                property to sort by (prepend '-' for descending)
```

_See code: [src/commands/usage/hourly.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/usage/hourly.ts)_

## `tru usage:monthly`

Get Monthly Usage. The date range defaults to the current calendar month.

```
USAGE
  $ tru usage:monthly

OPTIONS
  -h, --help                 show CLI help
  -x, --extended             show extra columns
  --columns=columns          only show provided columns (comma-separated)
  --csv                      output is csv format [alias: --output=csv]
  --debug                    Enables debug logging for the CLI
  --filter=filter            filter property by partial string matching, ex: name=foo
  --group-by=group-by        Group results by one or more fields e.g product_id or project_id or product_id,project_id
  --no-header                hide table header from output
  --no-truncate              do not truncate output to fit screen
  --output=csv|json|yaml     output in a more machine friendly format
  --page_number=page_number  [default: 1] The page number to return in the list resource.
  --page_size=page_size      [default: 10] The page size to return in list resource request.
  --search=search            The RSQL query for usage. date is required e.g --search='date>=2021-03-29'
  --sort=sort                property to sort by (prepend '-' for descending)
```

_See code: [src/commands/usage/monthly.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/usage/monthly.ts)_

## `tru workspaces`

Displays default workspace information

```
USAGE
  $ tru workspaces

OPTIONS
  -h, --help              show CLI help
  --debug                 Enables debug logging for the CLI
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
```

_See code: [src/commands/workspaces/index.ts](https://github.com/tru-ID/tru-cli/blob/v0.9.0/src/commands/workspaces/index.ts)_
<!-- commandsstop -->

# Development

## Commits

The release process will generate/update a CHANGELOG based on commit messages. In order to do this commits should follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

If you forget to follow this the release process allows for manual editing of the CHANGELOG.

## Update the README

To update the table of contents, usage and commands run:

```
$ npm run version
```

## Releases

Releases should be performed on the `dev` branch and the related commits then merged into the `main` branch.

### CHANGELOG & Package Version

The CLI uses [standard-version](https://github.com/conventional-changelog/standard-version) to generate a changelog and bump the package version.

To update the CHANGELOG run:

```bash
$ yarn release
```

Additional parameters supported by `standard-version` can be passed as follows:

```bash
$ yarn release {additional_parameters}
```

For example:

```bash
$ yarn release --dry-run
```

### Commit and Tag

If all goes well, we're ready to mark the release as complete.

Once the CHANGELOG and version in package.json are correct ensure the file updates are staged and run the following replacing `current_version` with the version of the CLI being released:

```bash
$ git commit -m 'chore(release): v{current_version}'
  git tag v{currentVersion}
  git push origin v{currentVersion}
  git push origin canary
```

### Build & Release

Merge `canary` into `main` to release and the installers are automatically test and publish to NPM `@latest`. All commits on `canary` will also publish to NPM with a `@canary` tag.

#### Manual Build & Release process

##### Build MacOS Installer

The MacOS installer can only be created on a MacOS machine. So at presently it's not possible to automate this build in CI/CD.

To create the `.pkg` installer run:

```bash
yarn run pack:mac
```

The installers will be built into the `./dist/{cli_name}-{version}` directory.

##### Release MacOS Installer

To release the installers create a `.env` file with the following, including valid AWS credentials and an [NPM token](https://docs.npmjs.com/about-access-tokens):

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
NPM_TOKEN=
```

To upload to S3 run:

```
npm run publish:mac
```

##### Publish to NPM

To publish to NPM tagged with `canary` run:

```
$ yarn run npm:publish:dev
```

For a full production release run:

```
$ yarn run npm:publish:prod
```

## Configuration

Every run of the CLI will check to see if all required configuration is in place. This is achieved through a [hook](https://oclif.io/docs/hooks).

For more inforation see the [Oclif Configuration How to](https://oclif.io/docs/config).
