import {CountryMedals} from './country-medals.model';

export interface HomeView {
  totalCountries: number,
  totalGames: number,
  medalsPerCountry: CountryMedals[]
}
