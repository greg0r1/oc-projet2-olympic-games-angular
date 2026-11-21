import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardPageComponent } from '@pages/dashboard-page/dashboard-page.component';
import { NotFoundComponent } from '@pages/not-found/not-found.component';
import { CountryDetailPageComponent } from "@pages/country-detail-page/country-detail-page.component";

const routes: Routes = [
  {
    path: '',
    component: DashboardPageComponent,
  },
  {
    path: 'country/:id',
    component: CountryDetailPageComponent
  },
  {
    path: 'not-found',
    component: NotFoundComponent
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
