import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { LoginComponent } from './auth/components/login/login.component';
import { OtroComponent } from './otro/otro.component';
import { AuthGuard } from './auth/guards/auth.guard';

import { HomeComponent } from './home/home/home.component';


//const routes: Routes = [];
const routes: Routes = [
  { path: '', 
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: {
        label: 'inicio',
        info: {  icon: 'fa fa-home', iconType: 'bootstrap', label: 'Inicio' }
      },
      
    },
    children : [
      {
        path: '',
        component: InicioComponent,
        canActivate: [AuthGuard],
        pathMatch: 'full',
        data: {
          breadcrumb: {
            label: 'inicio',
            info: {  icon: 'fa fa-home', iconType: 'bootstrap', label: 'Inicio' }
        }
        }        
    },
      {
        path: 'pea',
        loadChildren: () => import('./pea/pea.module').then(m => m.PeaModule),
        canActivate: [AuthGuard],
        data: {
          breadcrumb: { 
            label:'pea',
            info:{icon: 'fa fa-arrow-fa-asterisk-down', iconType: 'bootstrap', label:'pea' }
         }
        }
     }
    ]
  },

  { path: 'dashboard', component: InicioComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
