import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsableUpdate } from './responsable-update';

describe('ResponsableUpdate', () => {
  let component: ResponsableUpdate;
  let fixture: ComponentFixture<ResponsableUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsableUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponsableUpdate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
