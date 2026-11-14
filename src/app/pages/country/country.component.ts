import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import Chart from 'chart.js/auto';
import {DataService} from '@services/data.service';
import {Olympic} from '@models/olympic.model';


@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit {
  public lineChart!: Chart<"line", string[], number>;
  public titlePage: string = '';
  public totalEntries: any = 0;
  public totalMedals: number = 0;
  public totalAthletes: number = 0;
  public error!: string;

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService) {
  }

  ngOnInit() {
    let countryName: string | null = null
    this.route.paramMap.subscribe((param: ParamMap) => countryName = param.get('countryName'));
    this.dataService.getOlympics().subscribe({
      next: (data: Olympic[]) => {
        if (data && data.length > 0) {
          const selectedCountry = data.find((olympic: Olympic) => olympic.country === countryName);
          if (!selectedCountry) {
            return
          }
          this.titlePage = selectedCountry?.country ?? '';
          const participations = selectedCountry?.participations.map((i: any) => i);
          this.totalEntries = participations?.length ?? 0;
          const years = selectedCountry?.participations.map((i: any) => i.year) ?? [];
          const medals = selectedCountry?.participations.map((i: any) => i.medalsCount.toString()) ?? [];
          this.totalMedals = medals.reduce((accumulator: any, item: any) => accumulator + parseInt(item), 0);
          const nbAthletes = selectedCountry?.participations.map((i: any) => i.athleteCount.toString()) ?? []
          this.totalAthletes = nbAthletes.reduce((accumulator: any, item: any) => accumulator + parseInt(item), 0);
          this.buildChart(years, medals);
        }
      },
      error: (error: Error) => this.error = error.message
    })
  }


  buildChart(years: number[], medals: string[]) {
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
