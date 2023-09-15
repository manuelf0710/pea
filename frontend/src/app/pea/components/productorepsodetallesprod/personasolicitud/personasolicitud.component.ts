import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-personasolicitud",
  templateUrl: "./personasolicitud.component.html",
  styleUrls: ["./personasolicitud.component.scss"],
})
export class PersonaSolicitudComponent implements OnInit {
  @Input() data: any;
  constructor(public _activeModal: NgbActiveModal) {}

  ngOnInit(): void {}
  closeModal() {
    this._activeModal.close();
  }
}
