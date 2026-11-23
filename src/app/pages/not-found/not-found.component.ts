import { Component } from '@angular/core';

import { ROUTE_LINKS } from '@constants/app-routes';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
  public readonly homeLink: string = ROUTE_LINKS.home;
}
