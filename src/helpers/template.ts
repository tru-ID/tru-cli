//
// This module is a bit hacky but avoids having to pull a templating lib e.g. ejs
//

const renderLoginResult = (infoSection: string) => {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      http-equiv="Cache-Control"
      content="no-cache, no-store, must-revalidate"
    />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65"
      crossorigin="anonymous"
    />
    <title>Login Result</title>
    <style>
      html,
      body {
        height: 100%;
      }

      body {
        display: flex;
        justify-content: center;
        justify-items: center;
        align-items: center;
        background-color: #f5f5f5;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <main>
      <img
        class="mb-1"
        src="https://developer.tru.id/media/tru-logo-dark.svg"
        alt="tru.ID"
      />
      ${infoSection}
    </main>
  </body>
</html>
`
}

const successSection = `
        <h1 class="mt-3 mb-3 h3 fw-normal">Login successful</h1>
        <p>You can now close this page</p>
`

const renderErrorSection = (errorReason: string) => `
        <h1 class="mt-3 mb-3 h3 fw-normal">Login failed</h1>
        <p>Reason: ${errorReason}</p>
        <p>If this problem persists please <a href="https://tru.id/support">contact us</a></p>
`

/**
 * Renders a login success page that automatically closes after 10 seconds
 * @returns the html for the login result
 */
export const renderLoginSuccess = (): string => {
  return renderLoginResult(successSection)
}

/**
 * Renders a login error page for a given reason
 * @param reason the error reason
 * @returns the html for the login result
 */
export const renderLoginError = (reason: string): string => {
  const errorSection = renderErrorSection(reason)
  return renderLoginResult(errorSection)
}
