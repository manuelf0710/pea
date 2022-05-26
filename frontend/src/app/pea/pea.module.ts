import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { PeaRoutingModule } from "./pea-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { JwtInterceptor } from "../auth/guards/jwt.interceptor";
import { AuthTokenInterceptor } from "../auth/services/authtokeninterceptor.service";
import { ErrorInterceptor } from "../auth/guards/error.interceptor";
import { fakeBackendProvider } from "../auth/guards/fake-backend";

import { IndexComponent } from "./components/index/index.component";
import { CrearOdsComponent } from "./components/crear-ods/crear-ods.component";
import { SolicitudComponent } from "./components/solicitud/solicitud.component";
import { SharedModule } from "../shared/shared.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ProgramarAgendaComponent } from "./components/programaragenda/programaragenda.component";
import { TipoproductosService } from "../services/tipoproductos.service";
import { TipoproductosuserService } from "../services/tipoproductosuser.service";
import { ComunService } from "../services/comun.service";
import { ProductosrepsoService } from "./services/productosrepso.service";
import { SolicitudListarComponent } from "./components/solicitud-listar/solicitud-listar.component";
import { GenerarAgendaComponent } from "./components/generar-agenda/generar-agenda.component";
import { ProductorepsodetallesprodComponent } from "./components/productorepsodetallesprod/productorepsodetallesprod.component";
import { ProductoService } from "./services/producto.service";
import { ClienteService } from "../services/cliente.service";
import { AgendaService } from "../services/agenda.service";

import { FullCalendarModule } from "@fullcalendar/angular";
import { NuevaAgendaProfesionalComponent } from "./components/generar-agenda/crear/nueva-agenda-profesional/nueva-agenda-profesional.component";
import { NuevacitaComponent } from './components/productorepsodetallesprod/nuevacita/nuevacita.component';
import { EditarComponent } from './components/solicitud-listar/editar/editar.component';

@NgModule({
  declarations: [
    IndexComponent,
    CrearOdsComponent,
    SolicitudComponent,
    ProgramarAgendaComponent,
    SolicitudListarComponent,
    GenerarAgendaComponent,
    ProductorepsodetallesprodComponent,
    NuevaAgendaProfesionalComponent,
    NuevacitaComponent,
    EditarComponent,
  ],
  imports: [
    CommonModule,
    PeaRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
  ],
  providers: [
    TipoproductosService,
    TipoproductosuserService,
    ComunService,
    ProductoService,
    ProductosrepsoService,
    ClienteService,
    AgendaService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    fakeBackendProvider,
  ],
})
export class PeaModule {}
