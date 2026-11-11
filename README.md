# Sendero del polen — Portafolio de Alejandro

Portafolio web presentado como un juego 2D de exploración y programación visual por bloques. Es una página estática: abre `index.html` en un navegador o sírvela desde cualquier hosting estático.

## Controles

- Arrastra bloques de la paleta al programa (o tócalos para agregarlos); puedes reordenarlos y arrastrarlos a la papelera para quitarlos.
- Ejecuta una secuencia para mover la abeja por el sendero ascendente, saltar, girar y abrir cofres.
- La brújula y el personaje indican el rumbo actual. El búho muestra una pista si la abeja choca o todavía está lejos de un cofre.
- Lee cada hallazgo y cierra la ficha para reanudar la secuencia.
- Usa los checkpoints para saltar directamente a una sección, o «Reiniciar» para repetir el nivel.

## Proyectos y contacto

- [MotoTracer](https://github.com/Abejandr0/mototracer)
- [MotoMod](https://github.com/Abejandr0/mods-app)
- [Honey](https://github.com/Abejandr0/honey)
- [CodeType](https://github.com/Abejandr0/codeType)
- [Instagram · @alejojcastro](https://www.instagram.com/alejojcastro/)
- [GitHub · Abejandr0](https://github.com/Abejandr0)

Los bloques se ejecutan con un intérprete local que mueve la abeja sobre una cuadrícula vertical de un solo camino. La interfaz toma como referencia los bloques encajables de Scratch, sin cargar el editor externo ni requerir una cuenta o proyecto de Scratch. El búho da pistas locales mientras no haya endpoint de IA.

## Conectar la IA después del despliegue

`config.js` contiene `aiCoachEndpoint`, inicialmente vacío. Cuando exista un endpoint HTTPS de API Gateway/Lambda, asígnalo allí. El juego enviará al endpoint un `POST` JSON con `message`, coordenadas/dirección del personaje, cofres abiertos y pasos. La respuesta esperada es `{ "message": "Pista breve para el jugador" }`. Si el endpoint falla o sigue vacío, se conserva la pista local. La clave del proveedor debe permanecer en Lambda/Secrets Manager; nunca en `config.js`.

## Publicar en AWS

Para una primera publicación se puede alojar como sitio estático en Amazon S3 y distribuirlo con CloudFront. Sube `index.html`, `styles.css`, `config.js` y `app.js` al origen S3, configura el documento predeterminado como `index.html` y habilita HTTPS mediante CloudFront. No se necesita proceso de compilación.

Ejemplo de carga (reemplaza el bucket por el tuyo):

```sh
aws s3 sync . s3://TU-BUCKET --exclude '.git/*' --exclude 'README.md'
```

Para invalidar el caché después de publicar en CloudFront:

```sh
aws cloudfront create-invalidation --distribution-id TU_DISTRIBUTION_ID --paths '/*'
```

No publiques datos personales o secretos en los archivos estáticos; todo el contenido del frontend es público.
