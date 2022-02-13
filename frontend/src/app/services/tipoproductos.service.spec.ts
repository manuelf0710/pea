import { TestBed } from '@angular/core/testing';

import { TipoproductosService } from './tipoproductos.service';

describe('TipoproductosService', () => {
  let service: TipoproductosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoproductosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
