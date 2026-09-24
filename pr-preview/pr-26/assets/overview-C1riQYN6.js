import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let r=`

Lamassu conecta tres elementos: una **raíz de confianza**, una **política de emisión** y una **entidad que necesita demostrar su identidad**. La plataforma coordina esos elementos durante todo el ciclo de vida del certificado.

El modelo en cinco piezas [#el-modelo-en-cinco-piezas]

**Motor criptográfico.** Genera o custodia claves y ejecuta las operaciones privadas sin exponer el material criptográfico al resto de servicios.

**Autoridad de certificación (CA).** Firma certificados y establece la cadena de confianza.

**Device Management Service (DMS).** Define cómo se registran, autentican y renuevan los dispositivos de una flota.

**Dispositivo.** Conserva su clave privada y presenta el certificado para demostrar su identidad.

**Validation Authority (VA).** Publica el estado de los certificados mediante OCSP y CRL.

Del alta a la operación [#del-alta-a-la-operación]

1. Un administrador configura un motor criptográfico y crea o importa una CA.
2. Un DMS relaciona esa CA con una política de enrolamiento.
3. El dispositivo genera una clave y solicita un certificado mediante EST, o un operador le asigna una identidad.
4. Lamassu conserva el inventario, el historial y el estado de la identidad.
5. Los consumidores comprueban la cadena y consultan OCSP o una CRL cuando necesitan conocer su vigencia.

<Cards>
  <Card title="Arquitectura" description="Conoce los componentes y dónde termina la responsabilidad de cada uno." href="/docs/platform/pki/concepts/architecture" />

  <Card title="Ciclo de vida de una identidad" description="Sigue un certificado desde el enrolamiento hasta la renovación o revocación." href="/docs/platform/pki/concepts/certificate-lifecycle" />
</Cards>
`,s={title:"Cómo funciona Lamassu",description:"El modelo mental de confianza, claves, certificados y dispositivos."},l={contents:[{heading:void 0,content:"Lamassu conecta tres elementos: una **raíz de confianza**, una **política de emisión** y una **entidad que necesita demostrar su identidad**. La plataforma coordina esos elementos durante todo el ciclo de vida del certificado."},{heading:"el-modelo-en-cinco-piezas",content:"**Motor criptográfico.** Genera o custodia claves y ejecuta las operaciones privadas sin exponer el material criptográfico al resto de servicios."},{heading:"el-modelo-en-cinco-piezas",content:"**Autoridad de certificación (CA).** Firma certificados y establece la cadena de confianza."},{heading:"el-modelo-en-cinco-piezas",content:"**Device Management Service (DMS).** Define cómo se registran, autentican y renuevan los dispositivos de una flota."},{heading:"el-modelo-en-cinco-piezas",content:"**Dispositivo.** Conserva su clave privada y presenta el certificado para demostrar su identidad."},{heading:"el-modelo-en-cinco-piezas",content:"**Validation Authority (VA).** Publica el estado de los certificados mediante OCSP y CRL."},{heading:"del-alta-a-la-operación",content:"Un administrador configura un motor criptográfico y crea o importa una CA."},{heading:"del-alta-a-la-operación",content:"Un DMS relaciona esa CA con una política de enrolamiento."},{heading:"del-alta-a-la-operación",content:"El dispositivo genera una clave y solicita un certificado mediante EST, o un operador le asigna una identidad."},{heading:"del-alta-a-la-operación",content:"Lamassu conserva el inventario, el historial y el estado de la identidad."},{heading:"del-alta-a-la-operación",content:"Los consumidores comprueban la cadena y consultan OCSP o una CRL cuando necesitan conocer su vigencia."},{heading:"del-alta-a-la-operación",content:'<Card title="Arquitectura" description="Conoce los componentes y dónde termina la responsabilidad de cada uno." href="/docs/platform/pki/concepts/architecture" />'},{heading:"del-alta-a-la-operación",content:'<Card title="Ciclo de vida de una identidad" description="Sigue un certificado desde el enrolamiento hasta la renovación o revocación." href="/docs/platform/pki/concepts/certificate-lifecycle" />'}],headings:[{id:"el-modelo-en-cinco-piezas",content:"El modelo en cinco piezas"},{id:"del-alta-a-la-operación",content:"Del alta a la operación"}]};const u=[{depth:2,url:"#el-modelo-en-cinco-piezas",title:e.jsx(e.Fragment,{children:"El modelo en cinco piezas"})},{depth:2,url:"#del-alta-a-la-operación",title:e.jsx(e.Fragment,{children:"Del alta a la operación"})}];function t(n){const a={h2:"h2",li:"li",ol:"ol",p:"p",strong:"strong",...n.components},{Card:i,Cards:o}=a;return i||c("Card"),o||c("Cards"),e.jsxs(e.Fragment,{children:[e.jsxs(a.p,{children:["Lamassu conecta tres elementos: una ",e.jsx(a.strong,{children:"raíz de confianza"}),", una ",e.jsx(a.strong,{children:"política de emisión"})," y una ",e.jsx(a.strong,{children:"entidad que necesita demostrar su identidad"}),". La plataforma coordina esos elementos durante todo el ciclo de vida del certificado."]}),`
`,e.jsx(a.h2,{id:"el-modelo-en-cinco-piezas",children:"El modelo en cinco piezas"}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Motor criptográfico."})," Genera o custodia claves y ejecuta las operaciones privadas sin exponer el material criptográfico al resto de servicios."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Autoridad de certificación (CA)."})," Firma certificados y establece la cadena de confianza."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Device Management Service (DMS)."})," Define cómo se registran, autentican y renuevan los dispositivos de una flota."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Dispositivo."})," Conserva su clave privada y presenta el certificado para demostrar su identidad."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Validation Authority (VA)."})," Publica el estado de los certificados mediante OCSP y CRL."]}),`
`,e.jsx(a.h2,{id:"del-alta-a-la-operación",children:"Del alta a la operación"}),`
`,e.jsxs(a.ol,{children:[`
`,e.jsx(a.li,{children:"Un administrador configura un motor criptográfico y crea o importa una CA."}),`
`,e.jsx(a.li,{children:"Un DMS relaciona esa CA con una política de enrolamiento."}),`
`,e.jsx(a.li,{children:"El dispositivo genera una clave y solicita un certificado mediante EST, o un operador le asigna una identidad."}),`
`,e.jsx(a.li,{children:"Lamassu conserva el inventario, el historial y el estado de la identidad."}),`
`,e.jsx(a.li,{children:"Los consumidores comprueban la cadena y consultan OCSP o una CRL cuando necesitan conocer su vigencia."}),`
`]}),`
`,e.jsxs(o,{children:[e.jsx(i,{title:"Arquitectura",description:"Conoce los componentes y dónde termina la responsabilidad de cada uno.",href:"/docs/platform/pki/concepts/architecture"}),e.jsx(i,{title:"Ciclo de vida de una identidad",description:"Sigue un certificado desde el enrolamiento hasta la renovación o revocación.",href:"/docs/platform/pki/concepts/certificate-lifecycle"})]})]})}function p(n={}){const{wrapper:a}=n.components||{};return a?e.jsx(a,{...n,children:e.jsx(t,{...n})}):t(n)}function c(n,a){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{r as _markdown,p as default,s as frontmatter,l as structuredData,u as toc};
