import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAboutUs } from './form-about-us';

describe('FormAboutUs', () => {
  let component: FormAboutUs;
  let fixture: ComponentFixture<FormAboutUs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormAboutUs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormAboutUs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
