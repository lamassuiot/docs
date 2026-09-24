import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let l=`

Una autoridad de certificación (CA) vincula identidades con claves públicas mediante certificados firmados. En Lamassu puedes crear una jerarquía nueva, utilizar una clave que ya está en el KMS o incorporar una CA externa.

Elige un flujo [#elige-un-flujo]

* **Nueva CA y nueva clave:** crea una raíz de confianza desde cero. Lamassu genera y custodia el par de claves.
* **Nueva CA desde KMS:** reutiliza una clave que ya está registrada en la plataforma.
* **Importar CA con clave privada:** incorpora una autoridad externa con la que Lamassu podrá emitir.
* **Importar solo el certificado:** añade una autoridad para construir cadenas y validar, pero no para emitir.

¿Es tu primera vez? Sigue [Crea tu primera CA](/docs/platform/pki/quickstarts/create-certificate-authority) para completar el recorrido mínimo.

Crea una autoridad nueva [#crea-una-autoridad-nueva]

Antes de empezar [#antes-de-empezar]

* Decide si la CA será raíz o intermedia.
* Elige el motor que custodiará la clave.
* Define una validez superior a la de los certificados que emitirá.
* Para una CA intermedia, asegúrate de que la CA padre esté activa.

<Steps>
  <Step>
    Abre el asistente [#abre-el-asistente]

    En **Certification Authorities**, selecciona **Create New CA** y elige generar un par de claves nuevo.
  </Step>

  <Step>
    Configura la clave [#configura-la-clave]

    Selecciona el motor criptográfico, el algoritmo y el tamaño o curva. Lamassu admite claves RSA y EC según las capacidades del motor.

    Para RSA puedes elegir 1024, 2048, 3072 o 4096 bits. Para EC están disponibles las curvas P-256, P-384 y P-521.
  </Step>

  <Step>
    Elige el tipo de CA [#elige-el-tipo-de-ca]

    Selecciona **Root CA** para una autoridad autofirmada o **Intermediate CA** para una autoridad firmada por otra CA. En el segundo caso, elige la CA emisora.
  </Step>

  <Step>
    Define la identidad [#define-la-identidad]

    Introduce un **CA Name** único. Este nombre se convierte en el \`Common Name\` del certificado. Completa los campos del Distinguished Name que necesite tu política:

    * \`C\`: código de país ISO 3166-1 de dos letras.
    * \`ST\`: estado o provincia.
    * \`L\`: localidad.
    * \`O\`: organización.
    * \`OU\`: unidad organizativa.

    El identificador interno de la CA se genera automáticamente y no se puede modificar.
  </Step>

  <Step>
    Configura validez y usos [#configura-validez-y-usos]

    Define **CA Certificate Expiration** y **Default End-Entity Certificate Issuance Expiration**. Puedes expresar una duración (\`5y 8w 4d\`), seleccionar una fecha o utilizar la fecha máxima permitida.

    Selecciona un perfil de emisión existente o configura los \`Key Usage\` y \`Extended Key Usage\` en el formulario. Si no eliges un perfil, Lamassu aplica los usos básicos predeterminados.
  </Step>

  <Step>
    Crea y verifica [#crea-y-verifica]

    Confirma el formulario. La CA debe aparecer en el inventario con su certificado PEM, estado, fecha de expiración y relación de certificados emitidos.
  </Step>
</Steps>

<Callout type="warn" title="Planifica la validez como una jerarquía">
  Una CA no puede emitir certificados que superen su propia fecha de expiración. Deja margen suficiente para renovar o sustituir la autoridad sin interrumpir a los consumidores.
</Callout>

Utiliza una clave del KMS [#utiliza-una-clave-del-kms]

Selecciona **Create New CA (Existing Key)** cuando la clave ya esté registrada en Lamassu. El asistente pide primero la clave de soporte y después muestra la misma configuración de tipo, identidad, validez y perfil.

Este flujo resulta útil cuando la clave se creó previamente en un HSM, se importó mediante BYOK o debe reutilizarse con una política de custodia concreta.

Importa una CA externa [#importa-una-ca-externa]

La importación conserva una autoridad creada fuera de Lamassu.

<Steps>
  <Step>
    Selecciona el motor [#selecciona-el-motor]

    Elige el motor que custodiará la clave importada.
  </Step>

  <Step>
    Carga el material [#carga-el-material]

    Proporciona el certificado de CA y la clave privada en formato PEM. Para una CA subordinada, añade opcionalmente la cadena de validación.
  </Step>

  <Step>
    Define la emisión predeterminada [#define-la-emisión-predeterminada]

    Configura la validez que recibirán los certificados finales cuando una solicitud no indique otra duración.
  </Step>

  <Step>
    Verifica la importación [#verifica-la-importación]

    Lamassu comprueba que el certificado pertenece a una CA y que el material es coherente antes de registrarlo.
  </Step>
</Steps>

Si no dispones de la clave privada, importa únicamente el certificado. La autoridad podrá formar parte de cadenas de confianza y procesos de validación, pero no podrá emitir certificados desde Lamassu.

Inspecciona una autoridad [#inspecciona-una-autoridad]

Abre una CA desde el inventario para consultar:

* Estado y periodo de validez.
* Certificado y cadena en formato PEM.
* Número de certificados activos, expirados y revocados.
* Certificados emitidos en **Issued Certificates**.
* CRL vinculada a la autoridad.
* Metadatos y motor criptográfico asociado.

Puedes filtrar el inventario por nombre, estado y tipo de CA.

Emite certificados [#emite-certificados]

Puedes iniciar una emisión desde **Issued Certificates**, desde la acción de una CA o desde el inventario global de certificados.

**Generate Key & CSR in Browser** resulta útil para una operación manual o una prueba rápida. El navegador genera la clave y debes descargarla al finalizar.

**Upload Existing CSR** es la opción adecuada cuando la clave debe permanecer en el sistema de destino. Lamassu recibe la solicitud, pero nunca la clave privada.

Sigue [Emite tu primer certificado](/docs/platform/pki/quickstarts/issue-certificate) para el flujo guiado. La [gestión de certificados](/docs/platform/pki/certificates) explica el inventario, la inspección y la revocación.

Revoca una CA [#revoca-una-ca]

<Callout type="warn" title="La revocación afecta a toda la cadena dependiente">
  Revocar una CA invalida la confianza en los certificados que ha emitido y puede interrumpir dispositivos y servicios. La acción es irreversible.
</Callout>

<Steps>
  <Step>
    Evalúa el impacto [#evalúa-el-impacto]

    Identifica los certificados, dispositivos y consumidores que dependen de la CA. Prepara una autoridad y una cadena de sustitución cuando sea necesario.
  </Step>

  <Step>
    Inicia la revocación [#inicia-la-revocación]

    Abre la autoridad y selecciona **Revoke CA**. Elige la razón que describa el incidente, por ejemplo \`KeyCompromise\`, \`CACompromise\`, \`Superseded\` o \`CessationOfOperation\`.
  </Step>

  <Step>
    Confirma la identidad [#confirma-la-identidad]

    Escribe exactamente el nombre de la CA para habilitar **Confirm Revocation**.
  </Step>

  <Step>
    Comprueba la publicación [#comprueba-la-publicación]

    El estado debe cambiar a **REVOKED** y la CRL debe reflejar la nueva información. La CA deja de poder emitir certificados.
  </Step>
</Steps>

La eliminación permanente solo está disponible después de revocar. Elimina el registro únicamente cuando la política de retención y auditoría lo permita.
`,s={title:"Autoridades de certificación",description:"Crea, importa y opera las autoridades que establecen la confianza de tu PKI.",sidebar:{group:"CA",label:"Autoridades"}},u={contents:[{heading:void 0,content:"Una autoridad de certificación (CA) vincula identidades con claves públicas mediante certificados firmados. En Lamassu puedes crear una jerarquía nueva, utilizar una clave que ya está en el KMS o incorporar una CA externa."},{heading:"elige-un-flujo",content:"**Nueva CA y nueva clave:** crea una raíz de confianza desde cero. Lamassu genera y custodia el par de claves."},{heading:"elige-un-flujo",content:"**Nueva CA desde KMS:** reutiliza una clave que ya está registrada en la plataforma."},{heading:"elige-un-flujo",content:"**Importar CA con clave privada:** incorpora una autoridad externa con la que Lamassu podrá emitir."},{heading:"elige-un-flujo",content:"**Importar solo el certificado:** añade una autoridad para construir cadenas y validar, pero no para emitir."},{heading:"elige-un-flujo",content:"¿Es tu primera vez? Sigue Crea tu primera CA para completar el recorrido mínimo."},{heading:"antes-de-empezar",content:"Decide si la CA será raíz o intermedia."},{heading:"antes-de-empezar",content:"Elige el motor que custodiará la clave."},{heading:"antes-de-empezar",content:"Define una validez superior a la de los certificados que emitirá."},{heading:"antes-de-empezar",content:"Para una CA intermedia, asegúrate de que la CA padre esté activa."},{heading:"abre-el-asistente",content:"En **Certification Authorities**, selecciona **Create New CA** y elige generar un par de claves nuevo."},{heading:"configura-la-clave",content:"Selecciona el motor criptográfico, el algoritmo y el tamaño o curva. Lamassu admite claves RSA y EC según las capacidades del motor."},{heading:"configura-la-clave",content:"Para RSA puedes elegir 1024, 2048, 3072 o 4096 bits. Para EC están disponibles las curvas P-256, P-384 y P-521."},{heading:"elige-el-tipo-de-ca",content:"Selecciona **Root CA** para una autoridad autofirmada o **Intermediate CA** para una autoridad firmada por otra CA. En el segundo caso, elige la CA emisora."},{heading:"define-la-identidad",content:"Introduce un **CA Name** único. Este nombre se convierte en el `Common Name` del certificado. Completa los campos del Distinguished Name que necesite tu política:"},{heading:"define-la-identidad",content:"`C`: código de país ISO 3166-1 de dos letras."},{heading:"define-la-identidad",content:"`ST`: estado o provincia."},{heading:"define-la-identidad",content:"`L`: localidad."},{heading:"define-la-identidad",content:"`O`: organización."},{heading:"define-la-identidad",content:"`OU`: unidad organizativa."},{heading:"define-la-identidad",content:"El identificador interno de la CA se genera automáticamente y no se puede modificar."},{heading:"configura-validez-y-usos",content:"Define **CA Certificate Expiration** y **Default End-Entity Certificate Issuance Expiration**. Puedes expresar una duración (`5y 8w 4d`), seleccionar una fecha o utilizar la fecha máxima permitida."},{heading:"configura-validez-y-usos",content:"Selecciona un perfil de emisión existente o configura los `Key Usage` y `Extended Key Usage` en el formulario. Si no eliges un perfil, Lamassu aplica los usos básicos predeterminados."},{heading:"crea-y-verifica",content:"Confirma el formulario. La CA debe aparecer en el inventario con su certificado PEM, estado, fecha de expiración y relación de certificados emitidos."},{heading:"crea-y-verifica",content:"Una CA no puede emitir certificados que superen su propia fecha de expiración. Deja margen suficiente para renovar o sustituir la autoridad sin interrumpir a los consumidores."},{heading:"utiliza-una-clave-del-kms",content:"Selecciona &#x2A;*Create New CA (Existing Key)** cuando la clave ya esté registrada en Lamassu. El asistente pide primero la clave de soporte y después muestra la misma configuración de tipo, identidad, validez y perfil."},{heading:"utiliza-una-clave-del-kms",content:"Este flujo resulta útil cuando la clave se creó previamente en un HSM, se importó mediante BYOK o debe reutilizarse con una política de custodia concreta."},{heading:"importa-una-ca-externa",content:"La importación conserva una autoridad creada fuera de Lamassu."},{heading:"selecciona-el-motor",content:"Elige el motor que custodiará la clave importada."},{heading:"carga-el-material",content:"Proporciona el certificado de CA y la clave privada en formato PEM. Para una CA subordinada, añade opcionalmente la cadena de validación."},{heading:"define-la-emisión-predeterminada",content:"Configura la validez que recibirán los certificados finales cuando una solicitud no indique otra duración."},{heading:"verifica-la-importación",content:"Lamassu comprueba que el certificado pertenece a una CA y que el material es coherente antes de registrarlo."},{heading:"verifica-la-importación",content:"Si no dispones de la clave privada, importa únicamente el certificado. La autoridad podrá formar parte de cadenas de confianza y procesos de validación, pero no podrá emitir certificados desde Lamassu."},{heading:"inspecciona-una-autoridad",content:"Abre una CA desde el inventario para consultar:"},{heading:"inspecciona-una-autoridad",content:"Estado y periodo de validez."},{heading:"inspecciona-una-autoridad",content:"Certificado y cadena en formato PEM."},{heading:"inspecciona-una-autoridad",content:"Número de certificados activos, expirados y revocados."},{heading:"inspecciona-una-autoridad",content:"Certificados emitidos en **Issued Certificates**."},{heading:"inspecciona-una-autoridad",content:"CRL vinculada a la autoridad."},{heading:"inspecciona-una-autoridad",content:"Metadatos y motor criptográfico asociado."},{heading:"inspecciona-una-autoridad",content:"Puedes filtrar el inventario por nombre, estado y tipo de CA."},{heading:"emite-certificados",content:"Puedes iniciar una emisión desde **Issued Certificates**, desde la acción de una CA o desde el inventario global de certificados."},{heading:"emite-certificados",content:"**Generate Key & CSR in Browser** resulta útil para una operación manual o una prueba rápida. El navegador genera la clave y debes descargarla al finalizar."},{heading:"emite-certificados",content:"**Upload Existing CSR** es la opción adecuada cuando la clave debe permanecer en el sistema de destino. Lamassu recibe la solicitud, pero nunca la clave privada."},{heading:"emite-certificados",content:"Sigue Emite tu primer certificado para el flujo guiado. La gestión de certificados explica el inventario, la inspección y la revocación."},{heading:"revoca-una-ca",content:"Revocar una CA invalida la confianza en los certificados que ha emitido y puede interrumpir dispositivos y servicios. La acción es irreversible."},{heading:"evalúa-el-impacto",content:"Identifica los certificados, dispositivos y consumidores que dependen de la CA. Prepara una autoridad y una cadena de sustitución cuando sea necesario."},{heading:"inicia-la-revocación",content:"Abre la autoridad y selecciona **Revoke CA**. Elige la razón que describa el incidente, por ejemplo `KeyCompromise`, `CACompromise`, `Superseded` o `CessationOfOperation`."},{heading:"confirma-la-identidad",content:"Escribe exactamente el nombre de la CA para habilitar **Confirm Revocation**."},{heading:"comprueba-la-publicación",content:"El estado debe cambiar a **REVOKED** y la CRL debe reflejar la nueva información. La CA deja de poder emitir certificados."},{heading:"comprueba-la-publicación",content:"La eliminación permanente solo está disponible después de revocar. Elimina el registro únicamente cuando la política de retención y auditoría lo permita."}],headings:[{id:"elige-un-flujo",content:"Elige un flujo"},{id:"crea-una-autoridad-nueva",content:"Crea una autoridad nueva"},{id:"antes-de-empezar",content:"Antes de empezar"},{id:"abre-el-asistente",content:"Abre el asistente"},{id:"configura-la-clave",content:"Configura la clave"},{id:"elige-el-tipo-de-ca",content:"Elige el tipo de CA"},{id:"define-la-identidad",content:"Define la identidad"},{id:"configura-validez-y-usos",content:"Configura validez y usos"},{id:"crea-y-verifica",content:"Crea y verifica"},{id:"utiliza-una-clave-del-kms",content:"Utiliza una clave del KMS"},{id:"importa-una-ca-externa",content:"Importa una CA externa"},{id:"selecciona-el-motor",content:"Selecciona el motor"},{id:"carga-el-material",content:"Carga el material"},{id:"define-la-emisión-predeterminada",content:"Define la emisión predeterminada"},{id:"verifica-la-importación",content:"Verifica la importación"},{id:"inspecciona-una-autoridad",content:"Inspecciona una autoridad"},{id:"emite-certificados",content:"Emite certificados"},{id:"revoca-una-ca",content:"Revoca una CA"},{id:"evalúa-el-impacto",content:"Evalúa el impacto"},{id:"inicia-la-revocación",content:"Inicia la revocación"},{id:"confirma-la-identidad",content:"Confirma la identidad"},{id:"comprueba-la-publicación",content:"Comprueba la publicación"}]};const p=[{depth:2,url:"#elige-un-flujo",title:e.jsx(e.Fragment,{children:"Elige un flujo"})},{depth:2,url:"#crea-una-autoridad-nueva",title:e.jsx(e.Fragment,{children:"Crea una autoridad nueva"})},{depth:3,url:"#antes-de-empezar",title:e.jsx(e.Fragment,{children:"Antes de empezar"})},{depth:3,url:"#abre-el-asistente",title:e.jsx(e.Fragment,{children:"Abre el asistente"})},{depth:3,url:"#configura-la-clave",title:e.jsx(e.Fragment,{children:"Configura la clave"})},{depth:3,url:"#elige-el-tipo-de-ca",title:e.jsx(e.Fragment,{children:"Elige el tipo de CA"})},{depth:3,url:"#define-la-identidad",title:e.jsx(e.Fragment,{children:"Define la identidad"})},{depth:3,url:"#configura-validez-y-usos",title:e.jsx(e.Fragment,{children:"Configura validez y usos"})},{depth:3,url:"#crea-y-verifica",title:e.jsx(e.Fragment,{children:"Crea y verifica"})},{depth:2,url:"#utiliza-una-clave-del-kms",title:e.jsx(e.Fragment,{children:"Utiliza una clave del KMS"})},{depth:2,url:"#importa-una-ca-externa",title:e.jsx(e.Fragment,{children:"Importa una CA externa"})},{depth:3,url:"#selecciona-el-motor",title:e.jsx(e.Fragment,{children:"Selecciona el motor"})},{depth:3,url:"#carga-el-material",title:e.jsx(e.Fragment,{children:"Carga el material"})},{depth:3,url:"#define-la-emisión-predeterminada",title:e.jsx(e.Fragment,{children:"Define la emisión predeterminada"})},{depth:3,url:"#verifica-la-importación",title:e.jsx(e.Fragment,{children:"Verifica la importación"})},{depth:2,url:"#inspecciona-una-autoridad",title:e.jsx(e.Fragment,{children:"Inspecciona una autoridad"})},{depth:2,url:"#emite-certificados",title:e.jsx(e.Fragment,{children:"Emite certificados"})},{depth:2,url:"#revoca-una-ca",title:e.jsx(e.Fragment,{children:"Revoca una CA"})},{depth:3,url:"#evalúa-el-impacto",title:e.jsx(e.Fragment,{children:"Evalúa el impacto"})},{depth:3,url:"#inicia-la-revocación",title:e.jsx(e.Fragment,{children:"Inicia la revocación"})},{depth:3,url:"#confirma-la-identidad",title:e.jsx(e.Fragment,{children:"Confirma la identidad"})},{depth:3,url:"#comprueba-la-publicación",title:e.jsx(e.Fragment,{children:"Comprueba la publicación"})}];function o(n){const a={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...n.components},{Callout:d,Step:i,Steps:r}=a;return d||t("Callout"),i||t("Step"),r||t("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(a.p,{children:"Una autoridad de certificación (CA) vincula identidades con claves públicas mediante certificados firmados. En Lamassu puedes crear una jerarquía nueva, utilizar una clave que ya está en el KMS o incorporar una CA externa."}),`
`,e.jsx(a.h2,{id:"elige-un-flujo",children:"Elige un flujo"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Nueva CA y nueva clave:"})," crea una raíz de confianza desde cero. Lamassu genera y custodia el par de claves."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Nueva CA desde KMS:"})," reutiliza una clave que ya está registrada en la plataforma."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Importar CA con clave privada:"})," incorpora una autoridad externa con la que Lamassu podrá emitir."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Importar solo el certificado:"})," añade una autoridad para construir cadenas y validar, pero no para emitir."]}),`
`]}),`
`,e.jsxs(a.p,{children:["¿Es tu primera vez? Sigue ",e.jsx(a.a,{href:"/docs/platform/pki/quickstarts/create-certificate-authority",children:"Crea tu primera CA"})," para completar el recorrido mínimo."]}),`
`,e.jsx(a.h2,{id:"crea-una-autoridad-nueva",children:"Crea una autoridad nueva"}),`
`,e.jsx(a.h3,{id:"antes-de-empezar",children:"Antes de empezar"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Decide si la CA será raíz o intermedia."}),`
`,e.jsx(a.li,{children:"Elige el motor que custodiará la clave."}),`
`,e.jsx(a.li,{children:"Define una validez superior a la de los certificados que emitirá."}),`
`,e.jsx(a.li,{children:"Para una CA intermedia, asegúrate de que la CA padre esté activa."}),`
`]}),`
`,e.jsxs(r,{children:[e.jsxs(i,{children:[e.jsx(a.h3,{id:"abre-el-asistente",children:"Abre el asistente"}),e.jsxs(a.p,{children:["En ",e.jsx(a.strong,{children:"Certification Authorities"}),", selecciona ",e.jsx(a.strong,{children:"Create New CA"})," y elige generar un par de claves nuevo."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"configura-la-clave",children:"Configura la clave"}),e.jsx(a.p,{children:"Selecciona el motor criptográfico, el algoritmo y el tamaño o curva. Lamassu admite claves RSA y EC según las capacidades del motor."}),e.jsx(a.p,{children:"Para RSA puedes elegir 1024, 2048, 3072 o 4096 bits. Para EC están disponibles las curvas P-256, P-384 y P-521."})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"elige-el-tipo-de-ca",children:"Elige el tipo de CA"}),e.jsxs(a.p,{children:["Selecciona ",e.jsx(a.strong,{children:"Root CA"})," para una autoridad autofirmada o ",e.jsx(a.strong,{children:"Intermediate CA"})," para una autoridad firmada por otra CA. En el segundo caso, elige la CA emisora."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"define-la-identidad",children:"Define la identidad"}),e.jsxs(a.p,{children:["Introduce un ",e.jsx(a.strong,{children:"CA Name"})," único. Este nombre se convierte en el ",e.jsx(a.code,{children:"Common Name"})," del certificado. Completa los campos del Distinguished Name que necesite tu política:"]}),e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"C"}),": código de país ISO 3166-1 de dos letras."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"ST"}),": estado o provincia."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"L"}),": localidad."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"O"}),": organización."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"OU"}),": unidad organizativa."]}),`
`]}),e.jsx(a.p,{children:"El identificador interno de la CA se genera automáticamente y no se puede modificar."})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"configura-validez-y-usos",children:"Configura validez y usos"}),e.jsxs(a.p,{children:["Define ",e.jsx(a.strong,{children:"CA Certificate Expiration"})," y ",e.jsx(a.strong,{children:"Default End-Entity Certificate Issuance Expiration"}),". Puedes expresar una duración (",e.jsx(a.code,{children:"5y 8w 4d"}),"), seleccionar una fecha o utilizar la fecha máxima permitida."]}),e.jsxs(a.p,{children:["Selecciona un perfil de emisión existente o configura los ",e.jsx(a.code,{children:"Key Usage"})," y ",e.jsx(a.code,{children:"Extended Key Usage"})," en el formulario. Si no eliges un perfil, Lamassu aplica los usos básicos predeterminados."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"crea-y-verifica",children:"Crea y verifica"}),e.jsx(a.p,{children:"Confirma el formulario. La CA debe aparecer en el inventario con su certificado PEM, estado, fecha de expiración y relación de certificados emitidos."})]})]}),`
`,e.jsx(d,{type:"warn",title:"Planifica la validez como una jerarquía",children:e.jsx(a.p,{children:"Una CA no puede emitir certificados que superen su propia fecha de expiración. Deja margen suficiente para renovar o sustituir la autoridad sin interrumpir a los consumidores."})}),`
`,e.jsx(a.h2,{id:"utiliza-una-clave-del-kms",children:"Utiliza una clave del KMS"}),`
`,e.jsxs(a.p,{children:["Selecciona ",e.jsx(a.strong,{children:"Create New CA (Existing Key)"})," cuando la clave ya esté registrada en Lamassu. El asistente pide primero la clave de soporte y después muestra la misma configuración de tipo, identidad, validez y perfil."]}),`
`,e.jsx(a.p,{children:"Este flujo resulta útil cuando la clave se creó previamente en un HSM, se importó mediante BYOK o debe reutilizarse con una política de custodia concreta."}),`
`,e.jsx(a.h2,{id:"importa-una-ca-externa",children:"Importa una CA externa"}),`
`,e.jsx(a.p,{children:"La importación conserva una autoridad creada fuera de Lamassu."}),`
`,e.jsxs(r,{children:[e.jsxs(i,{children:[e.jsx(a.h3,{id:"selecciona-el-motor",children:"Selecciona el motor"}),e.jsx(a.p,{children:"Elige el motor que custodiará la clave importada."})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"carga-el-material",children:"Carga el material"}),e.jsx(a.p,{children:"Proporciona el certificado de CA y la clave privada en formato PEM. Para una CA subordinada, añade opcionalmente la cadena de validación."})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"define-la-emisión-predeterminada",children:"Define la emisión predeterminada"}),e.jsx(a.p,{children:"Configura la validez que recibirán los certificados finales cuando una solicitud no indique otra duración."})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"verifica-la-importación",children:"Verifica la importación"}),e.jsx(a.p,{children:"Lamassu comprueba que el certificado pertenece a una CA y que el material es coherente antes de registrarlo."})]})]}),`
`,e.jsx(a.p,{children:"Si no dispones de la clave privada, importa únicamente el certificado. La autoridad podrá formar parte de cadenas de confianza y procesos de validación, pero no podrá emitir certificados desde Lamassu."}),`
`,e.jsx(a.h2,{id:"inspecciona-una-autoridad",children:"Inspecciona una autoridad"}),`
`,e.jsx(a.p,{children:"Abre una CA desde el inventario para consultar:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Estado y periodo de validez."}),`
`,e.jsx(a.li,{children:"Certificado y cadena en formato PEM."}),`
`,e.jsx(a.li,{children:"Número de certificados activos, expirados y revocados."}),`
`,e.jsxs(a.li,{children:["Certificados emitidos en ",e.jsx(a.strong,{children:"Issued Certificates"}),"."]}),`
`,e.jsx(a.li,{children:"CRL vinculada a la autoridad."}),`
`,e.jsx(a.li,{children:"Metadatos y motor criptográfico asociado."}),`
`]}),`
`,e.jsx(a.p,{children:"Puedes filtrar el inventario por nombre, estado y tipo de CA."}),`
`,e.jsx(a.h2,{id:"emite-certificados",children:"Emite certificados"}),`
`,e.jsxs(a.p,{children:["Puedes iniciar una emisión desde ",e.jsx(a.strong,{children:"Issued Certificates"}),", desde la acción de una CA o desde el inventario global de certificados."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Generate Key & CSR in Browser"})," resulta útil para una operación manual o una prueba rápida. El navegador genera la clave y debes descargarla al finalizar."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Upload Existing CSR"})," es la opción adecuada cuando la clave debe permanecer en el sistema de destino. Lamassu recibe la solicitud, pero nunca la clave privada."]}),`
`,e.jsxs(a.p,{children:["Sigue ",e.jsx(a.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"Emite tu primer certificado"})," para el flujo guiado. La ",e.jsx(a.a,{href:"/docs/platform/pki/certificates",children:"gestión de certificados"})," explica el inventario, la inspección y la revocación."]}),`
`,e.jsx(a.h2,{id:"revoca-una-ca",children:"Revoca una CA"}),`
`,e.jsx(d,{type:"warn",title:"La revocación afecta a toda la cadena dependiente",children:e.jsx(a.p,{children:"Revocar una CA invalida la confianza en los certificados que ha emitido y puede interrumpir dispositivos y servicios. La acción es irreversible."})}),`
`,e.jsxs(r,{children:[e.jsxs(i,{children:[e.jsx(a.h3,{id:"evalúa-el-impacto",children:"Evalúa el impacto"}),e.jsx(a.p,{children:"Identifica los certificados, dispositivos y consumidores que dependen de la CA. Prepara una autoridad y una cadena de sustitución cuando sea necesario."})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"inicia-la-revocación",children:"Inicia la revocación"}),e.jsxs(a.p,{children:["Abre la autoridad y selecciona ",e.jsx(a.strong,{children:"Revoke CA"}),". Elige la razón que describa el incidente, por ejemplo ",e.jsx(a.code,{children:"KeyCompromise"}),", ",e.jsx(a.code,{children:"CACompromise"}),", ",e.jsx(a.code,{children:"Superseded"})," o ",e.jsx(a.code,{children:"CessationOfOperation"}),"."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"confirma-la-identidad",children:"Confirma la identidad"}),e.jsxs(a.p,{children:["Escribe exactamente el nombre de la CA para habilitar ",e.jsx(a.strong,{children:"Confirm Revocation"}),"."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"comprueba-la-publicación",children:"Comprueba la publicación"}),e.jsxs(a.p,{children:["El estado debe cambiar a ",e.jsx(a.strong,{children:"REVOKED"})," y la CRL debe reflejar la nueva información. La CA deja de poder emitir certificados."]})]})]}),`
`,e.jsx(a.p,{children:"La eliminación permanente solo está disponible después de revocar. Elimina el registro únicamente cuando la política de retención y auditoría lo permita."})]})}function m(n={}){const{wrapper:a}=n.components||{};return a?e.jsx(a,{...n,children:e.jsx(o,{...n})}):o(n)}function t(n,a){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{l as _markdown,m as default,s as frontmatter,u as structuredData,p as toc};
