import {Component, Input} from '@angular/core';

import {Indicator} from '@models/indicator.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() pageTitle!: string;
  @Input() indicators!: Indicator[];
}
