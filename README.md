# Nuestra aventura

Aplicación web romántica, mobile-first y sin backend para guiar una búsqueda del tesoro presencial. La experiencia conserva el progreso en el teléfono, valida códigos QR, ofrece códigos manuales de respaldo, desbloquea videos y premios, y termina con un capítulo especial en casa.

## Qué incluye

- Angular 22, TypeScript estricto, componentes standalone y rutas lazy-loaded.
- PWA instalable con pantalla offline para la aplicación y el contenido ya cacheado.
- Estado central con Signals y persistencia versionada en LocalStorage.
- Seis etapas configurables, guards, pistas progresivas y enlaces a Google Maps.
- Escáner QR con cámara trasera, cambio de cámara y validación mediante ZXing.
- Código manual alternativo para cada etapa.
- Videos bajo demanda con `playsinline`, portada, reintento y salida de emergencia.
- Mochila visual de premios.
- Música opcional respetando las restricciones de reproducción del navegador.
- Panel local en `/admin-secreto` con rescate, importación/exportación y QR imprimibles.
- Diseño accesible, responsive y compatible con `prefers-reduced-motion`.
- Pruebas unitarias del progreso y la validación de códigos.

## Requisitos

- Node.js 24.15 o posterior.
- npm 10 o posterior.
- HTTPS para probar cámara y PWA desde un teléfono. `localhost` también se considera seguro durante el desarrollo.

## Instalar y ejecutar

```bash
npm install
npm start
```

Abre `http://localhost:4200`.

Para crear una versión de producción:

```bash
npm run build
```

La salida queda en `dist/nuestra-aventura/browser`.

Para ejecutar las pruebas:

```bash
npm run test:ci
```

## Personalizar la aventura

Todo el contenido editable está en:

```text
src/app/config/adventure.config.ts
```

Busca los comentarios `TODO` y reemplaza:

1. `recipientName`, `eventDate` y `introText`.
2. `coverImageUrl` y `musicUrl`.
3. `adminKey`.
4. Los títulos, textos y tres pistas de cada etapa.
5. `mapUrl` con rutas o ubicaciones reales.
6. `videoUrl` y `videoPosterUrl` con URLs HTTPS de Cloudinary u otro CDN.
7. Los premios y sus instrucciones.
8. `expectedQrCode` y `manualCode`.
9. La carta, foto y nombre del regalo final.

Los videos incluidos son demostrativos y deben reemplazarse. La aplicación no descarga todos los videos al iniciar; cada uno se solicita únicamente al abrir su recuerdo.

### Imágenes y videos

Cloudinary es una opción sencilla:

1. Sube cada archivo a Media Library.
2. Copia la URL HTTPS de entrega.
3. Pégala en el campo correspondiente.
4. Para portadas de video usa una imagen horizontal liviana, idealmente WebP o JPG.

No agregues información sensible. Todo contenido de una aplicación frontend puede ser inspeccionado por una persona con conocimientos técnicos.

## Generar e imprimir los QR

1. Cambia primero todos los valores `expectedQrCode` y `manualCode`.
2. Usa cadenas aleatorias y distintas; evita nombres como `ETAPA1`.
3. Ejecuta la aplicación y abre `/admin-secreto`.
4. Ingresa la clave configurada en `adminKey`.
5. Baja hasta “Códigos para imprimir”.
6. Pulsa “Imprimir QR” y guarda como PDF o imprime las tarjetas.
7. Recorta cada tarjeta y colócala en su parada correspondiente.

El código manual de cada tarjeta permite continuar si la cámara falla. No publiques capturas del panel secreto.

## Probar la cámara desde un teléfono

La cámara requiere HTTPS, salvo en `localhost`. Dos opciones:

### Con un despliegue de prueba

1. Despliega en Vercel o Netlify.
2. Abre la URL HTTPS desde el teléfono.
3. Entra a la primera etapa y toca “Escanear QR”.
4. Acepta el permiso de cámara.
5. Prueba el QR correcto, uno incorrecto y el código manual.
6. En iPhone, usa Safari; en Android, Chrome actualizado.

