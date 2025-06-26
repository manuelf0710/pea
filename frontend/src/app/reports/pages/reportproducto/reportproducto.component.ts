import { Component, OnInit } from "@angular/core";
import { forkJoin } from "rxjs";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
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
  loadingExcel: boolean = false;
  formulario: FormGroup;
  tipoProductosLista: any[];
  regionalesLista: any[];
  contratosLista: any[];
  profesionalesLista: any[];

  constructor(
    private FormBuilder: FormBuilder,
    private _FileSaverService: FileSaverService,
    private _ExportService: ExportService,
    private _http: HttpClient
  ) {}

  ngOnInit(): void {
    this.dataformulario();
    this.buildForm();
  }

  private buildForm() {
    let tipoProducto = null;
    let regional = null;
    let contrato = null;
    let profesional = null;
    let grupal = null;
    let cedula = null;
    let estado = null;
    let fechaProgramacionDesde = null;
    let fechaProgramacionHasta = null;
    let fechaInicio = null;
    let fechaFin = null;
    let modalidad = null;
    let productoRepsoId = null;

    this.formulario = this.FormBuilder.group({
      tipoProducto: [tipoProducto],
      regional: [regional],
      contrato: [contrato],
      profesional: [profesional],
      grupal: [grupal],
      cedula: [cedula],
      estado: [estado],
      fechaProgramacionDesde: [fechaProgramacionDesde],
      fechaProgramacionHasta: [fechaProgramacionHasta],
      fechaFin: [fechaFin],
      fechaInicio: [fechaInicio],
      modalidad: [modalidad],
      productoRepsoId: [productoRepsoId],
    });
  }

  dataformulario() {}

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
    this._ExportService.exportarExcel(data).subscribe(
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

  generarReporte(event: Event): void {
    const data = this.formulario.value;
    this.loading = true;
    this.loadingExcel = true;
    this._ExportService.exportarExcel(data).subscribe(
      (res: any) => {
        console.log("ingreso o que hizo esto");
        this.downloadFile(res);
        setTimeout(() => {
          this.loading = false;
          this.loadingExcel = false;
        }, 1000);
      },
      (error: any) => {
        this.loading = false;
        this.loadingExcel = false;
      },
      () => {
        this.loading = false;
        this.loadingExcel = false;
      }
    );
  }

  guardar(event: Event): void {
    console.log("guardaraawsrasre");
  }

  exportarExcel3() {
    const data = {
      startDateView: "",
      endDateView: "",
    };
    this.loading = true;

    this._ExportService.exportarExcel(data).subscribe(
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
    this._FileSaverService.save(
      data,
      "productos_" + this.obtenerFechaHoraFormatoYmdHis() + ".xlsx"
    );
  }

  obtenerFechaHoraFormatoYmdHis() {
    const ahora = new Date();

    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    const hora = String(ahora.getHours()).padStart(2, "0");
    const minuto = String(ahora.getMinutes()).padStart(2, "0");
    const segundo = String(ahora.getSeconds()).padStart(2, "0");

    return `${anio}${mes}${dia}_${hora}${minuto}${segundo}`;
  }
}
