import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { forkJoin } from "rxjs";
import { environment } from "src/environments/environment";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { productoRepso } from "../../models/productoRepso";
import { ProductosrepsoService } from "../../services/productosrepso.service";
import { ProductoService } from "../../services/producto.service";
import { ClienteService } from "src/app/services/cliente.service";
import { AgendaService } from './../../../services/agenda.service';
import { ToastService } from "src/app/shared/services/toast.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NuevacitaComponent } from './nuevacita/nuevacita.component';

export interface gestionPersona {
  id:number;
  cedula: number;
  estado: String;
  estado_id: number;
  nombre: String;
}

export interface agendasDisponiblesProfesionales {
  minutes:number;
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
  productosLista: [];
  loading: boolean = true;
  mostrarRegistro: boolean = false;
  mostrarCargaExcel: boolean = false;
  mostrarFiltros: boolean = true;
  formulario: FormGroup;
  formularioArchivo: FormGroup;
  public archivoscargados: any[] = [];
  urlSubidaArchivo!: String;
  active: number = 1;
  personaGestion !: gestionPersona;
  agendasDisponibles !: agendasDisponiblesProfesionales;

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
      dependencia_id: ["", [Validators.required]],
      email: ["", [Validators.required]],
      telefono: ["", [Validators.required]],
      division: ["", [Validators.required]],
      subdivision: ["", [Validators.required]],
      cargo: ["", [Validators.required]],
      direccion: ["", [Validators.required]],
      ciudad_id: ["", [Validators.required]],
      barrio: ["", [Validators.required]],
      otrosi: ["", [Validators.required]],

      fecha_ingreso: ["", [Validators.required]],
      modalidad: ["", [Validators.required]],
      descripcion: ["", [Validators.required]],
      numero_citas: [""],
      fecha_seguimiento: [""],
      estado_programacion: [""],
      comentarios: [""],
      pyp_ergonomia: [""],
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

  gestionProgramacion(item){
    this.mostrarRegistro = !this.mostrarRegistro;
    if(this.personaGestion === undefined){
      this.personaGestion = item
    }
    if(this.personaGestion.cedula != item.cedula){
      this.personaGestion = item
      this.mostrarRegistro = true;
    }

    this.mostrarRegistro == true ? this.agendaDisponibleProfesionales() : '';
    
    console.log("registropersona ",this.personaGestion);
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

  agendaDisponibleProfesionales(){
    this.loading = true;
    this._AgendaService
      .postAgendaProfesionalAllProfesional({
        "data":2
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

  dateSeleccionado(evento){}

  guardar(ev) {}

  openModalNewCita(cita:any){
    const modalRef = this.modalService.open(NuevacitaComponent, {
      backdrop: "static",
      size: "xs",
      keyboard: false,
    });

    modalRef.componentInstance.data = {cita:cita, odsDetalles: this.odsDetalles, persona:this.personaGestion};

    modalRef.result
      .then((result) => {
        if (result.status == "ok") {
          //this.dataTableReload.reload(result.data.data);
          

          
        }
      })
      .catch((error) => {});    
  }


}