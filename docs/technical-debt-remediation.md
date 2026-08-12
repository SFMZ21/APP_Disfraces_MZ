# Reporte de remediación de deuda técnica

## Alcance

La fase mantiene React, Firebase, comportamiento del carrito, máximo de siete
días inclusivos, precio por producto y diseño visual. No implementa pagos,
mensajería ni disponibilidad real por fechas.

## Cambios realizados

### Configuración Firebase

- **Problema:** la CSP no incluía el endpoint regional de Functions.
- **Causa:** `connect-src` cubría servicios generales, no las callable Functions.
- **Solución:** orígenes concretos para servicios usados y preparación opt-in de
  App Check; Hosting local movido a un puerto disponible.
- **Archivos:** `firebase.json`, `.env.example`, `shared/firebase/client.js`.
- **Pruebas:** Hosting Emulator, cabeceras HTTP, navegador sin errores CSP.

### Acceso a Firebase

- **Problema:** componentes y providers importaban SDKs directamente.
- **Causa:** crecimiento incremental sin capa de dominio.
- **Solución:** APIs semánticas para auth, catálogo, reservas, inventario,
  imágenes y suscripciones; clientes Firebase centralizados.
- **Resultado:** los componentes y contextos no importan Firebase SDK.

### Contextos

- **Problema:** Auth gestionaba productos y DataProvider mezclaba cinco estados.
- **Solución:** Auth limitado a identidad; catálogo, carrito y reserva separados.
  LocalStorage quedó detrás de adaptadores versionados.

### Dominio, validación y errores

- **Problema:** roles, estados, validación y errores estaban dispersos.
- **Solución:** constantes, resolvedor único de roles, validadores reutilizables y
  errores con mensaje técnico/mensaje de usuario.

### Backend y pruebas

- **Problema:** Functions críticas estaban en un único archivo sin pruebas.
- **Solución:** handlers inyectables, módulos de dominio y pruebas transaccionales
  con Emulator Suite. Se demuestra que precio/total del cliente no son autoridad,
  que las escrituras son atómicas y que el inventario no se restaura dos veces.

### Rules y UI crítica

- **Problema:** reglas, rutas, carrito y administración no tenían regresión
  automatizada.
- **Solución:** pruebas de Firestore/Storage Rules, rutas protegidas, carrito,
  persistencia, reserva correcta, inventario, estados y creación de producto.

### CSS y componentes compartidos

- **Problema:** una hoja global de 1,671 líneas.
- **Solución:** archivos por feature y estilos compartidos conservando el orden
  de cascada. Se extrajo únicamente el estado de página repetido.
- **Resultado:** build CSS idéntico en tamaño y validación visual responsive.

### Datos históricos

- **Problema:** persistía compatibilidad no verificada con `products`, usuarios
  por correo y roles antiguos.
- **Hallazgo real:** producción contiene 2 `items`, 15 `users`, 33 `pedidos` y 2
  `Bitacora`; `products` no existe. Hay tipos de inventario inconsistentes y
  perfiles por UID/correo con el campo histórico `rol`.
- **Solución:** resolvedor único, compatibilidad de Rules para perfiles por correo,
  scripts idempotentes con dry-run y bloqueo fuera del emulador, normalización de
  inventario, preservación de custom claims y plan de migración/rollback. La
  inspección fue de solo lectura y no se modificó producción.

### Recursos y dependencias

- Se retiraron SVG históricos sin referencias después de búsquedas exactas.
- Los PNG históricos no importados se conservaron para una limpieza posterior.
- `sweetalert` permanece porque reemplazarlo implicaría cambio visual.
- No se aplicó `npm audit fix --force` ni downgrade de herramientas.

### Dependencias

- Las dependencias de producción de frontend y Functions tienen cero avisos de
  seguridad en `npm audit --omit=dev`.
- Persisten cinco avisos moderados transitivos bajo `firebase-tools`; la
  corrección sugerida baja de versión la CLI y no se aplicó.
- ESLint 10 es la única actualización mayor pendiente; se conserva ESLint 9 para
  evitar mezclar una migración de configuración con esta fase.

## Deuda eliminada

- Acceso Firebase desde componentes.
- Productos dentro de AuthContext.
- Provider global de datos monolítico.
- Acceso directo y repetido a LocalStorage.
- Strings de estado/rol dispersos.
- Functions sin cobertura transaccional.
- Rules sin pruebas.
- CSS centralizado en un único archivo.
- Ausencia de CI y scripts seguros de migración.

## Deuda pendiente deliberada

- Disponibilidad real por fechas.
- Separar reservado de entregado.
- Migración y eliminación efectiva de datos históricos.
- Reparación manual de la URL secundaria incompleta de un producto histórico.
- Resolución del perfil con ID ambiguo y auditoría de custom claims.
- App Check enforcement.
- Rate limiting e idempotencia de reservas.
- PITR, backups y delete protection.
- Recuperación del Hosting live.
- Migración incremental a TypeScript.
- Sustitución futura de `sweetalert`.
- Cobertura end-to-end con un navegador autenticado.

## Cambios externos

### Firebase Console

- Registrar App Check y observar métricas antes de enforcement.
- Verificar administradores por UID antes de migrar usuarios.
- Crear un preview channel antes de recuperar live.

### Google Cloud Console

- Evaluar PITR, delete protection, backups, presupuestos, alertas e IAM.

### Despliegue

No hubo despliegues. Hosting, Rules y Functions continúan requiriendo una acción
explícita posterior a preview y autorización.

## TypeScript

No se recomienda una conversión masiva ahora. La siguiente migración incremental
debe comenzar por modelos de dominio y Functions, continuar con validadores/APIs
y convertir componentes solo cuando sean modificados funcionalmente.

## Validación final

| Validación | Resultado |
| --- | --- |
| `npm ci` | Correcto |
| `npm ci --prefix functions` | Correcto |
| `npm run lint` | Correcto, 0 errores |
| `npm test -- --run` | 11 archivos, 35 pruebas correctas |
| `npm run build` | Correcto, 2,739 módulos transformados |
| Firestore + Storage Rules | 15 pruebas correctas |
| Functions + migraciones | 24 pruebas correctas |
| Auditoría de producción frontend | 0 vulnerabilidades |
| Auditoría de producción Functions | 0 vulnerabilidades |

La interfaz se revisó a 320, 768 y 1,440 px sin overflow horizontal. El Hosting
Emulator sirvió rutas SPA y cabeceras de seguridad sin errores CSP. El hash del
CSS compilado permaneció idéntico después de dividir la hoja global.

La prueba integrada levantó Auth, Firestore, Storage, Functions y Hosting: Auth
respondió correctamente, `/login` devolvió 200 con la CSP esperada y ambas
callable Functions fueron alcanzables. Las llamadas anónimas devolvieron
`UNAUTHENTICATED`, como corresponde, sin crear datos.

Antes de entregar se verifican `git status`, `git diff --stat`, archivos ignorados
y ausencia de credenciales, builds, cobertura o logs versionados. Los resultados
exactos del estado de Git se incluyen en el cierre de la fase.
