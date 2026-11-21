import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { CountryView } from '@models/country-view.model';
import { Indicator } from '@models/indicator.model';
import { DataService } from '@services/data.service';

@Component({
  selector: 'app-country-detail-page',
  templateUrl: './country-detail-page.component.html',
  styleUrls: ['./country-detail-page.component.scss']
})
export class CountryDetailPageComponent implements OnInit {
  public titlePage: string = '';
  public error!: string;
  public indicators: Indicator[] = [];
  public years: number[] = [];
  public medals: number[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService, private destroyRef: DestroyRef) {
  }

  ngOnInit(): void {
    const countryId: number = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(countryId)) {
      this.redirectToNotFound();
      return;
    }

    this.dataService.getCountryView(countryId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (countryView: CountryView | undefined): void => {
          if (!countryView) {
            this.redirectToNotFound();
            return;
          }

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

  private redirectToNotFound(): void {
    void this.router.navigate(['/not-found'], { replaceUrl: true });
  }
}
