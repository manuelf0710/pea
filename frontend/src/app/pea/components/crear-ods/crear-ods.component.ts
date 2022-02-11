import { Component, OnInit } from '@angular/core';
import { environment } from './../../../../environments/environment';

@Component({
  selector: 'app-crear-ods',
  templateUrl: './crear-ods.component.html',
  styleUrls: ['./crear-ods.component.css']
})
export class CrearOdsComponent implements OnInit {
  public url = environment.apiUrl+'/comun/buscarproducto';
  constructor() { }

  ngOnInit(): void {
  }

  seleccionado(item){
    console.log("selcionado ",item);
  }

}
