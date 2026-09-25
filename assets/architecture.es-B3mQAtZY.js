import{j as e}from"./index-prc0XQdj.js";let s=`

Lamassu se despliega como un conjunto de servicios independientes. La separación evita que todos los componentes necesiten acceso directo a las claves privadas y permite escalar cada capacidad según la carga.

<ArchitectureDiagram level="low" view="3d" />

Cambia al nivel bajo para ver el interior de la caja de la plataforma Lamassu (CA, KMS, DMS, Device Manager, VA, Alerts, el conector de AWS IoT, Job Manager y la consola/API), y al nivel medio para verla como una única plataforma junto a sus dependencias externas.

Plano de control [#plano-de-control]

La consola y las APIs administran autoridades, certificados, DMS, dispositivos, alertas y configuración. Los eventos de dominio permiten que conectores y automatizaciones reaccionen a los cambios sin sondear continuamente la plataforma.

Custodia y operaciones criptográficas [#custodia-y-operaciones-criptográficas]

El KMS ofrece una interfaz común sobre motores software, PKCS#11 y proveedores cloud. El motor seleccionado conserva la clave o delega la operación criptográfica sin que los demás servicios conozcan su implementación.

Emisión y enrolamiento [#emisión-y-enrolamiento]

El servicio de CA emite certificados y mantiene la relación con su autoridad. El DMS aplica las reglas de enrolamiento y expone los flujos EST para que un dispositivo solicite o renueve una identidad.

Estado y validación [#estado-y-validación]

Device Manager conserva la vista operativa del dispositivo y su historial. Validation Authority publica OCSP y CRLs para que otros sistemas decidan si deben confiar en un certificado presentado.

Dependencias de la plataforma [#dependencias-de-la-plataforma]

En un despliegue autogestionado, Lamassu utiliza PostgreSQL para persistencia, RabbitMQ para mensajería y un proveedor OIDC para autenticación. Consulta la [arquitectura de despliegue](/docs/deployment/self-hosted/overview#arquitectura) para ver cómo se publican los servicios en Kubernetes.
`,t={title:"Arquitectura de la plataforma",description:"Componentes de Lamassu y relación entre control, claves, emisión y dispositivos."},r={contents:[{heading:void 0,content:"Lamassu se despliega como un conjunto de servicios independientes. La separación evita que todos los componentes necesiten acceso directo a las claves privadas y permite escalar cada capacidad según la carga."},{heading:void 0,content:"Cambia al nivel bajo para ver el interior de la caja de la plataforma Lamassu (CA, KMS, DMS, Device Manager, VA, Alerts, el conector de AWS IoT, Job Manager y la consola/API), y al nivel medio para verla como una única plataforma junto a sus dependencias externas."},{heading:"plano-de-control",content:"La consola y las APIs administran autoridades, certificados, DMS, dispositivos, alertas y configuración. Los eventos de dominio permiten que conectores y automatizaciones reaccionen a los cambios sin sondear continuamente la plataforma."},{heading:"custodia-y-operaciones-criptográficas",content:"El KMS ofrece una interfaz común sobre motores software, PKCS#11 y proveedores cloud. El motor seleccionado conserva la clave o delega la operación criptográfica sin que los demás servicios conozcan su implementación."},{heading:"emisión-y-enrolamiento",content:"El servicio de CA emite certificados y mantiene la relación con su autoridad. El DMS aplica las reglas de enrolamiento y expone los flujos EST para que un dispositivo solicite o renueve una identidad."},{heading:"estado-y-validación",content:"Device Manager conserva la vista operativa del dispositivo y su historial. Validation Authority publica OCSP y CRLs para que otros sistemas decidan si deben confiar en un certificado presentado."},{heading:"dependencias-de-la-plataforma",content:"En un despliegue autogestionado, Lamassu utiliza PostgreSQL para persistencia, RabbitMQ para mensajería y un proveedor OIDC para autenticación. Consulta la arquitectura de despliegue para ver cómo se publican los servicios en Kubernetes."}],headings:[{id:"plano-de-control",content:"Plano de control"},{id:"custodia-y-operaciones-criptográficas",content:"Custodia y operaciones criptográficas"},{id:"emisión-y-enrolamiento",content:"Emisión y enrolamiento"},{id:"estado-y-validación",content:"Estado y validación"},{id:"dependencias-de-la-plataforma",content:"Dependencias de la plataforma"}]};const c=[{depth:2,url:"#plano-de-control",title:e.jsx(e.Fragment,{children:"Plano de control"})},{depth:2,url:"#custodia-y-operaciones-criptográficas",title:e.jsx(e.Fragment,{children:"Custodia y operaciones criptográficas"})},{depth:2,url:"#emisión-y-enrolamiento",title:e.jsx(e.Fragment,{children:"Emisión y enrolamiento"})},{depth:2,url:"#estado-y-validación",title:e.jsx(e.Fragment,{children:"Estado y validación"})},{depth:2,url:"#dependencias-de-la-plataforma",title:e.jsx(e.Fragment,{children:"Dependencias de la plataforma"})}];function i(n){const a={a:"a",h2:"h2",p:"p",...n.components},{ArchitectureDiagram:o}=a;return o||d("ArchitectureDiagram"),e.jsxs(e.Fragment,{children:[e.jsx(a.p,{children:"Lamassu se despliega como un conjunto de servicios independientes. La separación evita que todos los componentes necesiten acceso directo a las claves privadas y permite escalar cada capacidad según la carga."}),`
`,e.jsx(o,{level:"low",view:"3d"}),`
`,e.jsx(a.p,{children:"Cambia al nivel bajo para ver el interior de la caja de la plataforma Lamassu (CA, KMS, DMS, Device Manager, VA, Alerts, el conector de AWS IoT, Job Manager y la consola/API), y al nivel medio para verla como una única plataforma junto a sus dependencias externas."}),`
`,e.jsx(a.h2,{id:"plano-de-control",children:"Plano de control"}),`
`,e.jsx(a.p,{children:"La consola y las APIs administran autoridades, certificados, DMS, dispositivos, alertas y configuración. Los eventos de dominio permiten que conectores y automatizaciones reaccionen a los cambios sin sondear continuamente la plataforma."}),`
`,e.jsx(a.h2,{id:"custodia-y-operaciones-criptográficas",children:"Custodia y operaciones criptográficas"}),`
`,e.jsx(a.p,{children:"El KMS ofrece una interfaz común sobre motores software, PKCS#11 y proveedores cloud. El motor seleccionado conserva la clave o delega la operación criptográfica sin que los demás servicios conozcan su implementación."}),`
`,e.jsx(a.h2,{id:"emisión-y-enrolamiento",children:"Emisión y enrolamiento"}),`
`,e.jsx(a.p,{children:"El servicio de CA emite certificados y mantiene la relación con su autoridad. El DMS aplica las reglas de enrolamiento y expone los flujos EST para que un dispositivo solicite o renueve una identidad."}),`
`,e.jsx(a.h2,{id:"estado-y-validación",children:"Estado y validación"}),`
`,e.jsx(a.p,{children:"Device Manager conserva la vista operativa del dispositivo y su historial. Validation Authority publica OCSP y CRLs para que otros sistemas decidan si deben confiar en un certificado presentado."}),`
`,e.jsx(a.h2,{id:"dependencias-de-la-plataforma",children:"Dependencias de la plataforma"}),`
`,e.jsxs(a.p,{children:["En un despliegue autogestionado, Lamassu utiliza PostgreSQL para persistencia, RabbitMQ para mensajería y un proveedor OIDC para autenticación. Consulta la ",e.jsx(a.a,{href:"/docs/deployment/self-hosted/overview#arquitectura",children:"arquitectura de despliegue"})," para ver cómo se publican los servicios en Kubernetes."]})]})}function l(n={}){const{wrapper:a}=n.components||{};return a?e.jsx(a,{...n,children:e.jsx(i,{...n})}):i(n)}function d(n,a){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,_markdown:s,default:l,frontmatter:t,structuredData:r,toc:c},Symbol.toStringTag,{value:"Module"}));export{u as _};
