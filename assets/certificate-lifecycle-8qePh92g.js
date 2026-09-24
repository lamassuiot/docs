import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let t=`

Una identidad no termina cuando se emite el certificado. Lamassu mantiene su relación con el dispositivo y registra los cambios necesarios para renovarla, suspenderla o retirarla.

Estados principales [#estados-principales]

* **\`No Identity\`**: el dispositivo está registrado pero no tiene certificado. Debes enrolarlo o asignarle una identidad.
* **\`Active\`**: el certificado está vigente y puede utilizarse. Monitoriza su validez y prepara la renovación.
* **\`Renewal Pending\`**: la identidad ha entrado en la ventana de renovación. El dispositivo ya puede iniciar el re-enrolamiento.
* **\`Expiring Soon\`**: la fecha de expiración está próxima y la renovación requiere atención prioritaria.
* **\`Expired\`**: el certificado ha superado su validez. Emite una identidad nueva.
* **\`Revoked\`**: el certificado se ha invalidado antes de expirar. Investiga la causa y sustitúyelo si procede.
* **\`Decommissioned\`**: el dispositivo se ha retirado definitivamente y no debe volver a enrolarse.

Renovación y revocación no son equivalentes [#renovación-y-revocación-no-son-equivalentes]

La **renovación** sustituye una identidad que sigue siendo fiable antes de que expire. La **revocación** comunica que un certificado ya no debe aceptarse. Revoca cuando exista compromiso, retirada o un cambio que invalide la identidad; renueva para mantener la continuidad operativa.

<Callout type="warn" title="Decommission es irreversible">
  Dar de baja un dispositivo revoca sus certificados y le impide obtener nuevas identidades. Utiliza esta acción únicamente cuando el dispositivo se retire de forma permanente.
</Callout>

Observabilidad [#observabilidad]

El historial de certificados muestra todas las identidades asociadas a un dispositivo. La línea de tiempo registra enrolamientos, renovaciones y cambios de estado. Las suscripciones permiten enviar estos eventos a correo, Microsoft Teams o webhooks.
`,d={title:"Ciclo de vida de una identidad",description:"Estados, transiciones y decisiones operativas de un certificado de dispositivo."},c={contents:[{heading:void 0,content:"Una identidad no termina cuando se emite el certificado. Lamassu mantiene su relación con el dispositivo y registra los cambios necesarios para renovarla, suspenderla o retirarla."},{heading:"estados-principales",content:"**`No Identity`**: el dispositivo está registrado pero no tiene certificado. Debes enrolarlo o asignarle una identidad."},{heading:"estados-principales",content:"**`Active`**: el certificado está vigente y puede utilizarse. Monitoriza su validez y prepara la renovación."},{heading:"estados-principales",content:"**`Renewal Pending`**: la identidad ha entrado en la ventana de renovación. El dispositivo ya puede iniciar el re-enrolamiento."},{heading:"estados-principales",content:"**`Expiring Soon`**: la fecha de expiración está próxima y la renovación requiere atención prioritaria."},{heading:"estados-principales",content:"**`Expired`**: el certificado ha superado su validez. Emite una identidad nueva."},{heading:"estados-principales",content:"**`Revoked`**: el certificado se ha invalidado antes de expirar. Investiga la causa y sustitúyelo si procede."},{heading:"estados-principales",content:"**`Decommissioned`**: el dispositivo se ha retirado definitivamente y no debe volver a enrolarse."},{heading:"renovación-y-revocación-no-son-equivalentes",content:"La **renovación** sustituye una identidad que sigue siendo fiable antes de que expire. La **revocación** comunica que un certificado ya no debe aceptarse. Revoca cuando exista compromiso, retirada o un cambio que invalide la identidad; renueva para mantener la continuidad operativa."},{heading:"renovación-y-revocación-no-son-equivalentes",content:"Dar de baja un dispositivo revoca sus certificados y le impide obtener nuevas identidades. Utiliza esta acción únicamente cuando el dispositivo se retire de forma permanente."},{heading:"observabilidad",content:"El historial de certificados muestra todas las identidades asociadas a un dispositivo. La línea de tiempo registra enrolamientos, renovaciones y cambios de estado. Las suscripciones permiten enviar estos eventos a correo, Microsoft Teams o webhooks."}],headings:[{id:"estados-principales",content:"Estados principales"},{id:"renovación-y-revocación-no-son-equivalentes",content:"Renovación y revocación no son equivalentes"},{id:"observabilidad",content:"Observabilidad"}]};const l=[{depth:2,url:"#estados-principales",title:e.jsx(e.Fragment,{children:"Estados principales"})},{depth:2,url:"#renovación-y-revocación-no-son-equivalentes",title:e.jsx(e.Fragment,{children:"Renovación y revocación no son equivalentes"})},{depth:2,url:"#observabilidad",title:e.jsx(e.Fragment,{children:"Observabilidad"})}];function o(a){const i={code:"code",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...a.components},{Callout:n}=i;return n||s("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"Una identidad no termina cuando se emite el certificado. Lamassu mantiene su relación con el dispositivo y registra los cambios necesarios para renovarla, suspenderla o retirarla."}),`
`,e.jsx(i.h2,{id:"estados-principales",children:"Estados principales"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"No Identity"})}),": el dispositivo está registrado pero no tiene certificado. Debes enrolarlo o asignarle una identidad."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"Active"})}),": el certificado está vigente y puede utilizarse. Monitoriza su validez y prepara la renovación."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"Renewal Pending"})}),": la identidad ha entrado en la ventana de renovación. El dispositivo ya puede iniciar el re-enrolamiento."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"Expiring Soon"})}),": la fecha de expiración está próxima y la renovación requiere atención prioritaria."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"Expired"})}),": el certificado ha superado su validez. Emite una identidad nueva."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"Revoked"})}),": el certificado se ha invalidado antes de expirar. Investiga la causa y sustitúyelo si procede."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"Decommissioned"})}),": el dispositivo se ha retirado definitivamente y no debe volver a enrolarse."]}),`
`]}),`
`,e.jsx(i.h2,{id:"renovación-y-revocación-no-son-equivalentes",children:"Renovación y revocación no son equivalentes"}),`
`,e.jsxs(i.p,{children:["La ",e.jsx(i.strong,{children:"renovación"})," sustituye una identidad que sigue siendo fiable antes de que expire. La ",e.jsx(i.strong,{children:"revocación"})," comunica que un certificado ya no debe aceptarse. Revoca cuando exista compromiso, retirada o un cambio que invalide la identidad; renueva para mantener la continuidad operativa."]}),`
`,e.jsx(n,{type:"warn",title:"Decommission es irreversible",children:e.jsx(i.p,{children:"Dar de baja un dispositivo revoca sus certificados y le impide obtener nuevas identidades. Utiliza esta acción únicamente cuando el dispositivo se retire de forma permanente."})}),`
`,e.jsx(i.h2,{id:"observabilidad",children:"Observabilidad"}),`
`,e.jsx(i.p,{children:"El historial de certificados muestra todas las identidades asociadas a un dispositivo. La línea de tiempo registra enrolamientos, renovaciones y cambios de estado. Las suscripciones permiten enviar estos eventos a correo, Microsoft Teams o webhooks."})]})}function p(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(o,{...a})}):o(a)}function s(a,i){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}export{t as _markdown,p as default,d as frontmatter,c as structuredData,l as toc};
