import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let l=`

Despliegue OnPrem con Kubernetes [#despliegue-onprem-con-kubernetes]

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

El chart principal \`charts/lamassu\`, actualmente en la serie \`3.7.x\`, despliega estos componentes:

* \`ui\`
* \`ca\`
* \`va\`
* \`kms\`
* \`device-manager\`
* \`dms-manager\`
* \`alerts\`
* recursos de Gateway API y políticas de Envoy Gateway
* job de migraciones de base de datos

Requisitos previos [#requisitos-previos]

* Clúster Kubernetes \`1.19+\`
* \`kubectl\` configurado con acceso al clúster
* Helm \`3.2.0+\`
* \`cert-manager 1.14+\` para la gestión de certificados cuando se usa \`tls.type=certManager\`
* \`Envoy Gateway 1.3.0+\`, ya que el chart publica servicios mediante Gateway API y no mediante Ingress
* Acceso a un registro de contenedores o imágenes previamente importadas si se trabaja en modo offline
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
* \`services.ca.domains\`
* \`gateway.addresses\` o una estrategia equivalente de publicación según el clúster
* \`tls.*\` según se use \`certManager\` o certificado externo

Ejemplo base:

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
    issuer: downstream-ca-selfsigned-issuer
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

services:
  ca:
    domains:
      - pki.example.internal
\`\`\`

Áreas de configuración más relevantes [#áreas-de-configuración-más-relevantes]

| Área          | Valores clave                                                            | Uso                                            |
| ------------- | ------------------------------------------------------------------------ | ---------------------------------------------- |
| TLS           | \`tls.type\`, \`tls.certManagerOptions.*\`, \`tls.externalOptions.secretName\` | Certificado downstream del Gateway             |
| Gateway       | \`gateway.addresses\`, \`gateway.ports.*\`, \`gateway.extraRouting\`           | Exposición de UI y APIs vía Envoy Gateway      |
| Base de datos | \`postgres.*\`                                                             | Conexión a PostgreSQL externa                  |
| Mensajería    | \`amqp.*\`                                                                 | Conexión a RabbitMQ                            |
| OIDC          | \`auth.oidc.frontend.*\`, \`auth.oidc.apiGateway.jwks\`                      | Login de UI y validación JWT en el Gateway     |
| CA            | \`services.ca.domains\`                                                    | Dominios autorizados para CA y certificados    |
| KMS           | \`services.kms.cryptoEngines.*\`                                           | Motor criptográfico y almacenamiento de claves |
| Alerts        | \`services.alerts.smtp_server.*\`                                          | Envío de correo para alertas                   |

Verificación del despliegue [#verificación-del-despliegue]

El chart incluye una prueba Helm en \`charts/lamassu/templates/tests/test-connections.yml\`. Tras instalarlo, puede validarse con:

\`\`\`bash
helm test lamassu -n lamassu
\`\`\`

La prueba comprueba al menos:

* salud de \`ca\`
* salud de \`dms-manager\`
* salud de \`device-manager\`
* salud de \`va\`
* respuesta HTML esperada del servicio \`ui\`

Repositorio Helm [#repositorio-helm]

El repositorio \`lamassu-helm\` está organizado en tres bloques principales:

* \`charts/lamassu\`: chart principal de Lamassu
* \`charts/softhsm\`: chart opcional para laboratorios o escenarios de integración con PKCS#11 emulado
* \`scripts/lamassu-fast-lane.sh\`: automatización para levantar dependencias y desplegar Lamassu con intervención mínima

SoftHSM como complemento opcional [#softhsm-como-complemento-opcional]

El chart \`charts/softhsm\` no forma parte del despliegue estándar, pero resulta útil en entornos de laboratorio cuando se necesita simular un HSM compatible con PKCS#11. No sustituye al backend KMS principal; sirve como soporte para pruebas o integraciones concretas.

Versionado y migraciones [#versionado-y-migraciones]

La serie actual del chart principal es \`3.7.x\`. Para upgrades entre versiones, el repositorio incluye guías específicas en \`charts/lamassu/CHANGELOG/\`, especialmente en cambios importantes como la adopción de Envoy Gateway o la introducción del servicio KMS.
`,r={title:"Introducción",description:"Despliegue de Lamassu IoT en infraestructura on-premise gestionada con Kubernetes"},t={contents:[{heading:"despliegue-onprem-con-kubernetes",content:"Lamassu IoT puede desplegarse en infraestructura propia mediante **Kubernetes**, tanto en clústeres gestionados internamente como en entornos self-managed."},{heading:"despliegue-onprem-con-kubernetes",content:"La referencia principal para este despliegue es el repositorio `lamassu-helm`, que incluye:"},{heading:"despliegue-onprem-con-kubernetes",content:"el chart principal de Lamassu"},{heading:"despliegue-onprem-con-kubernetes",content:"un chart auxiliar de SoftHSM"},{heading:"despliegue-onprem-con-kubernetes",content:"el script de despliegue automatizado `scripts/lamassu-fast-lane.sh`"},{heading:"quickstart",content:"Si lo que necesitas es levantar un entorno funcional lo antes posible, la vía más rápida es usar Fastlane desde el repositorio `lamassu-helm`:"},{heading:"quickstart",content:"Ese flujo:"},{heading:"quickstart",content:"crea o reutiliza el namespace indicado"},{heading:"quickstart",content:"instala PostgreSQL, Keycloak y RabbitMQ"},{heading:"quickstart",content:"despliega el chart de Lamassu"},{heading:"quickstart",content:"deja la UI expuesta en `https://<dominio>`"},{heading:"quickstart",content:"Si buscas un despliegue productivo o más controlado, sigue con la instalación manual mediante Helm que se describe más abajo."},{heading:"qué-se-despliega",content:"El chart principal `charts/lamassu`, actualmente en la serie `3.7.x`, despliega estos componentes:"},{heading:"qué-se-despliega",content:"`ui`"},{heading:"qué-se-despliega",content:"`ca`"},{heading:"qué-se-despliega",content:"`va`"},{heading:"qué-se-despliega",content:"`kms`"},{heading:"qué-se-despliega",content:"`device-manager`"},{heading:"qué-se-despliega",content:"`dms-manager`"},{heading:"qué-se-despliega",content:"`alerts`"},{heading:"qué-se-despliega",content:"recursos de Gateway API y políticas de Envoy Gateway"},{heading:"qué-se-despliega",content:"job de migraciones de base de datos"},{heading:"requisitos-previos",content:"Clúster Kubernetes `1.19+`"},{heading:"requisitos-previos",content:"`kubectl` configurado con acceso al clúster"},{heading:"requisitos-previos",content:"Helm `3.2.0+`"},{heading:"requisitos-previos",content:"`cert-manager 1.14+` para la gestión de certificados cuando se usa `tls.type=certManager`"},{heading:"requisitos-previos",content:"`Envoy Gateway 1.3.0+`, ya que el chart publica servicios mediante Gateway API y no mediante Ingress"},{heading:"requisitos-previos",content:"Acceso a un registro de contenedores o imágenes previamente importadas si se trabaja en modo offline"},{heading:"requisitos-previos",content:"Almacenamiento persistente disponible para PostgreSQL, RabbitMQ, VA y KMS"},{heading:"opciones-de-despliegue",content:"Hay dos formas de desplegar Lamassu on-prem:"},{heading:"1-despliegue-manual-con-helm",content:"Es la opción recomendada para entornos productivos o controlados, donde PostgreSQL, RabbitMQ, Keycloak, certificados y direccionamiento del Gateway ya están definidos por el equipo de plataforma."},{heading:"2-despliegue-automatizado-con-fastlane",content:"Es la opción más útil para pruebas, demos, CI o bootstrap rápido de un entorno. Fastlane levanta PostgreSQL, Keycloak, RabbitMQ y Lamassu en un único flujo. Su comportamiento está documentado en la página siguiente."},{heading:"arquitectura",content:"Lamassu IoT se despliega como un conjunto de microservicios Kubernetes independientes. El chart principal crea `Deployment`, `StatefulSet`, `Service`, `ConfigMap`, `HTTPRoute`, `Gateway`, certificados y recursos auxiliares según los valores definidos."},{heading:"arquitectura",content:"Dependencias externas requeridas por el chart principal:"},{heading:"arquitectura",content:"PostgreSQL"},{heading:"arquitectura",content:"RabbitMQ"},{heading:"arquitectura",content:"proveedor OIDC, típicamente Keycloak"},{heading:"arquitectura",content:"El chart no instala estas dependencias por sí solo. Para un despliegue manual hay que provisionarlas antes. Si se busca un entorno funcional rápido para laboratorio o validación, el script Fastlane sí instala PostgreSQL, RabbitMQ y Keycloak además del chart de Lamassu."},{heading:"instalación-manual-con-helm",content:"Agregar el repositorio Helm:"},{heading:"instalación-manual-con-helm",content:"O instalar desde una copia local del repositorio:"},{heading:"valores-mínimos-que-deben-definirse",content:"Los valores por defecto del chart son deliberadamente incompletos para dependencias externas. Como mínimo, un despliegue manual debe definir:"},{heading:"valores-mínimos-que-deben-definirse",content:"`postgres.hostname`, `postgres.username`, `postgres.password`"},{heading:"valores-mínimos-que-deben-definirse",content:"`amqp.hostname`, `amqp.username`, `amqp.password`"},{heading:"valores-mínimos-que-deben-definirse",content:"`auth.oidc.frontend.authority`"},{heading:"valores-mínimos-que-deben-definirse",content:"`auth.oidc.apiGateway.jwks`"},{heading:"valores-mínimos-que-deben-definirse",content:"`services.ca.domains`"},{heading:"valores-mínimos-que-deben-definirse",content:"`gateway.addresses` o una estrategia equivalente de publicación según el clúster"},{heading:"valores-mínimos-que-deben-definirse",content:"`tls.*` según se use `certManager` o certificado externo"},{heading:"valores-mínimos-que-deben-definirse",content:"Ejemplo base:"},{heading:"áreas-de-configuración-más-relevantes",content:"Área"},{heading:"áreas-de-configuración-más-relevantes",content:"Valores clave"},{heading:"áreas-de-configuración-más-relevantes",content:"Uso"},{heading:"áreas-de-configuración-más-relevantes",content:"TLS"},{heading:"áreas-de-configuración-más-relevantes",content:"`tls.type`, `tls.certManagerOptions.*`, `tls.externalOptions.secretName`"},{heading:"áreas-de-configuración-más-relevantes",content:"Certificado downstream del Gateway"},{heading:"áreas-de-configuración-más-relevantes",content:"Gateway"},{heading:"áreas-de-configuración-más-relevantes",content:"`gateway.addresses`, `gateway.ports.*`, `gateway.extraRouting`"},{heading:"áreas-de-configuración-más-relevantes",content:"Exposición de UI y APIs vía Envoy Gateway"},{heading:"áreas-de-configuración-más-relevantes",content:"Base de datos"},{heading:"áreas-de-configuración-más-relevantes",content:"`postgres.*`"},{heading:"áreas-de-configuración-más-relevantes",content:"Conexión a PostgreSQL externa"},{heading:"áreas-de-configuración-más-relevantes",content:"Mensajería"},{heading:"áreas-de-configuración-más-relevantes",content:"`amqp.*`"},{heading:"áreas-de-configuración-más-relevantes",content:"Conexión a RabbitMQ"},{heading:"áreas-de-configuración-más-relevantes",content:"OIDC"},{heading:"áreas-de-configuración-más-relevantes",content:"`auth.oidc.frontend.*`, `auth.oidc.apiGateway.jwks`"},{heading:"áreas-de-configuración-más-relevantes",content:"Login de UI y validación JWT en el Gateway"},{heading:"áreas-de-configuración-más-relevantes",content:"CA"},{heading:"áreas-de-configuración-más-relevantes",content:"`services.ca.domains`"},{heading:"áreas-de-configuración-más-relevantes",content:"Dominios autorizados para CA y certificados"},{heading:"áreas-de-configuración-más-relevantes",content:"KMS"},{heading:"áreas-de-configuración-más-relevantes",content:"`services.kms.cryptoEngines.*`"},{heading:"áreas-de-configuración-más-relevantes",content:"Motor criptográfico y almacenamiento de claves"},{heading:"áreas-de-configuración-más-relevantes",content:"Alerts"},{heading:"áreas-de-configuración-más-relevantes",content:"`services.alerts.smtp_server.*`"},{heading:"áreas-de-configuración-más-relevantes",content:"Envío de correo para alertas"},{heading:"verificación-del-despliegue",content:"El chart incluye una prueba Helm en `charts/lamassu/templates/tests/test-connections.yml`. Tras instalarlo, puede validarse con:"},{heading:"verificación-del-despliegue",content:"La prueba comprueba al menos:"},{heading:"verificación-del-despliegue",content:"salud de `ca`"},{heading:"verificación-del-despliegue",content:"salud de `dms-manager`"},{heading:"verificación-del-despliegue",content:"salud de `device-manager`"},{heading:"verificación-del-despliegue",content:"salud de `va`"},{heading:"verificación-del-despliegue",content:"respuesta HTML esperada del servicio `ui`"},{heading:"repositorio-helm",content:"El repositorio `lamassu-helm` está organizado en tres bloques principales:"},{heading:"repositorio-helm",content:"`charts/lamassu`: chart principal de Lamassu"},{heading:"repositorio-helm",content:"`charts/softhsm`: chart opcional para laboratorios o escenarios de integración con PKCS#11 emulado"},{heading:"repositorio-helm",content:"`scripts/lamassu-fast-lane.sh`: automatización para levantar dependencias y desplegar Lamassu con intervención mínima"},{heading:"softhsm-como-complemento-opcional",content:"El chart `charts/softhsm` no forma parte del despliegue estándar, pero resulta útil en entornos de laboratorio cuando se necesita simular un HSM compatible con PKCS#11. No sustituye al backend KMS principal; sirve como soporte para pruebas o integraciones concretas."},{heading:"versionado-y-migraciones",content:"La serie actual del chart principal es `3.7.x`. Para upgrades entre versiones, el repositorio incluye guías específicas en `charts/lamassu/CHANGELOG/`, especialmente en cambios importantes como la adopción de Envoy Gateway o la introducción del servicio KMS."}],headings:[{id:"despliegue-onprem-con-kubernetes",content:"Despliegue OnPrem con Kubernetes"},{id:"quickstart",content:"Quickstart"},{id:"qué-se-despliega",content:"Qué se despliega"},{id:"requisitos-previos",content:"Requisitos previos"},{id:"opciones-de-despliegue",content:"Opciones de despliegue"},{id:"1-despliegue-manual-con-helm",content:"1\\. Despliegue manual con Helm"},{id:"2-despliegue-automatizado-con-fastlane",content:"2\\. Despliegue automatizado con Fastlane"},{id:"arquitectura",content:"Arquitectura"},{id:"instalación-manual-con-helm",content:"Instalación manual con Helm"},{id:"valores-mínimos-que-deben-definirse",content:"Valores mínimos que deben definirse"},{id:"áreas-de-configuración-más-relevantes",content:"Áreas de configuración más relevantes"},{id:"verificación-del-despliegue",content:"Verificación del despliegue"},{id:"repositorio-helm",content:"Repositorio Helm"},{id:"softhsm-como-complemento-opcional",content:"SoftHSM como complemento opcional"},{id:"versionado-y-migraciones",content:"Versionado y migraciones"}]};const d=[{depth:1,url:"#despliegue-onprem-con-kubernetes",title:e.jsx(e.Fragment,{children:"Despliegue OnPrem con Kubernetes"})},{depth:2,url:"#quickstart",title:e.jsx(e.Fragment,{children:"Quickstart"})},{depth:2,url:"#qué-se-despliega",title:e.jsx(e.Fragment,{children:"Qué se despliega"})},{depth:2,url:"#requisitos-previos",title:e.jsx(e.Fragment,{children:"Requisitos previos"})},{depth:2,url:"#opciones-de-despliegue",title:e.jsx(e.Fragment,{children:"Opciones de despliegue"})},{depth:3,url:"#1-despliegue-manual-con-helm",title:e.jsx(e.Fragment,{children:"1. Despliegue manual con Helm"})},{depth:3,url:"#2-despliegue-automatizado-con-fastlane",title:e.jsx(e.Fragment,{children:"2. Despliegue automatizado con Fastlane"})},{depth:2,url:"#arquitectura",title:e.jsx(e.Fragment,{children:"Arquitectura"})},{depth:2,url:"#instalación-manual-con-helm",title:e.jsx(e.Fragment,{children:"Instalación manual con Helm"})},{depth:2,url:"#valores-mínimos-que-deben-definirse",title:e.jsx(e.Fragment,{children:"Valores mínimos que deben definirse"})},{depth:2,url:"#áreas-de-configuración-más-relevantes",title:e.jsx(e.Fragment,{children:"Áreas de configuración más relevantes"})},{depth:2,url:"#verificación-del-despliegue",title:e.jsx(e.Fragment,{children:"Verificación del despliegue"})},{depth:2,url:"#repositorio-helm",title:e.jsx(e.Fragment,{children:"Repositorio Helm"})},{depth:2,url:"#softhsm-como-complemento-opcional",title:e.jsx(e.Fragment,{children:"SoftHSM como complemento opcional"})},{depth:2,url:"#versionado-y-migraciones",title:e.jsx(e.Fragment,{children:"Versionado y migraciones"})}];function n(i){const s={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"despliegue-onprem-con-kubernetes",children:"Despliegue OnPrem con Kubernetes"}),`
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
`,e.jsxs(s.p,{children:["El chart principal ",e.jsx(s.code,{children:"charts/lamassu"}),", actualmente en la serie ",e.jsx(s.code,{children:"3.7.x"}),", despliega estos componentes:"]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"ui"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"ca"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"va"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"kms"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"device-manager"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"dms-manager"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"alerts"})}),`
`,e.jsx(s.li,{children:"recursos de Gateway API y políticas de Envoy Gateway"}),`
`,e.jsx(s.li,{children:"job de migraciones de base de datos"}),`
`]}),`
`,e.jsx(s.h2,{id:"requisitos-previos",children:"Requisitos previos"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Clúster Kubernetes ",e.jsx(s.code,{children:"1.19+"})]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"kubectl"})," configurado con acceso al clúster"]}),`
`,e.jsxs(s.li,{children:["Helm ",e.jsx(s.code,{children:"3.2.0+"})]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"cert-manager 1.14+"})," para la gestión de certificados cuando se usa ",e.jsx(s.code,{children:"tls.type=certManager"})]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"Envoy Gateway 1.3.0+"}),", ya que el chart publica servicios mediante Gateway API y no mediante Ingress"]}),`
`,e.jsx(s.li,{children:"Acceso a un registro de contenedores o imágenes previamente importadas si se trabaja en modo offline"}),`
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
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"services.ca.domains"})}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"gateway.addresses"})," o una estrategia equivalente de publicación según el clúster"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"tls.*"})," según se use ",e.jsx(s.code,{children:"certManager"})," o certificado externo"]}),`
`]}),`
`,e.jsx(s.p,{children:"Ejemplo base:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"postgres"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
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
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    issuer"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"downstream-ca-selfsigned-issuer"})]}),`
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
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"services"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  ca"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    domains"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      - "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"pki.example.internal"})]})]})})}),`
`,e.jsx(s.h2,{id:"áreas-de-configuración-más-relevantes",children:"Áreas de configuración más relevantes"}),`
`,e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Área"}),e.jsx(s.th,{children:"Valores clave"}),e.jsx(s.th,{children:"Uso"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"TLS"}),e.jsxs(s.td,{children:[e.jsx(s.code,{children:"tls.type"}),", ",e.jsx(s.code,{children:"tls.certManagerOptions.*"}),", ",e.jsx(s.code,{children:"tls.externalOptions.secretName"})]}),e.jsx(s.td,{children:"Certificado downstream del Gateway"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Gateway"}),e.jsxs(s.td,{children:[e.jsx(s.code,{children:"gateway.addresses"}),", ",e.jsx(s.code,{children:"gateway.ports.*"}),", ",e.jsx(s.code,{children:"gateway.extraRouting"})]}),e.jsx(s.td,{children:"Exposición de UI y APIs vía Envoy Gateway"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Base de datos"}),e.jsx(s.td,{children:e.jsx(s.code,{children:"postgres.*"})}),e.jsx(s.td,{children:"Conexión a PostgreSQL externa"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Mensajería"}),e.jsx(s.td,{children:e.jsx(s.code,{children:"amqp.*"})}),e.jsx(s.td,{children:"Conexión a RabbitMQ"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"OIDC"}),e.jsxs(s.td,{children:[e.jsx(s.code,{children:"auth.oidc.frontend.*"}),", ",e.jsx(s.code,{children:"auth.oidc.apiGateway.jwks"})]}),e.jsx(s.td,{children:"Login de UI y validación JWT en el Gateway"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"CA"}),e.jsx(s.td,{children:e.jsx(s.code,{children:"services.ca.domains"})}),e.jsx(s.td,{children:"Dominios autorizados para CA y certificados"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"KMS"}),e.jsx(s.td,{children:e.jsx(s.code,{children:"services.kms.cryptoEngines.*"})}),e.jsx(s.td,{children:"Motor criptográfico y almacenamiento de claves"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Alerts"}),e.jsx(s.td,{children:e.jsx(s.code,{children:"services.alerts.smtp_server.*"})}),e.jsx(s.td,{children:"Envío de correo para alertas"})]})]})]}),`
`,e.jsx(s.h2,{id:"verificación-del-despliegue",children:"Verificación del despliegue"}),`
`,e.jsxs(s.p,{children:["El chart incluye una prueba Helm en ",e.jsx(s.code,{children:"charts/lamassu/templates/tests/test-connections.yml"}),". Tras instalarlo, puede validarse con:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" lamassu"})]})})})}),`
`,e.jsx(s.p,{children:"La prueba comprueba al menos:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["salud de ",e.jsx(s.code,{children:"ca"})]}),`
`,e.jsxs(s.li,{children:["salud de ",e.jsx(s.code,{children:"dms-manager"})]}),`
`,e.jsxs(s.li,{children:["salud de ",e.jsx(s.code,{children:"device-manager"})]}),`
`,e.jsxs(s.li,{children:["salud de ",e.jsx(s.code,{children:"va"})]}),`
`,e.jsxs(s.li,{children:["respuesta HTML esperada del servicio ",e.jsx(s.code,{children:"ui"})]}),`
`]}),`
`,e.jsx(s.h2,{id:"repositorio-helm",children:"Repositorio Helm"}),`
`,e.jsxs(s.p,{children:["El repositorio ",e.jsx(s.code,{children:"lamassu-helm"})," está organizado en tres bloques principales:"]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"charts/lamassu"}),": chart principal de Lamassu"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"charts/softhsm"}),": chart opcional para laboratorios o escenarios de integración con PKCS#11 emulado"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"scripts/lamassu-fast-lane.sh"}),": automatización para levantar dependencias y desplegar Lamassu con intervención mínima"]}),`
`]}),`
`,e.jsx(s.h2,{id:"softhsm-como-complemento-opcional",children:"SoftHSM como complemento opcional"}),`
`,e.jsxs(s.p,{children:["El chart ",e.jsx(s.code,{children:"charts/softhsm"})," no forma parte del despliegue estándar, pero resulta útil en entornos de laboratorio cuando se necesita simular un HSM compatible con PKCS#11. No sustituye al backend KMS principal; sirve como soporte para pruebas o integraciones concretas."]}),`
`,e.jsx(s.h2,{id:"versionado-y-migraciones",children:"Versionado y migraciones"}),`
`,e.jsxs(s.p,{children:["La serie actual del chart principal es ",e.jsx(s.code,{children:"3.7.x"}),". Para upgrades entre versiones, el repositorio incluye guías específicas en ",e.jsx(s.code,{children:"charts/lamassu/CHANGELOG/"}),", especialmente en cambios importantes como la adopción de Envoy Gateway o la introducción del servicio KMS."]})]})}function c(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(n,{...i})}):n(i)}export{l as _markdown,c as default,r as frontmatter,t as structuredData,d as toc};
