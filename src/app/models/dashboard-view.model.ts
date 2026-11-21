import { CountryMedals } from './country-medals.model';

export interface DashboardView {
  totalCountries: number,
  totalGames: number,
  medalsPerCountry: CountryMedals[]
}
