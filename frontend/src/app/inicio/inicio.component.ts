import { Component, OnInit } from '@angular/core';
//import {NgForm} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {  Observable } from 'rxjs';
//import { map } from 'rxjs/operators';


import { environment } from './../../environments/environment';
import { UtilService } from './../shared/services/util.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  public modulos = [];
  public data : Observable<any[]>;
  public modulosearch: '';

  constructor(private http: HttpClient,
              private UtilService: UtilService
    ) {
   }

  ngOnInit() {
    //this.getModules(); 
    this.modulos = JSON.parse(localStorage.getItem('modulos'));
 }
  private getModules(){
    this.http.get(`${environment.apiUrl}/general/loadmodulos`)
    .subscribe(data => {   // data is already a JSON object
        console.log(data);
    });
  }
  goTo(modulo){
    this.UtilService.goTo(modulo.url);
  }

}
