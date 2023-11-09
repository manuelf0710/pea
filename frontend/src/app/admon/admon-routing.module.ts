import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./../auth/guards/auth.guard";
import { UsuariosComponent } from "./components/usuarios/usuarios.component";

const routes: Routes = [
  {
    path: "",
    component: UsuariosComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: {
        label: "admon",
        info: {
          icon: "fa fa-caret-square-o-up",
          iconType: "bootstrap",
          label: "admon",
        },
      },
    },
    children: [
      {
        path: "users",
        component: UsuariosComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: {
            label: "Usuarios",
            info: {
              icon: "fa fa-caret-square-o-up",
              iconType: "bootstrap",
              label: "Usuarios",
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
export class AdmonRoutingModule {}
