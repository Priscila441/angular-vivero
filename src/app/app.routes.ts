import { Routes } from '@angular/router';

export const routes: Routes = [

      { path: '', 
        loadComponent: () => import('./features/public/public-layout/public-layout').then(m => m.PublicLayout), 
        children: [
          { path: '', loadComponent: () => import ('./features/public/section-principal/section-principal').then(m => m.SectionPrincipal) },
          { path: 'productos/:categoryId', loadComponent: () => import ('./features/public/components/product-list/product-list').then(m => m.ProductList)},
          { path: 'producto/:id' , loadComponent: () => import ('./features/public/components/product-detail/product-detail').then(m => m.ProductDetail)},
          { path: 'contacto' , loadComponent: () => import('./features/public/components/contact/contact').then(m => m.Contact) },
          { path: 'sobre-nosotros' , loadComponent: () => import('./features/public/components/about-us/about-us').then(m => m.AboutUs) }
    ]
      },
      { 
        path: 'admin', 
        loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
          { path: '', redirectTo: 'products', pathMatch: 'full' },
          { path: 'products', loadComponent: () => import('./features/admin/products/listproducts/list-product.component').then(m => m.Listproduct) },
          { path: 'products/add', loadComponent: () => import('./features/admin/products/addproduct/add-product.component').then(m => m.AddproductComponent) },
          { path: 'products/edit/:id', loadComponent: () => import('./features/admin/products/editproduct/edit-product.component').then(m => m.EditproductComponent) },
          { path: 'services', loadComponent: () => import('./features/admin/services/listservices/list-service.component').then(m => m.ListservicesComponent) },
          { path: 'services/add', loadComponent: () => import('./features/admin/services/addservice/add-service.component').then(m => m.AddserviceComponent) },
          { path: 'services/edit/:id', loadComponent: () => import('./features/admin/services/editservice/edit-service.component').then(m => m.EditserviceComponent) }
        ]
      }

];
 