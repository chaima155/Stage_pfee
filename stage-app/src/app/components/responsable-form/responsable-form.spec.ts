import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsableForm } from './responsable-form';

describe('ResponsableForm', () => {
  let component: ResponsableForm;
  let fixture: ComponentFixture<ResponsableForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsableForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponsableForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
