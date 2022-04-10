import { Component, OnInit, Input } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
import { NgbActiveModal, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";
import { AgendaService } from "src/app/services/agenda.service";
import { ToastService } from "src/app/shared/services/toast.service";
import { UtilService } from "src/app/shared/services/util.service";

@Component({
  selector: "app-nuevacita",
  templateUrl: "./nuevacita.component.html",
  styleUrls: ["./nuevacita.component.css"],
})
export class NuevacitaComponent implements OnInit {
  formulario: FormGroup;
  @Input() data: any;
  public loading: boolean = false;
  public respuesta = {
    status: "close",
    data: [],
  };
  public start_time!: NgbTimeStruct;
  public end_time!: NgbTimeStruct;
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
    let start = null;
    let start_time = null;
    let end = null;
    if (this.data) {
      console.log("la data ", this.data);

      start = this.data.cita.onlydate;
      end = this.data.cita.onlydate;
      let onlyTimeStart = this.data.cita.start.split(" ")[1];
      start_time = {
        hour: onlyTimeStart.split(":")[0],
        minute: onlyTimeStart.split(":")[1],
      };

      let start_timeVar = {
        hour: parseInt(onlyTimeStart.split(":")[0]),
        minute: parseInt(onlyTimeStart.split(":")[1]),
        second: 0,
      };

      this.start_time = { ...start_timeVar };

      let onlyTimeEnd = this.data.cita.end.split(" ")[1];

      /*let end_timeVar = {
        hour: parseInt(this.data.end_time.split(":")[0]),
        minute: parseInt(this.data.end_time.split(":")[1]),
        second: 0,
      };

      this.end_time = { ...end_timeVar }; */
    }

    this.formulario = this.FormBuilder.group({
      id: [id],
      start: [start],
      start_time: [start_time],
      end: [end, [Validators.required]],
      end_time: [null, [Validators.required]],
    });
  }

  closeModal() {
    this._activeModal.close(this.respuesta);
  }

  guardar(event: Event) {
    event.preventDefault();
    if (this.formulario.valid) {
      let value = {
        ocupado: 2,
        producto_id: this.data.persona.id,
        profesional_id: this.data.cita.profesional_id,
        agenda_id: this.data.cita.agenda_id,
        ...this.formulario.value,
        ...this.data,
      };

      value.start = this._UtilService.formatearFechaGuardar(
        value.start,
        value.start_time
      );
      value.end = this._UtilService.formatearFechaGuardar(
        value.end,
        value.end_time
      );
      console.log("la data adata ", this.data);
      console.log("el valor para guardar ", value);
      this._UtilService
        .confirm({
          title: "Guardar Cita",
          message: "Seguro que desea guardar esta cita?",
        })
        .then(
          () => {
            this.loading = true;

            this._AgendaService.postCita(value).subscribe((res: any) => {
              if (res.status == "ok") {
                this.respuesta = { status: "ok", data: res };
                this._ToastService.success(res.msg);
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
  /*
   * validarTiempoCita Validar que el tiempo ingresado en la cita no sea superior o inferior a lo permitido y que el tiempo en minutos sea el correcto
   */
  validarTiempoCita() {}
}
