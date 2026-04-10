import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatureList } from './candidature-list';

describe('CandidatureList', () => {
  let component: CandidatureList;
  let fixture: ComponentFixture<CandidatureList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatureList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatureList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
