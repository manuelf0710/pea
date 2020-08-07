import { Injectable } from '@angular/core';
import { Paginate } from './modelpaginate';

@Injectable({
  providedIn: 'root'
})
export class PaginateService {
  public dataPag :Paginate;
  public current: number;
  public totalpage: number;
  public recordsPerPage: number;
  public linksCountLimit: number;
  private arrlinks: any[];  

  constructor() { 
    this.arrlinks = [];
  }

  paginate(dataPag){
    this.current = dataPag.currentpage;
    this.totalpage = dataPag.totalpage;
    this.recordsPerPage = dataPag.recordsPerPage;
    this.linksCountLimit = 3;
    this.arrlinks = [];
    if(this.totalpage==0) {this.totalpage =1; }
    if(this.current==0) {this.current =1; }
    this.current ==0 ? 1 :  this.current;
    let cssclase = 'SBRA2';
    let fuente = '';

				// if the current page is not the first
				if (this.current > 1) {					
					let count = 1;
					for(let j = this.current; j >= 1; j-- ) {
						if (count > this.linksCountLimit){
							break;
							
						};						
						if (j == this.current){							
							continue;
						};
						count ++;
						this.arrlinks.unshift({'url': fuente+'/page/'+j, 'id': j, 'clase': cssclase, 'label': j , 'selec': 0});
						
						
					}
					
					//previous page link
					let prevPage = this.current - 1;
					this.arrlinks.unshift({'url': fuente+'/page/'+prevPage, 'id': prevPage, 'clase': cssclase, 'label': '«' , 'selec': 0});
					
					if (prevPage > 1){
						// first page link
						this.arrlinks.unshift({'url':fuente+'/page/1', 'id': 1, 'clase': cssclase, 'label': '« «' , 'selec': 0});
					}	
				}	
          			this.arrlinks.push({'url':'', 'id': '', 'clase': 'current', 'label': this.current , 'selec': 1});
					// next pages
					let count = 1;
					
				for(let i = this.current; i < this.totalpage; i ++) {
					if (count > this.linksCountLimit){
						break;
					}
					if (i == this.current){
						continue;
          }
					count ++;
					this.arrlinks.push({'url': fuente+'/page/'+i, 'id': i, 'clase': cssclase, 'label': i , 'selec': 0});
				}
				
				if (this.current < this.totalpage) {
					// next link
					let next = this.current + 1;
          			this.arrlinks.push({'url': fuente+'/page/'+next, 'id': next, 'clase': cssclase, 'label': '»' , 'selec': 0});
          
					
					if (this.totalpage != next){
						// last page link
            			this.arrlinks.push({'url': fuente+'/page/'+this.totalpage, 'id': this.totalpage, 'clase': cssclase, 'label': '» »' , 'selec': 0});	
					}					
				}
    return this.arrlinks;
  }  
}
