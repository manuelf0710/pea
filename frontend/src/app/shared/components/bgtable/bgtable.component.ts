import { Component,  OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { FormsModule,FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, filter } from 'rxjs/operators';
import { BgtableService } from './bgtable.service';

import { BgTable } from './modeltable';
import { environment } from './../../../../environments/environment';

@Component({
  selector: 'app-bgtable',
  templateUrl: './bgtable.component.html',
  styleUrls: ['./bgtable.component.css']
})
export class BgtableComponent implements  OnInit { 
  public api_url = environment.server_root;
  public dataSource : any[]; 
  public isSearching: boolean;
  public pageSize : number;
  public currentPage : number;
  public totalRecords : number;
  public from : number;
  public to:number;
  public formSearch : Array<object> = []; /*array objetos searchable in tableConfig */
  public paramSearch: any[] = []; /* array properties searchables in tableConfig ["nombre", "documento"] */
  public paramSearchToObject: object = {}; /*variables de array pasados a objeto, para enviar en la petición httpparams del servicio */
  public pageLength = [
    10,20,50,100
  ];
  public formHttpParams: object; 
  public model;
  public lastAction = null; /* ultima acción  1 nuevo, editar, eliminar*/


  @Input() tableConfig : BgTable;
  @Input() customFilters:  Array<object> = [];
  @Input() pkey = 'id';
  @Input() lengthSize = 3;
  @Input() template : TemplateRef<any>;
  @Output() editarAction :EventEmitter<Object>;
  @Output() eliminarAction :EventEmitter<Object>;
  @Output() copiarAction :EventEmitter<Object>;  
  @Output() exportarAction :EventEmitter<Object>; 
  @Output() nuevoAction :EventEmitter<Object>; 
  @Output() dataSourceExport :EventEmitter<Object>; 

  @ViewChild('globalsearch',  { static: true }) globalsearch: ElementRef;

  constructor(private _BgtableService : BgtableService) {
    this.isSearching = true;
    this.pageSize = 10;
    this.currentPage = 1;
    this.editarAction = new EventEmitter();
    this.eliminarAction = new EventEmitter();
    this.copiarAction = new EventEmitter();    
    this.exportarAction = new EventEmitter();    
    this.nuevoAction = new EventEmitter();  
    this.dataSourceExport = new EventEmitter();  
   }
  ngOnInit(): void {
    this.createParamsForm();
    this.loadTableData(this.tableConfig.url+'?pageSize='+this.pageSize);
    this.listenEvent();
  }
  createParamsForm(){
    this.tableConfig.columns.forEach(element => {
      if(element['searchable']){
      let theData: any = element['data'];
      let getKey = theData.split('.');
      let theKey = getKey.length > 1 ? getKey[0] : getKey[0];
      //this.formSearch.push({title: element['title'], key:element['data'], value:'', type:element['type'], options: []});
      this.formSearch.push({title: element['title'], key: theKey, value:'', type:element['type'], options: []});
    }
  });
  
  if(this.tableConfig['customFilters']){
    this.tableConfig['customFilters'].forEach(element => {
      let options = [];
      if(element['type'] == 'select'){ options = element['options']; }
      this.formSearch.push({title: element['title'], key:element['key'], value:'', type:element['type'], options: options});
  });  
  } 
  this.customFilters.forEach(item=>{
    let options = [];
    if(item['type'] == 'select'){ options = item['options']; } 
    this.formSearch.push({title: item['title'], key:item['key'], value:'', type:item['type'], options: options});
  });
  this.paramSearch = this.formSearch.map(item =>{
    return item['key'];
  })
  /*
    for(let i=0; i < this.formSearch.length; i++){
        this.paramSearch.push(this.formSearch[i]['key'])     
    }
    */
    for(let i = 0; i < this.paramSearch.length; i++){
      this.paramSearchToObject[this.paramSearch[i]] = '';
    }
  }

  listenEvent(){
    fromEvent(this.globalsearch.nativeElement, 'keyup').pipe(
      // get value
      map((event: any) => {
        return event.target.value;
      })
      // if character length greater then 2
      ,filter(res => res.length > this.lengthSize || res.length == 0 )
      // Time in milliseconds between key events
      ,debounceTime(700)        
      // If previous query is diffent from current   
      ,distinctUntilChanged()
      // subscription for response
      ).subscribe((text: string) => {
        this.currentPage = 1;
        this.loadTableData(this.tableConfig.url+'?globalsearch='+text+'&page=1&pageSize='+this.pageSize);    
      });     
  }

  cleanAdvancedSearch(){
    let keySearch = Object.keys(this.paramSearchToObject);
    keySearch.map(item =>{  this.paramSearchToObject[item]='' });
    //this.formSearch[0]['iterator'] = this.formSearch[0]['iterator']+1;
    this.advancedSearch();
  }

  iconExports(n){
    let code = {name:'code', icon:'fa fa-file-code-o'};
    let iconExport = [
      {name: "excel", icon: 'fa fa-file-excel-o'},
      {name: "pdf", icon: 'fa fa-file-pdf-o'},
      {name: "text", icon: 'fa fa-file-text'},
      {name: "csv", icon: 'fa fa-file-text'},
      {name: "imprimir", icon: 'fa fa-print'},
    ];
    let found = iconExport.find(element => element.name == n);
    if(found) return found.icon
    else 
    return code.icon;
  }

  pageChange(pag){
    this.loadTableData(this.tableConfig.url+'?page='+pag+'&pageSize='+this.pageSize);
  }
  reloadTable(){
    let searching = this.globalsearch.nativeElement.value;
    this.loadTableData(this.tableConfig.url+'?globalsearch='+searching+'&page='+this.currentPage+'&pageSize='+this.pageSize);
  }
  public onChangePaginationSize(){
    this.currentPage = 1;
    this.loadTableData(this.tableConfig.url+'?page=1&pageSize='+this.pageSize);
  }
  SearchForRowFilter(evento, columna){
    let property = columna.hasOwnProperty('data');
    if(property){  
      let theData: any = columna.data;
      let getKey = theData.split('.');
      let theKey = getKey.length > 1 ? getKey[0] : getKey[0];
       this.paramSearchToObject[theKey] = evento.target.value;
      }
      else{
        this.paramSearchToObject[columna.key] = evento.target.value;
      }
    if(evento.target.value == '') return;
  }

  public editarRow(evento:any){
    this.lastAction = 2; /* editar registro */
    this.editarAction.emit(evento);
  }
  public copiarRow(evento:any){
    this.copiarAction.emit(evento);
  }
  public eliminarRow(evento:any){
    this.lastAction = 3; /* eliminar registro */
    this.eliminarAction.emit(evento);
  }
  public nuevoRegistro(evento:any){
    this.lastAction = 1; /* nuevo registro */
    this.nuevoAction.emit(evento);
  }  
  public verFormulario(){
    console.log(this.formSearch);
  }
  public exportar(evento:any){
    this.paramSearchToObject['export'] = evento;
    this.exportarAction.emit(this.paramSearchToObject);
  }

  exportarSource(){
    if(this.template){
      this.dataSourceExport.emit(this.dataSource);
    }
  }
      

  public advancedSearch(){
    this.onChangePaginationSize();
  }
  searchForRow(){
    this.onChangePaginationSize();
  }
  dateSeleccionado(dato){
  }

  reload( data){
    //param == false ? this.reloadTable() : this.onChangePaginationSize() ;
    if(this.lastAction == 1){ /*nuevo registro */
      this.dataSource.unshift(data)
    }
      /*editar registro */
    if(this.lastAction == 2){ this.updateTable(data) }
    /*eliminar registro */
    if(this.lastAction == 3){ this.deleteRowtable(data) }
  }

  updateTable(data){
   //const theKey = this.pkey===undefined ? 'id' : this.pkey;
   const theKey = this.pkey;
   const actualizar = this.dataSource.map(item =>{    
      if(data[theKey] === item[theKey]){ item = data;  return item; }
      return item;
    })
    this.dataSource = actualizar;
    this.exportarSource();
  }
  deleteRowtable(data){
    //const theKey = this.pkey===undefined ? 'id' : this.pkey;
    const theKey = this.pkey;
    this.dataSource = this.dataSource.filter(obj => obj[theKey] !== data[theKey]);
  }

  loadTableData(url){
    this.isSearching = true;
    this._BgtableService.getLista(url, this.paramSearchToObject)
     .subscribe(
       (res: any)=>{
         this.dataSource = res.data;
         this.totalRecords = res.total;
         this.from = res.from;
         this.to = res.to;
         this.exportarSource();
       },
       (error:any) => {
             console.log("ha ocurrido un error en bgtable component ");
             console.log("error ",error);
       },
       () => this.isSearching = false
     )
  }

}
