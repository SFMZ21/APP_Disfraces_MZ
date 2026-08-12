# Recuperación y publicación de Firebase Hosting

## Estado comprobado

- Sitio: `react-firebase-3f563`
- URL: `https://react-firebase-3f563.web.app`
- El canal `live` permanece deshabilitado desde el 28 de septiembre de 2023.
- Las Functions continúan activas.
- No se publicó producción durante la remediación.

## Validación local

```bash
npm run build
npx firebase emulators:start --only hosting
```

El Hosting Emulator utiliza el puerto `5002`, porque `5000` no estaba disponible
en la máquina de desarrollo. Deben comprobarse rutas SPA, cabeceras CSP y consola
del navegador.

## Preview seguro

Después de validar localmente, crear un canal temporal:

```bash
npx firebase hosting:channel:deploy remediation-preview \
  --project react-firebase-3f563 \
  --expires 7d
```

Esto crea una URL temporal y no reemplaza el canal live. Verificar login,
catálogo, Storage y ambas Functions desde esa URL.

## Recuperación de live

Requiere autorización explícita y una ventana de despliegue:

```bash
npm ci
npm run lint
npm test -- --run
npm run build
npm run test:emulators
npx firebase deploy --only hosting --project react-firebase-3f563
```

Después del despliegue, ejecutar smoke tests. Si falla, Firebase Hosting conserva
releases anteriores y permite realizar rollback desde Console. Las Rules y las
Functions deben desplegarse por separado; este procedimiento no las modifica.
