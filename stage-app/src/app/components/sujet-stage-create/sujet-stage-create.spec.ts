import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SujetStageCreate } from './sujet-stage-create';

describe('SujetStageCreate', () => {
  let component: SujetStageCreate;
  let fixture: ComponentFixture<SujetStageCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SujetStageCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SujetStageCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
