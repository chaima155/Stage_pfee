import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySpaceComponent } from './my-space';

describe('MySpaceComponent', () => {
  let component: MySpaceComponent;
  let fixture: ComponentFixture<MySpaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySpaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MySpace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
