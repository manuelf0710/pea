import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import {Observable, of} from 'rxjs';
import {debounceTime, distinctUntilChanged, map,tap, switchMap, catchError, filter} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
//import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css']
})
export class AutocompleteComponent implements OnInit {
  public modeloBusqueda: any;
  @Output() seleccionado :EventEmitter<Object>;
  @Input() url: string;
  @Input() lengthSize = 3;
  @Input() labelValue = 'nombre';
  searching = false;
  searchFailed = false;
  constructor(private _HttpClient:HttpClient) {
    this.seleccionado = new EventEmitter();
   }

  ngOnInit(): void {
  } 
  buscarData(term: string){
    if (term === '') {
      return of([]);
    }
    return this._HttpClient
      .post<any>(this.url,{globalsearch:term}).pipe(
        map(response => {
          console.log(response.data);
          return response.data;
          }
          )
      );    
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      filter(res => res.length > this.lengthSize || res.length == 0 ),
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this.buscarData(term).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))        
      ),
      tap(() => this.searching = false)
    )  

    selected(evento:any){
      console.log("algo seleccionado", evento.item)
      this.seleccionado.emit(evento.item);
    }
    resultFormatBandListValue(value: any) { 
      return value.nombre;
    } 
    inputFormatBandListValue(value: any)   {
      if(value.nombre)
        return value.nombre
      return value;
    }      
}
