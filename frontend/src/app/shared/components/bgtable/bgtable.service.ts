import { Injectable } from '@angular/core';
import { HttpClient, HttpParams  } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BgtableService {

  constructor(private _http:HttpClient) { }
  public getLista(url, data){
    //let params = new HttpParams().set('globalSearch','busqueda global');
    //let params = new HttpParams();
    //let data = { nombre:'a', profesion:'desarrollo', wife:"hey"}
    /*Object.keys(data).forEach(p => {
        params = params.append(p.toString(), data[p].toString());
    }); */
    //let params = new HttpParams({ fromObject: data });   
    return this._http.post<any>(`${url}`,data)
    //return this._http.get<any>(`${url}`)
    .pipe(map(lista => {
       const retorno = lista;
       return retorno;
    }));
  }  
}
