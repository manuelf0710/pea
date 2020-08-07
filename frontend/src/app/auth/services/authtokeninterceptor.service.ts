import {Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   
    //let getjwt = JSON.parse(localStorage.getItem('token'));
    let getjwt = localStorage.getItem('token');
    if (getjwt) {
    const jwt = getjwt;
    if (!!jwt) {
     req = req.clone({
       setHeaders: {
         Authorization: `Bearer ${jwt}`
       }
     });
   }
   //return next.handle(req);
}else{
    this.authenticationService.logout();
    this.router.navigate(['/login']);
}
return next.handle(req);
 }
}