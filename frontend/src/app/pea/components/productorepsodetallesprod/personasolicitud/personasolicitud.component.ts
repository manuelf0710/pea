import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";
import { ProductoService } from "src/app/pea/services/producto.service";
import { ToastService } from "src/app/shared/services/toast.service";
import { UtilService } from "src/app/shared/services/util.service";

@Component({
  selector: "app-personasolicitud",
  templateUrl: "./personasolicitud.component.html",
  styleUrls: ["./personasolicitud.component.scss"],
})
export class PersonaSolicitudComponent implements OnInit {
  public loading: boolean = false;
  @Input() data: any;
  respuesta = {
    status: "close",
    data: [],
  };
  constructor(
    private _ProductoService: ProductoService,
    private _ToastService: ToastService,
    private _UtilService: UtilService,
    public _activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {}
  closeModal() {
    this._activeModal.close(this.respuesta);
  }

  filterRecords(record: any) {
    console.log(this.data);
    console.log(typeof this.data);
    const newRecords = this.data.info.filter(
      (item) => item.cedula != record.cedula
    );
    this.data.info = newRecords;
  }

  addRecordToSolicitud(item: any) {
    this._UtilService
      .confirm({
        title: "Guardar Registro",
        message: "desea agregar este registro?",
      })
      .then(
        () => {
          this.loading = true;
          this._ProductoService.saveOneProduct(item).subscribe((res: any) => {
            if (res.status == "ok") {
              this._ToastService.success(res.msg);
              this.filterRecords(res.data.producto);
              this.loading = false;
              this.respuesta.status = "ok";
            }
            if (res.status == "error") {
              let messageError = this._ToastService.errorMessage(res.msg);
              this._ToastService.danger(messageError);
            }
          });
        },
        () => {
          this.loading = false;
        }
      );
  }
}
