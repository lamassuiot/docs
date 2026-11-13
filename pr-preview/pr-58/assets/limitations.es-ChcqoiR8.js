import{j as e}from"./index-DqgIL_Rv.js";let r=`

<div className="lm-diff-ins lm-diff-block">
  Esta página reúne los límites de la implementación actual para valorarlos antes de planificar un despliegue. Cada uno se ha observado en el código o en las pruebas de las ramas descritas en esta sección.
</div>

<div className="lm-diff-ins lm-diff-block">
  Estándares e interoperabilidad [#estándares-e-interoperabilidad]
</div>

<div className="lm-diff-ins lm-diff-block">
  Los certificados composite se implementaron y se probaron contra el borrador 19 de la especificación de firmas composite del IETF, que desde entonces se ha publicado como RFC 10073; la implementación no se ha comparado con el texto final. Tres de sus algoritmos (las dos variantes Brainpool y Ed448) no están implementados. Los esquemas de firma composite en TLS usan puntos de código de uso privado de \`0xFE00\` a \`0xFE0E\` y en el código no se identifica ningún borrador ni versión publicados, por lo que solo interoperan con pares construidos con el mismo fork de Go. Las variantes composite con RSA PKCS#1 v1.5 no pueden autenticar un handshake TLS. SLH-DSA no tiene esquema de firma TLS. El atributo de solicitud de certificado relacionado no se ha contrastado con otras implementaciones del RFC 9763.
</div>

<div className="lm-diff-ins lm-diff-block">
  Claves y motores [#claves-y-motores]
</div>

<div className="lm-diff-ins lm-diff-block">
  Las claves poscuánticas, composite y Ed25519 funcionan solo con los motores filesystem y software. Los motores Vault KV2 y AWS Secrets Manager anuncian soporte y después fallan en la creación, y AWS KMS, Azure y PKCS#11 no las soportan. No existe, por tanto, ninguna clave poscuántica respaldada por hardware o por un KMS en la nube. Algunos mensajes de error de los motores están copiados de otros motores y nombran el motor equivocado.
</div>

<div className="lm-diff-ins lm-diff-block">
  La interfaz \`CryptoEngine\` ha incorporado métodos para crear e importar cada nuevo tipo de clave. Los motores desarrollados fuera del repositorio de Lamassu deben implementarlos.
</div>

<div className="lm-diff-ins lm-diff-block">
  Autoridad de certificación y validación [#autoridad-de-certificación-y-validación]
</div>

<div className="lm-diff-ins lm-diff-block">
  Una CA con clave poscuántica, Ed25519 o composite no puede firmar respuestas OCSP, porque la biblioteca de firma solo admite RSA y ECDSA. Se espera que la generación de CRL funcione, ya que usa la firma del fork, pero ni CRL ni OCSP tienen pruebas con estas claves.
</div>

<div className="lm-diff-ins lm-diff-block">
  Los perfiles de emisión no pueden permitir ni denegar algoritmos poscuánticos; su aplicación de restricciones afecta solo a RSA y ECDSA. La fortaleza de clave de un certificado emitido solo se calcula para RSA y ECDSA, por lo que los demás certificados se almacenan con tipo y tamaño desconocidos y fortaleza baja. No está soportada la importación de una CA existente con clave SLH-DSA o composite.
</div>

<div className="lm-diff-ins lm-diff-block">
  El DMS solo puede generar claves en el servidor para RSA y ECDSA, de modo que \`serverkeygen\` no puede devolver una clave poscuántica. Los flujos de enrolamiento por EST y por el device manager no tienen pruebas con claves poscuánticas.
</div>

<div className="lm-diff-ins lm-diff-block">
  El backend no evalúa la extensión de certificado relacionado. Solo la emite.
</div>

<div className="lm-diff-ins lm-diff-block">
  Dashboard [#dashboard]
</div>

<div className="lm-diff-ins lm-diff-block">
  El generador de claves SLH-DSA del navegador asigna los identificadores de conjunto de parámetros de forma distinta al resto de la interfaz, según se describe en [Dashboard](/docs/platform/pqc/dashboard). Los nombres de los tipos de clave no son uniformes entre pantallas, y la interfaz no incluye aviso de carácter experimental ni traducción.
</div>

<div className="lm-diff-ins lm-diff-block">
  Compilación y despliegue [#compilación-y-despliegue]
</div>

<div className="lm-diff-ins lm-diff-block">
  Todo depende de forks de Go y de Traefik que no son los proyectos originales, y la imagen del proxy tiene una etiqueta mutable. La especificación OpenAPI del KMS del backend sigue listando solo RSA, ECDSA y Ed25519 y no refleja los nuevos tipos de clave.
</div>

<div className="lm-diff-ins lm-diff-block">
  El Helm chart usa nombres de recurso fijos, admite una sola release por espacio de nombres y envía el tráfico de Traefik a Envoy sin verificar certificados. Los certificados poscuánticos que crea el instalador son válidos durante 365 días y no se renuevan. El instalador necesita un host Linux y ejecuta una instalación de Helm, no una actualización.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Visión general de la criptografía poscuántica" description="Volver al resumen de la sección." href="/docs/platform/pqc/overview" />
  </Cards>
</div>
`,l={title:"Limitaciones conocidas",description:"Qué está incompleto, es no estándar o no está verificado en el soporte poscuántico de Lamassu, agrupado por componente."},c={isNew:!0,changes:17,title:void 0,description:void 0},t={contents:[{heading:void 0,content:"Esta página reúne los límites de la implementación actual para valorarlos antes de planificar un despliegue. Cada uno se ha observado en el código o en las pruebas de las ramas descritas en esta sección."},{heading:"estándares-e-interoperabilidad",content:"Los certificados composite se implementaron y se probaron contra el borrador 19 de la especificación de firmas composite del IETF, que desde entonces se ha publicado como RFC 10073; la implementación no se ha comparado con el texto final. Tres de sus algoritmos (las dos variantes Brainpool y Ed448) no están implementados. Los esquemas de firma composite en TLS usan puntos de código de uso privado de `0xFE00` a `0xFE0E` y en el código no se identifica ningún borrador ni versión publicados, por lo que solo interoperan con pares construidos con el mismo fork de Go. Las variantes composite con RSA PKCS#1 v1.5 no pueden autenticar un handshake TLS. SLH-DSA no tiene esquema de firma TLS. El atributo de solicitud de certificado relacionado no se ha contrastado con otras implementaciones del RFC 9763."},{heading:"claves-y-motores",content:"Las claves poscuánticas, composite y Ed25519 funcionan solo con los motores filesystem y software. Los motores Vault KV2 y AWS Secrets Manager anuncian soporte y después fallan en la creación, y AWS KMS, Azure y PKCS#11 no las soportan. No existe, por tanto, ninguna clave poscuántica respaldada por hardware o por un KMS en la nube. Algunos mensajes de error de los motores están copiados de otros motores y nombran el motor equivocado."},{heading:"claves-y-motores",content:"La interfaz `CryptoEngine` ha incorporado métodos para crear e importar cada nuevo tipo de clave. Los motores desarrollados fuera del repositorio de Lamassu deben implementarlos."},{heading:"autoridad-de-certificación-y-validación",content:"Una CA con clave poscuántica, Ed25519 o composite no puede firmar respuestas OCSP, porque la biblioteca de firma solo admite RSA y ECDSA. Se espera que la generación de CRL funcione, ya que usa la firma del fork, pero ni CRL ni OCSP tienen pruebas con estas claves."},{heading:"autoridad-de-certificación-y-validación",content:"Los perfiles de emisión no pueden permitir ni denegar algoritmos poscuánticos; su aplicación de restricciones afecta solo a RSA y ECDSA. La fortaleza de clave de un certificado emitido solo se calcula para RSA y ECDSA, por lo que los demás certificados se almacenan con tipo y tamaño desconocidos y fortaleza baja. No está soportada la importación de una CA existente con clave SLH-DSA o composite."},{heading:"autoridad-de-certificación-y-validación",content:"El DMS solo puede generar claves en el servidor para RSA y ECDSA, de modo que `serverkeygen` no puede devolver una clave poscuántica. Los flujos de enrolamiento por EST y por el device manager no tienen pruebas con claves poscuánticas."},{heading:"autoridad-de-certificación-y-validación",content:"El backend no evalúa la extensión de certificado relacionado. Solo la emite."},{heading:"dashboard",content:"El generador de claves SLH-DSA del navegador asigna los identificadores de conjunto de parámetros de forma distinta al resto de la interfaz, según se describe en Dashboard. Los nombres de los tipos de clave no son uniformes entre pantallas, y la interfaz no incluye aviso de carácter experimental ni traducción."},{heading:"compilación-y-despliegue",content:"Todo depende de forks de Go y de Traefik que no son los proyectos originales, y la imagen del proxy tiene una etiqueta mutable. La especificación OpenAPI del KMS del backend sigue listando solo RSA, ECDSA y Ed25519 y no refleja los nuevos tipos de clave."},{heading:"compilación-y-despliegue",content:"El Helm chart usa nombres de recurso fijos, admite una sola release por espacio de nombres y envía el tráfico de Traefik a Envoy sin verificar certificados. Los certificados poscuánticos que crea el instalador son válidos durante 365 días y no se renuevan. El instalador necesita un host Linux y ejecuta una instalación de Helm, no una actualización."},{heading:"compilación-y-despliegue",content:'<Card title="Visión general de la criptografía poscuántica" description="Volver al resumen de la sección." href="/docs/platform/pqc/overview" />'}],headings:[{id:"estándares-e-interoperabilidad",content:"Estándares e interoperabilidad"},{id:"claves-y-motores",content:"Claves y motores"},{id:"autoridad-de-certificación-y-validación",content:"Autoridad de certificación y validación"},{id:"dashboard",content:"Dashboard"},{id:"compilación-y-despliegue",content:"Compilación y despliegue"}]};const m=[{depth:2,url:"#estándares-e-interoperabilidad",title:e.jsx(e.Fragment,{children:"Estándares e interoperabilidad"})},{depth:2,url:"#claves-y-motores",title:e.jsx(e.Fragment,{children:"Claves y motores"})},{depth:2,url:"#autoridad-de-certificación-y-validación",title:e.jsx(e.Fragment,{children:"Autoridad de certificación y validación"})},{depth:2,url:"#dashboard",title:e.jsx(e.Fragment,{children:"Dashboard"})},{depth:2,url:"#compilación-y-despliegue",title:e.jsx(e.Fragment,{children:"Compilación y despliegue"})}];function s(o){const a={a:"a",code:"code",div:"div",h2:"h2",p:"p",...o.components},{Card:n,Cards:i}=a;return n||d("Card"),i||d("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.p,{children:"Esta página reúne los límites de la implementación actual para valorarlos antes de planificar un despliegue. Cada uno se ha observado en el código o en las pruebas de las ramas descritas en esta sección."})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.h2,{id:"estándares-e-interoperabilidad",children:"Estándares e interoperabilidad"})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(a.p,{children:["Los certificados composite se implementaron y se probaron contra el borrador 19 de la especificación de firmas composite del IETF, que desde entonces se ha publicado como RFC 10073; la implementación no se ha comparado con el texto final. Tres de sus algoritmos (las dos variantes Brainpool y Ed448) no están implementados. Los esquemas de firma composite en TLS usan puntos de código de uso privado de ",e.jsx(a.code,{children:"0xFE00"})," a ",e.jsx(a.code,{children:"0xFE0E"})," y en el código no se identifica ningún borrador ni versión publicados, por lo que solo interoperan con pares construidos con el mismo fork de Go. Las variantes composite con RSA PKCS#1 v1.5 no pueden autenticar un handshake TLS. SLH-DSA no tiene esquema de firma TLS. El atributo de solicitud de certificado relacionado no se ha contrastado con otras implementaciones del RFC 9763."]})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.h2,{id:"claves-y-motores",children:"Claves y motores"})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.p,{children:"Las claves poscuánticas, composite y Ed25519 funcionan solo con los motores filesystem y software. Los motores Vault KV2 y AWS Secrets Manager anuncian soporte y después fallan en la creación, y AWS KMS, Azure y PKCS#11 no las soportan. No existe, por tanto, ninguna clave poscuántica respaldada por hardware o por un KMS en la nube. Algunos mensajes de error de los motores están copiados de otros motores y nombran el motor equivocado."})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(a.p,{children:["La interfaz ",e.jsx(a.code,{children:"CryptoEngine"})," ha incorporado métodos para crear e importar cada nuevo tipo de clave. Los motores desarrollados fuera del repositorio de Lamassu deben implementarlos."]})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.h2,{id:"autoridad-de-certificación-y-validación",children:"Autoridad de certificación y validación"})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.p,{children:"Una CA con clave poscuántica, Ed25519 o composite no puede firmar respuestas OCSP, porque la biblioteca de firma solo admite RSA y ECDSA. Se espera que la generación de CRL funcione, ya que usa la firma del fork, pero ni CRL ni OCSP tienen pruebas con estas claves."})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.p,{children:"Los perfiles de emisión no pueden permitir ni denegar algoritmos poscuánticos; su aplicación de restricciones afecta solo a RSA y ECDSA. La fortaleza de clave de un certificado emitido solo se calcula para RSA y ECDSA, por lo que los demás certificados se almacenan con tipo y tamaño desconocidos y fortaleza baja. No está soportada la importación de una CA existente con clave SLH-DSA o composite."})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(a.p,{children:["El DMS solo puede generar claves en el servidor para RSA y ECDSA, de modo que ",e.jsx(a.code,{children:"serverkeygen"})," no puede devolver una clave poscuántica. Los flujos de enrolamiento por EST y por el device manager no tienen pruebas con claves poscuánticas."]})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.p,{children:"El backend no evalúa la extensión de certificado relacionado. Solo la emite."})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.h2,{id:"dashboard",children:"Dashboard"})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(a.p,{children:["El generador de claves SLH-DSA del navegador asigna los identificadores de conjunto de parámetros de forma distinta al resto de la interfaz, según se describe en ",e.jsx(a.a,{href:"/docs/platform/pqc/dashboard",children:"Dashboard"}),". Los nombres de los tipos de clave no son uniformes entre pantallas, y la interfaz no incluye aviso de carácter experimental ni traducción."]})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.h2,{id:"compilación-y-despliegue",children:"Compilación y despliegue"})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.p,{children:"Todo depende de forks de Go y de Traefik que no son los proyectos originales, y la imagen del proxy tiene una etiqueta mutable. La especificación OpenAPI del KMS del backend sigue listando solo RSA, ECDSA y Ed25519 y no refleja los nuevos tipos de clave."})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.p,{children:"El Helm chart usa nombres de recurso fijos, admite una sola release por espacio de nombres y envía el tráfico de Traefik a Envoy sin verificar certificados. Los certificados poscuánticos que crea el instalador son válidos durante 365 días y no se renuevan. El instalador necesita un host Linux y ejecuta una instalación de Helm, no una actualización."})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i,{children:e.jsx(n,{title:"Visión general de la criptografía poscuántica",description:"Volver al resumen de la sección.",href:"/docs/platform/pqc/overview"})})})]})}function p(o={}){const{wrapper:a}=o.components||{};return a?e.jsx(a,{...o,children:e.jsx(s,{...o})}):s(o)}function d(o,a){throw new Error("Expected component `"+o+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,_markdown:r,default:p,frontmatter:l,lmDiff:c,structuredData:t,toc:m},Symbol.toStringTag,{value:"Module"}));export{u as _};
