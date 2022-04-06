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

      let end_timeVar = {
        hour: parseInt(this.data.end_time.split(":")[0]),
        minute: parseInt(this.data.end_time.split(":")[1]),
        second: 0,
      };

      this.end_time = { ...end_timeVar };
    }

    this.formulario = this.FormBuilder.group({
      id: [id],
      start: [start],
      start_time: [start_time],
      end: [end, [Validators.required]],
      end_time: [],
    });
  }

  closeModal() {
    this._activeModal.close(this.respuesta);
  }

  guardar(event: Event) {
    event.preventDefault();
  }
}
