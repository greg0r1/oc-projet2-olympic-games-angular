import {Component, DestroyRef, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';

import {HomeView} from '@models/home-view.model';
import {CountryMedals} from '@models/country-medals.model';
import {Indicator} from '@models/indicator.model';
import {ChartItem} from '@models/chart-item.model';
import {DataService} from '@services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public error!: string;
  public titlePage: string = "Medals per Country";
  public indicators: Indicator[] = [];
  public chartItems: ChartItem[] = [];
  public readonly introText: string = "This chart shows the total number of medals won by each country, across all editions of the Olympic Games. Click a slice to see the details for that country.";
  private medalsPerCountry: CountryMedals[] = [];

  constructor(private router: Router, private dataService: DataService, private destroyRef: DestroyRef) {
  }

  ngOnInit(): void {
    this.dataService.getHomeView()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (homeView: HomeView): void => {
            this.indicators = this.buildIndicators(homeView);
            this.chartItems = homeView.medalsPerCountry.map((countryMedals: CountryMedals): ChartItem => {
              return {
                label: countryMedals.country,
                value: countryMedals.totalMedals,
              };
            });
            this.medalsPerCountry = homeView.medalsPerCountry;
          },
          error: (error: Error): void => {
            this.error = error.message;
          }
        });
  }

  public onCountrySelected(index: number): void {
    const item: CountryMedals = this.medalsPerCountry[index];
    void this.router.navigate(['/country', item.country]);
  }

  private buildIndicators(homeView: HomeView): Indicator[] {
    return [
      {
        label: "Number of JOs",
        value: homeView.totalGames
      },
      {
        label: "Number of countries",
        value: homeView.totalCountries
      }
    ];
  }
}

