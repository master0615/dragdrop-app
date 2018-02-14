import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {  RequestOptions } from '@angular/http';
import { environment } from '../environments/environment';
import { Figure } from './figure.model';

export const API_URL = `${environment.apiUrl}/figure`;

@Injectable()
export class ApiService {

  constructor( 
    private http        : HttpClient) {
  }

  public getFigures(): Observable<any>  {
    return this.http.get(API_URL)
    .catch(this.handleError);
  }

  public createFigure(figure:Figure): Observable<any>  {
    return this.http.post(API_URL, figure)
    .catch(this.handleError);
  }

  public updateFigure(figure:Figure): Observable<any>  {
    const url = `${API_URL}/${figure.id}`;
    return this.http.put(url, figure)
    .catch(this.handleError); 
  }

  public removeFigure(figureId:number): Observable<any>  {
    const url = `${API_URL}/${figureId}`;
    return this.http.delete(url)
    .catch(this.handleError);
  }

  public removeAllFigures(): Observable<any>  {
      const url = `${API_URL}/all`;
    return this.http.get(url)
    .catch(this.handleError);
  }

  private handleError (error: Response | any) {
    console.error('ApiService::handleError', error);
    return Observable.throw(error);
  }
}