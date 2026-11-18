# Demo: enrolamiento inicial de un dispositivo con EST

Muestra a la vez el dashboard de Lamassu (administrador) y la terminal SSH web de
`../ssh-terminal` (dispositivo). Integrada en el quickstart
`content/docs/platform/iot-fleets/quickstarts/enroll-device(.es).mdx`.

| Qué | Dónde |
| --- | --- |
| Flow editable | `../est-enrollment.flow.json` |
| Página contenedora (dos iframes) | `view/index.html` |
| Datos sintéticos (CA y DMS `est-showcase`) | `seed.sh` |
| Parche del recorder para iframes | `frames-extension.py` |
| Demo exportada y guías | `../../public/demos/est-enrollment/` (`en/es.json`, `guide.*.json`, `assets/`) |
| Componente | `app/components/est-enrollment-demo.tsx` (registrado en `app/routes/docs.tsx`) |

## Arrancar el entorno (para repetir la grabación)

1. Terminal: `cd ../ssh-terminal && docker compose up --build -d` → http://localhost:8088/
2. Lamassu: clon temporal de `lamassuiot/lamassuiot` en `v4` y `monolithic` con la imagen
   `ghcr.io/lamassuiot/lamassu-ui:dev`, según `.agents/skills/lamassu-ui-showcase/references/runtime.md`.
   Descubre el puerto del contenedor UI (`docker port <id>`; el que sirve la UI es el mapeado a 8085).
3. Datos: `./seed.sh` (crea `Acme Device CA` y el DMS `est-showcase`: EST, JITP, sin autenticación inicial, HTTP).
4. Contenedora: `cd view && python3 -m http.server 8090 --bind 127.0.0.1`.
5. Actualiza en el flow el puerto de `dashboard=` en `url` (cambia en cada arranque).
6. Grabar: `frames-extension.py` sobre la extensión parcheada a 1x, y
   `openshowcase-recorder record ../est-enrollment.flow.json --extension <carpeta>`.

El dispositivo `sensor-0421` solo puede enrolarse una vez por base de datos: reinicia monolithic
(la BD es nueva en cada arranque) antes de cada `record`, y haz `inspect` con una copia del flow
con otro nombre.

## Limitaciones conocidas

- Autenticación inicial `NO_AUTH` por HTTP: el quickstart usa `CLIENT_CERTIFICATE` sobre HTTPS.
- Los clics dentro de iframes solo generan popups con `frames-extension.py` (el recorder 0.6.2 no los captura).
- La terminal usa fuente de 14 px: en la columna de la documentación se lee mejor en pantalla completa.
