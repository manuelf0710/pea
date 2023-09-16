import { Component, OnInit, LOCALE_ID, Inject, ViewChild } from "@angular/core";
import { formatDate } from "@angular/common";
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventApi,
  FullCalendarComponent,
} from "@fullcalendar/angular";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { INITIAL_EVENTS, createEventId } from "../../event-utils";
import esLocale from "@fullcalendar/core/locales/es";
import { UtilService } from "../../../shared/services/util.service";
import { ToastService } from "../../../shared/services/toast.service";
import { AgendaService } from "../../../services/agenda.service";
import { ComunService } from "../../../services/comun.service";
import { User } from "src/app/auth/models/user";

import { NuevaAgendaProfesionalComponent } from "../generar-agenda/crear/nueva-agenda-profesional/nueva-agenda-profesional.component";
import { environment } from "../../../../environments/environment";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { AuthenticationService } from "src/app/auth/services/authentication.service";
import { map } from "rxjs/operators";

@Component({
  selector: "app-generar-agenda",
  templateUrl: "./generar-agenda.component.html",
  styleUrls: ["./generar-agenda.component.scss"],
})
export class GenerarAgendaComponent implements OnInit {
  public urlProfesionales =
    environment.apiUrl + environment.comun.buscarUsers + "?profile=3";
  //public profesionalSeleccionado = { id: 2, nombre: "Adriana Santis Santois" };
  public profesionalSeleccionado!: { id: number; nombre: String };
  calendarApi: any;
  public startDateView: any;
  public endDateView: any;
  public profesionalesList = [];
  public buscarProfesional = "";
  currentUser: User;

  @ViewChild("calendar") calendarComponent: FullCalendarComponent;

  ngAfterViewInit() {
    this.calendarApi = this.calendarComponent.getApi();
    /*this.startDateView = this.calendarApi.view.currentStart;
    this.endDateView = this.calendarApi.view.currentEnd;*/
    this.formatDateView(this.calendarApi.view);
  }

