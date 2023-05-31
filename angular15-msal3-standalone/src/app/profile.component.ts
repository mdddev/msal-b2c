import { Component, OnInit } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <h1>accounts=</h1>
    <div>{{accounts | json}}</div>
  `,
  styles: [],
  imports: [CommonModule]
})
export class ProfileComponent implements OnInit {
  accounts: any;

  constructor(
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService) { }

  ngOnInit() {
    this.msalBroadcastService.inProgress$
    .pipe(
      filter((status: InteractionStatus) => status === InteractionStatus.None),
      // takeUntil(this._destroying$)
    )
    .subscribe(() => {
      this.accounts = this.authService.instance.getAllAccounts();
    })
  }
}
