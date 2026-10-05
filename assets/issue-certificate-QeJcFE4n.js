import{j as e}from"./index-prc0XQdj.js";let c=`

You will issue an end-entity certificate for \`device-001\` using browser key and CSR generation. The result is \`device.crt\`, \`device.key\` and the issuing root's public certificate, \`ca.pem\`.

Before you begin [#before-you-begin]

* An active root CA with an available signing key and permission to issue. If one does not exist yet, follow [Create your first CA](/docs/platform/pki/quickstarts/create-certificate-authority).
* Its public certificate in \`ca.pem\`; this example uses the root created in the previous path.
* OpenSSL 3.x and a working directory with restricted access.
* A client identifier: here we use \`device-001\`.

<Callout type="warn" title="Keep the key before closing the result">
  In this flow, the client's key is generated in the browser and must be downloaded when issuance finishes. If you lose it, you must generate a key and issue another certificate. The certificate inventory lets you download the public certificate, but cannot recover this key.
</Callout>

<Steps>
  <Step>
    Start the issuance [#start-the-issuance]

    Open the CA from the previous path, go to **Issued Certificates** and select **Issue New**.
  </Step>

  <Step>
    Choose the method [#choose-the-method]

    Select **Generate Key & CSR in Browser** to follow this example.

    If the key must be generated and kept on the destination system, use **Upload Existing CSR**, described in the [authorities guide](/docs/platform/pki/certificate-authorities#issue-certificates).
  </Step>

  <Step>
    Identify the certificate [#identify-the-certificate]

    Enter \`device-001\` as the \`Common Name\`. Add subject details required by your policy and SANs if the consumer uses them to identify the client.

    If you continue with manual registration, the \`Device ID\` will be exactly \`device-001\`.
  </Step>

  <Step>
    Configure key and uses [#configure-key-and-uses]

    Choose an algorithm and size allowed by the profile; for example, ECDSA P-256 if permitted. For this client certificate, select **Digital Signature** and **Client Authentication**, and issue it as an end-entity certificate.

    Request, for example, 30 days of validity, always within the CA's lifetime. Review the [issuance profile](/docs/platform/pki/certificate-profiles) if the resulting content differs from the request.
  </Step>

  <Step>
    Issue and download [#issue-and-download]

    Confirm issuance. Save the PEM certificate as \`device.crt\` and the private key as \`device.key\` in your prepared directory.
  </Step>

  <Step>
    Verify the result [#verify-the-result]

    Check in **Issued Certificates** that the certificate appears active. Note its serial number and verify the downloaded material using the checks below.
  </Step>
</Steps>

Inspect content and dates [#inspect-content-and-dates]

\`\`\`bash
openssl x509 -in device.crt -noout -subject -issuer -serial -dates
openssl x509 -in device.crt -noout -text
\`\`\`

Check \`CN=device-001\`, the expected issuer, current validity, **Digital Signature** and the extended usage **TLS Web Client Authentication**. It must be an end-entity certificate: it must not declare \`CA:TRUE\` or enable **Certificate Sign**. If **Basic Constraints** is present, it must indicate \`CA:FALSE\`. If you requested SANs, check that the expected identifiers appear in the certificate.

Verify the chain [#verify-the-chain]

\`\`\`bash
openssl verify -CAfile ca.pem -purpose sslclient device.crt
\`\`\`

The expected result is \`device.crt: OK\`. This check uses your explicit root and evaluates the chain, dates and compatibility with the TLS client purpose. Also check for the expected usages and names through the inspection above.

If you use an intermediate CA, the trusted root must be in \`ca.pem\` and you must supply the intermediates with \`-untrusted intermediates.pem\`. This variant is covered in the [trust model](/docs/platform/pki/concepts/trust-model).

The command does not query OCSP or CRL. For revocation checks, continue with [Certificate validation](/docs/platform/pki/certificate-validation). See the [openssl-verify reference](https://docs.openssl.org/3.6/man1/openssl-verify/) for its options.

Check that the key matches [#check-that-the-key-matches]

In Bash, compare the two public-key digests:

\`\`\`bash
(
  set -e -o pipefail
  openssl x509 -in device.crt -pubkey -noout \\
    | openssl pkey -pubin -outform DER \\
    | openssl dgst -sha256

  openssl pkey -in device.key -pubout -outform DER \\
    | openssl dgst -sha256
)
\`\`\`

Both commands must finish successfully and show the same SHA-256 digest. If they differ, the private key does not match the selected certificate. Find the correct pair before installing it.

The options used are documented in [openssl-x509](https://docs.openssl.org/3.6/man1/openssl-x509/) and [openssl-pkey](https://docs.openssl.org/3.6/man1/openssl-pkey/).

If the result fails [#if-the-result-fails]

| Result                      | What to review                                        |
| --------------------------- | ----------------------------------------------------- |
| The CA rejects issuance     | Permissions, CA state and key, algorithm and profile. |
| Different subject or usages | Applied profile and requested values.                 |
| Issuer cannot be found      | Downloaded CA and required intermediate chain.        |
| Validity fails              | Certificate and CA dates, and the computer's clock.   |
| Public-key digests differ   | Certificate and key files from the same issuance.     |

See [PKI diagnostics](/docs/platform/pki/troubleshooting) to narrow an issuance failure.

Next step [#next-step]

You have completed the PKI path when the certificate verifies and the key matches. Choose how to use it:

* [Manage certificates](/docs/platform/pki/certificates) for inspection, status and revocation.
* [Register a device manually](/docs/platform/iot-fleets/quickstarts/register-device) to associate this identity with Lamassu's inventory.
* [Prepare EST](/docs/platform/iot-fleets/enrollment/dms) for the device to request its next identities.

Acceptance by a consumer requires configuring its trust, revocation checks and permissions granted to the identity.
`,d={title:"Issue and verify a certificate",description:"Issue a client certificate and check content, chain and key correspondence."},o={contents:[{heading:void 0,content:"You will issue an end-entity certificate for `device-001` using browser key and CSR generation. The result is `device.crt`, `device.key` and the issuing root's public certificate, `ca.pem`."},{heading:"before-you-begin",content:"An active root CA with an available signing key and permission to issue. If one does not exist yet, follow Create your first CA."},{heading:"before-you-begin",content:"Its public certificate in `ca.pem`; this example uses the root created in the previous path."},{heading:"before-you-begin",content:"OpenSSL 3.x and a working directory with restricted access."},{heading:"before-you-begin",content:"A client identifier: here we use `device-001`."},{heading:"before-you-begin",content:"In this flow, the client's key is generated in the browser and must be downloaded when issuance finishes. If you lose it, you must generate a key and issue another certificate. The certificate inventory lets you download the public certificate, but cannot recover this key."},{heading:"start-the-issuance",content:"Open the CA from the previous path, go to **Issued Certificates** and select **Issue New**."},{heading:"choose-the-method",content:"Select **Generate Key & CSR in Browser** to follow this example."},{heading:"choose-the-method",content:"If the key must be generated and kept on the destination system, use **Upload Existing CSR**, described in the authorities guide."},{heading:"identify-the-certificate",content:"Enter `device-001` as the `Common Name`. Add subject details required by your policy and SANs if the consumer uses them to identify the client."},{heading:"identify-the-certificate",content:"If you continue with manual registration, the `Device ID` will be exactly `device-001`."},{heading:"configure-key-and-uses",content:"Choose an algorithm and size allowed by the profile; for example, ECDSA P-256 if permitted. For this client certificate, select **Digital Signature** and **Client Authentication**, and issue it as an end-entity certificate."},{heading:"configure-key-and-uses",content:"Request, for example, 30 days of validity, always within the CA's lifetime. Review the issuance profile if the resulting content differs from the request."},{heading:"issue-and-download",content:"Confirm issuance. Save the PEM certificate as `device.crt` and the private key as `device.key` in your prepared directory."},{heading:"verify-the-result",content:"Check in **Issued Certificates** that the certificate appears active. Note its serial number and verify the downloaded material using the checks below."},{heading:"inspect-content-and-dates",content:"Check `CN=device-001`, the expected issuer, current validity, **Digital Signature** and the extended usage **TLS Web Client Authentication**. It must be an end-entity certificate: it must not declare `CA:TRUE` or enable **Certificate Sign**. If **Basic Constraints** is present, it must indicate `CA:FALSE`. If you requested SANs, check that the expected identifiers appear in the certificate."},{heading:"verify-the-chain",content:"The expected result is `device.crt: OK`. This check uses your explicit root and evaluates the chain, dates and compatibility with the TLS client purpose. Also check for the expected usages and names through the inspection above."},{heading:"verify-the-chain",content:"If you use an intermediate CA, the trusted root must be in `ca.pem` and you must supply the intermediates with `-untrusted intermediates.pem`. This variant is covered in the trust model."},{heading:"verify-the-chain",content:"The command does not query OCSP or CRL. For revocation checks, continue with Certificate validation. See the openssl-verify reference for its options."},{heading:"check-that-the-key-matches",content:"In Bash, compare the two public-key digests:"},{heading:"check-that-the-key-matches",content:"Both commands must finish successfully and show the same SHA-256 digest. If they differ, the private key does not match the selected certificate. Find the correct pair before installing it."},{heading:"check-that-the-key-matches",content:"The options used are documented in openssl-x509 and openssl-pkey."},{heading:"if-the-result-fails",content:"Result"},{heading:"if-the-result-fails",content:"What to review"},{heading:"if-the-result-fails",content:"The CA rejects issuance"},{heading:"if-the-result-fails",content:"Permissions, CA state and key, algorithm and profile."},{heading:"if-the-result-fails",content:"Different subject or usages"},{heading:"if-the-result-fails",content:"Applied profile and requested values."},{heading:"if-the-result-fails",content:"Issuer cannot be found"},{heading:"if-the-result-fails",content:"Downloaded CA and required intermediate chain."},{heading:"if-the-result-fails",content:"Validity fails"},{heading:"if-the-result-fails",content:"Certificate and CA dates, and the computer's clock."},{heading:"if-the-result-fails",content:"Public-key digests differ"},{heading:"if-the-result-fails",content:"Certificate and key files from the same issuance."},{heading:"if-the-result-fails",content:"See PKI diagnostics to narrow an issuance failure."},{heading:"next-step",content:"You have completed the PKI path when the certificate verifies and the key matches. Choose how to use it:"},{heading:"next-step",content:"Manage certificates for inspection, status and revocation."},{heading:"next-step",content:"Register a device manually to associate this identity with Lamassu's inventory."},{heading:"next-step",content:"Prepare EST for the device to request its next identities."},{heading:"next-step",content:"Acceptance by a consumer requires configuring its trust, revocation checks and permissions granted to the identity."}],headings:[{id:"before-you-begin",content:"Before you begin"},{id:"start-the-issuance",content:"Start the issuance"},{id:"choose-the-method",content:"Choose the method"},{id:"identify-the-certificate",content:"Identify the certificate"},{id:"configure-key-and-uses",content:"Configure key and uses"},{id:"issue-and-download",content:"Issue and download"},{id:"verify-the-result",content:"Verify the result"},{id:"inspect-content-and-dates",content:"Inspect content and dates"},{id:"verify-the-chain",content:"Verify the chain"},{id:"check-that-the-key-matches",content:"Check that the key matches"},{id:"if-the-result-fails",content:"If the result fails"},{id:"next-step",content:"Next step"}]};const l=[{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:3,url:"#start-the-issuance",title:e.jsx(e.Fragment,{children:"Start the issuance"})},{depth:3,url:"#choose-the-method",title:e.jsx(e.Fragment,{children:"Choose the method"})},{depth:3,url:"#identify-the-certificate",title:e.jsx(e.Fragment,{children:"Identify the certificate"})},{depth:3,url:"#configure-key-and-uses",title:e.jsx(e.Fragment,{children:"Configure key and uses"})},{depth:3,url:"#issue-and-download",title:e.jsx(e.Fragment,{children:"Issue and download"})},{depth:3,url:"#verify-the-result",title:e.jsx(e.Fragment,{children:"Verify the result"})},{depth:2,url:"#inspect-content-and-dates",title:e.jsx(e.Fragment,{children:"Inspect content and dates"})},{depth:2,url:"#verify-the-chain",title:e.jsx(e.Fragment,{children:"Verify the chain"})},{depth:2,url:"#check-that-the-key-matches",title:e.jsx(e.Fragment,{children:"Check that the key matches"})},{depth:2,url:"#if-the-result-fails",title:e.jsx(e.Fragment,{children:"If the result fails"})},{depth:2,url:"#next-step",title:e.jsx(e.Fragment,{children:"Next step"})}];function h(i){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Callout:a,Step:s,Steps:r}=t;return a||n("Callout"),s||n("Step"),r||n("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["You will issue an end-entity certificate for ",e.jsx(t.code,{children:"device-001"})," using browser key and CSR generation. The result is ",e.jsx(t.code,{children:"device.crt"}),", ",e.jsx(t.code,{children:"device.key"})," and the issuing root's public certificate, ",e.jsx(t.code,{children:"ca.pem"}),"."]}),`
`,e.jsx(t.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["An active root CA with an available signing key and permission to issue. If one does not exist yet, follow ",e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/create-certificate-authority",children:"Create your first CA"}),"."]}),`
`,e.jsxs(t.li,{children:["Its public certificate in ",e.jsx(t.code,{children:"ca.pem"}),"; this example uses the root created in the previous path."]}),`
`,e.jsx(t.li,{children:"OpenSSL 3.x and a working directory with restricted access."}),`
`,e.jsxs(t.li,{children:["A client identifier: here we use ",e.jsx(t.code,{children:"device-001"}),"."]}),`
`]}),`
`,e.jsx(a,{type:"warn",title:"Keep the key before closing the result",children:e.jsx(t.p,{children:"In this flow, the client's key is generated in the browser and must be downloaded when issuance finishes. If you lose it, you must generate a key and issue another certificate. The certificate inventory lets you download the public certificate, but cannot recover this key."})}),`
`,e.jsxs(r,{children:[e.jsxs(s,{children:[e.jsx(t.h3,{id:"start-the-issuance",children:"Start the issuance"}),e.jsxs(t.p,{children:["Open the CA from the previous path, go to ",e.jsx(t.strong,{children:"Issued Certificates"})," and select ",e.jsx(t.strong,{children:"Issue New"}),"."]})]}),e.jsxs(s,{children:[e.jsx(t.h3,{id:"choose-the-method",children:"Choose the method"}),e.jsxs(t.p,{children:["Select ",e.jsx(t.strong,{children:"Generate Key & CSR in Browser"})," to follow this example."]}),e.jsxs(t.p,{children:["If the key must be generated and kept on the destination system, use ",e.jsx(t.strong,{children:"Upload Existing CSR"}),", described in the ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-authorities#issue-certificates",children:"authorities guide"}),"."]})]}),e.jsxs(s,{children:[e.jsx(t.h3,{id:"identify-the-certificate",children:"Identify the certificate"}),e.jsxs(t.p,{children:["Enter ",e.jsx(t.code,{children:"device-001"})," as the ",e.jsx(t.code,{children:"Common Name"}),". Add subject details required by your policy and SANs if the consumer uses them to identify the client."]}),e.jsxs(t.p,{children:["If you continue with manual registration, the ",e.jsx(t.code,{children:"Device ID"})," will be exactly ",e.jsx(t.code,{children:"device-001"}),"."]})]}),e.jsxs(s,{children:[e.jsx(t.h3,{id:"configure-key-and-uses",children:"Configure key and uses"}),e.jsxs(t.p,{children:["Choose an algorithm and size allowed by the profile; for example, ECDSA P-256 if permitted. For this client certificate, select ",e.jsx(t.strong,{children:"Digital Signature"})," and ",e.jsx(t.strong,{children:"Client Authentication"}),", and issue it as an end-entity certificate."]}),e.jsxs(t.p,{children:["Request, for example, 30 days of validity, always within the CA's lifetime. Review the ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-profiles",children:"issuance profile"})," if the resulting content differs from the request."]})]}),e.jsxs(s,{children:[e.jsx(t.h3,{id:"issue-and-download",children:"Issue and download"}),e.jsxs(t.p,{children:["Confirm issuance. Save the PEM certificate as ",e.jsx(t.code,{children:"device.crt"})," and the private key as ",e.jsx(t.code,{children:"device.key"})," in your prepared directory."]})]}),e.jsxs(s,{children:[e.jsx(t.h3,{id:"verify-the-result",children:"Verify the result"}),e.jsxs(t.p,{children:["Check in ",e.jsx(t.strong,{children:"Issued Certificates"})," that the certificate appears active. Note its serial number and verify the downloaded material using the checks below."]})]})]}),`
`,e.jsx(t.h2,{id:"inspect-content-and-dates",children:"Inspect content and dates"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" x509"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" device.crt"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -noout"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -subject"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -issuer"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -serial"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -dates"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" x509"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" device.crt"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -noout"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -text"})]})]})})}),`
`,e.jsxs(t.p,{children:["Check ",e.jsx(t.code,{children:"CN=device-001"}),", the expected issuer, current validity, ",e.jsx(t.strong,{children:"Digital Signature"})," and the extended usage ",e.jsx(t.strong,{children:"TLS Web Client Authentication"}),". It must be an end-entity certificate: it must not declare ",e.jsx(t.code,{children:"CA:TRUE"})," or enable ",e.jsx(t.strong,{children:"Certificate Sign"}),". If ",e.jsx(t.strong,{children:"Basic Constraints"})," is present, it must indicate ",e.jsx(t.code,{children:"CA:FALSE"}),". If you requested SANs, check that the expected identifiers appear in the certificate."]}),`
`,e.jsx(t.h2,{id:"verify-the-chain",children:"Verify the chain"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" verify"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -CAfile"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ca.pem"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -purpose"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" sslclient"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" device.crt"})]})})})}),`
`,e.jsxs(t.p,{children:["The expected result is ",e.jsx(t.code,{children:"device.crt: OK"}),". This check uses your explicit root and evaluates the chain, dates and compatibility with the TLS client purpose. Also check for the expected usages and names through the inspection above."]}),`
`,e.jsxs(t.p,{children:["If you use an intermediate CA, the trusted root must be in ",e.jsx(t.code,{children:"ca.pem"})," and you must supply the intermediates with ",e.jsx(t.code,{children:"-untrusted intermediates.pem"}),". This variant is covered in the ",e.jsx(t.a,{href:"/docs/platform/pki/concepts/trust-model",children:"trust model"}),"."]}),`
`,e.jsxs(t.p,{children:["The command does not query OCSP or CRL. For revocation checks, continue with ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-validation",children:"Certificate validation"}),". See the ",e.jsx(t.a,{href:"https://docs.openssl.org/3.6/man1/openssl-verify/",children:"openssl-verify reference"})," for its options."]}),`
`,e.jsx(t.h2,{id:"check-that-the-key-matches",children:"Check that the key matches"}),`
`,e.jsx(t.p,{children:"In Bash, compare the two public-key digests:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"("})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  set"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -e"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -o"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pipefail"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  openssl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" x509"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" device.crt"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -pubkey"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -noout"}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"    |"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" openssl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pkey"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -pubin"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -outform"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" DER"}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"    |"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" openssl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" dgst"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -sha256"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  openssl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pkey"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" device.key"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -pubout"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -outform"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" DER"}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"    |"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" openssl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" dgst"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -sha256"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:")"})})]})})}),`
`,e.jsx(t.p,{children:"Both commands must finish successfully and show the same SHA-256 digest. If they differ, the private key does not match the selected certificate. Find the correct pair before installing it."}),`
`,e.jsxs(t.p,{children:["The options used are documented in ",e.jsx(t.a,{href:"https://docs.openssl.org/3.6/man1/openssl-x509/",children:"openssl-x509"})," and ",e.jsx(t.a,{href:"https://docs.openssl.org/3.6/man1/openssl-pkey/",children:"openssl-pkey"}),"."]}),`
`,e.jsx(t.h2,{id:"if-the-result-fails",children:"If the result fails"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Result"}),e.jsx(t.th,{children:"What to review"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"The CA rejects issuance"}),e.jsx(t.td,{children:"Permissions, CA state and key, algorithm and profile."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Different subject or usages"}),e.jsx(t.td,{children:"Applied profile and requested values."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Issuer cannot be found"}),e.jsx(t.td,{children:"Downloaded CA and required intermediate chain."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Validity fails"}),e.jsx(t.td,{children:"Certificate and CA dates, and the computer's clock."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Public-key digests differ"}),e.jsx(t.td,{children:"Certificate and key files from the same issuance."})]})]})]}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/platform/pki/troubleshooting",children:"PKI diagnostics"})," to narrow an issuance failure."]}),`
`,e.jsx(t.h2,{id:"next-step",children:"Next step"}),`
`,e.jsx(t.p,{children:"You have completed the PKI path when the certificate verifies and the key matches. Choose how to use it:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/platform/pki/certificates",children:"Manage certificates"})," for inspection, status and revocation."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/platform/iot-fleets/quickstarts/register-device",children:"Register a device manually"})," to associate this identity with Lamassu's inventory."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"Prepare EST"})," for the device to request its next identities."]}),`
`]}),`
`,e.jsx(t.p,{children:"Acceptance by a consumer requires configuring its trust, revocation checks and permissions granted to the identity."})]})}function u(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(h,{...i})}):h(i)}function n(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:u,frontmatter:d,structuredData:o,toc:l},Symbol.toStringTag,{value:"Module"}));export{p as _};
