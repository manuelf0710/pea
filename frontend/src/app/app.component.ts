import { Component,ElementRef,  OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import {Router, NavigationStart, NavigationEnd} from '@angular/router';
import { User } from './auth/models/user';
import { AuthenticationService } from './auth/services/authentication.service';
import { BreadcrumbService } from 'xng-breadcrumb';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Frontend';
  currentUser: User;
  currentYear:number;

  constructor(
    private authenticationService: AuthenticationService,
    private _router: Router,
    private breadcrumbService: BreadcrumbService 
  ) { 
     this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
     const d = new Date();
     this.currentYear = d.getFullYear();
  }  

  ngOnInit() {
    this._router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });	  
	
  }

  ngAfterViewInit() {	
	
  }  
}
