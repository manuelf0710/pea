import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BgtableComponent } from './bgtable.component';

describe('BgtableComponent', () => {
  let component: BgtableComponent;
  let fixture: ComponentFixture<BgtableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BgtableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BgtableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
