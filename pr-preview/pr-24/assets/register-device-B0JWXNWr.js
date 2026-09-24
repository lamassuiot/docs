import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let d=`

En este quickstart registrarás manualmente un dispositivo y le asignarás su primer certificado. Es el recorrido más corto para entender cómo Lamassu relaciona una entidad física con su historial de identidades.

Antes de empezar [#antes-de-empezar]

* Un DMS configurado.
* Una CA asociada al DMS.
* Un identificador único para el dispositivo.

<Steps>
  <Step>
    Registra el dispositivo [#registra-el-dispositivo]

    Abre **Managed Devices**, selecciona la acción para registrar un dispositivo y completa:

    * **Device ID**: identificador único del dispositivo.
    * **Registration Authority**: DMS que aplicará las políticas de enrolamiento.
    * **Icon** y **Tags**: clasificación opcional para localizarlo después.
  </Step>

  <Step>
    Comprueba el estado inicial [#comprueba-el-estado-inicial]

    Abre el dispositivo recién creado. Debe aparecer con estado **No Identity**: existe en el inventario, pero todavía no tiene un certificado asociado.
  </Step>

  <Step>
    Asigna una identidad [#asigna-una-identidad]

    Selecciona **Assign Identity**. Lamassu buscará certificados activos cuyo \`Common Name\` coincida con el \`Device ID\`.

    Selecciona un certificado existente o usa **Issue New Instead** para emitir uno desde una CA vinculada al DMS.
  </Step>

  <Step>
    Verifica el dispositivo [#verifica-el-dispositivo]

    Tras confirmar, el estado debe cambiar a **Active**. Revisa **Certificate History** para comprobar la identidad asociada y **Device Event Timeline** para ver el evento de asignación.
  </Step>
</Steps>

Automatiza el siguiente dispositivo [#automatiza-el-siguiente-dispositivo]

El registro manual ayuda a entender el modelo, pero una flota debe usar enrolamiento automatizado. Continúa con [Device Management Service](/docs/platform/pki/device-enrollment) y la [integración EST](/docs/platform/pki/est-enrollment)<ins className="lm-diff-ins"> o </ins>[<ins className="lm-diff-ins">CMP</ins>](/docs/platform/pki/cmp).
`,c={title:"Registra tu primer dispositivo",description:"Añade un dispositivo a Lamassu y asígnale una identidad activa."},l={isNew:!1,changes:1,title:void 0,description:void 0},p={contents:[{heading:void 0,content:"En este quickstart registrarás manualmente un dispositivo y le asignarás su primer certificado. Es el recorrido más corto para entender cómo Lamassu relaciona una entidad física con su historial de identidades."},{heading:"antes-de-empezar",content:"Un DMS configurado."},{heading:"antes-de-empezar",content:"Una CA asociada al DMS."},{heading:"antes-de-empezar",content:"Un identificador único para el dispositivo."},{heading:"registra-el-dispositivo",content:"Abre **Managed Devices**, selecciona la acción para registrar un dispositivo y completa:"},{heading:"registra-el-dispositivo",content:"**Device ID**: identificador único del dispositivo."},{heading:"registra-el-dispositivo",content:"**Registration Authority**: DMS que aplicará las políticas de enrolamiento."},{heading:"registra-el-dispositivo",content:"**Icon** y **Tags**: clasificación opcional para localizarlo después."},{heading:"comprueba-el-estado-inicial",content:"Abre el dispositivo recién creado. Debe aparecer con estado **No Identity**: existe en el inventario, pero todavía no tiene un certificado asociado."},{heading:"asigna-una-identidad",content:"Selecciona **Assign Identity**. Lamassu buscará certificados activos cuyo `Common Name` coincida con el `Device ID`."},{heading:"asigna-una-identidad",content:"Selecciona un certificado existente o usa **Issue New Instead** para emitir uno desde una CA vinculada al DMS."},{heading:"verifica-el-dispositivo",content:"Tras confirmar, el estado debe cambiar a **Active**. Revisa **Certificate History** para comprobar la identidad asociada y **Device Event Timeline** para ver el evento de asignación."},{heading:"automatiza-el-siguiente-dispositivo",content:"El registro manual ayuda a entender el modelo, pero una flota debe usar enrolamiento automatizado. Continúa con Device Management Service y la integración EST o CMP."}],headings:[{id:"antes-de-empezar",content:"Antes de empezar"},{id:"registra-el-dispositivo",content:"Registra el dispositivo"},{id:"comprueba-el-estado-inicial",content:"Comprueba el estado inicial"},{id:"asigna-una-identidad",content:"Asigna una identidad"},{id:"verifica-el-dispositivo",content:"Verifica el dispositivo"},{id:"automatiza-el-siguiente-dispositivo",content:"Automatiza el siguiente dispositivo"}]};const u=[{depth:2,url:"#antes-de-empezar",title:e.jsx(e.Fragment,{children:"Antes de empezar"})},{depth:3,url:"#registra-el-dispositivo",title:e.jsx(e.Fragment,{children:"Registra el dispositivo"})},{depth:3,url:"#comprueba-el-estado-inicial",title:e.jsx(e.Fragment,{children:"Comprueba el estado inicial"})},{depth:3,url:"#asigna-una-identidad",title:e.jsx(e.Fragment,{children:"Asigna una identidad"})},{depth:3,url:"#verifica-el-dispositivo",title:e.jsx(e.Fragment,{children:"Verifica el dispositivo"})},{depth:2,url:"#automatiza-el-siguiente-dispositivo",title:e.jsx(e.Fragment,{children:"Automatiza el siguiente dispositivo"})}];function s(a){const i={a:"a",code:"code",h2:"h2",h3:"h3",ins:"ins",li:"li",p:"p",strong:"strong",ul:"ul",...a.components},{Step:n,Steps:t}=i;return n||o("Step"),t||o("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"En este quickstart registrarás manualmente un dispositivo y le asignarás su primer certificado. Es el recorrido más corto para entender cómo Lamassu relaciona una entidad física con su historial de identidades."}),`
`,e.jsx(i.h2,{id:"antes-de-empezar",children:"Antes de empezar"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Un DMS configurado."}),`
`,e.jsx(i.li,{children:"Una CA asociada al DMS."}),`
`,e.jsx(i.li,{children:"Un identificador único para el dispositivo."}),`
`]}),`
`,e.jsxs(t,{children:[e.jsxs(n,{children:[e.jsx(i.h3,{id:"registra-el-dispositivo",children:"Registra el dispositivo"}),e.jsxs(i.p,{children:["Abre ",e.jsx(i.strong,{children:"Managed Devices"}),", selecciona la acción para registrar un dispositivo y completa:"]}),e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Device ID"}),": identificador único del dispositivo."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Registration Authority"}),": DMS que aplicará las políticas de enrolamiento."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Icon"})," y ",e.jsx(i.strong,{children:"Tags"}),": clasificación opcional para localizarlo después."]}),`
`]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"comprueba-el-estado-inicial",children:"Comprueba el estado inicial"}),e.jsxs(i.p,{children:["Abre el dispositivo recién creado. Debe aparecer con estado ",e.jsx(i.strong,{children:"No Identity"}),": existe en el inventario, pero todavía no tiene un certificado asociado."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"asigna-una-identidad",children:"Asigna una identidad"}),e.jsxs(i.p,{children:["Selecciona ",e.jsx(i.strong,{children:"Assign Identity"}),". Lamassu buscará certificados activos cuyo ",e.jsx(i.code,{children:"Common Name"})," coincida con el ",e.jsx(i.code,{children:"Device ID"}),"."]}),e.jsxs(i.p,{children:["Selecciona un certificado existente o usa ",e.jsx(i.strong,{children:"Issue New Instead"})," para emitir uno desde una CA vinculada al DMS."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"verifica-el-dispositivo",children:"Verifica el dispositivo"}),e.jsxs(i.p,{children:["Tras confirmar, el estado debe cambiar a ",e.jsx(i.strong,{children:"Active"}),". Revisa ",e.jsx(i.strong,{children:"Certificate History"})," para comprobar la identidad asociada y ",e.jsx(i.strong,{children:"Device Event Timeline"})," para ver el evento de asignación."]})]})]}),`
`,e.jsx(i.h2,{id:"automatiza-el-siguiente-dispositivo",children:"Automatiza el siguiente dispositivo"}),`
`,e.jsxs(i.p,{children:["El registro manual ayuda a entender el modelo, pero una flota debe usar enrolamiento automatizado. Continúa con ",e.jsx(i.a,{href:"/docs/platform/pki/device-enrollment",children:"Device Management Service"})," y la ",e.jsx(i.a,{href:"/docs/platform/pki/est-enrollment",children:"integración EST"}),e.jsx(i.ins,{className:"lm-diff-ins",children:" o "}),e.jsx(i.a,{href:"/docs/platform/pki/cmp",children:e.jsx(i.ins,{className:"lm-diff-ins",children:"CMP"})}),"."]})]})}function m(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(s,{...a})}):s(a)}function o(a,i){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}export{d as _markdown,m as default,c as frontmatter,l as lmDiff,p as structuredData,u as toc};
