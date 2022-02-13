import { TestBed } from '@angular/core/testing';

import { TipoproductosuserService } from './tipoproductosuser.service';

describe('TipoproductosuserService', () => {
  let service: TipoproductosuserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoproductosuserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
