The tru.ID CLI

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
$ npm install -g tru-cli
$ tru COMMAND
running command...
$ tru (-v|--version|version)
tru-cli/0.3.0 linux-x64 node-v10.19.0
$ tru --help [COMMAND]
USAGE
  $ tru COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`tru help [COMMAND]`](#tru-help-command)
* [`tru oauth2:token`](#tru-oauth2token)
* [`tru phonechecks:create [PHONE_NUMBER]`](#tru-phonecheckscreate-phone_number)
* [`tru phonechecks:list [CHECK_ID]`](#tru-phonecheckslist-check_id)
* [`tru projects:create [NAME]`](#tru-projectscreate-name)
* [`tru projects:list [PROJECT_ID]`](#tru-projectslist-project_id)
* [`tru projects:update [PROJECT-ID]`](#tru-projectsupdate-project-id)
* [`tru workspaces`](#tru-workspaces)

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `tru oauth2:token`

Creates an OAuth2 token

```
USAGE
  $ tru oauth2:token

OPTIONS
  -h, --help                 show CLI help
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
  $ TOKEN=$(tru oauth2:token --project_dir ~/tmp/bbb --no-header)                                                        
                                                                                                       
  ~/4auth/git/4auth-cli
  $ echo $TOKEN                                                                                                          
                                                                                                           
  ~/4auth/git/4auth-cli
  Emesua0F7gj3qOaav7UaKaBwefaaefaAxlrdGom_mb3U.78Od2d9XpvTQbd44eM1Uf7nzz9e9nezs5TRjPmpDnMc
```

_See code: [src/commands/oauth2/token.ts](https://github.com/4auth/4auth-cli/blob/v0.3.0/src/commands/oauth2/token.ts)_

## `tru phonechecks:create [PHONE_NUMBER]`

Creates a Phone Check

```
USAGE
  $ tru phonechecks:create [PHONE_NUMBER]

ARGUMENTS
  PHONE_NUMBER  The phone number to perform the Phone Check on

OPTIONS
  -h, --help                 show CLI help
  --debug                    Enables debug logging for the CLI
  --project-dir=project-dir  The directory that contains the tru.json Project configuration file
  --skip-qrcode-handler      Skips using the tru hosted QR code handler with the `check_url`
  --workflow                 Execute the Phone Check Workflow from the CLI
```

_See code: [src/commands/phonechecks/create.ts](https://github.com/4auth/4auth-cli/blob/v0.3.0/src/commands/phonechecks/create.ts)_

## `tru phonechecks:list [CHECK_ID]`

Lists details for all Phone Checks or a specific Phone Check if the a check-id argument is passed

```
USAGE
  $ tru phonechecks:list [CHECK_ID]

ARGUMENTS
  CHECK_ID  The check_id for the Phone Check to list

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

_See code: [src/commands/phonechecks/list.ts](https://github.com/4auth/4auth-cli/blob/v0.3.0/src/commands/phonechecks/list.ts)_

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
  --phonecheck-callback=phonecheck-callback  set a callback to be invoked when a Phone Check reaches an end state
  --project-dir=project-dir                  The directory that contains the tru.json Project configuration file
  --quickstart                               Create a Project and also create a Phone Check in workflow mode.

EXAMPLES
  $ tru projects:create
  What is the name of the project?: My first project
  Creating Project "My first project"

  $ tru projects:create --phonecheck-callback https://example.com/callback
  $ tru projects:create --mode sandbox
  $ tru projects:create --mode live
```

_See code: [src/commands/projects/create.ts](https://github.com/4auth/4auth-cli/blob/v0.3.0/src/commands/projects/create.ts)_

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

_See code: [src/commands/projects/list.ts](https://github.com/4auth/4auth-cli/blob/v0.3.0/src/commands/projects/list.ts)_

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
  --phonecheck-callback=phonecheck-callback  set a callback to be invoked when a Phone Check reaches an end state
  --project-dir=project-dir                  The directory that contains the tru.json Project configuration file
  --remove-phonecheck-callback               remove the Phone Check callback configuration from the Project

EXAMPLES
  $ tru projects:update --phonecheck-callback https://example.com/callback
  $ tru projects:update --remove-phonecheck-callback
  $ tru projects:update --mode sandbox
  $ tru projects:update --mode live
```

_See code: [src/commands/projects/update.ts](https://github.com/4auth/4auth-cli/blob/v0.3.0/src/commands/projects/update.ts)_

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

_See code: [src/commands/workspaces/index.ts](https://github.com/4auth/4auth-cli/blob/v0.3.0/src/commands/workspaces/index.ts)_
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
$ npm run release
```

Additional parameters supported by `standard-version` can be passed as follows:

```bash
$ npm run release -- {additional_parameters}
```

For example:

```bash
$ npm run release -- --dry-run
```

### Commit and Tag

If all goes well, we're ready to mark the release as complete.

Once the CHANGELOG and version in package.json are correct ensure the file updates are staged and run the following replacing `current_version` with the version of the CLI being released:

```bash
$ git commit -m 'chore(release): v{current_version}'
  git tag v{{currentVersion}
  git push origin v{{currentVersion}
  git push origin dev
```

### Build & Release

Merge `dev` into `main` to release and the installers are automatically build and uploaded to AWS.

#### Manual Build & Release process

##### Build Installers

To create the `tar.gz` installers run:

```bash
npm run pack
```

The installers will be built into the `./dist/{cli_name}-{version}` directory.

##### Release Installers

To release the installers create a `.env` file with the following (including valid AWS credentils):

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

To upload to S3 run:

```
npm run aws:publish
```

## Configuration

Every run of the CLI will check to see if all required configuration is in place. This is achieved through a [hook](https://oclif.io/docs/hooks).

For more inforation see the [Oclif Configuration How to](https://oclif.io/docs/config).
