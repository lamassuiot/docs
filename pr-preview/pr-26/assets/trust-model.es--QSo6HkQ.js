import{j as e}from"./index-prc0XQdj.js";let d=`

En Lamassu, confianza no significa simplemente que un certificado exista en el inventario. Un consumidor confía en una identidad cuando puede construir una cadena hasta una raíz que reconoce, comprobar que el certificado sirve para el uso esperado y verificar que sigue vigente.

Las cuatro decisiones de confianza [#las-cuatro-decisiones-de-confianza]

Quién puede emitir [#quién-puede-emitir]

La jerarquía de CAs define qué autoridades pueden firmar. Una CA raíz establece el ancla de confianza; las CAs intermedias separan ámbitos operativos y evitan utilizar la raíz para cada emisión.

Qué puede emitirse [#qué-puede-emitirse]

Los [perfiles de certificado](/docs/platform/pki/certificate-profiles) limitan validez, sujeto, usos, extensiones y parámetros criptográficos. La posesión de una CA no sustituye a una política de emisión.

Quién puede solicitarlo [#quién-puede-solicitarlo]

El DMS actúa como punto de enrolamiento. Puede autenticar una solicitud EST con certificado cliente, webhook externo o una combinación de ambos. Las CAs configuradas para validar al solicitante no tienen por qué ser la CA que emitirá la identidad nueva.

Quién acepta el resultado [#quién-acepta-el-resultado]

El servicio o dispositivo consumidor mantiene su propio almacén de confianza. Lamassu puede distribuir la CA del sistema, la CA de enrolamiento y otras CAs gestionadas mediante \`/cacerts\`, pero el consumidor decide cuáles instala y cómo aplica la validación.

Flujo de una identidad [#flujo-de-una-identidad]

1. El dispositivo demuestra que puede enrolarse según la política del DMS.
2. El DMS valida la solicitud y remite la CSR a la CA de enrolamiento.
3. La CA aplica el perfil y firma sin recibir la clave privada del dispositivo.
4. El dispositivo instala el certificado y la cadena que necesita.
5. El sistema que confía en el dispositivo valida cadena, fechas, usos y estado de revocación.

<Callout type="info" title="Autenticación y autorización son límites distintos">
  OIDC o X.509 identifica al operador que llama a Lamassu. El servicio de autorización decide qué acciones puede realizar. La jerarquía X.509, en cambio, determina si un certificado presentado por un dispositivo es confiable.
</Callout>

CAs de enrolamiento, validación y distribución [#cas-de-enrolamiento-validación-y-distribución]

Un DMS relaciona tres conjuntos que conviene diseñar por separado:

* **CA de enrolamiento:** firma las nuevas identidades.
* **CAs de validación:** autentican certificados cliente usados para enrolamiento o migración. En re-enrolamiento, Lamassu prueba primero la CA de enrolamiento y después las CAs de validación adicionales.
* **CAs distribuidas:** forman el contenido que el dispositivo obtiene mediante EST \`/cacerts\`. Puedes incluir la CA del sistema, la CA de enrolamiento y una lista de CAs gestionadas.

Esta separación permite migrar una flota: aceptas temporalmente certificados de la jerarquía anterior, emites con la nueva y distribuyes ambas cadenas durante el solapamiento.

Validación y revocación [#validación-y-revocación]

Una cadena válida no garantiza por sí sola que el certificado deba aceptarse. El consumidor también debe comprobar:

* que la fecha actual está entre \`Not Before\` y \`Not After\`;
* que \`Key Usage\` y \`Extended Key Usage\` permiten la operación;
* que nombres, SANs y sujeto coinciden con la identidad esperada;
* que el certificado no aparece revocado mediante [OCSP](/docs/platform/pki/ocsp) o una [CRL](/docs/platform/pki/crl).

Durante la autenticación mTLS de un DMS, Lamassu intenta comprobar la revocación. Si el certificado no contiene información suficiente para efectuar esa comprobación, el backend registra una advertencia y continúa tratándolo como no revocado. Diseña los perfiles y puntos de distribución para evitar esa situación en producción.

Límites de custodia [#límites-de-custodia]

El KMS conserva la referencia de la clave y delega la operación al motor configurado. Con un HSM o un KMS cloud, la clave privada puede permanecer no exportable. Eso protege la custodia, pero no impide por sí solo el uso indebido: todavía debes restringir quién puede ordenar una firma y auditar esas operaciones.

Patrón recomendado [#patrón-recomendado]

* Mantén la raíz fuera de las operaciones diarias o con acceso muy restringido.
* Emite desde CAs intermedias separadas por entorno o dominio de riesgo.
* Asigna perfiles explícitos a cada caso de uso.
* Distribuye la nueva confianza antes de comenzar una rotación.
* Mantén solapamiento suficiente para renovar una flota desconectada.
* Valida desde el sistema consumidor, no solo desde la consola de Lamassu.

Continúa con [Jerarquía y rotación de CAs](/docs/platform/pki/ca-hierarchy-and-rotation) para convertir este modelo en un procedimiento operativo.
`,r={title:"Modelo de confianza",description:"Entiende dónde nace la confianza, cómo se distribuye y qué valida cada componente."},t={contents:[{heading:void 0,content:"En Lamassu, confianza no significa simplemente que un certificado exista en el inventario. Un consumidor confía en una identidad cuando puede construir una cadena hasta una raíz que reconoce, comprobar que el certificado sirve para el uso esperado y verificar que sigue vigente."},{heading:"quién-puede-emitir",content:"La jerarquía de CAs define qué autoridades pueden firmar. Una CA raíz establece el ancla de confianza; las CAs intermedias separan ámbitos operativos y evitan utilizar la raíz para cada emisión."},{heading:"qué-puede-emitirse",content:"Los perfiles de certificado limitan validez, sujeto, usos, extensiones y parámetros criptográficos. La posesión de una CA no sustituye a una política de emisión."},{heading:"quién-puede-solicitarlo",content:"El DMS actúa como punto de enrolamiento. Puede autenticar una solicitud EST con certificado cliente, webhook externo o una combinación de ambos. Las CAs configuradas para validar al solicitante no tienen por qué ser la CA que emitirá la identidad nueva."},{heading:"quién-acepta-el-resultado",content:"El servicio o dispositivo consumidor mantiene su propio almacén de confianza. Lamassu puede distribuir la CA del sistema, la CA de enrolamiento y otras CAs gestionadas mediante `/cacerts`, pero el consumidor decide cuáles instala y cómo aplica la validación."},{heading:"flujo-de-una-identidad",content:"El dispositivo demuestra que puede enrolarse según la política del DMS."},{heading:"flujo-de-una-identidad",content:"El DMS valida la solicitud y remite la CSR a la CA de enrolamiento."},{heading:"flujo-de-una-identidad",content:"La CA aplica el perfil y firma sin recibir la clave privada del dispositivo."},{heading:"flujo-de-una-identidad",content:"El dispositivo instala el certificado y la cadena que necesita."},{heading:"flujo-de-una-identidad",content:"El sistema que confía en el dispositivo valida cadena, fechas, usos y estado de revocación."},{heading:"flujo-de-una-identidad",content:"OIDC o X.509 identifica al operador que llama a Lamassu. El servicio de autorización decide qué acciones puede realizar. La jerarquía X.509, en cambio, determina si un certificado presentado por un dispositivo es confiable."},{heading:"cas-de-enrolamiento-validación-y-distribución",content:"Un DMS relaciona tres conjuntos que conviene diseñar por separado:"},{heading:"cas-de-enrolamiento-validación-y-distribución",content:"**CA de enrolamiento:** firma las nuevas identidades."},{heading:"cas-de-enrolamiento-validación-y-distribución",content:"**CAs de validación:** autentican certificados cliente usados para enrolamiento o migración. En re-enrolamiento, Lamassu prueba primero la CA de enrolamiento y después las CAs de validación adicionales."},{heading:"cas-de-enrolamiento-validación-y-distribución",content:"**CAs distribuidas:** forman el contenido que el dispositivo obtiene mediante EST `/cacerts`. Puedes incluir la CA del sistema, la CA de enrolamiento y una lista de CAs gestionadas."},{heading:"cas-de-enrolamiento-validación-y-distribución",content:"Esta separación permite migrar una flota: aceptas temporalmente certificados de la jerarquía anterior, emites con la nueva y distribuyes ambas cadenas durante el solapamiento."},{heading:"validación-y-revocación",content:"Una cadena válida no garantiza por sí sola que el certificado deba aceptarse. El consumidor también debe comprobar:"},{heading:"validación-y-revocación",content:"que la fecha actual está entre `Not Before` y `Not After`;"},{heading:"validación-y-revocación",content:"que `Key Usage` y `Extended Key Usage` permiten la operación;"},{heading:"validación-y-revocación",content:"que nombres, SANs y sujeto coinciden con la identidad esperada;"},{heading:"validación-y-revocación",content:"que el certificado no aparece revocado mediante OCSP o una CRL."},{heading:"validación-y-revocación",content:"Durante la autenticación mTLS de un DMS, Lamassu intenta comprobar la revocación. Si el certificado no contiene información suficiente para efectuar esa comprobación, el backend registra una advertencia y continúa tratándolo como no revocado. Diseña los perfiles y puntos de distribución para evitar esa situación en producción."},{heading:"límites-de-custodia",content:"El KMS conserva la referencia de la clave y delega la operación al motor configurado. Con un HSM o un KMS cloud, la clave privada puede permanecer no exportable. Eso protege la custodia, pero no impide por sí solo el uso indebido: todavía debes restringir quién puede ordenar una firma y auditar esas operaciones."},{heading:"patrón-recomendado",content:"Mantén la raíz fuera de las operaciones diarias o con acceso muy restringido."},{heading:"patrón-recomendado",content:"Emite desde CAs intermedias separadas por entorno o dominio de riesgo."},{heading:"patrón-recomendado",content:"Asigna perfiles explícitos a cada caso de uso."},{heading:"patrón-recomendado",content:"Distribuye la nueva confianza antes de comenzar una rotación."},{heading:"patrón-recomendado",content:"Mantén solapamiento suficiente para renovar una flota desconectada."},{heading:"patrón-recomendado",content:"Valida desde el sistema consumidor, no solo desde la consola de Lamassu."},{heading:"patrón-recomendado",content:"Continúa con Jerarquía y rotación de CAs para convertir este modelo en un procedimiento operativo."}],headings:[{id:"las-cuatro-decisiones-de-confianza",content:"Las cuatro decisiones de confianza"},{id:"quién-puede-emitir",content:"Quién puede emitir"},{id:"qué-puede-emitirse",content:"Qué puede emitirse"},{id:"quién-puede-solicitarlo",content:"Quién puede solicitarlo"},{id:"quién-acepta-el-resultado",content:"Quién acepta el resultado"},{id:"flujo-de-una-identidad",content:"Flujo de una identidad"},{id:"cas-de-enrolamiento-validación-y-distribución",content:"CAs de enrolamiento, validación y distribución"},{id:"validación-y-revocación",content:"Validación y revocación"},{id:"límites-de-custodia",content:"Límites de custodia"},{id:"patrón-recomendado",content:"Patrón recomendado"}]};const s=[{depth:2,url:"#las-cuatro-decisiones-de-confianza",title:e.jsx(e.Fragment,{children:"Las cuatro decisiones de confianza"})},{depth:3,url:"#quién-puede-emitir",title:e.jsx(e.Fragment,{children:"Quién puede emitir"})},{depth:3,url:"#qué-puede-emitirse",title:e.jsx(e.Fragment,{children:"Qué puede emitirse"})},{depth:3,url:"#quién-puede-solicitarlo",title:e.jsx(e.Fragment,{children:"Quién puede solicitarlo"})},{depth:3,url:"#quién-acepta-el-resultado",title:e.jsx(e.Fragment,{children:"Quién acepta el resultado"})},{depth:2,url:"#flujo-de-una-identidad",title:e.jsx(e.Fragment,{children:"Flujo de una identidad"})},{depth:2,url:"#cas-de-enrolamiento-validación-y-distribución",title:e.jsx(e.Fragment,{children:"CAs de enrolamiento, validación y distribución"})},{depth:2,url:"#validación-y-revocación",title:e.jsx(e.Fragment,{children:"Validación y revocación"})},{depth:2,url:"#límites-de-custodia",title:e.jsx(e.Fragment,{children:"Límites de custodia"})},{depth:2,url:"#patrón-recomendado",title:e.jsx(e.Fragment,{children:"Patrón recomendado"})}];function o(i){const a={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...i.components},{Callout:n}=a;return n||l("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(a.p,{children:"En Lamassu, confianza no significa simplemente que un certificado exista en el inventario. Un consumidor confía en una identidad cuando puede construir una cadena hasta una raíz que reconoce, comprobar que el certificado sirve para el uso esperado y verificar que sigue vigente."}),`
`,e.jsx(a.h2,{id:"las-cuatro-decisiones-de-confianza",children:"Las cuatro decisiones de confianza"}),`
`,e.jsx(a.h3,{id:"quién-puede-emitir",children:"Quién puede emitir"}),`
`,e.jsx(a.p,{children:"La jerarquía de CAs define qué autoridades pueden firmar. Una CA raíz establece el ancla de confianza; las CAs intermedias separan ámbitos operativos y evitan utilizar la raíz para cada emisión."}),`
`,e.jsx(a.h3,{id:"qué-puede-emitirse",children:"Qué puede emitirse"}),`
`,e.jsxs(a.p,{children:["Los ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-profiles",children:"perfiles de certificado"})," limitan validez, sujeto, usos, extensiones y parámetros criptográficos. La posesión de una CA no sustituye a una política de emisión."]}),`
`,e.jsx(a.h3,{id:"quién-puede-solicitarlo",children:"Quién puede solicitarlo"}),`
`,e.jsx(a.p,{children:"El DMS actúa como punto de enrolamiento. Puede autenticar una solicitud EST con certificado cliente, webhook externo o una combinación de ambos. Las CAs configuradas para validar al solicitante no tienen por qué ser la CA que emitirá la identidad nueva."}),`
`,e.jsx(a.h3,{id:"quién-acepta-el-resultado",children:"Quién acepta el resultado"}),`
`,e.jsxs(a.p,{children:["El servicio o dispositivo consumidor mantiene su propio almacén de confianza. Lamassu puede distribuir la CA del sistema, la CA de enrolamiento y otras CAs gestionadas mediante ",e.jsx(a.code,{children:"/cacerts"}),", pero el consumidor decide cuáles instala y cómo aplica la validación."]}),`
`,e.jsx(a.h2,{id:"flujo-de-una-identidad",children:"Flujo de una identidad"}),`
`,e.jsxs(a.ol,{children:[`
`,e.jsx(a.li,{children:"El dispositivo demuestra que puede enrolarse según la política del DMS."}),`
`,e.jsx(a.li,{children:"El DMS valida la solicitud y remite la CSR a la CA de enrolamiento."}),`
`,e.jsx(a.li,{children:"La CA aplica el perfil y firma sin recibir la clave privada del dispositivo."}),`
`,e.jsx(a.li,{children:"El dispositivo instala el certificado y la cadena que necesita."}),`
`,e.jsx(a.li,{children:"El sistema que confía en el dispositivo valida cadena, fechas, usos y estado de revocación."}),`
`]}),`
`,e.jsx(n,{type:"info",title:"Autenticación y autorización son límites distintos",children:e.jsx(a.p,{children:"OIDC o X.509 identifica al operador que llama a Lamassu. El servicio de autorización decide qué acciones puede realizar. La jerarquía X.509, en cambio, determina si un certificado presentado por un dispositivo es confiable."})}),`
`,e.jsx(a.h2,{id:"cas-de-enrolamiento-validación-y-distribución",children:"CAs de enrolamiento, validación y distribución"}),`
`,e.jsx(a.p,{children:"Un DMS relaciona tres conjuntos que conviene diseñar por separado:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"CA de enrolamiento:"})," firma las nuevas identidades."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"CAs de validación:"})," autentican certificados cliente usados para enrolamiento o migración. En re-enrolamiento, Lamassu prueba primero la CA de enrolamiento y después las CAs de validación adicionales."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"CAs distribuidas:"})," forman el contenido que el dispositivo obtiene mediante EST ",e.jsx(a.code,{children:"/cacerts"}),". Puedes incluir la CA del sistema, la CA de enrolamiento y una lista de CAs gestionadas."]}),`
`]}),`
`,e.jsx(a.p,{children:"Esta separación permite migrar una flota: aceptas temporalmente certificados de la jerarquía anterior, emites con la nueva y distribuyes ambas cadenas durante el solapamiento."}),`
`,e.jsx(a.h2,{id:"validación-y-revocación",children:"Validación y revocación"}),`
`,e.jsx(a.p,{children:"Una cadena válida no garantiza por sí sola que el certificado deba aceptarse. El consumidor también debe comprobar:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:["que la fecha actual está entre ",e.jsx(a.code,{children:"Not Before"})," y ",e.jsx(a.code,{children:"Not After"}),";"]}),`
`,e.jsxs(a.li,{children:["que ",e.jsx(a.code,{children:"Key Usage"})," y ",e.jsx(a.code,{children:"Extended Key Usage"})," permiten la operación;"]}),`
`,e.jsx(a.li,{children:"que nombres, SANs y sujeto coinciden con la identidad esperada;"}),`
`,e.jsxs(a.li,{children:["que el certificado no aparece revocado mediante ",e.jsx(a.a,{href:"/docs/platform/pki/ocsp",children:"OCSP"})," o una ",e.jsx(a.a,{href:"/docs/platform/pki/crl",children:"CRL"}),"."]}),`
`]}),`
`,e.jsx(a.p,{children:"Durante la autenticación mTLS de un DMS, Lamassu intenta comprobar la revocación. Si el certificado no contiene información suficiente para efectuar esa comprobación, el backend registra una advertencia y continúa tratándolo como no revocado. Diseña los perfiles y puntos de distribución para evitar esa situación en producción."}),`
`,e.jsx(a.h2,{id:"límites-de-custodia",children:"Límites de custodia"}),`
`,e.jsx(a.p,{children:"El KMS conserva la referencia de la clave y delega la operación al motor configurado. Con un HSM o un KMS cloud, la clave privada puede permanecer no exportable. Eso protege la custodia, pero no impide por sí solo el uso indebido: todavía debes restringir quién puede ordenar una firma y auditar esas operaciones."}),`
`,e.jsx(a.h2,{id:"patrón-recomendado",children:"Patrón recomendado"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Mantén la raíz fuera de las operaciones diarias o con acceso muy restringido."}),`
`,e.jsx(a.li,{children:"Emite desde CAs intermedias separadas por entorno o dominio de riesgo."}),`
`,e.jsx(a.li,{children:"Asigna perfiles explícitos a cada caso de uso."}),`
`,e.jsx(a.li,{children:"Distribuye la nueva confianza antes de comenzar una rotación."}),`
`,e.jsx(a.li,{children:"Mantén solapamiento suficiente para renovar una flota desconectada."}),`
`,e.jsx(a.li,{children:"Valida desde el sistema consumidor, no solo desde la consola de Lamassu."}),`
`]}),`
`,e.jsxs(a.p,{children:["Continúa con ",e.jsx(a.a,{href:"/docs/platform/pki/ca-hierarchy-and-rotation",children:"Jerarquía y rotación de CAs"})," para convertir este modelo en un procedimiento operativo."]})]})}function c(i={}){const{wrapper:a}=i.components||{};return a?e.jsx(a,{...i,children:e.jsx(o,{...i})}):o(i)}function l(i,a){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:c,frontmatter:r,structuredData:t,toc:s},Symbol.toStringTag,{value:"Module"}));export{p as _};
