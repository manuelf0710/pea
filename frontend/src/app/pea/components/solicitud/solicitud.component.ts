import { Component, OnInit } from '@angular/core';
import { environment } from './../../../../environments/environment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'app-solicitud',
  templateUrl: './solicitud.component.html',
  styleUrls: ['./solicitud.component.css']
})
export class SolicitudComponent implements OnInit {
  public url = environment.apiUrl+'/comun/buscarproducto';
  //formulario: FormGroup;
  constructor() { }

  ngOnInit(): void {
  }
/*
  private buildForm(){
    let id = null;
    let ods = null
    let cantidad = null;
    let anio = null;
    let producto = null;
    let regional = null;
  } */

  seleccionado(item){
    console.log("selcionado ",item);
  }

}
