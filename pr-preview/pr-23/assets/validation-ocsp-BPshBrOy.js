import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let r=`

Servicio OCSP [#servicio-ocsp]

OCSP (Online Certificate Status Protocol) es el mecanismo que permite a una parte que confía comprobar, en tiempo real, si un certificado concreto está vigente o ha sido revocado. En lugar de descargar una lista completa de certificados revocados, el cliente envía una consulta con el número de serie del certificado y recibe una respuesta firmada con el estado actual.

Lamassu integra un respondedor OCSP propio que atiende estas consultas consultando directamente la base de datos interna de certificados. No se requiere ningún componente externo.

Cómo funciona el respondedor en Lamassu [#cómo-funciona-el-respondedor-en-lamassu]

Cuando un cliente solicita el estado de un certificado, el respondedor localiza el certificado por su número de serie y determina su estado según el registro interno:

* Si el certificado está activo, la respuesta indica \`Good\`.
* Si el certificado ha sido revocado, la respuesta indica \`Revoked\` e incluye la marca de tiempo de revocación y el código de razón conforme a RFC 5280.
* Si el número de serie no se encuentra o el estado no es reconocible, la respuesta indica \`Unknown\`.

La respuesta OCSP es firmada por la CA emisora del certificado consultado, utilizando el motor criptográfico asociado a esa CA. Lamassu no utiliza un certificado delegado de firma OCSP: la CA actúa directamente como respondedor.

Cada respuesta tiene una ventana de validez de 24 horas, reflejada en los campos \`thisUpdate\` y \`nextUpdate\` de la respuesta. Los clientes que cacheen respuestas deben tener en cuenta esta ventana al determinar durante cuánto tiempo una respuesta sigue siendo válida.

Enlace en los certificados emitidos [#enlace-en-los-certificados-emitidos]

La URL del respondedor OCSP se incorpora automáticamente en la extensión AIA (*Authority Information Access*) de todos los certificados emitidos por Lamassu. Los clientes que verifican certificados pueden leer esta URL directamente del certificado sin necesidad de configuración adicional.

Endpoints HTTP [#endpoints-http]

El respondedor acepta consultas en dos formatos, ambos definidos en RFC 6960:

| Método | Ruta                   | Descripción                                                                                   |
| ------ | ---------------------- | --------------------------------------------------------------------------------------------- |
| \`GET\`  | \`/ocsp/{ocsp_request}\` | La petición OCSP va codificada en Base64url en la propia URL.                                 |
| \`POST\` | \`/ocsp\`                | La petición OCSP va en el cuerpo de la petición con \`Content-Type: application/ocsp-request\`. |

Ejemplo de consulta con \`curl\` mediante POST:

\`\`\`bash
curl -X POST https://<LAMASSU_HOST>/ocsp \\
  -H "Content-Type: application/ocsp-request" \\
  --data-binary @request.der \\
  -o response.der
\`\`\`

La respuesta tiene \`Content-Type: application/ocsp-response\` y contiene la respuesta OCSP en formato DER.

Comprobación desde la interfaz [#comprobación-desde-la-interfaz]

Desde la pantalla de certificados de Lamassu es posible lanzar una petición OCSP directamente sobre el certificado seleccionado mediante la acción **OCSP Check**. Esta acción muestra el estado devuelto por el respondedor sin necesidad de herramientas externas.

Referencias [#referencias]

* RFC 6960 - *X.509 Internet Public Key Infrastructure Online Certificate Status Protocol – OCSP*
* RFC 5280 - *Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile* (razones de revocación, sección 5.3.1)

<Cards>
  <Card title="Servicio CRL" href="/docs/manual/servicios-core/validation-crl" />

  <Card title="Validación de certificados" href="/docs/manual/servicios-core/validation" />
</Cards>
`,d={title:"[VA] Servicio OCSP",description:"Validación online del estado de certificados mediante OCSP"},l={contents:[{heading:"servicio-ocsp",content:"OCSP (Online Certificate Status Protocol) es el mecanismo que permite a una parte que confía comprobar, en tiempo real, si un certificado concreto está vigente o ha sido revocado. En lugar de descargar una lista completa de certificados revocados, el cliente envía una consulta con el número de serie del certificado y recibe una respuesta firmada con el estado actual."},{heading:"servicio-ocsp",content:"Lamassu integra un respondedor OCSP propio que atiende estas consultas consultando directamente la base de datos interna de certificados. No se requiere ningún componente externo."},{heading:"cómo-funciona-el-respondedor-en-lamassu",content:"Cuando un cliente solicita el estado de un certificado, el respondedor localiza el certificado por su número de serie y determina su estado según el registro interno:"},{heading:"cómo-funciona-el-respondedor-en-lamassu",content:"Si el certificado está activo, la respuesta indica `Good`."},{heading:"cómo-funciona-el-respondedor-en-lamassu",content:"Si el certificado ha sido revocado, la respuesta indica `Revoked` e incluye la marca de tiempo de revocación y el código de razón conforme a RFC 5280."},{heading:"cómo-funciona-el-respondedor-en-lamassu",content:"Si el número de serie no se encuentra o el estado no es reconocible, la respuesta indica `Unknown`."},{heading:"cómo-funciona-el-respondedor-en-lamassu",content:"La respuesta OCSP es firmada por la CA emisora del certificado consultado, utilizando el motor criptográfico asociado a esa CA. Lamassu no utiliza un certificado delegado de firma OCSP: la CA actúa directamente como respondedor."},{heading:"cómo-funciona-el-respondedor-en-lamassu",content:"Cada respuesta tiene una ventana de validez de 24 horas, reflejada en los campos `thisUpdate` y `nextUpdate` de la respuesta. Los clientes que cacheen respuestas deben tener en cuenta esta ventana al determinar durante cuánto tiempo una respuesta sigue siendo válida."},{heading:"enlace-en-los-certificados-emitidos",content:"La URL del respondedor OCSP se incorpora automáticamente en la extensión AIA (*Authority Information Access*) de todos los certificados emitidos por Lamassu. Los clientes que verifican certificados pueden leer esta URL directamente del certificado sin necesidad de configuración adicional."},{heading:"endpoints-http",content:"El respondedor acepta consultas en dos formatos, ambos definidos en RFC 6960:"},{heading:"endpoints-http",content:"Método"},{heading:"endpoints-http",content:"Ruta"},{heading:"endpoints-http",content:"Descripción"},{heading:"endpoints-http",content:"`GET`"},{heading:"endpoints-http",content:"`/ocsp/{ocsp_request}`"},{heading:"endpoints-http",content:"La petición OCSP va codificada en Base64url en la propia URL."},{heading:"endpoints-http",content:"`POST`"},{heading:"endpoints-http",content:"`/ocsp`"},{heading:"endpoints-http",content:"La petición OCSP va en el cuerpo de la petición con `Content-Type: application/ocsp-request`."},{heading:"endpoints-http",content:"Ejemplo de consulta con `curl` mediante POST:"},{heading:"endpoints-http",content:"La respuesta tiene `Content-Type: application/ocsp-response` y contiene la respuesta OCSP en formato DER."},{heading:"comprobación-desde-la-interfaz",content:"Desde la pantalla de certificados de Lamassu es posible lanzar una petición OCSP directamente sobre el certificado seleccionado mediante la acción **OCSP Check**. Esta acción muestra el estado devuelto por el respondedor sin necesidad de herramientas externas."},{heading:"referencias",content:"RFC 6960 - *X.509 Internet Public Key Infrastructure Online Certificate Status Protocol – OCSP*"},{heading:"referencias",content:"RFC 5280 - *Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile* (razones de revocación, sección 5.3.1)"},{heading:"referencias",content:'<Card title="Servicio CRL" href="/docs/manual/servicios-core/validation-crl" />'},{heading:"referencias",content:'<Card title="Validación de certificados" href="/docs/manual/servicios-core/validation" />'}],headings:[{id:"servicio-ocsp",content:"Servicio OCSP"},{id:"cómo-funciona-el-respondedor-en-lamassu",content:"Cómo funciona el respondedor en Lamassu"},{id:"enlace-en-los-certificados-emitidos",content:"Enlace en los certificados emitidos"},{id:"endpoints-http",content:"Endpoints HTTP"},{id:"comprobación-desde-la-interfaz",content:"Comprobación desde la interfaz"},{id:"referencias",content:"Referencias"}]};const p=[{depth:1,url:"#servicio-ocsp",title:e.jsx(e.Fragment,{children:"Servicio OCSP"})},{depth:2,url:"#cómo-funciona-el-respondedor-en-lamassu",title:e.jsx(e.Fragment,{children:"Cómo funciona el respondedor en Lamassu"})},{depth:2,url:"#enlace-en-los-certificados-emitidos",title:e.jsx(e.Fragment,{children:"Enlace en los certificados emitidos"})},{depth:2,url:"#endpoints-http",title:e.jsx(e.Fragment,{children:"Endpoints HTTP"})},{depth:2,url:"#comprobación-desde-la-interfaz",title:e.jsx(e.Fragment,{children:"Comprobación desde la interfaz"})},{depth:2,url:"#referencias",title:e.jsx(e.Fragment,{children:"Referencias"})}];function t(i){const n={code:"code",em:"em",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Card:a,Cards:s}=n;return a||o("Card"),s||o("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"servicio-ocsp",children:"Servicio OCSP"}),`
`,e.jsx(n.p,{children:"OCSP (Online Certificate Status Protocol) es el mecanismo que permite a una parte que confía comprobar, en tiempo real, si un certificado concreto está vigente o ha sido revocado. En lugar de descargar una lista completa de certificados revocados, el cliente envía una consulta con el número de serie del certificado y recibe una respuesta firmada con el estado actual."}),`
`,e.jsx(n.p,{children:"Lamassu integra un respondedor OCSP propio que atiende estas consultas consultando directamente la base de datos interna de certificados. No se requiere ningún componente externo."}),`
`,e.jsx(n.h2,{id:"cómo-funciona-el-respondedor-en-lamassu",children:"Cómo funciona el respondedor en Lamassu"}),`
`,e.jsx(n.p,{children:"Cuando un cliente solicita el estado de un certificado, el respondedor localiza el certificado por su número de serie y determina su estado según el registro interno:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Si el certificado está activo, la respuesta indica ",e.jsx(n.code,{children:"Good"}),"."]}),`
`,e.jsxs(n.li,{children:["Si el certificado ha sido revocado, la respuesta indica ",e.jsx(n.code,{children:"Revoked"})," e incluye la marca de tiempo de revocación y el código de razón conforme a RFC 5280."]}),`
`,e.jsxs(n.li,{children:["Si el número de serie no se encuentra o el estado no es reconocible, la respuesta indica ",e.jsx(n.code,{children:"Unknown"}),"."]}),`
`]}),`
`,e.jsx(n.p,{children:"La respuesta OCSP es firmada por la CA emisora del certificado consultado, utilizando el motor criptográfico asociado a esa CA. Lamassu no utiliza un certificado delegado de firma OCSP: la CA actúa directamente como respondedor."}),`
`,e.jsxs(n.p,{children:["Cada respuesta tiene una ventana de validez de 24 horas, reflejada en los campos ",e.jsx(n.code,{children:"thisUpdate"})," y ",e.jsx(n.code,{children:"nextUpdate"})," de la respuesta. Los clientes que cacheen respuestas deben tener en cuenta esta ventana al determinar durante cuánto tiempo una respuesta sigue siendo válida."]}),`
`,e.jsx(n.h2,{id:"enlace-en-los-certificados-emitidos",children:"Enlace en los certificados emitidos"}),`
`,e.jsxs(n.p,{children:["La URL del respondedor OCSP se incorpora automáticamente en la extensión AIA (",e.jsx(n.em,{children:"Authority Information Access"}),") de todos los certificados emitidos por Lamassu. Los clientes que verifican certificados pueden leer esta URL directamente del certificado sin necesidad de configuración adicional."]}),`
`,e.jsx(n.h2,{id:"endpoints-http",children:"Endpoints HTTP"}),`
`,e.jsx(n.p,{children:"El respondedor acepta consultas en dos formatos, ambos definidos en RFC 6960:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Método"}),e.jsx(n.th,{children:"Ruta"}),e.jsx(n.th,{children:"Descripción"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"GET"})}),e.jsx(n.td,{children:e.jsx(n.code,{children:"/ocsp/{ocsp_request}"})}),e.jsx(n.td,{children:"La petición OCSP va codificada en Base64url en la propia URL."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"POST"})}),e.jsx(n.td,{children:e.jsx(n.code,{children:"/ocsp"})}),e.jsxs(n.td,{children:["La petición OCSP va en el cuerpo de la petición con ",e.jsx(n.code,{children:"Content-Type: application/ocsp-request"}),"."]})]})]})]}),`
`,e.jsxs(n.p,{children:["Ejemplo de consulta con ",e.jsx(n.code,{children:"curl"})," mediante POST:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"curl"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -X"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" POST"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"LAMASSU_HOS"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/ocsp"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  -H"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "Content-Type: application/ocsp-request"'}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --data-binary"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @request.der"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  -o"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" response.der"})]})]})})}),`
`,e.jsxs(n.p,{children:["La respuesta tiene ",e.jsx(n.code,{children:"Content-Type: application/ocsp-response"})," y contiene la respuesta OCSP en formato DER."]}),`
`,e.jsx(n.h2,{id:"comprobación-desde-la-interfaz",children:"Comprobación desde la interfaz"}),`
`,e.jsxs(n.p,{children:["Desde la pantalla de certificados de Lamassu es posible lanzar una petición OCSP directamente sobre el certificado seleccionado mediante la acción ",e.jsx(n.strong,{children:"OCSP Check"}),". Esta acción muestra el estado devuelto por el respondedor sin necesidad de herramientas externas."]}),`
`,e.jsx(n.h2,{id:"referencias",children:"Referencias"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["RFC 6960 - ",e.jsx(n.em,{children:"X.509 Internet Public Key Infrastructure Online Certificate Status Protocol – OCSP"})]}),`
`,e.jsxs(n.li,{children:["RFC 5280 - ",e.jsx(n.em,{children:"Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile"})," (razones de revocación, sección 5.3.1)"]}),`
`]}),`
`,e.jsxs(s,{children:[e.jsx(a,{title:"Servicio CRL",href:"/docs/manual/servicios-core/validation-crl"}),e.jsx(a,{title:"Validación de certificados",href:"/docs/manual/servicios-core/validation"})]})]})}function u(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}function o(i,n){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{r as _markdown,u as default,d as frontmatter,l as structuredData,p as toc};
