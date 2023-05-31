# Angular 15 MSAL Angular v3 Sample

This was cloned from the official [MSAL v3 sample app](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples/msal-angular-v3-samples/angular15-sample-app) and edited to be compatible with an Azure AD B2C configuration. The client id used is the one used by Microsoft in its official [MSAL v2 B2C sample](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/samples/msal-angular-v2-samples/angular-b2c-sample-app/src/environments/environment.dev.ts), so you can readily sign in with one of your socials.

This app is **module-based**.

# Instructions

This sample uses the alpha 2 of MSAL V3.

* Install dependencies: `npm install`

* Run app: `ng s`

* On http://localhost:4200 sign in either with Redirect or Popup method

* Profile page (MSAL-guarded) displays account info
