import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class TipoproductosuserService {
  constructor(private _http: HttpClient) {}

  public getTipoProductoByUser(cod) {
    return this._http
      .get<any>(
        environment.apiUrl + environment.tipoproductos_user.getById + cod
      )
      .pipe(
        map((lista) => {
          const retorno = lista;
          return retorno;
        })
      );
  }
}
