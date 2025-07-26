import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelMultiSolicitudPersonaComponent } from './excel-multi-solicitud-persona.component';

describe('ExcelMultiSolicitudPersonaComponent', () => {
  let component: ExcelMultiSolicitudPersonaComponent;
  let fixture: ComponentFixture<ExcelMultiSolicitudPersonaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExcelMultiSolicitudPersonaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelMultiSolicitudPersonaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
