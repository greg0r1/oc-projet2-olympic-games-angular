import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Olympic} from '@models/olympic.model';
import {Observable, catchError, shareReplay, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly OLYMPIC_URL = './assets/mock/olympic.json';
  private readonly LOAD_ERROR_MESSAGE = "Unable to load the data. Please try again later.";
  private readonly olympic$: Observable<Olympic[]>;

  constructor(private http: HttpClient) {
    this.olympic$ = http.get<Olympic[]>(this.OLYMPIC_URL).pipe(
      catchError(() => {
        return throwError(() => new Error(this.LOAD_ERROR_MESSAGE));
      }),
      shareReplay(1))
  }

  public getOlympics(): Observable<Olympic[]> {
    return this.olympic$;
  }
}