  public agendaProfesional = [];
  loading: boolean = false;
  calendarVisible = true;
  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
    },
    customButtons: {
      prev: {
        text: "<",
        click: this.getPrevEvents.bind(this),
      },
      next: {
        text: ">",
        click: this.getNextEvents.bind(this),
      },
      dayGridMonth: {
        // this overrides the month button
        text: "Mes",
        click: () => {
          const calendarApi = this.calendarComponent.getApi();
          calendarApi.changeView("dayGridMonth");
          this.changeViewRender();
        },
      },
      timeGridWeek: {
        // this overrides the week button
        text: "Semana",
        click: () => {
          const calendarApi = this.calendarComponent.getApi();
          calendarApi.changeView("timeGridWeek");
          this.changeViewRender();
        },
      },
      timeGridDay: {
        // this overrides the day button
        text: "Día",
        click: () => {
          const calendarApi = this.calendarComponent.getApi();
          calendarApi.changeView("timeGridDay");
          this.changeViewRender();
        },
      },
      listWeek: {
        // this overrides the day button
        text: "Agenda",
        click: () => {
          const calendarApi = this.calendarComponent.getApi();
          calendarApi.changeView("listWeek");
          this.changeViewRender();
        },
      },
    },
    slotDuration: "00:15:00",
    slotLabelInterval: "00:15:00",
    hiddenDays: [6, 0],
    eventOverlap: true,
    droppable: false,
    editable: false,
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
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventAdd: this.handleEventsAdd.bind(this),
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
    private _ComunService: ComunService,
    private _ToastService: ToastService,
    private modalService: NgbModal,
    private authenticationService: AuthenticationService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );

    console.log("this.currentUser.perfil.id => ", this.currentUser);
    this.profesionalSeleccionado = {
      id: this.currentUser.id,
      nombre: this.currentUser.name,
    };

    this.seleccionadoProfesional({ ...this.profesionalSeleccionado });
  }

  ngOnInit(): void {
    this.loadForProfesionales();
  }

  activeLi(id) {
    if (this.profesionalSeleccionado && this.profesionalSeleccionado.id == id) {
      return "active";
    }
  }

  loadForProfesionales() {
    this.loading = true;
    this._ComunService.getUsersAll(3).subscribe(
      (res: any) => {
        this.profesionalesList = res;
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

  validateLoadData() {
    if (this.profesionalSeleccionado && this.calendarComponent) {
      return true;
    } else return false;
  }

  changeViewRender() {
    this.calendarApi = this.calendarComponent.getApi();

    if (this.validateLoadData) this.formatDateView(this.calendarApi.view);
    this.getAgendaProfesional(this.profesionalSeleccionado.id);
  }

  getPrevEvents(arg: any) {
    if (this.validateLoadData) {
      this.calendarApi = this.calendarComponent.getApi();
      this.calendarApi.prev();
      this.formatDateView(this.calendarApi.view);
      this.getAgendaProfesional(this.profesionalSeleccionado.id);
      this.calendarApi.render();
    }
  }
  getNextEvents(arg: any) {
    if (this.validateLoadData) {
      this.calendarApi = this.calendarComponent.getApi();
      this.calendarApi.next();
      this.formatDateView(this.calendarApi.view);
      this.getAgendaProfesional(this.profesionalSeleccionado.id);
      this.calendarApi.render();
    }
  }

  handleMonthChange(info) {
    console.log("informacdión sue ", info);
  }

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
    console.log("handle date select");
    if (this.currentUser.perfil.id == 3) return;

    if (!this.profesionalSeleccionado) {
      this._ToastService.info("debe seleccionar primero un profesional");
      return;
    }

    const calendarApi = selectInfo.view.calendar;

    /*
     * prevent que los eventos se creen desde kla vista mensual
     */

    if (calendarApi.view.type == "dayGridMonth") {
      this._ToastService.info(
        "no se pueden agregar eventos desde la vista mensual"
      );
      return;
    }

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
    let end = calendarApi.formatDate(selectInfo.endStr, {
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
    let info = {
      id: null,
      profesional_id: this.profesionalSeleccionado.id,
      profesional: this.profesionalSeleccionado.nombre,
      start: start,
      start_time: start_time,
      end: end,
      end_time: end_time,
      tipo: null,
      extendedprops: null,
    };

    modalRef.componentInstance.data = info;

    modalRef.result
      .then((result) => {
        if (result.status == "ok") {
          //this.dataTableReload.reload(result.data.data);
          console.log("afuera", result.data.data);
          this.getAgendaProfesional(
            //result.data.data[0].datesList[0].profesional_id
            this.profesionalSeleccionado.id
          );
        }
      })
      .catch((error) => {});
  }

  formatearHora(fecha) {
    let hora = fecha.split(" ");
    return hora[1].split(":")[0] + ":" + hora[1].split(":")[1];
  }

  handleEventClick(clickInfo: EventClickArg) {
    console.log("ingresaste manuelf ", clickInfo.event);

    console.log(
      "clickInfo.event.extendedProps==>",
      clickInfo.event.extendedProps
    );
    if (this.currentUser.perfil.id == 3) {
      window.open(
        "pea/solicitudproductos?id=" +
          clickInfo.event.extendedProps.producto_repso_id +
          "&product_id=" +
          clickInfo.event.extendedProps.producto_id,
        "_blank"
      );
      return;
    }

    console.log("valores ", clickInfo.event.start);
    if (clickInfo.event.extendedProps.origen == "decitasproducto") {
      this._ToastService.info("este evento no se puede editar");
      return;
    }

    const calendarApi = clickInfo.event;

    let start = formatDate(
      clickInfo.event.startStr,
      "dd/MM/yyyy H:m:s",
      this.locale
    );

    let end = formatDate(
      clickInfo.event.endStr,
      "dd/MM/yyyy H:m:s",
      this.locale
    );

    let start_time = this.formatearHora(start);
    let end_time = this.formatearHora(end);

    const modalRef = this.modalService.open(NuevaAgendaProfesionalComponent, {
      backdrop: "static",
      size: "xs",
      keyboard: false,
    });

    let info = {
      id: clickInfo.event.id,
      profesional_id: this.profesionalSeleccionado.id,
      profesional: this.profesionalSeleccionado.nombre,
      start: start.split(" ")[0],
      start_time: start_time,
      end: end.split(" ")[0],
      end_time: end_time,
      tipo: clickInfo.event.extendedProps.tipo,
      extendedprops: clickInfo.event.extendedProps,
    };

    console.log("esta es la infooo ", info);

    modalRef.componentInstance.data = info;

    modalRef.result
      .then((result) => {
        if (result.status == "ok") {
          this.getAgendaProfesional(
            //result.data.data[0].datesList[0].profesional_id
            this.profesionalSeleccionado.id
          );
        }
      })
      .catch((error) => {});
    /*
    if (
      confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      clickInfo.event.remove();
    } */
  }

  formatDateView(dat) {
    this.startDateView = formatDate(
      dat.currentStart,
      "yyyy-MM-dd",
      this.locale
    );
    this.endDateView = formatDate(dat.currentEnd, "yyyy-MM-dd", this.locale);
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
    console.log("los eventos ", this.currentEvents);
    if (this.calendarComponent) {
      this.calendarApi = this.calendarComponent.getApi();
      this.formatDateView(this.calendarApi.view);
    }
  }
  handleEventsAdd(events: any) {
    console.log("nada eventsadd ", events);
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
    this.loading = true;
    this.profesionalSeleccionado = item;
    this.agendaProfesional = [];
    this.getAgendaProfesional(item.id);
  }

  getAgendaProfesional(id) {
    let data = {
      startDateView: this.startDateView,
      endDateView: this.endDateView,
    };
    this.loading = true;
    this._AgendaService.postAgendaProfesional(id, data).subscribe(
      (res: any) => {
        console.log("ladatata ", res.data);
        let dataEvents = [];
        if (this.currentUser.perfil.id == 3) {
          dataEvents = res.data.filter(
            (item) =>
              item.origen.includes("decitasproducto") ||
              item.razon_bloqueo == "tiempo espera"
          );
          this.calendarOptions.events = dataEvents;
          this.agendaProfesional = dataEvents;

          console.log("lso eventos jueppppp", dataEvents);
        } else {
          this.calendarOptions.events = res.data;
          this.agendaProfesional = res.data;
        }
        //        this.calendarOptions.events = res.data;
        //      this.agendaProfesional = res.data;
        this.calendarVisible = true;

        res.status == "ok"
          ? this._ToastService.success(res.msg)
          : this._ToastService.warning(res.msg);

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
}
