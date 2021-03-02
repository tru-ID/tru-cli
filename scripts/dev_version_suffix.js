const path = require('path')
const fs = require('fs-extra')
const os = require('os')

const devBuildBranches = ['canary', 'ci-publish-test']

const buildBranch = process.env.CI_COMMIT_BRANCH
const buildCommitSHA = process.env.CI_COMMIT_SHORT_SHA
const packageFilePath = path.join(__dirname, '..', 'package.json')
const packageJson = require(packageFilePath)

if( isDevBuildBranch(buildBranch) &&
    isNotDevVersion(packageJson.version) ) {
    
    console.log('Is Dev Build Branch. Appending "-dev" to package.json version for build...')
    
    const devVersion = `${packageJson.version}-dev.${buildCommitSHA}`
    console.log('writing package.json with version', devVersion)

    packageJson.version = devVersion
    fs.writeJSONSync(packageFilePath, packageJson, {spaces: 2,EOL: os.EOL})

    console.log('writing package.json complete')
}

function isDevBuildBranch(branch) {
    return branch && devBuildBranches.indexOf(buildBranch) !== -1
}

function isNotDevVersion(version) {
    return version.indexOf('-dev') === -1
}