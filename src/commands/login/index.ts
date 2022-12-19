import { CliUx, Command } from '@oclif/core'
import fs from 'fs-extra'
import getPort from 'get-port'
import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import {
  CallbackParamsType,
  Client,
  generators,
  Issuer,
  TokenSet,
} from 'openid-client'
import path from 'path'
import {
  authorizationUrl,
  issuerUrl,
  jkwsUri,
  loginBaseUrl,
  workspaceTokenUrl,
} from '../../DefaultUrls'
import { renderLoginError, renderLoginSuccess } from '../../helpers/template'
import { IGlobalAuthConfiguration } from '../../IGlobalAuthConfiguration'

export default class Login extends Command {
  static description = 'Login to tru.ID'

  static args = [
    {
      name: 'IDP',
      required: true,
      description: 'The Identity Provider',
      options: ['google', 'github', 'microsoft'],
    },
  ]

  async run(): Promise<void> {
    const { args } = await this.parse(Login)

    const configLocation = path.join(this.config.configDir, 'config.json')
    const configOAuth = await this.getOrCreateConfig(configLocation)

    const serverPort = await getPort()

    const issuer = this.createIssuer(configOAuth, args['IDP'])

    const client = new issuer.Client({
      client_id: 'cli_hq',
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
      redirect_uris: [`http://127.0.0.1:${serverPort}`],
    })

    const code_verifier = generators.codeVerifier()
    const code_challenge = generators.codeChallenge(code_verifier)
    const state = generators.state(15)
    const redirectUri = `http://127.0.0.1:${serverPort}`

    const authorizationUrl = await client.authorizationUrl({
      scope: 'console offline_access openid',
      code_challenge,
      code_challenge_method: 'S256',
      state,
      redirect_uri: redirectUri,
    })

    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      this.createServerHandler(
        server,
        client,
        redirectUri,
        code_verifier,
        state,
        configLocation,
        configOAuth,
        req,
        res,
      )
    })

    server.listen(serverPort, async () => {
      this.log(`Visit this url to login: ${authorizationUrl}`)
      await CliUx.ux.open(authorizationUrl)
    })

    server.once('error', (err: Error) => {
      throw err
    })
  }

  async catch(err: Error): Promise<any> {
    this.error(`failed to login: ${err.message}`, { exit: 1 })
  }

  async getOrCreateConfig(
    configLocation: string,
  ): Promise<IGlobalAuthConfiguration> {
    let config: IGlobalAuthConfiguration = {}
    if (!fs.existsSync(configLocation)) {
      await this.saveConfig(configLocation, config)
    } else {
      try {
        config = await fs.readJson(configLocation)
      } catch (err) {
        throw new Error(`failed to read config file: ${err}`)
      }
    }
    return config
  }

  async saveConfig(
    configLocation: string,
    config: IGlobalAuthConfiguration,
  ): Promise<void> {
    await fs.outputJson(configLocation, config, { spaces: 2 })
  }

  async updateConfig(
    configLocation: string,
    config: IGlobalAuthConfiguration,
    tokenSet: TokenSet,
  ): Promise<void> {
    const newConfig: IGlobalAuthConfiguration = {
      apiBaseUrlPattern: config.apiBaseUrlPattern,
      apiLoginUrlOverride: config.apiLoginUrlOverride,
      selectedWorkspaceDataResidency: config.selectedWorkspaceDataResidency,
      selectedWorkspace: config.selectedWorkspace,
      tokenInfo: {
        refreshToken: tokenSet.refresh_token!,
        scope: tokenSet.scope!,
      },
    }

    await this.saveConfig(configLocation, newConfig)
  }

  createIssuer(config: IGlobalAuthConfiguration, provider: string): Issuer {
    return new Issuer({
      issuer: issuerUrl(config) + '/', // just needed for validation
      authorization_endpoint: authorizationUrl(loginBaseUrl(config), provider),
      token_endpoint: workspaceTokenUrl(loginBaseUrl(config)),
      token_endpoint_auth_method: 'none',
      jwks_uri: jkwsUri(issuerUrl(config)),
    })
  }

  async createServerHandler(
    server: Server,
    client: Client,
    redirectUri: string,
    code_verifier: string,
    state: string,
    configLocation: string,
    configOAuth: IGlobalAuthConfiguration,
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    let callbackParams: CallbackParamsType

    if (req.url?.startsWith('/?')) {
      callbackParams = client.callbackParams(req)
      if (!callbackParams) {
        const errorReason = 'no callback received'
        res.setHeader('Connection', 'close');
        res.end(renderLoginError(errorReason))
        server.close()
        throw new Error(errorReason)
      }

      if (callbackParams.error) {
        const error = {
          error: callbackParams.error,
          error_description: callbackParams.error_description,
        }

        res.setHeader('Connection', 'close');
        res.end(renderLoginError(`received callback with error=${error.error}`))
        server.close()
        throw new Error(
          `error during callback : error=${error.error} description=${error.error_description}`,
        )
      }

      const tokenSet: TokenSet = await client.callback(
        redirectUri,
        callbackParams,
        {
          code_verifier: code_verifier,
          state: state,
        },
      )

      await this.updateConfig(configLocation, configOAuth, tokenSet)

      this.log(`Configuration written to: ${path.resolve(configLocation)}`)
      this.log(`Next steps:
  - 'tru workspaces:list' to list the workspace available to work on
  - 'tru workspaces:switch' to work on a given workspace
      `)
      res.setHeader('Connection', 'close');
      res.end(renderLoginSuccess())
      server.close()
    } else {
      res.setHeader('Connection', 'close');
      res.end()
      server.close()
    }
  }
}
