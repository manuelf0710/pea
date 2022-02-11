import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef  } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, filter } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
//import { of } from "rxjs";
import { environment } from './../../../../environments/environment';

import { Datatable } from './datatable';
import { PaginateService } from './paginate.service';

import { Paginate } from './modelpaginate';

@Component({
  selector: 'app-datatablescustom',
  templateUrl: './datatablescustom.component.html',
  styles: []
})
export class DatatablescustomComponent implements OnInit {
  formulario: FormGroup;
  public columns : any[];
  public url_datatables: any;
  public acciones: any;
  public dataSource : any[];
  //public counter = 0;
  public api_url = environment.server_root;
  //public searchParam: any = '';
  public start : number;
  public totalRows:number;
  public pageTo:number;
  public pageSize: number;
  public pageLength = [
    10,20,50,100
  ];
  public arrlinks : any[]= [];
  public dataPaginacion:Paginate;
  public draw = 0;
  public lastAction :any;
  @Input() url_datatable : string = null;
  @Input() dataPagination : any[] = [];
  @Input() datatables_config: Datatable;

  @Output() editarAction :EventEmitter<Object>;
  @Output() eliminarAction :EventEmitter<Object>;
  @Output() copiarAction :EventEmitter<Object>;
  

  
  @ViewChild('movieSearchInput',  { static: true }) movieSearchInput: ElementRef;
  isSearching:boolean = true;
  allSearch: boolean = true;

  constructor(private FormBuilder: FormBuilder, private httpClient: HttpClient, private _PaginateService: PaginateService) { 
    this.dataSource = [];
    this.editarAction = new EventEmitter();
    this.eliminarAction = new EventEmitter();
    this.copiarAction = new EventEmitter();
    this.pageSize = 20;
    //this.dataPaginacion = {currentpage : 0, totalpage : 0, recordsPerPage: this.pageSize};
  }

  ngOnInit(): void {
    this.acciones = this.datatables_config.acciones;
    this.columns = this.datatables_config.columns;
    this.url_datatables = this.datatables_config.urlDatatables;
    this.allSearch = this.datatables_config.allSearch;
    this.dataPaginacion = {currentpage : 1, totalpage : 0, recordsPerPage: this.pageSize};
    //this.dataSource = [];
    this.buildForm();
  }
  goPage(evento){
    this.dataPaginacion.currentpage = evento.id;
    this.loadDatatable();
  }

  private buildForm() {
    this.loadDatatable();
    fromEvent(this.movieSearchInput.nativeElement, 'keyup').pipe(
      // get value
      map((event: any) => {
        return event.target.value;
      })
      // if character length greater then 2
      ,filter(res => res.length > 2 || res.length == 0 )
      // Time in milliseconds between key events
      ,debounceTime(700)        
      // If previous query is diffent from current   
      ,distinctUntilChanged()
      // subscription for response
      ).subscribe((text: string) => {
        this.isSearching = true;
        this.dataPaginacion.currentpage = 1;
        this.searchGetCall(text).subscribe((res)=>{

          this.start = 0;
          this.dataPaginacion.totalpage = Math.ceil(res.recordsFiltered / this.pageSize);
          this.totalRows = res.recordsFiltered;
          this.arrlinks = this._PaginateService.paginate(this.dataPaginacion);
          this.pageTo =  this.totalRows <= this.pageSize  ? res.recordsFiltered : this.pageSize * this.dataPaginacion.currentpage;
          this.dataSource = res.data
          this.isSearching = false;
        },(err)=>{
          this.isSearching = false;
          console.log('error',err);
        });
      });     
    
  }
  public onChangePaginationSize(){
    this.dataPaginacion.currentpage = 1;
    this.loadDatatable();
  }

  public drawInitDataTable(){
    this.dataPaginacion.currentpage = 1;
    this.movieSearchInput.nativeElement.value = '';
    this.loadDatatable();    
  }

