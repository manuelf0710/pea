import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ComentariosService } from "src/app/services/comentarios.service";

import { estadoSeguimiento } from "src/app/models/estadoSeguimiento";

@Component({
  selector: "app-comentarios",
  templateUrl: "./comentarios.component.html",
  styleUrls: ["./comentarios.component.scss"],
})
export class ComentariosComponent implements OnInit {
  formulario: FormGroup;
  @Input() data: any;

  respuesta = {
    status: "close",
    data: [],
  };
  public loading: boolean = false;
  estadosListaSeguimiento: estadoSeguimiento[];

  constructor(
    private FormBuilder: FormBuilder,
    public _activeModal: NgbActiveModal,
    public _ComentariosService: ComentariosService
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm() {
    let producto_id = null;
    let cantidad = null;
    let comentario = null;
    if (this.data) {
      producto_id = this.data.producto.id;
      this.estadosListaSeguimiento = this.data.estadosListaSeguimiento;
      console.log("la data en pppu ", this.data);
    }
    this.formulario = this.FormBuilder.group({
      producto_id: [producto_id],
      comentario: [comentario, [Validators.required]],
      estado_seguimiento: [null, [Validators.required]],
    });
  }

  guardar(event: Event) {
    event.preventDefault();
    if (this.formulario.valid) {
      const value = { ...this.data.producto, ...this.formulario.value };
      this.loading = true;
      this._ComentariosService.postComentarios(value).subscribe(
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
