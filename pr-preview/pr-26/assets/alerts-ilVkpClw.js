import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let r=`

Las suscripciones convierten los eventos de Lamassu en notificaciones accionables. Puedes avisar a un equipo, alimentar un sistema de incidentes o activar una automatización cuando cambia una CA, un certificado o un dispositivo.

Cómo funciona [#cómo-funciona]

1. Un servicio publica un evento de dominio.
2. Lamassu evalúa las suscripciones asociadas a ese tipo de evento.
3. El filtro de cada suscripción decide si debe notificarse.
4. Lamassu entrega el evento al canal configurado.

El inventario de eventos muestra cuándo se observó cada tipo por última vez, cuántas veces ha ocurrido y cuántas suscripciones tiene. Puedes expandir un evento para inspeccionar un ejemplo de su payload JSON antes de crear el filtro.

Canales disponibles [#canales-disponibles]

* **Email** envía avisos a una persona o lista operativa. Solo requiere la dirección de destino.
* **Microsoft Teams** publica la notificación en un canal mediante su URL de webhook.
* **Webhook** entrega el evento a una automatización, SIEM o sistema de incidentes mediante \`POST\` o \`PUT\`.

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

    * **None** notifica todas las instancias del evento.
    * **JSON Path** evalúa uno o varios campos concretos.
    * **JSON Schema** acepta únicamente payloads con una estructura determinada.
    * **JavaScript** permite expresar lógica personalizada.

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

* **Autoridades:** \`ca.create\`, \`ca.import\`, \`ca.reissue\` y \`ca.delete\`.
* **Certificados:** \`ca.sign.certificate\` y \`certificate.delete\`.
* **Perfiles:** \`profile.create\`, \`profile.update\` y \`profile.delete\`.
* **Enrolamiento:** \`dms.create\`, \`dms.update\`, \`dms.enroll\` y \`dms.reenroll\`.
* **Dispositivos:** \`device.create\`, \`device.identity.update\` y \`device.status.update\`.
* **Validación:** \`va.role.crl.create\`.
* **Claves:** \`kms.create\`, \`kms.import\`, \`kms.sign.message\` y \`kms.delete\`.

Utiliza el catálogo que muestra la consola como fuente para los tipos disponibles en la versión que tienes desplegada.
`,l={title:"Alertas y suscripciones",description:"Envía eventos de la PKI a personas y sistemas externos.",sidebar:{group:"Otros"}},d={contents:[{heading:void 0,content:"Las suscripciones convierten los eventos de Lamassu en notificaciones accionables. Puedes avisar a un equipo, alimentar un sistema de incidentes o activar una automatización cuando cambia una CA, un certificado o un dispositivo."},{heading:"cómo-funciona",content:"Un servicio publica un evento de dominio."},{heading:"cómo-funciona",content:"Lamassu evalúa las suscripciones asociadas a ese tipo de evento."},{heading:"cómo-funciona",content:"El filtro de cada suscripción decide si debe notificarse."},{heading:"cómo-funciona",content:"Lamassu entrega el evento al canal configurado."},{heading:"cómo-funciona",content:"El inventario de eventos muestra cuándo se observó cada tipo por última vez, cuántas veces ha ocurrido y cuántas suscripciones tiene. Puedes expandir un evento para inspeccionar un ejemplo de su payload JSON antes de crear el filtro."},{heading:"canales-disponibles",content:"**Email** envía avisos a una persona o lista operativa. Solo requiere la dirección de destino."},{heading:"canales-disponibles",content:"**Microsoft Teams** publica la notificación en un canal mediante su URL de webhook."},{heading:"canales-disponibles",content:"**Webhook** entrega el evento a una automatización, SIEM o sistema de incidentes mediante `POST` o `PUT`."},{heading:"elige-el-evento",content:"Abre **Alerts**, localiza el tipo de evento y selecciona **Subscribe**. Revisa el último ejemplo JSON para identificar los campos que necesitarás filtrar."},{heading:"configura-el-destino",content:"Selecciona Email, Microsoft Teams o Webhook e introduce los datos del canal."},{heading:"limita-las-notificaciones",content:"Añade un filtro si no quieres recibir todas las instancias del evento."},{heading:"limita-las-notificaciones",content:"**None** notifica todas las instancias del evento."},{heading:"limita-las-notificaciones",content:"**JSON Path** evalúa uno o varios campos concretos."},{heading:"limita-las-notificaciones",content:"**JSON Schema** acepta únicamente payloads con una estructura determinada."},{heading:"limita-las-notificaciones",content:"**JavaScript** permite expresar lógica personalizada."},{heading:"limita-las-notificaciones",content:'Por ejemplo, `function (event) { return event.data.status == "NO_IDENTITY"; }` limita una suscripción a dispositivos sin identidad.'},{heading:"revisa-y-activa",content:"Comprueba el evento, el canal y el filtro en el resumen. Selecciona **Confirm Subscription** para comenzar la entrega."},{heading:"gestiona-una-suscripción",content:"Abre una suscripción existente para consultar su destino y filtro, modificar la configuración o seleccionar **Unsubscribe**. Elimina las suscripciones que ya no tengan un propietario operativo para evitar entregas ignoradas o endpoints obsoletos."},{heading:"familias-de-eventos",content:"**Autoridades:** `ca.create`, `ca.import`, `ca.reissue` y `ca.delete`."},{heading:"familias-de-eventos",content:"**Certificados:** `ca.sign.certificate` y `certificate.delete`."},{heading:"familias-de-eventos",content:"**Perfiles:** `profile.create`, `profile.update` y `profile.delete`."},{heading:"familias-de-eventos",content:"**Enrolamiento:** `dms.create`, `dms.update`, `dms.enroll` y `dms.reenroll`."},{heading:"familias-de-eventos",content:"**Dispositivos:** `device.create`, `device.identity.update` y `device.status.update`."},{heading:"familias-de-eventos",content:"**Validación:** `va.role.crl.create`."},{heading:"familias-de-eventos",content:"**Claves:** `kms.create`, `kms.import`, `kms.sign.message` y `kms.delete`."},{heading:"familias-de-eventos",content:"Utiliza el catálogo que muestra la consola como fuente para los tipos disponibles en la versión que tienes desplegada."}],headings:[{id:"cómo-funciona",content:"Cómo funciona"},{id:"canales-disponibles",content:"Canales disponibles"},{id:"crea-una-suscripción",content:"Crea una suscripción"},{id:"elige-el-evento",content:"Elige el evento"},{id:"configura-el-destino",content:"Configura el destino"},{id:"limita-las-notificaciones",content:"Limita las notificaciones"},{id:"revisa-y-activa",content:"Revisa y activa"},{id:"gestiona-una-suscripción",content:"Gestiona una suscripción"},{id:"familias-de-eventos",content:"Familias de eventos"}]};const u=[{depth:2,url:"#cómo-funciona",title:e.jsx(e.Fragment,{children:"Cómo funciona"})},{depth:2,url:"#canales-disponibles",title:e.jsx(e.Fragment,{children:"Canales disponibles"})},{depth:2,url:"#crea-una-suscripción",title:e.jsx(e.Fragment,{children:"Crea una suscripción"})},{depth:3,url:"#elige-el-evento",title:e.jsx(e.Fragment,{children:"Elige el evento"})},{depth:3,url:"#configura-el-destino",title:e.jsx(e.Fragment,{children:"Configura el destino"})},{depth:3,url:"#limita-las-notificaciones",title:e.jsx(e.Fragment,{children:"Limita las notificaciones"})},{depth:3,url:"#revisa-y-activa",title:e.jsx(e.Fragment,{children:"Revisa y activa"})},{depth:2,url:"#gestiona-una-suscripción",title:e.jsx(e.Fragment,{children:"Gestiona una suscripción"})},{depth:2,url:"#familias-de-eventos",title:e.jsx(e.Fragment,{children:"Familias de eventos"})}];function o(i){const n={code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...i.components},{Step:a,Steps:s}=n;return a||t("Step"),s||t("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"Las suscripciones convierten los eventos de Lamassu en notificaciones accionables. Puedes avisar a un equipo, alimentar un sistema de incidentes o activar una automatización cuando cambia una CA, un certificado o un dispositivo."}),`
`,e.jsx(n.h2,{id:"cómo-funciona",children:"Cómo funciona"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Un servicio publica un evento de dominio."}),`
`,e.jsx(n.li,{children:"Lamassu evalúa las suscripciones asociadas a ese tipo de evento."}),`
`,e.jsx(n.li,{children:"El filtro de cada suscripción decide si debe notificarse."}),`
`,e.jsx(n.li,{children:"Lamassu entrega el evento al canal configurado."}),`
`]}),`
`,e.jsx(n.p,{children:"El inventario de eventos muestra cuándo se observó cada tipo por última vez, cuántas veces ha ocurrido y cuántas suscripciones tiene. Puedes expandir un evento para inspeccionar un ejemplo de su payload JSON antes de crear el filtro."}),`
`,e.jsx(n.h2,{id:"canales-disponibles",children:"Canales disponibles"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Email"})," envía avisos a una persona o lista operativa. Solo requiere la dirección de destino."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Microsoft Teams"})," publica la notificación en un canal mediante su URL de webhook."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Webhook"})," entrega el evento a una automatización, SIEM o sistema de incidentes mediante ",e.jsx(n.code,{children:"POST"})," o ",e.jsx(n.code,{children:"PUT"}),"."]}),`
`]}),`
`,e.jsx(n.h2,{id:"crea-una-suscripción",children:"Crea una suscripción"}),`
`,e.jsxs(s,{children:[e.jsxs(a,{children:[e.jsx(n.h3,{id:"elige-el-evento",children:"Elige el evento"}),e.jsxs(n.p,{children:["Abre ",e.jsx(n.strong,{children:"Alerts"}),", localiza el tipo de evento y selecciona ",e.jsx(n.strong,{children:"Subscribe"}),". Revisa el último ejemplo JSON para identificar los campos que necesitarás filtrar."]})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"configura-el-destino",children:"Configura el destino"}),e.jsx(n.p,{children:"Selecciona Email, Microsoft Teams o Webhook e introduce los datos del canal."})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"limita-las-notificaciones",children:"Limita las notificaciones"}),e.jsx(n.p,{children:"Añade un filtro si no quieres recibir todas las instancias del evento."}),e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"None"})," notifica todas las instancias del evento."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"JSON Path"})," evalúa uno o varios campos concretos."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"JSON Schema"})," acepta únicamente payloads con una estructura determinada."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"JavaScript"})," permite expresar lógica personalizada."]}),`
`]}),e.jsxs(n.p,{children:["Por ejemplo, ",e.jsx(n.code,{children:'function (event) { return event.data.status == "NO_IDENTITY"; }'})," limita una suscripción a dispositivos sin identidad."]})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"revisa-y-activa",children:"Revisa y activa"}),e.jsxs(n.p,{children:["Comprueba el evento, el canal y el filtro en el resumen. Selecciona ",e.jsx(n.strong,{children:"Confirm Subscription"})," para comenzar la entrega."]})]})]}),`
`,e.jsx(n.h2,{id:"gestiona-una-suscripción",children:"Gestiona una suscripción"}),`
`,e.jsxs(n.p,{children:["Abre una suscripción existente para consultar su destino y filtro, modificar la configuración o seleccionar ",e.jsx(n.strong,{children:"Unsubscribe"}),". Elimina las suscripciones que ya no tengan un propietario operativo para evitar entregas ignoradas o endpoints obsoletos."]}),`
`,e.jsx(n.h2,{id:"familias-de-eventos",children:"Familias de eventos"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Autoridades:"})," ",e.jsx(n.code,{children:"ca.create"}),", ",e.jsx(n.code,{children:"ca.import"}),", ",e.jsx(n.code,{children:"ca.reissue"})," y ",e.jsx(n.code,{children:"ca.delete"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Certificados:"})," ",e.jsx(n.code,{children:"ca.sign.certificate"})," y ",e.jsx(n.code,{children:"certificate.delete"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Perfiles:"})," ",e.jsx(n.code,{children:"profile.create"}),", ",e.jsx(n.code,{children:"profile.update"})," y ",e.jsx(n.code,{children:"profile.delete"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Enrolamiento:"})," ",e.jsx(n.code,{children:"dms.create"}),", ",e.jsx(n.code,{children:"dms.update"}),", ",e.jsx(n.code,{children:"dms.enroll"})," y ",e.jsx(n.code,{children:"dms.reenroll"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Dispositivos:"})," ",e.jsx(n.code,{children:"device.create"}),", ",e.jsx(n.code,{children:"device.identity.update"})," y ",e.jsx(n.code,{children:"device.status.update"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Validación:"})," ",e.jsx(n.code,{children:"va.role.crl.create"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Claves:"})," ",e.jsx(n.code,{children:"kms.create"}),", ",e.jsx(n.code,{children:"kms.import"}),", ",e.jsx(n.code,{children:"kms.sign.message"})," y ",e.jsx(n.code,{children:"kms.delete"}),"."]}),`
`]}),`
`,e.jsx(n.p,{children:"Utiliza el catálogo que muestra la consola como fuente para los tipos disponibles en la versión que tienes desplegada."})]})}function p(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(o,{...i})}):o(i)}function t(i,n){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{r as _markdown,p as default,l as frontmatter,d as structuredData,u as toc};
