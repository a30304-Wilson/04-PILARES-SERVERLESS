# Festival Control · Bloque 01
 
## Qué he construido

Una función Lambda en TypeScript (backend/src/hello.ts) que responde a GET /hello con estado 200 y un JSON. La he ejecutado en local con Serverless Framework y serverless-offline, y la ruta que he probado es http://localhost:3000/dev/hello. No he desplegado nada en AWS.
 
## Qué he comprendido

- Tipos del handler: APIGatewayProxyEvent tipa la entrada (el evento HTTP que recibe la función) y Promise<APIGatewayProxyResult> tipa la salida, que debe tener statusCode y body. Si, por ejemplo, statusCode fuera un string, el compilador daría error.

- Compilación: escribo src/hello.ts, tsc lo compila a dist/hello.js y el serverless.yml apunta a dist/hello.handler. Por eso npm start compila antes de arrancar Offline, y no se edita nunca dist a mano.

- Dónde sale EVENT RECIBIDO: el console.log se ejecuta en el proceso del backend, así que aparece en la terminal donde corre Offline. No viaja en la respuesta HTTP ni sale en curl.
 
## Qué he modificado

En hello.ts cambié el message a "Festival Control · equipo preparado" y añadí el campo service: "hello" dentro del JSON.stringify. Cambió el contenido del body, pero la URL se mantuvo igual porque la ruta y el método los define serverless.yml (path: hello, method: get), y ese archivo no lo toqué.
 
## Cómo lo he comprobado

curl: curl -i http://localhost:3000/dev/hello desde una segunda terminal devolvió HTTP 200 y el mismo JSON.
Log: en cada petición, la terminal del backend mostró una nueva línea EVENT RECIBIDO: con el evento.

Evidencia: [adjunto captura propia del curl y su log]

![alt text](imagenes/01/image.png)

# Bloque 02
 
## Resultado

- Qué añadí al proyecto: Añadí un endpoint GET dinámico para consultar eventos mediante su identificador. Creé backend/src/getEvent.ts y configuré la ruta events/{id} en backend/serverless.yml, conservando el endpoint anterior /hello.

- Ruta o pantalla comprobada: GET http://localhost:3000/dev/events/EVT-104. También se propone comprobar EVT-205 y EVT-330 mediante curl.

- Estado y respuesta observados: Resultado esperado: 200 OK y una respuesta JSON con el identificador solicitado, el artista Neon Waves, el espacio Main Stage, la hora 22:30 y el estado CONFIRMED.
 
## Comprensión

- Recorrido del dato, explicado con mis palabras: El cliente envía una petición GET con el identificador en la URL. La ruta events/{id} permite recibir ese valor en event.pathParameters?.id. El handler comprueba que exista y construye una respuesta HTTP con el identificador y los datos del evento en formato JSON.

- Cambio guiado y resultado: Probé el uso de otro identificador, como EVT-330, sin modificar el código del handler. El resultado esperado es un 200 OK con el nuevo identificador y el resto de los datos simulados.

- Error encontrado y cómo lo resolví: Si aparece un error 404, comprobaré que el método sea GET y que la URL incluya /dev/events/{id}. Si aparece un error de TypeScript, revisaré el archivo y la línea indicados, corregiré el problema y repetiré npm run typecheck. Anotaré el error real si se produce alguno.
 
## Evidencias

- Captura o transcripción breve, sin credenciales:

![alt text](imagenes/02/image.png)

![alt text](imagenes/02/image-1.png)

En la terminal del backend también debería aparecer GET evento: EVT-104. Sustituir esta evidencia esperada por la salida real obtenida al ejecutar la prueba.

- Limitaciones del ejercicio: Los datos del evento son simulados y están escritos directamente en el handler. Cualquier identificador no vacío devuelve los mismos datos, cambiando el campo id. Todavía no hay una búsqueda en un catálogo, una base de datos ni persistencia de eventos. El ejercicio se centra en comprender los parámetros de ruta y la respuesta HTTP.