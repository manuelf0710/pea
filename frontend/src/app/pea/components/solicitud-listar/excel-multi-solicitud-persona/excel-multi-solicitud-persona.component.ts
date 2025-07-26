import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastService } from "src/app/shared/services/toast.service";

@Component({
  selector: "app-excel-multi-solicitud-persona",
  templateUrl: "./excel-multi-solicitud-persona.component.html",
  styleUrls: ["./excel-multi-solicitud-persona.component.scss"],
})
export class ExcelMultiSolicitudPersonaComponent implements OnInit {
  public loading: boolean = false;
  
  constructor(
    private _ToastService: ToastService,
    public _activeModal: NgbActiveModal
  ) {}

  @Input() data: any;
  respuesta = {
    status: "close",
    id: 0,
    data: [],
  };

  ngOnInit(): void {}

  closeModal() {
    this._activeModal.close(this.respuesta);
  }
}
