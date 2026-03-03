import { TestBed } from '@angular/core/testing';

import { SujetStage } from './sujet-stage';

describe('SujetStage', () => {
  let service: SujetStage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SujetStage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
