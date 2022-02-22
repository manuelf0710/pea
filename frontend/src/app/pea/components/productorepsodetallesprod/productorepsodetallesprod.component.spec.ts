import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductorepsodetallesprodComponent } from './productorepsodetallesprod.component';

describe('ProductorepsodetallesprodComponent', () => {
  let component: ProductorepsodetallesprodComponent;
  let fixture: ComponentFixture<ProductorepsodetallesprodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductorepsodetallesprodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductorepsodetallesprodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
