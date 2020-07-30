4auth-cli
=========

The 4Auth CLI

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
$ npm install -g 4auth-cli
$ 4auth COMMAND
running command...
$ 4auth (-v|--version|version)
4auth-cli/0.1.0 darwin-x64 node-v14.4.0
$ 4auth --help [COMMAND]
USAGE
  $ 4auth COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`4auth help [COMMAND]`](#4auth-help-command)
* [`4auth phonechecks:create [PHONE_NUMBER]`](#4auth-phonecheckscreate-phone_number)
* [`4auth phonechecks:list [CHECK_ID]`](#4auth-phonecheckslist-check_id)
* [`4auth projects:create [NAME]`](#4auth-projectscreate-name)

## `4auth help [COMMAND]`

display help for 4auth

```
USAGE
  $ 4auth help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_

## `4auth phonechecks:create [PHONE_NUMBER]`

Creates a Phone Check

```
USAGE
  $ 4auth phonechecks:create [PHONE_NUMBER]

ARGUMENTS
  PHONE_NUMBER  The phone number to perform the Phone Check on

OPTIONS
  -h, --help                 show CLI help
  --debug                    Enables debug logging for the CLI
  --project-dir=project-dir  The directory that contains the 4auth.json Project configuration file
  --workflow                 Execute the Phone Check Workflow from the CLI
```

_See code: [src/commands/phonechecks/create.ts](https://github.com/4auth/4auth-cli/blob/v0.1.0/src/commands/phonechecks/create.ts)_

## `4auth phonechecks:list [CHECK_ID]`

Lists details for all Phone Checks or a specific Phone Check if the a check-id argument is passed

```
USAGE
  $ 4auth phonechecks:list [CHECK_ID]

ARGUMENTS
  CHECK_ID  The check_id for the Phone Check to list

OPTIONS
  -h, --help                 show CLI help
  --debug                    Enables debug logging for the CLI
  --project-dir=project-dir  The directory that contains the 4auth.json Project configuration file
```

_See code: [src/commands/phonechecks/list.ts](https://github.com/4auth/4auth-cli/blob/v0.1.0/src/commands/phonechecks/list.ts)_

## `4auth projects:create [NAME]`

Creates a new Project

```
USAGE
  $ 4auth projects:create [NAME]

ARGUMENTS
  NAME  the name of the project to create

OPTIONS
  -h, --help                 show CLI help
  --debug                    Enables debug logging for the CLI
  --project-dir=project-dir  The directory that contains the 4auth.json Project configuration file

EXAMPLE
  $ 4auth project:create
  What is the name of the project?: My first project
  Creating Project "My first project"
```

_See code: [src/commands/projects/create.ts](https://github.com/4auth/4auth-cli/blob/v0.1.0/src/commands/projects/create.ts)_
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

Once the CHANGELOG and version in package.json are correct ensure the file updates are staged and run the following replacing `current_version` with the version of the CLI being released:

```bash
$ git commit -m 'chore(release): v{current_version}'
  git tag v{{currentVersion}
  git push v{{currentVersion}
  git push origin dev
```

### Build Installers

To create the `tar.gz` installers run:

```bash
npm run pack
```

The installers will be built into the `./dist/{cli_name}-{version}` directory.

## Configuration

Every run of the CLI will check to see if all required configuration is in place. This is achieved through a [hook](https://oclif.io/docs/hooks).

For more inforation see the [Oclif Configuration How to](https://oclif.io/docs/config).
