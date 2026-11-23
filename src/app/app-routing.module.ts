import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardPageComponent } from '@pages/dashboard-page/dashboard-page.component';
import { NotFoundComponent } from '@pages/not-found/not-found.component';
import { CountryDetailPageComponent } from "@pages/country-detail-page/country-detail-page.component";
import { ROUTE_PARAM_COUNTRY_ID, ROUTE_PATHS } from '@constants/app-routes';

const routes: Routes = [
  {
    path: ROUTE_PATHS.home,
    component: DashboardPageComponent,
  },
  {
    path: `${ROUTE_PATHS.country}/:${ROUTE_PARAM_COUNTRY_ID}`,
    component: CountryDetailPageComponent
  },
  {
    path: ROUTE_PATHS.notFound,
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
