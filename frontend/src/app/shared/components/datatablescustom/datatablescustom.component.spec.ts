import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatablescustomComponent } from './datatablescustom.component';

describe('DatatablescustomComponent', () => {
  let component: DatatablescustomComponent;
  let fixture: ComponentFixture<DatatablescustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatablescustomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatablescustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
