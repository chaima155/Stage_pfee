import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatureCreate } from './candidature-create';

describe('CandidatureCreate', () => {
  let component: CandidatureCreate;
  let fixture: ComponentFixture<CandidatureCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatureCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatureCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
