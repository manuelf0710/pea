import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatChipsModule} from '@angular/material/chips';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    MatChipsModule
    
  ],
  exports:[
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    MatChipsModule
  ],
 // schemas: [ CUSTOM_ELEMENTS_SCHEMA ], 
})
export class MaterialModule { 
  static forRoot(): ModuleWithProviders<any> {
    return {
      ngModule: MaterialModule,
      //providers: [ UtilService ]
    };
  }  

}
