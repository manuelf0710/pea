import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./../auth/guards/auth.guard";
import { IndexComponent } from "./components/index/index.component";
import { CrearOdsComponent } from "./components/crear-ods/crear-ods.component";
import { SolicitudComponent } from "./components/solicitud/solicitud.component";
import { ProgramarAgendaComponent } from "./components/programaragenda/programaragenda.component";
import { SolicitudListarComponent } from "./components/solicitud-listar/solicitud-listar.component";
import { GenerarAgendaComponent } from "./components/generar-agenda/generar-agenda.component";
import { ProductorepsodetallesprodComponent } from "./components/productorepsodetallesprod/productorepsodetallesprod.component";

const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuard],
    data: {
      breadcrumb: {
        label: "pea",
        info: {
          icon: "fa fa-caret-square-o-up",
          iconType: "bootstrap",
          label: "pea",
        },
      },
    },
    children: [
      {
        path: "",
        component: IndexComponent,
        canActivate: [AuthGuard],
        //pathMatch: 'full'
        data: {
          breadcrumb: {
            label: "pea",
            info: {
              icon: "fa fa-caret-square-o-up",
              iconType: "bootstrap",
              label: "pea",
            },
          },
        },
      },
      {
        path: "progods",
        component: CrearOdsComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: {
            label: "Crear Ods",
            info: {
              icon: "fa fa-caret-square-o-up",
              iconType: "bootstrap",
              label: "Crear ODS",
            },
          },
        },
      },
      {
        path: "solicitud",
        component: SolicitudComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: {
            label: "Solicitud",
            info: {
              icon: "fa fa-caret-square-o-up",
              iconType: "bootstrap",
              label: "Crear ODS",
            },
          },
        },
      },
      {
        path: "solicitudes",
        component: SolicitudListarComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: {
            label: "Solicitud Lista",
            info: {
              icon: "fa fa-caret-square-o-up",
              iconType: "bootstrap",
              label: "Crear ODS",
            },
          },
        },
      },
      {
        path: "generar",
        component: GenerarAgendaComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: {
            label: "Generar Agenda",
            info: {
              icon: "fa fa-caret-square-o-up",
              iconType: "bootstrap",
              label: "Crear ODS",
            },
          },
        },
      },
      {
        path: "programar",
        component: ProgramarAgendaComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: {
            label: "Programar Agenda",
            info: {
              icon: "fa fa-caret-square-o-up",
              iconType: "bootstrap",
              label: "Crear ODS",
            },
          },
        },
      },

      {
        path: "solicitudproductos",
        component: ProductorepsodetallesprodComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: {
            label: "Solicitud-productos",
            info: {
              icon: "fa fa-caret-square-o-up",
              iconType: "bootstrap",
              label: "solicitud-Productos",
            },
          },
        },
      },
    ],
  }, //,
  //{ path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeaRoutingModule {}
