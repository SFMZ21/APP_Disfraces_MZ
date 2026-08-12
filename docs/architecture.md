# Arquitectura actual

## Enfoque

La aplicación conserva una arquitectura de monolito modular React + Firebase.
Los componentes no importan SDKs de Firebase; consumen contextos y APIs
semánticas de cada dominio.

```text
UI
 ├─ authContext
 ├─ CatalogContext
 ├─ CartContext
 ├─ ReservationContext
 └─ PurchaseAnalyticsContext
        │
features/*/api
        │
shared/firebase
        │
Firebase Auth / Firestore / Storage / Functions
```

## Responsabilidades

- `AuthContext`: sesión, perfil, registro, acceso, Google Login, logout y rol.
- `CatalogContext`: lectura en tiempo real del catálogo.
- `CartContext`: productos elegidos, cantidades, total y drawer.
- `ReservationContext`: rango vigente de la reserva.
- `PurchaseAnalyticsContext`: tiempo orientativo de navegación; no es auditoría.
- `features/*/api`: operaciones de dominio que encapsulan Firebase.
- `shared/firebase`: inicializa una vez cada SDK y conecta emuladores.
- `functions/src`: autoridad de reservas, precio e inventario.

## Autoridad de datos

El navegador puede mostrar un total estimado, pero `createReservation` vuelve a
leer cada producto, valida stock y calcula el total dentro de una transacción.
Los campos de precio o total enviados por el cliente no son confiables ni se
utilizan como autoridad.

## Inventario vigente

- `cantidad`: total físico registrado.
- `enStock`: unidades disponibles según el modelo actual.
- `enUso`: unidades comprometidas desde la creación de una reserva, aunque no
  necesariamente hayan sido entregadas.

Esta semántica se conserva por compatibilidad. No debe extenderse como si
`enUso` significara exclusivamente `checkedOut`. La fase posterior deberá
distinguir `total`, `reserved`, `checkedOut` y `available` al introducir
disponibilidad por fecha.

La inspección de producción encontró dos documentos y diferencias históricas de
tipo/campos. `normalizeInventory` mantiene la lectura compatible; el script de
migración preparado normaliza únicamente los tres contadores y no inventa datos
de producto ausentes.

## Dependencias permitidas

Los componentes pueden depender de contextos, modelos y APIs de dominio. Las
APIs pueden depender de `shared/firebase`. El código compartido no debe depender
de componentes. Las Functions mantienen sus propios módulos CommonJS porque se
despliegan con un runtime separado.
