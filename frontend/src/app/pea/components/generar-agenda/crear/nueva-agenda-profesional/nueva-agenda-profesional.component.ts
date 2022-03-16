import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";

import { ToastService } from "../../../../../shared/services/toast.service";
import { UtilService } from "src/app/shared/services/util.service";
import { AgendaService } from "../../../../../services/agenda.service";

export interface Agenda {
  id?: number;
  profesional_id?: number;
  profesional?: String;
  start: String;
  end: String;
  tipo?: number;
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
  @Input() data: any;
  public loading: boolean = false;

  public start_time!: NgbTimeStruct;
  public end_time!: NgbTimeStruct;
  public respuesta = {
    status: "close",
    data: [],
  };
  tiposLista = [
    {
      id: 1,
      nombre: "Disponible",
    },
    {
      id: 2,
      nombre: "Bloqueo",
    },
    {
      id: 3,
      nombre: "Informe",
    },
  ];

  constructor(
    private FormBuilder: FormBuilder,
    public _activeModal: NgbActiveModal,
    private _ToastService: ToastService,
    private _UtilService: UtilService,
    private _AgendaService: AgendaService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loading = false;
  }

  private buildForm() {
    let id = null;
    let profesional_id = null;
    let profesional = null;
    let start = null;
    let start_time = null;
    let end = null;
    let tipo = null;

    if (this.data) {
      id = this.data.id;
      profesional_id = this.data.profesional_id;
      profesional = this.data.profesional;
      start = `${parseInt(this.data.start.split("/")[2])}-${parseInt(
        this.data.start.split("/")[1]
      )}-${parseInt(this.data.start.split("/")[0])}`;
      end = `${parseInt(this.data.end.split("/")[2])}-${parseInt(
        this.data.end.split("/")[1]
      )}-${parseInt(this.data.end.split("/")[0])}`;
      tipo = this.data.tipo;
      start_time = {
        hour: this.data.start_time.split(":")[0],
        minute: this.data.start_time.split(":")[1],
      };
    }

    let start_timeVar = {
      hour: parseInt(this.data.start_time.split(":")[0]),
      minute: parseInt(this.data.start_time.split(":")[1]),
      second: 0,
    };

    this.start_time = { ...start_timeVar };

    let end_timeVar = {
      hour: parseInt(this.data.end_time.split(":")[0]),
      minute: parseInt(this.data.end_time.split(":")[1]),
      second: 0,
    };

    this.end_time = { ...end_timeVar };

    this.formulario = this.FormBuilder.group({
      id: [id],
      profesional_id: [profesional_id, [Validators.required]],
      profesional: [profesional, [Validators.required]],
      start: [start],
      start_time: [start_time],
      end: [end, [Validators.required]],
      end_time: [],
      tipo: [tipo, [Validators.required]],
    });
  }

  formatearFechaGuardar(fecha, horas) {
    return fecha + " " + horas.hour + ":" + horas.minute + ":" + horas.second;
  }

  guardar(event: Event) {
    event.preventDefault();
    if (this.formulario.valid) {
      let value = {
        ...this.formulario.value,
      };

      value.start = this.formatearFechaGuardar(value.start, value.start_time);
      value.end = this.formatearFechaGuardar(value.end, value.end_time);

      this._UtilService
        .confirm({
          title: "Guardar Agenda",
          message: "Seguro que desea guardar esta agenda?",
        })
        .then(
          () => {
            this.loading = true;

            this._AgendaService
              .postAgenda(this.formulario.get("profesional_id").value, value)
              .subscribe((res: any) => {
                if (res.status == "ok") {
                  this.respuesta = { status: "ok", data: res };
                  this._ToastService.success(
                    "agenda " + res.msg + " correctamente"
                  );
                }
                if (res.status == "error") {
                  let messageError = this._ToastService.errorMessage(res.msg);
                  this._ToastService.danger(messageError);
                }
                this.loading = false;
              });
          },
          () => {
            this.loading = false;
          }
        );
    } else {
      this.formulario.markAllAsTouched();
    }
  }

  closeModal() {
    this._activeModal.close(this.respuesta);
  }
}
