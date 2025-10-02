# Vivero Quilino Frontend

Aplicación frontend desarrollada en **Angular 20** para la gestión y visualización de productos, categorías y servicios del Vivero Quilino.
Se utilizan **TailwindCSS** y **Material Icons** para el diseño, y se sirve en producción con **NGINX**.

---

## 🚀 Tecnologías

* Angular 20
* Node.js 22
* Tailwind CSS
* Material Icons
* Docker & Docker Compose
* NGINX (servidor de producción)

---

## 📦 Requisitos

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/)

> No es necesario tener Node ni Angular CLI instalados localmente.

---

## ⚙️ Instalación y uso

### 1. Clonar el repositorio

```bash
git clone https://github.com/usuario/angular-vivero.git
cd angular-vivero
```

### 2. Levantar el proyecto en Docker

```bash
docker-compose up --build
```

El frontend estará disponible en:
👉 [http://localhost:4200](http://localhost:4200)

---

## 🛠️ Desarrollo

En modo desarrollo, Angular utiliza **Hot Reload** en el puerto 4200.
Si necesitas correrlo fuera de Docker (solo para desarrollo rápido):

```bash
npm install
ng serve
```

---

## 📤 Producción

El proyecto se construye con:

```bash
ng build --configuration production
```

El resultado se genera en la carpeta `dist/browser` y se sirve en el puerto **80** dentro del contenedor NGINX.

---

## 🌍 Configuración del backend

La URL de la API se configura en los archivos de `src/environments`:

* `src/environments/environment.ts` → desarrollo
* `src/environments/environment.development.ts` → entorno local
* `src/environments/environment.prod.ts` → producción

---

## 📂 Estructura del proyecto

```
src/
 ├── app/                 # Componentes principales
 ├── assets/              # Imágenes y recursos
 ├── environments/        # Configuración de entornos
 ├── styles.css           # Estilos globales
angular.json              # Configuración Angular
docker-compose.yml        # Configuración Docker Compose
Dockerfile                # Imagen de Angular + NGINX
nginx.conf                # Configuración de NGINX
```

---

## 📌 Notas

* El proyecto se levanta en [http://localhost:4200](http://localhost:4200).
* Para producción se usa el puerto **80** dentro del contenedor.
* Las rutas son gestionadas por Angular, por eso se usa la regla `try_files` en `nginx.conf`.