### En la misma red local

El servidor local por IP normalmente no ofrece HTTPS, por lo que la cámara puede ser bloqueada. Para una prueba real es más confiable usar un despliegue privado o temporal con HTTPS.

Si se deniega el permiso, revisa los permisos del sitio en el navegador. La app ofrecerá automáticamente el código manual.

## Desplegar en Vercel

1. Sube el proyecto a un repositorio Git.
2. En Vercel, selecciona “Add New Project” e importa el repositorio.
3. Framework preset: Angular.
4. Build command: `npm run build`.
5. Output directory: `dist/nuestra-aventura/browser`.
6. Configura Node.js 24.
7. Despliega.

`vercel.json` ya incluye la reescritura necesaria para Angular Router.

## Desplegar en Netlify

1. Importa el repositorio desde “Add new site”.
2. Build command: `npm run build`.
3. Publish directory: `dist/nuestra-aventura/browser`.
4. Usa Node.js 24.
5. Despliega.

`netlify.toml` y `public/_redirects` ya están preparados para las rutas de la SPA.

## Panel secreto

Ruta:

```text
/admin-secreto
```

Permite:

- ver etapa actual, progreso y pistas usadas;
- desbloquear o completar una etapa;
- saltar un QR;
- abrir videos para comprobarlos;
- activar el regreso a casa o el final;
- restaurar la etapa actual;
- exportar e importar el progreso como JSON;
- reiniciar la experiencia;
- generar e imprimir todos los QR.

Las acciones que alteran el progreso piden confirmación. Es una herramienta local de emergencia, no autenticación real.

## Recuperación y almacenamiento

El progreso se guarda en la clave `nuestra-aventura.progress.v1` de LocalStorage. Al cargar:

- se valida la versión y la forma de los datos;
- se descartan IDs de etapas inexistentes;
- si el contenido está dañado, se restauran valores seguros.

Para pasar el progreso entre dispositivos, expórtalo desde el panel e impórtalo en el otro teléfono.

## Decisiones técnicas

- Signals mantienen el estado reactivo con poco código y sin subscriptions manuales.
- La configuración vive fuera de los componentes para cambiar la historia sin tocar la lógica.
- Cada ruta pesada es lazy-loaded; el escáner y el generador de QR no aumentan la carga inicial.
- LocalStorage es suficiente para una experiencia personal en un solo dispositivo.
- La cámara solo se activa dentro del escáner y todos sus tracks se detienen al salir.
- Los códigos manuales y el panel de rescate evitan que un fallo de red, cámara o impresión bloquee el recorrido.

## Checklist para el día de la sorpresa

- [ ] Cambiar todos los textos `TODO`.
- [ ] Cambiar la clave del panel secreto.
- [ ] Confirmar que no aparece el regalo final en textos previos.
- [ ] Subir los seis videos y sus portadas.
- [ ] Ver cada video completo desde el teléfono.
- [ ] Configurar y probar todas las ubicaciones.
- [ ] Generar, imprimir y etiquetar internamente los seis QR.
- [ ] Comprobar cada QR en el lugar correcto.
- [ ] Comprobar cada código manual.
- [ ] Probar cámara denegada y navegación con conexión lenta.
- [ ] Probar la PWA instalada y el contenido ya visitado sin conexión.
- [ ] Exportar un progreso de respaldo.
- [ ] Reiniciar todo desde el panel antes de entregar el teléfono o enlace.
- [ ] Llevar una copia de los códigos y la clave del panel.
- [ ] Cargar completamente el teléfono y llevar batería externa.
- [ ] Confirmar que premios y sobres están en sus lugares.
- [ ] Probar el QR final en la habitación después de decorar.

## Estructura principal

```text
src/app/
├── config/adventure.config.ts
├── core/
│   ├── guards/
│   ├── models/
│   └── services/
├── features/
│   ├── welcome/
│   ├── chapters/
│   ├── stage/
│   ├── scanner/
│   ├── memory/
│   ├── backpack/
│   ├── final/
│   └── admin/
└── app.routes.ts
```
