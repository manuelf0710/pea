import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonasolicitudComponent } from './personasolicitud.component';

describe('PersonasolicitudComponent', () => {
  let component: PersonasolicitudComponent;
  let fixture: ComponentFixture<PersonasolicitudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonasolicitudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonasolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
