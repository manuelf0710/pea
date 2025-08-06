import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastService } from "src/app/shared/services/toast.service";
import { ProductoService } from "../../../services/producto.service";

@Component({
  selector: "app-excel-multi-solicitud-persona",
  templateUrl: "./excel-multi-solicitud-persona.component.html",
  styleUrls: ["./excel-multi-solicitud-persona.component.scss"],
})
export class ExcelMultiSolicitudPersonaComponent implements OnInit {
  public loading: boolean = false;
  public archivoscargados: any[] = [];
  public datosProcesados: any[] = [];
  public procesadoReady: boolean = false;
  public dataExpandida: any = {};
  public confirmacionNuevoProducto: boolean = false;
  formularioArchivo: FormGroup;

  constructor(
    private FormBuilder: FormBuilder,
    private _ToastService: ToastService,
    public _activeModal: NgbActiveModal,
    private _ProductoService: ProductoService
  ) {}

  @Input() data: any;
  respuesta = {
    status: "close",
    id: 0,
    data: [],
  };

  ngOnInit(): void {
    this.buildForm();
  }

  closeModal() {
    this._activeModal.close(this.respuesta);
  }
  private buildForm() {
    this.formularioArchivo = this.FormBuilder.group({
      id: [""],
      archivo: ["", [Validators.required]],
      forzarCargue: ["No"],
    });
  }

  getTooltipMensaje(item: any): string {
  if (item.validRecord) {
    return '';
  }

  if (!item.errors || item.errors.length === 0) {
    return 'Error desconocido'; // o ''
  }

  return item.errors
    .slice(0, 3) // opcional: máximo 3 errores
    .map(error => error.msg)
    .join(' | ');
}


  getArchivos(archivos_upload) {
    /*archivos subidos, desde fileuploadcomponent */
    this.archivoscargados = archivos_upload;
    this.formularioArchivo
      .get("archivo")
      .setValue(this.archivoscargados[0]["path"]);

    if (this.archivoscargados.length > 0) {
      this._ToastService.info("archivo cargado y procesando datos...");
      this.procesarDatosExcel();
    }
  }
  procesarDatosExcel() {
    this._ProductoService
      .procesarExcelMultiSolicitud({
        nombrearchivo: this.formularioArchivo.value.archivo,
      })
      .subscribe((res: any) => {
        if (res.status == "error") {
          this._ToastService.danger(res.msg);
        }
        if (res.code == 200) {
          if (res.data.records.length) {
            this.procesadoReady = true;
            res.data.records.forEach((item) => {
              item.agregar = false;
            });
            this.datosProcesados = res.data.records;
          } else {
            this._ToastService.success(res.msg);
          }
        }
      });
  }

  getExpandirData(cedula) {
    this.dataExpandida = this.datosProcesados.find(
      (item) => cedula === item.cedula
    );
    console.log(this.dataExpandida);
  }

  seleccionarAgregar(ev, cedula) {
    this.datosProcesados.forEach((item) => {
      if (cedula === item.cedula) item.agregar = ev;
    });
  }

  seleccionarTodos(ev) {
    this.datosProcesados.forEach((item) => {
      if (item.existeSolicitudDestinoId) item.agregar = ev;
    });
  }
  enviarDatosAgregar() {
    let data = this.datosProcesados.filter((item) => item.agregar === true);
    data.forEach((item) => {
      delete item.agregar;
    });
    if (data.length) {
      this._ProductoService.saveMultiProduct(data).subscribe((res: any) => {
        if (res.status == "error") {
          this._ToastService.danger(res.msg);
        }
        if (res.code == 200) {
          this.confirmacionNuevoProducto = true;
          this.datosProcesados = res.data.records
          console.log("------ res", res);
          this._ToastService.success('Productos agregados');
        }
      });
    } else {
      this._ToastService.danger('No hay nunguno seleccionado');
    }
  }
}
