import {Component, DestroyRef, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';

import {CountryView} from '@models/country-view.model';
import {Indicator} from '@models/indicator.model';
import {DataService} from '@services/data.service';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit {
  public titlePage: string = '';
  public error!: string;
  public indicators: Indicator[] = [];
  public years: number[] = [];
  public medals: number[] = [];

  constructor(private route: ActivatedRoute, private dataService: DataService, private destroyRef: DestroyRef) {
  }

  ngOnInit(): void {
    const countryName: string | null = this.route.snapshot.paramMap.get('countryName');
    if (!countryName) return;
    this.dataService.getCountryView(countryName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (countryView: CountryView | undefined): void => {
          if (!countryView) return;
          this.titlePage = countryView.country;
          this.years = countryView.years;
          this.medals = countryView.medalsPerYear;
          this.indicators = this.buildIndicators(countryView);
        },
        error: (error: Error): void => {
          this.error = error.message;
        }
      });
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
    ];
  }
}
