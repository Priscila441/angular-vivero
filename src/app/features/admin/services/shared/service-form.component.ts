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
      categoria_id: ['', Validators.required]
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

  // No hay subcategorías en servicios

  private loadInitialData() {
    this.serviceForm.patchValue(this.initialData);
    this.captureInitialSnapshot();

    // No hay subcategorías en servicios
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

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.serviceForm.invalid) {
      this.errorMessage = 'Por favor completa los campos requeridos';
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

    this.formSubmit.emit({ servicio });
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
