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
import { NuevaAgendaProfesionalComponent } from "../generar-agenda/crear/nueva-agenda-profesional/nueva-agenda-profesional.component";

@Component({
  selector: "app-generar-agenda",
  templateUrl: "./generar-agenda.component.html",
  styleUrls: ["./generar-agenda.component.css"],
})
export class GenerarAgendaComponent implements OnInit {
  calendarVisible = true;
  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
    },
    slotDuration: "00:10:00",
    slotLabelInterval: "00:10:00",
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
        hour: "numeric",
        minute: "2-digit",
        omitZeroMinute: false,
        meridiem: "short",
      },
    ],
    locale: esLocale,
    initialView: "dayGridMonth",
    initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
  };
  currentEvents: EventApi[] = [];

  constructor(
    private _UtilService: UtilService,
    private _ToastService: ToastService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {}

  handleCalendarToggle() {
    this.calendarVisible = !this.calendarVisible;
  }

  handleWeekendsToggle() {
    const { calendarOptions } = this;
    calendarOptions.weekends = !calendarOptions.weekends;
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    console.log("selectinfo ", selectInfo);

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
}
