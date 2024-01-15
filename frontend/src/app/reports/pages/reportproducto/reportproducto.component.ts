import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { ExportService } from "src/app/services/exports.service";
import { FileSaverDirective, FileSaverService } from "ngx-filesaver";

@Component({
  selector: "app-reportproducto",
  templateUrl: "./reportproducto.component.html",
  styleUrls: ["./reportproducto.component.scss"],
})
export class ReportproductoComponent implements OnInit {
  loading: boolean = false;
  constructor(
    private _FileSaverService: FileSaverService,
    private _ExportService: ExportService,
    private _http: HttpClient
  ) {}

  ngOnInit(): void {}

  exportarExcel4(): Observable<any> {
    let data = {};
    return this._http
      .post<any>(environment.exports.generarExcelProductos, data)
      .pipe(
        map((lista) => {
          console.log("la varialbe lista =>>>>", lista);
          return lista;
        })
      );
  }

  exportarExcel2() {
    let data = {
      startDateView: "",
      endDateView: "",
    };
    this.loading = true;
    console.log("antes del servicio");
    this._ExportService.exportarExcel().subscribe(
      (res: any) => {
        console.log("ingreso o que hizo esto");
        this.downloadFile(res);
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
  }

  exportarExcel() {
    window.open(environment.server_root + "/reporteproductos");
  }

  exportarExcel3() {
    let data = {
      startDateView: "",
      endDateView: "",
    };
    this.loading = true;

    this._ExportService.exportarExcel().subscribe(
      (res: any) => {
        const blob = new Blob([res], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "archivoprueba.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
  }

  downloadFile(data: Blob) {
    console.log("hizo algo laura comida");
    this._FileSaverService.save(data, "archivoprueba.xlsx");
  }
}
