import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let t=`

Despliegue self-managed con Kubernetes [#despliegue-self-managed-con-kubernetes]

Lamassu IoT puede desplegarse en infraestructura propia mediante **Kubernetes**, tanto en clústeres gestionados internamente como en entornos self-managed.

La referencia principal para este despliegue es el repositorio \`lamassu-helm\`, que incluye:

* el chart principal de Lamassu
* un chart auxiliar de SoftHSM
* el script de despliegue automatizado \`scripts/lamassu-fast-lane.sh\`

Quickstart [#quickstart]

Si lo que necesitas es levantar un entorno funcional lo antes posible, la vía más rápida es usar Fastlane desde el repositorio \`lamassu-helm\`:

\`\`\`bash
git clone https://github.com/lamassuiot/lamassu-helm.git
cd lamassu-helm
./scripts/lamassu-fast-lane.sh -n -ns lamassu-dev -d dev.lamassu.io -l ./charts/lamassu
\`\`\`

Ese flujo:

* crea o reutiliza el namespace indicado
* instala PostgreSQL, Keycloak y RabbitMQ
* despliega el chart de Lamassu
* deja la UI expuesta en \`https://<dominio>\`

Si buscas un despliegue productivo o más controlado, sigue con la instalación manual mediante Helm que se describe más abajo.

Qué se despliega [#qué-se-despliega]

El chart principal \`charts/lamassu\`, actualmente en la <del className="lm-diff-del">serie \`3.7.x\`</del><ins className="lm-diff-ins">versión \`4.0.0\`</ins>, despliega estos componentes:

* \`ui\`
* \`ca\`
* \`va\`
* \`kms\`
* \`device-manager\`
* \`dms-manager\`
* \`alerts\`
* \`authz\`, el servicio de autorización que decide qué peticiones del Gateway están permitidas
* \`wfx\`, el servicio de flujos de trabajo Siemens WFX, expuesto bajo \`/api/wfx/\`
* recursos de Gateway API y políticas de Envoy Gateway
* job de migraciones de base de datos

Requisitos previos [#requisitos-previos]

* Clúster Kubernetes \`1.19+\`
* Clúster Kubernetes \`1.24+\`. El chart declara \`kubeVersion: ">=1.24.0-0"\`, por lo que Helm rechaza la instalación en versiones anteriores. La integración con HSM mediante \`services.kms.pkcs11Sidecar\` requiere además Kubernetes \`1.29+\`, por su dependencia de los sidecars nativos de init container.
* \`kubectl\` configurado con acceso al clúster
* Helm \`3.2.0+\`
* \`cert-manager 1.14+\` para la gestión de certificados cuando se usa \`tls.type=certManager\`
* <del className="lm-diff-del">\`Envoy Gateway 1.3.0+\`</del><ins className="lm-diff-ins">\`Envoy Gateway v1.8.0+\`</ins>, ya que el chart publica servicios mediante Gateway API y no mediante Ingress<ins className="lm-diff-ins">. La autorización externa (\`auth.externalAuthorization.path\`) exige esta versión.</ins>
* Acceso <del className="lm-diff-del">a un</del><ins className="lm-diff-ins">al</ins> registro de contenedores <del className="lm-diff-del">o imágenes previamente importadas si se trabaja en modo offline</del><ins className="lm-diff-ins">de Lamassu, o a un registro espejo propio, desde los nodos del clúster</ins>
* Almacenamiento persistente disponible para PostgreSQL, RabbitMQ, VA y KMS

Opciones de despliegue [#opciones-de-despliegue]

Hay dos formas de desplegar Lamassu on-prem:

1. Despliegue manual con Helm [#1-despliegue-manual-con-helm]

Es la opción recomendada para entornos productivos o controlados, donde PostgreSQL, RabbitMQ, Keycloak, certificados y direccionamiento del Gateway ya están definidos por el equipo de plataforma.

2. Despliegue automatizado con Fastlane [#2-despliegue-automatizado-con-fastlane]

Es la opción más útil para pruebas, demos, CI o bootstrap rápido de un entorno. Fastlane levanta PostgreSQL, Keycloak, RabbitMQ y Lamassu en un único flujo. Su comportamiento está documentado en la página siguiente.

Arquitectura [#arquitectura]

Lamassu IoT se despliega como un conjunto de microservicios Kubernetes independientes. El chart principal crea \`Deployment\`, \`StatefulSet\`, \`Service\`, \`ConfigMap\`, \`HTTPRoute\`, \`Gateway\`, certificados y recursos auxiliares según los valores definidos.

Dependencias externas requeridas por el chart principal:

* PostgreSQL
* RabbitMQ
* proveedor OIDC, típicamente Keycloak

El chart no instala estas dependencias por sí solo. Para un despliegue manual hay que provisionarlas antes. Si se busca un entorno funcional rápido para laboratorio o validación, el script Fastlane sí instala PostgreSQL, RabbitMQ y Keycloak además del chart de Lamassu.

Instalación manual con Helm [#instalación-manual-con-helm]

Agregar el repositorio Helm:

\`\`\`bash
helm repo add lamassu https://lamassuiot.github.io/lamassu-helm
helm repo update
\`\`\`

O instalar desde una copia local del repositorio:

\`\`\`bash
helm install lamassu ./charts/lamassu -n lamassu --create-namespace -f values.yaml
\`\`\`

Valores mínimos que deben definirse [#valores-mínimos-que-deben-definirse]

Los valores por defecto del chart son deliberadamente incompletos para dependencias externas. Como mínimo, un despliegue manual debe definir:

* \`postgres.hostname\`, \`postgres.username\`, \`postgres.password\`
* \`amqp.hostname\`, \`amqp.username\`, \`amqp.password\`
* \`auth.oidc.frontend.authority\`
* \`auth.oidc.apiGateway.jwks\`
* \`services.authz.jwkUrl\` y un principal de bootstrap que coincida con un administrador real
* \`services.ca.domains\`
* \`gateway.addresses\` o una estrategia equivalente de publicación según el clúster
* \`tls.*\` según se use \`certManager\` o certificado externo

Ejemplo base:

<div className="lm-diff-final">
  \`\`\`yaml
  postgres:
    hostname: postgresql
    port: 5432
    username: lamassu
    password: change-me

  amqp:
    hostname: rabbitmq
    port: 5672
    username: lamassu
    password: change-me
    tls: false

  tls:
    type: certManager
    certManagerOptions:
      issuer: ""
      certSpec:
        commonName: pki.example.internal
        hostnames:
          - pki.example.internal
        addresses:
          - 10.0.0.20

  gateway:
    addresses:
      - 10.0.0.20
    ports:
      http: 80
      https: 443
    extraRouting:
      - path: /auth
        name: auth
        target:
          host: auth-keycloak
          port: 8080

  auth:
    oidc:
      frontend:
        clientId: frontend
        authority: https://pki.example.internal/auth/realms/lamassu
      apiGateway:
        jwks:
          - name: oidc-authn
            uri: http://auth-keycloak.lamassu/auth/realms/lamassu/protocol/openid-connect/certs
    authorization:
      rolesClaim: realm_access.roles
      roles:
        admin: pki-admin

  services:
    ca:
      domains:
        - pki.example.internal
    authz:
      jwkUrl: http://auth-keycloak.lamassu/auth/realms/lamassu/protocol/openid-connect/certs
      bootstrap:
        - principal_id: "oidc:pki-admin"
          principal_name: "PKI Admin"
          principal_type: "oidc"
          policy_ids:
            - "lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"
          auth_config:
            claims:
              - claim: realm_access.roles
                operator: contains
                value: pki-admin
  \`\`\`
</div>

<div className="lm-diff-merged">
  \`\`\`yaml lmdiff="================-+==================================================="
  postgres:
    hostname: postgresql
    port: 5432
    username: lamassu
    password: change-me

  amqp:
    hostname: rabbitmq
    port: 5672
    username: lamassu
    password: change-me
    tls: false

  tls:
    type: certManager
    certManagerOptions:
      issuer: downstream-ca-selfsigned-issuer
      issuer: ""
      certSpec:
        commonName: pki.example.internal
        hostnames:
          - pki.example.internal
        addresses:
          - 10.0.0.20

  gateway:
    addresses:
      - 10.0.0.20
    ports:
      http: 80
      https: 443
    extraRouting:
      - path: /auth
        name: auth
        target:
          host: auth-keycloak
          port: 8080

  auth:
    oidc:
      frontend:
        clientId: frontend
        authority: https://pki.example.internal/auth/realms/lamassu
      apiGateway:
        jwks:
          - name: oidc-authn
            uri: http://auth-keycloak.lamassu/auth/realms/lamassu/protocol/openid-connect/certs
    authorization:
      rolesClaim: realm_access.roles
      roles:
        admin: pki-admin

  services:
    ca:
      domains:
        - pki.example.internal
    authz:
      jwkUrl: http://auth-keycloak.lamassu/auth/realms/lamassu/protocol/openid-connect/certs
      bootstrap:
        - principal_id: "oidc:pki-admin"
          principal_name: "PKI Admin"
          principal_type: "oidc"
          policy_ids:
            - "lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"
          auth_config:
            claims:
              - claim: realm_access.roles
                operator: contains
                value: pki-admin
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Con \`tls.certManagerOptions.issuer\` vacío, el chart \`4.0.0\` crea un \`Issuer\` self-signed con nombre dependiente del release (por ejemplo, \`lamassu-downstream-ca-selfsigned-issuer\` con \`helm install lamassu\`). El valor legado \`downstream-ca-selfsigned-issuer\` sigue resolviendo al mismo emisor, pero se recomienda dejarlo vacío o apuntar a tu propio \`Issuer\`/\`ClusterIssuer\` mediante \`tls.certManagerOptions.clusterIssuer\`.
</div>

Provisiona el primer administrador [#provisiona-el-primer-administrador]

No hay un superusuario implícito. Antes de instalar, crea el rol \`pki-admin\` en el proveedor OIDC y asígnalo al grupo que administrará Lamassu. El principal del ejemplo concede la política \`SUPER ADMIN\` a cualquier token que contenga ese rol.

El Job \`pre-install\` y \`pre-upgrade\` prepara las bases de datos, ejecuta las migraciones de authz, precarga las políticas y aplica \`services.authz.bootstrap\` antes de que arranquen los Deployments. El bootstrap es idempotente: conserva los principales existentes y añade únicamente los grants que falten.

<Callout type="warn" title="Valida el acceso antes de exponer la plataforma">
  Si ningún token coincide con un principal activo, nadie podrá administrar la PKI. Prueba una identidad autorizada y otra denegada, y conserva un procedimiento de recuperación.
</Callout>

Consulta [Control de acceso](/docs/platform/pki/access-control) para diseñar principales y políticas.

Áreas de configuración más relevantes [#áreas-de-configuración-más-relevantes]

* **TLS:** \`tls.type\`, \`tls.certManagerOptions.*\` y \`tls.externalOptions.secretName\` controlan el certificado *downstream* del Gateway.
* **Gateway:** \`gateway.addresses\`, \`gateway.ports.*\`<del className="lm-diff-del"> </del><ins className="lm-diff-ins">, \`gateway.className\` </ins>y \`gateway.extraRouting\` publican la UI y las APIs mediante Envoy Gateway<ins className="lm-diff-ins">. \`gateway.responseOverride\` reescribe las respuestas \`401\`/\`403\` con cuerpos JSON propios (habilitado por defecto)</ins>.
* **Persistencia:** \`postgres.*\` define la conexión a PostgreSQL.
* **Mensajería:** \`amqp.*\` configura la conexión a RabbitMQ.
* **Identidad y autorización:** \`auth.oidc.*\`, <ins className="lm-diff-ins">\`auth.externalAuthorization.*\`, </ins>\`services.authz.jwkUrl\` y \`services.authz.bootstrap\` configuran login, validación JWT<del className="lm-diff-del"> y</del><ins className="lm-diff-ins">, el control de acceso en el Gateway y los</ins> permisos iniciales.
* **Autoridades:** \`services.ca.domains\` establece los dominios autorizados para CA y certificados.
* **Claves:** \`services.kms.cryptoEngines.*\` configura los motores criptográficos y su almacenamiento.
* **Alertas:** \`services.alerts.smtp_server.*\` prepara el envío de correo.
* **Observabilidad:** \`observability.*\` habilita la instrumentación OpenTelemetry (trazas y logs) en todos los servicios.

Verificación del despliegue [#verificación-del-despliegue]

El chart incluye una prueba Helm en \`charts/lamassu/templates/tests/test-connections.yml\`. Tras instalarlo, puede validarse con:

\`\`\`bash
helm test lamassu -n lamassu
\`\`\`

<div className="lm-diff-del lm-diff-block">
  La prueba comprueba al menos:
</div>

<div className="lm-diff-del lm-diff-block">
  * salud de \`ca\`
  * salud de \`dms-manager\`
  * salud de \`device-manager\`
  * salud de \`va\`
  * respuesta HTML esperada del servicio \`ui\`
</div>

<div className="lm-diff-ins lm-diff-block">
  La prueba lanza un pod efímero llamado \`<release>-connectivity-test\` (imagen configurable con \`connectivityTest.image\`) que comprueba el endpoint \`/health\` de \`ca\`, \`dms-manager\`, \`device-manager\` y \`va\`, y que la respuesta del servicio \`ui\` contiene el título \`LamassuIoT Certificate Manager\`.
</div>

Repositorio Helm [#repositorio-helm]

El repositorio \`lamassu-helm\` está organizado en tres bloques principales:

* \`charts/lamassu\`: chart principal de Lamassu
* \`charts/softhsm\`: chart opcional para laboratorios o escenarios de integración con PKCS#11 emulado
* \`scripts/lamassu-fast-lane.sh\`: automatización para levantar dependencias y desplegar Lamassu con intervención mínima

SoftHSM como complemento opcional [#softhsm-como-complemento-opcional]

El chart \`charts/softhsm\` no forma parte del despliegue estándar, pero resulta útil en entornos de laboratorio cuando se necesita simular un HSM compatible con PKCS#11. No sustituye <del className="lm-diff-del">al backend KMS principal</del><ins className="lm-diff-ins">a un HSM real en producción</ins>; sirve como soporte para pruebas o integraciones concretas.

<div className="lm-diff-ins lm-diff-block">
  En la versión \`4.0.0\` del chart, el servicio KMS puede consumir ese token PKCS#11 mediante el sidecar \`services.kms.pkcs11Sidecar\`, que expone el socket PKCS#11 en un volumen compartido del pod (requiere Kubernetes \`1.29+\`). El script Fastlane automatiza la integración completa con \`--with-hsm\` (ver [Fastlane](/docs/deployment/self-hosted/fastlane)).
</div>

<div className="lm-diff-ins lm-diff-block">
  Actualizar desde 3.8.x [#actualizar-desde-38x]
</div>

<div className="lm-diff-ins lm-diff-block">
  La versión \`4.0.0\` del chart introduce cambios que rompen la compatibilidad con los despliegues \`3.8.x\`. La guía completa está en [\`charts/lamassu/CHANGELOG/3.8.0->4.0.0.md\`](https://github.com/lamassuiot/lamassu-helm/blob/main/charts/lamassu/CHANGELOG/3.8.0->4.0.0.md) del repositorio \`lamassu-helm\`. Los puntos que más afectan a un despliegue manual:
</div>

<div className="lm-diff-ins lm-diff-block">
  * **Nombres dependientes del release:** los recursos del chart pasan a llamarse \`<release>-<componente>\` (por ejemplo, \`lamassu-kms\`) en lugar de usar nombres fijos. Los PVC de KMS y VA cambian de nombre; si usas motores KMS con almacenamiento en sistema de ficheros o el \`fileStore\` local de VA, los datos requieren una migración manual descrita en la guía del CHANGELOG: tras \`helm upgrade\`, los StatefulSets nuevos arrancan con PVC vacíos y hay que copiar el contenido con un pod de ayuda (\`alpine:3.20\`) ajustando la propiedad a \`65532:65532\`. Si es una instalación nueva o no usas esos backends, no hay nada que migrar.
  * **\`services.authz\` es obligatorio:** el nuevo servicio de autorización no existía en \`3.8.0\`. El Job de migraciones crea sus esquemas y precarga políticas, pero no crea la base de datos \`pki\`; provisiona esa base de datos y concede acceso al usuario de Lamassu antes de actualizar.
  * **Validación estricta de valores:** el chart incorpora \`values.schema.json\` y rechaza claves de nivel superior desconocidas. Elimina bloques obsoletos (por ejemplo, \`toolbox\`) antes de ejecutar \`helm upgrade\`.
  * **\`services.connectors\` ahora es un mapa:** cada entrada se indexa por el identificador del conector y debe definir \`type\` e \`image\`.
  * **Por defecto más seguros:** los pods pasan a ejecutarse como usuario no root \`65532:65532\`, sin montaje del token del service account, con seccomp \`RuntimeDefault\` y capacidades eliminadas. Las sobrecargas por servicio de \`runAsUser\`/\`runAsGroup\` se han eliminado.
  * **\`toolbox\` pasa a \`connectivityTest\`:** el contenedor auxiliar de verificación de conectividad se configura en \`connectivityTest.image\`.
</div>

Versionado y migraciones [#versionado-y-migraciones]

La versión actual del chart en el repositorio es <del className="lm-diff-del">\`3.8.0\`</del><ins className="lm-diff-ins">\`4.0.0\`</ins>. Para upgrades entre versiones, consulta las guías de \`charts/lamassu/CHANGELOG/\` y revisa especialmente las migraciones de base de datos y el bootstrap de authz.
`,d={title:"Kubernetes self-managed",description:"Despliega Lamassu en tu propio clúster Kubernetes con Helm o Fastlane."},c={isNew:!1,changes:25,title:void 0,description:void 0},o={contents:[{heading:"despliegue-self-managed-con-kubernetes",content:"Lamassu IoT puede desplegarse en infraestructura propia mediante **Kubernetes**, tanto en clústeres gestionados internamente como en entornos self-managed."},{heading:"despliegue-self-managed-con-kubernetes",content:"La referencia principal para este despliegue es el repositorio `lamassu-helm`, que incluye:"},{heading:"despliegue-self-managed-con-kubernetes",content:"el chart principal de Lamassu"},{heading:"despliegue-self-managed-con-kubernetes",content:"un chart auxiliar de SoftHSM"},{heading:"despliegue-self-managed-con-kubernetes",content:"el script de despliegue automatizado `scripts/lamassu-fast-lane.sh`"},{heading:"quickstart",content:"Si lo que necesitas es levantar un entorno funcional lo antes posible, la vía más rápida es usar Fastlane desde el repositorio `lamassu-helm`:"},{heading:"quickstart",content:"Ese flujo:"},{heading:"quickstart",content:"crea o reutiliza el namespace indicado"},{heading:"quickstart",content:"instala PostgreSQL, Keycloak y RabbitMQ"},{heading:"quickstart",content:"despliega el chart de Lamassu"},{heading:"quickstart",content:"deja la UI expuesta en `https://<dominio>`"},{heading:"quickstart",content:"Si buscas un despliegue productivo o más controlado, sigue con la instalación manual mediante Helm que se describe más abajo."},{heading:"qué-se-despliega",content:"El chart principal `charts/lamassu`, actualmente en la versión `4.0.0`, despliega estos componentes:"},{heading:"qué-se-despliega",content:"`ui`"},{heading:"qué-se-despliega",content:"`ca`"},{heading:"qué-se-despliega",content:"`va`"},{heading:"qué-se-despliega",content:"`kms`"},{heading:"qué-se-despliega",content:"`device-manager`"},{heading:"qué-se-despliega",content:"`dms-manager`"},{heading:"qué-se-despliega",content:"`alerts`"},{heading:"qué-se-despliega",content:"`authz`, el servicio de autorización que decide qué peticiones del Gateway están permitidas"},{heading:"qué-se-despliega",content:"`wfx`, el servicio de flujos de trabajo Siemens WFX, expuesto bajo `/api/wfx/`"},{heading:"qué-se-despliega",content:"recursos de Gateway API y políticas de Envoy Gateway"},{heading:"qué-se-despliega",content:"job de migraciones de base de datos"},{heading:"requisitos-previos",content:'Clúster Kubernetes `1.24+`. El chart declara `kubeVersion: ">=1.24.0-0"`, por lo que Helm rechaza la instalación en versiones anteriores. La integración con HSM mediante `services.kms.pkcs11Sidecar` requiere además Kubernetes `1.29+`, por su dependencia de los sidecars nativos de init container.'},{heading:"requisitos-previos",content:"`kubectl` configurado con acceso al clúster"},{heading:"requisitos-previos",content:"Helm `3.2.0+`"},{heading:"requisitos-previos",content:"`cert-manager 1.14+` para la gestión de certificados cuando se usa `tls.type=certManager`"},{heading:"requisitos-previos",content:"`Envoy Gateway v1.8.0+`, ya que el chart publica servicios mediante Gateway API y no mediante Ingress. La autorización externa (`auth.externalAuthorization.path`) exige esta versión."},{heading:"requisitos-previos",content:"Acceso al registro de contenedores de Lamassu, o a un registro espejo propio, desde los nodos del clúster"},{heading:"requisitos-previos",content:"Almacenamiento persistente disponible para PostgreSQL, RabbitMQ, VA y KMS"},{heading:"opciones-de-despliegue",content:"Hay dos formas de desplegar Lamassu on-prem:"},{heading:"1-despliegue-manual-con-helm",content:"Es la opción recomendada para entornos productivos o controlados, donde PostgreSQL, RabbitMQ, Keycloak, certificados y direccionamiento del Gateway ya están definidos por el equipo de plataforma."},{heading:"2-despliegue-automatizado-con-fastlane",content:"Es la opción más útil para pruebas, demos, CI o bootstrap rápido de un entorno. Fastlane levanta PostgreSQL, Keycloak, RabbitMQ y Lamassu en un único flujo. Su comportamiento está documentado en la página siguiente."},{heading:"arquitectura",content:"Lamassu IoT se despliega como un conjunto de microservicios Kubernetes independientes. El chart principal crea `Deployment`, `StatefulSet`, `Service`, `ConfigMap`, `HTTPRoute`, `Gateway`, certificados y recursos auxiliares según los valores definidos."},{heading:"arquitectura",content:"Dependencias externas requeridas por el chart principal:"},{heading:"arquitectura",content:"PostgreSQL"},{heading:"arquitectura",content:"RabbitMQ"},{heading:"arquitectura",content:"proveedor OIDC, típicamente Keycloak"},{heading:"arquitectura",content:"El chart no instala estas dependencias por sí solo. Para un despliegue manual hay que provisionarlas antes. Si se busca un entorno funcional rápido para laboratorio o validación, el script Fastlane sí instala PostgreSQL, RabbitMQ y Keycloak además del chart de Lamassu."},{heading:"instalación-manual-con-helm",content:"Agregar el repositorio Helm:"},{heading:"instalación-manual-con-helm",content:"O instalar desde una copia local del repositorio:"},{heading:"valores-mínimos-que-deben-definirse",content:"Los valores por defecto del chart son deliberadamente incompletos para dependencias externas. Como mínimo, un despliegue manual debe definir:"},{heading:"valores-mínimos-que-deben-definirse",content:"`postgres.hostname`, `postgres.username`, `postgres.password`"},{heading:"valores-mínimos-que-deben-definirse",content:"`amqp.hostname`, `amqp.username`, `amqp.password`"},{heading:"valores-mínimos-que-deben-definirse",content:"`auth.oidc.frontend.authority`"},{heading:"valores-mínimos-que-deben-definirse",content:"`auth.oidc.apiGateway.jwks`"},{heading:"valores-mínimos-que-deben-definirse",content:"`services.authz.jwkUrl` y un principal de bootstrap que coincida con un administrador real"},{heading:"valores-mínimos-que-deben-definirse",content:"`services.ca.domains`"},{heading:"valores-mínimos-que-deben-definirse",content:"`gateway.addresses` o una estrategia equivalente de publicación según el clúster"},{heading:"valores-mínimos-que-deben-definirse",content:"`tls.*` según se use `certManager` o certificado externo"},{heading:"valores-mínimos-que-deben-definirse",content:"Ejemplo base:"},{heading:"valores-mínimos-que-deben-definirse",content:"Con `tls.certManagerOptions.issuer` vacío, el chart `4.0.0` crea un `Issuer` self-signed con nombre dependiente del release (por ejemplo, `lamassu-downstream-ca-selfsigned-issuer` con `helm install lamassu`). El valor legado `downstream-ca-selfsigned-issuer` sigue resolviendo al mismo emisor, pero se recomienda dejarlo vacío o apuntar a tu propio `Issuer`/`ClusterIssuer` mediante `tls.certManagerOptions.clusterIssuer`."},{heading:"provisiona-el-primer-administrador",content:"No hay un superusuario implícito. Antes de instalar, crea el rol `pki-admin` en el proveedor OIDC y asígnalo al grupo que administrará Lamassu. El principal del ejemplo concede la política `SUPER ADMIN` a cualquier token que contenga ese rol."},{heading:"provisiona-el-primer-administrador",content:"El Job `pre-install` y `pre-upgrade` prepara las bases de datos, ejecuta las migraciones de authz, precarga las políticas y aplica `services.authz.bootstrap` antes de que arranquen los Deployments. El bootstrap es idempotente: conserva los principales existentes y añade únicamente los grants que falten."},{heading:"provisiona-el-primer-administrador",content:"Si ningún token coincide con un principal activo, nadie podrá administrar la PKI. Prueba una identidad autorizada y otra denegada, y conserva un procedimiento de recuperación."},{heading:"provisiona-el-primer-administrador",content:"Consulta Control de acceso para diseñar principales y políticas."},{heading:"áreas-de-configuración-más-relevantes",content:"**TLS:** `tls.type`, `tls.certManagerOptions.*` y `tls.externalOptions.secretName` controlan el certificado *downstream* del Gateway."},{heading:"áreas-de-configuración-más-relevantes",content:"**Gateway:** `gateway.addresses`, `gateway.ports.*`, `gateway.className` y `gateway.extraRouting` publican la UI y las APIs mediante Envoy Gateway. `gateway.responseOverride` reescribe las respuestas `401`/`403` con cuerpos JSON propios (habilitado por defecto)."},{heading:"áreas-de-configuración-más-relevantes",content:"**Persistencia:** `postgres.*` define la conexión a PostgreSQL."},{heading:"áreas-de-configuración-más-relevantes",content:"**Mensajería:** `amqp.*` configura la conexión a RabbitMQ."},{heading:"áreas-de-configuración-más-relevantes",content:"**Identidad y autorización:** `auth.oidc.*`, `auth.externalAuthorization.*`, `services.authz.jwkUrl` y `services.authz.bootstrap` configuran login, validación JWT, el control de acceso en el Gateway y los permisos iniciales."},{heading:"áreas-de-configuración-más-relevantes",content:"**Autoridades:** `services.ca.domains` establece los dominios autorizados para CA y certificados."},{heading:"áreas-de-configuración-más-relevantes",content:"**Claves:** `services.kms.cryptoEngines.*` configura los motores criptográficos y su almacenamiento."},{heading:"áreas-de-configuración-más-relevantes",content:"**Alertas:** `services.alerts.smtp_server.*` prepara el envío de correo."},{heading:"áreas-de-configuración-más-relevantes",content:"**Observabilidad:** `observability.*` habilita la instrumentación OpenTelemetry (trazas y logs) en todos los servicios."},{heading:"verificación-del-despliegue",content:"El chart incluye una prueba Helm en `charts/lamassu/templates/tests/test-connections.yml`. Tras instalarlo, puede validarse con:"},{heading:"verificación-del-despliegue",content:"La prueba lanza un pod efímero llamado `<release>-connectivity-test` (imagen configurable con `connectivityTest.image`) que comprueba el endpoint `/health` de `ca`, `dms-manager`, `device-manager` y `va`, y que la respuesta del servicio `ui` contiene el título `LamassuIoT Certificate Manager`."},{heading:"repositorio-helm",content:"El repositorio `lamassu-helm` está organizado en tres bloques principales:"},{heading:"repositorio-helm",content:"`charts/lamassu`: chart principal de Lamassu"},{heading:"repositorio-helm",content:"`charts/softhsm`: chart opcional para laboratorios o escenarios de integración con PKCS#11 emulado"},{heading:"repositorio-helm",content:"`scripts/lamassu-fast-lane.sh`: automatización para levantar dependencias y desplegar Lamassu con intervención mínima"},{heading:"softhsm-como-complemento-opcional",content:"El chart `charts/softhsm` no forma parte del despliegue estándar, pero resulta útil en entornos de laboratorio cuando se necesita simular un HSM compatible con PKCS#11. No sustituye a un HSM real en producción; sirve como soporte para pruebas o integraciones concretas."},{heading:"softhsm-como-complemento-opcional",content:"En la versión `4.0.0` del chart, el servicio KMS puede consumir ese token PKCS#11 mediante el sidecar `services.kms.pkcs11Sidecar`, que expone el socket PKCS#11 en un volumen compartido del pod (requiere Kubernetes `1.29+`). El script Fastlane automatiza la integración completa con `--with-hsm` (ver Fastlane)."},{heading:"actualizar-desde-38x",content:"La versión `4.0.0` del chart introduce cambios que rompen la compatibilidad con los despliegues `3.8.x`. La guía completa está en `charts/lamassu/CHANGELOG/3.8.0->4.0.0.md` del repositorio `lamassu-helm`. Los puntos que más afectan a un despliegue manual:"},{heading:"actualizar-desde-38x",content:"**Nombres dependientes del release:** los recursos del chart pasan a llamarse `<release>-<componente>` (por ejemplo, `lamassu-kms`) en lugar de usar nombres fijos. Los PVC de KMS y VA cambian de nombre; si usas motores KMS con almacenamiento en sistema de ficheros o el `fileStore` local de VA, los datos requieren una migración manual descrita en la guía del CHANGELOG: tras `helm upgrade`, los StatefulSets nuevos arrancan con PVC vacíos y hay que copiar el contenido con un pod de ayuda (`alpine:3.20`) ajustando la propiedad a `65532:65532`. Si es una instalación nueva o no usas esos backends, no hay nada que migrar."},{heading:"actualizar-desde-38x",content:"**`services.authz` es obligatorio:** el nuevo servicio de autorización no existía en `3.8.0`. El Job de migraciones crea sus esquemas y precarga políticas, pero no crea la base de datos `pki`; provisiona esa base de datos y concede acceso al usuario de Lamassu antes de actualizar."},{heading:"actualizar-desde-38x",content:"**Validación estricta de valores:** el chart incorpora `values.schema.json` y rechaza claves de nivel superior desconocidas. Elimina bloques obsoletos (por ejemplo, `toolbox`) antes de ejecutar `helm upgrade`."},{heading:"actualizar-desde-38x",content:"**`services.connectors` ahora es un mapa:** cada entrada se indexa por el identificador del conector y debe definir `type` e `image`."},{heading:"actualizar-desde-38x",content:"**Por defecto más seguros:** los pods pasan a ejecutarse como usuario no root `65532:65532`, sin montaje del token del service account, con seccomp `RuntimeDefault` y capacidades eliminadas. Las sobrecargas por servicio de `runAsUser`/`runAsGroup` se han eliminado."},{heading:"actualizar-desde-38x",content:"**`toolbox` pasa a `connectivityTest`:** el contenedor auxiliar de verificación de conectividad se configura en `connectivityTest.image`."},{heading:"versionado-y-migraciones",content:"La versión actual del chart en el repositorio es `4.0.0`. Para upgrades entre versiones, consulta las guías de `charts/lamassu/CHANGELOG/` y revisa especialmente las migraciones de base de datos y el bootstrap de authz."}],headings:[{id:"despliegue-self-managed-con-kubernetes",content:"Despliegue self-managed con Kubernetes"},{id:"quickstart",content:"Quickstart"},{id:"qué-se-despliega",content:"Qué se despliega"},{id:"requisitos-previos",content:"Requisitos previos"},{id:"opciones-de-despliegue",content:"Opciones de despliegue"},{id:"1-despliegue-manual-con-helm",content:"1\\. Despliegue manual con Helm"},{id:"2-despliegue-automatizado-con-fastlane",content:"2\\. Despliegue automatizado con Fastlane"},{id:"arquitectura",content:"Arquitectura"},{id:"instalación-manual-con-helm",content:"Instalación manual con Helm"},{id:"valores-mínimos-que-deben-definirse",content:"Valores mínimos que deben definirse"},{id:"provisiona-el-primer-administrador",content:"Provisiona el primer administrador"},{id:"áreas-de-configuración-más-relevantes",content:"Áreas de configuración más relevantes"},{id:"verificación-del-despliegue",content:"Verificación del despliegue"},{id:"repositorio-helm",content:"Repositorio Helm"},{id:"softhsm-como-complemento-opcional",content:"SoftHSM como complemento opcional"},{id:"actualizar-desde-38x",content:"Actualizar desde 3.8.x"},{id:"versionado-y-migraciones",content:"Versionado y migraciones"}]};const h=[{depth:1,url:"#despliegue-self-managed-con-kubernetes",title:e.jsx(e.Fragment,{children:"Despliegue self-managed con Kubernetes"})},{depth:2,url:"#quickstart",title:e.jsx(e.Fragment,{children:"Quickstart"})},{depth:2,url:"#qué-se-despliega",title:e.jsx(e.Fragment,{children:"Qué se despliega"})},{depth:2,url:"#requisitos-previos",title:e.jsx(e.Fragment,{children:"Requisitos previos"})},{depth:2,url:"#opciones-de-despliegue",title:e.jsx(e.Fragment,{children:"Opciones de despliegue"})},{depth:3,url:"#1-despliegue-manual-con-helm",title:e.jsx(e.Fragment,{children:"1. Despliegue manual con Helm"})},{depth:3,url:"#2-despliegue-automatizado-con-fastlane",title:e.jsx(e.Fragment,{children:"2. Despliegue automatizado con Fastlane"})},{depth:2,url:"#arquitectura",title:e.jsx(e.Fragment,{children:"Arquitectura"})},{depth:2,url:"#instalación-manual-con-helm",title:e.jsx(e.Fragment,{children:"Instalación manual con Helm"})},{depth:2,url:"#valores-mínimos-que-deben-definirse",title:e.jsx(e.Fragment,{children:"Valores mínimos que deben definirse"})},{depth:2,url:"#provisiona-el-primer-administrador",title:e.jsx(e.Fragment,{children:"Provisiona el primer administrador"})},{depth:2,url:"#áreas-de-configuración-más-relevantes",title:e.jsx(e.Fragment,{children:"Áreas de configuración más relevantes"})},{depth:2,url:"#verificación-del-despliegue",title:e.jsx(e.Fragment,{children:"Verificación del despliegue"})},{depth:2,url:"#repositorio-helm",title:e.jsx(e.Fragment,{children:"Repositorio Helm"})},{depth:2,url:"#softhsm-como-complemento-opcional",title:e.jsx(e.Fragment,{children:"SoftHSM como complemento opcional"})},{depth:2,url:"#actualizar-desde-38x",title:e.jsx(e.Fragment,{children:"Actualizar desde 3.8.x"})},{depth:2,url:"#versionado-y-migraciones",title:e.jsx(e.Fragment,{children:"Versionado y migraciones"})}];function n(i){const s={a:"a",code:"code",del:"del",div:"div",em:"em",h1:"h1",h2:"h2",h3:"h3",ins:"ins",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components},{Callout:a}=s;return a||l("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"despliegue-self-managed-con-kubernetes",children:"Despliegue self-managed con Kubernetes"}),`
`,e.jsxs(s.p,{children:["Lamassu IoT puede desplegarse en infraestructura propia mediante ",e.jsx(s.strong,{children:"Kubernetes"}),", tanto en clústeres gestionados internamente como en entornos self-managed."]}),`
`,e.jsxs(s.p,{children:["La referencia principal para este despliegue es el repositorio ",e.jsx(s.code,{children:"lamassu-helm"}),", que incluye:"]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"el chart principal de Lamassu"}),`
`,e.jsx(s.li,{children:"un chart auxiliar de SoftHSM"}),`
`,e.jsxs(s.li,{children:["el script de despliegue automatizado ",e.jsx(s.code,{children:"scripts/lamassu-fast-lane.sh"})]}),`
`]}),`
`,e.jsx(s.h2,{id:"quickstart",children:"Quickstart"}),`
`,e.jsxs(s.p,{children:["Si lo que necesitas es levantar un entorno funcional lo antes posible, la vía más rápida es usar Fastlane desde el repositorio ",e.jsx(s.code,{children:"lamassu-helm"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clone"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://github.com/lamassuiot/lamassu-helm.git"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"cd"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" lamassu-helm"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./scripts/lamassu-fast-lane.sh"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -ns"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" lamassu-dev"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -d"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dev.lamassu.io"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -l"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./charts/lamassu"})]})]})})}),`
`,e.jsx(s.p,{children:"Ese flujo:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"crea o reutiliza el namespace indicado"}),`
`,e.jsx(s.li,{children:"instala PostgreSQL, Keycloak y RabbitMQ"}),`
`,e.jsx(s.li,{children:"despliega el chart de Lamassu"}),`
`,e.jsxs(s.li,{children:["deja la UI expuesta en ",e.jsx(s.code,{children:"https://<dominio>"})]}),`
`]}),`
`,e.jsx(s.p,{children:"Si buscas un despliegue productivo o más controlado, sigue con la instalación manual mediante Helm que se describe más abajo."}),`
`,e.jsx(s.h2,{id:"qué-se-despliega",children:"Qué se despliega"}),`
`,e.jsxs(s.p,{children:["El chart principal ",e.jsx(s.code,{children:"charts/lamassu"}),", actualmente en la ",e.jsxs(s.del,{className:"lm-diff-del",children:["serie ",e.jsx(s.code,{children:"3.7.x"})]}),e.jsxs(s.ins,{className:"lm-diff-ins",children:["versión ",e.jsx(s.code,{children:"4.0.0"})]}),", despliega estos componentes:"]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"ui"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"ca"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"va"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"kms"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"device-manager"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"dms-manager"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"alerts"})}),`
`,e.jsxs(s.li,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(s.code,{children:"authz"}),", el servicio de autorización que decide qué peticiones del Gateway están permitidas"]}),`
`,e.jsxs(s.li,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(s.code,{children:"wfx"}),", el servicio de flujos de trabajo Siemens WFX, expuesto bajo ",e.jsx(s.code,{children:"/api/wfx/"})]}),`
`,e.jsx(s.li,{children:"recursos de Gateway API y políticas de Envoy Gateway"}),`
`,e.jsx(s.li,{children:"job de migraciones de base de datos"}),`
`]}),`
`,e.jsx(s.h2,{id:"requisitos-previos",children:"Requisitos previos"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{className:"lm-diff-del lm-diff-block",children:["Clúster Kubernetes ",e.jsx(s.code,{children:"1.19+"})]}),`
`,e.jsxs(s.li,{className:"lm-diff-ins lm-diff-block",children:["Clúster Kubernetes ",e.jsx(s.code,{children:"1.24+"}),". El chart declara ",e.jsx(s.code,{children:'kubeVersion: ">=1.24.0-0"'}),", por lo que Helm rechaza la instalación en versiones anteriores. La integración con HSM mediante ",e.jsx(s.code,{children:"services.kms.pkcs11Sidecar"})," requiere además Kubernetes ",e.jsx(s.code,{children:"1.29+"}),", por su dependencia de los sidecars nativos de init container."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"kubectl"})," configurado con acceso al clúster"]}),`
`,e.jsxs(s.li,{children:["Helm ",e.jsx(s.code,{children:"3.2.0+"})]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"cert-manager 1.14+"})," para la gestión de certificados cuando se usa ",e.jsx(s.code,{children:"tls.type=certManager"})]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.del,{className:"lm-diff-del",children:e.jsx(s.code,{children:"Envoy Gateway 1.3.0+"})}),e.jsx(s.ins,{className:"lm-diff-ins",children:e.jsx(s.code,{children:"Envoy Gateway v1.8.0+"})}),", ya que el chart publica servicios mediante Gateway API y no mediante Ingress",e.jsxs(s.ins,{className:"lm-diff-ins",children:[". La autorización externa (",e.jsx(s.code,{children:"auth.externalAuthorization.path"}),") exige esta versión."]})]}),`
`,e.jsxs(s.li,{children:["Acceso ",e.jsx(s.del,{className:"lm-diff-del",children:"a un"}),e.jsx(s.ins,{className:"lm-diff-ins",children:"al"})," registro de contenedores ",e.jsx(s.del,{className:"lm-diff-del",children:"o imágenes previamente importadas si se trabaja en modo offline"}),e.jsx(s.ins,{className:"lm-diff-ins",children:"de Lamassu, o a un registro espejo propio, desde los nodos del clúster"})]}),`
`,e.jsx(s.li,{children:"Almacenamiento persistente disponible para PostgreSQL, RabbitMQ, VA y KMS"}),`
`]}),`
`,e.jsx(s.h2,{id:"opciones-de-despliegue",children:"Opciones de despliegue"}),`
`,e.jsx(s.p,{children:"Hay dos formas de desplegar Lamassu on-prem:"}),`
`,e.jsx(s.h3,{id:"1-despliegue-manual-con-helm",children:"1. Despliegue manual con Helm"}),`
`,e.jsx(s.p,{children:"Es la opción recomendada para entornos productivos o controlados, donde PostgreSQL, RabbitMQ, Keycloak, certificados y direccionamiento del Gateway ya están definidos por el equipo de plataforma."}),`
`,e.jsx(s.h3,{id:"2-despliegue-automatizado-con-fastlane",children:"2. Despliegue automatizado con Fastlane"}),`
`,e.jsx(s.p,{children:"Es la opción más útil para pruebas, demos, CI o bootstrap rápido de un entorno. Fastlane levanta PostgreSQL, Keycloak, RabbitMQ y Lamassu en un único flujo. Su comportamiento está documentado en la página siguiente."}),`
`,e.jsx(s.h2,{id:"arquitectura",children:"Arquitectura"}),`
`,e.jsxs(s.p,{children:["Lamassu IoT se despliega como un conjunto de microservicios Kubernetes independientes. El chart principal crea ",e.jsx(s.code,{children:"Deployment"}),", ",e.jsx(s.code,{children:"StatefulSet"}),", ",e.jsx(s.code,{children:"Service"}),", ",e.jsx(s.code,{children:"ConfigMap"}),", ",e.jsx(s.code,{children:"HTTPRoute"}),", ",e.jsx(s.code,{children:"Gateway"}),", certificados y recursos auxiliares según los valores definidos."]}),`
`,e.jsx(s.p,{children:"Dependencias externas requeridas por el chart principal:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"PostgreSQL"}),`
`,e.jsx(s.li,{children:"RabbitMQ"}),`
`,e.jsx(s.li,{children:"proveedor OIDC, típicamente Keycloak"}),`
`]}),`
`,e.jsx(s.p,{children:"El chart no instala estas dependencias por sí solo. Para un despliegue manual hay que provisionarlas antes. Si se busca un entorno funcional rápido para laboratorio o validación, el script Fastlane sí instala PostgreSQL, RabbitMQ y Keycloak además del chart de Lamassu."}),`
`,e.jsx(s.h2,{id:"instalación-manual-con-helm",children:"Instalación manual con Helm"}),`
`,e.jsx(s.p,{children:"Agregar el repositorio Helm:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" repo"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" add"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://lamassuiot.github.io/lamassu-helm"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" repo"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" update"})]})]})})}),`
`,e.jsx(s.p,{children:"O instalar desde una copia local del repositorio:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./charts/lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --create-namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -f"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" values.yaml"})]})})})}),`
`,e.jsx(s.h2,{id:"valores-mínimos-que-deben-definirse",children:"Valores mínimos que deben definirse"}),`
`,e.jsx(s.p,{children:"Los valores por defecto del chart son deliberadamente incompletos para dependencias externas. Como mínimo, un despliegue manual debe definir:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"postgres.hostname"}),", ",e.jsx(s.code,{children:"postgres.username"}),", ",e.jsx(s.code,{children:"postgres.password"})]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"amqp.hostname"}),", ",e.jsx(s.code,{children:"amqp.username"}),", ",e.jsx(s.code,{children:"amqp.password"})]}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"auth.oidc.frontend.authority"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"auth.oidc.apiGateway.jwks"})}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"services.authz.jwkUrl"})," y un principal de bootstrap que coincida con un administrador real"]}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"services.ca.domains"})}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"gateway.addresses"})," o una estrategia equivalente de publicación según el clúster"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"tls.*"})," según se use ",e.jsx(s.code,{children:"certManager"})," o certificado externo"]}),`
`]}),`
`,e.jsx(s.p,{children:"Ejemplo base:"}),`
`,e.jsx(s.div,{className:"lm-diff-final",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"postgres"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  hostname"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"postgresql"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  port"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"5432"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  username"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  password"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"change-me"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"amqp"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  hostname"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"rabbitmq"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  port"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"5672"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  username"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  password"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"change-me"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  tls"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"tls"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  type"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"certManager"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  certManagerOptions"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    issuer"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'""'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    certSpec"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      commonName"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"pki.example.internal"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      hostnames"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        - "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"pki.example.internal"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      addresses"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        - "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10.0.0.20"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"gateway"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  addresses"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    - "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10.0.0.20"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  ports"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    http"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"80"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    https"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"443"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  extraRouting"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    - "}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"path"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/auth"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"auth"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      target"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        host"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"auth-keycloak"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        port"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"8080"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"auth"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  oidc"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    frontend"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      clientId"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"frontend"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      authority"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"https://pki.example.internal/auth/realms/lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    apiGateway"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      jwks"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        - "}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"oidc-authn"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"          uri"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"http://auth-keycloak.lamassu/auth/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  authorization"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    rolesClaim"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"realm_access.roles"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    roles"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      admin"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"pki-admin"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"services"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  ca"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    domains"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      - "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"pki.example.internal"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  authz"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    jwkUrl"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"http://auth-keycloak.lamassu/auth/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    bootstrap"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      - "}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"principal_id"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"oidc:pki-admin"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        principal_name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"PKI Admin"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        principal_type"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"oidc"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        policy_ids"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"          - "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        auth_config"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"          claims"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            - "}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"claim"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"realm_access.roles"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"              operator"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"contains"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"              value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"pki-admin"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-merged",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark lm-diff-code",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"postgres"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  hostname"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"postgresql"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  port"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"5432"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  username"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  password"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"change-me"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"amqp"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  hostname"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"rabbitmq"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  port"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"5672"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  username"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  password"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"change-me"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  tls"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"tls"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  type"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"certManager"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  certManagerOptions"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line lm-diff-line lm-diff-del",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    issuer"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"downstream-ca-selfsigned-issuer"})]}),`
`,e.jsxs(s.span,{className:"line lm-diff-line lm-diff-ins",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    issuer"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'""'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    certSpec"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      commonName"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"pki.example.internal"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      hostnames"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        - "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"pki.example.internal"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      addresses"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        - "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10.0.0.20"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"gateway"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  addresses"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    - "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10.0.0.20"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  ports"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    http"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"80"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    https"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"443"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  extraRouting"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    - "}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"path"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/auth"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"auth"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      target"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        host"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"auth-keycloak"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        port"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"8080"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"auth"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  oidc"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    frontend"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      clientId"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"frontend"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      authority"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"https://pki.example.internal/auth/realms/lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    apiGateway"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      jwks"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        - "}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"oidc-authn"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"          uri"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"http://auth-keycloak.lamassu/auth/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  authorization"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    rolesClaim"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"realm_access.roles"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    roles"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      admin"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"pki-admin"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"services"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  ca"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    domains"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      - "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"pki.example.internal"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  authz"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    jwkUrl"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"http://auth-keycloak.lamassu/auth/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    bootstrap"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      - "}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"principal_id"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"oidc:pki-admin"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        principal_name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"PKI Admin"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        principal_type"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"oidc"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        policy_ids"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"          - "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        auth_config"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"          claims"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            - "}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"claim"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"realm_access.roles"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"              operator"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"contains"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"              value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"pki-admin"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Con ",e.jsx(s.code,{children:"tls.certManagerOptions.issuer"})," vacío, el chart ",e.jsx(s.code,{children:"4.0.0"})," crea un ",e.jsx(s.code,{children:"Issuer"})," self-signed con nombre dependiente del release (por ejemplo, ",e.jsx(s.code,{children:"lamassu-downstream-ca-selfsigned-issuer"})," con ",e.jsx(s.code,{children:"helm install lamassu"}),"). El valor legado ",e.jsx(s.code,{children:"downstream-ca-selfsigned-issuer"})," sigue resolviendo al mismo emisor, pero se recomienda dejarlo vacío o apuntar a tu propio ",e.jsx(s.code,{children:"Issuer"}),"/",e.jsx(s.code,{children:"ClusterIssuer"})," mediante ",e.jsx(s.code,{children:"tls.certManagerOptions.clusterIssuer"}),"."]})}),`
`,e.jsx(s.h2,{id:"provisiona-el-primer-administrador",children:"Provisiona el primer administrador"}),`
`,e.jsxs(s.p,{children:["No hay un superusuario implícito. Antes de instalar, crea el rol ",e.jsx(s.code,{children:"pki-admin"})," en el proveedor OIDC y asígnalo al grupo que administrará Lamassu. El principal del ejemplo concede la política ",e.jsx(s.code,{children:"SUPER ADMIN"})," a cualquier token que contenga ese rol."]}),`
`,e.jsxs(s.p,{children:["El Job ",e.jsx(s.code,{children:"pre-install"})," y ",e.jsx(s.code,{children:"pre-upgrade"})," prepara las bases de datos, ejecuta las migraciones de authz, precarga las políticas y aplica ",e.jsx(s.code,{children:"services.authz.bootstrap"})," antes de que arranquen los Deployments. El bootstrap es idempotente: conserva los principales existentes y añade únicamente los grants que falten."]}),`
`,e.jsx(a,{type:"warn",title:"Valida el acceso antes de exponer la plataforma",children:e.jsx(s.p,{children:"Si ningún token coincide con un principal activo, nadie podrá administrar la PKI. Prueba una identidad autorizada y otra denegada, y conserva un procedimiento de recuperación."})}),`
`,e.jsxs(s.p,{children:["Consulta ",e.jsx(s.a,{href:"/docs/platform/pki/access-control",children:"Control de acceso"})," para diseñar principales y políticas."]}),`
`,e.jsx(s.h2,{id:"áreas-de-configuración-más-relevantes",children:"Áreas de configuración más relevantes"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"TLS:"})," ",e.jsx(s.code,{children:"tls.type"}),", ",e.jsx(s.code,{children:"tls.certManagerOptions.*"})," y ",e.jsx(s.code,{children:"tls.externalOptions.secretName"})," controlan el certificado ",e.jsx(s.em,{children:"downstream"})," del Gateway."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Gateway:"})," ",e.jsx(s.code,{children:"gateway.addresses"}),", ",e.jsx(s.code,{children:"gateway.ports.*"}),e.jsx(s.del,{className:"lm-diff-del",children:" "}),e.jsxs(s.ins,{className:"lm-diff-ins",children:[", ",e.jsx(s.code,{children:"gateway.className"})," "]}),"y ",e.jsx(s.code,{children:"gateway.extraRouting"})," publican la UI y las APIs mediante Envoy Gateway",e.jsxs(s.ins,{className:"lm-diff-ins",children:[". ",e.jsx(s.code,{children:"gateway.responseOverride"})," reescribe las respuestas ",e.jsx(s.code,{children:"401"}),"/",e.jsx(s.code,{children:"403"})," con cuerpos JSON propios (habilitado por defecto)"]}),"."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Persistencia:"})," ",e.jsx(s.code,{children:"postgres.*"})," define la conexión a PostgreSQL."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Mensajería:"})," ",e.jsx(s.code,{children:"amqp.*"})," configura la conexión a RabbitMQ."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Identidad y autorización:"})," ",e.jsx(s.code,{children:"auth.oidc.*"}),", ",e.jsxs(s.ins,{className:"lm-diff-ins",children:[e.jsx(s.code,{children:"auth.externalAuthorization.*"}),", "]}),e.jsx(s.code,{children:"services.authz.jwkUrl"})," y ",e.jsx(s.code,{children:"services.authz.bootstrap"})," configuran login, validación JWT",e.jsx(s.del,{className:"lm-diff-del",children:" y"}),e.jsx(s.ins,{className:"lm-diff-ins",children:", el control de acceso en el Gateway y los"})," permisos iniciales."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Autoridades:"})," ",e.jsx(s.code,{children:"services.ca.domains"})," establece los dominios autorizados para CA y certificados."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Claves:"})," ",e.jsx(s.code,{children:"services.kms.cryptoEngines.*"})," configura los motores criptográficos y su almacenamiento."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Alertas:"})," ",e.jsx(s.code,{children:"services.alerts.smtp_server.*"})," prepara el envío de correo."]}),`
`,e.jsxs(s.li,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(s.strong,{children:"Observabilidad:"})," ",e.jsx(s.code,{children:"observability.*"})," habilita la instrumentación OpenTelemetry (trazas y logs) en todos los servicios."]}),`
`]}),`
`,e.jsx(s.h2,{id:"verificación-del-despliegue",children:"Verificación del despliegue"}),`
`,e.jsxs(s.p,{children:["El chart incluye una prueba Helm en ",e.jsx(s.code,{children:"charts/lamassu/templates/tests/test-connections.yml"}),". Tras instalarlo, puede validarse con:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" lamassu"})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-del lm-diff-block",children:e.jsx(s.p,{children:"La prueba comprueba al menos:"})}),`
`,e.jsx(s.div,{className:"lm-diff-del lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["salud de ",e.jsx(s.code,{children:"ca"})]}),`
`,e.jsxs(s.li,{children:["salud de ",e.jsx(s.code,{children:"dms-manager"})]}),`
`,e.jsxs(s.li,{children:["salud de ",e.jsx(s.code,{children:"device-manager"})]}),`
`,e.jsxs(s.li,{children:["salud de ",e.jsx(s.code,{children:"va"})]}),`
`,e.jsxs(s.li,{children:["respuesta HTML esperada del servicio ",e.jsx(s.code,{children:"ui"})]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["La prueba lanza un pod efímero llamado ",e.jsx(s.code,{children:"<release>-connectivity-test"})," (imagen configurable con ",e.jsx(s.code,{children:"connectivityTest.image"}),") que comprueba el endpoint ",e.jsx(s.code,{children:"/health"})," de ",e.jsx(s.code,{children:"ca"}),", ",e.jsx(s.code,{children:"dms-manager"}),", ",e.jsx(s.code,{children:"device-manager"})," y ",e.jsx(s.code,{children:"va"}),", y que la respuesta del servicio ",e.jsx(s.code,{children:"ui"})," contiene el título ",e.jsx(s.code,{children:"LamassuIoT Certificate Manager"}),"."]})}),`
`,e.jsx(s.h2,{id:"repositorio-helm",children:"Repositorio Helm"}),`
`,e.jsxs(s.p,{children:["El repositorio ",e.jsx(s.code,{children:"lamassu-helm"})," está organizado en tres bloques principales:"]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"charts/lamassu"}),": chart principal de Lamassu"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"charts/softhsm"}),": chart opcional para laboratorios o escenarios de integración con PKCS#11 emulado"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"scripts/lamassu-fast-lane.sh"}),": automatización para levantar dependencias y desplegar Lamassu con intervención mínima"]}),`
`]}),`
`,e.jsx(s.h2,{id:"softhsm-como-complemento-opcional",children:"SoftHSM como complemento opcional"}),`
`,e.jsxs(s.p,{children:["El chart ",e.jsx(s.code,{children:"charts/softhsm"})," no forma parte del despliegue estándar, pero resulta útil en entornos de laboratorio cuando se necesita simular un HSM compatible con PKCS#11. No sustituye ",e.jsx(s.del,{className:"lm-diff-del",children:"al backend KMS principal"}),e.jsx(s.ins,{className:"lm-diff-ins",children:"a un HSM real en producción"}),"; sirve como soporte para pruebas o integraciones concretas."]}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["En la versión ",e.jsx(s.code,{children:"4.0.0"})," del chart, el servicio KMS puede consumir ese token PKCS#11 mediante el sidecar ",e.jsx(s.code,{children:"services.kms.pkcs11Sidecar"}),", que expone el socket PKCS#11 en un volumen compartido del pod (requiere Kubernetes ",e.jsx(s.code,{children:"1.29+"}),"). El script Fastlane automatiza la integración completa con ",e.jsx(s.code,{children:"--with-hsm"})," (ver ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/fastlane",children:"Fastlane"}),")."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"actualizar-desde-38x",children:"Actualizar desde 3.8.x"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["La versión ",e.jsx(s.code,{children:"4.0.0"})," del chart introduce cambios que rompen la compatibilidad con los despliegues ",e.jsx(s.code,{children:"3.8.x"}),". La guía completa está en ",e.jsx(s.a,{href:"https://github.com/lamassuiot/lamassu-helm/blob/main/charts/lamassu/CHANGELOG/3.8.0-%3E4.0.0.md",children:e.jsx(s.code,{children:"charts/lamassu/CHANGELOG/3.8.0->4.0.0.md"})})," del repositorio ",e.jsx(s.code,{children:"lamassu-helm"}),". Los puntos que más afectan a un despliegue manual:"]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Nombres dependientes del release:"})," los recursos del chart pasan a llamarse ",e.jsx(s.code,{children:"<release>-<componente>"})," (por ejemplo, ",e.jsx(s.code,{children:"lamassu-kms"}),") en lugar de usar nombres fijos. Los PVC de KMS y VA cambian de nombre; si usas motores KMS con almacenamiento en sistema de ficheros o el ",e.jsx(s.code,{children:"fileStore"})," local de VA, los datos requieren una migración manual descrita en la guía del CHANGELOG: tras ",e.jsx(s.code,{children:"helm upgrade"}),", los StatefulSets nuevos arrancan con PVC vacíos y hay que copiar el contenido con un pod de ayuda (",e.jsx(s.code,{children:"alpine:3.20"}),") ajustando la propiedad a ",e.jsx(s.code,{children:"65532:65532"}),". Si es una instalación nueva o no usas esos backends, no hay nada que migrar."]}),`
`,e.jsxs(s.li,{children:[e.jsxs(s.strong,{children:[e.jsx(s.code,{children:"services.authz"})," es obligatorio:"]})," el nuevo servicio de autorización no existía en ",e.jsx(s.code,{children:"3.8.0"}),". El Job de migraciones crea sus esquemas y precarga políticas, pero no crea la base de datos ",e.jsx(s.code,{children:"pki"}),"; provisiona esa base de datos y concede acceso al usuario de Lamassu antes de actualizar."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Validación estricta de valores:"})," el chart incorpora ",e.jsx(s.code,{children:"values.schema.json"})," y rechaza claves de nivel superior desconocidas. Elimina bloques obsoletos (por ejemplo, ",e.jsx(s.code,{children:"toolbox"}),") antes de ejecutar ",e.jsx(s.code,{children:"helm upgrade"}),"."]}),`
`,e.jsxs(s.li,{children:[e.jsxs(s.strong,{children:[e.jsx(s.code,{children:"services.connectors"})," ahora es un mapa:"]})," cada entrada se indexa por el identificador del conector y debe definir ",e.jsx(s.code,{children:"type"})," e ",e.jsx(s.code,{children:"image"}),"."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Por defecto más seguros:"})," los pods pasan a ejecutarse como usuario no root ",e.jsx(s.code,{children:"65532:65532"}),", sin montaje del token del service account, con seccomp ",e.jsx(s.code,{children:"RuntimeDefault"})," y capacidades eliminadas. Las sobrecargas por servicio de ",e.jsx(s.code,{children:"runAsUser"}),"/",e.jsx(s.code,{children:"runAsGroup"})," se han eliminado."]}),`
`,e.jsxs(s.li,{children:[e.jsxs(s.strong,{children:[e.jsx(s.code,{children:"toolbox"})," pasa a ",e.jsx(s.code,{children:"connectivityTest"}),":"]})," el contenedor auxiliar de verificación de conectividad se configura en ",e.jsx(s.code,{children:"connectivityTest.image"}),"."]}),`
`]})}),`
`,e.jsx(s.h2,{id:"versionado-y-migraciones",children:"Versionado y migraciones"}),`
`,e.jsxs(s.p,{children:["La versión actual del chart en el repositorio es ",e.jsx(s.del,{className:"lm-diff-del",children:e.jsx(s.code,{children:"3.8.0"})}),e.jsx(s.ins,{className:"lm-diff-ins",children:e.jsx(s.code,{children:"4.0.0"})}),". Para upgrades entre versiones, consulta las guías de ",e.jsx(s.code,{children:"charts/lamassu/CHANGELOG/"})," y revisa especialmente las migraciones de base de datos y el bootstrap de authz."]})]})}function p(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(n,{...i})}):n(i)}function l(i,s){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{t as _markdown,p as default,d as frontmatter,c as lmDiff,o as structuredData,h as toc};
