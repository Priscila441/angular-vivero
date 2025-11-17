import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioService } from '../../../../core/service/servicio.service';
import { Servicio, imagenServicio } from '../../../../core/models/servicio.model';

@Component({
	selector: 'app-services-images',
	standalone: true,
	imports: [CommonModule],
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

	constructor(private servicioService: ServicioService) {}

	ngOnInit(): void {
		this.servicioService.getAllDetalles().subscribe({
			next: (resp: any) => {
				const data: Servicio[] = Array.isArray(resp) ? resp : (resp?.data || []);
				this.items = data || [];
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
}
