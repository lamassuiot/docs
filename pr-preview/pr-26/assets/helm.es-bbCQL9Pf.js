import{j as s}from"./index-prc0XQdj.js";let l=`

Instala Lamassu con Helm [#instala-lamassu-con-helm]

Usa Helm cuando necesites control explícito sobre identidad, bases de datos, mensajería, certificados, almacenamiento y upgrades. Para un entorno de evaluación en el que el script pueda tomar esas decisiones, usa [Fastlane](/docs/deployment/self-hosted/fastlane).

Antes de comenzar [#antes-de-comenzar]

Prepara los servicios de plataforma que quedan deliberadamente fuera del chart de Lamassu:

* un clúster Kubernetes 1.24+ y Helm 3.2+
* un servidor PostgreSQL accesible y un rol autorizado para crear bases de datos y schemas
* un broker RabbitMQ accesible y sus credenciales
* un proveedor OIDC, normalmente Keycloak, con un realm/tenant y un cliente para Lamassu
* Envoy Gateway 1.8+ y una \`GatewayClass\`
* cert-manager 1.14+; para TLS de confianza, un emisor de confianza o un Secret TLS de Kubernetes
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

Instala cert-manager por separado antes de Lamassu. El chart actual renderiza sus recursos de issuer self-signed y certificado CA incluso cuando \`tls.type: external\` hace que el Gateway use un Secret TLS existente. Seleccionar TLS externo no elimina por tanto el requisito de cert-manager.

2. Crea un archivo de valores [#2-crea-un-archivo-de-valores]

Parte de los valores predeterminados del chart y sobrescribe los específicos del entorno. Este ejemplo supone que PostgreSQL, RabbitMQ y Keycloak son accesibles mediante DNS de Kubernetes y expone Keycloak en \`/auth\` a través del Gateway compartido:

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
</div>

<div className="lm-diff-merged">
  \`\`\`yaml lmdiff="=======================================----=================="
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
      apiGateway:
        jwks:
          - name: oidc-authn
            uri: http://auth-keycloak.lamassu.svc.cluster.local/auth/realms/lamassu/protocol/openid-connect/certs

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
</div>

No añadas \`gateway.addresses\` por defecto. Deja la asignación de dirección a la implementación del balanceador salvo que tu diseño de red requiera una VIP concreta en Kubernetes. La IP pública de un NAT o proxy upstream no corresponde a este valor.

Si Keycloak es externo y ya tiene una URL accesible, apunta la configuración OIDC hacia él y omite la entrada \`/auth\` de \`gateway.extraRouting\`.

TLS con un Secret existente [#tls-con-un-secret-existente]

Crea un Secret con \`tls.crt\` y \`tls.key\` y referéncialo:

\`\`\`yaml
tls:
  type: external
  externalOptions:
    secretName: lamassu-downstream-tls
\`\`\`

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
* las <del className="lm-diff-del">notas de migración</del>[<ins className="lm-diff-ins">guías de actualización entre versiones</ins>](/docs/upgrades/3-8-0-to-4-0-0)<ins className="lm-diff-ins"> y las notas</ins> de \`charts/lamassu/CHANGELOG/\` antes de cada upgrade

La referencia completa de valores se mantiene en \`charts/lamassu/VALUES.md\` dentro del repositorio Helm.
`,r={title:"Instala con Helm",description:"Prepara las dependencias, configura el chart de Lamassu y verifica un despliegue controlado en Kubernetes."},h={isNew:!1,changes:2,title:void 0,description:void 0},t={contents:[{heading:"instala-lamassu-con-helm",content:"Usa Helm cuando necesites control explícito sobre identidad, bases de datos, mensajería, certificados, almacenamiento y upgrades. Para un entorno de evaluación en el que el script pueda tomar esas decisiones, usa Fastlane."},{heading:"antes-de-comenzar",content:"Prepara los servicios de plataforma que quedan deliberadamente fuera del chart de Lamassu:"},{heading:"antes-de-comenzar",content:"un clúster Kubernetes 1.24+ y Helm 3.2+"},{heading:"antes-de-comenzar",content:"un servidor PostgreSQL accesible y un rol autorizado para crear bases de datos y schemas"},{heading:"antes-de-comenzar",content:"un broker RabbitMQ accesible y sus credenciales"},{heading:"antes-de-comenzar",content:"un proveedor OIDC, normalmente Keycloak, con un realm/tenant y un cliente para Lamassu"},{heading:"antes-de-comenzar",content:"Envoy Gateway 1.8+ y una `GatewayClass`"},{heading:"antes-de-comenzar",content:"cert-manager 1.14+; para TLS de confianza, un emisor de confianza o un Secret TLS de Kubernetes"},{heading:"antes-de-comenzar",content:"una StorageClass y un diseño de tráfico externo"},{heading:"antes-de-comenzar",content:"El chart usa por defecto una `GatewayClass` llamada `eg`. Cambia `gateway.className` si tu equipo de plataforma utiliza otro nombre."},{heading:"antes-de-comenzar",content:"Tú proporcionas el servidor PostgreSQL. El job de pre-install del chart se conecta con las credenciales indicadas, crea las bases de datos `pki`, `authz` y `wfx` y los schemas de los servicios, ejecuta las migraciones y aplica `services.authz.bootstrap`."},{heading:"antes-de-comenzar",content:"El chart no tiene dependencias Helm que instalen PostgreSQL, RabbitMQ, un proveedor OIDC, Envoy Gateway ni cert-manager."},{heading:"1-instala-los-requisitos-del-gateway",content:"Instala o actualiza las CRD de Envoy Gateway antes de su controlador. Estos comandos usan la misma versión que el repositorio Helm de Lamassu:"},{heading:"1-instala-los-requisitos-del-gateway",content:"Crea la `GatewayClass` predeterminada si todavía no existe. Guarda este manifiesto como `gateway-class.yaml`:"},{heading:"1-instala-los-requisitos-del-gateway",content:"Instala cert-manager por separado antes de Lamassu. El chart actual renderiza sus recursos de issuer self-signed y certificado CA incluso cuando `tls.type: external` hace que el Gateway use un Secret TLS existente. Seleccionar TLS externo no elimina por tanto el requisito de cert-manager."},{heading:"2-crea-un-archivo-de-valores",content:"Parte de los valores predeterminados del chart y sobrescribe los específicos del entorno. Este ejemplo supone que PostgreSQL, RabbitMQ y Keycloak son accesibles mediante DNS de Kubernetes y expone Keycloak en `/auth` a través del Gateway compartido:"},{heading:"2-crea-un-archivo-de-valores",content:"No añadas `gateway.addresses` por defecto. Deja la asignación de dirección a la implementación del balanceador salvo que tu diseño de red requiera una VIP concreta en Kubernetes. La IP pública de un NAT o proxy upstream no corresponde a este valor."},{heading:"2-crea-un-archivo-de-valores",content:"Si Keycloak es externo y ya tiene una URL accesible, apunta la configuración OIDC hacia él y omite la entrada `/auth` de `gateway.extraRouting`."},{heading:"tls-con-un-secret-existente",content:"Crea un Secret con `tls.crt` y `tls.key` y referéncialo:"},{heading:"provisiona-el-primer-administrador",content:"No existe un superusuario implícito. Crea en el proveedor OIDC el rol o grupo esperado por `services.authz.bootstrap` y asígnalo al menos a un administrador antes de exponer Lamassu."},{heading:"provisiona-el-primer-administrador",content:"El job de pre-install y pre-upgrade aplica el bootstrap de forma idempotente: conserva los principales existentes y añade los grants que falten."},{heading:"provisiona-el-primer-administrador",content:"Prueba una identidad autorizada y otra denegada. Si ningún token coincide con un principal activo del bootstrap, nadie podrá administrar la PKI."},{heading:"provisiona-el-primer-administrador",content:"Consulta Control de acceso para conocer el modelo de principales y políticas."},{heading:"3-instala-lamassu",content:"Para instalar un checkout local:"},{heading:"4-verifica-el-despliegue",content:"El Gateway debe mostrar `PROGRAMMED=True`. Si está programado pero no tiene una dirección utilizable, continúa con Expón el Gateway."},{heading:"4-verifica-el-despliegue",content:"El test de Helm comprueba los endpoints de salud de CA, DMS Manager, Device Manager y VA, y verifica la respuesta de la UI."},{heading:"decisiones-para-producción",content:"Antes de pasar a producción, revisa:"},{heading:"decisiones-para-producción",content:"backup y recuperación de PostgreSQL y volúmenes persistentes"},{heading:"decisiones-para-producción",content:"un motor KMS de producción; el motor filesystem predeterminado no ofrece alta disponibilidad"},{heading:"decisiones-para-producción",content:"almacenamiento compartido para VA antes de aumentar sus réplicas"},{heading:"decisiones-para-producción",content:"roles OIDC gestionados y eliminación de credenciales de evaluación"},{heading:"decisiones-para-producción",content:"un emisor TLS de confianza o un certificado gestionado externamente"},{heading:"decisiones-para-producción",content:"recursos, réplicas, autoscaling, disruption budgets y placement"},{heading:"decisiones-para-producción",content:"SMTP, observabilidad y entrega de alertas"},{heading:"decisiones-para-producción",content:"las guías de actualización entre versiones y las notas de `charts/lamassu/CHANGELOG/` antes de cada upgrade"},{heading:"decisiones-para-producción",content:"La referencia completa de valores se mantiene en `charts/lamassu/VALUES.md` dentro del repositorio Helm."}],headings:[{id:"instala-lamassu-con-helm",content:"Instala Lamassu con Helm"},{id:"antes-de-comenzar",content:"Antes de comenzar"},{id:"1-instala-los-requisitos-del-gateway",content:"1\\. Instala los requisitos del Gateway"},{id:"2-crea-un-archivo-de-valores",content:"2\\. Crea un archivo de valores"},{id:"tls-con-un-secret-existente",content:"TLS con un Secret existente"},{id:"provisiona-el-primer-administrador",content:"Provisiona el primer administrador"},{id:"3-instala-lamassu",content:"3\\. Instala Lamassu"},{id:"4-verifica-el-despliegue",content:"4\\. Verifica el despliegue"},{id:"decisiones-para-producción",content:"Decisiones para producción"}]};const d=[{depth:1,url:"#instala-lamassu-con-helm",title:s.jsx(s.Fragment,{children:"Instala Lamassu con Helm"})},{depth:2,url:"#antes-de-comenzar",title:s.jsx(s.Fragment,{children:"Antes de comenzar"})},{depth:2,url:"#1-instala-los-requisitos-del-gateway",title:s.jsx(s.Fragment,{children:"1. Instala los requisitos del Gateway"})},{depth:2,url:"#2-crea-un-archivo-de-valores",title:s.jsx(s.Fragment,{children:"2. Crea un archivo de valores"})},{depth:3,url:"#tls-con-un-secret-existente",title:s.jsx(s.Fragment,{children:"TLS con un Secret existente"})},{depth:3,url:"#provisiona-el-primer-administrador",title:s.jsx(s.Fragment,{children:"Provisiona el primer administrador"})},{depth:2,url:"#3-instala-lamassu",title:s.jsx(s.Fragment,{children:"3. Instala Lamassu"})},{depth:2,url:"#4-verifica-el-despliegue",title:s.jsx(s.Fragment,{children:"4. Verifica el despliegue"})},{depth:2,url:"#decisiones-para-producción",title:s.jsx(s.Fragment,{children:"Decisiones para producción"})}];function n(e){const i={a:"a",code:"code",del:"del",div:"div",h1:"h1",h2:"h2",h3:"h3",ins:"ins",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...e.components},{Callout:a}=i;return a||k("Callout"),s.jsxs(s.Fragment,{children:[s.jsx(i.h1,{id:"instala-lamassu-con-helm",children:"Instala Lamassu con Helm"}),`
`,s.jsxs(i.p,{children:["Usa Helm cuando necesites control explícito sobre identidad, bases de datos, mensajería, certificados, almacenamiento y upgrades. Para un entorno de evaluación en el que el script pueda tomar esas decisiones, usa ",s.jsx(i.a,{href:"/docs/deployment/self-hosted/fastlane",children:"Fastlane"}),"."]}),`
`,s.jsx(i.h2,{id:"antes-de-comenzar",children:"Antes de comenzar"}),`
`,s.jsx(i.p,{children:"Prepara los servicios de plataforma que quedan deliberadamente fuera del chart de Lamassu:"}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"un clúster Kubernetes 1.24+ y Helm 3.2+"}),`
`,s.jsx(i.li,{children:"un servidor PostgreSQL accesible y un rol autorizado para crear bases de datos y schemas"}),`
`,s.jsx(i.li,{children:"un broker RabbitMQ accesible y sus credenciales"}),`
`,s.jsx(i.li,{children:"un proveedor OIDC, normalmente Keycloak, con un realm/tenant y un cliente para Lamassu"}),`
`,s.jsxs(i.li,{children:["Envoy Gateway 1.8+ y una ",s.jsx(i.code,{children:"GatewayClass"})]}),`
`,s.jsx(i.li,{children:"cert-manager 1.14+; para TLS de confianza, un emisor de confianza o un Secret TLS de Kubernetes"}),`
`,s.jsxs(i.li,{children:["una StorageClass y un ",s.jsx(i.a,{href:"/docs/deployment/self-hosted/networking",children:"diseño de tráfico externo"})]}),`
`]}),`
`,s.jsxs(i.p,{children:["El chart usa por defecto una ",s.jsx(i.code,{children:"GatewayClass"})," llamada ",s.jsx(i.code,{children:"eg"}),". Cambia ",s.jsx(i.code,{children:"gateway.className"})," si tu equipo de plataforma utiliza otro nombre."]}),`
`,s.jsx(a,{type:"info",title:"Qué hace Helm con PostgreSQL",children:s.jsxs(i.p,{children:["Tú proporcionas el servidor PostgreSQL. El job de pre-install del chart se conecta con las credenciales indicadas, crea las bases de datos ",s.jsx(i.code,{children:"pki"}),", ",s.jsx(i.code,{children:"authz"})," y ",s.jsx(i.code,{children:"wfx"})," y los schemas de los servicios, ejecuta las migraciones y aplica ",s.jsx(i.code,{children:"services.authz.bootstrap"}),"."]})}),`
`,s.jsx(i.p,{children:"El chart no tiene dependencias Helm que instalen PostgreSQL, RabbitMQ, un proveedor OIDC, Envoy Gateway ni cert-manager."}),`
`,s.jsx(i.h2,{id:"1-instala-los-requisitos-del-gateway",children:"1. Instala los requisitos del Gateway"}),`
`,s.jsx(i.p,{children:"Instala o actualiza las CRD de Envoy Gateway antes de su controlador. Estos comandos usan la misma versión que el repositorio Helm de Lamassu:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"export"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" ENVOY_GATEWAY_VERSION"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"v1.8.0"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" template"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" eg-crds"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" oci://docker.io/envoyproxy/gateway-crds-helm"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --version"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$ENVOY_GATEWAY_VERSION"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --set"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" crds.gatewayAPI.enabled="}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:"true"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --set"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" crds.gatewayAPI.channel=experimental"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --set"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" crds.envoyGateway.enabled="}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:"true"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"  |"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" kubectl"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" apply"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --server-side"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --force-conflicts"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -f"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" upgrade"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --install"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" eg"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" oci://docker.io/envoyproxy/gateway-helm"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --version"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$ENVOY_GATEWAY_VERSION"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --namespace"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" envoy-gateway-system"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --create-namespace"})})]})})}),`
`,s.jsxs(i.p,{children:["Crea la ",s.jsx(i.code,{children:"GatewayClass"})," predeterminada si todavía no existe. Guarda este manifiesto como ",s.jsx(i.code,{children:"gateway-class.yaml"}),":"]}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"apiVersion"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" gateway.networking.k8s.io/v1"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"kind"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" GatewayClass"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"metadata"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  name"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" eg"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"spec"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  controllerName"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" gateway.envoyproxy.io/gatewayclass-controller"})]})]})})}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" apply"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -f"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" gateway-class.yaml"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" rollout"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" status"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" deployment/envoy-gateway"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" envoy-gateway-system"})]})]})})}),`
`,s.jsxs(i.p,{children:["Instala cert-manager por separado antes de Lamassu. El chart actual renderiza sus recursos de issuer self-signed y certificado CA incluso cuando ",s.jsx(i.code,{children:"tls.type: external"})," hace que el Gateway use un Secret TLS existente. Seleccionar TLS externo no elimina por tanto el requisito de cert-manager."]}),`
`,s.jsx(i.h2,{id:"2-crea-un-archivo-de-valores",children:"2. Crea un archivo de valores"}),`
`,s.jsxs(i.p,{children:["Parte de los valores predeterminados del chart y sobrescribe los específicos del entorno. Este ejemplo supone que PostgreSQL, RabbitMQ y Keycloak son accesibles mediante DNS de Kubernetes y expone Keycloak en ",s.jsx(i.code,{children:"/auth"})," a través del Gateway compartido:"]}),`
`,s.jsx(i.div,{className:"lm-diff-final",children:s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"postgres"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  hostname"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" postgresql"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  port"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 5432"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  username"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" lamassu"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  password"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" change-me"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"amqp"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  hostname"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" rabbitmq"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  port"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 5672"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  username"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" lamassu"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  password"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" change-me"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  tls"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:" false"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"tls"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  type"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" certManager"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  certManagerOptions"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    clusterIssuer"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" production-issuer"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    certSpec"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      commonName"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki.example.com"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      hostnames"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"        - "}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"pki.example.com"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"gateway"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  className"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" eg"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  ports"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    http"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 80"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    https"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 443"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  extraRouting"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    - "}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"name"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" auth"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      path"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" /auth"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      target"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        host"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" auth-keycloak"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        port"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 80"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"auth"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  oidc"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    frontend"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      clientId"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" frontend"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      authority"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" https://pki.example.com/auth/realms/lamassu"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"services"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  ca"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    domains"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      - "}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"pki.example.com"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  authz"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    jwkUrl"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" http://auth-keycloak.lamassu.svc.cluster.local/auth/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    bootstrap"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      - "}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"principal_id"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc:pki-admin"'})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_name"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "PKI Admin"'})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_type"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc"'})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        policy_ids"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"          - "}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"'})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        auth_config"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"          claims"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"            - "}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"claim"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" realm_access.roles"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              operator"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" contains"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              value"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki-admin"})]})]})})})}),`
`,s.jsx(i.div,{className:"lm-diff-merged",children:s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark lm-diff-code",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"postgres"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  hostname"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" postgresql"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  port"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 5432"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  username"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" lamassu"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  password"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" change-me"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"amqp"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  hostname"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" rabbitmq"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  port"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 5672"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  username"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" lamassu"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  password"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" change-me"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  tls"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:" false"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"tls"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  type"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" certManager"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  certManagerOptions"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    clusterIssuer"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" production-issuer"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    certSpec"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      commonName"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki.example.com"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      hostnames"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"        - "}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"pki.example.com"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"gateway"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  className"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" eg"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  ports"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    http"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 80"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    https"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 443"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  extraRouting"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    - "}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"name"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" auth"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      path"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" /auth"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      target"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        host"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" auth-keycloak"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        port"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 80"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"auth"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  oidc"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    frontend"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      clientId"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" frontend"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      authority"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" https://pki.example.com/auth/realms/lamassu"})]}),`
`,s.jsxs(i.span,{className:"line lm-diff-line lm-diff-del",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    apiGateway"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line lm-diff-line lm-diff-del",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      jwks"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line lm-diff-line lm-diff-del",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"        - "}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"name"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" oidc-authn"})]}),`
`,s.jsxs(i.span,{className:"line lm-diff-line lm-diff-del",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"          uri"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" http://auth-keycloak.lamassu.svc.cluster.local/auth/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"services"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  ca"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    domains"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      - "}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"pki.example.com"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  authz"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    jwkUrl"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" http://auth-keycloak.lamassu.svc.cluster.local/auth/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    bootstrap"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      - "}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"principal_id"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc:pki-admin"'})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_name"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "PKI Admin"'})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_type"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc"'})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        policy_ids"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"          - "}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"'})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        auth_config"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"          claims"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"            - "}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"claim"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" realm_access.roles"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              operator"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" contains"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              value"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki-admin"})]})]})})})}),`
`,s.jsxs(i.p,{children:["No añadas ",s.jsx(i.code,{children:"gateway.addresses"})," por defecto. Deja la asignación de dirección a la implementación del balanceador salvo que tu diseño de red requiera una VIP concreta en Kubernetes. La IP pública de un NAT o proxy upstream no corresponde a este valor."]}),`
`,s.jsxs(i.p,{children:["Si Keycloak es externo y ya tiene una URL accesible, apunta la configuración OIDC hacia él y omite la entrada ",s.jsx(i.code,{children:"/auth"})," de ",s.jsx(i.code,{children:"gateway.extraRouting"}),"."]}),`
`,s.jsx(i.h3,{id:"tls-con-un-secret-existente",children:"TLS con un Secret existente"}),`
`,s.jsxs(i.p,{children:["Crea un Secret con ",s.jsx(i.code,{children:"tls.crt"})," y ",s.jsx(i.code,{children:"tls.key"})," y referéncialo:"]}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"tls"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  type"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" external"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  externalOptions"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    secretName"}),s.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" lamassu-downstream-tls"})]})]})})}),`
`,s.jsx(i.h3,{id:"provisiona-el-primer-administrador",children:"Provisiona el primer administrador"}),`
`,s.jsxs(i.p,{children:["No existe un superusuario implícito. Crea en el proveedor OIDC el rol o grupo esperado por ",s.jsx(i.code,{children:"services.authz.bootstrap"})," y asígnalo al menos a un administrador antes de exponer Lamassu."]}),`
`,s.jsx(i.p,{children:"El job de pre-install y pre-upgrade aplica el bootstrap de forma idempotente: conserva los principales existentes y añade los grants que falten."}),`
`,s.jsx(a,{type:"warn",title:"Valida el acceso antes de exponer la plataforma",children:s.jsx(i.p,{children:"Prueba una identidad autorizada y otra denegada. Si ningún token coincide con un principal activo del bootstrap, nadie podrá administrar la PKI."})}),`
`,s.jsxs(i.p,{children:["Consulta ",s.jsx(i.a,{href:"/docs/platform/administration/access-control",children:"Control de acceso"})," para conocer el modelo de principales y políticas."]}),`
`,s.jsx(i.h2,{id:"3-instala-lamassu",children:"3. Instala Lamassu"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" repo"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" add"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" https://lamassuiot.github.io/lamassu-helm"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" repo"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" update"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" upgrade"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --install"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu/lamassu"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --namespace"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --create-namespace"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --values"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" values.yaml"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --wait"})})]})})}),`
`,s.jsx(i.p,{children:"Para instalar un checkout local:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" upgrade"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --install"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ./charts/lamassu"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --namespace"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --create-namespace"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --values"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" values.yaml"}),s.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --wait"})})]})})}),`
`,s.jsx(i.h2,{id:"4-verifica-el-despliegue",children:"4. Verifica el despliegue"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pods"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" gateway,httproute"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" service"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -A"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" test"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --logs"})]})]})})}),`
`,s.jsxs(i.p,{children:["El Gateway debe mostrar ",s.jsx(i.code,{children:"PROGRAMMED=True"}),". Si está programado pero no tiene una dirección utilizable, continúa con ",s.jsx(i.a,{href:"/docs/deployment/self-hosted/networking",children:"Expón el Gateway"}),"."]}),`
`,s.jsx(i.p,{children:"El test de Helm comprueba los endpoints de salud de CA, DMS Manager, Device Manager y VA, y verifica la respuesta de la UI."}),`
`,s.jsx(i.h2,{id:"decisiones-para-producción",children:"Decisiones para producción"}),`
`,s.jsx(i.p,{children:"Antes de pasar a producción, revisa:"}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"backup y recuperación de PostgreSQL y volúmenes persistentes"}),`
`,s.jsx(i.li,{children:"un motor KMS de producción; el motor filesystem predeterminado no ofrece alta disponibilidad"}),`
`,s.jsx(i.li,{children:"almacenamiento compartido para VA antes de aumentar sus réplicas"}),`
`,s.jsx(i.li,{children:"roles OIDC gestionados y eliminación de credenciales de evaluación"}),`
`,s.jsx(i.li,{children:"un emisor TLS de confianza o un certificado gestionado externamente"}),`
`,s.jsx(i.li,{children:"recursos, réplicas, autoscaling, disruption budgets y placement"}),`
`,s.jsx(i.li,{children:"SMTP, observabilidad y entrega de alertas"}),`
`,s.jsxs(i.li,{children:["las ",s.jsx(i.del,{className:"lm-diff-del",children:"notas de migración"}),s.jsx(i.a,{href:"/docs/upgrades/3-8-0-to-4-0-0",children:s.jsx(i.ins,{className:"lm-diff-ins",children:"guías de actualización entre versiones"})}),s.jsx(i.ins,{className:"lm-diff-ins",children:" y las notas"})," de ",s.jsx(i.code,{children:"charts/lamassu/CHANGELOG/"})," antes de cada upgrade"]}),`
`]}),`
`,s.jsxs(i.p,{children:["La referencia completa de valores se mantiene en ",s.jsx(i.code,{children:"charts/lamassu/VALUES.md"})," dentro del repositorio Helm."]})]})}function c(e={}){const{wrapper:i}=e.components||{};return i?s.jsx(i,{...e,children:s.jsx(n,{...e})}):n(e)}function k(e,i){throw new Error("Expected component `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:l,default:c,frontmatter:r,lmDiff:h,structuredData:t,toc:d},Symbol.toStringTag,{value:"Module"}));export{p as _};
