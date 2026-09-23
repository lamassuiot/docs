import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let d=`

Las suscripciones convierten los eventos de Lamassu en notificaciones accionables. Puedes avisar a un equipo, alimentar un sistema de incidentes o activar una automatización cuando cambia una CA, un certificado o un dispositivo.

Cómo funciona [#cómo-funciona]

1. Un servicio publica un evento de dominio.
2. Lamassu evalúa las suscripciones asociadas a ese tipo de evento.
3. El filtro de cada suscripción decide si debe notificarse.
4. Lamassu entrega el evento al canal configurado.

El inventario de eventos muestra cuándo se observó cada tipo por última vez, cuántas veces ha ocurrido y cuántas suscripciones tiene. Puedes expandir un evento para inspeccionar un ejemplo de su payload JSON antes de crear el filtro.

Canales disponibles [#canales-disponibles]

| Canal           | Configuración                       | Uso habitual                                                  |
| --------------- | ----------------------------------- | ------------------------------------------------------------- |
| Email           | Dirección de destino                | Avisos para personas o listas operativas.                     |
| Microsoft Teams | Nombre y URL de webhook             | Notificaciones en un canal de colaboración.                   |
| Webhook         | Nombre, método \`POST\` o \`PUT\` y URL | Integración con automatización, SIEM o gestión de incidentes. |

Crea una suscripción [#crea-una-suscripción]

<Steps>
  <Step>
    Elige el evento [#elige-el-evento]

    Abre **Alerts**, localiza el tipo de evento y selecciona **Subscribe**. Revisa el último ejemplo JSON para identificar los campos que necesitarás filtrar.
  </Step>

  <Step>
    Configura el destino [#configura-el-destino]

    Selecciona Email, Microsoft Teams o Webhook e introduce los datos del canal.
  </Step>

  <Step>
    Limita las notificaciones [#limita-las-notificaciones]

    Añade un filtro si no quieres recibir todas las instancias del evento.

    | Filtro          | Cuándo utilizarlo                                             |
    | --------------- | ------------------------------------------------------------- |
    | **None**        | Cada instancia del evento es relevante.                       |
    | **JSON Path**   | Una condición depende de uno o varios campos concretos.       |
    | **JSON Schema** | Solo deben aceptarse payloads con una estructura determinada. |
    | **JavaScript**  | La condición necesita lógica personalizada.                   |

    Por ejemplo, \`function (event) { return event.data.status == "NO_IDENTITY"; }\` limita una suscripción a dispositivos sin identidad.
  </Step>

  <Step>
    Revisa y activa [#revisa-y-activa]

    Comprueba el evento, el canal y el filtro en el resumen. Selecciona **Confirm Subscription** para comenzar la entrega.
  </Step>
</Steps>

Gestiona una suscripción [#gestiona-una-suscripción]

Abre una suscripción existente para consultar su destino y filtro, modificar la configuración o seleccionar **Unsubscribe**. Elimina las suscripciones que ya no tengan un propietario operativo para evitar entregas ignoradas o endpoints obsoletos.

Familias de eventos [#familias-de-eventos]

| Área         | Ejemplos                                                          |
| ------------ | ----------------------------------------------------------------- |
| Autoridades  | \`ca.create\`, \`ca.import\`, \`ca.reissue\`, \`ca.delete\`               |
| Certificados | \`ca.sign.certificate\`, \`certificate.delete\`                       |
| Perfiles     | \`profile.create\`, \`profile.update\`, \`profile.delete\`              |
| Enrolamiento | \`dms.create\`, \`dms.update\`, \`dms.enroll\`, \`dms.reenroll\`          |
| Dispositivos | \`device.create\`, \`device.identity.update\`, \`device.status.update\` |
| Validación   | \`va.role.crl.create\`                                              |
| Claves       | \`kms.create\`, \`kms.import\`, \`kms.sign.message\`, \`kms.delete\`      |

Utiliza el catálogo que muestra la consola como fuente para los tipos disponibles en la versión que tienes desplegada.
`,r={title:"Alertas y suscripciones",description:"Envía eventos de la PKI a personas y sistemas externos.",sidebar:{group:"Otros"}},l={contents:[{heading:void 0,content:"Las suscripciones convierten los eventos de Lamassu en notificaciones accionables. Puedes avisar a un equipo, alimentar un sistema de incidentes o activar una automatización cuando cambia una CA, un certificado o un dispositivo."},{heading:"cómo-funciona",content:"Un servicio publica un evento de dominio."},{heading:"cómo-funciona",content:"Lamassu evalúa las suscripciones asociadas a ese tipo de evento."},{heading:"cómo-funciona",content:"El filtro de cada suscripción decide si debe notificarse."},{heading:"cómo-funciona",content:"Lamassu entrega el evento al canal configurado."},{heading:"cómo-funciona",content:"El inventario de eventos muestra cuándo se observó cada tipo por última vez, cuántas veces ha ocurrido y cuántas suscripciones tiene. Puedes expandir un evento para inspeccionar un ejemplo de su payload JSON antes de crear el filtro."},{heading:"canales-disponibles",content:"Canal"},{heading:"canales-disponibles",content:"Configuración"},{heading:"canales-disponibles",content:"Uso habitual"},{heading:"canales-disponibles",content:"Email"},{heading:"canales-disponibles",content:"Dirección de destino"},{heading:"canales-disponibles",content:"Avisos para personas o listas operativas."},{heading:"canales-disponibles",content:"Microsoft Teams"},{heading:"canales-disponibles",content:"Nombre y URL de webhook"},{heading:"canales-disponibles",content:"Notificaciones en un canal de colaboración."},{heading:"canales-disponibles",content:"Webhook"},{heading:"canales-disponibles",content:"Nombre, método `POST` o `PUT` y URL"},{heading:"canales-disponibles",content:"Integración con automatización, SIEM o gestión de incidentes."},{heading:"elige-el-evento",content:"Abre **Alerts**, localiza el tipo de evento y selecciona **Subscribe**. Revisa el último ejemplo JSON para identificar los campos que necesitarás filtrar."},{heading:"configura-el-destino",content:"Selecciona Email, Microsoft Teams o Webhook e introduce los datos del canal."},{heading:"limita-las-notificaciones",content:"Añade un filtro si no quieres recibir todas las instancias del evento."},{heading:"limita-las-notificaciones",content:"Filtro"},{heading:"limita-las-notificaciones",content:"Cuándo utilizarlo"},{heading:"limita-las-notificaciones",content:"**None**"},{heading:"limita-las-notificaciones",content:"Cada instancia del evento es relevante."},{heading:"limita-las-notificaciones",content:"**JSON Path**"},{heading:"limita-las-notificaciones",content:"Una condición depende de uno o varios campos concretos."},{heading:"limita-las-notificaciones",content:"**JSON Schema**"},{heading:"limita-las-notificaciones",content:"Solo deben aceptarse payloads con una estructura determinada."},{heading:"limita-las-notificaciones",content:"**JavaScript**"},{heading:"limita-las-notificaciones",content:"La condición necesita lógica personalizada."},{heading:"limita-las-notificaciones",content:'Por ejemplo, `function (event) { return event.data.status == "NO_IDENTITY"; }` limita una suscripción a dispositivos sin identidad.'},{heading:"revisa-y-activa",content:"Comprueba el evento, el canal y el filtro en el resumen. Selecciona **Confirm Subscription** para comenzar la entrega."},{heading:"gestiona-una-suscripción",content:"Abre una suscripción existente para consultar su destino y filtro, modificar la configuración o seleccionar **Unsubscribe**. Elimina las suscripciones que ya no tengan un propietario operativo para evitar entregas ignoradas o endpoints obsoletos."},{heading:"familias-de-eventos",content:"Área"},{heading:"familias-de-eventos",content:"Ejemplos"},{heading:"familias-de-eventos",content:"Autoridades"},{heading:"familias-de-eventos",content:"`ca.create`, `ca.import`, `ca.reissue`, `ca.delete`"},{heading:"familias-de-eventos",content:"Certificados"},{heading:"familias-de-eventos",content:"`ca.sign.certificate`, `certificate.delete`"},{heading:"familias-de-eventos",content:"Perfiles"},{heading:"familias-de-eventos",content:"`profile.create`, `profile.update`, `profile.delete`"},{heading:"familias-de-eventos",content:"Enrolamiento"},{heading:"familias-de-eventos",content:"`dms.create`, `dms.update`, `dms.enroll`, `dms.reenroll`"},{heading:"familias-de-eventos",content:"Dispositivos"},{heading:"familias-de-eventos",content:"`device.create`, `device.identity.update`, `device.status.update`"},{heading:"familias-de-eventos",content:"Validación"},{heading:"familias-de-eventos",content:"`va.role.crl.create`"},{heading:"familias-de-eventos",content:"Claves"},{heading:"familias-de-eventos",content:"`kms.create`, `kms.import`, `kms.sign.message`, `kms.delete`"},{heading:"familias-de-eventos",content:"Utiliza el catálogo que muestra la consola como fuente para los tipos disponibles en la versión que tienes desplegada."}],headings:[{id:"cómo-funciona",content:"Cómo funciona"},{id:"canales-disponibles",content:"Canales disponibles"},{id:"crea-una-suscripción",content:"Crea una suscripción"},{id:"elige-el-evento",content:"Elige el evento"},{id:"configura-el-destino",content:"Configura el destino"},{id:"limita-las-notificaciones",content:"Limita las notificaciones"},{id:"revisa-y-activa",content:"Revisa y activa"},{id:"gestiona-una-suscripción",content:"Gestiona una suscripción"},{id:"familias-de-eventos",content:"Familias de eventos"}]};const u=[{depth:2,url:"#cómo-funciona",title:e.jsx(e.Fragment,{children:"Cómo funciona"})},{depth:2,url:"#canales-disponibles",title:e.jsx(e.Fragment,{children:"Canales disponibles"})},{depth:2,url:"#crea-una-suscripción",title:e.jsx(e.Fragment,{children:"Crea una suscripción"})},{depth:3,url:"#elige-el-evento",title:e.jsx(e.Fragment,{children:"Elige el evento"})},{depth:3,url:"#configura-el-destino",title:e.jsx(e.Fragment,{children:"Configura el destino"})},{depth:3,url:"#limita-las-notificaciones",title:e.jsx(e.Fragment,{children:"Limita las notificaciones"})},{depth:3,url:"#revisa-y-activa",title:e.jsx(e.Fragment,{children:"Revisa y activa"})},{depth:2,url:"#gestiona-una-suscripción",title:e.jsx(e.Fragment,{children:"Gestiona una suscripción"})},{depth:2,url:"#familias-de-eventos",title:e.jsx(e.Fragment,{children:"Familias de eventos"})}];function t(i){const n={code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...i.components},{Step:a,Steps:s}=n;return a||o("Step"),s||o("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"Las suscripciones convierten los eventos de Lamassu en notificaciones accionables. Puedes avisar a un equipo, alimentar un sistema de incidentes o activar una automatización cuando cambia una CA, un certificado o un dispositivo."}),`
`,e.jsx(n.h2,{id:"cómo-funciona",children:"Cómo funciona"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Un servicio publica un evento de dominio."}),`
`,e.jsx(n.li,{children:"Lamassu evalúa las suscripciones asociadas a ese tipo de evento."}),`
`,e.jsx(n.li,{children:"El filtro de cada suscripción decide si debe notificarse."}),`
`,e.jsx(n.li,{children:"Lamassu entrega el evento al canal configurado."}),`
`]}),`
`,e.jsx(n.p,{children:"El inventario de eventos muestra cuándo se observó cada tipo por última vez, cuántas veces ha ocurrido y cuántas suscripciones tiene. Puedes expandir un evento para inspeccionar un ejemplo de su payload JSON antes de crear el filtro."}),`
`,e.jsx(n.h2,{id:"canales-disponibles",children:"Canales disponibles"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Canal"}),e.jsx(n.th,{children:"Configuración"}),e.jsx(n.th,{children:"Uso habitual"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Email"}),e.jsx(n.td,{children:"Dirección de destino"}),e.jsx(n.td,{children:"Avisos para personas o listas operativas."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Microsoft Teams"}),e.jsx(n.td,{children:"Nombre y URL de webhook"}),e.jsx(n.td,{children:"Notificaciones en un canal de colaboración."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Webhook"}),e.jsxs(n.td,{children:["Nombre, método ",e.jsx(n.code,{children:"POST"})," o ",e.jsx(n.code,{children:"PUT"})," y URL"]}),e.jsx(n.td,{children:"Integración con automatización, SIEM o gestión de incidentes."})]})]})]}),`
`,e.jsx(n.h2,{id:"crea-una-suscripción",children:"Crea una suscripción"}),`
`,e.jsxs(s,{children:[e.jsxs(a,{children:[e.jsx(n.h3,{id:"elige-el-evento",children:"Elige el evento"}),e.jsxs(n.p,{children:["Abre ",e.jsx(n.strong,{children:"Alerts"}),", localiza el tipo de evento y selecciona ",e.jsx(n.strong,{children:"Subscribe"}),". Revisa el último ejemplo JSON para identificar los campos que necesitarás filtrar."]})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"configura-el-destino",children:"Configura el destino"}),e.jsx(n.p,{children:"Selecciona Email, Microsoft Teams o Webhook e introduce los datos del canal."})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"limita-las-notificaciones",children:"Limita las notificaciones"}),e.jsx(n.p,{children:"Añade un filtro si no quieres recibir todas las instancias del evento."}),e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Filtro"}),e.jsx(n.th,{children:"Cuándo utilizarlo"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"None"})}),e.jsx(n.td,{children:"Cada instancia del evento es relevante."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"JSON Path"})}),e.jsx(n.td,{children:"Una condición depende de uno o varios campos concretos."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"JSON Schema"})}),e.jsx(n.td,{children:"Solo deben aceptarse payloads con una estructura determinada."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"JavaScript"})}),e.jsx(n.td,{children:"La condición necesita lógica personalizada."})]})]})]}),e.jsxs(n.p,{children:["Por ejemplo, ",e.jsx(n.code,{children:'function (event) { return event.data.status == "NO_IDENTITY"; }'})," limita una suscripción a dispositivos sin identidad."]})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"revisa-y-activa",children:"Revisa y activa"}),e.jsxs(n.p,{children:["Comprueba el evento, el canal y el filtro en el resumen. Selecciona ",e.jsx(n.strong,{children:"Confirm Subscription"})," para comenzar la entrega."]})]})]}),`
`,e.jsx(n.h2,{id:"gestiona-una-suscripción",children:"Gestiona una suscripción"}),`
`,e.jsxs(n.p,{children:["Abre una suscripción existente para consultar su destino y filtro, modificar la configuración o seleccionar ",e.jsx(n.strong,{children:"Unsubscribe"}),". Elimina las suscripciones que ya no tengan un propietario operativo para evitar entregas ignoradas o endpoints obsoletos."]}),`
`,e.jsx(n.h2,{id:"familias-de-eventos",children:"Familias de eventos"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Área"}),e.jsx(n.th,{children:"Ejemplos"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Autoridades"}),e.jsxs(n.td,{children:[e.jsx(n.code,{children:"ca.create"}),", ",e.jsx(n.code,{children:"ca.import"}),", ",e.jsx(n.code,{children:"ca.reissue"}),", ",e.jsx(n.code,{children:"ca.delete"})]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Certificados"}),e.jsxs(n.td,{children:[e.jsx(n.code,{children:"ca.sign.certificate"}),", ",e.jsx(n.code,{children:"certificate.delete"})]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Perfiles"}),e.jsxs(n.td,{children:[e.jsx(n.code,{children:"profile.create"}),", ",e.jsx(n.code,{children:"profile.update"}),", ",e.jsx(n.code,{children:"profile.delete"})]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Enrolamiento"}),e.jsxs(n.td,{children:[e.jsx(n.code,{children:"dms.create"}),", ",e.jsx(n.code,{children:"dms.update"}),", ",e.jsx(n.code,{children:"dms.enroll"}),", ",e.jsx(n.code,{children:"dms.reenroll"})]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Dispositivos"}),e.jsxs(n.td,{children:[e.jsx(n.code,{children:"device.create"}),", ",e.jsx(n.code,{children:"device.identity.update"}),", ",e.jsx(n.code,{children:"device.status.update"})]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Validación"}),e.jsx(n.td,{children:e.jsx(n.code,{children:"va.role.crl.create"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Claves"}),e.jsxs(n.td,{children:[e.jsx(n.code,{children:"kms.create"}),", ",e.jsx(n.code,{children:"kms.import"}),", ",e.jsx(n.code,{children:"kms.sign.message"}),", ",e.jsx(n.code,{children:"kms.delete"})]})]})]})]}),`
`,e.jsx(n.p,{children:"Utiliza el catálogo que muestra la consola como fuente para los tipos disponibles en la versión que tienes desplegada."})]})}function p(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}function o(i,n){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{d as _markdown,p as default,r as frontmatter,l as structuredData,u as toc};
