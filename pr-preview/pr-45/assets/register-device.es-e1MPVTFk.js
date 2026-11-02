import{j as e}from"./index-prc0XQdj.js";let r=`

Este recorrido está dirigido a quien empieza a administrar identidades de dispositivos. Registrarás \`device-001\` y le asignarás un certificado existente para comprobar la relación entre dispositivo, DMS e historial de identidad.

La asignación modifica el inventario de Lamassu. La clave y el certificado se instalan por separado en el dispositivo; la conexión con un consumidor se comprueba en la integración de ese destino.

Antes de empezar [#antes-de-empezar]

* Una instancia accesible y permisos para administrar DMS, dispositivos y la asociación de certificados.
* Una CA activa con clave disponible. Si todavía no existe, sigue [Crea tu primera CA](/docs/platform/pki/quickstarts/create-certificate-authority).
* Un certificado final activo de esa CA cuyo \`Common Name\` sea exactamente \`device-001\`, con su clave privada. Sigue [Emite y verifica un certificado](/docs/platform/pki/quickstarts/issue-certificate) para obtener y comprobar ambos.
* El identificador \`device-001\` libre en el inventario. Si ya lo usaste, elige otro y emite el certificado con ese mismo \`Common Name\`.

Prepara el DMS [#prepara-el-dms]

Un DMS debe existir antes de registrar el dispositivo. Si ya tienes uno adecuado, comprueba su CA y anota su identificador; si necesitas crearlo:

1. Abre el inventario de DMS y la acción de creación. Asigna un nombre reconocible, como \`Acme Evaluation DMS\`.
2. En **Enrollment CA**, selecciona la CA que emitió \`device.crt\`.
3. En **Registration Mode**, selecciona \`PRE_REGISTRATION\` para el recorrido que comienza con un alta explícita.
4. Configura **Authentication Mode** como \`CLIENT_CERTIFICATE\` y añade en **Validation CAs** la CA cuyos certificados iniciales aceptarás. Para esta evaluación puede ser la misma CA. Mantén habilitada **Verify CSR Signature** y deshabilitada la generación de claves en servidor si no la vas a utilizar.
5. Revisa los ajustes de renovación y distribución de confianza con la [guía DMS](/docs/platform/iot-fleets/enrollment/dms), guarda el servicio y anota su identificador.
6. Vuelve a abrir el DMS y confirma que la CA de enrolamiento es la prevista y que el servicio aparece en el inventario.

Estos ajustes preparan la política DMS. Los pasos siguientes realizan el alta y la asignación desde la consola; no envían una solicitud EST ni prueban la admisión por ese protocolo.

<Steps>
  <Step>
    Registra el dispositivo [#registra-el-dispositivo]

    Abre **Managed Devices** y la acción de registro. Completa:

    * **Device ID**: \`device-001\`.
    * **Registration Authority**: el DMS que acabas de preparar; la etiqueta identifica al servicio que cumple el rol de autoridad de registro.
    * **Icon** y **Tags**: clasificación opcional.

    Confirma el registro.
  </Step>

  <Step>
    Comprueba el estado inicial [#comprueba-el-estado-inicial]

    Abre el dispositivo. Debe aparecer en **No Identity** y mostrar el DMS propietario seleccionado.

    El registro crea la entrada de inventario; el certificado todavía debe asociarse.
  </Step>

  <Step>
    Asigna una identidad [#asigna-una-identidad]

    Selecciona **Assign Identity** y el certificado existente con \`CN=device-001\`. Comprueba su número de serie, emisor y vigencia frente al certificado que verificaste en PKI.

    Confirma la asociación. La alternativa **Issue New Instead** se explica en [Dispositivos e identidades](/docs/platform/iot-fleets/device-management#asigna-una-identidad-manualmente).
  </Step>

  <Step>
    Verifica el dispositivo [#verifica-el-dispositivo]

    Comprueba que tiene una identidad activa. En **Certificate History**, verifica el número de serie asociado; en **Device Event Timeline**, localiza el evento de asignación.

    Conserva el identificador del dispositivo, el DMS propietario y el número de serie como referencias del resultado.
  </Step>
</Steps>

Resultado esperado [#resultado-esperado]

| Comprobación        | Resultado                                                           |
| ------------------- | ------------------------------------------------------------------- |
| Dispositivo         | \`device-001\` aparece en el inventario con el DMS previsto.          |
| Identidad actual    | El certificado asociado coincide con el que verificaste en PKI.     |
| Historial           | La emisión asociada aparece con su número de serie y fechas.        |
| Clave y certificado | Dispones de la pareja comprobada para instalarla en el dispositivo. |

Si el resultado falla [#si-el-resultado-falla]

* Si el DMS no puede seleccionarse, confirma su creación y tus permisos de lectura.
* Si no aparece un certificado elegible, comprueba que su \`Common Name\` coincide exactamente con el \`Device ID\`, está activo y lo emitió la CA prevista.
* Si falla la asignación, revisa los permisos y el diagnóstico de la operación antes de repetirla. Vuelve a consultar el dispositivo y su historial para conocer el resultado persistido.
* Si aparece un estado relacionado con vencimiento o renovación, comprueba las fechas del certificado y los umbrales del DMS en [Dispositivos e identidades](/docs/platform/iot-fleets/device-management).

Automatiza el siguiente dispositivo [#automatiza-el-siguiente-dispositivo]

Continúa con [DMS](/docs/platform/iot-fleets/enrollment/dms) y [EST](/docs/platform/iot-fleets/enrollment/overview) para que el dispositivo solicite y renueve sus certificados. Prepara la confianza del servidor, la credencial inicial y las políticas de cada operación antes de implementar el cliente.

Para un recorrido desde el cliente hasta mTLS, sigue [Enrola y conecta tu primer dispositivo](/docs/platform/iot-fleets/quickstarts/enroll-device) con un ID nuevo.

Para utilizar la identidad en [AWS IoT Core](/docs/platform/iot-fleets/integrations/aws-iot-core), prepara también la confianza y los permisos del destino. Comprueba la conexión desde el dispositivo después de instalar la clave, el certificado y la cadena necesarios.
`,d={title:"Registra un dispositivo manualmente",description:"Prepara un DMS, registra un dispositivo y asocia un certificado comprobado a su identidad."},c={contents:[{heading:void 0,content:"Este recorrido está dirigido a quien empieza a administrar identidades de dispositivos. Registrarás `device-001` y le asignarás un certificado existente para comprobar la relación entre dispositivo, DMS e historial de identidad."},{heading:void 0,content:"La asignación modifica el inventario de Lamassu. La clave y el certificado se instalan por separado en el dispositivo; la conexión con un consumidor se comprueba en la integración de ese destino."},{heading:"antes-de-empezar",content:"Una instancia accesible y permisos para administrar DMS, dispositivos y la asociación de certificados."},{heading:"antes-de-empezar",content:"Una CA activa con clave disponible. Si todavía no existe, sigue Crea tu primera CA."},{heading:"antes-de-empezar",content:"Un certificado final activo de esa CA cuyo `Common Name` sea exactamente `device-001`, con su clave privada. Sigue Emite y verifica un certificado para obtener y comprobar ambos."},{heading:"antes-de-empezar",content:"El identificador `device-001` libre en el inventario. Si ya lo usaste, elige otro y emite el certificado con ese mismo `Common Name`."},{heading:"prepara-el-dms",content:"Un DMS debe existir antes de registrar el dispositivo. Si ya tienes uno adecuado, comprueba su CA y anota su identificador; si necesitas crearlo:"},{heading:"prepara-el-dms",content:"Abre el inventario de DMS y la acción de creación. Asigna un nombre reconocible, como `Acme Evaluation DMS`."},{heading:"prepara-el-dms",content:"En **Enrollment CA**, selecciona la CA que emitió `device.crt`."},{heading:"prepara-el-dms",content:"En **Registration Mode**, selecciona `PRE_REGISTRATION` para el recorrido que comienza con un alta explícita."},{heading:"prepara-el-dms",content:"Configura **Authentication Mode** como `CLIENT_CERTIFICATE` y añade en **Validation CAs** la CA cuyos certificados iniciales aceptarás. Para esta evaluación puede ser la misma CA. Mantén habilitada **Verify CSR Signature** y deshabilitada la generación de claves en servidor si no la vas a utilizar."},{heading:"prepara-el-dms",content:"Revisa los ajustes de renovación y distribución de confianza con la guía DMS, guarda el servicio y anota su identificador."},{heading:"prepara-el-dms",content:"Vuelve a abrir el DMS y confirma que la CA de enrolamiento es la prevista y que el servicio aparece en el inventario."},{heading:"prepara-el-dms",content:"Estos ajustes preparan la política DMS. Los pasos siguientes realizan el alta y la asignación desde la consola; no envían una solicitud EST ni prueban la admisión por ese protocolo."},{heading:"registra-el-dispositivo",content:"Abre **Managed Devices** y la acción de registro. Completa:"},{heading:"registra-el-dispositivo",content:"**Device ID**: `device-001`."},{heading:"registra-el-dispositivo",content:"**Registration Authority**: el DMS que acabas de preparar; la etiqueta identifica al servicio que cumple el rol de autoridad de registro."},{heading:"registra-el-dispositivo",content:"**Icon** y **Tags**: clasificación opcional."},{heading:"registra-el-dispositivo",content:"Confirma el registro."},{heading:"comprueba-el-estado-inicial",content:"Abre el dispositivo. Debe aparecer en **No Identity** y mostrar el DMS propietario seleccionado."},{heading:"comprueba-el-estado-inicial",content:"El registro crea la entrada de inventario; el certificado todavía debe asociarse."},{heading:"asigna-una-identidad",content:"Selecciona **Assign Identity** y el certificado existente con `CN=device-001`. Comprueba su número de serie, emisor y vigencia frente al certificado que verificaste en PKI."},{heading:"asigna-una-identidad",content:"Confirma la asociación. La alternativa **Issue New Instead** se explica en Dispositivos e identidades."},{heading:"verifica-el-dispositivo",content:"Comprueba que tiene una identidad activa. En **Certificate History**, verifica el número de serie asociado; en **Device Event Timeline**, localiza el evento de asignación."},{heading:"verifica-el-dispositivo",content:"Conserva el identificador del dispositivo, el DMS propietario y el número de serie como referencias del resultado."},{heading:"resultado-esperado",content:"Comprobación"},{heading:"resultado-esperado",content:"Resultado"},{heading:"resultado-esperado",content:"Dispositivo"},{heading:"resultado-esperado",content:"`device-001` aparece en el inventario con el DMS previsto."},{heading:"resultado-esperado",content:"Identidad actual"},{heading:"resultado-esperado",content:"El certificado asociado coincide con el que verificaste en PKI."},{heading:"resultado-esperado",content:"Historial"},{heading:"resultado-esperado",content:"La emisión asociada aparece con su número de serie y fechas."},{heading:"resultado-esperado",content:"Clave y certificado"},{heading:"resultado-esperado",content:"Dispones de la pareja comprobada para instalarla en el dispositivo."},{heading:"si-el-resultado-falla",content:"Si el DMS no puede seleccionarse, confirma su creación y tus permisos de lectura."},{heading:"si-el-resultado-falla",content:"Si no aparece un certificado elegible, comprueba que su `Common Name` coincide exactamente con el `Device ID`, está activo y lo emitió la CA prevista."},{heading:"si-el-resultado-falla",content:"Si falla la asignación, revisa los permisos y el diagnóstico de la operación antes de repetirla. Vuelve a consultar el dispositivo y su historial para conocer el resultado persistido."},{heading:"si-el-resultado-falla",content:"Si aparece un estado relacionado con vencimiento o renovación, comprueba las fechas del certificado y los umbrales del DMS en Dispositivos e identidades."},{heading:"automatiza-el-siguiente-dispositivo",content:"Continúa con DMS y EST para que el dispositivo solicite y renueve sus certificados. Prepara la confianza del servidor, la credencial inicial y las políticas de cada operación antes de implementar el cliente."},{heading:"automatiza-el-siguiente-dispositivo",content:"Para un recorrido desde el cliente hasta mTLS, sigue Enrola y conecta tu primer dispositivo con un ID nuevo."},{heading:"automatiza-el-siguiente-dispositivo",content:"Para utilizar la identidad en AWS IoT Core, prepara también la confianza y los permisos del destino. Comprueba la conexión desde el dispositivo después de instalar la clave, el certificado y la cadena necesarios."}],headings:[{id:"antes-de-empezar",content:"Antes de empezar"},{id:"prepara-el-dms",content:"Prepara el DMS"},{id:"registra-el-dispositivo",content:"Registra el dispositivo"},{id:"comprueba-el-estado-inicial",content:"Comprueba el estado inicial"},{id:"asigna-una-identidad",content:"Asigna una identidad"},{id:"verifica-el-dispositivo",content:"Verifica el dispositivo"},{id:"resultado-esperado",content:"Resultado esperado"},{id:"si-el-resultado-falla",content:"Si el resultado falla"},{id:"automatiza-el-siguiente-dispositivo",content:"Automatiza el siguiente dispositivo"}]};const l=[{depth:2,url:"#antes-de-empezar",title:e.jsx(e.Fragment,{children:"Antes de empezar"})},{depth:2,url:"#prepara-el-dms",title:e.jsx(e.Fragment,{children:"Prepara el DMS"})},{depth:3,url:"#registra-el-dispositivo",title:e.jsx(e.Fragment,{children:"Registra el dispositivo"})},{depth:3,url:"#comprueba-el-estado-inicial",title:e.jsx(e.Fragment,{children:"Comprueba el estado inicial"})},{depth:3,url:"#asigna-una-identidad",title:e.jsx(e.Fragment,{children:"Asigna una identidad"})},{depth:3,url:"#verifica-el-dispositivo",title:e.jsx(e.Fragment,{children:"Verifica el dispositivo"})},{depth:2,url:"#resultado-esperado",title:e.jsx(e.Fragment,{children:"Resultado esperado"})},{depth:2,url:"#si-el-resultado-falla",title:e.jsx(e.Fragment,{children:"Si el resultado falla"})},{depth:2,url:"#automatiza-el-siguiente-dispositivo",title:e.jsx(e.Fragment,{children:"Automatiza el siguiente dispositivo"})}];function s(a){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...a.components},{Step:n,Steps:o}=i;return n||t("Step"),o||t("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["Este recorrido está dirigido a quien empieza a administrar identidades de dispositivos. Registrarás ",e.jsx(i.code,{children:"device-001"})," y le asignarás un certificado existente para comprobar la relación entre dispositivo, DMS e historial de identidad."]}),`
`,e.jsx(i.p,{children:"La asignación modifica el inventario de Lamassu. La clave y el certificado se instalan por separado en el dispositivo; la conexión con un consumidor se comprueba en la integración de ese destino."}),`
`,e.jsx(i.h2,{id:"antes-de-empezar",children:"Antes de empezar"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Una instancia accesible y permisos para administrar DMS, dispositivos y la asociación de certificados."}),`
`,e.jsxs(i.li,{children:["Una CA activa con clave disponible. Si todavía no existe, sigue ",e.jsx(i.a,{href:"/docs/platform/pki/quickstarts/create-certificate-authority",children:"Crea tu primera CA"}),"."]}),`
`,e.jsxs(i.li,{children:["Un certificado final activo de esa CA cuyo ",e.jsx(i.code,{children:"Common Name"})," sea exactamente ",e.jsx(i.code,{children:"device-001"}),", con su clave privada. Sigue ",e.jsx(i.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"Emite y verifica un certificado"})," para obtener y comprobar ambos."]}),`
`,e.jsxs(i.li,{children:["El identificador ",e.jsx(i.code,{children:"device-001"})," libre en el inventario. Si ya lo usaste, elige otro y emite el certificado con ese mismo ",e.jsx(i.code,{children:"Common Name"}),"."]}),`
`]}),`
`,e.jsx(i.h2,{id:"prepara-el-dms",children:"Prepara el DMS"}),`
`,e.jsx(i.p,{children:"Un DMS debe existir antes de registrar el dispositivo. Si ya tienes uno adecuado, comprueba su CA y anota su identificador; si necesitas crearlo:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:["Abre el inventario de DMS y la acción de creación. Asigna un nombre reconocible, como ",e.jsx(i.code,{children:"Acme Evaluation DMS"}),"."]}),`
`,e.jsxs(i.li,{children:["En ",e.jsx(i.strong,{children:"Enrollment CA"}),", selecciona la CA que emitió ",e.jsx(i.code,{children:"device.crt"}),"."]}),`
`,e.jsxs(i.li,{children:["En ",e.jsx(i.strong,{children:"Registration Mode"}),", selecciona ",e.jsx(i.code,{children:"PRE_REGISTRATION"})," para el recorrido que comienza con un alta explícita."]}),`
`,e.jsxs(i.li,{children:["Configura ",e.jsx(i.strong,{children:"Authentication Mode"})," como ",e.jsx(i.code,{children:"CLIENT_CERTIFICATE"})," y añade en ",e.jsx(i.strong,{children:"Validation CAs"})," la CA cuyos certificados iniciales aceptarás. Para esta evaluación puede ser la misma CA. Mantén habilitada ",e.jsx(i.strong,{children:"Verify CSR Signature"})," y deshabilitada la generación de claves en servidor si no la vas a utilizar."]}),`
`,e.jsxs(i.li,{children:["Revisa los ajustes de renovación y distribución de confianza con la ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"guía DMS"}),", guarda el servicio y anota su identificador."]}),`
`,e.jsx(i.li,{children:"Vuelve a abrir el DMS y confirma que la CA de enrolamiento es la prevista y que el servicio aparece en el inventario."}),`
`]}),`
`,e.jsx(i.p,{children:"Estos ajustes preparan la política DMS. Los pasos siguientes realizan el alta y la asignación desde la consola; no envían una solicitud EST ni prueban la admisión por ese protocolo."}),`
`,e.jsxs(o,{children:[e.jsxs(n,{children:[e.jsx(i.h3,{id:"registra-el-dispositivo",children:"Registra el dispositivo"}),e.jsxs(i.p,{children:["Abre ",e.jsx(i.strong,{children:"Managed Devices"})," y la acción de registro. Completa:"]}),e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Device ID"}),": ",e.jsx(i.code,{children:"device-001"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Registration Authority"}),": el DMS que acabas de preparar; la etiqueta identifica al servicio que cumple el rol de autoridad de registro."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Icon"})," y ",e.jsx(i.strong,{children:"Tags"}),": clasificación opcional."]}),`
`]}),e.jsx(i.p,{children:"Confirma el registro."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"comprueba-el-estado-inicial",children:"Comprueba el estado inicial"}),e.jsxs(i.p,{children:["Abre el dispositivo. Debe aparecer en ",e.jsx(i.strong,{children:"No Identity"})," y mostrar el DMS propietario seleccionado."]}),e.jsx(i.p,{children:"El registro crea la entrada de inventario; el certificado todavía debe asociarse."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"asigna-una-identidad",children:"Asigna una identidad"}),e.jsxs(i.p,{children:["Selecciona ",e.jsx(i.strong,{children:"Assign Identity"})," y el certificado existente con ",e.jsx(i.code,{children:"CN=device-001"}),". Comprueba su número de serie, emisor y vigencia frente al certificado que verificaste en PKI."]}),e.jsxs(i.p,{children:["Confirma la asociación. La alternativa ",e.jsx(i.strong,{children:"Issue New Instead"})," se explica en ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/device-management#asigna-una-identidad-manualmente",children:"Dispositivos e identidades"}),"."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"verifica-el-dispositivo",children:"Verifica el dispositivo"}),e.jsxs(i.p,{children:["Comprueba que tiene una identidad activa. En ",e.jsx(i.strong,{children:"Certificate History"}),", verifica el número de serie asociado; en ",e.jsx(i.strong,{children:"Device Event Timeline"}),", localiza el evento de asignación."]}),e.jsx(i.p,{children:"Conserva el identificador del dispositivo, el DMS propietario y el número de serie como referencias del resultado."})]})]}),`
`,e.jsx(i.h2,{id:"resultado-esperado",children:"Resultado esperado"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Comprobación"}),e.jsx(i.th,{children:"Resultado"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Dispositivo"}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"device-001"})," aparece en el inventario con el DMS previsto."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Identidad actual"}),e.jsx(i.td,{children:"El certificado asociado coincide con el que verificaste en PKI."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Historial"}),e.jsx(i.td,{children:"La emisión asociada aparece con su número de serie y fechas."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Clave y certificado"}),e.jsx(i.td,{children:"Dispones de la pareja comprobada para instalarla en el dispositivo."})]})]})]}),`
`,e.jsx(i.h2,{id:"si-el-resultado-falla",children:"Si el resultado falla"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Si el DMS no puede seleccionarse, confirma su creación y tus permisos de lectura."}),`
`,e.jsxs(i.li,{children:["Si no aparece un certificado elegible, comprueba que su ",e.jsx(i.code,{children:"Common Name"})," coincide exactamente con el ",e.jsx(i.code,{children:"Device ID"}),", está activo y lo emitió la CA prevista."]}),`
`,e.jsx(i.li,{children:"Si falla la asignación, revisa los permisos y el diagnóstico de la operación antes de repetirla. Vuelve a consultar el dispositivo y su historial para conocer el resultado persistido."}),`
`,e.jsxs(i.li,{children:["Si aparece un estado relacionado con vencimiento o renovación, comprueba las fechas del certificado y los umbrales del DMS en ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/device-management",children:"Dispositivos e identidades"}),"."]}),`
`]}),`
`,e.jsx(i.h2,{id:"automatiza-el-siguiente-dispositivo",children:"Automatiza el siguiente dispositivo"}),`
`,e.jsxs(i.p,{children:["Continúa con ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"DMS"})," y ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/enrollment/overview",children:"EST"})," para que el dispositivo solicite y renueve sus certificados. Prepara la confianza del servidor, la credencial inicial y las políticas de cada operación antes de implementar el cliente."]}),`
`,e.jsxs(i.p,{children:["Para un recorrido desde el cliente hasta mTLS, sigue ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/quickstarts/enroll-device",children:"Enrola y conecta tu primer dispositivo"})," con un ID nuevo."]}),`
`,e.jsxs(i.p,{children:["Para utilizar la identidad en ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/integrations/aws-iot-core",children:"AWS IoT Core"}),", prepara también la confianza y los permisos del destino. Comprueba la conexión desde el dispositivo después de instalar la clave, el certificado y la cadena necesarios."]})]})}function p(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(s,{...a})}):s(a)}function t(a,i){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:r,default:p,frontmatter:d,structuredData:c,toc:l},Symbol.toStringTag,{value:"Module"}));export{m as _};
