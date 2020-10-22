# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### 0.3.1 (2020-10-22)

### Bug Fixes

* request correct scope when accessing workspace information ([254e832](https://github.com/4auth/4auth-cli/commit/254e83211f71272a5f03e644f5e975aa614cb1b7))

## 0.3.0 (2020-10-19)

### ⚠ BREAKING CHANGES

* CLI binary renamed from `4auth` to `tru`.

### 0.2.2 (2020-09-29)

### ⚠ BREAKING CHANGES

* `--project_dir` flag changed to `--project-dir`

### Features

* Added `--skip-qrcode-handler` flag to `phonechecks:create --workflow` to directly use the `/redirect` Check URL which shows the MNO URL instead of the 4Auth redirect handler
* Added `oauth2:token` command to create OAuth2 Access tokens. Tokens can be created for a Workspace or a Project.
* Added `projects:create --mode sandbox|live` to create a Project in a given `mode`
* Added `projects:create --phonecheck-callback {url}` to create a Project with Phone Check `callback_url` configuration
* Added `projects:update --mode live | sandbox` to support updating the `mode` of a Project
* Added `projects:update --remove-phonecheck-callback` to allow Phone Check `callback_url` configuration to be removed from a Project

### 0.2.1 (2020-09-02)

### Features

* Improvements for `phonechecks:create` and `--workflow`:
    * Validate phone number if provided interactively
    * Emphasise turning off WiFi with `--workflow`
* New `projects:create --quickstart` flag:
    * Create a Project and run a Phone Check in a single command

## 0.2.0 (2020-08-25)

### Features

* List Projects: `4auth projects:list`
    * Includes flags for searching and sorting: `--search` and `--sort`
    * And for pagination: `--page_number` and `--page_size`
* List Phone Checks: `4auth phonechecks:list flags
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
* `4auth phonechecks:create [PHONE_NUMBER]` - create a Phone Check and begin the Phone Check Workflow
* `4auth phonechecks:create [PHONE_NUMBER] --workflow` - the `--workflow` flag progresses through the full Phone Check Workflow from the CLI
* `4auth phonechecks:list [CHECK_ID]` - Retrive information about a specific Phone Check or list Phone Check resources
* `--project-dir` by default the Project configration (`4auth.json`) is expected to be in the current working directory. A different directory can be specified with this flag.
* `--debug` flag to log additional debug information to the terminal
