import { Component, OnInit } from "@angular/core";
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventApi,
} from "@fullcalendar/angular";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { INITIAL_EVENTS, createEventId } from "../../event-utils";
import esLocale from "@fullcalendar/core/locales/es";
import { UtilService } from "../../../shared/services/util.service";
import { ToastService } from "../../../shared/services/toast.service";
import { AgendaService } from "../../../services/agenda.service";
import { NuevaAgendaProfesionalComponent } from "../generar-agenda/crear/nueva-agenda-profesional/nueva-agenda-profesional.component";
import { environment } from "../../../../environments/environment";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";

@Component({
  selector: "app-generar-agenda",
  templateUrl: "./generar-agenda.component.html",
  styleUrls: ["./generar-agenda.component.css"],
})
export class GenerarAgendaComponent implements OnInit {
  public urlProfesionales =
    environment.apiUrl + environment.comun.buscarUsers + "?profile=2";
  public profesionalSeleccionado = { id: 2, nombre: "diana prueba" };
  public agendaProfesional = [];
  loading: boolean = false;
  calendarVisible = true;
  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
    },
    slotDuration: "00:30:00",
    slotLabelInterval: "00:30:00",
    hiddenDays: [6, 0],
    businessHours: {
      // days of week. an array of zero-based day of week integers (0=Sunday)
      daysOfWeek: [1, 2, 3, 4, 5], // Monday - Thursday

      startTime: "07:00:00", // a start time (10am in this example)
      endTime: "17:20:00", // an end time (6pm in this example)
    },
    slotMinTime: "06:00",
    slotMaxTime: "18:00:00",
    slotLabelFormat: [
      {
        hour: "2-digit",
        minute: "2-digit",
        omitZeroMinute: false,
        meridiem: "short",
      },
    ],
    locale: esLocale,
    initialView: "timeGridWeek",
    events: [],
    //initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    //initialEvents: this.loadForProfesional(),
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventAdd: this.handleEvents.bind(this),
    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
  };
  currentEvents: EventApi[] = [];

  constructor(
    private _AgendaService: AgendaService,
    private _UtilService: UtilService,
    private _ToastService: ToastService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {}

  handleCalendarToggle() {
    this.calendarVisible = !this.calendarVisible;
  }

  convertirFecha(fecha) {
    var d = fecha.getDate();
    var m = fecha.getMonth() + 1; //Month from 0 to 11
    var y = fecha.getFullYear();
    return "" + (d <= 9 ? "0" + d : d) + "-" + (m <= 9 ? "0" + m : m) + "-" + y;
  }

  handleWeekendsToggle() {
    const { calendarOptions } = this;
    calendarOptions.weekends = !calendarOptions.weekends;
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    if (!this.profesionalSeleccionado) {
      this._ToastService.info("debe seleccionar primero un profesional");
      return;
    }
    console.log("selectinfo aquiii ", selectInfo);
    const calendarApi = selectInfo.view.calendar;

    let start = calendarApi.formatDate(selectInfo.startStr, {
      month: "2-digit",
      year: "numeric",
      day: "2-digit",
    });

    let start_time = calendarApi.formatDate(selectInfo.startStr, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    let end = calendarApi.formatDate(selectInfo.startStr, {
      month: "2-digit",
      year: "numeric",
      day: "2-digit",
    });

    let end_time = calendarApi.formatDate(selectInfo.endStr, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const modalRef = this.modalService.open(NuevaAgendaProfesionalComponent, {
      backdrop: "static",
      size: "xs",
      keyboard: false,
    });
    console.log("st6art tune time", start_time);
    let info = {
      id: null,
      profesional_id: this.profesionalSeleccionado.id,
      profesional: this.profesionalSeleccionado.nombre,
      start: start,
      start_time: start_time,
      end: end,
      end_time: end_time,
      tipo: null,
    };

    modalRef.componentInstance.data = info;

    modalRef.result
      .then((result) => {
        if (result.status == "ok") {
          //this.dataTableReload.reload(result.data.data);
        }
      })
      .catch((error) => {});

    /*const title = prompt("Please enter a new title for your event");
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
    */
  }

  handleEventClick(clickInfo: EventClickArg) {
    if (
      confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      clickInfo.event.remove();
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  agregarAgenda(ev) {
    console.log("el evento ", ev);
    const modalRef = this.modalService.open(NuevaAgendaProfesionalComponent, {
      backdrop: "static",
      size: "lg",
      keyboard: false,
    });

    modalRef.result
      .then((result) => {
        if (result.status == "ok") {
          //this.dataTableReload.reload(result.data.data);
        }
      })
      .catch((error) => {});
  }

  loadForProfesional() {
    return this.agendaProfesional;
  }

  seleccionadoProfesional(item) {
    this.profesionalSeleccionado = item;
    //this.formulario.get("profesional_id").setValue(item.id);
    this.agendaProfesional = [];
    this._AgendaService.getAgendaProfesional(item.id).subscribe(
      (res: any) => {
        this.calendarVisible = true;
        this.calendarOptions.events = res;
      },
      (error: any) => {},
      () => {}
    );
  }
}
