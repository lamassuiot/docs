import{j as e}from"./index-prc0XQdj.js";let t=`

Emitir un certificado es solo el comienzo. Durante su vida útil debes comprobar su vigencia, renovarlo antes de que caduque y retirarlo cuando deje de ser fiable. Lamassu conserva el certificado, su CA emisora, su estado y, cuando pertenece a un dispositivo, la identidad a la que está vinculado.

El recorrido completo [#el-recorrido-completo]

<Steps>
  <Step>
    Solicitud [#solicitud]

    El solicitante genera una clave y una CSR. En los flujos recomendados, la clave privada permanece en el dispositivo, navegador o motor criptográfico que la creó.
  </Step>

  <Step>
    Emisión [#emisión]

    La CA firma la CSR. El [perfil de emisión](/docs/platform/pki/certificate-profiles) determina la validez, los usos, el sujeto, las extensiones admitidas y las restricciones criptográficas.
  </Step>

  <Step>
    Uso y supervisión [#uso-y-supervisión]

    El certificado queda en estado \`ACTIVE\`. Lamassu monitoriza su fecha \`Not After\`; el trabajo de monitorización criptográfica marca como \`EXPIRED\` los certificados que han vencido.
  </Step>

  <Step>
    Renovación o re-enrolamiento [#renovación-o-re-enrolamiento]

    Se emite un certificado nuevo antes de que caduque el anterior. En un DMS puedes abrir ventanas preventiva y crítica para que el dispositivo se re-enrole mediante EST.
  </Step>

  <Step>
    Revocación o retirada [#revocación-o-retirada]

    Si la identidad deja de ser fiable, Lamassu registra la razón y la hora de revocación. OCSP y las CRLs permiten que los consumidores conozcan ese estado.
  </Step>
</Steps>

Estados del certificado [#estados-del-certificado]

Lamassu persiste cuatro estados X.509:

* **\`ACTIVE\`**: el certificado está habilitado y dentro de su periodo de validez.
* **\`EXPIRED\`**: ha superado su fecha de expiración. El monitor lo detecta de forma periódica; no es un estado que deba asignarse manualmente.
* **\`REVOKED\`**: fue invalidado antes de expirar, con una razón y una marca temporal.
* **\`INACTIVE\`**: está deshabilitado sin representar una revocación definitiva.

La vista del dispositivo puede añadir estados operativos como ausencia de identidad, renovación pendiente, expiración próxima o baja. Son una interpretación del estado del dispositivo y de sus certificados, no nuevos estados X.509.

Renovación y revocación no son equivalentes [#renovación-y-revocación-no-son-equivalentes]

La **renovación** crea un certificado sucesor para una identidad que continúa siendo válida. La **revocación** comunica que el certificado actual ya no debe aceptarse. Renueva para mantener continuidad; revoca ante compromiso, retirada o un cambio que invalide la identidad.

Solo una revocación con razón \`CertificateHold\` puede revertirse. Una revocación con cualquier otra razón es definitiva en Lamassu.

<Callout type="info" title="La reemisión de una CA reutiliza su clave">
  La operación **Reissue CA** genera otro certificado para la misma clave y enlaza ambos números de serie mediante metadatos. No equivale a una rotación de clave. Para cambiar la clave, crea una CA sucesora y realiza una migración con periodo de solapamiento.
</Callout>

Efecto de revocar una CA [#efecto-de-revocar-una-ca]

Revocar una CA es una operación en cascada. Lamassu revoca sus CAs hijas y los certificados que ha emitido con la razón \`CessationOfOperation\`. La propagación continúa por la jerarquía.

Antes de confirmar:

1. Identifica DMS, dispositivos y servicios que confían en esa cadena.
2. Distribuye la nueva cadena de confianza.
3. Reemite las identidades necesarias.
4. Comprueba OCSP y CRL desde un consumidor real.
5. Revoca la CA antigua cuando ya no exista tráfico legítimo.

<Callout type="warn" title="Decommission es irreversible">
  Dar de baja un dispositivo revoca sus certificados y le impide obtener nuevas identidades. Utiliza esta acción únicamente cuando el dispositivo se retire de forma permanente.
</Callout>

Qué debes observar [#qué-debes-observar]

* Certificados que entran en la ventana preventiva o crítica de renovación.
* Errores repetidos de enrolamiento o re-enrolamiento.
* Cambios de estado y razones de revocación.
* Publicación y vigencia de OCSP y CRLs.
* Dependencias que todavía presentan un certificado sustituido.

El historial del dispositivo relaciona sus identidades anteriores y actuales. Para cambios administrativos y errores de mutación, consulta [Registros de auditoría](/docs/platform/pki/audit-logs).
`,d={title:"Ciclo de vida de un certificado",description:"Emisión, uso, renovación, revocación y retirada de certificados en Lamassu."},l={contents:[{heading:void 0,content:"Emitir un certificado es solo el comienzo. Durante su vida útil debes comprobar su vigencia, renovarlo antes de que caduque y retirarlo cuando deje de ser fiable. Lamassu conserva el certificado, su CA emisora, su estado y, cuando pertenece a un dispositivo, la identidad a la que está vinculado."},{heading:"solicitud",content:"El solicitante genera una clave y una CSR. En los flujos recomendados, la clave privada permanece en el dispositivo, navegador o motor criptográfico que la creó."},{heading:"emisión",content:"La CA firma la CSR. El perfil de emisión determina la validez, los usos, el sujeto, las extensiones admitidas y las restricciones criptográficas."},{heading:"uso-y-supervisión",content:"El certificado queda en estado `ACTIVE`. Lamassu monitoriza su fecha `Not After`; el trabajo de monitorización criptográfica marca como `EXPIRED` los certificados que han vencido."},{heading:"renovación-o-re-enrolamiento",content:"Se emite un certificado nuevo antes de que caduque el anterior. En un DMS puedes abrir ventanas preventiva y crítica para que el dispositivo se re-enrole mediante EST."},{heading:"revocación-o-retirada",content:"Si la identidad deja de ser fiable, Lamassu registra la razón y la hora de revocación. OCSP y las CRLs permiten que los consumidores conozcan ese estado."},{heading:"estados-del-certificado",content:"Lamassu persiste cuatro estados X.509:"},{heading:"estados-del-certificado",content:"**`ACTIVE`**: el certificado está habilitado y dentro de su periodo de validez."},{heading:"estados-del-certificado",content:"**`EXPIRED`**: ha superado su fecha de expiración. El monitor lo detecta de forma periódica; no es un estado que deba asignarse manualmente."},{heading:"estados-del-certificado",content:"**`REVOKED`**: fue invalidado antes de expirar, con una razón y una marca temporal."},{heading:"estados-del-certificado",content:"**`INACTIVE`**: está deshabilitado sin representar una revocación definitiva."},{heading:"estados-del-certificado",content:"La vista del dispositivo puede añadir estados operativos como ausencia de identidad, renovación pendiente, expiración próxima o baja. Son una interpretación del estado del dispositivo y de sus certificados, no nuevos estados X.509."},{heading:"renovación-y-revocación-no-son-equivalentes",content:"La **renovación** crea un certificado sucesor para una identidad que continúa siendo válida. La **revocación** comunica que el certificado actual ya no debe aceptarse. Renueva para mantener continuidad; revoca ante compromiso, retirada o un cambio que invalide la identidad."},{heading:"renovación-y-revocación-no-son-equivalentes",content:"Solo una revocación con razón `CertificateHold` puede revertirse. Una revocación con cualquier otra razón es definitiva en Lamassu."},{heading:"renovación-y-revocación-no-son-equivalentes",content:"La operación **Reissue CA** genera otro certificado para la misma clave y enlaza ambos números de serie mediante metadatos. No equivale a una rotación de clave. Para cambiar la clave, crea una CA sucesora y realiza una migración con periodo de solapamiento."},{heading:"efecto-de-revocar-una-ca",content:"Revocar una CA es una operación en cascada. Lamassu revoca sus CAs hijas y los certificados que ha emitido con la razón `CessationOfOperation`. La propagación continúa por la jerarquía."},{heading:"efecto-de-revocar-una-ca",content:"Antes de confirmar:"},{heading:"efecto-de-revocar-una-ca",content:"Identifica DMS, dispositivos y servicios que confían en esa cadena."},{heading:"efecto-de-revocar-una-ca",content:"Distribuye la nueva cadena de confianza."},{heading:"efecto-de-revocar-una-ca",content:"Reemite las identidades necesarias."},{heading:"efecto-de-revocar-una-ca",content:"Comprueba OCSP y CRL desde un consumidor real."},{heading:"efecto-de-revocar-una-ca",content:"Revoca la CA antigua cuando ya no exista tráfico legítimo."},{heading:"efecto-de-revocar-una-ca",content:"Dar de baja un dispositivo revoca sus certificados y le impide obtener nuevas identidades. Utiliza esta acción únicamente cuando el dispositivo se retire de forma permanente."},{heading:"qué-debes-observar",content:"Certificados que entran en la ventana preventiva o crítica de renovación."},{heading:"qué-debes-observar",content:"Errores repetidos de enrolamiento o re-enrolamiento."},{heading:"qué-debes-observar",content:"Cambios de estado y razones de revocación."},{heading:"qué-debes-observar",content:"Publicación y vigencia de OCSP y CRLs."},{heading:"qué-debes-observar",content:"Dependencias que todavía presentan un certificado sustituido."},{heading:"qué-debes-observar",content:"El historial del dispositivo relaciona sus identidades anteriores y actuales. Para cambios administrativos y errores de mutación, consulta Registros de auditoría."}],headings:[{id:"el-recorrido-completo",content:"El recorrido completo"},{id:"solicitud",content:"Solicitud"},{id:"emisión",content:"Emisión"},{id:"uso-y-supervisión",content:"Uso y supervisión"},{id:"renovación-o-re-enrolamiento",content:"Renovación o re-enrolamiento"},{id:"revocación-o-retirada",content:"Revocación o retirada"},{id:"estados-del-certificado",content:"Estados del certificado"},{id:"renovación-y-revocación-no-son-equivalentes",content:"Renovación y revocación no son equivalentes"},{id:"efecto-de-revocar-una-ca",content:"Efecto de revocar una CA"},{id:"qué-debes-observar",content:"Qué debes observar"}]};const u=[{depth:2,url:"#el-recorrido-completo",title:e.jsx(e.Fragment,{children:"El recorrido completo"})},{depth:3,url:"#solicitud",title:e.jsx(e.Fragment,{children:"Solicitud"})},{depth:3,url:"#emisión",title:e.jsx(e.Fragment,{children:"Emisión"})},{depth:3,url:"#uso-y-supervisión",title:e.jsx(e.Fragment,{children:"Uso y supervisión"})},{depth:3,url:"#renovación-o-re-enrolamiento",title:e.jsx(e.Fragment,{children:"Renovación o re-enrolamiento"})},{depth:3,url:"#revocación-o-retirada",title:e.jsx(e.Fragment,{children:"Revocación o retirada"})},{depth:2,url:"#estados-del-certificado",title:e.jsx(e.Fragment,{children:"Estados del certificado"})},{depth:2,url:"#renovación-y-revocación-no-son-equivalentes",title:e.jsx(e.Fragment,{children:"Renovación y revocación no son equivalentes"})},{depth:2,url:"#efecto-de-revocar-una-ca",title:e.jsx(e.Fragment,{children:"Efecto de revocar una CA"})},{depth:2,url:"#qué-debes-observar",title:e.jsx(e.Fragment,{children:"Qué debes observar"})}];function c(i){const a={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...i.components},{Callout:o,Step:n,Steps:s}=a;return o||r("Callout"),n||r("Step"),s||r("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(a.p,{children:"Emitir un certificado es solo el comienzo. Durante su vida útil debes comprobar su vigencia, renovarlo antes de que caduque y retirarlo cuando deje de ser fiable. Lamassu conserva el certificado, su CA emisora, su estado y, cuando pertenece a un dispositivo, la identidad a la que está vinculado."}),`
`,e.jsx(a.h2,{id:"el-recorrido-completo",children:"El recorrido completo"}),`
`,e.jsxs(s,{children:[e.jsxs(n,{children:[e.jsx(a.h3,{id:"solicitud",children:"Solicitud"}),e.jsx(a.p,{children:"El solicitante genera una clave y una CSR. En los flujos recomendados, la clave privada permanece en el dispositivo, navegador o motor criptográfico que la creó."})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"emisión",children:"Emisión"}),e.jsxs(a.p,{children:["La CA firma la CSR. El ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-profiles",children:"perfil de emisión"})," determina la validez, los usos, el sujeto, las extensiones admitidas y las restricciones criptográficas."]})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"uso-y-supervisión",children:"Uso y supervisión"}),e.jsxs(a.p,{children:["El certificado queda en estado ",e.jsx(a.code,{children:"ACTIVE"}),". Lamassu monitoriza su fecha ",e.jsx(a.code,{children:"Not After"}),"; el trabajo de monitorización criptográfica marca como ",e.jsx(a.code,{children:"EXPIRED"})," los certificados que han vencido."]})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"renovación-o-re-enrolamiento",children:"Renovación o re-enrolamiento"}),e.jsx(a.p,{children:"Se emite un certificado nuevo antes de que caduque el anterior. En un DMS puedes abrir ventanas preventiva y crítica para que el dispositivo se re-enrole mediante EST."})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"revocación-o-retirada",children:"Revocación o retirada"}),e.jsx(a.p,{children:"Si la identidad deja de ser fiable, Lamassu registra la razón y la hora de revocación. OCSP y las CRLs permiten que los consumidores conozcan ese estado."})]})]}),`
`,e.jsx(a.h2,{id:"estados-del-certificado",children:"Estados del certificado"}),`
`,e.jsx(a.p,{children:"Lamassu persiste cuatro estados X.509:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:e.jsx(a.code,{children:"ACTIVE"})}),": el certificado está habilitado y dentro de su periodo de validez."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:e.jsx(a.code,{children:"EXPIRED"})}),": ha superado su fecha de expiración. El monitor lo detecta de forma periódica; no es un estado que deba asignarse manualmente."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:e.jsx(a.code,{children:"REVOKED"})}),": fue invalidado antes de expirar, con una razón y una marca temporal."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:e.jsx(a.code,{children:"INACTIVE"})}),": está deshabilitado sin representar una revocación definitiva."]}),`
`]}),`
`,e.jsx(a.p,{children:"La vista del dispositivo puede añadir estados operativos como ausencia de identidad, renovación pendiente, expiración próxima o baja. Son una interpretación del estado del dispositivo y de sus certificados, no nuevos estados X.509."}),`
`,e.jsx(a.h2,{id:"renovación-y-revocación-no-son-equivalentes",children:"Renovación y revocación no son equivalentes"}),`
`,e.jsxs(a.p,{children:["La ",e.jsx(a.strong,{children:"renovación"})," crea un certificado sucesor para una identidad que continúa siendo válida. La ",e.jsx(a.strong,{children:"revocación"})," comunica que el certificado actual ya no debe aceptarse. Renueva para mantener continuidad; revoca ante compromiso, retirada o un cambio que invalide la identidad."]}),`
`,e.jsxs(a.p,{children:["Solo una revocación con razón ",e.jsx(a.code,{children:"CertificateHold"})," puede revertirse. Una revocación con cualquier otra razón es definitiva en Lamassu."]}),`
`,e.jsx(o,{type:"info",title:"La reemisión de una CA reutiliza su clave",children:e.jsxs(a.p,{children:["La operación ",e.jsx(a.strong,{children:"Reissue CA"})," genera otro certificado para la misma clave y enlaza ambos números de serie mediante metadatos. No equivale a una rotación de clave. Para cambiar la clave, crea una CA sucesora y realiza una migración con periodo de solapamiento."]})}),`
`,e.jsx(a.h2,{id:"efecto-de-revocar-una-ca",children:"Efecto de revocar una CA"}),`
`,e.jsxs(a.p,{children:["Revocar una CA es una operación en cascada. Lamassu revoca sus CAs hijas y los certificados que ha emitido con la razón ",e.jsx(a.code,{children:"CessationOfOperation"}),". La propagación continúa por la jerarquía."]}),`
`,e.jsx(a.p,{children:"Antes de confirmar:"}),`
`,e.jsxs(a.ol,{children:[`
`,e.jsx(a.li,{children:"Identifica DMS, dispositivos y servicios que confían en esa cadena."}),`
`,e.jsx(a.li,{children:"Distribuye la nueva cadena de confianza."}),`
`,e.jsx(a.li,{children:"Reemite las identidades necesarias."}),`
`,e.jsx(a.li,{children:"Comprueba OCSP y CRL desde un consumidor real."}),`
`,e.jsx(a.li,{children:"Revoca la CA antigua cuando ya no exista tráfico legítimo."}),`
`]}),`
`,e.jsx(o,{type:"warn",title:"Decommission es irreversible",children:e.jsx(a.p,{children:"Dar de baja un dispositivo revoca sus certificados y le impide obtener nuevas identidades. Utiliza esta acción únicamente cuando el dispositivo se retire de forma permanente."})}),`
`,e.jsx(a.h2,{id:"qué-debes-observar",children:"Qué debes observar"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Certificados que entran en la ventana preventiva o crítica de renovación."}),`
`,e.jsx(a.li,{children:"Errores repetidos de enrolamiento o re-enrolamiento."}),`
`,e.jsx(a.li,{children:"Cambios de estado y razones de revocación."}),`
`,e.jsx(a.li,{children:"Publicación y vigencia de OCSP y CRLs."}),`
`,e.jsx(a.li,{children:"Dependencias que todavía presentan un certificado sustituido."}),`
`]}),`
`,e.jsxs(a.p,{children:["El historial del dispositivo relaciona sus identidades anteriores y actuales. Para cambios administrativos y errores de mutación, consulta ",e.jsx(a.a,{href:"/docs/platform/pki/audit-logs",children:"Registros de auditoría"}),"."]})]})}function v(i={}){const{wrapper:a}=i.components||{};return a?e.jsx(a,{...i,children:e.jsx(c,{...i})}):c(i)}function r(i,a){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:t,default:v,frontmatter:d,structuredData:l,toc:u},Symbol.toStringTag,{value:"Module"}));export{m as _};
