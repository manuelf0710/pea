import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AdmonRoutingModule } from "./admon-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { JwtInterceptor } from "../auth/guards/jwt.interceptor";
import { AuthTokenInterceptor } from "../auth/services/authtokeninterceptor.service";
import { ErrorInterceptor } from "../auth/guards/error.interceptor";
import { fakeBackendProvider } from "../auth/guards/fake-backend";

import { SharedModule } from "../shared/shared.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { UsuariosComponent } from "./components/usuarios/usuarios.component";
import { CrearusuarioComponent } from './components/usuarios/crear/crearusuario/crearusuario.component';

@NgModule({
  declarations: [UsuariosComponent, CrearusuarioComponent],
  imports: [
    CommonModule,
    AdmonRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    fakeBackendProvider,
  ],
})
export class AdmonModule {}
