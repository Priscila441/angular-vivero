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

      // buscamos subcategorías de la categoría madre
      const subCats = allCats.filter((c: { id_padre: any; }) => c.id_padre === cat.id)
        .map((sub: { productos: any; }) => ({
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

  getCategoriasOrganizadas() {
  return this.http.get<any>(`${this.api_url}/productos`).pipe(
    map((resp) => {
      const categorias = resp.data;

      // Agrupar por tipo
      const tipos: { [key: string]: any } = {};

      categorias.forEach((cat: { tipo: string | number; id_padre: number; }) => {
        if (!tipos[cat.tipo]) {
          tipos[cat.tipo] = { tipo: cat.tipo, categorias: [] };
        }

        if (cat.id_padre === 0) {
          tipos[cat.tipo].categorias.push({ ...cat, subcategorias: [] });
        } else {
          const padre = categorias.find((c: { id: number; }) => c.id === cat.id_padre);
          if (padre) {
            const padreTipo = padre.tipo;
            const padreEnTipo = tipos[padreTipo].categorias.find((c: any) => c.id === padre.id);
            if (padreEnTipo) {
              padreEnTipo.subcategorias.push(cat);
            }
          }
        }
      });

      // Convertir a array para iterar fácilmente
      return Object.values(tipos);
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
