import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let u=`

El inventario de certificados ofrece una vista global de las identidades emitidas por todas las autoridades. También puedes abrir **Issued Certificates** dentro de una CA para limitar la vista a ese emisor.

Busca un certificado [#busca-un-certificado]

Abre **Certificates** y filtra por:

* \`Common Name\` del sujeto.
* Número de serie.
* Estado.
* Autoridad emisora.

Utiliza **Quick Inspect** para una comprobación rápida o **View Details** para ver el sujeto, SANs, usos, cadena, periodo de validez y metadatos completos.

Descarga el certificado [#descarga-el-certificado]

La acción de descarga entrega el certificado en formato PEM. Si el certificado se emitió mediante un CSR externo, la clave privada permanece en el sistema que generó ese CSR. Si se generó en el navegador, la clave solo estuvo disponible al finalizar la emisión.

Revoca un certificado [#revoca-un-certificado]

Revoca una identidad cuando la clave se haya comprometido, el sujeto ya no esté autorizado o el certificado deba dejar de aceptarse antes de expirar.

<Steps>
  <Step>
    Abre la acción [#abre-la-acción]

    En el inventario o la vista de detalle, selecciona **Revoke Certificate**.
  </Step>

  <Step>
    Elige una razón [#elige-una-razón]

    Selecciona la razón que represente el incidente. Esta información se publica en OCSP y en la CRL.
  </Step>

  <Step>
    Confirma y verifica [#confirma-y-verifica]

    Confirma la operación y comprueba que el estado sea **Revoked**. Si la CA regenera la CRL al revocar, verifica también que exista una versión nueva.
  </Step>
</Steps>

<Callout type="warn" title="Solo CertificateHold es reversible">
  Una revocación con la razón \`CertificateHold\` puede reactivarse. Las demás razones producen una revocación definitiva.
</Callout>

Continúa [#continúa]

<Cards>
  <Card title="Validar con OCSP" description="Consulta el estado de un certificado en tiempo real." href="/docs/platform/pki/ocsp" />

  <Card title="Distribuir una CRL" description="Publica el estado para validación offline." href="/docs/platform/pki/crl" />
</Cards>
`,f={title:"Certificados",description:"Consulta, descarga y revoca los certificados emitidos por Lamassu.",sidebar:{group:"CA"}},p={contents:[{heading:void 0,content:"El inventario de certificados ofrece una vista global de las identidades emitidas por todas las autoridades. También puedes abrir **Issued Certificates** dentro de una CA para limitar la vista a ese emisor."},{heading:"busca-un-certificado",content:"Abre **Certificates** y filtra por:"},{heading:"busca-un-certificado",content:"`Common Name` del sujeto."},{heading:"busca-un-certificado",content:"Número de serie."},{heading:"busca-un-certificado",content:"Estado."},{heading:"busca-un-certificado",content:"Autoridad emisora."},{heading:"busca-un-certificado",content:"Utiliza **Quick Inspect** para una comprobación rápida o **View Details** para ver el sujeto, SANs, usos, cadena, periodo de validez y metadatos completos."},{heading:"descarga-el-certificado",content:"La acción de descarga entrega el certificado en formato PEM. Si el certificado se emitió mediante un CSR externo, la clave privada permanece en el sistema que generó ese CSR. Si se generó en el navegador, la clave solo estuvo disponible al finalizar la emisión."},{heading:"revoca-un-certificado",content:"Revoca una identidad cuando la clave se haya comprometido, el sujeto ya no esté autorizado o el certificado deba dejar de aceptarse antes de expirar."},{heading:"abre-la-acción",content:"En el inventario o la vista de detalle, selecciona **Revoke Certificate**."},{heading:"elige-una-razón",content:"Selecciona la razón que represente el incidente. Esta información se publica en OCSP y en la CRL."},{heading:"confirma-y-verifica",content:"Confirma la operación y comprueba que el estado sea **Revoked**. Si la CA regenera la CRL al revocar, verifica también que exista una versión nueva."},{heading:"confirma-y-verifica",content:"Una revocación con la razón `CertificateHold` puede reactivarse. Las demás razones producen una revocación definitiva."},{heading:"continúa",content:'<Card title="Validar con OCSP" description="Consulta el estado de un certificado en tiempo real." href="/docs/platform/pki/ocsp" />'},{heading:"continúa",content:'<Card title="Distribuir una CRL" description="Publica el estado para validación offline." href="/docs/platform/pki/crl" />'}],headings:[{id:"busca-un-certificado",content:"Busca un certificado"},{id:"descarga-el-certificado",content:"Descarga el certificado"},{id:"revoca-un-certificado",content:"Revoca un certificado"},{id:"abre-la-acción",content:"Abre la acción"},{id:"elige-una-razón",content:"Elige una razón"},{id:"confirma-y-verifica",content:"Confirma y verifica"},{id:"continúa",content:"Continúa"}]};const m=[{depth:2,url:"#busca-un-certificado",title:e.jsx(e.Fragment,{children:"Busca un certificado"})},{depth:2,url:"#descarga-el-certificado",title:e.jsx(e.Fragment,{children:"Descarga el certificado"})},{depth:2,url:"#revoca-un-certificado",title:e.jsx(e.Fragment,{children:"Revoca un certificado"})},{depth:3,url:"#abre-la-acción",title:e.jsx(e.Fragment,{children:"Abre la acción"})},{depth:3,url:"#elige-una-razón",title:e.jsx(e.Fragment,{children:"Elige una razón"})},{depth:3,url:"#confirma-y-verifica",title:e.jsx(e.Fragment,{children:"Confirma y verifica"})},{depth:2,url:"#continúa",title:e.jsx(e.Fragment,{children:"Continúa"})}];function s(i){const a={code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...i.components},{Callout:c,Card:t,Cards:o,Step:r,Steps:d}=a;return c||n("Callout"),t||n("Card"),o||n("Cards"),r||n("Step"),d||n("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(a.p,{children:["El inventario de certificados ofrece una vista global de las identidades emitidas por todas las autoridades. También puedes abrir ",e.jsx(a.strong,{children:"Issued Certificates"})," dentro de una CA para limitar la vista a ese emisor."]}),`
`,e.jsx(a.h2,{id:"busca-un-certificado",children:"Busca un certificado"}),`
`,e.jsxs(a.p,{children:["Abre ",e.jsx(a.strong,{children:"Certificates"})," y filtra por:"]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"Common Name"})," del sujeto."]}),`
`,e.jsx(a.li,{children:"Número de serie."}),`
`,e.jsx(a.li,{children:"Estado."}),`
`,e.jsx(a.li,{children:"Autoridad emisora."}),`
`]}),`
`,e.jsxs(a.p,{children:["Utiliza ",e.jsx(a.strong,{children:"Quick Inspect"})," para una comprobación rápida o ",e.jsx(a.strong,{children:"View Details"})," para ver el sujeto, SANs, usos, cadena, periodo de validez y metadatos completos."]}),`
`,e.jsx(a.h2,{id:"descarga-el-certificado",children:"Descarga el certificado"}),`
`,e.jsx(a.p,{children:"La acción de descarga entrega el certificado en formato PEM. Si el certificado se emitió mediante un CSR externo, la clave privada permanece en el sistema que generó ese CSR. Si se generó en el navegador, la clave solo estuvo disponible al finalizar la emisión."}),`
`,e.jsx(a.h2,{id:"revoca-un-certificado",children:"Revoca un certificado"}),`
`,e.jsx(a.p,{children:"Revoca una identidad cuando la clave se haya comprometido, el sujeto ya no esté autorizado o el certificado deba dejar de aceptarse antes de expirar."}),`
`,e.jsxs(d,{children:[e.jsxs(r,{children:[e.jsx(a.h3,{id:"abre-la-acción",children:"Abre la acción"}),e.jsxs(a.p,{children:["En el inventario o la vista de detalle, selecciona ",e.jsx(a.strong,{children:"Revoke Certificate"}),"."]})]}),e.jsxs(r,{children:[e.jsx(a.h3,{id:"elige-una-razón",children:"Elige una razón"}),e.jsx(a.p,{children:"Selecciona la razón que represente el incidente. Esta información se publica en OCSP y en la CRL."})]}),e.jsxs(r,{children:[e.jsx(a.h3,{id:"confirma-y-verifica",children:"Confirma y verifica"}),e.jsxs(a.p,{children:["Confirma la operación y comprueba que el estado sea ",e.jsx(a.strong,{children:"Revoked"}),". Si la CA regenera la CRL al revocar, verifica también que exista una versión nueva."]})]})]}),`
`,e.jsx(c,{type:"warn",title:"Solo CertificateHold es reversible",children:e.jsxs(a.p,{children:["Una revocación con la razón ",e.jsx(a.code,{children:"CertificateHold"})," puede reactivarse. Las demás razones producen una revocación definitiva."]})}),`
`,e.jsx(a.h2,{id:"continúa",children:"Continúa"}),`
`,e.jsxs(o,{children:[e.jsx(t,{title:"Validar con OCSP",description:"Consulta el estado de un certificado en tiempo real.",href:"/docs/platform/pki/ocsp"}),e.jsx(t,{title:"Distribuir una CRL",description:"Publica el estado para validación offline.",href:"/docs/platform/pki/crl"})]})]})}function v(i={}){const{wrapper:a}=i.components||{};return a?e.jsx(a,{...i,children:e.jsx(s,{...i})}):s(i)}function n(i,a){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{u as _markdown,v as default,f as frontmatter,p as structuredData,m as toc};
