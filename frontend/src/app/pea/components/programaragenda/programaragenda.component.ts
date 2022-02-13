import { Component, OnInit } from "@angular/core";
import { TipoproductosService } from "../../../services/tipoproductos.service";
import { TipoproductosuserService } from "src/app/services/tipoproductosuser.service";

@Component({
  selector: "app-programaragenda",
  templateUrl: "./programaragenda.component.html",
  styleUrls: ["./programaragenda.component.css"],
})
export class ProgramarAgendaComponent implements OnInit {
  public tipoproductos_list = [];
  public tipoproductouser_list = [];
  public;

  constructor(
    private _TipoproductosService: TipoproductosService,
    private _TipoproductosuserService: TipoproductosuserService
  ) {}

  ngOnInit(): void {
    this.loadTipoProductos();
  }

  loadTipoProductos() {
    this._TipoproductosService.getLista().subscribe(
      (res: any) => {
        this.tipoproductos_list = res;
      },
      (error: any) => {
        console.log("ha ocurrido un error en bgtable component ");
        console.log("error ", error);
      },
      () => {}
    );
  }

  getProfesionalsAssoc(idTipoProducto) {
    this._TipoproductosuserService
      .getTipoProductoByUser(idTipoProducto)
      .subscribe(
        (res: any) => {
          this.tipoproductouser_list = res;
        },
        (error: any) => {
          console.log("ha ocurrido un error en bgtable component ");
          console.log("error ", error);
        },
        () => {}
      );
  }
}
