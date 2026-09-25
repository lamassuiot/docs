import{j as e}from"./index-prc0XQdj.js";let c=`

OCSP service [#ocsp-service]

OCSP (Online Certificate Status Protocol) is the mechanism that lets a relying party check, in real time, whether a specific certificate is valid or has been revoked. Instead of downloading a full list of revoked certificates, the client sends a query with the certificate's serial number and receives a signed response with the current status.

Lamassu integrates its own OCSP responder that serves these queries by consulting the internal certificate database directly. No external component is required.

How the responder works in Lamassu [#how-the-responder-works-in-lamassu]

When a client requests the status of a certificate, the responder locates the certificate by its serial number and determines its status from the internal record:

* If the certificate is active, the response indicates \`Good\`.
* If the certificate has been revoked, the response indicates \`Revoked\` and includes the revocation timestamp and the RFC 5280 reason code.
* If the serial number is not found or the status is not recognizable, the response indicates \`Unknown\`.

The OCSP response is signed by the issuing CA of the queried certificate, using the cryptographic engine associated with that CA. Lamassu does not use a delegated OCSP signing certificate: the CA acts directly as the responder.

Each response has a validity window of 24 hours, reflected in the response's \`thisUpdate\` and \`nextUpdate\` fields. Clients that cache responses must take this window into account when determining how long a response remains valid.

Embedding in issued certificates [#embedding-in-issued-certificates]

The OCSP responder URL is automatically embedded in the AIA (*Authority Information Access*) extension of every certificate issued by Lamassu. Clients that verify certificates can read this URL directly from the certificate without additional configuration.

HTTP endpoints [#http-endpoints]

The responder accepts both formats defined in RFC 6960:

* \`GET /ocsp/{ocsp_request}\` includes the OCSP request Base64url-encoded within the URL itself.
* \`POST /ocsp\` sends the request in the body with \`Content-Type: application/ocsp-request\`.

Example query with \`curl\` using POST:

\`\`\`bash
curl -X POST https://<LAMASSU_HOST>/ocsp \\
  -H "Content-Type: application/ocsp-request" \\
  --data-binary @request.der \\
  -o response.der
\`\`\`

The response has \`Content-Type: application/ocsp-response\` and contains the OCSP response in DER format.

Check from the interface [#check-from-the-interface]

From the certificates screen of Lamassu you can launch an OCSP request directly against the selected certificate with the **OCSP Check** action. This action shows the status returned by the responder without needing external tools.

References [#references]

* RFC 6960 - *X.509 Internet Public Key Infrastructure Online Certificate Status Protocol – OCSP*
* RFC 5280 - *Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile* (revocation reasons, section 5.3.1)

<Cards>
  <Card title="CRL service" href="/docs/platform/pki/crl" />

  <Card title="Certificate validation" href="/docs/platform/pki/certificate-validation" />
</Cards>
`,o={title:"Online validation with OCSP",description:"Check in real time whether a certificate is still valid or has been revoked.",sidebar:{group:"VA",label:"OCSP"}},h={contents:[{heading:"ocsp-service",content:"OCSP (Online Certificate Status Protocol) is the mechanism that lets a relying party check, in real time, whether a specific certificate is valid or has been revoked. Instead of downloading a full list of revoked certificates, the client sends a query with the certificate's serial number and receives a signed response with the current status."},{heading:"ocsp-service",content:"Lamassu integrates its own OCSP responder that serves these queries by consulting the internal certificate database directly. No external component is required."},{heading:"how-the-responder-works-in-lamassu",content:"When a client requests the status of a certificate, the responder locates the certificate by its serial number and determines its status from the internal record:"},{heading:"how-the-responder-works-in-lamassu",content:"If the certificate is active, the response indicates `Good`."},{heading:"how-the-responder-works-in-lamassu",content:"If the certificate has been revoked, the response indicates `Revoked` and includes the revocation timestamp and the RFC 5280 reason code."},{heading:"how-the-responder-works-in-lamassu",content:"If the serial number is not found or the status is not recognizable, the response indicates `Unknown`."},{heading:"how-the-responder-works-in-lamassu",content:"The OCSP response is signed by the issuing CA of the queried certificate, using the cryptographic engine associated with that CA. Lamassu does not use a delegated OCSP signing certificate: the CA acts directly as the responder."},{heading:"how-the-responder-works-in-lamassu",content:"Each response has a validity window of 24 hours, reflected in the response's `thisUpdate` and `nextUpdate` fields. Clients that cache responses must take this window into account when determining how long a response remains valid."},{heading:"embedding-in-issued-certificates",content:"The OCSP responder URL is automatically embedded in the AIA (*Authority Information Access*) extension of every certificate issued by Lamassu. Clients that verify certificates can read this URL directly from the certificate without additional configuration."},{heading:"http-endpoints",content:"The responder accepts both formats defined in RFC 6960:"},{heading:"http-endpoints",content:"`GET /ocsp/{ocsp_request}` includes the OCSP request Base64url-encoded within the URL itself."},{heading:"http-endpoints",content:"`POST /ocsp` sends the request in the body with `Content-Type: application/ocsp-request`."},{heading:"http-endpoints",content:"Example query with `curl` using POST:"},{heading:"http-endpoints",content:"The response has `Content-Type: application/ocsp-response` and contains the OCSP response in DER format."},{heading:"check-from-the-interface",content:"From the certificates screen of Lamassu you can launch an OCSP request directly against the selected certificate with the **OCSP Check** action. This action shows the status returned by the responder without needing external tools."},{heading:"references",content:"RFC 6960 - *X.509 Internet Public Key Infrastructure Online Certificate Status Protocol – OCSP*"},{heading:"references",content:"RFC 5280 - *Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile* (revocation reasons, section 5.3.1)"},{heading:"references",content:'<Card title="CRL service" href="/docs/platform/pki/crl" />'},{heading:"references",content:'<Card title="Certificate validation" href="/docs/platform/pki/certificate-validation" />'}],headings:[{id:"ocsp-service",content:"OCSP service"},{id:"how-the-responder-works-in-lamassu",content:"How the responder works in Lamassu"},{id:"embedding-in-issued-certificates",content:"Embedding in issued certificates"},{id:"http-endpoints",content:"HTTP endpoints"},{id:"check-from-the-interface",content:"Check from the interface"},{id:"references",content:"References"}]};const d=[{depth:1,url:"#ocsp-service",title:e.jsx(e.Fragment,{children:"OCSP service"})},{depth:2,url:"#how-the-responder-works-in-lamassu",title:e.jsx(e.Fragment,{children:"How the responder works in Lamassu"})},{depth:2,url:"#embedding-in-issued-certificates",title:e.jsx(e.Fragment,{children:"Embedding in issued certificates"})},{depth:2,url:"#http-endpoints",title:e.jsx(e.Fragment,{children:"HTTP endpoints"})},{depth:2,url:"#check-from-the-interface",title:e.jsx(e.Fragment,{children:"Check from the interface"})},{depth:2,url:"#references",title:e.jsx(e.Fragment,{children:"References"})}];function r(i){const t={code:"code",em:"em",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components},{Card:n,Cards:s}=t;return n||a("Card"),s||a("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(t.h1,{id:"ocsp-service",children:"OCSP service"}),`
`,e.jsx(t.p,{children:"OCSP (Online Certificate Status Protocol) is the mechanism that lets a relying party check, in real time, whether a specific certificate is valid or has been revoked. Instead of downloading a full list of revoked certificates, the client sends a query with the certificate's serial number and receives a signed response with the current status."}),`
`,e.jsx(t.p,{children:"Lamassu integrates its own OCSP responder that serves these queries by consulting the internal certificate database directly. No external component is required."}),`
`,e.jsx(t.h2,{id:"how-the-responder-works-in-lamassu",children:"How the responder works in Lamassu"}),`
`,e.jsx(t.p,{children:"When a client requests the status of a certificate, the responder locates the certificate by its serial number and determines its status from the internal record:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["If the certificate is active, the response indicates ",e.jsx(t.code,{children:"Good"}),"."]}),`
`,e.jsxs(t.li,{children:["If the certificate has been revoked, the response indicates ",e.jsx(t.code,{children:"Revoked"})," and includes the revocation timestamp and the RFC 5280 reason code."]}),`
`,e.jsxs(t.li,{children:["If the serial number is not found or the status is not recognizable, the response indicates ",e.jsx(t.code,{children:"Unknown"}),"."]}),`
`]}),`
`,e.jsx(t.p,{children:"The OCSP response is signed by the issuing CA of the queried certificate, using the cryptographic engine associated with that CA. Lamassu does not use a delegated OCSP signing certificate: the CA acts directly as the responder."}),`
`,e.jsxs(t.p,{children:["Each response has a validity window of 24 hours, reflected in the response's ",e.jsx(t.code,{children:"thisUpdate"})," and ",e.jsx(t.code,{children:"nextUpdate"})," fields. Clients that cache responses must take this window into account when determining how long a response remains valid."]}),`
`,e.jsx(t.h2,{id:"embedding-in-issued-certificates",children:"Embedding in issued certificates"}),`
`,e.jsxs(t.p,{children:["The OCSP responder URL is automatically embedded in the AIA (",e.jsx(t.em,{children:"Authority Information Access"}),") extension of every certificate issued by Lamassu. Clients that verify certificates can read this URL directly from the certificate without additional configuration."]}),`
`,e.jsx(t.h2,{id:"http-endpoints",children:"HTTP endpoints"}),`
`,e.jsx(t.p,{children:"The responder accepts both formats defined in RFC 6960:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"GET /ocsp/{ocsp_request}"})," includes the OCSP request Base64url-encoded within the URL itself."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"POST /ocsp"})," sends the request in the body with ",e.jsx(t.code,{children:"Content-Type: application/ocsp-request"}),"."]}),`
`]}),`
`,e.jsxs(t.p,{children:["Example query with ",e.jsx(t.code,{children:"curl"})," using POST:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"curl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -X"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" POST"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" https://"}),e.jsx(t.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"<"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"LAMASSU_HOS"}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"T"}),e.jsx(t.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"/ocsp"}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -H"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "Content-Type: application/ocsp-request"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --data-binary"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" @request.der"}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -o"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" response.der"})]})]})})}),`
`,e.jsxs(t.p,{children:["The response has ",e.jsx(t.code,{children:"Content-Type: application/ocsp-response"})," and contains the OCSP response in DER format."]}),`
`,e.jsx(t.h2,{id:"check-from-the-interface",children:"Check from the interface"}),`
`,e.jsxs(t.p,{children:["From the certificates screen of Lamassu you can launch an OCSP request directly against the selected certificate with the ",e.jsx(t.strong,{children:"OCSP Check"})," action. This action shows the status returned by the responder without needing external tools."]}),`
`,e.jsx(t.h2,{id:"references",children:"References"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["RFC 6960 - ",e.jsx(t.em,{children:"X.509 Internet Public Key Infrastructure Online Certificate Status Protocol – OCSP"})]}),`
`,e.jsxs(t.li,{children:["RFC 5280 - ",e.jsx(t.em,{children:"Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile"})," (revocation reasons, section 5.3.1)"]}),`
`]}),`
`,e.jsxs(s,{children:[e.jsx(n,{title:"CRL service",href:"/docs/platform/pki/crl"}),e.jsx(n,{title:"Certificate validation",href:"/docs/platform/pki/certificate-validation"})]})]})}function l(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(r,{...i})}):r(i)}function a(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const f=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:l,frontmatter:o,structuredData:h,toc:d},Symbol.toStringTag,{value:"Module"}));export{f as _};
