import{j as e}from"./index-DqgIL_Rv.js";let t=`

<div className="lm-diff-ins lm-diff-block">
  Las tablas que Lamassu Updates guarda en Postgres, cómo se relacionan y cómo se crea y migra el esquema. Es una referencia para operadores e integradores que consultan la base de datos, la dimensionan o planifican una actualización de versión.
</div>

<div className="lm-diff-ins lm-diff-block">
  Tablas del modo nativo [#tablas-del-modo-nativo]
</div>

<div className="lm-diff-ins lm-diff-block">
  Se crean en Postgres al arrancar, en la base de datos \`updates\`. Los tipos de Go están en \`pkg/models/updates.go\` del [repositorio ota](https://github.com/lamassuiot/ota).
</div>

<div className="lm-diff-ins lm-diff-block">
  | Tabla                             | Contiene                                                                                                                                                                                                    |
  | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | \`distribution_set\`                | Un paquete de actualización: nombre, versión, grupo, tipo, empaquetado, estado, la sw-description (\`sw_descriptor\`), precondiciones, ajustes de cifrado y firma, y la cobertura del build por dispositivo   |
  | \`distribution_set_version\`        | Una instantánea de cada versión construida, con su manifiesto firmado                                                                                                                                       |
  | \`distribution_set_module\`         | Los módulos de una versión de paquete, con clave formada por paquete, versión, tipo de módulo y nombre. También contiene módulos de catálogo que no pertenecen a ningún paquete, con el ID de paquete vacío |
  | \`artifact\`                        | Un artefacto global: la entrada de catálogo de un fichero subido, único por nombre y versión                                                                                                                |
  | \`distribution_set_artifact\`       | El enlace entre una versión de paquete, un artefacto y, opcionalmente, un módulo                                                                                                                            |
  | \`launchtrack\`                     | Una campaña de lanzamiento: estrategia, estado, umbrales y contabilidad de lotes                                                                                                                            |
  | \`launch_device_assignments\`       | El estado de cada dispositivo dentro de un lanzamiento: \`pending\`, \`active\`, \`completed\` o \`failed\`                                                                                                         |
  | \`device_distribution_set_version\` | Qué versión de paquete lleva ahora un dispositivo                                                                                                                                                           |
  | \`device_distribution_set_update\`  | El historial de actualizaciones de un dispositivo                                                                                                                                                           |
  | \`latest_distribution_set_version\` | La última versión declarada por grupo y paquete                                                                                                                                                             |
  | \`updates_schema_migrations\`       | Una fila por cada migración de datos que debe ejecutarse una sola vez (la migración del umbral de aprobación)                                                                                               |
</div>

<div className="lm-diff-ins lm-diff-block">
  Los bytes de los ficheros (artefactos, builds, claves) no están en Postgres. Viven en los almacenes de blobs descritos en [Configuración](/docs/platform/updates/reference/configuration). La sw-description está en Postgres (una columna del paquete y de cada módulo).
</div>

<div className="lm-diff-ins lm-diff-block">
  Tablas del modo hawkBit [#tablas-del-modo-hawkbit]
</div>

<div className="lm-diff-ins lm-diff-block">
  En modo hawkBit, los paquetes, rollouts y jobs viven en hawkBit. Este servicio guarda solo lo siguiente en el mismo Postgres (la base de datos \`updates\`), para aquello para lo que hawkBit no tiene equivalente:
</div>

<div className="lm-diff-ins lm-diff-block">
  | Tabla                             | Contiene                                                                                                                                                                                                         |
  | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | \`hawkbit_staged_artifact\`         | Bytes de \`POST /artifacts\`. Las subidas con más de 30 minutos se descartan la próxima vez que alguien sube un artefacto, y siguen siendo legibles hasta entonces. No se pueden enlazar a un paquete en este modo |
  | \`hawkbit_artifact_alias\`          | Se lee al resolver un ID de artefacto, pero ya nada la escribe                                                                                                                                                   |
  | \`hawkbit_sw_descriptor_v2\`        | sw-descriptions, precondiciones de lanzamiento y banderas de rollout (un almacén de texto clave-valor de uso general, con clave formada por instancia, tipo e ID)                                                |
  | \`hawkbit_set_manifest_v2\`         | Manifiestos firmados de los sets construidos                                                                                                                                                                     |
  | \`hawkbit_cancelled_rollout_v2\`    | Rollouts cancelados a través de este servicio                                                                                                                                                                    |
  | \`latest_distribution_set_version\` | Últimas versiones declaradas (compartida con el modo nativo)                                                                                                                                                     |
</div>

<div className="lm-diff-ins lm-diff-block">
  Las filas con clave formada por un ID de hawkBit llevan un \`instance_id\`, un marcador de los datos de hawkBit que describen. Si hawkBit pierde sus datos y empieza de nuevo, los IDs se repiten, y el servicio deja de leer las filas escritas para la instancia anterior. El servicio vuelve a comprobar el marcador cada 30 segundos.
</div>

<div className="lm-diff-ins lm-diff-block">
  hawkBit mantiene su propio esquema en su propia base de datos \`hawkbit\`. En el stack de Docker Compose, \`init.sql\` crea ambas bases de datos la primera vez que arranca el contenedor de Postgres.
</div>

<div className="lm-diff-ins lm-diff-block">
  Diagramas entidad-relación [#diagramas-entidad-relación]
</div>

<div className="lm-diff-ins lm-diff-block">
  Las tablas del modo nativo, con sus columnas principales. Las columnas \`*_id\` que apuntan a otra tabla se dibujan como las líneas de relación. Son referencias lógicas: el servicio no crea restricciones de clave foránea en la base de datos, y \`FK\` solo marca qué columna contiene la referencia.
</div>

<div className="lm-diff-ins lm-diff-block">
  Paquetes, módulos y artefactos [#paquetes-módulos-y-artefactos]
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  erDiagram
    DISTRIBUTION_SET ||--o{ DISTRIBUTION_SET_VERSION : "snapshot per built version"
    DISTRIBUTION_SET |o--o{ DISTRIBUTION_SET_MODULE : "composed of"
    DISTRIBUTION_SET ||--o{ DISTRIBUTION_SET_ARTIFACT : "links"
    ARTIFACT ||--o{ DISTRIBUTION_SET_ARTIFACT : "referenced by"
    DISTRIBUTION_SET_MODULE |o--o{ DISTRIBUTION_SET_ARTIFACT : "owns"
    DISTRIBUTION_SET_MODULE |o--o{ DISTRIBUTION_SET_MODULE : "copied from"
    DISTRIBUTION_SET ||--o{ LATEST_DISTRIBUTION_SET_VERSION : "declared latest"

    DISTRIBUTION_SET {
      string id PK
      string name
      string version
      string group_id
      string type
      string packaging
      string status
      string uri
      string encryption_mode
      string sw_descriptor
      string last_build_error
    }
    DISTRIBUTION_SET_VERSION {
      string id PK
      string distribution_set_id FK
      string version
      string checksum
      string manifest_json
      string manifest_signature
    }
    DISTRIBUTION_SET_MODULE {
      string id PK
      string distribution_set_id FK
      string distribution_set_version
      string type
      string name
      string version
      string delivery_intent
      boolean built
      string sw_descriptor
      string release_notes
      string source_module_id FK
    }
    ARTIFACT {
      string id PK
      string name
      string version
      string filename
      string checksum
      int size
    }
    DISTRIBUTION_SET_ARTIFACT {
      string id PK
      string distribution_set_id FK
      string distribution_set_version
      string artifact_id FK
      string distribution_set_module_id FK
    }
    LATEST_DISTRIBUTION_SET_VERSION {
      string id PK
      string group_id
      string distribution_set_id FK
      string version
    }
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Lanzamientos y dispositivos [#lanzamientos-y-dispositivos]
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  erDiagram
    DISTRIBUTION_SET ||--o{ LAUNCHTRACK : "launched as"
    LAUNCHTRACK ||--o{ LAUNCH_DEVICE_ASSIGNMENTS : "targets"
    DISTRIBUTION_SET ||--o{ DEVICE_DISTRIBUTION_SET_VERSION : "installed on"
    DISTRIBUTION_SET ||--o{ DEVICE_DISTRIBUTION_SET_UPDATE : "update attempts"
    LAUNCHTRACK |o--o{ DEVICE_DISTRIBUTION_SET_UPDATE : "caused by"
    LAUNCHTRACK |o--o{ DEVICE_DISTRIBUTION_SET_VERSION : "installed by"

    DISTRIBUTION_SET {
      string id PK
      string name
      string group_id
    }
    LAUNCHTRACK {
      string id PK
      string group_id
      string distribution_set_id FK
      string name
      string status
      string workflow_type
      string rollout_type
      int rollout_value
      string test_device_id
      boolean auto
      int approval_threshold
      int error_threshold
      int total_devices
      int current_batch_size
      int current_batch_index
      boolean aborted
      timestamp scheduled_at
    }
    LAUNCH_DEVICE_ASSIGNMENTS {
      string launch_id PK
      string device_id PK
      string status
      int batch_index
      timestamp dispatched_at
      timestamp completed_at
    }
    DEVICE_DISTRIBUTION_SET_VERSION {
      string id PK
      string device_id
      string distribution_set_id FK
      string version
      string launch_id
      string job_id
      timestamp installed_at
    }
    DEVICE_DISTRIBUTION_SET_UPDATE {
      string id PK
      string device_id
      string distribution_set_id FK
      string launch_id
      string job_id
      string version_from
      string version_to
      string status
      timestamp timestamp_completed
    }
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Valores que conviene conocer:
</div>

<div className="lm-diff-ins lm-diff-block">
  * \`distribution_set.status\` es \`draft\`, \`built\` o \`build_failed\`. \`packaging\` es \`swu\` o \`non-swu\`. \`encryption_mode\` es vacío, \`shared\` o \`per-device\`.
  * \`launchtrack.status\` es \`running\`, \`paused\`, \`cancelled\` o \`completed\`. Un lanzamiento nuevo se guarda con estado vacío, que significa running. \`aborted\` es verdadero en un lanzamiento cancelado (por el operador o por el umbral de error) y detiene todas las vías de despliegue. El resultado de las precondiciones del lanzamiento (\`forced_preconditions\`, \`precondition_failures\`) se guarda en la fila, pero no las precondiciones en sí: esas viven en el paquete.
  * \`rollout_type\` no se valida: solo el valor \`percentage\` hace que \`rollout_value\` sea un porcentaje, y cualquier otro valor (el dashboard envía \`numeric\`, los ejemplos usan \`fixed\`) lo convierte en un número de dispositivos.
  * \`launch_device_assignments.status\` es \`pending\`, \`active\`, \`completed\` o \`failed\`. (\`cancelled\` también existe como valor, pero solo lo informa el modo hawkBit, para un canario cuyo lanzamiento se canceló; nunca se almacena.)
  * \`device_distribution_set_update.status\` es \`pending\`, \`running\`, \`success\` o \`failed\` (el modo hawkBit también puede informar \`cancelled\`), y su \`source\` es \`service\`.
  * \`distribution_set_module\` es único por paquete, versión de paquete, tipo y nombre. Un módulo de catálogo independiente tiene \`distribution_set_id\` vacío, y su \`distribution_set_version\` es igual a su propia \`version\`.
  * \`distribution_set_version\` es único por paquete y versión, y \`distribution_set_artifact\` por paquete, versión y artefacto.
</div>

<div className="lm-diff-ins lm-diff-block">
  No dibujadas: \`updates_schema_migrations\`, una tabla de marcas que usan las migraciones de datos del arranque, y las tablas del modo hawkBit listadas arriba.
</div>

<div className="lm-diff-ins lm-diff-block">
  Cómo leer el diagrama [#cómo-leer-el-diagrama]
</div>

<div className="lm-diff-ins lm-diff-block">
  * Un **paquete** (\`distribution_set\`) es una fila que avanza por versiones. Cada versión construida se guarda como instantánea en \`distribution_set_version\`, con su manifiesto firmado.
  * Los **módulos** y los **artefactos** son cosas distintas: un artefacto es un fichero del catálogo global, y \`distribution_set_artifact\` lo enlaza a una versión de paquete (y opcionalmente a un módulo). Un módulo cuyo \`distribution_set_id\` está vacío es un módulo de catálogo que ningún paquete contiene todavía.
  * Un **lanzamiento** (\`launchtrack\`) se dirige a un grupo mediante una fila de asignación por dispositivo. La asignación pasa de \`pending\` → \`active\` → \`completed\` o \`failed\`, y \`batch_index\` registra qué lote la envió.
  * Dos tablas de dispositivo responden a preguntas distintas. \`device_distribution_set_version\` es lo que un dispositivo lleva **ahora**. \`device_distribution_set_update\` es el **historial** de intentos, con \`version_from\` y \`version_to\`.
  * \`latest_distribution_set_version\` es la versión en la que un operador declaró que deben estar los dispositivos de un grupo, y se usa para la desviación y el cumplimiento.
</div>

<div className="lm-diff-ins lm-diff-block">
  Creación del esquema y migraciones [#creación-del-esquema-y-migraciones]
</div>

<div className="lm-diff-ins lm-diff-block">
  No hay ficheros de migración. En modo nativo, el servicio crea y actualiza su propio esquema al arrancar, manteniendo un lock de Postgres para que las réplicas que arrancan a la vez no compitan. Ejecuta estos pasos en orden (el modo hawkBit solo crea sus seis tablas):
</div>

<div className="lm-diff-ins lm-diff-block">
  1. **Paso de renombrado** (\`MigrateDistributionSetNaming\`). A las bases de datos creadas antes del cambio de nombre «update pack» → «distribution set» se les renombran tablas y columnas. Se ejecuta antes del paso 2 para que las tablas nuevas no se creen vacías junto a las antiguas.
  2. **Crear y añadir** (GORM \`AutoMigrate\`). Se crean las tablas y columnas que faltan. Nunca elimina ni renombra nada.
  3. **Migraciones de datos.** Módulos independientes (las filas de \`software_module_definition\` pasan a las tablas de módulos y artefactos, conservando IDs y ficheros, y se elimina la tabla antigua), asignaciones de dispositivos (reconstruidas a partir de las columnas heredadas del lanzamiento) y la semántica del umbral de aprobación.
</div>

<div className="lm-diff-ins lm-diff-block">
  La mayoría de los pasos comprueban el esquema actual en lugar de un número de versión, y la migración del umbral de aprobación registra una fila en \`updates_schema_migrations\` para ejecutarse solo una vez. Arrancar varias veces es seguro, y una base de datos nueva no tiene nada que migrar. Tras los pasos de esquema, el servicio también copia al almacén de artefactos los binarios del esquema heredado, organizado por paquete en disco, omitiendo los que ya están allí.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`init.sql\` es una semilla de Docker Compose: crea las bases de datos \`updates\` y \`hawkbit\` y aún contiene definiciones de tablas antiguas, así que no lo uses para definir tú mismo el esquema.
</div>

<div className="lm-diff-ins lm-diff-block">
  Consulta [Operaciones](/docs/platform/updates/operations) para saber qué hacer antes de actualizar de versión.
</div>

<div className="lm-diff-ins lm-diff-block">
  Siguientes pasos [#siguientes-pasos]
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Configuración" description="Almacenes de blobs, storage y cada campo de configuración." href="/docs/platform/updates/reference/configuration" />

    <Card title="Operaciones" description="Respalda, escala y actualiza la base de datos." href="/docs/platform/updates/operations" />
  </Cards>
</div>
`,o={title:"Modelo de datos",description:"Las tablas que guarda el servicio, cómo se relacionan y cómo se crea y migra el esquema."},r={isNew:!0,changes:29,title:void 0,description:void 0},c={contents:[{heading:void 0,content:"Las tablas que Lamassu Updates guarda en Postgres, cómo se relacionan y cómo se crea y migra el esquema. Es una referencia para operadores e integradores que consultan la base de datos, la dimensionan o planifican una actualización de versión."},{heading:"tablas-del-modo-nativo",content:"Se crean en Postgres al arrancar, en la base de datos `updates`. Los tipos de Go están en `pkg/models/updates.go` del repositorio ota."},{heading:"tablas-del-modo-nativo",content:"Tabla"},{heading:"tablas-del-modo-nativo",content:"Contiene"},{heading:"tablas-del-modo-nativo",content:"`distribution_set`"},{heading:"tablas-del-modo-nativo",content:"Un paquete de actualización: nombre, versión, grupo, tipo, empaquetado, estado, la sw-description (`sw_descriptor`), precondiciones, ajustes de cifrado y firma, y la cobertura del build por dispositivo"},{heading:"tablas-del-modo-nativo",content:"`distribution_set_version`"},{heading:"tablas-del-modo-nativo",content:"Una instantánea de cada versión construida, con su manifiesto firmado"},{heading:"tablas-del-modo-nativo",content:"`distribution_set_module`"},{heading:"tablas-del-modo-nativo",content:"Los módulos de una versión de paquete, con clave formada por paquete, versión, tipo de módulo y nombre. También contiene módulos de catálogo que no pertenecen a ningún paquete, con el ID de paquete vacío"},{heading:"tablas-del-modo-nativo",content:"`artifact`"},{heading:"tablas-del-modo-nativo",content:"Un artefacto global: la entrada de catálogo de un fichero subido, único por nombre y versión"},{heading:"tablas-del-modo-nativo",content:"`distribution_set_artifact`"},{heading:"tablas-del-modo-nativo",content:"El enlace entre una versión de paquete, un artefacto y, opcionalmente, un módulo"},{heading:"tablas-del-modo-nativo",content:"`launchtrack`"},{heading:"tablas-del-modo-nativo",content:"Una campaña de lanzamiento: estrategia, estado, umbrales y contabilidad de lotes"},{heading:"tablas-del-modo-nativo",content:"`launch_device_assignments`"},{heading:"tablas-del-modo-nativo",content:"El estado de cada dispositivo dentro de un lanzamiento: `pending`, `active`, `completed` o `failed`"},{heading:"tablas-del-modo-nativo",content:"`device_distribution_set_version`"},{heading:"tablas-del-modo-nativo",content:"Qué versión de paquete lleva ahora un dispositivo"},{heading:"tablas-del-modo-nativo",content:"`device_distribution_set_update`"},{heading:"tablas-del-modo-nativo",content:"El historial de actualizaciones de un dispositivo"},{heading:"tablas-del-modo-nativo",content:"`latest_distribution_set_version`"},{heading:"tablas-del-modo-nativo",content:"La última versión declarada por grupo y paquete"},{heading:"tablas-del-modo-nativo",content:"`updates_schema_migrations`"},{heading:"tablas-del-modo-nativo",content:"Una fila por cada migración de datos que debe ejecutarse una sola vez (la migración del umbral de aprobación)"},{heading:"tablas-del-modo-nativo",content:"Los bytes de los ficheros (artefactos, builds, claves) no están en Postgres. Viven en los almacenes de blobs descritos en Configuración. La sw-description está en Postgres (una columna del paquete y de cada módulo)."},{heading:"tablas-del-modo-hawkbit",content:"En modo hawkBit, los paquetes, rollouts y jobs viven en hawkBit. Este servicio guarda solo lo siguiente en el mismo Postgres (la base de datos `updates`), para aquello para lo que hawkBit no tiene equivalente:"},{heading:"tablas-del-modo-hawkbit",content:"Tabla"},{heading:"tablas-del-modo-hawkbit",content:"Contiene"},{heading:"tablas-del-modo-hawkbit",content:"`hawkbit_staged_artifact`"},{heading:"tablas-del-modo-hawkbit",content:"Bytes de `POST /artifacts`. Las subidas con más de 30 minutos se descartan la próxima vez que alguien sube un artefacto, y siguen siendo legibles hasta entonces. No se pueden enlazar a un paquete en este modo"},{heading:"tablas-del-modo-hawkbit",content:"`hawkbit_artifact_alias`"},{heading:"tablas-del-modo-hawkbit",content:"Se lee al resolver un ID de artefacto, pero ya nada la escribe"},{heading:"tablas-del-modo-hawkbit",content:"`hawkbit_sw_descriptor_v2`"},{heading:"tablas-del-modo-hawkbit",content:"sw-descriptions, precondiciones de lanzamiento y banderas de rollout (un almacén de texto clave-valor de uso general, con clave formada por instancia, tipo e ID)"},{heading:"tablas-del-modo-hawkbit",content:"`hawkbit_set_manifest_v2`"},{heading:"tablas-del-modo-hawkbit",content:"Manifiestos firmados de los sets construidos"},{heading:"tablas-del-modo-hawkbit",content:"`hawkbit_cancelled_rollout_v2`"},{heading:"tablas-del-modo-hawkbit",content:"Rollouts cancelados a través de este servicio"},{heading:"tablas-del-modo-hawkbit",content:"`latest_distribution_set_version`"},{heading:"tablas-del-modo-hawkbit",content:"Últimas versiones declaradas (compartida con el modo nativo)"},{heading:"tablas-del-modo-hawkbit",content:"Las filas con clave formada por un ID de hawkBit llevan un `instance_id`, un marcador de los datos de hawkBit que describen. Si hawkBit pierde sus datos y empieza de nuevo, los IDs se repiten, y el servicio deja de leer las filas escritas para la instancia anterior. El servicio vuelve a comprobar el marcador cada 30 segundos."},{heading:"tablas-del-modo-hawkbit",content:"hawkBit mantiene su propio esquema en su propia base de datos `hawkbit`. En el stack de Docker Compose, `init.sql` crea ambas bases de datos la primera vez que arranca el contenedor de Postgres."},{heading:"diagramas-entidad-relación",content:"Las tablas del modo nativo, con sus columnas principales. Las columnas `*_id` que apuntan a otra tabla se dibujan como las líneas de relación. Son referencias lógicas: el servicio no crea restricciones de clave foránea en la base de datos, y `FK` solo marca qué columna contiene la referencia."},{heading:"lanzamientos-y-dispositivos",content:"Valores que conviene conocer:"},{heading:"lanzamientos-y-dispositivos",content:"`distribution_set.status` es `draft`, `built` o `build_failed`. `packaging` es `swu` o `non-swu`. `encryption_mode` es vacío, `shared` o `per-device`."},{heading:"lanzamientos-y-dispositivos",content:"`launchtrack.status` es `running`, `paused`, `cancelled` o `completed`. Un lanzamiento nuevo se guarda con estado vacío, que significa running. `aborted` es verdadero en un lanzamiento cancelado (por el operador o por el umbral de error) y detiene todas las vías de despliegue. El resultado de las precondiciones del lanzamiento (`forced_preconditions`, `precondition_failures`) se guarda en la fila, pero no las precondiciones en sí: esas viven en el paquete."},{heading:"lanzamientos-y-dispositivos",content:"`rollout_type` no se valida: solo el valor `percentage` hace que `rollout_value` sea un porcentaje, y cualquier otro valor (el dashboard envía `numeric`, los ejemplos usan `fixed`) lo convierte en un número de dispositivos."},{heading:"lanzamientos-y-dispositivos",content:"`launch_device_assignments.status` es `pending`, `active`, `completed` o `failed`. (`cancelled` también existe como valor, pero solo lo informa el modo hawkBit, para un canario cuyo lanzamiento se canceló; nunca se almacena.)"},{heading:"lanzamientos-y-dispositivos",content:"`device_distribution_set_update.status` es `pending`, `running`, `success` o `failed` (el modo hawkBit también puede informar `cancelled`), y su `source` es `service`."},{heading:"lanzamientos-y-dispositivos",content:"`distribution_set_module` es único por paquete, versión de paquete, tipo y nombre. Un módulo de catálogo independiente tiene `distribution_set_id` vacío, y su `distribution_set_version` es igual a su propia `version`."},{heading:"lanzamientos-y-dispositivos",content:"`distribution_set_version` es único por paquete y versión, y `distribution_set_artifact` por paquete, versión y artefacto."},{heading:"lanzamientos-y-dispositivos",content:"No dibujadas: `updates_schema_migrations`, una tabla de marcas que usan las migraciones de datos del arranque, y las tablas del modo hawkBit listadas arriba."},{heading:"cómo-leer-el-diagrama",content:"Un **paquete** (`distribution_set`) es una fila que avanza por versiones. Cada versión construida se guarda como instantánea en `distribution_set_version`, con su manifiesto firmado."},{heading:"cómo-leer-el-diagrama",content:"Los **módulos** y los **artefactos** son cosas distintas: un artefacto es un fichero del catálogo global, y `distribution_set_artifact` lo enlaza a una versión de paquete (y opcionalmente a un módulo). Un módulo cuyo `distribution_set_id` está vacío es un módulo de catálogo que ningún paquete contiene todavía."},{heading:"cómo-leer-el-diagrama",content:"Un **lanzamiento** (`launchtrack`) se dirige a un grupo mediante una fila de asignación por dispositivo. La asignación pasa de `pending` → `active` → `completed` o `failed`, y `batch_index` registra qué lote la envió."},{heading:"cómo-leer-el-diagrama",content:"Dos tablas de dispositivo responden a preguntas distintas. `device_distribution_set_version` es lo que un dispositivo lleva **ahora**. `device_distribution_set_update` es el **historial** de intentos, con `version_from` y `version_to`."},{heading:"cómo-leer-el-diagrama",content:"`latest_distribution_set_version` es la versión en la que un operador declaró que deben estar los dispositivos de un grupo, y se usa para la desviación y el cumplimiento."},{heading:"creación-del-esquema-y-migraciones",content:"No hay ficheros de migración. En modo nativo, el servicio crea y actualiza su propio esquema al arrancar, manteniendo un lock de Postgres para que las réplicas que arrancan a la vez no compitan. Ejecuta estos pasos en orden (el modo hawkBit solo crea sus seis tablas):"},{heading:"creación-del-esquema-y-migraciones",content:"**Paso de renombrado** (`MigrateDistributionSetNaming`). A las bases de datos creadas antes del cambio de nombre «update pack» → «distribution set» se les renombran tablas y columnas. Se ejecuta antes del paso 2 para que las tablas nuevas no se creen vacías junto a las antiguas."},{heading:"creación-del-esquema-y-migraciones",content:"**Crear y añadir** (GORM `AutoMigrate`). Se crean las tablas y columnas que faltan. Nunca elimina ni renombra nada."},{heading:"creación-del-esquema-y-migraciones",content:"**Migraciones de datos.** Módulos independientes (las filas de `software_module_definition` pasan a las tablas de módulos y artefactos, conservando IDs y ficheros, y se elimina la tabla antigua), asignaciones de dispositivos (reconstruidas a partir de las columnas heredadas del lanzamiento) y la semántica del umbral de aprobación."},{heading:"creación-del-esquema-y-migraciones",content:"La mayoría de los pasos comprueban el esquema actual en lugar de un número de versión, y la migración del umbral de aprobación registra una fila en `updates_schema_migrations` para ejecutarse solo una vez. Arrancar varias veces es seguro, y una base de datos nueva no tiene nada que migrar. Tras los pasos de esquema, el servicio también copia al almacén de artefactos los binarios del esquema heredado, organizado por paquete en disco, omitiendo los que ya están allí."},{heading:"creación-del-esquema-y-migraciones",content:"`init.sql` es una semilla de Docker Compose: crea las bases de datos `updates` y `hawkbit` y aún contiene definiciones de tablas antiguas, así que no lo uses para definir tú mismo el esquema."},{heading:"creación-del-esquema-y-migraciones",content:"Consulta Operaciones para saber qué hacer antes de actualizar de versión."},{heading:"siguientes-pasos",content:'<Card title="Configuración" description="Almacenes de blobs, storage y cada campo de configuración." href="/docs/platform/updates/reference/configuration" />'},{heading:"siguientes-pasos",content:'<Card title="Operaciones" description="Respalda, escala y actualiza la base de datos." href="/docs/platform/updates/operations" />'}],headings:[{id:"tablas-del-modo-nativo",content:"Tablas del modo nativo"},{id:"tablas-del-modo-hawkbit",content:"Tablas del modo hawkBit"},{id:"diagramas-entidad-relación",content:"Diagramas entidad-relación"},{id:"paquetes-módulos-y-artefactos",content:"Paquetes, módulos y artefactos"},{id:"lanzamientos-y-dispositivos",content:"Lanzamientos y dispositivos"},{id:"cómo-leer-el-diagrama",content:"Cómo leer el diagrama"},{id:"creación-del-esquema-y-migraciones",content:"Creación del esquema y migraciones"},{id:"siguientes-pasos",content:"Siguientes pasos"}]};const h=[{depth:2,url:"#tablas-del-modo-nativo",title:e.jsx(e.Fragment,{children:"Tablas del modo nativo"})},{depth:2,url:"#tablas-del-modo-hawkbit",title:e.jsx(e.Fragment,{children:"Tablas del modo hawkBit"})},{depth:2,url:"#diagramas-entidad-relación",title:e.jsx(e.Fragment,{children:"Diagramas entidad-relación"})},{depth:3,url:"#paquetes-módulos-y-artefactos",title:e.jsx(e.Fragment,{children:"Paquetes, módulos y artefactos"})},{depth:3,url:"#lanzamientos-y-dispositivos",title:e.jsx(e.Fragment,{children:"Lanzamientos y dispositivos"})},{depth:3,url:"#cómo-leer-el-diagrama",title:e.jsx(e.Fragment,{children:"Cómo leer el diagrama"})},{depth:2,url:"#creación-del-esquema-y-migraciones",title:e.jsx(e.Fragment,{children:"Creación del esquema y migraciones"})},{depth:2,url:"#siguientes-pasos",title:e.jsx(e.Fragment,{children:"Siguientes pasos"})}];function l(i){const s={a:"a",code:"code",div:"div",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Card:a,Cards:n}=s;return a||d("Card"),n||d("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"Las tablas que Lamassu Updates guarda en Postgres, cómo se relacionan y cómo se crea y migra el esquema. Es una referencia para operadores e integradores que consultan la base de datos, la dimensionan o planifican una actualización de versión."})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"tablas-del-modo-nativo",children:"Tablas del modo nativo"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Se crean en Postgres al arrancar, en la base de datos ",e.jsx(s.code,{children:"updates"}),". Los tipos de Go están en ",e.jsx(s.code,{children:"pkg/models/updates.go"})," del ",e.jsx(s.a,{href:"https://github.com/lamassuiot/ota",children:"repositorio ota"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Tabla"}),e.jsx(s.th,{children:"Contiene"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"distribution_set"})}),e.jsxs(s.td,{children:["Un paquete de actualización: nombre, versión, grupo, tipo, empaquetado, estado, la sw-description (",e.jsx(s.code,{children:"sw_descriptor"}),"), precondiciones, ajustes de cifrado y firma, y la cobertura del build por dispositivo"]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"distribution_set_version"})}),e.jsx(s.td,{children:"Una instantánea de cada versión construida, con su manifiesto firmado"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"distribution_set_module"})}),e.jsx(s.td,{children:"Los módulos de una versión de paquete, con clave formada por paquete, versión, tipo de módulo y nombre. También contiene módulos de catálogo que no pertenecen a ningún paquete, con el ID de paquete vacío"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"artifact"})}),e.jsx(s.td,{children:"Un artefacto global: la entrada de catálogo de un fichero subido, único por nombre y versión"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"distribution_set_artifact"})}),e.jsx(s.td,{children:"El enlace entre una versión de paquete, un artefacto y, opcionalmente, un módulo"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"launchtrack"})}),e.jsx(s.td,{children:"Una campaña de lanzamiento: estrategia, estado, umbrales y contabilidad de lotes"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"launch_device_assignments"})}),e.jsxs(s.td,{children:["El estado de cada dispositivo dentro de un lanzamiento: ",e.jsx(s.code,{children:"pending"}),", ",e.jsx(s.code,{children:"active"}),", ",e.jsx(s.code,{children:"completed"})," o ",e.jsx(s.code,{children:"failed"})]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"device_distribution_set_version"})}),e.jsx(s.td,{children:"Qué versión de paquete lleva ahora un dispositivo"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"device_distribution_set_update"})}),e.jsx(s.td,{children:"El historial de actualizaciones de un dispositivo"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"latest_distribution_set_version"})}),e.jsx(s.td,{children:"La última versión declarada por grupo y paquete"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"updates_schema_migrations"})}),e.jsx(s.td,{children:"Una fila por cada migración de datos que debe ejecutarse una sola vez (la migración del umbral de aprobación)"})]})]})]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Los bytes de los ficheros (artefactos, builds, claves) no están en Postgres. Viven en los almacenes de blobs descritos en ",e.jsx(s.a,{href:"/docs/platform/updates/reference/configuration",children:"Configuración"}),". La sw-description está en Postgres (una columna del paquete y de cada módulo)."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"tablas-del-modo-hawkbit",children:"Tablas del modo hawkBit"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["En modo hawkBit, los paquetes, rollouts y jobs viven en hawkBit. Este servicio guarda solo lo siguiente en el mismo Postgres (la base de datos ",e.jsx(s.code,{children:"updates"}),"), para aquello para lo que hawkBit no tiene equivalente:"]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Tabla"}),e.jsx(s.th,{children:"Contiene"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"hawkbit_staged_artifact"})}),e.jsxs(s.td,{children:["Bytes de ",e.jsx(s.code,{children:"POST /artifacts"}),". Las subidas con más de 30 minutos se descartan la próxima vez que alguien sube un artefacto, y siguen siendo legibles hasta entonces. No se pueden enlazar a un paquete en este modo"]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"hawkbit_artifact_alias"})}),e.jsx(s.td,{children:"Se lee al resolver un ID de artefacto, pero ya nada la escribe"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"hawkbit_sw_descriptor_v2"})}),e.jsx(s.td,{children:"sw-descriptions, precondiciones de lanzamiento y banderas de rollout (un almacén de texto clave-valor de uso general, con clave formada por instancia, tipo e ID)"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"hawkbit_set_manifest_v2"})}),e.jsx(s.td,{children:"Manifiestos firmados de los sets construidos"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"hawkbit_cancelled_rollout_v2"})}),e.jsx(s.td,{children:"Rollouts cancelados a través de este servicio"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"latest_distribution_set_version"})}),e.jsx(s.td,{children:"Últimas versiones declaradas (compartida con el modo nativo)"})]})]})]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Las filas con clave formada por un ID de hawkBit llevan un ",e.jsx(s.code,{children:"instance_id"}),", un marcador de los datos de hawkBit que describen. Si hawkBit pierde sus datos y empieza de nuevo, los IDs se repiten, y el servicio deja de leer las filas escritas para la instancia anterior. El servicio vuelve a comprobar el marcador cada 30 segundos."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["hawkBit mantiene su propio esquema en su propia base de datos ",e.jsx(s.code,{children:"hawkbit"}),". En el stack de Docker Compose, ",e.jsx(s.code,{children:"init.sql"})," crea ambas bases de datos la primera vez que arranca el contenedor de Postgres."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"diagramas-entidad-relación",children:"Diagramas entidad-relación"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Las tablas del modo nativo, con sus columnas principales. Las columnas ",e.jsx(s.code,{children:"*_id"})," que apuntan a otra tabla se dibujan como las líneas de relación. Son referencias lógicas: el servicio no crea restricciones de clave foránea en la base de datos, y ",e.jsx(s.code,{children:"FK"})," solo marca qué columna contiene la referencia."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h3,{id:"paquetes-módulos-y-artefactos",children:"Paquetes, módulos y artefactos"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"erDiagram"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET ||--o{ DISTRIBUTION_SET_VERSION : "snapshot per built version"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET |o--o{ DISTRIBUTION_SET_MODULE : "composed of"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET ||--o{ DISTRIBUTION_SET_ARTIFACT : "links"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ARTIFACT ||--o{ DISTRIBUTION_SET_ARTIFACT : "referenced by"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET_MODULE |o--o{ DISTRIBUTION_SET_ARTIFACT : "owns"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET_MODULE |o--o{ DISTRIBUTION_SET_MODULE : "copied from"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET ||--o{ LATEST_DISTRIBUTION_SET_VERSION : "declared latest"'})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DISTRIBUTION_SET {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string name"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string group_id"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string type"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string packaging"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string status"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string uri"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string encryption_mode"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string sw_descriptor"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string last_build_error"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DISTRIBUTION_SET_VERSION {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string checksum"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string manifest_json"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string manifest_signature"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DISTRIBUTION_SET_MODULE {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_version"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string type"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string name"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string delivery_intent"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    boolean built"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string sw_descriptor"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string release_notes"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string source_module_id FK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  ARTIFACT {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string name"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string filename"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string checksum"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int size"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DISTRIBUTION_SET_ARTIFACT {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_version"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string artifact_id FK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_module_id FK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  LATEST_DISTRIBUTION_SET_VERSION {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string group_id"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h3,{id:"lanzamientos-y-dispositivos",children:"Lanzamientos y dispositivos"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"erDiagram"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET ||--o{ LAUNCHTRACK : "launched as"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  LAUNCHTRACK ||--o{ LAUNCH_DEVICE_ASSIGNMENTS : "targets"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET ||--o{ DEVICE_DISTRIBUTION_SET_VERSION : "installed on"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET ||--o{ DEVICE_DISTRIBUTION_SET_UPDATE : "update attempts"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  LAUNCHTRACK |o--o{ DEVICE_DISTRIBUTION_SET_UPDATE : "caused by"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  LAUNCHTRACK |o--o{ DEVICE_DISTRIBUTION_SET_VERSION : "installed by"'})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DISTRIBUTION_SET {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string name"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string group_id"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  LAUNCHTRACK {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string group_id"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string name"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string status"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string workflow_type"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string rollout_type"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int rollout_value"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string test_device_id"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    boolean auto"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int approval_threshold"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int error_threshold"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int total_devices"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int current_batch_size"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int current_batch_index"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    boolean aborted"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    timestamp scheduled_at"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  LAUNCH_DEVICE_ASSIGNMENTS {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string launch_id PK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string device_id PK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string status"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int batch_index"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    timestamp dispatched_at"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    timestamp completed_at"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DEVICE_DISTRIBUTION_SET_VERSION {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string device_id"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string launch_id"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string job_id"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    timestamp installed_at"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DEVICE_DISTRIBUTION_SET_UPDATE {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string device_id"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string launch_id"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string job_id"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version_from"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version_to"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string status"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    timestamp timestamp_completed"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"Valores que conviene conocer:"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"distribution_set.status"})," es ",e.jsx(s.code,{children:"draft"}),", ",e.jsx(s.code,{children:"built"})," o ",e.jsx(s.code,{children:"build_failed"}),". ",e.jsx(s.code,{children:"packaging"})," es ",e.jsx(s.code,{children:"swu"})," o ",e.jsx(s.code,{children:"non-swu"}),". ",e.jsx(s.code,{children:"encryption_mode"})," es vacío, ",e.jsx(s.code,{children:"shared"})," o ",e.jsx(s.code,{children:"per-device"}),"."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"launchtrack.status"})," es ",e.jsx(s.code,{children:"running"}),", ",e.jsx(s.code,{children:"paused"}),", ",e.jsx(s.code,{children:"cancelled"})," o ",e.jsx(s.code,{children:"completed"}),". Un lanzamiento nuevo se guarda con estado vacío, que significa running. ",e.jsx(s.code,{children:"aborted"})," es verdadero en un lanzamiento cancelado (por el operador o por el umbral de error) y detiene todas las vías de despliegue. El resultado de las precondiciones del lanzamiento (",e.jsx(s.code,{children:"forced_preconditions"}),", ",e.jsx(s.code,{children:"precondition_failures"}),") se guarda en la fila, pero no las precondiciones en sí: esas viven en el paquete."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"rollout_type"})," no se valida: solo el valor ",e.jsx(s.code,{children:"percentage"})," hace que ",e.jsx(s.code,{children:"rollout_value"})," sea un porcentaje, y cualquier otro valor (el dashboard envía ",e.jsx(s.code,{children:"numeric"}),", los ejemplos usan ",e.jsx(s.code,{children:"fixed"}),") lo convierte en un número de dispositivos."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"launch_device_assignments.status"})," es ",e.jsx(s.code,{children:"pending"}),", ",e.jsx(s.code,{children:"active"}),", ",e.jsx(s.code,{children:"completed"})," o ",e.jsx(s.code,{children:"failed"}),". (",e.jsx(s.code,{children:"cancelled"})," también existe como valor, pero solo lo informa el modo hawkBit, para un canario cuyo lanzamiento se canceló; nunca se almacena.)"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"device_distribution_set_update.status"})," es ",e.jsx(s.code,{children:"pending"}),", ",e.jsx(s.code,{children:"running"}),", ",e.jsx(s.code,{children:"success"})," o ",e.jsx(s.code,{children:"failed"})," (el modo hawkBit también puede informar ",e.jsx(s.code,{children:"cancelled"}),"), y su ",e.jsx(s.code,{children:"source"})," es ",e.jsx(s.code,{children:"service"}),"."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"distribution_set_module"})," es único por paquete, versión de paquete, tipo y nombre. Un módulo de catálogo independiente tiene ",e.jsx(s.code,{children:"distribution_set_id"})," vacío, y su ",e.jsx(s.code,{children:"distribution_set_version"})," es igual a su propia ",e.jsx(s.code,{children:"version"}),"."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"distribution_set_version"})," es único por paquete y versión, y ",e.jsx(s.code,{children:"distribution_set_artifact"})," por paquete, versión y artefacto."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["No dibujadas: ",e.jsx(s.code,{children:"updates_schema_migrations"}),", una tabla de marcas que usan las migraciones de datos del arranque, y las tablas del modo hawkBit listadas arriba."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h3,{id:"cómo-leer-el-diagrama",children:"Cómo leer el diagrama"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Un ",e.jsx(s.strong,{children:"paquete"})," (",e.jsx(s.code,{children:"distribution_set"}),") es una fila que avanza por versiones. Cada versión construida se guarda como instantánea en ",e.jsx(s.code,{children:"distribution_set_version"}),", con su manifiesto firmado."]}),`
`,e.jsxs(s.li,{children:["Los ",e.jsx(s.strong,{children:"módulos"})," y los ",e.jsx(s.strong,{children:"artefactos"})," son cosas distintas: un artefacto es un fichero del catálogo global, y ",e.jsx(s.code,{children:"distribution_set_artifact"})," lo enlaza a una versión de paquete (y opcionalmente a un módulo). Un módulo cuyo ",e.jsx(s.code,{children:"distribution_set_id"})," está vacío es un módulo de catálogo que ningún paquete contiene todavía."]}),`
`,e.jsxs(s.li,{children:["Un ",e.jsx(s.strong,{children:"lanzamiento"})," (",e.jsx(s.code,{children:"launchtrack"}),") se dirige a un grupo mediante una fila de asignación por dispositivo. La asignación pasa de ",e.jsx(s.code,{children:"pending"})," → ",e.jsx(s.code,{children:"active"})," → ",e.jsx(s.code,{children:"completed"})," o ",e.jsx(s.code,{children:"failed"}),", y ",e.jsx(s.code,{children:"batch_index"})," registra qué lote la envió."]}),`
`,e.jsxs(s.li,{children:["Dos tablas de dispositivo responden a preguntas distintas. ",e.jsx(s.code,{children:"device_distribution_set_version"})," es lo que un dispositivo lleva ",e.jsx(s.strong,{children:"ahora"}),". ",e.jsx(s.code,{children:"device_distribution_set_update"})," es el ",e.jsx(s.strong,{children:"historial"})," de intentos, con ",e.jsx(s.code,{children:"version_from"})," y ",e.jsx(s.code,{children:"version_to"}),"."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"latest_distribution_set_version"})," es la versión en la que un operador declaró que deben estar los dispositivos de un grupo, y se usa para la desviación y el cumplimiento."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"creación-del-esquema-y-migraciones",children:"Creación del esquema y migraciones"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"No hay ficheros de migración. En modo nativo, el servicio crea y actualiza su propio esquema al arrancar, manteniendo un lock de Postgres para que las réplicas que arrancan a la vez no compitan. Ejecuta estos pasos en orden (el modo hawkBit solo crea sus seis tablas):"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Paso de renombrado"})," (",e.jsx(s.code,{children:"MigrateDistributionSetNaming"}),"). A las bases de datos creadas antes del cambio de nombre «update pack» → «distribution set» se les renombran tablas y columnas. Se ejecuta antes del paso 2 para que las tablas nuevas no se creen vacías junto a las antiguas."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Crear y añadir"})," (GORM ",e.jsx(s.code,{children:"AutoMigrate"}),"). Se crean las tablas y columnas que faltan. Nunca elimina ni renombra nada."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Migraciones de datos."})," Módulos independientes (las filas de ",e.jsx(s.code,{children:"software_module_definition"})," pasan a las tablas de módulos y artefactos, conservando IDs y ficheros, y se elimina la tabla antigua), asignaciones de dispositivos (reconstruidas a partir de las columnas heredadas del lanzamiento) y la semántica del umbral de aprobación."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["La mayoría de los pasos comprueban el esquema actual en lugar de un número de versión, y la migración del umbral de aprobación registra una fila en ",e.jsx(s.code,{children:"updates_schema_migrations"})," para ejecutarse solo una vez. Arrancar varias veces es seguro, y una base de datos nueva no tiene nada que migrar. Tras los pasos de esquema, el servicio también copia al almacén de artefactos los binarios del esquema heredado, organizado por paquete en disco, omitiendo los que ya están allí."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsx(s.code,{children:"init.sql"})," es una semilla de Docker Compose: crea las bases de datos ",e.jsx(s.code,{children:"updates"})," y ",e.jsx(s.code,{children:"hawkbit"})," y aún contiene definiciones de tablas antiguas, así que no lo uses para definir tú mismo el esquema."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Consulta ",e.jsx(s.a,{href:"/docs/platform/updates/operations",children:"Operaciones"})," para saber qué hacer antes de actualizar de versión."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"siguientes-pasos",children:"Siguientes pasos"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n,{children:[e.jsx(a,{title:"Configuración",description:"Almacenes de blobs, storage y cada campo de configuración.",href:"/docs/platform/updates/reference/configuration"}),e.jsx(a,{title:"Operaciones",description:"Respalda, escala y actualiza la base de datos.",href:"/docs/platform/updates/operations"})]})})]})}function m(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(l,{...i})}):l(i)}function d(i,s){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:t,default:m,frontmatter:o,lmDiff:r,structuredData:c,toc:h},Symbol.toStringTag,{value:"Module"}));export{p as _};
