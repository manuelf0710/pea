import { TestBed } from '@angular/core/testing';

import { BgtableService } from './bgtable.service';

describe('BgtableService', () => {
  let service: BgtableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BgtableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
