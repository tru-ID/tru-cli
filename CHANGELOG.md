# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
