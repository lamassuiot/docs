import{j as e}from"./index-DqgIL_Rv.js";let d=`

<div className="lm-diff-ins lm-diff-block">
  Lamassu puede crear claves, autoridades de certificación (CA) y certificados que usan algoritmos de firma poscuánticos, y puede servirlos y verificarlos por TLS. El trabajo abarca cinco bases de código que dependen unas de otras: un fork del toolchain de Go que implementa los algoritmos, el backend de Lamassu, el dashboard web, un fork del proxy Traefik que termina el TLS de los dispositivos y el Helm chart que despliega todo junto.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="warn" title="Experimental">
    El soporte PQC reside en ramas de desarrollo y en forks de Go y Traefik, no en los proyectos originales ni en las imágenes estándar de Lamassu. Los esquemas de firma TLS composite usan puntos de código de uso privado que ninguna otra pila TLS reconoce, y el formato de certificado composite sigue un borrador del IETF que todavía puede cambiar. Conviene planificar pilotos y despliegues de laboratorio, no flotas en producción. [Limitaciones conocidas](/docs/platform/pqc/limitations) recoge lo que está incompleto.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  Por qué importa en flotas de dispositivos [#por-qué-importa-en-flotas-de-dispositivos]
</div>

<div className="lm-diff-ins lm-diff-block">
  Los certificados emitidos a dispositivos suelen durar años, y los dispositivos que los almacenan son difíciles de sustituir. Un algoritmo de firma que un futuro ordenador cuántico llegase a romper obligaría a re-enrolar toda la flota. Emitir hoy certificados firmados con un algoritmo poscuántico o composite, y ofrecer un endpoint TLS que los acepte, permite validar la flota frente a ese riesgo antes de que sea urgente. Las firmas no están expuestas a ataques de tipo «almacenar ahora, descifrar después» como lo está un intercambio de claves, por lo que la urgencia depende de la vida útil de los certificados y de los dispositivos, no del tráfico registrado.
</div>

<div className="lm-diff-ins lm-diff-block">
  Tres familias de algoritmos [#tres-familias-de-algoritmos]
</div>

<div className="lm-diff-ins lm-diff-block">
  Lamassu agrupa los algoritmos de firma en tres familias, con las mismas etiquetas que muestra el dashboard.
</div>

<div className="lm-diff-ins lm-diff-block">
  | Etiqueta | Familia             | Algoritmos                                                                     |
  | -------- | ------------------- | ------------------------------------------------------------------------------ |
  | **T**    | Tradicional         | RSA, ECDSA, Ed25519                                                            |
  | **PQ**   | Poscuántica pura    | ML-DSA, SLH-DSA                                                                |
  | **PQ/T** | Híbrida (composite) | ML-DSA combinado con RSA, ECDSA o Ed25519 en una única clave y una única firma |
</div>

<div className="lm-diff-ins lm-diff-block">
  Una firma composite solo es válida si se verifican sus dos componentes. Está pensada para que no sea falsificable mientras al menos uno de los dos algoritmos siga sin romperse, siempre que la parte que confía exija el composite y no recurra a un certificado clásico. En el intercambio de claves, \`PQ/T\` significa un grupo híbrido que combina un intercambio clásico y uno ML-KEM, y \`PQ\` significa ML-KEM puro. [Algoritmos](/docs/platform/pqc/algorithms) describe cada uno y los conjuntos de parámetros que Lamassu acepta.
</div>

<div className="lm-diff-ins lm-diff-block">
  Cómo encajan las piezas [#cómo-encajan-las-piezas]
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  flowchart LR
      GO["Fork de Go PQC<br/>(algoritmos, x509, TLS)"]
      BE["Backend de Lamassu<br/>(KMS, CA, VA)"]
      UI["Dashboard"]
      TR["Fork de Traefik PQC<br/>(TLS hacia dispositivos)"]
      HC["Helm chart"]
      DEV["Dispositivo"]
      ENV["Envoy Gateway<br/>(TLS clásico)"]
      GO --> BE
      GO --> TR
      UI -->|API REST| BE
      DEV -->|"TLS / mTLS (T, PQ o PQ/T)"| TR
      TR -->|"TLS (clásico)"| ENV
      ENV --> BE
      HC -. despliega .-> BE
      HC -. despliega .-> TR
      HC -. despliega .-> ENV
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  El fork de Go es la base: el backend y Traefik se compilan con él, porque el toolchain estándar de Go no incluye el soporte de certificados composite y SLH-DSA. El backend crea y custodia las claves, emite certificados y firma los datos de revocación. El dashboard usa la misma API REST. Los dispositivos llegan a la plataforma a través de Traefik, que negocia con ellos la autenticación y el intercambio de claves poscuánticos y después reenvía la petición a Envoy Gateway mediante TLS ordinario. La protección poscuántica se aplica, por tanto, solo al salto entre el dispositivo y Traefik.
</div>

<div className="lm-diff-ins lm-diff-block">
  Por dónde continuar [#por-dónde-continuar]
</div>

<div className="lm-diff-ins lm-diff-block">
  Conviene leer primero [Algoritmos](/docs/platform/pqc/algorithms) para conocer qué se soporta y cómo se escriben los conjuntos de parámetros en las peticiones a la API. Quien desarrolle un cliente de dispositivo debe seguir con [Toolchain de Go PQC](/docs/platform/pqc/go-toolchain). Para crear una CA poscuántica, el camino es [Claves y autoridades de certificación](/docs/platform/pqc/keys-and-cas), y quien despliegue la plataforma consultará [Despliegue con el Helm chart](/docs/platform/pqc/deployment).
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Algoritmos" description="ML-DSA, SLH-DSA y los 15 algoritmos composite, con sus conjuntos de parámetros." href="/docs/platform/pqc/algorithms" />

    <Card title="Claves y autoridades de certificación" description="Crear claves y CA poscuánticas y emitir certificados mediante la API." href="/docs/platform/pqc/keys-and-cas" />

    <Card title="Despliegue con el Helm chart" description="Instalar la plataforma con un proxy Traefik que sirve certificados PQC." href="/docs/platform/pqc/deployment" />
  </Cards>
</div>
`,t={title:"Visión general de la criptografía poscuántica",description:"Qué soporte poscuántico (PQC) añade Lamassu a las claves, las autoridades de certificación, el TLS de los dispositivos y el despliegue, y cómo encajan sus piezas."},c={isNew:!0,changes:14,title:void 0,description:void 0},m={contents:[{heading:void 0,content:"Lamassu puede crear claves, autoridades de certificación (CA) y certificados que usan algoritmos de firma poscuánticos, y puede servirlos y verificarlos por TLS. El trabajo abarca cinco bases de código que dependen unas de otras: un fork del toolchain de Go que implementa los algoritmos, el backend de Lamassu, el dashboard web, un fork del proxy Traefik que termina el TLS de los dispositivos y el Helm chart que despliega todo junto."},{heading:void 0,content:"El soporte PQC reside en ramas de desarrollo y en forks de Go y Traefik, no en los proyectos originales ni en las imágenes estándar de Lamassu. Los esquemas de firma TLS composite usan puntos de código de uso privado que ninguna otra pila TLS reconoce, y el formato de certificado composite sigue un borrador del IETF que todavía puede cambiar. Conviene planificar pilotos y despliegues de laboratorio, no flotas en producción. Limitaciones conocidas recoge lo que está incompleto."},{heading:"por-qué-importa-en-flotas-de-dispositivos",content:"Los certificados emitidos a dispositivos suelen durar años, y los dispositivos que los almacenan son difíciles de sustituir. Un algoritmo de firma que un futuro ordenador cuántico llegase a romper obligaría a re-enrolar toda la flota. Emitir hoy certificados firmados con un algoritmo poscuántico o composite, y ofrecer un endpoint TLS que los acepte, permite validar la flota frente a ese riesgo antes de que sea urgente. Las firmas no están expuestas a ataques de tipo «almacenar ahora, descifrar después» como lo está un intercambio de claves, por lo que la urgencia depende de la vida útil de los certificados y de los dispositivos, no del tráfico registrado."},{heading:"tres-familias-de-algoritmos",content:"Lamassu agrupa los algoritmos de firma en tres familias, con las mismas etiquetas que muestra el dashboard."},{heading:"tres-familias-de-algoritmos",content:"Etiqueta"},{heading:"tres-familias-de-algoritmos",content:"Familia"},{heading:"tres-familias-de-algoritmos",content:"Algoritmos"},{heading:"tres-familias-de-algoritmos",content:"**T**"},{heading:"tres-familias-de-algoritmos",content:"Tradicional"},{heading:"tres-familias-de-algoritmos",content:"RSA, ECDSA, Ed25519"},{heading:"tres-familias-de-algoritmos",content:"**PQ**"},{heading:"tres-familias-de-algoritmos",content:"Poscuántica pura"},{heading:"tres-familias-de-algoritmos",content:"ML-DSA, SLH-DSA"},{heading:"tres-familias-de-algoritmos",content:"**PQ/T**"},{heading:"tres-familias-de-algoritmos",content:"Híbrida (composite)"},{heading:"tres-familias-de-algoritmos",content:"ML-DSA combinado con RSA, ECDSA o Ed25519 en una única clave y una única firma"},{heading:"tres-familias-de-algoritmos",content:"Una firma composite solo es válida si se verifican sus dos componentes. Está pensada para que no sea falsificable mientras al menos uno de los dos algoritmos siga sin romperse, siempre que la parte que confía exija el composite y no recurra a un certificado clásico. En el intercambio de claves, `PQ/T` significa un grupo híbrido que combina un intercambio clásico y uno ML-KEM, y `PQ` significa ML-KEM puro. Algoritmos describe cada uno y los conjuntos de parámetros que Lamassu acepta."},{heading:"cómo-encajan-las-piezas",content:"El fork de Go es la base: el backend y Traefik se compilan con él, porque el toolchain estándar de Go no incluye el soporte de certificados composite y SLH-DSA. El backend crea y custodia las claves, emite certificados y firma los datos de revocación. El dashboard usa la misma API REST. Los dispositivos llegan a la plataforma a través de Traefik, que negocia con ellos la autenticación y el intercambio de claves poscuánticos y después reenvía la petición a Envoy Gateway mediante TLS ordinario. La protección poscuántica se aplica, por tanto, solo al salto entre el dispositivo y Traefik."},{heading:"por-dónde-continuar",content:"Conviene leer primero Algoritmos para conocer qué se soporta y cómo se escriben los conjuntos de parámetros en las peticiones a la API. Quien desarrolle un cliente de dispositivo debe seguir con Toolchain de Go PQC. Para crear una CA poscuántica, el camino es Claves y autoridades de certificación, y quien despliegue la plataforma consultará Despliegue con el Helm chart."},{heading:"por-dónde-continuar",content:'<Card title="Algoritmos" description="ML-DSA, SLH-DSA y los 15 algoritmos composite, con sus conjuntos de parámetros." href="/docs/platform/pqc/algorithms" />'},{heading:"por-dónde-continuar",content:'<Card title="Claves y autoridades de certificación" description="Crear claves y CA poscuánticas y emitir certificados mediante la API." href="/docs/platform/pqc/keys-and-cas" />'},{heading:"por-dónde-continuar",content:'<Card title="Despliegue con el Helm chart" description="Instalar la plataforma con un proxy Traefik que sirve certificados PQC." href="/docs/platform/pqc/deployment" />'}],headings:[{id:"por-qué-importa-en-flotas-de-dispositivos",content:"Por qué importa en flotas de dispositivos"},{id:"tres-familias-de-algoritmos",content:"Tres familias de algoritmos"},{id:"cómo-encajan-las-piezas",content:"Cómo encajan las piezas"},{id:"por-dónde-continuar",content:"Por dónde continuar"}]};const p=[{depth:2,url:"#por-qué-importa-en-flotas-de-dispositivos",title:e.jsx(e.Fragment,{children:"Por qué importa en flotas de dispositivos"})},{depth:2,url:"#tres-familias-de-algoritmos",title:e.jsx(e.Fragment,{children:"Tres familias de algoritmos"})},{depth:2,url:"#cómo-encajan-las-piezas",title:e.jsx(e.Fragment,{children:"Cómo encajan las piezas"})},{depth:2,url:"#por-dónde-continuar",title:e.jsx(e.Fragment,{children:"Por dónde continuar"})}];function r(a){const i={a:"a",code:"code",div:"div",h2:"h2",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...a.components},{Callout:n,Card:s,Cards:l}=i;return n||o("Callout"),s||o("Card"),l||o("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Lamassu puede crear claves, autoridades de certificación (CA) y certificados que usan algoritmos de firma poscuánticos, y puede servirlos y verificarlos por TLS. El trabajo abarca cinco bases de código que dependen unas de otras: un fork del toolchain de Go que implementa los algoritmos, el backend de Lamassu, el dashboard web, un fork del proxy Traefik que termina el TLS de los dispositivos y el Helm chart que despliega todo junto."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n,{type:"warn",title:"Experimental",children:e.jsxs(i.p,{children:["El soporte PQC reside en ramas de desarrollo y en forks de Go y Traefik, no en los proyectos originales ni en las imágenes estándar de Lamassu. Los esquemas de firma TLS composite usan puntos de código de uso privado que ninguna otra pila TLS reconoce, y el formato de certificado composite sigue un borrador del IETF que todavía puede cambiar. Conviene planificar pilotos y despliegues de laboratorio, no flotas en producción. ",e.jsx(i.a,{href:"/docs/platform/pqc/limitations",children:"Limitaciones conocidas"})," recoge lo que está incompleto."]})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"por-qué-importa-en-flotas-de-dispositivos",children:"Por qué importa en flotas de dispositivos"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Los certificados emitidos a dispositivos suelen durar años, y los dispositivos que los almacenan son difíciles de sustituir. Un algoritmo de firma que un futuro ordenador cuántico llegase a romper obligaría a re-enrolar toda la flota. Emitir hoy certificados firmados con un algoritmo poscuántico o composite, y ofrecer un endpoint TLS que los acepte, permite validar la flota frente a ese riesgo antes de que sea urgente. Las firmas no están expuestas a ataques de tipo «almacenar ahora, descifrar después» como lo está un intercambio de claves, por lo que la urgencia depende de la vida útil de los certificados y de los dispositivos, no del tráfico registrado."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"tres-familias-de-algoritmos",children:"Tres familias de algoritmos"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Lamassu agrupa los algoritmos de firma en tres familias, con las mismas etiquetas que muestra el dashboard."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Etiqueta"}),e.jsx(i.th,{children:"Familia"}),e.jsx(i.th,{children:"Algoritmos"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"T"})}),e.jsx(i.td,{children:"Tradicional"}),e.jsx(i.td,{children:"RSA, ECDSA, Ed25519"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"PQ"})}),e.jsx(i.td,{children:"Poscuántica pura"}),e.jsx(i.td,{children:"ML-DSA, SLH-DSA"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"PQ/T"})}),e.jsx(i.td,{children:"Híbrida (composite)"}),e.jsx(i.td,{children:"ML-DSA combinado con RSA, ECDSA o Ed25519 en una única clave y una única firma"})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Una firma composite solo es válida si se verifican sus dos componentes. Está pensada para que no sea falsificable mientras al menos uno de los dos algoritmos siga sin romperse, siempre que la parte que confía exija el composite y no recurra a un certificado clásico. En el intercambio de claves, ",e.jsx(i.code,{children:"PQ/T"})," significa un grupo híbrido que combina un intercambio clásico y uno ML-KEM, y ",e.jsx(i.code,{children:"PQ"})," significa ML-KEM puro. ",e.jsx(i.a,{href:"/docs/platform/pqc/algorithms",children:"Algoritmos"})," describe cada uno y los conjuntos de parámetros que Lamassu acepta."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"cómo-encajan-las-piezas",children:"Cómo encajan las piezas"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"flowchart LR"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'    GO["Fork de Go PQC<br/>(algoritmos, x509, TLS)"]'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'    BE["Backend de Lamassu<br/>(KMS, CA, VA)"]'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'    UI["Dashboard"]'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'    TR["Fork de Traefik PQC<br/>(TLS hacia dispositivos)"]'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'    HC["Helm chart"]'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'    DEV["Dispositivo"]'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'    ENV["Envoy Gateway<br/>(TLS clásico)"]'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    GO --> BE"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    GO --> TR"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    UI -->|API REST| BE"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'    DEV -->|"TLS / mTLS (T, PQ o PQ/T)"| TR'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'    TR -->|"TLS (clásico)"| ENV'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    ENV --> BE"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    HC -. despliega .-> BE"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    HC -. despliega .-> TR"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    HC -. despliega .-> ENV"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"El fork de Go es la base: el backend y Traefik se compilan con él, porque el toolchain estándar de Go no incluye el soporte de certificados composite y SLH-DSA. El backend crea y custodia las claves, emite certificados y firma los datos de revocación. El dashboard usa la misma API REST. Los dispositivos llegan a la plataforma a través de Traefik, que negocia con ellos la autenticación y el intercambio de claves poscuánticos y después reenvía la petición a Envoy Gateway mediante TLS ordinario. La protección poscuántica se aplica, por tanto, solo al salto entre el dispositivo y Traefik."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"por-dónde-continuar",children:"Por dónde continuar"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Conviene leer primero ",e.jsx(i.a,{href:"/docs/platform/pqc/algorithms",children:"Algoritmos"})," para conocer qué se soporta y cómo se escriben los conjuntos de parámetros en las peticiones a la API. Quien desarrolle un cliente de dispositivo debe seguir con ",e.jsx(i.a,{href:"/docs/platform/pqc/go-toolchain",children:"Toolchain de Go PQC"}),". Para crear una CA poscuántica, el camino es ",e.jsx(i.a,{href:"/docs/platform/pqc/keys-and-cas",children:"Claves y autoridades de certificación"}),", y quien despliegue la plataforma consultará ",e.jsx(i.a,{href:"/docs/platform/pqc/deployment",children:"Despliegue con el Helm chart"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(l,{children:[e.jsx(s,{title:"Algoritmos",description:"ML-DSA, SLH-DSA y los 15 algoritmos composite, con sus conjuntos de parámetros.",href:"/docs/platform/pqc/algorithms"}),e.jsx(s,{title:"Claves y autoridades de certificación",description:"Crear claves y CA poscuánticas y emitir certificados mediante la API.",href:"/docs/platform/pqc/keys-and-cas"}),e.jsx(s,{title:"Despliegue con el Helm chart",description:"Instalar la plataforma con un proxy Traefik que sirve certificados PQC.",href:"/docs/platform/pqc/deployment"})]})})]})}function u(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(r,{...a})}):r(a)}function o(a,i){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}const h=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:u,frontmatter:t,lmDiff:c,structuredData:m,toc:p},Symbol.toStringTag,{value:"Module"}));export{h as _};
