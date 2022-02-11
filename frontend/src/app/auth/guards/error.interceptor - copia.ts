import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError,first } from 'rxjs/operators';

import { AuthenticationService } from './../services/authentication.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            console.log('status '+err.status);
            if (err.status === 401) {
                if (err.error.message == "Token has expired") {
                // auto logout if 401 response returned from api
                //this.authenticationService.logout();
                //location.reload(true);
                //let currentUser = this.authenticationService.currentUserValue;
                let params = {
                    token: localStorage.getItem('token'),
                    refreshToken: localStorage.getItem('token')
                  };
                  this.authenticationService.refreshToken(params)
                    .pipe(first())
                    .subscribe(
                        data => {
                            //if (data.status == 200) {
                            if (data) {
                                request = request.clone({
                                    setHeaders: {
                                        Authorization: `Bearer ${data.token}`
                                    }
                                });
                                return next.handle(request).pipe(catchError(err => {
                                    const error = err.error.message || err.statusText;
                                    return throwError(error);
                                }))
                                                            
                            }else{
                               // this.authenticationService.logout();
                                //location.reload(true);                                
                            }

                        },
                        error => {

                        }

                    ); 
                }               
            }

            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }
}