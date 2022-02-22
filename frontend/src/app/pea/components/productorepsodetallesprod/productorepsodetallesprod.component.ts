import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { forkJoin } from "rxjs";
import { environment } from "src/environments/environment";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { productoRepso } from "../../models/productoRepso";
import { ProductosrepsoService } from "../../services/productosrepso.service";
import { ProductoService } from "../../services/producto.service";
import { ClienteService } from "src/app/services/cliente.service";

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
  mostrarRegistro: boolean = true;
  formulario: FormGroup;

  constructor(
    private FormBuilder: FormBuilder,
    private _ProductosrepsoService: ProductosrepsoService,
    private _ProductoService: ProductoService,
    private _ClienteService: ClienteService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.route.queryParams.subscribe((params: Params) => {
      this.id = params["id"];
      this.initLoadData();
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
  }

  initLoadData() {
    this.loading = true;
    forkJoin([
      this._ProductosrepsoService.getSolicitudById(this.id),
      this._ProductoService.getProductosBySolicitud(this.id, {}),
    ]).subscribe(([odsDetalles, productosLista]) => {
      this.odsDetalles = odsDetalles;
      this.productosLista = productosLista.data;

      this.loading = false;
    });
  }
  agregarRegistro() {
    //this.mostrarRegistro = true
    this.mostrarRegistro = !this.mostrarRegistro;
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

  guardar(ev) {}
}
