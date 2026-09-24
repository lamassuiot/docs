import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let c=`

Lamassu separa autenticación y autorización. El proveedor OIDC o el certificado cliente demuestra quién realiza la petición; el servicio authz relaciona esa identidad con uno o varios principales y decide qué acciones están permitidas.

Cómo se toma una decisión [#cómo-se-toma-una-decisión]

1. El Gateway valida la autenticación configurada, normalmente un JWT mediante JWKS.
2. Envoy envía la petición al endpoint de autorización externa /v1/ext\\_authz/check.
3. authz compara las credenciales con principales activos.
4. Reúne las políticas concedidas a los principales coincidentes.
5. Evalúa la acción HTTP o el recurso solicitado y permite o deniega.

Por defecto, <code>auth.externalAuthorization.failOpen</code> es <code>false</code>. Si authz no responde, el Gateway bloquea la petición protegida.

Principales [#principales]

Un principal representa una identidad autorizable, no necesariamente una persona individual. Tiene un identificador estable, nombre, tipo, configuración de coincidencia, estado activo y políticas concedidas.

Lamassu admite dos tipos:

* **oidc**: coincide con claims de un token, por ejemplo un rol, grupo o <code>preferred\\_username</code>.
* **x509**: coincide con una identidad autenticada mediante certificado y su configuración de confianza.

Diseña los principales alrededor de identidades estables del proveedor. Para administración humana suele ser preferible un grupo o rol gestionado centralmente; para automatización, usa una identidad técnica independiente.

Políticas [#políticas]

Una política agrupa reglas reutilizables. Las reglas pueden:

* permitir acciones sobre un tipo de entidad;
* limitar el acceso a identificadores concretos;
* seguir relaciones entre entidades;
* aplicar filtros por atributos;
* conceder acciones HTTP lógicas definidas por el esquema de una API.

La acción <code>\\*</code> en una regla HTTP concede todas las acciones definidas por ese esquema. Resérvala para roles administrativos controlados.

Provisiona el primer administrador [#provisiona-el-primer-administrador]

<Callout type="warn" title="No existe un superusuario implícito">
  Una instalación sin un principal que coincida con tu identidad queda sin nadie capaz de administrar la PKI. Define el bootstrap y configura el IdP antes de exponer la plataforma.
</Callout>

El chart crea por defecto un principal que busca el rol OIDC <code>pki-admin</code> en <code>realm\\_access.roles</code> y le concede las políticas de administración incluidas. El Job Helm de preinstalación y preactualización ejecuta las migraciones de authz, precarga las políticas y crea los principales de bootstrap antes de iniciar los servicios.

\`\`\`yaml title="values.yaml"
auth:
  authorization:
    rolesClaim: realm_access.roles
    roles:
      admin: pki-admin

services:
  authz:
    jwkUrl: https://idp.example.com/realms/iot/protocol/openid-connect/certs
    bootstrap:
      - principal_id: "oidc:pki-admin"
        principal_name: "PKI Admin"
        principal_type: "oidc"
        policy_ids:
          - "lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"
        auth_config:
          claims:
            - claim: "realm_access.roles"
              operator: "contains"
              value: "pki-admin"
\`\`\`

Antes de instalar:

1. Crea el rol <code>pki-admin</code> en tu proveedor OIDC.
2. Asígnalo a un grupo administrativo pequeño y verificable.
3. Configura la URL JWKS interna que alcanzará authz.
4. Mantén al menos dos identidades humanas de recuperación.
5. Prueba acceso permitido y denegado con usuarios distintos.

El bootstrap es idempotente: si el principal ya existe, no lo reemplaza; solo añade las políticas configuradas que todavía falten. Por eso puedes mantenerlo en <code>values.yaml</code> durante las actualizaciones.

Bootstrap de Fastlane [#bootstrap-de-fastlane]

Fastlane instala un realm de Keycloak para laboratorio y crea el usuario <code>lamassu</code> con contraseña temporal <code>lamassu</code>, rol <code>pki-admin</code> y acción obligatoria de cambio de contraseña. Su principal de bootstrap coincide por <code>preferred\\_username=lamassu</code>.

<Callout type="warn" title="Credenciales solo para bootstrap">
  Cambia la contraseña en el primer acceso. No reutilices este usuario ni el IdP de ejemplo como diseño de producción.
</Callout>

Operación segura [#operación-segura]

* Concede políticas a grupos o identidades técnicas, no a claims ambiguos.
* Desactiva un principal cuando deba perder acceso de inmediato.
* Separa administración de PKI, operación de dispositivos y automatizaciones.
* Revisa los grants tras cambios en el proveedor OIDC.
* Mantén <code>failOpen: false</code> salvo una decisión de riesgo explícita.
* Conserva un procedimiento probado para recuperar acceso sin desactivar autorización.

Diagnóstico rápido [#diagnóstico-rápido]

Un <code>401</code> suele indicar que el Gateway no pudo validar la autenticación. Revisa emisor, audiencia, expiración y JWKS.

Un <code>403</code> indica normalmente que la identidad se autenticó, pero ningún principal activo y sus políticas autorizaron la acción. Comprueba claims reales del token, regla de coincidencia, grants y acción solicitada.

Si todas las rutas protegidas fallan, verifica la salud y conectividad de authz, su acceso a PostgreSQL y la URL JWKS. Continúa con [Resolución de problemas](/docs/platform/pki/troubleshooting).
`,l={title:"Control de acceso",description:"Conecta una identidad OIDC o X.509 con principales, políticas y permisos de Lamassu."},t={contents:[{heading:void 0,content:"Lamassu separa autenticación y autorización. El proveedor OIDC o el certificado cliente demuestra quién realiza la petición; el servicio authz relaciona esa identidad con uno o varios principales y decide qué acciones están permitidas."},{heading:"cómo-se-toma-una-decisión",content:"El Gateway valida la autenticación configurada, normalmente un JWT mediante JWKS."},{heading:"cómo-se-toma-una-decisión",content:"Envoy envía la petición al endpoint de autorización externa /v1/ext\\_authz/check."},{heading:"cómo-se-toma-una-decisión",content:"authz compara las credenciales con principales activos."},{heading:"cómo-se-toma-una-decisión",content:"Reúne las políticas concedidas a los principales coincidentes."},{heading:"cómo-se-toma-una-decisión",content:"Evalúa la acción HTTP o el recurso solicitado y permite o deniega."},{heading:"cómo-se-toma-una-decisión",content:"Por defecto, auth.externalAuthorization.failOpen es false. Si authz no responde, el Gateway bloquea la petición protegida."},{heading:"principales",content:"Un principal representa una identidad autorizable, no necesariamente una persona individual. Tiene un identificador estable, nombre, tipo, configuración de coincidencia, estado activo y políticas concedidas."},{heading:"principales",content:"Lamassu admite dos tipos:"},{heading:"principales",content:"**oidc**: coincide con claims de un token, por ejemplo un rol, grupo o preferred\\_username."},{heading:"principales",content:"**x509**: coincide con una identidad autenticada mediante certificado y su configuración de confianza."},{heading:"principales",content:"Diseña los principales alrededor de identidades estables del proveedor. Para administración humana suele ser preferible un grupo o rol gestionado centralmente; para automatización, usa una identidad técnica independiente."},{heading:"políticas",content:"Una política agrupa reglas reutilizables. Las reglas pueden:"},{heading:"políticas",content:"permitir acciones sobre un tipo de entidad;"},{heading:"políticas",content:"limitar el acceso a identificadores concretos;"},{heading:"políticas",content:"seguir relaciones entre entidades;"},{heading:"políticas",content:"aplicar filtros por atributos;"},{heading:"políticas",content:"conceder acciones HTTP lógicas definidas por el esquema de una API."},{heading:"políticas",content:"La acción \\* en una regla HTTP concede todas las acciones definidas por ese esquema. Resérvala para roles administrativos controlados."},{heading:"provisiona-el-primer-administrador",content:"Una instalación sin un principal que coincida con tu identidad queda sin nadie capaz de administrar la PKI. Define el bootstrap y configura el IdP antes de exponer la plataforma."},{heading:"provisiona-el-primer-administrador",content:"El chart crea por defecto un principal que busca el rol OIDC pki-admin en realm\\_access.roles y le concede las políticas de administración incluidas. El Job Helm de preinstalación y preactualización ejecuta las migraciones de authz, precarga las políticas y crea los principales de bootstrap antes de iniciar los servicios."},{heading:"provisiona-el-primer-administrador",content:"Antes de instalar:"},{heading:"provisiona-el-primer-administrador",content:"Crea el rol pki-admin en tu proveedor OIDC."},{heading:"provisiona-el-primer-administrador",content:"Asígnalo a un grupo administrativo pequeño y verificable."},{heading:"provisiona-el-primer-administrador",content:"Configura la URL JWKS interna que alcanzará authz."},{heading:"provisiona-el-primer-administrador",content:"Mantén al menos dos identidades humanas de recuperación."},{heading:"provisiona-el-primer-administrador",content:"Prueba acceso permitido y denegado con usuarios distintos."},{heading:"provisiona-el-primer-administrador",content:"El bootstrap es idempotente: si el principal ya existe, no lo reemplaza; solo añade las políticas configuradas que todavía falten. Por eso puedes mantenerlo en values.yaml durante las actualizaciones."},{heading:"bootstrap-de-fastlane",content:"Fastlane instala un realm de Keycloak para laboratorio y crea el usuario lamassu con contraseña temporal lamassu, rol pki-admin y acción obligatoria de cambio de contraseña. Su principal de bootstrap coincide por preferred\\_username=lamassu."},{heading:"bootstrap-de-fastlane",content:"Cambia la contraseña en el primer acceso. No reutilices este usuario ni el IdP de ejemplo como diseño de producción."},{heading:"operación-segura",content:"Concede políticas a grupos o identidades técnicas, no a claims ambiguos."},{heading:"operación-segura",content:"Desactiva un principal cuando deba perder acceso de inmediato."},{heading:"operación-segura",content:"Separa administración de PKI, operación de dispositivos y automatizaciones."},{heading:"operación-segura",content:"Revisa los grants tras cambios en el proveedor OIDC."},{heading:"operación-segura",content:"Mantén failOpen: false salvo una decisión de riesgo explícita."},{heading:"operación-segura",content:"Conserva un procedimiento probado para recuperar acceso sin desactivar autorización."},{heading:"diagnóstico-rápido",content:"Un 401 suele indicar que el Gateway no pudo validar la autenticación. Revisa emisor, audiencia, expiración y JWKS."},{heading:"diagnóstico-rápido",content:"Un 403 indica normalmente que la identidad se autenticó, pero ningún principal activo y sus políticas autorizaron la acción. Comprueba claims reales del token, regla de coincidencia, grants y acción solicitada."},{heading:"diagnóstico-rápido",content:"Si todas las rutas protegidas fallan, verifica la salud y conectividad de authz, su acceso a PostgreSQL y la URL JWKS. Continúa con Resolución de problemas."}],headings:[{id:"cómo-se-toma-una-decisión",content:"Cómo se toma una decisión"},{id:"principales",content:"Principales"},{id:"políticas",content:"Políticas"},{id:"provisiona-el-primer-administrador",content:"Provisiona el primer administrador"},{id:"bootstrap-de-fastlane",content:"Bootstrap de Fastlane"},{id:"operación-segura",content:"Operación segura"},{id:"diagnóstico-rápido",content:"Diagnóstico rápido"}]};const d=[{depth:2,url:"#cómo-se-toma-una-decisión",title:e.jsx(e.Fragment,{children:"Cómo se toma una decisión"})},{depth:2,url:"#principales",title:e.jsx(e.Fragment,{children:"Principales"})},{depth:2,url:"#políticas",title:e.jsx(e.Fragment,{children:"Políticas"})},{depth:2,url:"#provisiona-el-primer-administrador",title:e.jsx(e.Fragment,{children:"Provisiona el primer administrador"})},{depth:2,url:"#bootstrap-de-fastlane",title:e.jsx(e.Fragment,{children:"Bootstrap de Fastlane"})},{depth:2,url:"#operación-segura",title:e.jsx(e.Fragment,{children:"Operación segura"})},{depth:2,url:"#diagnóstico-rápido",title:e.jsx(e.Fragment,{children:"Diagnóstico rápido"})}];function s(a){const i={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...a.components},{Callout:n}=i;return n||r("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"Lamassu separa autenticación y autorización. El proveedor OIDC o el certificado cliente demuestra quién realiza la petición; el servicio authz relaciona esa identidad con uno o varios principales y decide qué acciones están permitidas."}),`
`,e.jsx(i.h2,{id:"cómo-se-toma-una-decisión",children:"Cómo se toma una decisión"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"El Gateway valida la autenticación configurada, normalmente un JWT mediante JWKS."}),`
`,e.jsx(i.li,{children:"Envoy envía la petición al endpoint de autorización externa /v1/ext_authz/check."}),`
`,e.jsx(i.li,{children:"authz compara las credenciales con principales activos."}),`
`,e.jsx(i.li,{children:"Reúne las políticas concedidas a los principales coincidentes."}),`
`,e.jsx(i.li,{children:"Evalúa la acción HTTP o el recurso solicitado y permite o deniega."}),`
`]}),`
`,e.jsxs(i.p,{children:["Por defecto, ",e.jsx("code",{children:"auth.externalAuthorization.failOpen"})," es ",e.jsx("code",{children:"false"}),". Si authz no responde, el Gateway bloquea la petición protegida."]}),`
`,e.jsx(i.h2,{id:"principales",children:"Principales"}),`
`,e.jsx(i.p,{children:"Un principal representa una identidad autorizable, no necesariamente una persona individual. Tiene un identificador estable, nombre, tipo, configuración de coincidencia, estado activo y políticas concedidas."}),`
`,e.jsx(i.p,{children:"Lamassu admite dos tipos:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"oidc"}),": coincide con claims de un token, por ejemplo un rol, grupo o ",e.jsx("code",{children:"preferred_username"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"x509"}),": coincide con una identidad autenticada mediante certificado y su configuración de confianza."]}),`
`]}),`
`,e.jsx(i.p,{children:"Diseña los principales alrededor de identidades estables del proveedor. Para administración humana suele ser preferible un grupo o rol gestionado centralmente; para automatización, usa una identidad técnica independiente."}),`
`,e.jsx(i.h2,{id:"políticas",children:"Políticas"}),`
`,e.jsx(i.p,{children:"Una política agrupa reglas reutilizables. Las reglas pueden:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"permitir acciones sobre un tipo de entidad;"}),`
`,e.jsx(i.li,{children:"limitar el acceso a identificadores concretos;"}),`
`,e.jsx(i.li,{children:"seguir relaciones entre entidades;"}),`
`,e.jsx(i.li,{children:"aplicar filtros por atributos;"}),`
`,e.jsx(i.li,{children:"conceder acciones HTTP lógicas definidas por el esquema de una API."}),`
`]}),`
`,e.jsxs(i.p,{children:["La acción ",e.jsx("code",{children:"*"})," en una regla HTTP concede todas las acciones definidas por ese esquema. Resérvala para roles administrativos controlados."]}),`
`,e.jsx(i.h2,{id:"provisiona-el-primer-administrador",children:"Provisiona el primer administrador"}),`
`,e.jsx(n,{type:"warn",title:"No existe un superusuario implícito",children:e.jsx(i.p,{children:"Una instalación sin un principal que coincida con tu identidad queda sin nadie capaz de administrar la PKI. Define el bootstrap y configura el IdP antes de exponer la plataforma."})}),`
`,e.jsxs(i.p,{children:["El chart crea por defecto un principal que busca el rol OIDC ",e.jsx("code",{children:"pki-admin"})," en ",e.jsx("code",{children:"realm_access.roles"})," y le concede las políticas de administración incluidas. El Job Helm de preinstalación y preactualización ejecuta las migraciones de authz, precarga las políticas y crea los principales de bootstrap antes de iniciar los servicios."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",title:"values.yaml",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  authorization"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    rolesClaim"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"realm_access.roles"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    roles"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"      admin"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"pki-admin"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"services"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  authz"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    jwkUrl"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"https://idp.example.com/realms/iot/protocol/openid-connect/certs"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    bootstrap"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      - "}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"principal_id"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"oidc:pki-admin"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        principal_name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"PKI Admin"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        principal_type"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"oidc"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        policy_ids"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"          - "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"        auth_config"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"          claims"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            - "}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"claim"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"realm_access.roles"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"              operator"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"contains"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"              value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"pki-admin"'})]})]})})}),`
`,e.jsx(i.p,{children:"Antes de instalar:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:["Crea el rol ",e.jsx("code",{children:"pki-admin"})," en tu proveedor OIDC."]}),`
`,e.jsx(i.li,{children:"Asígnalo a un grupo administrativo pequeño y verificable."}),`
`,e.jsx(i.li,{children:"Configura la URL JWKS interna que alcanzará authz."}),`
`,e.jsx(i.li,{children:"Mantén al menos dos identidades humanas de recuperación."}),`
`,e.jsx(i.li,{children:"Prueba acceso permitido y denegado con usuarios distintos."}),`
`]}),`
`,e.jsxs(i.p,{children:["El bootstrap es idempotente: si el principal ya existe, no lo reemplaza; solo añade las políticas configuradas que todavía falten. Por eso puedes mantenerlo en ",e.jsx("code",{children:"values.yaml"})," durante las actualizaciones."]}),`
`,e.jsx(i.h2,{id:"bootstrap-de-fastlane",children:"Bootstrap de Fastlane"}),`
`,e.jsxs(i.p,{children:["Fastlane instala un realm de Keycloak para laboratorio y crea el usuario ",e.jsx("code",{children:"lamassu"})," con contraseña temporal ",e.jsx("code",{children:"lamassu"}),", rol ",e.jsx("code",{children:"pki-admin"})," y acción obligatoria de cambio de contraseña. Su principal de bootstrap coincide por ",e.jsx("code",{children:"preferred_username=lamassu"}),"."]}),`
`,e.jsx(n,{type:"warn",title:"Credenciales solo para bootstrap",children:e.jsx(i.p,{children:"Cambia la contraseña en el primer acceso. No reutilices este usuario ni el IdP de ejemplo como diseño de producción."})}),`
`,e.jsx(i.h2,{id:"operación-segura",children:"Operación segura"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Concede políticas a grupos o identidades técnicas, no a claims ambiguos."}),`
`,e.jsx(i.li,{children:"Desactiva un principal cuando deba perder acceso de inmediato."}),`
`,e.jsx(i.li,{children:"Separa administración de PKI, operación de dispositivos y automatizaciones."}),`
`,e.jsx(i.li,{children:"Revisa los grants tras cambios en el proveedor OIDC."}),`
`,e.jsxs(i.li,{children:["Mantén ",e.jsx("code",{children:"failOpen: false"})," salvo una decisión de riesgo explícita."]}),`
`,e.jsx(i.li,{children:"Conserva un procedimiento probado para recuperar acceso sin desactivar autorización."}),`
`]}),`
`,e.jsx(i.h2,{id:"diagnóstico-rápido",children:"Diagnóstico rápido"}),`
`,e.jsxs(i.p,{children:["Un ",e.jsx("code",{children:"401"})," suele indicar que el Gateway no pudo validar la autenticación. Revisa emisor, audiencia, expiración y JWKS."]}),`
`,e.jsxs(i.p,{children:["Un ",e.jsx("code",{children:"403"})," indica normalmente que la identidad se autenticó, pero ningún principal activo y sus políticas autorizaron la acción. Comprueba claims reales del token, regla de coincidencia, grants y acción solicitada."]}),`
`,e.jsxs(i.p,{children:["Si todas las rutas protegidas fallan, verifica la salud y conectividad de authz, su acceso a PostgreSQL y la URL JWKS. Continúa con ",e.jsx(i.a,{href:"/docs/platform/pki/troubleshooting",children:"Resolución de problemas"}),"."]})]})}function p(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(s,{...a})}):s(a)}function r(a,i){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}export{c as _markdown,p as default,l as frontmatter,t as structuredData,d as toc};
