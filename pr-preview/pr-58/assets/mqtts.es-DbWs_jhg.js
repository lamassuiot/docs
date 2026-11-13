import{j as e}from"./index-DqgIL_Rv.js";let d=`

<div className="lm-diff-ins lm-diff-block">
  Esta prueba conecta \`mosquitto_pub\` y \`mosquitto_sub\` a un broker MQTT por TLS y comprueba que los mensajes lo atraviesan con intercambio de claves poscuántico y certificados de servidor poscuánticos o composite. El [resumen](/docs/platform/pqc/integration-tests/overview) explica los clientes, la matriz de pruebas y qué demuestra cada comprobación.
</div>

<div className="lm-diff-ins lm-diff-block">
  Escenario [#escenario]
</div>

<div className="lm-diff-ins lm-diff-block">
  El broker es EMQX 5.8.9. Escucha MQTT en claro dentro del clúster, y el proxy TLS de Lamassu ([Proxy TLS con Traefik](/docs/platform/pqc/tls-front-proxy)) termina el TLS por él en el puerto 8883 y reenvía el tráfico. El TLS es unidireccional: el endpoint del broker presenta su certificado y el cliente no presenta ninguno. El certificado del servidor y su CA se crearon fuera de Lamassu, y el proxy se configuró en cada caso con los grupos de intercambio de claves y el certificado de esa fila y columna de la matriz.
</div>

<div className="lm-diff-ins lm-diff-block">
  Los clientes son \`mosquitto_pub\` y \`mosquitto_sub\` 2.1.2, con MQTT 3.1.1 sobre TLS 1.3 y enlazados con OpenSSL 4.1.0. Un caso se supera cuando el suscriptor recibe el mensaje que el publicador envió a través del broker, ambos clientes validan la cadena de certificados contra la CA del caso y el nombre del servidor, y las dos comprobaciones negativas se rechazan.
</div>

<div className="lm-diff-ins lm-diff-block">
  Resultados [#resultados]
</div>

<div className="lm-diff-ins lm-diff-block">
  Los doce casos se superaron. En cada uno, \`mosquitto_sub\` se suscribió a un tema, \`mosquitto_pub\` publicó un valor único y el suscriptor lo recibió. La prueba se ejecutó dos veces por caso: una con el cliente ofreciendo todos los grupos y esquemas de firma, y otra con el cliente ofreciendo solo el grupo y el esquema de firma esperados para el caso. La segunda ejecución demuestra que el endpoint del broker negoció exactamente ese grupo y ese esquema, porque el cliente no ofrecía nada más.
</div>

<div className="lm-diff-ins lm-diff-block">
  | Intercambio de claves ↓ / Certificado → | **T**: ECDSA P-256                           | **PQ**: ML-DSA-65             | **PQ/T**: \`MLDSA65-RSA3072-PSS-SHA512\`    |
  | --------------------------------------- | -------------------------------------------- | ----------------------------- | ----------------------------------------- |
  | **T**                                   | ✅ \`X25519\`, \`ecdsa_secp256r1_sha256\`         | ✅ \`X25519\`, \`mldsa65\`         | ✅ \`X25519\`, \`mldsa65_rsa3072_pss\`         |
  | **PQ**                                  | ✅ \`MLKEM1024\`, \`ecdsa_secp256r1_sha256\`      | ✅ \`MLKEM1024\`, \`mldsa65\`      | ✅ \`MLKEM1024\`, \`mldsa65_rsa3072_pss\`      |
  | **PQ/T**                                | ✅ \`X25519MLKEM768\`, \`ecdsa_secp256r1_sha256\` | ✅ \`X25519MLKEM768\`, \`mldsa65\` | ✅ \`X25519MLKEM768\`, \`mldsa65_rsa3072_pss\` |
</div>

<div className="lm-diff-ins lm-diff-block">
  Los certificados composite adicionales se comportan igual con intercambio de claves PQ/T.
</div>

<div className="lm-diff-ins lm-diff-block">
  | Composite adicional         | Esquema de firma     | Resultado |
  | --------------------------- | -------------------- | --------- |
  | \`MLDSA44-ECDSA-P256-SHA256\` | \`mldsa44_ecdsa_p256\` | ✅         |
  | \`MLDSA65-ECDSA-P256-SHA512\` | \`mldsa65_ecdsa_p256\` | ✅         |
  | \`MLDSA65-Ed25519-SHA512\`    | \`mldsa65_ed25519\`    | ✅         |
</div>

<div className="lm-diff-ins lm-diff-block">
  Cuando el cliente ofrecía todos los grupos salvo los de la clase del caso, o todos los esquemas de firma salvo el del certificado, el handshake TLS fallaba con una alerta \`handshake failure\` y el broker nunca enviaba un \`CONNACK\`. El resultado fue el mismo en los doce casos.
</div>

<div className="lm-diff-ins lm-diff-block">
  Con una única configuración de servidor que tiene los certificados ECDSA, ML-DSA-65 y composite y acepta las tres clases de intercambio de claves, cada una de las nueve combinaciones conectó en el puerto 8883 cuando el cliente ofrecía un grupo y un esquema de firma. \`mosquitto_pub\` recibió \`CONNACK (0)\` en todas.
</div>

<div className="lm-diff-ins lm-diff-block">
  Reproducir un caso [#reproducir-un-caso]
</div>

<div className="lm-diff-ins lm-diff-block">
  mosquitto no tiene opciones para elegir grupos de intercambio de claves ni esquemas de firma, así que se fijan mediante un fichero de configuración de OpenSSL que \`mosquitto_pub\` y \`mosquitto_sub\` leen de la variable de entorno \`OPENSSL_CONF\`. Necesitas OpenSSL 3.5 o posterior; para certificados composite, además el módulo \`hybrid-provider\` con puntos de código que coincidan con los del toolchain de Go PQC.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Steps>
    <Step>
      Crea la configuración de OpenSSL [#crea-la-configuración-de-openssl]

      Este \`pqc-client.cnf\` hace que el cliente ofrezca solo \`X25519MLKEM768\` y el esquema de firma composite, y carga el provider composite:

      \`\`\`ini
      openssl_conf = openssl_init

      [openssl_init]
      providers = provider_sect
      ssl_conf = ssl_sect

      [provider_sect]
      default = default_sect
      hybrid = hybrid_sect

      [default_sect]
      activate = 1

      [hybrid_sect]
      module = /path/to/hybrid.so
      activate = 1

      [ssl_sect]
      system_default = tls_sect

      [tls_sect]
      MinProtocol = TLSv1.3
      Groups = X25519MLKEM768
      SignatureAlgorithms = mldsa65_rsa3072_pss
      \`\`\`

      Elimina el provider \`hybrid\` y el módulo en un caso que use solo ML-DSA o ECDSA.
    </Step>

    <Step>
      Suscríbete y publica [#suscríbete-y-publica]

      Arranca el suscriptor en una terminal y el publicador en otra. Ambos validan el certificado del broker contra \`ca.pem\`, la CA del caso:

      \`\`\`bash
      export OPENSSL_CONF=$PWD/pqc-client.cnf

      mosquitto_sub -h <MQTT_HOST> -p 8883 --cafile ca.pem --tls-version tlsv1.3 \\
        -t pqc-test/hello -C 1 -W 15

      mosquitto_pub -h <MQTT_HOST> -p 8883 --cafile ca.pem --tls-version tlsv1.3 \\
        -t pqc-test/hello -m "hello over pqc"
      \`\`\`

      El suscriptor imprime \`hello over pqc\` y termina. Añade \`-d\` para ver los paquetes \`CONNECT\`, \`CONNACK (0)\`, \`SUBACK\` y \`PUBLISH\`.
    </Step>

    <Step>
      Comprueba que una oferta incorrecta se rechaza [#comprueba-que-una-oferta-incorrecta-se-rechaza]

      Cambia \`Groups\` por una lista que no incluya el grupo que acepta el servidor, por ejemplo \`Groups = X25519\` frente a un servidor configurado para \`MLKEM1024\`, y repite la publicación. El cliente falla con \`tls alert handshake failure\` y no se recibe ningún \`CONNACK\`.
    </Step>
  </Steps>
</div>

<div className="lm-diff-ins lm-diff-block">
  Qué debes saber [#qué-debes-saber]
</div>

<div className="lm-diff-ins lm-diff-block">
  * **Nombre del host y certificado.** mosquitto usa el valor de \`-h\` como destino de la conexión, como nombre de servidor enviado en el handshake y como nombre que verifica. Los certificados de prueba llevan ese nombre como nombre alternativo del sujeto.
  * **Un certificado por nombre.** El proxy TLS guarda sus certificados por nombre, no por puerto. Un endpoint MQTT que comparte nombre con el endpoint HTTPS sirve los mismos certificados, así que da al broker su propio nombre si necesita un certificado distinto.
  * **No se probaron los valores por defecto sin fijar.** Todas las ejecuciones fijaron explícitamente la oferta de grupos y firmas, así que no se comprobó qué negocia mosquitto con la oferta por defecto de OpenSSL. Las pruebas HTTPS sí cubren un cliente OpenSSL por defecto: recibe el certificado ML-DSA si el servidor lo tiene.
  * **Otros clientes en el mismo puerto.** Imponer TLS 1.3 o algoritmos poscuánticos en un puerto MQTT compartido afecta a todos los clientes que se conectan a él. Durante las pruebas el proxy registró intentos de conexión de otros clientes que solo admiten TLS 1.2 o anterior, o que no confiaban en el certificado. Identifícalos antes de dejar el ajuste de forma permanente.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="HTTPS" description="Las mismas comprobaciones para un endpoint HTTPS de Lamassu." href="/docs/platform/pqc/integration-tests/https" />

    <Card title="Despliegue con el chart de Helm" description="Despliega el proxy que termina el TLS." href="/docs/platform/pqc/deployment" />
  </Cards>
</div>
`,t={title:"Pruebas de integración MQTTS",description:"Resultados de probar un broker MQTT detrás del proxy TLS de Lamassu con mosquitto, usando intercambio de claves poscuántico y certificados poscuánticos y composite."},h={isNew:!0,changes:17,title:void 0,description:void 0},u={contents:[{heading:void 0,content:"Esta prueba conecta `mosquitto_pub` y `mosquitto_sub` a un broker MQTT por TLS y comprueba que los mensajes lo atraviesan con intercambio de claves poscuántico y certificados de servidor poscuánticos o composite. El resumen explica los clientes, la matriz de pruebas y qué demuestra cada comprobación."},{heading:"escenario",content:"El broker es EMQX 5.8.9. Escucha MQTT en claro dentro del clúster, y el proxy TLS de Lamassu (Proxy TLS con Traefik) termina el TLS por él en el puerto 8883 y reenvía el tráfico. El TLS es unidireccional: el endpoint del broker presenta su certificado y el cliente no presenta ninguno. El certificado del servidor y su CA se crearon fuera de Lamassu, y el proxy se configuró en cada caso con los grupos de intercambio de claves y el certificado de esa fila y columna de la matriz."},{heading:"escenario",content:"Los clientes son `mosquitto_pub` y `mosquitto_sub` 2.1.2, con MQTT 3.1.1 sobre TLS 1.3 y enlazados con OpenSSL 4.1.0. Un caso se supera cuando el suscriptor recibe el mensaje que el publicador envió a través del broker, ambos clientes validan la cadena de certificados contra la CA del caso y el nombre del servidor, y las dos comprobaciones negativas se rechazan."},{heading:"resultados",content:"Los doce casos se superaron. En cada uno, `mosquitto_sub` se suscribió a un tema, `mosquitto_pub` publicó un valor único y el suscriptor lo recibió. La prueba se ejecutó dos veces por caso: una con el cliente ofreciendo todos los grupos y esquemas de firma, y otra con el cliente ofreciendo solo el grupo y el esquema de firma esperados para el caso. La segunda ejecución demuestra que el endpoint del broker negoció exactamente ese grupo y ese esquema, porque el cliente no ofrecía nada más."},{heading:"resultados",content:"Intercambio de claves ↓ / Certificado →"},{heading:"resultados",content:"**T**: ECDSA P-256"},{heading:"resultados",content:"**PQ**: ML-DSA-65"},{heading:"resultados",content:"**PQ/T**: `MLDSA65-RSA3072-PSS-SHA512`"},{heading:"resultados",content:"**T**"},{heading:"resultados",content:"✅ `X25519`, `ecdsa_secp256r1_sha256`"},{heading:"resultados",content:"✅ `X25519`, `mldsa65`"},{heading:"resultados",content:"✅ `X25519`, `mldsa65_rsa3072_pss`"},{heading:"resultados",content:"**PQ**"},{heading:"resultados",content:"✅ `MLKEM1024`, `ecdsa_secp256r1_sha256`"},{heading:"resultados",content:"✅ `MLKEM1024`, `mldsa65`"},{heading:"resultados",content:"✅ `MLKEM1024`, `mldsa65_rsa3072_pss`"},{heading:"resultados",content:"**PQ/T**"},{heading:"resultados",content:"✅ `X25519MLKEM768`, `ecdsa_secp256r1_sha256`"},{heading:"resultados",content:"✅ `X25519MLKEM768`, `mldsa65`"},{heading:"resultados",content:"✅ `X25519MLKEM768`, `mldsa65_rsa3072_pss`"},{heading:"resultados",content:"Los certificados composite adicionales se comportan igual con intercambio de claves PQ/T."},{heading:"resultados",content:"Composite adicional"},{heading:"resultados",content:"Esquema de firma"},{heading:"resultados",content:"Resultado"},{heading:"resultados",content:"`MLDSA44-ECDSA-P256-SHA256`"},{heading:"resultados",content:"`mldsa44_ecdsa_p256`"},{heading:"resultados",content:"✅"},{heading:"resultados",content:"`MLDSA65-ECDSA-P256-SHA512`"},{heading:"resultados",content:"`mldsa65_ecdsa_p256`"},{heading:"resultados",content:"✅"},{heading:"resultados",content:"`MLDSA65-Ed25519-SHA512`"},{heading:"resultados",content:"`mldsa65_ed25519`"},{heading:"resultados",content:"✅"},{heading:"resultados",content:"Cuando el cliente ofrecía todos los grupos salvo los de la clase del caso, o todos los esquemas de firma salvo el del certificado, el handshake TLS fallaba con una alerta `handshake failure` y el broker nunca enviaba un `CONNACK`. El resultado fue el mismo en los doce casos."},{heading:"resultados",content:"Con una única configuración de servidor que tiene los certificados ECDSA, ML-DSA-65 y composite y acepta las tres clases de intercambio de claves, cada una de las nueve combinaciones conectó en el puerto 8883 cuando el cliente ofrecía un grupo y un esquema de firma. `mosquitto_pub` recibió `CONNACK (0)` en todas."},{heading:"reproducir-un-caso",content:"mosquitto no tiene opciones para elegir grupos de intercambio de claves ni esquemas de firma, así que se fijan mediante un fichero de configuración de OpenSSL que `mosquitto_pub` y `mosquitto_sub` leen de la variable de entorno `OPENSSL_CONF`. Necesitas OpenSSL 3.5 o posterior; para certificados composite, además el módulo `hybrid-provider` con puntos de código que coincidan con los del toolchain de Go PQC."},{heading:"crea-la-configuración-de-openssl",content:"Este `pqc-client.cnf` hace que el cliente ofrezca solo `X25519MLKEM768` y el esquema de firma composite, y carga el provider composite:"},{heading:"crea-la-configuración-de-openssl",content:"Elimina el provider `hybrid` y el módulo en un caso que use solo ML-DSA o ECDSA."},{heading:"suscríbete-y-publica",content:"Arranca el suscriptor en una terminal y el publicador en otra. Ambos validan el certificado del broker contra `ca.pem`, la CA del caso:"},{heading:"suscríbete-y-publica",content:"El suscriptor imprime `hello over pqc` y termina. Añade `-d` para ver los paquetes `CONNECT`, `CONNACK (0)`, `SUBACK` y `PUBLISH`."},{heading:"comprueba-que-una-oferta-incorrecta-se-rechaza",content:"Cambia `Groups` por una lista que no incluya el grupo que acepta el servidor, por ejemplo `Groups = X25519` frente a un servidor configurado para `MLKEM1024`, y repite la publicación. El cliente falla con `tls alert handshake failure` y no se recibe ningún `CONNACK`."},{heading:"qué-debes-saber",content:"**Nombre del host y certificado.** mosquitto usa el valor de `-h` como destino de la conexión, como nombre de servidor enviado en el handshake y como nombre que verifica. Los certificados de prueba llevan ese nombre como nombre alternativo del sujeto."},{heading:"qué-debes-saber",content:"**Un certificado por nombre.** El proxy TLS guarda sus certificados por nombre, no por puerto. Un endpoint MQTT que comparte nombre con el endpoint HTTPS sirve los mismos certificados, así que da al broker su propio nombre si necesita un certificado distinto."},{heading:"qué-debes-saber",content:"**No se probaron los valores por defecto sin fijar.** Todas las ejecuciones fijaron explícitamente la oferta de grupos y firmas, así que no se comprobó qué negocia mosquitto con la oferta por defecto de OpenSSL. Las pruebas HTTPS sí cubren un cliente OpenSSL por defecto: recibe el certificado ML-DSA si el servidor lo tiene."},{heading:"qué-debes-saber",content:"**Otros clientes en el mismo puerto.** Imponer TLS 1.3 o algoritmos poscuánticos en un puerto MQTT compartido afecta a todos los clientes que se conectan a él. Durante las pruebas el proxy registró intentos de conexión de otros clientes que solo admiten TLS 1.2 o anterior, o que no confiaban en el certificado. Identifícalos antes de dejar el ajuste de forma permanente."},{heading:"qué-debes-saber",content:'<Card title="HTTPS" description="Las mismas comprobaciones para un endpoint HTTPS de Lamassu." href="/docs/platform/pqc/integration-tests/https" />'},{heading:"qué-debes-saber",content:'<Card title="Despliegue con el chart de Helm" description="Despliega el proxy que termina el TLS." href="/docs/platform/pqc/deployment" />'}],headings:[{id:"escenario",content:"Escenario"},{id:"resultados",content:"Resultados"},{id:"reproducir-un-caso",content:"Reproducir un caso"},{id:"crea-la-configuración-de-openssl",content:"Crea la configuración de OpenSSL"},{id:"suscríbete-y-publica",content:"Suscríbete y publica"},{id:"comprueba-que-una-oferta-incorrecta-se-rechaza",content:"Comprueba que una oferta incorrecta se rechaza"},{id:"qué-debes-saber",content:"Qué debes saber"}]};const p=[{depth:2,url:"#escenario",title:e.jsx(e.Fragment,{children:"Escenario"})},{depth:2,url:"#resultados",title:e.jsx(e.Fragment,{children:"Resultados"})},{depth:2,url:"#reproducir-un-caso",title:e.jsx(e.Fragment,{children:"Reproducir un caso"})},{depth:3,url:"#crea-la-configuración-de-openssl",title:e.jsx(e.Fragment,{children:"Crea la configuración de OpenSSL"})},{depth:3,url:"#suscríbete-y-publica",title:e.jsx(e.Fragment,{children:"Suscríbete y publica"})},{depth:3,url:"#comprueba-que-una-oferta-incorrecta-se-rechaza",title:e.jsx(e.Fragment,{children:"Comprueba que una oferta incorrecta se rechaza"})},{depth:2,url:"#qué-debes-saber",title:e.jsx(e.Fragment,{children:"Qué debes saber"})}];function c(i){const s={a:"a",code:"code",div:"div",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Card:o,Cards:r,Step:n,Steps:l}=s;return o||a("Card"),r||a("Cards"),n||a("Step"),l||a("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Esta prueba conecta ",e.jsx(s.code,{children:"mosquitto_pub"})," y ",e.jsx(s.code,{children:"mosquitto_sub"})," a un broker MQTT por TLS y comprueba que los mensajes lo atraviesan con intercambio de claves poscuántico y certificados de servidor poscuánticos o composite. El ",e.jsx(s.a,{href:"/docs/platform/pqc/integration-tests/overview",children:"resumen"})," explica los clientes, la matriz de pruebas y qué demuestra cada comprobación."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"escenario",children:"Escenario"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["El broker es EMQX 5.8.9. Escucha MQTT en claro dentro del clúster, y el proxy TLS de Lamassu (",e.jsx(s.a,{href:"/docs/platform/pqc/tls-front-proxy",children:"Proxy TLS con Traefik"}),") termina el TLS por él en el puerto 8883 y reenvía el tráfico. El TLS es unidireccional: el endpoint del broker presenta su certificado y el cliente no presenta ninguno. El certificado del servidor y su CA se crearon fuera de Lamassu, y el proxy se configuró en cada caso con los grupos de intercambio de claves y el certificado de esa fila y columna de la matriz."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Los clientes son ",e.jsx(s.code,{children:"mosquitto_pub"})," y ",e.jsx(s.code,{children:"mosquitto_sub"})," 2.1.2, con MQTT 3.1.1 sobre TLS 1.3 y enlazados con OpenSSL 4.1.0. Un caso se supera cuando el suscriptor recibe el mensaje que el publicador envió a través del broker, ambos clientes validan la cadena de certificados contra la CA del caso y el nombre del servidor, y las dos comprobaciones negativas se rechazan."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"resultados",children:"Resultados"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Los doce casos se superaron. En cada uno, ",e.jsx(s.code,{children:"mosquitto_sub"})," se suscribió a un tema, ",e.jsx(s.code,{children:"mosquitto_pub"})," publicó un valor único y el suscriptor lo recibió. La prueba se ejecutó dos veces por caso: una con el cliente ofreciendo todos los grupos y esquemas de firma, y otra con el cliente ofreciendo solo el grupo y el esquema de firma esperados para el caso. La segunda ejecución demuestra que el endpoint del broker negoció exactamente ese grupo y ese esquema, porque el cliente no ofrecía nada más."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Intercambio de claves ↓ / Certificado →"}),e.jsxs(s.th,{children:[e.jsx(s.strong,{children:"T"}),": ECDSA P-256"]}),e.jsxs(s.th,{children:[e.jsx(s.strong,{children:"PQ"}),": ML-DSA-65"]}),e.jsxs(s.th,{children:[e.jsx(s.strong,{children:"PQ/T"}),": ",e.jsx(s.code,{children:"MLDSA65-RSA3072-PSS-SHA512"})]})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.strong,{children:"T"})}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"X25519"}),", ",e.jsx(s.code,{children:"ecdsa_secp256r1_sha256"})]}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"X25519"}),", ",e.jsx(s.code,{children:"mldsa65"})]}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"X25519"}),", ",e.jsx(s.code,{children:"mldsa65_rsa3072_pss"})]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.strong,{children:"PQ"})}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"MLKEM1024"}),", ",e.jsx(s.code,{children:"ecdsa_secp256r1_sha256"})]}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"MLKEM1024"}),", ",e.jsx(s.code,{children:"mldsa65"})]}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"MLKEM1024"}),", ",e.jsx(s.code,{children:"mldsa65_rsa3072_pss"})]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.strong,{children:"PQ/T"})}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"X25519MLKEM768"}),", ",e.jsx(s.code,{children:"ecdsa_secp256r1_sha256"})]}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"X25519MLKEM768"}),", ",e.jsx(s.code,{children:"mldsa65"})]}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"X25519MLKEM768"}),", ",e.jsx(s.code,{children:"mldsa65_rsa3072_pss"})]})]})]})]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"Los certificados composite adicionales se comportan igual con intercambio de claves PQ/T."})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Composite adicional"}),e.jsx(s.th,{children:"Esquema de firma"}),e.jsx(s.th,{children:"Resultado"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"MLDSA44-ECDSA-P256-SHA256"})}),e.jsx(s.td,{children:e.jsx(s.code,{children:"mldsa44_ecdsa_p256"})}),e.jsx(s.td,{children:"✅"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"MLDSA65-ECDSA-P256-SHA512"})}),e.jsx(s.td,{children:e.jsx(s.code,{children:"mldsa65_ecdsa_p256"})}),e.jsx(s.td,{children:"✅"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"MLDSA65-Ed25519-SHA512"})}),e.jsx(s.td,{children:e.jsx(s.code,{children:"mldsa65_ed25519"})}),e.jsx(s.td,{children:"✅"})]})]})]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Cuando el cliente ofrecía todos los grupos salvo los de la clase del caso, o todos los esquemas de firma salvo el del certificado, el handshake TLS fallaba con una alerta ",e.jsx(s.code,{children:"handshake failure"})," y el broker nunca enviaba un ",e.jsx(s.code,{children:"CONNACK"}),". El resultado fue el mismo en los doce casos."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Con una única configuración de servidor que tiene los certificados ECDSA, ML-DSA-65 y composite y acepta las tres clases de intercambio de claves, cada una de las nueve combinaciones conectó en el puerto 8883 cuando el cliente ofrecía un grupo y un esquema de firma. ",e.jsx(s.code,{children:"mosquitto_pub"})," recibió ",e.jsx(s.code,{children:"CONNACK (0)"})," en todas."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"reproducir-un-caso",children:"Reproducir un caso"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["mosquitto no tiene opciones para elegir grupos de intercambio de claves ni esquemas de firma, así que se fijan mediante un fichero de configuración de OpenSSL que ",e.jsx(s.code,{children:"mosquitto_pub"})," y ",e.jsx(s.code,{children:"mosquitto_sub"})," leen de la variable de entorno ",e.jsx(s.code,{children:"OPENSSL_CONF"}),". Necesitas OpenSSL 3.5 o posterior; para certificados composite, además el módulo ",e.jsx(s.code,{children:"hybrid-provider"})," con puntos de código que coincidan con los del toolchain de Go PQC."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(l,{children:[e.jsxs(n,{children:[e.jsx(s.h3,{id:"crea-la-configuración-de-openssl",children:"Crea la configuración de OpenSSL"}),e.jsxs(s.p,{children:["Este ",e.jsx(s.code,{children:"pqc-client.cnf"})," hace que el cliente ofrezca solo ",e.jsx(s.code,{children:"X25519MLKEM768"})," y el esquema de firma composite, y carga el provider composite:"]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"openssl_conf"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = openssl_init"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"[openssl_init]"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"providers"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = provider_sect"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"ssl_conf"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = ssl_sect"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"[provider_sect]"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"default"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = default_sect"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"hybrid"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = hybrid_sect"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"[default_sect]"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"activate"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = 1"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"[hybrid_sect]"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"module"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = /path/to/hybrid.so"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"activate"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = 1"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"[ssl_sect]"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"system_default"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = tls_sect"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"[tls_sect]"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"MinProtocol"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = TLSv1.3"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"Groups"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = X25519MLKEM768"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"SignatureAlgorithms"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = mldsa65_rsa3072_pss"})]})]})})}),e.jsxs(s.p,{children:["Elimina el provider ",e.jsx(s.code,{children:"hybrid"})," y el módulo en un caso que use solo ML-DSA o ECDSA."]})]}),e.jsxs(n,{children:[e.jsx(s.h3,{id:"suscríbete-y-publica",children:"Suscríbete y publica"}),e.jsxs(s.p,{children:["Arranca el suscriptor en una terminal y el publicador en otra. Ambos validan el certificado del broker contra ",e.jsx(s.code,{children:"ca.pem"}),", la CA del caso:"]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"export"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" OPENSSL_CONF"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"$PWD/pqc-client.cnf"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"mosquitto_sub"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -h"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"MQTT_HOS"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"T"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -p"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" 8883"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --cafile"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.pem"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --tls-version"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" tlsv1.3"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  -t"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" pqc-test/hello"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -C"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" 1"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -W"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" 15"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"mosquitto_pub"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -h"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"MQTT_HOS"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"T"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -p"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" 8883"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --cafile"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.pem"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --tls-version"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" tlsv1.3"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  -t"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" pqc-test/hello"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -m"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:' "hello over pqc"'})]})]})})}),e.jsxs(s.p,{children:["El suscriptor imprime ",e.jsx(s.code,{children:"hello over pqc"})," y termina. Añade ",e.jsx(s.code,{children:"-d"})," para ver los paquetes ",e.jsx(s.code,{children:"CONNECT"}),", ",e.jsx(s.code,{children:"CONNACK (0)"}),", ",e.jsx(s.code,{children:"SUBACK"})," y ",e.jsx(s.code,{children:"PUBLISH"}),"."]})]}),e.jsxs(n,{children:[e.jsx(s.h3,{id:"comprueba-que-una-oferta-incorrecta-se-rechaza",children:"Comprueba que una oferta incorrecta se rechaza"}),e.jsxs(s.p,{children:["Cambia ",e.jsx(s.code,{children:"Groups"})," por una lista que no incluya el grupo que acepta el servidor, por ejemplo ",e.jsx(s.code,{children:"Groups = X25519"})," frente a un servidor configurado para ",e.jsx(s.code,{children:"MLKEM1024"}),", y repite la publicación. El cliente falla con ",e.jsx(s.code,{children:"tls alert handshake failure"})," y no se recibe ningún ",e.jsx(s.code,{children:"CONNACK"}),"."]})]})]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"qué-debes-saber",children:"Qué debes saber"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Nombre del host y certificado."})," mosquitto usa el valor de ",e.jsx(s.code,{children:"-h"})," como destino de la conexión, como nombre de servidor enviado en el handshake y como nombre que verifica. Los certificados de prueba llevan ese nombre como nombre alternativo del sujeto."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Un certificado por nombre."})," El proxy TLS guarda sus certificados por nombre, no por puerto. Un endpoint MQTT que comparte nombre con el endpoint HTTPS sirve los mismos certificados, así que da al broker su propio nombre si necesita un certificado distinto."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"No se probaron los valores por defecto sin fijar."})," Todas las ejecuciones fijaron explícitamente la oferta de grupos y firmas, así que no se comprobó qué negocia mosquitto con la oferta por defecto de OpenSSL. Las pruebas HTTPS sí cubren un cliente OpenSSL por defecto: recibe el certificado ML-DSA si el servidor lo tiene."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Otros clientes en el mismo puerto."})," Imponer TLS 1.3 o algoritmos poscuánticos en un puerto MQTT compartido afecta a todos los clientes que se conectan a él. Durante las pruebas el proxy registró intentos de conexión de otros clientes que solo admiten TLS 1.2 o anterior, o que no confiaban en el certificado. Identifícalos antes de dejar el ajuste de forma permanente."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(r,{children:[e.jsx(o,{title:"HTTPS",description:"Las mismas comprobaciones para un endpoint HTTPS de Lamassu.",href:"/docs/platform/pqc/integration-tests/https"}),e.jsx(o,{title:"Despliegue con el chart de Helm",description:"Despliega el proxy que termina el TLS.",href:"/docs/platform/pqc/deployment"})]})})]})}function m(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(c,{...i})}):c(i)}function a(i,s){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const b=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:m,frontmatter:t,lmDiff:h,structuredData:u,toc:p},Symbol.toStringTag,{value:"Module"}));export{b as _};
