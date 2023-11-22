import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportproductoComponent } from './reportproducto.component';

describe('ReportproductoComponent', () => {
  let component: ReportproductoComponent;
  let fixture: ComponentFixture<ReportproductoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportproductoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
