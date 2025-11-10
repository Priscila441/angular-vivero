import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriaServicioService } from '../../../../core/service/categoria_servicio.service';
import { Categoria_servicio } from '../../../../core/models/categoria_servicio.model';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './service-form.component.html',
  styleUrls: []
})
export class ServiceFormComponent implements OnInit, OnDestroy {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() serviceId?: number;
  @Input() initialData?: any;
  @Input() externalSubmit: boolean = false;

  @Output() formSubmit = new EventEmitter<{
    servicio: {
      nombre: string;
      descripcion: string;
      informacion_extra: string;
      categoria_id: number;
    };
    selectedFiles: File[];
    imageInputMode: 'file' | 'url';
    imagen_url?: string;
  }>();
  @Output() formCancel = new EventEmitter<void>();

  serviceForm!: FormGroup;
  submitted = false;
  isLoading = false;

  errorMessage = '';
  successMessage = '';
  showSuccessModal = false;
  private closeTimer: any;

  categorias: Categoria_servicio[] = [];

  private initialSnapshot: any | null = null;

  private readonly SUCCESS_TIMEOUT = 3000;

  // Estado de imágenes (replicado de productos y simplificado para servicios)
  imageInputMode: 'file' | 'url' = 'file';
  selectedFiles: File[] = [];
  selectedFilesPreviews: string[] = [];
  private readonly MAX_IMAGES = 5;
  // Imágenes existentes en modo edición (similar a productos)
  existingImages: any[] = [];
  // Índice del carrusel combinado (existentes + nuevas)
  carouselIndex = 0;

  constructor(
    private fb: FormBuilder,
    private categoriaServicio: CategoriaServicioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarCategorias();

    if (this.mode === 'edit' && this.initialData) {
      this.loadInitialData();
    } else {
      this.initialSnapshot = null; // en create no resaltamos cambios
    }
  }

  ngOnDestroy(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
  }

