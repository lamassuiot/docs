import{j as e}from"./index-DqgIL_Rv.js";let o=`

<div className="lm-diff-ins lm-diff-block">
  You will revoke the certificate of \`device-042\`, one of the 100 certificates issued by the CA, and then check that the CA's revocation list (CRL) includes it while the other certificates remain valid. The result is a revoked certificate in Lamassu and a downloaded CRL that names its serial number and reason.
</div>

<div className="lm-diff-ins lm-diff-block">
  Before you begin [#before-you-begin]
</div>

<div className="lm-diff-ins lm-diff-block">
  * A CA with issued certificates and permission to change their status. The example uses \`Acme Showcase Root CA\` from [Create your first CA](/docs/platform/pki/quickstarts/create-certificate-authority), with the 100 client certificates \`device-001\` to \`device-100\`. A smaller set works the same way.
  * The CA's public certificate in \`ca.pem\`, as saved in the first path.
  * OpenSSL 3.x and \`curl\` on a computer that can reach the CRL endpoint.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="warn" title="Revocation is permanent for most reasons">
    Only \`CertificateHold\` can be undone later. Any other reason is final, so use an evaluation certificate for this path. Before revoking in production, identify the consumers of the identity and prepare a replacement.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  Revoke the certificate [#revoke-the-certificate]
</div>

<div className="lm-diff-ins lm-diff-block">
  Follow the interactive walkthrough. It opens the issuing CA, filters its **Issued Certificates** by Common Name to find \`device-042\` among the 100, and revokes it with the reason \`KeyCompromise\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  <RevokeCertificateDemo locale="en" />
</div>

<div className="lm-diff-ins lm-diff-block">
  In the console, the steps are:
</div>

<div className="lm-diff-ins lm-diff-block">
  <Steps>
    <Step>
      Find the certificate [#find-the-certificate]

      Open **Certification Authorities**, select the issuing CA and go to **Issued Certificates**. Search by \`Common Name\` for \`device-042\`. The CA's own certificate is also listed in this tab; do not confuse the two.
    </Step>

    <Step>
      Revoke it [#revoke-it]

      Open the **More actions** menu of the matching row and select **Revoke Certificate**. In the confirmation dialog, choose the **Revocation Reason** that describes the incident. This example uses \`KeyCompromise\`, because the device key is considered exposed. Use \`CertificateHold\` only for a reversible suspension.
    </Step>

    <Step>
      Confirm and read the status [#confirm-and-read-the-status]

      Select **Confirm Revocation**. The row changes to \`REVOKED\` and shows the reason and the revocation time. If you need to verify the result later, read the record again rather than trusting the dialog.
    </Step>
  </Steps>
</div>

<div className="lm-diff-ins lm-diff-block">
  Revocation does not delete the certificate or its key, and it does not close sessions that are already established. See [Certificates](/docs/platform/pki/certificates#revoke-a-certificate) for the reasons and their consequences.
</div>

<div className="lm-diff-ins lm-diff-block">
  Download the certificate [#download-the-certificate]
</div>

<div className="lm-diff-ins lm-diff-block">
  From the same **More actions** menu, select **Download PEM** and save the file as \`device-042.crt\`. Note its serial number and the CRL distribution point (CDP) it carries:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  openssl x509 -in device-042.crt -noout -serial -ext crlDistributionPoints
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`text
  serial=A9EB398A86BA12F93A50BC6026977F91
  X509v3 CRL Distribution Points:
      Full Name:
        URI:http://<LAMASSU_HOST>/api/va/crl/<CA_ID>
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  The URL ends with the ID of the **issuing CA**, not the ID or serial of the certificate. Your serial number differs from the one shown.
</div>

