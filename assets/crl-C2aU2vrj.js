import{j as e}from"./index-prc0XQdj.js";let o=`

CRL service [#crl-service]

A CRL (*Certificate Revocation List*) is a signed list containing the serial numbers of certificates revoked before their expiration date. Unlike OCSP, it does not require a real-time query: the relying party downloads the list periodically and consults it locally.

Lamassu generates and maintains one CRL per CA it manages. Each CRL is signed with the private key of the issuing CA itself and is stored in the object storage configured on the platform.

VA role and per-CA configuration [#va-role-and-per-ca-configuration]

The publication of each CA's CRL is controlled by a *VA role*. This object defines how it is generated, when it is regenerated and which key signs it.

The main parameters are:

* **\`validity\`** defines the validity period reflected in \`nextUpdate\`. Its default value is 7 days.
* **\`refresh_interval\`** sets the minimum interval between scheduled regenerations. By default it is approximately 6 days and 23 hours.
* **\`regenerate_on_revoke\`** orders publishing a new version immediately after a revocation. It is enabled by default.

The \`subject_key_id_signer\` field identifies the CA whose private key signs the CRL. By default, each CA signs its own CRL.

Each CRL carries an incremental version number. Lamassu stores all versions under the path \`pki/va/crl/{subject_key_id}/{version}.crl\` in object storage.

Periodic and automatic regeneration [#periodic-and-automatic-regeneration]

A background process monitors active VA roles. When the remaining validity of the current CRL falls below the configured watch period (*blind period*), the system requests the generation of a new CRL. This prevents the published CRL from expiring without a valid version available.

Additionally, when \`regenerate_on_revoke\` is enabled, which is the default behavior, any certificate revocation immediately triggers the generation of a new CRL for the affected CA. This minimizes the time between revocation and its publication.

CRL contents [#crl-contents]

Each entry of the CRL includes the serial number of the revoked certificate, the revocation date and the RFC 5280 reason code.

The CRL also includes the *Issuing Distribution Point* (IDP, OID 2.5.29.28) extension, marked as critical, which indicates the public URL from which it can be downloaded. That URL points to the \`/crl/{subject_key_id}\` endpoint of each configured VA domain.

Public download endpoint [#public-download-endpoint]

The latest CRL of a CA can be obtained directly without authentication:

\`\`\`bash
curl https://<LAMASSU_HOST>/crl/<CA_SUBJECT_KEY_ID> -o ca.crl
\`\`\`

The response has \`Content-Type: application/pkix-crl\` and contains the CRL in DER format.

VA role management API [#va-role-management-api]

The VA role of a CA can be queried and updated through the API:

| Method | Path                 | Description                                                                                            |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------------ |
| \`GET\`  | \`/v1/roles/{ca-ski}\` | Returns the VA role configuration and the metadata of the last issued CRL.                             |
| \`PUT\`  | \`/v1/roles/{ca-ski}\` | Updates the VA role configuration parameters (\`validity\`, \`refresh_interval\`, \`regenerate_on_revoke\`). |

Example of querying the VA role:

\`\`\`bash
curl https://<LAMASSU_HOST>/v1/roles/<CA_SUBJECT_KEY_ID> \\
  -H "Authorization: Bearer <TOKEN>"
\`\`\`

The response includes the \`latest_crl\` field with the version, the start of validity and the expiration date of the currently published CRL.

From the interface [#from-the-interface]

From a CA's detail panel you can preview the content of the active CRL and download it directly for offline use or for importing into applications that perform local validation.

References [#references]

* RFC 5280 - *Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile*

<Cards>
  <Card title="OCSP service" href="/docs/platform/pki/ocsp" />

  <Card title="Certificate validation" href="/docs/platform/pki/certificate-validation" />
</Cards>
`,d={title:"Revocation lists (CRL)",description:"Generate and distribute signed lists to validate certificates offline.",sidebar:{group:"VA",label:"CRL"}},l={contents:[{heading:"crl-service",content:"A CRL (*Certificate Revocation List*) is a signed list containing the serial numbers of certificates revoked before their expiration date. Unlike OCSP, it does not require a real-time query: the relying party downloads the list periodically and consults it locally."},{heading:"crl-service",content:"Lamassu generates and maintains one CRL per CA it manages. Each CRL is signed with the private key of the issuing CA itself and is stored in the object storage configured on the platform."},{heading:"va-role-and-per-ca-configuration",content:"The publication of each CA's CRL is controlled by a *VA role*. This object defines how it is generated, when it is regenerated and which key signs it."},{heading:"va-role-and-per-ca-configuration",content:"The main parameters are:"},{heading:"va-role-and-per-ca-configuration",content:"**`validity`** defines the validity period reflected in `nextUpdate`. Its default value is 7 days."},{heading:"va-role-and-per-ca-configuration",content:"**`refresh_interval`** sets the minimum interval between scheduled regenerations. By default it is approximately 6 days and 23 hours."},{heading:"va-role-and-per-ca-configuration",content:"**`regenerate_on_revoke`** orders publishing a new version immediately after a revocation. It is enabled by default."},{heading:"va-role-and-per-ca-configuration",content:"The `subject_key_id_signer` field identifies the CA whose private key signs the CRL. By default, each CA signs its own CRL."},{heading:"va-role-and-per-ca-configuration",content:"Each CRL carries an incremental version number. Lamassu stores all versions under the path `pki/va/crl/{subject_key_id}/{version}.crl` in object storage."},{heading:"periodic-and-automatic-regeneration",content:"A background process monitors active VA roles. When the remaining validity of the current CRL falls below the configured watch period (*blind period*), the system requests the generation of a new CRL. This prevents the published CRL from expiring without a valid version available."},{heading:"periodic-and-automatic-regeneration",content:"Additionally, when `regenerate_on_revoke` is enabled, which is the default behavior, any certificate revocation immediately triggers the generation of a new CRL for the affected CA. This minimizes the time between revocation and its publication."},{heading:"crl-contents",content:"Each entry of the CRL includes the serial number of the revoked certificate, the revocation date and the RFC 5280 reason code."},{heading:"crl-contents",content:"The CRL also includes the *Issuing Distribution Point* (IDP, OID 2.5.29.28) extension, marked as critical, which indicates the public URL from which it can be downloaded. That URL points to the `/crl/{subject_key_id}` endpoint of each configured VA domain."},{heading:"public-download-endpoint",content:"The latest CRL of a CA can be obtained directly without authentication:"},{heading:"public-download-endpoint",content:"The response has `Content-Type: application/pkix-crl` and contains the CRL in DER format."},{heading:"va-role-management-api",content:"The VA role of a CA can be queried and updated through the API:"},{heading:"va-role-management-api",content:"Method"},{heading:"va-role-management-api",content:"Path"},{heading:"va-role-management-api",content:"Description"},{heading:"va-role-management-api",content:"`GET`"},{heading:"va-role-management-api",content:"`/v1/roles/{ca-ski}`"},{heading:"va-role-management-api",content:"Returns the VA role configuration and the metadata of the last issued CRL."},{heading:"va-role-management-api",content:"`PUT`"},{heading:"va-role-management-api",content:"`/v1/roles/{ca-ski}`"},{heading:"va-role-management-api",content:"Updates the VA role configuration parameters (`validity`, `refresh_interval`, `regenerate_on_revoke`)."},{heading:"va-role-management-api",content:"Example of querying the VA role:"},{heading:"va-role-management-api",content:"The response includes the `latest_crl` field with the version, the start of validity and the expiration date of the currently published CRL."},{heading:"from-the-interface",content:"From a CA's detail panel you can preview the content of the active CRL and download it directly for offline use or for importing into applications that perform local validation."},{heading:"references",content:"RFC 5280 - *Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile*"},{heading:"references",content:'<Card title="OCSP service" href="/docs/platform/pki/ocsp" />'},{heading:"references",content:'<Card title="Certificate validation" href="/docs/platform/pki/certificate-validation" />'}],headings:[{id:"crl-service",content:"CRL service"},{id:"va-role-and-per-ca-configuration",content:"VA role and per-CA configuration"},{id:"periodic-and-automatic-regeneration",content:"Periodic and automatic regeneration"},{id:"crl-contents",content:"CRL contents"},{id:"public-download-endpoint",content:"Public download endpoint"},{id:"va-role-management-api",content:"VA role management API"},{id:"from-the-interface",content:"From the interface"},{id:"references",content:"References"}]};const c=[{depth:1,url:"#crl-service",title:e.jsx(e.Fragment,{children:"CRL service"})},{depth:2,url:"#va-role-and-per-ca-configuration",title:e.jsx(e.Fragment,{children:"VA role and per-CA configuration"})},{depth:2,url:"#periodic-and-automatic-regeneration",title:e.jsx(e.Fragment,{children:"Periodic and automatic regeneration"})},{depth:2,url:"#crl-contents",title:e.jsx(e.Fragment,{children:"CRL contents"})},{depth:2,url:"#public-download-endpoint",title:e.jsx(e.Fragment,{children:"Public download endpoint"})},{depth:2,url:"#va-role-management-api",title:e.jsx(e.Fragment,{children:"VA role management API"})},{depth:2,url:"#from-the-interface",title:e.jsx(e.Fragment,{children:"From the interface"})},{depth:2,url:"#references",title:e.jsx(e.Fragment,{children:"References"})}];function r(n){const i={code:"code",em:"em",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components},{Card:t,Cards:a}=i;return t||s("Card"),a||s("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(i.h1,{id:"crl-service",children:"CRL service"}),`
`,e.jsxs(i.p,{children:["A CRL (",e.jsx(i.em,{children:"Certificate Revocation List"}),") is a signed list containing the serial numbers of certificates revoked before their expiration date. Unlike OCSP, it does not require a real-time query: the relying party downloads the list periodically and consults it locally."]}),`
`,e.jsx(i.p,{children:"Lamassu generates and maintains one CRL per CA it manages. Each CRL is signed with the private key of the issuing CA itself and is stored in the object storage configured on the platform."}),`
`,e.jsx(i.h2,{id:"va-role-and-per-ca-configuration",children:"VA role and per-CA configuration"}),`
`,e.jsxs(i.p,{children:["The publication of each CA's CRL is controlled by a ",e.jsx(i.em,{children:"VA role"}),". This object defines how it is generated, when it is regenerated and which key signs it."]}),`
`,e.jsx(i.p,{children:"The main parameters are:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"validity"})})," defines the validity period reflected in ",e.jsx(i.code,{children:"nextUpdate"}),". Its default value is 7 days."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"refresh_interval"})})," sets the minimum interval between scheduled regenerations. By default it is approximately 6 days and 23 hours."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"regenerate_on_revoke"})})," orders publishing a new version immediately after a revocation. It is enabled by default."]}),`
`]}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"subject_key_id_signer"})," field identifies the CA whose private key signs the CRL. By default, each CA signs its own CRL."]}),`
`,e.jsxs(i.p,{children:["Each CRL carries an incremental version number. Lamassu stores all versions under the path ",e.jsx(i.code,{children:"pki/va/crl/{subject_key_id}/{version}.crl"})," in object storage."]}),`
`,e.jsx(i.h2,{id:"periodic-and-automatic-regeneration",children:"Periodic and automatic regeneration"}),`
`,e.jsxs(i.p,{children:["A background process monitors active VA roles. When the remaining validity of the current CRL falls below the configured watch period (",e.jsx(i.em,{children:"blind period"}),"), the system requests the generation of a new CRL. This prevents the published CRL from expiring without a valid version available."]}),`
`,e.jsxs(i.p,{children:["Additionally, when ",e.jsx(i.code,{children:"regenerate_on_revoke"})," is enabled, which is the default behavior, any certificate revocation immediately triggers the generation of a new CRL for the affected CA. This minimizes the time between revocation and its publication."]}),`
`,e.jsx(i.h2,{id:"crl-contents",children:"CRL contents"}),`
`,e.jsx(i.p,{children:"Each entry of the CRL includes the serial number of the revoked certificate, the revocation date and the RFC 5280 reason code."}),`
`,e.jsxs(i.p,{children:["The CRL also includes the ",e.jsx(i.em,{children:"Issuing Distribution Point"})," (IDP, OID 2.5.29.28) extension, marked as critical, which indicates the public URL from which it can be downloaded. That URL points to the ",e.jsx(i.code,{children:"/crl/{subject_key_id}"})," endpoint of each configured VA domain."]}),`
`,e.jsx(i.h2,{id:"public-download-endpoint",children:"Public download endpoint"}),`
`,e.jsx(i.p,{children:"The latest CRL of a CA can be obtained directly without authentication:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"curl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" https://"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"LAMASSU_HOS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"T"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"/crl/"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"CA_SUBJECT_KEY_I"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"D"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -o"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ca.crl"})]})})})}),`
`,e.jsxs(i.p,{children:["The response has ",e.jsx(i.code,{children:"Content-Type: application/pkix-crl"})," and contains the CRL in DER format."]}),`
`,e.jsx(i.h2,{id:"va-role-management-api",children:"VA role management API"}),`
`,e.jsx(i.p,{children:"The VA role of a CA can be queried and updated through the API:"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Method"}),e.jsx(i.th,{children:"Path"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"GET"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"/v1/roles/{ca-ski}"})}),e.jsx(i.td,{children:"Returns the VA role configuration and the metadata of the last issued CRL."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"PUT"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"/v1/roles/{ca-ski}"})}),e.jsxs(i.td,{children:["Updates the VA role configuration parameters (",e.jsx(i.code,{children:"validity"}),", ",e.jsx(i.code,{children:"refresh_interval"}),", ",e.jsx(i.code,{children:"regenerate_on_revoke"}),")."]})]})]})]}),`
`,e.jsx(i.p,{children:"Example of querying the VA role:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"curl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" https://"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"LAMASSU_HOS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"T"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"/v1/roles/"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"CA_SUBJECT_KEY_I"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"D"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -H"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "Authorization: Bearer <TOKEN>"'})]})]})})}),`
`,e.jsxs(i.p,{children:["The response includes the ",e.jsx(i.code,{children:"latest_crl"})," field with the version, the start of validity and the expiration date of the currently published CRL."]}),`
`,e.jsx(i.h2,{id:"from-the-interface",children:"From the interface"}),`
`,e.jsx(i.p,{children:"From a CA's detail panel you can preview the content of the active CRL and download it directly for offline use or for importing into applications that perform local validation."}),`
`,e.jsx(i.h2,{id:"references",children:"References"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["RFC 5280 - ",e.jsx(i.em,{children:"Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile"})]}),`
`]}),`
`,e.jsxs(a,{children:[e.jsx(t,{title:"OCSP service",href:"/docs/platform/pki/ocsp"}),e.jsx(t,{title:"Certificate validation",href:"/docs/platform/pki/certificate-validation"})]})]})}function h(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(r,{...n})}):r(n)}function s(n,i){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const f=Object.freeze(Object.defineProperty({__proto__:null,_markdown:o,default:h,frontmatter:d,structuredData:l,toc:c},Symbol.toStringTag,{value:"Module"}));export{f as _};
