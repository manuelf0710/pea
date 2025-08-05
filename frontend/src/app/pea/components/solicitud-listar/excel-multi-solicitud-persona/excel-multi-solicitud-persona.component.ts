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
  public procesadoReady: boolean = false
  public dataExpandida: any = {};
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
    this.buildForm()
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
        nombrearchivo: this.formularioArchivo.value.archivo
      })
      .subscribe((res: any) => {
        if (res.status == "error") {
          this._ToastService.danger(res.msg);
        }
        if (res.code == 200) {
          
          if (res.data.records.length) {
            this.procesadoReady = true;
            this.datosProcesados =  res.data.records;
          } else {
            this._ToastService.success(res.msg);
          }
          /*this.mostrarCargaExcel = false;
          if (res.data.clientesOtrasSolicitudes.length > 0) {
            this.simpleModal(res.data.clientesOtrasSolicitudes);
          } else {
            this._ToastService.success(res.msg);
          }

          this._ProductoService
            .getProductosBySolicitud(this.id, {})
            .subscribe((data) => {
              this.productosLista = data.data;
            }); */
        }
      });
  }

  getExpandirData(cedula) {
    this.dataExpandida = this.datosProcesados.find((item)=> cedula === item.cedula)  
    console.log(this.dataExpandida)
  }
}
