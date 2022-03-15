import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { regional } from "../models/regional";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AgendaService {
  constructor(private _http: HttpClient) {}

  getAgendaProfesional(id: number): Observable<any> {
    return this._http
      .get<any>(environment.apiUrl + environment.agenda.agendaProfesional + id)
      .pipe(
        map((lista) => {
          return lista;
        })
      );
  }
}
