import { Routes } from '@angular/router';

export const routes: Routes = [

      { path: '', 
        loadComponent: () => import('./features/public/public-layout/public-layout').then(m => m.PublicLayout), 
        children: [
          { path: '', loadComponent: () => import ('./features/public/section-principal/section-principal').then(m => m.SectionPrincipal) },
          { path: 'productos/:categoryId', loadComponent: () => import ('./features/public/components/product-list/product-list').then(m => m.ProductList)},
          { path: 'producto/:id' , loadComponent: () => import ('./features/public/components/product-detail/product-detail').then(m => m.ProductDetail)},
          { path: 'contacto' , loadComponent: () => import('./features/public/public-layout/contact/contact').then(m => m.Contact) }
    ]
      },
      { 
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
 