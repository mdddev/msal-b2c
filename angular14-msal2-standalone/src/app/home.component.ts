import { Component, OnInit } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { filter } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  template: `
    <div *ngIf="!loginDisplay">
        <p>Please sign-in to see your profile information.</p>
    </div>

    <div *ngIf="loginDisplay">
        <p>Login successful!</p>
        <p>Call a B2C protected web API by selecting the Hello API link above.</p>
        <p>Claims in your ID token are shown below: </p>
    </div>

    <table id="idTokenClaims" mat-table [dataSource]="dataSource" class="mat-elevation-z8" *ngIf="loginDisplay">

        <!-- Claim Column -->
        <ng-container matColumnDef="claim">
            <th mat-header-cell *matHeaderCellDef> Claim </th>
            <td mat-cell *matCellDef="let element"> {{element.claim}} </td>
        </ng-container>

        <!-- Value Column -->
        <ng-container matColumnDef="value">
            <th mat-header-cell *matHeaderCellDef> Value </th>
            <td mat-cell *matCellDef="let element"> {{element.value}} </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [
    `table {
      width: 70%;
      margin: 3% auto auto auto;
    }`,
    `.card-section {
      margin: 10%;
      padding: 5%;
    }`
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule
  ]
})
export class HomeComponent implements OnInit {
  loginDisplay = false;
  displayedColumns: string[] = ['claim', 'value'];
  dataSource: any =[];

  constructor(private authService: MsalService, private msalBroadcastService: MsalBroadcastService) { }

  ngOnInit(): void {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
      )
      .subscribe((result: EventMessage) => {
        console.log(result);
        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        this.getClaims(this.authService.instance.getActiveAccount()?.idTokenClaims as Record<string, any>);
      })

  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  getClaims(claims: Record<string, any>) {
    if (claims) {
      Object.entries(claims).forEach((claim: [string, unknown], index: number) => {
        this.dataSource.push({id: index, claim: claim[0], value: claim[1]});
      });
    }
  }

}
