const SIGN_IN_USER_FLOW_NAME = 'b2c_1_susi'
const B2C_TENANT_PREFIX = 'fabrikamb2c'
const B2C_TENANT_DOMAIN = 'fabrikamb2c'

const CLIENT_IDS = {
  WEB_APP: '9067c884-9fa6-414f-9aa4-a565b1cb46be'
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
        'offline_access'
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
