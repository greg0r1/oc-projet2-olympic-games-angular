import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import Chart from 'chart.js/auto';

import {CountryView} from '@models/country-view.model';
import {DataService} from '@services/data.service';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit {
  public lineChart!: Chart<"line", number[], number>;
  public titlePage: string = '';
  public totalEntries: number = 0;
  public totalMedals: number = 0;
  public totalAthletes: number = 0;
  public error!: string;

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService) {
  }

  ngOnInit() {
    const countryName: string | null = this.route.snapshot.paramMap.get('countryName');
    if (!countryName) return
    this.dataService.getCountryView(countryName).subscribe({
      next: (countryView: CountryView | undefined): void => {
        if (!countryView) return

        this.titlePage = countryView.country;
        this.totalEntries = countryView.totalEntries;
        const years: number[] = countryView.years;
        const medals: number[] = countryView.medalsPerYear;
        this.totalMedals = countryView.totalMedals;
        this.totalAthletes = countryView.totalAthletes;
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
}
