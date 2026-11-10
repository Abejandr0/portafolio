# La aventura de Alex

Portafolio web presentado como un juego 2D de exploración y programación por bloques. Es una página estática: abre `index.html` en un navegador o sírvela desde cualquier hosting estático.

## Controles

- Arrastra bloques de la mochila a «Tu plan de aventura» (o tócalos para agregarlos).
- Ejecuta la secuencia para mover y hacer saltar a Alex, o abrir cofres cuando estés cerca.
- Usa las flechas del teclado y los controles táctiles para explorar directamente.
- Selecciona una parada en el mapa para saltar a ese checkpoint.

El contenido de perfil y el correo son textos de ejemplo que deben reemplazarse por la información final. El búho guía usa sugerencias locales; no realiza llamadas a un modelo de IA. La página expone un evento `postMessage` llamado `portfolio-checkpoint` para conectar una futura escena Scratch. No se incluye todavía una escena Scratch ni una integración de IA remota.

## Publicar en AWS

Para una primera publicación se puede alojar como sitio estático en Amazon S3 y distribuirlo con CloudFront. Sube `index.html`, `styles.css` y `app.js` al origen S3, configura el documento predeterminado como `index.html` y habilita HTTPS mediante CloudFront. No se necesita proceso de compilación.

Ejemplo de carga (reemplaza el bucket por el tuyo):

```sh
aws s3 sync . s3://TU-BUCKET --exclude '.git/*' --exclude 'README.md'
```

Para invalidar el caché después de publicar en CloudFront:

```sh
aws cloudfront create-invalidation --distribution-id TU_DISTRIBUTION_ID --paths '/*'
```

No publiques datos personales o secretos en los archivos estáticos; todo el contenido del frontend es público.
