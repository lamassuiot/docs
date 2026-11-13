import{j as e}from"./index-DqgIL_Rv.js";let d=`

<div className="lm-diff-ins lm-diff-block">
  This test connects \`mosquitto_pub\` and \`mosquitto_sub\` to an MQTT broker over TLS and checks that messages travel through it with post-quantum key exchange and post-quantum or composite server certificates. The [overview](/docs/platform/pqc/integration-tests/overview) explains the clients, the test matrix and what each check proves.
</div>

<div className="lm-diff-ins lm-diff-block">
  Scenario [#scenario]
</div>

<div className="lm-diff-ins lm-diff-block">
  The broker is EMQX 5.8.9. It listens for MQTT in clear text inside the cluster, and the Lamassu TLS front proxy ([TLS front proxy with Traefik](/docs/platform/pqc/tls-front-proxy)) terminates TLS for it on port 8883 and forwards the traffic. The TLS is one-way: the broker's endpoint presents its certificate, and the client presents none. The server certificate and its CA were created outside Lamassu, and the proxy was configured for each case with the key exchange groups and certificate of that row and column of the matrix.
</div>

<div className="lm-diff-ins lm-diff-block">
  The clients are \`mosquitto_pub\` and \`mosquitto_sub\` 2.1.2, using MQTT 3.1.1 over TLS 1.3 and linked against OpenSSL 4.1.0. A case passes when the subscriber receives the message that the publisher sent through the broker, both clients validate the certificate chain against the CA of the case and the server name, and the two negative checks are rejected.
</div>

<div className="lm-diff-ins lm-diff-block">
  Results [#results]
</div>

<div className="lm-diff-ins lm-diff-block">
  All twelve cases passed. In each one, \`mosquitto_sub\` subscribed to a topic, \`mosquitto_pub\` published a unique value, and the subscriber received it. The test ran twice per case: once with the client offering every group and signature scheme, and once with the client offering only the group and the signature scheme expected for the case. The second run shows that the broker's endpoint negotiated exactly that group and scheme, because the client offered nothing else.
</div>

<div className="lm-diff-ins lm-diff-block">
  | Key exchange ↓ / Certificate → | **T**: ECDSA P-256                           | **PQ**: ML-DSA-65             | **PQ/T**: \`MLDSA65-RSA3072-PSS-SHA512\`    |
  | ------------------------------ | -------------------------------------------- | ----------------------------- | ----------------------------------------- |
  | **T**                          | ✅ \`X25519\`, \`ecdsa_secp256r1_sha256\`         | ✅ \`X25519\`, \`mldsa65\`         | ✅ \`X25519\`, \`mldsa65_rsa3072_pss\`         |
  | **PQ**                         | ✅ \`MLKEM1024\`, \`ecdsa_secp256r1_sha256\`      | ✅ \`MLKEM1024\`, \`mldsa65\`      | ✅ \`MLKEM1024\`, \`mldsa65_rsa3072_pss\`      |
  | **PQ/T**                       | ✅ \`X25519MLKEM768\`, \`ecdsa_secp256r1_sha256\` | ✅ \`X25519MLKEM768\`, \`mldsa65\` | ✅ \`X25519MLKEM768\`, \`mldsa65_rsa3072_pss\` |
</div>

<div className="lm-diff-ins lm-diff-block">
  The additional composite certificates behave the same way with PQ/T key exchange.
</div>

<div className="lm-diff-ins lm-diff-block">
  | Additional composite        | Signature scheme     | Result |
  | --------------------------- | -------------------- | ------ |
  | \`MLDSA44-ECDSA-P256-SHA256\` | \`mldsa44_ecdsa_p256\` | ✅      |
  | \`MLDSA65-ECDSA-P256-SHA512\` | \`mldsa65_ecdsa_p256\` | ✅      |
  | \`MLDSA65-Ed25519-SHA512\`    | \`mldsa65_ed25519\`    | ✅      |
</div>

<div className="lm-diff-ins lm-diff-block">
  When the client offered every group except those of the case, or every signature scheme except the certificate's, the TLS handshake failed with a \`handshake failure\` alert and the broker never sent a \`CONNACK\`. The same result held in all twelve cases.
</div>

<div className="lm-diff-ins lm-diff-block">
  With a single server configuration that holds the ECDSA, ML-DSA-65 and composite certificates and accepts all three key exchange classes, each of the nine combinations connected on port 8883 when the client offered one group and one signature scheme. \`mosquitto_pub\` received \`CONNACK (0)\` every time.
</div>

<div className="lm-diff-ins lm-diff-block">
  Reproduce a case [#reproduce-a-case]
</div>

<div className="lm-diff-ins lm-diff-block">
  mosquitto has no options to choose key exchange groups or signature schemes, so they are set through an OpenSSL configuration file that \`mosquitto_pub\` and \`mosquitto_sub\` read from the \`OPENSSL_CONF\` environment variable. You need OpenSSL 3.5 or later; for composite certificates, also the \`hybrid-provider\` module with code points that match the Go PQC toolchain.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Steps>
    <Step>
      Create the OpenSSL configuration [#create-the-openssl-configuration]

      This \`pqc-client.cnf\` makes the client offer only \`X25519MLKEM768\` and the composite signature scheme, and loads the composite provider:

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

      Remove the \`hybrid\` provider and the module for a case that uses ML-DSA or ECDSA only.
    </Step>

    <Step>
      Subscribe and publish [#subscribe-and-publish]

      Start the subscriber in one terminal and the publisher in another. Both validate the broker's certificate against \`ca.pem\`, the CA of the case:

      \`\`\`bash
      export OPENSSL_CONF=$PWD/pqc-client.cnf

      mosquitto_sub -h <MQTT_HOST> -p 8883 --cafile ca.pem --tls-version tlsv1.3 \\
        -t pqc-test/hello -C 1 -W 15

      mosquitto_pub -h <MQTT_HOST> -p 8883 --cafile ca.pem --tls-version tlsv1.3 \\
        -t pqc-test/hello -m "hello over pqc"
      \`\`\`

      The subscriber prints \`hello over pqc\` and exits. Add \`-d\` to see the \`CONNECT\`, \`CONNACK (0)\`, \`SUBACK\` and \`PUBLISH\` packets.
    </Step>

    <Step>
      Check that a wrong offer is rejected [#check-that-a-wrong-offer-is-rejected]

      Change \`Groups\` to a list that does not include the group the server accepts, for example \`Groups = X25519\` against a server configured for \`MLKEM1024\`, and repeat the publish. The client fails with \`tls alert handshake failure\` and no \`CONNACK\` is received.
    </Step>
  </Steps>
</div>

<div className="lm-diff-ins lm-diff-block">
  Things to know [#things-to-know]
</div>

<div className="lm-diff-ins lm-diff-block">
  * **Hostname and certificate.** mosquitto uses the \`-h\` value as the connection target, the server name sent in the handshake and the name it verifies. The test certificates carry that name as a subject alternative name.
  * **One certificate per name.** The front proxy keeps its certificates by name, not by port. An MQTT endpoint that shares its name with the HTTPS endpoint serves the same certificates, so give the broker its own name if it needs a different certificate.
  * **Unpinned defaults were not tested.** Every run set the group and signature offer explicitly, so what mosquitto negotiates with the default OpenSSL offer was not checked in this test. The HTTPS tests do cover a default OpenSSL client: it is served the ML-DSA certificate if the server holds one.
  * **Other clients on the same port.** Enforcing TLS 1.3 or post-quantum algorithms on a shared MQTT port affects every client that connects to it. During the tests the proxy logged connection attempts from other clients that only support TLS 1.2 or earlier, or that did not trust the certificate. Identify them before making the setting permanent.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="HTTPS" description="The same checks for a Lamassu HTTPS endpoint." href="/docs/platform/pqc/integration-tests/https" />

    <Card title="Deployment with the Helm chart" description="Deploy the front proxy that terminates the TLS." href="/docs/platform/pqc/deployment" />
  </Cards>
</div>
`,l={title:"MQTTS integration tests",description:"Results of testing an MQTT broker behind the Lamassu TLS front proxy with mosquitto, using post-quantum key exchange and post-quantum and composite certificates."},o={isNew:!0,changes:17,title:void 0,description:void 0},p={contents:[{heading:void 0,content:"This test connects `mosquitto_pub` and `mosquitto_sub` to an MQTT broker over TLS and checks that messages travel through it with post-quantum key exchange and post-quantum or composite server certificates. The overview explains the clients, the test matrix and what each check proves."},{heading:"scenario",content:"The broker is EMQX 5.8.9. It listens for MQTT in clear text inside the cluster, and the Lamassu TLS front proxy (TLS front proxy with Traefik) terminates TLS for it on port 8883 and forwards the traffic. The TLS is one-way: the broker's endpoint presents its certificate, and the client presents none. The server certificate and its CA were created outside Lamassu, and the proxy was configured for each case with the key exchange groups and certificate of that row and column of the matrix."},{heading:"scenario",content:"The clients are `mosquitto_pub` and `mosquitto_sub` 2.1.2, using MQTT 3.1.1 over TLS 1.3 and linked against OpenSSL 4.1.0. A case passes when the subscriber receives the message that the publisher sent through the broker, both clients validate the certificate chain against the CA of the case and the server name, and the two negative checks are rejected."},{heading:"results",content:"All twelve cases passed. In each one, `mosquitto_sub` subscribed to a topic, `mosquitto_pub` published a unique value, and the subscriber received it. The test ran twice per case: once with the client offering every group and signature scheme, and once with the client offering only the group and the signature scheme expected for the case. The second run shows that the broker's endpoint negotiated exactly that group and scheme, because the client offered nothing else."},{heading:"results",content:"Key exchange ↓ / Certificate →"},{heading:"results",content:"**T**: ECDSA P-256"},{heading:"results",content:"**PQ**: ML-DSA-65"},{heading:"results",content:"**PQ/T**: `MLDSA65-RSA3072-PSS-SHA512`"},{heading:"results",content:"**T**"},{heading:"results",content:"✅ `X25519`, `ecdsa_secp256r1_sha256`"},{heading:"results",content:"✅ `X25519`, `mldsa65`"},{heading:"results",content:"✅ `X25519`, `mldsa65_rsa3072_pss`"},{heading:"results",content:"**PQ**"},{heading:"results",content:"✅ `MLKEM1024`, `ecdsa_secp256r1_sha256`"},{heading:"results",content:"✅ `MLKEM1024`, `mldsa65`"},{heading:"results",content:"✅ `MLKEM1024`, `mldsa65_rsa3072_pss`"},{heading:"results",content:"**PQ/T**"},{heading:"results",content:"✅ `X25519MLKEM768`, `ecdsa_secp256r1_sha256`"},{heading:"results",content:"✅ `X25519MLKEM768`, `mldsa65`"},{heading:"results",content:"✅ `X25519MLKEM768`, `mldsa65_rsa3072_pss`"},{heading:"results",content:"The additional composite certificates behave the same way with PQ/T key exchange."},{heading:"results",content:"Additional composite"},{heading:"results",content:"Signature scheme"},{heading:"results",content:"Result"},{heading:"results",content:"`MLDSA44-ECDSA-P256-SHA256`"},{heading:"results",content:"`mldsa44_ecdsa_p256`"},{heading:"results",content:"✅"},{heading:"results",content:"`MLDSA65-ECDSA-P256-SHA512`"},{heading:"results",content:"`mldsa65_ecdsa_p256`"},{heading:"results",content:"✅"},{heading:"results",content:"`MLDSA65-Ed25519-SHA512`"},{heading:"results",content:"`mldsa65_ed25519`"},{heading:"results",content:"✅"},{heading:"results",content:"When the client offered every group except those of the case, or every signature scheme except the certificate's, the TLS handshake failed with a `handshake failure` alert and the broker never sent a `CONNACK`. The same result held in all twelve cases."},{heading:"results",content:"With a single server configuration that holds the ECDSA, ML-DSA-65 and composite certificates and accepts all three key exchange classes, each of the nine combinations connected on port 8883 when the client offered one group and one signature scheme. `mosquitto_pub` received `CONNACK (0)` every time."},{heading:"reproduce-a-case",content:"mosquitto has no options to choose key exchange groups or signature schemes, so they are set through an OpenSSL configuration file that `mosquitto_pub` and `mosquitto_sub` read from the `OPENSSL_CONF` environment variable. You need OpenSSL 3.5 or later; for composite certificates, also the `hybrid-provider` module with code points that match the Go PQC toolchain."},{heading:"create-the-openssl-configuration",content:"This `pqc-client.cnf` makes the client offer only `X25519MLKEM768` and the composite signature scheme, and loads the composite provider:"},{heading:"create-the-openssl-configuration",content:"Remove the `hybrid` provider and the module for a case that uses ML-DSA or ECDSA only."},{heading:"subscribe-and-publish",content:"Start the subscriber in one terminal and the publisher in another. Both validate the broker's certificate against `ca.pem`, the CA of the case:"},{heading:"subscribe-and-publish",content:"The subscriber prints `hello over pqc` and exits. Add `-d` to see the `CONNECT`, `CONNACK (0)`, `SUBACK` and `PUBLISH` packets."},{heading:"check-that-a-wrong-offer-is-rejected",content:"Change `Groups` to a list that does not include the group the server accepts, for example `Groups = X25519` against a server configured for `MLKEM1024`, and repeat the publish. The client fails with `tls alert handshake failure` and no `CONNACK` is received."},{heading:"things-to-know",content:"**Hostname and certificate.** mosquitto uses the `-h` value as the connection target, the server name sent in the handshake and the name it verifies. The test certificates carry that name as a subject alternative name."},{heading:"things-to-know",content:"**One certificate per name.** The front proxy keeps its certificates by name, not by port. An MQTT endpoint that shares its name with the HTTPS endpoint serves the same certificates, so give the broker its own name if it needs a different certificate."},{heading:"things-to-know",content:"**Unpinned defaults were not tested.** Every run set the group and signature offer explicitly, so what mosquitto negotiates with the default OpenSSL offer was not checked in this test. The HTTPS tests do cover a default OpenSSL client: it is served the ML-DSA certificate if the server holds one."},{heading:"things-to-know",content:"**Other clients on the same port.** Enforcing TLS 1.3 or post-quantum algorithms on a shared MQTT port affects every client that connects to it. During the tests the proxy logged connection attempts from other clients that only support TLS 1.2 or earlier, or that did not trust the certificate. Identify them before making the setting permanent."},{heading:"things-to-know",content:'<Card title="HTTPS" description="The same checks for a Lamassu HTTPS endpoint." href="/docs/platform/pqc/integration-tests/https" />'},{heading:"things-to-know",content:'<Card title="Deployment with the Helm chart" description="Deploy the front proxy that terminates the TLS." href="/docs/platform/pqc/deployment" />'}],headings:[{id:"scenario",content:"Scenario"},{id:"results",content:"Results"},{id:"reproduce-a-case",content:"Reproduce a case"},{id:"create-the-openssl-configuration",content:"Create the OpenSSL configuration"},{id:"subscribe-and-publish",content:"Subscribe and publish"},{id:"check-that-a-wrong-offer-is-rejected",content:"Check that a wrong offer is rejected"},{id:"things-to-know",content:"Things to know"}]};const f=[{depth:2,url:"#scenario",title:e.jsx(e.Fragment,{children:"Scenario"})},{depth:2,url:"#results",title:e.jsx(e.Fragment,{children:"Results"})},{depth:2,url:"#reproduce-a-case",title:e.jsx(e.Fragment,{children:"Reproduce a case"})},{depth:3,url:"#create-the-openssl-configuration",title:e.jsx(e.Fragment,{children:"Create the OpenSSL configuration"})},{depth:3,url:"#subscribe-and-publish",title:e.jsx(e.Fragment,{children:"Subscribe and publish"})},{depth:3,url:"#check-that-a-wrong-offer-is-rejected",title:e.jsx(e.Fragment,{children:"Check that a wrong offer is rejected"})},{depth:2,url:"#things-to-know",title:e.jsx(e.Fragment,{children:"Things to know"})}];function c(t){const s={a:"a",code:"code",div:"div",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components},{Card:a,Cards:r,Step:i,Steps:h}=s;return a||n("Card"),r||n("Cards"),i||n("Step"),h||n("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["This test connects ",e.jsx(s.code,{children:"mosquitto_pub"})," and ",e.jsx(s.code,{children:"mosquitto_sub"})," to an MQTT broker over TLS and checks that messages travel through it with post-quantum key exchange and post-quantum or composite server certificates. The ",e.jsx(s.a,{href:"/docs/platform/pqc/integration-tests/overview",children:"overview"})," explains the clients, the test matrix and what each check proves."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"scenario",children:"Scenario"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["The broker is EMQX 5.8.9. It listens for MQTT in clear text inside the cluster, and the Lamassu TLS front proxy (",e.jsx(s.a,{href:"/docs/platform/pqc/tls-front-proxy",children:"TLS front proxy with Traefik"}),") terminates TLS for it on port 8883 and forwards the traffic. The TLS is one-way: the broker's endpoint presents its certificate, and the client presents none. The server certificate and its CA were created outside Lamassu, and the proxy was configured for each case with the key exchange groups and certificate of that row and column of the matrix."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["The clients are ",e.jsx(s.code,{children:"mosquitto_pub"})," and ",e.jsx(s.code,{children:"mosquitto_sub"})," 2.1.2, using MQTT 3.1.1 over TLS 1.3 and linked against OpenSSL 4.1.0. A case passes when the subscriber receives the message that the publisher sent through the broker, both clients validate the certificate chain against the CA of the case and the server name, and the two negative checks are rejected."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"results",children:"Results"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["All twelve cases passed. In each one, ",e.jsx(s.code,{children:"mosquitto_sub"})," subscribed to a topic, ",e.jsx(s.code,{children:"mosquitto_pub"})," published a unique value, and the subscriber received it. The test ran twice per case: once with the client offering every group and signature scheme, and once with the client offering only the group and the signature scheme expected for the case. The second run shows that the broker's endpoint negotiated exactly that group and scheme, because the client offered nothing else."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Key exchange ↓ / Certificate →"}),e.jsxs(s.th,{children:[e.jsx(s.strong,{children:"T"}),": ECDSA P-256"]}),e.jsxs(s.th,{children:[e.jsx(s.strong,{children:"PQ"}),": ML-DSA-65"]}),e.jsxs(s.th,{children:[e.jsx(s.strong,{children:"PQ/T"}),": ",e.jsx(s.code,{children:"MLDSA65-RSA3072-PSS-SHA512"})]})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.strong,{children:"T"})}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"X25519"}),", ",e.jsx(s.code,{children:"ecdsa_secp256r1_sha256"})]}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"X25519"}),", ",e.jsx(s.code,{children:"mldsa65"})]}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"X25519"}),", ",e.jsx(s.code,{children:"mldsa65_rsa3072_pss"})]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.strong,{children:"PQ"})}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"MLKEM1024"}),", ",e.jsx(s.code,{children:"ecdsa_secp256r1_sha256"})]}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"MLKEM1024"}),", ",e.jsx(s.code,{children:"mldsa65"})]}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"MLKEM1024"}),", ",e.jsx(s.code,{children:"mldsa65_rsa3072_pss"})]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.strong,{children:"PQ/T"})}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"X25519MLKEM768"}),", ",e.jsx(s.code,{children:"ecdsa_secp256r1_sha256"})]}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"X25519MLKEM768"}),", ",e.jsx(s.code,{children:"mldsa65"})]}),e.jsxs(s.td,{children:["✅ ",e.jsx(s.code,{children:"X25519MLKEM768"}),", ",e.jsx(s.code,{children:"mldsa65_rsa3072_pss"})]})]})]})]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"The additional composite certificates behave the same way with PQ/T key exchange."})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Additional composite"}),e.jsx(s.th,{children:"Signature scheme"}),e.jsx(s.th,{children:"Result"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"MLDSA44-ECDSA-P256-SHA256"})}),e.jsx(s.td,{children:e.jsx(s.code,{children:"mldsa44_ecdsa_p256"})}),e.jsx(s.td,{children:"✅"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"MLDSA65-ECDSA-P256-SHA512"})}),e.jsx(s.td,{children:e.jsx(s.code,{children:"mldsa65_ecdsa_p256"})}),e.jsx(s.td,{children:"✅"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"MLDSA65-Ed25519-SHA512"})}),e.jsx(s.td,{children:e.jsx(s.code,{children:"mldsa65_ed25519"})}),e.jsx(s.td,{children:"✅"})]})]})]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["When the client offered every group except those of the case, or every signature scheme except the certificate's, the TLS handshake failed with a ",e.jsx(s.code,{children:"handshake failure"})," alert and the broker never sent a ",e.jsx(s.code,{children:"CONNACK"}),". The same result held in all twelve cases."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["With a single server configuration that holds the ECDSA, ML-DSA-65 and composite certificates and accepts all three key exchange classes, each of the nine combinations connected on port 8883 when the client offered one group and one signature scheme. ",e.jsx(s.code,{children:"mosquitto_pub"})," received ",e.jsx(s.code,{children:"CONNACK (0)"})," every time."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"reproduce-a-case",children:"Reproduce a case"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["mosquitto has no options to choose key exchange groups or signature schemes, so they are set through an OpenSSL configuration file that ",e.jsx(s.code,{children:"mosquitto_pub"})," and ",e.jsx(s.code,{children:"mosquitto_sub"})," read from the ",e.jsx(s.code,{children:"OPENSSL_CONF"})," environment variable. You need OpenSSL 3.5 or later; for composite certificates, also the ",e.jsx(s.code,{children:"hybrid-provider"})," module with code points that match the Go PQC toolchain."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(h,{children:[e.jsxs(i,{children:[e.jsx(s.h3,{id:"create-the-openssl-configuration",children:"Create the OpenSSL configuration"}),e.jsxs(s.p,{children:["This ",e.jsx(s.code,{children:"pqc-client.cnf"})," makes the client offer only ",e.jsx(s.code,{children:"X25519MLKEM768"})," and the composite signature scheme, and loads the composite provider:"]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"openssl_conf"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = openssl_init"})]}),`
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
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"SignatureAlgorithms"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" = mldsa65_rsa3072_pss"})]})]})})}),e.jsxs(s.p,{children:["Remove the ",e.jsx(s.code,{children:"hybrid"})," provider and the module for a case that uses ML-DSA or ECDSA only."]})]}),e.jsxs(i,{children:[e.jsx(s.h3,{id:"subscribe-and-publish",children:"Subscribe and publish"}),e.jsxs(s.p,{children:["Start the subscriber in one terminal and the publisher in another. Both validate the broker's certificate against ",e.jsx(s.code,{children:"ca.pem"}),", the CA of the case:"]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"export"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" OPENSSL_CONF"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"$PWD/pqc-client.cnf"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"mosquitto_sub"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -h"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"MQTT_HOS"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"T"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -p"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" 8883"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --cafile"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.pem"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --tls-version"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" tlsv1.3"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  -t"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" pqc-test/hello"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -C"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" 1"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -W"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" 15"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"mosquitto_pub"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -h"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"MQTT_HOS"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"T"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -p"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" 8883"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --cafile"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.pem"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --tls-version"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" tlsv1.3"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  -t"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" pqc-test/hello"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -m"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:' "hello over pqc"'})]})]})})}),e.jsxs(s.p,{children:["The subscriber prints ",e.jsx(s.code,{children:"hello over pqc"})," and exits. Add ",e.jsx(s.code,{children:"-d"})," to see the ",e.jsx(s.code,{children:"CONNECT"}),", ",e.jsx(s.code,{children:"CONNACK (0)"}),", ",e.jsx(s.code,{children:"SUBACK"})," and ",e.jsx(s.code,{children:"PUBLISH"})," packets."]})]}),e.jsxs(i,{children:[e.jsx(s.h3,{id:"check-that-a-wrong-offer-is-rejected",children:"Check that a wrong offer is rejected"}),e.jsxs(s.p,{children:["Change ",e.jsx(s.code,{children:"Groups"})," to a list that does not include the group the server accepts, for example ",e.jsx(s.code,{children:"Groups = X25519"})," against a server configured for ",e.jsx(s.code,{children:"MLKEM1024"}),", and repeat the publish. The client fails with ",e.jsx(s.code,{children:"tls alert handshake failure"})," and no ",e.jsx(s.code,{children:"CONNACK"})," is received."]})]})]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"things-to-know",children:"Things to know"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Hostname and certificate."})," mosquitto uses the ",e.jsx(s.code,{children:"-h"})," value as the connection target, the server name sent in the handshake and the name it verifies. The test certificates carry that name as a subject alternative name."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"One certificate per name."})," The front proxy keeps its certificates by name, not by port. An MQTT endpoint that shares its name with the HTTPS endpoint serves the same certificates, so give the broker its own name if it needs a different certificate."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Unpinned defaults were not tested."})," Every run set the group and signature offer explicitly, so what mosquitto negotiates with the default OpenSSL offer was not checked in this test. The HTTPS tests do cover a default OpenSSL client: it is served the ML-DSA certificate if the server holds one."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Other clients on the same port."})," Enforcing TLS 1.3 or post-quantum algorithms on a shared MQTT port affects every client that connects to it. During the tests the proxy logged connection attempts from other clients that only support TLS 1.2 or earlier, or that did not trust the certificate. Identify them before making the setting permanent."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(r,{children:[e.jsx(a,{title:"HTTPS",description:"The same checks for a Lamassu HTTPS endpoint.",href:"/docs/platform/pqc/integration-tests/https"}),e.jsx(a,{title:"Deployment with the Helm chart",description:"Deploy the front proxy that terminates the TLS.",href:"/docs/platform/pqc/deployment"})]})})]})}function m(t={}){const{wrapper:s}=t.components||{};return s?e.jsx(s,{...t,children:e.jsx(c,{...t})}):c(t)}function n(t,s){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}const k=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:m,frontmatter:l,lmDiff:o,structuredData:p,toc:f},Symbol.toStringTag,{value:"Module"}));export{k as _};
