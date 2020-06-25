4auth-cli
=========

The 4Auth CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/4auth-cli.svg)](https://npmjs.org/package/4auth-cli)
[![Downloads/week](https://img.shields.io/npm/dw/4auth-cli.svg)](https://npmjs.org/package/4auth-cli)
[![License](https://img.shields.io/npm/l/4auth-cli.svg)](https://github.com/4auth/4auth-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
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
* [`4auth hello [FILE]`](#4auth-hello-file)
* [`4auth help [COMMAND]`](#4auth-help-command)

## `4auth hello [FILE]`

describe the command here

```
USAGE
  $ 4auth hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ 4auth hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/4auth/4auth-cli/blob/v0.1.0/src/commands/hello.ts)_

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
<!-- commandsstop -->
