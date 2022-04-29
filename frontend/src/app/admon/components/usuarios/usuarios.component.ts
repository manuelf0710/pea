import {
  Component,
  OnInit,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewEncapsulation,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BgtableComponent } from "src/app/shared/components/bgtable/bgtable.component";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-usuarios",
  templateUrl: "./usuarios.component.html",
  styleUrls: ["./usuarios.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class UsuariosComponent implements OnInit {
  @ViewChild(BgtableComponent) dataTableReload: BgtableComponent;
  public loading: boolean = false;

  buttons = {
    acciones: {
      edit: true,
      delete: true,
      copy: {
        label: "programar",
        icon: "fa fa-tasks",
        class: "btn btn-success btn-sm",
      },
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
      data: "tipoproducto.name",
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
    {
      title: "Programador",
      data: "profesional.name",
      orderable: false,
      searchable: false,
      type: "text",
    },
    {
      title: "Descripción",
      data: "descripcion",
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
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {}

  agregarSolicitud(ev) {}
  editarSolicitud(ev) {}
  eliminar(ev) {}
  programar(ev) {
    this.router.navigate(["/pea/solicitudproductos"], {
      queryParams: { id: ev.id },
    });
  }
}
