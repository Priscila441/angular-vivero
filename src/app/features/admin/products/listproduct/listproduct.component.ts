import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../../core/service/producto.service';
import { Producto } from '../../../../core/models/producto.model';


@Component({
  selector: 'app-listproduct',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listproduct.component.html',
  styleUrls: ['./listproduct.component.css']
})

export class Listproduct implements OnInit {
  productos: Producto[] = [];

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.productoService.getAll().subscribe((data: Producto[]) => {
      this.productos = data;
    });
  }
}