  private initForm() {
    this.serviceForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      informacion_extra: ['', [Validators.required, Validators.minLength(7)]],
      categoria_id: ['', Validators.required],
      imagen_url: ['']
    });
  }

  private cargarCategorias() {
    this.categoriaServicio.getAll().subscribe({
      next: (categorias: Categoria_servicio[]) => {
        this.categorias = categorias.filter((cat: Categoria_servicio) =>
          cat.id_padre === 0 || (cat.tipo?.toLowerCase?.() === 'principal')
        );
      },
      error: (err: any) => this.handleError('cargar categorías de servicio', err)
    });
  }

  private loadInitialData() {
    this.serviceForm.patchValue(this.initialData);
    this.captureInitialSnapshot();

    if (this.initialData.imagenes && Array.isArray(this.initialData.imagenes)) {
      this.existingImages = [...this.initialData.imagenes];
    }
  }

  private captureInitialSnapshot() {
    this.initialSnapshot = { ...this.serviceForm.getRawValue() };
  }

  isFieldInvalid(field: string): boolean {
    const control = this.serviceForm.get(field);
    return !!(control && control.invalid && this.submitted);
  }

  isChanged(field: string): boolean {
    if (this.mode !== 'edit' || !this.initialSnapshot) return false;
    const current = this.serviceForm.get(field)?.value;
    const initial = (this.initialSnapshot as any)[field];
    const normalize = (v: any) => {
      if (v === undefined || v === null) return '';
      if (typeof v === 'string') return v.trim();
      if (['categoria_id'].includes(field)) return Number(v || 0);
      return v;
    };
    return normalize(current) !== normalize(initial);
  }

  getChangedClass(field: string) {
    return this.isChanged(field)
      ? { 'bg-[#FFF3CD]': true, 'border-[#D9A20F]': true, 'text-[#D9A20F]': true }
      : {};
  }

  onFilesSelected(event: any) {
    const newFiles = Array.from(event.target.files) as File[];
    const already = this.existingImages.length + this.selectedFiles.length;
    const available = this.MAX_IMAGES - already;

    if (available <= 0) {
      this.errorMessage = `Ya alcanzaste el máximo de ${this.MAX_IMAGES} imágenes.`;
      setTimeout(() => (this.errorMessage = ''), 5000);
      event.target.value = '';
      return;
    }

    const accepted = newFiles.slice(0, available);
    if (accepted.length < newFiles.length) {
      const restantes = available;
      this.errorMessage = `Solo puedes agregar ${restantes} imagen${restantes === 1 ? '' : 'es'} más (máximo ${this.MAX_IMAGES}).`;
      setTimeout(() => (this.errorMessage = ''), 5000);
    }

    this.selectedFiles = [...this.selectedFiles, ...accepted];

    accepted.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFilesPreviews.push(e.target.result);
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';

    // Mover el carrusel al final para que la nueva imagen se vea "a la derecha"
    this.carouselIndex = Math.max(0, this.combinedImages.length - 3);
  }

  removeSelectedFile(index: number) {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
    this.selectedFilesPreviews = this.selectedFilesPreviews.filter((_, i) => i !== index);
    const total = this.combinedImages.length;
    if (this.carouselIndex > 0 && this.carouselIndex >= total) {
      this.carouselIndex = Math.max(0, total - 3);
    }
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.serviceForm.invalid) {
      this.errorMessage = 'Por favor completa los campos requeridos';
      return;
    }

    // Validación de imágenes como en productos
    const hasExistingImages = this.mode === 'edit' && this.existingImages.length > 0;
    const hasNewImages = this.imageInputMode === 'file'
      ? this.selectedFiles.length > 0
      : !!this.serviceForm.get('imagen_url')?.value;

    if (!hasExistingImages && !hasNewImages) {
      this.errorMessage = this.imageInputMode === 'file'
        ? 'Por favor selecciona al menos una imagen'
        : 'Por favor ingresa una URL de imagen';
      return;
    }

    const categoriaId = this.serviceForm.get('categoria_id')?.value;
    const categoriaFinal = Number(categoriaId);

    const servicio = {
      nombre: this.serviceForm.get('nombre')?.value?.trim(),
      descripcion: this.serviceForm.get('descripcion')?.value?.trim(),
      informacion_extra: this.serviceForm.get('informacion_extra')?.value?.trim(),
      categoria_id: categoriaFinal
    };

    this.formSubmit.emit({
      servicio,
      selectedFiles: this.selectedFiles,
      imageInputMode: this.imageInputMode,
      imagen_url: this.serviceForm.get('imagen_url')?.value
    });
  }

  removeExistingImage(imageId: number) {
    this.existingImages = this.existingImages.filter(img => img.id !== imageId);
    const total = this.combinedImages.length;
    if (this.carouselIndex > 0 && this.carouselIndex >= total) {
      this.carouselIndex = Math.max(0, total - 3);
    }
  }

  // --- Carrusel combinado (existentes + nuevas) ---
  get combinedImages(): Array<{ type: 'existing' | 'new'; url: string; id?: number; }> {
    const existing = this.existingImages.map((img: any) => ({ type: 'existing' as const, url: img.url, id: img.id }));
    const news = this.selectedFilesPreviews.map((url: string) => ({ type: 'new' as const, url }));
    return [...existing, ...news];
  }

  get visibleCombinedImages() {
    return this.combinedImages.slice(this.carouselIndex, this.carouselIndex + 3);
  }

  get canGoPreviousCombined() {
    return this.carouselIndex > 0;
  }

  get canGoNextCombined() {
    return this.carouselIndex + 3 < this.combinedImages.length;
  }

  previousCombined() {
    if (this.canGoPreviousCombined) {
      this.carouselIndex = Math.max(0, this.carouselIndex - 3);
    }
  }

  nextCombined() {
    if (this.canGoNextCombined) {
      const total = this.combinedImages.length;
      this.carouselIndex = Math.min(Math.max(0, total - 3), this.carouselIndex + 3);
    }
  }

  removeCombinedAt(absIndex: number) {
    if (absIndex < 0 || absIndex >= this.combinedImages.length) return;
    if (absIndex < this.existingImages.length) {
      const img = this.existingImages[absIndex];
      if (img?.id) this.removeExistingImage(img.id);
    } else {
      const newIdx = absIndex - this.existingImages.length;
      this.removeSelectedFile(newIdx);
    }
    const total = this.combinedImages.length;
    if (this.carouselIndex > 0 && this.carouselIndex >= total) {
      this.carouselIndex = Math.max(0, total - 3);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }

  getFormTitle(): string {
    return this.mode === 'create' ? 'Agregar Servicio' : 'Editar Servicio';
  }

  getSubmitButtonText(): string {
    return this.mode === 'create' ? 'Agregar Servicio' : 'Guardar Cambios';
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
      this.serviceForm.reset();
      this.submitted = false;
    }
    this.cdr.detectChanges();
  }

  private handleError(action: string, err: any) {
    console.error(`Error al ${action}:`, err);
    this.errorMessage = `Error al ${action}`;
  }
}
