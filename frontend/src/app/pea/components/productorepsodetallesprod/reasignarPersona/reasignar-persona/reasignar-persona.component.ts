import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ProductoService } from "src/app/pea/services/producto.service";
import { ProductosrepsoService } from "src/app/pea/services/productosrepso.service";
import { ToastService } from "src/app/shared/services/toast.service";
import { UtilService } from "src/app/shared/services/util.service";

@Component({
  selector: "app-reasignar-persona",
  templateUrl: "./reasignar-persona.component.html",
  styleUrls: ["./reasignar-persona.component.scss"],
})
export class ReasignarPersonaComponent implements OnInit {
  public loading: boolean = false;
  public destino = {
    tipo_producto: { name: "" },
    contrato: { nombre: "" },
    regional: { nombre: "" },
    descripcion: "",
  };
  formulario: FormGroup;
  respuestaForm = {
    status: "close",
    data: [],
  };
  constructor(
    private _ProductosrepsoService: ProductosrepsoService,
    private _ToastService: ToastService,
    public _activeModal: NgbActiveModal
  ) {}

  @Input() data: any;
  respuesta = {
    status: "close",
    id: 0,
    data: [],
  };

  ngOnInit(): void {
    console.log("reasigar --", this.data.detallesPersona);
  }

  closeModal() {
    this._activeModal.close(this.respuesta);
  }
  isDestinoValido(): boolean {
    return this.destino && Object.keys(this.destino).length > 0;
  }

  reasignar() {
    if (this.destino.tipo_producto.name !== "") {
      this.loading = true;
      this._ProductosrepsoService
        .postReasignarPersona({
          persona: this.data.detallesPersona,
          origen: this.data.detallesOds,
          destino: this.destino,
        })
        .subscribe(
          (res: any) => {
            this.destino = res;
            this._ToastService.success("Rasignacion exitosa");
            this._activeModal.close({...this.respuesta, id: this.data.detallesPersona.id });
          },
          (error: HttpErrorResponse) => {
            console.log("ha ocurrido un error ");
            console.log("error ", error);
          },
          () => {
            this.loading = false;
          }
        );
    } else {
      this._ToastService.danger("Carga los datos del destino en la busqueda");
    }
  }

  buscar(event: Event) {
    event.preventDefault();
    if(event.target[0].value === this.data.detallesOds.id.toString() ) return this._ToastService.danger("No se puede reasignar al mismo producto");
    if(event.target[0].value){ 
    this.loading = true;
    this._ProductosrepsoService
      .getSolicitudById(event.target[0].value)
      .subscribe(
        (res: any) => {
          this.destino = res;
        },
        (error: HttpErrorResponse) => {
          console.log("ha ocurrido un error ");
          console.log("error ", error);
        },
        () => {
          this.loading = false;
        }
      );
    } else {
      this._ToastService.danger("Agrega el codigo de solicitud");
    }
      
  }
}
