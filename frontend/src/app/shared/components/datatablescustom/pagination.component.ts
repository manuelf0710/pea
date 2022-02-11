import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Paginate } from './modelpaginate';
import { PaginateService } from './paginate.service';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styles: []
})
export class PaginationComponent implements OnInit {
  //@Input() dataPag : Paginate;
  @Input() links : any;
  @Output() goPage: EventEmitter<Object>; /*Evento que emite la pagina a buscar */
  /*public current: number = 0;
  public totalpage: number = 0;
  public recordsPerPage: number = 0;
  public linksCountLimit: number = 2; */
  //public arrlinks: any[] = [];

  constructor(public _PaginateService: PaginateService) { 
    this.goPage = new EventEmitter();
  }

  ngOnInit(): void {
    //this.dataPag = this._PaginateService.paginate(this.dataPag);
  }
  public goToPage(evento:any){
    this.goPage.emit(evento);
  }
}