# ============================
# 1) Construcción base
# ============================
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# ============================
# MODO DESARROLLO
# ============================
# Para desarrollo con ng serve
# (vamos a descomentar esta sección para usar en modo desarrollo)
EXPOSE 4200
CMD ["npm", "run", "start"]

# ============================
# MODO PRODUCCIÓN
# ============================
# Para build optimizado con NGINX
# (Devemos comentar el modo desarrollo y descomentar esta sección para despliegue en producción)
#RUN npm run build -- --configuration production
#FROM nginx:alpine
#COPY nginx.conf /etc/nginx/conf.d/default.conf
#COPY --from=build /app/dist/browser /usr/share/nginx/html
#EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]
