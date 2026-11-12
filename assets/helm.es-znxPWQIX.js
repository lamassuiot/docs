import{j as e}from"./index-prc0XQdj.js";let l=`

Instala Lamassu con Helm [#instala-lamassu-con-helm]

Usa Helm cuando necesites control explícito sobre identidad, bases de datos, mensajería, certificados, almacenamiento y upgrades. Para un entorno de evaluación en el que el script pueda tomar esas decisiones, usa [Fastlane](/docs/deployment/self-hosted/fastlane).

Antes de comenzar [#antes-de-comenzar]

Prepara los servicios de plataforma que quedan deliberadamente fuera del chart de Lamassu:

* un clúster Kubernetes 1.24+ y Helm 3.2+
* un servidor PostgreSQL accesible y un rol autorizado para crear bases de datos y schemas
* un broker RabbitMQ accesible y sus credenciales
* un proveedor OIDC, normalmente Keycloak, con un realm/tenant y un cliente para Lamassu
* Envoy Gateway 1.8+ y una \`GatewayClass\`
* cert-manager 1.14+ (solo para el modo predeterminado \`tls.type: certManager\`); para TLS de confianza, un emisor de confianza o un Secret TLS de Kubernetes
* una StorageClass y un [diseño de tráfico externo](/docs/deployment/self-hosted/networking)

El chart usa por defecto una \`GatewayClass\` llamada \`eg\`. Cambia \`gateway.className\` si tu equipo de plataforma utiliza otro nombre.

<Callout type="info" title="Qué hace Helm con PostgreSQL">
  Tú proporcionas el servidor PostgreSQL. El job de pre-install del chart se conecta con las credenciales indicadas, crea las bases de datos \`pki\`, \`authz\` y \`wfx\` y los schemas de los servicios, ejecuta las migraciones y aplica \`services.authz.bootstrap\`.
</Callout>

El chart no tiene dependencias Helm que instalen PostgreSQL, RabbitMQ, un proveedor OIDC, Envoy Gateway ni cert-manager.

1. Instala los requisitos del Gateway [#1-instala-los-requisitos-del-gateway]

Instala o actualiza las CRD de Envoy Gateway antes de su controlador. Estos comandos usan la misma versión que el repositorio Helm de Lamassu:

\`\`\`bash
export ENVOY_GATEWAY_VERSION=v1.8.0

helm template eg-crds oci://docker.io/envoyproxy/gateway-crds-helm \\
  --version "$ENVOY_GATEWAY_VERSION" \\
  --set crds.gatewayAPI.enabled=true \\
  --set crds.gatewayAPI.channel=experimental \\
  --set crds.envoyGateway.enabled=true \\
  | kubectl apply --server-side --force-conflicts -f -

helm upgrade --install eg oci://docker.io/envoyproxy/gateway-helm \\
  --version "$ENVOY_GATEWAY_VERSION" \\
  --namespace envoy-gateway-system \\
  --create-namespace
\`\`\`

Crea la \`GatewayClass\` predeterminada si todavía no existe. Guarda este manifiesto como \`gateway-class.yaml\`:

\`\`\`yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: eg
spec:
  controllerName: gateway.envoyproxy.io/gatewayclass-controller
\`\`\`

\`\`\`bash
kubectl apply -f gateway-class.yaml
kubectl rollout status deployment/envoy-gateway -n envoy-gateway-system
\`\`\`

Instala cert-manager por separado antes de Lamassu, pero solo para el modo predeterminado \`tls.type: certManager\`. En ese modo el chart renderiza sus recursos de Issuer self-signed y Certificate CA tanto si \`tls.certManagerOptions.clusterIssuer\` está definido como si no, por lo que cert-manager sigue siendo un requisito. Con \`tls.type: external\`, el chart no renderiza recursos de cert-manager y el Gateway termina el TLS con un Secret existente que tú proporcionas.

2. Crea un archivo de valores [#2-crea-un-archivo-de-valores]

Parte de los valores predeterminados del chart y sobrescribe los específicos del entorno. Este ejemplo supone que PostgreSQL, RabbitMQ y Keycloak son accesibles mediante DNS de Kubernetes y expone Keycloak en \`/auth\` a través del Gateway compartido:

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
    clusterIssuer: production-issuer
    certSpec:
      commonName: pki.example.com
      hostnames:
        - pki.example.com

gateway:
  className: eg
  ports:
    http: 80
    https: 443
  extraRouting:
    - name: auth
      path: /auth
      target:
        host: auth-keycloak
        port: 80

auth:
  oidc:
    frontend:
      clientId: frontend
      authority: https://pki.example.com/auth/realms/lamassu

services:
  ca:
    domains:
      - pki.example.com
  authz:
    jwkUrl: http://auth-keycloak.lamassu.svc.cluster.local/auth/realms/lamassu/protocol/openid-connect/certs
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

No añadas \`gateway.addresses\` por defecto. Deja la asignación de dirección a la implementación del balanceador salvo que tu diseño de red requiera una VIP concreta en Kubernetes. La IP pública de un NAT o proxy upstream no corresponde a este valor.

Si Keycloak es externo y ya tiene una URL accesible, apunta la configuración OIDC hacia él y omite la entrada \`/auth\` de \`gateway.extraRouting\`.

Si tu archivo de valores aún contiene los ajustes heredados de validación JWT del Gateway — \`auth.oidc.apiGateway.jwks\`, \`auth.authorization.rolesClaim\` o \`auth.authorization.roles.admin\` — elimínalos. La guía de migración \`charts/lamassu/CHANGELOG/3.8.0->4.0.0.md\` documenta su eliminación sin alias de compatibilidad, y \`values.schema.json\` rechaza los bloques residuales en lugar de ignorarlos silenciosamente. Los reemplazos son \`services.authz.jwkUrl\` y \`services.authz.bootstrap\`, que ya aparecen en el ejemplo anterior.

TLS con un Secret existente [#tls-con-un-secret-existente]

Crea un Secret con \`tls.crt\` y \`tls.key\` y referéncialo. El Secret debe existir antes de instalar: en modo \`external\` el chart no renderiza recursos de cert-manager ni crea nunca este Secret.

\`\`\`yaml
tls:
  type: external
  externalOptions:
    secretName: provided-tls
\`\`\`

TLS de AMQP (AMQPS) [#tls-de-amqp-amqps]

\`amqp.tls: true\` selecciona AMQPS en todos los bloques de configuración del bus de eventos. El puerto por defecto sigue siendo \`5672\` y no cambia automáticamente al habilitar TLS, así que define \`amqp.port\` con el listener TLS del broker, normalmente \`5671\`.

Sin un Secret de CA configurado, los clientes del bus de eventos usan las CA de confianza del sistema. Para confiar en una CA privada, crea un Secret en el namespace del release con el certificado de la CA en formato PEM y define \`amqp.ca.secretName\` (y \`amqp.ca.certificateKey\` si la clave de datos no es \`ca.crt\`).

Para brokers que exijan TLS mutuo, crea un Secret con el certificado de cliente y su clave privada y define \`amqp.client.secretName\` (con \`amqp.client.certificateKey\` y \`amqp.client.privateKeyKey\` si las claves de datos no son \`tls.crt\` y \`tls.key\`).

\`\`\`yaml
amqp:
  tls: true
  port: 5671
  ca:
    secretName: rabbitmq-ca
  client:
    secretName: lamassu-amqp-client
\`\`\`

El chart monta los Secrets configurados en modo de solo lectura en todas las cargas de trabajo que consumen AMQP: el certificado de la CA en \`/etc/lamassu/amqp/ca\` y el certificado y la clave de cliente en \`/etc/lamassu/amqp/client\`. Los nombres de los archivos montados son siempre \`ca.crt\`, \`tls.crt\` y \`tls.key\` — los valores \`certificateKey\` y \`privateKeyKey\` renombran solo las claves de datos del Secret, nunca las rutas en disco. La clave privada del cliente se monta con permisos restrictivos (\`defaultMode: 0440\`; el volumen de la CA usa \`0444\`), que funcionan porque el chart añade \`fsGroup\` al security context del pod cuando \`amqp.client.secretName\` está definido — usa el \`runAsGroup\` del contenedor (por defecto \`65532\`) cuando \`fsGroup\` no está ya definido.

Ambas opciones de Secret exigen \`amqp.tls: true\`: \`values.schema.json\` rechaza un \`secretName\` no vacío cuando \`tls\` es false, rechaza claves desconocidas y rechaza nombres de clave de datos fuera de \`^[A-Za-z0-9._-]+$\`. El Secret referenciado debe existir en el namespace del release o los pods consumidores no llegan a arrancar.

El cliente AMQP carga los certificados al arrancar, así que reinicia los pods consumidores tras actualizar cualquiera de los dos Secrets. Cambiar cualquier valor de \`amqp\` reinicia las cargas de trabajo consumidoras mediante la anotación \`checksum/config\`, pero cambiar solo el contenido de un Secret no desencadena un rollout.

<Callout type="warn" title="Define el puerto AMQP antes del upgrade">
  Según la guía de migración \`charts/lamassu/CHANGELOG/3.8.0->4.0.0.md\`: en 3.8.0 \`amqp.tls\` no se aplicaba y los clientes del bus de eventos usaban AMQP en claro; desde 4.0.0, \`amqp.tls: true\` los cambia a AMQPS. Define \`amqp.port\` con el listener TLS del broker antes del upgrade, o usa \`amqp.tls: false\` para mantener AMQP en claro. \`amqp.tls: false\` envía las credenciales del broker y todo el tráfico del bus de eventos en claro.
</Callout>

Provisiona el primer administrador [#provisiona-el-primer-administrador]

No existe un superusuario implícito. Crea en el proveedor OIDC el rol o grupo esperado por \`services.authz.bootstrap\` y asígnalo al menos a un administrador antes de exponer Lamassu.

El job de pre-install y pre-upgrade aplica el bootstrap de forma idempotente: conserva los principales existentes y añade los grants que falten.

<Callout type="warn" title="Valida el acceso antes de exponer la plataforma">
  Prueba una identidad autorizada y otra denegada. Si ningún token coincide con un principal activo del bootstrap, nadie podrá administrar la PKI.
</Callout>

Consulta [Control de acceso](/docs/platform/administration/access-control) para conocer el modelo de principales y políticas.

3. Instala Lamassu [#3-instala-lamassu]

\`\`\`bash
helm repo add lamassu https://lamassuiot.github.io/lamassu-helm
helm repo update

helm upgrade --install lamassu lamassu/lamassu \\
  --namespace lamassu \\
  --create-namespace \\
  --values values.yaml \\
  --wait
\`\`\`

Para instalar un checkout local:

\`\`\`bash
helm upgrade --install lamassu ./charts/lamassu \\
  --namespace lamassu \\
  --create-namespace \\
  --values values.yaml \\
  --wait
\`\`\`

4. Verifica el despliegue [#4-verifica-el-despliegue]

\`\`\`bash
kubectl get pods -n lamassu
kubectl get gateway,httproute -n lamassu
kubectl get service -A
helm test lamassu -n lamassu --logs
\`\`\`

El Gateway debe mostrar \`PROGRAMMED=True\`. Si está programado pero no tiene una dirección utilizable, continúa con [Expón el Gateway](/docs/deployment/self-hosted/networking).

El test de Helm comprueba los endpoints de salud de CA, DMS Manager, Device Manager y VA, y verifica la respuesta de la UI.

Decisiones para producción [#decisiones-para-producción]

Antes de pasar a producción, revisa:

* backup y recuperación de PostgreSQL y volúmenes persistentes
* un motor KMS de producción; el motor filesystem predeterminado no ofrece alta disponibilidad
* almacenamiento compartido para VA antes de aumentar sus réplicas
* roles OIDC gestionados y eliminación de credenciales de evaluación
* un emisor TLS de confianza o un certificado gestionado externamente
* recursos, réplicas, autoscaling, disruption budgets y placement
* SMTP, observabilidad y entrega de alertas
* las [guías de actualización entre versiones](/docs/upgrades/3-8-0-to-4-0-0) y las notas de \`charts/lamassu/CHANGELOG/\` antes de cada upgrade

La referencia completa de valores se mantiene en \`charts/lamassu/VALUES.md\` dentro del repositorio Helm.
`,r={title:"Instala con Helm",description:"Prepara las dependencias, configura el chart de Lamassu y verifica un despliegue controlado en Kubernetes."},t={contents:[{heading:"instala-lamassu-con-helm",content:"Usa Helm cuando necesites control explícito sobre identidad, bases de datos, mensajería, certificados, almacenamiento y upgrades. Para un entorno de evaluación en el que el script pueda tomar esas decisiones, usa Fastlane."},{heading:"antes-de-comenzar",content:"Prepara los servicios de plataforma que quedan deliberadamente fuera del chart de Lamassu:"},{heading:"antes-de-comenzar",content:"un clúster Kubernetes 1.24+ y Helm 3.2+"},{heading:"antes-de-comenzar",content:"un servidor PostgreSQL accesible y un rol autorizado para crear bases de datos y schemas"},{heading:"antes-de-comenzar",content:"un broker RabbitMQ accesible y sus credenciales"},{heading:"antes-de-comenzar",content:"un proveedor OIDC, normalmente Keycloak, con un realm/tenant y un cliente para Lamassu"},{heading:"antes-de-comenzar",content:"Envoy Gateway 1.8+ y una `GatewayClass`"},{heading:"antes-de-comenzar",content:"cert-manager 1.14+ (solo para el modo predeterminado `tls.type: certManager`); para TLS de confianza, un emisor de confianza o un Secret TLS de Kubernetes"},{heading:"antes-de-comenzar",content:"una StorageClass y un diseño de tráfico externo"},{heading:"antes-de-comenzar",content:"El chart usa por defecto una `GatewayClass` llamada `eg`. Cambia `gateway.className` si tu equipo de plataforma utiliza otro nombre."},{heading:"antes-de-comenzar",content:"Tú proporcionas el servidor PostgreSQL. El job de pre-install del chart se conecta con las credenciales indicadas, crea las bases de datos `pki`, `authz` y `wfx` y los schemas de los servicios, ejecuta las migraciones y aplica `services.authz.bootstrap`."},{heading:"antes-de-comenzar",content:"El chart no tiene dependencias Helm que instalen PostgreSQL, RabbitMQ, un proveedor OIDC, Envoy Gateway ni cert-manager."},{heading:"1-instala-los-requisitos-del-gateway",content:"Instala o actualiza las CRD de Envoy Gateway antes de su controlador. Estos comandos usan la misma versión que el repositorio Helm de Lamassu:"},{heading:"1-instala-los-requisitos-del-gateway",content:"Crea la `GatewayClass` predeterminada si todavía no existe. Guarda este manifiesto como `gateway-class.yaml`:"},{heading:"1-instala-los-requisitos-del-gateway",content:"Instala cert-manager por separado antes de Lamassu, pero solo para el modo predeterminado `tls.type: certManager`. En ese modo el chart renderiza sus recursos de Issuer self-signed y Certificate CA tanto si `tls.certManagerOptions.clusterIssuer` está definido como si no, por lo que cert-manager sigue siendo un requisito. Con `tls.type: external`, el chart no renderiza recursos de cert-manager y el Gateway termina el TLS con un Secret existente que tú proporcionas."},{heading:"2-crea-un-archivo-de-valores",content:"Parte de los valores predeterminados del chart y sobrescribe los específicos del entorno. Este ejemplo supone que PostgreSQL, RabbitMQ y Keycloak son accesibles mediante DNS de Kubernetes y expone Keycloak en `/auth` a través del Gateway compartido:"},{heading:"2-crea-un-archivo-de-valores",content:"No añadas `gateway.addresses` por defecto. Deja la asignación de dirección a la implementación del balanceador salvo que tu diseño de red requiera una VIP concreta en Kubernetes. La IP pública de un NAT o proxy upstream no corresponde a este valor."},{heading:"2-crea-un-archivo-de-valores",content:"Si Keycloak es externo y ya tiene una URL accesible, apunta la configuración OIDC hacia él y omite la entrada `/auth` de `gateway.extraRouting`."},{heading:"2-crea-un-archivo-de-valores",content:"Si tu archivo de valores aún contiene los ajustes heredados de validación JWT del Gateway — `auth.oidc.apiGateway.jwks`, `auth.authorization.rolesClaim` o `auth.authorization.roles.admin` — elimínalos. La guía de migración `charts/lamassu/CHANGELOG/3.8.0->4.0.0.md` documenta su eliminación sin alias de compatibilidad, y `values.schema.json` rechaza los bloques residuales en lugar de ignorarlos silenciosamente. Los reemplazos son `services.authz.jwkUrl` y `services.authz.bootstrap`, que ya aparecen en el ejemplo anterior."},{heading:"tls-con-un-secret-existente",content:"Crea un Secret con `tls.crt` y `tls.key` y referéncialo. El Secret debe existir antes de instalar: en modo `external` el chart no renderiza recursos de cert-manager ni crea nunca este Secret."},{heading:"tls-de-amqp-amqps",content:"`amqp.tls: true` selecciona AMQPS en todos los bloques de configuración del bus de eventos. El puerto por defecto sigue siendo `5672` y no cambia automáticamente al habilitar TLS, así que define `amqp.port` con el listener TLS del broker, normalmente `5671`."},{heading:"tls-de-amqp-amqps",content:"Sin un Secret de CA configurado, los clientes del bus de eventos usan las CA de confianza del sistema. Para confiar en una CA privada, crea un Secret en el namespace del release con el certificado de la CA en formato PEM y define `amqp.ca.secretName` (y `amqp.ca.certificateKey` si la clave de datos no es `ca.crt`)."},{heading:"tls-de-amqp-amqps",content:"Para brokers que exijan TLS mutuo, crea un Secret con el certificado de cliente y su clave privada y define `amqp.client.secretName` (con `amqp.client.certificateKey` y `amqp.client.privateKeyKey` si las claves de datos no son `tls.crt` y `tls.key`)."},{heading:"tls-de-amqp-amqps",content:"El chart monta los Secrets configurados en modo de solo lectura en todas las cargas de trabajo que consumen AMQP: el certificado de la CA en `/etc/lamassu/amqp/ca` y el certificado y la clave de cliente en `/etc/lamassu/amqp/client`. Los nombres de los archivos montados son siempre `ca.crt`, `tls.crt` y `tls.key` — los valores `certificateKey` y `privateKeyKey` renombran solo las claves de datos del Secret, nunca las rutas en disco. La clave privada del cliente se monta con permisos restrictivos (`defaultMode: 0440`; el volumen de la CA usa `0444`), que funcionan porque el chart añade `fsGroup` al security context del pod cuando `amqp.client.secretName` está definido — usa el `runAsGroup` del contenedor (por defecto `65532`) cuando `fsGroup` no está ya definido."},{heading:"tls-de-amqp-amqps",content:"Ambas opciones de Secret exigen `amqp.tls: true`: `values.schema.json` rechaza un `secretName` no vacío cuando `tls` es false, rechaza claves desconocidas y rechaza nombres de clave de datos fuera de `^[A-Za-z0-9._-]+$`. El Secret referenciado debe existir en el namespace del release o los pods consumidores no llegan a arrancar."},{heading:"tls-de-amqp-amqps",content:"El cliente AMQP carga los certificados al arrancar, así que reinicia los pods consumidores tras actualizar cualquiera de los dos Secrets. Cambiar cualquier valor de `amqp` reinicia las cargas de trabajo consumidoras mediante la anotación `checksum/config`, pero cambiar solo el contenido de un Secret no desencadena un rollout."},{heading:"tls-de-amqp-amqps",content:"Según la guía de migración `charts/lamassu/CHANGELOG/3.8.0->4.0.0.md`: en 3.8.0 `amqp.tls` no se aplicaba y los clientes del bus de eventos usaban AMQP en claro; desde 4.0.0, `amqp.tls: true` los cambia a AMQPS. Define `amqp.port` con el listener TLS del broker antes del upgrade, o usa `amqp.tls: false` para mantener AMQP en claro. `amqp.tls: false` envía las credenciales del broker y todo el tráfico del bus de eventos en claro."},{heading:"provisiona-el-primer-administrador",content:"No existe un superusuario implícito. Crea en el proveedor OIDC el rol o grupo esperado por `services.authz.bootstrap` y asígnalo al menos a un administrador antes de exponer Lamassu."},{heading:"provisiona-el-primer-administrador",content:"El job de pre-install y pre-upgrade aplica el bootstrap de forma idempotente: conserva los principales existentes y añade los grants que falten."},{heading:"provisiona-el-primer-administrador",content:"Prueba una identidad autorizada y otra denegada. Si ningún token coincide con un principal activo del bootstrap, nadie podrá administrar la PKI."},{heading:"provisiona-el-primer-administrador",content:"Consulta Control de acceso para conocer el modelo de principales y políticas."},{heading:"3-instala-lamassu",content:"Para instalar un checkout local:"},{heading:"4-verifica-el-despliegue",content:"El Gateway debe mostrar `PROGRAMMED=True`. Si está programado pero no tiene una dirección utilizable, continúa con Expón el Gateway."},{heading:"4-verifica-el-despliegue",content:"El test de Helm comprueba los endpoints de salud de CA, DMS Manager, Device Manager y VA, y verifica la respuesta de la UI."},{heading:"decisiones-para-producción",content:"Antes de pasar a producción, revisa:"},{heading:"decisiones-para-producción",content:"backup y recuperación de PostgreSQL y volúmenes persistentes"},{heading:"decisiones-para-producción",content:"un motor KMS de producción; el motor filesystem predeterminado no ofrece alta disponibilidad"},{heading:"decisiones-para-producción",content:"almacenamiento compartido para VA antes de aumentar sus réplicas"},{heading:"decisiones-para-producción",content:"roles OIDC gestionados y eliminación de credenciales de evaluación"},{heading:"decisiones-para-producción",content:"un emisor TLS de confianza o un certificado gestionado externamente"},{heading:"decisiones-para-producción",content:"recursos, réplicas, autoscaling, disruption budgets y placement"},{heading:"decisiones-para-producción",content:"SMTP, observabilidad y entrega de alertas"},{heading:"decisiones-para-producción",content:"las guías de actualización entre versiones y las notas de `charts/lamassu/CHANGELOG/` antes de cada upgrade"},{heading:"decisiones-para-producción",content:"La referencia completa de valores se mantiene en `charts/lamassu/VALUES.md` dentro del repositorio Helm."}],headings:[{id:"instala-lamassu-con-helm",content:"Instala Lamassu con Helm"},{id:"antes-de-comenzar",content:"Antes de comenzar"},{id:"1-instala-los-requisitos-del-gateway",content:"1\\. Instala los requisitos del Gateway"},{id:"2-crea-un-archivo-de-valores",content:"2\\. Crea un archivo de valores"},{id:"tls-con-un-secret-existente",content:"TLS con un Secret existente"},{id:"tls-de-amqp-amqps",content:"TLS de AMQP (AMQPS)"},{id:"provisiona-el-primer-administrador",content:"Provisiona el primer administrador"},{id:"3-instala-lamassu",content:"3\\. Instala Lamassu"},{id:"4-verifica-el-despliegue",content:"4\\. Verifica el despliegue"},{id:"decisiones-para-producción",content:"Decisiones para producción"}]};const d=[{depth:1,url:"#instala-lamassu-con-helm",title:e.jsx(e.Fragment,{children:"Instala Lamassu con Helm"})},{depth:2,url:"#antes-de-comenzar",title:e.jsx(e.Fragment,{children:"Antes de comenzar"})},{depth:2,url:"#1-instala-los-requisitos-del-gateway",title:e.jsx(e.Fragment,{children:"1. Instala los requisitos del Gateway"})},{depth:2,url:"#2-crea-un-archivo-de-valores",title:e.jsx(e.Fragment,{children:"2. Crea un archivo de valores"})},{depth:3,url:"#tls-con-un-secret-existente",title:e.jsx(e.Fragment,{children:"TLS con un Secret existente"})},{depth:3,url:"#tls-de-amqp-amqps",title:e.jsx(e.Fragment,{children:"TLS de AMQP (AMQPS)"})},{depth:3,url:"#provisiona-el-primer-administrador",title:e.jsx(e.Fragment,{children:"Provisiona el primer administrador"})},{depth:2,url:"#3-instala-lamassu",title:e.jsx(e.Fragment,{children:"3. Instala Lamassu"})},{depth:2,url:"#4-verifica-el-despliegue",title:e.jsx(e.Fragment,{children:"4. Verifica el despliegue"})},{depth:2,url:"#decisiones-para-producción",title:e.jsx(e.Fragment,{children:"Decisiones para producción"})}];function n(a){const s={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...a.components},{Callout:i}=s;return i||h("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"instala-lamassu-con-helm",children:"Instala Lamassu con Helm"}),`
`,e.jsxs(s.p,{children:["Usa Helm cuando necesites control explícito sobre identidad, bases de datos, mensajería, certificados, almacenamiento y upgrades. Para un entorno de evaluación en el que el script pueda tomar esas decisiones, usa ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/fastlane",children:"Fastlane"}),"."]}),`
`,e.jsx(s.h2,{id:"antes-de-comenzar",children:"Antes de comenzar"}),`
`,e.jsx(s.p,{children:"Prepara los servicios de plataforma que quedan deliberadamente fuera del chart de Lamassu:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"un clúster Kubernetes 1.24+ y Helm 3.2+"}),`
`,e.jsx(s.li,{children:"un servidor PostgreSQL accesible y un rol autorizado para crear bases de datos y schemas"}),`
`,e.jsx(s.li,{children:"un broker RabbitMQ accesible y sus credenciales"}),`
`,e.jsx(s.li,{children:"un proveedor OIDC, normalmente Keycloak, con un realm/tenant y un cliente para Lamassu"}),`
`,e.jsxs(s.li,{children:["Envoy Gateway 1.8+ y una ",e.jsx(s.code,{children:"GatewayClass"})]}),`
`,e.jsxs(s.li,{children:["cert-manager 1.14+ (solo para el modo predeterminado ",e.jsx(s.code,{children:"tls.type: certManager"}),"); para TLS de confianza, un emisor de confianza o un Secret TLS de Kubernetes"]}),`
`,e.jsxs(s.li,{children:["una StorageClass y un ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/networking",children:"diseño de tráfico externo"})]}),`
`]}),`
`,e.jsxs(s.p,{children:["El chart usa por defecto una ",e.jsx(s.code,{children:"GatewayClass"})," llamada ",e.jsx(s.code,{children:"eg"}),". Cambia ",e.jsx(s.code,{children:"gateway.className"})," si tu equipo de plataforma utiliza otro nombre."]}),`
`,e.jsx(i,{type:"info",title:"Qué hace Helm con PostgreSQL",children:e.jsxs(s.p,{children:["Tú proporcionas el servidor PostgreSQL. El job de pre-install del chart se conecta con las credenciales indicadas, crea las bases de datos ",e.jsx(s.code,{children:"pki"}),", ",e.jsx(s.code,{children:"authz"})," y ",e.jsx(s.code,{children:"wfx"})," y los schemas de los servicios, ejecuta las migraciones y aplica ",e.jsx(s.code,{children:"services.authz.bootstrap"}),"."]})}),`
`,e.jsx(s.p,{children:"El chart no tiene dependencias Helm que instalen PostgreSQL, RabbitMQ, un proveedor OIDC, Envoy Gateway ni cert-manager."}),`
`,e.jsx(s.h2,{id:"1-instala-los-requisitos-del-gateway",children:"1. Instala los requisitos del Gateway"}),`
`,e.jsx(s.p,{children:"Instala o actualiza las CRD de Envoy Gateway antes de su controlador. Estos comandos usan la misma versión que el repositorio Helm de Lamassu:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"export"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" ENVOY_GATEWAY_VERSION"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"v1.8.0"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" template"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" eg-crds"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" oci://docker.io/envoyproxy/gateway-crds-helm"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --version"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:' "'}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"$ENVOY_GATEWAY_VERSION"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"'}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --set"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" crds.gatewayAPI.enabled="}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"true"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --set"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" crds.gatewayAPI.channel=experimental"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --set"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" crds.envoyGateway.enabled="}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"true"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"  |"}),e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:" kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" apply"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --server-side"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --force-conflicts"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -f"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" -"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" upgrade"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --install"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" eg"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" oci://docker.io/envoyproxy/gateway-helm"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --version"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:' "'}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"$ENVOY_GATEWAY_VERSION"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"'}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" envoy-gateway-system"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --create-namespace"})})]})})}),`
`,e.jsxs(s.p,{children:["Crea la ",e.jsx(s.code,{children:"GatewayClass"})," predeterminada si todavía no existe. Guarda este manifiesto como ",e.jsx(s.code,{children:"gateway-class.yaml"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"apiVersion"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"gateway.networking.k8s.io/v1"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"kind"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"GatewayClass"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"metadata"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  name"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"eg"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"spec"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  controllerName"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"gateway.envoyproxy.io/gatewayclass-controller"})]})]})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" apply"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -f"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" gateway-class.yaml"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" rollout"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" status"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" deployment/envoy-gateway"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" envoy-gateway-system"})]})]})})}),`
`,e.jsxs(s.p,{children:["Instala cert-manager por separado antes de Lamassu, pero solo para el modo predeterminado ",e.jsx(s.code,{children:"tls.type: certManager"}),". En ese modo el chart renderiza sus recursos de Issuer self-signed y Certificate CA tanto si ",e.jsx(s.code,{children:"tls.certManagerOptions.clusterIssuer"})," está definido como si no, por lo que cert-manager sigue siendo un requisito. Con ",e.jsx(s.code,{children:"tls.type: external"}),", el chart no renderiza recursos de cert-manager y el Gateway termina el TLS con un Secret existente que tú proporcionas."]}),`
`,e.jsx(s.h2,{id:"2-crea-un-archivo-de-valores",children:"2. Crea un archivo de valores"}),`
`,e.jsxs(s.p,{children:["Parte de los valores predeterminados del chart y sobrescribe los específicos del entorno. Este ejemplo supone que PostgreSQL, RabbitMQ y Keycloak son accesibles mediante DNS de Kubernetes y expone Keycloak en ",e.jsx(s.code,{children:"/auth"})," a través del Gateway compartido:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"postgres"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  hostname"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"postgresql"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  port"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"5432"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  username"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  password"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"change-me"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"amqp"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  hostname"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"rabbitmq"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  port"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"5672"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  username"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  password"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"change-me"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  tls"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"false"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"tls"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  type"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"certManager"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  certManagerOptions"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    clusterIssuer"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"production-issuer"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    certSpec"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"      commonName"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"pki.example.com"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"      hostnames"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"        - "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"pki.example.com"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"gateway"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  className"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"eg"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  ports"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    http"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"80"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    https"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"443"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  extraRouting"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    - "}),e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"auth"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"      path"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"/auth"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"      target"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"        host"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"auth-keycloak"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"        port"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"80"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"auth"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  oidc"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    frontend"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"      clientId"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"frontend"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"      authority"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"https://pki.example.com/auth/realms/lamassu"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"services"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  ca"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    domains"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"      - "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"pki.example.com"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  authz"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    jwkUrl"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"http://auth-keycloak.lamassu.svc.cluster.local/auth/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    bootstrap"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"      - "}),e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"principal_id"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"oidc:pki-admin"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"        principal_name"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"PKI Admin"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"        principal_type"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"oidc"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"        policy_ids"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"          - "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"        auth_config"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"          claims"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"            - "}),e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"claim"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"realm_access.roles"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"              operator"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"contains"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"              value"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"pki-admin"})]})]})})}),`
`,e.jsxs(s.p,{children:["No añadas ",e.jsx(s.code,{children:"gateway.addresses"})," por defecto. Deja la asignación de dirección a la implementación del balanceador salvo que tu diseño de red requiera una VIP concreta en Kubernetes. La IP pública de un NAT o proxy upstream no corresponde a este valor."]}),`
`,e.jsxs(s.p,{children:["Si Keycloak es externo y ya tiene una URL accesible, apunta la configuración OIDC hacia él y omite la entrada ",e.jsx(s.code,{children:"/auth"})," de ",e.jsx(s.code,{children:"gateway.extraRouting"}),"."]}),`
`,e.jsxs(s.p,{children:["Si tu archivo de valores aún contiene los ajustes heredados de validación JWT del Gateway — ",e.jsx(s.code,{children:"auth.oidc.apiGateway.jwks"}),", ",e.jsx(s.code,{children:"auth.authorization.rolesClaim"})," o ",e.jsx(s.code,{children:"auth.authorization.roles.admin"})," — elimínalos. La guía de migración ",e.jsx(s.code,{children:"charts/lamassu/CHANGELOG/3.8.0->4.0.0.md"})," documenta su eliminación sin alias de compatibilidad, y ",e.jsx(s.code,{children:"values.schema.json"})," rechaza los bloques residuales en lugar de ignorarlos silenciosamente. Los reemplazos son ",e.jsx(s.code,{children:"services.authz.jwkUrl"})," y ",e.jsx(s.code,{children:"services.authz.bootstrap"}),", que ya aparecen en el ejemplo anterior."]}),`
`,e.jsx(s.h3,{id:"tls-con-un-secret-existente",children:"TLS con un Secret existente"}),`
`,e.jsxs(s.p,{children:["Crea un Secret con ",e.jsx(s.code,{children:"tls.crt"})," y ",e.jsx(s.code,{children:"tls.key"})," y referéncialo. El Secret debe existir antes de instalar: en modo ",e.jsx(s.code,{children:"external"})," el chart no renderiza recursos de cert-manager ni crea nunca este Secret."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"tls"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  type"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"external"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  externalOptions"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    secretName"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"provided-tls"})]})]})})}),`
`,e.jsx(s.h3,{id:"tls-de-amqp-amqps",children:"TLS de AMQP (AMQPS)"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"amqp.tls: true"})," selecciona AMQPS en todos los bloques de configuración del bus de eventos. El puerto por defecto sigue siendo ",e.jsx(s.code,{children:"5672"})," y no cambia automáticamente al habilitar TLS, así que define ",e.jsx(s.code,{children:"amqp.port"})," con el listener TLS del broker, normalmente ",e.jsx(s.code,{children:"5671"}),"."]}),`
`,e.jsxs(s.p,{children:["Sin un Secret de CA configurado, los clientes del bus de eventos usan las CA de confianza del sistema. Para confiar en una CA privada, crea un Secret en el namespace del release con el certificado de la CA en formato PEM y define ",e.jsx(s.code,{children:"amqp.ca.secretName"})," (y ",e.jsx(s.code,{children:"amqp.ca.certificateKey"})," si la clave de datos no es ",e.jsx(s.code,{children:"ca.crt"}),")."]}),`
`,e.jsxs(s.p,{children:["Para brokers que exijan TLS mutuo, crea un Secret con el certificado de cliente y su clave privada y define ",e.jsx(s.code,{children:"amqp.client.secretName"})," (con ",e.jsx(s.code,{children:"amqp.client.certificateKey"})," y ",e.jsx(s.code,{children:"amqp.client.privateKeyKey"})," si las claves de datos no son ",e.jsx(s.code,{children:"tls.crt"})," y ",e.jsx(s.code,{children:"tls.key"}),")."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"amqp"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  tls"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"true"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  port"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"5671"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  ca"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    secretName"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"rabbitmq-ca"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  client"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    secretName"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"lamassu-amqp-client"})]})]})})}),`
`,e.jsxs(s.p,{children:["El chart monta los Secrets configurados en modo de solo lectura en todas las cargas de trabajo que consumen AMQP: el certificado de la CA en ",e.jsx(s.code,{children:"/etc/lamassu/amqp/ca"})," y el certificado y la clave de cliente en ",e.jsx(s.code,{children:"/etc/lamassu/amqp/client"}),". Los nombres de los archivos montados son siempre ",e.jsx(s.code,{children:"ca.crt"}),", ",e.jsx(s.code,{children:"tls.crt"})," y ",e.jsx(s.code,{children:"tls.key"})," — los valores ",e.jsx(s.code,{children:"certificateKey"})," y ",e.jsx(s.code,{children:"privateKeyKey"})," renombran solo las claves de datos del Secret, nunca las rutas en disco. La clave privada del cliente se monta con permisos restrictivos (",e.jsx(s.code,{children:"defaultMode: 0440"}),"; el volumen de la CA usa ",e.jsx(s.code,{children:"0444"}),"), que funcionan porque el chart añade ",e.jsx(s.code,{children:"fsGroup"})," al security context del pod cuando ",e.jsx(s.code,{children:"amqp.client.secretName"})," está definido — usa el ",e.jsx(s.code,{children:"runAsGroup"})," del contenedor (por defecto ",e.jsx(s.code,{children:"65532"}),") cuando ",e.jsx(s.code,{children:"fsGroup"})," no está ya definido."]}),`
`,e.jsxs(s.p,{children:["Ambas opciones de Secret exigen ",e.jsx(s.code,{children:"amqp.tls: true"}),": ",e.jsx(s.code,{children:"values.schema.json"})," rechaza un ",e.jsx(s.code,{children:"secretName"})," no vacío cuando ",e.jsx(s.code,{children:"tls"})," es false, rechaza claves desconocidas y rechaza nombres de clave de datos fuera de ",e.jsx(s.code,{children:"^[A-Za-z0-9._-]+$"}),". El Secret referenciado debe existir en el namespace del release o los pods consumidores no llegan a arrancar."]}),`
`,e.jsxs(s.p,{children:["El cliente AMQP carga los certificados al arrancar, así que reinicia los pods consumidores tras actualizar cualquiera de los dos Secrets. Cambiar cualquier valor de ",e.jsx(s.code,{children:"amqp"})," reinicia las cargas de trabajo consumidoras mediante la anotación ",e.jsx(s.code,{children:"checksum/config"}),", pero cambiar solo el contenido de un Secret no desencadena un rollout."]}),`
`,e.jsx(i,{type:"warn",title:"Define el puerto AMQP antes del upgrade",children:e.jsxs(s.p,{children:["Según la guía de migración ",e.jsx(s.code,{children:"charts/lamassu/CHANGELOG/3.8.0->4.0.0.md"}),": en 3.8.0 ",e.jsx(s.code,{children:"amqp.tls"})," no se aplicaba y los clientes del bus de eventos usaban AMQP en claro; desde 4.0.0, ",e.jsx(s.code,{children:"amqp.tls: true"})," los cambia a AMQPS. Define ",e.jsx(s.code,{children:"amqp.port"})," con el listener TLS del broker antes del upgrade, o usa ",e.jsx(s.code,{children:"amqp.tls: false"})," para mantener AMQP en claro. ",e.jsx(s.code,{children:"amqp.tls: false"})," envía las credenciales del broker y todo el tráfico del bus de eventos en claro."]})}),`
`,e.jsx(s.h3,{id:"provisiona-el-primer-administrador",children:"Provisiona el primer administrador"}),`
`,e.jsxs(s.p,{children:["No existe un superusuario implícito. Crea en el proveedor OIDC el rol o grupo esperado por ",e.jsx(s.code,{children:"services.authz.bootstrap"})," y asígnalo al menos a un administrador antes de exponer Lamassu."]}),`
`,e.jsx(s.p,{children:"El job de pre-install y pre-upgrade aplica el bootstrap de forma idempotente: conserva los principales existentes y añade los grants que falten."}),`
`,e.jsx(i,{type:"warn",title:"Valida el acceso antes de exponer la plataforma",children:e.jsx(s.p,{children:"Prueba una identidad autorizada y otra denegada. Si ningún token coincide con un principal activo del bootstrap, nadie podrá administrar la PKI."})}),`
`,e.jsxs(s.p,{children:["Consulta ",e.jsx(s.a,{href:"/docs/platform/administration/access-control",children:"Control de acceso"})," para conocer el modelo de principales y políticas."]}),`
`,e.jsx(s.h2,{id:"3-instala-lamassu",children:"3. Instala Lamassu"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" repo"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" add"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" https://lamassuiot.github.io/lamassu-helm"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" repo"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" update"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" upgrade"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --install"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu/lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --create-namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --values"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" values.yaml"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --wait"})})]})})}),`
`,e.jsx(s.p,{children:"Para instalar un checkout local:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" upgrade"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --install"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ./charts/lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --create-namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --values"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" values.yaml"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --wait"})})]})})}),`
`,e.jsx(s.h2,{id:"4-verifica-el-despliegue",children:"4. Verifica el despliegue"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" pods"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" gateway,httproute"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" service"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -A"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" test"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --logs"})]})]})})}),`
`,e.jsxs(s.p,{children:["El Gateway debe mostrar ",e.jsx(s.code,{children:"PROGRAMMED=True"}),". Si está programado pero no tiene una dirección utilizable, continúa con ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/networking",children:"Expón el Gateway"}),"."]}),`
`,e.jsx(s.p,{children:"El test de Helm comprueba los endpoints de salud de CA, DMS Manager, Device Manager y VA, y verifica la respuesta de la UI."}),`
`,e.jsx(s.h2,{id:"decisiones-para-producción",children:"Decisiones para producción"}),`
`,e.jsx(s.p,{children:"Antes de pasar a producción, revisa:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"backup y recuperación de PostgreSQL y volúmenes persistentes"}),`
`,e.jsx(s.li,{children:"un motor KMS de producción; el motor filesystem predeterminado no ofrece alta disponibilidad"}),`
`,e.jsx(s.li,{children:"almacenamiento compartido para VA antes de aumentar sus réplicas"}),`
`,e.jsx(s.li,{children:"roles OIDC gestionados y eliminación de credenciales de evaluación"}),`
`,e.jsx(s.li,{children:"un emisor TLS de confianza o un certificado gestionado externamente"}),`
`,e.jsx(s.li,{children:"recursos, réplicas, autoscaling, disruption budgets y placement"}),`
`,e.jsx(s.li,{children:"SMTP, observabilidad y entrega de alertas"}),`
`,e.jsxs(s.li,{children:["las ",e.jsx(s.a,{href:"/docs/upgrades/3-8-0-to-4-0-0",children:"guías de actualización entre versiones"})," y las notas de ",e.jsx(s.code,{children:"charts/lamassu/CHANGELOG/"})," antes de cada upgrade"]}),`
`]}),`
`,e.jsxs(s.p,{children:["La referencia completa de valores se mantiene en ",e.jsx(s.code,{children:"charts/lamassu/VALUES.md"})," dentro del repositorio Helm."]})]})}function c(a={}){const{wrapper:s}=a.components||{};return s?e.jsx(s,{...a,children:e.jsx(n,{...a})}):n(a)}function h(a,s){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:l,default:c,frontmatter:r,structuredData:t,toc:d},Symbol.toStringTag,{value:"Module"}));export{p as _};
