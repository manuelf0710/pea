import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearOdsComponent } from './crear-ods.component';

describe('CrearOdsComponent', () => {
  let component: CrearOdsComponent;
  let fixture: ComponentFixture<CrearOdsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearOdsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearOdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
