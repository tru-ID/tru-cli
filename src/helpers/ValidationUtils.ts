import { IGlobalAuthConfiguration } from '../IGlobalAuthConfiguration'
import { IProjectConfiguration } from '../IProjectConfiguration'

export function doesProjectConfigExist(
  projectConfig?: IProjectConfiguration,
): void {
  if (!projectConfig) {
    throw new Error(
      'Please provide a valid directory path or run `tru projects:create` to create a project and associated configuration file.',
    )
  }
}

export function isProjectCredentialsValid(
  projectConfig: IProjectConfiguration,
): void {
  const credentials = projectConfig.credentials[0]
  if (!credentials) {
    throw new Error('Missing project credentials')
  }

  if (!credentials.client_id) {
    throw new Error('Missing project credentials')
  }

  if (!credentials.client_secret) {
    throw new Error('Missing project credentials')
  }
}

export function isWorkspaceSelected(
  globalConfig: IGlobalAuthConfiguration,
): void {
  if (!globalConfig.selectedWorkspaceDataResidency) {
    throw new Error(
      'Workspace not selected. Please run "tru workspaces:switch" to select workspace',
    )
  }

  if (!globalConfig.selectedWorkspace) {
    throw new Error(
      'Workspace not selected. Please run "tru workspaces:switch" to select workspace',
    )
  }
}

export function isWorkspaceTokenInfoValid(
  globalConfig: IGlobalAuthConfiguration,
): void {
  if (!globalConfig.tokenInfo) {
    throw new Error('Missing configuration. Please run "tru login"')
  }

  if (!globalConfig.tokenInfo.refreshToken) {
    throw new Error('Missing configuration. Please run "tru login"')
  }

  if (!globalConfig.tokenInfo.scope) {
    throw new Error('Missing configuration. Please run "tru login"')
  }
}
