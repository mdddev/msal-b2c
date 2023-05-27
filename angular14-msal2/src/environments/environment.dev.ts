const SIGN_IN_USER_FLOW_NAME = 'B2C_1_signupsignin1'
const B2C_TENANT_PREFIX = 'PREFIX'
const B2C_TENANT_DOMAIN = 'DOMAIN'

const CLIENT_IDS = {
  WEB_APP: 'WEB_APP_ID',
  API: 'API_APP_ID'
}

export const environment = {
  production: false,
  msalConfig: {
      auth: {
          clientId: CLIENT_IDS.WEB_APP,
      }
  },
  apiConfig: {
      scopes: [
        'openid',
        'offline_access',
        // `https://${B2C_TENANT_DOMAIN}/${CLIENT_IDS.API}/access_as_user`
      ],
      uri: 'https://fabrikamb2chello.azurewebsites.net/hello'
  },
  b2cPolicies: {
      names: {
          signUpSignIn: SIGN_IN_USER_FLOW_NAME,
      },
      authorities: {
          signUpSignIn: {
              authority: `https://${B2C_TENANT_PREFIX}.b2clogin.com/${B2C_TENANT_PREFIX}.onmicrosoft.com/${SIGN_IN_USER_FLOW_NAME}`
          }
      },
      authorityDomain: `${B2C_TENANT_PREFIX}.b2clogin.com`
  }
};
