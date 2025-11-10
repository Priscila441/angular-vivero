import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listproduct } from './list-product.component';

describe('Listproduct', () => {
  let component: Listproduct;
  let fixture: ComponentFixture<Listproduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listproduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listproduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
