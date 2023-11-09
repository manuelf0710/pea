import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  public loading: boolean = false;
  formulario: FormGroup;
  constructor(private FormBuilder: FormBuilder) {}

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

    this.formulario = this.FormBuilder.group({
      id: [id],
      name: [name, [Validators.required]],
      email: [email, [Validators.required]],
      confirmar_email: [""],
      perfil_id: [perfil_id, [Validators.required]],
      cedula: [cedula, [Validators.required]],
      status: [status, [Validators.required]],
      password: [""],
      password_confirmation: [""],
    });
  }

  closeModal() {
    //this._activeModal.close(this.respuesta);
  }
}
