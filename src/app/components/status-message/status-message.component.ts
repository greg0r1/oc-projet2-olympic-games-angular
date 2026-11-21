import { Component, Input } from '@angular/core';

import { ViewStatus } from '@models/view-status.model';

@Component({
  selector: 'app-status-message',
  templateUrl: './status-message.component.html',
  styleUrl: './status-message.component.scss'
})
export class StatusMessageComponent {
  @Input({ required: true }) status!: Exclude<ViewStatus, 'success'>;
  @Input() message: string = 'Something went wrong. Please try again later.';
}
