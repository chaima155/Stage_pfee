import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntretienCreate } from './entretien-create';

describe('EntretienCreate', () => {
  let component: EntretienCreate;
  let fixture: ComponentFixture<EntretienCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntretienCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntretienCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
