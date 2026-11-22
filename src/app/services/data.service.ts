import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, shareReplay, throwError } from 'rxjs';

import { Olympic } from '@models/olympic.model';
import { Participation } from '@models/participation.model';
import { DashboardView } from '@models/dashboard-view.model';
import { CountryView } from '@models/country-view.model';
import { CountryMedals } from '@models/country-medals.model';
import { validateOlympics } from '@services/olympic-validator';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private readonly LOAD_ERROR_MESSAGE: string = "Unable to load the data. Please try again later.";
  private readonly olympic$: Observable<Olympic[]>;
  private readonly OLYMPIC_URL: string = './assets/mock/olympic.json';

  constructor(private http: HttpClient) {
    this.olympic$ = this.http.get<unknown>(this.OLYMPIC_URL).pipe(
      map(validateOlympics),
      catchError((): Observable<never> => {
        return throwError((): Error => new Error(this.LOAD_ERROR_MESSAGE));
      }),
      shareReplay(1));
  }

  public getDashboardView(): Observable<DashboardView> {
    return this.olympic$.pipe(map((olympics: Olympic[]): DashboardView => {
      return {
        totalCountries: olympics.length,
        totalGames: this.countGames(olympics),
        medalsPerCountry: olympics.map((olympic: Olympic): CountryMedals => {
          return {
            id: olympic.id,
            country: olympic.country,
            totalMedals: this.sumMedals(olympic.participations)
          };
        })
      };
    }));
  }

  public getCountryView(id: number): Observable<CountryView | undefined> {
    return this.olympic$.pipe(map((olympics: Olympic[]): CountryView | undefined => {
      const countryOlympic: Olympic | undefined = this.findCountry(olympics, id);
      if (!countryOlympic) return undefined;
      const countryParticipations: Participation[] = countryOlympic.participations;

      return {
        country: countryOlympic.country,
        totalEntries: countryParticipations.length,
        totalMedals: this.sumMedals(countryParticipations),
        totalAthletes: this.sumAthletes(countryParticipations),
        years: countryParticipations.map((participation: Participation): number => participation.year),
        medalsPerYear: countryParticipations.map((participation: Participation): number => participation.medalsCount)
      };
    }));
  }

  private countGames(olympics: Olympic[]): number {
    return Array.from(new Set(olympics.map((olympic: Olympic): number[] => olympic.participations.map((participation: Participation): number => participation.year)).flat())).length;
  }

  private findCountry(olympics: Olympic[], id: number): Olympic | undefined {
    return olympics.find((olympic: Olympic): boolean => olympic.id === id);
  }

  private sumMedals(participations: Participation[]): number {
    return participations.reduce((sum: number, participation: Participation): number => sum + participation.medalsCount, 0);
  }

  private sumAthletes(participations: Participation[]): number {
    return participations.reduce((sum: number, participation: Participation): number => sum + participation.athleteCount, 0);
  }

}
