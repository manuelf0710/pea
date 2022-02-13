import { Injectable } from '@angular/core';
import { HttpClient, HttpParams  } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoproductosService {

  constructor(private _http:HttpClient) { }

  public getLista(){

    return this._http.get<any>(environment.apiUrl + environment.tipoproductos.getAll)
    .pipe(map(lista => {
       const retorno = lista;
       return retorno;
    }));
  }  
}

