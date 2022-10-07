import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { UsuarioService } from "./../../../../services/usuario.service";
import { ToastService  } from "src/app/shared/services/toast.service";

export interface tipoProductoUser{
  id: number;
  name:String;
  tipoproducto_asignado: number;
  marcado:number;
  modificado?: boolean;
}
@Component({
  selector: "app-crearusuario",
  templateUrl: "./crearusuario.component.html",
  styleUrls: ["./crearusuario.component.scss"],
})
export class CrearusuarioComponent implements OnInit {
  formulario: FormGroup;
  @Input() data: any;
  public perfiles = [
    { id: 1, nombre: "Super Administrador" },
    { id: 2, nombre: "Programador" },
    { id: 3, nombre: "Profesional" },
  ];

  respuesta = {
    status: "close",
    data: [],
  };
  public loading: boolean = false;

  public tipoProductosUsuarioLista: tipoProductoUser[];

  constructor(
    private FormBuilder: FormBuilder,
    public _activeModal: NgbActiveModal,
    public _UsuarioService: UsuarioService,
    private _ToastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm() {
    let id = null;
    let name = null;
    let email = null;
    let perfil_id = null;
    let cedula = null;
    let status = null;
    if (this.data) {
      id = this.data.id;
      name = this.data.name;
      email = this.data.email;
      perfil_id = this.data.perfil_id;
      cedula = this.data.cedula;
      status = this.data.status;
    }
    this.formulario = this.FormBuilder.group({
      id: [id],
      name: [name, [Validators.required]],
      email: [email, [Validators.required]],
      confirmar_email: [""],
      perfil_id: [perfil_id, [Validators.required]],
      cedula: [cedula, [Validators.required]],
      status: [status, [Validators.required]],
      password:[""],
      password_confirmation:[""]
    });
    this.cargarUsuario(id);
  }

  cargarUsuario(id) {
    this.loading = true;
    this._UsuarioService.getProductosUsuario(id).subscribe(
      (res: any) => {
        this.tipoProductosUsuarioLista = res;
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

  guardar(event: Event) {
    event.preventDefault();
    if (this.formulario.valid) {
      const value = {...this.formulario.value, tipoProductosLista: this.tipoProductosUsuarioLista};
      this.loading = true;
      this._UsuarioService.guardarUsuario(value).subscribe(
        (res: any) => {
          if(res.status=='ok'){
            this.respuesta = {status: 'ok', data:res}
            this._activeModal.close(this.respuesta);
            this._ToastService.success('Cliente '+res.msg+' correctamente');
          }
          if(res.status=='error'){
          
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

  getCheckboxTipoProductoUser(valor, item){
    const getCheckbox = this.tipoProductosUsuarioLista.map((element) => {
      if(element.id == item.id){
        element.modificado = valor.checked;
      }
      return element;
    }
    );   
    this.tipoProductosUsuarioLista = getCheckbox
  }
}
