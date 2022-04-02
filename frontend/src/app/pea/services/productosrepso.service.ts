import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
//import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";

import { productoRepso } from "./../models/productoRepso";

@Injectable({
  providedIn: "root",
})
export class ProductosrepsoService {
  constructor(private _http: HttpClient) {}

  public guardarsolicitud(data) {
    if (data.id == null) {
      return this._http.post<any>(
        environment.apiUrl + environment.solicitud.post,
        data
      );
    } else {
      return this._http.put<any>(
        `${environment.apiUrl}/pos/categorias/` + data.id,
        data
      );
    }
  }

  public getSolicitudById(id) {
    return this._http
      .get<productoRepso>(
        environment.apiUrl + environment.solicitud.getById + id
      )
      .pipe(
        map((lista) => {
          const retorno = lista;
          return retorno;
        })
      );
  }
}