<div className="lm-diff-ins lm-diff-block">
  Check the CRL [#check-the-crl]
</div>

<div className="lm-diff-ins lm-diff-block">
  Lamassu regenerates the CA's CRL when a certificate is revoked, provided \`regenerate_on_revoke\` is enabled; it is by default. The endpoint is public and does not require authentication. Replace the URL with the CDP of your certificate and download the list:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  CRL_URL='http://<LAMASSU_HOST>/api/va/crl/<CA_ID>'

  curl --fail --show-error --silent --max-time 15 \\
    "$CRL_URL" -o ca.crl.der

  openssl crl -inform DER -in ca.crl.der \\
    -outform PEM -out ca.crl.pem
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Check that the list is signed by your CA, is current and contains the serial number:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  openssl crl -in ca.crl.pem -noout -verify -CAfile ca.pem
  openssl crl -in ca.crl.pem -noout -issuer -lastupdate -nextupdate -crlnumber
  openssl crl -in ca.crl.pem -noout -text
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`text
  verify OK
  issuer=C=ES, O=Acme, CN=Acme Showcase Root CA
  lastUpdate=Nov 17 17:02:45 2026 GMT
  nextUpdate=Nov 24 17:02:45 2026 GMT
  crlNumber=0x02
  ...
  Revoked Certificates:
      Serial Number: A9EB398A86BA12F93A50BC6026977F91
          Revocation Date: Nov 17 17:02:45 2026 GMT
          CRL entry extensions:
              X509v3 CRL Reason Code:
                  Key Compromise
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Expect \`verify OK\`, the expected issuer, a \`lastUpdate\` not earlier than the revocation and an entry for the serial of \`device-042\` with reason \`Key Compromise\`; the list also names any other certificate previously revoked by this CA. A CRL with the same number as before the revocation means it has not been regenerated yet.
</div>

<div className="lm-diff-ins lm-diff-block">
  Verify with the list [#verify-with-the-list]
</div>

<div className="lm-diff-ins lm-diff-block">
  \`openssl verify\` can apply the downloaded list to a certificate. The revoked certificate must be rejected and any other certificate from the same CA must still pass. For \`device-001\`, download its PEM in the same way and save it as \`device-001.crt\`:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  for cert in device-042 device-001; do
    openssl verify -CAfile ca.pem -CRLfile ca.crl.pem \\
      -crl_check -purpose sslclient "$cert.crt"
  done
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`text
  C=ES, O=Acme, CN=device-042
  error 23 at 0 depth lookup: certificate revoked
  error device-042.crt: verification failed
  device-001.crt: OK
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  This check uses your local copy of the list: it does not download newer lists or prove that every client has refreshed its copy. For online status, see [OCSP](/docs/platform/pki/ocsp).
</div>

<div className="lm-diff-ins lm-diff-block">
  If the result fails [#if-the-result-fails]
</div>

<div className="lm-diff-ins lm-diff-block">
  | Result                                  | What to review                                                                                                                                           |
  | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | **Revoke Certificate** is not available | The certificate is already \`REVOKED\` for a final reason or is \`EXPIRED\`.                                                                                 |
  | The CRL download returns 404            | The ID in the URL is not the issuing CA's: use the CDP of the certificate.                                                                               |
  | \`verify OK\` fails                       | \`ca.pem\` is not the certificate of the CA that signed the list.                                                                                          |
  | The serial is not in the list           | The list was downloaded before the revocation, or its regeneration failed. See [CRL settings errors](/docs/platform/pki/crl#common-crl-settings-errors). |
  | \`device-001\` is also rejected           | The certificate was revoked, or \`ca.pem\` does not match its issuer.                                                                                      |
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Manage certificates" description="Reasons, holds and reactivation." href="/docs/platform/pki/certificates" />

    <Card title="Revocation lists (CRL)" description="Settings, regeneration and publication." href="/docs/platform/pki/crl" />

    <Card title="Validate with OCSP" description="Query the signed status of a certificate." href="/docs/platform/pki/ocsp" />
  </Cards>
</div>
`,f={title:"Revoke a certificate and check the CRL",description:"Revoke a certificate among many issued by a CA and confirm that its CRL lists it."},m={isNew:!0,changes:30,title:void 0,description:void 0},k={contents:[{heading:void 0,content:"You will revoke the certificate of `device-042`, one of the 100 certificates issued by the CA, and then check that the CA's revocation list (CRL) includes it while the other certificates remain valid. The result is a revoked certificate in Lamassu and a downloaded CRL that names its serial number and reason."},{heading:"before-you-begin",content:"A CA with issued certificates and permission to change their status. The example uses `Acme Showcase Root CA` from Create your first CA, with the 100 client certificates `device-001` to `device-100`. A smaller set works the same way."},{heading:"before-you-begin",content:"The CA's public certificate in `ca.pem`, as saved in the first path."},{heading:"before-you-begin",content:"OpenSSL 3.x and `curl` on a computer that can reach the CRL endpoint."},{heading:"before-you-begin",content:"Only `CertificateHold` can be undone later. Any other reason is final, so use an evaluation certificate for this path. Before revoking in production, identify the consumers of the identity and prepare a replacement."},{heading:"revoke-the-certificate",content:"Follow the interactive walkthrough. It opens the issuing CA, filters its **Issued Certificates** by Common Name to find `device-042` among the 100, and revokes it with the reason `KeyCompromise`."},{heading:"revoke-the-certificate",content:"In the console, the steps are:"},{heading:"find-the-certificate",content:"Open **Certification Authorities**, select the issuing CA and go to **Issued Certificates**. Search by `Common Name` for `device-042`. The CA's own certificate is also listed in this tab; do not confuse the two."},{heading:"revoke-it",content:"Open the **More actions** menu of the matching row and select **Revoke Certificate**. In the confirmation dialog, choose the **Revocation Reason** that describes the incident. This example uses `KeyCompromise`, because the device key is considered exposed. Use `CertificateHold` only for a reversible suspension."},{heading:"confirm-and-read-the-status",content:"Select **Confirm Revocation**. The row changes to `REVOKED` and shows the reason and the revocation time. If you need to verify the result later, read the record again rather than trusting the dialog."},{heading:"confirm-and-read-the-status",content:"Revocation does not delete the certificate or its key, and it does not close sessions that are already established. See Certificates for the reasons and their consequences."},{heading:"download-the-certificate",content:"From the same **More actions** menu, select **Download PEM** and save the file as `device-042.crt`. Note its serial number and the CRL distribution point (CDP) it carries:"},{heading:"download-the-certificate",content:"The URL ends with the ID of the **issuing CA**, not the ID or serial of the certificate. Your serial number differs from the one shown."},{heading:"check-the-crl",content:"Lamassu regenerates the CA's CRL when a certificate is revoked, provided `regenerate_on_revoke` is enabled; it is by default. The endpoint is public and does not require authentication. Replace the URL with the CDP of your certificate and download the list:"},{heading:"check-the-crl",content:"Check that the list is signed by your CA, is current and contains the serial number:"},{heading:"check-the-crl",content:"Expect `verify OK`, the expected issuer, a `lastUpdate` not earlier than the revocation and an entry for the serial of `device-042` with reason `Key Compromise`; the list also names any other certificate previously revoked by this CA. A CRL with the same number as before the revocation means it has not been regenerated yet."},{heading:"verify-with-the-list",content:"`openssl verify` can apply the downloaded list to a certificate. The revoked certificate must be rejected and any other certificate from the same CA must still pass. For `device-001`, download its PEM in the same way and save it as `device-001.crt`:"},{heading:"verify-with-the-list",content:"This check uses your local copy of the list: it does not download newer lists or prove that every client has refreshed its copy. For online status, see OCSP."},{heading:"if-the-result-fails",content:"Result"},{heading:"if-the-result-fails",content:"What to review"},{heading:"if-the-result-fails",content:"**Revoke Certificate** is not available"},{heading:"if-the-result-fails",content:"The certificate is already `REVOKED` for a final reason or is `EXPIRED`."},{heading:"if-the-result-fails",content:"The CRL download returns 404"},{heading:"if-the-result-fails",content:"The ID in the URL is not the issuing CA's: use the CDP of the certificate."},{heading:"if-the-result-fails",content:"`verify OK` fails"},{heading:"if-the-result-fails",content:"`ca.pem` is not the certificate of the CA that signed the list."},{heading:"if-the-result-fails",content:"The serial is not in the list"},{heading:"if-the-result-fails",content:"The list was downloaded before the revocation, or its regeneration failed. See CRL settings errors."},{heading:"if-the-result-fails",content:"`device-001` is also rejected"},{heading:"if-the-result-fails",content:"The certificate was revoked, or `ca.pem` does not match its issuer."},{heading:"if-the-result-fails",content:'<Card title="Manage certificates" description="Reasons, holds and reactivation." href="/docs/platform/pki/certificates" />'},{heading:"if-the-result-fails",content:'<Card title="Revocation lists (CRL)" description="Settings, regeneration and publication." href="/docs/platform/pki/crl" />'},{heading:"if-the-result-fails",content:'<Card title="Validate with OCSP" description="Query the signed status of a certificate." href="/docs/platform/pki/ocsp" />'}],headings:[{id:"before-you-begin",content:"Before you begin"},{id:"revoke-the-certificate",content:"Revoke the certificate"},{id:"find-the-certificate",content:"Find the certificate"},{id:"revoke-it",content:"Revoke it"},{id:"confirm-and-read-the-status",content:"Confirm and read the status"},{id:"download-the-certificate",content:"Download the certificate"},{id:"check-the-crl",content:"Check the CRL"},{id:"verify-with-the-list",content:"Verify with the list"},{id:"if-the-result-fails",content:"If the result fails"}]};const p=[{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:2,url:"#revoke-the-certificate",title:e.jsx(e.Fragment,{children:"Revoke the certificate"})},{depth:3,url:"#find-the-certificate",title:e.jsx(e.Fragment,{children:"Find the certificate"})},{depth:3,url:"#revoke-it",title:e.jsx(e.Fragment,{children:"Revoke it"})},{depth:3,url:"#confirm-and-read-the-status",title:e.jsx(e.Fragment,{children:"Confirm and read the status"})},{depth:2,url:"#download-the-certificate",title:e.jsx(e.Fragment,{children:"Download the certificate"})},{depth:2,url:"#check-the-crl",title:e.jsx(e.Fragment,{children:"Check the CRL"})},{depth:2,url:"#verify-with-the-list",title:e.jsx(e.Fragment,{children:"Verify with the list"})},{depth:2,url:"#if-the-result-fails",title:e.jsx(e.Fragment,{children:"If the result fails"})}];function d(s){const i={a:"a",code:"code",div:"div",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components},{Callout:r,Card:n,Cards:l,RevokeCertificateDemo:c,Step:a,Steps:h}=i;return r||t("Callout"),n||t("Card"),l||t("Cards"),c||t("RevokeCertificateDemo"),a||t("Step"),h||t("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["You will revoke the certificate of ",e.jsx(i.code,{children:"device-042"}),", one of the 100 certificates issued by the CA, and then check that the CA's revocation list (CRL) includes it while the other certificates remain valid. The result is a revoked certificate in Lamassu and a downloaded CRL that names its serial number and reason."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"before-you-begin",children:"Before you begin"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["A CA with issued certificates and permission to change their status. The example uses ",e.jsx(i.code,{children:"Acme Showcase Root CA"})," from ",e.jsx(i.a,{href:"/docs/platform/pki/quickstarts/create-certificate-authority",children:"Create your first CA"}),", with the 100 client certificates ",e.jsx(i.code,{children:"device-001"})," to ",e.jsx(i.code,{children:"device-100"}),". A smaller set works the same way."]}),`
`,e.jsxs(i.li,{children:["The CA's public certificate in ",e.jsx(i.code,{children:"ca.pem"}),", as saved in the first path."]}),`
`,e.jsxs(i.li,{children:["OpenSSL 3.x and ",e.jsx(i.code,{children:"curl"})," on a computer that can reach the CRL endpoint."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(r,{type:"warn",title:"Revocation is permanent for most reasons",children:e.jsxs(i.p,{children:["Only ",e.jsx(i.code,{children:"CertificateHold"})," can be undone later. Any other reason is final, so use an evaluation certificate for this path. Before revoking in production, identify the consumers of the identity and prepare a replacement."]})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"revoke-the-certificate",children:"Revoke the certificate"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Follow the interactive walkthrough. It opens the issuing CA, filters its ",e.jsx(i.strong,{children:"Issued Certificates"})," by Common Name to find ",e.jsx(i.code,{children:"device-042"})," among the 100, and revokes it with the reason ",e.jsx(i.code,{children:"KeyCompromise"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(c,{locale:"en"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"In the console, the steps are:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(h,{children:[e.jsxs(a,{children:[e.jsx(i.h3,{id:"find-the-certificate",children:"Find the certificate"}),e.jsxs(i.p,{children:["Open ",e.jsx(i.strong,{children:"Certification Authorities"}),", select the issuing CA and go to ",e.jsx(i.strong,{children:"Issued Certificates"}),". Search by ",e.jsx(i.code,{children:"Common Name"})," for ",e.jsx(i.code,{children:"device-042"}),". The CA's own certificate is also listed in this tab; do not confuse the two."]})]}),e.jsxs(a,{children:[e.jsx(i.h3,{id:"revoke-it",children:"Revoke it"}),e.jsxs(i.p,{children:["Open the ",e.jsx(i.strong,{children:"More actions"})," menu of the matching row and select ",e.jsx(i.strong,{children:"Revoke Certificate"}),". In the confirmation dialog, choose the ",e.jsx(i.strong,{children:"Revocation Reason"})," that describes the incident. This example uses ",e.jsx(i.code,{children:"KeyCompromise"}),", because the device key is considered exposed. Use ",e.jsx(i.code,{children:"CertificateHold"})," only for a reversible suspension."]})]}),e.jsxs(a,{children:[e.jsx(i.h3,{id:"confirm-and-read-the-status",children:"Confirm and read the status"}),e.jsxs(i.p,{children:["Select ",e.jsx(i.strong,{children:"Confirm Revocation"}),". The row changes to ",e.jsx(i.code,{children:"REVOKED"})," and shows the reason and the revocation time. If you need to verify the result later, read the record again rather than trusting the dialog."]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Revocation does not delete the certificate or its key, and it does not close sessions that are already established. See ",e.jsx(i.a,{href:"/docs/platform/pki/certificates#revoke-a-certificate",children:"Certificates"})," for the reasons and their consequences."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"download-the-certificate",children:"Download the certificate"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["From the same ",e.jsx(i.strong,{children:"More actions"})," menu, select ",e.jsx(i.strong,{children:"Download PEM"})," and save the file as ",e.jsx(i.code,{children:"device-042.crt"}),". Note its serial number and the CRL distribution point (CDP) it carries:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" x509"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -in"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" device-042.crt"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -noout"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -serial"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -ext"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" crlDistributionPoints"})]})})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"serial=A9EB398A86BA12F93A50BC6026977F91"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"X509v3 CRL Distribution Points:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"    Full Name:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"      URI:http://<LAMASSU_HOST>/api/va/crl/<CA_ID>"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The URL ends with the ID of the ",e.jsx(i.strong,{children:"issuing CA"}),", not the ID or serial of the certificate. Your serial number differs from the one shown."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"check-the-crl",children:"Check the CRL"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Lamassu regenerates the CA's CRL when a certificate is revoked, provided ",e.jsx(i.code,{children:"regenerate_on_revoke"})," is enabled; it is by default. The endpoint is public and does not require authentication. Replace the URL with the CDP of your certificate and download the list:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"CRL_URL"}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"'http://<LAMASSU_HOST>/api/va/crl/<CA_ID>'"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"curl"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --fail"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --show-error"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --silent"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --max-time"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" 15"}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'  "'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"$CRL_URL"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"'}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -o"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.crl.der"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" crl"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -inform"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" DER"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -in"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.crl.der"}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  -outform"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" PEM"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -out"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.crl.pem"})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Check that the list is signed by your CA, is current and contains the serial number:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" crl"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -in"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.crl.pem"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -noout"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -verify"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -CAfile"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.pem"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" crl"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -in"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.crl.pem"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -noout"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -issuer"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -lastupdate"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -nextupdate"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -crlnumber"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" crl"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -in"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.crl.pem"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -noout"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -text"})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"verify OK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"issuer=C=ES, O=Acme, CN=Acme Showcase Root CA"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"lastUpdate=Nov 17 17:02:45 2026 GMT"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"nextUpdate=Nov 24 17:02:45 2026 GMT"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"crlNumber=0x02"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Revoked Certificates:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"    Serial Number: A9EB398A86BA12F93A50BC6026977F91"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"        Revocation Date: Nov 17 17:02:45 2026 GMT"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"        CRL entry extensions:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"            X509v3 CRL Reason Code:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                Key Compromise"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Expect ",e.jsx(i.code,{children:"verify OK"}),", the expected issuer, a ",e.jsx(i.code,{children:"lastUpdate"})," not earlier than the revocation and an entry for the serial of ",e.jsx(i.code,{children:"device-042"})," with reason ",e.jsx(i.code,{children:"Key Compromise"}),"; the list also names any other certificate previously revoked by this CA. A CRL with the same number as before the revocation means it has not been regenerated yet."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"verify-with-the-list",children:"Verify with the list"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.code,{children:"openssl verify"})," can apply the downloaded list to a certificate. The revoked certificate must be rejected and any other certificate from the same CA must still pass. For ",e.jsx(i.code,{children:"device-001"}),", download its PEM in the same way and save it as ",e.jsx(i.code,{children:"device-001.crt"}),":"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"for"}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" cert "}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" device-042"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" device-001"}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"; "}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"do"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"  openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" verify"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -CAfile"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.pem"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -CRLfile"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.crl.pem"}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"    -crl_check"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -purpose"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" sslclient"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:' "'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"$cert"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'.crt"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"done"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"C=ES, O=Acme, CN=device-042"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"error 23 at 0 depth lookup: certificate revoked"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"error device-042.crt: verification failed"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"device-001.crt: OK"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["This check uses your local copy of the list: it does not download newer lists or prove that every client has refreshed its copy. For online status, see ",e.jsx(i.a,{href:"/docs/platform/pki/ocsp",children:"OCSP"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"if-the-result-fails",children:"If the result fails"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Result"}),e.jsx(i.th,{children:"What to review"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.strong,{children:"Revoke Certificate"})," is not available"]}),e.jsxs(i.td,{children:["The certificate is already ",e.jsx(i.code,{children:"REVOKED"})," for a final reason or is ",e.jsx(i.code,{children:"EXPIRED"}),"."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"The CRL download returns 404"}),e.jsx(i.td,{children:"The ID in the URL is not the issuing CA's: use the CDP of the certificate."})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"verify OK"})," fails"]}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"ca.pem"})," is not the certificate of the CA that signed the list."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"The serial is not in the list"}),e.jsxs(i.td,{children:["The list was downloaded before the revocation, or its regeneration failed. See ",e.jsx(i.a,{href:"/docs/platform/pki/crl#common-crl-settings-errors",children:"CRL settings errors"}),"."]})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"device-001"})," is also rejected"]}),e.jsxs(i.td,{children:["The certificate was revoked, or ",e.jsx(i.code,{children:"ca.pem"})," does not match its issuer."]})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(l,{children:[e.jsx(n,{title:"Manage certificates",description:"Reasons, holds and reactivation.",href:"/docs/platform/pki/certificates"}),e.jsx(n,{title:"Revocation lists (CRL)",description:"Settings, regeneration and publication.",href:"/docs/platform/pki/crl"}),e.jsx(n,{title:"Validate with OCSP",description:"Query the signed status of a certificate.",href:"/docs/platform/pki/ocsp"})]})})]})}function x(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(d,{...s})}):d(s)}function t(s,i){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}const v=Object.freeze(Object.defineProperty({__proto__:null,_markdown:o,default:x,frontmatter:f,lmDiff:m,structuredData:k,toc:p},Symbol.toStringTag,{value:"Module"}));export{v as _};
