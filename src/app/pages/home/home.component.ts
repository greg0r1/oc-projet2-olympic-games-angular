import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {DataService} from '@services/data.service';
import {HomeView} from '@models/home-view.model';
import {CountryMedals} from '@models/country-medals.model';
import {Indicator} from '@models/indicator.model';
import {ChartItem} from '@models/chart-item.model';

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
  private medalsPerCountry: CountryMedals[] = [];

  constructor(private router: Router, private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.getHomeView().subscribe(
      {
        next: (homeView: HomeView) => {
          this.indicators = this.buildIndicators(homeView);
          this.chartItems = homeView.medalsPerCountry.map((countryMedals: CountryMedals): ChartItem => {
            return {
              label: countryMedals.country,
              value: countryMedals.totalMedals,
            }
          });
          this.medalsPerCountry = homeView.medalsPerCountry;
        },
        error: (error: Error) => {
          console.log(`erreur : ${error}`);
          this.error = error.message;
        }
      })
  }

  public onCountrySelected(index: number) {
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
    ]
  }
}

