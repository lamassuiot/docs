import{j as e}from"./index-DqgIL_Rv.js";let d=`

<div className="lm-diff-ins lm-diff-block">
  Estos diagramas siguen lo que hace el servicio, paso a paso. Las rutas son relativas a \`/updates/v1\`. Para ver comandos ejecutables consulta las guías de curl [nativa](/docs/platform/updates/guides/native-curl) y [hawkBit](/docs/platform/updates/guides/hawkbit-curl), y la [referencia de la API](/docs/platform/updates/reference/api) para cada ruta y cuerpo.
</div>

<div className="lm-diff-ins lm-diff-block">
  Modo nativo [#modo-nativo]
</div>

<div className="lm-diff-ins lm-diff-block">
  1. Publicar y construir un paquete [#1-publicar-y-construir-un-paquete]
</div>

<div className="lm-diff-ins lm-diff-block">
  Construir convierte los artefactos subidos y la sw-description en un único \`.swu\`. Nada se firma ni se cifra salvo que la petición de build lo pida.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    actor Op as Operador
    participant API as API de Updates
    participant DB as Postgres
    participant FS as Almacenes de blobs y directorio temporal
    participant SWG as swugenerator
    participant KMS as Lamassu KMS

    Op->>API: POST /groups/{g}/distribution-sets
    API->>DB: insertar el paquete (estado draft)
    API-->>Op: 201 paquete
    Op->>API: POST .../descriptor/upload (sw-description)
    API->>DB: guardar la sw-description
    Op->>API: POST .../artifact/upload (file, artifact_name, version)
    API->>FS: guardar los bytes del artefacto en el almacén artifacts
    API->>DB: insertar el artefacto y enlazarlo al paquete
    API-->>Op: id del artefacto
    Op->>API: POST .../swu {selected_artifact_ids, encryption, signature}
    API->>FS: preparar el descriptor y los artefactos elegidos en un directorio de build
    opt cifrado compartido o por dispositivo
      API->>API: obtener la clave de SymKMS
    end
    API->>SWG: construir el .swu
    opt se pidió firma
      SWG->>KMS: firmar la sw-description
      KMS-->>SWG: firma
    end
    SWG-->>API: fichero .swu
    API->>FS: publicar el build en el almacén builds
    API->>DB: instantánea de la versión y de su manifiesto
    opt se pidió firma
      API->>KMS: firmar el manifiesto de la versión
      KMS-->>API: firma
    end
    API->>DB: poner estado built y uri
    API-->>Op: 200 Update pack executed successfully
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Cosas que conviene saber sobre el build:
</div>

<div className="lm-diff-ins lm-diff-block">
  * El paquete se crea con un nombre, una \`version\` semántica, un \`group_id\`, un \`type\` y un \`packaging\` opcional. Un nombre duplicado en el grupo da un \`409\`.
  * Subir un artefacto (o un entregable ya construido) a una versión que ya está construida se rechaza con \`409\`: crea primero una versión nueva. Un build o cambio que colisione con otro sobre el mismo paquete también responde \`409\`.
  * Un fichero mayor que \`max_artifact_size_mb\` (10240 MiB por defecto) se rechaza con \`413\`.
  * El cifrado lo decide el cuerpo del build: \`user\` más \`encryption_key_name\` es cifrado con clave compartida, y \`encryption_alg_name\` solo es cifrado por dispositivo (flujo 5).
  * Si el build falla, el paquete pasa a \`build_failed\`, \`last_build_error\` dice por qué, y el paquete sigue siendo editable. Los artefactos seleccionados reemplazan los enlaces de artefactos anteriores de la versión del paquete.
  * Sin campos de firma, el manifiesto se guarda sin firmar. Si se indica una clave de firma pero no un certificado, el build falla.
  * Un paquete \`non-swu\` se construye con \`POST .../package\` en un \`.tar.gz\`, y un entregable construido fuera se adjunta con \`POST .../swu/upload\` o \`.../package/upload\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  2. Crear un lanzamiento [#2-crear-un-lanzamiento]
</div>

<div className="lm-diff-ins lm-diff-block">
  Crear un lanzamiento decide a quién se dirige y comprueba que el paquete se puede entregar. Todavía no se envía nada a ningún dispositivo.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    actor Op as Operador
    participant API as API de Updates
    participant DMS as Lamassu Device Manager
    participant DB as Postgres

    Op->>API: POST /groups/{g}/launch {nombre del paquete, estrategia, test_device_id}
    API->>DB: cargar el paquete por grupo y nombre
    alt el paquete no está construido
      API-->>Op: 400 construye primero el paquete
    else paquete por dispositivo con dispositivos sin cubrir
      API-->>Op: 400 dispositivos sin paquete
    else
      API->>DMS: listar los dispositivos del grupo
      DMS-->>API: ids de dispositivo
      API->>API: evaluar las precondiciones del paquete por dispositivo
      alt ningún dispositivo al que dirigirse
        API-->>Op: 500 el grupo no tiene dispositivos a los que lanzar
      else el canario no está en el grupo, o no cumple
        API-->>Op: 400 el dispositivo de prueba no es un miembro válido
      else
        API->>DB: insertar el lanzamiento y una asignación pending por dispositivo
        API-->>Op: 201 launch_id, precondition_failures, forced
      end
    end
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  \`?dry_run=true\` se detiene tras la comprobación de precondiciones y responde \`200\` con \`qualifying_devices\`, \`precondition_failures\`, \`superseded_devices\` y \`never_seen_devices\`. \`force_preconditions\` apunta a todos los dispositivos del grupo y aun así registra cuáles fallaron. \`distribution_set_name\`, \`workflow_type\` y \`rollout_type\` son obligatorios, y también un \`rollout_value\` mayor que cero. \`approval_threshold\` y \`error_threshold\` deben estar entre 0 y 100, y cada incumplimiento es un \`400\`. Un lanzamiento también puede llevar \`auto\`, \`scheduled_at\`, \`name\`, \`description\` y \`weight\` (consulta [Conceptos](/docs/platform/updates/concepts#campañas-de-lanzamiento)).
</div>

<div className="lm-diff-ins lm-diff-block">
  3. Desplegar un lote y actualizar un dispositivo [#3-desplegar-un-lote-y-actualizar-un-dispositivo]
</div>

<div className="lm-diff-ins lm-diff-block">
  Una llamada \`rollout\` envía el siguiente lote. El canario va solo primero, y después lotes del tamaño configurado, elegidos al azar entre los dispositivos que siguen pendientes. El lado del dispositivo de abajo es el workflow \`direct\`, donde un job empieza en \`INSTALL\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    actor Op as Operador
    participant API as API de Updates
    participant DB as Postgres
    participant WFX as WFX
    participant Dev as Dispositivo (SWUpdate)

    Op->>API: POST /groups/{g}/launch/{id}/rollout
    API->>DB: reclamar el siguiente índice de lote (atómico, un solo despachador por lanzamiento)
    loop cada dispositivo del lote
      API->>WFX: crear job (workflow, uri, algorithm, iv, version)
      WFX-->>API: id del job
      API->>DB: registrar una fila pending en el historial de actualizaciones
      API->>DB: marcar la asignación del dispositivo como active
    end
    API-->>Op: 200

    Dev->>WFX: consultar los jobs de este cliente
    WFX-->>Dev: job en estado INSTALL
    Dev->>API: GET .../swu/download/{deviceId}
    API-->>Dev: el .swu
    Dev->>WFX: PUT estado INSTALLING
    Dev->>WFX: PUT estado INSTALLED
    WFX->>WFX: transición automática a ACTIVATE
    Dev->>WFX: PUT estado ACTIVATING
    Dev->>WFX: PUT estado ACTIVATED
    WFX-->>API: flujo de eventos: cada cambio de estado del job
    Note over API,DB: El flujo 4 gestiona cada evento
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Con el workflow \`phased\`, un job empieza en \`CREATED\`, y algunas transiciones necesitan que una persona o un sistema las confirme en WFX. Este servicio no las avanza. El workflow \`download-install\`, que usan los paquetes \`non-swu\`, recorre \`DOWNLOAD → DOWNLOADING → DOWNLOADED → INSTALL → INSTALLING → INSTALLED\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  Con \`auto\` activado, una llamada \`rollout\` inicia el lanzamiento y los lotes siguientes los libera el flujo 4. Un lanzamiento con \`scheduled_at\` lo inicia el disparador de lanzamientos programados en la réplica líder cuando pasa esa hora.
</div>

<div className="lm-diff-ins lm-diff-block">
  La llamada \`rollout\` no siempre es un \`200\` simple:
</div>

<div className="lm-diff-ins lm-diff-block">
  * Se rechaza con \`400\` cuando el lanzamiento está pausado, cancelado, completado o abortado, y en un lanzamiento \`auto\` una vez que ha salido algún lote.
  * No hace nada y responde \`200\` mientras \`scheduled_at\` esté todavía en el futuro, y mientras el canario siga activo. Devuelve un error si el canario falló.
  * Si no se pueden crear algunos jobs, esos dispositivos siguen \`pending\` y la llamada devuelve un error de «partial rollout» (\`500\`).
</div>

<div className="lm-diff-ins lm-diff-block">
  4. Reaccionar cuando un dispositivo termina [#4-reaccionar-cuando-un-dispositivo-termina]
</div>

<div className="lm-diff-ins lm-diff-block">
  Cada cambio de estado que notifica WFX ejecuta la misma lógica. Es lo que hace funcionar el lote automático, la compuerta del canario y el umbral de error.
</div>

<div className="lm-diff-ins lm-diff-block">
  En **cada** evento, el servicio actualiza el historial de actualizaciones del dispositivo y escribe el evento en los metadatos del dispositivo en Lamassu. Después, solo si el estado es terminal en el workflow, ejecuta estas comprobaciones en orden, y la primera que se cumple decide lo que ocurre:
</div>

<div className="lm-diff-ins lm-diff-block">
  | # | Comprobación                                                                                                                     | Si se cumple                                                                                                    |
  | - | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
  | 1 | ¿Es el estado terminal en el workflow?                                                                                           | Si no, no ocurre nada más                                                                                       |
  | 2 | (siempre)                                                                                                                        | Marcar la asignación del dispositivo como \`completed\` o \`failed\`. Si tuvo éxito, registrar la versión instalada |
  | 3 | ¿Falló el dispositivo canario?                                                                                                   | Pausar el lanzamiento. Reanuda para reintentar                                                                  |
  | 4 | ¿Está el lanzamiento pausado, cancelado o completado?                                                                            | Parar: no hay más lotes                                                                                         |
  | 5 | ¿Está definido \`error_threshold\`, y los fallos han alcanzado esa proporción de todos los dispositivos (redondeada hacia arriba)? | Cancelar el lanzamiento. Los dispositivos pendientes no se envían                                               |
  | 6 | ¿No hay nada pendiente ni nada activo?                                                                                           | Marcar el lanzamiento como \`completed\`                                                                          |
  | 7 | ¿Está \`auto\` desactivado, o no queda nada por enviar?                                                                            | Esperar a la siguiente llamada \`rollout\` del operador, o a los dispositivos que siguen en curso                 |
  | 8 | ¿Tuvo éxito al menos \`approval_threshold\` de este lote? (0, 100 o más significa todo el lote)                                    | Enviar el siguiente lote. Si no, esperar más resultados                                                         |
</div>

<div className="lm-diff-ins lm-diff-block">
  Solo los dispositivos enviados en el lote actual cuentan para su aprobación: un rezagado de un lote anterior nunca cuenta. Las comprobaciones mueven el lanzamiento entre estos estados:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  stateDiagram-v2
    direction LR
    [*] --> running: lanzamiento creado
    running --> paused: el operador pausa, o el canario falla
    paused --> running: resume
    running --> cancelled: el operador cancela, o se alcanza error_threshold
    paused --> cancelled: el operador cancela
    running --> completed: nada pendiente ni activo, o el operador completa
    paused --> completed: el operador completa
    completed --> running: retry-failed
    cancelled --> running: retry-failed
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Un lanzamiento nuevo se guarda con estado vacío, que significa \`running\`. Reanudar tras un fallo del canario vuelve a encolar el canario para que se intente de nuevo. Cancelar detiene los lotes siguientes, pero no retira los jobs que ya se están ejecutando en los dispositivos.
</div>

<div className="lm-diff-ins lm-diff-block">
  5. Construir un paquete cifrado por dispositivo [#5-construir-un-paquete-cifrado-por-dispositivo]
</div>

<div className="lm-diff-ins lm-diff-block">
  Cada dispositivo recibe su propio paquete, cifrado con su propia clave. El build resuelve primero la clave de cada dispositivo y después construye. Un dispositivo sin clave se omite, y se rechaza un lanzamiento sobre un paquete con dispositivos omitidos.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    actor Op as Operador
    participant API as API de Updates
    participant SYM as SymKMS
    participant DMS as Lamassu Device Manager
    participant SWG as swugenerator

    loop cada dispositivo
      Op->>SYM: POST /symkms/v1/ crear clave
      Op->>SYM: POST /symkms/v1/inventory/{device}/keys/{key} {purpose: firmware-encryption}
    end
    Op->>API: POST .../swu {encryption_alg_name, selected_artifact_ids}
    API->>DMS: listar los dispositivos del grupo
    Note over API: el build falla si el grupo no tiene dispositivos, o si la sw-description no marca ningún fichero con encrypted = true
    par cada dispositivo, en paralelo
      API->>SYM: GET /symkms/v1/inventory/{device}/key
    end
    Note over API: el build falla si ningún dispositivo tiene clave
    par cada dispositivo con clave, en paralelo
      API->>SWG: construir un .swu cifrado con esa clave
    end
    API->>API: registrar built_device_count, total_device_count, uncovered_devices
    API-->>Op: 200
    Note over Op,API: crear un lanzamiento devuelve 400 mientras uncovered_devices no esté vacío
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  \`uncovered_devices\` lista los dispositivos sin clave y también aquellos cuyo propio build falló. Un build en el que ningún dispositivo obtuvo paquete deja el paquete en \`build_failed\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  Modo hawkBit [#modo-hawkbit]
</div>

<div className="lm-diff-ins lm-diff-block">
  6. Construir un módulo y crear un paquete [#6-construir-un-módulo-y-crear-un-paquete]
</div>

<div className="lm-diff-ins lm-diff-block">
  El propio hawkBit no tiene noción de módulo construido, y este servicio solo enlaza módulos construidos a un distribution set de hawkBit. Un set nunca se construye directamente: \`POST .../swu\` y \`.../package\` responden \`501\` en este modo. Primero se construye el módulo, en el catálogo, y el paquete se crea a partir de él. El diagrama muestra la intención \`swu-build\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    actor Op as Operador
    participant API as API de Updates
    participant DB as Postgres
    participant SWG as swugenerator
    participant HB as hawkBit

    Op->>API: POST /softwaremodules {type, name, version, delivery_intent}
    API->>HB: crear el módulo de software
    API-->>Op: id del módulo
    Op->>API: POST /softwaremodules/by-id/{id}/artifacts (file)
    API->>HB: subir el artefacto al módulo
    Op->>API: POST /softwaremodules/by-id/{id}/descriptor (sw-description)
    API->>DB: guardar la sw-description
    Op->>API: POST /softwaremodules/by-id/{id}/build
    API->>HB: leer los ficheros de entrada del módulo
    API->>SWG: construir el .swu
    SWG-->>API: fichero .swu
    API->>HB: subir el .swu y después quitar los artefactos de entrada del módulo
    API-->>Op: módulo construido
    Op->>API: POST /groups/{g}/distribution-sets {modules: [{source_module_id}]}
    API->>HB: crear el distribution set enlazando el módulo construido
    API->>HB: etiquetarlo con el grupo
    opt los módulos estaban firmados
      API->>DB: guardar el manifiesto firmado del set
    end
    API-->>Op: 201 paquete (ya construido)
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Las otras intenciones de entrega se saltan pasos: \`swu-prebuilt\` solo sube el \`.swu\` terminado, que es lo que construye el módulo, y \`raw\` solo cifra o firma los ficheros, sin swugenerator ni sw-description (firmar añade un documento de checksum \`.sha256\` y su firma desacoplada como artefactos extra). Un build puede firmar a través del KMS y cifrar con una clave compartida de SymKMS. El cifrado por dispositivo se rechaza en modo hawkBit. Un módulo enlazado queda congelado: para cambiarlo, edítalo y constrúyelo en el catálogo, y vuelve a enlazarlo.
</div>

<div className="lm-diff-ins lm-diff-block">
  7. Lanzamiento y actualización del dispositivo [#7-lanzamiento-y-actualización-del-dispositivo]
</div>

<div className="lm-diff-ins lm-diff-block">
  El dispositivo habla con hawkBit, no con este servicio. El servicio lee el progreso de hawkBit cada vez que se le pide.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    actor Op as Operador
    participant API as API de Updates
    participant DMS as Lamassu Device Manager
    participant HB as hawkBit
    participant Dev as Dispositivo (SWUpdate suricatta)

    Op->>API: POST /groups/{g}/launch {paquete, estrategia}
    API->>DMS: listar los dispositivos del grupo
    API->>HB: crear los targets que faltan y etiquetarlos group:{g}
    API->>API: comprobar el canario, el grupo del paquete y las precondiciones
    API->>HB: crear un rollout (grupo canario opcional, luego lotes, luego el resto)
    API-->>Op: 201 launch_id, never_seen_devices
    Op->>API: POST .../rollout
    API->>HB: iniciar el rollout, o liberar el siguiente grupo
    Dev->>HB: consulta DDI, autenticada según los ajustes del tenant
    HB-->>Dev: deploymentBase con el artefacto del módulo
    Dev->>HB: descargar el .swu
    Dev->>HB: feedback proceeding, luego closed con result success
    HB->>HB: contadores del grupo del rollout, condiciones de éxito y error
    Op->>API: GET /groups/{g}/launch
    API->>HB: leer el rollout y sus grupos
    API-->>Op: estado y contadores
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Un grupo canario existe solo cuando se indica \`test_device_id\`. hawkBit decide cuándo un grupo tiene éxito y empieza el siguiente, usando los umbrales de aprobación y de error que le dio el servicio. Con \`auto\` desactivado, hawkBit se pausa tras cada grupo y la siguiente llamada \`rollout\` libera el siguiente. La respuesta del lanzamiento también lista \`superseded_devices\` (dispositivos cuya actualización en curso reemplaza el nuevo rollout) y \`never_seen_devices\` (dispositivos que nunca han consultado, lo que puede bloquear un grupo que debe alcanzar su umbral de éxito).
</div>

<div className="lm-diff-ins lm-diff-block">
  La llamada \`rollout\` depende del estado del rollout:
</div>

<div className="lm-diff-ins lm-diff-block">
  * Un rollout \`ready\` se inicia, y no ocurre nada mientras su hora de inicio esté en el futuro.
  * Un rollout pausado solo se reanuda si está pausado entre lotes. Una pausa del operador necesita \`resume\`, y un rollout detenido por su umbral de error no se puede reanudar.
  * Un rollout manual en ejecución libera su siguiente grupo.
  * Un rollout \`auto\` que ya está en ejecución se rechaza con \`400\`.
  * Un segundo \`rollout\` sobre el mismo lanzamiento mientras hay otro en curso responde \`409\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  La autenticación de dispositivos es un ajuste del tenant de hawkBit. Los tokens de seguridad de target vienen desactivados por defecto. Consulta [Conectar un dispositivo](/docs/platform/updates/guides/connect-a-device).
</div>

<div className="lm-diff-ins lm-diff-block">
  Siguientes pasos [#siguientes-pasos]
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Publicar y desplegar una actualización" description="Recorre los flujos 1 a 4 de principio a fin." href="/docs/platform/updates/guides/publish-and-roll-out" />

    <Card title="Modelo de datos" description="Las tablas detrás de estos flujos." href="/docs/platform/updates/data-model" />

    <Card title="Firma y cifrado" description="Claves, firmas y el manifiesto." href="/docs/platform/updates/signing-and-encryption" />
  </Cards>
</div>
`,r={title:"Flujos",description:"Diagramas de secuencia de las operaciones importantes, para los backends nativo y hawkBit."},t={isNew:!0,changes:43,title:void 0,description:void 0},c={contents:[{heading:void 0,content:"Estos diagramas siguen lo que hace el servicio, paso a paso. Las rutas son relativas a `/updates/v1`. Para ver comandos ejecutables consulta las guías de curl nativa y hawkBit, y la referencia de la API para cada ruta y cuerpo."},{heading:"1-publicar-y-construir-un-paquete",content:"Construir convierte los artefactos subidos y la sw-description en un único `.swu`. Nada se firma ni se cifra salvo que la petición de build lo pida."},{heading:"1-publicar-y-construir-un-paquete",content:"Cosas que conviene saber sobre el build:"},{heading:"1-publicar-y-construir-un-paquete",content:"El paquete se crea con un nombre, una `version` semántica, un `group_id`, un `type` y un `packaging` opcional. Un nombre duplicado en el grupo da un `409`."},{heading:"1-publicar-y-construir-un-paquete",content:"Subir un artefacto (o un entregable ya construido) a una versión que ya está construida se rechaza con `409`: crea primero una versión nueva. Un build o cambio que colisione con otro sobre el mismo paquete también responde `409`."},{heading:"1-publicar-y-construir-un-paquete",content:"Un fichero mayor que `max_artifact_size_mb` (10240 MiB por defecto) se rechaza con `413`."},{heading:"1-publicar-y-construir-un-paquete",content:"El cifrado lo decide el cuerpo del build: `user` más `encryption_key_name` es cifrado con clave compartida, y `encryption_alg_name` solo es cifrado por dispositivo (flujo 5)."},{heading:"1-publicar-y-construir-un-paquete",content:"Si el build falla, el paquete pasa a `build_failed`, `last_build_error` dice por qué, y el paquete sigue siendo editable. Los artefactos seleccionados reemplazan los enlaces de artefactos anteriores de la versión del paquete."},{heading:"1-publicar-y-construir-un-paquete",content:"Sin campos de firma, el manifiesto se guarda sin firmar. Si se indica una clave de firma pero no un certificado, el build falla."},{heading:"1-publicar-y-construir-un-paquete",content:"Un paquete `non-swu` se construye con `POST .../package` en un `.tar.gz`, y un entregable construido fuera se adjunta con `POST .../swu/upload` o `.../package/upload`."},{heading:"2-crear-un-lanzamiento",content:"Crear un lanzamiento decide a quién se dirige y comprueba que el paquete se puede entregar. Todavía no se envía nada a ningún dispositivo."},{heading:"2-crear-un-lanzamiento",content:"`?dry_run=true` se detiene tras la comprobación de precondiciones y responde `200` con `qualifying_devices`, `precondition_failures`, `superseded_devices` y `never_seen_devices`. `force_preconditions` apunta a todos los dispositivos del grupo y aun así registra cuáles fallaron. `distribution_set_name`, `workflow_type` y `rollout_type` son obligatorios, y también un `rollout_value` mayor que cero. `approval_threshold` y `error_threshold` deben estar entre 0 y 100, y cada incumplimiento es un `400`. Un lanzamiento también puede llevar `auto`, `scheduled_at`, `name`, `description` y `weight` (consulta Conceptos)."},{heading:"3-desplegar-un-lote-y-actualizar-un-dispositivo",content:"Una llamada `rollout` envía el siguiente lote. El canario va solo primero, y después lotes del tamaño configurado, elegidos al azar entre los dispositivos que siguen pendientes. El lado del dispositivo de abajo es el workflow `direct`, donde un job empieza en `INSTALL`."},{heading:"3-desplegar-un-lote-y-actualizar-un-dispositivo",content:"Con el workflow `phased`, un job empieza en `CREATED`, y algunas transiciones necesitan que una persona o un sistema las confirme en WFX. Este servicio no las avanza. El workflow `download-install`, que usan los paquetes `non-swu`, recorre `DOWNLOAD → DOWNLOADING → DOWNLOADED → INSTALL → INSTALLING → INSTALLED`."},{heading:"3-desplegar-un-lote-y-actualizar-un-dispositivo",content:"Con `auto` activado, una llamada `rollout` inicia el lanzamiento y los lotes siguientes los libera el flujo 4. Un lanzamiento con `scheduled_at` lo inicia el disparador de lanzamientos programados en la réplica líder cuando pasa esa hora."},{heading:"3-desplegar-un-lote-y-actualizar-un-dispositivo",content:"La llamada `rollout` no siempre es un `200` simple:"},{heading:"3-desplegar-un-lote-y-actualizar-un-dispositivo",content:"Se rechaza con `400` cuando el lanzamiento está pausado, cancelado, completado o abortado, y en un lanzamiento `auto` una vez que ha salido algún lote."},{heading:"3-desplegar-un-lote-y-actualizar-un-dispositivo",content:"No hace nada y responde `200` mientras `scheduled_at` esté todavía en el futuro, y mientras el canario siga activo. Devuelve un error si el canario falló."},{heading:"3-desplegar-un-lote-y-actualizar-un-dispositivo",content:"Si no se pueden crear algunos jobs, esos dispositivos siguen `pending` y la llamada devuelve un error de «partial rollout» (`500`)."},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"Cada cambio de estado que notifica WFX ejecuta la misma lógica. Es lo que hace funcionar el lote automático, la compuerta del canario y el umbral de error."},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"En **cada** evento, el servicio actualiza el historial de actualizaciones del dispositivo y escribe el evento en los metadatos del dispositivo en Lamassu. Después, solo si el estado es terminal en el workflow, ejecuta estas comprobaciones en orden, y la primera que se cumple decide lo que ocurre:"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"#"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"Comprobación"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"Si se cumple"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"1"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"¿Es el estado terminal en el workflow?"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"Si no, no ocurre nada más"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"2"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"(siempre)"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"Marcar la asignación del dispositivo como `completed` o `failed`. Si tuvo éxito, registrar la versión instalada"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"3"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"¿Falló el dispositivo canario?"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"Pausar el lanzamiento. Reanuda para reintentar"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"4"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"¿Está el lanzamiento pausado, cancelado o completado?"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"Parar: no hay más lotes"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"5"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"¿Está definido `error_threshold`, y los fallos han alcanzado esa proporción de todos los dispositivos (redondeada hacia arriba)?"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"Cancelar el lanzamiento. Los dispositivos pendientes no se envían"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"6"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"¿No hay nada pendiente ni nada activo?"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"Marcar el lanzamiento como `completed`"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"7"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"¿Está `auto` desactivado, o no queda nada por enviar?"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"Esperar a la siguiente llamada `rollout` del operador, o a los dispositivos que siguen en curso"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"8"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"¿Tuvo éxito al menos `approval_threshold` de este lote? (0, 100 o más significa todo el lote)"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"Enviar el siguiente lote. Si no, esperar más resultados"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"Solo los dispositivos enviados en el lote actual cuentan para su aprobación: un rezagado de un lote anterior nunca cuenta. Las comprobaciones mueven el lanzamiento entre estos estados:"},{heading:"4-reaccionar-cuando-un-dispositivo-termina",content:"Un lanzamiento nuevo se guarda con estado vacío, que significa `running`. Reanudar tras un fallo del canario vuelve a encolar el canario para que se intente de nuevo. Cancelar detiene los lotes siguientes, pero no retira los jobs que ya se están ejecutando en los dispositivos."},{heading:"5-construir-un-paquete-cifrado-por-dispositivo",content:"Cada dispositivo recibe su propio paquete, cifrado con su propia clave. El build resuelve primero la clave de cada dispositivo y después construye. Un dispositivo sin clave se omite, y se rechaza un lanzamiento sobre un paquete con dispositivos omitidos."},{heading:"5-construir-un-paquete-cifrado-por-dispositivo",content:"`uncovered_devices` lista los dispositivos sin clave y también aquellos cuyo propio build falló. Un build en el que ningún dispositivo obtuvo paquete deja el paquete en `build_failed`."},{heading:"6-construir-un-módulo-y-crear-un-paquete",content:"El propio hawkBit no tiene noción de módulo construido, y este servicio solo enlaza módulos construidos a un distribution set de hawkBit. Un set nunca se construye directamente: `POST .../swu` y `.../package` responden `501` en este modo. Primero se construye el módulo, en el catálogo, y el paquete se crea a partir de él. El diagrama muestra la intención `swu-build`."},{heading:"6-construir-un-módulo-y-crear-un-paquete",content:"Las otras intenciones de entrega se saltan pasos: `swu-prebuilt` solo sube el `.swu` terminado, que es lo que construye el módulo, y `raw` solo cifra o firma los ficheros, sin swugenerator ni sw-description (firmar añade un documento de checksum `.sha256` y su firma desacoplada como artefactos extra). Un build puede firmar a través del KMS y cifrar con una clave compartida de SymKMS. El cifrado por dispositivo se rechaza en modo hawkBit. Un módulo enlazado queda congelado: para cambiarlo, edítalo y constrúyelo en el catálogo, y vuelve a enlazarlo."},{heading:"7-lanzamiento-y-actualización-del-dispositivo",content:"El dispositivo habla con hawkBit, no con este servicio. El servicio lee el progreso de hawkBit cada vez que se le pide."},{heading:"7-lanzamiento-y-actualización-del-dispositivo",content:"Un grupo canario existe solo cuando se indica `test_device_id`. hawkBit decide cuándo un grupo tiene éxito y empieza el siguiente, usando los umbrales de aprobación y de error que le dio el servicio. Con `auto` desactivado, hawkBit se pausa tras cada grupo y la siguiente llamada `rollout` libera el siguiente. La respuesta del lanzamiento también lista `superseded_devices` (dispositivos cuya actualización en curso reemplaza el nuevo rollout) y `never_seen_devices` (dispositivos que nunca han consultado, lo que puede bloquear un grupo que debe alcanzar su umbral de éxito)."},{heading:"7-lanzamiento-y-actualización-del-dispositivo",content:"La llamada `rollout` depende del estado del rollout:"},{heading:"7-lanzamiento-y-actualización-del-dispositivo",content:"Un rollout `ready` se inicia, y no ocurre nada mientras su hora de inicio esté en el futuro."},{heading:"7-lanzamiento-y-actualización-del-dispositivo",content:"Un rollout pausado solo se reanuda si está pausado entre lotes. Una pausa del operador necesita `resume`, y un rollout detenido por su umbral de error no se puede reanudar."},{heading:"7-lanzamiento-y-actualización-del-dispositivo",content:"Un rollout manual en ejecución libera su siguiente grupo."},{heading:"7-lanzamiento-y-actualización-del-dispositivo",content:"Un rollout `auto` que ya está en ejecución se rechaza con `400`."},{heading:"7-lanzamiento-y-actualización-del-dispositivo",content:"Un segundo `rollout` sobre el mismo lanzamiento mientras hay otro en curso responde `409`."},{heading:"7-lanzamiento-y-actualización-del-dispositivo",content:"La autenticación de dispositivos es un ajuste del tenant de hawkBit. Los tokens de seguridad de target vienen desactivados por defecto. Consulta Conectar un dispositivo."},{heading:"siguientes-pasos",content:'<Card title="Publicar y desplegar una actualización" description="Recorre los flujos 1 a 4 de principio a fin." href="/docs/platform/updates/guides/publish-and-roll-out" />'},{heading:"siguientes-pasos",content:'<Card title="Modelo de datos" description="Las tablas detrás de estos flujos." href="/docs/platform/updates/data-model" />'},{heading:"siguientes-pasos",content:'<Card title="Firma y cifrado" description="Claves, firmas y el manifiesto." href="/docs/platform/updates/signing-and-encryption" />'}],headings:[{id:"modo-nativo",content:"Modo nativo"},{id:"1-publicar-y-construir-un-paquete",content:"1\\. Publicar y construir un paquete"},{id:"2-crear-un-lanzamiento",content:"2\\. Crear un lanzamiento"},{id:"3-desplegar-un-lote-y-actualizar-un-dispositivo",content:"3\\. Desplegar un lote y actualizar un dispositivo"},{id:"4-reaccionar-cuando-un-dispositivo-termina",content:"4\\. Reaccionar cuando un dispositivo termina"},{id:"5-construir-un-paquete-cifrado-por-dispositivo",content:"5\\. Construir un paquete cifrado por dispositivo"},{id:"modo-hawkbit",content:"Modo hawkBit"},{id:"6-construir-un-módulo-y-crear-un-paquete",content:"6\\. Construir un módulo y crear un paquete"},{id:"7-lanzamiento-y-actualización-del-dispositivo",content:"7\\. Lanzamiento y actualización del dispositivo"},{id:"siguientes-pasos",content:"Siguientes pasos"}]};const u=[{depth:2,url:"#modo-nativo",title:e.jsx(e.Fragment,{children:"Modo nativo"})},{depth:3,url:"#1-publicar-y-construir-un-paquete",title:e.jsx(e.Fragment,{children:"1. Publicar y construir un paquete"})},{depth:3,url:"#2-crear-un-lanzamiento",title:e.jsx(e.Fragment,{children:"2. Crear un lanzamiento"})},{depth:3,url:"#3-desplegar-un-lote-y-actualizar-un-dispositivo",title:e.jsx(e.Fragment,{children:"3. Desplegar un lote y actualizar un dispositivo"})},{depth:3,url:"#4-reaccionar-cuando-un-dispositivo-termina",title:e.jsx(e.Fragment,{children:"4. Reaccionar cuando un dispositivo termina"})},{depth:3,url:"#5-construir-un-paquete-cifrado-por-dispositivo",title:e.jsx(e.Fragment,{children:"5. Construir un paquete cifrado por dispositivo"})},{depth:2,url:"#modo-hawkbit",title:e.jsx(e.Fragment,{children:"Modo hawkBit"})},{depth:3,url:"#6-construir-un-módulo-y-crear-un-paquete",title:e.jsx(e.Fragment,{children:"6. Construir un módulo y crear un paquete"})},{depth:3,url:"#7-lanzamiento-y-actualización-del-dispositivo",title:e.jsx(e.Fragment,{children:"7. Lanzamiento y actualización del dispositivo"})},{depth:2,url:"#siguientes-pasos",title:e.jsx(e.Fragment,{children:"Siguientes pasos"})}];function l(s){const i={a:"a",code:"code",div:"div",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components},{Card:a,Cards:n}=i;return a||o("Card"),n||o("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Estos diagramas siguen lo que hace el servicio, paso a paso. Las rutas son relativas a ",e.jsx(i.code,{children:"/updates/v1"}),". Para ver comandos ejecutables consulta las guías de curl ",e.jsx(i.a,{href:"/docs/platform/updates/guides/native-curl",children:"nativa"})," y ",e.jsx(i.a,{href:"/docs/platform/updates/guides/hawkbit-curl",children:"hawkBit"}),", y la ",e.jsx(i.a,{href:"/docs/platform/updates/reference/api",children:"referencia de la API"})," para cada ruta y cuerpo."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"modo-nativo",children:"Modo nativo"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"1-publicar-y-construir-un-paquete",children:"1. Publicar y construir un paquete"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Construir convierte los artefactos subidos y la sw-description en un único ",e.jsx(i.code,{children:".swu"}),". Nada se firma ni se cifra salvo que la petición de build lo pida."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  actor Op as Operador"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant API as API de Updates"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DB as Postgres"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant FS as Almacenes de blobs y directorio temporal"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant SWG as swugenerator"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant KMS as Lamassu KMS"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /groups/{g}/distribution-sets"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: insertar el paquete (estado draft)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: 201 paquete"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST .../descriptor/upload (sw-description)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: guardar la sw-description"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST .../artifact/upload (file, artifact_name, version)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>FS: guardar los bytes del artefacto en el almacén artifacts"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: insertar el artefacto y enlazarlo al paquete"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: id del artefacto"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST .../swu {selected_artifact_ids, encryption, signature}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>FS: preparar el descriptor y los artefactos elegidos en un directorio de build"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  opt cifrado compartido o por dispositivo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>API: obtener la clave de SymKMS"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>SWG: construir el .swu"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  opt se pidió firma"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    SWG->>KMS: firmar la sw-description"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    KMS-->>SWG: firma"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  SWG-->>API: fichero .swu"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>FS: publicar el build en el almacén builds"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: instantánea de la versión y de su manifiesto"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  opt se pidió firma"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>KMS: firmar el manifiesto de la versión"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    KMS-->>API: firma"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: poner estado built y uri"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: 200 Update pack executed successfully"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Cosas que conviene saber sobre el build:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["El paquete se crea con un nombre, una ",e.jsx(i.code,{children:"version"})," semántica, un ",e.jsx(i.code,{children:"group_id"}),", un ",e.jsx(i.code,{children:"type"})," y un ",e.jsx(i.code,{children:"packaging"})," opcional. Un nombre duplicado en el grupo da un ",e.jsx(i.code,{children:"409"}),"."]}),`
`,e.jsxs(i.li,{children:["Subir un artefacto (o un entregable ya construido) a una versión que ya está construida se rechaza con ",e.jsx(i.code,{children:"409"}),": crea primero una versión nueva. Un build o cambio que colisione con otro sobre el mismo paquete también responde ",e.jsx(i.code,{children:"409"}),"."]}),`
`,e.jsxs(i.li,{children:["Un fichero mayor que ",e.jsx(i.code,{children:"max_artifact_size_mb"})," (10240 MiB por defecto) se rechaza con ",e.jsx(i.code,{children:"413"}),"."]}),`
`,e.jsxs(i.li,{children:["El cifrado lo decide el cuerpo del build: ",e.jsx(i.code,{children:"user"})," más ",e.jsx(i.code,{children:"encryption_key_name"})," es cifrado con clave compartida, y ",e.jsx(i.code,{children:"encryption_alg_name"})," solo es cifrado por dispositivo (flujo 5)."]}),`
`,e.jsxs(i.li,{children:["Si el build falla, el paquete pasa a ",e.jsx(i.code,{children:"build_failed"}),", ",e.jsx(i.code,{children:"last_build_error"})," dice por qué, y el paquete sigue siendo editable. Los artefactos seleccionados reemplazan los enlaces de artefactos anteriores de la versión del paquete."]}),`
`,e.jsx(i.li,{children:"Sin campos de firma, el manifiesto se guarda sin firmar. Si se indica una clave de firma pero no un certificado, el build falla."}),`
`,e.jsxs(i.li,{children:["Un paquete ",e.jsx(i.code,{children:"non-swu"})," se construye con ",e.jsx(i.code,{children:"POST .../package"})," en un ",e.jsx(i.code,{children:".tar.gz"}),", y un entregable construido fuera se adjunta con ",e.jsx(i.code,{children:"POST .../swu/upload"})," o ",e.jsx(i.code,{children:".../package/upload"}),"."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"2-crear-un-lanzamiento",children:"2. Crear un lanzamiento"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Crear un lanzamiento decide a quién se dirige y comprueba que el paquete se puede entregar. Todavía no se envía nada a ningún dispositivo."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  actor Op as Operador"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant API as API de Updates"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DMS as Lamassu Device Manager"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DB as Postgres"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /groups/{g}/launch {nombre del paquete, estrategia, test_device_id}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: cargar el paquete por grupo y nombre"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  alt el paquete no está construido"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API-->>Op: 400 construye primero el paquete"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  else paquete por dispositivo con dispositivos sin cubrir"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API-->>Op: 400 dispositivos sin paquete"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  else"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>DMS: listar los dispositivos del grupo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    DMS-->>API: ids de dispositivo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>API: evaluar las precondiciones del paquete por dispositivo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    alt ningún dispositivo al que dirigirse"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"      API-->>Op: 500 el grupo no tiene dispositivos a los que lanzar"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    else el canario no está en el grupo, o no cumple"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"      API-->>Op: 400 el dispositivo de prueba no es un miembro válido"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    else"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"      API->>DB: insertar el lanzamiento y una asignación pending por dispositivo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"      API-->>Op: 201 launch_id, precondition_failures, forced"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.code,{children:"?dry_run=true"})," se detiene tras la comprobación de precondiciones y responde ",e.jsx(i.code,{children:"200"})," con ",e.jsx(i.code,{children:"qualifying_devices"}),", ",e.jsx(i.code,{children:"precondition_failures"}),", ",e.jsx(i.code,{children:"superseded_devices"})," y ",e.jsx(i.code,{children:"never_seen_devices"}),". ",e.jsx(i.code,{children:"force_preconditions"})," apunta a todos los dispositivos del grupo y aun así registra cuáles fallaron. ",e.jsx(i.code,{children:"distribution_set_name"}),", ",e.jsx(i.code,{children:"workflow_type"})," y ",e.jsx(i.code,{children:"rollout_type"})," son obligatorios, y también un ",e.jsx(i.code,{children:"rollout_value"})," mayor que cero. ",e.jsx(i.code,{children:"approval_threshold"})," y ",e.jsx(i.code,{children:"error_threshold"})," deben estar entre 0 y 100, y cada incumplimiento es un ",e.jsx(i.code,{children:"400"}),". Un lanzamiento también puede llevar ",e.jsx(i.code,{children:"auto"}),", ",e.jsx(i.code,{children:"scheduled_at"}),", ",e.jsx(i.code,{children:"name"}),", ",e.jsx(i.code,{children:"description"})," y ",e.jsx(i.code,{children:"weight"})," (consulta ",e.jsx(i.a,{href:"/docs/platform/updates/concepts#campa%C3%B1as-de-lanzamiento",children:"Conceptos"}),")."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"3-desplegar-un-lote-y-actualizar-un-dispositivo",children:"3. Desplegar un lote y actualizar un dispositivo"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Una llamada ",e.jsx(i.code,{children:"rollout"})," envía el siguiente lote. El canario va solo primero, y después lotes del tamaño configurado, elegidos al azar entre los dispositivos que siguen pendientes. El lado del dispositivo de abajo es el workflow ",e.jsx(i.code,{children:"direct"}),", donde un job empieza en ",e.jsx(i.code,{children:"INSTALL"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  actor Op as Operador"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant API as API de Updates"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DB as Postgres"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant WFX as WFX"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant Dev as Dispositivo (SWUpdate)"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /groups/{g}/launch/{id}/rollout"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: reclamar el siguiente índice de lote (atómico, un solo despachador por lanzamiento)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  loop cada dispositivo del lote"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>WFX: crear job (workflow, uri, algorithm, iv, version)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    WFX-->>API: id del job"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>DB: registrar una fila pending en el historial de actualizaciones"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>DB: marcar la asignación del dispositivo como active"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: 200"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>WFX: consultar los jobs de este cliente"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  WFX-->>Dev: job en estado INSTALL"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>API: GET .../swu/download/{deviceId}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Dev: el .swu"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>WFX: PUT estado INSTALLING"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>WFX: PUT estado INSTALLED"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  WFX->>WFX: transición automática a ACTIVATE"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>WFX: PUT estado ACTIVATING"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>WFX: PUT estado ACTIVATED"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  WFX-->>API: flujo de eventos: cada cambio de estado del job"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Note over API,DB: El flujo 4 gestiona cada evento"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Con el workflow ",e.jsx(i.code,{children:"phased"}),", un job empieza en ",e.jsx(i.code,{children:"CREATED"}),", y algunas transiciones necesitan que una persona o un sistema las confirme en WFX. Este servicio no las avanza. El workflow ",e.jsx(i.code,{children:"download-install"}),", que usan los paquetes ",e.jsx(i.code,{children:"non-swu"}),", recorre ",e.jsx(i.code,{children:"DOWNLOAD → DOWNLOADING → DOWNLOADED → INSTALL → INSTALLING → INSTALLED"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Con ",e.jsx(i.code,{children:"auto"})," activado, una llamada ",e.jsx(i.code,{children:"rollout"})," inicia el lanzamiento y los lotes siguientes los libera el flujo 4. Un lanzamiento con ",e.jsx(i.code,{children:"scheduled_at"})," lo inicia el disparador de lanzamientos programados en la réplica líder cuando pasa esa hora."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["La llamada ",e.jsx(i.code,{children:"rollout"})," no siempre es un ",e.jsx(i.code,{children:"200"})," simple:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Se rechaza con ",e.jsx(i.code,{children:"400"})," cuando el lanzamiento está pausado, cancelado, completado o abortado, y en un lanzamiento ",e.jsx(i.code,{children:"auto"})," una vez que ha salido algún lote."]}),`
`,e.jsxs(i.li,{children:["No hace nada y responde ",e.jsx(i.code,{children:"200"})," mientras ",e.jsx(i.code,{children:"scheduled_at"})," esté todavía en el futuro, y mientras el canario siga activo. Devuelve un error si el canario falló."]}),`
`,e.jsxs(i.li,{children:["Si no se pueden crear algunos jobs, esos dispositivos siguen ",e.jsx(i.code,{children:"pending"})," y la llamada devuelve un error de «partial rollout» (",e.jsx(i.code,{children:"500"}),")."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"4-reaccionar-cuando-un-dispositivo-termina",children:"4. Reaccionar cuando un dispositivo termina"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Cada cambio de estado que notifica WFX ejecuta la misma lógica. Es lo que hace funcionar el lote automático, la compuerta del canario y el umbral de error."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["En ",e.jsx(i.strong,{children:"cada"})," evento, el servicio actualiza el historial de actualizaciones del dispositivo y escribe el evento en los metadatos del dispositivo en Lamassu. Después, solo si el estado es terminal en el workflow, ejecuta estas comprobaciones en orden, y la primera que se cumple decide lo que ocurre:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"#"}),e.jsx(i.th,{children:"Comprobación"}),e.jsx(i.th,{children:"Si se cumple"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"1"}),e.jsx(i.td,{children:"¿Es el estado terminal en el workflow?"}),e.jsx(i.td,{children:"Si no, no ocurre nada más"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"2"}),e.jsx(i.td,{children:"(siempre)"}),e.jsxs(i.td,{children:["Marcar la asignación del dispositivo como ",e.jsx(i.code,{children:"completed"})," o ",e.jsx(i.code,{children:"failed"}),". Si tuvo éxito, registrar la versión instalada"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"3"}),e.jsx(i.td,{children:"¿Falló el dispositivo canario?"}),e.jsx(i.td,{children:"Pausar el lanzamiento. Reanuda para reintentar"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"4"}),e.jsx(i.td,{children:"¿Está el lanzamiento pausado, cancelado o completado?"}),e.jsx(i.td,{children:"Parar: no hay más lotes"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"5"}),e.jsxs(i.td,{children:["¿Está definido ",e.jsx(i.code,{children:"error_threshold"}),", y los fallos han alcanzado esa proporción de todos los dispositivos (redondeada hacia arriba)?"]}),e.jsx(i.td,{children:"Cancelar el lanzamiento. Los dispositivos pendientes no se envían"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"6"}),e.jsx(i.td,{children:"¿No hay nada pendiente ni nada activo?"}),e.jsxs(i.td,{children:["Marcar el lanzamiento como ",e.jsx(i.code,{children:"completed"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"7"}),e.jsxs(i.td,{children:["¿Está ",e.jsx(i.code,{children:"auto"})," desactivado, o no queda nada por enviar?"]}),e.jsxs(i.td,{children:["Esperar a la siguiente llamada ",e.jsx(i.code,{children:"rollout"})," del operador, o a los dispositivos que siguen en curso"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"8"}),e.jsxs(i.td,{children:["¿Tuvo éxito al menos ",e.jsx(i.code,{children:"approval_threshold"})," de este lote? (0, 100 o más significa todo el lote)"]}),e.jsx(i.td,{children:"Enviar el siguiente lote. Si no, esperar más resultados"})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Solo los dispositivos enviados en el lote actual cuentan para su aprobación: un rezagado de un lote anterior nunca cuenta. Las comprobaciones mueven el lanzamiento entre estos estados:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"stateDiagram-v2"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  direction LR"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  [*] --> running: lanzamiento creado"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  running --> paused: el operador pausa, o el canario falla"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  paused --> running: resume"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  running --> cancelled: el operador cancela, o se alcanza error_threshold"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  paused --> cancelled: el operador cancela"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  running --> completed: nada pendiente ni activo, o el operador completa"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  paused --> completed: el operador completa"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  completed --> running: retry-failed"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  cancelled --> running: retry-failed"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Un lanzamiento nuevo se guarda con estado vacío, que significa ",e.jsx(i.code,{children:"running"}),". Reanudar tras un fallo del canario vuelve a encolar el canario para que se intente de nuevo. Cancelar detiene los lotes siguientes, pero no retira los jobs que ya se están ejecutando en los dispositivos."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"5-construir-un-paquete-cifrado-por-dispositivo",children:"5. Construir un paquete cifrado por dispositivo"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Cada dispositivo recibe su propio paquete, cifrado con su propia clave. El build resuelve primero la clave de cada dispositivo y después construye. Un dispositivo sin clave se omite, y se rechaza un lanzamiento sobre un paquete con dispositivos omitidos."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  actor Op as Operador"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant API as API de Updates"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant SYM as SymKMS"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DMS as Lamassu Device Manager"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant SWG as swugenerator"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  loop cada dispositivo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    Op->>SYM: POST /symkms/v1/ crear clave"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    Op->>SYM: POST /symkms/v1/inventory/{device}/keys/{key} {purpose: firmware-encryption}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST .../swu {encryption_alg_name, selected_artifact_ids}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DMS: listar los dispositivos del grupo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Note over API: el build falla si el grupo no tiene dispositivos, o si la sw-description no marca ningún fichero con encrypted = true"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  par cada dispositivo, en paralelo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>SYM: GET /symkms/v1/inventory/{device}/key"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Note over API: el build falla si ningún dispositivo tiene clave"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  par cada dispositivo con clave, en paralelo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>SWG: construir un .swu cifrado con esa clave"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>API: registrar built_device_count, total_device_count, uncovered_devices"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: 200"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Note over Op,API: crear un lanzamiento devuelve 400 mientras uncovered_devices no esté vacío"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.code,{children:"uncovered_devices"})," lista los dispositivos sin clave y también aquellos cuyo propio build falló. Un build en el que ningún dispositivo obtuvo paquete deja el paquete en ",e.jsx(i.code,{children:"build_failed"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"modo-hawkbit",children:"Modo hawkBit"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"6-construir-un-módulo-y-crear-un-paquete",children:"6. Construir un módulo y crear un paquete"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["El propio hawkBit no tiene noción de módulo construido, y este servicio solo enlaza módulos construidos a un distribution set de hawkBit. Un set nunca se construye directamente: ",e.jsx(i.code,{children:"POST .../swu"})," y ",e.jsx(i.code,{children:".../package"})," responden ",e.jsx(i.code,{children:"501"})," en este modo. Primero se construye el módulo, en el catálogo, y el paquete se crea a partir de él. El diagrama muestra la intención ",e.jsx(i.code,{children:"swu-build"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  actor Op as Operador"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant API as API de Updates"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DB as Postgres"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant SWG as swugenerator"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant HB as hawkBit"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /softwaremodules {type, name, version, delivery_intent}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: crear el módulo de software"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: id del módulo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /softwaremodules/by-id/{id}/artifacts (file)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: subir el artefacto al módulo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /softwaremodules/by-id/{id}/descriptor (sw-description)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: guardar la sw-description"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /softwaremodules/by-id/{id}/build"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: leer los ficheros de entrada del módulo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>SWG: construir el .swu"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  SWG-->>API: fichero .swu"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: subir el .swu y después quitar los artefactos de entrada del módulo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: módulo construido"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /groups/{g}/distribution-sets {modules: [{source_module_id}]}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: crear el distribution set enlazando el módulo construido"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: etiquetarlo con el grupo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  opt los módulos estaban firmados"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>DB: guardar el manifiesto firmado del set"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: 201 paquete (ya construido)"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Las otras intenciones de entrega se saltan pasos: ",e.jsx(i.code,{children:"swu-prebuilt"})," solo sube el ",e.jsx(i.code,{children:".swu"})," terminado, que es lo que construye el módulo, y ",e.jsx(i.code,{children:"raw"})," solo cifra o firma los ficheros, sin swugenerator ni sw-description (firmar añade un documento de checksum ",e.jsx(i.code,{children:".sha256"})," y su firma desacoplada como artefactos extra). Un build puede firmar a través del KMS y cifrar con una clave compartida de SymKMS. El cifrado por dispositivo se rechaza en modo hawkBit. Un módulo enlazado queda congelado: para cambiarlo, edítalo y constrúyelo en el catálogo, y vuelve a enlazarlo."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"7-lanzamiento-y-actualización-del-dispositivo",children:"7. Lanzamiento y actualización del dispositivo"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"El dispositivo habla con hawkBit, no con este servicio. El servicio lee el progreso de hawkBit cada vez que se le pide."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  actor Op as Operador"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant API as API de Updates"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DMS as Lamassu Device Manager"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant HB as hawkBit"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant Dev as Dispositivo (SWUpdate suricatta)"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /groups/{g}/launch {paquete, estrategia}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DMS: listar los dispositivos del grupo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: crear los targets que faltan y etiquetarlos group:{g}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>API: comprobar el canario, el grupo del paquete y las precondiciones"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: crear un rollout (grupo canario opcional, luego lotes, luego el resto)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: 201 launch_id, never_seen_devices"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST .../rollout"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: iniciar el rollout, o liberar el siguiente grupo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>HB: consulta DDI, autenticada según los ajustes del tenant"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  HB-->>Dev: deploymentBase con el artefacto del módulo"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>HB: descargar el .swu"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>HB: feedback proceeding, luego closed con result success"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  HB->>HB: contadores del grupo del rollout, condiciones de éxito y error"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: GET /groups/{g}/launch"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: leer el rollout y sus grupos"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: estado y contadores"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Un grupo canario existe solo cuando se indica ",e.jsx(i.code,{children:"test_device_id"}),". hawkBit decide cuándo un grupo tiene éxito y empieza el siguiente, usando los umbrales de aprobación y de error que le dio el servicio. Con ",e.jsx(i.code,{children:"auto"})," desactivado, hawkBit se pausa tras cada grupo y la siguiente llamada ",e.jsx(i.code,{children:"rollout"})," libera el siguiente. La respuesta del lanzamiento también lista ",e.jsx(i.code,{children:"superseded_devices"})," (dispositivos cuya actualización en curso reemplaza el nuevo rollout) y ",e.jsx(i.code,{children:"never_seen_devices"})," (dispositivos que nunca han consultado, lo que puede bloquear un grupo que debe alcanzar su umbral de éxito)."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["La llamada ",e.jsx(i.code,{children:"rollout"})," depende del estado del rollout:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Un rollout ",e.jsx(i.code,{children:"ready"})," se inicia, y no ocurre nada mientras su hora de inicio esté en el futuro."]}),`
`,e.jsxs(i.li,{children:["Un rollout pausado solo se reanuda si está pausado entre lotes. Una pausa del operador necesita ",e.jsx(i.code,{children:"resume"}),", y un rollout detenido por su umbral de error no se puede reanudar."]}),`
`,e.jsx(i.li,{children:"Un rollout manual en ejecución libera su siguiente grupo."}),`
`,e.jsxs(i.li,{children:["Un rollout ",e.jsx(i.code,{children:"auto"})," que ya está en ejecución se rechaza con ",e.jsx(i.code,{children:"400"}),"."]}),`
`,e.jsxs(i.li,{children:["Un segundo ",e.jsx(i.code,{children:"rollout"})," sobre el mismo lanzamiento mientras hay otro en curso responde ",e.jsx(i.code,{children:"409"}),"."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["La autenticación de dispositivos es un ajuste del tenant de hawkBit. Los tokens de seguridad de target vienen desactivados por defecto. Consulta ",e.jsx(i.a,{href:"/docs/platform/updates/guides/connect-a-device",children:"Conectar un dispositivo"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"siguientes-pasos",children:"Siguientes pasos"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n,{children:[e.jsx(a,{title:"Publicar y desplegar una actualización",description:"Recorre los flujos 1 a 4 de principio a fin.",href:"/docs/platform/updates/guides/publish-and-roll-out"}),e.jsx(a,{title:"Modelo de datos",description:"Las tablas detrás de estos flujos.",href:"/docs/platform/updates/data-model"}),e.jsx(a,{title:"Firma y cifrado",description:"Claves, firmas y el manifiesto.",href:"/docs/platform/updates/signing-and-encryption"})]})})]})}function p(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(l,{...s})}):l(s)}function o(s,i){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:p,frontmatter:r,lmDiff:t,structuredData:c,toc:u},Symbol.toStringTag,{value:"Module"}));export{m as _};
