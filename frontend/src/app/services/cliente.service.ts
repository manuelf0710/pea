import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "./../../environments/environment";
import { regional } from "../models/regional";

@Injectable({
  providedIn: "root",
})
export class ClienteService {
  constructor(private _http: HttpClient) {}

  getClienteByCedula(ced: number): Observable<any> {
    return this._http
      .get<any>(environment.apiUrl + environment.comun.getClienteByCedula + ced)
      .pipe(
        map((lista) => {
          const retorno = lista;
          return retorno;
        })
      );
  }
}
