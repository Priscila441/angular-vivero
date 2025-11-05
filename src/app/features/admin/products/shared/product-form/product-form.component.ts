import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriaProductoService } from '../../../../../core/service/categoria_producto.service';
import { TemporadaService } from '../../../../../core/service/temporada.service';
import { Categoria_producto } from '../../../../../core/models/categoria_producto.models';
import { Temporada } from '../../../../../core/models/temporada.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './product-form.component.html',
  styleUrls: []
})
export class ProductFormComponent implements OnInit, OnDestroy {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() productId?: number;
  @Input() initialData?: any;
  // Permite delegar la creación/actualización al componente contenedor sin romper la lógica actual
  @Input() externalSubmit: boolean = false;
  
  @Output() formSubmitSuccess = new EventEmitter<any>();
  // Nuevo evento para delegar el submit al contenedor
  @Output() formSubmit = new EventEmitter<{
    producto: any;
    selectedFiles: File[];
    imageInputMode: 'file' | 'url';
    imagen_url?: string;
  }>();
  @Output() formCancel = new EventEmitter<void>();

  productForm!: FormGroup;
  submitted = false;
  showSuccessModal = false;
  private closeTimer: any;
  errorMessage = '';
  successMessage = '';
  imageInputMode: 'file' | 'url' = 'file';
  selectedFiles: File[] = [];
  selectedFilesPreviews: string[] = [];
  currentImageIndex = 0;
  // Carrusel para imágenes existentes (modo edición)
  existingCurrentImageIndex = 0;
  isLoading = false;
  existingImages: any[] = [];
  // Snapshot inicial para resaltar cambios en modo edición
  private initialSnapshot: any | null = null;
  private initialImageKeys: string[] = [];
  
  categorias: Categoria_producto[] = [];
  subcategorias: Categoria_producto[] = [];
  mostrarSubcategorias = false;
  temporadas: Temporada[] = [];

  private readonly MAX_IMAGES = 5;
  private readonly SUCCESS_TIMEOUT = 3000;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaProductoService,
    private temporadaService: TemporadaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarCategorias();
    this.cargarTemporadas();
    
