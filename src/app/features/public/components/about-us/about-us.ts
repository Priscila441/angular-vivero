import { Component } from '@angular/core';
import { Encargados } from './encargados/encargados';
import { SobreNosotrosService } from '../../../../core/service/sobre_nosotros.service';
import { AuthService } from '../../../../core/service/auth/auth.service';
import { SobreNosotros } from '../../../../core/models/sobre_nosotros.model';


@Component({
  selector: 'app-about-us',
  imports: [Encargados],
  templateUrl: './about-us.html',
})
export class AboutUs {

  sobreNosotros?:SobreNosotros | null;
  cargando = false;

  constructor(
    private sobreNosotrosService: SobreNosotrosService,
    public authService: AuthService
  ) { }

  ngOnInit() {
   this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.sobreNosotrosService.getSobreNosotros(1).subscribe({
      next: (data) => {
        this.sobreNosotros = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener Sobre Nosotros', err);
        this.cargando = false;
      }
    });
  }

}
