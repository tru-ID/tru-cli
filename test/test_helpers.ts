import { test } from '@oclif/test'
import { AccessToken, TokenManager } from '../src/api/TokenManager'
import { IGlobalAuthConfiguration } from '../src/IGlobalAuthConfiguration'
import { IProjectConfiguration } from '../src/IProjectConfiguration'

export const buildConsoleString = function (stub: any): string {
  const logs: string[] = []
  for (let i = 0; i < stub.callCount; ++i) {
    logs.push(stub.getCall(i).args.join(' '))
  }

  return logs.join('\n')
}

export class DummyTokenManager implements TokenManager {
  getAccessToken(): Promise<AccessToken> {
    return Promise.resolve<AccessToken>({
      access_token: 'access_token',
      expires_in: 123456,
      token_type: 'bearer',
      scope: 'console',
    })
  }
}

export const accessToken: AccessToken = {
  access_token: 'access_token',
  expires_in: 3599,
  scope: 'coverage',
  token_type: 'bearer',
}

export const globalConfig: IGlobalAuthConfiguration = {
  selectedWorkspace: 'workspace_id',
  selectWorkspaceDataResidency: 'eu',
  tokenInfo: {
    refresh_token: 'refresh_token',
    scope: 'console openid',
  },
}

export const projectConfigFileLocation = `${process.cwd()}/tru.json`

export const projectConfig: IProjectConfiguration = {
  project_id: 'c69bc0e6-a429-11ea-bb37-0242ac130003',
  name: 'My test project',
  created_at: '2020-06-01T16:43:30+00:00',
  credentials: [
    {
      client_id: 'project client id',
      client_secret: 'project client secret',
      scopes: ['phone_check', 'sim_check', 'subscriber_check', 'coverage'],
    },
  ],
}

export const testToken = test.nock('https://login.tru.id', (api) => {
  api
    .post(
      new RegExp('/oauth2/token'),
      'grant_type=refresh_token&refresh_token=refresh_token&client_id=cli_hq',
    )
    .reply(200, {
      refresh_token: 'refresh_token',
      access_token: 'access_token_new',
      expires_in: 3599,
      scope: 'console offline_access openid',
      token_type: 'bearer',
    })
})
