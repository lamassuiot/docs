import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let s=`

Gestión de certificados [#gestión-de-certificados]

Los certificados emitidos por Lamassu son accesibles, tanto desde la pestaña de Issued Certificates de los detalles de una CA como desde la opción “Certificates” del menú lateral.\\
En la pestaña de “Issued Certificates” se muestran los certificados emitidos por la CA seleccionada.

Como desde la opción “Certificates” del menú lateral, donde se presentan todos los certificados emitidos por Lamassu independientemente de la CA que lo haya emitido. Esta pantalla incluye la opción de filtro de los certificados por CN, número de serie, estado y por la CA que lo emitió.

Por cada certificado se incluye un conjunto de acciones vinculadas al certificado.\\
Acceso a los detalles “View Details”, un mecanismo de inspección rápida (Quick Inspect) con la información básica del certificado, la opción de descarga en formato PEM y el acceso a las acciones de revocación.\\
La vista de detalle, proporciona información adicional y el acceso a las acciones de revocación.

Revocación de certificados [#revocación-de-certificados]

Ya sea desde las acciones del listado de certificados, como desde la vista de detalle se puede desencadenar la acción de revocación. Al pulsar sobre “Revoke Certificate” se abre una ventana modal en la que se debe seleccionar la razón de la revocación.

Es importante destacar que la única razón reversible es “CertificateHold”, una revocación por cualquier otra  razón no podrá ser revertida. En caso de seleccionar “CertificateHold” se ofrecerá una acción de reactivación.
`,o={title:"[Certs] Gestión de Certificados",description:"Visualización y gestión de certificados emitidos"},d={contents:[{heading:"gestión-de-certificados",content:`Los certificados emitidos por Lamassu son accesibles, tanto desde la pestaña de Issued Certificates de los detalles de una CA como desde la opción “Certificates” del menú lateral.\\
En la pestaña de “Issued Certificates” se muestran los certificados emitidos por la CA seleccionada.`},{heading:"gestión-de-certificados",content:"Como desde la opción “Certificates” del menú lateral, donde se presentan todos los certificados emitidos por Lamassu independientemente de la CA que lo haya emitido. Esta pantalla incluye la opción de filtro de los certificados por CN, número de serie, estado y por la CA que lo emitió."},{heading:"gestión-de-certificados",content:`Por cada certificado se incluye un conjunto de acciones vinculadas al certificado.\\
Acceso a los detalles “View Details”, un mecanismo de inspección rápida (Quick Inspect) con la información básica del certificado, la opción de descarga en formato PEM y el acceso a las acciones de revocación.\\
La vista de detalle, proporciona información adicional y el acceso a las acciones de revocación.`},{heading:"revocación-de-certificados",content:"Ya sea desde las acciones del listado de certificados, como desde la vista de detalle se puede desencadenar la acción de revocación. Al pulsar sobre “Revoke Certificate” se abre una ventana modal en la que se debe seleccionar la razón de la revocación."},{heading:"revocación-de-certificados",content:"Es importante destacar que la única razón reversible es “CertificateHold”, una revocación por cualquier otra  razón no podrá ser revertida. En caso de seleccionar “CertificateHold” se ofrecerá una acción de reactivación."}],headings:[{id:"gestión-de-certificados",content:"Gestión de certificados"},{id:"revocación-de-certificados",content:"Revocación de certificados"}]};const t=[{depth:1,url:"#gestión-de-certificados",title:e.jsx(e.Fragment,{children:"Gestión de certificados"})},{depth:2,url:"#revocación-de-certificados",title:e.jsx(e.Fragment,{children:"Revocación de certificados"})}];function c(i){const a={br:"br",h1:"h1",h2:"h2",p:"p",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(a.h1,{id:"gestión-de-certificados",children:"Gestión de certificados"}),`
`,e.jsxs(a.p,{children:["Los certificados emitidos por Lamassu son accesibles, tanto desde la pestaña de Issued Certificates de los detalles de una CA como desde la opción “Certificates” del menú lateral.",e.jsx(a.br,{}),`
`,"En la pestaña de “Issued Certificates” se muestran los certificados emitidos por la CA seleccionada."]}),`
`,e.jsx(a.p,{children:"Como desde la opción “Certificates” del menú lateral, donde se presentan todos los certificados emitidos por Lamassu independientemente de la CA que lo haya emitido. Esta pantalla incluye la opción de filtro de los certificados por CN, número de serie, estado y por la CA que lo emitió."}),`
`,e.jsxs(a.p,{children:["Por cada certificado se incluye un conjunto de acciones vinculadas al certificado.",e.jsx(a.br,{}),`
`,"Acceso a los detalles “View Details”, un mecanismo de inspección rápida (Quick Inspect) con la información básica del certificado, la opción de descarga en formato PEM y el acceso a las acciones de revocación.",e.jsx(a.br,{}),`
`,"La vista de detalle, proporciona información adicional y el acceso a las acciones de revocación."]}),`
`,e.jsx(a.h2,{id:"revocación-de-certificados",children:"Revocación de certificados"}),`
`,e.jsx(a.p,{children:"Ya sea desde las acciones del listado de certificados, como desde la vista de detalle se puede desencadenar la acción de revocación. Al pulsar sobre “Revoke Certificate” se abre una ventana modal en la que se debe seleccionar la razón de la revocación."}),`
`,e.jsx(a.p,{children:"Es importante destacar que la única razón reversible es “CertificateHold”, una revocación por cualquier otra  razón no podrá ser revertida. En caso de seleccionar “CertificateHold” se ofrecerá una acción de reactivación."})]})}function r(i={}){const{wrapper:a}=i.components||{};return a?e.jsx(a,{...i,children:e.jsx(c,{...i})}):c(i)}export{s as _markdown,r as default,o as frontmatter,d as structuredData,t as toc};
