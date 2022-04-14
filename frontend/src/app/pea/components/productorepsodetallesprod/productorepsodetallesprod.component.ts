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
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NuevacitaComponent } from "./nuevacita/nuevacita.component";

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
  loading: boolean = true;
  mostrarRegistro: boolean = false;
  mostrarCargaExcel: boolean = false;
  mostrarFiltros: boolean = true;
  formulario: FormGroup;
  formularioArchivo: FormGroup;
  public archivoscargados: any[] = [];
  urlSubidaArchivo!: String;
  active: number = 1;
  personaGestion!: gestionPersona;
  agendasDisponibles!: agendasDisponiblesProfesionales;

  constructor(
    private _ToastService: ToastService,
    private FormBuilder: FormBuilder,
    private _ProductosrepsoService: ProductosrepsoService,
    private _ProductoService: ProductoService,
    private _ClienteService: ClienteService,
    private _AgendaService: AgendaService,
    private modalService: NgbModal,
    private readonly route: ActivatedRoute
  ) {}

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
      estado_programacion: [null],
      comentarios: [null],
      pyp_ergonomia: ["", [Validators.required]],
      profesionalsearch:[""],
      fechadisponiblesearch:[""]
    });

    this.formularioArchivo = this.FormBuilder.group({
      id: [this.id],
      archivo: ["", [Validators.required]],
    });
  }

  initLoadData() {
    this.loading = true;
    forkJoin([
      this._ProductosrepsoService.getSolicitudById(this.id),
      this._ProductoService.getProductosBySolicitud(this.id, {}),
    ]).subscribe(([odsDetalles, productosLista]) => {
      this.odsDetalles = odsDetalles;
      this.productosLista = productosLista.data;
      console.log("holmanuelf", this.productosLista);

      this.loading = false;
    });
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

    this.mostrarRegistro == true ? this.agendaDisponibleProfesionales() : "";

    console.log("registropersona ", this.personaGestion);
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
      estado_id: this.personaGestion.estado_id,
      estado_programacion: this.personaGestion.estado,
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
    this._AgendaService
      .postAgendaProfesionalAllProfesional({
        data: 2,
      })
      .subscribe((res: any) => {
        if (res.status == "error") {
          this._ToastService.danger(res.msg);
        }
        if (res.code == 200) {
          this._ToastService.success(res.msg);
          this.agendasDisponibles = res.data;
        }
        this.loading = false;
      });
  }

  dateSeleccionado(evento) {}

  guardar(ev) {}

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
    if (this.personaGestion.estado_id != 9) {
      this._ToastService.info("esta persona ya ha sido programada");
      return;
    }
    if (this.formulario.valid) {
      const modalRef = this.modalService.open(NuevacitaComponent, {
        backdrop: "static",
        size: "xs",
        keyboard: false,
      });

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
        "debe ingresar los datos del formulariio, sección gestionar programación"
      );
    }
  }
}
