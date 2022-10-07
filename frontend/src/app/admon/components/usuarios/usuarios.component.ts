import {
  Component,
  OnInit,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewEncapsulation,
} from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Router, ActivatedRoute } from "@angular/router";
import { BgtableComponent } from "src/app/shared/components/bgtable/bgtable.component";
import { ToastService } from "src/app/shared/services/toast.service";
import { environment } from "src/environments/environment";
import { CrearusuarioComponent } from "./crear/crearusuario/crearusuario.component";

@Component({
  selector: "app-usuarios",
  templateUrl: "./usuarios.component.html",
  styleUrls: ["./usuarios.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class UsuariosComponent implements OnInit {
  @ViewChild(BgtableComponent) dataTableReload: BgtableComponent;
  public loading: boolean = false;
  public renderDataTable: boolean = false;

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
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _ToastService: ToastService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {}

  agregarUsuario(ev) {
    const modalRef = this.modalService.open(CrearusuarioComponent, {
      backdrop: "static",
      size: "lg",
      keyboard: false,
    });

    modalRef.result
      .then((result) => {
        if (result.status == "ok") {
          this.dataTableReload.reload(result.data.data);
        }
      })
      .catch((error) => {});
  }

  editarUsuario(solicitud) {
    const modalRef = this.modalService.open(CrearusuarioComponent, {
      //backdrop: 'static',
      size: "lg",
      keyboard: false,
    });

    modalRef.componentInstance.data = solicitud;

    modalRef.result
      .then((result) => {
        if (result.status == "ok") {
          this.dataTableReload.reload(result.data.data);
          this._ToastService.success("Registro editado correctamente");
        }
      })
      .catch((error) => {});
  }
  eliminar(ev) {}
}
