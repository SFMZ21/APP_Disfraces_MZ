# Disfraces MZ

Aplicación web para gestionar catálogo, inventario y reservas de una tienda de
alquiler de disfraces. Es un monolito modular construido con React, Vite y
Firebase.

## Requisitos

- Node.js 22
- npm
- Java 21 para Firebase Emulator Suite
- Firebase CLI autenticado únicamente cuando se trabaje con un proyecto real

## Configuración local

```bash
npm ci
npm ci --prefix functions
cp .env.example .env.local
npm run dev
```

Las variables reales se guardan en `.env.local`, que no se versiona.

Para trabajar exclusivamente con emuladores:

```text
VITE_USE_FIREBASE_EMULATORS=true
```

## Validación

```bash
npm run lint
npm test -- --run
npm run build
npm run test:emulators
```

`test:emulators` inicia proyectos demo locales y prueba Functions, Firestore
Rules y Storage Rules. No utiliza producción.

## Estructura

```text
src/
  components/             pantallas y composición visual existente
  context/                autenticación y analítica de navegación
  features/
    auth/                 API y validación de acceso
    catalog/              productos, inventario y Storage
    cart/                 estado, modelo y persistencia del carrito
    reservations/         reservas, fechas y Functions
  shared/
    components/           componentes reutilizables reales
    domain/               roles, estados e inventario
    errors/               errores de aplicación
    firebase/             inicialización única de SDKs
    storage/              acceso seguro a almacenamiento del navegador
    styles/               fundamentos y estilos transversales
    validation/           validadores primitivos
functions/
  src/                    lógica de negocio del backend
  scripts/                herramientas de migración bloqueadas a emulador
  test/                   pruebas transaccionales
tests/                    pruebas de reglas Firebase
docs/                     arquitectura, migraciones y operación
```

## Documentación

- [Arquitectura](docs/architecture.md)
- [Reporte de remediación](docs/technical-debt-remediation.md)
- [Migración de datos históricos](docs/migrations/legacy-data.md)
- [Seguridad y App Check](docs/security/firebase-hardening.md)
- [Recuperación de Hosting](docs/hosting-recovery.md)

## Despliegue

El CI valida el repositorio, pero no despliega. Antes de publicar se debe
revisar el build, las reglas, las Functions, App Check y el estado del canal
de Hosting conforme a la documentación operativa.
