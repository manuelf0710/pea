import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ComentariosService {
  constructor(private _http: HttpClient) {}

  postComentarios2(data: any): Observable<any> {
    return this._http
      .post<any>(
        environment.apiUrl + environment.productos.postcomentarios,
        data
      )
      .pipe(
        map((lista) => {
          return lista;
        })
      );
  }

  public postComentarios(data) {
    return this._http.post<any>(
      environment.apiUrl + environment.productos.postcomentarios,
      data
    );
  }
}
