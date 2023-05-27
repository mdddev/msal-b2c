import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { BrowserUtils } from '@azure/msal-browser';
import { HomeComponent } from './home/home.component';
import { FailedComponent } from './failed/failed.component';
import { GuardedComponent } from './guarded/guarded.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
      path: 'guarded',
      component: GuardedComponent,
      canActivate: [MsalGuard]
    },
    {
        path: 'login-failed',
        component: FailedComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
      // Don't perform initial navigation in iframes or popups
      initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? 'enabledNonBlocking' : 'disabled' // Set to enabledBlocking to use Angular Universal
    })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
