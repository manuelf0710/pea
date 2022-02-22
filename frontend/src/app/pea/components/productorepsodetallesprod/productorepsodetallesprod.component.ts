import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { forkJoin, Observable, of } from "rxjs";
import { environment } from "src/environments/environment";
import { productoRepso } from "../../models/productoRepso";
import { ProductosrepsoService } from "../../services/productosrepso.service";
import { ProductoService } from "../../services/producto.service";

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

  constructor(
    private _ProductosrepsoService: ProductosrepsoService,
    private _ProductoService: ProductoService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.id = params["id"];
      this.initLoadData();
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
}
