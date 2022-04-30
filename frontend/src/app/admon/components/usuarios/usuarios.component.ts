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
      title: "Nombre",
      data: "name",
      orderable: false,
      searchable: true,
      type: "text",
    },
    {
      title: "Email",
      data: "email",
      orderable: false,
      searchable: false,
      type: "text",
    },
    {
      title: "perfil",
      data: "perfil",
      orderable: false,
      searchable: false,
      type: "text",
    },
    {
      title: "Cédula",
      data: "cedula",
      orderable: false,
      searchable: false,
      type: "text",
    },
    {
      title: "Estado",
      data: "status_des",
      orderable: false,
      searchable: false,
      type: "text",
    },
  ];

  tableConfig = {
    buttons: this.buttons,
    listado_seleccion: true,
    columns: this.columns,
    url: environment.apiUrl + environment.admon.postUsersList,
    globalSearch: false,
    rowSearch: false,
    advancedSearch: true,
    paginatorPosition: "both",
    customFilters: [],
  };

  customFilters: any = []; 
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {}

  agregarUsuario(ev) {}
  editarUsuario(ev) {}
  eliminar(ev) {}
}
