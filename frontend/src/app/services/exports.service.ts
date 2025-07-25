import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { regional } from "../models/regional";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ExportService {
  constructor(private _http: HttpClient) {}

  exportarExcel(data): Observable<Blob> {
    return this._http
      .post(
        environment.apiUrl + environment.exports.generarExcelProductos,
        data,
        {
          responseType: "blob" as "json",
        }
      )
      .pipe(
        map((response: Blob) => {
          return new Blob([response], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
        })
      );
  }

  postAgendaProfesionalAllProfesional(data: any): Observable<any> {
    return this._http
      .post<any>(
        environment.apiUrl +
          environment.agenda.postAgendaDisponibleAllProfesional,
        data
      )
      .pipe(
        map((lista) => {
          return lista;
        })
      );
  }

  public postCitasByProfesional(data: any): Observable<any> {
    return this._http
      .post<any>(
        environment.apiUrl + environment.agenda.postCitasByProfesional,
        data
      )
      .pipe(
        map((lista) => {
          return lista;
        })
      );
  }

  public postAgenda(id, data) {
    if (data.id == null) {
      return this._http.post<any>(
        environment.apiUrl + environment.agenda.postAgendaProfesional + id,
        data
      );
    } else {
      return this._http.put<any>(
        environment.apiUrl + environment.agenda.putAgendaProfesional + data.id,
        data
      );
    }
  }
  public postCita(data) {
    return this._http.post<any>(
      environment.apiUrl + environment.agenda.postCita,
      data
    );
  }
}
