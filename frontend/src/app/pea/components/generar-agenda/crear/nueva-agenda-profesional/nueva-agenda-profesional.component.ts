import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastService } from "../../../../../shared/services/toast.service";
import { UtilService } from "src/app/shared/services/util.service";

export interface Agenda {
  id?: number;
  profesional_id?: number;
  profesional?: String;
  start: String;
  end: String;
  tipo_agenda?: number;
  created_at?: String;
  updated_at?: String;
  deleted_at?: String;
}

@Component({
  selector: "app-nueva-agenda-profesional",
  templateUrl: "./nueva-agenda-profesional.component.html",
  styleUrls: ["./nueva-agenda-profesional.component.css"],
})
export class NuevaAgendaProfesionalComponent implements OnInit {
  formulario: FormGroup;
  @Input() data: Agenda;
  public loading: boolean = false;
  public respuesta = {
    status: "close",
    data: [],
  };

  constructor(
    private FormBuilder: FormBuilder,
    public _activeModal: NgbActiveModal,
    private _ToastService: ToastService,
    private _UtilService: UtilService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loading = true;
  }

  private buildForm() {
    let id = null;
    let profesional_id = null;
    let profesional = null;
    let start = null;
    let end = null;
    let tipo_agenda = null;

    if (this.data) {
      id = this.data.id;
      profesional_id = this.data.profesional_id;
      profesional = this.data.profesional;
      start = this.data.start;
      end = this.data.end;
      tipo_agenda = this.data.tipo_agenda;
    }

    this.formulario = this.FormBuilder.group({
      id: [id],
      profesional_id: [profesional_id, [Validators.required]],
      profesional: [profesional, [Validators.required]],
      start: [start],
      end: [end, [Validators.required]],
      tipo_agenda: [tipo_agenda, [Validators.required]],
    });
  }

  guardar(event: Event) {
    event.preventDefault();
  }

  closeModal() {
    this._activeModal.close(this.respuesta);
  }
}
