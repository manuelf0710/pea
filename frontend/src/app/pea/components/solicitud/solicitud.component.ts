import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { forkJoin, Observable, of } from "rxjs";
import { environment } from "./../../../../environments/environment";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastService } from "src/app/shared/services/toast.service";
import { UtilService } from "./../../../shared/services/util.service";
import { TipoproductosService } from "./../../../services/tipoproductos.service";
import { ComunService } from "src/app/services/comun.service";
import { ProductosrepsoService } from "../../services/productosrepso.service";
import { regional } from "src/app/models/regional";
import { tipoProducto } from "./../../models/tipoproducto";

@Component({
  selector: "app-solicitud",
  templateUrl: "./solicitud.component.html",
  styleUrls: ["./solicitud.component.scss"],
})
export class SolicitudComponent implements OnInit {
  public url = environment.apiUrl + environment.comun.buscarContrato;
  public urlProfesionales =
    environment.apiUrl + environment.comun.buscarUsers + "?profile=2";
  public loading: boolean = false;
  public regionales: regional[];
  public tipoProductos: tipoProducto[];
  formulario: FormGroup;
  respuesta = {
    status: "close",
    data: [],
  };
  public productoGrupal = [
    { label: "Individual", value: 1 },
    { label: "Grupal", value: 2 },
  ];
  public dateActually = new Date();
  constructor(
    private FormBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _ToastService: ToastService,
    private _UtilService: UtilService,
    private _TipoproductosService: TipoproductosService,
    private _ComunService: ComunService,
    private _ProductosrepsoService: ProductosrepsoService
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
      this.loading = false;
    });
  }

  private buildForm() {
    let id = null;
    let tipoproducto_id = null;
    let regional_id = null;
    let grupal = 1;
    let contrato_id = null;
    let anio = null;
    let descripcion = null;
    let cantidad = null;

    this.formulario = this.FormBuilder.group({
      id: [id],
      tipoproducto_id: [tipoproducto_id, [Validators.required]],
      regional_id: [regional_id, [Validators.required]],
      grupal: [grupal, [Validators.required]],
      contrato_id: [contrato_id, [Validators.required]],
      profesional_id: ["", [Validators.required]],
      anio: [
        anio,
        [
          Validators.required,
          Validators.pattern("^[0-9]*$"),
          Validators.minLength(4),
          Validators.maxLength(4),
          Validators.min(this.dateActually.getFullYear()),
        ],
      ],
      descripcion: [descripcion],
      cantidad: [
        cantidad,
        [
          Validators.required,
          Validators.pattern("^[0-9]*$"),
          Validators.minLength(1),
          Validators.min(1),
        ],
      ],
    });
  }

  seleccionado(item) {
    this.formulario.get("contrato_id").setValue(item.id);
  }
  seleccionadoProfesional(item) {
    this.formulario.get("profesional_id").setValue(item.id);
  }
  guardar(event: Event) {
    event.preventDefault();
    if (this.formulario.valid) {
      const value = {
        ...this.formulario.value,
      };
      this._ProductosrepsoService
        .getExistSolicitud(value)
        .subscribe((res: any) => {
          let messageSave = "Seguro que desea guardar esta solicitud?";
          if (res.data) {
            messageSave =
              "Ya existe una solicitud con esta información, Seguro que desea guardar esta solicitud?";
            this._ToastService.warning(
              "ya existe una solicitud con esta información"
            );
          }
          this._UtilService
            .confirm({
              title: "Guardar Solicitud",
              message: messageSave,
            })
            .then(
              () => {
                this.loading = true;
                this._ProductosrepsoService
                  .guardarsolicitud(value)
                  .subscribe((res: any) => {
                    if (res.status == "ok") {
                      this.respuesta = { status: "ok", data: res };
                      //this.formulario.get('id').setValue(res.data.id);
                      this._ToastService.success(
                        "Solicitud " + res.msg + " correctamente"
                      );
                      this.router.navigate(["/pea/solicitudes"]);
                    }
                    if (res.status == "error") {
                      let messageError = this._ToastService.errorMessage(
                        res.msg
                      );
                      this._ToastService.danger(messageError);
                    }
                  });
              },
              () => {
                this.loading = false;
              }
            );
        });
    } else {
      this.formulario.markAllAsTouched();
    }
  }
}
