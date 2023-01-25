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
$ tru (--version)
@tru_id/cli/1.2.0 darwin-arm64 node-v18.12.1
$ tru --help [COMMAND]
USAGE
  $ tru COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`tru analytics:pck:daily`](#tru-analyticspckdaily)
* [`tru analytics:pck:hourly`](#tru-analyticspckhourly)
* [`tru analytics:pck:monthly`](#tru-analyticspckmonthly)
* [`tru analytics:sck:daily`](#tru-analyticssckdaily)
* [`tru analytics:sck:hourly`](#tru-analyticssckhourly)
* [`tru analytics:sck:monthly`](#tru-analyticssckmonthly)
* [`tru analytics:suk:daily`](#tru-analyticssukdaily)
* [`tru analytics:suk:hourly`](#tru-analyticssukhourly)
* [`tru analytics:suk:monthly`](#tru-analyticssukmonthly)
* [`tru coverage:country CODE`](#tru-coveragecountry-code)
* [`tru coverage:reach DEVICE-IP`](#tru-coveragereach-device-ip)
* [`tru help [COMMAND]`](#tru-help-command)
* [`tru login IDP`](#tru-login-idp)
* [`tru oauth2:token`](#tru-oauth2token)
* [`tru phonechecks:create [PHONE_NUMBER]`](#tru-phonecheckscreate-phone_number)
* [`tru phonechecks:list [CHECK_ID]`](#tru-phonecheckslist-check_id)
* [`tru phonechecks:traces CHECK_ID`](#tru-phonecheckstraces-check_id)
* [`tru projects:create [NAME]`](#tru-projectscreate-name)
* [`tru projects:list [PROJECT_ID]`](#tru-projectslist-project_id)
* [`tru projects:update [PROJECT-ID]`](#tru-projectsupdate-project-id)
* [`tru simchecks:create [PHONE_NUMBER]`](#tru-simcheckscreate-phone_number)
* [`tru simchecks:list [CHECK_ID]`](#tru-simcheckslist-check_id)
* [`tru simchecks:traces CHECK_ID`](#tru-simcheckstraces-check_id)
* [`tru subscriberchecks:create [PHONE_NUMBER]`](#tru-subscribercheckscreate-phone_number)
* [`tru subscriberchecks:list [CHECK_ID]`](#tru-subscribercheckslist-check_id)
* [`tru subscriberchecks:traces CHECK_ID`](#tru-subscribercheckstraces-check_id)
* [`tru usage:daily`](#tru-usagedaily)
* [`tru usage:hourly`](#tru-usagehourly)
* [`tru usage:monthly`](#tru-usagemonthly)
* [`tru workspaces:list`](#tru-workspaceslist)
* [`tru workspaces:selected`](#tru-workspacesselected)
* [`tru workspaces:switch DATA_RESIDENCY WORKSPACE_ID`](#tru-workspacesswitch-data_residency-workspace_id)

## `tru analytics:pck:daily`

Get Daily PhoneCheck Analytics. By default returns most recent analytics.

```
USAGE
  $ tru analytics:pck:daily [--debug] [--help] [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output
    csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--search <value>] [--group-by <value>] [--page-number
    <value>] [--page-size <value>]

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --group-by=<value>     group results by one or more fields e.g project_id or network_id
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] the page number to return in the list resource.
  --page-size=<value>    [default: 10] the page size to return in list resource request.
  --search=<value>       the RSQL query for analytics. e.g --search='date>=2021-03-29'
  --sort=<value>         sort query in the form "{parameter_name},{direction}". For example, "date,asc" or "date,desc".

DESCRIPTION
  Get Daily PhoneCheck Analytics. By default returns most recent analytics.
```

_See code: [dist/commands/analytics/pck/daily.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/analytics/pck/daily.ts)_

## `tru analytics:pck:hourly`

Get Hourly PhoneCheck Analytics. By default returns most recent analytics.

```
USAGE
  $ tru analytics:pck:hourly [--debug] [--help] [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output
    csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--search <value>] [--group-by <value>] [--page-number
    <value>] [--page-size <value>]

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --group-by=<value>     group results by one or more fields e.g project_id or network_id
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] the page number to return in the list resource.
  --page-size=<value>    [default: 10] the page size to return in list resource request.
  --search=<value>       the RSQL query for analytics. e.g --search='date>=2021-03-29'
  --sort=<value>         sort query in the form "{parameter_name},{direction}". For example, "date,asc" or "date,desc".

DESCRIPTION
  Get Hourly PhoneCheck Analytics. By default returns most recent analytics.
```

_See code: [dist/commands/analytics/pck/hourly.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/analytics/pck/hourly.ts)_

## `tru analytics:pck:monthly`

Get Monthly PhoneCheck Analytics. By default returns most recent analytics.

```
USAGE
  $ tru analytics:pck:monthly [--debug] [--help] [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output
    csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--search <value>] [--group-by <value>] [--page-number
    <value>] [--page-size <value>]

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --group-by=<value>     group results by one or more fields e.g project_id or network_id
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] the page number to return in the list resource.
  --page-size=<value>    [default: 10] the page size to return in list resource request.
  --search=<value>       the RSQL query for analytics. e.g --search='date>=2021-03-29'
  --sort=<value>         sort query in the form "{parameter_name},{direction}". For example, "date,asc" or "date,desc".

DESCRIPTION
  Get Monthly PhoneCheck Analytics. By default returns most recent analytics.
```

_See code: [dist/commands/analytics/pck/monthly.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/analytics/pck/monthly.ts)_

## `tru analytics:sck:daily`

Get Daily SimCheck Analytics. By default returns most recent analytics.

```
USAGE
  $ tru analytics:sck:daily [--debug] [--help] [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output
    csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--search <value>] [--group-by <value>] [--page-number
    <value>] [--page-size <value>]

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --group-by=<value>     group results by one or more fields e.g project_id or network_id
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] the page number to return in the list resource.
  --page-size=<value>    [default: 10] the page size to return in list resource request.
  --search=<value>       the RSQL query for analytics. e.g --search='date>=2021-03-29'
  --sort=<value>         sort query in the form "{parameter_name},{direction}". For example, "date,asc" or "date,desc".

DESCRIPTION
  Get Daily SimCheck Analytics. By default returns most recent analytics.
```

_See code: [dist/commands/analytics/sck/daily.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/analytics/sck/daily.ts)_

## `tru analytics:sck:hourly`

Get Hourly SimCheck Analytics. By default returns most recent analytics.

```
USAGE
  $ tru analytics:sck:hourly [--debug] [--help] [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output
    csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--search <value>] [--group-by <value>] [--page-number
    <value>] [--page-size <value>]

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --group-by=<value>     group results by one or more fields e.g project_id or network_id
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] the page number to return in the list resource.
  --page-size=<value>    [default: 10] the page size to return in list resource request.
  --search=<value>       the RSQL query for analytics. e.g --search='date>=2021-03-29'
  --sort=<value>         sort query in the form "{parameter_name},{direction}". For example, "date,asc" or "date,desc".

DESCRIPTION
  Get Hourly SimCheck Analytics. By default returns most recent analytics.
```

_See code: [dist/commands/analytics/sck/hourly.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/analytics/sck/hourly.ts)_

## `tru analytics:sck:monthly`

Get Monthly SimCheck Analytics. By default returns most recent analytics.

```
USAGE
  $ tru analytics:sck:monthly [--debug] [--help] [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output
    csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--search <value>] [--group-by <value>] [--page-number
    <value>] [--page-size <value>]

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --group-by=<value>     group results by one or more fields e.g project_id or network_id
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] the page number to return in the list resource.
  --page-size=<value>    [default: 10] the page size to return in list resource request.
  --search=<value>       the RSQL query for analytics. e.g --search='date>=2021-03-29'
  --sort=<value>         sort query in the form "{parameter_name},{direction}". For example, "date,asc" or "date,desc".

DESCRIPTION
  Get Monthly SimCheck Analytics. By default returns most recent analytics.
```

_See code: [dist/commands/analytics/sck/monthly.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/analytics/sck/monthly.ts)_

## `tru analytics:suk:daily`

Get Daily SubscriberCheck Analytics. By default returns most recent analytics.

```
USAGE
  $ tru analytics:suk:daily [--debug] [--help] [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output
    csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--search <value>] [--group-by <value>] [--page-number
    <value>] [--page-size <value>]

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --group-by=<value>     group results by one or more fields e.g project_id or network_id
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] the page number to return in the list resource.
  --page-size=<value>    [default: 10] the page size to return in list resource request.
  --search=<value>       the RSQL query for analytics. e.g --search='date>=2021-03-29'
  --sort=<value>         sort query in the form "{parameter_name},{direction}". For example, "date,asc" or "date,desc".

DESCRIPTION
  Get Daily SubscriberCheck Analytics. By default returns most recent analytics.
```

_See code: [dist/commands/analytics/suk/daily.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/analytics/suk/daily.ts)_

## `tru analytics:suk:hourly`

Get Hourly SubscriberCheck Analytics. By default returns most recent analytics.

```
USAGE
  $ tru analytics:suk:hourly [--debug] [--help] [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output
    csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--search <value>] [--group-by <value>] [--page-number
    <value>] [--page-size <value>]

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --group-by=<value>     group results by one or more fields e.g project_id or network_id
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] the page number to return in the list resource.
  --page-size=<value>    [default: 10] the page size to return in list resource request.
  --search=<value>       the RSQL query for analytics. e.g --search='date>=2021-03-29'
  --sort=<value>         sort query in the form "{parameter_name},{direction}". For example, "date,asc" or "date,desc".

DESCRIPTION
  Get Hourly SubscriberCheck Analytics. By default returns most recent analytics.
```

_See code: [dist/commands/analytics/suk/hourly.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/analytics/suk/hourly.ts)_

## `tru analytics:suk:monthly`

Get Monthly SubscriberCheck Analytics. By default returns most recent analytics.

```
USAGE
  $ tru analytics:suk:monthly [--debug] [--help] [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output
    csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--search <value>] [--group-by <value>] [--page-number
    <value>] [--page-size <value>]

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --group-by=<value>     group results by one or more fields e.g project_id or network_id
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] the page number to return in the list resource.
  --page-size=<value>    [default: 10] the page size to return in list resource request.
  --search=<value>       the RSQL query for analytics. e.g --search='date>=2021-03-29'
  --sort=<value>         sort query in the form "{parameter_name},{direction}". For example, "date,asc" or "date,desc".

DESCRIPTION
  Get Monthly SubscriberCheck Analytics. By default returns most recent analytics.
```

_See code: [dist/commands/analytics/suk/monthly.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/analytics/suk/monthly.ts)_

## `tru coverage:country CODE`

Retrieve country based coverage and prices

```
USAGE
  $ tru coverage:country [CODE] [--debug] [--help] [--project-dir <value>] [--columns <value> | -x] [--sort <value>]
    [--filter <value>] [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ]

ARGUMENTS
  CODE  two letter code ISO 3166-1 alpha-2 or country dialing code

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --project-dir=<value>  The directory that contains the tru.json Project configuration file
  --sort=<value>         property to sort by (prepend '-' for descending)

DESCRIPTION
  Retrieve country based coverage and prices
```

_See code: [dist/commands/coverage/country.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/coverage/country.ts)_

## `tru coverage:reach DEVICE-IP`

Find if a certain device ip is reachable

```
USAGE
  $ tru coverage:reach [DEVICE-IP] [--debug] [--help] [--project-dir <value>] [--columns <value> | -x] [--sort
    <value>] [--filter <value>] [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ]

ARGUMENTS
  DEVICE-IP  The device ip in ipv4 or ipv6 format

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --project-dir=<value>  The directory that contains the tru.json Project configuration file
  --sort=<value>         property to sort by (prepend '-' for descending)

DESCRIPTION
  Find if a certain device ip is reachable
```

_See code: [dist/commands/coverage/reach.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/coverage/reach.ts)_

## `tru help [COMMAND]`

Display help for tru.

```
USAGE
  $ tru help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for tru.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.20/src/commands/help.ts)_

## `tru login IDP`

Login to tru.ID

```
USAGE
  $ tru login [IDP]

ARGUMENTS
  IDP  (google|github|microsoft) The Identity Provider

DESCRIPTION
  Login to tru.ID
```

_See code: [dist/commands/login/index.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/login/index.ts)_

## `tru oauth2:token`

Creates an OAuth2 token

```
USAGE
  $ tru oauth2:token [--debug] [--help] [--project-dir <value>] [--output csv|json|yaml | --no-truncate | ] [-x |
    ] [--no-header | ]

FLAGS
  -x, --extended         show extra columns
  --debug                Enables debug logging for the CLI
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --project-dir=<value>  The directory that contains the tru.json Project configuration file

DESCRIPTION
  Creates an OAuth2 token

EXAMPLES
  # use project credentials to create token

    $ tru oauth2:token --project-dir path/to/project

  # assign a token to a variable in shell
  $ TOKEN=$(tru oauth2:token --project-dir path/to/project --no-header)
  $ echo $TOKEN
  Emesua0F7gj3qOaav7UaKaBwefaaefaAxlrdGom_mb3U.78Od2d9XpvTQbd44eM1Uf7nzz9e9nezs5TRjPmpDnMc
```

_See code: [dist/commands/oauth2/token.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/oauth2/token.ts)_

## `tru phonechecks:create [PHONE_NUMBER]`

Creates a PhoneCheck within a project

```
USAGE
  $ tru phonechecks:create [PHONE_NUMBER] [--debug] [--help] [--project-dir <value>]

ARGUMENTS
  PHONE_NUMBER  The phone number to perform the Check on

FLAGS
  --debug                Enables debug logging for the CLI
  --help                 Show CLI help.
  --project-dir=<value>  The directory that contains the tru.json Project configuration file

DESCRIPTION
  Creates a PhoneCheck within a project
```

_See code: [dist/commands/phonechecks/create.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/phonechecks/create.ts)_

## `tru phonechecks:list [CHECK_ID]`

Lists details for all PhoneChecks or a specific PhoneCheck if the a check-id argument is passed

```
USAGE
  $ tru phonechecks:list [CHECK_ID] [--debug] [--help] [--project-dir <value>] [--columns <value> | -x] [--sort
    <value>] [--filter <value>] [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--page-number
    <value>] [--page-size <value>] [--search <value>]

ARGUMENTS
  CHECK_ID  The check_id for the PhoneCheck to list

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] The page number to return in the list resource. Ignored if the "check_id" argument
                         is used.
  --page-size=<value>    [default: 10] The page size to return in list resource request. Ignored if the "check_id"
                         argument is used.
  --project-dir=<value>  The directory that contains the tru.json Project configuration file
  --search=<value>       A RSQL search query. To ensure correct parsing put your query in quotes. For example "--search
                         'status==COMPLETED'". Ignored if the "check_id" argument is used.
  --sort=<value>         [default: created_at,desc] Sort query in the form "{parameter_name},{direction}". For example,
                         "created_at,asc" or "created_at,desc". Ignored if the "check_id" argument is used.

DESCRIPTION
  Lists details for all PhoneChecks or a specific PhoneCheck if the a check-id argument is passed
```

_See code: [dist/commands/phonechecks/list.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/phonechecks/list.ts)_

## `tru phonechecks:traces CHECK_ID`

Get the traces of a PhoneCheck

```
USAGE
  $ tru phonechecks:traces [CHECK_ID] [--debug] [--help] [--project-dir <value>] [--columns <value> | -x] [--sort
    <value>] [--filter <value>] [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--trace-id
    <value>]

ARGUMENTS
  CHECK_ID  The check_id for which we want to get the traces

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --project-dir=<value>  The directory that contains the tru.json Project configuration file
  --sort=<value>         property to sort by (prepend '-' for descending)
  --trace-id=<value>     The trace-id for which we want to get the logs

DESCRIPTION
  Get the traces of a PhoneCheck
```

_See code: [dist/commands/phonechecks/traces.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/phonechecks/traces.ts)_

## `tru projects:create [NAME]`

Creates a new Project

```
USAGE
  $ tru projects:create [NAME] [--debug] [--help] [--project-dir <value>] [--phonecheck-callback <value> | ] [--mode
    live|sandbox]

ARGUMENTS
  NAME  the name of the project to create

FLAGS
  --debug                        Enables debug logging for the CLI
  --help                         Show CLI help.
  --mode=<option>                Set the project mode to "live" or "sandbox"
                                 <options: live|sandbox>
  --phonecheck-callback=<value>  set a callback to be invoked when a PhoneCheck reaches an end state
  --project-dir=<value>          The directory that contains the tru.json Project configuration file

DESCRIPTION
  Creates a new Project

EXAMPLES
  $ tru projects:create
  What is the name of the project?: My first project
  Creating Project "My first project"

  $ tru projects:create --phonecheck-callback https://example.com/callback

  $ tru projects:create --mode sandbox

  $ tru projects:create --mode live
```

_See code: [dist/commands/projects/create.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/projects/create.ts)_

## `tru projects:list [PROJECT_ID]`

Lists details for all Projects or a Projects that match a given criteria

```
USAGE
  $ tru projects:list [PROJECT_ID] [--debug] [--help] [--columns <value> | -x] [--sort <value>] [--filter <value>]
    [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--page-number <value>] [--page-size <value>]
    [--search <value>]

ARGUMENTS
  PROJECT_ID  The project_id for the Project to retrieve

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] The page number to return in the list resource. Ignored if the "project_id"
                         argument is used.
  --page-size=<value>    [default: 10] The page size to return in list resource request. Ignored if the "project_id"
                         argument is used.
  --search=<value>       A RSQL search query. To ensure correct parsing put your query in quotes. For example "--search
                         'name=p*'". Ignored if the "project_id" argument is used.
  --sort=<value>         [default: created_at,desc] Sort query in the form "{parameter_name},{direction}". For example,
                         "created_at,asc" or "created_at,desc". Ignored if the "project_id" argument is used.

DESCRIPTION
  Lists details for all Projects or a Projects that match a given criteria
```

_See code: [dist/commands/projects/list.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/projects/list.ts)_

## `tru projects:update [PROJECT-ID]`

Update an existing Project

```
USAGE
  $ tru projects:update [PROJECT-ID] [--debug] [--help] [--project-dir <value>] [--phonecheck-callback <value> |
    --remove-phonecheck-callback] [--mode live|sandbox]

ARGUMENTS
  PROJECT-ID  the ID of the project to update

FLAGS
  --debug                        Enables debug logging for the CLI
  --help                         Show CLI help.
  --mode=<option>                Set the project mode to "live" or "sandbox"
                                 <options: live|sandbox>
  --phonecheck-callback=<value>  set a callback to be invoked when a PhoneCheck reaches an end state
  --project-dir=<value>          The directory that contains the tru.json Project configuration file
  --remove-phonecheck-callback   remove the PhoneCheck callback configuration from the Project

DESCRIPTION
  Update an existing Project

EXAMPLES
  $ tru projects:update --phonecheck-callback https://example.com/callback

  $ tru projects:update --remove-phonecheck-callback

  $ tru projects:update --mode sandbox

  $ tru projects:update --mode live
```

_See code: [dist/commands/projects/update.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/projects/update.ts)_

## `tru simchecks:create [PHONE_NUMBER]`

Create SIMChecks within a Project

```
USAGE
  $ tru simchecks:create [PHONE_NUMBER] [--debug] [--help] [--project-dir <value>]

ARGUMENTS
  PHONE_NUMBER  The phone number to perform the SIMCheck on

FLAGS
  --debug                Enables debug logging for the CLI
  --help                 Show CLI help.
  --project-dir=<value>  The directory that contains the tru.json Project configuration file

DESCRIPTION
  Create SIMChecks within a Project
```

_See code: [dist/commands/simchecks/create.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/simchecks/create.ts)_

## `tru simchecks:list [CHECK_ID]`

Lists details for all SIMChecks or a specific SIMCheck if the a check-id argument is passed

```
USAGE
  $ tru simchecks:list [CHECK_ID] [--debug] [--help] [--project-dir <value>] [--columns <value> | -x] [--sort
    <value>] [--filter <value>] [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--page-number
    <value>] [--page-size <value>] [--search <value>]

ARGUMENTS
  CHECK_ID  The check_id for the SIMCheck to list

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] The page number to return in the list resource. Ignored if the "check_id" argument
                         is used.
  --page-size=<value>    [default: 10] The page size to return in list resource request. Ignored if the "check_id"
                         argument is used.
  --project-dir=<value>  The directory that contains the tru.json Project configuration file
  --search=<value>       A RSQL search query. To ensure correct parsing put your query in quotes. For example "--search
                         'status==COMPLETED'". Ignored if the "check_id" argument is used.
  --sort=<value>         [default: created_at,desc] Sort query in the form "{parameter_name},{direction}". For example,
                         "created_at,asc" or "created_at,desc". Ignored if the "check_id" argument is used.

DESCRIPTION
  Lists details for all SIMChecks or a specific SIMCheck if the a check-id argument is passed
```

_See code: [dist/commands/simchecks/list.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/simchecks/list.ts)_

## `tru simchecks:traces CHECK_ID`

Get the traces of a SIMCheck

```
USAGE
  $ tru simchecks:traces [CHECK_ID] [--debug] [--help] [--project-dir <value>] [--columns <value> | -x] [--sort
    <value>] [--filter <value>] [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--trace-id
    <value>]

ARGUMENTS
  CHECK_ID  The check_id for which we want to get the traces

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --project-dir=<value>  The directory that contains the tru.json Project configuration file
  --sort=<value>         property to sort by (prepend '-' for descending)
  --trace-id=<value>     The trace-id for which we want to get the logs

DESCRIPTION
  Get the traces of a SIMCheck
```

_See code: [dist/commands/simchecks/traces.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/simchecks/traces.ts)_

## `tru subscriberchecks:create [PHONE_NUMBER]`

Creates SubscriberChecks within a project

```
USAGE
  $ tru subscriberchecks:create [PHONE_NUMBER] [--debug] [--help] [--project-dir <value>]

ARGUMENTS
  PHONE_NUMBER  The phone number to perform the Check on

FLAGS
  --debug                Enables debug logging for the CLI
  --help                 Show CLI help.
  --project-dir=<value>  The directory that contains the tru.json Project configuration file

DESCRIPTION
  Creates SubscriberChecks within a project
```

_See code: [dist/commands/subscriberchecks/create.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/subscriberchecks/create.ts)_

## `tru subscriberchecks:list [CHECK_ID]`

Lists details for all SubscriberChecks or a specific SubscriberCheck if the a check-id argument is passed

```
USAGE
  $ tru subscriberchecks:list [CHECK_ID] [--debug] [--help] [--project-dir <value>] [--columns <value> | -x] [--sort
    <value>] [--filter <value>] [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--page-number
    <value>] [--page-size <value>] [--search <value>]

ARGUMENTS
  CHECK_ID  The check_id for the SubscriberCheck to list

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] The page number to return in the list resource. Ignored if the "check_id" argument
                         is used.
  --page-size=<value>    [default: 10] The page size to return in list resource request. Ignored if the "check_id"
                         argument is used.
  --project-dir=<value>  The directory that contains the tru.json Project configuration file
  --search=<value>       A RSQL search query. To ensure correct parsing put your query in quotes. For example "--search
                         'status==COMPLETED'". Ignored if the "check_id" argument is used.
  --sort=<value>         [default: created_at,desc] Sort query in the form "{parameter_name},{direction}". For example,
                         "created_at,asc" or "created_at,desc". Ignored if the "check_id" argument is used.

DESCRIPTION
  Lists details for all SubscriberChecks or a specific SubscriberCheck if the a check-id argument is passed
```

_See code: [dist/commands/subscriberchecks/list.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/subscriberchecks/list.ts)_

## `tru subscriberchecks:traces CHECK_ID`

Get the traces of a SubscriberCheck

```
USAGE
  $ tru subscriberchecks:traces [CHECK_ID] [--debug] [--help] [--project-dir <value>] [--columns <value> | -x] [--sort
    <value>] [--filter <value>] [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--trace-id
    <value>]

ARGUMENTS
  CHECK_ID  The check_id for which we want to get the traces

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --project-dir=<value>  The directory that contains the tru.json Project configuration file
  --sort=<value>         property to sort by (prepend '-' for descending)
  --trace-id=<value>     The trace-id for which we want to get the logs

DESCRIPTION
  Get the traces of a SubscriberCheck
```

_See code: [dist/commands/subscriberchecks/traces.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/subscriberchecks/traces.ts)_

## `tru usage:daily`

Get Daily Usage. The date range defaults to the last 7 days.

```
USAGE
  $ tru usage:daily [--debug] [--help] [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output
    csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--search <value>] [--group-by <value>] [--page-number
    <value>] [--page-size <value>]

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --group-by=<value>     group results by one or more fields e.g product_id or project_id or product_id,project_id
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] the page number to return in the list resource.
  --page-size=<value>    [default: 10] the page size to return in list resource request.
  --search=<value>       the RSQL query for usage. date is required e.g --search='date>=2021-03-29'
  --sort=<value>         property to sort by (prepend '-' for descending)

DESCRIPTION
  Get Daily Usage. The date range defaults to the last 7 days.
```

_See code: [dist/commands/usage/daily.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/usage/daily.ts)_

## `tru usage:hourly`

Get Hourly Usage. The date range defaults to the last 12 hours.

```
USAGE
  $ tru usage:hourly [--debug] [--help] [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output
    csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--search <value>] [--group-by <value>] [--page-number
    <value>] [--page-size <value>]

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --group-by=<value>     group results by one or more fields e.g product_id or project_id or product_id,project_id
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] the page number to return in the list resource.
  --page-size=<value>    [default: 10] the page size to return in list resource request.
  --search=<value>       the RSQL query for usage. date is required e.g --search='date>=2021-03-29'
  --sort=<value>         property to sort by (prepend '-' for descending)

DESCRIPTION
  Get Hourly Usage. The date range defaults to the last 12 hours.
```

_See code: [dist/commands/usage/hourly.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/usage/hourly.ts)_

## `tru usage:monthly`

Get Monthly Usage. The date range defaults to the last 6 months.

```
USAGE
  $ tru usage:monthly [--debug] [--help] [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output
    csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ] [--search <value>] [--group-by <value>] [--page-number
    <value>] [--page-size <value>]

FLAGS
  -x, --extended         show extra columns
  --columns=<value>      only show provided columns (comma-separated)
  --csv                  output is csv format [alias: --output=csv]
  --debug                Enables debug logging for the CLI
  --filter=<value>       filter property by partial string matching, ex: name=foo
  --group-by=<value>     group results by one or more fields e.g product_id or project_id or product_id,project_id
  --help                 Show CLI help.
  --no-header            hide table header from output
  --no-truncate          do not truncate output to fit screen
  --output=<option>      output in a more machine friendly format
                         <options: csv|json|yaml>
  --page-number=<value>  [default: 1] the page number to return in the list resource.
  --page-size=<value>    [default: 10] the page size to return in list resource request.
  --search=<value>       the RSQL query for usage. date is required e.g --search='date>=2021-03-29'
  --sort=<value>         property to sort by (prepend '-' for descending)

DESCRIPTION
  Get Monthly Usage. The date range defaults to the last 6 months.
```

_See code: [dist/commands/usage/monthly.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/usage/monthly.ts)_

## `tru workspaces:list`

List of available workspaces

```
USAGE
  $ tru workspaces:list [--debug] [--help] [--output csv|json|yaml | --no-truncate | ] [--no-header | ]

FLAGS
  --debug            Enables debug logging for the CLI
  --help             Show CLI help.
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>

DESCRIPTION
  List of available workspaces
```

_See code: [dist/commands/workspaces/list.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/workspaces/list.ts)_

## `tru workspaces:selected`

Displays selected workspace information

```
USAGE
  $ tru workspaces:selected [--debug] [--help] [--output csv|json|yaml | --no-truncate | ] [--no-header | ]

FLAGS
  --debug            Enables debug logging for the CLI
  --help             Show CLI help.
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>

DESCRIPTION
  Displays selected workspace information
```

_See code: [dist/commands/workspaces/selected.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/workspaces/selected.ts)_

## `tru workspaces:switch DATA_RESIDENCY WORKSPACE_ID`

Switch workspaces

```
USAGE
  $ tru workspaces:switch [DATA_RESIDENCY] [WORKSPACE_ID] [--debug] [--help] [--output csv|json|yaml | --no-truncate |
    ] [--no-header | ]

ARGUMENTS
  DATA_RESIDENCY  Data residency where the workspace is located
  WORKSPACE_ID    Selected Workspace

FLAGS
  --debug            Enables debug logging for the CLI
  --help             Show CLI help.
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>

DESCRIPTION
  Switch workspaces
```

_See code: [dist/commands/workspaces/switch.ts](https://github.com/tru-ID/tru-cli/blob/v1.2.0/dist/commands/workspaces/switch.ts)_
<!-- commandsstop -->

# Development

## Commits

The release process will generate/update a CHANGELOG based on commit messages. In order to do this commits should follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

If you forget to follow this the release process allows for manual editing of the CHANGELOG.

## Releases

Releases should be performed on the `dev` branch and the related commits then merged into the `main` branch.

### CHANGELOG & Package Version

The CLI uses [standard-version](https://github.com/conventional-changelog/standard-version) to generate a changelog and bump the package version.

To update the README with new CLI instructions and add new version info to the CHANGELOG run:

```bash
$ npm run release
```

Additional parameters supported by `standard-version` can be passed as follows:

```bash
$ npm run release {additional_parameters}
```

For example:

```bash
$ npm run release --dry-run
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

##### Release MacOS Installer

To release the installers create a `.env` file with the following, including valid AWS credentials and an [NPM token](https://docs.npmjs.com/about-access-tokens):

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
NPM_TOKEN=
```

##### Publish to NPM

To publish to NPM tagged with `canary` run:

```
$ npm run npm:publish:dev
```

For a full production release run:

```
$ npm run npm:publish:prod
```

## Configuration

Every run of the CLI will check to see if all required configuration is in place. This is achieved through a [hook](https://oclif.io/docs/hooks).

For more inforation see the [Oclif Configuration How to](https://oclif.io/docs/config).
