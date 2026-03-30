import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageDetail } from './stage-detail';

describe('StageDetail', () => {
  let component: StageDetail;
  let fixture: ComponentFixture<StageDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StageDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
