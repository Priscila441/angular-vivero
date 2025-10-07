import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Categoria_producto } from "../models/categoria_producto.models";
import { Producto } from "../models/producto.model";
import { CATEGORIAS_MOCK } from "../models/categorias.mock";
import { PRODUCTOS_MOCK } from "../models/productos.mock";

@Injectable({
  providedIn: "root",
})
export class MockService {

  getCategorias(): Observable<Categoria_producto[]> {
    return of(CATEGORIAS_MOCK);
  }

  getProductos(): Observable<Producto[]> {
    return of(PRODUCTOS_MOCK);
  }

  getProductosByCategory(categoryId: number): Observable<Producto[]> {
    const filtered = PRODUCTOS_MOCK.filter(p => p.categoria_id === categoryId);
    return of(filtered);
  }

  getProductoById(id: number): Observable<Producto | undefined> {
    return of(PRODUCTOS_MOCK.find(p => p.id === id));
  }
}
