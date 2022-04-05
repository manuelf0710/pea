import { Component, OnInit, Input } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
import { NgbActiveModal, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-nuevacita',
  templateUrl: './nuevacita.component.html',
  styleUrls: ['./nuevacita.component.css']
})
export class NuevacitaComponent implements OnInit {
  @Input() data: any;
  public respuesta = {
    status: "close",
    data: [],
  };  
  constructor(  public _activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  closeModal() {
    this._activeModal.close(this.respuesta);
  }

}
