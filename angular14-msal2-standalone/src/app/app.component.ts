import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, PopupRequest, RedirectRequest, EventMessage, EventType, InteractionType, AccountInfo, SsoSilentRequest } from '@azure/msal-browser';
import { IdTokenClaims, PromptValue } from '@azure/msal-common'
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { environment } from '../environments/environment.dev';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

type IdTokenClaimsWithPolicyId = IdTokenClaims & {
    acr?: string,
    tfp?: string,
};

@Component({
    standalone: true,
    selector: 'app-root',
    template: `
    <mat-toolbar color="primary">
      <a class="title" href="/">{{ title }}</a>

      <div class="toolbar-spacer"></div>

      <button mat-raised-button *ngIf="!loginDisplay" (click)="login()">Login</button>
      <button mat-raised-button *ngIf="loginDisplay" (click)="logout()">Logout</button>
    </mat-toolbar>
    <div class="container">
      <!--This is to avoid reload during acquireTokenSilent() because of hidden iframe -->
      <router-outlet *ngIf="!isIframe"></router-outlet>
    </div>
    `,
    styles: [
      `.toolbar-spacer {
      flex: 1 1 auto;
      }`,

      `a.title {
      color: white;
      }`
    ],
    imports: [
      CommonModule,
      RouterModule,
      MatButtonModule,
      MatToolbarModule
    ]
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'Angular 14 B2C Sample - MSAL Angular v2 (STANDALONE)';
    isIframe = false;
    loginDisplay = false;
    private readonly _destroying$ = new Subject<void>();

    constructor(
        @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
        private authService: MsalService,
        private msalBroadcastService: MsalBroadcastService
    ) { }

    ngOnInit(): void {
        this.isIframe = window !== window.parent && !window.opener; // Remove this line to use Angular Universal
        this.setLoginDisplay();

        this.authService.instance.enableAccountStorageEvents(); // Optional - This will enable ACCOUNT_ADDED and ACCOUNT_REMOVED events emitted when a user logs in or out of another tab or window
        this.msalBroadcastService.msalSubject$
            .pipe(
                filter((msg: EventMessage) => msg.eventType === EventType.ACCOUNT_ADDED || msg.eventType === EventType.ACCOUNT_REMOVED),
            )
            .subscribe((result: EventMessage) => {
                if (this.authService.instance.getAllAccounts().length === 0) {
                    window.location.pathname = "/";
                } else {
                    this.setLoginDisplay();
                }
            });


        this.msalBroadcastService.inProgress$
            .pipe(
                filter((status: InteractionStatus) => status === InteractionStatus.None),
                takeUntil(this._destroying$)
            )
            .subscribe(() => {
                this.setLoginDisplay();
                this.checkAndSetActiveAccount();
            })

        this.msalBroadcastService.msalSubject$
            .pipe(
                filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS
                    || msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
                    || msg.eventType === EventType.SSO_SILENT_SUCCESS),
                takeUntil(this._destroying$)
            )
            .subscribe((result: EventMessage) => {

                let payload = result.payload as AuthenticationResult;
                let idtoken = payload.idTokenClaims as IdTokenClaimsWithPolicyId;

                if (idtoken.acr === environment.b2cPolicies.names.signUpSignIn || idtoken.tfp === environment.b2cPolicies.names.signUpSignIn) {
                    this.authService.instance.setActiveAccount(payload.account);
                }

                return result;
            });
    }

    setLoginDisplay() {
        this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    }

    checkAndSetActiveAccount() {
        /**
         * If no active account set but there are accounts signed in, sets first account to active account
         * To use active account set here, subscribe to inProgress$ first in your component
         * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
         */
        let activeAccount = this.authService.instance.getActiveAccount();

        if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
            let accounts = this.authService.instance.getAllAccounts();
            this.authService.instance.setActiveAccount(accounts[0]);
        }
    }

    loginRedirect() {
        if (this.msalGuardConfig.authRequest) {
            this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
        } else {
            this.authService.loginRedirect();
        }
    }

    login(userFlowRequest?: RedirectRequest | PopupRequest) {
        if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
            if (this.msalGuardConfig.authRequest) {
                this.authService.loginPopup({ ...this.msalGuardConfig.authRequest, ...userFlowRequest } as PopupRequest)
                    .subscribe((response: AuthenticationResult) => {
                        this.authService.instance.setActiveAccount(response.account);
                    });
            } else {
                this.authService.loginPopup(userFlowRequest)
                    .subscribe((response: AuthenticationResult) => {
                        this.authService.instance.setActiveAccount(response.account);
                    });
            }
        } else {
            if (this.msalGuardConfig.authRequest) {
                this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest, ...userFlowRequest } as RedirectRequest);
            } else {
                this.authService.loginRedirect(userFlowRequest);
            }
        }
    }

    logout() {
        if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
            this.authService.logoutPopup({
                mainWindowRedirectUri: "/"
            });
        } else {
            this.authService.logoutRedirect();
        }
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }
}
