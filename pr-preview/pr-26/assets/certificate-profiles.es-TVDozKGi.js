import{j as e}from"./index-prc0XQdj.js";let c=`

Un perfil de emisión convierte una política de certificados en configuración reutilizable. En lugar de decidir validez, sujeto, extensiones y algoritmos en cada solicitud, defines una vez qué está permitido y asocias el perfil a una CA, un DMS o una emisión concreta.

Qué controla un perfil [#qué-controla-un-perfil]

Validez [#validez]

Puedes expresar la vigencia como una duración desde el momento de emisión o como una fecha final fija. Una duración funciona bien para identidades recurrentes; una fecha común sirve para hacer que todo un lote termine antes de una migración o retirada.

La fecha final nunca debe superar la de la CA emisora.

Certificado de CA o certificado final [#certificado-de-ca-o-certificado-final]

\`Sign as CA\` establece \`IsCA\` y las restricciones básicas necesarias para una autoridad. Actívalo solo en perfiles destinados a crear o reemitir CAs subordinadas.

Key Usage y Extended Key Usage [#key-usage-y-extended-key-usage]

El perfil puede imponer usos como \`DigitalSignature\`, \`KeyEncipherment\`, \`CertSign\`, \`CRLSign\`, \`ClientAuth\`, \`ServerAuth\` u \`OCSPSigning\`.

Si activas **Honor Key Usage** o **Honor Extended Key Usages**, Lamassu conserva los valores solicitados por la CSR. Si los desactivas, los sustituye por los definidos en el perfil.

<Callout type="warn" title="Honor significa delegar parte de la política">
  No habilites las opciones \`Honor…\` para solicitudes no confiables salvo que otro componente valide esos campos. De lo contrario, el solicitante puede elegir capacidades más amplias de las previstas.
</Callout>

Sujeto [#sujeto]

Con **Honor Subject**, el certificado conserva el sujeto de la CSR. Sin esa opción, Lamassu aplica \`CN\`, \`O\`, \`OU\`, \`C\`, \`ST\` y \`L\` del perfil. Si el perfil no define \`Common Name\`, se conserva el CN solicitado.

Extensiones de la CSR [#extensiones-de-la-csr]

Con **Honor Extensions**, Lamassu filtra las extensiones adicionales solicitadas y conserva únicamente SAN. Sin esa opción, descarta las extensiones adicionales de la CSR.

Este comportamiento permite aceptar DNS, IP, correo o URI como identidades alternativas sin aceptar extensiones arbitrarias.

Restricciones criptográficas [#restricciones-criptográficas]

La aplicación criptográfica puede:

* permitir o bloquear claves RSA;
* limitar los tamaños RSA admitidos;
* permitir o bloquear claves ECDSA;
* limitar los tamaños o curvas ECDSA admitidos.

Cuando está habilitada, Lamassu comprueba la clave pública antes de crear una CA o firmar una CSR. Una clave cuyo tipo o tamaño no figure en el perfil se rechaza.

Precedencia del perfil [#precedencia-del-perfil]

En operaciones que admiten varias fuentes, Lamassu resuelve el perfil en este orden:

1. Perfil enviado dentro de la operación.
2. Identificador de perfil enviado en la operación.
3. Perfil predeterminado asociado a la CA.

Un DMS también puede referenciar su propio perfil de emisión. De este modo, varias flotas pueden usar la misma CA con políticas distintas.

Crea un perfil [#crea-un-perfil]

<Steps>
  <Step>
    Define un único propósito [#define-un-único-propósito]

    Separa, por ejemplo, dispositivos mTLS, servidores y CAs intermedias. Un perfil pequeño y específico es más fácil de revisar que uno que permita todos los usos.
  </Step>

  <Step>
    Elige la validez [#elige-la-validez]

    Alinea la duración con la capacidad real de renovación de la flota. Deja margen respecto a la expiración de la CA.
  </Step>

  <Step>
    Fija usos y sujeto [#fija-usos-y-sujeto]

    Para un dispositivo que se autentica como cliente, el punto de partida habitual es \`DigitalSignature\` y \`ClientAuth\`. Añade \`ServerAuth\` o \`KeyEncipherment\` solo si el protocolo lo necesita.
  </Step>

  <Step>
    Restringe las claves [#restringe-las-claves]

    Habilita la aplicación criptográfica y enumera únicamente algoritmos y tamaños compatibles con tu política y tus dispositivos.
  </Step>

  <Step>
    Asócialo y prueba [#asócialo-y-prueba]

    Asocia el perfil a una CA o DMS. Emite un certificado de prueba y comprueba sujeto, SAN, KU, EKU, restricciones básicas y fechas con una herramienta X.509 independiente.
  </Step>
</Steps>

Ejemplos de diseño [#ejemplos-de-diseño]

**Dispositivo mTLS**\\
Certificado final, validez corta, \`DigitalSignature\`, \`ClientAuth\`, sujeto controlado por el DMS y SAN permitido cuando identifica al dispositivo.

**Servidor TLS**\\
Certificado final, \`DigitalSignature\`, \`ServerAuth\` y SAN obligatorio con los nombres que utilizarán los clientes.

**CA intermedia**\\
\`Sign as CA\`, \`CertSign\` y \`CRLSign\`, validez superior a sus certificados finales y restricciones criptográficas más exigentes.

Son patrones de partida, no una política universal. Verifica siempre los requisitos del protocolo, del consumidor y del marco regulatorio aplicable.

Cambios y eliminación [#cambios-y-eliminación]

Actualizar un perfil afecta a emisiones futuras; no modifica certificados ya firmados. Prueba los cambios antes de aplicarlos a una CA en producción y conserva la justificación operativa.

Antes de eliminar un perfil, comprueba que ninguna CA o DMS dependa de él. Si deseas sustituirlo, crea la versión nueva, actualiza las referencias y realiza una emisión de prueba antes de retirar el anterior.
`,l={title:"Perfiles de certificado",description:"Define políticas reutilizables para emitir certificados coherentes y limitar las claves aceptadas.",sidebar:{group:"CA",label:"Perfiles de certificado"}},d={contents:[{heading:void 0,content:"Un perfil de emisión convierte una política de certificados en configuración reutilizable. En lugar de decidir validez, sujeto, extensiones y algoritmos en cada solicitud, defines una vez qué está permitido y asocias el perfil a una CA, un DMS o una emisión concreta."},{heading:"validez",content:"Puedes expresar la vigencia como una duración desde el momento de emisión o como una fecha final fija. Una duración funciona bien para identidades recurrentes; una fecha común sirve para hacer que todo un lote termine antes de una migración o retirada."},{heading:"validez",content:"La fecha final nunca debe superar la de la CA emisora."},{heading:"certificado-de-ca-o-certificado-final",content:"`Sign as CA` establece `IsCA` y las restricciones básicas necesarias para una autoridad. Actívalo solo en perfiles destinados a crear o reemitir CAs subordinadas."},{heading:"key-usage-y-extended-key-usage",content:"El perfil puede imponer usos como `DigitalSignature`, `KeyEncipherment`, `CertSign`, `CRLSign`, `ClientAuth`, `ServerAuth` u `OCSPSigning`."},{heading:"key-usage-y-extended-key-usage",content:"Si activas **Honor Key Usage** o **Honor Extended Key Usages**, Lamassu conserva los valores solicitados por la CSR. Si los desactivas, los sustituye por los definidos en el perfil."},{heading:"key-usage-y-extended-key-usage",content:"No habilites las opciones `Honor…` para solicitudes no confiables salvo que otro componente valide esos campos. De lo contrario, el solicitante puede elegir capacidades más amplias de las previstas."},{heading:"sujeto",content:"Con **Honor Subject**, el certificado conserva el sujeto de la CSR. Sin esa opción, Lamassu aplica `CN`, `O`, `OU`, `C`, `ST` y `L` del perfil. Si el perfil no define `Common Name`, se conserva el CN solicitado."},{heading:"extensiones-de-la-csr",content:"Con **Honor Extensions**, Lamassu filtra las extensiones adicionales solicitadas y conserva únicamente SAN. Sin esa opción, descarta las extensiones adicionales de la CSR."},{heading:"extensiones-de-la-csr",content:"Este comportamiento permite aceptar DNS, IP, correo o URI como identidades alternativas sin aceptar extensiones arbitrarias."},{heading:"restricciones-criptográficas",content:"La aplicación criptográfica puede:"},{heading:"restricciones-criptográficas",content:"permitir o bloquear claves RSA;"},{heading:"restricciones-criptográficas",content:"limitar los tamaños RSA admitidos;"},{heading:"restricciones-criptográficas",content:"permitir o bloquear claves ECDSA;"},{heading:"restricciones-criptográficas",content:"limitar los tamaños o curvas ECDSA admitidos."},{heading:"restricciones-criptográficas",content:"Cuando está habilitada, Lamassu comprueba la clave pública antes de crear una CA o firmar una CSR. Una clave cuyo tipo o tamaño no figure en el perfil se rechaza."},{heading:"precedencia-del-perfil",content:"En operaciones que admiten varias fuentes, Lamassu resuelve el perfil en este orden:"},{heading:"precedencia-del-perfil",content:"Perfil enviado dentro de la operación."},{heading:"precedencia-del-perfil",content:"Identificador de perfil enviado en la operación."},{heading:"precedencia-del-perfil",content:"Perfil predeterminado asociado a la CA."},{heading:"precedencia-del-perfil",content:"Un DMS también puede referenciar su propio perfil de emisión. De este modo, varias flotas pueden usar la misma CA con políticas distintas."},{heading:"define-un-único-propósito",content:"Separa, por ejemplo, dispositivos mTLS, servidores y CAs intermedias. Un perfil pequeño y específico es más fácil de revisar que uno que permita todos los usos."},{heading:"elige-la-validez",content:"Alinea la duración con la capacidad real de renovación de la flota. Deja margen respecto a la expiración de la CA."},{heading:"fija-usos-y-sujeto",content:"Para un dispositivo que se autentica como cliente, el punto de partida habitual es `DigitalSignature` y `ClientAuth`. Añade `ServerAuth` o `KeyEncipherment` solo si el protocolo lo necesita."},{heading:"restringe-las-claves",content:"Habilita la aplicación criptográfica y enumera únicamente algoritmos y tamaños compatibles con tu política y tus dispositivos."},{heading:"asócialo-y-prueba",content:"Asocia el perfil a una CA o DMS. Emite un certificado de prueba y comprueba sujeto, SAN, KU, EKU, restricciones básicas y fechas con una herramienta X.509 independiente."},{heading:"ejemplos-de-diseño",content:"**Dispositivo mTLS**\\\nCertificado final, validez corta, `DigitalSignature`, `ClientAuth`, sujeto controlado por el DMS y SAN permitido cuando identifica al dispositivo."},{heading:"ejemplos-de-diseño",content:"**Servidor TLS**\\\nCertificado final, `DigitalSignature`, `ServerAuth` y SAN obligatorio con los nombres que utilizarán los clientes."},{heading:"ejemplos-de-diseño",content:"**CA intermedia**\\\n`Sign as CA`, `CertSign` y `CRLSign`, validez superior a sus certificados finales y restricciones criptográficas más exigentes."},{heading:"ejemplos-de-diseño",content:"Son patrones de partida, no una política universal. Verifica siempre los requisitos del protocolo, del consumidor y del marco regulatorio aplicable."},{heading:"cambios-y-eliminación",content:"Actualizar un perfil afecta a emisiones futuras; no modifica certificados ya firmados. Prueba los cambios antes de aplicarlos a una CA en producción y conserva la justificación operativa."},{heading:"cambios-y-eliminación",content:"Antes de eliminar un perfil, comprueba que ninguna CA o DMS dependa de él. Si deseas sustituirlo, crea la versión nueva, actualiza las referencias y realiza una emisión de prueba antes de retirar el anterior."}],headings:[{id:"qué-controla-un-perfil",content:"Qué controla un perfil"},{id:"validez",content:"Validez"},{id:"certificado-de-ca-o-certificado-final",content:"Certificado de CA o certificado final"},{id:"key-usage-y-extended-key-usage",content:"Key Usage y Extended Key Usage"},{id:"sujeto",content:"Sujeto"},{id:"extensiones-de-la-csr",content:"Extensiones de la CSR"},{id:"restricciones-criptográficas",content:"Restricciones criptográficas"},{id:"precedencia-del-perfil",content:"Precedencia del perfil"},{id:"crea-un-perfil",content:"Crea un perfil"},{id:"define-un-único-propósito",content:"Define un único propósito"},{id:"elige-la-validez",content:"Elige la validez"},{id:"fija-usos-y-sujeto",content:"Fija usos y sujeto"},{id:"restringe-las-claves",content:"Restringe las claves"},{id:"asócialo-y-prueba",content:"Asócialo y prueba"},{id:"ejemplos-de-diseño",content:"Ejemplos de diseño"},{id:"cambios-y-eliminación",content:"Cambios y eliminación"}]};const u=[{depth:2,url:"#qué-controla-un-perfil",title:e.jsx(e.Fragment,{children:"Qué controla un perfil"})},{depth:3,url:"#validez",title:e.jsx(e.Fragment,{children:"Validez"})},{depth:3,url:"#certificado-de-ca-o-certificado-final",title:e.jsx(e.Fragment,{children:"Certificado de CA o certificado final"})},{depth:3,url:"#key-usage-y-extended-key-usage",title:e.jsx(e.Fragment,{children:"Key Usage y Extended Key Usage"})},{depth:3,url:"#sujeto",title:e.jsx(e.Fragment,{children:"Sujeto"})},{depth:3,url:"#extensiones-de-la-csr",title:e.jsx(e.Fragment,{children:"Extensiones de la CSR"})},{depth:3,url:"#restricciones-criptográficas",title:e.jsx(e.Fragment,{children:"Restricciones criptográficas"})},{depth:2,url:"#precedencia-del-perfil",title:e.jsx(e.Fragment,{children:"Precedencia del perfil"})},{depth:2,url:"#crea-un-perfil",title:e.jsx(e.Fragment,{children:"Crea un perfil"})},{depth:3,url:"#define-un-único-propósito",title:e.jsx(e.Fragment,{children:"Define un único propósito"})},{depth:3,url:"#elige-la-validez",title:e.jsx(e.Fragment,{children:"Elige la validez"})},{depth:3,url:"#fija-usos-y-sujeto",title:e.jsx(e.Fragment,{children:"Fija usos y sujeto"})},{depth:3,url:"#restringe-las-claves",title:e.jsx(e.Fragment,{children:"Restringe las claves"})},{depth:3,url:"#asócialo-y-prueba",title:e.jsx(e.Fragment,{children:"Asócialo y prueba"})},{depth:2,url:"#ejemplos-de-diseño",title:e.jsx(e.Fragment,{children:"Ejemplos de diseño"})},{depth:2,url:"#cambios-y-eliminación",title:e.jsx(e.Fragment,{children:"Cambios y eliminación"})}];function t(a){const i={br:"br",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...a.components},{Callout:s,Step:n,Steps:r}=i;return s||o("Callout"),n||o("Step"),r||o("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"Un perfil de emisión convierte una política de certificados en configuración reutilizable. En lugar de decidir validez, sujeto, extensiones y algoritmos en cada solicitud, defines una vez qué está permitido y asocias el perfil a una CA, un DMS o una emisión concreta."}),`
`,e.jsx(i.h2,{id:"qué-controla-un-perfil",children:"Qué controla un perfil"}),`
`,e.jsx(i.h3,{id:"validez",children:"Validez"}),`
`,e.jsx(i.p,{children:"Puedes expresar la vigencia como una duración desde el momento de emisión o como una fecha final fija. Una duración funciona bien para identidades recurrentes; una fecha común sirve para hacer que todo un lote termine antes de una migración o retirada."}),`
`,e.jsx(i.p,{children:"La fecha final nunca debe superar la de la CA emisora."}),`
`,e.jsx(i.h3,{id:"certificado-de-ca-o-certificado-final",children:"Certificado de CA o certificado final"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"Sign as CA"})," establece ",e.jsx(i.code,{children:"IsCA"})," y las restricciones básicas necesarias para una autoridad. Actívalo solo en perfiles destinados a crear o reemitir CAs subordinadas."]}),`
`,e.jsx(i.h3,{id:"key-usage-y-extended-key-usage",children:"Key Usage y Extended Key Usage"}),`
`,e.jsxs(i.p,{children:["El perfil puede imponer usos como ",e.jsx(i.code,{children:"DigitalSignature"}),", ",e.jsx(i.code,{children:"KeyEncipherment"}),", ",e.jsx(i.code,{children:"CertSign"}),", ",e.jsx(i.code,{children:"CRLSign"}),", ",e.jsx(i.code,{children:"ClientAuth"}),", ",e.jsx(i.code,{children:"ServerAuth"})," u ",e.jsx(i.code,{children:"OCSPSigning"}),"."]}),`
`,e.jsxs(i.p,{children:["Si activas ",e.jsx(i.strong,{children:"Honor Key Usage"})," o ",e.jsx(i.strong,{children:"Honor Extended Key Usages"}),", Lamassu conserva los valores solicitados por la CSR. Si los desactivas, los sustituye por los definidos en el perfil."]}),`
`,e.jsx(s,{type:"warn",title:"Honor significa delegar parte de la política",children:e.jsxs(i.p,{children:["No habilites las opciones ",e.jsx(i.code,{children:"Honor…"})," para solicitudes no confiables salvo que otro componente valide esos campos. De lo contrario, el solicitante puede elegir capacidades más amplias de las previstas."]})}),`
`,e.jsx(i.h3,{id:"sujeto",children:"Sujeto"}),`
`,e.jsxs(i.p,{children:["Con ",e.jsx(i.strong,{children:"Honor Subject"}),", el certificado conserva el sujeto de la CSR. Sin esa opción, Lamassu aplica ",e.jsx(i.code,{children:"CN"}),", ",e.jsx(i.code,{children:"O"}),", ",e.jsx(i.code,{children:"OU"}),", ",e.jsx(i.code,{children:"C"}),", ",e.jsx(i.code,{children:"ST"})," y ",e.jsx(i.code,{children:"L"})," del perfil. Si el perfil no define ",e.jsx(i.code,{children:"Common Name"}),", se conserva el CN solicitado."]}),`
`,e.jsx(i.h3,{id:"extensiones-de-la-csr",children:"Extensiones de la CSR"}),`
`,e.jsxs(i.p,{children:["Con ",e.jsx(i.strong,{children:"Honor Extensions"}),", Lamassu filtra las extensiones adicionales solicitadas y conserva únicamente SAN. Sin esa opción, descarta las extensiones adicionales de la CSR."]}),`
`,e.jsx(i.p,{children:"Este comportamiento permite aceptar DNS, IP, correo o URI como identidades alternativas sin aceptar extensiones arbitrarias."}),`
`,e.jsx(i.h3,{id:"restricciones-criptográficas",children:"Restricciones criptográficas"}),`
`,e.jsx(i.p,{children:"La aplicación criptográfica puede:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"permitir o bloquear claves RSA;"}),`
`,e.jsx(i.li,{children:"limitar los tamaños RSA admitidos;"}),`
`,e.jsx(i.li,{children:"permitir o bloquear claves ECDSA;"}),`
`,e.jsx(i.li,{children:"limitar los tamaños o curvas ECDSA admitidos."}),`
`]}),`
`,e.jsx(i.p,{children:"Cuando está habilitada, Lamassu comprueba la clave pública antes de crear una CA o firmar una CSR. Una clave cuyo tipo o tamaño no figure en el perfil se rechaza."}),`
`,e.jsx(i.h2,{id:"precedencia-del-perfil",children:"Precedencia del perfil"}),`
`,e.jsx(i.p,{children:"En operaciones que admiten varias fuentes, Lamassu resuelve el perfil en este orden:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Perfil enviado dentro de la operación."}),`
`,e.jsx(i.li,{children:"Identificador de perfil enviado en la operación."}),`
`,e.jsx(i.li,{children:"Perfil predeterminado asociado a la CA."}),`
`]}),`
`,e.jsx(i.p,{children:"Un DMS también puede referenciar su propio perfil de emisión. De este modo, varias flotas pueden usar la misma CA con políticas distintas."}),`
`,e.jsx(i.h2,{id:"crea-un-perfil",children:"Crea un perfil"}),`
`,e.jsxs(r,{children:[e.jsxs(n,{children:[e.jsx(i.h3,{id:"define-un-único-propósito",children:"Define un único propósito"}),e.jsx(i.p,{children:"Separa, por ejemplo, dispositivos mTLS, servidores y CAs intermedias. Un perfil pequeño y específico es más fácil de revisar que uno que permita todos los usos."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"elige-la-validez",children:"Elige la validez"}),e.jsx(i.p,{children:"Alinea la duración con la capacidad real de renovación de la flota. Deja margen respecto a la expiración de la CA."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"fija-usos-y-sujeto",children:"Fija usos y sujeto"}),e.jsxs(i.p,{children:["Para un dispositivo que se autentica como cliente, el punto de partida habitual es ",e.jsx(i.code,{children:"DigitalSignature"})," y ",e.jsx(i.code,{children:"ClientAuth"}),". Añade ",e.jsx(i.code,{children:"ServerAuth"})," o ",e.jsx(i.code,{children:"KeyEncipherment"})," solo si el protocolo lo necesita."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"restringe-las-claves",children:"Restringe las claves"}),e.jsx(i.p,{children:"Habilita la aplicación criptográfica y enumera únicamente algoritmos y tamaños compatibles con tu política y tus dispositivos."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"asócialo-y-prueba",children:"Asócialo y prueba"}),e.jsx(i.p,{children:"Asocia el perfil a una CA o DMS. Emite un certificado de prueba y comprueba sujeto, SAN, KU, EKU, restricciones básicas y fechas con una herramienta X.509 independiente."})]})]}),`
`,e.jsx(i.h2,{id:"ejemplos-de-diseño",children:"Ejemplos de diseño"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Dispositivo mTLS"}),e.jsx(i.br,{}),`
`,"Certificado final, validez corta, ",e.jsx(i.code,{children:"DigitalSignature"}),", ",e.jsx(i.code,{children:"ClientAuth"}),", sujeto controlado por el DMS y SAN permitido cuando identifica al dispositivo."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Servidor TLS"}),e.jsx(i.br,{}),`
`,"Certificado final, ",e.jsx(i.code,{children:"DigitalSignature"}),", ",e.jsx(i.code,{children:"ServerAuth"})," y SAN obligatorio con los nombres que utilizarán los clientes."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"CA intermedia"}),e.jsx(i.br,{}),`
`,e.jsx(i.code,{children:"Sign as CA"}),", ",e.jsx(i.code,{children:"CertSign"})," y ",e.jsx(i.code,{children:"CRLSign"}),", validez superior a sus certificados finales y restricciones criptográficas más exigentes."]}),`
`,e.jsx(i.p,{children:"Son patrones de partida, no una política universal. Verifica siempre los requisitos del protocolo, del consumidor y del marco regulatorio aplicable."}),`
`,e.jsx(i.h2,{id:"cambios-y-eliminación",children:"Cambios y eliminación"}),`
`,e.jsx(i.p,{children:"Actualizar un perfil afecta a emisiones futuras; no modifica certificados ya firmados. Prueba los cambios antes de aplicarlos a una CA en producción y conserva la justificación operativa."}),`
`,e.jsx(i.p,{children:"Antes de eliminar un perfil, comprueba que ninguna CA o DMS dependa de él. Si deseas sustituirlo, crea la versión nueva, actualiza las referencias y realiza una emisión de prueba antes de retirar el anterior."})]})}function p(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(t,{...a})}):t(a)}function o(a,i){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}const f=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:p,frontmatter:l,structuredData:d,toc:u},Symbol.toStringTag,{value:"Module"}));export{f as _};
