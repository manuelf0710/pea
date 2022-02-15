import { Component, OnInit } from "@angular/core";
import { forkJoin, Observable, of } from "rxjs";
import { environment } from "./../../../../environments/environment";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastService } from "src/app/shared/services/toast.service";
import { UtilService } from "./../../../shared/services/util.service";
import { TipoproductosService } from "./../../../services/tipoproductos.service";
import { ComunService } from "src/app/services/comun.service";
import { regional } from "src/app/models/regional";
import { tipoProducto } from "./../../models/tipoproducto";

@Component({
  selector: "app-solicitud",
  templateUrl: "./solicitud.component.html",
  styleUrls: ["./solicitud.component.css"],
})
export class SolicitudComponent implements OnInit {
  public url = environment.apiUrl + environment.comun.buscarContrato;
  public loading: boolean = false;
  public regionales: regional[];
  public tipoProductos: tipoProducto[];
  formulario: FormGroup;
  constructor(
    private FormBuilder: FormBuilder,
    private _ToastService: ToastService,
    private _UtilService: UtilService,
    private _TipoproductosService: TipoproductosService,
    private _ComunService: ComunService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loading = true;

    forkJoin([
      this._TipoproductosService.getLista(),
      this._ComunService.getRegionales(),
    ]).subscribe(([tipoProductos, regionales]) => {
      this.regionales = regionales;
      this.tipoProductos = tipoProductos;
    });
    /*this._TipoproductosService.getLista().subscribe((res: any) => {
      this.loading = false;
    });
    this._ComunService.getRegionales().subscribe((res: any) => {
      this.loading = false;
      this.regionales = res;
    }); */
  }

  private buildForm() {
    let id = null;
    let tipoproducto_id = null;
    let regional_id = null;
    let contrato_id = null;
    let anio = null;
    let descripcion = null;
    let cantidad = null;

    this.formulario = this.FormBuilder.group({
      id: [id],
      tipoproducto_id: [tipoproducto_id, [Validators.required]],
      regional_id: [regional_id, [Validators.required]],
      contrato_id: [contrato_id, [Validators.required]],
      anio: [anio, [Validators.required]],
      descripcion: [descripcion, [Validators.required]],
      cantidad: [cantidad, [Validators.required]],
    });
  }

  seleccionado(item) {
    console.log("selcionado ", item);
  }
}
