import { Component } from '@angular/core';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [Navbar, Footer, RouterOutlet],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `,
})
export class PublicLayout {

}
