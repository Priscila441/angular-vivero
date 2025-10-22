import { Component, inject } from '@angular/core';
import { OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductoService } from '../../../../core/service/producto.service';
import { Producto } from '../../../../core/models/producto.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Categoria_producto } from '../../../../core/models/categoria_producto.models';
import { CategoriaProductoService } from '../../../../core/service/categoria_producto.service';
import { catchError, forkJoin, map, of, Subscription } from 'rxjs';
import { ProductoDetalles } from '../../../../core/models/producto_detalles.model';


@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.html',
})
export class ProductList implements OnInit{
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(CategoriaProductoService);
  private productService = inject(ProductoService);
  
  
  loading = true;
  selectedCategory: Categoria_producto | null = null;
  // todas las categorias (excluyendo la seleccionada)
  allCategories: Categoria_producto[] = [];

  // productos por categoría (map [categoriaId] => Producto[])
  productosMap = new Map<number, Producto[]>();

  // offsets del carrusel por categoría en px
  private offsetsMap = new Map<number, number>();
  // ancho de la card según breakpoints
  cardWidth = 0;

  // cache de imágenes por productoId
  private imageCache = new Map<number, string>(); // principal
  hoverSecondImageMap: Record<number, string | null> = {};

  // subs
  private subs: Subscription[] = [];


  ngOnInit(): void {
    // set card width responsive (4 en desktop, 3 en mobile)
    this.computeCardWidth();
    window.addEventListener('resize', () => this.computeCardWidth());

    const sub = this.route.paramMap.subscribe(params => {
      const categoryId = Number(params.get('categoryId'));
      if (categoryId) {
        this.loadSelectedCategory(categoryId);
      } else {
        // si no hay id, redirigir o cargar por defecto
        this.router.navigate(['/']);
      }
    });
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    window.removeEventListener('resize', () => this.computeCardWidth());
  }

  // ---------- Cálculo ancho de card ----------
  private computeCardWidth() {
    const containerPadding = 32; // px (tailwind px-4 * 2)
    const gapTotal = 16 * (4 - 1); // asumiendo px-2 por card en horizontal; aproximación
    const viewport = window.innerWidth;
    const columns = viewport >= 1024 ? 4 : 3;
    // ancho aproximado de la card
    this.cardWidth = Math.floor((viewport - containerPadding - (columns * 8)) / columns);
  }

  // ---------- Cargar categoría seleccionada ----------
  private loadSelectedCategory(id: number) {
    this.loading = true;
    this.selectedCategory = null;
    this.service.getCategoriaConProductos(id).subscribe({
  next: (cat) => {
    if (!cat) {
      console.error('Categoría no encontrada');
      this.loading = false;
      return;
    }
    this.selectedCategory = cat;
    this.productosMap.set(cat.id, cat.productos || []);
    this.preloadDetailsForCategory(cat.id, cat.productos || []);
    this.loadAllCategoriesExcluding(cat.id); // resto de categorías
    this.loading = false;
  },
  error: (err) => {
    console.error('Error al cargar categoria seleccionada', err);
    this.loading = false;
  }
});

  }

  // ---------- Cargar todas las categorias y excluir la seleccionada ----------
  // ---------- Cargar todas las categorias y excluir la seleccionada ----------
private loadAllCategoriesExcluding(selectedId: number) {
  this.service.getCategoriasConPorductos().subscribe({
    next: (cats: any[]) => {
      const filtered = (cats || []).filter((c: any) => c.id !== selectedId);
      this.allCategories = filtered;

      // Cargamos todas las categorías con sus productos e imágenes
      this.allCategories.forEach((cat: any) => {
        this.productosMap.set(cat.id, cat.productos || []);
        this.preloadDetailsForCategory(cat.id, (cat.productos || []).slice(0, 8));
      });
    },
    error: (err) => {
      console.error('Error al obtener categorías con productos', err);
    }
  });
}


  // ---------- Carrusel: next / prev por category ----------
  next(categoryId: number) {
    const currentOffset = this.offsetsMap.get(categoryId) ?? 0;
    const visibleCount = window.innerWidth >= 1024 ? 4 : 3;
    const shift = this.cardWidth + 16; // card + padding
    const prodCount = (this.productosMap.get(categoryId) || []).length;
    const maxOffset = Math.max(0, ((prodCount - visibleCount) * shift));
    const newOffset = Math.min(currentOffset + shift, maxOffset);
    this.offsetsMap.set(categoryId, newOffset);
    // preload next batch of details for upcoming products (optimización)
    this.preloadAroundOffset(categoryId, newOffset, visibleCount);
  }

  prev(categoryId: number) {
    const currentOffset = this.offsetsMap.get(categoryId) ?? 0;
    const shift = this.cardWidth + 16;
    const newOffset = Math.max(0, currentOffset - shift);
    this.offsetsMap.set(categoryId, newOffset);
  }

  getOffset(categoryId: number) {
    return this.offsetsMap.get(categoryId) ?? 0;
  }

  // para obtener los productos que se muestran (no transformar arreglo, solo devolver el arr completo,
  // el movimiento se simula con translateX en el contenedor padre)
  displayedProductsByCategory(categoryId: number) {
    return this.productosMap.get(categoryId) ?? [];
  }

  // ---------- Manejo de imágenes: fetch de getDetallesById y caching ----------
  // Devuelve la url principal en cache o indefinida
  productImage(productId: number): string | null {
    return this.imageCache.get(productId) ?? null;
  }

  // Preload detalles (imagenes) para un array de productos (usa forkJoin y cache)
  private preloadDetailsForCategory(categoryId: number, products: Producto[]) {
    const calls = products.map(p => {
      if (this.imageCache.has(p.id)) return of(null); // ya cargado
      return this.productService.getDetallesById(p.id).pipe(
        map((resp: any) => resp?.data || null),
        catchError(err => {
          console.error('Error detalles producto', p.id, err);
          return of(null);
        })
      );
    });

    if (calls.length === 0) return;

    const sub = forkJoin(calls).subscribe(results => {
      results.forEach((det: ProductoDetalles | null, idx) => {
        if (!det) return;
        const prod = products[idx];
        const mainImg = det.imagenes?.find(i => i.es_principal)?.url ?? det.imagenes?.[0]?.url ?? null;
        if (mainImg) this.imageCache.set(prod.id, mainImg);
        // hover second image
        const second = det.imagenes?.find(i => !i.es_principal)?.url ?? null;
        if (second) this.hoverSecondImageMap[prod.id] = second;
      });
    });
    this.subs.push(sub);
  }

  // preload alrededor del offset: cargamos detalles de los próximos visibleCount*2 productos
  private preloadAroundOffset(categoryId: number, offsetPx: number, visibleCount: number) {
    const shift = this.cardWidth + 16;
    const startIndex = Math.floor(offsetPx / shift);
    const prods = this.productosMap.get(categoryId) ?? [];
    const toPreload = prods.slice(startIndex, startIndex + visibleCount * 2);
    if (toPreload.length) this.preloadDetailsForCategory(categoryId, toPreload);
  }

  // ---------- Helper: exponer imagen secundaria si existe (usado en template con hoverSecondImageMap) ----------
  // (ya poblado en preload)

  // ---------- navegación auxiliar ----------
  goToCategory(categoryId: number) {
    // si no es array no navegamos
    const prods = this.productosMap.get(categoryId);
    if (!Array.isArray(prods)) {
      console.error('Error: productos no es array', prods);
      this.router.navigate(['/productos', categoryId]);
      return;
    }
    this.router.navigate(['/productos', categoryId]);
  }

  // ---------- clean up y util ----------
  private _destroyed = false;

}
