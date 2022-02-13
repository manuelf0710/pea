import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramarAgendaComponent } from './programaragenda.component';

describe('ProgramarAgendaComponent', () => {
  let component: ProgramarAgendaComponent;
  let fixture: ComponentFixture<ProgramarAgendaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramarAgendaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramarAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
