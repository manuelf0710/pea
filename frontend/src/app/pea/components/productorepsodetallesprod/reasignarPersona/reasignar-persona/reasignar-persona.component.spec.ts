import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasignarPersonaComponent } from './reasignar-persona.component';

describe('ReasignarPersonaComponent', () => {
  let component: ReasignarPersonaComponent;
  let fixture: ComponentFixture<ReasignarPersonaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReasignarPersonaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReasignarPersonaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
