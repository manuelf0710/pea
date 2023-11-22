import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./../auth/guards/auth.guard";
import { ReportproductoComponent } from "./pages/reportproducto/reportproducto.component";

const routes: Routes = [
  {
    path: "",
    component: ReportproductoComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: {
        label: "Reportes",
        info: {
          icon: "fa fa-caret-square-o-up",
          iconType: "bootstrap",
          label: "reportes",
        },
      },
    },
  }, //,
  //{ path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
