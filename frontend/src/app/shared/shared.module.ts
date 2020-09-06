import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { LoadingComponent } from './components/loading/loading.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';

import { UtilService } from './services/util.service';
import { FilterforPipe } from './pipes/filterfor';
import { sanitizeHtmlPipe } from './pipes/safehtml';
import { ToastService } from './services/toast.service';



import { FileUploadModule } from 'ng2-file-upload';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { DatatablescustomComponent } from './components/datatablescustom/datatablescustom.component';
import { PaginationComponent } from './components/datatablescustom/pagination.component';
import { TablevaluePipe } from './components/datatablescustom/tablevalue.pipe';
import { SelectionlistComponent } from './components/selectionlist/selectionlist.component';
import { BgtableComponent } from './components/bgtable/bgtable.component';
import { ToastsContainerComponent } from './components/toasts-container/toasts-container.component';

import { CustomAdapter, CustomDateParserFormatter, CustomDatepickerI18n, I18n  } from './services/datepicker.adapter';
import {
  NgbCalendar,
  NgbDateAdapter,
  NgbDateStruct,
  NgbDateParserFormatter,
  NgbDatepickerI18n,
} from '@ng-bootstrap/ng-bootstrap';
import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { BuscarProductoComponent } from './components/buscar-producto/buscar-producto.component';


@NgModule({
  declarations: [
    LoadingComponent, 
    BreadcrumbComponent, 
    FilterforPipe,
    sanitizeHtmlPipe,
    FileUploadComponent, 
    DatatablescustomComponent, 
    TablevaluePipe, 
    PaginationComponent, SelectionlistComponent, BgtableComponent, ToastsContainerComponent, AutocompleteComponent, BuscarProductoComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
	  ReactiveFormsModule,    
    NgbModule,
    FileUploadModule,
  ],
  exports:[
    FilterforPipe,
    sanitizeHtmlPipe,
    TablevaluePipe,
    LoadingComponent,
    FileUploadComponent,
    DatatablescustomComponent,
    PaginationComponent,
    BgtableComponent,
    ToastsContainerComponent,
    AutocompleteComponent,
    BuscarProductoComponent,

  ],
  providers:[
    //FilterforPipe
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],  
})
export class SharedModule { 
  static forRoot(): ModuleWithProviders<any> {
    return {
      ngModule: SharedModule,
      providers: [
         UtilService,
         ToastService,
         I18n,
         {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n},
         {provide: NgbDateAdapter, useClass: CustomAdapter},
         {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
        ]
    };
  }  
}
