import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { SectionPrincipal } from '../section-principal/section-principal';

@Component({
  selector: 'app-home',
  imports: [Navbar, Footer, SectionPrincipal],
  templateUrl: './home.html',
})
export class Home {

}
