import{j as e}from"./index-prc0XQdj.js";let c=`

Emitirás un certificado final para \`device-001\` mediante el flujo de generación de clave y CSR en el navegador. Al terminar conservarás \`device.crt\`, \`device.key\` y el certificado público de la raíz emisora, \`ca.pem\`.

Antes de empezar [#antes-de-empezar]

* Una CA raíz activa con clave de firma disponible y permisos para emitir. Si todavía no existe, sigue [Crea tu primera CA](/docs/platform/pki/quickstarts/create-certificate-authority).
* Su certificado público en \`ca.pem\`; este ejemplo utiliza la raíz creada en el recorrido anterior.
* OpenSSL 3.x y un directorio de trabajo con acceso restringido.
* Un identificador para el cliente: aquí usaremos \`device-001\`.

<Callout type="warn" title="Conserva la clave antes de cerrar el resultado">
  En este flujo la clave del cliente se genera en el navegador y debes descargarla al finalizar. Si la pierdes, tendrás que generar una clave y emitir otro certificado. El inventario de certificados permite descargar el certificado público, pero no recuperar esta clave.
</Callout>

<Steps>
  <Step>
    Inicia la emisión [#inicia-la-emisión]

    Abre la CA del recorrido anterior, entra en **Issued Certificates** y selecciona **Issue New**.
  </Step>

  <Step>
    Elige el método [#elige-el-método]

    Selecciona **Generate Key & CSR in Browser** para seguir este ejemplo.

    Si la clave debe generarse y permanecer en el sistema de destino, utiliza **Upload Existing CSR**, descrito en la [guía de autoridades](/docs/platform/pki/certificate-authorities#emite-certificados).
  </Step>

  <Step>
    Identifica el certificado [#identifica-el-certificado]

    Introduce \`device-001\` como \`Common Name\`. Añade los datos de sujeto requeridos por tu política y SANs si el consumidor los utiliza para identificar al cliente.

    Si vas a continuar con el registro manual, el \`Device ID\` será exactamente \`device-001\`.
  </Step>

  <Step>
    Configura clave y usos [#configura-clave-y-usos]

    Elige un algoritmo y tamaño admitidos por el perfil; por ejemplo, ECDSA P-256 si está permitido. Para este certificado de cliente, selecciona **Digital Signature** y **Client Authentication** y emite como certificado final.

    Solicita, por ejemplo, 30 días de validez, siempre dentro de la vigencia de la CA. Revisa el [perfil de emisión](/docs/platform/pki/certificate-profiles) si el contenido resultante difiere de lo solicitado.
  </Step>

  <Step>
    Emite y descarga [#emite-y-descarga]

    Confirma la emisión. Guarda el certificado PEM como \`device.crt\` y la clave privada como \`device.key\` en el directorio preparado.
  </Step>

  <Step>
    Verifica el resultado [#verifica-el-resultado]

    Comprueba en **Issued Certificates** que el certificado aparece activo. Anota su número de serie y verifica el material descargado con las comprobaciones siguientes.
  </Step>
</Steps>

Inspecciona contenido y fechas [#inspecciona-contenido-y-fechas]

\`\`\`bash
openssl x509 -in device.crt -noout -subject -issuer -serial -dates
openssl x509 -in device.crt -noout -text
\`\`\`

Comprueba \`CN=device-001\`, el emisor esperado, fechas vigentes, **Digital Signature** y el uso extendido **TLS Web Client Authentication**. Debe ser un certificado final: no debe declarar \`CA:TRUE\` ni habilitar **Certificate Sign**. Si **Basic Constraints** está presente, debe indicar \`CA:FALSE\`. Si solicitaste SANs, revisa que los identificadores esperados aparezcan en el certificado.

Verifica la cadena [#verifica-la-cadena]

\`\`\`bash
openssl verify -CAfile ca.pem -purpose sslclient device.crt
\`\`\`

El resultado esperado es \`device.crt: OK\`. Esta comprobación utiliza tu raíz explícita y evalúa la cadena, las fechas y la compatibilidad con el propósito de cliente TLS. La presencia de los usos y nombres esperados se comprueba también mediante la inspección anterior.

Si utilizas una CA intermedia, la raíz confiable debe estar en \`ca.pem\` y debes aportar las intermedias mediante \`-untrusted intermediates.pem\`. Esta variante se desarrolla en el [modelo de confianza](/docs/platform/pki/concepts/trust-model).

El comando no consulta OCSP ni CRL. Para comprobar revocación, continúa con [Validación de certificados](/docs/platform/pki/certificate-validation). Consulta la referencia de [openssl-verify](https://docs.openssl.org/3.6/man1/openssl-verify/) para sus opciones.

Comprueba que la clave corresponde [#comprueba-que-la-clave-corresponde]

En Bash, compara los dos resúmenes de clave pública:

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

Ambos comandos deben terminar correctamente y mostrar el mismo resumen SHA-256. Si difieren, la clave privada no corresponde al certificado seleccionado. Vuelve a localizar la pareja correcta antes de instalarla.

Las opciones utilizadas se recogen en [openssl-x509](https://docs.openssl.org/3.6/man1/openssl-x509/) y [openssl-pkey](https://docs.openssl.org/3.6/man1/openssl-pkey/).

Si el resultado falla [#si-el-resultado-falla]

| Resultado                       | Qué revisar                                            |
| ------------------------------- | ------------------------------------------------------ |
| La CA rechaza la emisión        | Permisos, estado y clave de la CA, algoritmo y perfil. |
| Sujeto o usos diferentes        | Perfil aplicado y valores solicitados.                 |
| No se encuentra el emisor       | CA descargada y cadena intermedia necesaria.           |
| Falla la vigencia               | Fechas del certificado y de la CA, y reloj del equipo. |
| Los resúmenes de clave difieren | Archivos de certificado y clave de la misma emisión.   |

Consulta [Diagnóstico PKI](/docs/platform/pki/troubleshooting) si necesitas acotar un fallo de emisión.

Siguiente paso [#siguiente-paso]

Has completado el recorrido PKI cuando el certificado verifica y su clave corresponde. Elige cómo utilizarlo:

* [Gestionar certificados](/docs/platform/pki/certificates) para inspección, estado y revocación.
* [Registrar un dispositivo manualmente](/docs/platform/iot-fleets/quickstarts/register-device) para asociar esta identidad al inventario de Lamassu.
* [Preparar EST](/docs/platform/iot-fleets/enrollment/dms) para que el dispositivo solicite sus siguientes identidades.

La aceptación en un consumidor requiere configurar su confianza, su comprobación de revocación y los permisos concedidos a la identidad.
`,o={title:"Emite y verifica un certificado",description:"Emite un certificado de cliente y comprueba contenido, cadena y correspondencia de clave."},d={contents:[{heading:void 0,content:"Emitirás un certificado final para `device-001` mediante el flujo de generación de clave y CSR en el navegador. Al terminar conservarás `device.crt`, `device.key` y el certificado público de la raíz emisora, `ca.pem`."},{heading:"antes-de-empezar",content:"Una CA raíz activa con clave de firma disponible y permisos para emitir. Si todavía no existe, sigue Crea tu primera CA."},{heading:"antes-de-empezar",content:"Su certificado público en `ca.pem`; este ejemplo utiliza la raíz creada en el recorrido anterior."},{heading:"antes-de-empezar",content:"OpenSSL 3.x y un directorio de trabajo con acceso restringido."},{heading:"antes-de-empezar",content:"Un identificador para el cliente: aquí usaremos `device-001`."},{heading:"antes-de-empezar",content:"En este flujo la clave del cliente se genera en el navegador y debes descargarla al finalizar. Si la pierdes, tendrás que generar una clave y emitir otro certificado. El inventario de certificados permite descargar el certificado público, pero no recuperar esta clave."},{heading:"inicia-la-emisión",content:"Abre la CA del recorrido anterior, entra en **Issued Certificates** y selecciona **Issue New**."},{heading:"elige-el-método",content:"Selecciona **Generate Key & CSR in Browser** para seguir este ejemplo."},{heading:"elige-el-método",content:"Si la clave debe generarse y permanecer en el sistema de destino, utiliza **Upload Existing CSR**, descrito en la guía de autoridades."},{heading:"identifica-el-certificado",content:"Introduce `device-001` como `Common Name`. Añade los datos de sujeto requeridos por tu política y SANs si el consumidor los utiliza para identificar al cliente."},{heading:"identifica-el-certificado",content:"Si vas a continuar con el registro manual, el `Device ID` será exactamente `device-001`."},{heading:"configura-clave-y-usos",content:"Elige un algoritmo y tamaño admitidos por el perfil; por ejemplo, ECDSA P-256 si está permitido. Para este certificado de cliente, selecciona **Digital Signature** y **Client Authentication** y emite como certificado final."},{heading:"configura-clave-y-usos",content:"Solicita, por ejemplo, 30 días de validez, siempre dentro de la vigencia de la CA. Revisa el perfil de emisión si el contenido resultante difiere de lo solicitado."},{heading:"emite-y-descarga",content:"Confirma la emisión. Guarda el certificado PEM como `device.crt` y la clave privada como `device.key` en el directorio preparado."},{heading:"verifica-el-resultado",content:"Comprueba en **Issued Certificates** que el certificado aparece activo. Anota su número de serie y verifica el material descargado con las comprobaciones siguientes."},{heading:"inspecciona-contenido-y-fechas",content:"Comprueba `CN=device-001`, el emisor esperado, fechas vigentes, **Digital Signature** y el uso extendido **TLS Web Client Authentication**. Debe ser un certificado final: no debe declarar `CA:TRUE` ni habilitar **Certificate Sign**. Si **Basic Constraints** está presente, debe indicar `CA:FALSE`. Si solicitaste SANs, revisa que los identificadores esperados aparezcan en el certificado."},{heading:"verifica-la-cadena",content:"El resultado esperado es `device.crt: OK`. Esta comprobación utiliza tu raíz explícita y evalúa la cadena, las fechas y la compatibilidad con el propósito de cliente TLS. La presencia de los usos y nombres esperados se comprueba también mediante la inspección anterior."},{heading:"verifica-la-cadena",content:"Si utilizas una CA intermedia, la raíz confiable debe estar en `ca.pem` y debes aportar las intermedias mediante `-untrusted intermediates.pem`. Esta variante se desarrolla en el modelo de confianza."},{heading:"verifica-la-cadena",content:"El comando no consulta OCSP ni CRL. Para comprobar revocación, continúa con Validación de certificados. Consulta la referencia de openssl-verify para sus opciones."},{heading:"comprueba-que-la-clave-corresponde",content:"En Bash, compara los dos resúmenes de clave pública:"},{heading:"comprueba-que-la-clave-corresponde",content:"Ambos comandos deben terminar correctamente y mostrar el mismo resumen SHA-256. Si difieren, la clave privada no corresponde al certificado seleccionado. Vuelve a localizar la pareja correcta antes de instalarla."},{heading:"comprueba-que-la-clave-corresponde",content:"Las opciones utilizadas se recogen en openssl-x509 y openssl-pkey."},{heading:"si-el-resultado-falla",content:"Resultado"},{heading:"si-el-resultado-falla",content:"Qué revisar"},{heading:"si-el-resultado-falla",content:"La CA rechaza la emisión"},{heading:"si-el-resultado-falla",content:"Permisos, estado y clave de la CA, algoritmo y perfil."},{heading:"si-el-resultado-falla",content:"Sujeto o usos diferentes"},{heading:"si-el-resultado-falla",content:"Perfil aplicado y valores solicitados."},{heading:"si-el-resultado-falla",content:"No se encuentra el emisor"},{heading:"si-el-resultado-falla",content:"CA descargada y cadena intermedia necesaria."},{heading:"si-el-resultado-falla",content:"Falla la vigencia"},{heading:"si-el-resultado-falla",content:"Fechas del certificado y de la CA, y reloj del equipo."},{heading:"si-el-resultado-falla",content:"Los resúmenes de clave difieren"},{heading:"si-el-resultado-falla",content:"Archivos de certificado y clave de la misma emisión."},{heading:"si-el-resultado-falla",content:"Consulta Diagnóstico PKI si necesitas acotar un fallo de emisión."},{heading:"siguiente-paso",content:"Has completado el recorrido PKI cuando el certificado verifica y su clave corresponde. Elige cómo utilizarlo:"},{heading:"siguiente-paso",content:"Gestionar certificados para inspección, estado y revocación."},{heading:"siguiente-paso",content:"Registrar un dispositivo manualmente para asociar esta identidad al inventario de Lamassu."},{heading:"siguiente-paso",content:"Preparar EST para que el dispositivo solicite sus siguientes identidades."},{heading:"siguiente-paso",content:"La aceptación en un consumidor requiere configurar su confianza, su comprobación de revocación y los permisos concedidos a la identidad."}],headings:[{id:"antes-de-empezar",content:"Antes de empezar"},{id:"inicia-la-emisión",content:"Inicia la emisión"},{id:"elige-el-método",content:"Elige el método"},{id:"identifica-el-certificado",content:"Identifica el certificado"},{id:"configura-clave-y-usos",content:"Configura clave y usos"},{id:"emite-y-descarga",content:"Emite y descarga"},{id:"verifica-el-resultado",content:"Verifica el resultado"},{id:"inspecciona-contenido-y-fechas",content:"Inspecciona contenido y fechas"},{id:"verifica-la-cadena",content:"Verifica la cadena"},{id:"comprueba-que-la-clave-corresponde",content:"Comprueba que la clave corresponde"},{id:"si-el-resultado-falla",content:"Si el resultado falla"},{id:"siguiente-paso",content:"Siguiente paso"}]};const h=[{depth:2,url:"#antes-de-empezar",title:e.jsx(e.Fragment,{children:"Antes de empezar"})},{depth:3,url:"#inicia-la-emisión",title:e.jsx(e.Fragment,{children:"Inicia la emisión"})},{depth:3,url:"#elige-el-método",title:e.jsx(e.Fragment,{children:"Elige el método"})},{depth:3,url:"#identifica-el-certificado",title:e.jsx(e.Fragment,{children:"Identifica el certificado"})},{depth:3,url:"#configura-clave-y-usos",title:e.jsx(e.Fragment,{children:"Configura clave y usos"})},{depth:3,url:"#emite-y-descarga",title:e.jsx(e.Fragment,{children:"Emite y descarga"})},{depth:3,url:"#verifica-el-resultado",title:e.jsx(e.Fragment,{children:"Verifica el resultado"})},{depth:2,url:"#inspecciona-contenido-y-fechas",title:e.jsx(e.Fragment,{children:"Inspecciona contenido y fechas"})},{depth:2,url:"#verifica-la-cadena",title:e.jsx(e.Fragment,{children:"Verifica la cadena"})},{depth:2,url:"#comprueba-que-la-clave-corresponde",title:e.jsx(e.Fragment,{children:"Comprueba que la clave corresponde"})},{depth:2,url:"#si-el-resultado-falla",title:e.jsx(e.Fragment,{children:"Si el resultado falla"})},{depth:2,url:"#siguiente-paso",title:e.jsx(e.Fragment,{children:"Siguiente paso"})}];function t(a){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...a.components},{Callout:r,Step:s,Steps:l}=i;return r||n("Callout"),s||n("Step"),l||n("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["Emitirás un certificado final para ",e.jsx(i.code,{children:"device-001"})," mediante el flujo de generación de clave y CSR en el navegador. Al terminar conservarás ",e.jsx(i.code,{children:"device.crt"}),", ",e.jsx(i.code,{children:"device.key"})," y el certificado público de la raíz emisora, ",e.jsx(i.code,{children:"ca.pem"}),"."]}),`
`,e.jsx(i.h2,{id:"antes-de-empezar",children:"Antes de empezar"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Una CA raíz activa con clave de firma disponible y permisos para emitir. Si todavía no existe, sigue ",e.jsx(i.a,{href:"/docs/platform/pki/quickstarts/create-certificate-authority",children:"Crea tu primera CA"}),"."]}),`
`,e.jsxs(i.li,{children:["Su certificado público en ",e.jsx(i.code,{children:"ca.pem"}),"; este ejemplo utiliza la raíz creada en el recorrido anterior."]}),`
`,e.jsx(i.li,{children:"OpenSSL 3.x y un directorio de trabajo con acceso restringido."}),`
`,e.jsxs(i.li,{children:["Un identificador para el cliente: aquí usaremos ",e.jsx(i.code,{children:"device-001"}),"."]}),`
`]}),`
`,e.jsx(r,{type:"warn",title:"Conserva la clave antes de cerrar el resultado",children:e.jsx(i.p,{children:"En este flujo la clave del cliente se genera en el navegador y debes descargarla al finalizar. Si la pierdes, tendrás que generar una clave y emitir otro certificado. El inventario de certificados permite descargar el certificado público, pero no recuperar esta clave."})}),`
`,e.jsxs(l,{children:[e.jsxs(s,{children:[e.jsx(i.h3,{id:"inicia-la-emisión",children:"Inicia la emisión"}),e.jsxs(i.p,{children:["Abre la CA del recorrido anterior, entra en ",e.jsx(i.strong,{children:"Issued Certificates"})," y selecciona ",e.jsx(i.strong,{children:"Issue New"}),"."]})]}),e.jsxs(s,{children:[e.jsx(i.h3,{id:"elige-el-método",children:"Elige el método"}),e.jsxs(i.p,{children:["Selecciona ",e.jsx(i.strong,{children:"Generate Key & CSR in Browser"})," para seguir este ejemplo."]}),e.jsxs(i.p,{children:["Si la clave debe generarse y permanecer en el sistema de destino, utiliza ",e.jsx(i.strong,{children:"Upload Existing CSR"}),", descrito en la ",e.jsx(i.a,{href:"/docs/platform/pki/certificate-authorities#emite-certificados",children:"guía de autoridades"}),"."]})]}),e.jsxs(s,{children:[e.jsx(i.h3,{id:"identifica-el-certificado",children:"Identifica el certificado"}),e.jsxs(i.p,{children:["Introduce ",e.jsx(i.code,{children:"device-001"})," como ",e.jsx(i.code,{children:"Common Name"}),". Añade los datos de sujeto requeridos por tu política y SANs si el consumidor los utiliza para identificar al cliente."]}),e.jsxs(i.p,{children:["Si vas a continuar con el registro manual, el ",e.jsx(i.code,{children:"Device ID"})," será exactamente ",e.jsx(i.code,{children:"device-001"}),"."]})]}),e.jsxs(s,{children:[e.jsx(i.h3,{id:"configura-clave-y-usos",children:"Configura clave y usos"}),e.jsxs(i.p,{children:["Elige un algoritmo y tamaño admitidos por el perfil; por ejemplo, ECDSA P-256 si está permitido. Para este certificado de cliente, selecciona ",e.jsx(i.strong,{children:"Digital Signature"})," y ",e.jsx(i.strong,{children:"Client Authentication"})," y emite como certificado final."]}),e.jsxs(i.p,{children:["Solicita, por ejemplo, 30 días de validez, siempre dentro de la vigencia de la CA. Revisa el ",e.jsx(i.a,{href:"/docs/platform/pki/certificate-profiles",children:"perfil de emisión"})," si el contenido resultante difiere de lo solicitado."]})]}),e.jsxs(s,{children:[e.jsx(i.h3,{id:"emite-y-descarga",children:"Emite y descarga"}),e.jsxs(i.p,{children:["Confirma la emisión. Guarda el certificado PEM como ",e.jsx(i.code,{children:"device.crt"})," y la clave privada como ",e.jsx(i.code,{children:"device.key"})," en el directorio preparado."]})]}),e.jsxs(s,{children:[e.jsx(i.h3,{id:"verifica-el-resultado",children:"Verifica el resultado"}),e.jsxs(i.p,{children:["Comprueba en ",e.jsx(i.strong,{children:"Issued Certificates"})," que el certificado aparece activo. Anota su número de serie y verifica el material descargado con las comprobaciones siguientes."]})]})]}),`
`,e.jsx(i.h2,{id:"inspecciona-contenido-y-fechas",children:"Inspecciona contenido y fechas"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" x509"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" device.crt"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -noout"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -subject"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -issuer"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -serial"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -dates"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" x509"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" device.crt"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -noout"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -text"})]})]})})}),`
`,e.jsxs(i.p,{children:["Comprueba ",e.jsx(i.code,{children:"CN=device-001"}),", el emisor esperado, fechas vigentes, ",e.jsx(i.strong,{children:"Digital Signature"})," y el uso extendido ",e.jsx(i.strong,{children:"TLS Web Client Authentication"}),". Debe ser un certificado final: no debe declarar ",e.jsx(i.code,{children:"CA:TRUE"})," ni habilitar ",e.jsx(i.strong,{children:"Certificate Sign"}),". Si ",e.jsx(i.strong,{children:"Basic Constraints"})," está presente, debe indicar ",e.jsx(i.code,{children:"CA:FALSE"}),". Si solicitaste SANs, revisa que los identificadores esperados aparezcan en el certificado."]}),`
`,e.jsx(i.h2,{id:"verifica-la-cadena",children:"Verifica la cadena"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" verify"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -CAfile"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ca.pem"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -purpose"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" sslclient"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" device.crt"})]})})})}),`
`,e.jsxs(i.p,{children:["El resultado esperado es ",e.jsx(i.code,{children:"device.crt: OK"}),". Esta comprobación utiliza tu raíz explícita y evalúa la cadena, las fechas y la compatibilidad con el propósito de cliente TLS. La presencia de los usos y nombres esperados se comprueba también mediante la inspección anterior."]}),`
`,e.jsxs(i.p,{children:["Si utilizas una CA intermedia, la raíz confiable debe estar en ",e.jsx(i.code,{children:"ca.pem"})," y debes aportar las intermedias mediante ",e.jsx(i.code,{children:"-untrusted intermediates.pem"}),". Esta variante se desarrolla en el ",e.jsx(i.a,{href:"/docs/platform/pki/concepts/trust-model",children:"modelo de confianza"}),"."]}),`
`,e.jsxs(i.p,{children:["El comando no consulta OCSP ni CRL. Para comprobar revocación, continúa con ",e.jsx(i.a,{href:"/docs/platform/pki/certificate-validation",children:"Validación de certificados"}),". Consulta la referencia de ",e.jsx(i.a,{href:"https://docs.openssl.org/3.6/man1/openssl-verify/",children:"openssl-verify"})," para sus opciones."]}),`
`,e.jsx(i.h2,{id:"comprueba-que-la-clave-corresponde",children:"Comprueba que la clave corresponde"}),`
`,e.jsx(i.p,{children:"En Bash, compara los dos resúmenes de clave pública:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"("})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  set"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -e"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -o"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pipefail"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" x509"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" device.crt"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -pubkey"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -noout"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"    |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pkey"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -pubin"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -outform"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" DER"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"    |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" dgst"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -sha256"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pkey"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" device.key"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -pubout"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -outform"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" DER"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"    |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" openssl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" dgst"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -sha256"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:")"})})]})})}),`
`,e.jsx(i.p,{children:"Ambos comandos deben terminar correctamente y mostrar el mismo resumen SHA-256. Si difieren, la clave privada no corresponde al certificado seleccionado. Vuelve a localizar la pareja correcta antes de instalarla."}),`
`,e.jsxs(i.p,{children:["Las opciones utilizadas se recogen en ",e.jsx(i.a,{href:"https://docs.openssl.org/3.6/man1/openssl-x509/",children:"openssl-x509"})," y ",e.jsx(i.a,{href:"https://docs.openssl.org/3.6/man1/openssl-pkey/",children:"openssl-pkey"}),"."]}),`
`,e.jsx(i.h2,{id:"si-el-resultado-falla",children:"Si el resultado falla"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Resultado"}),e.jsx(i.th,{children:"Qué revisar"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"La CA rechaza la emisión"}),e.jsx(i.td,{children:"Permisos, estado y clave de la CA, algoritmo y perfil."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Sujeto o usos diferentes"}),e.jsx(i.td,{children:"Perfil aplicado y valores solicitados."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"No se encuentra el emisor"}),e.jsx(i.td,{children:"CA descargada y cadena intermedia necesaria."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Falla la vigencia"}),e.jsx(i.td,{children:"Fechas del certificado y de la CA, y reloj del equipo."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Los resúmenes de clave difieren"}),e.jsx(i.td,{children:"Archivos de certificado y clave de la misma emisión."})]})]})]}),`
`,e.jsxs(i.p,{children:["Consulta ",e.jsx(i.a,{href:"/docs/platform/pki/troubleshooting",children:"Diagnóstico PKI"})," si necesitas acotar un fallo de emisión."]}),`
`,e.jsx(i.h2,{id:"siguiente-paso",children:"Siguiente paso"}),`
`,e.jsx(i.p,{children:"Has completado el recorrido PKI cuando el certificado verifica y su clave corresponde. Elige cómo utilizarlo:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/platform/pki/certificates",children:"Gestionar certificados"})," para inspección, estado y revocación."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/platform/iot-fleets/quickstarts/register-device",children:"Registrar un dispositivo manualmente"})," para asociar esta identidad al inventario de Lamassu."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"Preparar EST"})," para que el dispositivo solicite sus siguientes identidades."]}),`
`]}),`
`,e.jsx(i.p,{children:"La aceptación en un consumidor requiere configurar su confianza, su comprobación de revocación y los permisos concedidos a la identidad."})]})}function p(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(t,{...a})}):t(a)}function n(a,i){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:p,frontmatter:o,structuredData:d,toc:h},Symbol.toStringTag,{value:"Module"}));export{u as _};
