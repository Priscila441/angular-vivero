# ============================
# 1) Construcción de Angular
# ============================
FROM node:22-alpine AS build

# Crear carpeta de la app
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código
COPY . .

# Compilar Angular en modo producción
RUN npm run build -- --configuration production

# ============================
# 2) Servir con NGINX
# ============================
FROM nginx:alpine

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados de Angular a la carpeta de NGINX
COPY --from=build /app/dist/browser /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
