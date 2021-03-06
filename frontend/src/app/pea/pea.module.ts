import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeaRoutingModule } from './pea-routing.module';
import { IndexComponent } from './components/index/index.component';
import { CrearOdsComponent } from './components/crear-ods/crear-ods.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    IndexComponent,
    CrearOdsComponent
  ],
  imports: [
    CommonModule,
    PeaRoutingModule,
    SharedModule,
  ]
})
export class PeaModule { }
