import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { JwtInterceptor } from "../auth/guards/jwt.interceptor";
import { AuthTokenInterceptor } from "../auth/services/authtokeninterceptor.service";
import { ErrorInterceptor } from "../auth/guards/error.interceptor";
import { fakeBackendProvider } from "../auth/guards/fake-backend";
import { MAT_DATE_LOCALE } from "@angular/material/core";

import { SharedModule } from "../shared/shared.module";

import { ReportsRoutingModule } from "./reports-routing.module";
import { ReportproductoComponent } from "./pages/reportproducto/reportproducto.component";

import { ExportService } from "../services/exports.service";
import { FileSaverModule } from "ngx-filesaver";

@NgModule({
  declarations: [ReportproductoComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportsRoutingModule,
    SharedModule,
    FileSaverModule,
  ],
  providers: [
    ExportService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: "es-ES" },
    fakeBackendProvider,
  ],
})
export class ReportsModule {}
