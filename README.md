# Sendero del polen — Portafolio de Alejandro

Portafolio web presentado como un juego 2D de exploración y programación visual por bloques. Es una página estática: abre `index.html` en un navegador o sírvela desde cualquier hosting estático.

## Controles

- Usa los accesos directos «Sobre mí», «Habilidades», «Proyectos», «Mis intereses», «Inspiración» y «Contacto» para abrir una sección al instante, sin programar ni recorrer el mapa.
- Arrastra bloques de la paleta al programa (o actívalos con teclado o toque). En cada bloque puedes usar las flechas para cambiar su orden y el botón «Quitar» para eliminarlo; también se pueden reordenar y borrar con arrastre.
- Ejecuta una secuencia para mover la abeja por el sendero ascendente, saltar, girar y abrir cofres.
- Enfoca el área del programa y pulsa Enter para ejecutar. Esc cierra una ficha abierta.
- La brújula y el personaje indican el rumbo. Un lector de pantalla recibe la posición y el progreso al terminar una secuencia o descubrir una parada. Puedes pedir una pista en cualquier momento; el búho también ayuda si la abeja choca.
- Cada ficha ofrece «Continuar» para cerrarla y seguir la secuencia; también puedes usar Escape o la X. Las fichas mantienen el foco mientras están abiertas.
- Los accesos directos siguen mostrando su propia sección aunque ya hayas abierto todos los cofres. «Reiniciar» vuelve al inicio y restaura el mapa completo.
- Los controles «A−» y «A+» ajustan el tamaño del texto; «Más contraste» y «Reducir animaciones» cambian la presentación. Las preferencias se guardan en el navegador.

## Cofres

El recorrido presenta a Alejandro, estudiante de Ingeniería de Software en la Universidad Cooperativa de Colombia; su interés por la ciberseguridad, las motos y las abejas; sus proyectos; y las historias que los inspiran, incluidos los juegos para niños y Jakelin’s World.

## Proyectos y contacto

- [MotoTracer](https://github.com/Abejandr0/mototracer)
- [MotoMod](https://github.com/Abejandr0/mods-app)
- [Honey](https://github.com/Abejandr0/honey)
- [CodeType](https://github.com/Abejandr0/codeType)
- [AIverse](https://aiverse-alejandro.duckdns.org/)
- Jakelin’s World — videojuego 2D narrativo en desarrollo, con minijuegos inspirados en los gustos de una persona especial.
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
