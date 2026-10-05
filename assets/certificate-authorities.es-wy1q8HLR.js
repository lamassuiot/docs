import{j as e}from"./index-prc0XQdj.js";let d=`

Una autoridad de certificación (CA) vincula identidades con claves públicas mediante certificados firmados. En Lamassu puedes crear una jerarquía nueva, utilizar una clave que ya está en el KMS o incorporar una CA externa.

Para diseñar una cadena completa o sustituir una autoridad en producción, consulta [Jerarquía y rotación de CAs](/docs/platform/pki/ca-hierarchy-and-rotation). Si necesitas estandarizar qué puede firmar cada autoridad, utiliza [Perfiles de certificado](/docs/platform/pki/certificate-profiles).

Para administrar CAs necesitas permisos sobre las autoridades y las claves, un motor accesible y un perfil revisado. La CA de un consumidor externo no queda confiada por aparecer en este inventario: acuerda por separado la distribución de su raíz y cadena.

Elige un flujo [#elige-un-flujo]

* **Nueva CA y nueva clave:** crea una raíz de confianza desde cero. Lamassu genera y custodia el par de claves.
* **Nueva CA desde KMS:** reutiliza una clave que ya está registrada en la plataforma.
* **Importar CA con clave privada:** incorpora una autoridad externa con la que Lamassu podrá emitir.
* **Importar solo el certificado:** registra material público. Si Lamassu encuentra su clave en el KMS, puede asociarla; si no la encuentra, la CA queda sin clave utilizable para emitir.

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

    Utiliza únicamente tamaños y curvas admitidos por el motor y por la política criptográfica del perfil. Consulta [Claves y motores](/docs/platform/pki/key-management) antes de reutilizar material externo.
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

    Revisa por separado el certificado de la propia CA y el perfil predeterminado para lo que emitirá después. Elige una política explícita de [emisión](/docs/platform/pki/certificate-profiles); no confíes en que los valores iniciales del formulario sean adecuados para tus consumidores.
  </Step>

  <Step>
    Crea y verifica [#crea-y-verifica]

    Confirma el formulario y abre la CA. Comprueba estado, emisor, fechas, motor y clave asociados. Descarga el certificado: debe tener \`CA:TRUE\` y un uso que permita firmar certificados. Verifica la autofirma para una raíz o la cadena hasta tu raíz para una intermedia. Completa una emisión de prueba para comprobar que la clave realmente puede firmar.
  </Step>
</Steps>

<Callout type="warn" title="Planifica la validez como una jerarquía">
  Planifica y verifica los vencimientos con las reglas de [Perfiles](/docs/platform/pki/certificate-profiles). La emisión no recorta automáticamente la validez al vencimiento del emisor; deja margen para sustituir la autoridad y renovar las identidades.
</Callout>

Utiliza una clave del KMS [#utiliza-una-clave-del-kms]

Selecciona **Create New CA (Existing Key)** cuando la clave ya esté registrada en Lamassu. El asistente pide primero la clave de soporte y después muestra la misma configuración de tipo, identidad, validez y perfil.

Este flujo resulta útil cuando la clave se creó previamente en un HSM, se importó mediante BYOK o debe reutilizarse con una política de custodia concreta.

Importa una CA externa [#importa-una-ca-externa]

Necesitas el certificado de CA en PEM, su cadena hasta una raíz conocida y, si vas a importarla, una clave privada exportable. Antes de cargar el material, verifica firma, fechas, \`CA:TRUE\`, usos de firma y correspondencia de la clave pública. El procedimiento de [verificación de claves](/docs/platform/pki/quickstarts/issue-certificate) también sirve para comparar la clave y el certificado de una CA.

<Steps>
  <Step>
    Selecciona el motor [#selecciona-el-motor]

    Comprueba el motor predeterminado de la instalación antes de importar una CA con clave. La operación de importación de CA delega la importación de la clave en ese motor; no garantiza selección de cualquier proveedor desde el formulario. Para seleccionar un motor al importar la clave por separado, utiliza el [KMS](/docs/platform/pki/key-management).
  </Step>

  <Step>
    Carga el material [#carga-el-material]

    Importa el certificado y, cuando corresponda, su clave PEM. Registra las CAs de la cadena necesarias para identificar al emisor. Tener una CA en el inventario no la instala en los almacenes de confianza externos.
  </Step>

  <Step>
    Define la emisión predeterminada [#define-la-emisión-predeterminada]

    Asocia un perfil de emisión explícito si la CA va a firmar. Comprueba sus usos y fechas según [Perfiles](/docs/platform/pki/certificate-profiles).
  </Step>

  <Step>
    Verifica la importación [#verifica-la-importación]

    Revisa el tipo registrado, la clave y el motor asociados y la relación con el emisor. Una importación sin clave puede asociarse a una clave ya existente en KMS mediante el identificador de clave del certificado. Si no existe una clave utilizable, la CA sirve como material público pero no puede firmar.

    Para una CA emisora, completa una emisión de prueba y comprueba OCSP y CRL. El alta del registro por sí sola no demuestra disponibilidad de la clave, coherencia completa de la cadena ni publicación del estado.
  </Step>
</Steps>

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
  Revocar una CA impide que emita y puede interrumpir toda su rama. Solo \`CertificateHold\` permite reactivar la propia CA si no está expirada. Sus descendientes se intentan revocar con \`CessationOfOperation\`; reactivar el padre no restaura esos descendientes. Sigue las condiciones de [revocación en cascada](/docs/platform/pki/ca-hierarchy-and-rotation).
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

    Comprueba **REVOKED** en la CA y revisa los descendientes uno a uno; la propagación admite fallos parciales. Verifica por separado la publicación de [OCSP y CRL](/docs/platform/pki/certificate-validation) y el rechazo por los consumidores. Un registro revocado no garantiza que una sesión existente se cierre.
  </Step>
</Steps>

La eliminación permanente solo está disponible después de revocar. Elimina el registro únicamente cuando la política de retención y auditoría lo permita.
`,l={title:"Autoridades de certificación",description:"Crea, importa y opera las autoridades que establecen la confianza de tu PKI.",sidebar:{label:"Autoridades"}},s={contents:[{heading:void 0,content:"Una autoridad de certificación (CA) vincula identidades con claves públicas mediante certificados firmados. En Lamassu puedes crear una jerarquía nueva, utilizar una clave que ya está en el KMS o incorporar una CA externa."},{heading:void 0,content:"Para diseñar una cadena completa o sustituir una autoridad en producción, consulta Jerarquía y rotación de CAs. Si necesitas estandarizar qué puede firmar cada autoridad, utiliza Perfiles de certificado."},{heading:void 0,content:"Para administrar CAs necesitas permisos sobre las autoridades y las claves, un motor accesible y un perfil revisado. La CA de un consumidor externo no queda confiada por aparecer en este inventario: acuerda por separado la distribución de su raíz y cadena."},{heading:"elige-un-flujo",content:"**Nueva CA y nueva clave:** crea una raíz de confianza desde cero. Lamassu genera y custodia el par de claves."},{heading:"elige-un-flujo",content:"**Nueva CA desde KMS:** reutiliza una clave que ya está registrada en la plataforma."},{heading:"elige-un-flujo",content:"**Importar CA con clave privada:** incorpora una autoridad externa con la que Lamassu podrá emitir."},{heading:"elige-un-flujo",content:"**Importar solo el certificado:** registra material público. Si Lamassu encuentra su clave en el KMS, puede asociarla; si no la encuentra, la CA queda sin clave utilizable para emitir."},{heading:"elige-un-flujo",content:"¿Es tu primera vez? Sigue Crea tu primera CA para completar el recorrido mínimo."},{heading:"antes-de-empezar",content:"Decide si la CA será raíz o intermedia."},{heading:"antes-de-empezar",content:"Elige el motor que custodiará la clave."},{heading:"antes-de-empezar",content:"Define una validez superior a la de los certificados que emitirá."},{heading:"antes-de-empezar",content:"Para una CA intermedia, asegúrate de que la CA padre esté activa."},{heading:"abre-el-asistente",content:"En **Certification Authorities**, selecciona **Create New CA** y elige generar un par de claves nuevo."},{heading:"configura-la-clave",content:"Selecciona el motor criptográfico, el algoritmo y el tamaño o curva. Lamassu admite claves RSA y EC según las capacidades del motor."},{heading:"configura-la-clave",content:"Utiliza únicamente tamaños y curvas admitidos por el motor y por la política criptográfica del perfil. Consulta Claves y motores antes de reutilizar material externo."},{heading:"elige-el-tipo-de-ca",content:"Selecciona **Root CA** para una autoridad autofirmada o **Intermediate CA** para una autoridad firmada por otra CA. En el segundo caso, elige la CA emisora."},{heading:"define-la-identidad",content:"Introduce un **CA Name** único. Este nombre se convierte en el `Common Name` del certificado. Completa los campos del Distinguished Name que necesite tu política:"},{heading:"define-la-identidad",content:"`C`: código de país ISO 3166-1 de dos letras."},{heading:"define-la-identidad",content:"`ST`: estado o provincia."},{heading:"define-la-identidad",content:"`L`: localidad."},{heading:"define-la-identidad",content:"`O`: organización."},{heading:"define-la-identidad",content:"`OU`: unidad organizativa."},{heading:"define-la-identidad",content:"El identificador interno de la CA se genera automáticamente y no se puede modificar."},{heading:"configura-validez-y-usos",content:"Define **CA Certificate Expiration** y **Default End-Entity Certificate Issuance Expiration**. Puedes expresar una duración (`5y 8w 4d`), seleccionar una fecha o utilizar la fecha máxima permitida."},{heading:"configura-validez-y-usos",content:"Revisa por separado el certificado de la propia CA y el perfil predeterminado para lo que emitirá después. Elige una política explícita de emisión; no confíes en que los valores iniciales del formulario sean adecuados para tus consumidores."},{heading:"crea-y-verifica",content:"Confirma el formulario y abre la CA. Comprueba estado, emisor, fechas, motor y clave asociados. Descarga el certificado: debe tener `CA:TRUE` y un uso que permita firmar certificados. Verifica la autofirma para una raíz o la cadena hasta tu raíz para una intermedia. Completa una emisión de prueba para comprobar que la clave realmente puede firmar."},{heading:"crea-y-verifica",content:"Planifica y verifica los vencimientos con las reglas de Perfiles. La emisión no recorta automáticamente la validez al vencimiento del emisor; deja margen para sustituir la autoridad y renovar las identidades."},{heading:"utiliza-una-clave-del-kms",content:"Selecciona &#x2A;*Create New CA (Existing Key)** cuando la clave ya esté registrada en Lamassu. El asistente pide primero la clave de soporte y después muestra la misma configuración de tipo, identidad, validez y perfil."},{heading:"utiliza-una-clave-del-kms",content:"Este flujo resulta útil cuando la clave se creó previamente en un HSM, se importó mediante BYOK o debe reutilizarse con una política de custodia concreta."},{heading:"importa-una-ca-externa",content:"Necesitas el certificado de CA en PEM, su cadena hasta una raíz conocida y, si vas a importarla, una clave privada exportable. Antes de cargar el material, verifica firma, fechas, `CA:TRUE`, usos de firma y correspondencia de la clave pública. El procedimiento de verificación de claves también sirve para comparar la clave y el certificado de una CA."},{heading:"selecciona-el-motor",content:"Comprueba el motor predeterminado de la instalación antes de importar una CA con clave. La operación de importación de CA delega la importación de la clave en ese motor; no garantiza selección de cualquier proveedor desde el formulario. Para seleccionar un motor al importar la clave por separado, utiliza el KMS."},{heading:"carga-el-material",content:"Importa el certificado y, cuando corresponda, su clave PEM. Registra las CAs de la cadena necesarias para identificar al emisor. Tener una CA en el inventario no la instala en los almacenes de confianza externos."},{heading:"define-la-emisión-predeterminada",content:"Asocia un perfil de emisión explícito si la CA va a firmar. Comprueba sus usos y fechas según Perfiles."},{heading:"verifica-la-importación",content:"Revisa el tipo registrado, la clave y el motor asociados y la relación con el emisor. Una importación sin clave puede asociarse a una clave ya existente en KMS mediante el identificador de clave del certificado. Si no existe una clave utilizable, la CA sirve como material público pero no puede firmar."},{heading:"verifica-la-importación",content:"Para una CA emisora, completa una emisión de prueba y comprueba OCSP y CRL. El alta del registro por sí sola no demuestra disponibilidad de la clave, coherencia completa de la cadena ni publicación del estado."},{heading:"inspecciona-una-autoridad",content:"Abre una CA desde el inventario para consultar:"},{heading:"inspecciona-una-autoridad",content:"Estado y periodo de validez."},{heading:"inspecciona-una-autoridad",content:"Certificado y cadena en formato PEM."},{heading:"inspecciona-una-autoridad",content:"Número de certificados activos, expirados y revocados."},{heading:"inspecciona-una-autoridad",content:"Certificados emitidos en **Issued Certificates**."},{heading:"inspecciona-una-autoridad",content:"CRL vinculada a la autoridad."},{heading:"inspecciona-una-autoridad",content:"Metadatos y motor criptográfico asociado."},{heading:"inspecciona-una-autoridad",content:"Puedes filtrar el inventario por nombre, estado y tipo de CA."},{heading:"emite-certificados",content:"Puedes iniciar una emisión desde **Issued Certificates**, desde la acción de una CA o desde el inventario global de certificados."},{heading:"emite-certificados",content:"**Generate Key & CSR in Browser** resulta útil para una operación manual o una prueba rápida. El navegador genera la clave y debes descargarla al finalizar."},{heading:"emite-certificados",content:"**Upload Existing CSR** es la opción adecuada cuando la clave debe permanecer en el sistema de destino. Lamassu recibe la solicitud, pero nunca la clave privada."},{heading:"emite-certificados",content:"Sigue Emite tu primer certificado para el flujo guiado. La gestión de certificados explica el inventario, la inspección y la revocación."},{heading:"revoca-una-ca",content:"Revocar una CA impide que emita y puede interrumpir toda su rama. Solo `CertificateHold` permite reactivar la propia CA si no está expirada. Sus descendientes se intentan revocar con `CessationOfOperation`; reactivar el padre no restaura esos descendientes. Sigue las condiciones de revocación en cascada."},{heading:"evalúa-el-impacto",content:"Identifica los certificados, dispositivos y consumidores que dependen de la CA. Prepara una autoridad y una cadena de sustitución cuando sea necesario."},{heading:"inicia-la-revocación",content:"Abre la autoridad y selecciona **Revoke CA**. Elige la razón que describa el incidente, por ejemplo `KeyCompromise`, `CACompromise`, `Superseded` o `CessationOfOperation`."},{heading:"confirma-la-identidad",content:"Escribe exactamente el nombre de la CA para habilitar **Confirm Revocation**."},{heading:"comprueba-la-publicación",content:"Comprueba **REVOKED** en la CA y revisa los descendientes uno a uno; la propagación admite fallos parciales. Verifica por separado la publicación de OCSP y CRL y el rechazo por los consumidores. Un registro revocado no garantiza que una sesión existente se cierre."},{heading:"comprueba-la-publicación",content:"La eliminación permanente solo está disponible después de revocar. Elimina el registro únicamente cuando la política de retención y auditoría lo permita."}],headings:[{id:"elige-un-flujo",content:"Elige un flujo"},{id:"crea-una-autoridad-nueva",content:"Crea una autoridad nueva"},{id:"antes-de-empezar",content:"Antes de empezar"},{id:"abre-el-asistente",content:"Abre el asistente"},{id:"configura-la-clave",content:"Configura la clave"},{id:"elige-el-tipo-de-ca",content:"Elige el tipo de CA"},{id:"define-la-identidad",content:"Define la identidad"},{id:"configura-validez-y-usos",content:"Configura validez y usos"},{id:"crea-y-verifica",content:"Crea y verifica"},{id:"utiliza-una-clave-del-kms",content:"Utiliza una clave del KMS"},{id:"importa-una-ca-externa",content:"Importa una CA externa"},{id:"selecciona-el-motor",content:"Selecciona el motor"},{id:"carga-el-material",content:"Carga el material"},{id:"define-la-emisión-predeterminada",content:"Define la emisión predeterminada"},{id:"verifica-la-importación",content:"Verifica la importación"},{id:"inspecciona-una-autoridad",content:"Inspecciona una autoridad"},{id:"emite-certificados",content:"Emite certificados"},{id:"revoca-una-ca",content:"Revoca una CA"},{id:"evalúa-el-impacto",content:"Evalúa el impacto"},{id:"inicia-la-revocación",content:"Inicia la revocación"},{id:"confirma-la-identidad",content:"Confirma la identidad"},{id:"comprueba-la-publicación",content:"Comprueba la publicación"}]};const u=[{depth:2,url:"#elige-un-flujo",title:e.jsx(e.Fragment,{children:"Elige un flujo"})},{depth:2,url:"#crea-una-autoridad-nueva",title:e.jsx(e.Fragment,{children:"Crea una autoridad nueva"})},{depth:3,url:"#antes-de-empezar",title:e.jsx(e.Fragment,{children:"Antes de empezar"})},{depth:3,url:"#abre-el-asistente",title:e.jsx(e.Fragment,{children:"Abre el asistente"})},{depth:3,url:"#configura-la-clave",title:e.jsx(e.Fragment,{children:"Configura la clave"})},{depth:3,url:"#elige-el-tipo-de-ca",title:e.jsx(e.Fragment,{children:"Elige el tipo de CA"})},{depth:3,url:"#define-la-identidad",title:e.jsx(e.Fragment,{children:"Define la identidad"})},{depth:3,url:"#configura-validez-y-usos",title:e.jsx(e.Fragment,{children:"Configura validez y usos"})},{depth:3,url:"#crea-y-verifica",title:e.jsx(e.Fragment,{children:"Crea y verifica"})},{depth:2,url:"#utiliza-una-clave-del-kms",title:e.jsx(e.Fragment,{children:"Utiliza una clave del KMS"})},{depth:2,url:"#importa-una-ca-externa",title:e.jsx(e.Fragment,{children:"Importa una CA externa"})},{depth:3,url:"#selecciona-el-motor",title:e.jsx(e.Fragment,{children:"Selecciona el motor"})},{depth:3,url:"#carga-el-material",title:e.jsx(e.Fragment,{children:"Carga el material"})},{depth:3,url:"#define-la-emisión-predeterminada",title:e.jsx(e.Fragment,{children:"Define la emisión predeterminada"})},{depth:3,url:"#verifica-la-importación",title:e.jsx(e.Fragment,{children:"Verifica la importación"})},{depth:2,url:"#inspecciona-una-autoridad",title:e.jsx(e.Fragment,{children:"Inspecciona una autoridad"})},{depth:2,url:"#emite-certificados",title:e.jsx(e.Fragment,{children:"Emite certificados"})},{depth:2,url:"#revoca-una-ca",title:e.jsx(e.Fragment,{children:"Revoca una CA"})},{depth:3,url:"#evalúa-el-impacto",title:e.jsx(e.Fragment,{children:"Evalúa el impacto"})},{depth:3,url:"#inicia-la-revocación",title:e.jsx(e.Fragment,{children:"Inicia la revocación"})},{depth:3,url:"#confirma-la-identidad",title:e.jsx(e.Fragment,{children:"Confirma la identidad"})},{depth:3,url:"#comprueba-la-publicación",title:e.jsx(e.Fragment,{children:"Comprueba la publicación"})}];function c(n){const a={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...n.components},{Callout:o,Step:i,Steps:r}=a;return o||t("Callout"),i||t("Step"),r||t("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(a.p,{children:"Una autoridad de certificación (CA) vincula identidades con claves públicas mediante certificados firmados. En Lamassu puedes crear una jerarquía nueva, utilizar una clave que ya está en el KMS o incorporar una CA externa."}),`
`,e.jsxs(a.p,{children:["Para diseñar una cadena completa o sustituir una autoridad en producción, consulta ",e.jsx(a.a,{href:"/docs/platform/pki/ca-hierarchy-and-rotation",children:"Jerarquía y rotación de CAs"}),". Si necesitas estandarizar qué puede firmar cada autoridad, utiliza ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-profiles",children:"Perfiles de certificado"}),"."]}),`
`,e.jsx(a.p,{children:"Para administrar CAs necesitas permisos sobre las autoridades y las claves, un motor accesible y un perfil revisado. La CA de un consumidor externo no queda confiada por aparecer en este inventario: acuerda por separado la distribución de su raíz y cadena."}),`
`,e.jsx(a.h2,{id:"elige-un-flujo",children:"Elige un flujo"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Nueva CA y nueva clave:"})," crea una raíz de confianza desde cero. Lamassu genera y custodia el par de claves."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Nueva CA desde KMS:"})," reutiliza una clave que ya está registrada en la plataforma."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Importar CA con clave privada:"})," incorpora una autoridad externa con la que Lamassu podrá emitir."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Importar solo el certificado:"})," registra material público. Si Lamassu encuentra su clave en el KMS, puede asociarla; si no la encuentra, la CA queda sin clave utilizable para emitir."]}),`
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
`,e.jsxs(r,{children:[e.jsxs(i,{children:[e.jsx(a.h3,{id:"abre-el-asistente",children:"Abre el asistente"}),e.jsxs(a.p,{children:["En ",e.jsx(a.strong,{children:"Certification Authorities"}),", selecciona ",e.jsx(a.strong,{children:"Create New CA"})," y elige generar un par de claves nuevo."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"configura-la-clave",children:"Configura la clave"}),e.jsx(a.p,{children:"Selecciona el motor criptográfico, el algoritmo y el tamaño o curva. Lamassu admite claves RSA y EC según las capacidades del motor."}),e.jsxs(a.p,{children:["Utiliza únicamente tamaños y curvas admitidos por el motor y por la política criptográfica del perfil. Consulta ",e.jsx(a.a,{href:"/docs/platform/pki/key-management",children:"Claves y motores"})," antes de reutilizar material externo."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"elige-el-tipo-de-ca",children:"Elige el tipo de CA"}),e.jsxs(a.p,{children:["Selecciona ",e.jsx(a.strong,{children:"Root CA"})," para una autoridad autofirmada o ",e.jsx(a.strong,{children:"Intermediate CA"})," para una autoridad firmada por otra CA. En el segundo caso, elige la CA emisora."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"define-la-identidad",children:"Define la identidad"}),e.jsxs(a.p,{children:["Introduce un ",e.jsx(a.strong,{children:"CA Name"})," único. Este nombre se convierte en el ",e.jsx(a.code,{children:"Common Name"})," del certificado. Completa los campos del Distinguished Name que necesite tu política:"]}),e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"C"}),": código de país ISO 3166-1 de dos letras."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"ST"}),": estado o provincia."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"L"}),": localidad."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"O"}),": organización."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"OU"}),": unidad organizativa."]}),`
`]}),e.jsx(a.p,{children:"El identificador interno de la CA se genera automáticamente y no se puede modificar."})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"configura-validez-y-usos",children:"Configura validez y usos"}),e.jsxs(a.p,{children:["Define ",e.jsx(a.strong,{children:"CA Certificate Expiration"})," y ",e.jsx(a.strong,{children:"Default End-Entity Certificate Issuance Expiration"}),". Puedes expresar una duración (",e.jsx(a.code,{children:"5y 8w 4d"}),"), seleccionar una fecha o utilizar la fecha máxima permitida."]}),e.jsxs(a.p,{children:["Revisa por separado el certificado de la propia CA y el perfil predeterminado para lo que emitirá después. Elige una política explícita de ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-profiles",children:"emisión"}),"; no confíes en que los valores iniciales del formulario sean adecuados para tus consumidores."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"crea-y-verifica",children:"Crea y verifica"}),e.jsxs(a.p,{children:["Confirma el formulario y abre la CA. Comprueba estado, emisor, fechas, motor y clave asociados. Descarga el certificado: debe tener ",e.jsx(a.code,{children:"CA:TRUE"})," y un uso que permita firmar certificados. Verifica la autofirma para una raíz o la cadena hasta tu raíz para una intermedia. Completa una emisión de prueba para comprobar que la clave realmente puede firmar."]})]})]}),`
`,e.jsx(o,{type:"warn",title:"Planifica la validez como una jerarquía",children:e.jsxs(a.p,{children:["Planifica y verifica los vencimientos con las reglas de ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-profiles",children:"Perfiles"}),". La emisión no recorta automáticamente la validez al vencimiento del emisor; deja margen para sustituir la autoridad y renovar las identidades."]})}),`
`,e.jsx(a.h2,{id:"utiliza-una-clave-del-kms",children:"Utiliza una clave del KMS"}),`
`,e.jsxs(a.p,{children:["Selecciona ",e.jsx(a.strong,{children:"Create New CA (Existing Key)"})," cuando la clave ya esté registrada en Lamassu. El asistente pide primero la clave de soporte y después muestra la misma configuración de tipo, identidad, validez y perfil."]}),`
`,e.jsx(a.p,{children:"Este flujo resulta útil cuando la clave se creó previamente en un HSM, se importó mediante BYOK o debe reutilizarse con una política de custodia concreta."}),`
`,e.jsx(a.h2,{id:"importa-una-ca-externa",children:"Importa una CA externa"}),`
`,e.jsxs(a.p,{children:["Necesitas el certificado de CA en PEM, su cadena hasta una raíz conocida y, si vas a importarla, una clave privada exportable. Antes de cargar el material, verifica firma, fechas, ",e.jsx(a.code,{children:"CA:TRUE"}),", usos de firma y correspondencia de la clave pública. El procedimiento de ",e.jsx(a.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"verificación de claves"})," también sirve para comparar la clave y el certificado de una CA."]}),`
`,e.jsxs(r,{children:[e.jsxs(i,{children:[e.jsx(a.h3,{id:"selecciona-el-motor",children:"Selecciona el motor"}),e.jsxs(a.p,{children:["Comprueba el motor predeterminado de la instalación antes de importar una CA con clave. La operación de importación de CA delega la importación de la clave en ese motor; no garantiza selección de cualquier proveedor desde el formulario. Para seleccionar un motor al importar la clave por separado, utiliza el ",e.jsx(a.a,{href:"/docs/platform/pki/key-management",children:"KMS"}),"."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"carga-el-material",children:"Carga el material"}),e.jsx(a.p,{children:"Importa el certificado y, cuando corresponda, su clave PEM. Registra las CAs de la cadena necesarias para identificar al emisor. Tener una CA en el inventario no la instala en los almacenes de confianza externos."})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"define-la-emisión-predeterminada",children:"Define la emisión predeterminada"}),e.jsxs(a.p,{children:["Asocia un perfil de emisión explícito si la CA va a firmar. Comprueba sus usos y fechas según ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-profiles",children:"Perfiles"}),"."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"verifica-la-importación",children:"Verifica la importación"}),e.jsx(a.p,{children:"Revisa el tipo registrado, la clave y el motor asociados y la relación con el emisor. Una importación sin clave puede asociarse a una clave ya existente en KMS mediante el identificador de clave del certificado. Si no existe una clave utilizable, la CA sirve como material público pero no puede firmar."}),e.jsx(a.p,{children:"Para una CA emisora, completa una emisión de prueba y comprueba OCSP y CRL. El alta del registro por sí sola no demuestra disponibilidad de la clave, coherencia completa de la cadena ni publicación del estado."})]})]}),`
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
`,e.jsx(o,{type:"warn",title:"La revocación afecta a toda la cadena dependiente",children:e.jsxs(a.p,{children:["Revocar una CA impide que emita y puede interrumpir toda su rama. Solo ",e.jsx(a.code,{children:"CertificateHold"})," permite reactivar la propia CA si no está expirada. Sus descendientes se intentan revocar con ",e.jsx(a.code,{children:"CessationOfOperation"}),"; reactivar el padre no restaura esos descendientes. Sigue las condiciones de ",e.jsx(a.a,{href:"/docs/platform/pki/ca-hierarchy-and-rotation",children:"revocación en cascada"}),"."]})}),`
`,e.jsxs(r,{children:[e.jsxs(i,{children:[e.jsx(a.h3,{id:"evalúa-el-impacto",children:"Evalúa el impacto"}),e.jsx(a.p,{children:"Identifica los certificados, dispositivos y consumidores que dependen de la CA. Prepara una autoridad y una cadena de sustitución cuando sea necesario."})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"inicia-la-revocación",children:"Inicia la revocación"}),e.jsxs(a.p,{children:["Abre la autoridad y selecciona ",e.jsx(a.strong,{children:"Revoke CA"}),". Elige la razón que describa el incidente, por ejemplo ",e.jsx(a.code,{children:"KeyCompromise"}),", ",e.jsx(a.code,{children:"CACompromise"}),", ",e.jsx(a.code,{children:"Superseded"})," o ",e.jsx(a.code,{children:"CessationOfOperation"}),"."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"confirma-la-identidad",children:"Confirma la identidad"}),e.jsxs(a.p,{children:["Escribe exactamente el nombre de la CA para habilitar ",e.jsx(a.strong,{children:"Confirm Revocation"}),"."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"comprueba-la-publicación",children:"Comprueba la publicación"}),e.jsxs(a.p,{children:["Comprueba ",e.jsx(a.strong,{children:"REVOKED"})," en la CA y revisa los descendientes uno a uno; la propagación admite fallos parciales. Verifica por separado la publicación de ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-validation",children:"OCSP y CRL"})," y el rechazo por los consumidores. Un registro revocado no garantiza que una sesión existente se cierre."]})]})]}),`
`,e.jsx(a.p,{children:"La eliminación permanente solo está disponible después de revocar. Elimina el registro únicamente cuando la política de retención y auditoría lo permita."})]})}function p(n={}){const{wrapper:a}=n.components||{};return a?e.jsx(a,{...n,children:e.jsx(c,{...n})}):c(n)}function t(n,a){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const f=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:p,frontmatter:l,structuredData:s,toc:u},Symbol.toStringTag,{value:"Module"}));export{f as _};
