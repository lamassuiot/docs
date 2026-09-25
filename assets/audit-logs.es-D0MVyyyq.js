import{j as e}from"./index-prc0XQdj.js";let s=`

Lamassu instrumenta las operaciones mutables de sus servicios con eventos de auditoría. Cada evento describe la operación, los principales que coincidieron, la entrada, el resultado y si terminó con error.

Qué contiene un evento [#qué-contiene-un-evento]

El cuerpo de auditoría incluye:

* <code>input</code>: datos recibidos por la operación;
* <code>has\\_error</code>: indica si el servicio devolvió un error;
* <code>output</code>: resultado producido o mensaje de error;
* <code>principals</code>: identificadores de los principales que coincidieron con la petición.

Las operaciones correctas usan un tipo con prefijo <code>audit.</code>. Los fallos publican el tipo de operación con sufijo <code>.error</code>. El evento CloudEvents añade, además, fuente, identificador, fecha y tipo.

<Callout type="info" title="Se auditan también los intentos fallidos">
  Los middlewares publican el registro después de ejecutar la operación, tanto si tuvo éxito como si devolvió un error. Esto permite investigar intentos además de cambios confirmados.
</Callout>

Cobertura [#cobertura]

El backend aplica auditoría a mutaciones de:

* autoridades, certificados y perfiles de emisión;
* claves y motores KMS;
* dispositivos e identidades;
* DMS y operaciones de enrolamiento;
* funciones de validación y CRL;
* principales, políticas y concesiones de autorización.

No confundas estos eventos con los eventos de dominio. Un evento de dominio comunica que un recurso cambió para que otro componente reaccione; el evento de auditoría conserva contexto de entrada, salida y principal para investigación.

Publicación y persistencia [#publicación-y-persistencia]

Los servicios publican auditoría en el bus de eventos cuando su PublisherEventBus está habilitado. El código del backend no implementa un archivo de auditoría consultable y durable por sí solo.

<Callout type="warn" title="El bus no sustituye a un archivo de cumplimiento">
  Si necesitas retención, búsquedas, protección contra alteraciones o exportación regulatoria, conecta un consumidor que persista los eventos en el sistema aprobado por tu organización.
</Callout>

Diseña el consumidor para:

* suscribirse a los tipos <code>audit.#</code> y también a los tipos de operación terminados en <code>.error</code>;
* conservar el CloudEvent completo sin modificar;
* registrar el momento de ingestión y detectar duplicados por ID;
* cifrar en tránsito y en reposo;
* limitar lectura y borrado a un rol separado del operador de PKI;
* aplicar una política explícita de retención y legal hold;
* alertar si deja de consumir o aumenta la cola pendiente.

Datos sensibles [#datos-sensibles]

Los campos input y output pueden contener sujetos, metadatos, material público, configuración o mensajes de error. Evalúa su clasificación antes de enviarlos a una plataforma externa.

No registres claves privadas, secretos de proveedores ni tokens completos en automatizaciones que rodean a Lamassu. Restringe la exportación y aplica redacción en el destino sin destruir los campos necesarios para atribución.

Una investigación reproducible [#una-investigación-reproducible]

<Steps>
  <Step>
    Acota el intervalo [#acota-el-intervalo]

    Parte de la hora reportada y normaliza todas las fuentes a UTC.
  </Step>

  <Step>
    Identifica la operación [#identifica-la-operación]

    Filtra por tipo de evento, fuente de servicio e identificador del recurso.
  </Step>

  <Step>
    Atribuye el principal [#atribuye-el-principal]

    Revisa principals y correlaciónalo con el proveedor OIDC o la identidad X.509 vigente en ese momento.
  </Step>

  <Step>
    Compara intención y resultado [#compara-intención-y-resultado]

    Contrasta input, has\\_error y output. Un intento fallido no implica que el recurso haya cambiado.
  </Step>

  <Step>
    Sigue el efecto [#sigue-el-efecto]

    Busca los eventos de dominio y registros del servicio que compartan recurso y ventana temporal. En una revocación de CA, incluye las operaciones en cascada.
  </Step>
</Steps>

Verificación periódica [#verificación-periódica]

Genera una mutación controlada en un entorno de prueba y comprueba que:

1. aparece un evento de auditoría correcto;
2. el principal coincide con la identidad utilizada;
3. el consumidor lo persiste una sola vez;
4. puede recuperarse por recurso, actor y periodo;
5. una interrupción del consumidor produce una alerta.

Para métricas, trazas y logs técnicos del despliegue, consulta [Resolución de problemas](/docs/platform/pki/troubleshooting). La auditoría responde a “quién intentó cambiar qué”; la observabilidad explica cómo se comportó el sistema.
`,d={title:"Registros de auditoría",description:"Entiende qué eventos de auditoría genera Lamassu y cómo convertirlos en una pista durable."},l={contents:[{heading:void 0,content:"Lamassu instrumenta las operaciones mutables de sus servicios con eventos de auditoría. Cada evento describe la operación, los principales que coincidieron, la entrada, el resultado y si terminó con error."},{heading:"qué-contiene-un-evento",content:"El cuerpo de auditoría incluye:"},{heading:"qué-contiene-un-evento",content:"input: datos recibidos por la operación;"},{heading:"qué-contiene-un-evento",content:"has\\_error: indica si el servicio devolvió un error;"},{heading:"qué-contiene-un-evento",content:"output: resultado producido o mensaje de error;"},{heading:"qué-contiene-un-evento",content:"principals: identificadores de los principales que coincidieron con la petición."},{heading:"qué-contiene-un-evento",content:"Las operaciones correctas usan un tipo con prefijo audit.. Los fallos publican el tipo de operación con sufijo .error. El evento CloudEvents añade, además, fuente, identificador, fecha y tipo."},{heading:"qué-contiene-un-evento",content:"Los middlewares publican el registro después de ejecutar la operación, tanto si tuvo éxito como si devolvió un error. Esto permite investigar intentos además de cambios confirmados."},{heading:"cobertura",content:"El backend aplica auditoría a mutaciones de:"},{heading:"cobertura",content:"autoridades, certificados y perfiles de emisión;"},{heading:"cobertura",content:"claves y motores KMS;"},{heading:"cobertura",content:"dispositivos e identidades;"},{heading:"cobertura",content:"DMS y operaciones de enrolamiento;"},{heading:"cobertura",content:"funciones de validación y CRL;"},{heading:"cobertura",content:"principales, políticas y concesiones de autorización."},{heading:"cobertura",content:"No confundas estos eventos con los eventos de dominio. Un evento de dominio comunica que un recurso cambió para que otro componente reaccione; el evento de auditoría conserva contexto de entrada, salida y principal para investigación."},{heading:"publicación-y-persistencia",content:"Los servicios publican auditoría en el bus de eventos cuando su PublisherEventBus está habilitado. El código del backend no implementa un archivo de auditoría consultable y durable por sí solo."},{heading:"publicación-y-persistencia",content:"Si necesitas retención, búsquedas, protección contra alteraciones o exportación regulatoria, conecta un consumidor que persista los eventos en el sistema aprobado por tu organización."},{heading:"publicación-y-persistencia",content:"Diseña el consumidor para:"},{heading:"publicación-y-persistencia",content:"suscribirse a los tipos audit.# y también a los tipos de operación terminados en .error;"},{heading:"publicación-y-persistencia",content:"conservar el CloudEvent completo sin modificar;"},{heading:"publicación-y-persistencia",content:"registrar el momento de ingestión y detectar duplicados por ID;"},{heading:"publicación-y-persistencia",content:"cifrar en tránsito y en reposo;"},{heading:"publicación-y-persistencia",content:"limitar lectura y borrado a un rol separado del operador de PKI;"},{heading:"publicación-y-persistencia",content:"aplicar una política explícita de retención y legal hold;"},{heading:"publicación-y-persistencia",content:"alertar si deja de consumir o aumenta la cola pendiente."},{heading:"datos-sensibles",content:"Los campos input y output pueden contener sujetos, metadatos, material público, configuración o mensajes de error. Evalúa su clasificación antes de enviarlos a una plataforma externa."},{heading:"datos-sensibles",content:"No registres claves privadas, secretos de proveedores ni tokens completos en automatizaciones que rodean a Lamassu. Restringe la exportación y aplica redacción en el destino sin destruir los campos necesarios para atribución."},{heading:"acota-el-intervalo",content:"Parte de la hora reportada y normaliza todas las fuentes a UTC."},{heading:"identifica-la-operación",content:"Filtra por tipo de evento, fuente de servicio e identificador del recurso."},{heading:"atribuye-el-principal",content:"Revisa principals y correlaciónalo con el proveedor OIDC o la identidad X.509 vigente en ese momento."},{heading:"compara-intención-y-resultado",content:"Contrasta input, has\\_error y output. Un intento fallido no implica que el recurso haya cambiado."},{heading:"sigue-el-efecto",content:"Busca los eventos de dominio y registros del servicio que compartan recurso y ventana temporal. En una revocación de CA, incluye las operaciones en cascada."},{heading:"verificación-periódica",content:"Genera una mutación controlada en un entorno de prueba y comprueba que:"},{heading:"verificación-periódica",content:"aparece un evento de auditoría correcto;"},{heading:"verificación-periódica",content:"el principal coincide con la identidad utilizada;"},{heading:"verificación-periódica",content:"el consumidor lo persiste una sola vez;"},{heading:"verificación-periódica",content:"puede recuperarse por recurso, actor y periodo;"},{heading:"verificación-periódica",content:"una interrupción del consumidor produce una alerta."},{heading:"verificación-periódica",content:"Para métricas, trazas y logs técnicos del despliegue, consulta Resolución de problemas. La auditoría responde a “quién intentó cambiar qué”; la observabilidad explica cómo se comportó el sistema."}],headings:[{id:"qué-contiene-un-evento",content:"Qué contiene un evento"},{id:"cobertura",content:"Cobertura"},{id:"publicación-y-persistencia",content:"Publicación y persistencia"},{id:"datos-sensibles",content:"Datos sensibles"},{id:"una-investigación-reproducible",content:"Una investigación reproducible"},{id:"acota-el-intervalo",content:"Acota el intervalo"},{id:"identifica-la-operación",content:"Identifica la operación"},{id:"atribuye-el-principal",content:"Atribuye el principal"},{id:"compara-intención-y-resultado",content:"Compara intención y resultado"},{id:"sigue-el-efecto",content:"Sigue el efecto"},{id:"verificación-periódica",content:"Verificación periódica"}]};const u=[{depth:2,url:"#qué-contiene-un-evento",title:e.jsx(e.Fragment,{children:"Qué contiene un evento"})},{depth:2,url:"#cobertura",title:e.jsx(e.Fragment,{children:"Cobertura"})},{depth:2,url:"#publicación-y-persistencia",title:e.jsx(e.Fragment,{children:"Publicación y persistencia"})},{depth:2,url:"#datos-sensibles",title:e.jsx(e.Fragment,{children:"Datos sensibles"})},{depth:2,url:"#una-investigación-reproducible",title:e.jsx(e.Fragment,{children:"Una investigación reproducible"})},{depth:3,url:"#acota-el-intervalo",title:e.jsx(e.Fragment,{children:"Acota el intervalo"})},{depth:3,url:"#identifica-la-operación",title:e.jsx(e.Fragment,{children:"Identifica la operación"})},{depth:3,url:"#atribuye-el-principal",title:e.jsx(e.Fragment,{children:"Atribuye el principal"})},{depth:3,url:"#compara-intención-y-resultado",title:e.jsx(e.Fragment,{children:"Compara intención y resultado"})},{depth:3,url:"#sigue-el-efecto",title:e.jsx(e.Fragment,{children:"Sigue el efecto"})},{depth:2,url:"#verificación-periódica",title:e.jsx(e.Fragment,{children:"Verificación periódica"})}];function c(i){const n={a:"a",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",ul:"ul",...i.components},{Callout:o,Step:a,Steps:t}=n;return o||r("Callout"),a||r("Step"),t||r("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"Lamassu instrumenta las operaciones mutables de sus servicios con eventos de auditoría. Cada evento describe la operación, los principales que coincidieron, la entrada, el resultado y si terminó con error."}),`
`,e.jsx(n.h2,{id:"qué-contiene-un-evento",children:"Qué contiene un evento"}),`
`,e.jsx(n.p,{children:"El cuerpo de auditoría incluye:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx("code",{children:"input"}),": datos recibidos por la operación;"]}),`
`,e.jsxs(n.li,{children:[e.jsx("code",{children:"has_error"}),": indica si el servicio devolvió un error;"]}),`
`,e.jsxs(n.li,{children:[e.jsx("code",{children:"output"}),": resultado producido o mensaje de error;"]}),`
`,e.jsxs(n.li,{children:[e.jsx("code",{children:"principals"}),": identificadores de los principales que coincidieron con la petición."]}),`
`]}),`
`,e.jsxs(n.p,{children:["Las operaciones correctas usan un tipo con prefijo ",e.jsx("code",{children:"audit."}),". Los fallos publican el tipo de operación con sufijo ",e.jsx("code",{children:".error"}),". El evento CloudEvents añade, además, fuente, identificador, fecha y tipo."]}),`
`,e.jsx(o,{type:"info",title:"Se auditan también los intentos fallidos",children:e.jsx(n.p,{children:"Los middlewares publican el registro después de ejecutar la operación, tanto si tuvo éxito como si devolvió un error. Esto permite investigar intentos además de cambios confirmados."})}),`
`,e.jsx(n.h2,{id:"cobertura",children:"Cobertura"}),`
`,e.jsx(n.p,{children:"El backend aplica auditoría a mutaciones de:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"autoridades, certificados y perfiles de emisión;"}),`
`,e.jsx(n.li,{children:"claves y motores KMS;"}),`
`,e.jsx(n.li,{children:"dispositivos e identidades;"}),`
`,e.jsx(n.li,{children:"DMS y operaciones de enrolamiento;"}),`
`,e.jsx(n.li,{children:"funciones de validación y CRL;"}),`
`,e.jsx(n.li,{children:"principales, políticas y concesiones de autorización."}),`
`]}),`
`,e.jsx(n.p,{children:"No confundas estos eventos con los eventos de dominio. Un evento de dominio comunica que un recurso cambió para que otro componente reaccione; el evento de auditoría conserva contexto de entrada, salida y principal para investigación."}),`
`,e.jsx(n.h2,{id:"publicación-y-persistencia",children:"Publicación y persistencia"}),`
`,e.jsx(n.p,{children:"Los servicios publican auditoría en el bus de eventos cuando su PublisherEventBus está habilitado. El código del backend no implementa un archivo de auditoría consultable y durable por sí solo."}),`
`,e.jsx(o,{type:"warn",title:"El bus no sustituye a un archivo de cumplimiento",children:e.jsx(n.p,{children:"Si necesitas retención, búsquedas, protección contra alteraciones o exportación regulatoria, conecta un consumidor que persista los eventos en el sistema aprobado por tu organización."})}),`
`,e.jsx(n.p,{children:"Diseña el consumidor para:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["suscribirse a los tipos ",e.jsx("code",{children:"audit.#"})," y también a los tipos de operación terminados en ",e.jsx("code",{children:".error"}),";"]}),`
`,e.jsx(n.li,{children:"conservar el CloudEvent completo sin modificar;"}),`
`,e.jsx(n.li,{children:"registrar el momento de ingestión y detectar duplicados por ID;"}),`
`,e.jsx(n.li,{children:"cifrar en tránsito y en reposo;"}),`
`,e.jsx(n.li,{children:"limitar lectura y borrado a un rol separado del operador de PKI;"}),`
`,e.jsx(n.li,{children:"aplicar una política explícita de retención y legal hold;"}),`
`,e.jsx(n.li,{children:"alertar si deja de consumir o aumenta la cola pendiente."}),`
`]}),`
`,e.jsx(n.h2,{id:"datos-sensibles",children:"Datos sensibles"}),`
`,e.jsx(n.p,{children:"Los campos input y output pueden contener sujetos, metadatos, material público, configuración o mensajes de error. Evalúa su clasificación antes de enviarlos a una plataforma externa."}),`
`,e.jsx(n.p,{children:"No registres claves privadas, secretos de proveedores ni tokens completos en automatizaciones que rodean a Lamassu. Restringe la exportación y aplica redacción en el destino sin destruir los campos necesarios para atribución."}),`
`,e.jsx(n.h2,{id:"una-investigación-reproducible",children:"Una investigación reproducible"}),`
`,e.jsxs(t,{children:[e.jsxs(a,{children:[e.jsx(n.h3,{id:"acota-el-intervalo",children:"Acota el intervalo"}),e.jsx(n.p,{children:"Parte de la hora reportada y normaliza todas las fuentes a UTC."})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"identifica-la-operación",children:"Identifica la operación"}),e.jsx(n.p,{children:"Filtra por tipo de evento, fuente de servicio e identificador del recurso."})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"atribuye-el-principal",children:"Atribuye el principal"}),e.jsx(n.p,{children:"Revisa principals y correlaciónalo con el proveedor OIDC o la identidad X.509 vigente en ese momento."})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"compara-intención-y-resultado",children:"Compara intención y resultado"}),e.jsx(n.p,{children:"Contrasta input, has_error y output. Un intento fallido no implica que el recurso haya cambiado."})]}),e.jsxs(a,{children:[e.jsx(n.h3,{id:"sigue-el-efecto",children:"Sigue el efecto"}),e.jsx(n.p,{children:"Busca los eventos de dominio y registros del servicio que compartan recurso y ventana temporal. En una revocación de CA, incluye las operaciones en cascada."})]})]}),`
`,e.jsx(n.h2,{id:"verificación-periódica",children:"Verificación periódica"}),`
`,e.jsx(n.p,{children:"Genera una mutación controlada en un entorno de prueba y comprueba que:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"aparece un evento de auditoría correcto;"}),`
`,e.jsx(n.li,{children:"el principal coincide con la identidad utilizada;"}),`
`,e.jsx(n.li,{children:"el consumidor lo persiste una sola vez;"}),`
`,e.jsx(n.li,{children:"puede recuperarse por recurso, actor y periodo;"}),`
`,e.jsx(n.li,{children:"una interrupción del consumidor produce una alerta."}),`
`]}),`
`,e.jsxs(n.p,{children:["Para métricas, trazas y logs técnicos del despliegue, consulta ",e.jsx(n.a,{href:"/docs/platform/pki/troubleshooting",children:"Resolución de problemas"}),". La auditoría responde a “quién intentó cambiar qué”; la observabilidad explica cómo se comportó el sistema."]})]})}function p(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(c,{...i})}):c(i)}function r(i,n){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const h=Object.freeze(Object.defineProperty({__proto__:null,_markdown:s,default:p,frontmatter:d,structuredData:l,toc:u},Symbol.toStringTag,{value:"Module"}));export{h as _};
