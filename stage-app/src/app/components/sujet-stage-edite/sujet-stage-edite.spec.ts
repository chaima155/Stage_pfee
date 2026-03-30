import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SujetStageEdite } from './sujet-stage-edite';

describe('SujetStageEdite', () => {
  let component: SujetStageEdite;
  let fixture: ComponentFixture<SujetStageEdite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SujetStageEdite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SujetStageEdite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
