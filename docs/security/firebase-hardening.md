# Seguridad y endurecimiento de Firebase

## Cambios incluidos en el repositorio

- Firestore y Storage mantienen `deny by default`.
- Los clientes no escriben directamente `pedidos` ni `Bitacora`.
- Las reservas y transiciones pasan por Functions autenticadas.
- Roles y estados están centralizados.
- Storage acepta únicamente administradores, imágenes y archivos menores de
  10 MB; los MIME permitidos son PNG, JPEG y WebP.
- Claims inexistentes se comprueban antes de leerlos en Rules.
- CSP enumera endpoints concretos de Auth, Firestore, Storage, Functions,
  Analytics y App Check.
- El cliente tiene inicialización opt-in para App Check con reCAPTCHA
  Enterprise.
- Rules y operaciones críticas se prueban en emuladores.

## App Check: acciones en Firebase Console

La revisión del proyecto mostró el aviso de configuración pendiente, por lo que
App Check todavía no está registrado ni aplicado.

1. Abrir **Build → App Check**.
2. Registrar la aplicación web `fb-app` con reCAPTCHA Enterprise.
3. Añadir el dominio real y generar la site key pública.
4. Configurar en el entorno de Hosting:

   ```text
   VITE_ENABLE_FIREBASE_APP_CHECK=true
   VITE_FIREBASE_APP_CHECK_SITE_KEY=<site-key-pública>
   ```

5. Desplegar primero sin enforcement.
6. Observar métricas de peticiones válidas/no verificadas.
7. Activar enforcement gradualmente para Firestore, Storage, Authentication y
   Functions solo después de verificar tráfico real.
8. Para las callable Functions, cambiar sus opciones a `enforceAppCheck: true`
   y desplegarlas cuando el cliente ya envíe tokens válidos.

No almacenar secret keys de reCAPTCHA en variables `VITE_*`; todo valor Vite se
incluye en el bundle. La site key sí es pública.

## Desarrollo local

No registrar `localhost` como dominio normal de reCAPTCHA. Usar el debug provider
de App Check y registrar el debug token en Console. El token nunca debe entrar en
Git, logs ni capturas.

## Acciones en Google Cloud Console

- Activar Point-in-Time Recovery después de revisar coste y billing.
- Activar delete protection en la base `(default)`.
- Configurar exportaciones programadas a un bucket con retención.
- Revisar IAM y limitar cuentas con Datastore Owner/Firebase Admin.
- Crear presupuestos y alertas de facturación.
- Revisar cuotas de Cloud Functions y alertas por errores/latencia.

## Abuso y rate limiting

App Check reduce clientes no autorizados, pero no sustituye límites de negocio.
Antes de abrir el catálogo públicamente se debe definir una cuota por usuario y
ventana temporal, registrar intentos idempotentes y alertar patrones anómalos.
No se implementó un limitador en esta fase para no alterar el flujo funcional.

Referencias oficiales:

- https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider
- https://firebase.google.com/docs/app-check/cloud-functions
- https://firebase.google.com/docs/firestore/use-pitr
