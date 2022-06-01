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

  getEstadosAll(): Observable<any> {
    return this._http
      .get<any>(environment.apiUrl + environment.comun.getEstados)
      .pipe(
        map((lista) => {
          const retorno = lista;
          return retorno;
        })
      );
  }

  getListasEstadosByPerfil(id: number): Observable<any> {
    return this._http
      .get<any>(
        environment.apiUrl + environment.comun.getListaEstadosByIdByUser + id
      )
      .pipe(
        map((lista) => {
          const retorno = lista;
          return retorno;
        })
      );
  }

  getListasById(id: number): Observable<any> {
    return this._http
      .get<any>(environment.apiUrl + environment.comun.getListaById + id)
      .pipe(
        map((lista) => {
          const retorno = lista;
          return retorno;
        })
      );
  }

  getOrdenesServicio(): Observable<any> {
    return this._http
      .get<any>(environment.apiUrl + environment.comun.getOrdenesServicio)
      .pipe(
        map((lista) => {
          const retorno = lista;
          return retorno;
        })
      );
  }
}
