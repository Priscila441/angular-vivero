# Copilot Instructions for Angular-vivero

## Project Overview
- This is an Angular 20+ application for a vivero (nursery/garden) site, using Angular CLI and SSR (server-side rendering).
- The codebase is organized by feature and core domains, with clear separation between UI components, services, and models.
- TailwindCSS is integrated for styling via `src/styles.css`.

## Key Architecture & Patterns
- **Feature Structure:**
  - UI features are under `src/app/features/`, e.g., `public/home`, `public/navbar`, `public/footer`.
  - Core business logic and data models are under `src/app/core/` (`service/`, `models/`, `guards/`).
- **Routing:**
  - Main routes are defined in `src/app/app.routes.ts` using lazy loading for components.
- **Component Pattern:**
  - Angular standalone components are used (see `@Component({ imports: [...] })`).
  - Styles and templates are referenced via `styleUrl` and `templateUrl`.
- **Services & Models:**
  - Services (e.g., `ProductoService`) are in `core/service/` and use private readonly properties for API endpoints.
  - Models (e.g., `Producto`) are TypeScript interfaces in `core/models/`.

## Developer Workflows
- **Start Dev Server:**
  - `npm start` or `ng serve` (default port: 4200).
- **Build:**
  - `npm run build` or `ng build` (output: `dist/`).
- **Unit Tests:**
  - `npm test` or `ng test` (Karma runner).
- **SSR:**
  - Build SSR: `ng build` (see `angular.json` for SSR config).
  - Serve SSR: `npm run serve:ssr:Angular-vivero` (uses Express).
- **TailwindCSS:**
  - Styles are imported in `src/styles.css`.
  - Tailwind/PostCSS dependencies are installed in `package.json`.

## Conventions & Integration Points
- **Prettier:**
  - HTML files use Angular parser (see `package.json`).
- **Environment Configs:**
  - Use `src/environments/environment.ts` and `environment.development.ts` for environment-specific settings.
- **Assets:**
  - Static assets are in `public/` and referenced in `angular.json`.
- **Testing:**
  - Specs for components are in the same folder as the component (e.g., `home.spec.ts`).

## Examples
- To add a new feature:
  - Create a folder under `features/` and use Angular CLI: `ng generate component features/public/new-feature/new-feature`.
- To add a new service/model:
  - Place service in `core/service/`, model in `core/models/`.

## References
- Main entry: `src/app/app.ts`
- Routing: `src/app/app.routes.ts`
- Styles: `src/styles.css`
- SSR: `src/server.ts`, `main.server.ts`

---
_If any conventions or workflows are unclear, please request clarification or provide missing details for future updates._