    if (this.mode === 'edit' && this.initialData) {
      this.loadInitialData();
    } else {
      // En modo create no resaltamos cambios respecto a snapshot
      this.initialSnapshot = null;
    }
  }

  ngOnDestroy(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
  }

  private initForm() {
    this.productForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      imagen_url: [''],
      categoria_id: ['', Validators.required],
      subcategoria_id: [''],
      temporada_id: ['', Validators.required],
      informacion_extra: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private loadInitialData() {
    this.productForm.patchValue(this.initialData);
    // Capturar snapshot inicial tras el primer patch
    this.captureInitialSnapshot();
    
    if (this.initialData.imagenes && Array.isArray(this.initialData.imagenes)) {
      this.existingImages = [...this.initialData.imagenes];
      this.initialImageKeys = (this.initialData.imagenes || []).map((img: any) => `${img.id ?? ''}|${img.url ?? ''}`);
      this.existingCurrentImageIndex = 0;
    }
    
    if (this.initialData.categoria_id) {
      this.onCategoriaChange();
      
      if (this.initialData.subcategoria_id) {
        setTimeout(() => {
          this.productForm.patchValue({ 
            categoria_id: this.initialData.categoria_id,
            subcategoria_id: this.initialData.subcategoria_id 
          });
          // Re capturar snapshot tras ajustar subcategoría
          this.captureInitialSnapshot();
          this.cdr.detectChanges();
        }, 500);
      }
    }
  }

  private captureInitialSnapshot() {
    this.initialSnapshot = { ...this.productForm.getRawValue() };
  }

  // Determina si un control ha cambiado respecto al snapshot inicial (solo en modo edición)
  isChanged(field: string): boolean {
    if (this.mode !== 'edit' || !this.initialSnapshot) return false;
    const current = this.productForm.get(field)?.value;
    const initial = (this.initialSnapshot as any)[field];

    // Normalizar valores: trims para strings y Number para selects
    const normalize = (v: any) => {
      if (v === undefined || v === null) return '';
      if (typeof v === 'string') return v.trim();
      // Muchos selects devuelven string; normalizamos numéricos conocidos
      if (['categoria_id','subcategoria_id','temporada_id'].includes(field)) return Number(v || 0);
      return v;
    };

    return normalize(current) !== normalize(initial);
  }

  // Clases Tailwind para campos cambiados
  getChangedClass(field: string) {
    return this.isChanged(field)
      ? {
          'bg-[#FFF3CD]': true,
          'border-[#D9A20F]': true,
          'text-[#D9A20F]': true
        }
      : {};
  }

  // Detecta si el conjunto de imágenes cambió (agregadas o eliminadas) en modo edición
  isImagesChanged(): boolean {
    if (this.mode !== 'edit') return false;
    // Si se agregaron nuevas por archivo o URL, ya es cambio
    const hasNewFiles = this.selectedFiles.length > 0;
    const hasNewUrl = !!this.productForm.get('imagen_url')?.value && this.imageInputMode === 'url';

    if (hasNewFiles || hasNewUrl) return true;

    // Comparar imágenes existentes visibles vs iniciales
    const currentKeys = (this.existingImages || []).map((img: any) => `${img.id ?? ''}|${img.url ?? ''}`);
    return !this.areSetsEqual(this.initialImageKeys, currentKeys);
  }

  private areSetsEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    const setA = new Set(a);
    for (const x of b) {
      if (!setA.has(x)) return false;
    }
    return true;
  }
  
  private cargarCategorias() {
    this.categoriaService.getAll().subscribe({
      next: (categorias) => {
        this.categorias = categorias.filter(cat => 
          cat.id_padre === 0 || cat.tipo === 'principal'
        );
      },
      error: (err) => this.handleError('cargar categorías', err)
    });
  }
  
  private cargarTemporadas() {
    this.temporadaService.getAll().subscribe({
      next: (response: any) => {
        if (response?.data) this.temporadas = response.data;
      },
      error: (err) => this.handleError('cargar temporadas', err)
    });
  }

  onCategoriaChange() {
    const categoriaId = Number(this.productForm.get('categoria_id')?.value);
    
    this.productForm.get('subcategoria_id')?.setValue('');
    this.subcategorias = [];
    this.mostrarSubcategorias = false;
    
    if (categoriaId) {
      this.cargarSubcategorias(categoriaId);
    }
  }

  private cargarSubcategorias(idCategoriaPadre: number) {
    this.categoriaService.getSubcategoriasPorCategoria(idCategoriaPadre).subscribe({
      next: (subcategorias: Categoria_producto[]) => {
        this.subcategorias = subcategorias.filter(sub => sub.id_padre === idCategoriaPadre);
        this.mostrarSubcategorias = this.subcategorias.length > 0;
      },
      error: (err) => {
        console.error('Error al cargar subcategorías:', err);
        this.mostrarSubcategorias = false;
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.productForm.get(field);
    return !!(control && control.invalid && this.submitted);
  }

  openSuccessModal() {
    this.showSuccessModal = true;
    this.cdr.detectChanges();
    
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.closeSuccessModal(), this.SUCCESS_TIMEOUT);
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
    
    if (this.mode === 'create') {
      this.resetForm();
    }
    
    this.cdr.detectChanges();
  }

  private resetForm() {
    this.productForm.reset();
    this.submitted = false;
    this.subcategorias = [];
    this.mostrarSubcategorias = false;
    this.selectedFiles = [];
    this.selectedFilesPreviews = [];
  }

  private handleError(action: string, err: any) {
    console.error(`Error al ${action}:`, err);
    this.errorMessage = `Error al ${action}`;
  }

  onFilesSelected(event: any) {
    const newFiles = Array.from(event.target.files) as File[];
    const totalFiles = this.selectedFiles.length + newFiles.length;
    
    if (totalFiles > this.MAX_IMAGES) {
      this.errorMessage = `Solo puedes tener un máximo de ${this.MAX_IMAGES} imágenes. Actualmente tienes ${this.selectedFiles.length}, intentas agregar ${newFiles.length}.`;
      setTimeout(() => this.errorMessage = '', 5000);
      event.target.value = '';
      return;
    }
    
    this.selectedFiles = [...this.selectedFiles, ...newFiles];
    
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFilesPreviews.push(e.target.result);
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });
    
    event.target.value = '';
  }

  removeExistingImage(imageId: number) {
    // Solo eliminar del carrusel (UI). El backend se sincroniza en el submit.
    this.existingImages = this.existingImages.filter(img => img.id !== imageId);
    if (this.existingCurrentImageIndex > 0 && this.existingCurrentImageIndex >= this.existingImages.length) {
      this.existingCurrentImageIndex = Math.max(0, this.existingImages.length - 3);
    }
  }

  removeSelectedFile(index: number) {
    const actualIndex = this.currentImageIndex + index;
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== actualIndex);
    this.selectedFilesPreviews = this.selectedFilesPreviews.filter((_, i) => i !== actualIndex);
    
    if (this.currentImageIndex > 0 && this.currentImageIndex >= this.selectedFiles.length) {
      this.currentImageIndex = Math.max(0, this.selectedFiles.length - 3);
    }
  }

  previousImages() {
    if (this.canGoPrevious) {
      this.currentImageIndex = Math.max(0, this.currentImageIndex - 3);
    }
  }

  nextImages() {
    if (this.canGoNext) {
      this.currentImageIndex = Math.min(this.selectedFiles.length - 3, this.currentImageIndex + 3);
    }
  }

  get visibleImages() {
    return this.selectedFilesPreviews.slice(this.currentImageIndex, this.currentImageIndex + 3);
  }

  get canGoPrevious() {
    return this.currentImageIndex > 0;
  }

  get canGoNext() {
    return this.currentImageIndex + 3 < this.selectedFiles.length;
  }

  // Carrusel: imágenes existentes
  previousExistingImages() {
    if (this.canGoPreviousExisting) {
      this.existingCurrentImageIndex = Math.max(0, this.existingCurrentImageIndex - 3);
    }
  }

  nextExistingImages() {
    if (this.canGoNextExisting) {
      const total = this.combinedImages.length;
      this.existingCurrentImageIndex = Math.min(Math.max(0, total - 3), this.existingCurrentImageIndex + 3);
    }
  }

  // Lista combinada: existentes + nuevos (previews)
  get combinedImages(): Array<{ type: 'existing' | 'new'; url: string; id?: number; }> {
    const existing = this.existingImages.map((img: any) => ({ type: 'existing' as const, url: img.url, id: img.id }));
    const news = this.selectedFilesPreviews.map((url: string) => ({ type: 'new' as const, url }));
    return [...existing, ...news];
  }

  get visibleExistingImages() {
    return this.combinedImages.slice(this.existingCurrentImageIndex, this.existingCurrentImageIndex + 3);
  }

  get canGoPreviousExisting() {
    return this.existingCurrentImageIndex > 0;
  }

  get canGoNextExisting() {
    return this.existingCurrentImageIndex + 3 < this.combinedImages.length;
  }

  // Quitar imagen de la lista combinada según índice absoluto
  removeCombinedImage(absIndex: number) {
    if (absIndex < this.existingImages.length) {
      const img = this.existingImages[absIndex];
      if (img) this.removeExistingImage(img.id);
    } else {
      const newIndex = absIndex - this.existingImages.length;
      this.removeSelectedFileAbsolute(newIndex);
    }
  }

  private removeSelectedFileAbsolute(newIndex: number) {
    if (newIndex < 0 || newIndex >= this.selectedFiles.length) return;
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== newIndex);
    this.selectedFilesPreviews = this.selectedFilesPreviews.filter((_, i) => i !== newIndex);
    const total = this.combinedImages.length;
    if (this.existingCurrentImageIndex > 0 && this.existingCurrentImageIndex >= total) {
      this.existingCurrentImageIndex = Math.max(0, total - 3);
    }
  }

  async onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateForm()) return;

    const producto = this.buildProductData();
    // Emitimos siempre y delegamos la lógica al contenedor
    this.formSubmit.emit({
      producto,
      selectedFiles: this.selectedFiles,
      imageInputMode: this.imageInputMode,
      imagen_url: this.productForm.get('imagen_url')?.value
    });
  }

  private validateForm(): boolean {
    const requiredFields = ['nombre', 'descripcion', 'informacion_extra', 'categoria_id', 'temporada_id'];
    
    if (requiredFields.some(field => this.productForm.get(field)?.invalid)) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      return false;
    }

    const hasExistingImages = this.mode === 'edit' && this.existingImages.length > 0;
    const hasNewImages = this.imageInputMode === 'file' 
      ? this.selectedFiles.length > 0 
      : !!this.productForm.get('imagen_url')?.value;

    if (!hasExistingImages && !hasNewImages) {
      this.errorMessage = this.imageInputMode === 'file' 
        ? 'Por favor selecciona al menos una imagen' 
        : 'Por favor ingresa una URL de imagen';
      return false;
    }

    return true;
  }

  private buildProductData(): any {
    const subcategoriaId = this.productForm.get('subcategoria_id')?.value;
    const categoriaId = this.productForm.get('categoria_id')?.value;
    
    const categoriaFinal = subcategoriaId && subcategoriaId !== '' 
      ? Number(subcategoriaId) 
      : Number(categoriaId);

    return {
      nombre: this.productForm.get('nombre')?.value?.trim(),
      descripcion: this.productForm.get('descripcion')?.value?.trim(),
      informacion_extra: this.productForm.get('informacion_extra')?.value?.trim(),
      categoria_id: categoriaFinal,
      temporada_id: Number(this.productForm.get('temporada_id')?.value)
    };
  }

  // Lógica de servidor eliminada: se delega al componente contenedor

  onCancel() {
    this.formCancel.emit();
  }

  getFormTitle(): string {
    return this.mode === 'create' ? 'Agregar Producto' : 'Editar Producto';
  }

  getSubmitButtonText(): string {
    return this.mode === 'create' ? 'Agregar Planta' : 'Guardar Cambios';
  }
}
