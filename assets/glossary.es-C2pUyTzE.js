import{j as e}from"./index-prc0XQdj.js";let o=`

A–C [#ac]

**AKI (Authority Key Identifier)**\\
Identificador de la clave pública de la autoridad que firmó un certificado. Ayuda a construir la cadena hacia el emisor correcto.

**Ancla de confianza**\\
Certificado, normalmente de una CA raíz, que un consumidor acepta de forma explícita como punto final de una cadena.

**CA (Certification Authority)**\\
Autoridad que firma certificados y vincula una identidad con una clave pública.

**CA intermedia**\\
CA firmada por otra autoridad. Se utiliza para emitir sin exponer la raíz a la operación diaria.

**CA raíz**\\
CA autofirmada que inicia una jerarquía de confianza.

**Certificado X.509**\\
Documento firmado que contiene una clave pública, un sujeto, un emisor, un periodo de validez y extensiones que delimitan su uso.

**CRL (Certificate Revocation List)**\\
Lista firmada de certificados revocados publicada por una CA.

**CSR (Certificate Signing Request)**\\
Solicitud PKCS#10 que contiene una clave pública y atributos solicitados. La firma de la CSR demuestra posesión de la clave privada correspondiente.

D–K [#dk]

**DMS (Device Management Service)**\\
Configuración que agrupa reglas de registro, enrolamiento, re-enrolamiento, emisión y distribución de CAs para una flota.

**Distinguished Name (DN)**\\
Conjunto de atributos del sujeto o emisor, como \`CN\`, \`O\`, \`OU\`, \`C\`, \`ST\` y \`L\`.

**EST (Enrollment over Secure Transport)**\\
Protocolo definido en RFC 7030 para obtener CAs, enrolar y re-enrolar certificados sobre HTTPS.

**Extended Key Usage (EKU)**\\
Extensión que acota finalidades como autenticación de cliente, autenticación de servidor, firma de código u OCSP.

**Identidad de dispositivo**\\
Relación entre un dispositivo y uno de sus certificados. Un dispositivo puede conservar un historial de identidades.

**Identity slot**\\
Posición lógica en un dispositivo donde Lamassu vincula una identidad activa o histórica.

**JITP (Just-in-Time Provisioning)**\\
Registro automático de un dispositivo cuando completa correctamente su primer enrolamiento.

**KMS (Key Management Service)**\\
Servicio de Lamassu que normaliza generación, importación y uso de claves sobre distintos motores criptográficos.

**Key Usage**\\
Extensión X.509 que permite operaciones básicas como firma digital, cifrado de clave o firma de certificados.

M–R [#mr]

**mTLS (Mutual TLS)**\\
TLS donde cliente y servidor presentan certificados. Un DMS puede usar el certificado cliente como método de autenticación.

**OCSP (Online Certificate Status Protocol)**\\
Protocolo para consultar en línea si un certificado está vigente, revocado o es desconocido.

**Perfil de emisión**\\
Política reutilizable que define cómo Lamassu construye un certificado y qué claves acepta.

**Principal**\\
Identidad de operador o cliente de API reconocida por el servicio de autorización. Lamassu admite principales OIDC y X.509.

**Política**\\
Conjunto de permisos asignable a uno o varios principales.

**RA (Registration Authority)**\\
Componente que verifica al solicitante antes de pedir a una CA que emita. El DMS cumple este papel en los flujos de enrolamiento de dispositivos.

**Relying party**\\
Sistema consumidor que decide si acepta un certificado presentado.

**Revocación**\\
Invalidación de un certificado antes de su fecha de expiración.

S–Z [#sz]

**SAN (Subject Alternative Name)**\\
Extensión que añade identidades como nombres DNS, direcciones IP, correos o URIs.

**SKI (Subject Key Identifier)**\\
Identificador derivado de la clave pública del propio certificado.

**VA (Validation Authority)**\\
Servicio de Lamassu responsable de las respuestas OCSP y la generación o publicación de CRLs.

**Ventana de renovación**\\
Periodo anterior a la expiración durante el que un dispositivo puede o debe solicitar otra identidad.

¿Falta un término operativo? Consulta primero [Cómo funciona Lamassu](/docs/platform/pki/concepts/overview) y el [Modelo de confianza](/docs/platform/pki/concepts/trust-model), donde estos conceptos aparecen conectados.
`,r={title:"Glosario",description:"Términos de PKI, certificados y gestión de identidades usados en Lamassu."},t={contents:[{heading:"ac",content:`**AKI (Authority Key Identifier)**\\
Identificador de la clave pública de la autoridad que firmó un certificado. Ayuda a construir la cadena hacia el emisor correcto.`},{heading:"ac",content:`**Ancla de confianza**\\
Certificado, normalmente de una CA raíz, que un consumidor acepta de forma explícita como punto final de una cadena.`},{heading:"ac",content:`**CA (Certification Authority)**\\
Autoridad que firma certificados y vincula una identidad con una clave pública.`},{heading:"ac",content:`**CA intermedia**\\
CA firmada por otra autoridad. Se utiliza para emitir sin exponer la raíz a la operación diaria.`},{heading:"ac",content:`**CA raíz**\\
CA autofirmada que inicia una jerarquía de confianza.`},{heading:"ac",content:`**Certificado X.509**\\
Documento firmado que contiene una clave pública, un sujeto, un emisor, un periodo de validez y extensiones que delimitan su uso.`},{heading:"ac",content:`**CRL (Certificate Revocation List)**\\
Lista firmada de certificados revocados publicada por una CA.`},{heading:"ac",content:`**CSR (Certificate Signing Request)**\\
Solicitud PKCS#10 que contiene una clave pública y atributos solicitados. La firma de la CSR demuestra posesión de la clave privada correspondiente.`},{heading:"dk",content:`**DMS (Device Management Service)**\\
Configuración que agrupa reglas de registro, enrolamiento, re-enrolamiento, emisión y distribución de CAs para una flota.`},{heading:"dk",content:"**Distinguished Name (DN)**\\\nConjunto de atributos del sujeto o emisor, como `CN`, `O`, `OU`, `C`, `ST` y `L`."},{heading:"dk",content:`**EST (Enrollment over Secure Transport)**\\
Protocolo definido en RFC 7030 para obtener CAs, enrolar y re-enrolar certificados sobre HTTPS.`},{heading:"dk",content:`**Extended Key Usage (EKU)**\\
Extensión que acota finalidades como autenticación de cliente, autenticación de servidor, firma de código u OCSP.`},{heading:"dk",content:`**Identidad de dispositivo**\\
Relación entre un dispositivo y uno de sus certificados. Un dispositivo puede conservar un historial de identidades.`},{heading:"dk",content:`**Identity slot**\\
Posición lógica en un dispositivo donde Lamassu vincula una identidad activa o histórica.`},{heading:"dk",content:`**JITP (Just-in-Time Provisioning)**\\
Registro automático de un dispositivo cuando completa correctamente su primer enrolamiento.`},{heading:"dk",content:`**KMS (Key Management Service)**\\
Servicio de Lamassu que normaliza generación, importación y uso de claves sobre distintos motores criptográficos.`},{heading:"dk",content:`**Key Usage**\\
Extensión X.509 que permite operaciones básicas como firma digital, cifrado de clave o firma de certificados.`},{heading:"mr",content:`**mTLS (Mutual TLS)**\\
TLS donde cliente y servidor presentan certificados. Un DMS puede usar el certificado cliente como método de autenticación.`},{heading:"mr",content:`**OCSP (Online Certificate Status Protocol)**\\
Protocolo para consultar en línea si un certificado está vigente, revocado o es desconocido.`},{heading:"mr",content:`**Perfil de emisión**\\
Política reutilizable que define cómo Lamassu construye un certificado y qué claves acepta.`},{heading:"mr",content:`**Principal**\\
Identidad de operador o cliente de API reconocida por el servicio de autorización. Lamassu admite principales OIDC y X.509.`},{heading:"mr",content:`**Política**\\
Conjunto de permisos asignable a uno o varios principales.`},{heading:"mr",content:`**RA (Registration Authority)**\\
Componente que verifica al solicitante antes de pedir a una CA que emita. El DMS cumple este papel en los flujos de enrolamiento de dispositivos.`},{heading:"mr",content:`**Relying party**\\
Sistema consumidor que decide si acepta un certificado presentado.`},{heading:"mr",content:`**Revocación**\\
Invalidación de un certificado antes de su fecha de expiración.`},{heading:"sz",content:`**SAN (Subject Alternative Name)**\\
Extensión que añade identidades como nombres DNS, direcciones IP, correos o URIs.`},{heading:"sz",content:`**SKI (Subject Key Identifier)**\\
Identificador derivado de la clave pública del propio certificado.`},{heading:"sz",content:`**VA (Validation Authority)**\\
Servicio de Lamassu responsable de las respuestas OCSP y la generación o publicación de CRLs.`},{heading:"sz",content:`**Ventana de renovación**\\
Periodo anterior a la expiración durante el que un dispositivo puede o debe solicitar otra identidad.`},{heading:"sz",content:"¿Falta un término operativo? Consulta primero Cómo funciona Lamassu y el Modelo de confianza, donde estos conceptos aparecen conectados."}],headings:[{id:"ac",content:"A–C"},{id:"dk",content:"D–K"},{id:"mr",content:"M–R"},{id:"sz",content:"S–Z"}]};const d=[{depth:2,url:"#ac",title:e.jsx(e.Fragment,{children:"A–C"})},{depth:2,url:"#dk",title:e.jsx(e.Fragment,{children:"D–K"})},{depth:2,url:"#mr",title:e.jsx(e.Fragment,{children:"M–R"})},{depth:2,url:"#sz",title:e.jsx(e.Fragment,{children:"S–Z"})}];function a(i){const n={a:"a",br:"br",code:"code",h2:"h2",p:"p",strong:"strong",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"ac",children:"A–C"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"AKI (Authority Key Identifier)"}),e.jsx(n.br,{}),`
`,"Identificador de la clave pública de la autoridad que firmó un certificado. Ayuda a construir la cadena hacia el emisor correcto."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Ancla de confianza"}),e.jsx(n.br,{}),`
`,"Certificado, normalmente de una CA raíz, que un consumidor acepta de forma explícita como punto final de una cadena."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"CA (Certification Authority)"}),e.jsx(n.br,{}),`
`,"Autoridad que firma certificados y vincula una identidad con una clave pública."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"CA intermedia"}),e.jsx(n.br,{}),`
`,"CA firmada por otra autoridad. Se utiliza para emitir sin exponer la raíz a la operación diaria."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"CA raíz"}),e.jsx(n.br,{}),`
`,"CA autofirmada que inicia una jerarquía de confianza."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Certificado X.509"}),e.jsx(n.br,{}),`
`,"Documento firmado que contiene una clave pública, un sujeto, un emisor, un periodo de validez y extensiones que delimitan su uso."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"CRL (Certificate Revocation List)"}),e.jsx(n.br,{}),`
`,"Lista firmada de certificados revocados publicada por una CA."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"CSR (Certificate Signing Request)"}),e.jsx(n.br,{}),`
`,"Solicitud PKCS#10 que contiene una clave pública y atributos solicitados. La firma de la CSR demuestra posesión de la clave privada correspondiente."]}),`
`,e.jsx(n.h2,{id:"dk",children:"D–K"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"DMS (Device Management Service)"}),e.jsx(n.br,{}),`
`,"Configuración que agrupa reglas de registro, enrolamiento, re-enrolamiento, emisión y distribución de CAs para una flota."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Distinguished Name (DN)"}),e.jsx(n.br,{}),`
`,"Conjunto de atributos del sujeto o emisor, como ",e.jsx(n.code,{children:"CN"}),", ",e.jsx(n.code,{children:"O"}),", ",e.jsx(n.code,{children:"OU"}),", ",e.jsx(n.code,{children:"C"}),", ",e.jsx(n.code,{children:"ST"})," y ",e.jsx(n.code,{children:"L"}),"."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"EST (Enrollment over Secure Transport)"}),e.jsx(n.br,{}),`
`,"Protocolo definido en RFC 7030 para obtener CAs, enrolar y re-enrolar certificados sobre HTTPS."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Extended Key Usage (EKU)"}),e.jsx(n.br,{}),`
`,"Extensión que acota finalidades como autenticación de cliente, autenticación de servidor, firma de código u OCSP."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Identidad de dispositivo"}),e.jsx(n.br,{}),`
`,"Relación entre un dispositivo y uno de sus certificados. Un dispositivo puede conservar un historial de identidades."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Identity slot"}),e.jsx(n.br,{}),`
`,"Posición lógica en un dispositivo donde Lamassu vincula una identidad activa o histórica."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"JITP (Just-in-Time Provisioning)"}),e.jsx(n.br,{}),`
`,"Registro automático de un dispositivo cuando completa correctamente su primer enrolamiento."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"KMS (Key Management Service)"}),e.jsx(n.br,{}),`
`,"Servicio de Lamassu que normaliza generación, importación y uso de claves sobre distintos motores criptográficos."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Key Usage"}),e.jsx(n.br,{}),`
`,"Extensión X.509 que permite operaciones básicas como firma digital, cifrado de clave o firma de certificados."]}),`
`,e.jsx(n.h2,{id:"mr",children:"M–R"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"mTLS (Mutual TLS)"}),e.jsx(n.br,{}),`
`,"TLS donde cliente y servidor presentan certificados. Un DMS puede usar el certificado cliente como método de autenticación."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"OCSP (Online Certificate Status Protocol)"}),e.jsx(n.br,{}),`
`,"Protocolo para consultar en línea si un certificado está vigente, revocado o es desconocido."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Perfil de emisión"}),e.jsx(n.br,{}),`
`,"Política reutilizable que define cómo Lamassu construye un certificado y qué claves acepta."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Principal"}),e.jsx(n.br,{}),`
`,"Identidad de operador o cliente de API reconocida por el servicio de autorización. Lamassu admite principales OIDC y X.509."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Política"}),e.jsx(n.br,{}),`
`,"Conjunto de permisos asignable a uno o varios principales."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"RA (Registration Authority)"}),e.jsx(n.br,{}),`
`,"Componente que verifica al solicitante antes de pedir a una CA que emita. El DMS cumple este papel en los flujos de enrolamiento de dispositivos."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Relying party"}),e.jsx(n.br,{}),`
`,"Sistema consumidor que decide si acepta un certificado presentado."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Revocación"}),e.jsx(n.br,{}),`
`,"Invalidación de un certificado antes de su fecha de expiración."]}),`
`,e.jsx(n.h2,{id:"sz",children:"S–Z"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"SAN (Subject Alternative Name)"}),e.jsx(n.br,{}),`
`,"Extensión que añade identidades como nombres DNS, direcciones IP, correos o URIs."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"SKI (Subject Key Identifier)"}),e.jsx(n.br,{}),`
`,"Identificador derivado de la clave pública del propio certificado."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"VA (Validation Authority)"}),e.jsx(n.br,{}),`
`,"Servicio de Lamassu responsable de las respuestas OCSP y la generación o publicación de CRLs."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Ventana de renovación"}),e.jsx(n.br,{}),`
`,"Periodo anterior a la expiración durante el que un dispositivo puede o debe solicitar otra identidad."]}),`
`,e.jsxs(n.p,{children:["¿Falta un término operativo? Consulta primero ",e.jsx(n.a,{href:"/docs/platform/pki/concepts/overview",children:"Cómo funciona Lamassu"})," y el ",e.jsx(n.a,{href:"/docs/platform/pki/concepts/trust-model",children:"Modelo de confianza"}),", donde estos conceptos aparecen conectados."]})]})}function c(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(a,{...i})}):a(i)}const l=Object.freeze(Object.defineProperty({__proto__:null,_markdown:o,default:c,frontmatter:r,structuredData:t,toc:d},Symbol.toStringTag,{value:"Module"}));export{l as _};
