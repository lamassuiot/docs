import{j as e}from"./index-prc0XQdj.js";let l=`

<div className="lm-diff-ins lm-diff-block">
  La actualización de 3.8.0 a 4.0.0 migra automáticamente la configuración almacenada de los DMS. Casi todo se convierte sin intervención, pero hay tres cambios que pueden dejar enrolamientos fallando o configuraciones con valores inesperados si no se revisan. Esta página indica qué cambia, qué síntomas produce y qué hacer en cada caso. El comportamiento vigente de cada funcionalidad está en las páginas de [DMS](/docs/platform/iot-fleets/enrollment/dms).
</div>

<div className="lm-diff-ins lm-diff-block">
  Resumen [#resumen]
</div>

<div className="lm-diff-ins lm-diff-block">
  | Cambio                                                                                          | Quién se ve afectado                                                   | Gravedad                                                                    | Acción                                                                             |
  | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
  | [Webhooks con referencias a archivos](#webhooks-con-referencias-a-archivos)                     | DMS con webhook cuyo certificado o clave de mTLS eran rutas de archivo | Alta: los enrolamientos y reenrolamientos que llaman al webhook fallan      | Volver a introducir certificado y clave como PEM, o eliminar los campos de archivo |
  | [Verificación del certificado del receptor](#verificación-del-certificado-del-receptor)         | DMS con webhook que tenían \`validate_server_cert: false\`               | Media: las credenciales del webhook viajan sin verificar al receptor        | Poner \`insecure_skip_verify\` a \`false\`                                             |
  | [Conjunto de confianza del reenrolamiento](#conjunto-de-confianza-del-reenrolamiento)           | Scripts y consolas que editan DMS por API                              | Media: una edición con el formato antiguo vacía \`validation_cas\` sin avisar | Leer el DMS antes de editarlo y usar el campo nuevo                                |
  | [Autenticación de reenrolamiento independiente](#autenticación-de-reenrolamiento-independiente) | Cualquier DMS                                                          | Baja: solo informativo                                                      | Revisar ambos bloques antes de editar                                              |
</div>

<div className="lm-diff-ins lm-diff-block">
  Al final se incluye una [lista de verificación](#lista-de-verificación) para confirmar el resultado.
</div>

<div className="lm-diff-ins lm-diff-block">
  Webhooks del DMS [#webhooks-del-dms]
</div>

<div className="lm-diff-ins lm-diff-block">
  Las configuraciones de webhook almacenadas se reescriben al formato actual. Los campos se renombran de la siguiente manera:
</div>

<div className="lm-diff-ins lm-diff-block">
  | Campo en 3.8.0         | Campo en 4.0.0                               |
  | ---------------------- | -------------------------------------------- |
  | \`validate_server_cert\` | \`insecure_skip_verify\` (con el valor negado) |
  | \`oidc\`                 | \`jwt_options\`                                |
  | \`apikey\`               | \`apikey_options\`                             |
  | \`mtls\`                 | \`mtls_options\`                               |
</div>

<div className="lm-diff-ins lm-diff-block">
  Cuando el certificado y la clave heredados de mTLS son ambos PEM, se trasladan a \`mtls_options.cert_content\` y \`mtls_options.key_content\` y no requieren ninguna acción. Los dos casos siguientes son los que sí la requieren.
</div>

<div className="lm-diff-ins lm-diff-block">
  Webhooks con referencias a archivos [#webhooks-con-referencias-a-archivos]
</div>

<div className="lm-diff-ins lm-diff-block">
  Una configuración mixta, con el certificado en PEM y la clave como ruta de archivo, se migra a \`mtls_options.cert_file\` y \`mtls_options.key_file\`. La entrega del webhook rechaza esos campos, y lo hace en cada llamada, sea cual sea el modo de autenticación configurado. El efecto es que todos los enrolamientos y reenrolamientos que invocan ese webhook fallan hasta corregir la configuración.
</div>

<div className="lm-diff-ins lm-diff-block">
  Para corregirlo hay dos opciones, según el webhook:
</div>

<div className="lm-diff-ins lm-diff-block">
  * Si el webhook usa mTLS, volver a introducir el certificado y la clave como PEM, en Base64 o en texto plano.
  * Si el webhook no usa mTLS, eliminar los campos de archivo sobrantes.
</div>

<div className="lm-diff-ins lm-diff-block">
  Mientras tanto, las actualizaciones de solo metadatos siguen funcionando (\`PUT\` o \`PATCH\` sobre \`/v1/dms/:id/metadata\`).
</div>

<div className="lm-diff-ins lm-diff-block">
  Existe una variante del mismo problema: si la configuración almacenada guarda rutas de archivo dentro de \`mtls_options.cert_content\` o \`mtls_options.key_content\`, toda actualización completa de ajustes (\`POST /v1/dms\` o \`PUT /v1/dms/:id\`) falla la validación. Los ajustes se sustituyen al completo, de modo que la configuración almacenada debe reenviarse con el certificado y la clave como PEM.
</div>

<div className="lm-diff-ins lm-diff-block">
  Verificación del certificado del receptor [#verificación-del-certificado-del-receptor]
</div>

<div className="lm-diff-ins lm-diff-block">
  Una configuración con \`validate_server_cert: false\` pasa a \`insecure_skip_verify: true\`. Por tanto, la verificación del certificado del receptor sigue sin realizarse hasta que se ponga ese campo a \`false\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  Conviene corregirlo en cada configuración migrada. El canal de autorización del webhook transporta la API key o el bearer token, de modo que saltarse la verificación expone esas credenciales a un atacante con posición de red. Solo se justifica mantener \`insecure_skip_verify: true\` si el certificado del receptor no es verificable de forma deliberada.
</div>

<div className="lm-diff-ins lm-diff-block">
  Conjunto de confianza del reenrolamiento [#conjunto-de-confianza-del-reenrolamiento]
</div>

<div className="lm-diff-ins lm-diff-block">
  El campo plano \`reenrollment_settings.additional_validation_cas\` se traslada al campo anidado \`reenrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`json
  {
    "reenrollment_settings": {
      "est_rfc7030_settings": {
        "client_certificate_settings": {
          "validation_cas": ["<CA_ID>"]
        }
      }
    }
  }
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  El conjunto de confianza efectivo no cambia, porque el valor anidado nunca se consultó al validar reenrolamientos. Si la lista plana estaba ausente o era nula, pasa a ser una lista vacía.
</div>

