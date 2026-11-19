# Terminal para demos

Terminal SSH a pantalla completa para grabaciones de OpenShowcase. Se conecta automáticamente a un contenedor con Bash, OpenSSL y curl.

Requisitos: Docker con Compose y acceso a Internet para descargar y construir SSH Easy y las imágenes. Desde esta carpeta:

```sh
docker compose up --build
```

Abre http://localhost:8088/. Los archivos de `files/` aparecen en `~/files` dentro de la sesión; coloca ahí certificados y otros archivos de prueba. Para acceder a servicios publicados en el host Docker, usa `host.docker.internal` y el puerto publicado; desde el contenedor `localhost` se refiere al propio contenedor. El servicio debe escuchar en una dirección accesible desde Docker. La conexión con una instancia concreta de Lamassu y sus credenciales se prepara por separado para cada demo.

Para detener los contenedores sin borrar los archivos:

```sh
docker compose down
```

Docker descarga SSH Easy durante la construcción, fijado a un commit, y lo adapta para esta demo. La cuenta y la contraseña son públicas y la huella SSH se acepta automáticamente: son exclusivamente para este entorno desechable. El puerto web solo escucha en `127.0.0.1`; no publiques este servicio ni lo uses con datos reales. La página concede acceso a una shell y el proxy admite conexiones de red. SSH Easy carga algunas bibliotecas de CDN, así que el navegador también necesita acceso a Internet.

## Estilo de la terminal

La ventana imita el estilo de bloques de Warp: barra de pestañas con el directorio actual, separador entre comandos, cabecera con directorio, rama git y duración del comando anterior, y resaltado de sintaxis con sugerencia en gris mientras se escribe.

- `prepare.py` aplica el marco de ventana, la fuente (JetBrains Mono desde Google Fonts) y la paleta de xterm.js.
- `files-image/lamassu-demo.bashrc` define el prompt y los separadores.
- `files-image/lamassu-demo.blerc` define los colores de [ble.sh](https://github.com/akinomyoga/ble.sh), fijado a la etiqueta `v0.4.0-devel3`, que se compila durante la construcción.

Tras cambiar cualquiera de estos archivos, reconstruye con `docker compose up --build`.

