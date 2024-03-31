import {
  Component,
  OnInit,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewEncapsulation,
} from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Router, ActivatedRoute } from "@angular/router";
import { forkJoin } from "rxjs";
import { BgtableComponent } from "src/app/shared/components/bgtable/bgtable.component";
import { environment } from "src/environments/environment";
import { regional } from "./../../../models/regional";
import { tipoProducto } from "./../../models/tipoproducto";
import { TipoproductosService } from "./../../../services/tipoproductos.service";
import { ComunService } from "src/app/services/comun.service";
import { ToastService } from "./../../../shared/services/toast.service";

import { EditarComponent } from "./editar/editar.component";
import { UtilService } from "../../../shared/services/util.service";
import { ProductosrepsoService } from "../../services/productosrepso.service";
import { User } from "src/app/auth/models/user";
import { AuthenticationService } from "src/app/auth/services/authentication.service";

@Component({
  selector: "app-solicitud-listar",
  templateUrl: "./solicitud-listar.component.html",
  styleUrls: ["./solicitud-listar.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class SolicitudListarComponent implements OnInit {
  @ViewChild(BgtableComponent) dataTableReload: BgtableComponent;
  public loading: boolean = false;
  public renderDataTable: boolean = false;

  public regionales: regional[];
  public tipoProductos: tipoProducto[];
  public odsLista: any[];
  currentUser: User;

  buttons = {
    acciones: {
      edit: true,
      delete: false,
      copy: {
        label: "programar",
        icon: "fa fa-tasks",
        class: "btn btn-success btn-sm",
      },
      new: false,
    },
    exports: [],
  };

  columns = [
    {
      title: "Id",
      data: "id",
      orderable: false,
      searchable: true,
      type: "text",
    },
    {
      title: "Tipo Producto",
      data: "tipoproducto",
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
      data: "contrato",
      orderable: false,
      searchable: false,
      type: "text",
    },
    {
      title: "Programador",
      data: "profesional",
      orderable: false,
      searchable: false,
      type: "text",
    },
    {
      title: "Descripción",
      data: "descripcion",
      orderable: false,
      searchable: true,
      type: "text",
    },
    {
      title: "Grupal",
      data: "grupal_des",
      orderable: false,
      searchable: true,
      type: "text",
    },
  ];

  tableConfig;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _TipoproductosService: TipoproductosService,
    private _ComunService: ComunService,
    private modalService: NgbModal,
    private _ToastService: ToastService,
    private _UtilService: UtilService,
    private _ProductosrepsoService: ProductosrepsoService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => {
      this.currentUser = x;
      this.buttons.acciones.edit =
        this.currentUser.perfil.id == 1 ? true : false;
    });
  }

  ngOnInit(): void {
    forkJoin([
      this._TipoproductosService.getLista(),
      this._ComunService.getRegionales(),
      this._ComunService.getOrdenesServicio(),
    ]).subscribe(([tipoProductos, regionales, odsLista]) => {
      this.regionales = regionales;
      this.tipoProductos = tipoProductos;
      this.odsLista = odsLista;
      this.loading = false;
      this.initializeDataTable();
    });
  }

  initializeDataTable() {
    this.tableConfig = {
      buttons: this.buttons,
      listado_seleccion: true,
      columns: this.columns,
      url: environment.apiUrl + environment.solicitud.getAll,
      globalSearch: false,
      rowSearch: false,
      advancedSearch: true,
      paginatorPosition: "bottom",
      customFilters: [
        {
          title: "regional",
          value: "",
          key: "regional",
          type: "select",
          options: this.regionales,
        },
        {
          title: "Tipo Producto",
          value: "",
          key: "tipoproducto",
          type: "select",
          options: this.tipoProductos,
        },
        {
          title: "Ods",
          value: "",
          key: "ods",
          type: "select",
          options: this.odsLista,
        },
      ],
    };
  }

  agregarSolicitud(ev) {}
  editarSolicitud(solicitud) {
    const modalRef = this.modalService.open(EditarComponent, {
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
  eliminar(data) {
    this._UtilService
      .confirm({
        title: "Eliminar Registro",
        message: "Seguro que desea eliminar este registro?",
      })
      .then(
        () => {
          //console.log('deleting...');
          this._ProductosrepsoService.eliminar(data.id).subscribe(
            (result: any) => {
              if (result["code"] == 200) {
                this.dataTableReload.reload(result.data);
                this._ToastService.success(result.msg + " Correctamente");
              }
            },
            (error) => {
              console.log("el error fue ", error);
            }
          );
        },
        () => {
          //console.log('not deleting...');
        }
      );
  }
  programar(ev) {
    this.router.navigate(["/pea/solicitudproductos"], {
      queryParams: { id: ev.id },
    });
  }
}
