import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { ToastService } from "src/app/shared/services/toast.service";
import { UsuarioService } from "../services/usuario.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  @Input() data: any;
  public loading: boolean = false;
  formulario: FormGroup;
  respuesta = {
    status: "close",
    data: [],
  };
  public perfiles = [
    { id: 1, nombre: "Super Administrador" },
    { id: 2, nombre: "Programador" },
    { id: 3, nombre: "Profesional" },
  ];
  constructor(
    private FormBuilder: FormBuilder,
    public _activeModal: NgbActiveModal,
    public _UsuarioService: UsuarioService,
    private _ToastService: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm() {
    let id = null;
    let name = null;
    let email = null;
    let perfil_id = null;
    let perfil = null;
    let cedula = null;
    let status = null;
    console.log("this.data ", this.data);

    if (this.data) {
      id = this.data.id;
      name = this.data.name;
      email = this.data.email;
      perfil_id = this.data.perfil_id;
      perfil = this.data.perfil.nombre;
      cedula = this.data.cedula;
      status = this.data.status == 1 ? "Activo" : "Inactivo";
    }
    this.formulario = this.FormBuilder.group({
      id: [id],
      name: [name, [Validators.required]],
      email: [email, [Validators.required]],
      confirmar_email: [""],
      perfil_id: [perfil_id],
      cedula: [cedula],
      status: [status],
      password: ["", [Validators.required]],
      password_confirmation: ["", [Validators.required]],
    });
  }

  guardar(event: Event) {
    event.preventDefault();

    const passwordControl = this.formulario.get("password").value;
    const confirmPasswordControl = this.formulario.get(
      "password_confirmation"
    ).value;
    if (!passwordControl) {
      this._ToastService.danger("los campos passwords deben contener un valor");
    }
    if (passwordControl !== confirmPasswordControl) {
      this._ToastService.danger("los passwords no coinciden");
    }

    if (this.formulario.valid) {
      const value = {
        ...this.formulario.value,
      };
      this.loading = true;
      this._UsuarioService.guardarUsuario(value).subscribe(
        (res: any) => {
          if (res.status == "ok") {
            this.respuesta = { status: "ok", data: res };
            this._activeModal.close(this.respuesta);
            //this._ToastService.success("Cliente " + res.msg + " correctamente");
          }
          if (res.status == "error") {
            let messageError = this._ToastService.errorMessage(res.msg);
            this._ToastService.danger(messageError);
          }
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