  public loadDatatable(){
    this.isSearching = true;
    let text = '';
    this.searchGetCall(text).subscribe((res)=>{
      this.dataPaginacion.totalpage = Math.ceil(res.recordsFiltered / this.pageSize);
      //this.dataPaginacion.currentpage = 1;
      this.arrlinks = this._PaginateService.paginate(this.dataPaginacion);
      this.totalRows = res.recordsFiltered;
      this.pageTo =  this.totalRows <= this.pageSize  ? res.recordsFiltered : (this.pageSize * this.dataPaginacion.currentpage > this.totalRows ? this.totalRows : this.pageSize * this.dataPaginacion.currentpage);
      this.dataSource = res.data
      this.isSearching = false;
    },(err)=>{
      this.isSearching = false;
      console.log('error',err);
    });    
    } 

  searchGetCall(term: string) {
    let params_query = this.addAjaxParams(this.datatables_config);
    /*if (term === '') {
      return of([]);
    } */
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      //'Authorization': 'Bearer ' + this.token
  });
    return this.httpClient.get<any>(`${this.url_datatables}`+params_query,   { headers: headers });
  }

  searchRedraw() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      //'Authorization': 'Bearer ' + this.token
  });
    return this.httpClient.get<any>(`${this.url_datatables}`+this.lastAction,   { headers: headers });
  }  

  public editarRow(evento:any){
    this.editarAction.emit(evento);
  }
  public copiarRow(evento:any){
    this.copiarAction.emit(evento);
  }
  public eliminarRow(evento:any){
    this.eliminarAction.emit(evento);
  }
  public reload(param){
    param == false ? this.redraw() : this.drawInitDataTable() ;
  }  
  public redraw(){
    this.isSearching = true;
    this.searchRedraw().subscribe((res)=>{
      this.dataPaginacion.totalpage = Math.ceil(res.recordsFiltered / this.pageSize);
      this.arrlinks = this._PaginateService.paginate(this.dataPaginacion);
      this.totalRows = res.recordsFiltered;
      this.pageTo =  this.totalRows <= this.pageSize  ? res.recordsFiltered : (this.pageSize * this.dataPaginacion.currentpage > this.totalRows ? this.totalRows : this.pageSize * this.dataPaginacion.currentpage);
      this.dataSource = res.data
      this.isSearching = false;
    },(err)=>{
      this.isSearching = false;
      console.log('error',err);
    });     
  }

  public testDatacustom(){
    console.log("desde data custom lastAction", this.lastAction);
  }

  addAjaxParams(settings){
    let columns = settings.columns,
        columnCount = columns.length;
    let data;

    var param = function ( name, value ) {
		 data.push( { 'name': name, 'value': value } );
    };

    let d = {
			draw:    this.draw,
			columns: [],
			order:   [],
			start:  0,
			length:  this.pageSize,
			search:  {
				value: '',
				regex: ''
			}
    };

    for (let i=0 ; i<columnCount ; i++ ) {
     let column = columns[i];
     let columnSearch = column.searchable;
     let dataProp = typeof column.data=="function" ? 'function' : column.data ;
      d.columns.push( {
        data:       dataProp,
        name:       column.data,
        searchable: column.searchable,
        orderable:  column.orderable,
        search:     {
          value: columnSearch.sSearch,
          regex: false
        }
      } );
    }
    
  let response =this.createString(columnCount, d.columns );
  return response;

 } 

  createString(columnCount, columns){
    let dataAjax = [];
    let tmp = {};
        for(let i=0; i< columnCount; i++){
          tmp[columns[i].searchable] = columns[i]['searchable'];
          dataAjax.push(tmp);
        } 
        this.draw++;
        this.start = this.dataPaginacion.currentpage == 1 ? 0 : (this.dataPaginacion.currentpage -1) * this.pageSize;
        let texto = '?draw='+this.draw+'&start='+this.start+'&length='+this.pageSize+'&search[value]='+this.movieSearchInput.nativeElement.value+'&search[regex]=false';
        for(let i=0; i< columnCount; i++){  
            texto = texto+'&columns['+i+'][data]='+i+'&columns['+i+'][name]='+columns[i]['data']+'&columns['+i+'][searchable]='+columns[i]['searchable'];
        }
        this.lastAction = texto;
       return texto;
   }



}