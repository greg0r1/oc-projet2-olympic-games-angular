import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import Chart from 'chart.js/auto';
import {DataService} from '@services/data.service';
import {HomeView} from '@models/home-view.model';
import {CountryMedals} from '@models/country-medals.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public pieChart!: Chart<"pie", number[], string>;
  public totalCountries: number = 0
  public totalJOs: number = 0
  public error!: string
  titlePage: string = "Medals per Country";

  constructor(private router: Router, private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.getHomeView().subscribe(
      {
        next: (homeView: HomeView) => {
          this.totalCountries = homeView.totalCountries;
          this.totalJOs = homeView.totalGames

          const countries: string[] = homeView.medalsPerCountry.map((countryMedals: CountryMedals): string => countryMedals.country);
          const medals: number[] = homeView.medalsPerCountry.map((countryMedals: CountryMedals): number => countryMedals.totalMedals);
          this.buildPieChart(countries, medals);
        },
        error: (error: Error) => {
          console.log(`erreur : ${error}`);
          this.error = error.message
        }
      })
  }

  buildPieChart(countries: string[], medals: number[]) {
    const pieChart = new Chart("DashboardPieChart", {
      type: 'pie',
      data: {
        labels: countries,
        datasets: [{
          label: 'Medals',
          data: medals,
          backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'],
          hoverOffset: 4
        }],
      },
      options: {
        aspectRatio: 2.5,
        onClick: (e) => {
          if (e.native) {
            const points = pieChart.getElementsAtEventForMode(e.native, 'point', {intersect: true}, true)
            if (points.length) {
              const firstPoint = points[0];
              const countryName = pieChart.data.labels ? pieChart.data.labels[firstPoint.index] : '';
              this.router.navigate(['country', countryName]);
            }
          }
        }
      }
    });
    this.pieChart = pieChart;
  }
}

