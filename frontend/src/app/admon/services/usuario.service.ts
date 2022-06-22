import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class UsuarioService {
  constructor(private _http: HttpClient) {}

  public guardarUsuario(data) {
    if (data.id == null) {
      return this._http.post<any>(
        environment.apiUrl + environment.admon.postUsuario,
        data
      );
    } else {
      return this._http.put<any>(
        environment.apiUrl + environment.admon.putUsuario + data.id,
        data
      );
    }
  }

  getProductosUsuario(id: number): Observable<any> {
    return this._http
      .get<any>(
        environment.apiUrl +
          environment.admon.getProductosByUser +
          "?user_id=" +
          id
      )
      .pipe(
        map((lista) => {
          const retorno = lista;
          return retorno;
        })
      );
  }
}
