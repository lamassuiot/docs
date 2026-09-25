import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let t=`

Servicio CRL [#servicio-crl]

Una CRL (*Certificate Revocation List*) es una lista firmada que contiene los números de serie de los certificados revocados antes de su fecha de caducidad. A diferencia de OCSP, no requiere una consulta en tiempo real: la parte que confía descarga la lista periódicamente y la consulta de forma local.

Lamassu genera y mantiene una CRL por cada CA que gestiona. Cada CRL está firmada con la clave privada de la propia CA emisora y se almacena en el sistema de almacenamiento de objetos configurado en la plataforma.

Rol VA y configuración por CA [#rol-va-y-configuración-por-ca]

La publicación de la CRL de cada CA se controla mediante un *rol VA*. Este objeto define cómo se genera, cuándo se regenera y qué clave se utiliza para firmarla.

Los parámetros principales son:

* **\`validity\`** define el periodo de validez reflejado en \`nextUpdate\`. Su valor predeterminado es 7 días.
* **\`refresh_interval\`** establece el intervalo mínimo entre regeneraciones programadas. Por defecto es aproximadamente 6 días y 23 horas.
* **\`regenerate_on_revoke\`** ordena publicar una versión nueva inmediatamente después de una revocación. Está activo por defecto.

El campo \`subject_key_id_signer\` identifica la CA cuya clave privada firma la CRL. Por defecto, cada CA firma su propia CRL.

Cada CRL lleva un número de versión incremental. Lamassu almacena todas las versiones en la ruta \`pki/va/crl/{subject_key_id}/{version}.crl\` del almacenamiento de objetos.

Regeneración periódica y automática [#regeneración-periódica-y-automática]

Un proceso en segundo plano supervisa los roles VA activos. Cuando la validez restante de la CRL vigente cae por debajo del período de vigilancia configurado (*blind period*), el sistema solicita la generación de una nueva CRL. Así se evita que la CRL publicada caduque sin que exista una versión válida disponible.

Además, cuando \`regenerate_on_revoke\` está activo, que es el comportamiento por defecto, cualquier revocación de un certificado desencadena inmediatamente la generación de una nueva CRL para la CA afectada. Esto reduce al mínimo el tiempo entre la revocación y su publicación.

Contenido de la CRL [#contenido-de-la-crl]

Cada entrada de la CRL incluye el número de serie del certificado revocado, la fecha de revocación y el código de razón conforme a RFC 5280.

La CRL incluye también la extensión *Issuing Distribution Point* (IDP, OID 2.5.29.28), marcada como crítica, que indica la URL pública desde la que puede descargarse. Esa URL apunta al endpoint \`/crl/{subject_key_id}\` de cada dominio VA configurado.

Endpoint público de descarga [#endpoint-público-de-descarga]

La CRL más reciente de una CA se puede obtener directamente sin autenticación:

\`\`\`bash
curl https://<LAMASSU_HOST>/crl/<CA_SUBJECT_KEY_ID> -o ca.crl
\`\`\`

La respuesta tiene \`Content-Type: application/pkix-crl\` y contiene la CRL en formato DER.

API de gestión del rol VA [#api-de-gestión-del-rol-va]

El rol VA de una CA se puede consultar y actualizar mediante la API:

| Método | Ruta                 | Descripción                                                                                                       |
| ------ | -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| \`GET\`  | \`/v1/roles/{ca-ski}\` | Devuelve la configuración del rol VA y los metadatos de la última CRL emitida.                                    |
| \`PUT\`  | \`/v1/roles/{ca-ski}\` | Actualiza los parámetros de la configuración del rol VA (\`validity\`, \`refresh_interval\`, \`regenerate_on_revoke\`). |

Ejemplo de consulta del rol VA:

\`\`\`bash
curl https://<LAMASSU_HOST>/v1/roles/<CA_SUBJECT_KEY_ID> \\
  -H "Authorization: Bearer <TOKEN>"
\`\`\`

La respuesta incluye el campo \`latest_crl\` con la versión, la fecha de inicio de validez y la fecha de caducidad de la CRL actualmente publicada.

Desde la interfaz [#desde-la-interfaz]

Desde el panel de detalle de una CA es posible previsualizar el contenido de la CRL activa y descargarla directamente para su uso offline o para importarla en aplicaciones que realicen validación local.

Referencias [#referencias]

* RFC 5280 - *Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile*

<Cards>
  <Card title="Servicio OCSP" href="/docs/platform/pki/ocsp" />

  <Card title="Validación de certificados" href="/docs/platform/pki/certificate-validation" />
</Cards>
`,s={title:"Listas de revocación (CRL)",description:"Genera y distribuye listas firmadas para validar certificados sin conexión.",sidebar:{group:"VA",label:"CRL"}},o={contents:[{heading:"servicio-crl",content:"Una CRL (*Certificate Revocation List*) es una lista firmada que contiene los números de serie de los certificados revocados antes de su fecha de caducidad. A diferencia de OCSP, no requiere una consulta en tiempo real: la parte que confía descarga la lista periódicamente y la consulta de forma local."},{heading:"servicio-crl",content:"Lamassu genera y mantiene una CRL por cada CA que gestiona. Cada CRL está firmada con la clave privada de la propia CA emisora y se almacena en el sistema de almacenamiento de objetos configurado en la plataforma."},{heading:"rol-va-y-configuración-por-ca",content:"La publicación de la CRL de cada CA se controla mediante un *rol VA*. Este objeto define cómo se genera, cuándo se regenera y qué clave se utiliza para firmarla."},{heading:"rol-va-y-configuración-por-ca",content:"Los parámetros principales son:"},{heading:"rol-va-y-configuración-por-ca",content:"**`validity`** define el periodo de validez reflejado en `nextUpdate`. Su valor predeterminado es 7 días."},{heading:"rol-va-y-configuración-por-ca",content:"**`refresh_interval`** establece el intervalo mínimo entre regeneraciones programadas. Por defecto es aproximadamente 6 días y 23 horas."},{heading:"rol-va-y-configuración-por-ca",content:"**`regenerate_on_revoke`** ordena publicar una versión nueva inmediatamente después de una revocación. Está activo por defecto."},{heading:"rol-va-y-configuración-por-ca",content:"El campo `subject_key_id_signer` identifica la CA cuya clave privada firma la CRL. Por defecto, cada CA firma su propia CRL."},{heading:"rol-va-y-configuración-por-ca",content:"Cada CRL lleva un número de versión incremental. Lamassu almacena todas las versiones en la ruta `pki/va/crl/{subject_key_id}/{version}.crl` del almacenamiento de objetos."},{heading:"regeneración-periódica-y-automática",content:"Un proceso en segundo plano supervisa los roles VA activos. Cuando la validez restante de la CRL vigente cae por debajo del período de vigilancia configurado (*blind period*), el sistema solicita la generación de una nueva CRL. Así se evita que la CRL publicada caduque sin que exista una versión válida disponible."},{heading:"regeneración-periódica-y-automática",content:"Además, cuando `regenerate_on_revoke` está activo, que es el comportamiento por defecto, cualquier revocación de un certificado desencadena inmediatamente la generación de una nueva CRL para la CA afectada. Esto reduce al mínimo el tiempo entre la revocación y su publicación."},{heading:"contenido-de-la-crl",content:"Cada entrada de la CRL incluye el número de serie del certificado revocado, la fecha de revocación y el código de razón conforme a RFC 5280."},{heading:"contenido-de-la-crl",content:"La CRL incluye también la extensión *Issuing Distribution Point* (IDP, OID 2.5.29.28), marcada como crítica, que indica la URL pública desde la que puede descargarse. Esa URL apunta al endpoint `/crl/{subject_key_id}` de cada dominio VA configurado."},{heading:"endpoint-público-de-descarga",content:"La CRL más reciente de una CA se puede obtener directamente sin autenticación:"},{heading:"endpoint-público-de-descarga",content:"La respuesta tiene `Content-Type: application/pkix-crl` y contiene la CRL en formato DER."},{heading:"api-de-gestión-del-rol-va",content:"El rol VA de una CA se puede consultar y actualizar mediante la API:"},{heading:"api-de-gestión-del-rol-va",content:"Método"},{heading:"api-de-gestión-del-rol-va",content:"Ruta"},{heading:"api-de-gestión-del-rol-va",content:"Descripción"},{heading:"api-de-gestión-del-rol-va",content:"`GET`"},{heading:"api-de-gestión-del-rol-va",content:"`/v1/roles/{ca-ski}`"},{heading:"api-de-gestión-del-rol-va",content:"Devuelve la configuración del rol VA y los metadatos de la última CRL emitida."},{heading:"api-de-gestión-del-rol-va",content:"`PUT`"},{heading:"api-de-gestión-del-rol-va",content:"`/v1/roles/{ca-ski}`"},{heading:"api-de-gestión-del-rol-va",content:"Actualiza los parámetros de la configuración del rol VA (`validity`, `refresh_interval`, `regenerate_on_revoke`)."},{heading:"api-de-gestión-del-rol-va",content:"Ejemplo de consulta del rol VA:"},{heading:"api-de-gestión-del-rol-va",content:"La respuesta incluye el campo `latest_crl` con la versión, la fecha de inicio de validez y la fecha de caducidad de la CRL actualmente publicada."},{heading:"desde-la-interfaz",content:"Desde el panel de detalle de una CA es posible previsualizar el contenido de la CRL activa y descargarla directamente para su uso offline o para importarla en aplicaciones que realicen validación local."},{heading:"referencias",content:"RFC 5280 - *Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile*"},{heading:"referencias",content:'<Card title="Servicio OCSP" href="/docs/platform/pki/ocsp" />'},{heading:"referencias",content:'<Card title="Validación de certificados" href="/docs/platform/pki/certificate-validation" />'}],headings:[{id:"servicio-crl",content:"Servicio CRL"},{id:"rol-va-y-configuración-por-ca",content:"Rol VA y configuración por CA"},{id:"regeneración-periódica-y-automática",content:"Regeneración periódica y automática"},{id:"contenido-de-la-crl",content:"Contenido de la CRL"},{id:"endpoint-público-de-descarga",content:"Endpoint público de descarga"},{id:"api-de-gestión-del-rol-va",content:"API de gestión del rol VA"},{id:"desde-la-interfaz",content:"Desde la interfaz"},{id:"referencias",content:"Referencias"}]};const p=[{depth:1,url:"#servicio-crl",title:e.jsx(e.Fragment,{children:"Servicio CRL"})},{depth:2,url:"#rol-va-y-configuración-por-ca",title:e.jsx(e.Fragment,{children:"Rol VA y configuración por CA"})},{depth:2,url:"#regeneración-periódica-y-automática",title:e.jsx(e.Fragment,{children:"Regeneración periódica y automática"})},{depth:2,url:"#contenido-de-la-crl",title:e.jsx(e.Fragment,{children:"Contenido de la CRL"})},{depth:2,url:"#endpoint-público-de-descarga",title:e.jsx(e.Fragment,{children:"Endpoint público de descarga"})},{depth:2,url:"#api-de-gestión-del-rol-va",title:e.jsx(e.Fragment,{children:"API de gestión del rol VA"})},{depth:2,url:"#desde-la-interfaz",title:e.jsx(e.Fragment,{children:"Desde la interfaz"})},{depth:2,url:"#referencias",title:e.jsx(e.Fragment,{children:"Referencias"})}];function d(i){const a={code:"code",em:"em",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Card:n,Cards:r}=a;return n||c("Card"),r||c("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(a.h1,{id:"servicio-crl",children:"Servicio CRL"}),`
`,e.jsxs(a.p,{children:["Una CRL (",e.jsx(a.em,{children:"Certificate Revocation List"}),") es una lista firmada que contiene los números de serie de los certificados revocados antes de su fecha de caducidad. A diferencia de OCSP, no requiere una consulta en tiempo real: la parte que confía descarga la lista periódicamente y la consulta de forma local."]}),`
`,e.jsx(a.p,{children:"Lamassu genera y mantiene una CRL por cada CA que gestiona. Cada CRL está firmada con la clave privada de la propia CA emisora y se almacena en el sistema de almacenamiento de objetos configurado en la plataforma."}),`
`,e.jsx(a.h2,{id:"rol-va-y-configuración-por-ca",children:"Rol VA y configuración por CA"}),`
`,e.jsxs(a.p,{children:["La publicación de la CRL de cada CA se controla mediante un ",e.jsx(a.em,{children:"rol VA"}),". Este objeto define cómo se genera, cuándo se regenera y qué clave se utiliza para firmarla."]}),`
`,e.jsx(a.p,{children:"Los parámetros principales son:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:e.jsx(a.code,{children:"validity"})})," define el periodo de validez reflejado en ",e.jsx(a.code,{children:"nextUpdate"}),". Su valor predeterminado es 7 días."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:e.jsx(a.code,{children:"refresh_interval"})})," establece el intervalo mínimo entre regeneraciones programadas. Por defecto es aproximadamente 6 días y 23 horas."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:e.jsx(a.code,{children:"regenerate_on_revoke"})})," ordena publicar una versión nueva inmediatamente después de una revocación. Está activo por defecto."]}),`
`]}),`
`,e.jsxs(a.p,{children:["El campo ",e.jsx(a.code,{children:"subject_key_id_signer"})," identifica la CA cuya clave privada firma la CRL. Por defecto, cada CA firma su propia CRL."]}),`
`,e.jsxs(a.p,{children:["Cada CRL lleva un número de versión incremental. Lamassu almacena todas las versiones en la ruta ",e.jsx(a.code,{children:"pki/va/crl/{subject_key_id}/{version}.crl"})," del almacenamiento de objetos."]}),`
`,e.jsx(a.h2,{id:"regeneración-periódica-y-automática",children:"Regeneración periódica y automática"}),`
`,e.jsxs(a.p,{children:["Un proceso en segundo plano supervisa los roles VA activos. Cuando la validez restante de la CRL vigente cae por debajo del período de vigilancia configurado (",e.jsx(a.em,{children:"blind period"}),"), el sistema solicita la generación de una nueva CRL. Así se evita que la CRL publicada caduque sin que exista una versión válida disponible."]}),`
`,e.jsxs(a.p,{children:["Además, cuando ",e.jsx(a.code,{children:"regenerate_on_revoke"})," está activo, que es el comportamiento por defecto, cualquier revocación de un certificado desencadena inmediatamente la generación de una nueva CRL para la CA afectada. Esto reduce al mínimo el tiempo entre la revocación y su publicación."]}),`
`,e.jsx(a.h2,{id:"contenido-de-la-crl",children:"Contenido de la CRL"}),`
`,e.jsx(a.p,{children:"Cada entrada de la CRL incluye el número de serie del certificado revocado, la fecha de revocación y el código de razón conforme a RFC 5280."}),`
`,e.jsxs(a.p,{children:["La CRL incluye también la extensión ",e.jsx(a.em,{children:"Issuing Distribution Point"})," (IDP, OID 2.5.29.28), marcada como crítica, que indica la URL pública desde la que puede descargarse. Esa URL apunta al endpoint ",e.jsx(a.code,{children:"/crl/{subject_key_id}"})," de cada dominio VA configurado."]}),`
`,e.jsx(a.h2,{id:"endpoint-público-de-descarga",children:"Endpoint público de descarga"}),`
`,e.jsx(a.p,{children:"La CRL más reciente de una CA se puede obtener directamente sin autenticación:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"curl"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" https://"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"<"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"LAMASSU_HOS"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"T"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"/crl/"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"<"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"CA_SUBJECT_KEY_I"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"D"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -o"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ca.crl"})]})})})}),`
`,e.jsxs(a.p,{children:["La respuesta tiene ",e.jsx(a.code,{children:"Content-Type: application/pkix-crl"})," y contiene la CRL en formato DER."]}),`
`,e.jsx(a.h2,{id:"api-de-gestión-del-rol-va",children:"API de gestión del rol VA"}),`
`,e.jsx(a.p,{children:"El rol VA de una CA se puede consultar y actualizar mediante la API:"}),`
`,e.jsxs(a.table,{children:[e.jsx(a.thead,{children:e.jsxs(a.tr,{children:[e.jsx(a.th,{children:"Método"}),e.jsx(a.th,{children:"Ruta"}),e.jsx(a.th,{children:"Descripción"})]})}),e.jsxs(a.tbody,{children:[e.jsxs(a.tr,{children:[e.jsx(a.td,{children:e.jsx(a.code,{children:"GET"})}),e.jsx(a.td,{children:e.jsx(a.code,{children:"/v1/roles/{ca-ski}"})}),e.jsx(a.td,{children:"Devuelve la configuración del rol VA y los metadatos de la última CRL emitida."})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{children:e.jsx(a.code,{children:"PUT"})}),e.jsx(a.td,{children:e.jsx(a.code,{children:"/v1/roles/{ca-ski}"})}),e.jsxs(a.td,{children:["Actualiza los parámetros de la configuración del rol VA (",e.jsx(a.code,{children:"validity"}),", ",e.jsx(a.code,{children:"refresh_interval"}),", ",e.jsx(a.code,{children:"regenerate_on_revoke"}),")."]})]})]})]}),`
`,e.jsx(a.p,{children:"Ejemplo de consulta del rol VA:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(a.code,{children:[e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"curl"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" https://"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"<"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"LAMASSU_HOS"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"T"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"/v1/roles/"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"<"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"CA_SUBJECT_KEY_I"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"D"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -H"}),e.jsx(a.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "Authorization: Bearer <TOKEN>"'})]})]})})}),`
`,e.jsxs(a.p,{children:["La respuesta incluye el campo ",e.jsx(a.code,{children:"latest_crl"})," con la versión, la fecha de inicio de validez y la fecha de caducidad de la CRL actualmente publicada."]}),`
`,e.jsx(a.h2,{id:"desde-la-interfaz",children:"Desde la interfaz"}),`
`,e.jsx(a.p,{children:"Desde el panel de detalle de una CA es posible previsualizar el contenido de la CRL activa y descargarla directamente para su uso offline o para importarla en aplicaciones que realicen validación local."}),`
`,e.jsx(a.h2,{id:"referencias",children:"Referencias"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:["RFC 5280 - ",e.jsx(a.em,{children:"Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile"})]}),`
`]}),`
`,e.jsxs(r,{children:[e.jsx(n,{title:"Servicio OCSP",href:"/docs/platform/pki/ocsp"}),e.jsx(n,{title:"Validación de certificados",href:"/docs/platform/pki/certificate-validation"})]})]})}function u(i={}){const{wrapper:a}=i.components||{};return a?e.jsx(a,{...i,children:e.jsx(d,{...i})}):d(i)}function c(i,a){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{t as _markdown,u as default,s as frontmatter,o as structuredData,p as toc};
