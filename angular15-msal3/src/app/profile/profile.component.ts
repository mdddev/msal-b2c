import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { filter, takeUntil } from 'rxjs';
import { InteractionStatus } from '@azure/msal-browser';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
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
