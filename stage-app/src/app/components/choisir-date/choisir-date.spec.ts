import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoisirDate } from './choisir-date';

describe('ChoisirDate', () => {
  let component: ChoisirDate;
  let fixture: ComponentFixture<ChoisirDate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoisirDate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChoisirDate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
