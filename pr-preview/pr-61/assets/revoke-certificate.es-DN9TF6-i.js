import{j as e}from"./index-DqgIL_Rv.js";let h=`

<div className="lm-diff-ins lm-diff-block">
  Revocarás el certificado de \`device-042\`, uno de los 100 certificados emitidos por la CA, y después comprobarás que la lista de revocación (CRL) de la CA lo incluye mientras los demás certificados siguen siendo válidos. Al terminar tendrás un certificado revocado en Lamassu y una CRL descargada que recoge su número de serie y el motivo.
</div>

<div className="lm-diff-ins lm-diff-block">
  Antes de empezar [#antes-de-empezar]
</div>

<div className="lm-diff-ins lm-diff-block">
  * Una CA con certificados emitidos y permisos para cambiar su estado. El ejemplo utiliza \`Acme Showcase Root CA\`, de [Crea tu primera CA](/docs/platform/pki/quickstarts/create-certificate-authority), con los 100 certificados de cliente \`device-001\` a \`device-100\`. Con menos certificados el procedimiento es el mismo.
  * El certificado público de la CA en \`ca.pem\`, tal como se guardó en el primer recorrido.
  * OpenSSL 3.x y \`curl\` en un equipo con acceso al endpoint de la CRL.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="warn" title="La revocación es definitiva con casi todos los motivos">
    Solo \`CertificateHold\` puede deshacerse más adelante. Cualquier otro motivo es final, así que usa un certificado de evaluación en este recorrido. Antes de revocar en producción, identifica los consumidores de la identidad y prepara un reemplazo.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  Revoca el certificado [#revoca-el-certificado]
</div>

<div className="lm-diff-ins lm-diff-block">
  Sigue el recorrido interactivo. Abre la CA emisora, filtra sus **Issued Certificates** por Common Name para localizar \`device-042\` entre los 100 y lo revoca con el motivo \`KeyCompromise\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  <RevokeCertificateDemo locale="es" />
</div>

<div className="lm-diff-ins lm-diff-block">
  En la consola, los pasos son:
</div>

<div className="lm-diff-ins lm-diff-block">
  <Steps>
    <Step>
      Localiza el certificado [#localiza-el-certificado]

      Abre **Certification Authorities**, selecciona la CA emisora y entra en **Issued Certificates**. Busca \`device-042\` por \`Common Name\`. El certificado de la propia CA aparece también en esta pestaña; no los confundas.
    </Step>

    <Step>
      Revócalo [#revócalo]

      Abre el menú **More actions** de la fila encontrada y selecciona **Revoke Certificate**. En el diálogo de confirmación, elige el **Revocation Reason** que describa el incidente. Este ejemplo usa \`KeyCompromise\`, porque se considera que la clave del dispositivo está expuesta. Usa \`CertificateHold\` solo para una suspensión reversible.
    </Step>

    <Step>
      Confirma y lee el estado [#confirma-y-lee-el-estado]

      Selecciona **Confirm Revocation**. La fila pasa a \`REVOKED\` y muestra el motivo y la hora de revocación. Si necesitas verificarlo más tarde, vuelve a leer el registro en lugar de fiarte del diálogo.
    </Step>
  </Steps>
</div>

<div className="lm-diff-ins lm-diff-block">
  La revocación no elimina el certificado ni su clave, y no cierra las sesiones ya establecidas. Consulta [Certificados](/docs/platform/pki/certificates#revoca-un-certificado) para conocer los motivos y sus consecuencias.
</div>

<div className="lm-diff-ins lm-diff-block">
  Descarga el certificado [#descarga-el-certificado]
</div>

<div className="lm-diff-ins lm-diff-block">
  Desde el mismo menú **More actions**, selecciona **Download PEM** y guarda el archivo como \`device-042.crt\`. Anota su número de serie y el punto de distribución de CRL (CDP) que incluye:
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
  La URL termina con el ID de la **CA emisora**, no con el ID ni el número de serie del certificado. Tu número de serie será distinto del mostrado.
</div>

<div className="lm-diff-ins lm-diff-block">
  Comprueba la CRL [#comprueba-la-crl]
</div>

<div className="lm-diff-ins lm-diff-block">
  Lamassu regenera la CRL de la CA cuando se revoca un certificado, siempre que \`regenerate_on_revoke\` esté activado, como ocurre por defecto. El endpoint es público y no requiere autenticación. Sustituye la URL por el CDP de tu certificado y descarga la lista:
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
  Comprueba que la lista está firmada por tu CA, está vigente y contiene el número de serie:
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
  Debe aparecer \`verify OK\`, el emisor esperado, un \`lastUpdate\` no anterior a la revocación y una entrada con el número de serie de \`device-042\` y el motivo \`Key Compromise\`; la lista recoge también cualquier otro certificado que esta CA hubiera revocado antes. Si el número de CRL es el mismo que antes de revocar, la lista todavía no se ha regenerado.
</div>

<div className="lm-diff-ins lm-diff-block">
  Verifica con la lista [#verifica-con-la-lista]
</div>

<div className="lm-diff-ins lm-diff-block">
  \`openssl verify\` puede aplicar la lista descargada a un certificado. El certificado revocado debe rechazarse y cualquier otro certificado de la misma CA debe seguir superando la comprobación. Para \`device-001\`, descarga su PEM del mismo modo y guárdalo como \`device-001.crt\`:
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
  Esta comprobación usa tu copia local de la lista: no descarga listas más recientes ni demuestra que todos los clientes hayan refrescado la suya. Para consultar el estado en línea, consulta [OCSP](/docs/platform/pki/ocsp).
</div>

<div className="lm-diff-ins lm-diff-block">
  Si el resultado falla [#si-el-resultado-falla]
</div>

<div className="lm-diff-ins lm-diff-block">
  | Resultado                                 | Qué revisar                                                                                                                                                                           |
  | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | **Revoke Certificate** no está disponible | El certificado ya está \`REVOKED\` por un motivo final o está \`EXPIRED\`.                                                                                                                |
  | La descarga de la CRL devuelve 404        | El ID de la URL no es el de la CA emisora: usa el CDP del certificado.                                                                                                                |
  | \`verify OK\` no aparece                    | \`ca.pem\` no es el certificado de la CA que firmó la lista.                                                                                                                            |
  | El serial no está en la lista             | La lista se descargó antes de la revocación o su regeneración falló. Consulta los [errores de configuración de CRL](/docs/platform/pki/crl#errores-frecuentes-de-los-ajustes-de-crl). |
  | \`device-001\` también se rechaza           | El certificado fue revocado o \`ca.pem\` no corresponde a su emisor.                                                                                                                    |
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Gestionar certificados" description="Motivos, suspensiones y reactivación." href="/docs/platform/pki/certificates" />

    <Card title="Listas de revocación (CRL)" description="Configuración, regeneración y publicación." href="/docs/platform/pki/crl" />

    <Card title="Validar con OCSP" description="Consulta el estado firmado de un certificado." href="/docs/platform/pki/ocsp" />
  </Cards>
</div>
`,f={title:"Revoca un certificado y comprueba la CRL",description:"Revoca un certificado entre los muchos emitidos por una CA y confirma que su CRL lo incluye."},m={isNew:!0,changes:30,title:void 0,description:void 0},p={contents:[{heading:void 0,content:"Revocarás el certificado de `device-042`, uno de los 100 certificados emitidos por la CA, y después comprobarás que la lista de revocación (CRL) de la CA lo incluye mientras los demás certificados siguen siendo válidos. Al terminar tendrás un certificado revocado en Lamassu y una CRL descargada que recoge su número de serie y el motivo."},{heading:"antes-de-empezar",content:"Una CA con certificados emitidos y permisos para cambiar su estado. El ejemplo utiliza `Acme Showcase Root CA`, de Crea tu primera CA, con los 100 certificados de cliente `device-001` a `device-100`. Con menos certificados el procedimiento es el mismo."},{heading:"antes-de-empezar",content:"El certificado público de la CA en `ca.pem`, tal como se guardó en el primer recorrido."},{heading:"antes-de-empezar",content:"OpenSSL 3.x y `curl` en un equipo con acceso al endpoint de la CRL."},{heading:"antes-de-empezar",content:"Solo `CertificateHold` puede deshacerse más adelante. Cualquier otro motivo es final, así que usa un certificado de evaluación en este recorrido. Antes de revocar en producción, identifica los consumidores de la identidad y prepara un reemplazo."},{heading:"revoca-el-certificado",content:"Sigue el recorrido interactivo. Abre la CA emisora, filtra sus **Issued Certificates** por Common Name para localizar `device-042` entre los 100 y lo revoca con el motivo `KeyCompromise`."},{heading:"revoca-el-certificado",content:"En la consola, los pasos son:"},{heading:"localiza-el-certificado",content:"Abre **Certification Authorities**, selecciona la CA emisora y entra en **Issued Certificates**. Busca `device-042` por `Common Name`. El certificado de la propia CA aparece también en esta pestaña; no los confundas."},{heading:"revócalo",content:"Abre el menú **More actions** de la fila encontrada y selecciona **Revoke Certificate**. En el diálogo de confirmación, elige el **Revocation Reason** que describa el incidente. Este ejemplo usa `KeyCompromise`, porque se considera que la clave del dispositivo está expuesta. Usa `CertificateHold` solo para una suspensión reversible."},{heading:"confirma-y-lee-el-estado",content:"Selecciona **Confirm Revocation**. La fila pasa a `REVOKED` y muestra el motivo y la hora de revocación. Si necesitas verificarlo más tarde, vuelve a leer el registro en lugar de fiarte del diálogo."},{heading:"confirma-y-lee-el-estado",content:"La revocación no elimina el certificado ni su clave, y no cierra las sesiones ya establecidas. Consulta Certificados para conocer los motivos y sus consecuencias."},{heading:"descarga-el-certificado",content:"Desde el mismo menú **More actions**, selecciona **Download PEM** y guarda el archivo como `device-042.crt`. Anota su número de serie y el punto de distribución de CRL (CDP) que incluye:"},{heading:"descarga-el-certificado",content:"La URL termina con el ID de la **CA emisora**, no con el ID ni el número de serie del certificado. Tu número de serie será distinto del mostrado."},{heading:"comprueba-la-crl",content:"Lamassu regenera la CRL de la CA cuando se revoca un certificado, siempre que `regenerate_on_revoke` esté activado, como ocurre por defecto. El endpoint es público y no requiere autenticación. Sustituye la URL por el CDP de tu certificado y descarga la lista:"},{heading:"comprueba-la-crl",content:"Comprueba que la lista está firmada por tu CA, está vigente y contiene el número de serie:"},{heading:"comprueba-la-crl",content:"Debe aparecer `verify OK`, el emisor esperado, un `lastUpdate` no anterior a la revocación y una entrada con el número de serie de `device-042` y el motivo `Key Compromise`; la lista recoge también cualquier otro certificado que esta CA hubiera revocado antes. Si el número de CRL es el mismo que antes de revocar, la lista todavía no se ha regenerado."},{heading:"verifica-con-la-lista",content:"`openssl verify` puede aplicar la lista descargada a un certificado. El certificado revocado debe rechazarse y cualquier otro certificado de la misma CA debe seguir superando la comprobación. Para `device-001`, descarga su PEM del mismo modo y guárdalo como `device-001.crt`:"},{heading:"verifica-con-la-lista",content:"Esta comprobación usa tu copia local de la lista: no descarga listas más recientes ni demuestra que todos los clientes hayan refrescado la suya. Para consultar el estado en línea, consulta OCSP."},{heading:"si-el-resultado-falla",content:"Resultado"},{heading:"si-el-resultado-falla",content:"Qué revisar"},{heading:"si-el-resultado-falla",content:"**Revoke Certificate** no está disponible"},{heading:"si-el-resultado-falla",content:"El certificado ya está `REVOKED` por un motivo final o está `EXPIRED`."},{heading:"si-el-resultado-falla",content:"La descarga de la CRL devuelve 404"},{heading:"si-el-resultado-falla",content:"El ID de la URL no es el de la CA emisora: usa el CDP del certificado."},{heading:"si-el-resultado-falla",content:"`verify OK` no aparece"},{heading:"si-el-resultado-falla",content:"`ca.pem` no es el certificado de la CA que firmó la lista."},{heading:"si-el-resultado-falla",content:"El serial no está en la lista"},{heading:"si-el-resultado-falla",content:"La lista se descargó antes de la revocación o su regeneración falló. Consulta los errores de configuración de CRL."},{heading:"si-el-resultado-falla",content:"`device-001` también se rechaza"},{heading:"si-el-resultado-falla",content:"El certificado fue revocado o `ca.pem` no corresponde a su emisor."},{heading:"si-el-resultado-falla",content:'<Card title="Gestionar certificados" description="Motivos, suspensiones y reactivación." href="/docs/platform/pki/certificates" />'},{heading:"si-el-resultado-falla",content:'<Card title="Listas de revocación (CRL)" description="Configuración, regeneración y publicación." href="/docs/platform/pki/crl" />'},{heading:"si-el-resultado-falla",content:'<Card title="Validar con OCSP" description="Consulta el estado firmado de un certificado." href="/docs/platform/pki/ocsp" />'}],headings:[{id:"antes-de-empezar",content:"Antes de empezar"},{id:"revoca-el-certificado",content:"Revoca el certificado"},{id:"localiza-el-certificado",content:"Localiza el certificado"},{id:"revócalo",content:"Revócalo"},{id:"confirma-y-lee-el-estado",content:"Confirma y lee el estado"},{id:"descarga-el-certificado",content:"Descarga el certificado"},{id:"comprueba-la-crl",content:"Comprueba la CRL"},{id:"verifica-con-la-lista",content:"Verifica con la lista"},{id:"si-el-resultado-falla",content:"Si el resultado falla"}]};const u=[{depth:2,url:"#antes-de-empezar",title:e.jsx(e.Fragment,{children:"Antes de empezar"})},{depth:2,url:"#revoca-el-certificado",title:e.jsx(e.Fragment,{children:"Revoca el certificado"})},{depth:3,url:"#localiza-el-certificado",title:e.jsx(e.Fragment,{children:"Localiza el certificado"})},{depth:3,url:"#revócalo",title:e.jsx(e.Fragment,{children:"Revócalo"})},{depth:3,url:"#confirma-y-lee-el-estado",title:e.jsx(e.Fragment,{children:"Confirma y lee el estado"})},{depth:2,url:"#descarga-el-certificado",title:e.jsx(e.Fragment,{children:"Descarga el certificado"})},{depth:2,url:"#comprueba-la-crl",title:e.jsx(e.Fragment,{children:"Comprueba la CRL"})},{depth:2,url:"#verifica-con-la-lista",title:e.jsx(e.Fragment,{children:"Verifica con la lista"})},{depth:2,url:"#si-el-resultado-falla",title:e.jsx(e.Fragment,{children:"Si el resultado falla"})}];function t(s){const i={a:"a",code:"code",div:"div",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components},{Callout:c,Card:l,Cards:r,RevokeCertificateDemo:d,Step:n,Steps:o}=i;return c||a("Callout"),l||a("Card"),r||a("Cards"),d||a("RevokeCertificateDemo"),n||a("Step"),o||a("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Revocarás el certificado de ",e.jsx(i.code,{children:"device-042"}),", uno de los 100 certificados emitidos por la CA, y después comprobarás que la lista de revocación (CRL) de la CA lo incluye mientras los demás certificados siguen siendo válidos. Al terminar tendrás un certificado revocado en Lamassu y una CRL descargada que recoge su número de serie y el motivo."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"antes-de-empezar",children:"Antes de empezar"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Una CA con certificados emitidos y permisos para cambiar su estado. El ejemplo utiliza ",e.jsx(i.code,{children:"Acme Showcase Root CA"}),", de ",e.jsx(i.a,{href:"/docs/platform/pki/quickstarts/create-certificate-authority",children:"Crea tu primera CA"}),", con los 100 certificados de cliente ",e.jsx(i.code,{children:"device-001"})," a ",e.jsx(i.code,{children:"device-100"}),". Con menos certificados el procedimiento es el mismo."]}),`
`,e.jsxs(i.li,{children:["El certificado público de la CA en ",e.jsx(i.code,{children:"ca.pem"}),", tal como se guardó en el primer recorrido."]}),`
`,e.jsxs(i.li,{children:["OpenSSL 3.x y ",e.jsx(i.code,{children:"curl"})," en un equipo con acceso al endpoint de la CRL."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(c,{type:"warn",title:"La revocación es definitiva con casi todos los motivos",children:e.jsxs(i.p,{children:["Solo ",e.jsx(i.code,{children:"CertificateHold"})," puede deshacerse más adelante. Cualquier otro motivo es final, así que usa un certificado de evaluación en este recorrido. Antes de revocar en producción, identifica los consumidores de la identidad y prepara un reemplazo."]})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"revoca-el-certificado",children:"Revoca el certificado"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Sigue el recorrido interactivo. Abre la CA emisora, filtra sus ",e.jsx(i.strong,{children:"Issued Certificates"})," por Common Name para localizar ",e.jsx(i.code,{children:"device-042"})," entre los 100 y lo revoca con el motivo ",e.jsx(i.code,{children:"KeyCompromise"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(d,{locale:"es"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"En la consola, los pasos son:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(o,{children:[e.jsxs(n,{children:[e.jsx(i.h3,{id:"localiza-el-certificado",children:"Localiza el certificado"}),e.jsxs(i.p,{children:["Abre ",e.jsx(i.strong,{children:"Certification Authorities"}),", selecciona la CA emisora y entra en ",e.jsx(i.strong,{children:"Issued Certificates"}),". Busca ",e.jsx(i.code,{children:"device-042"})," por ",e.jsx(i.code,{children:"Common Name"}),". El certificado de la propia CA aparece también en esta pestaña; no los confundas."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"revócalo",children:"Revócalo"}),e.jsxs(i.p,{children:["Abre el menú ",e.jsx(i.strong,{children:"More actions"})," de la fila encontrada y selecciona ",e.jsx(i.strong,{children:"Revoke Certificate"}),". En el diálogo de confirmación, elige el ",e.jsx(i.strong,{children:"Revocation Reason"})," que describa el incidente. Este ejemplo usa ",e.jsx(i.code,{children:"KeyCompromise"}),", porque se considera que la clave del dispositivo está expuesta. Usa ",e.jsx(i.code,{children:"CertificateHold"})," solo para una suspensión reversible."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"confirma-y-lee-el-estado",children:"Confirma y lee el estado"}),e.jsxs(i.p,{children:["Selecciona ",e.jsx(i.strong,{children:"Confirm Revocation"}),". La fila pasa a ",e.jsx(i.code,{children:"REVOKED"})," y muestra el motivo y la hora de revocación. Si necesitas verificarlo más tarde, vuelve a leer el registro en lugar de fiarte del diálogo."]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["La revocación no elimina el certificado ni su clave, y no cierra las sesiones ya establecidas. Consulta ",e.jsx(i.a,{href:"/docs/platform/pki/certificates#revoca-un-certificado",children:"Certificados"})," para conocer los motivos y sus consecuencias."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"descarga-el-certificado",children:"Descarga el certificado"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Desde el mismo menú ",e.jsx(i.strong,{children:"More actions"}),", selecciona ",e.jsx(i.strong,{children:"Download PEM"})," y guarda el archivo como ",e.jsx(i.code,{children:"device-042.crt"}),". Anota su número de serie y el punto de distribución de CRL (CDP) que incluye:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" x509"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -in"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" device-042.crt"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -noout"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -serial"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -ext"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" crlDistributionPoints"})]})})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"serial=A9EB398A86BA12F93A50BC6026977F91"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"X509v3 CRL Distribution Points:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"    Full Name:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"      URI:http://<LAMASSU_HOST>/api/va/crl/<CA_ID>"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["La URL termina con el ID de la ",e.jsx(i.strong,{children:"CA emisora"}),", no con el ID ni el número de serie del certificado. Tu número de serie será distinto del mostrado."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"comprueba-la-crl",children:"Comprueba la CRL"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Lamassu regenera la CRL de la CA cuando se revoca un certificado, siempre que ",e.jsx(i.code,{children:"regenerate_on_revoke"})," esté activado, como ocurre por defecto. El endpoint es público y no requiere autenticación. Sustituye la URL por el CDP de tu certificado y descarga la lista:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"CRL_URL"}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"'http://<LAMASSU_HOST>/api/va/crl/<CA_ID>'"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"curl"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --fail"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --show-error"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --silent"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --max-time"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" 15"}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'  "'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"$CRL_URL"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"'}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -o"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.crl.der"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" crl"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -inform"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" DER"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -in"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.crl.der"}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  -outform"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" PEM"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -out"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.crl.pem"})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Comprueba que la lista está firmada por tu CA, está vigente y contiene el número de serie:"})}),`
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
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Debe aparecer ",e.jsx(i.code,{children:"verify OK"}),", el emisor esperado, un ",e.jsx(i.code,{children:"lastUpdate"})," no anterior a la revocación y una entrada con el número de serie de ",e.jsx(i.code,{children:"device-042"})," y el motivo ",e.jsx(i.code,{children:"Key Compromise"}),"; la lista recoge también cualquier otro certificado que esta CA hubiera revocado antes. Si el número de CRL es el mismo que antes de revocar, la lista todavía no se ha regenerado."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"verifica-con-la-lista",children:"Verifica con la lista"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.code,{children:"openssl verify"})," puede aplicar la lista descargada a un certificado. El certificado revocado debe rechazarse y cualquier otro certificado de la misma CA debe seguir superando la comprobación. Para ",e.jsx(i.code,{children:"device-001"}),", descarga su PEM del mismo modo y guárdalo como ",e.jsx(i.code,{children:"device-001.crt"}),":"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"for"}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" cert "}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" device-042"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" device-001"}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"; "}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"do"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"  openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" verify"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -CAfile"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.pem"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -CRLfile"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ca.crl.pem"}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"    -crl_check"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -purpose"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" sslclient"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:' "'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"$cert"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'.crt"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"done"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"C=ES, O=Acme, CN=device-042"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"error 23 at 0 depth lookup: certificate revoked"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"error device-042.crt: verification failed"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"device-001.crt: OK"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Esta comprobación usa tu copia local de la lista: no descarga listas más recientes ni demuestra que todos los clientes hayan refrescado la suya. Para consultar el estado en línea, consulta ",e.jsx(i.a,{href:"/docs/platform/pki/ocsp",children:"OCSP"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"si-el-resultado-falla",children:"Si el resultado falla"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Resultado"}),e.jsx(i.th,{children:"Qué revisar"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.strong,{children:"Revoke Certificate"})," no está disponible"]}),e.jsxs(i.td,{children:["El certificado ya está ",e.jsx(i.code,{children:"REVOKED"})," por un motivo final o está ",e.jsx(i.code,{children:"EXPIRED"}),"."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"La descarga de la CRL devuelve 404"}),e.jsx(i.td,{children:"El ID de la URL no es el de la CA emisora: usa el CDP del certificado."})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"verify OK"})," no aparece"]}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"ca.pem"})," no es el certificado de la CA que firmó la lista."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"El serial no está en la lista"}),e.jsxs(i.td,{children:["La lista se descargó antes de la revocación o su regeneración falló. Consulta los ",e.jsx(i.a,{href:"/docs/platform/pki/crl#errores-frecuentes-de-los-ajustes-de-crl",children:"errores de configuración de CRL"}),"."]})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"device-001"})," también se rechaza"]}),e.jsxs(i.td,{children:["El certificado fue revocado o ",e.jsx(i.code,{children:"ca.pem"})," no corresponde a su emisor."]})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(r,{children:[e.jsx(l,{title:"Gestionar certificados",description:"Motivos, suspensiones y reactivación.",href:"/docs/platform/pki/certificates"}),e.jsx(l,{title:"Listas de revocación (CRL)",description:"Configuración, regeneración y publicación.",href:"/docs/platform/pki/crl"}),e.jsx(l,{title:"Validar con OCSP",description:"Consulta el estado firmado de un certificado.",href:"/docs/platform/pki/ocsp"})]})})]})}function k(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(t,{...s})}):t(s)}function a(s,i){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}const x=Object.freeze(Object.defineProperty({__proto__:null,_markdown:h,default:k,frontmatter:f,lmDiff:m,structuredData:p,toc:u},Symbol.toStringTag,{value:"Module"}));export{x as _};
