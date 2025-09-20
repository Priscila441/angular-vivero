import { Routes } from '@angular/router';


export const routes: Routes = [
      { path: '', loadComponent: () => import('./features/public/home/home').then(m => m.Home) },
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
