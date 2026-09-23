import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let p=`

Un dispositivo gestionado representa una entidad de tu flota y conserva el historial de los certificados que ha utilizado. Lamassu separa el dispositivo de su identidad actual para que puedas renovar o sustituir certificados sin perder trazabilidad.

Estados del dispositivo [#estados-del-dispositivo]

| Estado              | Significado                                             |
| ------------------- | ------------------------------------------------------- |
| **Active**          | El dispositivo tiene una identidad válida.              |
| **No Identity**     | Está registrado, pero no tiene un certificado asociado. |
| **Renewal Pending** | Ha entrado en la ventana de renovación.                 |
| **Expiring Soon**   | Su certificado está próximo a expirar.                  |
| **Expired**         | La identidad ha superado su fecha de validez.           |
| **Revoked**         | El certificado actual se ha revocado.                   |
| **Decommissioned**  | El dispositivo se ha retirado de forma permanente.      |

El inventario permite filtrar por \`Device ID\`, etiquetas y estado.

Inspecciona un dispositivo [#inspecciona-un-dispositivo]

La vista de detalle separa dos perspectivas:

* **Certificate History** conserva todos los certificados asociados, con su número de serie, emisor, estado y periodo de validez.
* **Device Event Timeline** ordena cronológicamente registros, enrolamientos, renovaciones y cambios de estado.

Utiliza el historial para auditoría y la línea de tiempo para reconstruir un incidente o diagnosticar una transición inesperada.

Registra un dispositivo manualmente [#registra-un-dispositivo-manualmente]

El registro previo es útil cuando la política exige que el dispositivo exista antes de solicitar su primer certificado.

<Steps>
  <Step>
    Crea el dispositivo [#crea-el-dispositivo]

    Desde **Managed Devices**, abre el formulario de registro.
  </Step>

  <Step>
    Define su pertenencia [#define-su-pertenencia]

    Introduce un **Device ID** único y selecciona el DMS que aplicará las políticas de enrolamiento y renovación.
  </Step>

  <Step>
    Clasifica el dispositivo [#clasifica-el-dispositivo]

    Añade un icono y etiquetas si necesitas agruparlo por modelo, ubicación, entorno u otro criterio operativo.
  </Step>

  <Step>
    Verifica el alta [#verifica-el-alta]

    El dispositivo debe aparecer con estado **No Identity** hasta que complete el enrolamiento o reciba una identidad manual.
  </Step>
</Steps>

Asigna una identidad manualmente [#asigna-una-identidad-manualmente]

La acción **Assign Identity** está disponible mientras el dispositivo permanece en **No Identity**.

1. Abre el dispositivo y selecciona **Assign Identity**.
2. Elige un certificado activo cuyo \`Common Name\` coincida con el \`Device ID\`.
3. Si no existe, selecciona **Issue New Instead** y elige una CA vinculada al DMS.
4. Confirma la asignación.

El dispositivo debe cambiar a **Active** y el certificado debe aparecer en su historial.

Revoca la identidad actual [#revoca-la-identidad-actual]

En **Device Event Timeline**, localiza el último certificado activo y selecciona **Revoke**. Elige una razón conforme a tu política y confirma la operación.

La revocación invalida el certificado, pero no elimina el dispositivo. Puedes restaurar su operación asignándole una identidad nueva. \`CertificateHold\` permite reactivar el certificado retenido; el resto de razones son definitivas.

Retira un dispositivo [#retira-un-dispositivo]

<Callout type="warn" title="Decommission es irreversible">
  Esta acción revoca todos los certificados del dispositivo e impide que vuelva a obtener una identidad.
</Callout>

Usa **Decommission** únicamente cuando el dispositivo haya dejado de operar o ya no sea fiable. Tras confirmar, Lamassu revoca la identidad activa con \`CessationOfOperation\` y cambia el estado a **Decommissioned**.

Automatiza el enrolamiento [#automatiza-el-enrolamiento]

<Cards>
  <Card title="Configura un DMS" description="Define la CA, confianza y políticas de la flota." href="/docs/manual/servicios-core/ra" />

  <Card title="Integra EST" description="Permite que el dispositivo solicite y renueve su identidad." href="/docs/manual/servicios-core/est" />
</Cards>
`,u={title:"Dispositivos e identidades",description:"Registra dispositivos y controla sus identidades durante todo el ciclo de vida.",sidebar:{group:"Gestión de flotas"}},v={contents:[{heading:void 0,content:"Un dispositivo gestionado representa una entidad de tu flota y conserva el historial de los certificados que ha utilizado. Lamassu separa el dispositivo de su identidad actual para que puedas renovar o sustituir certificados sin perder trazabilidad."},{heading:"estados-del-dispositivo",content:"Estado"},{heading:"estados-del-dispositivo",content:"Significado"},{heading:"estados-del-dispositivo",content:"**Active**"},{heading:"estados-del-dispositivo",content:"El dispositivo tiene una identidad válida."},{heading:"estados-del-dispositivo",content:"**No Identity**"},{heading:"estados-del-dispositivo",content:"Está registrado, pero no tiene un certificado asociado."},{heading:"estados-del-dispositivo",content:"**Renewal Pending**"},{heading:"estados-del-dispositivo",content:"Ha entrado en la ventana de renovación."},{heading:"estados-del-dispositivo",content:"**Expiring Soon**"},{heading:"estados-del-dispositivo",content:"Su certificado está próximo a expirar."},{heading:"estados-del-dispositivo",content:"**Expired**"},{heading:"estados-del-dispositivo",content:"La identidad ha superado su fecha de validez."},{heading:"estados-del-dispositivo",content:"**Revoked**"},{heading:"estados-del-dispositivo",content:"El certificado actual se ha revocado."},{heading:"estados-del-dispositivo",content:"**Decommissioned**"},{heading:"estados-del-dispositivo",content:"El dispositivo se ha retirado de forma permanente."},{heading:"estados-del-dispositivo",content:"El inventario permite filtrar por `Device ID`, etiquetas y estado."},{heading:"inspecciona-un-dispositivo",content:"La vista de detalle separa dos perspectivas:"},{heading:"inspecciona-un-dispositivo",content:"**Certificate History** conserva todos los certificados asociados, con su número de serie, emisor, estado y periodo de validez."},{heading:"inspecciona-un-dispositivo",content:"**Device Event Timeline** ordena cronológicamente registros, enrolamientos, renovaciones y cambios de estado."},{heading:"inspecciona-un-dispositivo",content:"Utiliza el historial para auditoría y la línea de tiempo para reconstruir un incidente o diagnosticar una transición inesperada."},{heading:"registra-un-dispositivo-manualmente",content:"El registro previo es útil cuando la política exige que el dispositivo exista antes de solicitar su primer certificado."},{heading:"crea-el-dispositivo",content:"Desde **Managed Devices**, abre el formulario de registro."},{heading:"define-su-pertenencia",content:"Introduce un **Device ID** único y selecciona el DMS que aplicará las políticas de enrolamiento y renovación."},{heading:"clasifica-el-dispositivo",content:"Añade un icono y etiquetas si necesitas agruparlo por modelo, ubicación, entorno u otro criterio operativo."},{heading:"verifica-el-alta",content:"El dispositivo debe aparecer con estado **No Identity** hasta que complete el enrolamiento o reciba una identidad manual."},{heading:"asigna-una-identidad-manualmente",content:"La acción **Assign Identity** está disponible mientras el dispositivo permanece en **No Identity**."},{heading:"asigna-una-identidad-manualmente",content:"Abre el dispositivo y selecciona **Assign Identity**."},{heading:"asigna-una-identidad-manualmente",content:"Elige un certificado activo cuyo `Common Name` coincida con el `Device ID`."},{heading:"asigna-una-identidad-manualmente",content:"Si no existe, selecciona **Issue New Instead** y elige una CA vinculada al DMS."},{heading:"asigna-una-identidad-manualmente",content:"Confirma la asignación."},{heading:"asigna-una-identidad-manualmente",content:"El dispositivo debe cambiar a **Active** y el certificado debe aparecer en su historial."},{heading:"revoca-la-identidad-actual",content:"En **Device Event Timeline**, localiza el último certificado activo y selecciona **Revoke**. Elige una razón conforme a tu política y confirma la operación."},{heading:"revoca-la-identidad-actual",content:"La revocación invalida el certificado, pero no elimina el dispositivo. Puedes restaurar su operación asignándole una identidad nueva. `CertificateHold` permite reactivar el certificado retenido; el resto de razones son definitivas."},{heading:"retira-un-dispositivo",content:"Esta acción revoca todos los certificados del dispositivo e impide que vuelva a obtener una identidad."},{heading:"retira-un-dispositivo",content:"Usa **Decommission** únicamente cuando el dispositivo haya dejado de operar o ya no sea fiable. Tras confirmar, Lamassu revoca la identidad activa con `CessationOfOperation` y cambia el estado a **Decommissioned**."},{heading:"automatiza-el-enrolamiento",content:'<Card title="Configura un DMS" description="Define la CA, confianza y políticas de la flota." href="/docs/manual/servicios-core/ra" />'},{heading:"automatiza-el-enrolamiento",content:'<Card title="Integra EST" description="Permite que el dispositivo solicite y renueve su identidad." href="/docs/manual/servicios-core/est" />'}],headings:[{id:"estados-del-dispositivo",content:"Estados del dispositivo"},{id:"inspecciona-un-dispositivo",content:"Inspecciona un dispositivo"},{id:"registra-un-dispositivo-manualmente",content:"Registra un dispositivo manualmente"},{id:"crea-el-dispositivo",content:"Crea el dispositivo"},{id:"define-su-pertenencia",content:"Define su pertenencia"},{id:"clasifica-el-dispositivo",content:"Clasifica el dispositivo"},{id:"verifica-el-alta",content:"Verifica el alta"},{id:"asigna-una-identidad-manualmente",content:"Asigna una identidad manualmente"},{id:"revoca-la-identidad-actual",content:"Revoca la identidad actual"},{id:"retira-un-dispositivo",content:"Retira un dispositivo"},{id:"automatiza-el-enrolamiento",content:"Automatiza el enrolamiento"}]};const m=[{depth:2,url:"#estados-del-dispositivo",title:e.jsx(e.Fragment,{children:"Estados del dispositivo"})},{depth:2,url:"#inspecciona-un-dispositivo",title:e.jsx(e.Fragment,{children:"Inspecciona un dispositivo"})},{depth:2,url:"#registra-un-dispositivo-manualmente",title:e.jsx(e.Fragment,{children:"Registra un dispositivo manualmente"})},{depth:3,url:"#crea-el-dispositivo",title:e.jsx(e.Fragment,{children:"Crea el dispositivo"})},{depth:3,url:"#define-su-pertenencia",title:e.jsx(e.Fragment,{children:"Define su pertenencia"})},{depth:3,url:"#clasifica-el-dispositivo",title:e.jsx(e.Fragment,{children:"Clasifica el dispositivo"})},{depth:3,url:"#verifica-el-alta",title:e.jsx(e.Fragment,{children:"Verifica el alta"})},{depth:2,url:"#asigna-una-identidad-manualmente",title:e.jsx(e.Fragment,{children:"Asigna una identidad manualmente"})},{depth:2,url:"#revoca-la-identidad-actual",title:e.jsx(e.Fragment,{children:"Revoca la identidad actual"})},{depth:2,url:"#retira-un-dispositivo",title:e.jsx(e.Fragment,{children:"Retira un dispositivo"})},{depth:2,url:"#automatiza-el-enrolamiento",title:e.jsx(e.Fragment,{children:"Automatiza el enrolamiento"})}];function c(a){const i={code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...a.components},{Callout:s,Card:o,Cards:d,Step:n,Steps:r}=i;return s||t("Callout"),o||t("Card"),d||t("Cards"),n||t("Step"),r||t("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"Un dispositivo gestionado representa una entidad de tu flota y conserva el historial de los certificados que ha utilizado. Lamassu separa el dispositivo de su identidad actual para que puedas renovar o sustituir certificados sin perder trazabilidad."}),`
`,e.jsx(i.h2,{id:"estados-del-dispositivo",children:"Estados del dispositivo"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Estado"}),e.jsx(i.th,{children:"Significado"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Active"})}),e.jsx(i.td,{children:"El dispositivo tiene una identidad válida."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"No Identity"})}),e.jsx(i.td,{children:"Está registrado, pero no tiene un certificado asociado."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Renewal Pending"})}),e.jsx(i.td,{children:"Ha entrado en la ventana de renovación."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Expiring Soon"})}),e.jsx(i.td,{children:"Su certificado está próximo a expirar."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Expired"})}),e.jsx(i.td,{children:"La identidad ha superado su fecha de validez."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Revoked"})}),e.jsx(i.td,{children:"El certificado actual se ha revocado."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Decommissioned"})}),e.jsx(i.td,{children:"El dispositivo se ha retirado de forma permanente."})]})]})]}),`
`,e.jsxs(i.p,{children:["El inventario permite filtrar por ",e.jsx(i.code,{children:"Device ID"}),", etiquetas y estado."]}),`
`,e.jsx(i.h2,{id:"inspecciona-un-dispositivo",children:"Inspecciona un dispositivo"}),`
`,e.jsx(i.p,{children:"La vista de detalle separa dos perspectivas:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Certificate History"})," conserva todos los certificados asociados, con su número de serie, emisor, estado y periodo de validez."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Device Event Timeline"})," ordena cronológicamente registros, enrolamientos, renovaciones y cambios de estado."]}),`
`]}),`
`,e.jsx(i.p,{children:"Utiliza el historial para auditoría y la línea de tiempo para reconstruir un incidente o diagnosticar una transición inesperada."}),`
`,e.jsx(i.h2,{id:"registra-un-dispositivo-manualmente",children:"Registra un dispositivo manualmente"}),`
`,e.jsx(i.p,{children:"El registro previo es útil cuando la política exige que el dispositivo exista antes de solicitar su primer certificado."}),`
`,e.jsxs(r,{children:[e.jsxs(n,{children:[e.jsx(i.h3,{id:"crea-el-dispositivo",children:"Crea el dispositivo"}),e.jsxs(i.p,{children:["Desde ",e.jsx(i.strong,{children:"Managed Devices"}),", abre el formulario de registro."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"define-su-pertenencia",children:"Define su pertenencia"}),e.jsxs(i.p,{children:["Introduce un ",e.jsx(i.strong,{children:"Device ID"})," único y selecciona el DMS que aplicará las políticas de enrolamiento y renovación."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"clasifica-el-dispositivo",children:"Clasifica el dispositivo"}),e.jsx(i.p,{children:"Añade un icono y etiquetas si necesitas agruparlo por modelo, ubicación, entorno u otro criterio operativo."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"verifica-el-alta",children:"Verifica el alta"}),e.jsxs(i.p,{children:["El dispositivo debe aparecer con estado ",e.jsx(i.strong,{children:"No Identity"})," hasta que complete el enrolamiento o reciba una identidad manual."]})]})]}),`
`,e.jsx(i.h2,{id:"asigna-una-identidad-manualmente",children:"Asigna una identidad manualmente"}),`
`,e.jsxs(i.p,{children:["La acción ",e.jsx(i.strong,{children:"Assign Identity"})," está disponible mientras el dispositivo permanece en ",e.jsx(i.strong,{children:"No Identity"}),"."]}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:["Abre el dispositivo y selecciona ",e.jsx(i.strong,{children:"Assign Identity"}),"."]}),`
`,e.jsxs(i.li,{children:["Elige un certificado activo cuyo ",e.jsx(i.code,{children:"Common Name"})," coincida con el ",e.jsx(i.code,{children:"Device ID"}),"."]}),`
`,e.jsxs(i.li,{children:["Si no existe, selecciona ",e.jsx(i.strong,{children:"Issue New Instead"})," y elige una CA vinculada al DMS."]}),`
`,e.jsx(i.li,{children:"Confirma la asignación."}),`
`]}),`
`,e.jsxs(i.p,{children:["El dispositivo debe cambiar a ",e.jsx(i.strong,{children:"Active"})," y el certificado debe aparecer en su historial."]}),`
`,e.jsx(i.h2,{id:"revoca-la-identidad-actual",children:"Revoca la identidad actual"}),`
`,e.jsxs(i.p,{children:["En ",e.jsx(i.strong,{children:"Device Event Timeline"}),", localiza el último certificado activo y selecciona ",e.jsx(i.strong,{children:"Revoke"}),". Elige una razón conforme a tu política y confirma la operación."]}),`
`,e.jsxs(i.p,{children:["La revocación invalida el certificado, pero no elimina el dispositivo. Puedes restaurar su operación asignándole una identidad nueva. ",e.jsx(i.code,{children:"CertificateHold"})," permite reactivar el certificado retenido; el resto de razones son definitivas."]}),`
`,e.jsx(i.h2,{id:"retira-un-dispositivo",children:"Retira un dispositivo"}),`
`,e.jsx(s,{type:"warn",title:"Decommission es irreversible",children:e.jsx(i.p,{children:"Esta acción revoca todos los certificados del dispositivo e impide que vuelva a obtener una identidad."})}),`
`,e.jsxs(i.p,{children:["Usa ",e.jsx(i.strong,{children:"Decommission"})," únicamente cuando el dispositivo haya dejado de operar o ya no sea fiable. Tras confirmar, Lamassu revoca la identidad activa con ",e.jsx(i.code,{children:"CessationOfOperation"})," y cambia el estado a ",e.jsx(i.strong,{children:"Decommissioned"}),"."]}),`
`,e.jsx(i.h2,{id:"automatiza-el-enrolamiento",children:"Automatiza el enrolamiento"}),`
`,e.jsxs(d,{children:[e.jsx(o,{title:"Configura un DMS",description:"Define la CA, confianza y políticas de la flota.",href:"/docs/manual/servicios-core/ra"}),e.jsx(o,{title:"Integra EST",description:"Permite que el dispositivo solicite y renueve su identidad.",href:"/docs/manual/servicios-core/est"})]})]})}function h(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(c,{...a})}):c(a)}function t(a,i){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}export{p as _markdown,h as default,u as frontmatter,v as structuredData,m as toc};
