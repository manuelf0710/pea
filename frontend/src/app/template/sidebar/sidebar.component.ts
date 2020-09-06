import { Observable } from 'rxjs';
import {filter} from 'rxjs/operators';


import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { AuthenticationService } from './../../auth/services/authentication.service';
import { User } from './../../auth/models/user';
import {Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
//declare var $:any;
//declare var jQuery:any;
import { UtilService } from './../../shared/services/util.service';



@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent implements OnInit {
  currentUser: User;
  openMenu = '';
  //public urlapp:  Observable<any>;
  public urlapp;
  /*
  public pages_menu = [
                        {heading:false, page: 'tabs', url:'pageuno', icon:'sidebar-item-icon fa fa-file-text', hijos:[]},
                        {heading:true, page: 'tables', url:'pagedos', icon:'sidebar-item-icon fa fa-file-text', hijos:[
                                                                                                          {page: 'hijo uno', url:'hijouno'},
                                                                                                          {page: 'hijo dos', url:'hijodos'}
                                                                                                         ]
                        },
                        { heading:false, page: 'cards', url:'pagetres', icon:'sidebar-item-icon fa fa-file-text', hijos:[]}
                      ];
*/
//public pages_menu:{} = [];

  public pages_menu:{} = [
                        {heading:false, page: 'Programar ODS', url:'pea', hijos:[]},
                        {heading:true, page: 'With SubItems', url:'subitems',hijos:[
                                                                                                          {page: 'SubItem uno', url:'subitem1'},
                                                                                                          {page: 'SubItem dos', url:'subitem2'}
                                                                                                         ]
                        },
                        { heading:false, page: 'other linl', url:'other link',  hijos:[]}
                      ];
  /*public pages_menu2:{} = [
                        {heading:false, page: 'tabs menu22222 manuelf', url:'pageuno', hijos:[]},
                        {heading:true, page: 'tables', url:'pagedos',hijos:[
                                                                                                          {page: 'hijo uno', url:'hijouno'},
                                                                                                          {page: 'hijo dos', url:'hijodos'}
                                                                                                         ]
                        },
                        { heading:false, page: 'cards', url:'pagetres',  hijos:[]}
                      ];*/

  constructor(
    private authenticationService: AuthenticationService,
    public _router: Router,
    private activatedRoute : ActivatedRoute,
    private UtilService: UtilService,
  ) { 
     this.authenticationService.currentUser.subscribe(x => this.currentUser = x);    
  }

  goTo(url, event:Event)
  {
    event.stopPropagation()
    this.UtilService.goTo(url);
  }

  ngOnInit() {
    this.activatedRoute.url.subscribe(url =>{
      this.urlapp = url[0].path;
      this._router.events.pipe(
        filter(event => event instanceof NavigationEnd)
    )
        .subscribe(event => {
            let modulo_menu = [];
            modulo_menu = JSON.parse(localStorage.getItem('modulos'));
            console.log("antes del ");
			if(event instanceof NavigationEnd ){
        console.log("despues del");
              let modulo = event.url.split("/");
              let find = false;
              if(modulo_menu){
              modulo_menu.forEach(element => {
                console.log("en el foreach");
                if(element.url == modulo[1]){
                  console.log("filtrado dentro del foreach");
                  this.pages_menu = element.pages_menu;
                  find = true;
                }
              });
              if(!find){
               // this.authenticationService.currentMenu = this.pages_menu;
              }
            } 
          }

        });

      });    
  }

  openSubmenu(id){
    this.openMenu = this.openMenu == id ? '' : id;
  }

  ngAfterViewInit() {   
  }
}