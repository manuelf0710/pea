import { Component, OnInit } from "@angular/core";
import { TipoproductosService } from "../../../services/tipoproductos.service";
import { TipoproductosuserService } from "src/app/services/tipoproductosuser.service";
import { profesionalSeleccionado } from "../../models/profesionaseleccionado";
import { tipoProductoSeleccionado } from "../../models/tipoproductoseleccionado";

@Component({
  selector: "app-programaragenda",
  templateUrl: "./programaragenda.component.html",
  styleUrls: ["./programaragenda.component.css"],
})
export class ProgramarAgendaComponent implements OnInit {
  public tipoproductosList = [];
  public tipoproductoUserList = [];
  public tipoproductoSeleccionado: tipoProductoSeleccionado;
  public profesionalSeleccionado: profesionalSeleccionado;
  public habilitarSeccionSeleccionado: boolean = false;
  public loading: boolean = true;

  constructor(
    private _TipoproductosService: TipoproductosService,
    private _TipoproductosuserService: TipoproductosuserService
  ) {}

  ngOnInit(): void {
    this.loadTipoProductos();
  }

  loadTipoProductos() {
    this.loading = true;
    this.habilitarSeccionSeleccionado = false;
    this._TipoproductosService.getLista().subscribe(
      (res: any) => {
        this.tipoproductosList = res;
        this.loading = false;
      },
      (error: any) => {
        console.log("ha ocurrido un error en bgtable component ");
        console.log("error ", error);
        this.loading = false;
      },
      () => {}
    );
  }

  getProfesionalsAssoc(tipoProducto) {
    this.loading = true;
    this._TipoproductosuserService
      .getTipoProductoByUser(tipoProducto.id)
      .subscribe(
        (res: any) => {
          this.tipoproductoUserList = res;
          this.tipoproductoSeleccionado = tipoProducto;
          this.loading = false;
        },
        (error: any) => {
          console.log("ha ocurrido un error en bgtable component ");
          console.log("error ", error);
          this.loading = false;
        },
        () => {}
      );
  }

  agendaProfesional(profesional) {
    this.profesionalSeleccionado = profesional;
    this.habilitarSeccionSeleccionado = true;
  }
}
