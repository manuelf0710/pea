import { TestBed } from '@angular/core/testing';

import { ProductosrepsoService } from './productosrepso.service';

describe('ProductosrepsoService', () => {
  let service: ProductosrepsoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductosrepsoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
