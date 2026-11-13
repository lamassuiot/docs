import{j as e}from"./index-DqgIL_Rv.js";let d=`

<div className="lm-diff-ins lm-diff-block">
  Los certificados poscuánticos solo sirven si los sistemas que los consumen pueden usarlos. Estas pruebas de integración comprueban que clientes y brokers que no forman parte de Lamassu, construidos sobre otra biblioteca criptográfica, pueden conectarse a un endpoint TLS de Lamassu, negociar un intercambio de claves poscuántico y verificar certificados poscuánticos y composite. Se probaron dos protocolos: [HTTPS](/docs/platform/pqc/integration-tests/https) y [MQTTS](/docs/platform/pqc/integration-tests/mqtts).
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="info" title="Qué demuestran estas pruebas">
    Los certificados y las CAs de las pruebas se generaron fuera de Lamassu, con herramientas estándar, para mostrar que el [toolchain de Go PQC](/docs/platform/pqc/go-toolchain) implementa los formatos X.509 y TLS de forma interoperable. Demuestran que los certificados creados externamente funcionan con el endpoint TLS de Lamassu y que software independiente los verifica. No prueban certificados emitidos por una CA de Lamassu.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  Qué se probó [#qué-se-probó]
</div>

<div className="lm-diff-ins lm-diff-block">
  El servidor es el proxy Traefik que termina el TLS de los dispositivos en Lamassu ([Proxy TLS con Traefik](/docs/platform/pqc/tls-front-proxy)). Está compilado con el toolchain de Go PQC y se configuró en cada prueba con una clase de intercambio de claves y una clase de certificado.
</div>

<div className="lm-diff-ins lm-diff-block">
  Los clientes son implementaciones independientes:
</div>

<div className="lm-diff-ins lm-diff-block">
  * **OpenSSL 4.0.3 y 4.1.0**, con el soporte nativo de ML-KEM y ML-DSA de OpenSSL 3.5 y posteriores.
  * **El módulo \`hybrid-provider\` de OpenSSL**, para ML-DSA composite. La versión usada se escribió contra el borrador 19 de la especificación, que después se publicó como [RFC 10073](https://www.rfc-editor.org/rfc/rfc10073.html); los vectores de prueba de ambos son idénticos, pero el provider no se contrastó de otro modo con el texto final.
  * **\`curl\`** para HTTPS y **\`mosquitto_pub\` y \`mosquitto_sub\` 2.1.2** para MQTTS, ambos enlazados con ese OpenSSL.
</div>

<div className="lm-diff-ins lm-diff-block">
  La matriz de pruebas [#la-matriz-de-pruebas]
</div>

<div className="lm-diff-ins lm-diff-block">
  Cada combinación de intercambio de claves y certificado se probó por separado, con las familias que Lamassu usa en el resto de la documentación (T, PQ y PQ/T, véase [Algoritmos](/docs/platform/pqc/algorithms)).
</div>

<div className="lm-diff-ins lm-diff-block">
  | Intercambio de claves | Grupos que acepta el servidor                               |
  | --------------------- | ----------------------------------------------------------- |
  | **T**                 | \`X25519\`, \`CurveP256\`, \`CurveP384\`                          |
  | **PQ**                | \`MLKEM1024\`                                                 |
  | **PQ/T**              | \`X25519MLKEM768\`, \`SecP256r1MLKEM768\`, \`SecP384r1MLKEM1024\` |
</div>

<div className="lm-diff-ins lm-diff-block">
  | Certificado | Certificado del servidor               |
  | ----------- | -------------------------------------- |
  | **T**       | ECDSA P-256                            |
  | **PQ**      | ML-DSA-65                              |
  | **PQ/T**    | Composite \`MLDSA65-RSA3072-PSS-SHA512\` |
</div>

<div className="lm-diff-ins lm-diff-block">
  Son nueve combinaciones. Se probaron además tres certificados composite con intercambio de claves PQ/T: \`MLDSA44-ECDSA-P256-SHA256\`, \`MLDSA65-ECDSA-P256-SHA512\` y \`MLDSA65-Ed25519-SHA512\`, hasta un total de doce casos. Cada certificado lo emitió una CA de pruebas con el mismo algoritmo que el certificado.
</div>

<div className="lm-diff-ins lm-diff-block">
  Qué comprueba cada caso [#qué-comprueba-cada-caso]
</div>

<div className="lm-diff-ins lm-diff-block">
  Un caso se supera solo si se cumple todo lo siguiente:
</div>

<div className="lm-diff-ins lm-diff-block">
  1. **Intercambio de claves.** El grupo negociado en el handshake es el esperado para el caso.
  2. **Firma.** El esquema de la firma del handshake del servidor es el esperado para el certificado.
  3. **Cadena.** El cliente verifica la cadena de certificados contra la CA del caso y el nombre del servidor, sin errores de verificación.
  4. **Tráfico de aplicación.** El protocolo funciona: una petición HTTP devuelve \`200\`, o un mensaje MQTT publicado en el broker llega a un suscriptor.
  5. **Se rechaza un intercambio de claves incorrecto.** Un cliente que ofrece todos los grupos salvo los de la clase del caso falla con la alerta TLS \`handshake_failure\`.
  6. **Se rechaza un esquema de certificado incorrecto.** Un cliente que ofrece todos los esquemas de firma salvo el del certificado falla con la misma alerta.
</div>

<div className="lm-diff-ins lm-diff-block">
  Las dos últimas comprobaciones demuestran que el servidor impone su configuración, y no solo que acepta a un cliente compatible.
</div>

<div className="lm-diff-ins lm-diff-block">
  Comportamiento esperable [#comportamiento-esperable]
</div>

<div className="lm-diff-ins lm-diff-block">
  * **Hubo que alinear los puntos de código composite.** Los esquemas de firma TLS de los algoritmos composite usan [puntos de código de uso privado](/docs/platform/pqc/go-toolchain#puntos-de-código-tls). El \`hybrid-provider\` usa por defecto otros valores, así que para las pruebas se igualaron a los del toolchain de Go PQC. Un cliente que implemente TLS composite debe usar los mismos valores.
  * **ML-DSA puro y ML-KEM no necesitan nada más.** Funcionan con OpenSSL 3.5 o posterior tal cual; solo los certificados composite necesitan el provider.
  * **Algunos handshakes requieren un viaje de ida y vuelta adicional.** El cliente envía primero el key share de \`X25519MLKEM768\`. Cuando el servidor está configurado para una clase que no lo incluye (T y PQ), responde con un HelloRetryRequest y el handshake termina con el grupo que pide.
  * **La preferencia de firma del cliente decide el certificado.** Cuando el servidor tiene certificados de varias clases para el mismo nombre, sirve el primero que coincide con la lista de esquemas de firma del cliente. Un cliente OpenSSL 3.5 o posterior con la configuración por defecto lista ML-DSA primero, de modo que recibe el certificado ML-DSA y debe confiar en esa CA.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="HTTPS" description="Un endpoint de la API de Lamassu probado con openssl y curl." href="/docs/platform/pqc/integration-tests/https" />

    <Card title="MQTTS" description="Un broker MQTT detrás del proxy TLS, probado con mosquitto." href="/docs/platform/pqc/integration-tests/mqtts" />

    <Card title="Limitaciones conocidas" description="Qué no cubren estas pruebas ni la plataforma." href="/docs/platform/pqc/limitations" />
  </Cards>
</div>
`,l={title:"Resumen de las pruebas de integración",description:"Evidencia de que software ajeno a Lamassu negocia intercambio de claves poscuántico y verifica los certificados poscuánticos y composite que sirve Lamassu."},t={isNew:!0,changes:18,title:void 0,description:void 0},m={contents:[{heading:void 0,content:"Los certificados poscuánticos solo sirven si los sistemas que los consumen pueden usarlos. Estas pruebas de integración comprueban que clientes y brokers que no forman parte de Lamassu, construidos sobre otra biblioteca criptográfica, pueden conectarse a un endpoint TLS de Lamassu, negociar un intercambio de claves poscuántico y verificar certificados poscuánticos y composite. Se probaron dos protocolos: HTTPS y MQTTS."},{heading:void 0,content:"Los certificados y las CAs de las pruebas se generaron fuera de Lamassu, con herramientas estándar, para mostrar que el toolchain de Go PQC implementa los formatos X.509 y TLS de forma interoperable. Demuestran que los certificados creados externamente funcionan con el endpoint TLS de Lamassu y que software independiente los verifica. No prueban certificados emitidos por una CA de Lamassu."},{heading:"qué-se-probó",content:"El servidor es el proxy Traefik que termina el TLS de los dispositivos en Lamassu (Proxy TLS con Traefik). Está compilado con el toolchain de Go PQC y se configuró en cada prueba con una clase de intercambio de claves y una clase de certificado."},{heading:"qué-se-probó",content:"Los clientes son implementaciones independientes:"},{heading:"qué-se-probó",content:"**OpenSSL 4.0.3 y 4.1.0**, con el soporte nativo de ML-KEM y ML-DSA de OpenSSL 3.5 y posteriores."},{heading:"qué-se-probó",content:"**El módulo `hybrid-provider` de OpenSSL**, para ML-DSA composite. La versión usada se escribió contra el borrador 19 de la especificación, que después se publicó como RFC 10073; los vectores de prueba de ambos son idénticos, pero el provider no se contrastó de otro modo con el texto final."},{heading:"qué-se-probó",content:"**`curl`*&#x2A; para HTTPS y **`mosquitto_pub` y `mosquitto_sub` 2.1.2** para MQTTS, ambos enlazados con ese OpenSSL."},{heading:"la-matriz-de-pruebas",content:"Cada combinación de intercambio de claves y certificado se probó por separado, con las familias que Lamassu usa en el resto de la documentación (T, PQ y PQ/T, véase Algoritmos)."},{heading:"la-matriz-de-pruebas",content:"Intercambio de claves"},{heading:"la-matriz-de-pruebas",content:"Grupos que acepta el servidor"},{heading:"la-matriz-de-pruebas",content:"**T**"},{heading:"la-matriz-de-pruebas",content:"`X25519`, `CurveP256`, `CurveP384`"},{heading:"la-matriz-de-pruebas",content:"**PQ**"},{heading:"la-matriz-de-pruebas",content:"`MLKEM1024`"},{heading:"la-matriz-de-pruebas",content:"**PQ/T**"},{heading:"la-matriz-de-pruebas",content:"`X25519MLKEM768`, `SecP256r1MLKEM768`, `SecP384r1MLKEM1024`"},{heading:"la-matriz-de-pruebas",content:"Certificado"},{heading:"la-matriz-de-pruebas",content:"Certificado del servidor"},{heading:"la-matriz-de-pruebas",content:"**T**"},{heading:"la-matriz-de-pruebas",content:"ECDSA P-256"},{heading:"la-matriz-de-pruebas",content:"**PQ**"},{heading:"la-matriz-de-pruebas",content:"ML-DSA-65"},{heading:"la-matriz-de-pruebas",content:"**PQ/T**"},{heading:"la-matriz-de-pruebas",content:"Composite `MLDSA65-RSA3072-PSS-SHA512`"},{heading:"la-matriz-de-pruebas",content:"Son nueve combinaciones. Se probaron además tres certificados composite con intercambio de claves PQ/T: `MLDSA44-ECDSA-P256-SHA256`, `MLDSA65-ECDSA-P256-SHA512` y `MLDSA65-Ed25519-SHA512`, hasta un total de doce casos. Cada certificado lo emitió una CA de pruebas con el mismo algoritmo que el certificado."},{heading:"qué-comprueba-cada-caso",content:"Un caso se supera solo si se cumple todo lo siguiente:"},{heading:"qué-comprueba-cada-caso",content:"**Intercambio de claves.** El grupo negociado en el handshake es el esperado para el caso."},{heading:"qué-comprueba-cada-caso",content:"**Firma.** El esquema de la firma del handshake del servidor es el esperado para el certificado."},{heading:"qué-comprueba-cada-caso",content:"**Cadena.** El cliente verifica la cadena de certificados contra la CA del caso y el nombre del servidor, sin errores de verificación."},{heading:"qué-comprueba-cada-caso",content:"**Tráfico de aplicación.** El protocolo funciona: una petición HTTP devuelve `200`, o un mensaje MQTT publicado en el broker llega a un suscriptor."},{heading:"qué-comprueba-cada-caso",content:"**Se rechaza un intercambio de claves incorrecto.** Un cliente que ofrece todos los grupos salvo los de la clase del caso falla con la alerta TLS `handshake_failure`."},{heading:"qué-comprueba-cada-caso",content:"**Se rechaza un esquema de certificado incorrecto.** Un cliente que ofrece todos los esquemas de firma salvo el del certificado falla con la misma alerta."},{heading:"qué-comprueba-cada-caso",content:"Las dos últimas comprobaciones demuestran que el servidor impone su configuración, y no solo que acepta a un cliente compatible."},{heading:"comportamiento-esperable",content:"**Hubo que alinear los puntos de código composite.** Los esquemas de firma TLS de los algoritmos composite usan puntos de código de uso privado. El `hybrid-provider` usa por defecto otros valores, así que para las pruebas se igualaron a los del toolchain de Go PQC. Un cliente que implemente TLS composite debe usar los mismos valores."},{heading:"comportamiento-esperable",content:"**ML-DSA puro y ML-KEM no necesitan nada más.** Funcionan con OpenSSL 3.5 o posterior tal cual; solo los certificados composite necesitan el provider."},{heading:"comportamiento-esperable",content:"**Algunos handshakes requieren un viaje de ida y vuelta adicional.** El cliente envía primero el key share de `X25519MLKEM768`. Cuando el servidor está configurado para una clase que no lo incluye (T y PQ), responde con un HelloRetryRequest y el handshake termina con el grupo que pide."},{heading:"comportamiento-esperable",content:"**La preferencia de firma del cliente decide el certificado.** Cuando el servidor tiene certificados de varias clases para el mismo nombre, sirve el primero que coincide con la lista de esquemas de firma del cliente. Un cliente OpenSSL 3.5 o posterior con la configuración por defecto lista ML-DSA primero, de modo que recibe el certificado ML-DSA y debe confiar en esa CA."},{heading:"comportamiento-esperable",content:'<Card title="HTTPS" description="Un endpoint de la API de Lamassu probado con openssl y curl." href="/docs/platform/pqc/integration-tests/https" />'},{heading:"comportamiento-esperable",content:'<Card title="MQTTS" description="Un broker MQTT detrás del proxy TLS, probado con mosquitto." href="/docs/platform/pqc/integration-tests/mqtts" />'},{heading:"comportamiento-esperable",content:'<Card title="Limitaciones conocidas" description="Qué no cubren estas pruebas ni la plataforma." href="/docs/platform/pqc/limitations" />'}],headings:[{id:"qué-se-probó",content:"Qué se probó"},{id:"la-matriz-de-pruebas",content:"La matriz de pruebas"},{id:"qué-comprueba-cada-caso",content:"Qué comprueba cada caso"},{id:"comportamiento-esperable",content:"Comportamiento esperable"}]};const p=[{depth:2,url:"#qué-se-probó",title:e.jsx(e.Fragment,{children:"Qué se probó"})},{depth:2,url:"#la-matriz-de-pruebas",title:e.jsx(e.Fragment,{children:"La matriz de pruebas"})},{depth:2,url:"#qué-comprueba-cada-caso",title:e.jsx(e.Fragment,{children:"Qué comprueba cada caso"})},{depth:2,url:"#comportamiento-esperable",title:e.jsx(e.Fragment,{children:"Comportamiento esperable"})}];function c(a){const o={a:"a",code:"code",div:"div",h2:"h2",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...a.components},{Callout:n,Card:s,Cards:r}=o;return n||i("Callout"),s||i("Card"),r||i("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(o.p,{children:["Los certificados poscuánticos solo sirven si los sistemas que los consumen pueden usarlos. Estas pruebas de integración comprueban que clientes y brokers que no forman parte de Lamassu, construidos sobre otra biblioteca criptográfica, pueden conectarse a un endpoint TLS de Lamassu, negociar un intercambio de claves poscuántico y verificar certificados poscuánticos y composite. Se probaron dos protocolos: ",e.jsx(o.a,{href:"/docs/platform/pqc/integration-tests/https",children:"HTTPS"})," y ",e.jsx(o.a,{href:"/docs/platform/pqc/integration-tests/mqtts",children:"MQTTS"}),"."]})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n,{type:"info",title:"Qué demuestran estas pruebas",children:e.jsxs(o.p,{children:["Los certificados y las CAs de las pruebas se generaron fuera de Lamassu, con herramientas estándar, para mostrar que el ",e.jsx(o.a,{href:"/docs/platform/pqc/go-toolchain",children:"toolchain de Go PQC"})," implementa los formatos X.509 y TLS de forma interoperable. Demuestran que los certificados creados externamente funcionan con el endpoint TLS de Lamassu y que software independiente los verifica. No prueban certificados emitidos por una CA de Lamassu."]})})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(o.h2,{id:"qué-se-probó",children:"Qué se probó"})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(o.p,{children:["El servidor es el proxy Traefik que termina el TLS de los dispositivos en Lamassu (",e.jsx(o.a,{href:"/docs/platform/pqc/tls-front-proxy",children:"Proxy TLS con Traefik"}),"). Está compilado con el toolchain de Go PQC y se configuró en cada prueba con una clase de intercambio de claves y una clase de certificado."]})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(o.p,{children:"Los clientes son implementaciones independientes:"})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(o.ul,{children:[`
`,e.jsxs(o.li,{children:[e.jsx(o.strong,{children:"OpenSSL 4.0.3 y 4.1.0"}),", con el soporte nativo de ML-KEM y ML-DSA de OpenSSL 3.5 y posteriores."]}),`
`,e.jsxs(o.li,{children:[e.jsxs(o.strong,{children:["El módulo ",e.jsx(o.code,{children:"hybrid-provider"})," de OpenSSL"]}),", para ML-DSA composite. La versión usada se escribió contra el borrador 19 de la especificación, que después se publicó como ",e.jsx(o.a,{href:"https://www.rfc-editor.org/rfc/rfc10073.html",children:"RFC 10073"}),"; los vectores de prueba de ambos son idénticos, pero el provider no se contrastó de otro modo con el texto final."]}),`
`,e.jsxs(o.li,{children:[e.jsx(o.strong,{children:e.jsx(o.code,{children:"curl"})})," para HTTPS y ",e.jsxs(o.strong,{children:[e.jsx(o.code,{children:"mosquitto_pub"})," y ",e.jsx(o.code,{children:"mosquitto_sub"})," 2.1.2"]})," para MQTTS, ambos enlazados con ese OpenSSL."]}),`
`]})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(o.h2,{id:"la-matriz-de-pruebas",children:"La matriz de pruebas"})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(o.p,{children:["Cada combinación de intercambio de claves y certificado se probó por separado, con las familias que Lamassu usa en el resto de la documentación (T, PQ y PQ/T, véase ",e.jsx(o.a,{href:"/docs/platform/pqc/algorithms",children:"Algoritmos"}),")."]})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(o.table,{children:[e.jsx(o.thead,{children:e.jsxs(o.tr,{children:[e.jsx(o.th,{children:"Intercambio de claves"}),e.jsx(o.th,{children:"Grupos que acepta el servidor"})]})}),e.jsxs(o.tbody,{children:[e.jsxs(o.tr,{children:[e.jsx(o.td,{children:e.jsx(o.strong,{children:"T"})}),e.jsxs(o.td,{children:[e.jsx(o.code,{children:"X25519"}),", ",e.jsx(o.code,{children:"CurveP256"}),", ",e.jsx(o.code,{children:"CurveP384"})]})]}),e.jsxs(o.tr,{children:[e.jsx(o.td,{children:e.jsx(o.strong,{children:"PQ"})}),e.jsx(o.td,{children:e.jsx(o.code,{children:"MLKEM1024"})})]}),e.jsxs(o.tr,{children:[e.jsx(o.td,{children:e.jsx(o.strong,{children:"PQ/T"})}),e.jsxs(o.td,{children:[e.jsx(o.code,{children:"X25519MLKEM768"}),", ",e.jsx(o.code,{children:"SecP256r1MLKEM768"}),", ",e.jsx(o.code,{children:"SecP384r1MLKEM1024"})]})]})]})]})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(o.table,{children:[e.jsx(o.thead,{children:e.jsxs(o.tr,{children:[e.jsx(o.th,{children:"Certificado"}),e.jsx(o.th,{children:"Certificado del servidor"})]})}),e.jsxs(o.tbody,{children:[e.jsxs(o.tr,{children:[e.jsx(o.td,{children:e.jsx(o.strong,{children:"T"})}),e.jsx(o.td,{children:"ECDSA P-256"})]}),e.jsxs(o.tr,{children:[e.jsx(o.td,{children:e.jsx(o.strong,{children:"PQ"})}),e.jsx(o.td,{children:"ML-DSA-65"})]}),e.jsxs(o.tr,{children:[e.jsx(o.td,{children:e.jsx(o.strong,{children:"PQ/T"})}),e.jsxs(o.td,{children:["Composite ",e.jsx(o.code,{children:"MLDSA65-RSA3072-PSS-SHA512"})]})]})]})]})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(o.p,{children:["Son nueve combinaciones. Se probaron además tres certificados composite con intercambio de claves PQ/T: ",e.jsx(o.code,{children:"MLDSA44-ECDSA-P256-SHA256"}),", ",e.jsx(o.code,{children:"MLDSA65-ECDSA-P256-SHA512"})," y ",e.jsx(o.code,{children:"MLDSA65-Ed25519-SHA512"}),", hasta un total de doce casos. Cada certificado lo emitió una CA de pruebas con el mismo algoritmo que el certificado."]})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(o.h2,{id:"qué-comprueba-cada-caso",children:"Qué comprueba cada caso"})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(o.p,{children:"Un caso se supera solo si se cumple todo lo siguiente:"})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(o.ol,{children:[`
`,e.jsxs(o.li,{children:[e.jsx(o.strong,{children:"Intercambio de claves."})," El grupo negociado en el handshake es el esperado para el caso."]}),`
`,e.jsxs(o.li,{children:[e.jsx(o.strong,{children:"Firma."})," El esquema de la firma del handshake del servidor es el esperado para el certificado."]}),`
`,e.jsxs(o.li,{children:[e.jsx(o.strong,{children:"Cadena."})," El cliente verifica la cadena de certificados contra la CA del caso y el nombre del servidor, sin errores de verificación."]}),`
`,e.jsxs(o.li,{children:[e.jsx(o.strong,{children:"Tráfico de aplicación."})," El protocolo funciona: una petición HTTP devuelve ",e.jsx(o.code,{children:"200"}),", o un mensaje MQTT publicado en el broker llega a un suscriptor."]}),`
`,e.jsxs(o.li,{children:[e.jsx(o.strong,{children:"Se rechaza un intercambio de claves incorrecto."})," Un cliente que ofrece todos los grupos salvo los de la clase del caso falla con la alerta TLS ",e.jsx(o.code,{children:"handshake_failure"}),"."]}),`
`,e.jsxs(o.li,{children:[e.jsx(o.strong,{children:"Se rechaza un esquema de certificado incorrecto."})," Un cliente que ofrece todos los esquemas de firma salvo el del certificado falla con la misma alerta."]}),`
`]})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(o.p,{children:"Las dos últimas comprobaciones demuestran que el servidor impone su configuración, y no solo que acepta a un cliente compatible."})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(o.h2,{id:"comportamiento-esperable",children:"Comportamiento esperable"})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(o.ul,{children:[`
`,e.jsxs(o.li,{children:[e.jsx(o.strong,{children:"Hubo que alinear los puntos de código composite."})," Los esquemas de firma TLS de los algoritmos composite usan ",e.jsx(o.a,{href:"/docs/platform/pqc/go-toolchain#puntos-de-c%C3%B3digo-tls",children:"puntos de código de uso privado"}),". El ",e.jsx(o.code,{children:"hybrid-provider"})," usa por defecto otros valores, así que para las pruebas se igualaron a los del toolchain de Go PQC. Un cliente que implemente TLS composite debe usar los mismos valores."]}),`
`,e.jsxs(o.li,{children:[e.jsx(o.strong,{children:"ML-DSA puro y ML-KEM no necesitan nada más."})," Funcionan con OpenSSL 3.5 o posterior tal cual; solo los certificados composite necesitan el provider."]}),`
`,e.jsxs(o.li,{children:[e.jsx(o.strong,{children:"Algunos handshakes requieren un viaje de ida y vuelta adicional."})," El cliente envía primero el key share de ",e.jsx(o.code,{children:"X25519MLKEM768"}),". Cuando el servidor está configurado para una clase que no lo incluye (T y PQ), responde con un HelloRetryRequest y el handshake termina con el grupo que pide."]}),`
`,e.jsxs(o.li,{children:[e.jsx(o.strong,{children:"La preferencia de firma del cliente decide el certificado."})," Cuando el servidor tiene certificados de varias clases para el mismo nombre, sirve el primero que coincide con la lista de esquemas de firma del cliente. Un cliente OpenSSL 3.5 o posterior con la configuración por defecto lista ML-DSA primero, de modo que recibe el certificado ML-DSA y debe confiar en esa CA."]}),`
`]})}),`
`,e.jsx(o.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(r,{children:[e.jsx(s,{title:"HTTPS",description:"Un endpoint de la API de Lamassu probado con openssl y curl.",href:"/docs/platform/pqc/integration-tests/https"}),e.jsx(s,{title:"MQTTS",description:"Un broker MQTT detrás del proxy TLS, probado con mosquitto.",href:"/docs/platform/pqc/integration-tests/mqtts"}),e.jsx(s,{title:"Limitaciones conocidas",description:"Qué no cubren estas pruebas ni la plataforma.",href:"/docs/platform/pqc/limitations"})]})})]})}function u(a={}){const{wrapper:o}=a.components||{};return o?e.jsx(o,{...a,children:e.jsx(c,{...a})}):c(a)}function i(a,o){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}const h=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:u,frontmatter:l,lmDiff:t,structuredData:m,toc:p},Symbol.toStringTag,{value:"Module"}));export{h as _};
