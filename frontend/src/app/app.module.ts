import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {BreadcrumbModule} from 'xng-breadcrumb';
import { SharedModule  } from './shared/shared.module';
import { MaterialModule } from './material/material.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { fakeBackendProvider } from './auth/guards/fake-backend';
import { ErrorInterceptor } from './auth/guards/error.interceptor';
import { JwtInterceptor } from './auth/guards/jwt.interceptor';
import { AuthTokenInterceptor } from './auth/services/authtokeninterceptor.service';


import { HeaderComponent } from './template/header/header.component';
import { SidebarComponent } from './template/sidebar/sidebar.component';
import { InicioComponent } from './inicio/inicio.component';
import { LoginComponent } from './auth/components/login/login.component';
import { OtroComponent } from './otro/otro.component';
import { HomeComponent } from './home/home/home.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    InicioComponent,
    LoginComponent,
    OtroComponent,
    //FilterforPipe,
    HomeComponent, 
  ],
  imports: [
    BrowserModule,
	MaterialModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgbModule,
    FormsModule,
	ReactiveFormsModule,
    HttpClientModule,
    SharedModule.forRoot(),
	BreadcrumbModule ,
  ],
  exports:[
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
  ],  
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },  
   fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
