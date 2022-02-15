import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PeaRoutingModule } from "./pea-routing.module";
import { IndexComponent } from "./components/index/index.component";
import { CrearOdsComponent } from "./components/crear-ods/crear-ods.component";
import { SolicitudComponent } from "./components/solicitud/solicitud.component";
import { SharedModule } from "../shared/shared.module";
import { ProgramarAgendaComponent } from "./components/programaragenda/programaragenda.component";
import { TipoproductosService } from "../services/tipoproductos.service";
import { TipoproductosuserService } from "../services/tipoproductosuser.service";
import { ComunService } from "../services/comun.service";
import { SolicitudListarComponent } from './components/solicitud-listar/solicitud-listar.component';
import { GenerarAgendaComponent } from './components/generar-agenda/generar-agenda.component';

@NgModule({
  declarations: [
    IndexComponent,
    CrearOdsComponent,
    SolicitudComponent,
    ProgramarAgendaComponent,
    SolicitudListarComponent,
    GenerarAgendaComponent,
  ],
  imports: [CommonModule, PeaRoutingModule, SharedModule],
  providers: [TipoproductosService, TipoproductosuserService, ComunService],
})
export class PeaModule {}
