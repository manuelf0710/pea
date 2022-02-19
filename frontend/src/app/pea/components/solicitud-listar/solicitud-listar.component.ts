import {
  Component,
  OnInit,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewEncapsulation,
} from "@angular/core";
import { BgtableComponent } from "src/app/shared/components/bgtable/bgtable.component";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-solicitud-listar",
  templateUrl: "./solicitud-listar.component.html",
  styleUrls: ["./solicitud-listar.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class SolicitudListarComponent implements OnInit {
  @ViewChild(BgtableComponent) dataTableReload: BgtableComponent;
  public loading: boolean = false;

  buttons = {
    acciones: {
      edit: true,
      delete: true,
      copy: false,
      new: true,
    },
    exports: [],
  };

  columns = [
    {
      title: "Id",
      data: "id",
      orderable: false,
      searchable: false,
      type: "text",
    },
    {
      title: "Tipo Producto",
      data: "tipo_producto.name",
      orderable: false,
      searchable: false,
      type: "text",
    },
    {
      title: "cantidad",
      data: "cantidad",
      orderable: false,
      searchable: false,
      type: "text",
    },
    {
      title: "regional",
      data: "regional.nombre",
      orderable: false,
      searchable: false,
      type: "text",
    },
    {
      title: "Contrato",
      data: "contrato.nombre",
      orderable: false,
      searchable: false,
      type: "text",
    },
  ];

  tableConfig = {
    buttons: this.buttons,
    listado_seleccion: true,
    columns: this.columns,
    url: environment.apiUrl + environment.solicitud.getAll,
    globalSearch: false,
    rowSearch: false,
    advancedSearch: true,
    paginatorPosition: "bottom",
    customFilters: [],
  };

  constructor() {}

  ngOnInit(): void {}

  agregarSolicitud(ev) {}
  editarSolicitud(ev) {}
  eliminar(ev) {}
}
