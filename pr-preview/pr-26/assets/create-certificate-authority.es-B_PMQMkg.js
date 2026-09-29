import{j as e}from"./index-prc0XQdj.js";let s=`

En este quickstart crearás una autoridad de certificación raíz con un nuevo par de claves. Al terminar tendrás una CA activa que podrás usar en el siguiente quickstart.

Antes de empezar [#antes-de-empezar]

* Acceso a la consola con permisos para gestionar autoridades.
* Al menos un motor criptográfico disponible.
* Un nombre que identifique el propósito de la CA, por ejemplo \`Acme Device Root CA\`.

<Callout type="info" title="Raíz o intermedia">
  Una CA raíz se autofirma y actúa como ancla de confianza. Para producción suele ser preferible mantener la raíz más protegida y emitir desde una CA intermedia.
</Callout>

<Steps>
  <Step>
    Abre el asistente de creación [#abre-el-asistente-de-creación]

    En el menú lateral, abre **Certification Authorities** y selecciona **Create New CA**.

    Elige crear una CA con un par de claves nuevo. Si ya tienes la clave en el KMS, usa **Create New CA (Existing Key)**.
  </Step>

  <Step>
    Selecciona la clave [#selecciona-la-clave]

    Elige el motor criptográfico que custodiará la clave y configura el algoritmo. Para una primera CA puedes usar **EC P-384**, siempre que sea compatible con tus consumidores.

    La clave privada permanecerá bajo el control del motor seleccionado.
  </Step>

  <Step>
    Define la autoridad [#define-la-autoridad]

    Selecciona **Root CA** y completa:

    * **CA Name**: un nombre único y reconocible.
    * **Subject**: al menos la organización y el país que identificarán a la autoridad.
    * **CA Certificate Expiration**: una validez mayor que la de los certificados que emitirá.
    * **Default End-Entity Certificate Issuance Expiration**: la validez predeterminada de los certificados finales.

    El nombre de la CA se utilizará como \`Common Name\` del certificado.
  </Step>

  <Step>
    Revisa y crea la CA [#revisa-y-crea-la-ca]

    Comprueba el algoritmo, el sujeto y las fechas antes de confirmar. Estos valores definen el ancla de confianza y no deberían elegirse como simples datos de prueba en un entorno productivo.
  </Step>

  <Step>
    Verifica el resultado [#verifica-el-resultado]

    Abre la nueva CA desde el listado. Debe aparecer activa y mostrar su certificado PEM, la fecha de expiración y la pestaña **Issued Certificates**.
  </Step>
</Steps>

Siguiente paso [#siguiente-paso]

Usa la autoridad para [emitir tu primer certificado](/docs/platform/pki/quickstarts/issue-certificate), o consulta la [guía completa de autoridades](/docs/platform/pki/certificate-authorities) para crear una CA intermedia, importar una CA o definir perfiles avanzados.
`,l={title:"Crea tu primera CA",description:"Crea una autoridad raíz y comprueba que está preparada para emitir certificados."},d={contents:[{heading:void 0,content:"En este quickstart crearás una autoridad de certificación raíz con un nuevo par de claves. Al terminar tendrás una CA activa que podrás usar en el siguiente quickstart."},{heading:"antes-de-empezar",content:"Acceso a la consola con permisos para gestionar autoridades."},{heading:"antes-de-empezar",content:"Al menos un motor criptográfico disponible."},{heading:"antes-de-empezar",content:"Un nombre que identifique el propósito de la CA, por ejemplo `Acme Device Root CA`."},{heading:"antes-de-empezar",content:"Una CA raíz se autofirma y actúa como ancla de confianza. Para producción suele ser preferible mantener la raíz más protegida y emitir desde una CA intermedia."},{heading:"abre-el-asistente-de-creación",content:"En el menú lateral, abre **Certification Authorities** y selecciona **Create New CA**."},{heading:"abre-el-asistente-de-creación",content:"Elige crear una CA con un par de claves nuevo. Si ya tienes la clave en el KMS, usa &#x2A;*Create New CA (Existing Key)**."},{heading:"selecciona-la-clave",content:"Elige el motor criptográfico que custodiará la clave y configura el algoritmo. Para una primera CA puedes usar **EC P-384**, siempre que sea compatible con tus consumidores."},{heading:"selecciona-la-clave",content:"La clave privada permanecerá bajo el control del motor seleccionado."},{heading:"define-la-autoridad",content:"Selecciona **Root CA** y completa:"},{heading:"define-la-autoridad",content:"**CA Name**: un nombre único y reconocible."},{heading:"define-la-autoridad",content:"**Subject**: al menos la organización y el país que identificarán a la autoridad."},{heading:"define-la-autoridad",content:"**CA Certificate Expiration**: una validez mayor que la de los certificados que emitirá."},{heading:"define-la-autoridad",content:"**Default End-Entity Certificate Issuance Expiration**: la validez predeterminada de los certificados finales."},{heading:"define-la-autoridad",content:"El nombre de la CA se utilizará como `Common Name` del certificado."},{heading:"revisa-y-crea-la-ca",content:"Comprueba el algoritmo, el sujeto y las fechas antes de confirmar. Estos valores definen el ancla de confianza y no deberían elegirse como simples datos de prueba en un entorno productivo."},{heading:"verifica-el-resultado",content:"Abre la nueva CA desde el listado. Debe aparecer activa y mostrar su certificado PEM, la fecha de expiración y la pestaña **Issued Certificates**."},{heading:"siguiente-paso",content:"Usa la autoridad para emitir tu primer certificado, o consulta la guía completa de autoridades para crear una CA intermedia, importar una CA o definir perfiles avanzados."}],headings:[{id:"antes-de-empezar",content:"Antes de empezar"},{id:"abre-el-asistente-de-creación",content:"Abre el asistente de creación"},{id:"selecciona-la-clave",content:"Selecciona la clave"},{id:"define-la-autoridad",content:"Define la autoridad"},{id:"revisa-y-crea-la-ca",content:"Revisa y crea la CA"},{id:"verifica-el-resultado",content:"Verifica el resultado"},{id:"siguiente-paso",content:"Siguiente paso"}]};const u=[{depth:2,url:"#antes-de-empezar",title:e.jsx(e.Fragment,{children:"Antes de empezar"})},{depth:3,url:"#abre-el-asistente-de-creación",title:e.jsx(e.Fragment,{children:"Abre el asistente de creación"})},{depth:3,url:"#selecciona-la-clave",title:e.jsx(e.Fragment,{children:"Selecciona la clave"})},{depth:3,url:"#define-la-autoridad",title:e.jsx(e.Fragment,{children:"Define la autoridad"})},{depth:3,url:"#revisa-y-crea-la-ca",title:e.jsx(e.Fragment,{children:"Revisa y crea la CA"})},{depth:3,url:"#verifica-el-resultado",title:e.jsx(e.Fragment,{children:"Verifica el resultado"})},{depth:2,url:"#siguiente-paso",title:e.jsx(e.Fragment,{children:"Siguiente paso"})}];function c(i){const a={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...i.components},{Callout:t,Step:n,Steps:o}=a;return t||r("Callout"),n||r("Step"),o||r("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(a.p,{children:"En este quickstart crearás una autoridad de certificación raíz con un nuevo par de claves. Al terminar tendrás una CA activa que podrás usar en el siguiente quickstart."}),`
`,e.jsx(a.h2,{id:"antes-de-empezar",children:"Antes de empezar"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Acceso a la consola con permisos para gestionar autoridades."}),`
`,e.jsx(a.li,{children:"Al menos un motor criptográfico disponible."}),`
`,e.jsxs(a.li,{children:["Un nombre que identifique el propósito de la CA, por ejemplo ",e.jsx(a.code,{children:"Acme Device Root CA"}),"."]}),`
`]}),`
`,e.jsx(t,{type:"info",title:"Raíz o intermedia",children:e.jsx(a.p,{children:"Una CA raíz se autofirma y actúa como ancla de confianza. Para producción suele ser preferible mantener la raíz más protegida y emitir desde una CA intermedia."})}),`
`,e.jsxs(o,{children:[e.jsxs(n,{children:[e.jsx(a.h3,{id:"abre-el-asistente-de-creación",children:"Abre el asistente de creación"}),e.jsxs(a.p,{children:["En el menú lateral, abre ",e.jsx(a.strong,{children:"Certification Authorities"})," y selecciona ",e.jsx(a.strong,{children:"Create New CA"}),"."]}),e.jsxs(a.p,{children:["Elige crear una CA con un par de claves nuevo. Si ya tienes la clave en el KMS, usa ",e.jsx(a.strong,{children:"Create New CA (Existing Key)"}),"."]})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"selecciona-la-clave",children:"Selecciona la clave"}),e.jsxs(a.p,{children:["Elige el motor criptográfico que custodiará la clave y configura el algoritmo. Para una primera CA puedes usar ",e.jsx(a.strong,{children:"EC P-384"}),", siempre que sea compatible con tus consumidores."]}),e.jsx(a.p,{children:"La clave privada permanecerá bajo el control del motor seleccionado."})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"define-la-autoridad",children:"Define la autoridad"}),e.jsxs(a.p,{children:["Selecciona ",e.jsx(a.strong,{children:"Root CA"})," y completa:"]}),e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"CA Name"}),": un nombre único y reconocible."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Subject"}),": al menos la organización y el país que identificarán a la autoridad."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"CA Certificate Expiration"}),": una validez mayor que la de los certificados que emitirá."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Default End-Entity Certificate Issuance Expiration"}),": la validez predeterminada de los certificados finales."]}),`
`]}),e.jsxs(a.p,{children:["El nombre de la CA se utilizará como ",e.jsx(a.code,{children:"Common Name"})," del certificado."]})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"revisa-y-crea-la-ca",children:"Revisa y crea la CA"}),e.jsx(a.p,{children:"Comprueba el algoritmo, el sujeto y las fechas antes de confirmar. Estos valores definen el ancla de confianza y no deberían elegirse como simples datos de prueba en un entorno productivo."})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"verifica-el-resultado",children:"Verifica el resultado"}),e.jsxs(a.p,{children:["Abre la nueva CA desde el listado. Debe aparecer activa y mostrar su certificado PEM, la fecha de expiración y la pestaña ",e.jsx(a.strong,{children:"Issued Certificates"}),"."]})]})]}),`
`,e.jsx(a.h2,{id:"siguiente-paso",children:"Siguiente paso"}),`
`,e.jsxs(a.p,{children:["Usa la autoridad para ",e.jsx(a.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"emitir tu primer certificado"}),", o consulta la ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-authorities",children:"guía completa de autoridades"})," para crear una CA intermedia, importar una CA o definir perfiles avanzados."]})]})}function p(i={}){const{wrapper:a}=i.components||{};return a?e.jsx(a,{...i,children:e.jsx(c,{...i})}):c(i)}function r(i,a){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const f=Object.freeze(Object.defineProperty({__proto__:null,_markdown:s,default:p,frontmatter:l,structuredData:d,toc:u},Symbol.toStringTag,{value:"Module"}));export{f as _};
