import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ProductosrepsoService } from "../../../services/productosrepso.service";

@Component({
  selector: "app-editar",
  templateUrl: "./editar.component.html",
  styleUrls: ["./editar.component.scss"],
})
export class EditarComponent implements OnInit {
  formulario: FormGroup;
  @Input() data: any;

  respuesta = {
    status: "close",
    data: [],
  };
  public loading: boolean = false;

  constructor(
    private FormBuilder: FormBuilder,
    public _activeModal: NgbActiveModal,
    public _ProductosrepsoService: ProductosrepsoService
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm() {
    let id = null;
    let cantidad = null;
    if (this.data) {
      id = this.data.id;
      cantidad = this.data.cantidad;
    }
    this.formulario = this.FormBuilder.group({
      id: [id],
      cantidad: [cantidad, [Validators.required]],
    });
  }

  guardar(event: Event) {
    event.preventDefault();
    if (this.formulario.valid) {
      const value = this.formulario.value;
      this.loading = true;
      this._ProductosrepsoService.guardarsolicitud(value).subscribe(
        (res: any) => {
          this.respuesta = { status: "ok", data: res };
          this._activeModal.close(this.respuesta);
        },
        (error: any) => {
          console.log("error " + error);
        },
        () => (this.loading = false)
      );
    } else {
      this.formulario.markAllAsTouched();
    }
    if (this.formulario.valid) {
      console.log(this.formulario);
    }
  }

  closeModal() {
    this._activeModal.close(this.respuesta);
  }
}
