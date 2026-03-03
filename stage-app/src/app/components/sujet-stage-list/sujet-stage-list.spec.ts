import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SujetStageList } from './sujet-stage-list';

describe('SujetStageList', () => {
  let component: SujetStageList;
  let fixture: ComponentFixture<SujetStageList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SujetStageList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SujetStageList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
