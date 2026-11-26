# Enrolamiento inicial por EST

Este directorio contiene una captura interactiva en español, realizada con OpenShowcase. Abre el visor mediante un servidor HTTP desde este directorio:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Visita <http://127.0.0.1:8765/> y pulsa los indicadores para avanzar. La guía acompaña a cada parada. `est-enrollment.flow.json` es el flujo editable; la URL y la dirección del host Docker que contiene corresponden a la ejecución que se grabó y deben actualizarse si se repite.

## Entorno de grabación

Se utilizó un clon temporal de la rama `v4` de `lamassuiot/lamassuiot`, revisión `ce9b047b92552a5d5bba374d8fe5084b092d56cb`, y la imagen `ghcr.io/lamassuiot/lamassu-ui:dev` lanzada por monolithic. La instancia usaba API HTTP, datos sintéticos, `EXPERIMENTAL_WBTERM=true` y `WISP_ALLOW_PRIVATE_IPS=true`. El panel de la terminal integrada ejecutaba Debian, OpenSSL y curl. La terminal está bajo el dashboard, con el sidebar colapsado.

Para volver a arrancar, sigue `.agents/skills/lamassu-ui-showcase/references/runtime.md` desde el repositorio de documentación: prepara un host aislado y comprueba la propiedad de los contenedores y puertos, clona `v4`, construye una copia temporal del entrypoint con la UI `:dev` y API `http://localhost:8080/api`, y lanza monolithic con `-standard-docker-ports=true -inmemory-eventbus -disable-wfx -sample-data`. Añade `EXPERIMENTAL_WBTERM=true` y, para alcanzar el host desde el proxy Wisp en esta configuración local, `WISP_ALLOW_PRIVATE_IPS=true` al entorno de la UI. La opción de red privada permite al proxy alcanzar servicios privados: úsala solo en un host desechable y de acceso restringido. La UI y el gateway pueden escuchar en todas las interfaces.

Descubre el puerto HTTP efectivo del contenedor UI con `docker port`, comprueba `config.js` y la salud de `/api/ca/health`, y ejecuta `demos/est-enrollment/seed.sh` contra esa instancia para crear la CA y el DMS sintéticos. Descubre la puerta de enlace Docker para el contenedor UI; la dirección usada en esta grabación, `172.17.0.1`, no es portable. Verifica desde la terminal que curl alcanza el gateway. Usa un identificador de dispositivo nuevo para cada `inspect` y `record`, y ajusta el flujo. Sigue la skill para instalar, inspeccionar, grabar y exportar OpenShowcase, así como para detener únicamente los recursos propios.

El DMS de laboratorio usa JITP, `NO_AUTH` inicial, verificación de firma de CSR y HTTP. No es una configuración de producción. El quickstart del repositorio describe una configuración de evaluación diferente que usa HTTPS y certificado de bootstrap. El archivo no contiene claves privadas ni credenciales.
