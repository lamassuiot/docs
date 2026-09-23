import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let l=`

Un **Device Management Service (DMS)** actúa como autoridad de registro frente a una flota. Recibe solicitudes, aplica la política de autenticación y encarga la emisión a la CA configurada.

Cada DMS es un límite operativo independiente: puede representar una línea de producto, un entorno o un tipo de dispositivo con su propia CA, reglas de autenticación, confianza distribuida y ventana de renovación.

Antes de empezar [#antes-de-empezar]

* Crea o importa al menos una CA activa.
* Decide cómo se autenticarán los dispositivos durante el primer enrolamiento.
* Define qué autoridades debe recibir el dispositivo como anclas de confianza.
* Asegúrate de tener permisos para administrar DMS.

Configura un DMS [#configura-un-dms]

<Steps>
  <Step>
    Identifica la flota [#identifica-la-flota]

    Asigna al DMS un nombre que describa su alcance, por ejemplo una familia de dispositivos o un entorno.
  </Step>

  <Step>
    Selecciona la CA de enrolamiento [#selecciona-la-ca-de-enrolamiento]

    Elige la autoridad que emitirá las identidades. Su política y periodo de validez condicionan los certificados que podrá obtener la flota.
  </Step>

  <Step>
    Configura EST [#configura-est]

    Define la autenticación de \`enroll\`, la política de \`reenroll\`, la ventana de renovación y, si se necesita, \`serverkeygen\`.
  </Step>

  <Step>
    Distribuye la confianza [#distribuye-la-confianza]

    Configura **CA Distribution** para controlar la respuesta del endpoint \`cacerts\`.
  </Step>

  <Step>
    Verifica los endpoints [#verifica-los-endpoints]

    Desde el menú del DMS, abre **EST (RFC-7030)** y comprueba la URL base y los ejemplos de invocación antes de integrar el firmware.
  </Step>
</Steps>

Distribución de confianza [#distribución-de-confianza]

| Parámetro                     | Qué distribuye                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| **Include Lamassu System CA** | Certificado TLS del servidor Lamassu, útil para pinning. No representa una CA de emisión. |
| **Include Enrollment CA**     | Autoridad configurada para emitir las identidades del DMS.                                |
| **Managed CAs**               | Autoridades adicionales que el dispositivo debe confiar.                                  |

Opera el inventario de DMS [#opera-el-inventario-de-dms]

| Acción                      | Resultado                                                 |
| --------------------------- | --------------------------------------------------------- |
| **Edit**                    | Modifica la política del DMS.                             |
| **Go to DMS owned devices** | Abre únicamente los dispositivos de esa flota.            |
| **Show/Edit Metadata**      | Gestiona configuración avanzada y datos de integraciones. |
| **EST (RFC-7030)**          | Muestra endpoints y ejemplos específicos del DMS.         |
| **Delete**                  | Elimina el DMS; la acción es irreversible.                |

Integra los dispositivos [#integra-los-dispositivos]

<Cards>
  <Card title="Enrolamiento EST" description="Configura autenticación, endpoints y flujos para firmware." href="/docs/manual/servicios-core/est" />

  <Card title="Dispositivos e identidades" description="Consulta estados, historial y acciones operativas." href="/docs/manual/servicios-core/devices" />
</Cards>
`,u={title:"Device Management Service",description:"Define cómo una flota recibe, renueva y utiliza sus identidades.",sidebar:{group:"RA",label:"Visión general"}},p={contents:[{heading:void 0,content:"Un &#x2A;*Device Management Service (DMS)** actúa como autoridad de registro frente a una flota. Recibe solicitudes, aplica la política de autenticación y encarga la emisión a la CA configurada."},{heading:void 0,content:"Cada DMS es un límite operativo independiente: puede representar una línea de producto, un entorno o un tipo de dispositivo con su propia CA, reglas de autenticación, confianza distribuida y ventana de renovación."},{heading:"antes-de-empezar",content:"Crea o importa al menos una CA activa."},{heading:"antes-de-empezar",content:"Decide cómo se autenticarán los dispositivos durante el primer enrolamiento."},{heading:"antes-de-empezar",content:"Define qué autoridades debe recibir el dispositivo como anclas de confianza."},{heading:"antes-de-empezar",content:"Asegúrate de tener permisos para administrar DMS."},{heading:"identifica-la-flota",content:"Asigna al DMS un nombre que describa su alcance, por ejemplo una familia de dispositivos o un entorno."},{heading:"selecciona-la-ca-de-enrolamiento",content:"Elige la autoridad que emitirá las identidades. Su política y periodo de validez condicionan los certificados que podrá obtener la flota."},{heading:"configura-est",content:"Define la autenticación de `enroll`, la política de `reenroll`, la ventana de renovación y, si se necesita, `serverkeygen`."},{heading:"distribuye-la-confianza",content:"Configura **CA Distribution** para controlar la respuesta del endpoint `cacerts`."},{heading:"verifica-los-endpoints",content:"Desde el menú del DMS, abre &#x2A;*EST (RFC-7030)** y comprueba la URL base y los ejemplos de invocación antes de integrar el firmware."},{heading:"distribución-de-confianza",content:"Parámetro"},{heading:"distribución-de-confianza",content:"Qué distribuye"},{heading:"distribución-de-confianza",content:"**Include Lamassu System CA**"},{heading:"distribución-de-confianza",content:"Certificado TLS del servidor Lamassu, útil para pinning. No representa una CA de emisión."},{heading:"distribución-de-confianza",content:"**Include Enrollment CA**"},{heading:"distribución-de-confianza",content:"Autoridad configurada para emitir las identidades del DMS."},{heading:"distribución-de-confianza",content:"**Managed CAs**"},{heading:"distribución-de-confianza",content:"Autoridades adicionales que el dispositivo debe confiar."},{heading:"opera-el-inventario-de-dms",content:"Acción"},{heading:"opera-el-inventario-de-dms",content:"Resultado"},{heading:"opera-el-inventario-de-dms",content:"**Edit**"},{heading:"opera-el-inventario-de-dms",content:"Modifica la política del DMS."},{heading:"opera-el-inventario-de-dms",content:"**Go to DMS owned devices**"},{heading:"opera-el-inventario-de-dms",content:"Abre únicamente los dispositivos de esa flota."},{heading:"opera-el-inventario-de-dms",content:"**Show/Edit Metadata**"},{heading:"opera-el-inventario-de-dms",content:"Gestiona configuración avanzada y datos de integraciones."},{heading:"opera-el-inventario-de-dms",content:"**EST (RFC-7030)**"},{heading:"opera-el-inventario-de-dms",content:"Muestra endpoints y ejemplos específicos del DMS."},{heading:"opera-el-inventario-de-dms",content:"**Delete**"},{heading:"opera-el-inventario-de-dms",content:"Elimina el DMS; la acción es irreversible."},{heading:"integra-los-dispositivos",content:'<Card title="Enrolamiento EST" description="Configura autenticación, endpoints y flujos para firmware." href="/docs/manual/servicios-core/est" />'},{heading:"integra-los-dispositivos",content:'<Card title="Dispositivos e identidades" description="Consulta estados, historial y acciones operativas." href="/docs/manual/servicios-core/devices" />'}],headings:[{id:"antes-de-empezar",content:"Antes de empezar"},{id:"configura-un-dms",content:"Configura un DMS"},{id:"identifica-la-flota",content:"Identifica la flota"},{id:"selecciona-la-ca-de-enrolamiento",content:"Selecciona la CA de enrolamiento"},{id:"configura-est",content:"Configura EST"},{id:"distribuye-la-confianza",content:"Distribuye la confianza"},{id:"verifica-los-endpoints",content:"Verifica los endpoints"},{id:"distribución-de-confianza",content:"Distribución de confianza"},{id:"opera-el-inventario-de-dms",content:"Opera el inventario de DMS"},{id:"integra-los-dispositivos",content:"Integra los dispositivos"}]};const h=[{depth:2,url:"#antes-de-empezar",title:e.jsx(e.Fragment,{children:"Antes de empezar"})},{depth:2,url:"#configura-un-dms",title:e.jsx(e.Fragment,{children:"Configura un DMS"})},{depth:3,url:"#identifica-la-flota",title:e.jsx(e.Fragment,{children:"Identifica la flota"})},{depth:3,url:"#selecciona-la-ca-de-enrolamiento",title:e.jsx(e.Fragment,{children:"Selecciona la CA de enrolamiento"})},{depth:3,url:"#configura-est",title:e.jsx(e.Fragment,{children:"Configura EST"})},{depth:3,url:"#distribuye-la-confianza",title:e.jsx(e.Fragment,{children:"Distribuye la confianza"})},{depth:3,url:"#verifica-los-endpoints",title:e.jsx(e.Fragment,{children:"Verifica los endpoints"})},{depth:2,url:"#distribución-de-confianza",title:e.jsx(e.Fragment,{children:"Distribución de confianza"})},{depth:2,url:"#opera-el-inventario-de-dms",title:e.jsx(e.Fragment,{children:"Opera el inventario de DMS"})},{depth:2,url:"#integra-los-dispositivos",title:e.jsx(e.Fragment,{children:"Integra los dispositivos"})}];function s(i){const n={code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Card:d,Cards:o,Step:a,Steps:r}=n;return d||t("Card"),o||t("Cards"),a||t("Step"),r||t("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:["Un ",e.jsx(n.strong,{children:"Device Management Service (DMS)"})," actúa como autoridad de registro frente a una flota. Recibe solicitudes, aplica la política de autenticación y encarga la emisión a la CA configurada."]}),`
`,e.jsx(n.p,{children:"Cada DMS es un límite operativo independiente: puede representar una línea de producto, un entorno o un tipo de dispositivo con su propia CA, reglas de autenticación, confianza distribuida y ventana de renovación."}),`
`,e.jsx(n.h2,{id:"antes-de-empezar",children:"Antes de empezar"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Crea o importa al menos una CA activa."}),`
`,e.jsx(n.li,{children:"Decide cómo se autenticarán los dispositivos durante el primer enrolamiento."}),`
`,e.jsx(n.li,{children:"Define qué autoridades debe recibir el dispositivo como anclas de confianza."}),`
`,e.jsx(n.li,{children:"Asegúrate de tener permisos para administrar DMS."}),`
`]}),`
`,e.jsx(n.h2,{id:"configura-un-dms",children:"Configura un DMS"}),`
`,e.jsxs(r,{children:[e.jsxs(a,{children:[e.jsx(n.h3,{id:"identifica-la-flota",children:"Identifica la flota"}),e.jsx(n.p,{children:"Asigna al DMS un nombre que describa su alcance, por ejemplo una familia de dispositivos o un entorno."})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"selecciona-la-ca-de-enrolamiento",children:"Selecciona la CA de enrolamiento"}),e.jsx(n.p,{children:"Elige la autoridad que emitirá las identidades. Su política y periodo de validez condicionan los certificados que podrá obtener la flota."})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"configura-est",children:"Configura EST"}),e.jsxs(n.p,{children:["Define la autenticación de ",e.jsx(n.code,{children:"enroll"}),", la política de ",e.jsx(n.code,{children:"reenroll"}),", la ventana de renovación y, si se necesita, ",e.jsx(n.code,{children:"serverkeygen"}),"."]})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"distribuye-la-confianza",children:"Distribuye la confianza"}),e.jsxs(n.p,{children:["Configura ",e.jsx(n.strong,{children:"CA Distribution"})," para controlar la respuesta del endpoint ",e.jsx(n.code,{children:"cacerts"}),"."]})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"verifica-los-endpoints",children:"Verifica los endpoints"}),e.jsxs(n.p,{children:["Desde el menú del DMS, abre ",e.jsx(n.strong,{children:"EST (RFC-7030)"})," y comprueba la URL base y los ejemplos de invocación antes de integrar el firmware."]})]})]}),`
`,e.jsx(n.h2,{id:"distribución-de-confianza",children:"Distribución de confianza"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Parámetro"}),e.jsx(n.th,{children:"Qué distribuye"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"Include Lamassu System CA"})}),e.jsx(n.td,{children:"Certificado TLS del servidor Lamassu, útil para pinning. No representa una CA de emisión."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"Include Enrollment CA"})}),e.jsx(n.td,{children:"Autoridad configurada para emitir las identidades del DMS."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"Managed CAs"})}),e.jsx(n.td,{children:"Autoridades adicionales que el dispositivo debe confiar."})]})]})]}),`
`,e.jsx(n.h2,{id:"opera-el-inventario-de-dms",children:"Opera el inventario de DMS"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Acción"}),e.jsx(n.th,{children:"Resultado"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"Edit"})}),e.jsx(n.td,{children:"Modifica la política del DMS."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"Go to DMS owned devices"})}),e.jsx(n.td,{children:"Abre únicamente los dispositivos de esa flota."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"Show/Edit Metadata"})}),e.jsx(n.td,{children:"Gestiona configuración avanzada y datos de integraciones."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"EST (RFC-7030)"})}),e.jsx(n.td,{children:"Muestra endpoints y ejemplos específicos del DMS."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"Delete"})}),e.jsx(n.td,{children:"Elimina el DMS; la acción es irreversible."})]})]})]}),`
`,e.jsx(n.h2,{id:"integra-los-dispositivos",children:"Integra los dispositivos"}),`
`,e.jsxs(o,{children:[e.jsx(d,{title:"Enrolamiento EST",description:"Configura autenticación, endpoints y flujos para firmware.",href:"/docs/manual/servicios-core/est"}),e.jsx(d,{title:"Dispositivos e identidades",description:"Consulta estados, historial y acciones operativas.",href:"/docs/manual/servicios-core/devices"})]})]})}function m(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}function t(i,n){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{l as _markdown,m as default,u as frontmatter,p as structuredData,h as toc};
