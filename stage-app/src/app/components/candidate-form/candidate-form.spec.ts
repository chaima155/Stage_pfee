
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateFormComponent } from './candidate-form';

describe('CandidateFormComponent', () => {
  let component: CandidateFormComponent;
  let fixture: ComponentFixture<CandidateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CandidateFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
