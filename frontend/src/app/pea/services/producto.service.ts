import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { environment } from "./../../../environments/environment";
//import { producto } from "../models/producto";

@Injectable({
  providedIn: "root",
})
export class ProductoService {
  constructor(private _http: HttpClient) {}
  /**
   * traer data de acuerdo al id de productorepsois
   */
  public getSolicitudById(id) {
    return this._http
      .get<any>(
        environment.apiUrl + environment.productos.getByIdProductoRepso + id
      )
      .pipe(
        map((lista) => {
          const retorno = lista;
          return retorno;
        })
      );
  }

  public getProductosBySolicitud(id, data) {
    return this._http.post<any>(
      environment.apiUrl + environment.productos.posByIdProductoRepso + id,
      data
    );
  }

  /*
   * procesar el cargue del excel de clientes funcionarios
   */
  public procesarExcelBySolicitud(id, data) {
    return this._http
      .post<any>(
        environment.apiUrl + environment.productos.getProcesarCargue + id,
        data
      )
      .pipe(
        map((lista) => {
          const retorno = lista;
          return retorno;
        })
      );
  }

  public cancelarProductoBiId(data) {
    return this._http.put<any>(
      environment.apiUrl +
        environment.productos.putProductoCancelStateById +
        data.id,
      data
    );
  }

  eliminar(id) {
    return this._http.delete<any>(
      environment.apiUrl + environment.productos.deleteProductoBYId + id
    );
  }
}
