import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let o=`

En este quickstart Lamassu generará la clave y el CSR en el navegador, y la CA emitirá el certificado. Al terminar descargarás el certificado y su clave privada.

Antes de empezar [#antes-de-empezar]

* Una CA activa con permiso para emitir certificados.
* Un nombre para la identidad, por ejemplo \`device-001.example.internal\`.
* Un lugar seguro en el que custodiar la clave privada descargada.

<Callout type="warn" title="La clave privada se entrega una sola vez">
  En este flujo la clave se genera en el navegador y Lamassu no la almacena. Descárgala y protégela antes de cerrar el resultado de la operación.
</Callout>

<Steps>
  <Step>
    Inicia la emisión [#inicia-la-emisión]

    Abre la CA creada en el quickstart anterior, entra en **Issued Certificates** y selecciona **Issue New**.
  </Step>

  <Step>
    Elige el método [#elige-el-método]

    Selecciona **Generate Key & CSR in Browser**. Usa **Upload Existing CSR** cuando la clave privada deba generarse y permanecer en el sistema de destino.
  </Step>

  <Step>
    Identifica el certificado [#identifica-el-certificado]

    Introduce el \`Common Name\` y, si corresponde, la organización, unidad organizativa y ubicación. Añade SANs para cada nombre DNS, dirección IP, correo o URI con el que se vaya a validar la identidad.
  </Step>

  <Step>
    Configura clave y usos [#configura-clave-y-usos]

    Elige RSA o ECDSA, define la validez y selecciona los usos de clave. Para una identidad de dispositivo que usa mTLS, habilita **Digital Signature** y **Client Authentication**.

    La validez no puede superar la fecha de expiración de la CA emisora.
  </Step>

  <Step>
    Emite y descarga [#emite-y-descarga]

    Confirma la emisión y descarga inmediatamente el certificado y la clave privada en formato PEM.
  </Step>

  <Step>
    Verifica el resultado [#verifica-el-resultado]

    El certificado debe aparecer en **Issued Certificates** con estado activo. Comprueba su sujeto, SANs, emisor, usos y periodo de validez.
  </Step>
</Steps>

Siguiente paso [#siguiente-paso]

[Registra tu primer dispositivo](/docs/manual/inicio/primer-dispositivo) para asociar la identidad a una entidad gestionada, o consulta la [gestión de certificados](/docs/manual/servicios-core/certificates).
`,l={title:"Emite tu primer certificado",description:"Emite una identidad X.509 desde la consola y verifica el resultado."},u={contents:[{heading:void 0,content:"En este quickstart Lamassu generará la clave y el CSR en el navegador, y la CA emitirá el certificado. Al terminar descargarás el certificado y su clave privada."},{heading:"antes-de-empezar",content:"Una CA activa con permiso para emitir certificados."},{heading:"antes-de-empezar",content:"Un nombre para la identidad, por ejemplo `device-001.example.internal`."},{heading:"antes-de-empezar",content:"Un lugar seguro en el que custodiar la clave privada descargada."},{heading:"antes-de-empezar",content:"En este flujo la clave se genera en el navegador y Lamassu no la almacena. Descárgala y protégela antes de cerrar el resultado de la operación."},{heading:"inicia-la-emisión",content:"Abre la CA creada en el quickstart anterior, entra en **Issued Certificates** y selecciona **Issue New**."},{heading:"elige-el-método",content:"Selecciona **Generate Key & CSR in Browser**. Usa **Upload Existing CSR** cuando la clave privada deba generarse y permanecer en el sistema de destino."},{heading:"identifica-el-certificado",content:"Introduce el `Common Name` y, si corresponde, la organización, unidad organizativa y ubicación. Añade SANs para cada nombre DNS, dirección IP, correo o URI con el que se vaya a validar la identidad."},{heading:"configura-clave-y-usos",content:"Elige RSA o ECDSA, define la validez y selecciona los usos de clave. Para una identidad de dispositivo que usa mTLS, habilita **Digital Signature** y **Client Authentication**."},{heading:"configura-clave-y-usos",content:"La validez no puede superar la fecha de expiración de la CA emisora."},{heading:"emite-y-descarga",content:"Confirma la emisión y descarga inmediatamente el certificado y la clave privada en formato PEM."},{heading:"verifica-el-resultado",content:"El certificado debe aparecer en **Issued Certificates** con estado activo. Comprueba su sujeto, SANs, emisor, usos y periodo de validez."},{heading:"siguiente-paso",content:"Registra tu primer dispositivo para asociar la identidad a una entidad gestionada, o consulta la gestión de certificados."}],headings:[{id:"antes-de-empezar",content:"Antes de empezar"},{id:"inicia-la-emisión",content:"Inicia la emisión"},{id:"elige-el-método",content:"Elige el método"},{id:"identifica-el-certificado",content:"Identifica el certificado"},{id:"configura-clave-y-usos",content:"Configura clave y usos"},{id:"emite-y-descarga",content:"Emite y descarga"},{id:"verifica-el-resultado",content:"Verifica el resultado"},{id:"siguiente-paso",content:"Siguiente paso"}]};const p=[{depth:2,url:"#antes-de-empezar",title:e.jsx(e.Fragment,{children:"Antes de empezar"})},{depth:3,url:"#inicia-la-emisión",title:e.jsx(e.Fragment,{children:"Inicia la emisión"})},{depth:3,url:"#elige-el-método",title:e.jsx(e.Fragment,{children:"Elige el método"})},{depth:3,url:"#identifica-el-certificado",title:e.jsx(e.Fragment,{children:"Identifica el certificado"})},{depth:3,url:"#configura-clave-y-usos",title:e.jsx(e.Fragment,{children:"Configura clave y usos"})},{depth:3,url:"#emite-y-descarga",title:e.jsx(e.Fragment,{children:"Emite y descarga"})},{depth:3,url:"#verifica-el-resultado",title:e.jsx(e.Fragment,{children:"Verifica el resultado"})},{depth:2,url:"#siguiente-paso",title:e.jsx(e.Fragment,{children:"Siguiente paso"})}];function d(i){const a={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...i.components},{Callout:t,Step:n,Steps:s}=a;return t||r("Callout"),n||r("Step"),s||r("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(a.p,{children:"En este quickstart Lamassu generará la clave y el CSR en el navegador, y la CA emitirá el certificado. Al terminar descargarás el certificado y su clave privada."}),`
`,e.jsx(a.h2,{id:"antes-de-empezar",children:"Antes de empezar"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Una CA activa con permiso para emitir certificados."}),`
`,e.jsxs(a.li,{children:["Un nombre para la identidad, por ejemplo ",e.jsx(a.code,{children:"device-001.example.internal"}),"."]}),`
`,e.jsx(a.li,{children:"Un lugar seguro en el que custodiar la clave privada descargada."}),`
`]}),`
`,e.jsx(t,{type:"warn",title:"La clave privada se entrega una sola vez",children:e.jsx(a.p,{children:"En este flujo la clave se genera en el navegador y Lamassu no la almacena. Descárgala y protégela antes de cerrar el resultado de la operación."})}),`
`,e.jsxs(s,{children:[e.jsxs(n,{children:[e.jsx(a.h3,{id:"inicia-la-emisión",children:"Inicia la emisión"}),e.jsxs(a.p,{children:["Abre la CA creada en el quickstart anterior, entra en ",e.jsx(a.strong,{children:"Issued Certificates"})," y selecciona ",e.jsx(a.strong,{children:"Issue New"}),"."]})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"elige-el-método",children:"Elige el método"}),e.jsxs(a.p,{children:["Selecciona ",e.jsx(a.strong,{children:"Generate Key & CSR in Browser"}),". Usa ",e.jsx(a.strong,{children:"Upload Existing CSR"})," cuando la clave privada deba generarse y permanecer en el sistema de destino."]})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"identifica-el-certificado",children:"Identifica el certificado"}),e.jsxs(a.p,{children:["Introduce el ",e.jsx(a.code,{children:"Common Name"})," y, si corresponde, la organización, unidad organizativa y ubicación. Añade SANs para cada nombre DNS, dirección IP, correo o URI con el que se vaya a validar la identidad."]})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"configura-clave-y-usos",children:"Configura clave y usos"}),e.jsxs(a.p,{children:["Elige RSA o ECDSA, define la validez y selecciona los usos de clave. Para una identidad de dispositivo que usa mTLS, habilita ",e.jsx(a.strong,{children:"Digital Signature"})," y ",e.jsx(a.strong,{children:"Client Authentication"}),"."]}),e.jsx(a.p,{children:"La validez no puede superar la fecha de expiración de la CA emisora."})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"emite-y-descarga",children:"Emite y descarga"}),e.jsx(a.p,{children:"Confirma la emisión y descarga inmediatamente el certificado y la clave privada en formato PEM."})]}),e.jsxs(n,{children:[e.jsx(a.h3,{id:"verifica-el-resultado",children:"Verifica el resultado"}),e.jsxs(a.p,{children:["El certificado debe aparecer en ",e.jsx(a.strong,{children:"Issued Certificates"})," con estado activo. Comprueba su sujeto, SANs, emisor, usos y periodo de validez."]})]})]}),`
`,e.jsx(a.h2,{id:"siguiente-paso",children:"Siguiente paso"}),`
`,e.jsxs(a.p,{children:[e.jsx(a.a,{href:"/docs/manual/inicio/primer-dispositivo",children:"Registra tu primer dispositivo"})," para asociar la identidad a una entidad gestionada, o consulta la ",e.jsx(a.a,{href:"/docs/manual/servicios-core/certificates",children:"gestión de certificados"}),"."]})]})}function m(i={}){const{wrapper:a}=i.components||{};return a?e.jsx(a,{...i,children:e.jsx(d,{...i})}):d(i)}function r(i,a){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{o as _markdown,m as default,l as frontmatter,u as structuredData,p as toc};
