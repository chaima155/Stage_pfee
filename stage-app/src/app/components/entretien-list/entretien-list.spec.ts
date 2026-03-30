import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntretienList } from './entretien-list';

describe('EntretienList', () => {
  let component: EntretienList;
  let fixture: ComponentFixture<EntretienList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntretienList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntretienList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
