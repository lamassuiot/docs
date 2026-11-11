import{j as e}from"./index-prc0XQdj.js";let c=`

Este recorrido está dirigido a quien empieza a administrar la PKI o necesita una primera identidad X.509 de cliente. Termina con tres archivos: el certificado de una CA raíz, un certificado final y la clave privada de ese cliente.

Antes de empezar [#antes-de-empezar]

* Una instancia de Lamassu accesible desde el navegador. Si necesitas prepararla, consulta [Despliegue](/docs/deployment/overview).
* Permisos para gestionar claves, autoridades y emisión. Consulta [Control de acceso](/docs/platform/administration/access-control) si una operación está bloqueada.
* Un motor criptográfico disponible para la clave de la CA; comprueba el inventario de [claves y motores](/docs/platform/pki/key-management).
* OpenSSL 3.x en el equipo desde el que verificarás los archivos.
* Un directorio de trabajo con acceso restringido para custodiar la clave descargada.

Ruta recomendada [#ruta-recomendada]

<Cards>
  <Card title="1. Crea tu primera CA" description="Crea una raíz de evaluación y guarda su certificado público como ca.pem." href="/docs/platform/pki/quickstarts/create-certificate-authority" />

  <Card title="2. Emite y verifica un certificado" description="Emite para device-001 y comprueba contenido, cadena y correspondencia de clave." href="/docs/platform/pki/quickstarts/issue-certificate" />
</Cards>

Usaremos \`Acme Evaluation Root CA\` y \`device-001\` como nombres de ejemplo. Si los sustituyes, conserva el mismo identificador de cliente en los pasos que quieras conectar.

La raíz de este recorrido firma directamente el certificado final para facilitar la evaluación. Antes de diseñar una PKI operativa, revisa el [modelo de confianza](/docs/platform/pki/concepts/trust-model) y la [jerarquía de CAs](/docs/platform/pki/ca-hierarchy-and-rotation).

Resultado esperado [#resultado-esperado]

| Archivo o recurso                | Comprobación                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| CA raíz activa y \`ca.pem\`        | Es un certificado de CA, está vigente y su autofirma se comprueba.                    |
| Certificado final y \`device.crt\` | Identifica a \`device-001\`, admite autenticación de cliente y verifica hasta \`ca.pem\`. |
| Clave privada \`device.key\`       | Su clave pública coincide con la incluida en \`device.crt\`.                            |

Estas comprobaciones validan el material emitido. La aceptación en un servicio requiere además su configuración de confianza, autorización y revocación.

Continúa según tu objetivo [#continúa-según-tu-objetivo]

* Para operar certificados, continúa con [Certificados](/docs/platform/pki/certificates) y [Validación](/docs/platform/pki/certificate-validation).
* Para gestionar una identidad de dispositivo en Lamassu, sigue [Registro manual](/docs/platform/iot-fleets/quickstarts/register-device). Ese recorrido incluye la preparación del DMS.
* Para que el dispositivo solicite su certificado, prepara el [DMS](/docs/platform/iot-fleets/enrollment/dms) y el [cliente EST](/docs/platform/iot-fleets/enrollment/overview).
`,d={title:"Primeros pasos de PKI",description:"Crea una CA, emite un certificado de cliente y comprueba su cadena y su clave."},s={contents:[{heading:void 0,content:"Este recorrido está dirigido a quien empieza a administrar la PKI o necesita una primera identidad X.509 de cliente. Termina con tres archivos: el certificado de una CA raíz, un certificado final y la clave privada de ese cliente."},{heading:"antes-de-empezar",content:"Una instancia de Lamassu accesible desde el navegador. Si necesitas prepararla, consulta Despliegue."},{heading:"antes-de-empezar",content:"Permisos para gestionar claves, autoridades y emisión. Consulta Control de acceso si una operación está bloqueada."},{heading:"antes-de-empezar",content:"Un motor criptográfico disponible para la clave de la CA; comprueba el inventario de claves y motores."},{heading:"antes-de-empezar",content:"OpenSSL 3.x en el equipo desde el que verificarás los archivos."},{heading:"antes-de-empezar",content:"Un directorio de trabajo con acceso restringido para custodiar la clave descargada."},{heading:"ruta-recomendada",content:'<Card title="1. Crea tu primera CA" description="Crea una raíz de evaluación y guarda su certificado público como ca.pem." href="/docs/platform/pki/quickstarts/create-certificate-authority" />'},{heading:"ruta-recomendada",content:'<Card title="2. Emite y verifica un certificado" description="Emite para device-001 y comprueba contenido, cadena y correspondencia de clave." href="/docs/platform/pki/quickstarts/issue-certificate" />'},{heading:"ruta-recomendada",content:"Usaremos `Acme Evaluation Root CA` y `device-001` como nombres de ejemplo. Si los sustituyes, conserva el mismo identificador de cliente en los pasos que quieras conectar."},{heading:"ruta-recomendada",content:"La raíz de este recorrido firma directamente el certificado final para facilitar la evaluación. Antes de diseñar una PKI operativa, revisa el modelo de confianza y la jerarquía de CAs."},{heading:"resultado-esperado",content:"Archivo o recurso"},{heading:"resultado-esperado",content:"Comprobación"},{heading:"resultado-esperado",content:"CA raíz activa y `ca.pem`"},{heading:"resultado-esperado",content:"Es un certificado de CA, está vigente y su autofirma se comprueba."},{heading:"resultado-esperado",content:"Certificado final y `device.crt`"},{heading:"resultado-esperado",content:"Identifica a `device-001`, admite autenticación de cliente y verifica hasta `ca.pem`."},{heading:"resultado-esperado",content:"Clave privada `device.key`"},{heading:"resultado-esperado",content:"Su clave pública coincide con la incluida en `device.crt`."},{heading:"resultado-esperado",content:"Estas comprobaciones validan el material emitido. La aceptación en un servicio requiere además su configuración de confianza, autorización y revocación."},{heading:"continúa-según-tu-objetivo",content:"Para operar certificados, continúa con Certificados y Validación."},{heading:"continúa-según-tu-objetivo",content:"Para gestionar una identidad de dispositivo en Lamassu, sigue Registro manual. Ese recorrido incluye la preparación del DMS."},{heading:"continúa-según-tu-objetivo",content:"Para que el dispositivo solicite su certificado, prepara el DMS y el cliente EST."}],headings:[{id:"antes-de-empezar",content:"Antes de empezar"},{id:"ruta-recomendada",content:"Ruta recomendada"},{id:"resultado-esperado",content:"Resultado esperado"},{id:"continúa-según-tu-objetivo",content:"Continúa según tu objetivo"}]};const l=[{depth:2,url:"#antes-de-empezar",title:e.jsx(e.Fragment,{children:"Antes de empezar"})},{depth:2,url:"#ruta-recomendada",title:e.jsx(e.Fragment,{children:"Ruta recomendada"})},{depth:2,url:"#resultado-esperado",title:e.jsx(e.Fragment,{children:"Resultado esperado"})},{depth:2,url:"#continúa-según-tu-objetivo",title:e.jsx(e.Fragment,{children:"Continúa según tu objetivo"})}];function t(i){const a={a:"a",code:"code",h2:"h2",li:"li",p:"p",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Card:r,Cards:n}=a;return r||o("Card"),n||o("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(a.p,{children:"Este recorrido está dirigido a quien empieza a administrar la PKI o necesita una primera identidad X.509 de cliente. Termina con tres archivos: el certificado de una CA raíz, un certificado final y la clave privada de ese cliente."}),`
`,e.jsx(a.h2,{id:"antes-de-empezar",children:"Antes de empezar"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:["Una instancia de Lamassu accesible desde el navegador. Si necesitas prepararla, consulta ",e.jsx(a.a,{href:"/docs/deployment/overview",children:"Despliegue"}),"."]}),`
`,e.jsxs(a.li,{children:["Permisos para gestionar claves, autoridades y emisión. Consulta ",e.jsx(a.a,{href:"/docs/platform/administration/access-control",children:"Control de acceso"})," si una operación está bloqueada."]}),`
`,e.jsxs(a.li,{children:["Un motor criptográfico disponible para la clave de la CA; comprueba el inventario de ",e.jsx(a.a,{href:"/docs/platform/pki/key-management",children:"claves y motores"}),"."]}),`
`,e.jsx(a.li,{children:"OpenSSL 3.x en el equipo desde el que verificarás los archivos."}),`
`,e.jsx(a.li,{children:"Un directorio de trabajo con acceso restringido para custodiar la clave descargada."}),`
`]}),`
`,e.jsx(a.h2,{id:"ruta-recomendada",children:"Ruta recomendada"}),`
`,e.jsxs(n,{children:[e.jsx(r,{title:"1. Crea tu primera CA",description:"Crea una raíz de evaluación y guarda su certificado público como ca.pem.",href:"/docs/platform/pki/quickstarts/create-certificate-authority"}),e.jsx(r,{title:"2. Emite y verifica un certificado",description:"Emite para device-001 y comprueba contenido, cadena y correspondencia de clave.",href:"/docs/platform/pki/quickstarts/issue-certificate"})]}),`
`,e.jsxs(a.p,{children:["Usaremos ",e.jsx(a.code,{children:"Acme Evaluation Root CA"})," y ",e.jsx(a.code,{children:"device-001"})," como nombres de ejemplo. Si los sustituyes, conserva el mismo identificador de cliente en los pasos que quieras conectar."]}),`
`,e.jsxs(a.p,{children:["La raíz de este recorrido firma directamente el certificado final para facilitar la evaluación. Antes de diseñar una PKI operativa, revisa el ",e.jsx(a.a,{href:"/docs/platform/pki/concepts/trust-model",children:"modelo de confianza"})," y la ",e.jsx(a.a,{href:"/docs/platform/pki/ca-hierarchy-and-rotation",children:"jerarquía de CAs"}),"."]}),`
`,e.jsx(a.h2,{id:"resultado-esperado",children:"Resultado esperado"}),`
`,e.jsxs(a.table,{children:[e.jsx(a.thead,{children:e.jsxs(a.tr,{children:[e.jsx(a.th,{children:"Archivo o recurso"}),e.jsx(a.th,{children:"Comprobación"})]})}),e.jsxs(a.tbody,{children:[e.jsxs(a.tr,{children:[e.jsxs(a.td,{children:["CA raíz activa y ",e.jsx(a.code,{children:"ca.pem"})]}),e.jsx(a.td,{children:"Es un certificado de CA, está vigente y su autofirma se comprueba."})]}),e.jsxs(a.tr,{children:[e.jsxs(a.td,{children:["Certificado final y ",e.jsx(a.code,{children:"device.crt"})]}),e.jsxs(a.td,{children:["Identifica a ",e.jsx(a.code,{children:"device-001"}),", admite autenticación de cliente y verifica hasta ",e.jsx(a.code,{children:"ca.pem"}),"."]})]}),e.jsxs(a.tr,{children:[e.jsxs(a.td,{children:["Clave privada ",e.jsx(a.code,{children:"device.key"})]}),e.jsxs(a.td,{children:["Su clave pública coincide con la incluida en ",e.jsx(a.code,{children:"device.crt"}),"."]})]})]})]}),`
`,e.jsx(a.p,{children:"Estas comprobaciones validan el material emitido. La aceptación en un servicio requiere además su configuración de confianza, autorización y revocación."}),`
`,e.jsx(a.h2,{id:"continúa-según-tu-objetivo",children:"Continúa según tu objetivo"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:["Para operar certificados, continúa con ",e.jsx(a.a,{href:"/docs/platform/pki/certificates",children:"Certificados"})," y ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-validation",children:"Validación"}),"."]}),`
`,e.jsxs(a.li,{children:["Para gestionar una identidad de dispositivo en Lamassu, sigue ",e.jsx(a.a,{href:"/docs/platform/iot-fleets/quickstarts/register-device",children:"Registro manual"}),". Ese recorrido incluye la preparación del DMS."]}),`
`,e.jsxs(a.li,{children:["Para que el dispositivo solicite su certificado, prepara el ",e.jsx(a.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"DMS"})," y el ",e.jsx(a.a,{href:"/docs/platform/iot-fleets/enrollment/overview",children:"cliente EST"}),"."]}),`
`]})]})}function u(i={}){const{wrapper:a}=i.components||{};return a?e.jsx(a,{...i,children:e.jsx(t,{...i})}):t(i)}function o(i,a){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:u,frontmatter:d,structuredData:s,toc:l},Symbol.toStringTag,{value:"Module"}));export{m as _};
