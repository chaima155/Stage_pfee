import { TestBed } from '@angular/core/testing';

import { Responsable } from './responsable';

describe('Responsable', () => {
  let service: Responsable;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Responsable);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
