# La aventura de Alex

Portafolio web presentado como un juego 2D de exploración y programación por bloques. Es una página estática: abre `index.html` en un navegador o sírvela desde cualquier hosting estático.

## Controles

- Arrastra bloques de la paleta al área punteada (o tócalos para agregarlos); puedes reordenarlos.
- Ejecuta una secuencia para avanzar, saltar, girar y abrir cofres.
- Acércate a un cofre y usa «Interactuar». El búho muestra una pista si Alex choca o todavía está lejos.
- Lee cada hallazgo y cierra la ficha para reanudar la secuencia.
- Usa los checkpoints para saltar directamente a una sección, o «Reiniciar» para repetir el nivel.

El perfil, los proyectos y `hola@ejemplo.com` son textos de ejemplo que deben reemplazarse por la información final. El búho ofrece pistas locales según el estado del juego; no realiza llamadas a un modelo de IA. Este prototipo implementa los bloques y el tablero en JavaScript; todavía no lleva una escena Scratch embebida ni un servicio de IA remoto.

## Publicar en AWS

Para una primera publicación se puede alojar como sitio estático en Amazon S3 y distribuirlo con CloudFront. Sube `index.html`, `styles.css`, `game-overrides.css` y `app.js` al origen S3, configura el documento predeterminado como `index.html` y habilita HTTPS mediante CloudFront. No se necesita proceso de compilación.

Ejemplo de carga (reemplaza el bucket por el tuyo):

```sh
aws s3 sync . s3://TU-BUCKET --exclude '.git/*' --exclude 'README.md'
```

Para invalidar el caché después de publicar en CloudFront:

```sh
aws cloudfront create-invalidation --distribution-id TU_DISTRIBUTION_ID --paths '/*'
```

No publiques datos personales o secretos en los archivos estáticos; todo el contenido del frontend es público.
