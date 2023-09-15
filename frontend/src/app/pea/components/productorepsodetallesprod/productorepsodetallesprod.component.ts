import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { forkJoin } from "rxjs";
import { environment } from "src/environments/environment";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { productoRepso } from "../../models/productoRepso";
import { ProductosrepsoService } from "../../services/productosrepso.service";
import { ProductoService } from "../../services/producto.service";
import { ClienteService } from "src/app/services/cliente.service";
import { AgendaService } from "./../../../services/agenda.service";
import { ToastService } from "src/app/shared/services/toast.service";
import { AuthenticationService } from "./../../../auth/services/authentication.service";
import { ComunService } from "./../../../services/comun.service";

import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NuevacitaComponent } from "./nuevacita/nuevacita.component";
import { PersonaSolicitudComponent } from "./personasolicitud/personasolicitud.component";

import { User } from "src/app/auth/models/user";
import { listaItems } from "./../../../models/listaItems";
import { estadoSeguimiento } from "../../../models/estadoSeguimiento";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";

import { UtilService } from "./../../../shared/services/util.service";
//import dayjs from "dayjs";
import { Solicitud } from "../../models/solicitud";

import { ComentariosComponent } from "../comentarios/comentarios.component";

export interface gestionPersona {
  id: number;
  cedula: number;
  estado: String;
  estado_id: number;
  estadocopia_id: number;
  nombre: String;
  dependencia: String;
  email: String;
  telefono: String;
  division: String;
  subdivision: String;
  cargo: String;
  direccion: String;
  barrio: String;
  otrosi: String;
  modalidad: String;
  descripcion: String;
  numero_citas: String;
  fecha_seguimiento: String;
  estadoseguimiento_id: number;
  comentarios: String;
  ciudad: String;
  pyp_ergonomia: String;
  profesional_id: String;
}

export interface agendasDisponiblesProfesionales {
  minutes: number;
  start: String;
  end: String;
  onlydate: String;
  agenda_id: number;
  profesional_id: number;
  nombre: String;
}

export interface countAgendaProfesional {
  profesional_id: number;
  numcitas: number;
  fecha: String;
  fechainfo: String;
  name: String;
  tipo_producto: String;
  tipoproducto_id: number;
}

export interface agendasListaInfo {
  originalData: countAgendaProfesional[];
  view: String;
  totalMonth: number;
  todalDay: number;
  searchDate: String;
}

export interface infoAgendasByDate {
  originalData: countAgendaProfesional[];
  view: String;
  totalMonth: number;
  todalDay: number;
  searchDate: String;
}

export interface tipoProducto {
  tipo_producto: String;
  tipoproducto_id: number;
  current: Boolean;
  active: Boolean;
}
export interface displayCountCitas {
  all: Boolean;
  profesional: Boolean;
  fecha: Boolean;
  tipoProducto: boolean;
}

