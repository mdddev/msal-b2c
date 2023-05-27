import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-orders',
    template: `
      <p>Login failed. Please try again.</p>
    `,
    styles: []
})
export class FailedComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

}
