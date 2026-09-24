import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let s=`

Lamassu se despliega como un conjunto de servicios independientes. La separación evita que todos los componentes necesiten acceso directo a las claves privadas y permite escalar cada capacidad según la carga.

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
`,t={title:"Arquitectura de la plataforma",description:"Componentes de Lamassu y relación entre control, claves, emisión y dispositivos."},r={contents:[{heading:void 0,content:"Lamassu se despliega como un conjunto de servicios independientes. La separación evita que todos los componentes necesiten acceso directo a las claves privadas y permite escalar cada capacidad según la carga."},{heading:"plano-de-control",content:"La consola y las APIs administran autoridades, certificados, DMS, dispositivos, alertas y configuración. Los eventos de dominio permiten que conectores y automatizaciones reaccionen a los cambios sin sondear continuamente la plataforma."},{heading:"custodia-y-operaciones-criptográficas",content:"El KMS ofrece una interfaz común sobre motores software, PKCS#11 y proveedores cloud. El motor seleccionado conserva la clave o delega la operación criptográfica sin que los demás servicios conozcan su implementación."},{heading:"emisión-y-enrolamiento",content:"El servicio de CA emite certificados y mantiene la relación con su autoridad. El DMS aplica las reglas de enrolamiento y expone los flujos EST para que un dispositivo solicite o renueve una identidad."},{heading:"estado-y-validación",content:"Device Manager conserva la vista operativa del dispositivo y su historial. Validation Authority publica OCSP y CRLs para que otros sistemas decidan si deben confiar en un certificado presentado."},{heading:"dependencias-de-la-plataforma",content:"En un despliegue autogestionado, Lamassu utiliza PostgreSQL para persistencia, RabbitMQ para mensajería y un proveedor OIDC para autenticación. Consulta la arquitectura de despliegue para ver cómo se publican los servicios en Kubernetes."}],headings:[{id:"plano-de-control",content:"Plano de control"},{id:"custodia-y-operaciones-criptográficas",content:"Custodia y operaciones criptográficas"},{id:"emisión-y-enrolamiento",content:"Emisión y enrolamiento"},{id:"estado-y-validación",content:"Estado y validación"},{id:"dependencias-de-la-plataforma",content:"Dependencias de la plataforma"}]};const c=[{depth:2,url:"#plano-de-control",title:e.jsx(e.Fragment,{children:"Plano de control"})},{depth:2,url:"#custodia-y-operaciones-criptográficas",title:e.jsx(e.Fragment,{children:"Custodia y operaciones criptográficas"})},{depth:2,url:"#emisión-y-enrolamiento",title:e.jsx(e.Fragment,{children:"Emisión y enrolamiento"})},{depth:2,url:"#estado-y-validación",title:e.jsx(e.Fragment,{children:"Estado y validación"})},{depth:2,url:"#dependencias-de-la-plataforma",title:e.jsx(e.Fragment,{children:"Dependencias de la plataforma"})}];function n(i){const a={a:"a",h2:"h2",p:"p",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(a.p,{children:"Lamassu se despliega como un conjunto de servicios independientes. La separación evita que todos los componentes necesiten acceso directo a las claves privadas y permite escalar cada capacidad según la carga."}),`
`,e.jsx(a.h2,{id:"plano-de-control",children:"Plano de control"}),`
`,e.jsx(a.p,{children:"La consola y las APIs administran autoridades, certificados, DMS, dispositivos, alertas y configuración. Los eventos de dominio permiten que conectores y automatizaciones reaccionen a los cambios sin sondear continuamente la plataforma."}),`
`,e.jsx(a.h2,{id:"custodia-y-operaciones-criptográficas",children:"Custodia y operaciones criptográficas"}),`
`,e.jsx(a.p,{children:"El KMS ofrece una interfaz común sobre motores software, PKCS#11 y proveedores cloud. El motor seleccionado conserva la clave o delega la operación criptográfica sin que los demás servicios conozcan su implementación."}),`
`,e.jsx(a.h2,{id:"emisión-y-enrolamiento",children:"Emisión y enrolamiento"}),`
`,e.jsx(a.p,{children:"El servicio de CA emite certificados y mantiene la relación con su autoridad. El DMS aplica las reglas de enrolamiento y expone los flujos EST para que un dispositivo solicite o renueve una identidad."}),`
`,e.jsx(a.h2,{id:"estado-y-validación",children:"Estado y validación"}),`
`,e.jsx(a.p,{children:"Device Manager conserva la vista operativa del dispositivo y su historial. Validation Authority publica OCSP y CRLs para que otros sistemas decidan si deben confiar en un certificado presentado."}),`
`,e.jsx(a.h2,{id:"dependencias-de-la-plataforma",children:"Dependencias de la plataforma"}),`
`,e.jsxs(a.p,{children:["En un despliegue autogestionado, Lamassu utiliza PostgreSQL para persistencia, RabbitMQ para mensajería y un proveedor OIDC para autenticación. Consulta la ",e.jsx(a.a,{href:"/docs/deployment/self-hosted/overview#arquitectura",children:"arquitectura de despliegue"})," para ver cómo se publican los servicios en Kubernetes."]})]})}function d(i={}){const{wrapper:a}=i.components||{};return a?e.jsx(a,{...i,children:e.jsx(n,{...i})}):n(i)}export{s as _markdown,d as default,t as frontmatter,r as structuredData,c as toc};
