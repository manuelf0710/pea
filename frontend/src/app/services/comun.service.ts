import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { regional } from "../models/regional";

@Injectable({
  providedIn: "root",
})
export class ComunService {
  constructor(private _http: HttpClient) {}

  getRegionales(): Observable<regional[]> {
    return this._http
      .get<any>(environment.apiUrl + environment.comun.getRegionales)
      .pipe(
        map((lista) => {
          const retorno = lista.data;
          return retorno;
        })
      );
  }
  getUsersAll(profile: number): Observable<any> {
    return this._http
      .get<any>(
        environment.apiUrl +
          environment.comun.getlistarAllUsers +
          "?profile=" +
          profile
      )
      .pipe(
        map((lista) => {
          const retorno = lista;
          return retorno;
        })
      );
  }
}
