import { BrowserCacheLocation, BrowserUtils, IPublicClientApplication, InteractionType, LogLevel, PublicClientApplication } from "@azure/msal-browser";
import { environment } from "./environments/environment";
import { MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService, MsalGuard, MsalGuardConfiguration, MsalInterceptor, MsalInterceptorConfiguration, MsalRedirectComponent, MsalService } from "@azure/msal-angular";
import { Route, provideRouter, withDisabledInitialNavigation, withEnabledBlockingInitialNavigation } from "@angular/router";
import { bootstrapApplication } from "@angular/platform-browser";
import { importProvidersFrom } from "@angular/core";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AppComponent } from "./app/app.component";
import { FailedComponent } from "./app/failed.component";
import { HomeComponent } from "./app/home.component";
import { ProfileComponent } from "./app/profile.component";
import { provideAnimations } from "@angular/platform-browser/animations";

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1; // Remove this line to use Angular Universal

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msalConfig.auth.clientId,
      authority: environment.b2cPolicies.authorities.signUpSignIn.authority,
      redirectUri: '/',
      postLogoutRedirectUri: '/',
      knownAuthorities: [environment.b2cPolicies.authorityDomain]
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: isIE, // set to true for IE 11. Remove this line to use Angular Universal
    },
    system: {
      allowNativeBroker: false, // Disables WAM Broker
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Verbose,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(environment.apiConfig.uri, environment.apiConfig.scopes);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [...environment.apiConfig.scopes]
    },
    loginFailedRoute: '/login-failed'
  };
}

const initialNavigation = !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup()
  ? withEnabledBlockingInitialNavigation()
  : withDisabledInitialNavigation();

  export const ROUTES: Route[] = [
    {
      path: 'profile',
      component: ProfileComponent,
      canActivate: [MsalGuard]
    },
    {
      path: '',
      component: HomeComponent
    },
    {
      path: 'login-failed',
      component: FailedComponent
    },
    {
      path: 'auth',
      component: MsalRedirectComponent
    }
  ];

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    importProvidersFrom(
      MsalRedirectComponent
    ),
    provideRouter(ROUTES, initialNavigation),
    {
      provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true
    },
    {
      provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG, useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG, useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalBroadcastService,
    MsalGuard
  ]
}).catch((err: any) => console.log(err));
