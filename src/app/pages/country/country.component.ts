import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import Chart from 'chart.js/auto';

import {CountryView} from '@models/country-view.model';
import {Indicator} from '@models/indicator.model';
import {DataService} from '@services/data.service';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit {
  public lineChart!: Chart<"line", number[], number>;
  public titlePage: string = '';
  public error!: string;
  public indicators: Indicator[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService) {
  }

  ngOnInit() {
    const countryName: string | null = this.route.snapshot.paramMap.get('countryName');
    if (!countryName) return;
    this.dataService.getCountryView(countryName).subscribe({
      next: (countryView: CountryView | undefined): void => {
        if (!countryView) return

        this.titlePage = countryView.country;
        const years: number[] = countryView.years;
        const medals: number[] = countryView.medalsPerYear;
        this.indicators = this.buildIndicators(countryView);
        this.buildChart(years, medals);
      },
      error: (error: Error): void => {
        this.error = error.message
      }
    })
  }

  buildChart(years: number[], medals: number[]) {
    const lineChart = new Chart("countryChart", {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: "medals",
            data: medals,
            backgroundColor: '#0b868f'
          },
        ]
      },
      options: {
        aspectRatio: 2.5
      }
    });
    this.lineChart = lineChart;
  }

  private buildIndicators(countryView: CountryView): Indicator[] {
    return [
      {
        label: "Number of entries",
        value: countryView.totalEntries
      },
      {
        label: "Total Number of medals",
        value: countryView.totalMedals
      },
      {
        label: "Total Number of athletes",
        value: countryView.totalAthletes
      }
    ]
  }
}
