# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.9.3](https://github.com/tru-ID/tru-cli/compare/v0.9.2...v0.9.3) (2021-05-08)

* Bump handlebar dependency due to [Remote code execution in handlebars when compiling templates](https://github.com/advisories/GHSA-f2jv-r9rf-7988)

### [0.9.2](https://github.com/tru-ID/tru-cli/compare/v0.9.1...v0.9.2) (2021-04-16)

### [0.9.1](https://github.com/tru-ID/tru-cli/compare/v0.9.0...v0.9.1) (2021-04-01)

### Bug Fixes

* Fixed default date range for usage:hourly. It is now correctly set to current date.

## [0.9.0](https://github.com/tru-ID/tru-cli/compare/v0.8.0...v0.9.0) (2021-04-01)


### Features

* Add usage in cli ([f703017](https://github.com/tru-ID/tru-cli/commit/f7030178da04f69a5509bf53494b92f3fa295302))
    * `tru usage:hourly` - Get the default workspace's usage with hourly breakdown
    * `tru usage:daily` - Get the default workspace's usage with daily breakdown
    * `tru usage:monthly` - Get the default workspace's usage with monthly breakdown
    * `tru usage:daily --search='date>=2021-03-03'` - Get daily usage from 2021-03-03
    * `tru usage:daily --search='date>=2021-03-03' --group-by=product_id` - Get daily usage from 2021-03-03 grouped by product_id
   

## [0.8.0](https://github.com/tru-ID/tru-cli/compare/v0.7.0...v0.8.0) (2021-03-08)

### Bug Fixes

* v0.6.0 introduced a bug meaning a prompt was shown for all commands when a config file was not present. This also included the command to write the config file. This has been fixed by checking if the command is `setup:credentials` and allowing it to run ([6f04536](https://github.com/tru-ID/tru-cli/commit/6f045365a652d61fc720ea5bdbb7b4e58a8dd552))

## [0.7.0](https://github.com/tru-ID/tru-cli/compare/v0.6.0...v0.7.0) (2021-03-04)

### Features

* Add check tracing support to improve the check debugging experience:
    * `tru phonechecks:trace {check_id}`
    * `tru simchecks:trace {check_id}`
    * `tru subscriberchecks:trace {check_id}`
* Add plugin support via [oclif plugins](https://oclif.io/docs/plugins) ([5247842](https://github.com/tru-ID/tru-cli/commit/5247842f611829a5e97a890755fe6a754e43e48a))
* User is no longer prompted for credentials after install ([3f7f621](https://github.com/tru-ID/tru-cli/commit/3f7f62137001d878b7590b3440472324aa0f1e25))
* Support .pkg builds for MacOS installation ([e2260a2](https://github.com/tru-ID/tru-cli/commit/e2260a21c64a674662f624a1702a4f6a40e1c719))


## [0.6.0](https://github.com/tru-ID/tru-cli/compare/v0.5.0...v0.6.0) (2021-03-03)

### Features

* The CLI checks if a configuration file is present prior to running all commands. If a config file is now found instructions are provided on how to configure the CLI and the command does not run ([afa23fa](https://github.com/tru-ID/tru-cli/commit/afa23faa1f32fbe4d4e6f753d3aa187ed3df9268))

## 0.5.0 (2021-01-06)

### Features

* `coverage` topic added
    * `coverage:country {country_code or dialing_code}` - check if the tru.ID platform has reachability for that given country
    * `coverage:reach {ip}` - to check if the tru.ID has reachability for given IP
* added `setup:credentials` command - so you can setup your workspace credentials at any time

## 0.4.0 (2020-12-07)

### Features

* `simchecks` topic added
    * `simchecks:create {phone_number}` - to create a a SIMCheck for given phone number
    * `simchecks:list` - to search existing SIMChecks
* `subscriberchecks` topic added
    * `subscriberchecks:create {phone_number}` - to create a a SubscriberCheck for given phone number
    * `subscriberchecks:create {phone_number} --workflow` - to create a a SubscriberCheck for given phone number and test via the CLI using a QR Code
    * `subscriberchecks:create {phone_number} --quickstart` - combines creating a project and running a SubscriberCheck in `--workflow` mode
    * `subscriberchecks:list` - to search existing SubscriberChecks
* The CLI now passes a short-lived access token and check_id to the QR Code handler web app so the result of the check can be shown in the browser
* Upon running `--workflow` commands the access token is reused for Check queries rather than creating a new access token for each request.

### ⚠ BREAKING CHANGES

* The package name has changed from `tru-cli` to `@tru_id/cli`. Due to this change (which results in a `tru` binary permissions problem) you will need to uninstall the existing CLI before installing v0.4.0: `npm uninstall -g tru-cli && npm install -g @tru_id/cli`
* The location of the CLI config file has changed to reflect the package name: the location is now `{config_directory_path}/@tru_id/cli/config.json`. See [Oclif config](https://oclif.io/docs/config) for more information on the `{config_directory_path}`. Upon running any command for v0.4.0 of the CLI for the first time you will be prompted for your credentials and data residency. These can be found via https://tru.id/console.

## 0.3.1 (2020-10-22)

### Bug Fixes

* Request correct scope when accessing workspace information

## 0.3.0 (2020-10-19)

### ⚠ BREAKING CHANGES

* CLI binary renamed from `4auth` to `tru`.
* Configuration file now saved as `tru.json`. Was previously `4auth.json`
* QR Code Handler URl is now `r.tru.id`. Was previously `r.4auth.io`

### 0.2.2 (2020-09-29)

### ⚠ BREAKING CHANGES

* `--project_dir` flag changed to `--project-dir`

### Features

* Added `--skip-qrcode-handler` flag to `phonechecks:create --workflow` to directly use the `/redirect` Check URL which shows the MNO URL instead of the 4Auth redirect handler
* Added `oauth2:token` command to create OAuth2 Access tokens. Tokens can be created for a Workspace or a Project.
* Added `projects:create --mode sandbox|live` to create a Project in a given `mode`
* Added `projects:create --phonecheck-callback {url}` to create a Project with PhoneCheck `callback_url` configuration
* Added `projects:update --mode live | sandbox` to support updating the `mode` of a Project
* Added `projects:update --remove-phonecheck-callback` to allow PhoneCheck `callback_url` configuration to be removed from a Project

### 0.2.1 (2020-09-02)

### Features

* Improvements for `phonechecks:create` and `--workflow`:
    * Validate phone number if provided interactively
    * Emphasise turning off WiFi with `--workflow`
* New `projects:create --quickstart` flag:
    * Create a Project and run a PhoneCheck in a single command

## 0.2.0 (2020-08-25)

### Features

* List Projects: `4auth projects:list`
    * Includes flags for searching and sorting: `--search` and `--sort`
    * And for pagination: `--page_number` and `--page_size`
* List PhoneChecks: `4auth phonechecks:list flags
* Use improved URL endpoint for QR code: `4auth phonechecks:create --workflow` generated QR codes now link to r.4auth.io to handle the `GET check_url` request
* Workspaces command to show details such as balance: `4auth workspaces`

### Bug Fixes

* Show full property headers in list table names instead of JSON payloads

### 0.1.2 (2020-07-30)

### Bug Fixes

* **installer:** npm install on Windows

### 0.1.1 (2020-07-30)

### Bug Fixes

* Fix API error log formatting that indented with the number "2" instead of two characters

## 0.1.0 (2020-07-27)

The first official early release of the 4Auth CLI 🎉

### Features

* `4auth projects:create [NAME]` - create a Project and save Project configuration
* `4auth phonechecks:create [PHONE_NUMBER]` - create a PhoneCheck and begin the PhoneCheck Workflow
* `4auth phonechecks:create [PHONE_NUMBER] --workflow` - the `--workflow` flag progresses through the full PhoneCheck Workflow from the CLI
* `4auth phonechecks:list [CHECK_ID]` - Retrive information about a specific PhoneCheck or list PhoneCheck resources
* `--project-dir` by default the Project configration (`4auth.json`) is expected to be in the current working directory. A different directory can be specified with this flag.
* `--debug` flag to log additional debug information to the terminal
