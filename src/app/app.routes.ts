import { Routes } from '@angular/router';
import { ProductList } from './features/public/product-list/product-list';
import { ProductDetail } from './features/public/product-detail/product-detail';


export const routes: Routes = [
      { path: '', loadComponent: () => import('./features/public/home/home').then(m => m.Home) },
      { path: 'productos/:categoryId', component: ProductList},
      { path: 'producto/:id' , component: ProductDetail}

];
