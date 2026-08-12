# Migración de datos históricos

## Estado actual

La revisión de solo lectura realizada en Firebase Console el 12 de agosto de
2026 encontró estas colecciones en `(default)`:

| Colección | Documentos visibles | Observación |
| --- | ---: | --- |
| `items` | 2 | Colección operativa; no existe `products`. |
| `users` | 15 | 6 IDs sin `@` y 9 IDs por correo. |
| `pedidos` | 33 | Esquema histórico bajo `reserva`; existen pedidos sin `ownerId`. |
| `Bitacora` | 2 | Métricas históricas del proceso. |

Los dos documentos de `items` no tienen el mismo esquema: `cantidad` aparece
como entero y como string; uno no contiene `enStock`/`enUso`; faltan campos
opcionales como `size`/`img3`, y una URL secundaria requiere revisión manual.
No se inventan imágenes ni metadatos para corregir esos campos.

Los 15 perfiles visibles usan `rol: "usuario"` y no incluyen el esquema objetivo
completo. Cinco IDs tienen forma de UID, uno es ambiguo y nueve son correos. Los
custom claims no son visibles en Firestore y deben auditarse con Admin SDK antes
de ejecutar una migración real. El resolvedor conserva mientras tanto `role`,
`rol`, `isAdmin` y el claim `admin`.

El repositorio no consulta `products`. La referencia permanece únicamente en
Rules y en la herramienta por compatibilidad preventiva.

## Estado objetivo

```text
items/{productId}
  id
  title
  category
  price
  cantidad
  enStock
  enUso
  image / img1 / img2 / img3
  size
users/{uid}
  uid
  email
  displayName
  role: user | admin
  createdAt
```

## Herramienta

```text
functions/scripts/migrate-legacy-data.js
```

La herramienta:

- funciona únicamente cuando `FIRESTORE_EMULATOR_HOST` está definido;
- usa dry-run por defecto;
- copia `products/{id}` a `items/{id}` sin sobrescribir destinos, si la colección
  aparece en otro entorno;
- normaliza a número `cantidad`, `enStock` y `enUso` de `items` existentes;
- resuelve perfiles por correo o por UID contra Auth;
- crea/completa perfiles por UID y preserva administradores históricos o claims;
- no elimina documentos históricos;
- puede ejecutarse repetidamente sin duplicar datos.

### Dry-run en Emulator Suite

```bash
npx firebase emulators:exec --only auth,firestore \
  --project demo-disfraces-mz \
  "npm --prefix functions run migrate:legacy:dry-run"
```

### Ejecución en Emulator Suite

```bash
npx firebase emulators:exec --only auth,firestore \
  --project demo-disfraces-mz \
  "npm --prefix functions run migrate:legacy:execute"
```

Se puede limitar con `--entity=products`, `--entity=items` o `--entity=users` al
llamar el script directamente.

El bloqueo a emulador es intencional. Para una migración futura, exportar primero
los datos a un entorno controlado, ejecutar dry-run, resolver el documento de
usuario ambiguo y auditar custom claims. Habilitar ejecución real requerirá otro
cambio revisado y una autorización explícita; no basta con definir una variable.

## Compatibilidad temporal

- No retirar `match /products/{productId}` hasta completar inventario, dry-run,
  migración validada y periodo de observación.
- No retirar consultas por correo ni campos históricos de rol hasta confirmar
  que todos los usuarios tienen documento por UID.
- Mantener un backup antes de cualquier ejecución futura sobre un proyecto real.

## Criterio de finalización

1. Dry-run sin conflictos ni usuarios no resueltos; actualmente hay un ID de
   usuario ambiguo que debe asociarse manualmente o excluirse.
2. Igualdad comprobada entre documentos históricos y objetivos.
3. Administradores verificados manualmente por UID.
4. Aplicación y Functions sin lecturas históricas durante un periodo acordado.
5. Backup exportado y procedimiento de restauración probado.
6. Solo entonces retirar reglas y documentos históricos en otro cambio.

## Rollback

La migración no borra el origen. El rollback consiste en volver a la versión
anterior del código y eliminar exclusivamente documentos objetivos marcados con
`migratedFrom`, después de revisar un dry-run y un backup. Las promociones de rol
requieren comparar el reporte previo y restaurar el valor anterior. No se provee
un borrado automático para evitar una operación destructiva accidental.
