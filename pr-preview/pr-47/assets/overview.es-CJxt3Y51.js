import{j as e}from"./index-prc0XQdj.js";let s=`

El bloque PKI explica cómo construir y operar la confianza X.509 de Lamassu: qué autoridades emiten, qué reglas aplican y cómo se comprueban los certificados. Está dirigido al administrador PKI y a quien necesita utilizar certificados en un sistema consumidor.

Empieza aquí [#empieza-aquí]

Sigue [Primeros pasos de PKI](/docs/platform/pki/quickstarts/overview) para crear una CA, emitir un certificado de cliente y verificarlo con OpenSSL. El resultado es un certificado, su clave privada y una cadena comprobada.

Puedes completar ese recorrido antes de gestionar dispositivos. Cuando necesites asociar la identidad a un inventario o automatizar su enrolamiento, continúa en [IoT Fleets](/docs/platform/iot-fleets/overview).

Qué necesitas [#qué-necesitas]

* Una instancia accesible y permisos para gestionar las claves, CAs y certificados que usarás.
* Un motor criptográfico disponible para custodiar la clave de la autoridad.
* El propósito del certificado: por ejemplo, autenticar un cliente mediante mTLS.
* Los requisitos del consumidor: emisores aceptados, algoritmos, nombres y usos permitidos.

La configuración de la instancia y del proveedor criptográfico se prepara en [Despliegue](/docs/deployment/overview). La elección de jerarquía se explica en el [modelo de confianza](/docs/platform/pki/concepts/trust-model).

Capacidades principales [#capacidades-principales]

Construye tu jerarquía de confianza [#construye-tu-jerarquía-de-confianza]

Las [autoridades](/docs/platform/pki/certificate-authorities) firman certificados. Una raíz establece el ancla de confianza y una intermedia permite separar la emisión por entorno o propósito. La [jerarquía y rotación](/docs/platform/pki/ca-hierarchy-and-rotation) explica cómo mantener esa confianza al sustituir una autoridad.

Protege las claves criptográficas [#protege-las-claves-criptográficas]

Las claves de firma de las CAs se gestionan mediante [KMS y motores criptográficos](/docs/platform/pki/key-management). La clave de un cliente que genera una CSR puede permanecer en ese cliente: conserva su custodia al elegir el método de emisión.

Emite y controla certificados [#emite-y-controla-certificados]

Un [perfil](/docs/platform/pki/certificate-profiles) establece restricciones de sujeto, validez, usos y claves. La CA aplica la configuración de emisión y firma el certificado. En el [inventario](/docs/platform/pki/certificates) puedes inspeccionar el resultado, descargarlo y gestionar su estado.

Publica el estado de validación [#publica-el-estado-de-validación]

La [validación](/docs/platform/pki/certificate-validation) reúne cadena, vigencia, usos y estado de revocación. Lamassu publica estado mediante [OCSP](/docs/platform/pki/ocsp) y [CRL](/docs/platform/pki/crl); el consumidor configura qué emisores reconoce y cómo comprueba ese estado.

Cómo comprobar el resultado [#cómo-comprobar-el-resultado]

Un certificado activo en la consola es una parte de la comprobación. Revisa también que:

* su sujeto y sus extensiones identifiquen al cliente esperado;
* su clave pública corresponda a la clave privada del cliente;
* su cadena alcance una raíz confiable para el consumidor;
* sus fechas y usos permitan la operación;
* el consumidor aplique la comprobación de revocación y su autorización.

El [recorrido de emisión](/docs/platform/pki/quickstarts/issue-certificate) incluye las primeras comprobaciones independientes.

Continúa [#continúa]

<Cards>
  <Card title="Primeros pasos de PKI" description="Crea una CA y emite y verifica un certificado de cliente." href="/docs/platform/pki/quickstarts/overview" />

  <Card title="Aplica la PKI a dispositivos" description="Asocia certificados al inventario y prepara el enrolamiento." href="/docs/platform/iot-fleets/overview" />

  <Card title="Diagnóstico PKI" description="Comprueba emisión, OCSP y CRL cuando el resultado falla." href="/docs/platform/pki/troubleshooting" />
</Cards>
`,t={title:"PKI",description:"Administra claves y autoridades, define la emisión y verifica los certificados resultantes."},d={contents:[{heading:void 0,content:"El bloque PKI explica cómo construir y operar la confianza X.509 de Lamassu: qué autoridades emiten, qué reglas aplican y cómo se comprueban los certificados. Está dirigido al administrador PKI y a quien necesita utilizar certificados en un sistema consumidor."},{heading:"empieza-aquí",content:"Sigue Primeros pasos de PKI para crear una CA, emitir un certificado de cliente y verificarlo con OpenSSL. El resultado es un certificado, su clave privada y una cadena comprobada."},{heading:"empieza-aquí",content:"Puedes completar ese recorrido antes de gestionar dispositivos. Cuando necesites asociar la identidad a un inventario o automatizar su enrolamiento, continúa en IoT Fleets."},{heading:"qué-necesitas",content:"Una instancia accesible y permisos para gestionar las claves, CAs y certificados que usarás."},{heading:"qué-necesitas",content:"Un motor criptográfico disponible para custodiar la clave de la autoridad."},{heading:"qué-necesitas",content:"El propósito del certificado: por ejemplo, autenticar un cliente mediante mTLS."},{heading:"qué-necesitas",content:"Los requisitos del consumidor: emisores aceptados, algoritmos, nombres y usos permitidos."},{heading:"qué-necesitas",content:"La configuración de la instancia y del proveedor criptográfico se prepara en Despliegue. La elección de jerarquía se explica en el modelo de confianza."},{heading:"construye-tu-jerarquía-de-confianza",content:"Las autoridades firman certificados. Una raíz establece el ancla de confianza y una intermedia permite separar la emisión por entorno o propósito. La jerarquía y rotación explica cómo mantener esa confianza al sustituir una autoridad."},{heading:"protege-las-claves-criptográficas",content:"Las claves de firma de las CAs se gestionan mediante KMS y motores criptográficos. La clave de un cliente que genera una CSR puede permanecer en ese cliente: conserva su custodia al elegir el método de emisión."},{heading:"emite-y-controla-certificados",content:"Un perfil establece restricciones de sujeto, validez, usos y claves. La CA aplica la configuración de emisión y firma el certificado. En el inventario puedes inspeccionar el resultado, descargarlo y gestionar su estado."},{heading:"publica-el-estado-de-validación",content:"La validación reúne cadena, vigencia, usos y estado de revocación. Lamassu publica estado mediante OCSP y CRL; el consumidor configura qué emisores reconoce y cómo comprueba ese estado."},{heading:"cómo-comprobar-el-resultado",content:"Un certificado activo en la consola es una parte de la comprobación. Revisa también que:"},{heading:"cómo-comprobar-el-resultado",content:"su sujeto y sus extensiones identifiquen al cliente esperado;"},{heading:"cómo-comprobar-el-resultado",content:"su clave pública corresponda a la clave privada del cliente;"},{heading:"cómo-comprobar-el-resultado",content:"su cadena alcance una raíz confiable para el consumidor;"},{heading:"cómo-comprobar-el-resultado",content:"sus fechas y usos permitan la operación;"},{heading:"cómo-comprobar-el-resultado",content:"el consumidor aplique la comprobación de revocación y su autorización."},{heading:"cómo-comprobar-el-resultado",content:"El recorrido de emisión incluye las primeras comprobaciones independientes."},{heading:"continúa",content:'<Card title="Primeros pasos de PKI" description="Crea una CA y emite y verifica un certificado de cliente." href="/docs/platform/pki/quickstarts/overview" />'},{heading:"continúa",content:'<Card title="Aplica la PKI a dispositivos" description="Asocia certificados al inventario y prepara el enrolamiento." href="/docs/platform/iot-fleets/overview" />'},{heading:"continúa",content:'<Card title="Diagnóstico PKI" description="Comprueba emisión, OCSP y CRL cuando el resultado falla." href="/docs/platform/pki/troubleshooting" />'}],headings:[{id:"empieza-aquí",content:"Empieza aquí"},{id:"qué-necesitas",content:"Qué necesitas"},{id:"capacidades-principales",content:"Capacidades principales"},{id:"construye-tu-jerarquía-de-confianza",content:"Construye tu jerarquía de confianza"},{id:"protege-las-claves-criptográficas",content:"Protege las claves criptográficas"},{id:"emite-y-controla-certificados",content:"Emite y controla certificados"},{id:"publica-el-estado-de-validación",content:"Publica el estado de validación"},{id:"cómo-comprobar-el-resultado",content:"Cómo comprobar el resultado"},{id:"continúa",content:"Continúa"}]};const l=[{depth:2,url:"#empieza-aquí",title:e.jsx(e.Fragment,{children:"Empieza aquí"})},{depth:2,url:"#qué-necesitas",title:e.jsx(e.Fragment,{children:"Qué necesitas"})},{depth:2,url:"#capacidades-principales",title:e.jsx(e.Fragment,{children:"Capacidades principales"})},{depth:3,url:"#construye-tu-jerarquía-de-confianza",title:e.jsx(e.Fragment,{children:"Construye tu jerarquía de confianza"})},{depth:3,url:"#protege-las-claves-criptográficas",title:e.jsx(e.Fragment,{children:"Protege las claves criptográficas"})},{depth:3,url:"#emite-y-controla-certificados",title:e.jsx(e.Fragment,{children:"Emite y controla certificados"})},{depth:3,url:"#publica-el-estado-de-validación",title:e.jsx(e.Fragment,{children:"Publica el estado de validación"})},{depth:2,url:"#cómo-comprobar-el-resultado",title:e.jsx(e.Fragment,{children:"Cómo comprobar el resultado"})},{depth:2,url:"#continúa",title:e.jsx(e.Fragment,{children:"Continúa"})}];function r(i){const a={a:"a",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...i.components},{Card:n,Cards:o}=a;return n||c("Card"),o||c("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(a.p,{children:"El bloque PKI explica cómo construir y operar la confianza X.509 de Lamassu: qué autoridades emiten, qué reglas aplican y cómo se comprueban los certificados. Está dirigido al administrador PKI y a quien necesita utilizar certificados en un sistema consumidor."}),`
`,e.jsx(a.h2,{id:"empieza-aquí",children:"Empieza aquí"}),`
`,e.jsxs(a.p,{children:["Sigue ",e.jsx(a.a,{href:"/docs/platform/pki/quickstarts/overview",children:"Primeros pasos de PKI"})," para crear una CA, emitir un certificado de cliente y verificarlo con OpenSSL. El resultado es un certificado, su clave privada y una cadena comprobada."]}),`
`,e.jsxs(a.p,{children:["Puedes completar ese recorrido antes de gestionar dispositivos. Cuando necesites asociar la identidad a un inventario o automatizar su enrolamiento, continúa en ",e.jsx(a.a,{href:"/docs/platform/iot-fleets/overview",children:"IoT Fleets"}),"."]}),`
`,e.jsx(a.h2,{id:"qué-necesitas",children:"Qué necesitas"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Una instancia accesible y permisos para gestionar las claves, CAs y certificados que usarás."}),`
`,e.jsx(a.li,{children:"Un motor criptográfico disponible para custodiar la clave de la autoridad."}),`
`,e.jsx(a.li,{children:"El propósito del certificado: por ejemplo, autenticar un cliente mediante mTLS."}),`
`,e.jsx(a.li,{children:"Los requisitos del consumidor: emisores aceptados, algoritmos, nombres y usos permitidos."}),`
`]}),`
`,e.jsxs(a.p,{children:["La configuración de la instancia y del proveedor criptográfico se prepara en ",e.jsx(a.a,{href:"/docs/deployment/overview",children:"Despliegue"}),". La elección de jerarquía se explica en el ",e.jsx(a.a,{href:"/docs/platform/pki/concepts/trust-model",children:"modelo de confianza"}),"."]}),`
`,e.jsx(a.h2,{id:"capacidades-principales",children:"Capacidades principales"}),`
`,e.jsx(a.h3,{id:"construye-tu-jerarquía-de-confianza",children:"Construye tu jerarquía de confianza"}),`
`,e.jsxs(a.p,{children:["Las ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-authorities",children:"autoridades"})," firman certificados. Una raíz establece el ancla de confianza y una intermedia permite separar la emisión por entorno o propósito. La ",e.jsx(a.a,{href:"/docs/platform/pki/ca-hierarchy-and-rotation",children:"jerarquía y rotación"})," explica cómo mantener esa confianza al sustituir una autoridad."]}),`
`,e.jsx(a.h3,{id:"protege-las-claves-criptográficas",children:"Protege las claves criptográficas"}),`
`,e.jsxs(a.p,{children:["Las claves de firma de las CAs se gestionan mediante ",e.jsx(a.a,{href:"/docs/platform/pki/key-management",children:"KMS y motores criptográficos"}),". La clave de un cliente que genera una CSR puede permanecer en ese cliente: conserva su custodia al elegir el método de emisión."]}),`
`,e.jsx(a.h3,{id:"emite-y-controla-certificados",children:"Emite y controla certificados"}),`
`,e.jsxs(a.p,{children:["Un ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-profiles",children:"perfil"})," establece restricciones de sujeto, validez, usos y claves. La CA aplica la configuración de emisión y firma el certificado. En el ",e.jsx(a.a,{href:"/docs/platform/pki/certificates",children:"inventario"})," puedes inspeccionar el resultado, descargarlo y gestionar su estado."]}),`
`,e.jsx(a.h3,{id:"publica-el-estado-de-validación",children:"Publica el estado de validación"}),`
`,e.jsxs(a.p,{children:["La ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-validation",children:"validación"})," reúne cadena, vigencia, usos y estado de revocación. Lamassu publica estado mediante ",e.jsx(a.a,{href:"/docs/platform/pki/ocsp",children:"OCSP"})," y ",e.jsx(a.a,{href:"/docs/platform/pki/crl",children:"CRL"}),"; el consumidor configura qué emisores reconoce y cómo comprueba ese estado."]}),`
`,e.jsx(a.h2,{id:"cómo-comprobar-el-resultado",children:"Cómo comprobar el resultado"}),`
`,e.jsx(a.p,{children:"Un certificado activo en la consola es una parte de la comprobación. Revisa también que:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"su sujeto y sus extensiones identifiquen al cliente esperado;"}),`
`,e.jsx(a.li,{children:"su clave pública corresponda a la clave privada del cliente;"}),`
`,e.jsx(a.li,{children:"su cadena alcance una raíz confiable para el consumidor;"}),`
`,e.jsx(a.li,{children:"sus fechas y usos permitan la operación;"}),`
`,e.jsx(a.li,{children:"el consumidor aplique la comprobación de revocación y su autorización."}),`
`]}),`
`,e.jsxs(a.p,{children:["El ",e.jsx(a.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"recorrido de emisión"})," incluye las primeras comprobaciones independientes."]}),`
`,e.jsx(a.h2,{id:"continúa",children:"Continúa"}),`
`,e.jsxs(o,{children:[e.jsx(n,{title:"Primeros pasos de PKI",description:"Crea una CA y emite y verifica un certificado de cliente.",href:"/docs/platform/pki/quickstarts/overview"}),e.jsx(n,{title:"Aplica la PKI a dispositivos",description:"Asocia certificados al inventario y prepara el enrolamiento.",href:"/docs/platform/iot-fleets/overview"}),e.jsx(n,{title:"Diagnóstico PKI",description:"Comprueba emisión, OCSP y CRL cuando el resultado falla.",href:"/docs/platform/pki/troubleshooting"})]})]})}function u(i={}){const{wrapper:a}=i.components||{};return a?e.jsx(a,{...i,children:e.jsx(r,{...i})}):r(i)}function c(i,a){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:s,default:u,frontmatter:t,structuredData:d,toc:l},Symbol.toStringTag,{value:"Module"}));export{m as _};
