import {provideHttpClient} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from '@pages/home/home.component';
import {NotFoundComponent} from '@pages/not-found/not-found.component';
import {CountryComponent} from "@pages/country/country.component";
import {HeaderComponent} from '@components/header/header.component';
import {PieChartComponent} from '@components/pie-chart/pie-chart.component';
import {LineChartComponent} from '@components/line-chart/line-chart.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, NotFoundComponent, CountryComponent, HeaderComponent, PieChartComponent, LineChartComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {
}
