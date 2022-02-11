import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError,first, mergeMap } from 'rxjs/operators';

import { AuthenticationService } from './../services/authentication.service';
import { environment } from './../../../environments/environment';

@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
    constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            console.log('status en refreshtoken interceptor '+err.status);
            if (err.status === 500) {
                if (err.error.message == "The token has been blacklisted") {
                    this.authenticationService.logout();
                    location.reload(true);
                }                
            }
            if (err.status === 401) {

                if (err.error.message == "Token Signature could not be verified.") {
                    this.authenticationService.logout();
                    location.reload(true);
                }
                if (err.error.message == "Token has expired") {
                let params = {
                    token: localStorage.getItem('token'),
                    refreshToken: localStorage.getItem('token')
                  };
     
                  /*return  this.http.post<any>(`${environment.apiUrl}/auth/refresh`, { params })
                  .pipe(mergeMap(data => {
                      localStorage.setItem('token', data.token);  
                      const cloneRequest = request.clone({setHeaders: {'Authorization': `Bearer ${data.token}`}});         
                      return next.handle(cloneRequest);
                    })); */
                   return this.authenticationService.refreshToken(params)
                    .pipe(mergeMap( token => {
                        //localStorage.setItem('token', token);
                        const cloneRequest = request.clone({setHeaders: {'Authorization': `Bearer ${token}`}});         
                        return next.handle(cloneRequest);
                    }));
                }               
            }

            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }
}