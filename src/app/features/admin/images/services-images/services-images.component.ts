import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.development';
import { Servicio, imagenServicio } from '../../../../core/models/servicio.model';

@Component({
	selector: 'app-services-images',
	standalone: true,
	imports: [CommonModule, RouterModule],
	templateUrl: './services-images.component.html',
	styleUrls: []
})
export class ServicesImagesComponent implements OnInit {
	isLoading = true;
	items: Servicio[] = [];
	paginas: Servicio[][] = [];
	visibleItems: Servicio[] = [];
	currentPage = 0;
	slides: number[] = [];

	constructor(private http: HttpClient, private router: Router) {}

	ngOnInit(): void {
		const url = `${environment.API_URL}/servicios/completos`;
		this.http.get<any>(url).subscribe({
			next: (resp: any) => {
				const data = Array.isArray(resp) ? resp : (resp?.data || []);
				
				// Mapeo
				this.items = data.map((s: any) => ({
					id: s.id,
					nombre: s.nombre,
					descripcion: s.descripcion,
					informacion_extra: s.informacion_extra,
					esta_activo: s.esta_activo,
					imagenes: s.imagenes || [],
					categoria_id: s.categoria_id,
					nombre_categoria: s.nombre_categoria
				})) as Servicio[];
				
				this.paginas = this.agruparEnPaginas(this.items, 3);
				this.slides = this.paginas.map((_, i) => i);
				this.currentPage = 0;
				this.actualizarVisible();
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
				this.items = [];
				this.paginas = [];
				this.visibleItems = [];
			}
		});
	}

	agruparEnPaginas(servicios: Servicio[], tam: number): Servicio[][] {
		const grupos: Servicio[][] = [];
		for (let i = 0; i < servicios.length; i += tam) {
			grupos.push(servicios.slice(i, i + tam));
		}
		return grupos;
	}

	actualizarVisible(): void {
		this.visibleItems = this.paginas[this.currentPage] || [];
	}

	prevPage(): void {
		if (this.currentPage > 0) {
			this.currentPage--;
			this.actualizarVisible();
		}
	}

	nextPage(): void {
		if (this.currentPage < this.paginas.length - 1) {
			this.currentPage++;
			this.actualizarVisible();
		}
	}

	goToPage(index: number): void {
		if (index >= 0 && index < this.paginas.length) {
			this.currentPage = index;
			this.actualizarVisible();
		}
	}

	trackById(_: number, item: Servicio): number { return item.id; }

	getImagenPrincipal(servicio: Servicio): string {
		const principal: imagenServicio | undefined = servicio.imagenes?.find((img: imagenServicio) => img.es_principal) || servicio.imagenes?.[0];
		return principal?.url || '';
	}

	getCategoriaNombre(item: any): string {
		return item?.nombre_categoria || item?.categoria?.nombre || item?.categoria_nombre || '';
	}

	navegarADetalle(id: number): void {
		this.router.navigate(['/admin/images/services', id]);
	}
}
