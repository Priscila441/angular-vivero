import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticasPrivacidad } from './politicas-privacidad';

describe('PoliticasPrivacidad', () => {
  let component: PoliticasPrivacidad;
  let fixture: ComponentFixture<PoliticasPrivacidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticasPrivacidad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliticasPrivacidad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
