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

  // subs
  private subs: Subscription[] = [];

  watermarkMap: Record<number, boolean> = {}; // true = ilustrativa, false = propia

  hoverSecondImageMap: Record<number, string | null> = {};

  // handler guardado para añadir/remover listener correctamente
  private readonly resizeHandler = () => this.computeCardWidth();


  ngOnInit(): void {
    // set card width responsive (4 en desktop, 3 en mobile)
    this.computeCardWidth();
    window.addEventListener('resize', this.resizeHandler);

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
    window.removeEventListener('resize', this.resizeHandler);
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
  // Versión corregida y robusta (reemplaza la anterior)
  private loadAllCategoriesExcluding(selectedId: number) {
    this.service.getCategoriasConPorductos().subscribe({
      next: (cats: any[]) => {
        const all = (cats || []);

        // Excluimos la categoría seleccionada y también sus subcategorías directas
        const filtered = all.filter((c: any) => c.id !== selectedId && c.id_padre !== selectedId);

        // 1) Construir mapa de categorías únicas
        const mapa = new Map<number, any>();
        filtered.forEach(cat => {
          mapa.set(cat.id, { ...cat, subcategorias: [] });
        });

        // 2) Insertar subcategorías dentro de su padre (solo si el padre está presente en el mapa)
        // Esto evita convertir subcategorías en raíces cuando su padre fue excluido.
        filtered.forEach(cat => {
          if (cat.id_padre && cat.id_padre !== 0) {
            const padre = mapa.get(cat.id_padre);
            const hijo = mapa.get(cat.id);
            if (padre && hijo) {
              padre.subcategorias.push(hijo);
            }
          }
        });

        // 3) Tomar sólo las categorías raíz (id_padre === 0)
        this.allCategories = Array.from(mapa.values()).filter((c: any) => c.id_padre === 0);

        // 4) Llenar productosMap y pre-cargar imágenes para raíces y subcategorías
        this.allCategories.forEach((cat: any) => {
          this.productosMap.set(cat.id, cat.productos || []);
          this.preloadDetailsForCategory(cat.id, (cat.productos || []).slice(0, 8));

          (cat.subcategorias || []).forEach((sub: any) => {
            this.productosMap.set(sub.id, sub.productos || []);
            this.preloadDetailsForCategory(sub.id, (sub.productos || []).slice(0, 8));
          });
        });
      },
      error: (err) => {
        console.error('Error al obtener categorías con productos', err);
        // en caso de error, limpiar estructuras para evitar estados inconsistentes
        this.allCategories = [];
        this.productosMap.clear();
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
        const mainImageObj =
          det.imagenes?.find(i => i.es_principal) ??
          det.imagenes?.[0] ??
          null;

        if (mainImageObj?.url) {
          this.imageCache.set(prod.id, mainImageObj.url);

          // guardamos si la imagen principal es ilustrativa
          this.watermarkMap[prod.id] = !!mainImageObj.es_ilustrativa;
        }

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
      //console.error('Error: productos no es array', prods);
      this.router.navigate(['/productos', categoryId]);
      return;
    }
    this.router.navigate(['/productos', categoryId]);
  }

  // ---------- clean up y util ----------
  private _destroyed = false;

  // Devuelve true si la categoría tiene subcategorías
  hasSubcategories(cat: any): boolean {
    return Array.isArray(cat.subcategorias) && cat.subcategorias.length > 0;
  }

  // Devuelve true si la categoría tiene productos
  hasProducts(cat: any): boolean {
    const productos = this.productosMap.get(cat.id);
    return Array.isArray(productos) && productos.length > 0;
  }



  
}
