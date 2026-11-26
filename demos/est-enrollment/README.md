# Demo: enrolamiento inicial de un dispositivo con EST

Muestra el dashboard de Lamassu (administrador) y una terminal de dispositivo.
Integrada en el quickstart
`content/docs/platform/iot-fleets/quickstarts/enroll-device(.es).mdx`.

| Qué | Dónde |
| --- | --- |
| Flow editable | `../est-enrollment.flow.json` |
| Datos sintéticos (CA y DMS `est-showcase`) | `seed.sh` |
| Demo exportada y guías | `../../public/demos/est-enrollment/` (`en/es.json`, `guide.*.json`, `assets/`) |
| Componente | `app/components/est-enrollment-demo.tsx` (registrado en `app/routes/docs.tsx`) |

## Volver a grabar

La grabación actual usa la terminal integrada de la UI, habilitada con
`EXPERIMENTAL_WBTERM=true`. El flow guarda la URL y la dirección de red de la
ejecución original; vuelve a descubrirlas antes de grabar. Sigue
`.agents/skills/lamassu-ui-showcase/SKILL.md` y las instrucciones de
`../est-enrollment-local/README.md` para preparar y verificar el entorno.

`seed.sh` conserva la preparación de los datos sintéticos. Usa un identificador
de dispositivo nuevo para cada ejecución de `inspect` y `record`.

Por petición del recorrido, la preparación de la vista y la generación de la
clave y la CSR se presentan como dos pasos agrupados: sus acciones intermedias
se reproducen sin detenerse en un popup adicional.

La grabación publicada usa autenticación inicial `NO_AUTH` por HTTP; el
quickstart utiliza `CLIENT_CERTIFICATE` sobre HTTPS.
