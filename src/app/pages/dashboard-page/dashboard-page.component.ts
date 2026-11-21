import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { DashboardView } from '@models/dashboard-view.model';
import { CountryMedals } from '@models/country-medals.model';
import { Indicator } from '@models/indicator.model';
import { ChartItem } from '@models/chart-item.model';
import { DataService } from '@services/data.service';
import { ViewStatus } from '@models/view-status.model';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent implements OnInit {
  public error: string = '';
  public status: ViewStatus = 'loading';
  public titlePage: string = "Medals per Country";
  public indicators: Indicator[] = [];
  public chartItems: ChartItem[] = [];
  public readonly introText: string = "This chart shows the total number of medals won by each country, across all editions of the Olympic Games. Click a slice to see the details for that country.";
  private medalsPerCountry: CountryMedals[] = [];

  constructor(private router: Router, private dataService: DataService, private destroyRef: DestroyRef) {
  }

  ngOnInit(): void {
    this.dataService.getDashboardView()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (dashboardView: DashboardView): void => {
            this.indicators = this.buildIndicators(dashboardView);
            this.chartItems = dashboardView.medalsPerCountry.map((countryMedals: CountryMedals): ChartItem => {
              return {
                label: countryMedals.country,
                value: countryMedals.totalMedals,
              };
            });
            this.medalsPerCountry = dashboardView.medalsPerCountry;
            this.status = this.medalsPerCountry.length === 0 ? 'empty' : 'success';
          },
          error: (error: Error): void => {
            this.error = error.message;
            this.status = 'error';
          }
        });
  }

  public onCountrySelected(index: number): void {
    const item: CountryMedals = this.medalsPerCountry[index];
    void this.router.navigate(['/country', item.id]);
  }

  private buildIndicators(dashboardView: DashboardView): Indicator[] {
    return [
      {
        label: "Number of JOs",
        value: dashboardView.totalGames
      },
      {
        label: "Number of countries",
        value: dashboardView.totalCountries
      }
    ];
  }
}

