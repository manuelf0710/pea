import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudListarComponent } from './solicitud-listar.component';

describe('SolicitudListarComponent', () => {
  let component: SolicitudListarComponent;
  let fixture: ComponentFixture<SolicitudListarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitudListarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