@Component({
  selector: "app-productorepsodetallesprod",
  templateUrl: "./productorepsodetallesprod.component.html",
  styleUrls: ["./productorepsodetallesprod.component.scss"],
})
export class ProductorepsodetallesprodComponent
  implements OnInit, AfterViewInit
{
  id!: number;
  odsDetalles: productoRepso;
  productosLista: any[];
  /*
   * base que tiene todos los estados
   */
  estadosLista: listaItems[];
  /*
   * controla los estados que son visibles de acuerdo a la manipulacion del estado que tiene el producto
   */
  estadosListaProceso: listaItems[] = [];
  estadosListaSeguimiento: estadoSeguimiento[];
  tipoProductoLista: tipoProducto[];
  loading: boolean = true;
  mostrarRegistro: boolean = false;
  mostrarCargaExcel: boolean = false;
  mostrarFiltros: boolean = true;
  formulario: FormGroup;
  formularioArchivo: FormGroup;
  formularioFiltro: FormGroup;
  searchForm: FormGroup;
  public archivoscargados: any[] = [];
  urlSubidaArchivo!: String;
  active: number = 1;
  personaGestion!: gestionPersona;
  countAgendas: countAgendaProfesional[] = [];
  countAgendasLista: countAgendaProfesional[] = [];
  displayCountCitas!: displayCountCitas;
  agendasDisponibles: MatTableDataSource<agendasDisponiblesProfesionales>;
  @ViewChild("contentModalProductos") contentModalProductos;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  currentUser: User;

  public pageSize: number;
  public currentPage: number;
  public totalRecords: number;
  public from: number;
  public to: number;
  public pageLength = [10, 20, 50, 100];
  /*
   * Perfiles con permiso para cargar excel
   */
  public arrayPermisoCargueExcel = [1, 2];
  public permisoCargueExcel: boolean = false;
  public showButtonInformacionProgramacion: boolean = false;
  public statsProductoRepso = { totalProductos: 0, totalEjecutados: 0 };

  displayedColumns: string[] = [
    "profesional",
    "fechacita",
    "horacita",
    "action",
  ];

  profesionalsearch = "";
  fechacitasearch = "";
  fechacitadatesearch = "";
  horacitadatesearch = "";

  constructor(
    private _ToastService: ToastService,
    private FormBuilder: FormBuilder,
    private _ComunService: ComunService,
    private _ProductosrepsoService: ProductosrepsoService,
    private _ProductoService: ProductoService,
    private _ClienteService: ClienteService,
    private _AgendaService: AgendaService,
    private _UtilService: UtilService,
    private modalService: NgbModal,
    private readonly route: ActivatedRoute,
    private authenticationService: AuthenticationService
  ) {
    this.displayCountCitas = {
      all: false,
      fecha: false,
      profesional: true,
      tipoProducto: true,
    };
    this.pageSize = 50;
    this.currentPage = 1;
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    /*console.log("productorepsodetallescomponent ",this.currentUser);
    console.log("productorepsodetallescomponent profileId ",this.currentUser.perfil.id);*/
    this.permisoCargueExcel = this.arrayPermisoCargueExcel.includes(
      this.currentUser.perfil.id
    );
  }

  setDataSourceAttributes() {
    if (this.agendasDisponibles !== undefined) {
      this.agendasDisponibles.paginator = this.paginator;
    }
  }

  ngAfterViewInit(): void {
    //this.agendasDisponibles.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.buildForm();
    this.route.queryParams.subscribe((params: Params) => {
      this.id = params["id"];
      this.initLoadData();
      this.urlSubidaArchivo =
        environment.apiUrl +
        environment.imports.importExcelToProductRepso +
        this.id;
    });
    this.setComentarioCancelacionValidators();
  }

  setComentarioCancelacionValidators() {
    const comentarioCancelacion = this.formulario.get("comentario_cancelacion");
    this.formulario
      .get("estado_programacion")
      .valueChanges.subscribe((estado_programacion) => {
        if (estado_programacion == 10 || estado_programacion == 11) {
          comentarioCancelacion.setValidators([
            Validators.required,
            Validators.minLength(5),
          ]);
        } else {
          comentarioCancelacion.setValidators(null);
        }
        comentarioCancelacion.updateValueAndValidity();
      });
  }

  private buildForm() {
    this.formulario = this.FormBuilder.group({
      id: [null],
      cedula: ["", [Validators.required]],
      nombre: ["", [Validators.required]],
      dependencia: [null],
      dependencia_id: [null],
      email: [null],
      telefono: [null],
      division: [null],
      subdivision: [null],
      cargo: [null],
      direccion: [null],
      ciudad: [null],
      ciudad_id: [null],
      barrio: [null],
      otrosi: [null],

      fecha_ingreso: [null],
      modalidad: ["", [Validators.required]],
      descripcion: [""],
      numero_citas: [null],
      fecha_seguimiento: [null],
      estado_seguimiento: [null],
      estado_id: [null],
      estado_programacion: [null],
      comentario_cancelacion: [null],
      comentarios: [null],
      pyp_ergonomia: [""],
      profesionalsearch: [""],
      fechadisponiblesearch: [""],
    });

    this.formularioArchivo = this.FormBuilder.group({
      id: [this.id],
      archivo: ["", [Validators.required]],
      forzarCargue: ["No"],
    });

    this.formularioFiltro = this.FormBuilder.group({
      dependencia: [""],
      cedula: [""],
      nombre: [""],
      estado: [""],
      estado_seguimiento: [""],
      modalidad: [""],
    });

    this.searchForm = this.FormBuilder.group({
      profesionalsearch: [""],
      fechacitasearch: [""],
      fechacitadatesearch: [""],
      horacitadatesearch: [""],
    });
  }

  loadProductosBySolicitud(id: any, data: any) {
    this.loading = true;
    this._ProductoService
      .getProductosBySolicitud(id, {
        ...data,
      })
      .subscribe((data) => {
        this.productosLista = data.data;
        this.loading = false;
      });
  }

  initLoadData() {
    this.loading = true;

    forkJoin([
      this._ProductosrepsoService.getSolicitudById(this.id),
      this._ProductoService.getProductosBySolicitud(this.id, {
        ...this.formularioFiltro.value,
      }),
      this._ComunService.getListasEstadosByPerfil(2),
      this._ComunService.getEstadosAll(),
      this._ProductosrepsoService.getSolicitudStatsById(this.id),
    ]).subscribe(
      ([
        odsDetalles,
        productosLista,
        estadosLista,
        estadosListaSeguimiento,
        statsSolicitud,
      ]) => {
        this.odsDetalles = odsDetalles;
        this.productosLista = productosLista.data;
        this.estadosLista = estadosLista;
        this.estadosListaSeguimiento = estadosListaSeguimiento;
        console.log("los estados lista ", this.estadosLista);

        this.totalRecords = productosLista.total;
        this.from = productosLista.from;
        this.to = productosLista.to;
        this.statsProductoRepso = statsSolicitud;

        this.loading = false;
      }
    );
  }

  pageChange(pag) {
    this.loadProductosBySolicitud(
      this.id + "?page=" + pag + "&pageSize=" + this.pageSize,
      { ...this.formularioFiltro.value }
    );
  }
  public onChangePaginationSize() {
    this.currentPage = 1;
    this.loadProductosBySolicitud(
      this.id + "?page=1&pageSize=" + this.pageSize,
      { ...this.formularioFiltro.value }
    );
  }

  agregarRegistro() {
    //this.mostrarRegistro = true
    this.mostrarRegistro = !this.mostrarRegistro;
  }

  manejadorOptionsSelect(arrayItems, arrayIncludes) {
    console.log("aarrayitems ", arrayItems);
    this.estadosListaProceso = [];
    arrayItems.map((item) => {
      if (arrayIncludes.includes(item.id)) {
        this.estadosListaProceso.push(item);
      }
    });
  }

  manejadorFilterSelect(arregloPermitidos) {
    let arrayItems;
    arrayItems = this.estadosLista.filter((item) =>
      arregloPermitidos.includes(item.id)
    );

    this.estadosListaProceso = [];
    arrayItems.map((item) => {
      if (arregloPermitidos.includes(item.id)) {
        this.estadosListaProceso.push(item);
      }
    });
  }

  poblarDatosSelectEstado(value) {
    /*
     * si es estado ejecutado
     */
    let array_vacio;
    if (value == 8) {
      /**ejecutado */
      let arregloPermitidos = [9];
      array_vacio = this.manejadorFilterSelect(arregloPermitidos);
    } else if (value == 7) {
      /*citado */
      let arregloPermitidosCita = [8, 10, 11];
      array_vacio = this.manejadorFilterSelect(arregloPermitidosCita);
    } else if (value == 9) {
      let arregloPermitidosOther = [9]; /**informe */
      array_vacio = this.manejadorFilterSelect(arregloPermitidosOther);
    } else if (value == 10) {
      /**cancelado */
      let arregloPermitidosOther = [11];
      array_vacio = this.manejadorFilterSelect(arregloPermitidosOther);
    } else if (value == 11) {
      /**cancelado reprogramado */
      let arregloPermitidosOther = [11, 8];
      array_vacio = this.manejadorFilterSelect(arregloPermitidosOther);
    } else if (value == 12) {
      /**Registrado */
      let arregloPermitidosOther = [7, 10];
      array_vacio = this.manejadorFilterSelect(arregloPermitidosOther);
    }
  }

  eliminarProductoFromArray() {}

  eliminarProgramacion(data) {
    this._UtilService
      .confirm({
        title: "Eliminar Registro",
        message: "Seguro que desea eliminar este registro?",
      })
      .then(
        () => {
          //console.log('deleting...');
          this._ProductoService.eliminar(data.id).subscribe(
            (result: any) => {
              if (result["code"] == 200) {
                this._ToastService.success(result.msg + " Correctamente");
                let arrayItems;
                arrayItems = this.productosLista.filter((item) => {
                  return item.id !== data.id;
                });
                this.productosLista = arrayItems;
              }
            },
            (error) => {
              console.log("el error fue ", error);
              this._ToastService.errorMessage(
                "se ha presentado un error " + error
              );
            }
          );
        },
        () => {
          //console.log('not deleting...');
        }
      );
  }

  gestionProgramacion(item) {
    this.formulario.reset();
    this.showButtonInformacionProgramacion = false;
    this.estadosListaProceso = [];
    setTimeout(() => {
      console.log("elvalord e item select ", item);
      this.mostrarRegistro = !this.mostrarRegistro;
      if (this.personaGestion === undefined) {
        this.personaGestion = item;
      }
      if (this.personaGestion.cedula != item.cedula) {
        this.personaGestion = item;
        this.mostrarRegistro = true;
      }

      this.poblarDatosSelectEstado(item.estado_id);

      //this.mostrarRegistro == true ? this.agendaDisponibleProfesionales() : "";
      const estadosDisponiblesAgendamiento = [11, 12];

      console.log("registropersona ", this.personaGestion);
      console.log("valor de mostrar registro ", this.mostrarRegistro);
      console.log("item estado_id ", item.estado_id);
      console.log(
        "el includes ",
        estadosDisponiblesAgendamiento.includes(parseInt(item.estado_id))
      );
      console.log("estadosdisponibles ", estadosDisponiblesAgendamiento);
      if (
        estadosDisponiblesAgendamiento.includes(parseInt(item.estado_id)) &&
        this.mostrarRegistro
      ) {
        this.agendaDisponibleProfesionales();
      } else {
        console.log("entra en agendasdisponibles null");
        //this.agendasDisponibles = null;
      }
      console.log("agendas dipooonibles ", this.agendasDisponibles);
      this.setvaluesFormulario();
    }, 200);
  }

  setvaluesFormulario() {
    this.formulario.patchValue({
      id: this.personaGestion.id,
      nombre: this.personaGestion.nombre,
      cedula: this.personaGestion.cedula,
      dependencia: this.personaGestion.dependencia,
      email: this.personaGestion.email,
      telefono: this.personaGestion.telefono,
      division: this.personaGestion.division,
      subdivision: this.personaGestion.subdivision,
      cargo: this.personaGestion.cargo,
      direccion: this.personaGestion.direccion,
      ciudad: this.personaGestion.ciudad,
      barrio: this.personaGestion.barrio,
      otrosi: this.personaGestion.otrosi,
      modalidad: this.personaGestion.modalidad,
      descripcion: this.personaGestion.descripcion,
      numero_citas: this.personaGestion.numero_citas,
      fecha_seguimiento: this.personaGestion.fecha_seguimiento,
      estado_seguimiento: this.personaGestion.estadoseguimiento_id,
      estado_id: this.personaGestion.estado_id,
      estado_programacion: this.personaGestion.estado_id,
      comentarios: this.personaGestion.comentarios,
      pyp_ergonomia: this.personaGestion.pyp_ergonomia,
    });
  }

  openCargaExcel() {
    this.mostrarCargaExcel = !this.mostrarCargaExcel;
    this.mostrarCargaExcel == true ? (this.mostrarFiltros = false) : true;
  }
  filtrar() {
    this.mostrarFiltros = !this.mostrarFiltros;
    this.mostrarFiltros == true ? (this.mostrarCargaExcel = false) : true;
  }

  importExcel() {}

  getArchivos(archivos_upload) {
    /*archivos subidos, desde fileuploadcomponent */
    this.archivoscargados = archivos_upload;
    console.log("algo paso", this.archivoscargados);
    this.formularioArchivo
      .get("archivo")
      .setValue(this.archivoscargados[0]["path"]);

    if (this.archivoscargados.length > 0) {
      this._ToastService.info("archivo cargado y procesando datos...");
      this.procesarDatosExcel();
    }
  }

  procesarDatosExcel() {
    console.log(
      "el valor del archivo ",
      this.formularioArchivo.get("archivo").value
    );
    console.log(
      "el valor del forzarCague ",
      this.formularioArchivo.get("forzarCargue").value
    );
    console.log(
      "el valor del forzarCague2 ",
      this.formularioArchivo.value.forzarCargue
    );
    this._ProductoService
      .procesarExcelBySolicitud(this.id, {
        nombrearchivo: this.formularioArchivo.value.archivo,
        ...this.odsDetalles,
        forzarCargue: this.formularioArchivo.value.forzarCargue,
      })
      .subscribe((res: any) => {
        if (res.status == "error") {
          this._ToastService.danger(res.msg);
        }
        if (res.code == 200) {
          console.log("personas repetidas ", res.data.clientesOtrasSolicitudes);
          this.mostrarCargaExcel = false;
          if (res.data.clientesOtrasSolicitudes.length > 0) {
            this.simpleModal(res.data.clientesOtrasSolicitudes);
          } else {
            this._ToastService.success(res.msg);
          }

          this._ProductoService
            .getProductosBySolicitud(this.id, {})
            .subscribe((data) => {
              this.productosLista = data.data;
            });
        }
      });
  }

  simpleModal(infoPersonas) {
    const modalRef = this.modalService.open(PersonaSolicitudComponent, {
      backdrop: "static",
      size: "xs",
      keyboard: false,
    });
    const newInfoPersonas = infoPersonas.flatMap((subArray) => subArray);
    modalRef.componentInstance.data = {
      info: newInfoPersonas,
    };

    modalRef.result
      .then((result) => {
        if (result.status == "ok") {
        }
      })
      .catch((error) => {});
  }

  buscarCedula(event: Event) {
    if (event["key"] === "Enter") {
      if (this.formulario.get("cedula").value > 0) {
        this._ClienteService
          .getClienteByCedula(this.formulario.get("cedula").value)
          .subscribe((resp: any) => {
            //this.formulario.get("nombre").setValue(resp.nombre);
            this.formulario.patchValue({
              nombre: resp.nombre,
              correo: resp.email,
              division: resp.division,
            });
          });
      }
    }
  }

  countListaFilterByProfesional(profesional: number) {
    const activeItem = this.tipoProductoLista.find((item) => item.active);

    const selectedItem =
      activeItem || this.tipoProductoLista.find((item) => item.current);
    const resultadoFiltrado = this.countAgendas.filter(
      (item) =>
        item.tipoproducto_id === selectedItem.tipoproducto_id &&
        item.profesional_id === profesional
    );
    this.displayCountCitas.fecha = true;
    this.countAgendasLista = resultadoFiltrado;
  }

  countAgendasListaAddData() {
    const activeItem = this.tipoProductoLista.find((item) => item.active);

    const selectedItem =
      activeItem || this.tipoProductoLista.find((item) => item.current);

    /*const resultadoFiltrado = this.countAgendas.filter(
      (item) => item.tipoproducto_id === selectedItem.tipoproducto_id
    );*/
    const resultadoFiltrado = this.countAgendas.reduce((result, item) => {
      if (item.tipoproducto_id === selectedItem.tipoproducto_id) {
        const existingItem = result.find(
          (group) => group.profesional_id === item.profesional_id
        );
        if (existingItem) {
          existingItem.numcitas += item.numcitas;
        } else {
          result.push({
            profesional_id: item.profesional_id,
            name: item.name,
            tipo_producto: item.tipo_producto,
            tipoproducto_id: item.tipoproducto_id,
            numcitas: item.numcitas,
            fecha: item.fecha,
            fechainfo: item.fechainfo,
          });
        }
      }
      return result;
    }, []);
    this.displayCountCitas.fecha = false;
    this.countAgendasLista = resultadoFiltrado;
  }

  infoCountAgendas() {
    let resultado = [];
    console.log("this.odsDetalles =>>>>>>>> ", this.odsDetalles);
    let these = this;

    this.countAgendas.map(function (item) {
      let tipoproducto_id = item.tipoproducto_id;
      let tipo_producto = item.tipo_producto;

      let menuExistente = resultado.find(function (element) {
        return element.tipoproducto_id === tipoproducto_id;
      });

      if (menuExistente) {
      } else {
        let nuevoMenu = {
          tipo_producto: tipo_producto,
          tipoproducto_id: tipoproducto_id,
          current: item.tipoproducto_id == these.odsDetalles.tipo_producto.id,
          active: false,
        };
        resultado.push(nuevoMenu);
      }
    });
    //console.log("resultado =Z ", resultado);
    this.tipoProductoLista = resultado;
    console.log(
      "this.tipoProductoListathis.tipoProductoLista => ",
      JSON.stringify(this.tipoProductoLista)
    );
    this.countAgendasListaAddData();
  }

  activeTipoProducto(tipoproducto_id: number) {
    const nuevosTipoProductoLista = this.tipoProductoLista.map((item) => {
      return {
        ...item,
        active: item.tipoproducto_id === tipoproducto_id,
      };
    });
    this.tipoProductoLista = nuevosTipoProductoLista;
    this.countAgendasListaAddData();
  }
  countCitasByProfesional() {
    let formData = {
      tipo_producto: this.odsDetalles.tipo_producto.id,
      start: "2023-01-01",
    };
    this._AgendaService
      .postCitasByProfesional({
        ...formData,
      })
      .subscribe((res: any) => {
        this.countAgendas = res;
        this.infoCountAgendas();
        if (res.status == "error") {
          this._ToastService.danger(res.msg);
        }
        if (res.code == 200) {
          this.countAgendas = res;
        }
      });
  }

  agendaDisponibleProfesionales() {
    this.loading = true;
    let formData = {
      tipo_producto: this.odsDetalles.tipo_producto.id,
    };
    this.countCitasByProfesional();
    this._AgendaService
      .postAgendaProfesionalAllProfesional({
        ...formData,
      })
      .subscribe((res: any) => {
        if (res.status == "error") {
          this._ToastService.danger(res.msg);
        }
        if (res.code == 200) {
          this.agendasDisponibles = new MatTableDataSource(res.data);
          this.agendasDisponibles.filterPredicate = this.getFilterPredicate();
          //this.agendasDisponibles.paginator = this.paginator;
          /*setTimeout(
            () => (this.agendasDisponibles.paginator = this.paginator)
          ); */

          if (res.data.length > 0) {
            this._ToastService.success(res.msg);
          } else {
            this._ToastService.info("no existen agendas disponibles");
          }
        }
        this.loading = false;
      });
  }

  dateSeleccionado(evento) {}

  guardar(ev) {}

  filtrarResultados(ev) {
    console.log("asdf");
    this.loadProductosBySolicitud(this.id, { ...this.formularioFiltro.value });
  }
  limpiarFiltrosForm() {
    this.formularioFiltro.reset();
    this.loadProductosBySolicitud(this.id, { ...this.formularioFiltro.value });
  }

  actualizarProducto(product) {
    console.log("en function actualziarProducto ", product);
    let index: any;
    index = this.productosLista.findIndex((prod) => product.id === prod["id"]);
    console.log("el index encontrado index  =", index);
    if (index >= 0) {
      this.productosLista[index] = product;
      console.log("dentro de if index ", this.productosLista[index]);
    }
  }

  openModalNewCita(cita: any) {
    console.log("el formulario ", this.formulario);
    console.log("el dato de la citaa ", cita);
    console.log("lapersonagetsion aid ", this.personaGestion);
    if (
      this.personaGestion.estado_id != 12 &&
      this.personaGestion.estado_id != 11 &&
      this.personaGestion.estado_id != 7
    ) {
      this._ToastService.info("esta persona ya ha sido programada");
      return;
    }

    if (this.formulario.valid) {
      const modalRef = this.modalService.open(NuevacitaComponent, {
        backdrop: "static",
        size: "xs",
        keyboard: false,
      });
      this.formulario.get("fecha_seguimiento").value == undefined
        ? this.formulario.get("fecha_seguimiento").setValue(null)
        : this.formulario.get("fecha_seguimiento").value;

      modalRef.componentInstance.data = {
        cita: cita,
        odsDetalles: this.odsDetalles,
        persona: this.personaGestion,
        info: { ...this.formulario.value },
      };

      modalRef.result
        .then((result) => {
          if (result.status == "ok") {
            this.actualizarProducto(result.data.data.producto);
            this.formulario.reset();
            this.mostrarRegistro = false;
          }
        })
        .catch((error) => {});
    } else {
      this.formulario.markAllAsTouched();
      this._ToastService.info(
        "debe ingresar los datos del formulario, sección gestionar programación"
      );
    }
  }

  validarEstadoProgramacion() {
    return this.formulario.get("estado_programacion").value == 10 ||
      this.formulario.get("estado_programacion").value == 11
      ? true
      : false;
  }

  validarInformacionProgramacion() {
    const estadosDisponiblesShowButton = [10, 9, 8];
    const estadosDisponiblesButton = [7, 8, 9, 11];
    console.log("entrea aqui validarinformacionacionprogramaciones");
    //return estadosDisponiblesShowButton.includes(this.formulario.get("estado_programacion").value)   ?  true :   false
    //alert(this.formulario.get("estado_programacion").value);
    if (
      estadosDisponiblesShowButton.includes(
        parseInt(this.formulario.get("estado_programacion").value)
      ) &&
      estadosDisponiblesButton.includes(
        parseInt(this.formulario.get("estado_id").value)
      )
    ) {
      return true;
    }
    return false;
  }

  /*
   * mostrar el boton de acuerdo al estado
   */
  showButtonActualizarInformacion(value) {
    console.log("showButtonActualizarInformacion", value);
    const estadosPermitidosActualizarInformacion = [7, 8, 9, 11, 12];
    if (
      estadosPermitidosActualizarInformacion.includes(
        parseInt(this.formulario.get("estado_id").value)
      ) /*&&
      value != 11*/
    ) {
      this.showButtonInformacionProgramacion = true;
    } else {
      this.showButtonInformacionProgramacion = false;
    }
  }

  changeGenerarReprogramacionCita(value) {
    console.log("carolina ", this.formulario.get("estado_id").value);
    console.log("personaGestion ==>", this.personaGestion);
    console.log("value ==>>", value);
    const estadosPermitidosCambio = [
      7, 10, 11,
    ]; /** 7 citado, 11 cancelado reprogramado estaso permitido cambio de cita hora*/

    if (
      estadosPermitidosCambio.includes(
        parseInt(this.formulario.get("estado_id").value)
      ) &&
      value == 11
    ) {
      this.agendaDisponibleProfesionales();
    } else {
      this.agendasDisponibles = null;
    }
    this.showButtonActualizarInformacion(value);
  }

  changeEstadoSeguimiento(value) {
    //this.showButtonInformacionProgramacion = true;
  }

  cancelarProducto() {
    this._UtilService
      .confirm({
        title: "Cancelar Producto",
        message: "Seguro que desea Cancelar este registro?",
      })
      .then(
        () => {
          this.loading = true;
          let value = { ...this.formulario.value };
          console.log("valor to save producto gestion ", value);
          this._ProductoService
            .cancelarProductoBiId(value)
            .subscribe((res: any) => {
              if (res.status == "ok") {
                this._ToastService.success(
                  "Producto " + res.msg + " correctamente"
                );
                this.actualizarProducto(res.data.producto);
              }
              if (res.status == "error") {
                let messageError = this._ToastService.errorMessage(res.msg);
                this._ToastService.danger(messageError);
              }
              this.loading = false;
            });
        },
        () => {
          this.loading = false;
        }
      );
  }

  guardarInformacionProgramacion() {
    console.log("this.formulario.value => ", this.formulario.value);
    console.log("this.personaGestion ==>>", this.personaGestion);

    if (this.formulario.valid) {
      if (
        this.personaGestion.estado_id == 12 &&
        this.personaGestion.profesional_id == null
      ) {
        this.cancelarProducto();
        return;
      }

      this._UtilService
        .confirm({
          title: "Guardar Gestión",
          message: "Seguro que desea guardar esta Información?",
        })
        .then(
          () => {
            this.loading = true;
            let value = { ...this.formulario.value };
            console.log("valor to save producto gestion ", value);
            this._ProductosrepsoService
              .guardarinformacionProducto(value)
              .subscribe((res: any) => {
                if (res.status == "ok") {
                  this._ToastService.success(
                    "Producto " + res.msg + " correctamente"
                  );
                  this.actualizarProducto(res.data.producto);
                }
                if (res.status == "error") {
                  let messageError = this._ToastService.errorMessage(res.msg);
                  this._ToastService.danger(messageError);
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
      this._ToastService.info(
        "debe ingresar todos los datos obligatorios, sección gestionar programación"
      );
    }
  }
  applyFilter() {
    const date = this.searchForm.get("fechacitadatesearch").value;
    const as = this.searchForm.get("profesionalsearch").value;
    const ds = this.searchForm.get("fechacitasearch").value;
    const hourSearch = this.searchForm.get("horacitadatesearch").value;

    console.log("hourSearch", hourSearch);

    this.fechacitadatesearch =
      date === null || date === "" ? "" : date.toDateString();
    this.profesionalsearch = as === null ? "" : as;
    this.fechacitasearch = ds === null ? "" : ds;
    this.horacitadatesearch = hourSearch;

    // create string of our searching values and split if by '$'
    const filterValue =
      this.fechacitadatesearch +
      "$" +
      this.profesionalsearch +
      "$" +
      this.fechacitasearch +
      "$" +
      this.horacitadatesearch;
    this.agendasDisponibles.filter = filterValue.trim().toLowerCase();
  }

  convertirDateToString(dateFormat) {
    const dateTo = new Date(dateFormat);
    return `${dateTo.getFullYear()}-${
      dateTo.getMonth() + 1 < 10
        ? "0" + (dateTo.getMonth() + 1)
        : dateTo.getMonth() + 1
    }-${dateTo.getDate() < 10 ? "0" + dateTo.getDate() : dateTo.getDate()}`;
  }

  /* this method well be called for each row in table  */
  getFilterPredicate() {
    return (row: any, filters: string) => {
      // split string per '$' to array
      const filterArray = filters.split("$");
      const departureDate = filterArray[0];
      const departureStation = filterArray[1];
      const arrivalStation = filterArray[2];
      const hourSearch = filterArray[3];

      const matchFilter = [];

      // Fetch data from row
      const columnDepartureDate = row.onlydate;
      const columnDepartureStation = row.profesional;
      const columnArrivalStation = row.dateformat_name;
      const columnStart = row.start;
      const columnEnd = row.end;

      //console.log("rowss ", row);

      //matchFilter.push(customFilterDS);

      /*console.log(
        "this.convertirDateToString(departureDate)",
        this.convertirDateToString(departureDate)
      );
      console.log("row.onlydate", row.onlydate);*/

      // Filtro de horas
      if (hourSearch !== "" && hourSearch !== "-1") {
        const startHour = parseInt(hourSearch.slice(0, 2)); // Obtener la hora del filtro
        const endHour = startHour + 1; // Definir una hora límite, en este caso, una hora después
        const columnStartHour = parseInt(columnStart.slice(11, 13)); // Obtener la hora de inicio de la columna
        const columnEndHour = parseInt(columnEnd.slice(11, 13)); // Obtener la hora de fin de la columna
        const isWithinHourRange =
          //startHour >= columnStartHour &&
          columnStartHour >= startHour &&
          //endHour <= columnEndHour &&
          row.minutes >= Number(this.odsDetalles.tipo_producto.tiempo) + 15; // Verificar si la columna está dentro del rango de horas especificado
        matchFilter.push(isWithinHourRange);

        console.log(
          "startHour =>",
          startHour,
          "endHour => ",
          endHour,
          "columnStartHour=> ",
          columnStartHour,
          "columnEndHour => ",
          columnEndHour,
          "isWithinHourRange=> ",
          isWithinHourRange,
          "row.minutes =>>",
          row.minutes,
          "this.odsDetalles.tipo_producto.tiempo () =>",
          this.odsDetalles.tipo_producto.tiempo,
          "this.odsDetalles.tipo_producto.tiempo+15 >>>> ",
          this.odsDetalles.tipo_producto.tiempo + 15
        );
        console.log(
          "odsDetalles.tipo_producto.tiempo ",
          this.odsDetalles.tipo_producto.tiempo
        );
      }

      /*
      console.log(
        "startHour =>",
        startHour,
        "endHour => ",
        endHour,
        "columnStartHour=> ",
        columnStartHour,
        "columnEndHour => ",
        columnEndHour,
        "isWithinHourRange=> ",
        isWithinHourRange
      );
      console.log(
        "odsDetalles.tipo_producto.tiempo ",
        this.odsDetalles.tipo_producto.tiempo
      );*/

      // verify fetching data by our searching values
      if (departureDate != "") {
        const customFilterDD = columnDepartureDate
          .toString()
          .toLowerCase()
          .includes(this.convertirDateToString(departureDate));
        matchFilter.push(customFilterDD);
      }

      const customFilterDS = columnDepartureStation
        .toLowerCase()
        .includes(departureStation);

      const customFilterAS = columnArrivalStation
        .toLowerCase()
        .includes(arrivalStation);

      // push boolean values into array
      matchFilter.push(customFilterDS);
      matchFilter.push(customFilterAS);
      // return true if all values in array is true
      // else return false

      return matchFilter.every(Boolean);
    };
  }

  getHoursBetween(start: number, end: number): string[] {
    const hours: string[] = [];
    let hour: string;
    let hourmiddle: string; /* fracciones de 30 minutos */
    for (let i = start; i <= end; i++) {
      hour = i < 10 ? "0" + i + ":00:00" : i + ":00:00";
      hourmiddle = i < 10 ? "0" + i + ":30:00" : i + ":30:00";
      hours.push(hour);
      hours.push(hourmiddle);
    }
    return hours;
  }

  updateEstadoSeguimiento(product) {
    let index: any;
    index = this.productosLista.findIndex(
      (prod) => product.producto_id === prod["id"]
    );
    console.log("el index encontrado index  =", index);
    if (index >= 0) {
      this.productosLista[index]["estado_seguimiento"] =
        product.estado_seguimiento;
      this.productosLista[index]["estadoseguimiento_id"] =
        product.estadoseguimiento_id;
      console.log("dentro de if index ", this.productosLista[index]);
    }
  }

  addComment() {
    const modalRef = this.modalService.open(ComentariosComponent, {
      //backdrop: 'static',
      size: "lg",
      keyboard: false,
    });
    const producto = {
      producto: this.personaGestion,
      estadosListaSeguimiento: this.estadosListaSeguimiento,
    };

    modalRef.componentInstance.data = producto;

    modalRef.result
      .then((result) => {
        if (result.status == "ok") {
          //this.dataTableReload.reload(result.data.data);
          console.log("en componente base ", result);
          this.updateEstadoSeguimiento(result.data.data[0]);
          this._ToastService.success("Comentario agregado correctamente");
        }
      })
      .catch((error) => {});
  }
}
