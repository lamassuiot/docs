import{j as e}from"./index-prc0XQdj.js";let c=`

Crearás una autoridad raíz con una clave nueva custodiada por un motor de Lamassu. Al terminar tendrás una CA activa y su certificado público en \`ca.pem\`, preparado para verificar la emisión del siguiente recorrido.

Antes de empezar [#antes-de-empezar]

* Acceso a la consola y permisos para crear claves y autoridades.
* Un motor criptográfico disponible que admita el algoritmo elegido.
* OpenSSL 3.x para comprobar el certificado descargado.

Utiliza una instancia de evaluación o una autoridad destinada a estas pruebas. El ejemplo crea una raíz que emite directamente; para diseñar una jerarquía operativa, consulta [Jerarquía y rotación](/docs/platform/pki/ca-hierarchy-and-rotation).

<Steps>
  <Step>
    Abre el asistente de creación [#abre-el-asistente-de-creación]

    En **Certification Authorities**, selecciona **Create New CA** y elige crear una CA con un par de claves nuevo.

    El flujo **Create New CA (Existing Key)** se explica en la [guía de autoridades](/docs/platform/pki/certificate-authorities).
  </Step>

  <Step>
    Selecciona la clave [#selecciona-la-clave]

    Elige el motor que custodiará la clave y un algoritmo permitido por sus capacidades. Para este ejemplo puedes utilizar **EC P-384** si está disponible.

    La clave privada de la CA se utiliza a través del motor. En este recorrido descargarás únicamente el certificado público de la autoridad.
  </Step>

  <Step>
    Define la autoridad [#define-la-autoridad]

    Selecciona **Root CA** y completa:

    * **CA Name**: \`Acme Evaluation Root CA\`.
    * **Subject**: los datos de organización y país de tu evaluación.
    * **CA Certificate Expiration**: por ejemplo, un año desde la creación.
    * **Default End-Entity Certificate Issuance Expiration**: por ejemplo, 90 días, dentro de la vigencia de la CA.

    El nombre de la CA se utilizará como \`Common Name\`. Mantén los usos de CA necesarios para firmar certificados y CRLs.
  </Step>

  <Step>
    Revisa y crea la CA [#revisa-y-crea-la-ca]

    Comprueba motor, algoritmo, sujeto, tipo raíz y fechas. Confirma la creación y anota el identificador de la autoridad para reconocerla en el DMS o en la API.
  </Step>

  <Step>
    Verifica el resultado [#verifica-el-resultado]

    Abre la nueva CA. Debe aparecer activa, mostrar su certificado y permitir acceder a **Issued Certificates**.

    Descarga o copia el certificado PEM de la autoridad y guárdalo como \`ca.pem\`. Comprueba que el archivo contiene el bloque completo, incluidos \`BEGIN CERTIFICATE\` y \`END CERTIFICATE\`.
  </Step>
</Steps>

Comprueba el certificado de CA [#comprueba-el-certificado-de-ca]

Ejecuta desde el directorio donde guardaste \`ca.pem\`:

\`\`\`bash
openssl x509 -in ca.pem -noout -subject -issuer -dates
openssl x509 -in ca.pem -noout -text
openssl verify -CAfile ca.pem -check_ss_sig ca.pem
\`\`\`

Comprueba que sujeto y emisor corresponden a la raíz creada, las fechas incluyen el momento actual, **Basic Constraints** contiene \`CA:TRUE\` y **Key Usage** permite firmar certificados. El último comando debe devolver \`ca.pem: OK\`.

Has elegido explícitamente \`ca.pem\` como ancla de esta prueba. Que la autofirma sea válida no instala esa confianza en otros consumidores. Consulta la referencia de [openssl-verify](https://docs.openssl.org/3.6/man1/openssl-verify/) para las opciones de comprobación.

Si el resultado falla [#si-el-resultado-falla]

* Si la creación falla, comprueba permisos, disponibilidad del motor y algoritmo seleccionado.
* Si OpenSSL no lee el archivo, vuelve a copiar el bloque PEM completo.
* Si fallan la firma o las fechas, revisa que hayas descargado el certificado de esta CA y que el reloj del equipo sea correcto.

El [diagnóstico PKI](/docs/platform/pki/troubleshooting) reúne las comprobaciones de emisión y dependencias criptográficas.

Siguiente paso [#siguiente-paso]

Continúa con [Emite y verifica un certificado](/docs/platform/pki/quickstarts/issue-certificate), utilizando esta autoridad y \`ca.pem\`.
`,t={title:"Crea tu primera CA",description:"Crea una raíz de evaluación y comprueba su certificado antes de emitir."},l={contents:[{heading:void 0,content:"Crearás una autoridad raíz con una clave nueva custodiada por un motor de Lamassu. Al terminar tendrás una CA activa y su certificado público en `ca.pem`, preparado para verificar la emisión del siguiente recorrido."},{heading:"antes-de-empezar",content:"Acceso a la consola y permisos para crear claves y autoridades."},{heading:"antes-de-empezar",content:"Un motor criptográfico disponible que admita el algoritmo elegido."},{heading:"antes-de-empezar",content:"OpenSSL 3.x para comprobar el certificado descargado."},{heading:"antes-de-empezar",content:"Utiliza una instancia de evaluación o una autoridad destinada a estas pruebas. El ejemplo crea una raíz que emite directamente; para diseñar una jerarquía operativa, consulta Jerarquía y rotación."},{heading:"abre-el-asistente-de-creación",content:"En **Certification Authorities**, selecciona **Create New CA** y elige crear una CA con un par de claves nuevo."},{heading:"abre-el-asistente-de-creación",content:"El flujo &#x2A;*Create New CA (Existing Key)** se explica en la guía de autoridades."},{heading:"selecciona-la-clave",content:"Elige el motor que custodiará la clave y un algoritmo permitido por sus capacidades. Para este ejemplo puedes utilizar **EC P-384** si está disponible."},{heading:"selecciona-la-clave",content:"La clave privada de la CA se utiliza a través del motor. En este recorrido descargarás únicamente el certificado público de la autoridad."},{heading:"define-la-autoridad",content:"Selecciona **Root CA** y completa:"},{heading:"define-la-autoridad",content:"**CA Name**: `Acme Evaluation Root CA`."},{heading:"define-la-autoridad",content:"**Subject**: los datos de organización y país de tu evaluación."},{heading:"define-la-autoridad",content:"**CA Certificate Expiration**: por ejemplo, un año desde la creación."},{heading:"define-la-autoridad",content:"**Default End-Entity Certificate Issuance Expiration**: por ejemplo, 90 días, dentro de la vigencia de la CA."},{heading:"define-la-autoridad",content:"El nombre de la CA se utilizará como `Common Name`. Mantén los usos de CA necesarios para firmar certificados y CRLs."},{heading:"revisa-y-crea-la-ca",content:"Comprueba motor, algoritmo, sujeto, tipo raíz y fechas. Confirma la creación y anota el identificador de la autoridad para reconocerla en el DMS o en la API."},{heading:"verifica-el-resultado",content:"Abre la nueva CA. Debe aparecer activa, mostrar su certificado y permitir acceder a **Issued Certificates**."},{heading:"verifica-el-resultado",content:"Descarga o copia el certificado PEM de la autoridad y guárdalo como `ca.pem`. Comprueba que el archivo contiene el bloque completo, incluidos `BEGIN CERTIFICATE` y `END CERTIFICATE`."},{heading:"comprueba-el-certificado-de-ca",content:"Ejecuta desde el directorio donde guardaste `ca.pem`:"},{heading:"comprueba-el-certificado-de-ca",content:"Comprueba que sujeto y emisor corresponden a la raíz creada, las fechas incluyen el momento actual, **Basic Constraints** contiene `CA:TRUE` y **Key Usage** permite firmar certificados. El último comando debe devolver `ca.pem: OK`."},{heading:"comprueba-el-certificado-de-ca",content:"Has elegido explícitamente `ca.pem` como ancla de esta prueba. Que la autofirma sea válida no instala esa confianza en otros consumidores. Consulta la referencia de openssl-verify para las opciones de comprobación."},{heading:"si-el-resultado-falla",content:"Si la creación falla, comprueba permisos, disponibilidad del motor y algoritmo seleccionado."},{heading:"si-el-resultado-falla",content:"Si OpenSSL no lee el archivo, vuelve a copiar el bloque PEM completo."},{heading:"si-el-resultado-falla",content:"Si fallan la firma o las fechas, revisa que hayas descargado el certificado de esta CA y que el reloj del equipo sea correcto."},{heading:"si-el-resultado-falla",content:"El diagnóstico PKI reúne las comprobaciones de emisión y dependencias criptográficas."},{heading:"siguiente-paso",content:"Continúa con Emite y verifica un certificado, utilizando esta autoridad y `ca.pem`."}],headings:[{id:"antes-de-empezar",content:"Antes de empezar"},{id:"abre-el-asistente-de-creación",content:"Abre el asistente de creación"},{id:"selecciona-la-clave",content:"Selecciona la clave"},{id:"define-la-autoridad",content:"Define la autoridad"},{id:"revisa-y-crea-la-ca",content:"Revisa y crea la CA"},{id:"verifica-el-resultado",content:"Verifica el resultado"},{id:"comprueba-el-certificado-de-ca",content:"Comprueba el certificado de CA"},{id:"si-el-resultado-falla",content:"Si el resultado falla"},{id:"siguiente-paso",content:"Siguiente paso"}]};const d=[{depth:2,url:"#antes-de-empezar",title:e.jsx(e.Fragment,{children:"Antes de empezar"})},{depth:3,url:"#abre-el-asistente-de-creación",title:e.jsx(e.Fragment,{children:"Abre el asistente de creación"})},{depth:3,url:"#selecciona-la-clave",title:e.jsx(e.Fragment,{children:"Selecciona la clave"})},{depth:3,url:"#define-la-autoridad",title:e.jsx(e.Fragment,{children:"Define la autoridad"})},{depth:3,url:"#revisa-y-crea-la-ca",title:e.jsx(e.Fragment,{children:"Revisa y crea la CA"})},{depth:3,url:"#verifica-el-resultado",title:e.jsx(e.Fragment,{children:"Verifica el resultado"})},{depth:2,url:"#comprueba-el-certificado-de-ca",title:e.jsx(e.Fragment,{children:"Comprueba el certificado de CA"})},{depth:2,url:"#si-el-resultado-falla",title:e.jsx(e.Fragment,{children:"Si el resultado falla"})},{depth:2,url:"#siguiente-paso",title:e.jsx(e.Fragment,{children:"Siguiente paso"})}];function o(i){const a={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components},{Step:n,Steps:r}=a;return n||s("Step"),r||s("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(a.p,{children:["Crearás una autoridad raíz con una clave nueva custodiada por un motor de Lamassu. Al terminar tendrás una CA activa y su certificado público en ",e.jsx(a.code,{children:"ca.pem"}),", preparado para verificar la emisión del siguiente recorrido."]}),`
`,e.jsx(a.h2,{id:"antes-de-empezar",children:"Antes de empezar"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Acceso a la consola y permisos para crear claves y autoridades."}),`
`,e.jsx(a.li,{children:"Un motor criptográfico disponible que admita el algoritmo elegido."}),`
`,e.jsx(a.li,{children:"OpenSSL 3.x para comprobar el certificado descargado."}),`
`]}),`
`,e.jsxs(a.p,{children:["Utiliza una instancia de evaluación o una autoridad destinada a estas pruebas. El ejemplo crea una raíz que emite directamente; para diseñar una jerarquía operativa, consulta ",e.jsx(a.a,{href:"/docs/platform/pki/ca-hierarchy-and-rotation",children:"Jerarquía y rotación"}),"."]}),`
`,e.jsxs(r,{children:[e.jsxs(n,{children:[e.jsx(a.h3,{id:"abre-el-asistente-de-creación",children:"Abre el asistente de creación"}),e.jsxs(a.p,{children:["En ",e.jsx(a.strong,{children:"Certification Authorities"}),", selecciona ",e.jsx(a.strong,{children:"Create New CA"})," y elige crear una CA con un par de claves nuevo."]}),e.jsxs(a.p,{children:["El flujo ",e.jsx(a.strong,{children:"Create New CA (Existing Key)"})," se explica en la ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-authorities",children:"guía de autoridades"}),"."]})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"selecciona-la-clave",children:"Selecciona la clave"}),e.jsxs(a.p,{children:["Elige el motor que custodiará la clave y un algoritmo permitido por sus capacidades. Para este ejemplo puedes utilizar ",e.jsx(a.strong,{children:"EC P-384"})," si está disponible."]}),e.jsx(a.p,{children:"La clave privada de la CA se utiliza a través del motor. En este recorrido descargarás únicamente el certificado público de la autoridad."})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"define-la-autoridad",children:"Define la autoridad"}),e.jsxs(a.p,{children:["Selecciona ",e.jsx(a.strong,{children:"Root CA"})," y completa:"]}),e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"CA Name"}),": ",e.jsx(a.code,{children:"Acme Evaluation Root CA"}),"."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Subject"}),": los datos de organización y país de tu evaluación."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"CA Certificate Expiration"}),": por ejemplo, un año desde la creación."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Default End-Entity Certificate Issuance Expiration"}),": por ejemplo, 90 días, dentro de la vigencia de la CA."]}),`
`]}),e.jsxs(a.p,{children:["El nombre de la CA se utilizará como ",e.jsx(a.code,{children:"Common Name"}),". Mantén los usos de CA necesarios para firmar certificados y CRLs."]})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"revisa-y-crea-la-ca",children:"Revisa y crea la CA"}),e.jsx(a.p,{children:"Comprueba motor, algoritmo, sujeto, tipo raíz y fechas. Confirma la creación y anota el identificador de la autoridad para reconocerla en el DMS o en la API."})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"verifica-el-resultado",children:"Verifica el resultado"}),e.jsxs(a.p,{children:["Abre la nueva CA. Debe aparecer activa, mostrar su certificado y permitir acceder a ",e.jsx(a.strong,{children:"Issued Certificates"}),"."]}),e.jsxs(a.p,{children:["Descarga o copia el certificado PEM de la autoridad y guárdalo como ",e.jsx(a.code,{children:"ca.pem"}),". Comprueba que el archivo contiene el bloque completo, incluidos ",e.jsx(a.code,{children:"BEGIN CERTIFICATE"})," y ",e.jsx(a.code,{children:"END CERTIFICATE"}),"."]})]})]}),`
`,e.jsx(a.h2,{id:"comprueba-el-certificado-de-ca",children:"Comprueba el certificado de CA"}),`
`,e.jsxs(a.p,{children:["Ejecuta desde el directorio donde guardaste ",e.jsx(a.code,{children:"ca.pem"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(a.code,{children:[e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" x509"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ca.pem"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -noout"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -subject"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -issuer"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -dates"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" x509"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ca.pem"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -noout"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -text"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" verify"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -CAfile"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ca.pem"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -check_ss_sig"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ca.pem"})]})]})})}),`
`,e.jsxs(a.p,{children:["Comprueba que sujeto y emisor corresponden a la raíz creada, las fechas incluyen el momento actual, ",e.jsx(a.strong,{children:"Basic Constraints"})," contiene ",e.jsx(a.code,{children:"CA:TRUE"})," y ",e.jsx(a.strong,{children:"Key Usage"})," permite firmar certificados. El último comando debe devolver ",e.jsx(a.code,{children:"ca.pem: OK"}),"."]}),`
`,e.jsxs(a.p,{children:["Has elegido explícitamente ",e.jsx(a.code,{children:"ca.pem"})," como ancla de esta prueba. Que la autofirma sea válida no instala esa confianza en otros consumidores. Consulta la referencia de ",e.jsx(a.a,{href:"https://docs.openssl.org/3.6/man1/openssl-verify/",children:"openssl-verify"})," para las opciones de comprobación."]}),`
`,e.jsx(a.h2,{id:"si-el-resultado-falla",children:"Si el resultado falla"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Si la creación falla, comprueba permisos, disponibilidad del motor y algoritmo seleccionado."}),`
`,e.jsx(a.li,{children:"Si OpenSSL no lee el archivo, vuelve a copiar el bloque PEM completo."}),`
`,e.jsx(a.li,{children:"Si fallan la firma o las fechas, revisa que hayas descargado el certificado de esta CA y que el reloj del equipo sea correcto."}),`
`]}),`
`,e.jsxs(a.p,{children:["El ",e.jsx(a.a,{href:"/docs/platform/pki/troubleshooting",children:"diagnóstico PKI"})," reúne las comprobaciones de emisión y dependencias criptográficas."]}),`
`,e.jsx(a.h2,{id:"siguiente-paso",children:"Siguiente paso"}),`
`,e.jsxs(a.p,{children:["Continúa con ",e.jsx(a.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"Emite y verifica un certificado"}),", utilizando esta autoridad y ",e.jsx(a.code,{children:"ca.pem"}),"."]})]})}function p(i={}){const{wrapper:a}=i.components||{};return a?e.jsx(a,{...i,children:e.jsx(o,{...i})}):o(i)}function s(i,a){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:p,frontmatter:t,structuredData:l,toc:d},Symbol.toStringTag,{value:"Module"}));export{m as _};
