import{j as e}from"./index-DqgIL_Rv.js";let o=`

<div className="lm-diff-ins lm-diff-block">
  Post-quantum certificates only help if the systems that consume them can use them. These integration tests check that clients and brokers that are not part of Lamassu, built on a different cryptographic library, can connect to a Lamassu TLS endpoint, negotiate post-quantum key exchange and verify post-quantum and composite certificates. Two protocols were tested: [HTTPS](/docs/platform/pqc/integration-tests/https) and [MQTTS](/docs/platform/pqc/integration-tests/mqtts).
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="info" title="What these tests demonstrate">
    The certificates and CAs used in the tests were generated outside Lamassu, with standard tools, to show that the [Go PQC toolchain](/docs/platform/pqc/go-toolchain) implements the X.509 and TLS formats in an interoperable way. They show that certificates created externally work with Lamassu's TLS endpoint, and that independent software verifies them. They do not test certificates issued by a Lamassu CA.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  What was tested [#what-was-tested]
</div>

<div className="lm-diff-ins lm-diff-block">
  The server is the Traefik front proxy that terminates device TLS in Lamassu ([TLS front proxy with Traefik](/docs/platform/pqc/tls-front-proxy)). It is built with the Go PQC toolchain and was configured for each test with one key exchange class and one certificate class.
</div>

<div className="lm-diff-ins lm-diff-block">
  The clients are independent implementations:
</div>

<div className="lm-diff-ins lm-diff-block">
  * **OpenSSL 4.0.3 and 4.1.0**, with the native ML-KEM and ML-DSA support of OpenSSL 3.5 and later.
  * **The OpenSSL \`hybrid-provider\` module**, for composite ML-DSA. The build used was written against draft 19 of the specification, which was later published as [RFC 10073](https://www.rfc-editor.org/rfc/rfc10073.html); the test vectors of both are identical, but the provider was not otherwise checked against the final text.
  * **\`curl\`** for HTTPS and **\`mosquitto_pub\` and \`mosquitto_sub\` 2.1.2** for MQTTS, both linked against that OpenSSL.
</div>

<div className="lm-diff-ins lm-diff-block">
  The test matrix [#the-test-matrix]
</div>

<div className="lm-diff-ins lm-diff-block">
  Each combination of key exchange and certificate was tested separately, using the families that Lamassu uses elsewhere (T, PQ and PQ/T, see [Algorithms](/docs/platform/pqc/algorithms)).
</div>

<div className="lm-diff-ins lm-diff-block">
  | Key exchange | Groups the server accepts                                   |
  | ------------ | ----------------------------------------------------------- |
  | **T**        | \`X25519\`, \`CurveP256\`, \`CurveP384\`                          |
  | **PQ**       | \`MLKEM1024\`                                                 |
  | **PQ/T**     | \`X25519MLKEM768\`, \`SecP256r1MLKEM768\`, \`SecP384r1MLKEM1024\` |
</div>

<div className="lm-diff-ins lm-diff-block">
  | Certificate | Server certificate                     |
  | ----------- | -------------------------------------- |
  | **T**       | ECDSA P-256                            |
  | **PQ**      | ML-DSA-65                              |
  | **PQ/T**    | Composite \`MLDSA65-RSA3072-PSS-SHA512\` |
</div>

<div className="lm-diff-ins lm-diff-block">
  That gives nine combinations. Three more composite certificates were tested with PQ/T key exchange: \`MLDSA44-ECDSA-P256-SHA256\`, \`MLDSA65-ECDSA-P256-SHA512\` and \`MLDSA65-Ed25519-SHA512\`, for twelve cases in total. Every certificate was issued by a test CA with the same algorithm as the certificate.
</div>

<div className="lm-diff-ins lm-diff-block">
  What each case checks [#what-each-case-checks]
</div>

<div className="lm-diff-ins lm-diff-block">
  A case passes only if all of these hold:
</div>

<div className="lm-diff-ins lm-diff-block">
  1. **Key exchange.** The group negotiated in the handshake is the one expected for the case.
  2. **Signature.** The signature scheme of the server's handshake signature is the one expected for the certificate.
  3. **Chain.** The client verifies the certificate chain against the CA of the case and the server name, with no verification error.
  4. **Application traffic.** The protocol works: an HTTP request returns \`200\`, or an MQTT message published to the broker reaches a subscriber.
  5. **Wrong key exchange is rejected.** A client that offers every group except those of the case's class fails with the TLS alert \`handshake_failure\`.
  6. **Wrong certificate scheme is rejected.** A client that offers every signature scheme except the certificate's fails with the same alert.
</div>

<div className="lm-diff-ins lm-diff-block">
  The last two checks show that the server enforces its configuration, not just that it accepts a compatible client.
</div>

<div className="lm-diff-ins lm-diff-block">
  Behaviour to expect [#behaviour-to-expect]
</div>

<div className="lm-diff-ins lm-diff-block">
  * **Composite code points had to be aligned.** The TLS signature schemes of composite algorithms use [private-use code points](/docs/platform/pqc/go-toolchain#tls-code-points). The \`hybrid-provider\` uses different values by default, so for the tests its code points were set to those of the Go PQC toolchain. A client that implements composite TLS must use the same values.
  * **Pure ML-DSA and ML-KEM need nothing extra.** They work with OpenSSL 3.5 or later as it is; only composite certificates need the provider.
  * **Some handshakes take an extra round trip.** A client sends the \`X25519MLKEM768\` key share first. When the server is configured for a class that does not include it (T and PQ), the server answers with a HelloRetryRequest and the handshake completes with the group it asks for.
  * **The client's signature preference decides the certificate.** When the server holds certificates of several classes for the same name, it serves the first one that matches the client's list of signature schemes. A default OpenSSL 3.5 or later client lists ML-DSA first, so it is served the ML-DSA certificate and must trust that CA.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="HTTPS" description="A Lamassu API endpoint tested with openssl and curl." href="/docs/platform/pqc/integration-tests/https" />

    <Card title="MQTTS" description="An MQTT broker behind the TLS front proxy, tested with mosquitto." href="/docs/platform/pqc/integration-tests/mqtts" />

    <Card title="Known limitations" description="What is not covered by these tests or by the platform." href="/docs/platform/pqc/limitations" />
  </Cards>
</div>
`,h={title:"Integration tests overview",description:"Evidence that software outside Lamassu negotiates post-quantum key exchange and verifies post-quantum and composite certificates served by Lamassu."},d={isNew:!0,changes:18,title:void 0,description:void 0},l={contents:[{heading:void 0,content:"Post-quantum certificates only help if the systems that consume them can use them. These integration tests check that clients and brokers that are not part of Lamassu, built on a different cryptographic library, can connect to a Lamassu TLS endpoint, negotiate post-quantum key exchange and verify post-quantum and composite certificates. Two protocols were tested: HTTPS and MQTTS."},{heading:void 0,content:"The certificates and CAs used in the tests were generated outside Lamassu, with standard tools, to show that the Go PQC toolchain implements the X.509 and TLS formats in an interoperable way. They show that certificates created externally work with Lamassu's TLS endpoint, and that independent software verifies them. They do not test certificates issued by a Lamassu CA."},{heading:"what-was-tested",content:"The server is the Traefik front proxy that terminates device TLS in Lamassu (TLS front proxy with Traefik). It is built with the Go PQC toolchain and was configured for each test with one key exchange class and one certificate class."},{heading:"what-was-tested",content:"The clients are independent implementations:"},{heading:"what-was-tested",content:"**OpenSSL 4.0.3 and 4.1.0**, with the native ML-KEM and ML-DSA support of OpenSSL 3.5 and later."},{heading:"what-was-tested",content:"**The OpenSSL `hybrid-provider` module**, for composite ML-DSA. The build used was written against draft 19 of the specification, which was later published as RFC 10073; the test vectors of both are identical, but the provider was not otherwise checked against the final text."},{heading:"what-was-tested",content:"**`curl`*&#x2A; for HTTPS and **`mosquitto_pub` and `mosquitto_sub` 2.1.2** for MQTTS, both linked against that OpenSSL."},{heading:"the-test-matrix",content:"Each combination of key exchange and certificate was tested separately, using the families that Lamassu uses elsewhere (T, PQ and PQ/T, see Algorithms)."},{heading:"the-test-matrix",content:"Key exchange"},{heading:"the-test-matrix",content:"Groups the server accepts"},{heading:"the-test-matrix",content:"**T**"},{heading:"the-test-matrix",content:"`X25519`, `CurveP256`, `CurveP384`"},{heading:"the-test-matrix",content:"**PQ**"},{heading:"the-test-matrix",content:"`MLKEM1024`"},{heading:"the-test-matrix",content:"**PQ/T**"},{heading:"the-test-matrix",content:"`X25519MLKEM768`, `SecP256r1MLKEM768`, `SecP384r1MLKEM1024`"},{heading:"the-test-matrix",content:"Certificate"},{heading:"the-test-matrix",content:"Server certificate"},{heading:"the-test-matrix",content:"**T**"},{heading:"the-test-matrix",content:"ECDSA P-256"},{heading:"the-test-matrix",content:"**PQ**"},{heading:"the-test-matrix",content:"ML-DSA-65"},{heading:"the-test-matrix",content:"**PQ/T**"},{heading:"the-test-matrix",content:"Composite `MLDSA65-RSA3072-PSS-SHA512`"},{heading:"the-test-matrix",content:"That gives nine combinations. Three more composite certificates were tested with PQ/T key exchange: `MLDSA44-ECDSA-P256-SHA256`, `MLDSA65-ECDSA-P256-SHA512` and `MLDSA65-Ed25519-SHA512`, for twelve cases in total. Every certificate was issued by a test CA with the same algorithm as the certificate."},{heading:"what-each-case-checks",content:"A case passes only if all of these hold:"},{heading:"what-each-case-checks",content:"**Key exchange.** The group negotiated in the handshake is the one expected for the case."},{heading:"what-each-case-checks",content:"**Signature.** The signature scheme of the server's handshake signature is the one expected for the certificate."},{heading:"what-each-case-checks",content:"**Chain.** The client verifies the certificate chain against the CA of the case and the server name, with no verification error."},{heading:"what-each-case-checks",content:"**Application traffic.** The protocol works: an HTTP request returns `200`, or an MQTT message published to the broker reaches a subscriber."},{heading:"what-each-case-checks",content:"**Wrong key exchange is rejected.** A client that offers every group except those of the case's class fails with the TLS alert `handshake_failure`."},{heading:"what-each-case-checks",content:"**Wrong certificate scheme is rejected.** A client that offers every signature scheme except the certificate's fails with the same alert."},{heading:"what-each-case-checks",content:"The last two checks show that the server enforces its configuration, not just that it accepts a compatible client."},{heading:"behaviour-to-expect",content:"**Composite code points had to be aligned.** The TLS signature schemes of composite algorithms use private-use code points. The `hybrid-provider` uses different values by default, so for the tests its code points were set to those of the Go PQC toolchain. A client that implements composite TLS must use the same values."},{heading:"behaviour-to-expect",content:"**Pure ML-DSA and ML-KEM need nothing extra.** They work with OpenSSL 3.5 or later as it is; only composite certificates need the provider."},{heading:"behaviour-to-expect",content:"**Some handshakes take an extra round trip.** A client sends the `X25519MLKEM768` key share first. When the server is configured for a class that does not include it (T and PQ), the server answers with a HelloRetryRequest and the handshake completes with the group it asks for."},{heading:"behaviour-to-expect",content:"**The client's signature preference decides the certificate.** When the server holds certificates of several classes for the same name, it serves the first one that matches the client's list of signature schemes. A default OpenSSL 3.5 or later client lists ML-DSA first, so it is served the ML-DSA certificate and must trust that CA."},{heading:"behaviour-to-expect",content:'<Card title="HTTPS" description="A Lamassu API endpoint tested with openssl and curl." href="/docs/platform/pqc/integration-tests/https" />'},{heading:"behaviour-to-expect",content:'<Card title="MQTTS" description="An MQTT broker behind the TLS front proxy, tested with mosquitto." href="/docs/platform/pqc/integration-tests/mqtts" />'},{heading:"behaviour-to-expect",content:'<Card title="Known limitations" description="What is not covered by these tests or by the platform." href="/docs/platform/pqc/limitations" />'}],headings:[{id:"what-was-tested",content:"What was tested"},{id:"the-test-matrix",content:"The test matrix"},{id:"what-each-case-checks",content:"What each case checks"},{id:"behaviour-to-expect",content:"Behaviour to expect"}]};const f=[{depth:2,url:"#what-was-tested",title:e.jsx(e.Fragment,{children:"What was tested"})},{depth:2,url:"#the-test-matrix",title:e.jsx(e.Fragment,{children:"The test matrix"})},{depth:2,url:"#what-each-case-checks",title:e.jsx(e.Fragment,{children:"What each case checks"})},{depth:2,url:"#behaviour-to-expect",title:e.jsx(e.Fragment,{children:"Behaviour to expect"})}];function c(s){const t={a:"a",code:"code",div:"div",h2:"h2",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components},{Callout:a,Card:i,Cards:r}=t;return a||n("Callout"),i||n("Card"),r||n("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:["Post-quantum certificates only help if the systems that consume them can use them. These integration tests check that clients and brokers that are not part of Lamassu, built on a different cryptographic library, can connect to a Lamassu TLS endpoint, negotiate post-quantum key exchange and verify post-quantum and composite certificates. Two protocols were tested: ",e.jsx(t.a,{href:"/docs/platform/pqc/integration-tests/https",children:"HTTPS"})," and ",e.jsx(t.a,{href:"/docs/platform/pqc/integration-tests/mqtts",children:"MQTTS"}),"."]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a,{type:"info",title:"What these tests demonstrate",children:e.jsxs(t.p,{children:["The certificates and CAs used in the tests were generated outside Lamassu, with standard tools, to show that the ",e.jsx(t.a,{href:"/docs/platform/pqc/go-toolchain",children:"Go PQC toolchain"})," implements the X.509 and TLS formats in an interoperable way. They show that certificates created externally work with Lamassu's TLS endpoint, and that independent software verifies them. They do not test certificates issued by a Lamassu CA."]})})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h2,{id:"what-was-tested",children:"What was tested"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:["The server is the Traefik front proxy that terminates device TLS in Lamassu (",e.jsx(t.a,{href:"/docs/platform/pqc/tls-front-proxy",children:"TLS front proxy with Traefik"}),"). It is built with the Go PQC toolchain and was configured for each test with one key exchange class and one certificate class."]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"The clients are independent implementations:"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"OpenSSL 4.0.3 and 4.1.0"}),", with the native ML-KEM and ML-DSA support of OpenSSL 3.5 and later."]}),`
`,e.jsxs(t.li,{children:[e.jsxs(t.strong,{children:["The OpenSSL ",e.jsx(t.code,{children:"hybrid-provider"})," module"]}),", for composite ML-DSA. The build used was written against draft 19 of the specification, which was later published as ",e.jsx(t.a,{href:"https://www.rfc-editor.org/rfc/rfc10073.html",children:"RFC 10073"}),"; the test vectors of both are identical, but the provider was not otherwise checked against the final text."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"curl"})})," for HTTPS and ",e.jsxs(t.strong,{children:[e.jsx(t.code,{children:"mosquitto_pub"})," and ",e.jsx(t.code,{children:"mosquitto_sub"})," 2.1.2"]})," for MQTTS, both linked against that OpenSSL."]}),`
`]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h2,{id:"the-test-matrix",children:"The test matrix"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:["Each combination of key exchange and certificate was tested separately, using the families that Lamassu uses elsewhere (T, PQ and PQ/T, see ",e.jsx(t.a,{href:"/docs/platform/pqc/algorithms",children:"Algorithms"}),")."]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Key exchange"}),e.jsx(t.th,{children:"Groups the server accepts"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"T"})}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"X25519"}),", ",e.jsx(t.code,{children:"CurveP256"}),", ",e.jsx(t.code,{children:"CurveP384"})]})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"PQ"})}),e.jsx(t.td,{children:e.jsx(t.code,{children:"MLKEM1024"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"PQ/T"})}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"X25519MLKEM768"}),", ",e.jsx(t.code,{children:"SecP256r1MLKEM768"}),", ",e.jsx(t.code,{children:"SecP384r1MLKEM1024"})]})]})]})]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Certificate"}),e.jsx(t.th,{children:"Server certificate"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"T"})}),e.jsx(t.td,{children:"ECDSA P-256"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"PQ"})}),e.jsx(t.td,{children:"ML-DSA-65"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"PQ/T"})}),e.jsxs(t.td,{children:["Composite ",e.jsx(t.code,{children:"MLDSA65-RSA3072-PSS-SHA512"})]})]})]})]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:["That gives nine combinations. Three more composite certificates were tested with PQ/T key exchange: ",e.jsx(t.code,{children:"MLDSA44-ECDSA-P256-SHA256"}),", ",e.jsx(t.code,{children:"MLDSA65-ECDSA-P256-SHA512"})," and ",e.jsx(t.code,{children:"MLDSA65-Ed25519-SHA512"}),", for twelve cases in total. Every certificate was issued by a test CA with the same algorithm as the certificate."]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h2,{id:"what-each-case-checks",children:"What each case checks"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"A case passes only if all of these hold:"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Key exchange."})," The group negotiated in the handshake is the one expected for the case."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Signature."})," The signature scheme of the server's handshake signature is the one expected for the certificate."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Chain."})," The client verifies the certificate chain against the CA of the case and the server name, with no verification error."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Application traffic."})," The protocol works: an HTTP request returns ",e.jsx(t.code,{children:"200"}),", or an MQTT message published to the broker reaches a subscriber."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Wrong key exchange is rejected."})," A client that offers every group except those of the case's class fails with the TLS alert ",e.jsx(t.code,{children:"handshake_failure"}),"."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Wrong certificate scheme is rejected."})," A client that offers every signature scheme except the certificate's fails with the same alert."]}),`
`]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"The last two checks show that the server enforces its configuration, not just that it accepts a compatible client."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h2,{id:"behaviour-to-expect",children:"Behaviour to expect"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Composite code points had to be aligned."})," The TLS signature schemes of composite algorithms use ",e.jsx(t.a,{href:"/docs/platform/pqc/go-toolchain#tls-code-points",children:"private-use code points"}),". The ",e.jsx(t.code,{children:"hybrid-provider"})," uses different values by default, so for the tests its code points were set to those of the Go PQC toolchain. A client that implements composite TLS must use the same values."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Pure ML-DSA and ML-KEM need nothing extra."})," They work with OpenSSL 3.5 or later as it is; only composite certificates need the provider."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Some handshakes take an extra round trip."})," A client sends the ",e.jsx(t.code,{children:"X25519MLKEM768"})," key share first. When the server is configured for a class that does not include it (T and PQ), the server answers with a HelloRetryRequest and the handshake completes with the group it asks for."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"The client's signature preference decides the certificate."})," When the server holds certificates of several classes for the same name, it serves the first one that matches the client's list of signature schemes. A default OpenSSL 3.5 or later client lists ML-DSA first, so it is served the ML-DSA certificate and must trust that CA."]}),`
`]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(r,{children:[e.jsx(i,{title:"HTTPS",description:"A Lamassu API endpoint tested with openssl and curl.",href:"/docs/platform/pqc/integration-tests/https"}),e.jsx(i,{title:"MQTTS",description:"An MQTT broker behind the TLS front proxy, tested with mosquitto.",href:"/docs/platform/pqc/integration-tests/mqtts"}),e.jsx(i,{title:"Known limitations",description:"What is not covered by these tests or by the platform.",href:"/docs/platform/pqc/limitations"})]})})]})}function m(s={}){const{wrapper:t}=s.components||{};return t?e.jsx(t,{...s,children:e.jsx(c,{...s})}):c(s)}function n(s,t){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,_markdown:o,default:m,frontmatter:h,lmDiff:d,structuredData:l,toc:f},Symbol.toStringTag,{value:"Module"}));export{u as _};
