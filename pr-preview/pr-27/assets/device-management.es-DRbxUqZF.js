import{j as e}from"./index-prc0XQdj.js";let c=`

Esta guía se dirige al operador de una flota. Necesitas permisos sobre dispositivos, DMS y certificados para las acciones que vayas a realizar. Una flota se organiza mediante esos recursos, etiquetas y metadatos; no se crea un objeto independiente de «flota».

Cada dispositivo tiene un \`Device ID\`, un DMS propietario (\`dms_owner\`) y, cuando está aprovisionado, un slot de identidad con una versión activa y versiones anteriores. En los flujos descritos, mantén el \`Common Name\` de la CSR y del certificado igual al \`Device ID\`: la vinculación utiliza ese CN para actualizar el dispositivo.

Estados del dispositivo [#estados-del-dispositivo]

| Vista operativa     | Interpretación                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------- |
| **No Identity**     | Hay registro, pero todavía no hay identidad asociada.                                        |
| **Active**          | El slot está activo; comprueba además las fechas, estado y usos del certificado.             |
| **Renewal Pending** | La identidad está en la ventana operativa de renovación.                                     |
| **Expiring Soon**   | Se aproxima al vencimiento según los umbrales configurados.                                  |
| **Expired**         | La identidad ha vencido.                                                                     |
| **Revoked**         | La identidad está marcada como revocada.                                                     |
| **Decommissioned**  | El registro está retirado y no vuelve al estado operativo mediante una actualización normal. |

Los estados de dispositivo, slot y [certificado](/docs/platform/pki/concepts/certificate-lifecycle) son distintos. Los eventos y trabajos pueden actualizar la vista después de guardar el certificado; una etiqueta **Active** no prueba aceptación por un consumidor.

Inspecciona un dispositivo [#inspecciona-un-dispositivo]

Filtra el inventario por ID, etiquetas y estado. Abre el detalle y registra DMS propietario, versión activa y serie del certificado actual.

* **Certificate History** relaciona versiones anteriores y actuales. Sustituir el slot no revoca por sí solo todas las versiones anteriores.
* **Device Event Timeline** ayuda a reconstruir altas, aprovisionamientos, renovaciones y cambios de estado. Un cambio puede haberse guardado aunque falle la persistencia de su evento; contrasta también el registro y los certificados.

Compara esos datos con la identidad instalada en el dispositivo. Un slot actualizado en Lamassu no instala archivos en el equipo remoto.

Registra un dispositivo manualmente [#registra-un-dispositivo-manualmente]

Utiliza este flujo para preparar inventario o asignar una identidad desde la consola. Necesitas un DMS existente.

<Steps>
  <Step>
    Crea el dispositivo [#crea-el-dispositivo]

    Desde **Managed Devices**, abre el registro. Confirma que el ID no exista en otro DMS: la búsqueda por ID no está limitada a una flota.
  </Step>

  <Step>
    Define su pertenencia [#define-su-pertenencia]

    Introduce el **Device ID** y selecciona el DMS que será su propietario. La etiqueta **Registration Authority** de la consola se refiere a ese DMS.
  </Step>

  <Step>
    Clasifica el dispositivo [#clasifica-el-dispositivo]

    Añade icono y etiquetas de modelo, entorno o ubicación según tu inventario.
  </Step>

  <Step>
    Verifica el alta [#verifica-el-alta]

    Vuelve a leer el dispositivo: debe tener el DMS previsto y estar en **No Identity**. Sigue [Registro manual](/docs/platform/iot-fleets/quickstarts/register-device) para completar la asignación.
  </Step>
</Steps>

Prerregistrar no demuestra que \`/simpleenroll\` vaya a admitir la solicitud. Revisa la interacción con \`enable_replaceable_enrollment\` en [Estrategias de aprovisionamiento](/docs/platform/iot-fleets/enrollment/provisioning-strategies).

Asigna una identidad manualmente [#asigna-una-identidad-manualmente]

Desde **No Identity**, utiliza **Assign Identity**:

1. Elige un certificado activo, vigente y adecuado para el consumidor, con \`CN\` exactamente igual al \`Device ID\`.
2. Si no existe, **Issue New Instead** permite iniciar una emisión con la CA prevista. Revisa primero el [perfil](/docs/platform/pki/certificate-profiles).
3. Confirma y vuelve a consultar serie, versión activa e historial.
4. Instala la pareja clave/certificado y las intermedias necesarias en el dispositivo, y prueba su uso.

Emitir, vincular e instalar son pasos distintos. Si falla la operación, comprueba cuáles se guardaron antes de repetirla.

Revoca la identidad actual [#revoca-la-identidad-actual]

Localiza la serie activa en el historial y revócala con una razón apropiada. Comprueba registro, publicación OCSP/CRL y rechazo de una conexión nueva en el consumidor con la [guía de certificados](/docs/platform/pki/certificates).

La revocación no elimina el dispositivo. Tampoco habilita automáticamente una nueva inscripción: la recuperación depende de su credencial, estado y política DMS. \`CertificateHold\` puede reactivarse bajo las condiciones de PKI; otras razones bloquean cambios posteriores del certificado.

Retira un dispositivo [#retira-un-dispositivo]

Antes de **Decommission**, inventaría identidades activas y anteriores, conexiones y permisos del destino. Prepara su retirada en el consumidor.

El backend guarda **Decommissioned** e intenta revocar el certificado de la versión activa con \`CessationOfOperation\` si el slot no estaba expirado o revocado. No recorre todo el historial. La revocación diferida puede fallar después de guardar la baja; verifica su resultado por serie.

<Callout type="warn" title="Comprueba la retirada completa">
  El estado retirado protege las actualizaciones normales del dispositivo y su slot. No constituye una garantía de que toda solicitud EST sea rechazada antes de emitir: la vinculación puede omitir un dispositivo retirado sin devolver error. Confirma que no quedan certificados o permisos utilizables y bloquea nuevas admisiones en el control correspondiente.
</Callout>

Conserva los registros según tu política de auditoría. No reutilices un ID retirado para ocultar el cambio de equipo.

Automatiza el enrolamiento [#automatiza-el-enrolamiento]

<Cards>
  <Card title="Enrola y conecta un dispositivo" description="Obtén una identidad desde el cliente y prueba mTLS." href="/docs/platform/iot-fleets/quickstarts/enroll-device" />

  <Card title="Renovación y recuperación" description="Instala el sucesor y trata fallos sin perder el estado conocido." href="/docs/platform/iot-fleets/enrollment/renewal-and-recovery" />
</Cards>
`,u={title:"Dispositivos e identidades",description:"Registra, inspecciona y retira dispositivos comprobando su identidad actual y su historial."},p={contents:[{heading:void 0,content:"Esta guía se dirige al operador de una flota. Necesitas permisos sobre dispositivos, DMS y certificados para las acciones que vayas a realizar. Una flota se organiza mediante esos recursos, etiquetas y metadatos; no se crea un objeto independiente de «flota»."},{heading:void 0,content:"Cada dispositivo tiene un `Device ID`, un DMS propietario (`dms_owner`) y, cuando está aprovisionado, un slot de identidad con una versión activa y versiones anteriores. En los flujos descritos, mantén el `Common Name` de la CSR y del certificado igual al `Device ID`: la vinculación utiliza ese CN para actualizar el dispositivo."},{heading:"estados-del-dispositivo",content:"Vista operativa"},{heading:"estados-del-dispositivo",content:"Interpretación"},{heading:"estados-del-dispositivo",content:"**No Identity**"},{heading:"estados-del-dispositivo",content:"Hay registro, pero todavía no hay identidad asociada."},{heading:"estados-del-dispositivo",content:"**Active**"},{heading:"estados-del-dispositivo",content:"El slot está activo; comprueba además las fechas, estado y usos del certificado."},{heading:"estados-del-dispositivo",content:"**Renewal Pending**"},{heading:"estados-del-dispositivo",content:"La identidad está en la ventana operativa de renovación."},{heading:"estados-del-dispositivo",content:"**Expiring Soon**"},{heading:"estados-del-dispositivo",content:"Se aproxima al vencimiento según los umbrales configurados."},{heading:"estados-del-dispositivo",content:"**Expired**"},{heading:"estados-del-dispositivo",content:"La identidad ha vencido."},{heading:"estados-del-dispositivo",content:"**Revoked**"},{heading:"estados-del-dispositivo",content:"La identidad está marcada como revocada."},{heading:"estados-del-dispositivo",content:"**Decommissioned**"},{heading:"estados-del-dispositivo",content:"El registro está retirado y no vuelve al estado operativo mediante una actualización normal."},{heading:"estados-del-dispositivo",content:"Los estados de dispositivo, slot y certificado son distintos. Los eventos y trabajos pueden actualizar la vista después de guardar el certificado; una etiqueta **Active** no prueba aceptación por un consumidor."},{heading:"inspecciona-un-dispositivo",content:"Filtra el inventario por ID, etiquetas y estado. Abre el detalle y registra DMS propietario, versión activa y serie del certificado actual."},{heading:"inspecciona-un-dispositivo",content:"**Certificate History** relaciona versiones anteriores y actuales. Sustituir el slot no revoca por sí solo todas las versiones anteriores."},{heading:"inspecciona-un-dispositivo",content:"**Device Event Timeline** ayuda a reconstruir altas, aprovisionamientos, renovaciones y cambios de estado. Un cambio puede haberse guardado aunque falle la persistencia de su evento; contrasta también el registro y los certificados."},{heading:"inspecciona-un-dispositivo",content:"Compara esos datos con la identidad instalada en el dispositivo. Un slot actualizado en Lamassu no instala archivos en el equipo remoto."},{heading:"registra-un-dispositivo-manualmente",content:"Utiliza este flujo para preparar inventario o asignar una identidad desde la consola. Necesitas un DMS existente."},{heading:"crea-el-dispositivo",content:"Desde **Managed Devices**, abre el registro. Confirma que el ID no exista en otro DMS: la búsqueda por ID no está limitada a una flota."},{heading:"define-su-pertenencia",content:"Introduce el **Device ID** y selecciona el DMS que será su propietario. La etiqueta **Registration Authority** de la consola se refiere a ese DMS."},{heading:"clasifica-el-dispositivo",content:"Añade icono y etiquetas de modelo, entorno o ubicación según tu inventario."},{heading:"verifica-el-alta",content:"Vuelve a leer el dispositivo: debe tener el DMS previsto y estar en **No Identity**. Sigue Registro manual para completar la asignación."},{heading:"verifica-el-alta",content:"Prerregistrar no demuestra que `/simpleenroll` vaya a admitir la solicitud. Revisa la interacción con `enable_replaceable_enrollment` en Estrategias de aprovisionamiento."},{heading:"asigna-una-identidad-manualmente",content:"Desde **No Identity**, utiliza **Assign Identity**:"},{heading:"asigna-una-identidad-manualmente",content:"Elige un certificado activo, vigente y adecuado para el consumidor, con `CN` exactamente igual al `Device ID`."},{heading:"asigna-una-identidad-manualmente",content:"Si no existe, **Issue New Instead** permite iniciar una emisión con la CA prevista. Revisa primero el perfil."},{heading:"asigna-una-identidad-manualmente",content:"Confirma y vuelve a consultar serie, versión activa e historial."},{heading:"asigna-una-identidad-manualmente",content:"Instala la pareja clave/certificado y las intermedias necesarias en el dispositivo, y prueba su uso."},{heading:"asigna-una-identidad-manualmente",content:"Emitir, vincular e instalar son pasos distintos. Si falla la operación, comprueba cuáles se guardaron antes de repetirla."},{heading:"revoca-la-identidad-actual",content:"Localiza la serie activa en el historial y revócala con una razón apropiada. Comprueba registro, publicación OCSP/CRL y rechazo de una conexión nueva en el consumidor con la guía de certificados."},{heading:"revoca-la-identidad-actual",content:"La revocación no elimina el dispositivo. Tampoco habilita automáticamente una nueva inscripción: la recuperación depende de su credencial, estado y política DMS. `CertificateHold` puede reactivarse bajo las condiciones de PKI; otras razones bloquean cambios posteriores del certificado."},{heading:"retira-un-dispositivo",content:"Antes de **Decommission**, inventaría identidades activas y anteriores, conexiones y permisos del destino. Prepara su retirada en el consumidor."},{heading:"retira-un-dispositivo",content:"El backend guarda **Decommissioned** e intenta revocar el certificado de la versión activa con `CessationOfOperation` si el slot no estaba expirado o revocado. No recorre todo el historial. La revocación diferida puede fallar después de guardar la baja; verifica su resultado por serie."},{heading:"retira-un-dispositivo",content:"El estado retirado protege las actualizaciones normales del dispositivo y su slot. No constituye una garantía de que toda solicitud EST sea rechazada antes de emitir: la vinculación puede omitir un dispositivo retirado sin devolver error. Confirma que no quedan certificados o permisos utilizables y bloquea nuevas admisiones en el control correspondiente."},{heading:"retira-un-dispositivo",content:"Conserva los registros según tu política de auditoría. No reutilices un ID retirado para ocultar el cambio de equipo."},{heading:"automatiza-el-enrolamiento",content:'<Card title="Enrola y conecta un dispositivo" description="Obtén una identidad desde el cliente y prueba mTLS." href="/docs/platform/iot-fleets/quickstarts/enroll-device" />'},{heading:"automatiza-el-enrolamiento",content:'<Card title="Renovación y recuperación" description="Instala el sucesor y trata fallos sin perder el estado conocido." href="/docs/platform/iot-fleets/enrollment/renewal-and-recovery" />'}],headings:[{id:"estados-del-dispositivo",content:"Estados del dispositivo"},{id:"inspecciona-un-dispositivo",content:"Inspecciona un dispositivo"},{id:"registra-un-dispositivo-manualmente",content:"Registra un dispositivo manualmente"},{id:"crea-el-dispositivo",content:"Crea el dispositivo"},{id:"define-su-pertenencia",content:"Define su pertenencia"},{id:"clasifica-el-dispositivo",content:"Clasifica el dispositivo"},{id:"verifica-el-alta",content:"Verifica el alta"},{id:"asigna-una-identidad-manualmente",content:"Asigna una identidad manualmente"},{id:"revoca-la-identidad-actual",content:"Revoca la identidad actual"},{id:"retira-un-dispositivo",content:"Retira un dispositivo"},{id:"automatiza-el-enrolamiento",content:"Automatiza el enrolamiento"}]};const v=[{depth:2,url:"#estados-del-dispositivo",title:e.jsx(e.Fragment,{children:"Estados del dispositivo"})},{depth:2,url:"#inspecciona-un-dispositivo",title:e.jsx(e.Fragment,{children:"Inspecciona un dispositivo"})},{depth:2,url:"#registra-un-dispositivo-manualmente",title:e.jsx(e.Fragment,{children:"Registra un dispositivo manualmente"})},{depth:3,url:"#crea-el-dispositivo",title:e.jsx(e.Fragment,{children:"Crea el dispositivo"})},{depth:3,url:"#define-su-pertenencia",title:e.jsx(e.Fragment,{children:"Define su pertenencia"})},{depth:3,url:"#clasifica-el-dispositivo",title:e.jsx(e.Fragment,{children:"Clasifica el dispositivo"})},{depth:3,url:"#verifica-el-alta",title:e.jsx(e.Fragment,{children:"Verifica el alta"})},{depth:2,url:"#asigna-una-identidad-manualmente",title:e.jsx(e.Fragment,{children:"Asigna una identidad manualmente"})},{depth:2,url:"#revoca-la-identidad-actual",title:e.jsx(e.Fragment,{children:"Revoca la identidad actual"})},{depth:2,url:"#retira-un-dispositivo",title:e.jsx(e.Fragment,{children:"Retira un dispositivo"})},{depth:2,url:"#automatiza-el-enrolamiento",title:e.jsx(e.Fragment,{children:"Automatiza el enrolamiento"})}];function l(a){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...a.components},{Callout:s,Card:t,Cards:r,Step:n,Steps:d}=i;return s||o("Callout"),t||o("Card"),r||o("Cards"),n||o("Step"),d||o("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"Esta guía se dirige al operador de una flota. Necesitas permisos sobre dispositivos, DMS y certificados para las acciones que vayas a realizar. Una flota se organiza mediante esos recursos, etiquetas y metadatos; no se crea un objeto independiente de «flota»."}),`
`,e.jsxs(i.p,{children:["Cada dispositivo tiene un ",e.jsx(i.code,{children:"Device ID"}),", un DMS propietario (",e.jsx(i.code,{children:"dms_owner"}),") y, cuando está aprovisionado, un slot de identidad con una versión activa y versiones anteriores. En los flujos descritos, mantén el ",e.jsx(i.code,{children:"Common Name"})," de la CSR y del certificado igual al ",e.jsx(i.code,{children:"Device ID"}),": la vinculación utiliza ese CN para actualizar el dispositivo."]}),`
`,e.jsx(i.h2,{id:"estados-del-dispositivo",children:"Estados del dispositivo"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Vista operativa"}),e.jsx(i.th,{children:"Interpretación"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"No Identity"})}),e.jsx(i.td,{children:"Hay registro, pero todavía no hay identidad asociada."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Active"})}),e.jsx(i.td,{children:"El slot está activo; comprueba además las fechas, estado y usos del certificado."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Renewal Pending"})}),e.jsx(i.td,{children:"La identidad está en la ventana operativa de renovación."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Expiring Soon"})}),e.jsx(i.td,{children:"Se aproxima al vencimiento según los umbrales configurados."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Expired"})}),e.jsx(i.td,{children:"La identidad ha vencido."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Revoked"})}),e.jsx(i.td,{children:"La identidad está marcada como revocada."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Decommissioned"})}),e.jsx(i.td,{children:"El registro está retirado y no vuelve al estado operativo mediante una actualización normal."})]})]})]}),`
`,e.jsxs(i.p,{children:["Los estados de dispositivo, slot y ",e.jsx(i.a,{href:"/docs/platform/pki/concepts/certificate-lifecycle",children:"certificado"})," son distintos. Los eventos y trabajos pueden actualizar la vista después de guardar el certificado; una etiqueta ",e.jsx(i.strong,{children:"Active"})," no prueba aceptación por un consumidor."]}),`
`,e.jsx(i.h2,{id:"inspecciona-un-dispositivo",children:"Inspecciona un dispositivo"}),`
`,e.jsx(i.p,{children:"Filtra el inventario por ID, etiquetas y estado. Abre el detalle y registra DMS propietario, versión activa y serie del certificado actual."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Certificate History"})," relaciona versiones anteriores y actuales. Sustituir el slot no revoca por sí solo todas las versiones anteriores."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Device Event Timeline"})," ayuda a reconstruir altas, aprovisionamientos, renovaciones y cambios de estado. Un cambio puede haberse guardado aunque falle la persistencia de su evento; contrasta también el registro y los certificados."]}),`
`]}),`
`,e.jsx(i.p,{children:"Compara esos datos con la identidad instalada en el dispositivo. Un slot actualizado en Lamassu no instala archivos en el equipo remoto."}),`
`,e.jsx(i.h2,{id:"registra-un-dispositivo-manualmente",children:"Registra un dispositivo manualmente"}),`
`,e.jsx(i.p,{children:"Utiliza este flujo para preparar inventario o asignar una identidad desde la consola. Necesitas un DMS existente."}),`
`,e.jsxs(d,{children:[e.jsxs(n,{children:[e.jsx(i.h3,{id:"crea-el-dispositivo",children:"Crea el dispositivo"}),e.jsxs(i.p,{children:["Desde ",e.jsx(i.strong,{children:"Managed Devices"}),", abre el registro. Confirma que el ID no exista en otro DMS: la búsqueda por ID no está limitada a una flota."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"define-su-pertenencia",children:"Define su pertenencia"}),e.jsxs(i.p,{children:["Introduce el ",e.jsx(i.strong,{children:"Device ID"})," y selecciona el DMS que será su propietario. La etiqueta ",e.jsx(i.strong,{children:"Registration Authority"})," de la consola se refiere a ese DMS."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"clasifica-el-dispositivo",children:"Clasifica el dispositivo"}),e.jsx(i.p,{children:"Añade icono y etiquetas de modelo, entorno o ubicación según tu inventario."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"verifica-el-alta",children:"Verifica el alta"}),e.jsxs(i.p,{children:["Vuelve a leer el dispositivo: debe tener el DMS previsto y estar en ",e.jsx(i.strong,{children:"No Identity"}),". Sigue ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/quickstarts/register-device",children:"Registro manual"})," para completar la asignación."]})]})]}),`
`,e.jsxs(i.p,{children:["Prerregistrar no demuestra que ",e.jsx(i.code,{children:"/simpleenroll"})," vaya a admitir la solicitud. Revisa la interacción con ",e.jsx(i.code,{children:"enable_replaceable_enrollment"})," en ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/enrollment/provisioning-strategies",children:"Estrategias de aprovisionamiento"}),"."]}),`
`,e.jsx(i.h2,{id:"asigna-una-identidad-manualmente",children:"Asigna una identidad manualmente"}),`
`,e.jsxs(i.p,{children:["Desde ",e.jsx(i.strong,{children:"No Identity"}),", utiliza ",e.jsx(i.strong,{children:"Assign Identity"}),":"]}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:["Elige un certificado activo, vigente y adecuado para el consumidor, con ",e.jsx(i.code,{children:"CN"})," exactamente igual al ",e.jsx(i.code,{children:"Device ID"}),"."]}),`
`,e.jsxs(i.li,{children:["Si no existe, ",e.jsx(i.strong,{children:"Issue New Instead"})," permite iniciar una emisión con la CA prevista. Revisa primero el ",e.jsx(i.a,{href:"/docs/platform/pki/certificate-profiles",children:"perfil"}),"."]}),`
`,e.jsx(i.li,{children:"Confirma y vuelve a consultar serie, versión activa e historial."}),`
`,e.jsx(i.li,{children:"Instala la pareja clave/certificado y las intermedias necesarias en el dispositivo, y prueba su uso."}),`
`]}),`
`,e.jsx(i.p,{children:"Emitir, vincular e instalar son pasos distintos. Si falla la operación, comprueba cuáles se guardaron antes de repetirla."}),`
`,e.jsx(i.h2,{id:"revoca-la-identidad-actual",children:"Revoca la identidad actual"}),`
`,e.jsxs(i.p,{children:["Localiza la serie activa en el historial y revócala con una razón apropiada. Comprueba registro, publicación OCSP/CRL y rechazo de una conexión nueva en el consumidor con la ",e.jsx(i.a,{href:"/docs/platform/pki/certificates",children:"guía de certificados"}),"."]}),`
`,e.jsxs(i.p,{children:["La revocación no elimina el dispositivo. Tampoco habilita automáticamente una nueva inscripción: la recuperación depende de su credencial, estado y política DMS. ",e.jsx(i.code,{children:"CertificateHold"})," puede reactivarse bajo las condiciones de PKI; otras razones bloquean cambios posteriores del certificado."]}),`
`,e.jsx(i.h2,{id:"retira-un-dispositivo",children:"Retira un dispositivo"}),`
`,e.jsxs(i.p,{children:["Antes de ",e.jsx(i.strong,{children:"Decommission"}),", inventaría identidades activas y anteriores, conexiones y permisos del destino. Prepara su retirada en el consumidor."]}),`
`,e.jsxs(i.p,{children:["El backend guarda ",e.jsx(i.strong,{children:"Decommissioned"})," e intenta revocar el certificado de la versión activa con ",e.jsx(i.code,{children:"CessationOfOperation"})," si el slot no estaba expirado o revocado. No recorre todo el historial. La revocación diferida puede fallar después de guardar la baja; verifica su resultado por serie."]}),`
`,e.jsx(s,{type:"warn",title:"Comprueba la retirada completa",children:e.jsx(i.p,{children:"El estado retirado protege las actualizaciones normales del dispositivo y su slot. No constituye una garantía de que toda solicitud EST sea rechazada antes de emitir: la vinculación puede omitir un dispositivo retirado sin devolver error. Confirma que no quedan certificados o permisos utilizables y bloquea nuevas admisiones en el control correspondiente."})}),`
`,e.jsx(i.p,{children:"Conserva los registros según tu política de auditoría. No reutilices un ID retirado para ocultar el cambio de equipo."}),`
`,e.jsx(i.h2,{id:"automatiza-el-enrolamiento",children:"Automatiza el enrolamiento"}),`
`,e.jsxs(r,{children:[e.jsx(t,{title:"Enrola y conecta un dispositivo",description:"Obtén una identidad desde el cliente y prueba mTLS.",href:"/docs/platform/iot-fleets/quickstarts/enroll-device"}),e.jsx(t,{title:"Renovación y recuperación",description:"Instala el sucesor y trata fallos sin perder el estado conocido.",href:"/docs/platform/iot-fleets/enrollment/renewal-and-recovery"})]})]})}function m(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(l,{...a})}):l(a)}function o(a,i){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}const g=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:m,frontmatter:u,structuredData:p,toc:v},Symbol.toStringTag,{value:"Module"}));export{g as _};
