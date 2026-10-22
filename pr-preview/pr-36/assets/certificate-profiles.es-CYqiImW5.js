import{j as e}from"./index-prc0XQdj.js";let t=`

Un perfil de emisión convierte una política de certificados en configuración reutilizable. En lugar de decidir validez, sujeto, extensiones y algoritmos en cada solicitud, defines una vez qué está permitido y asocias el perfil a una CA, un DMS o una emisión concreta.

Esta guía se dirige al administrador PKI que define la política de emisión. Necesitas permisos para gestionar perfiles y asociarlos a la CA o DMS previstos, además de un consumidor de prueba con requisitos de identidad y uso conocidos.

Qué controla un perfil [#qué-controla-un-perfil]

Validez [#validez]

Puedes expresar la vigencia como una duración desde el momento de emisión o como una fecha final fija. Una duración funciona bien para identidades recurrentes; una fecha común sirve para hacer que todo un lote termine antes de una migración o retirada.

Planifica la fecha final dentro de la vigencia de la CA emisora y deja margen para renovar. El firmador calcula la fecha desde el perfil; no recorta automáticamente la validez al vencimiento del emisor. Comprueba ambas fechas en el certificado resultante. Una fecha fija ya pasada tampoco representa una identidad utilizable.

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

Esto conserva SAN, pero no comprueba que el solicitante tenga derecho a utilizar esos DNS, IP, correos o URI. Valida esa autorización antes de emitir. Los puntos OCSP y CRL proceden de la configuración del servicio de emisión; \`Honor Extensions\` no copia los puntos de distribución de la CSR.

Restricciones criptográficas [#restricciones-criptográficas]

La aplicación criptográfica puede:

* permitir o bloquear claves RSA;
* limitar los tamaños RSA admitidos;
* permitir o bloquear claves ECDSA;
* limitar los tamaños o curvas ECDSA admitidos.

Cuando está habilitada, Lamassu comprueba la clave pública antes de crear una CA o firmar una CSR. Una clave cuyo tipo o tamaño no figure en el perfil se rechaza.

Precedencia del perfil [#precedencia-del-perfil]

La resolución depende del punto de entrada. Se selecciona un perfil completo; sus campos no se fusionan con los del perfil de la CA.

| Operación                | Primera opción                              | Segunda opción                                 | Si no hay ninguna                               |
| ------------------------ | ------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| Firma directa con una CA | \`issuance_profile\` incluido en la solicitud | \`issuance_profile_id\` de la solicitud          | Perfil predeterminado de la CA (\`profile_id\`).  |
| Emisión mediante DMS     | \`settings.issuance_profile_id\`              | \`settings.issuance_profile\` incluido en el DMS | Perfil predeterminado de la CA de enrolamiento. |

Si el identificador seleccionado no puede resolverse, la operación falla; no se sustituye silenciosamente por el perfil de la CA. Evita definir las dos opciones a la vez. Registrar qué perfil se seleccionó facilita explicar por qué el resultado difiere de la CSR.

Varias flotas pueden compartir CA y mantener perfiles distintos mediante sus DMS. La autenticación del solicitante y la política de registro del dispositivo se configuran aparte en [DMS](/docs/platform/iot-fleets/enrollment/dms).

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

    Asocia el perfil a una CA o DMS y verifica la precedencia anterior. Emite una CSR con usos y SAN conocidos; inspecciona el resultado con \`openssl x509 -in device.crt -noout -text\`. Comprueba sujeto, SAN, KU, EKU y fechas. Para una identidad final, \`Sign as CA\` debe estar desactivado, no debe aparecer \`CA:TRUE\` ni \`Certificate Sign\`; si existe Basic Constraints, debe indicar \`CA:FALSE\`.

    Prueba también una clave excluida por la política: la emisión debe rechazarse. Sigue la [verificación del certificado](/docs/platform/pki/quickstarts/issue-certificate) y prueba su aceptación en el consumidor previsto.
  </Step>
</Steps>

Ejemplos de diseño [#ejemplos-de-diseño]

**Dispositivo mTLS**\\
Certificado final, validez corta, \`DigitalSignature\`, \`ClientAuth\`, sujeto controlado por el DMS y SAN permitido cuando identifica al dispositivo.

**Servidor TLS**\\
Certificado final, \`DigitalSignature\`, \`ServerAuth\` y SAN obligatorio con los nombres que utilizarán los clientes.

**CA intermedia**\\
\`Sign as CA\`, \`CertSign\` y \`CRLSign\`, validez superior a sus certificados finales y restricciones criptográficas más exigentes.

Estos patrones expresan decisiones de diseño. Activar \`Honor Extensions\` no exige que la CSR incluya SAN ni valida sus nombres; debes hacer esa comprobación en el flujo de solicitud. El perfil tampoco instala confianza ni concede permisos en el consumidor.

Cambios y eliminación [#cambios-y-eliminación]

Actualizar un perfil afecta a emisiones futuras; no modifica certificados ya firmados. Prueba los cambios antes de aplicarlos a una CA en producción y conserva la justificación operativa.

Antes de eliminar un perfil, comprueba que ninguna CA o DMS dependa de él. Si deseas sustituirlo, crea la versión nueva, actualiza las referencias y realiza una emisión de prueba antes de retirar el anterior.
`,l={title:"Perfiles de certificado",description:"Define políticas reutilizables para emitir certificados coherentes y limitar las claves aceptadas.",sidebar:{label:"Perfiles de certificado"}},d={contents:[{heading:void 0,content:"Un perfil de emisión convierte una política de certificados en configuración reutilizable. En lugar de decidir validez, sujeto, extensiones y algoritmos en cada solicitud, defines una vez qué está permitido y asocias el perfil a una CA, un DMS o una emisión concreta."},{heading:void 0,content:"Esta guía se dirige al administrador PKI que define la política de emisión. Necesitas permisos para gestionar perfiles y asociarlos a la CA o DMS previstos, además de un consumidor de prueba con requisitos de identidad y uso conocidos."},{heading:"validez",content:"Puedes expresar la vigencia como una duración desde el momento de emisión o como una fecha final fija. Una duración funciona bien para identidades recurrentes; una fecha común sirve para hacer que todo un lote termine antes de una migración o retirada."},{heading:"validez",content:"Planifica la fecha final dentro de la vigencia de la CA emisora y deja margen para renovar. El firmador calcula la fecha desde el perfil; no recorta automáticamente la validez al vencimiento del emisor. Comprueba ambas fechas en el certificado resultante. Una fecha fija ya pasada tampoco representa una identidad utilizable."},{heading:"certificado-de-ca-o-certificado-final",content:"`Sign as CA` establece `IsCA` y las restricciones básicas necesarias para una autoridad. Actívalo solo en perfiles destinados a crear o reemitir CAs subordinadas."},{heading:"key-usage-y-extended-key-usage",content:"El perfil puede imponer usos como `DigitalSignature`, `KeyEncipherment`, `CertSign`, `CRLSign`, `ClientAuth`, `ServerAuth` u `OCSPSigning`."},{heading:"key-usage-y-extended-key-usage",content:"Si activas **Honor Key Usage** o **Honor Extended Key Usages**, Lamassu conserva los valores solicitados por la CSR. Si los desactivas, los sustituye por los definidos en el perfil."},{heading:"key-usage-y-extended-key-usage",content:"No habilites las opciones `Honor…` para solicitudes no confiables salvo que otro componente valide esos campos. De lo contrario, el solicitante puede elegir capacidades más amplias de las previstas."},{heading:"sujeto",content:"Con **Honor Subject**, el certificado conserva el sujeto de la CSR. Sin esa opción, Lamassu aplica `CN`, `O`, `OU`, `C`, `ST` y `L` del perfil. Si el perfil no define `Common Name`, se conserva el CN solicitado."},{heading:"extensiones-de-la-csr",content:"Con **Honor Extensions**, Lamassu filtra las extensiones adicionales solicitadas y conserva únicamente SAN. Sin esa opción, descarta las extensiones adicionales de la CSR."},{heading:"extensiones-de-la-csr",content:"Esto conserva SAN, pero no comprueba que el solicitante tenga derecho a utilizar esos DNS, IP, correos o URI. Valida esa autorización antes de emitir. Los puntos OCSP y CRL proceden de la configuración del servicio de emisión; `Honor Extensions` no copia los puntos de distribución de la CSR."},{heading:"restricciones-criptográficas",content:"La aplicación criptográfica puede:"},{heading:"restricciones-criptográficas",content:"permitir o bloquear claves RSA;"},{heading:"restricciones-criptográficas",content:"limitar los tamaños RSA admitidos;"},{heading:"restricciones-criptográficas",content:"permitir o bloquear claves ECDSA;"},{heading:"restricciones-criptográficas",content:"limitar los tamaños o curvas ECDSA admitidos."},{heading:"restricciones-criptográficas",content:"Cuando está habilitada, Lamassu comprueba la clave pública antes de crear una CA o firmar una CSR. Una clave cuyo tipo o tamaño no figure en el perfil se rechaza."},{heading:"precedencia-del-perfil",content:"La resolución depende del punto de entrada. Se selecciona un perfil completo; sus campos no se fusionan con los del perfil de la CA."},{heading:"precedencia-del-perfil",content:"Operación"},{heading:"precedencia-del-perfil",content:"Primera opción"},{heading:"precedencia-del-perfil",content:"Segunda opción"},{heading:"precedencia-del-perfil",content:"Si no hay ninguna"},{heading:"precedencia-del-perfil",content:"Firma directa con una CA"},{heading:"precedencia-del-perfil",content:"`issuance_profile` incluido en la solicitud"},{heading:"precedencia-del-perfil",content:"`issuance_profile_id` de la solicitud"},{heading:"precedencia-del-perfil",content:"Perfil predeterminado de la CA (`profile_id`)."},{heading:"precedencia-del-perfil",content:"Emisión mediante DMS"},{heading:"precedencia-del-perfil",content:"`settings.issuance_profile_id`"},{heading:"precedencia-del-perfil",content:"`settings.issuance_profile` incluido en el DMS"},{heading:"precedencia-del-perfil",content:"Perfil predeterminado de la CA de enrolamiento."},{heading:"precedencia-del-perfil",content:"Si el identificador seleccionado no puede resolverse, la operación falla; no se sustituye silenciosamente por el perfil de la CA. Evita definir las dos opciones a la vez. Registrar qué perfil se seleccionó facilita explicar por qué el resultado difiere de la CSR."},{heading:"precedencia-del-perfil",content:"Varias flotas pueden compartir CA y mantener perfiles distintos mediante sus DMS. La autenticación del solicitante y la política de registro del dispositivo se configuran aparte en DMS."},{heading:"define-un-único-propósito",content:"Separa, por ejemplo, dispositivos mTLS, servidores y CAs intermedias. Un perfil pequeño y específico es más fácil de revisar que uno que permita todos los usos."},{heading:"elige-la-validez",content:"Alinea la duración con la capacidad real de renovación de la flota. Deja margen respecto a la expiración de la CA."},{heading:"fija-usos-y-sujeto",content:"Para un dispositivo que se autentica como cliente, el punto de partida habitual es `DigitalSignature` y `ClientAuth`. Añade `ServerAuth` o `KeyEncipherment` solo si el protocolo lo necesita."},{heading:"restringe-las-claves",content:"Habilita la aplicación criptográfica y enumera únicamente algoritmos y tamaños compatibles con tu política y tus dispositivos."},{heading:"asócialo-y-prueba",content:"Asocia el perfil a una CA o DMS y verifica la precedencia anterior. Emite una CSR con usos y SAN conocidos; inspecciona el resultado con `openssl x509 -in device.crt -noout -text`. Comprueba sujeto, SAN, KU, EKU y fechas. Para una identidad final, `Sign as CA` debe estar desactivado, no debe aparecer `CA:TRUE` ni `Certificate Sign`; si existe Basic Constraints, debe indicar `CA:FALSE`."},{heading:"asócialo-y-prueba",content:"Prueba también una clave excluida por la política: la emisión debe rechazarse. Sigue la verificación del certificado y prueba su aceptación en el consumidor previsto."},{heading:"ejemplos-de-diseño",content:"**Dispositivo mTLS**\\\nCertificado final, validez corta, `DigitalSignature`, `ClientAuth`, sujeto controlado por el DMS y SAN permitido cuando identifica al dispositivo."},{heading:"ejemplos-de-diseño",content:"**Servidor TLS**\\\nCertificado final, `DigitalSignature`, `ServerAuth` y SAN obligatorio con los nombres que utilizarán los clientes."},{heading:"ejemplos-de-diseño",content:"**CA intermedia**\\\n`Sign as CA`, `CertSign` y `CRLSign`, validez superior a sus certificados finales y restricciones criptográficas más exigentes."},{heading:"ejemplos-de-diseño",content:"Estos patrones expresan decisiones de diseño. Activar `Honor Extensions` no exige que la CSR incluya SAN ni valida sus nombres; debes hacer esa comprobación en el flujo de solicitud. El perfil tampoco instala confianza ni concede permisos en el consumidor."},{heading:"cambios-y-eliminación",content:"Actualizar un perfil afecta a emisiones futuras; no modifica certificados ya firmados. Prueba los cambios antes de aplicarlos a una CA en producción y conserva la justificación operativa."},{heading:"cambios-y-eliminación",content:"Antes de eliminar un perfil, comprueba que ninguna CA o DMS dependa de él. Si deseas sustituirlo, crea la versión nueva, actualiza las referencias y realiza una emisión de prueba antes de retirar el anterior."}],headings:[{id:"qué-controla-un-perfil",content:"Qué controla un perfil"},{id:"validez",content:"Validez"},{id:"certificado-de-ca-o-certificado-final",content:"Certificado de CA o certificado final"},{id:"key-usage-y-extended-key-usage",content:"Key Usage y Extended Key Usage"},{id:"sujeto",content:"Sujeto"},{id:"extensiones-de-la-csr",content:"Extensiones de la CSR"},{id:"restricciones-criptográficas",content:"Restricciones criptográficas"},{id:"precedencia-del-perfil",content:"Precedencia del perfil"},{id:"crea-un-perfil",content:"Crea un perfil"},{id:"define-un-único-propósito",content:"Define un único propósito"},{id:"elige-la-validez",content:"Elige la validez"},{id:"fija-usos-y-sujeto",content:"Fija usos y sujeto"},{id:"restringe-las-claves",content:"Restringe las claves"},{id:"asócialo-y-prueba",content:"Asócialo y prueba"},{id:"ejemplos-de-diseño",content:"Ejemplos de diseño"},{id:"cambios-y-eliminación",content:"Cambios y eliminación"}]};const u=[{depth:2,url:"#qué-controla-un-perfil",title:e.jsx(e.Fragment,{children:"Qué controla un perfil"})},{depth:3,url:"#validez",title:e.jsx(e.Fragment,{children:"Validez"})},{depth:3,url:"#certificado-de-ca-o-certificado-final",title:e.jsx(e.Fragment,{children:"Certificado de CA o certificado final"})},{depth:3,url:"#key-usage-y-extended-key-usage",title:e.jsx(e.Fragment,{children:"Key Usage y Extended Key Usage"})},{depth:3,url:"#sujeto",title:e.jsx(e.Fragment,{children:"Sujeto"})},{depth:3,url:"#extensiones-de-la-csr",title:e.jsx(e.Fragment,{children:"Extensiones de la CSR"})},{depth:3,url:"#restricciones-criptográficas",title:e.jsx(e.Fragment,{children:"Restricciones criptográficas"})},{depth:2,url:"#precedencia-del-perfil",title:e.jsx(e.Fragment,{children:"Precedencia del perfil"})},{depth:2,url:"#crea-un-perfil",title:e.jsx(e.Fragment,{children:"Crea un perfil"})},{depth:3,url:"#define-un-único-propósito",title:e.jsx(e.Fragment,{children:"Define un único propósito"})},{depth:3,url:"#elige-la-validez",title:e.jsx(e.Fragment,{children:"Elige la validez"})},{depth:3,url:"#fija-usos-y-sujeto",title:e.jsx(e.Fragment,{children:"Fija usos y sujeto"})},{depth:3,url:"#restringe-las-claves",title:e.jsx(e.Fragment,{children:"Restringe las claves"})},{depth:3,url:"#asócialo-y-prueba",title:e.jsx(e.Fragment,{children:"Asócialo y prueba"})},{depth:2,url:"#ejemplos-de-diseño",title:e.jsx(e.Fragment,{children:"Ejemplos de diseño"})},{depth:2,url:"#cambios-y-eliminación",title:e.jsx(e.Fragment,{children:"Cambios y eliminación"})}];function c(a){const i={a:"a",br:"br",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...a.components},{Callout:o,Step:n,Steps:r}=i;return o||s("Callout"),n||s("Step"),r||s("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"Un perfil de emisión convierte una política de certificados en configuración reutilizable. En lugar de decidir validez, sujeto, extensiones y algoritmos en cada solicitud, defines una vez qué está permitido y asocias el perfil a una CA, un DMS o una emisión concreta."}),`
`,e.jsx(i.p,{children:"Esta guía se dirige al administrador PKI que define la política de emisión. Necesitas permisos para gestionar perfiles y asociarlos a la CA o DMS previstos, además de un consumidor de prueba con requisitos de identidad y uso conocidos."}),`
`,e.jsx(i.h2,{id:"qué-controla-un-perfil",children:"Qué controla un perfil"}),`
`,e.jsx(i.h3,{id:"validez",children:"Validez"}),`
`,e.jsx(i.p,{children:"Puedes expresar la vigencia como una duración desde el momento de emisión o como una fecha final fija. Una duración funciona bien para identidades recurrentes; una fecha común sirve para hacer que todo un lote termine antes de una migración o retirada."}),`
`,e.jsx(i.p,{children:"Planifica la fecha final dentro de la vigencia de la CA emisora y deja margen para renovar. El firmador calcula la fecha desde el perfil; no recorta automáticamente la validez al vencimiento del emisor. Comprueba ambas fechas en el certificado resultante. Una fecha fija ya pasada tampoco representa una identidad utilizable."}),`
`,e.jsx(i.h3,{id:"certificado-de-ca-o-certificado-final",children:"Certificado de CA o certificado final"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"Sign as CA"})," establece ",e.jsx(i.code,{children:"IsCA"})," y las restricciones básicas necesarias para una autoridad. Actívalo solo en perfiles destinados a crear o reemitir CAs subordinadas."]}),`
`,e.jsx(i.h3,{id:"key-usage-y-extended-key-usage",children:"Key Usage y Extended Key Usage"}),`
`,e.jsxs(i.p,{children:["El perfil puede imponer usos como ",e.jsx(i.code,{children:"DigitalSignature"}),", ",e.jsx(i.code,{children:"KeyEncipherment"}),", ",e.jsx(i.code,{children:"CertSign"}),", ",e.jsx(i.code,{children:"CRLSign"}),", ",e.jsx(i.code,{children:"ClientAuth"}),", ",e.jsx(i.code,{children:"ServerAuth"})," u ",e.jsx(i.code,{children:"OCSPSigning"}),"."]}),`
`,e.jsxs(i.p,{children:["Si activas ",e.jsx(i.strong,{children:"Honor Key Usage"})," o ",e.jsx(i.strong,{children:"Honor Extended Key Usages"}),", Lamassu conserva los valores solicitados por la CSR. Si los desactivas, los sustituye por los definidos en el perfil."]}),`
`,e.jsx(o,{type:"warn",title:"Honor significa delegar parte de la política",children:e.jsxs(i.p,{children:["No habilites las opciones ",e.jsx(i.code,{children:"Honor…"})," para solicitudes no confiables salvo que otro componente valide esos campos. De lo contrario, el solicitante puede elegir capacidades más amplias de las previstas."]})}),`
`,e.jsx(i.h3,{id:"sujeto",children:"Sujeto"}),`
`,e.jsxs(i.p,{children:["Con ",e.jsx(i.strong,{children:"Honor Subject"}),", el certificado conserva el sujeto de la CSR. Sin esa opción, Lamassu aplica ",e.jsx(i.code,{children:"CN"}),", ",e.jsx(i.code,{children:"O"}),", ",e.jsx(i.code,{children:"OU"}),", ",e.jsx(i.code,{children:"C"}),", ",e.jsx(i.code,{children:"ST"})," y ",e.jsx(i.code,{children:"L"})," del perfil. Si el perfil no define ",e.jsx(i.code,{children:"Common Name"}),", se conserva el CN solicitado."]}),`
`,e.jsx(i.h3,{id:"extensiones-de-la-csr",children:"Extensiones de la CSR"}),`
`,e.jsxs(i.p,{children:["Con ",e.jsx(i.strong,{children:"Honor Extensions"}),", Lamassu filtra las extensiones adicionales solicitadas y conserva únicamente SAN. Sin esa opción, descarta las extensiones adicionales de la CSR."]}),`
`,e.jsxs(i.p,{children:["Esto conserva SAN, pero no comprueba que el solicitante tenga derecho a utilizar esos DNS, IP, correos o URI. Valida esa autorización antes de emitir. Los puntos OCSP y CRL proceden de la configuración del servicio de emisión; ",e.jsx(i.code,{children:"Honor Extensions"})," no copia los puntos de distribución de la CSR."]}),`
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
`,e.jsx(i.p,{children:"La resolución depende del punto de entrada. Se selecciona un perfil completo; sus campos no se fusionan con los del perfil de la CA."}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Operación"}),e.jsx(i.th,{children:"Primera opción"}),e.jsx(i.th,{children:"Segunda opción"}),e.jsx(i.th,{children:"Si no hay ninguna"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Firma directa con una CA"}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"issuance_profile"})," incluido en la solicitud"]}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"issuance_profile_id"})," de la solicitud"]}),e.jsxs(i.td,{children:["Perfil predeterminado de la CA (",e.jsx(i.code,{children:"profile_id"}),")."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Emisión mediante DMS"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"settings.issuance_profile_id"})}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"settings.issuance_profile"})," incluido en el DMS"]}),e.jsx(i.td,{children:"Perfil predeterminado de la CA de enrolamiento."})]})]})]}),`
`,e.jsx(i.p,{children:"Si el identificador seleccionado no puede resolverse, la operación falla; no se sustituye silenciosamente por el perfil de la CA. Evita definir las dos opciones a la vez. Registrar qué perfil se seleccionó facilita explicar por qué el resultado difiere de la CSR."}),`
`,e.jsxs(i.p,{children:["Varias flotas pueden compartir CA y mantener perfiles distintos mediante sus DMS. La autenticación del solicitante y la política de registro del dispositivo se configuran aparte en ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"DMS"}),"."]}),`
`,e.jsx(i.h2,{id:"crea-un-perfil",children:"Crea un perfil"}),`
`,e.jsxs(r,{children:[e.jsxs(n,{children:[e.jsx(i.h3,{id:"define-un-único-propósito",children:"Define un único propósito"}),e.jsx(i.p,{children:"Separa, por ejemplo, dispositivos mTLS, servidores y CAs intermedias. Un perfil pequeño y específico es más fácil de revisar que uno que permita todos los usos."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"elige-la-validez",children:"Elige la validez"}),e.jsx(i.p,{children:"Alinea la duración con la capacidad real de renovación de la flota. Deja margen respecto a la expiración de la CA."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"fija-usos-y-sujeto",children:"Fija usos y sujeto"}),e.jsxs(i.p,{children:["Para un dispositivo que se autentica como cliente, el punto de partida habitual es ",e.jsx(i.code,{children:"DigitalSignature"})," y ",e.jsx(i.code,{children:"ClientAuth"}),". Añade ",e.jsx(i.code,{children:"ServerAuth"})," o ",e.jsx(i.code,{children:"KeyEncipherment"})," solo si el protocolo lo necesita."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"restringe-las-claves",children:"Restringe las claves"}),e.jsx(i.p,{children:"Habilita la aplicación criptográfica y enumera únicamente algoritmos y tamaños compatibles con tu política y tus dispositivos."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"asócialo-y-prueba",children:"Asócialo y prueba"}),e.jsxs(i.p,{children:["Asocia el perfil a una CA o DMS y verifica la precedencia anterior. Emite una CSR con usos y SAN conocidos; inspecciona el resultado con ",e.jsx(i.code,{children:"openssl x509 -in device.crt -noout -text"}),". Comprueba sujeto, SAN, KU, EKU y fechas. Para una identidad final, ",e.jsx(i.code,{children:"Sign as CA"})," debe estar desactivado, no debe aparecer ",e.jsx(i.code,{children:"CA:TRUE"})," ni ",e.jsx(i.code,{children:"Certificate Sign"}),"; si existe Basic Constraints, debe indicar ",e.jsx(i.code,{children:"CA:FALSE"}),"."]}),e.jsxs(i.p,{children:["Prueba también una clave excluida por la política: la emisión debe rechazarse. Sigue la ",e.jsx(i.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"verificación del certificado"})," y prueba su aceptación en el consumidor previsto."]})]})]}),`
`,e.jsx(i.h2,{id:"ejemplos-de-diseño",children:"Ejemplos de diseño"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Dispositivo mTLS"}),e.jsx(i.br,{}),`
`,"Certificado final, validez corta, ",e.jsx(i.code,{children:"DigitalSignature"}),", ",e.jsx(i.code,{children:"ClientAuth"}),", sujeto controlado por el DMS y SAN permitido cuando identifica al dispositivo."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Servidor TLS"}),e.jsx(i.br,{}),`
`,"Certificado final, ",e.jsx(i.code,{children:"DigitalSignature"}),", ",e.jsx(i.code,{children:"ServerAuth"})," y SAN obligatorio con los nombres que utilizarán los clientes."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"CA intermedia"}),e.jsx(i.br,{}),`
`,e.jsx(i.code,{children:"Sign as CA"}),", ",e.jsx(i.code,{children:"CertSign"})," y ",e.jsx(i.code,{children:"CRLSign"}),", validez superior a sus certificados finales y restricciones criptográficas más exigentes."]}),`
`,e.jsxs(i.p,{children:["Estos patrones expresan decisiones de diseño. Activar ",e.jsx(i.code,{children:"Honor Extensions"})," no exige que la CSR incluya SAN ni valida sus nombres; debes hacer esa comprobación en el flujo de solicitud. El perfil tampoco instala confianza ni concede permisos en el consumidor."]}),`
`,e.jsx(i.h2,{id:"cambios-y-eliminación",children:"Cambios y eliminación"}),`
`,e.jsx(i.p,{children:"Actualizar un perfil afecta a emisiones futuras; no modifica certificados ya firmados. Prueba los cambios antes de aplicarlos a una CA en producción y conserva la justificación operativa."}),`
`,e.jsx(i.p,{children:"Antes de eliminar un perfil, comprueba que ninguna CA o DMS dependa de él. Si deseas sustituirlo, crea la versión nueva, actualiza las referencias y realiza una emisión de prueba antes de retirar el anterior."})]})}function p(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(c,{...a})}):c(a)}function s(a,i){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:t,default:p,frontmatter:l,structuredData:d,toc:u},Symbol.toStringTag,{value:"Module"}));export{m as _};
