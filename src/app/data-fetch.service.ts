import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataFetchService {
  private baseUrl = 'https://model-api-new-hackathon2024-trendtrackers-ai.rhh24cluster-dal10-b3c-32-b7fa127339e34d1cc8d1b3e2be243d89-0000.us-south.containers.appdomain.cloud/get_forecasted_data';

  constructor(private http: HttpClient) { }

  getForecastedData(queryParams: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?prompt=${queryParams}`);
  }
}
