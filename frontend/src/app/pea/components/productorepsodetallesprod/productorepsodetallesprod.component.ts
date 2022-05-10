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
import { AuthenticationService } from './../../../auth/services/authentication.service';
import { ComunService } from './../../../services/comun.service';


import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NuevacitaComponent } from "./nuevacita/nuevacita.component";
import { User } from "src/app/auth/models/user";
import { listaItems } from './../../../models/listaItems';
import { estadoSeguimiento } from '../../../models/estadoSeguimiento';


export interface gestionPersona {
  id: number;
  cedula: number;
  estado: String;
  estado_id: number;
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
  estadosLista: listaItems[];
  estadosListaSeguimiento: estadoSeguimiento[];
  loading: boolean = true;
  mostrarRegistro: boolean = false;
  mostrarCargaExcel: boolean = false;
  mostrarFiltros: boolean = true;
  formulario: FormGroup;
  formularioArchivo: FormGroup;
  formularioFiltro: FormGroup;
  public archivoscargados: any[] = [];
  urlSubidaArchivo!: String;
  active: number = 1;
  personaGestion!: gestionPersona;
  agendasDisponibles!: agendasDisponiblesProfesionales;
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
  public arrayPermisoCargueExcel = [1,2];
  public permisoCargueExcel: boolean = false;

  constructor(
    private _ToastService: ToastService,
    private FormBuilder: FormBuilder,
    private _ComunService : ComunService,
    private _ProductosrepsoService: ProductosrepsoService,
    private _ProductoService: ProductoService,
    private _ClienteService: ClienteService,
    private _AgendaService: AgendaService,
    private modalService: NgbModal,
    private readonly route: ActivatedRoute,
    private authenticationService: AuthenticationService,
  ) {

    this.pageSize = 50;
    this.currentPage = 1;
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    /*console.log("productorepsodetallescomponent ",this.currentUser);
    console.log("productorepsodetallescomponent profileId ",this.currentUser.perfil.id);*/
    this.permisoCargueExcel = this.arrayPermisoCargueExcel.includes(this.currentUser.perfil.id);
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

  setComentarioCancelacionValidators(){
    const comentarioCancelacion = this.formulario.get("comentario_cancelacion");
    this.formulario.get("estado_programacion").valueChanges.subscribe((estado_programacion) => {
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
      descripcion: ["", [Validators.required]],
      numero_citas: [null],
      fecha_seguimiento: [null],
      estado_seguimiento: [null],
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
      this._ComunService.getListasAllById(2),
      this._ComunService.getEstadosAll(),
    ]).subscribe(([odsDetalles, productosLista, estadosLista, estadosListaSeguimiento]) => {
      this.odsDetalles = odsDetalles;
      this.productosLista = productosLista.data;
      this.estadosLista = estadosLista;
      this.estadosListaSeguimiento = estadosListaSeguimiento;
      console.log("los estados lista ", this.estadosLista);

      this.totalRecords = productosLista.total;
      this.from = productosLista.from;
      this.to = productosLista.to;

      this.loading = false;
    });
  }

  pageChange(pag) {
    this.loadProductosBySolicitud(this.id +"?page=" + pag + "&pageSize=" + this.pageSize, { ...this.formularioFiltro.value });
  }
  public onChangePaginationSize() {
    this.currentPage = 1;
    this.loadProductosBySolicitud(this.id + "?page=1&pageSize="  + this.pageSize, { ...this.formularioFiltro.value });
  
  }

  agregarRegistro() {
    //this.mostrarRegistro = true
    this.mostrarRegistro = !this.mostrarRegistro;
  }

  gestionProgramacion(item) {
    this.mostrarRegistro = !this.mostrarRegistro;
    if (this.personaGestion === undefined) {
      this.personaGestion = item;
    }
    if (this.personaGestion.cedula != item.cedula) {
      this.personaGestion = item;
      this.mostrarRegistro = true;
    }

    //this.mostrarRegistro == true ? this.agendaDisponibleProfesionales() : "";

    console.log("registropersona ", this.personaGestion);
    console.log("valor de mostrar registro ", this.mostrarRegistro);
    console.log("item estado_id ", item.estado_id);
    if (item.estado_id == 12 && this.mostrarRegistro) {
      this.agendaDisponibleProfesionales();
    } else {
      console.log("entra en agendasdisponibles null");
      this.agendasDisponibles = null;
    }
    console.log("agendas dipooonibles ", this.agendasDisponibles);
    this.setvaluesFormulario();
  }

  setvaluesFormulario() {
    this.formulario.patchValue({
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
          this.agendasDisponibles = res.data;
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
    if (this.personaGestion.estado_id != 12) {
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

  validarEstadoProgramacion(){
    return this.formulario.get("estado_programacion").value == 10 || this.formulario.get("estado_programacion").value == 11  ?  true :   false 
  }


  guardarInformacionProgramacion(){
   if(this.formulario.valid){
    let validarComentarioCancelacion = this.validarEstadoProgramacion();
    console.log("es validoo");
    /*console.log('una chica para mi ',this.formulario.get("comentario_cancelacion").value)
    if(validarComentarioCancelacion && (this.formulario.get("comentario_cancelacion").value == '' || this.formulario.get("comentario_cancelacion").value == null)){
      this._ToastService.info(
        "debe ingresar un comentario de cancelación"
      );  
      return;       
    }*/

   }else{
    this.formulario.markAllAsTouched();
    this._ToastService.info(
      "debe ingresar los datos del formulario a guardar, sección gestionar programación"
    );     
   }
  }

}
