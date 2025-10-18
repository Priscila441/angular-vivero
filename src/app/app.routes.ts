import { Routes } from '@angular/router';
import { ProductList } from './features/public/components/product-list/product-list';
import { ProductDetail } from './features/public/components/product-detail/product-detail';
import { SectionPrincipal } from './features/public/section-principal/section-principal';
import { PublicLayout } from './features/public/public-layout/public-layout';


export const routes: Routes = [

      { path: '', component: PublicLayout, 
             children: [
                  { path: '', component: SectionPrincipal },
                  { path: 'productos/:categoryId', component: ProductList},
                  { path: 'producto/:id' , component: ProductDetail}
            ]
      },
      { 
        //Rutas provisorias
        path: 'admin', 
        loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
          { path: '', redirectTo: 'products', pathMatch: 'full' },
          { path: 'products', loadComponent: () => import('./features/admin/products/listproduct/listproduct.component').then(m => m.Listproduct) },
          { path: 'products/add', loadComponent: () => import('./features/admin/products/addproducts/addproduct.component').then(m => m.AddproductComponent) },
          { path: 'products/list', loadComponent: () => import('./features/admin/products/listproduct/listproduct.component').then(m => m.Listproduct) }
        ]
      }

];
 