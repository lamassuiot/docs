import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let r=`

La emisión demuestra quién firmó un certificado; la validación permite saber si todavía debe aceptarse. Lamassu publica el estado mediante dos mecanismos complementarios.

Elige un mecanismo [#elige-un-mecanismo]

Usa **OCSP** cuando el consumidor esté conectado y necesite consultar el estado más reciente de un certificado concreto.

Usa una **CRL** cuando la validación deba realizarse localmente, sin conexión o sobre un volumen elevado de certificados. El consumidor descarga periódicamente una lista firmada y la conserva hasta la siguiente actualización.

Muchos entornos utilizan ambos: OCSP como comprobación primaria y CRL como mecanismo local o de respaldo.

<Cards>
  <Card title="Validación online con OCSP" description="Consulta estados Good, Revoked y Unknown en tiempo real." href="/docs/platform/pki/ocsp" />

  <Card title="Listas de revocación" description="Genera, publica y distribuye CRLs por autoridad." href="/docs/platform/pki/crl" />
</Cards>
`,d={title:"Validación de certificados",description:"Publica el estado de las identidades mediante OCSP y CRL.",sidebar:{group:"VA",label:"Visión general"}},l={contents:[{heading:void 0,content:"La emisión demuestra quién firmó un certificado; la validación permite saber si todavía debe aceptarse. Lamassu publica el estado mediante dos mecanismos complementarios."},{heading:"elige-un-mecanismo",content:"Usa **OCSP** cuando el consumidor esté conectado y necesite consultar el estado más reciente de un certificado concreto."},{heading:"elige-un-mecanismo",content:"Usa una **CRL** cuando la validación deba realizarse localmente, sin conexión o sobre un volumen elevado de certificados. El consumidor descarga periódicamente una lista firmada y la conserva hasta la siguiente actualización."},{heading:"elige-un-mecanismo",content:"Muchos entornos utilizan ambos: OCSP como comprobación primaria y CRL como mecanismo local o de respaldo."},{heading:"elige-un-mecanismo",content:'<Card title="Validación online con OCSP" description="Consulta estados Good, Revoked y Unknown en tiempo real." href="/docs/platform/pki/ocsp" />'},{heading:"elige-un-mecanismo",content:'<Card title="Listas de revocación" description="Genera, publica y distribuye CRLs por autoridad." href="/docs/platform/pki/crl" />'}],headings:[{id:"elige-un-mecanismo",content:"Elige un mecanismo"}]};const m=[{depth:2,url:"#elige-un-mecanismo",title:e.jsx(e.Fragment,{children:"Elige un mecanismo"})}];function s(a){const n={h2:"h2",p:"p",strong:"strong",...a.components},{Card:i,Cards:o}=n;return i||c("Card"),o||c("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"La emisión demuestra quién firmó un certificado; la validación permite saber si todavía debe aceptarse. Lamassu publica el estado mediante dos mecanismos complementarios."}),`
`,e.jsx(n.h2,{id:"elige-un-mecanismo",children:"Elige un mecanismo"}),`
`,e.jsxs(n.p,{children:["Usa ",e.jsx(n.strong,{children:"OCSP"})," cuando el consumidor esté conectado y necesite consultar el estado más reciente de un certificado concreto."]}),`
`,e.jsxs(n.p,{children:["Usa una ",e.jsx(n.strong,{children:"CRL"})," cuando la validación deba realizarse localmente, sin conexión o sobre un volumen elevado de certificados. El consumidor descarga periódicamente una lista firmada y la conserva hasta la siguiente actualización."]}),`
`,e.jsx(n.p,{children:"Muchos entornos utilizan ambos: OCSP como comprobación primaria y CRL como mecanismo local o de respaldo."}),`
`,e.jsxs(o,{children:[e.jsx(i,{title:"Validación online con OCSP",description:"Consulta estados Good, Revoked y Unknown en tiempo real.",href:"/docs/platform/pki/ocsp"}),e.jsx(i,{title:"Listas de revocación",description:"Genera, publica y distribuye CRLs por autoridad.",href:"/docs/platform/pki/crl"})]})]})}function u(a={}){const{wrapper:n}=a.components||{};return n?e.jsx(n,{...a,children:e.jsx(s,{...a})}):s(a)}function c(a,n){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}export{r as _markdown,u as default,d as frontmatter,l as structuredData,m as toc};
