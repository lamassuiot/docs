import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let d=`

El control de acceso de Lamassu transforma una identidad autenticada en permisos concretos. El proveedor OIDC o el certificado cliente demuestra **quién** realiza una petición; el servicio \`authz\` decide **qué puede hacer** esa identidad y **sobre qué recursos**.

Lamassu no asigna permisos directamente a usuarios. La cadena completa es:

\`\`\`text
credencial → principal coincidente → políticas concedidas → reglas → decisión
\`\`\`

Este modelo permite representar personas, grupos del proveedor de identidad, cuentas de servicio y dispositivos sin acoplar la autorización a un proveedor concreto.

Conceptos esenciales [#conceptos-esenciales]

Un **principal** conecta una credencial con Lamassu. Define cómo reconocer una identidad OIDC o X.509 y puede estar activo o desactivado.

Una **política** agrupa permisos reutilizables. Puede concederse a varios principales y puede contener reglas sobre entidades de Lamassu, reglas sobre rutas HTTP o ambas.

Una **regla de entidad** concede acciones sobre recursos como autoridades certificadoras, certificados, perfiles de emisión, dispositivos, DMS, claves o suscripciones de alertas. Puede abarcar todos los recursos de un tipo o limitarse por identificador, relación o atributo.

Una **regla HTTP** concede acciones asociadas a rutas de una API. Es el mecanismo que utiliza el Gateway para decidir si una petición puede atravesar el perímetro.

Un **grant** es la asociación entre un principal y una política. Quitar el grant elimina todos los permisos aportados por esa política, sin modificarla para los demás principales.

<Callout type="info" title="Autenticación y autorización son controles distintos">
  Un JWT válido o un certificado cliente válido no concede acceso por sí mismo. La credencial debe coincidir con al menos un principal activo y alguna de sus políticas debe permitir la operación solicitada.
</Callout>

Dos sistemas de decisión [#dos-sistemas-de-decisión]

Lamassu utiliza dos caminos de autorización según quién implementa el servicio protegido. Comparten principales, políticas y grants, pero no interpretan las reglas de la misma manera.

\`\`\`text
Servicios HTTP integrados o externos → Gateway → reglas HTTP
Servicios desarrollados por Lamassu  → middleware del servicio → reglas de entidad
\`\`\`

<Callout type="info" title="La diferencia está en el punto de integración">
  Un servicio externo puede quedar protegido sin conocer el modelo interno de autorización de Lamassu. Un servicio desarrollado por Lamassu integra el motor de autorización y puede decidir sobre recursos concretos y filtrar sus consultas.
</Callout>

Servicios HTTP integrados o externos [#servicios-http-integrados-o-externos]

Este camino protege APIs que se incorporan a la plataforma a través del Gateway pero que no implementan de forma nativa el SDK de autorización de Lamassu. Job Manager es el ejemplo actual. El mismo patrón permite integrar otros servicios HTTP siempre que sus rutas estén descritas en un esquema HTTP de \`authz\`.

La decisión se toma **antes de reenviar la petición al servicio**:

1. Envoy Gateway autentica la petición, normalmente validando un JWT contra el JWKS del proveedor OIDC.
2. Para una ruta protegida, Envoy envía el método, la URL, las cabeceras y los datos necesarios a \`/v1/ext_authz/check\`.
3. \`authz\` extrae la credencial y resuelve todos los principales activos que coinciden con ella.
4. Carga por separado las políticas concedidas a cada principal.
5. El esquema HTTP traduce la combinación de método y ruta a una acción lógica, como \`nbi-job-read\` o \`nbi-workflow-create\`.
6. \`authz\` busca una regla HTTP que conceda esa acción.
7. Si la ruta declara restricciones, compara datos de la petición con los atributos normalizados del mismo principal que aporta la política.
8. Un resultado satisfactorio permite a Envoy reenviar la petición; cualquier otra respuesta la bloquea en el Gateway.

Cuando permite el acceso, \`authz\` devuelve el principal seleccionado en \`x-current-user\`. El Gateway puede propagar esa cabecera al servicio para conservar el contexto de identidad.

Las reglas HTTP responden principalmente a **“¿puede esta identidad llamar a esta operación de la API?”**. Por sí solas no generan filtros sobre la base de datos del servicio externo. Para limitar una ruta a un dispositivo, tenant o cliente concreto, el esquema debe declarar una restricción que relacione un valor de la petición con un atributo normalizado del principal.

Servicios desarrollados por Lamassu [#servicios-desarrollados-por-lamassu]

Los servicios nativos de Lamassu integran autorización en su middleware y conocen las entidades sobre las que operan: certificados, CAs, perfiles de emisión, claves, dispositivos, DMS o suscripciones, entre otras.

La decisión se toma con el contexto de la operación de dominio:

1. El middleware extrae la credencial y resuelve los principales coincidentes.
2. El endpoint identifica la acción, el tipo de entidad y, cuando corresponde, la clave del recurso solicitado.
3. \`authz\` reúne las reglas de entidad de las políticas concedidas.
4. El motor evalúa grants directos, filtros por atributos y relaciones con otras entidades.
5. Para una operación individual, comprueba que el recurso concreto satisface el alcance calculado.
6. Para un listado, genera un filtro SQL que el servicio añade a su propia consulta.

Aquí el motor responde a **“¿puede esta identidad realizar esta acción sobre este recurso concreto?”**.

Las acciones se dividen en dos grupos:

* Las **acciones globales** no necesitan un identificador de recurso. \`create\`, \`import\` o el acceso a una sección de la interfaz son ejemplos habituales.
* Las **acciones atómicas** se evalúan sobre una instancia concreta. En certificados aparecen \`read\`, \`metadata-update\`, \`status-update\` y \`delete\`; para una CA también existen \`sign\`, \`reissue\` y otras operaciones de ciclo de vida.

El filtrado dentro del servicio evita fugas en listados: los recursos no autorizados quedan fuera de la consulta SQL en lugar de recuperarse y ocultarse después en la interfaz.

Cómo se relacionan ambos caminos [#cómo-se-relacionan-ambos-caminos]

No son dos controles equivalentes aplicados dos veces. Las reglas HTTP protegen el perímetro de un servicio integrado; las reglas de entidad expresan permisos sobre el modelo de datos de los servicios nativos.

Una política puede contener ambos tipos de reglas cuando una identidad necesita operar recursos de Lamassu y también llamar a una API integrada. Conceder una regla de entidad no concede automáticamente una acción HTTP, ni una regla HTTP crea acceso sobre una entidad.

<Callout type="warn" title="Denegación por defecto">
  Si ninguna combinación de principal, política y regla permite la operación, Lamassu la deniega. Además, \`auth.externalAuthorization.failOpen\` vale \`false\` por defecto: si \`authz\` no está disponible, el Gateway bloquea las rutas protegidas.
</Callout>

Principales OIDC [#principales-oidc]

Un principal OIDC coincide con los claims de un JWT validado. Es apropiado para usuarios humanos, grupos corporativos, roles del IdP y cuentas de servicio que obtienen tokens.

El siguiente principal representa a cualquier identidad que tenga el rol \`pki-operators\` en Keycloak:

\`\`\`json title="Principal OIDC por rol"
{
  "id": "oidc:pki-operators",
  "name": "Operadores de PKI",
  "description": "Equipo responsable de la operación diaria",
  "type": "oidc",
  "active": true,
  "auth_config": {
    "claims": [
      {
        "claim": "realm_access.roles",
        "operator": "contains",
        "value": "pki-operators"
      }
    ]
  }
}
\`\`\`

Las rutas de claims pueden estar anidadas, como \`realm_access.roles\`. Dentro de un mismo principal, **todas** las condiciones deben cumplirse. Esto permite exigir, por ejemplo, un grupo y una audiencia organizativa a la vez.

Los operadores implementados son:

* \`equals\`, para igualdad exacta;
* \`contains\`, para comprobar la pertenencia a una lista o la presencia de texto en un valor escalar.

Diseña la coincidencia con atributos estables. Para personas, suele ser mejor enlazar permisos a grupos o roles gestionados centralmente que al correo o al nombre de usuario. Para una cuenta de servicio, un \`sub\` estable evita que sus permisos se mezclen con los de un operador humano.

<Callout type="warn" title="No uses matches todavía">
  Aunque el modelo reconoce el nombre de operador \`matches\`, la implementación actual no evalúa expresiones regulares y la condición nunca coincide. Usa \`equals\` o \`contains\`.
</Callout>

Principales X.509 [#principales-x509]

Un principal X.509 permite reconocer una carga de trabajo o un dispositivo mediante su certificado cliente. Lamassu comprueba la firma del certificado contra la CA configurada y, según el modo, también su número de serie o Common Name.

Los modos disponibles son:

* \`serial_and_ca\`: un certificado exacto, identificado por número de serie y CA;
* \`cn_and_ca\`: un Common Name exacto o con comodines y una CA concreta;
* \`any_from_ca\`: cualquier certificado emitido directamente por la CA indicada.

Este ejemplo reconoce certificados cuyo CN comienza por \`factory-a-\` y que están firmados por la CA configurada:

\`\`\`json title="Principal X.509 por CN y CA"
{
  "id": "x509:factory-a-devices",
  "name": "Dispositivos de la fábrica A",
  "type": "x509",
  "active": true,
  "auth_config": {
    "match_mode": "cn_and_ca",
    "subject_cn": "factory-a-*",
    "ca_trust": {
      "pem": "<certificado-CA-en-PEM-o-base64>",
      "identity_type": "fingerprint",
      "value": "SHA256:<huella-sha256-de-la-ca>"
    }
  }
}
\`\`\`

\`ca_trust.identity_type\` acepta \`fingerprint\` o \`authority_key_id\`. En ambos casos debes aportar el certificado de la CA en \`ca_trust.pem\`; Lamassu verifica tanto la firma como la identidad esperada de la CA.

Usa \`any_from_ca\` únicamente cuando todas las identidades emitidas por esa CA deban compartir los mismos permisos. Si una CA emite certificados para poblaciones distintas, separa el acceso por serie o CN, o utiliza CAs de emisión diferentes.

Cuando coinciden varios principales [#cuando-coinciden-varios-principales]

Una misma credencial puede coincidir con más de un principal. Es habitual que un usuario coincida con un principal de su equipo y con otro de su función operativa.

Para permisos de entidad, Lamassu combina los permisos con lógica OR: basta con que una de las políticas de uno de los principales permita la acción. Los listados contienen la unión de los recursos visibles para todos ellos.

Las rutas HTTP con restricciones son más estrictas. El mismo principal que aporta la política debe satisfacer también los atributos exigidos por la ruta. Lamassu no combina la política de un principal con un atributo perteneciente a otro.

Por esta razón, añadir un principal coincidente solo puede ampliar el acceso. Antes de crear reglas solapadas, revisa el conjunto completo de políticas que recibirá una identidad real.

Cómo expresan acceso las políticas [#cómo-expresan-acceso-las-políticas]

Acceso global y acceso directo [#acceso-global-y-acceso-directo]

Una regla identifica el dominio (\`namespace\`), el esquema de datos (\`schema_name\`) y el tipo de entidad (\`entity_type\`). \`actions\` enumera las operaciones permitidas.

\`direct_grants\` limita la regla a identificadores concretos. El valor \`*\` abarca todas las instancias del tipo. Una política de superadministrador utiliza comodines en esquema, entidad, acciones y grants; una política de mínimo privilegio debe evitarlos siempre que sea posible.

Acceso heredado por relaciones [#acceso-heredado-por-relaciones]

Las reglas pueden seguir relaciones declaradas entre entidades. Por ejemplo, el esquema conoce la relación de un certificado con su CA emisora y la de un dispositivo con su DMS. Una política puede conceder acceso a un recurso padre y propagar acciones seleccionadas hacia sus recursos relacionados.

Esto permite expresar modelos como “puede operar los dispositivos de este DMS” sin mantener una lista individual de cada dispositivo. Cuando se añade un recurso bajo esa relación, hereda el alcance previsto por la política.

Acceso filtrado por atributos [#acceso-filtrado-por-atributos]

\`column_filters\` aplica condiciones a columnas que el esquema haya declarado como filtrables. Todos los filtros de una misma regla se combinan con AND.

Por ejemplo, esta regla permite leer certificados activos emitidos por una CA concreta:

\`\`\`json title="Regla limitada por atributos"
{
  "namespace": "pki",
  "schema_name": "ca",
  "entity_type": "certificate",
  "actions": ["read"],
  "relations": [],
  "column_filters": [
    {
      "column": "status",
      "type": "string",
      "operator": "eq",
      "value": "ACTIVE"
    },
    {
      "column": "issuer_meta_id",
      "type": "string",
      "operator": "eq",
      "value": "ca-production"
    }
  ]
}
\`\`\`

Los operadores disponibles son \`eq\`, \`neq\`, \`gt\`, \`gte\`, \`lt\`, \`lte\`, \`in\` y \`like\`. Usa comparaciones coherentes con el tipo de columna: \`like\` para texto, comparaciones de orden para números o fechas y \`in\` cuando haya una colección de valores aceptados.

Reglas HTTP [#reglas-http]

Las reglas HTTP no apuntan directamente a tablas. Referencian un esquema de rutas y conceden sus acciones lógicas. Las políticas del Job Manager son un ejemplo: distinguen lectura, creación, actualización y eliminación de workflows o jobs.

Algunas rutas también comparan un valor de la petición —extraído de la ruta, query, cabecera o cuerpo JSON— con un atributo normalizado del principal. Así puede verificarse que un dispositivo solo consulte trabajos dirigidos a su propio \`client_id\`.

Los atributos normalizados desacoplan la política del mecanismo de autenticación. \`subject_attribute_mappings\` puede derivar, por ejemplo, \`device_id\` desde \`oidc.claim.device_id\` o desde \`x509.subject.cn\`. La regla consume \`device_id\` en ambos casos.

Políticas incluidas [#políticas-incluidas]

La precarga de \`authz\` instala políticas reutilizables para los dominios principales. Entre ellas se encuentran:

* acceso completo y de solo lectura a certificados y autoridades;
* acceso completo y de solo lectura a KMS;
* acceso completo y de solo lectura a Device Manager, DMS Manager, Validation Authority y alertas;
* una política \`Auditor\` de lectura de PKI y visibilidad de autorización;
* acceso a la interfaz;
* políticas de administración y observación para las APIs NBI y SBI del Job Manager;
* \`SUPER ADMIN\`, que concede todas las acciones sobre los dominios \`authz\` y \`pki\`.

Empieza por estas políticas antes de crear otras. Si ninguna refleja el límite que necesitas, crea una política específica y pequeña en lugar de copiar \`SUPER ADMIN\` y retirar permisos de forma informal.

Provisiona el primer administrador [#provisiona-el-primer-administrador]

<Callout type="warn" title="No existe un superusuario implícito">
  Una instalación sin un principal que coincida con tu identidad queda sin nadie capaz de administrar la autorización. Configura el IdP y el bootstrap antes de exponer la plataforma.
</Callout>

El chart incluye un principal de bootstrap que busca el rol OIDC \`pki-admin\` en \`realm_access.roles\`. Le concede \`SUPER ADMIN\` y, cuando Job Manager está habilitado, la política administrativa de su API NBI.

\`\`\`yaml title="values.yaml"
auth:
  authorization:
    rolesClaim: realm_access.roles
    roles:
      admin: pki-admin
  externalAuthorization:
    enabled: true
    failOpen: false

services:
  authz:
    jwkUrl: https://idp.example.com/realms/iot/protocol/openid-connect/certs
    bootstrap:
      - principal_id: "oidc:pki-admin"
        principal_name: "PKI Admin"
        principal_type: "oidc"
        policy_ids:
          # SUPER ADMIN
          - "lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"
          # Job Manager - Mgmt NBI Admin
          - "lamassu.7df018c1-3140-4a35-9067-2e7d6cec3ed2"
        auth_config:
          claims:
            - claim: "realm_access.roles"
              operator: "contains"
              value: "pki-admin"
\`\`\`

El Job Helm de preinstalación y preactualización ejecuta las migraciones de \`authz\`, precarga las políticas y crea los principales de bootstrap antes de iniciar los servicios. Si el principal ya existe, no lo reemplaza: añade únicamente los grants configurados que todavía falten. Puedes conservar la entrada en \`values.yaml\` durante las actualizaciones.

<Steps>
  <Step>
    Prepara el proveedor de identidad [#prepara-el-proveedor-de-identidad]

    Crea el rol o grupo que utilizarás para recuperar y administrar Lamassu. Asígnalo al menos a dos identidades humanas controladas. Si tu proveedor no usa \`realm_access.roles\`, adapta la ruta del claim tanto en el frontend como en \`auth_config.claims\`.
  </Step>

  <Step>
    Configura las dos validaciones JWT [#configura-las-dos-validaciones-jwt]

    El Gateway utiliza \`auth.authentication.apiGateway.jwks\` para autenticar peticiones. \`authz\` utiliza \`services.authz.jwkUrl\` para resolver los principales OIDC. Ambos endpoints deben contener las claves del mismo emisor y ser alcanzables desde sus respectivos componentes.
  </Step>

  <Step>
    Instala y verifica el acceso administrativo [#instala-y-verifica-el-acceso-administrativo]

    Inicia sesión con una identidad que tenga \`pki-admin\`. Confirma que puede acceder a la administración de autorización y realizar una operación de lectura no destructiva.
  </Step>

  <Step>
    Prueba una identidad sin privilegios [#prueba-una-identidad-sin-privilegios]

    Usa un segundo usuario sin el rol y confirma que la misma operación queda denegada. Esta prueba detecta claims mal interpretados, políticas demasiado amplias y configuraciones \`failOpen\` accidentales.
  </Step>

  <Step>
    Reduce el uso del administrador de bootstrap [#reduce-el-uso-del-administrador-de-bootstrap]

    Crea principales operativos con políticas de menor alcance. Reserva \`pki-admin\` para administración de autorización y recuperación, no para el trabajo diario.
  </Step>
</Steps>

Bootstrap de Fastlane [#bootstrap-de-fastlane]

Fastlane instala un realm de Keycloak para laboratorio y crea el usuario \`lamassu\` con contraseña temporal \`lamassu\`, rol \`pki-admin\` y cambio de contraseña obligatorio. Su principal de bootstrap coincide mediante \`preferred_username=lamassu\`.

<Callout type="warn" title="Credenciales solo para bootstrap">
  Cambia la contraseña en el primer acceso. No reutilices el usuario, la contraseña ni el IdP de Fastlane como diseño de producción.
</Callout>

Diseña roles de mínimo privilegio [#diseña-roles-de-mínimo-privilegio]

Evita reproducir la estructura interna de tu empresa con decenas de políticas casi idénticas. Empieza por las responsabilidades que realmente necesitan acceso:

* **Administración de autorización**: gestiona principales, políticas y grants. Debe pertenecer a un grupo pequeño y separado.
* **Operación de PKI**: administra CAs, perfiles y certificados, pero no necesariamente puede modificar quién obtiene acceso.
* **Registro de dispositivos**: opera dispositivos y DMS sin recibir permisos sobre claves o configuración de autorización.
* **Auditoría**: consulta configuración y actividad sin crear, modificar, firmar, revocar ni eliminar.
* **Automatización**: utiliza una cuenta técnica o certificado independiente, con permisos limitados al flujo y recursos que controla.

Para cada rol, separa “ver” de “cambiar”, limita los recursos mediante grants, relaciones o atributos y evita \`*\` salvo que el rol deba abarcar futuras acciones automáticamente.

<Callout type="info" title="Los comodines también conceden acciones futuras">
  Una regla con \`actions: ["*"]\` se expande a todas las acciones definidas por el esquema. Cuando una versión nueva añade una acción, una política con comodín puede empezar a concederla. Revisa estas políticas durante cada actualización.
</Callout>

Cambios y revocación de acceso [#cambios-y-revocación-de-acceso]

Para retirar acceso de inmediato, desactiva el principal o revoca sus grants. Desactivar un principal conserva su configuración y asociaciones para investigación o restauración, pero deja de participar en la coincidencia.

Eliminar un rol o grupo en el IdP evita que nuevos tokens contengan el claim, pero un token ya emitido puede seguir siendo válido hasta expirar. Si la retirada es urgente, combina el cambio en el IdP con la desactivación del principal en Lamassu y la revocación de sesiones o tokens en el proveedor.

Cuando edites una política compartida, recuerda que el cambio afecta a todos sus principales. Para probar un nuevo alcance, crea una política separada, concédela a una identidad de prueba y valida operaciones permitidas y denegadas antes de sustituir la anterior.

Lista de comprobación operativa [#lista-de-comprobación-operativa]

* Mantén \`failOpen: false\` salvo que una evaluación de riesgo documentada justifique lo contrario.
* Usa grupos o roles estables para personas e identidades independientes para automatizaciones.
* Conserva al menos dos administradores de recuperación y prueba su acceso periódicamente.
* Revisa los principales activos, sus coincidencias y sus grants después de cambios en el IdP.
* Busca comodines en políticas antes de actualizar Lamassu.
* Prueba siempre una operación permitida y otra denegada para cada rol.
* Correlaciona los cambios de principales, políticas y grants con los [registros de auditoría](/docs/platform/pki/audit-logs).

Diagnóstico [#diagnóstico]

La respuesta es 401 [#la-respuesta-es-401]

La autenticación falló antes de evaluar permisos. Comprueba la firma y expiración del JWT, el emisor, la audiencia y la disponibilidad del JWKS configurado en el Gateway. Para X.509, revisa que el certificado cliente llegue hasta el punto que extrae la credencial.

La respuesta es 403 [#la-respuesta-es-403]

La credencial pudo procesarse, pero no produjo una autorización positiva. Revisa en este orden:

1. que exista un principal activo del tipo correcto;
2. que las rutas de claims y sus valores coincidan exactamente con el token real;
3. que todas las condiciones del principal se cumplan;
4. que el principal tenga concedida la política esperada;
5. que la política incluya la acción y el tipo de recurso o ruta solicitados;
6. que el identificador, relación, filtro de columna o restricción HTTP incluya el recurso real.

En los logs de \`authz\`, una decisión del endpoint externo incluye \`allowed\`, \`reason\`, \`matched_principals\`, \`evaluated_policy_ids\`, \`matched_policy_id\` y el código de estado. Estos campos permiten separar un fallo de coincidencia de un fallo de permisos.

Todo devuelve 403 [#todo-devuelve-403]

Comprueba que el principal de bootstrap fue creado y que las políticas fueron precargadas por el Job de migración. Verifica también que \`services.authz.jwkUrl\` sea alcanzable desde el pod de \`authz\`; no asumas que una URL pública accesible desde el navegador también funciona dentro del clúster.

Todo falla cuando authz no está disponible [#todo-falla-cuando-authz-no-está-disponible]

Es el comportamiento esperado con \`failOpen: false\`. Restaura el servicio, su conexión con PostgreSQL y su conectividad con el JWKS. No cambies temporalmente a \`failOpen: true\` sin aceptar que las rutas protegidas podrían quedar accesibles sin decisión de autorización.

Continúa con [Registros de auditoría](/docs/platform/pki/audit-logs) para investigar cambios de configuración o con [Resolución de problemas](/docs/platform/pki/troubleshooting) para diagnosticar el despliegue.
`,t={title:"Control de acceso",description:"Diseña quién puede acceder a Lamassu mediante principales, políticas, permisos sobre recursos y autorización de rutas HTTP."},p={contents:[{heading:void 0,content:"El control de acceso de Lamassu transforma una identidad autenticada en permisos concretos. El proveedor OIDC o el certificado cliente demuestra **quién** realiza una petición; el servicio `authz` decide **qué puede hacer** esa identidad y **sobre qué recursos**."},{heading:void 0,content:"Lamassu no asigna permisos directamente a usuarios. La cadena completa es:"},{heading:void 0,content:"Este modelo permite representar personas, grupos del proveedor de identidad, cuentas de servicio y dispositivos sin acoplar la autorización a un proveedor concreto."},{heading:"conceptos-esenciales",content:"Un **principal** conecta una credencial con Lamassu. Define cómo reconocer una identidad OIDC o X.509 y puede estar activo o desactivado."},{heading:"conceptos-esenciales",content:"Una **política** agrupa permisos reutilizables. Puede concederse a varios principales y puede contener reglas sobre entidades de Lamassu, reglas sobre rutas HTTP o ambas."},{heading:"conceptos-esenciales",content:"Una **regla de entidad** concede acciones sobre recursos como autoridades certificadoras, certificados, perfiles de emisión, dispositivos, DMS, claves o suscripciones de alertas. Puede abarcar todos los recursos de un tipo o limitarse por identificador, relación o atributo."},{heading:"conceptos-esenciales",content:"Una **regla HTTP** concede acciones asociadas a rutas de una API. Es el mecanismo que utiliza el Gateway para decidir si una petición puede atravesar el perímetro."},{heading:"conceptos-esenciales",content:"Un **grant** es la asociación entre un principal y una política. Quitar el grant elimina todos los permisos aportados por esa política, sin modificarla para los demás principales."},{heading:"conceptos-esenciales",content:"Un JWT válido o un certificado cliente válido no concede acceso por sí mismo. La credencial debe coincidir con al menos un principal activo y alguna de sus políticas debe permitir la operación solicitada."},{heading:"dos-sistemas-de-decisión",content:"Lamassu utiliza dos caminos de autorización según quién implementa el servicio protegido. Comparten principales, políticas y grants, pero no interpretan las reglas de la misma manera."},{heading:"dos-sistemas-de-decisión",content:"Un servicio externo puede quedar protegido sin conocer el modelo interno de autorización de Lamassu. Un servicio desarrollado por Lamassu integra el motor de autorización y puede decidir sobre recursos concretos y filtrar sus consultas."},{heading:"servicios-http-integrados-o-externos",content:"Este camino protege APIs que se incorporan a la plataforma a través del Gateway pero que no implementan de forma nativa el SDK de autorización de Lamassu. Job Manager es el ejemplo actual. El mismo patrón permite integrar otros servicios HTTP siempre que sus rutas estén descritas en un esquema HTTP de `authz`."},{heading:"servicios-http-integrados-o-externos",content:"La decisión se toma **antes de reenviar la petición al servicio**:"},{heading:"servicios-http-integrados-o-externos",content:"Envoy Gateway autentica la petición, normalmente validando un JWT contra el JWKS del proveedor OIDC."},{heading:"servicios-http-integrados-o-externos",content:"Para una ruta protegida, Envoy envía el método, la URL, las cabeceras y los datos necesarios a `/v1/ext_authz/check`."},{heading:"servicios-http-integrados-o-externos",content:"`authz` extrae la credencial y resuelve todos los principales activos que coinciden con ella."},{heading:"servicios-http-integrados-o-externos",content:"Carga por separado las políticas concedidas a cada principal."},{heading:"servicios-http-integrados-o-externos",content:"El esquema HTTP traduce la combinación de método y ruta a una acción lógica, como `nbi-job-read` o `nbi-workflow-create`."},{heading:"servicios-http-integrados-o-externos",content:"`authz` busca una regla HTTP que conceda esa acción."},{heading:"servicios-http-integrados-o-externos",content:"Si la ruta declara restricciones, compara datos de la petición con los atributos normalizados del mismo principal que aporta la política."},{heading:"servicios-http-integrados-o-externos",content:"Un resultado satisfactorio permite a Envoy reenviar la petición; cualquier otra respuesta la bloquea en el Gateway."},{heading:"servicios-http-integrados-o-externos",content:"Cuando permite el acceso, `authz` devuelve el principal seleccionado en `x-current-user`. El Gateway puede propagar esa cabecera al servicio para conservar el contexto de identidad."},{heading:"servicios-http-integrados-o-externos",content:"Las reglas HTTP responden principalmente a &#x2A;*“¿puede esta identidad llamar a esta operación de la API?”**. Por sí solas no generan filtros sobre la base de datos del servicio externo. Para limitar una ruta a un dispositivo, tenant o cliente concreto, el esquema debe declarar una restricción que relacione un valor de la petición con un atributo normalizado del principal."},{heading:"servicios-desarrollados-por-lamassu",content:"Los servicios nativos de Lamassu integran autorización en su middleware y conocen las entidades sobre las que operan: certificados, CAs, perfiles de emisión, claves, dispositivos, DMS o suscripciones, entre otras."},{heading:"servicios-desarrollados-por-lamassu",content:"La decisión se toma con el contexto de la operación de dominio:"},{heading:"servicios-desarrollados-por-lamassu",content:"El middleware extrae la credencial y resuelve los principales coincidentes."},{heading:"servicios-desarrollados-por-lamassu",content:"El endpoint identifica la acción, el tipo de entidad y, cuando corresponde, la clave del recurso solicitado."},{heading:"servicios-desarrollados-por-lamassu",content:"`authz` reúne las reglas de entidad de las políticas concedidas."},{heading:"servicios-desarrollados-por-lamassu",content:"El motor evalúa grants directos, filtros por atributos y relaciones con otras entidades."},{heading:"servicios-desarrollados-por-lamassu",content:"Para una operación individual, comprueba que el recurso concreto satisface el alcance calculado."},{heading:"servicios-desarrollados-por-lamassu",content:"Para un listado, genera un filtro SQL que el servicio añade a su propia consulta."},{heading:"servicios-desarrollados-por-lamassu",content:"Aquí el motor responde a &#x2A;*“¿puede esta identidad realizar esta acción sobre este recurso concreto?”**."},{heading:"servicios-desarrollados-por-lamassu",content:"Las acciones se dividen en dos grupos:"},{heading:"servicios-desarrollados-por-lamassu",content:"Las **acciones globales** no necesitan un identificador de recurso. `create`, `import` o el acceso a una sección de la interfaz son ejemplos habituales."},{heading:"servicios-desarrollados-por-lamassu",content:"Las **acciones atómicas** se evalúan sobre una instancia concreta. En certificados aparecen `read`, `metadata-update`, `status-update` y `delete`; para una CA también existen `sign`, `reissue` y otras operaciones de ciclo de vida."},{heading:"servicios-desarrollados-por-lamassu",content:"El filtrado dentro del servicio evita fugas en listados: los recursos no autorizados quedan fuera de la consulta SQL en lugar de recuperarse y ocultarse después en la interfaz."},{heading:"cómo-se-relacionan-ambos-caminos",content:"No son dos controles equivalentes aplicados dos veces. Las reglas HTTP protegen el perímetro de un servicio integrado; las reglas de entidad expresan permisos sobre el modelo de datos de los servicios nativos."},{heading:"cómo-se-relacionan-ambos-caminos",content:"Una política puede contener ambos tipos de reglas cuando una identidad necesita operar recursos de Lamassu y también llamar a una API integrada. Conceder una regla de entidad no concede automáticamente una acción HTTP, ni una regla HTTP crea acceso sobre una entidad."},{heading:"cómo-se-relacionan-ambos-caminos",content:"Si ninguna combinación de principal, política y regla permite la operación, Lamassu la deniega. Además, `auth.externalAuthorization.failOpen` vale `false` por defecto: si `authz` no está disponible, el Gateway bloquea las rutas protegidas."},{heading:"principales-oidc",content:"Un principal OIDC coincide con los claims de un JWT validado. Es apropiado para usuarios humanos, grupos corporativos, roles del IdP y cuentas de servicio que obtienen tokens."},{heading:"principales-oidc",content:"El siguiente principal representa a cualquier identidad que tenga el rol `pki-operators` en Keycloak:"},{heading:"principales-oidc",content:"Las rutas de claims pueden estar anidadas, como `realm_access.roles`. Dentro de un mismo principal, **todas** las condiciones deben cumplirse. Esto permite exigir, por ejemplo, un grupo y una audiencia organizativa a la vez."},{heading:"principales-oidc",content:"Los operadores implementados son:"},{heading:"principales-oidc",content:"`equals`, para igualdad exacta;"},{heading:"principales-oidc",content:"`contains`, para comprobar la pertenencia a una lista o la presencia de texto en un valor escalar."},{heading:"principales-oidc",content:"Diseña la coincidencia con atributos estables. Para personas, suele ser mejor enlazar permisos a grupos o roles gestionados centralmente que al correo o al nombre de usuario. Para una cuenta de servicio, un `sub` estable evita que sus permisos se mezclen con los de un operador humano."},{heading:"principales-oidc",content:"Aunque el modelo reconoce el nombre de operador `matches`, la implementación actual no evalúa expresiones regulares y la condición nunca coincide. Usa `equals` o `contains`."},{heading:"principales-x509",content:"Un principal X.509 permite reconocer una carga de trabajo o un dispositivo mediante su certificado cliente. Lamassu comprueba la firma del certificado contra la CA configurada y, según el modo, también su número de serie o Common Name."},{heading:"principales-x509",content:"Los modos disponibles son:"},{heading:"principales-x509",content:"`serial_and_ca`: un certificado exacto, identificado por número de serie y CA;"},{heading:"principales-x509",content:"`cn_and_ca`: un Common Name exacto o con comodines y una CA concreta;"},{heading:"principales-x509",content:"`any_from_ca`: cualquier certificado emitido directamente por la CA indicada."},{heading:"principales-x509",content:"Este ejemplo reconoce certificados cuyo CN comienza por `factory-a-` y que están firmados por la CA configurada:"},{heading:"principales-x509",content:"`ca_trust.identity_type` acepta `fingerprint` o `authority_key_id`. En ambos casos debes aportar el certificado de la CA en `ca_trust.pem`; Lamassu verifica tanto la firma como la identidad esperada de la CA."},{heading:"principales-x509",content:"Usa `any_from_ca` únicamente cuando todas las identidades emitidas por esa CA deban compartir los mismos permisos. Si una CA emite certificados para poblaciones distintas, separa el acceso por serie o CN, o utiliza CAs de emisión diferentes."},{heading:"cuando-coinciden-varios-principales",content:"Una misma credencial puede coincidir con más de un principal. Es habitual que un usuario coincida con un principal de su equipo y con otro de su función operativa."},{heading:"cuando-coinciden-varios-principales",content:"Para permisos de entidad, Lamassu combina los permisos con lógica OR: basta con que una de las políticas de uno de los principales permita la acción. Los listados contienen la unión de los recursos visibles para todos ellos."},{heading:"cuando-coinciden-varios-principales",content:"Las rutas HTTP con restricciones son más estrictas. El mismo principal que aporta la política debe satisfacer también los atributos exigidos por la ruta. Lamassu no combina la política de un principal con un atributo perteneciente a otro."},{heading:"cuando-coinciden-varios-principales",content:"Por esta razón, añadir un principal coincidente solo puede ampliar el acceso. Antes de crear reglas solapadas, revisa el conjunto completo de políticas que recibirá una identidad real."},{heading:"acceso-global-y-acceso-directo",content:"Una regla identifica el dominio (`namespace`), el esquema de datos (`schema_name`) y el tipo de entidad (`entity_type`). `actions` enumera las operaciones permitidas."},{heading:"acceso-global-y-acceso-directo",content:"`direct_grants` limita la regla a identificadores concretos. El valor `*` abarca todas las instancias del tipo. Una política de superadministrador utiliza comodines en esquema, entidad, acciones y grants; una política de mínimo privilegio debe evitarlos siempre que sea posible."},{heading:"acceso-heredado-por-relaciones",content:"Las reglas pueden seguir relaciones declaradas entre entidades. Por ejemplo, el esquema conoce la relación de un certificado con su CA emisora y la de un dispositivo con su DMS. Una política puede conceder acceso a un recurso padre y propagar acciones seleccionadas hacia sus recursos relacionados."},{heading:"acceso-heredado-por-relaciones",content:"Esto permite expresar modelos como “puede operar los dispositivos de este DMS” sin mantener una lista individual de cada dispositivo. Cuando se añade un recurso bajo esa relación, hereda el alcance previsto por la política."},{heading:"acceso-filtrado-por-atributos",content:"`column_filters` aplica condiciones a columnas que el esquema haya declarado como filtrables. Todos los filtros de una misma regla se combinan con AND."},{heading:"acceso-filtrado-por-atributos",content:"Por ejemplo, esta regla permite leer certificados activos emitidos por una CA concreta:"},{heading:"acceso-filtrado-por-atributos",content:"Los operadores disponibles son `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in` y `like`. Usa comparaciones coherentes con el tipo de columna: `like` para texto, comparaciones de orden para números o fechas y `in` cuando haya una colección de valores aceptados."},{heading:"reglas-http",content:"Las reglas HTTP no apuntan directamente a tablas. Referencian un esquema de rutas y conceden sus acciones lógicas. Las políticas del Job Manager son un ejemplo: distinguen lectura, creación, actualización y eliminación de workflows o jobs."},{heading:"reglas-http",content:"Algunas rutas también comparan un valor de la petición —extraído de la ruta, query, cabecera o cuerpo JSON— con un atributo normalizado del principal. Así puede verificarse que un dispositivo solo consulte trabajos dirigidos a su propio `client_id`."},{heading:"reglas-http",content:"Los atributos normalizados desacoplan la política del mecanismo de autenticación. `subject_attribute_mappings` puede derivar, por ejemplo, `device_id` desde `oidc.claim.device_id` o desde `x509.subject.cn`. La regla consume `device_id` en ambos casos."},{heading:"políticas-incluidas",content:"La precarga de `authz` instala políticas reutilizables para los dominios principales. Entre ellas se encuentran:"},{heading:"políticas-incluidas",content:"acceso completo y de solo lectura a certificados y autoridades;"},{heading:"políticas-incluidas",content:"acceso completo y de solo lectura a KMS;"},{heading:"políticas-incluidas",content:"acceso completo y de solo lectura a Device Manager, DMS Manager, Validation Authority y alertas;"},{heading:"políticas-incluidas",content:"una política `Auditor` de lectura de PKI y visibilidad de autorización;"},{heading:"políticas-incluidas",content:"acceso a la interfaz;"},{heading:"políticas-incluidas",content:"políticas de administración y observación para las APIs NBI y SBI del Job Manager;"},{heading:"políticas-incluidas",content:"`SUPER ADMIN`, que concede todas las acciones sobre los dominios `authz` y `pki`."},{heading:"políticas-incluidas",content:"Empieza por estas políticas antes de crear otras. Si ninguna refleja el límite que necesitas, crea una política específica y pequeña en lugar de copiar `SUPER ADMIN` y retirar permisos de forma informal."},{heading:"provisiona-el-primer-administrador",content:"Una instalación sin un principal que coincida con tu identidad queda sin nadie capaz de administrar la autorización. Configura el IdP y el bootstrap antes de exponer la plataforma."},{heading:"provisiona-el-primer-administrador",content:"El chart incluye un principal de bootstrap que busca el rol OIDC `pki-admin` en `realm_access.roles`. Le concede `SUPER ADMIN` y, cuando Job Manager está habilitado, la política administrativa de su API NBI."},{heading:"provisiona-el-primer-administrador",content:"El Job Helm de preinstalación y preactualización ejecuta las migraciones de `authz`, precarga las políticas y crea los principales de bootstrap antes de iniciar los servicios. Si el principal ya existe, no lo reemplaza: añade únicamente los grants configurados que todavía falten. Puedes conservar la entrada en `values.yaml` durante las actualizaciones."},{heading:"prepara-el-proveedor-de-identidad",content:"Crea el rol o grupo que utilizarás para recuperar y administrar Lamassu. Asígnalo al menos a dos identidades humanas controladas. Si tu proveedor no usa `realm_access.roles`, adapta la ruta del claim tanto en el frontend como en `auth_config.claims`."},{heading:"configura-las-dos-validaciones-jwt",content:"El Gateway utiliza `auth.authentication.apiGateway.jwks` para autenticar peticiones. `authz` utiliza `services.authz.jwkUrl` para resolver los principales OIDC. Ambos endpoints deben contener las claves del mismo emisor y ser alcanzables desde sus respectivos componentes."},{heading:"instala-y-verifica-el-acceso-administrativo",content:"Inicia sesión con una identidad que tenga `pki-admin`. Confirma que puede acceder a la administración de autorización y realizar una operación de lectura no destructiva."},{heading:"prueba-una-identidad-sin-privilegios",content:"Usa un segundo usuario sin el rol y confirma que la misma operación queda denegada. Esta prueba detecta claims mal interpretados, políticas demasiado amplias y configuraciones `failOpen` accidentales."},{heading:"reduce-el-uso-del-administrador-de-bootstrap",content:"Crea principales operativos con políticas de menor alcance. Reserva `pki-admin` para administración de autorización y recuperación, no para el trabajo diario."},{heading:"bootstrap-de-fastlane",content:"Fastlane instala un realm de Keycloak para laboratorio y crea el usuario `lamassu` con contraseña temporal `lamassu`, rol `pki-admin` y cambio de contraseña obligatorio. Su principal de bootstrap coincide mediante `preferred_username=lamassu`."},{heading:"bootstrap-de-fastlane",content:"Cambia la contraseña en el primer acceso. No reutilices el usuario, la contraseña ni el IdP de Fastlane como diseño de producción."},{heading:"diseña-roles-de-mínimo-privilegio",content:"Evita reproducir la estructura interna de tu empresa con decenas de políticas casi idénticas. Empieza por las responsabilidades que realmente necesitan acceso:"},{heading:"diseña-roles-de-mínimo-privilegio",content:"**Administración de autorización**: gestiona principales, políticas y grants. Debe pertenecer a un grupo pequeño y separado."},{heading:"diseña-roles-de-mínimo-privilegio",content:"**Operación de PKI**: administra CAs, perfiles y certificados, pero no necesariamente puede modificar quién obtiene acceso."},{heading:"diseña-roles-de-mínimo-privilegio",content:"**Registro de dispositivos**: opera dispositivos y DMS sin recibir permisos sobre claves o configuración de autorización."},{heading:"diseña-roles-de-mínimo-privilegio",content:"**Auditoría**: consulta configuración y actividad sin crear, modificar, firmar, revocar ni eliminar."},{heading:"diseña-roles-de-mínimo-privilegio",content:"**Automatización**: utiliza una cuenta técnica o certificado independiente, con permisos limitados al flujo y recursos que controla."},{heading:"diseña-roles-de-mínimo-privilegio",content:"Para cada rol, separa “ver” de “cambiar”, limita los recursos mediante grants, relaciones o atributos y evita `*` salvo que el rol deba abarcar futuras acciones automáticamente."},{heading:"diseña-roles-de-mínimo-privilegio",content:'Una regla con `actions: ["*"]` se expande a todas las acciones definidas por el esquema. Cuando una versión nueva añade una acción, una política con comodín puede empezar a concederla. Revisa estas políticas durante cada actualización.'},{heading:"cambios-y-revocación-de-acceso",content:"Para retirar acceso de inmediato, desactiva el principal o revoca sus grants. Desactivar un principal conserva su configuración y asociaciones para investigación o restauración, pero deja de participar en la coincidencia."},{heading:"cambios-y-revocación-de-acceso",content:"Eliminar un rol o grupo en el IdP evita que nuevos tokens contengan el claim, pero un token ya emitido puede seguir siendo válido hasta expirar. Si la retirada es urgente, combina el cambio en el IdP con la desactivación del principal en Lamassu y la revocación de sesiones o tokens en el proveedor."},{heading:"cambios-y-revocación-de-acceso",content:"Cuando edites una política compartida, recuerda que el cambio afecta a todos sus principales. Para probar un nuevo alcance, crea una política separada, concédela a una identidad de prueba y valida operaciones permitidas y denegadas antes de sustituir la anterior."},{heading:"lista-de-comprobación-operativa",content:"Mantén `failOpen: false` salvo que una evaluación de riesgo documentada justifique lo contrario."},{heading:"lista-de-comprobación-operativa",content:"Usa grupos o roles estables para personas e identidades independientes para automatizaciones."},{heading:"lista-de-comprobación-operativa",content:"Conserva al menos dos administradores de recuperación y prueba su acceso periódicamente."},{heading:"lista-de-comprobación-operativa",content:"Revisa los principales activos, sus coincidencias y sus grants después de cambios en el IdP."},{heading:"lista-de-comprobación-operativa",content:"Busca comodines en políticas antes de actualizar Lamassu."},{heading:"lista-de-comprobación-operativa",content:"Prueba siempre una operación permitida y otra denegada para cada rol."},{heading:"lista-de-comprobación-operativa",content:"Correlaciona los cambios de principales, políticas y grants con los registros de auditoría."},{heading:"la-respuesta-es-401",content:"La autenticación falló antes de evaluar permisos. Comprueba la firma y expiración del JWT, el emisor, la audiencia y la disponibilidad del JWKS configurado en el Gateway. Para X.509, revisa que el certificado cliente llegue hasta el punto que extrae la credencial."},{heading:"la-respuesta-es-403",content:"La credencial pudo procesarse, pero no produjo una autorización positiva. Revisa en este orden:"},{heading:"la-respuesta-es-403",content:"que exista un principal activo del tipo correcto;"},{heading:"la-respuesta-es-403",content:"que las rutas de claims y sus valores coincidan exactamente con el token real;"},{heading:"la-respuesta-es-403",content:"que todas las condiciones del principal se cumplan;"},{heading:"la-respuesta-es-403",content:"que el principal tenga concedida la política esperada;"},{heading:"la-respuesta-es-403",content:"que la política incluya la acción y el tipo de recurso o ruta solicitados;"},{heading:"la-respuesta-es-403",content:"que el identificador, relación, filtro de columna o restricción HTTP incluya el recurso real."},{heading:"la-respuesta-es-403",content:"En los logs de `authz`, una decisión del endpoint externo incluye `allowed`, `reason`, `matched_principals`, `evaluated_policy_ids`, `matched_policy_id` y el código de estado. Estos campos permiten separar un fallo de coincidencia de un fallo de permisos."},{heading:"todo-devuelve-403",content:"Comprueba que el principal de bootstrap fue creado y que las políticas fueron precargadas por el Job de migración. Verifica también que `services.authz.jwkUrl` sea alcanzable desde el pod de `authz`; no asumas que una URL pública accesible desde el navegador también funciona dentro del clúster."},{heading:"todo-falla-cuando-authz-no-está-disponible",content:"Es el comportamiento esperado con `failOpen: false`. Restaura el servicio, su conexión con PostgreSQL y su conectividad con el JWKS. No cambies temporalmente a `failOpen: true` sin aceptar que las rutas protegidas podrían quedar accesibles sin decisión de autorización."},{heading:"todo-falla-cuando-authz-no-está-disponible",content:"Continúa con Registros de auditoría para investigar cambios de configuración o con Resolución de problemas para diagnosticar el despliegue."}],headings:[{id:"conceptos-esenciales",content:"Conceptos esenciales"},{id:"dos-sistemas-de-decisión",content:"Dos sistemas de decisión"},{id:"servicios-http-integrados-o-externos",content:"Servicios HTTP integrados o externos"},{id:"servicios-desarrollados-por-lamassu",content:"Servicios desarrollados por Lamassu"},{id:"cómo-se-relacionan-ambos-caminos",content:"Cómo se relacionan ambos caminos"},{id:"principales-oidc",content:"Principales OIDC"},{id:"principales-x509",content:"Principales X.509"},{id:"cuando-coinciden-varios-principales",content:"Cuando coinciden varios principales"},{id:"cómo-expresan-acceso-las-políticas",content:"Cómo expresan acceso las políticas"},{id:"acceso-global-y-acceso-directo",content:"Acceso global y acceso directo"},{id:"acceso-heredado-por-relaciones",content:"Acceso heredado por relaciones"},{id:"acceso-filtrado-por-atributos",content:"Acceso filtrado por atributos"},{id:"reglas-http",content:"Reglas HTTP"},{id:"políticas-incluidas",content:"Políticas incluidas"},{id:"provisiona-el-primer-administrador",content:"Provisiona el primer administrador"},{id:"prepara-el-proveedor-de-identidad",content:"Prepara el proveedor de identidad"},{id:"configura-las-dos-validaciones-jwt",content:"Configura las dos validaciones JWT"},{id:"instala-y-verifica-el-acceso-administrativo",content:"Instala y verifica el acceso administrativo"},{id:"prueba-una-identidad-sin-privilegios",content:"Prueba una identidad sin privilegios"},{id:"reduce-el-uso-del-administrador-de-bootstrap",content:"Reduce el uso del administrador de bootstrap"},{id:"bootstrap-de-fastlane",content:"Bootstrap de Fastlane"},{id:"diseña-roles-de-mínimo-privilegio",content:"Diseña roles de mínimo privilegio"},{id:"cambios-y-revocación-de-acceso",content:"Cambios y revocación de acceso"},{id:"lista-de-comprobación-operativa",content:"Lista de comprobación operativa"},{id:"diagnóstico",content:"Diagnóstico"},{id:"la-respuesta-es-401",content:"La respuesta es 401"},{id:"la-respuesta-es-403",content:"La respuesta es 403"},{id:"todo-devuelve-403",content:"Todo devuelve 403"},{id:"todo-falla-cuando-authz-no-está-disponible",content:"Todo falla cuando authz no está disponible"}]};const u=[{depth:2,url:"#conceptos-esenciales",title:e.jsx(e.Fragment,{children:"Conceptos esenciales"})},{depth:2,url:"#dos-sistemas-de-decisión",title:e.jsx(e.Fragment,{children:"Dos sistemas de decisión"})},{depth:3,url:"#servicios-http-integrados-o-externos",title:e.jsx(e.Fragment,{children:"Servicios HTTP integrados o externos"})},{depth:3,url:"#servicios-desarrollados-por-lamassu",title:e.jsx(e.Fragment,{children:"Servicios desarrollados por Lamassu"})},{depth:3,url:"#cómo-se-relacionan-ambos-caminos",title:e.jsx(e.Fragment,{children:"Cómo se relacionan ambos caminos"})},{depth:2,url:"#principales-oidc",title:e.jsx(e.Fragment,{children:"Principales OIDC"})},{depth:2,url:"#principales-x509",title:e.jsx(e.Fragment,{children:"Principales X.509"})},{depth:2,url:"#cuando-coinciden-varios-principales",title:e.jsx(e.Fragment,{children:"Cuando coinciden varios principales"})},{depth:2,url:"#cómo-expresan-acceso-las-políticas",title:e.jsx(e.Fragment,{children:"Cómo expresan acceso las políticas"})},{depth:3,url:"#acceso-global-y-acceso-directo",title:e.jsx(e.Fragment,{children:"Acceso global y acceso directo"})},{depth:3,url:"#acceso-heredado-por-relaciones",title:e.jsx(e.Fragment,{children:"Acceso heredado por relaciones"})},{depth:3,url:"#acceso-filtrado-por-atributos",title:e.jsx(e.Fragment,{children:"Acceso filtrado por atributos"})},{depth:3,url:"#reglas-http",title:e.jsx(e.Fragment,{children:"Reglas HTTP"})},{depth:2,url:"#políticas-incluidas",title:e.jsx(e.Fragment,{children:"Políticas incluidas"})},{depth:2,url:"#provisiona-el-primer-administrador",title:e.jsx(e.Fragment,{children:"Provisiona el primer administrador"})},{depth:3,url:"#prepara-el-proveedor-de-identidad",title:e.jsx(e.Fragment,{children:"Prepara el proveedor de identidad"})},{depth:3,url:"#configura-las-dos-validaciones-jwt",title:e.jsx(e.Fragment,{children:"Configura las dos validaciones JWT"})},{depth:3,url:"#instala-y-verifica-el-acceso-administrativo",title:e.jsx(e.Fragment,{children:"Instala y verifica el acceso administrativo"})},{depth:3,url:"#prueba-una-identidad-sin-privilegios",title:e.jsx(e.Fragment,{children:"Prueba una identidad sin privilegios"})},{depth:3,url:"#reduce-el-uso-del-administrador-de-bootstrap",title:e.jsx(e.Fragment,{children:"Reduce el uso del administrador de bootstrap"})},{depth:2,url:"#bootstrap-de-fastlane",title:e.jsx(e.Fragment,{children:"Bootstrap de Fastlane"})},{depth:2,url:"#diseña-roles-de-mínimo-privilegio",title:e.jsx(e.Fragment,{children:"Diseña roles de mínimo privilegio"})},{depth:2,url:"#cambios-y-revocación-de-acceso",title:e.jsx(e.Fragment,{children:"Cambios y revocación de acceso"})},{depth:2,url:"#lista-de-comprobación-operativa",title:e.jsx(e.Fragment,{children:"Lista de comprobación operativa"})},{depth:2,url:"#diagnóstico",title:e.jsx(e.Fragment,{children:"Diagnóstico"})},{depth:3,url:"#la-respuesta-es-401",title:e.jsx(e.Fragment,{children:"La respuesta es 401"})},{depth:3,url:"#la-respuesta-es-403",title:e.jsx(e.Fragment,{children:"La respuesta es 403"})},{depth:3,url:"#todo-devuelve-403",title:e.jsx(e.Fragment,{children:"Todo devuelve 403"})},{depth:3,url:"#todo-falla-cuando-authz-no-está-disponible",title:e.jsx(e.Fragment,{children:"Todo falla cuando authz no está disponible"})}];function c(i){const a={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components},{Callout:s,Step:n,Steps:r}=a;return s||o("Callout"),n||o("Step"),r||o("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(a.p,{children:["El control de acceso de Lamassu transforma una identidad autenticada en permisos concretos. El proveedor OIDC o el certificado cliente demuestra ",e.jsx(a.strong,{children:"quién"})," realiza una petición; el servicio ",e.jsx(a.code,{children:"authz"})," decide ",e.jsx(a.strong,{children:"qué puede hacer"})," esa identidad y ",e.jsx(a.strong,{children:"sobre qué recursos"}),"."]}),`
`,e.jsx(a.p,{children:"Lamassu no asigna permisos directamente a usuarios. La cadena completa es:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"credencial → principal coincidente → políticas concedidas → reglas → decisión"})})})})}),`
`,e.jsx(a.p,{children:"Este modelo permite representar personas, grupos del proveedor de identidad, cuentas de servicio y dispositivos sin acoplar la autorización a un proveedor concreto."}),`
`,e.jsx(a.h2,{id:"conceptos-esenciales",children:"Conceptos esenciales"}),`
`,e.jsxs(a.p,{children:["Un ",e.jsx(a.strong,{children:"principal"})," conecta una credencial con Lamassu. Define cómo reconocer una identidad OIDC o X.509 y puede estar activo o desactivado."]}),`
`,e.jsxs(a.p,{children:["Una ",e.jsx(a.strong,{children:"política"})," agrupa permisos reutilizables. Puede concederse a varios principales y puede contener reglas sobre entidades de Lamassu, reglas sobre rutas HTTP o ambas."]}),`
`,e.jsxs(a.p,{children:["Una ",e.jsx(a.strong,{children:"regla de entidad"})," concede acciones sobre recursos como autoridades certificadoras, certificados, perfiles de emisión, dispositivos, DMS, claves o suscripciones de alertas. Puede abarcar todos los recursos de un tipo o limitarse por identificador, relación o atributo."]}),`
`,e.jsxs(a.p,{children:["Una ",e.jsx(a.strong,{children:"regla HTTP"})," concede acciones asociadas a rutas de una API. Es el mecanismo que utiliza el Gateway para decidir si una petición puede atravesar el perímetro."]}),`
`,e.jsxs(a.p,{children:["Un ",e.jsx(a.strong,{children:"grant"})," es la asociación entre un principal y una política. Quitar el grant elimina todos los permisos aportados por esa política, sin modificarla para los demás principales."]}),`
`,e.jsx(s,{type:"info",title:"Autenticación y autorización son controles distintos",children:e.jsx(a.p,{children:"Un JWT válido o un certificado cliente válido no concede acceso por sí mismo. La credencial debe coincidir con al menos un principal activo y alguna de sus políticas debe permitir la operación solicitada."})}),`
`,e.jsx(a.h2,{id:"dos-sistemas-de-decisión",children:"Dos sistemas de decisión"}),`
`,e.jsx(a.p,{children:"Lamassu utiliza dos caminos de autorización según quién implementa el servicio protegido. Comparten principales, políticas y grants, pero no interpretan las reglas de la misma manera."}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(a.code,{children:[e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"Servicios HTTP integrados o externos → Gateway → reglas HTTP"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"Servicios desarrollados por Lamassu  → middleware del servicio → reglas de entidad"})})]})})}),`
`,e.jsx(s,{type:"info",title:"La diferencia está en el punto de integración",children:e.jsx(a.p,{children:"Un servicio externo puede quedar protegido sin conocer el modelo interno de autorización de Lamassu. Un servicio desarrollado por Lamassu integra el motor de autorización y puede decidir sobre recursos concretos y filtrar sus consultas."})}),`
`,e.jsx(a.h3,{id:"servicios-http-integrados-o-externos",children:"Servicios HTTP integrados o externos"}),`
`,e.jsxs(a.p,{children:["Este camino protege APIs que se incorporan a la plataforma a través del Gateway pero que no implementan de forma nativa el SDK de autorización de Lamassu. Job Manager es el ejemplo actual. El mismo patrón permite integrar otros servicios HTTP siempre que sus rutas estén descritas en un esquema HTTP de ",e.jsx(a.code,{children:"authz"}),"."]}),`
`,e.jsxs(a.p,{children:["La decisión se toma ",e.jsx(a.strong,{children:"antes de reenviar la petición al servicio"}),":"]}),`
`,e.jsxs(a.ol,{children:[`
`,e.jsx(a.li,{children:"Envoy Gateway autentica la petición, normalmente validando un JWT contra el JWKS del proveedor OIDC."}),`
`,e.jsxs(a.li,{children:["Para una ruta protegida, Envoy envía el método, la URL, las cabeceras y los datos necesarios a ",e.jsx(a.code,{children:"/v1/ext_authz/check"}),"."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"authz"})," extrae la credencial y resuelve todos los principales activos que coinciden con ella."]}),`
`,e.jsx(a.li,{children:"Carga por separado las políticas concedidas a cada principal."}),`
`,e.jsxs(a.li,{children:["El esquema HTTP traduce la combinación de método y ruta a una acción lógica, como ",e.jsx(a.code,{children:"nbi-job-read"})," o ",e.jsx(a.code,{children:"nbi-workflow-create"}),"."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"authz"})," busca una regla HTTP que conceda esa acción."]}),`
`,e.jsx(a.li,{children:"Si la ruta declara restricciones, compara datos de la petición con los atributos normalizados del mismo principal que aporta la política."}),`
`,e.jsx(a.li,{children:"Un resultado satisfactorio permite a Envoy reenviar la petición; cualquier otra respuesta la bloquea en el Gateway."}),`
`]}),`
`,e.jsxs(a.p,{children:["Cuando permite el acceso, ",e.jsx(a.code,{children:"authz"})," devuelve el principal seleccionado en ",e.jsx(a.code,{children:"x-current-user"}),". El Gateway puede propagar esa cabecera al servicio para conservar el contexto de identidad."]}),`
`,e.jsxs(a.p,{children:["Las reglas HTTP responden principalmente a ",e.jsx(a.strong,{children:"“¿puede esta identidad llamar a esta operación de la API?”"}),". Por sí solas no generan filtros sobre la base de datos del servicio externo. Para limitar una ruta a un dispositivo, tenant o cliente concreto, el esquema debe declarar una restricción que relacione un valor de la petición con un atributo normalizado del principal."]}),`
`,e.jsx(a.h3,{id:"servicios-desarrollados-por-lamassu",children:"Servicios desarrollados por Lamassu"}),`
`,e.jsx(a.p,{children:"Los servicios nativos de Lamassu integran autorización en su middleware y conocen las entidades sobre las que operan: certificados, CAs, perfiles de emisión, claves, dispositivos, DMS o suscripciones, entre otras."}),`
`,e.jsx(a.p,{children:"La decisión se toma con el contexto de la operación de dominio:"}),`
`,e.jsxs(a.ol,{children:[`
`,e.jsx(a.li,{children:"El middleware extrae la credencial y resuelve los principales coincidentes."}),`
`,e.jsx(a.li,{children:"El endpoint identifica la acción, el tipo de entidad y, cuando corresponde, la clave del recurso solicitado."}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"authz"})," reúne las reglas de entidad de las políticas concedidas."]}),`
`,e.jsx(a.li,{children:"El motor evalúa grants directos, filtros por atributos y relaciones con otras entidades."}),`
`,e.jsx(a.li,{children:"Para una operación individual, comprueba que el recurso concreto satisface el alcance calculado."}),`
`,e.jsx(a.li,{children:"Para un listado, genera un filtro SQL que el servicio añade a su propia consulta."}),`
`]}),`
`,e.jsxs(a.p,{children:["Aquí el motor responde a ",e.jsx(a.strong,{children:"“¿puede esta identidad realizar esta acción sobre este recurso concreto?”"}),"."]}),`
`,e.jsx(a.p,{children:"Las acciones se dividen en dos grupos:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:["Las ",e.jsx(a.strong,{children:"acciones globales"})," no necesitan un identificador de recurso. ",e.jsx(a.code,{children:"create"}),", ",e.jsx(a.code,{children:"import"})," o el acceso a una sección de la interfaz son ejemplos habituales."]}),`
`,e.jsxs(a.li,{children:["Las ",e.jsx(a.strong,{children:"acciones atómicas"})," se evalúan sobre una instancia concreta. En certificados aparecen ",e.jsx(a.code,{children:"read"}),", ",e.jsx(a.code,{children:"metadata-update"}),", ",e.jsx(a.code,{children:"status-update"})," y ",e.jsx(a.code,{children:"delete"}),"; para una CA también existen ",e.jsx(a.code,{children:"sign"}),", ",e.jsx(a.code,{children:"reissue"})," y otras operaciones de ciclo de vida."]}),`
`]}),`
`,e.jsx(a.p,{children:"El filtrado dentro del servicio evita fugas en listados: los recursos no autorizados quedan fuera de la consulta SQL en lugar de recuperarse y ocultarse después en la interfaz."}),`
`,e.jsx(a.h3,{id:"cómo-se-relacionan-ambos-caminos",children:"Cómo se relacionan ambos caminos"}),`
`,e.jsx(a.p,{children:"No son dos controles equivalentes aplicados dos veces. Las reglas HTTP protegen el perímetro de un servicio integrado; las reglas de entidad expresan permisos sobre el modelo de datos de los servicios nativos."}),`
`,e.jsx(a.p,{children:"Una política puede contener ambos tipos de reglas cuando una identidad necesita operar recursos de Lamassu y también llamar a una API integrada. Conceder una regla de entidad no concede automáticamente una acción HTTP, ni una regla HTTP crea acceso sobre una entidad."}),`
`,e.jsx(s,{type:"warn",title:"Denegación por defecto",children:e.jsxs(a.p,{children:["Si ninguna combinación de principal, política y regla permite la operación, Lamassu la deniega. Además, ",e.jsx(a.code,{children:"auth.externalAuthorization.failOpen"})," vale ",e.jsx(a.code,{children:"false"})," por defecto: si ",e.jsx(a.code,{children:"authz"})," no está disponible, el Gateway bloquea las rutas protegidas."]})}),`
`,e.jsx(a.h2,{id:"principales-oidc",children:"Principales OIDC"}),`
`,e.jsx(a.p,{children:"Un principal OIDC coincide con los claims de un JWT validado. Es apropiado para usuarios humanos, grupos corporativos, roles del IdP y cuentas de servicio que obtienen tokens."}),`
`,e.jsxs(a.p,{children:["El siguiente principal representa a cualquier identidad que tenga el rol ",e.jsx(a.code,{children:"pki-operators"})," en Keycloak:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",title:"Principal OIDC por rol",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(a.code,{children:[e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"{"})}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "id"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc:pki-operators"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "name"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "Operadores de PKI"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "description"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "Equipo responsable de la operación diaria"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "type"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "active"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "auth_config"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'    "claims"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" ["})]}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      {"})}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'        "claim"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "realm_access.roles"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'        "operator"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "contains"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'        "value"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "pki-operators"'})]}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      }"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    ]"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"  }"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"}"})})]})})}),`
`,e.jsxs(a.p,{children:["Las rutas de claims pueden estar anidadas, como ",e.jsx(a.code,{children:"realm_access.roles"}),". Dentro de un mismo principal, ",e.jsx(a.strong,{children:"todas"})," las condiciones deben cumplirse. Esto permite exigir, por ejemplo, un grupo y una audiencia organizativa a la vez."]}),`
`,e.jsx(a.p,{children:"Los operadores implementados son:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"equals"}),", para igualdad exacta;"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"contains"}),", para comprobar la pertenencia a una lista o la presencia de texto en un valor escalar."]}),`
`]}),`
`,e.jsxs(a.p,{children:["Diseña la coincidencia con atributos estables. Para personas, suele ser mejor enlazar permisos a grupos o roles gestionados centralmente que al correo o al nombre de usuario. Para una cuenta de servicio, un ",e.jsx(a.code,{children:"sub"})," estable evita que sus permisos se mezclen con los de un operador humano."]}),`
`,e.jsx(s,{type:"warn",title:"No uses matches todavía",children:e.jsxs(a.p,{children:["Aunque el modelo reconoce el nombre de operador ",e.jsx(a.code,{children:"matches"}),", la implementación actual no evalúa expresiones regulares y la condición nunca coincide. Usa ",e.jsx(a.code,{children:"equals"})," o ",e.jsx(a.code,{children:"contains"}),"."]})}),`
`,e.jsx(a.h2,{id:"principales-x509",children:"Principales X.509"}),`
`,e.jsx(a.p,{children:"Un principal X.509 permite reconocer una carga de trabajo o un dispositivo mediante su certificado cliente. Lamassu comprueba la firma del certificado contra la CA configurada y, según el modo, también su número de serie o Common Name."}),`
`,e.jsx(a.p,{children:"Los modos disponibles son:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"serial_and_ca"}),": un certificado exacto, identificado por número de serie y CA;"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"cn_and_ca"}),": un Common Name exacto o con comodines y una CA concreta;"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"any_from_ca"}),": cualquier certificado emitido directamente por la CA indicada."]}),`
`]}),`
`,e.jsxs(a.p,{children:["Este ejemplo reconoce certificados cuyo CN comienza por ",e.jsx(a.code,{children:"factory-a-"})," y que están firmados por la CA configurada:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",title:"Principal X.509 por CN y CA",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(a.code,{children:[e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"{"})}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "id"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "x509:factory-a-devices"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "name"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "Dispositivos de la fábrica A"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "type"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "x509"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "active"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "auth_config"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'    "match_mode"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "cn_and_ca"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'    "subject_cn"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "factory-a-*"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'    "ca_trust"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "pem"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "<certificado-CA-en-PEM-o-base64>"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "identity_type"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "fingerprint"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "value"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "SHA256:<huella-sha256-de-la-ca>"'})]}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    }"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"  }"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"}"})})]})})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.code,{children:"ca_trust.identity_type"})," acepta ",e.jsx(a.code,{children:"fingerprint"})," o ",e.jsx(a.code,{children:"authority_key_id"}),". En ambos casos debes aportar el certificado de la CA en ",e.jsx(a.code,{children:"ca_trust.pem"}),"; Lamassu verifica tanto la firma como la identidad esperada de la CA."]}),`
`,e.jsxs(a.p,{children:["Usa ",e.jsx(a.code,{children:"any_from_ca"})," únicamente cuando todas las identidades emitidas por esa CA deban compartir los mismos permisos. Si una CA emite certificados para poblaciones distintas, separa el acceso por serie o CN, o utiliza CAs de emisión diferentes."]}),`
`,e.jsx(a.h2,{id:"cuando-coinciden-varios-principales",children:"Cuando coinciden varios principales"}),`
`,e.jsx(a.p,{children:"Una misma credencial puede coincidir con más de un principal. Es habitual que un usuario coincida con un principal de su equipo y con otro de su función operativa."}),`
`,e.jsx(a.p,{children:"Para permisos de entidad, Lamassu combina los permisos con lógica OR: basta con que una de las políticas de uno de los principales permita la acción. Los listados contienen la unión de los recursos visibles para todos ellos."}),`
`,e.jsx(a.p,{children:"Las rutas HTTP con restricciones son más estrictas. El mismo principal que aporta la política debe satisfacer también los atributos exigidos por la ruta. Lamassu no combina la política de un principal con un atributo perteneciente a otro."}),`
`,e.jsx(a.p,{children:"Por esta razón, añadir un principal coincidente solo puede ampliar el acceso. Antes de crear reglas solapadas, revisa el conjunto completo de políticas que recibirá una identidad real."}),`
`,e.jsx(a.h2,{id:"cómo-expresan-acceso-las-políticas",children:"Cómo expresan acceso las políticas"}),`
`,e.jsx(a.h3,{id:"acceso-global-y-acceso-directo",children:"Acceso global y acceso directo"}),`
`,e.jsxs(a.p,{children:["Una regla identifica el dominio (",e.jsx(a.code,{children:"namespace"}),"), el esquema de datos (",e.jsx(a.code,{children:"schema_name"}),") y el tipo de entidad (",e.jsx(a.code,{children:"entity_type"}),"). ",e.jsx(a.code,{children:"actions"})," enumera las operaciones permitidas."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.code,{children:"direct_grants"})," limita la regla a identificadores concretos. El valor ",e.jsx(a.code,{children:"*"})," abarca todas las instancias del tipo. Una política de superadministrador utiliza comodines en esquema, entidad, acciones y grants; una política de mínimo privilegio debe evitarlos siempre que sea posible."]}),`
`,e.jsx(a.h3,{id:"acceso-heredado-por-relaciones",children:"Acceso heredado por relaciones"}),`
`,e.jsx(a.p,{children:"Las reglas pueden seguir relaciones declaradas entre entidades. Por ejemplo, el esquema conoce la relación de un certificado con su CA emisora y la de un dispositivo con su DMS. Una política puede conceder acceso a un recurso padre y propagar acciones seleccionadas hacia sus recursos relacionados."}),`
`,e.jsx(a.p,{children:"Esto permite expresar modelos como “puede operar los dispositivos de este DMS” sin mantener una lista individual de cada dispositivo. Cuando se añade un recurso bajo esa relación, hereda el alcance previsto por la política."}),`
`,e.jsx(a.h3,{id:"acceso-filtrado-por-atributos",children:"Acceso filtrado por atributos"}),`
`,e.jsxs(a.p,{children:[e.jsx(a.code,{children:"column_filters"})," aplica condiciones a columnas que el esquema haya declarado como filtrables. Todos los filtros de una misma regla se combinan con AND."]}),`
`,e.jsx(a.p,{children:"Por ejemplo, esta regla permite leer certificados activos emitidos por una CA concreta:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",title:"Regla limitada por atributos",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(a.code,{children:[e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"{"})}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "namespace"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "pki"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "schema_name"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "ca"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "entity_type"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "certificate"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "actions"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" ["}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"read"'}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"]"}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "relations"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" []"}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "column_filters"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" ["})]}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    {"})}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "column"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "status"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "type"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "string"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "operator"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "eq"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "value"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "ACTIVE"'})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    }"}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    {"})}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "column"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "issuer_meta_id"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "type"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "string"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "operator"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "eq"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "value"'}),e.jsx(a.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "ca-production"'})]}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    }"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"  ]"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"}"})})]})})}),`
`,e.jsxs(a.p,{children:["Los operadores disponibles son ",e.jsx(a.code,{children:"eq"}),", ",e.jsx(a.code,{children:"neq"}),", ",e.jsx(a.code,{children:"gt"}),", ",e.jsx(a.code,{children:"gte"}),", ",e.jsx(a.code,{children:"lt"}),", ",e.jsx(a.code,{children:"lte"}),", ",e.jsx(a.code,{children:"in"})," y ",e.jsx(a.code,{children:"like"}),". Usa comparaciones coherentes con el tipo de columna: ",e.jsx(a.code,{children:"like"})," para texto, comparaciones de orden para números o fechas y ",e.jsx(a.code,{children:"in"})," cuando haya una colección de valores aceptados."]}),`
`,e.jsx(a.h3,{id:"reglas-http",children:"Reglas HTTP"}),`
`,e.jsx(a.p,{children:"Las reglas HTTP no apuntan directamente a tablas. Referencian un esquema de rutas y conceden sus acciones lógicas. Las políticas del Job Manager son un ejemplo: distinguen lectura, creación, actualización y eliminación de workflows o jobs."}),`
`,e.jsxs(a.p,{children:["Algunas rutas también comparan un valor de la petición —extraído de la ruta, query, cabecera o cuerpo JSON— con un atributo normalizado del principal. Así puede verificarse que un dispositivo solo consulte trabajos dirigidos a su propio ",e.jsx(a.code,{children:"client_id"}),"."]}),`
`,e.jsxs(a.p,{children:["Los atributos normalizados desacoplan la política del mecanismo de autenticación. ",e.jsx(a.code,{children:"subject_attribute_mappings"})," puede derivar, por ejemplo, ",e.jsx(a.code,{children:"device_id"})," desde ",e.jsx(a.code,{children:"oidc.claim.device_id"})," o desde ",e.jsx(a.code,{children:"x509.subject.cn"}),". La regla consume ",e.jsx(a.code,{children:"device_id"})," en ambos casos."]}),`
`,e.jsx(a.h2,{id:"políticas-incluidas",children:"Políticas incluidas"}),`
`,e.jsxs(a.p,{children:["La precarga de ",e.jsx(a.code,{children:"authz"})," instala políticas reutilizables para los dominios principales. Entre ellas se encuentran:"]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"acceso completo y de solo lectura a certificados y autoridades;"}),`
`,e.jsx(a.li,{children:"acceso completo y de solo lectura a KMS;"}),`
`,e.jsx(a.li,{children:"acceso completo y de solo lectura a Device Manager, DMS Manager, Validation Authority y alertas;"}),`
`,e.jsxs(a.li,{children:["una política ",e.jsx(a.code,{children:"Auditor"})," de lectura de PKI y visibilidad de autorización;"]}),`
`,e.jsx(a.li,{children:"acceso a la interfaz;"}),`
`,e.jsx(a.li,{children:"políticas de administración y observación para las APIs NBI y SBI del Job Manager;"}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"SUPER ADMIN"}),", que concede todas las acciones sobre los dominios ",e.jsx(a.code,{children:"authz"})," y ",e.jsx(a.code,{children:"pki"}),"."]}),`
`]}),`
`,e.jsxs(a.p,{children:["Empieza por estas políticas antes de crear otras. Si ninguna refleja el límite que necesitas, crea una política específica y pequeña en lugar de copiar ",e.jsx(a.code,{children:"SUPER ADMIN"})," y retirar permisos de forma informal."]}),`
`,e.jsx(a.h2,{id:"provisiona-el-primer-administrador",children:"Provisiona el primer administrador"}),`
`,e.jsx(s,{type:"warn",title:"No existe un superusuario implícito",children:e.jsx(a.p,{children:"Una instalación sin un principal que coincida con tu identidad queda sin nadie capaz de administrar la autorización. Configura el IdP y el bootstrap antes de exponer la plataforma."})}),`
`,e.jsxs(a.p,{children:["El chart incluye un principal de bootstrap que busca el rol OIDC ",e.jsx(a.code,{children:"pki-admin"})," en ",e.jsx(a.code,{children:"realm_access.roles"}),". Le concede ",e.jsx(a.code,{children:"SUPER ADMIN"})," y, cuando Job Manager está habilitado, la política administrativa de su API NBI."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",title:"values.yaml",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(a.code,{children:[e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"auth"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  authorization"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    rolesClaim"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" realm_access.roles"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    roles"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      admin"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki-admin"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  externalAuthorization"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    enabled"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:" true"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    failOpen"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:" false"})]}),`
`,e.jsx(a.span,{className:"line"}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"services"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  authz"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    jwkUrl"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" https://idp.example.com/realms/iot/protocol/openid-connect/certs"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    bootstrap"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      - "}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"principal_id"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc:pki-admin"'})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_name"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "PKI Admin"'})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_type"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc"'})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        policy_ids"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"          # SUPER ADMIN"})}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"          - "}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"'})]}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"          # Job Manager - Mgmt NBI Admin"})}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"          - "}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"lamassu.7df018c1-3140-4a35-9067-2e7d6cec3ed2"'})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        auth_config"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"          claims"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"            - "}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"claim"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "realm_access.roles"'})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              operator"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "contains"'})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              value"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "pki-admin"'})]})]})})}),`
`,e.jsxs(a.p,{children:["El Job Helm de preinstalación y preactualización ejecuta las migraciones de ",e.jsx(a.code,{children:"authz"}),", precarga las políticas y crea los principales de bootstrap antes de iniciar los servicios. Si el principal ya existe, no lo reemplaza: añade únicamente los grants configurados que todavía falten. Puedes conservar la entrada en ",e.jsx(a.code,{children:"values.yaml"})," durante las actualizaciones."]}),`
`,e.jsxs(r,{children:[e.jsxs(n,{children:[e.jsx(a.h3,{id:"prepara-el-proveedor-de-identidad",children:"Prepara el proveedor de identidad"}),e.jsxs(a.p,{children:["Crea el rol o grupo que utilizarás para recuperar y administrar Lamassu. Asígnalo al menos a dos identidades humanas controladas. Si tu proveedor no usa ",e.jsx(a.code,{children:"realm_access.roles"}),", adapta la ruta del claim tanto en el frontend como en ",e.jsx(a.code,{children:"auth_config.claims"}),"."]})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"configura-las-dos-validaciones-jwt",children:"Configura las dos validaciones JWT"}),e.jsxs(a.p,{children:["El Gateway utiliza ",e.jsx(a.code,{children:"auth.authentication.apiGateway.jwks"})," para autenticar peticiones. ",e.jsx(a.code,{children:"authz"})," utiliza ",e.jsx(a.code,{children:"services.authz.jwkUrl"})," para resolver los principales OIDC. Ambos endpoints deben contener las claves del mismo emisor y ser alcanzables desde sus respectivos componentes."]})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"instala-y-verifica-el-acceso-administrativo",children:"Instala y verifica el acceso administrativo"}),e.jsxs(a.p,{children:["Inicia sesión con una identidad que tenga ",e.jsx(a.code,{children:"pki-admin"}),". Confirma que puede acceder a la administración de autorización y realizar una operación de lectura no destructiva."]})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"prueba-una-identidad-sin-privilegios",children:"Prueba una identidad sin privilegios"}),e.jsxs(a.p,{children:["Usa un segundo usuario sin el rol y confirma que la misma operación queda denegada. Esta prueba detecta claims mal interpretados, políticas demasiado amplias y configuraciones ",e.jsx(a.code,{children:"failOpen"})," accidentales."]})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"reduce-el-uso-del-administrador-de-bootstrap",children:"Reduce el uso del administrador de bootstrap"}),e.jsxs(a.p,{children:["Crea principales operativos con políticas de menor alcance. Reserva ",e.jsx(a.code,{children:"pki-admin"})," para administración de autorización y recuperación, no para el trabajo diario."]})]})]}),`
`,e.jsx(a.h2,{id:"bootstrap-de-fastlane",children:"Bootstrap de Fastlane"}),`
`,e.jsxs(a.p,{children:["Fastlane instala un realm de Keycloak para laboratorio y crea el usuario ",e.jsx(a.code,{children:"lamassu"})," con contraseña temporal ",e.jsx(a.code,{children:"lamassu"}),", rol ",e.jsx(a.code,{children:"pki-admin"})," y cambio de contraseña obligatorio. Su principal de bootstrap coincide mediante ",e.jsx(a.code,{children:"preferred_username=lamassu"}),"."]}),`
`,e.jsx(s,{type:"warn",title:"Credenciales solo para bootstrap",children:e.jsx(a.p,{children:"Cambia la contraseña en el primer acceso. No reutilices el usuario, la contraseña ni el IdP de Fastlane como diseño de producción."})}),`
`,e.jsx(a.h2,{id:"diseña-roles-de-mínimo-privilegio",children:"Diseña roles de mínimo privilegio"}),`
`,e.jsx(a.p,{children:"Evita reproducir la estructura interna de tu empresa con decenas de políticas casi idénticas. Empieza por las responsabilidades que realmente necesitan acceso:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Administración de autorización"}),": gestiona principales, políticas y grants. Debe pertenecer a un grupo pequeño y separado."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Operación de PKI"}),": administra CAs, perfiles y certificados, pero no necesariamente puede modificar quién obtiene acceso."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Registro de dispositivos"}),": opera dispositivos y DMS sin recibir permisos sobre claves o configuración de autorización."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Auditoría"}),": consulta configuración y actividad sin crear, modificar, firmar, revocar ni eliminar."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Automatización"}),": utiliza una cuenta técnica o certificado independiente, con permisos limitados al flujo y recursos que controla."]}),`
`]}),`
`,e.jsxs(a.p,{children:["Para cada rol, separa “ver” de “cambiar”, limita los recursos mediante grants, relaciones o atributos y evita ",e.jsx(a.code,{children:"*"})," salvo que el rol deba abarcar futuras acciones automáticamente."]}),`
`,e.jsx(s,{type:"info",title:"Los comodines también conceden acciones futuras",children:e.jsxs(a.p,{children:["Una regla con ",e.jsx(a.code,{children:'actions: ["*"]'})," se expande a todas las acciones definidas por el esquema. Cuando una versión nueva añade una acción, una política con comodín puede empezar a concederla. Revisa estas políticas durante cada actualización."]})}),`
`,e.jsx(a.h2,{id:"cambios-y-revocación-de-acceso",children:"Cambios y revocación de acceso"}),`
`,e.jsx(a.p,{children:"Para retirar acceso de inmediato, desactiva el principal o revoca sus grants. Desactivar un principal conserva su configuración y asociaciones para investigación o restauración, pero deja de participar en la coincidencia."}),`
`,e.jsx(a.p,{children:"Eliminar un rol o grupo en el IdP evita que nuevos tokens contengan el claim, pero un token ya emitido puede seguir siendo válido hasta expirar. Si la retirada es urgente, combina el cambio en el IdP con la desactivación del principal en Lamassu y la revocación de sesiones o tokens en el proveedor."}),`
`,e.jsx(a.p,{children:"Cuando edites una política compartida, recuerda que el cambio afecta a todos sus principales. Para probar un nuevo alcance, crea una política separada, concédela a una identidad de prueba y valida operaciones permitidas y denegadas antes de sustituir la anterior."}),`
`,e.jsx(a.h2,{id:"lista-de-comprobación-operativa",children:"Lista de comprobación operativa"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:["Mantén ",e.jsx(a.code,{children:"failOpen: false"})," salvo que una evaluación de riesgo documentada justifique lo contrario."]}),`
`,e.jsx(a.li,{children:"Usa grupos o roles estables para personas e identidades independientes para automatizaciones."}),`
`,e.jsx(a.li,{children:"Conserva al menos dos administradores de recuperación y prueba su acceso periódicamente."}),`
`,e.jsx(a.li,{children:"Revisa los principales activos, sus coincidencias y sus grants después de cambios en el IdP."}),`
`,e.jsx(a.li,{children:"Busca comodines en políticas antes de actualizar Lamassu."}),`
`,e.jsx(a.li,{children:"Prueba siempre una operación permitida y otra denegada para cada rol."}),`
`,e.jsxs(a.li,{children:["Correlaciona los cambios de principales, políticas y grants con los ",e.jsx(a.a,{href:"/docs/platform/pki/audit-logs",children:"registros de auditoría"}),"."]}),`
`]}),`
`,e.jsx(a.h2,{id:"diagnóstico",children:"Diagnóstico"}),`
`,e.jsx(a.h3,{id:"la-respuesta-es-401",children:"La respuesta es 401"}),`
`,e.jsx(a.p,{children:"La autenticación falló antes de evaluar permisos. Comprueba la firma y expiración del JWT, el emisor, la audiencia y la disponibilidad del JWKS configurado en el Gateway. Para X.509, revisa que el certificado cliente llegue hasta el punto que extrae la credencial."}),`
`,e.jsx(a.h3,{id:"la-respuesta-es-403",children:"La respuesta es 403"}),`
`,e.jsx(a.p,{children:"La credencial pudo procesarse, pero no produjo una autorización positiva. Revisa en este orden:"}),`
`,e.jsxs(a.ol,{children:[`
`,e.jsx(a.li,{children:"que exista un principal activo del tipo correcto;"}),`
`,e.jsx(a.li,{children:"que las rutas de claims y sus valores coincidan exactamente con el token real;"}),`
`,e.jsx(a.li,{children:"que todas las condiciones del principal se cumplan;"}),`
`,e.jsx(a.li,{children:"que el principal tenga concedida la política esperada;"}),`
`,e.jsx(a.li,{children:"que la política incluya la acción y el tipo de recurso o ruta solicitados;"}),`
`,e.jsx(a.li,{children:"que el identificador, relación, filtro de columna o restricción HTTP incluya el recurso real."}),`
`]}),`
`,e.jsxs(a.p,{children:["En los logs de ",e.jsx(a.code,{children:"authz"}),", una decisión del endpoint externo incluye ",e.jsx(a.code,{children:"allowed"}),", ",e.jsx(a.code,{children:"reason"}),", ",e.jsx(a.code,{children:"matched_principals"}),", ",e.jsx(a.code,{children:"evaluated_policy_ids"}),", ",e.jsx(a.code,{children:"matched_policy_id"})," y el código de estado. Estos campos permiten separar un fallo de coincidencia de un fallo de permisos."]}),`
`,e.jsx(a.h3,{id:"todo-devuelve-403",children:"Todo devuelve 403"}),`
`,e.jsxs(a.p,{children:["Comprueba que el principal de bootstrap fue creado y que las políticas fueron precargadas por el Job de migración. Verifica también que ",e.jsx(a.code,{children:"services.authz.jwkUrl"})," sea alcanzable desde el pod de ",e.jsx(a.code,{children:"authz"}),"; no asumas que una URL pública accesible desde el navegador también funciona dentro del clúster."]}),`
`,e.jsx(a.h3,{id:"todo-falla-cuando-authz-no-está-disponible",children:"Todo falla cuando authz no está disponible"}),`
`,e.jsxs(a.p,{children:["Es el comportamiento esperado con ",e.jsx(a.code,{children:"failOpen: false"}),". Restaura el servicio, su conexión con PostgreSQL y su conectividad con el JWKS. No cambies temporalmente a ",e.jsx(a.code,{children:"failOpen: true"})," sin aceptar que las rutas protegidas podrían quedar accesibles sin decisión de autorización."]}),`
`,e.jsxs(a.p,{children:["Continúa con ",e.jsx(a.a,{href:"/docs/platform/pki/audit-logs",children:"Registros de auditoría"})," para investigar cambios de configuración o con ",e.jsx(a.a,{href:"/docs/platform/pki/troubleshooting",children:"Resolución de problemas"})," para diagnosticar el despliegue."]})]})}function h(i={}){const{wrapper:a}=i.components||{};return a?e.jsx(a,{...i,children:e.jsx(c,{...i})}):c(i)}function o(i,a){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{d as _markdown,h as default,t as frontmatter,p as structuredData,u as toc};
