import { Injectable, EventEmitter } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { map, mergeMap } from "rxjs/operators";

import { environment } from "./../../../environments/environment";

import { User } from "./../../auth/models/user";

declare var $: any;
//declare var jQuery:any;

@Injectable({ providedIn: "root" })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  /*
    private currentMenuSubject: BehaviorSubject<any>;
    public currentMenu: Observable<any>;*/

  //public menu_page$ = new EventEmitter<{}>();

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem("currentUser"))
    );
    this.currentUser = this.currentUserSubject.asObservable();
    /*
        this.currentMenuSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('modulo')));
        this.currentMenu = this.currentMenuSubject.asObservable();  */
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }
  /*
    public get currentMenuValue(): any {
        return this.currentMenuSubject.value;
    }*/

  login(email: string, password: string) {
    //return this.http.post<any>(`${environment.apiUrl}/users/authenticate`, { username, password })
    return this.http
      .post<any>(environment.apiUrl + environment.auth.postLogin, {
        email,
        password,
      })
      .pipe(
        map((user) => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.setDataToLocalStorage(user)
          return user.token.original.user;
        })
      );
  }
  setDataToLocalStorage(user){
    localStorage.setItem(
      "currentUser",
      JSON.stringify(user.token.original.user)
    );
    localStorage.setItem("modulos", JSON.stringify(user.data.modulos));
    localStorage.setItem("token", user.token.original.access_token);
    this.currentUserSubject.next(user.token.original.user);
  }

  refreshToken(params) {
    return this.http
      .post<any>(environment.apiUrl + environment.auth.refreshToken, { params })
      .pipe(
        map((user) => {
          console.log("el token dentro del servicio authenticate ",user);
          //localStorage.setItem("token", user.token);
          this.setDataToLocalStorage(user)
          return user.token;
        })
      );
    //return this.http.post(`${environment.apiUrl}/auth/refresh`, {params});
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem("currentUser");
    localStorage.removeItem("modulos");
    localStorage.removeItem("token");
    this.currentUserSubject.next(null);
    //this.currentMenuSubject.next(null);
  }
}
