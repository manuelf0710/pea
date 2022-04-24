import { Component, OnInit, Input } from "@angular/core";
import {
  ValidatorFn,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
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
  public daysRepeat = [
    { id: 1, name: "Lun", nameLong: "Lunes", visible: true, checked: false },
    { id: 2, name: "Mar", nameLong: "Martes", visible: true, checked: false },
    { id: 3, name: "Mi", nameLong: "Miercoles", visible: true, checked: false },
    { id: 4, name: "Jue", nameLong: "Jueves", visible: true, checked: false },
    { id: 5, name: "Vi", nameLong: "viernes", visible: true, checked: false },
    //{ id: 6, name: "Sa", nameLong: "Sabado", visible: false, checked: false },
  ];

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
    this.setUserCategoryValidators();
  }

  get ordersFormArray() {
    return this.formulario.controls.daysRepeat as FormArray;
  }

  private buildForm() {
    let id = null;
    let profesional_id = null;
    let profesional = null;
    let start = null;
    let start_time = null;
    let end = null;
    let tipo = null;
    let repeat_end = null;
    let razon_bloqueo = null;

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
      razon_bloqueo: [razon_bloqueo],
      daysRepeat: new FormArray([]),
      repeat_end: [end],
    });
    this.addCheckboxes();
  }

  private addCheckboxes() {
    this.daysRepeat.forEach(() =>
      this.ordersFormArray.push(new FormControl(false))
    );
  }

  setUserCategoryValidators() {
    const razon_bloqueo = this.formulario.get("razon_bloqueo");
    this.formulario.get("tipo").valueChanges.subscribe((tipoSeleccionado) => {
      if (tipoSeleccionado > 1) {
        razon_bloqueo.setValidators([
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(25),
        ]);
      } else {
        razon_bloqueo.setValidators(null);
      }
      razon_bloqueo.updateValueAndValidity();
    });
  }

  guardar(event: Event) {
    event.preventDefault();
    if (this.formulario.valid) {
      const selectedDays = this.formulario.value.daysRepeat
        .map((checked, i) => (checked ? this.daysRepeat[i].id : null))
        .filter((v) => v !== null);

      let value = {
        ...this.formulario.value,
        selectedDays: selectedDays,
      };
      value.start = this._UtilService.formatearFechaGuardar(
        value.start,
        value.start_time
      );
      value.end = this._UtilService.formatearFechaGuardar(
        value.end,
        value.end_time
      );

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
                  this.formulario.patchValue({
                    id: res.data[0].id,
                  });
                }
                if (res.status == "error") {
                  let messageError = this._ToastService.errorMessage(res.msg);
                  this._ToastService.danger(messageError);
                }
                if (res.status == "errorocupado" || res.status == "errortime") {
                  this._ToastService.warning(res.msg);
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
