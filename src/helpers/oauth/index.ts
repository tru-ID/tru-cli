import { createServer, IncomingMessage, ServerResponse } from 'http'
import { generators, Issuer, Client, TokenSet } from 'openid-client'
import {
  issuerUrl,
  jkwsUri,
  loginBaseUrl,
  workspaceTokenUrl,
  authorizationUrl,
} from '../../DefaultUrls'
import {
  IGlobalAuthConfiguration,
  TokenInfo,
} from '../../IGlobalAuthConfiguration'
import { renderLoginError, renderLoginSuccess } from './template'

interface AuthContext {
  client: Client
  state: string
  codeVerifier: string
  authUrl: string
}

export interface LoginDetails {
  authorizationUrl: string
  healthCheckUrl: string
}

/**
 * This class is used to create a server that listens for an OAuth/OIDC authorization code.
 * It resolves the code into a {@link TokenInfo} object
 *
 * The server will automatically shutdown if:
 *
 * - it exchanged the code for a token set
 * - the authorization server replied with an error
 *
 * @example
 * const exchanger = new TokenExchanger(8080, 'google', {})
 * const { authorizationUrl } = exchanger.start()
 *
 * console.log(`Visit the following url to login: ${authorizationUrl}`)
 *
 * const tokenInfo = await exchanger.getTokens()
 * // do something with the tokenInfo
 */
export class TokenExchanger {
  private port: number
  private provider: string
  private authConfig: IGlobalAuthConfiguration
  private redirectUri: string

  private tokens?: Promise<TokenSet>

  constructor(
    port: number,
    provider: string,
    authConfig: IGlobalAuthConfiguration,
  ) {
    this.port = port
    this.provider = provider
    this.authConfig = authConfig
    this.redirectUri = `http://127.0.0.1:${port}`
  }

  start(): LoginDetails {
    const authCtx = this.initAuthContext()

    this.tokens = new Promise((resolve, reject) => {
      const server = createServer(async (req, res) => {
        const { pathname } = new URL(req.url!, `http://${req.headers.host}`)
        switch (pathname) {
          case '/':
            try {
              const tokens = await this.handleCode(req, res, authCtx)
              server.close(() => resolve(tokens))
            } catch (err) {
              server.close(() => reject(err))
            }
            break
          case '/health':
            res.writeHead(200, {
              Connection: 'close',
              'Content-Type': 'text/plain',
            })
            res.write('OK')
            res.end()
            break
          default:
            res.writeHead(404, {
              Connection: 'close',
            })
            res.end()
            break
        }
      })
      server.once('error', (err: Error) => {
        server.close()
        reject(err)
      })
      server.listen(this.port)
    })

    return {
      authorizationUrl: authCtx.authUrl,
      healthCheckUrl: 'http://127.0.0.1/health',
    }
  }

  async getTokens(): Promise<TokenInfo> {
    if (!this.tokens) {
      throw new Error('forgot to call start()')
    }
    const { refresh_token, scope } = await this.tokens
    return { refreshToken: refresh_token!, scope: scope! }
  }

  private initAuthContext(): AuthContext {
    const issuer = new Issuer({
      issuer: issuerUrl(this.authConfig) + '/',
      authorization_endpoint: authorizationUrl(
        loginBaseUrl(this.authConfig),
        this.provider,
      ),
      token_endpoint: workspaceTokenUrl(loginBaseUrl(this.authConfig)),
      token_endpoint_auth_method: 'none',
      jwks_uri: jkwsUri(issuerUrl(this.authConfig)),
    })
    const client = new issuer.Client({
      client_id: 'cli_hq',
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
      redirect_uris: [this.redirectUri],
    })

    const codeVerifier = generators.codeVerifier()
    const codeChallenge = generators.codeChallenge(codeVerifier)
    const state = generators.state(15)

    const authUrl = client.authorizationUrl({
      scope: 'console offline_access openid',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      redirect_uri: this.redirectUri,
    })

    return {
      client,
      state,
      codeVerifier,
      authUrl,
    }
  }

  private async handleCode(
    req: IncomingMessage,
    res: ServerResponse,
    authCtx: AuthContext,
  ): Promise<TokenSet> {
    const { client, state, codeVerifier } = authCtx
    const callbackParams = client.callbackParams(req)
    if (!callbackParams) {
      const errorReason = 'missing callback parameters'
      res.writeHead(200, { Connection: 'close' })
      res.end(renderLoginError(errorReason))
      throw new Error(errorReason)
    }

    if (callbackParams.error) {
      const error = {
        error: callbackParams.error,
        error_description: callbackParams.error_description,
      }

      res.writeHead(200, { Connection: 'close' })
      res.end(renderLoginError(`received callback with error=${error.error}`))
      throw new Error(
        `error during callback: error=${error.error} description=${error.error_description}`,
      )
    }

    try {
      const tokens = await client.callback(this.redirectUri, callbackParams, {
        code_verifier: codeVerifier,
        state: state,
      })
      res.writeHead(200, {
        Connection: 'close',
      })
      res.end(renderLoginSuccess())
      return tokens
    } catch (err) {
      res.writeHead(200, {
        Connection: 'close',
      })
      res.end(renderLoginError(`failed to exchange code`))
      throw new Error(`failed to exchange code for tokens`)
    }
  }
}
