import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { Categoria_producto } from "../models/categoria_producto.models";
import { environment } from "../../../environments/environment.development";

@Injectable({
  providedIn: "root"
})
export class CategoriaProductoService {
  private readonly api_url = environment.API_URL + "/categorias";

  constructor(private http: HttpClient) {}

  getAll(): Observable<Categoria_producto[]> {
    return this.http.get<any>(this.api_url).pipe(
      map(response => response?.data || [])
    );
  }

  getById(id: number): Observable<Categoria_producto> {
    return this.http.get<any>(`${this.api_url}/${id}`).pipe(
      map(response => response?.data || {})
    );
  }
  
  create(categoria: Categoria_producto): Observable<Categoria_producto> {
    return this.http.post<any>(this.api_url, categoria).pipe(
      map(response => response?.data || {})
    );
  }

  update(id: number, categoria: Categoria_producto): Observable<Categoria_producto> {
    return this.http.put<any>(`${this.api_url}/${id}`, categoria).pipe(
      map(response => response?.data || {})
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<any>(`${this.api_url}/${id}`).pipe(
      map(() => undefined)
    );
  }

  getCategoriaConProductos(id: number) {
    return this.http.get(`${this.api_url}/productos`).pipe(
      map((resp: any) => {
        const allCats = resp?.data || [];
        const cat = allCats.find((c: any) => c.id === id);
        if (!cat) return null;

        const subCats = allCats
          .filter((c: any) => c.id_padre === cat.id)
          .map((sub: any) => ({
            ...sub,
            productos: sub.productos || []
          }));

        return {
          ...cat,
          subcategorias: subCats
        };
      })
    );
  }

  getCategoriasConPorductos(): Observable<Categoria_producto[]> {
    return this.http.get<any>(`${this.api_url}/productos`).pipe(
      map(response => response?.data || [])
    );
  }

  // ------------------------------------------------------------
  // 🚀 NUEVA LÓGICA AVANZADA PARA ORGANIZAR CATEGORÍAS
  // ------------------------------------------------------------
  getCategoriasOrganizadas(): Observable<any[]> {
    return this.http.get<{ data: any[] }>(`${this.api_url}/productos`).pipe(
      map((resp) => {

        const productos = resp.data;
        const categoriasUnicas = new Map<number, any>();

        // 1. Crear mapa de categorías únicas
        productos.forEach(p => {
          const cat = p.categoria;
          if (!categoriasUnicas.has(cat.id)) {
            categoriasUnicas.set(cat.id, {
              id: cat.id,
              nombre: cat.nombre,
              productos: []
            });
          }
        });

        // 2. Crear jerarquía padre → subcategorías
        const categoriasDePrimerNivel: any[] = [];

        categoriasUnicas.forEach(cat => {
          const productoEjemplo = productos.find(p => p.categoria_id === cat.id);
          const idPadre = productoEjemplo?.categoria.id_padre || 0;

          if (idPadre === 0) {
            categoriasDePrimerNivel.push(cat);
          } else {
            const padre = categoriasUnicas.get(idPadre);
            if (padre) {
              if (!padre.subcategorias) padre.subcategorias = [];
              padre.subcategorias.push(cat);
            }
          }
        });

        // 3. Asignar productos a sus categorías hoja
        productos.forEach(p => {
          const categoriaHoja = categoriasUnicas.get(p.categoria_id);
          if (categoriaHoja) {
            categoriaHoja.productos.push(p);
          }
        });

        // 4. Filtrar solo las categorías principales deseadas
        const nombresAFiltrar = ['Frutas', 'Plantas', 'Arboles', 'Aromaticas'];

        return categoriasDePrimerNivel
          .filter(c => nombresAFiltrar.includes(c.nombre))
          .map(c => {
            if (c.subcategorias?.length === 0) {
              delete c.subcategorias;
            }
            return c;
          });
      })
    );
  }

  getSubcategoriasPorCategoria(idCategoriaPadre: number): Observable<Categoria_producto[]> {
    return this.http.get<any>(`${this.api_url}/subcategorias`, {
      params: { id_padre: idCategoriaPadre.toString() }
    }).pipe(
      map(response => response?.data || [])
    );
  }

}
