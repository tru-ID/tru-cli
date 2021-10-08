const path = require('path')
const fs = require('fs-extra')
const os = require('os')

const canaryBranches = ['canary', 'ci-publish-test']

const buildBranch = process.env.CI_COMMIT_BRANCH
const buildCommitSHA = process.env.CI_COMMIT_SHORT_SHA
const packageFilePath = path.join(__dirname, '..', 'package.json')
const packageJson = require(packageFilePath)

function isCanaryBranch(branch) {
  return branch && canaryBranches.indexOf(branch) !== -1
}

function isNotCanaryVersion(version) {
  return version.indexOf('-canary') === -1
}

if (isCanaryBranch(buildBranch) && isNotCanaryVersion(packageJson.version)) {
  console.log(
    'Is Dev Build Branch. Appending "-canary" to package.json version for build...',
  )

  const devVersion = `${packageJson.version}-canary.${buildCommitSHA}`
  console.log('writing package.json with version', devVersion)

  packageJson.version = devVersion
  fs.writeJSONSync(packageFilePath, packageJson, { spaces: 2, EOL: os.EOL })

  console.log('writing package.json complete')
}
