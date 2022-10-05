import { Component, OnInit } from "@angular/core";
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
import { User } from "src/app/auth/models/user";
import { listaItems } from "./../../../models/listaItems";
import { estadoSeguimiento } from "../../../models/estadoSeguimiento";
import { MatTableDataSource } from "@angular/material/table";

import { UtilService } from "./../../../shared/services/util.service";

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

@Component({
  selector: "app-productorepsodetallesprod",
  templateUrl: "./productorepsodetallesprod.component.html",
  styleUrls: ["./productorepsodetallesprod.component.css"],
})
export class ProductorepsodetallesprodComponent implements OnInit {
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
  agendasDisponibles!: MatTableDataSource<agendasDisponiblesProfesionales>;
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
      let arregloPermitidosOther = [-1];
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
        this.agendasDisponibles = null;
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
    this._ProductoService
      .procesarExcelBySolicitud(this.id, {
        nombrearchivo: this.formularioArchivo.value.archivo,
        ...this.odsDetalles,
      })
      .subscribe((res: any) => {
        if (res.status == "error") {
          this._ToastService.danger(res.msg);
        }
        if (res.code == 200) {
          this._ToastService.success(res.msg);
          this.mostrarCargaExcel = false;
          this._ProductoService
            .getProductosBySolicitud(this.id, {})
            .subscribe((data) => {
              this.productosLista = data.data;
            });
        }
      });
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

  agendaDisponibleProfesionales() {
    this.loading = true;
    let formData = {
      tipo_producto: this.odsDetalles.tipo_producto.id,
    };
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
    const estadosPermitidosActualizarInformacion = [7, 8, 9, 12];
    if (
      estadosPermitidosActualizarInformacion.includes(
        parseInt(this.formulario.get("estado_id").value)
      ) &&
      value != 11
    ) {
      this.showButtonInformacionProgramacion = true;
    } else {
      this.showButtonInformacionProgramacion = false;
    }
  }

  changeGenerarReprogramacionCita(value) {
    const estadosPermitidosCambio = [
      7, 11,
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
    this.showButtonInformacionProgramacion = true;
  }

  guardarInformacionProgramacion() {
    if (this.formulario.valid) {
      this._UtilService
        .confirm({
          title: "Guardar Gestión",
          message: "Seguro que desea guardar esta Información?",
        })
        .then(
          () => {
            this.loading = true;
            let value = { ...this.formulario.value };
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

    this.fechacitadatesearch =
      date === null || date === "" ? "" : date.toDateString();
    this.profesionalsearch = as === null ? "" : as;
    this.fechacitasearch = ds === null ? "" : ds;

    // create string of our searching values and split if by '$'
    const filterValue =
      this.fechacitadatesearch +
      "$" +
      this.profesionalsearch +
      "$" +
      this.fechacitasearch;
    this.agendasDisponibles.filter = filterValue.trim().toLowerCase();
      }

  convertirDateToString(dateFormat){
    const dateTo = new Date(dateFormat);
    return `${dateTo.getFullYear()}-${dateTo.getMonth()+1}-${dateTo.getDate() <10 ? '0'+dateTo.getDate(): dateTo.getDate() }`
  }

  /* this method well be called for each row in table  */
  getFilterPredicate() {
    return (row: any, filters: string) => {
      // split string per '$' to array
      console.log("filters",filters);
      const filterArray = filters.split("$");
      const departureDate = filterArray[0];
      const departureStation = filterArray[1];
      const arrivalStation = filterArray[2];

      const matchFilter = [];

      // Fetch data from row
      const columnDepartureDate = row.onlydate;
      const columnDepartureStation = row.profesional;
      const columnArrivalStation = row.dateformat_name;

        
        //matchFilter.push(customFilterDS);

        console.log("this.convertirDateToString(departureDate)" ,this.convertirDateToString(departureDate));
        console.log("row.onlydate",row.onlydate) ;


      // verify fetching data by our searching values
      if(departureDate!=''){

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
}
