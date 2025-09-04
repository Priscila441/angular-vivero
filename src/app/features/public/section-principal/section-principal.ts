import { Component } from '@angular/core';
import { SectionProduct } from './section-product/section-product';
import { SectionService } from './section-service/section-service';
import { FAQ } from './faq/faq';
import { Initial } from './initial/initial';

@Component({
  selector: 'app-section-principal',
  standalone: true,
  imports: [Initial,SectionProduct, SectionService, FAQ],
  template: `
    <app-initial></app-initial>
    <app-section-product></app-section-product>
    <app-section-service></app-section-service>
    <app-faq></app-faq>
  `,
})
export class SectionPrincipal {

}
