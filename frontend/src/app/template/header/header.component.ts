import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './../../auth/services/authentication.service';
import { User } from './../../auth/models/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser: User;
  @Input() inputSideNav: any;

  constructor(
    private router: Router,
  	private authenticationService: AuthenticationService
  ) { 
     this.authenticationService.currentUser.subscribe(x => this.currentUser = x );
  }

  ngOnInit() {
  }
  logout() {
    this.inputSideNav.close();
    this.authenticationService.logout();
    this.router.navigate(['/login']);
}  

}