<div className="lm-diff-ins lm-diff-block">
  Lo que sí cambia es el tratamiento de las peticiones por API. Los cuerpos que aún contienen \`additional_validation_cas\` se aceptan, pero su valor se ignora en silencio porque los campos JSON desconocidos se descartan, y las respuestas GET ya no lo incluyen. En consecuencia, un cuerpo de actualización construido con el formato antiguo vacía \`validation_cas\` sin devolver ningún error. Para evitarlo, leer siempre el DMS antes de enviar una edición y reutilizar el formato que devuelve la API.
</div>

<div className="lm-diff-ins lm-diff-block">
  Autenticación de reenrolamiento independiente [#autenticación-de-reenrolamiento-independiente]
</div>

<div className="lm-diff-ins lm-diff-block">
  Los ajustes de autenticación del reenrolamiento se almacenan ahora de forma independiente de los de la autenticación inicial. No hay nada que migrar, pero antes de editar un DMS conviene leer ambos bloques para no modificar uno creyendo que se está editando el otro.
</div>

<div className="lm-diff-ins lm-diff-block">
  Si la versión de la consola no expone los ajustes independientes, pueden editarse mediante la [API DMS](/docs/api-reference/dms-manager).
</div>

<div className="lm-diff-ins lm-diff-block">
  Lista de verificación [#lista-de-verificación]
</div>

<div className="lm-diff-ins lm-diff-block">
  Tras aplicar la actualización, comprobar en este orden:
</div>

<div className="lm-diff-ins lm-diff-block">
  1. **Webhooks sin campos de archivo.** Listar los DMS que usan webhook en enrolamiento o reenrolamiento y confirmar que cada bloque \`config\` incluye \`insecure_skip_verify\` y el bloque de opciones esperado (\`apikey_options\`, \`jwt_options\` o \`mtls_options\`), con el certificado y la clave en PEM y sin \`cert_file\` ni \`key_file\`.
  2. **Verificación del receptor.** Confirmar que \`insecure_skip_verify\` es \`false\`, salvo que el certificado del receptor no sea verificable de forma intencionada.
  3. **Entrega.** Lanzar, o esperar a que ocurra, un enrolamiento o reenrolamiento a través de cada webhook migrado y confirmar que la llamada de autorización se completa.
  4. **Conjunto de confianza.** Leer \`est_rfc7030_settings.client_certificate_settings.validation_cas\` y confirmar que contiene las CAs esperadas, en particular las de la CA antigua durante los solapamientos de rotación.
  5. **Clientes de la API.** Actualizar los scripts y consolas que usen el formato antiguo del DMS (\`additional_validation_cas\` plano, o los campos \`mtls\`, \`apikey\` y \`oidc\` heredados), ya que descartan esos valores sin avisar.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Configurar un DMS" href="/docs/platform/iot-fleets/enrollment/dms" />

    <Card title="API DMS" href="/docs/api-reference/dms-manager" />
  </Cards>
</div>
`,r={title:"3.8.0 a 4.0.0",description:"Cambios de 4.0.0 que afectan a la configuración de los DMS, qué puede fallar tras actualizar desde 3.8.0 y cómo comprobarlo."},d={isNew:!0,changes:29,title:void 0,description:void 0},t={contents:[{heading:void 0,content:"La actualización de 3.8.0 a 4.0.0 migra automáticamente la configuración almacenada de los DMS. Casi todo se convierte sin intervención, pero hay tres cambios que pueden dejar enrolamientos fallando o configuraciones con valores inesperados si no se revisan. Esta página indica qué cambia, qué síntomas produce y qué hacer en cada caso. El comportamiento vigente de cada funcionalidad está en las páginas de DMS."},{heading:"resumen",content:"Cambio"},{heading:"resumen",content:"Quién se ve afectado"},{heading:"resumen",content:"Gravedad"},{heading:"resumen",content:"Acción"},{heading:"resumen",content:"Webhooks con referencias a archivos"},{heading:"resumen",content:"DMS con webhook cuyo certificado o clave de mTLS eran rutas de archivo"},{heading:"resumen",content:"Alta: los enrolamientos y reenrolamientos que llaman al webhook fallan"},{heading:"resumen",content:"Volver a introducir certificado y clave como PEM, o eliminar los campos de archivo"},{heading:"resumen",content:"Verificación del certificado del receptor"},{heading:"resumen",content:"DMS con webhook que tenían `validate_server_cert: false`"},{heading:"resumen",content:"Media: las credenciales del webhook viajan sin verificar al receptor"},{heading:"resumen",content:"Poner `insecure_skip_verify` a `false`"},{heading:"resumen",content:"Conjunto de confianza del reenrolamiento"},{heading:"resumen",content:"Scripts y consolas que editan DMS por API"},{heading:"resumen",content:"Media: una edición con el formato antiguo vacía `validation_cas` sin avisar"},{heading:"resumen",content:"Leer el DMS antes de editarlo y usar el campo nuevo"},{heading:"resumen",content:"Autenticación de reenrolamiento independiente"},{heading:"resumen",content:"Cualquier DMS"},{heading:"resumen",content:"Baja: solo informativo"},{heading:"resumen",content:"Revisar ambos bloques antes de editar"},{heading:"resumen",content:"Al final se incluye una lista de verificación para confirmar el resultado."},{heading:"webhooks-del-dms",content:"Las configuraciones de webhook almacenadas se reescriben al formato actual. Los campos se renombran de la siguiente manera:"},{heading:"webhooks-del-dms",content:"Campo en 3.8.0"},{heading:"webhooks-del-dms",content:"Campo en 4.0.0"},{heading:"webhooks-del-dms",content:"`validate_server_cert`"},{heading:"webhooks-del-dms",content:"`insecure_skip_verify` (con el valor negado)"},{heading:"webhooks-del-dms",content:"`oidc`"},{heading:"webhooks-del-dms",content:"`jwt_options`"},{heading:"webhooks-del-dms",content:"`apikey`"},{heading:"webhooks-del-dms",content:"`apikey_options`"},{heading:"webhooks-del-dms",content:"`mtls`"},{heading:"webhooks-del-dms",content:"`mtls_options`"},{heading:"webhooks-del-dms",content:"Cuando el certificado y la clave heredados de mTLS son ambos PEM, se trasladan a `mtls_options.cert_content` y `mtls_options.key_content` y no requieren ninguna acción. Los dos casos siguientes son los que sí la requieren."},{heading:"webhooks-con-referencias-a-archivos",content:"Una configuración mixta, con el certificado en PEM y la clave como ruta de archivo, se migra a `mtls_options.cert_file` y `mtls_options.key_file`. La entrega del webhook rechaza esos campos, y lo hace en cada llamada, sea cual sea el modo de autenticación configurado. El efecto es que todos los enrolamientos y reenrolamientos que invocan ese webhook fallan hasta corregir la configuración."},{heading:"webhooks-con-referencias-a-archivos",content:"Para corregirlo hay dos opciones, según el webhook:"},{heading:"webhooks-con-referencias-a-archivos",content:"Si el webhook usa mTLS, volver a introducir el certificado y la clave como PEM, en Base64 o en texto plano."},{heading:"webhooks-con-referencias-a-archivos",content:"Si el webhook no usa mTLS, eliminar los campos de archivo sobrantes."},{heading:"webhooks-con-referencias-a-archivos",content:"Mientras tanto, las actualizaciones de solo metadatos siguen funcionando (`PUT` o `PATCH` sobre `/v1/dms/:id/metadata`)."},{heading:"webhooks-con-referencias-a-archivos",content:"Existe una variante del mismo problema: si la configuración almacenada guarda rutas de archivo dentro de `mtls_options.cert_content` o `mtls_options.key_content`, toda actualización completa de ajustes (`POST /v1/dms` o `PUT /v1/dms/:id`) falla la validación. Los ajustes se sustituyen al completo, de modo que la configuración almacenada debe reenviarse con el certificado y la clave como PEM."},{heading:"verificación-del-certificado-del-receptor",content:"Una configuración con `validate_server_cert: false` pasa a `insecure_skip_verify: true`. Por tanto, la verificación del certificado del receptor sigue sin realizarse hasta que se ponga ese campo a `false`."},{heading:"verificación-del-certificado-del-receptor",content:"Conviene corregirlo en cada configuración migrada. El canal de autorización del webhook transporta la API key o el bearer token, de modo que saltarse la verificación expone esas credenciales a un atacante con posición de red. Solo se justifica mantener `insecure_skip_verify: true` si el certificado del receptor no es verificable de forma deliberada."},{heading:"conjunto-de-confianza-del-reenrolamiento",content:"El campo plano `reenrollment_settings.additional_validation_cas` se traslada al campo anidado `reenrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas`."},{heading:"conjunto-de-confianza-del-reenrolamiento",content:"El conjunto de confianza efectivo no cambia, porque el valor anidado nunca se consultó al validar reenrolamientos. Si la lista plana estaba ausente o era nula, pasa a ser una lista vacía."},{heading:"conjunto-de-confianza-del-reenrolamiento",content:"Lo que sí cambia es el tratamiento de las peticiones por API. Los cuerpos que aún contienen `additional_validation_cas` se aceptan, pero su valor se ignora en silencio porque los campos JSON desconocidos se descartan, y las respuestas GET ya no lo incluyen. En consecuencia, un cuerpo de actualización construido con el formato antiguo vacía `validation_cas` sin devolver ningún error. Para evitarlo, leer siempre el DMS antes de enviar una edición y reutilizar el formato que devuelve la API."},{heading:"autenticación-de-reenrolamiento-independiente",content:"Los ajustes de autenticación del reenrolamiento se almacenan ahora de forma independiente de los de la autenticación inicial. No hay nada que migrar, pero antes de editar un DMS conviene leer ambos bloques para no modificar uno creyendo que se está editando el otro."},{heading:"autenticación-de-reenrolamiento-independiente",content:"Si la versión de la consola no expone los ajustes independientes, pueden editarse mediante la API DMS."},{heading:"lista-de-verificación",content:"Tras aplicar la actualización, comprobar en este orden:"},{heading:"lista-de-verificación",content:"**Webhooks sin campos de archivo.** Listar los DMS que usan webhook en enrolamiento o reenrolamiento y confirmar que cada bloque `config` incluye `insecure_skip_verify` y el bloque de opciones esperado (`apikey_options`, `jwt_options` o `mtls_options`), con el certificado y la clave en PEM y sin `cert_file` ni `key_file`."},{heading:"lista-de-verificación",content:"**Verificación del receptor.** Confirmar que `insecure_skip_verify` es `false`, salvo que el certificado del receptor no sea verificable de forma intencionada."},{heading:"lista-de-verificación",content:"**Entrega.** Lanzar, o esperar a que ocurra, un enrolamiento o reenrolamiento a través de cada webhook migrado y confirmar que la llamada de autorización se completa."},{heading:"lista-de-verificación",content:"**Conjunto de confianza.** Leer `est_rfc7030_settings.client_certificate_settings.validation_cas` y confirmar que contiene las CAs esperadas, en particular las de la CA antigua durante los solapamientos de rotación."},{heading:"lista-de-verificación",content:"**Clientes de la API.** Actualizar los scripts y consolas que usen el formato antiguo del DMS (`additional_validation_cas` plano, o los campos `mtls`, `apikey` y `oidc` heredados), ya que descartan esos valores sin avisar."},{heading:"lista-de-verificación",content:'<Card title="Configurar un DMS" href="/docs/platform/iot-fleets/enrollment/dms" />'},{heading:"lista-de-verificación",content:'<Card title="API DMS" href="/docs/api-reference/dms-manager" />'}],headings:[{id:"resumen",content:"Resumen"},{id:"webhooks-del-dms",content:"Webhooks del DMS"},{id:"webhooks-con-referencias-a-archivos",content:"Webhooks con referencias a archivos"},{id:"verificación-del-certificado-del-receptor",content:"Verificación del certificado del receptor"},{id:"conjunto-de-confianza-del-reenrolamiento",content:"Conjunto de confianza del reenrolamiento"},{id:"autenticación-de-reenrolamiento-independiente",content:"Autenticación de reenrolamiento independiente"},{id:"lista-de-verificación",content:"Lista de verificación"}]};const m=[{depth:2,url:"#resumen",title:e.jsx(e.Fragment,{children:"Resumen"})},{depth:2,url:"#webhooks-del-dms",title:e.jsx(e.Fragment,{children:"Webhooks del DMS"})},{depth:3,url:"#webhooks-con-referencias-a-archivos",title:e.jsx(e.Fragment,{children:"Webhooks con referencias a archivos"})},{depth:3,url:"#verificación-del-certificado-del-receptor",title:e.jsx(e.Fragment,{children:"Verificación del certificado del receptor"})},{depth:2,url:"#conjunto-de-confianza-del-reenrolamiento",title:e.jsx(e.Fragment,{children:"Conjunto de confianza del reenrolamiento"})},{depth:2,url:"#autenticación-de-reenrolamiento-independiente",title:e.jsx(e.Fragment,{children:"Autenticación de reenrolamiento independiente"})},{depth:2,url:"#lista-de-verificación",title:e.jsx(e.Fragment,{children:"Lista de verificación"})}];function s(a){const n={a:"a",code:"code",div:"div",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...a.components},{Card:i,Cards:o}=n;return i||c("Card"),o||c("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["La actualización de 3.8.0 a 4.0.0 migra automáticamente la configuración almacenada de los DMS. Casi todo se convierte sin intervención, pero hay tres cambios que pueden dejar enrolamientos fallando o configuraciones con valores inesperados si no se revisan. Esta página indica qué cambia, qué síntomas produce y qué hacer en cada caso. El comportamiento vigente de cada funcionalidad está en las páginas de ",e.jsx(n.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"DMS"}),"."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.h2,{id:"resumen",children:"Resumen"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Cambio"}),e.jsx(n.th,{children:"Quién se ve afectado"}),e.jsx(n.th,{children:"Gravedad"}),e.jsx(n.th,{children:"Acción"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.a,{href:"#webhooks-con-referencias-a-archivos",children:"Webhooks con referencias a archivos"})}),e.jsx(n.td,{children:"DMS con webhook cuyo certificado o clave de mTLS eran rutas de archivo"}),e.jsx(n.td,{children:"Alta: los enrolamientos y reenrolamientos que llaman al webhook fallan"}),e.jsx(n.td,{children:"Volver a introducir certificado y clave como PEM, o eliminar los campos de archivo"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.a,{href:"#verificaci%C3%B3n-del-certificado-del-receptor",children:"Verificación del certificado del receptor"})}),e.jsxs(n.td,{children:["DMS con webhook que tenían ",e.jsx(n.code,{children:"validate_server_cert: false"})]}),e.jsx(n.td,{children:"Media: las credenciales del webhook viajan sin verificar al receptor"}),e.jsxs(n.td,{children:["Poner ",e.jsx(n.code,{children:"insecure_skip_verify"})," a ",e.jsx(n.code,{children:"false"})]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.a,{href:"#conjunto-de-confianza-del-reenrolamiento",children:"Conjunto de confianza del reenrolamiento"})}),e.jsx(n.td,{children:"Scripts y consolas que editan DMS por API"}),e.jsxs(n.td,{children:["Media: una edición con el formato antiguo vacía ",e.jsx(n.code,{children:"validation_cas"})," sin avisar"]}),e.jsx(n.td,{children:"Leer el DMS antes de editarlo y usar el campo nuevo"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.a,{href:"#autenticaci%C3%B3n-de-reenrolamiento-independiente",children:"Autenticación de reenrolamiento independiente"})}),e.jsx(n.td,{children:"Cualquier DMS"}),e.jsx(n.td,{children:"Baja: solo informativo"}),e.jsx(n.td,{children:"Revisar ambos bloques antes de editar"})]})]})]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["Al final se incluye una ",e.jsx(n.a,{href:"#lista-de-verificaci%C3%B3n",children:"lista de verificación"})," para confirmar el resultado."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.h2,{id:"webhooks-del-dms",children:"Webhooks del DMS"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.p,{children:"Las configuraciones de webhook almacenadas se reescriben al formato actual. Los campos se renombran de la siguiente manera:"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Campo en 3.8.0"}),e.jsx(n.th,{children:"Campo en 4.0.0"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"validate_server_cert"})}),e.jsxs(n.td,{children:[e.jsx(n.code,{children:"insecure_skip_verify"})," (con el valor negado)"]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"oidc"})}),e.jsx(n.td,{children:e.jsx(n.code,{children:"jwt_options"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"apikey"})}),e.jsx(n.td,{children:e.jsx(n.code,{children:"apikey_options"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"mtls"})}),e.jsx(n.td,{children:e.jsx(n.code,{children:"mtls_options"})})]})]})]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["Cuando el certificado y la clave heredados de mTLS son ambos PEM, se trasladan a ",e.jsx(n.code,{children:"mtls_options.cert_content"})," y ",e.jsx(n.code,{children:"mtls_options.key_content"})," y no requieren ninguna acción. Los dos casos siguientes son los que sí la requieren."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.h3,{id:"webhooks-con-referencias-a-archivos",children:"Webhooks con referencias a archivos"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["Una configuración mixta, con el certificado en PEM y la clave como ruta de archivo, se migra a ",e.jsx(n.code,{children:"mtls_options.cert_file"})," y ",e.jsx(n.code,{children:"mtls_options.key_file"}),". La entrega del webhook rechaza esos campos, y lo hace en cada llamada, sea cual sea el modo de autenticación configurado. El efecto es que todos los enrolamientos y reenrolamientos que invocan ese webhook fallan hasta corregir la configuración."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.p,{children:"Para corregirlo hay dos opciones, según el webhook:"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Si el webhook usa mTLS, volver a introducir el certificado y la clave como PEM, en Base64 o en texto plano."}),`
`,e.jsx(n.li,{children:"Si el webhook no usa mTLS, eliminar los campos de archivo sobrantes."}),`
`]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["Mientras tanto, las actualizaciones de solo metadatos siguen funcionando (",e.jsx(n.code,{children:"PUT"})," o ",e.jsx(n.code,{children:"PATCH"})," sobre ",e.jsx(n.code,{children:"/v1/dms/:id/metadata"}),")."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["Existe una variante del mismo problema: si la configuración almacenada guarda rutas de archivo dentro de ",e.jsx(n.code,{children:"mtls_options.cert_content"})," o ",e.jsx(n.code,{children:"mtls_options.key_content"}),", toda actualización completa de ajustes (",e.jsx(n.code,{children:"POST /v1/dms"})," o ",e.jsx(n.code,{children:"PUT /v1/dms/:id"}),") falla la validación. Los ajustes se sustituyen al completo, de modo que la configuración almacenada debe reenviarse con el certificado y la clave como PEM."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.h3,{id:"verificación-del-certificado-del-receptor",children:"Verificación del certificado del receptor"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["Una configuración con ",e.jsx(n.code,{children:"validate_server_cert: false"})," pasa a ",e.jsx(n.code,{children:"insecure_skip_verify: true"}),". Por tanto, la verificación del certificado del receptor sigue sin realizarse hasta que se ponga ese campo a ",e.jsx(n.code,{children:"false"}),"."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["Conviene corregirlo en cada configuración migrada. El canal de autorización del webhook transporta la API key o el bearer token, de modo que saltarse la verificación expone esas credenciales a un atacante con posición de red. Solo se justifica mantener ",e.jsx(n.code,{children:"insecure_skip_verify: true"})," si el certificado del receptor no es verificable de forma deliberada."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.h2,{id:"conjunto-de-confianza-del-reenrolamiento",children:"Conjunto de confianza del reenrolamiento"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["El campo plano ",e.jsx(n.code,{children:"reenrollment_settings.additional_validation_cas"})," se traslada al campo anidado ",e.jsx(n.code,{children:"reenrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas"}),"."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"{"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "reenrollment_settings"'}),e.jsx(n.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'    "est_rfc7030_settings"'}),e.jsx(n.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "client_certificate_settings"'}),e.jsx(n.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'        "validation_cas"'}),e.jsx(n.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" ["}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"<CA_ID>"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"]"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      }"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    }"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"  }"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"}"})})]})})})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.p,{children:"El conjunto de confianza efectivo no cambia, porque el valor anidado nunca se consultó al validar reenrolamientos. Si la lista plana estaba ausente o era nula, pasa a ser una lista vacía."})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["Lo que sí cambia es el tratamiento de las peticiones por API. Los cuerpos que aún contienen ",e.jsx(n.code,{children:"additional_validation_cas"})," se aceptan, pero su valor se ignora en silencio porque los campos JSON desconocidos se descartan, y las respuestas GET ya no lo incluyen. En consecuencia, un cuerpo de actualización construido con el formato antiguo vacía ",e.jsx(n.code,{children:"validation_cas"})," sin devolver ningún error. Para evitarlo, leer siempre el DMS antes de enviar una edición y reutilizar el formato que devuelve la API."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.h2,{id:"autenticación-de-reenrolamiento-independiente",children:"Autenticación de reenrolamiento independiente"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.p,{children:"Los ajustes de autenticación del reenrolamiento se almacenan ahora de forma independiente de los de la autenticación inicial. No hay nada que migrar, pero antes de editar un DMS conviene leer ambos bloques para no modificar uno creyendo que se está editando el otro."})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["Si la versión de la consola no expone los ajustes independientes, pueden editarse mediante la ",e.jsx(n.a,{href:"/docs/api-reference/dms-manager",children:"API DMS"}),"."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.h2,{id:"lista-de-verificación",children:"Lista de verificación"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.p,{children:"Tras aplicar la actualización, comprobar en este orden:"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Webhooks sin campos de archivo."})," Listar los DMS que usan webhook en enrolamiento o reenrolamiento y confirmar que cada bloque ",e.jsx(n.code,{children:"config"})," incluye ",e.jsx(n.code,{children:"insecure_skip_verify"})," y el bloque de opciones esperado (",e.jsx(n.code,{children:"apikey_options"}),", ",e.jsx(n.code,{children:"jwt_options"})," o ",e.jsx(n.code,{children:"mtls_options"}),"), con el certificado y la clave en PEM y sin ",e.jsx(n.code,{children:"cert_file"})," ni ",e.jsx(n.code,{children:"key_file"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Verificación del receptor."})," Confirmar que ",e.jsx(n.code,{children:"insecure_skip_verify"})," es ",e.jsx(n.code,{children:"false"}),", salvo que el certificado del receptor no sea verificable de forma intencionada."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Entrega."})," Lanzar, o esperar a que ocurra, un enrolamiento o reenrolamiento a través de cada webhook migrado y confirmar que la llamada de autorización se completa."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Conjunto de confianza."})," Leer ",e.jsx(n.code,{children:"est_rfc7030_settings.client_certificate_settings.validation_cas"})," y confirmar que contiene las CAs esperadas, en particular las de la CA antigua durante los solapamientos de rotación."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Clientes de la API."})," Actualizar los scripts y consolas que usen el formato antiguo del DMS (",e.jsx(n.code,{children:"additional_validation_cas"})," plano, o los campos ",e.jsx(n.code,{children:"mtls"}),", ",e.jsx(n.code,{children:"apikey"})," y ",e.jsx(n.code,{children:"oidc"})," heredados), ya que descartan esos valores sin avisar."]}),`
`]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(o,{children:[e.jsx(i,{title:"Configurar un DMS",href:"/docs/platform/iot-fleets/enrollment/dms"}),e.jsx(i,{title:"API DMS",href:"/docs/api-reference/dms-manager"})]})})]})}function f(a={}){const{wrapper:n}=a.components||{};return n?e.jsx(n,{...a,children:e.jsx(s,{...a})}):s(a)}function c(a,n){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,_markdown:l,default:f,frontmatter:r,lmDiff:d,structuredData:t,toc:m},Symbol.toStringTag,{value:"Module"}));export{u as _};
