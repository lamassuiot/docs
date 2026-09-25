import{j as e}from"./index-prc0XQdj.js";let t=`

La jerarquía determina el alcance de cualquier error o compromiso. Una raíz firma CAs intermedias; las intermedias emiten las identidades que usan dispositivos y servicios. Esta separación permite aislar entornos y rotar una rama sin reemplazar toda la confianza.

Diseña la jerarquía [#diseña-la-jerarquía]

Para una instalación de producción, utiliza una raíz muy restringida y una o más intermedias operativas. Separa intermedias cuando cambie alguno de estos límites:

* entorno, como producción y preproducción;
* propietario o equipo operador;
* familia de dispositivos o proceso de fabricación;
* región o requisito regulatorio;
* motor criptográfico o política de clave;
* ventana de mantenimiento y ritmo de renovación.

Evita jerarquías profundas sin una necesidad concreta. Cada nivel añade distribución de cadena, validación y otro certificado que debes renovar.

<Callout type="warn" title="La validez desciende por la jerarquía">
  Una CA hija y los certificados finales deben expirar antes que su emisor. Reserva un margen que permita distribuir otra cadena y renovar los certificados dependientes.
</Callout>

Reemisión y rotación no son lo mismo [#reemisión-y-rotación-no-son-lo-mismo]

**Reemitir una CA** crea un certificado nuevo sobre la clave existente. Lamassu genera una CSR con esa clave, autofirma si es una raíz o pide a la CA padre que firme si es subordinada. El nuevo certificado queda activo y la CA apunta a su número de serie; los certificados anterior y nuevo quedan enlazados mediante metadatos.

**Rotar una CA** crea una clave y una autoridad sucesoras. Es la opción adecuada ante compromiso, cambio criptográfico, migración de motor o política de claves no exportables.

Lamassu no permite reemitir una CA ya revocada ni una CA cuya fecha de expiración haya pasado. Anticípate a ambas condiciones.

Cuándo elegir cada operación [#cuándo-elegir-cada-operación]

* Reemite si la clave sigue siendo confiable y solo necesitas otro periodo de validez o un certificado actualizado.
* Rota la clave si existe sospecha de compromiso, cambia el algoritmo o quieres mover la custodia a otro motor.
* Crea una rama paralela si no puedes actualizar todos los consumidores al mismo tiempo.
* Revoca inmediatamente solo cuando el riesgo de mantener la CA supera el impacto de interrumpir la flota.

Procedimiento de rotación de clave [#procedimiento-de-rotación-de-clave]

<Steps>
  <Step>
    Inventaría las dependencias [#inventaría-las-dependencias]

    Localiza CAs hijas, certificados emitidos, DMS, conectores y almacenes de confianza externos. Incluye dispositivos que pueden permanecer desconectados durante semanas o meses.
  </Step>

  <Step>
    Crea la CA sucesora [#crea-la-ca-sucesora]

    Genera una clave nueva en el motor previsto, crea la CA y asígnale un perfil explícito. No reutilices el identificador operativo para ocultar que es una generación distinta.
  </Step>

  <Step>
    Distribuye la nueva confianza [#distribuye-la-nueva-confianza]

    Añade la nueva raíz o cadena a los consumidores antes de emitir con ella. En un DMS, utiliza las CAs gestionadas de \`/cacerts\` para mantener temporalmente las cadenas antigua y nueva.
  </Step>

  <Step>
    Cambia la emisión [#cambia-la-emisión]

    Actualiza la CA de enrolamiento y el perfil de los DMS. Mantén las CAs de validación adicionales si todavía deben aceptarse certificados antiguos durante el re-enrolamiento.
  </Step>

  <Step>
    Renueva por lotes [#renueva-por-lotes]

    Migra una cohorte pequeña, valida mTLS, OCSP y CRL desde el consumidor y amplía progresivamente. Supervisa qué dispositivos siguen presentando la cadena antigua.
  </Step>

  <Step>
    Cierra el solapamiento [#cierra-el-solapamiento]

    Cuando ningún consumidor legítimo dependa de la autoridad anterior, retírala de la emisión y de las CAs distribuidas. Revócala si la política lo exige.
  </Step>
</Steps>

Revocación en cascada [#revocación-en-cascada]

Al revocar una CA, Lamassu actualiza también sus CAs hijas y certificados emitidos a \`REVOKED\` con razón \`CessationOfOperation\`. Las revocaciones de las hijas propagan el efecto a sus propias ramas.

Esto protege la coherencia de la jerarquía, pero convierte la revocación en una acción de gran impacto. No la utilices como mecanismo ordinario para dejar de emitir: primero completa la migración y elimina la CA de los flujos operativos.

Comprobaciones después del cambio [#comprobaciones-después-del-cambio]

* La cadena nueva termina en un ancla instalada por el consumidor.
* Los certificados nuevos contienen AKI, SKI, KU, EKU y SAN esperados.
* El DMS entrega la cadena correcta mediante EST \`/cacerts\`.
* El re-enrolamiento acepta la identidad antigua durante el periodo previsto.
* OCSP y CRL responden para las autoridades que siguen activas.
* No quedan DMS emitiendo accidentalmente desde la CA anterior.

Consulta el [Modelo de confianza](/docs/platform/pki/concepts/trust-model) para entender los conjuntos de CAs del DMS y [Ciclo de vida de un certificado](/docs/platform/pki/concepts/certificate-lifecycle) para los estados y efectos de revocación.
`,d={title:"Jerarquía y rotación de CAs",description:"Diseña autoridades raíz e intermedias y sustituye certificados o claves sin romper la confianza.",sidebar:{group:"CA",label:"Jerarquía y rotación"}},l={contents:[{heading:void 0,content:"La jerarquía determina el alcance de cualquier error o compromiso. Una raíz firma CAs intermedias; las intermedias emiten las identidades que usan dispositivos y servicios. Esta separación permite aislar entornos y rotar una rama sin reemplazar toda la confianza."},{heading:"diseña-la-jerarquía",content:"Para una instalación de producción, utiliza una raíz muy restringida y una o más intermedias operativas. Separa intermedias cuando cambie alguno de estos límites:"},{heading:"diseña-la-jerarquía",content:"entorno, como producción y preproducción;"},{heading:"diseña-la-jerarquía",content:"propietario o equipo operador;"},{heading:"diseña-la-jerarquía",content:"familia de dispositivos o proceso de fabricación;"},{heading:"diseña-la-jerarquía",content:"región o requisito regulatorio;"},{heading:"diseña-la-jerarquía",content:"motor criptográfico o política de clave;"},{heading:"diseña-la-jerarquía",content:"ventana de mantenimiento y ritmo de renovación."},{heading:"diseña-la-jerarquía",content:"Evita jerarquías profundas sin una necesidad concreta. Cada nivel añade distribución de cadena, validación y otro certificado que debes renovar."},{heading:"diseña-la-jerarquía",content:"Una CA hija y los certificados finales deben expirar antes que su emisor. Reserva un margen que permita distribuir otra cadena y renovar los certificados dependientes."},{heading:"reemisión-y-rotación-no-son-lo-mismo",content:"**Reemitir una CA** crea un certificado nuevo sobre la clave existente. Lamassu genera una CSR con esa clave, autofirma si es una raíz o pide a la CA padre que firme si es subordinada. El nuevo certificado queda activo y la CA apunta a su número de serie; los certificados anterior y nuevo quedan enlazados mediante metadatos."},{heading:"reemisión-y-rotación-no-son-lo-mismo",content:"**Rotar una CA** crea una clave y una autoridad sucesoras. Es la opción adecuada ante compromiso, cambio criptográfico, migración de motor o política de claves no exportables."},{heading:"reemisión-y-rotación-no-son-lo-mismo",content:"Lamassu no permite reemitir una CA ya revocada ni una CA cuya fecha de expiración haya pasado. Anticípate a ambas condiciones."},{heading:"cuándo-elegir-cada-operación",content:"Reemite si la clave sigue siendo confiable y solo necesitas otro periodo de validez o un certificado actualizado."},{heading:"cuándo-elegir-cada-operación",content:"Rota la clave si existe sospecha de compromiso, cambia el algoritmo o quieres mover la custodia a otro motor."},{heading:"cuándo-elegir-cada-operación",content:"Crea una rama paralela si no puedes actualizar todos los consumidores al mismo tiempo."},{heading:"cuándo-elegir-cada-operación",content:"Revoca inmediatamente solo cuando el riesgo de mantener la CA supera el impacto de interrumpir la flota."},{heading:"inventaría-las-dependencias",content:"Localiza CAs hijas, certificados emitidos, DMS, conectores y almacenes de confianza externos. Incluye dispositivos que pueden permanecer desconectados durante semanas o meses."},{heading:"crea-la-ca-sucesora",content:"Genera una clave nueva en el motor previsto, crea la CA y asígnale un perfil explícito. No reutilices el identificador operativo para ocultar que es una generación distinta."},{heading:"distribuye-la-nueva-confianza",content:"Añade la nueva raíz o cadena a los consumidores antes de emitir con ella. En un DMS, utiliza las CAs gestionadas de `/cacerts` para mantener temporalmente las cadenas antigua y nueva."},{heading:"cambia-la-emisión",content:"Actualiza la CA de enrolamiento y el perfil de los DMS. Mantén las CAs de validación adicionales si todavía deben aceptarse certificados antiguos durante el re-enrolamiento."},{heading:"renueva-por-lotes",content:"Migra una cohorte pequeña, valida mTLS, OCSP y CRL desde el consumidor y amplía progresivamente. Supervisa qué dispositivos siguen presentando la cadena antigua."},{heading:"cierra-el-solapamiento",content:"Cuando ningún consumidor legítimo dependa de la autoridad anterior, retírala de la emisión y de las CAs distribuidas. Revócala si la política lo exige."},{heading:"revocación-en-cascada",content:"Al revocar una CA, Lamassu actualiza también sus CAs hijas y certificados emitidos a `REVOKED` con razón `CessationOfOperation`. Las revocaciones de las hijas propagan el efecto a sus propias ramas."},{heading:"revocación-en-cascada",content:"Esto protege la coherencia de la jerarquía, pero convierte la revocación en una acción de gran impacto. No la utilices como mecanismo ordinario para dejar de emitir: primero completa la migración y elimina la CA de los flujos operativos."},{heading:"comprobaciones-después-del-cambio",content:"La cadena nueva termina en un ancla instalada por el consumidor."},{heading:"comprobaciones-después-del-cambio",content:"Los certificados nuevos contienen AKI, SKI, KU, EKU y SAN esperados."},{heading:"comprobaciones-después-del-cambio",content:"El DMS entrega la cadena correcta mediante EST `/cacerts`."},{heading:"comprobaciones-después-del-cambio",content:"El re-enrolamiento acepta la identidad antigua durante el periodo previsto."},{heading:"comprobaciones-después-del-cambio",content:"OCSP y CRL responden para las autoridades que siguen activas."},{heading:"comprobaciones-después-del-cambio",content:"No quedan DMS emitiendo accidentalmente desde la CA anterior."},{heading:"comprobaciones-después-del-cambio",content:"Consulta el Modelo de confianza para entender los conjuntos de CAs del DMS y Ciclo de vida de un certificado para los estados y efectos de revocación."}],headings:[{id:"diseña-la-jerarquía",content:"Diseña la jerarquía"},{id:"reemisión-y-rotación-no-son-lo-mismo",content:"Reemisión y rotación no son lo mismo"},{id:"cuándo-elegir-cada-operación",content:"Cuándo elegir cada operación"},{id:"procedimiento-de-rotación-de-clave",content:"Procedimiento de rotación de clave"},{id:"inventaría-las-dependencias",content:"Inventaría las dependencias"},{id:"crea-la-ca-sucesora",content:"Crea la CA sucesora"},{id:"distribuye-la-nueva-confianza",content:"Distribuye la nueva confianza"},{id:"cambia-la-emisión",content:"Cambia la emisión"},{id:"renueva-por-lotes",content:"Renueva por lotes"},{id:"cierra-el-solapamiento",content:"Cierra el solapamiento"},{id:"revocación-en-cascada",content:"Revocación en cascada"},{id:"comprobaciones-después-del-cambio",content:"Comprobaciones después del cambio"}]};const u=[{depth:2,url:"#diseña-la-jerarquía",title:e.jsx(e.Fragment,{children:"Diseña la jerarquía"})},{depth:2,url:"#reemisión-y-rotación-no-son-lo-mismo",title:e.jsx(e.Fragment,{children:"Reemisión y rotación no son lo mismo"})},{depth:2,url:"#cuándo-elegir-cada-operación",title:e.jsx(e.Fragment,{children:"Cuándo elegir cada operación"})},{depth:2,url:"#procedimiento-de-rotación-de-clave",title:e.jsx(e.Fragment,{children:"Procedimiento de rotación de clave"})},{depth:3,url:"#inventaría-las-dependencias",title:e.jsx(e.Fragment,{children:"Inventaría las dependencias"})},{depth:3,url:"#crea-la-ca-sucesora",title:e.jsx(e.Fragment,{children:"Crea la CA sucesora"})},{depth:3,url:"#distribuye-la-nueva-confianza",title:e.jsx(e.Fragment,{children:"Distribuye la nueva confianza"})},{depth:3,url:"#cambia-la-emisión",title:e.jsx(e.Fragment,{children:"Cambia la emisión"})},{depth:3,url:"#renueva-por-lotes",title:e.jsx(e.Fragment,{children:"Renueva por lotes"})},{depth:3,url:"#cierra-el-solapamiento",title:e.jsx(e.Fragment,{children:"Cierra el solapamiento"})},{depth:2,url:"#revocación-en-cascada",title:e.jsx(e.Fragment,{children:"Revocación en cascada"})},{depth:2,url:"#comprobaciones-después-del-cambio",title:e.jsx(e.Fragment,{children:"Comprobaciones después del cambio"})}];function c(n){const a={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...n.components},{Callout:r,Step:i,Steps:s}=a;return r||o("Callout"),i||o("Step"),s||o("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(a.p,{children:"La jerarquía determina el alcance de cualquier error o compromiso. Una raíz firma CAs intermedias; las intermedias emiten las identidades que usan dispositivos y servicios. Esta separación permite aislar entornos y rotar una rama sin reemplazar toda la confianza."}),`
`,e.jsx(a.h2,{id:"diseña-la-jerarquía",children:"Diseña la jerarquía"}),`
`,e.jsx(a.p,{children:"Para una instalación de producción, utiliza una raíz muy restringida y una o más intermedias operativas. Separa intermedias cuando cambie alguno de estos límites:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"entorno, como producción y preproducción;"}),`
`,e.jsx(a.li,{children:"propietario o equipo operador;"}),`
`,e.jsx(a.li,{children:"familia de dispositivos o proceso de fabricación;"}),`
`,e.jsx(a.li,{children:"región o requisito regulatorio;"}),`
`,e.jsx(a.li,{children:"motor criptográfico o política de clave;"}),`
`,e.jsx(a.li,{children:"ventana de mantenimiento y ritmo de renovación."}),`
`]}),`
`,e.jsx(a.p,{children:"Evita jerarquías profundas sin una necesidad concreta. Cada nivel añade distribución de cadena, validación y otro certificado que debes renovar."}),`
`,e.jsx(r,{type:"warn",title:"La validez desciende por la jerarquía",children:e.jsx(a.p,{children:"Una CA hija y los certificados finales deben expirar antes que su emisor. Reserva un margen que permita distribuir otra cadena y renovar los certificados dependientes."})}),`
`,e.jsx(a.h2,{id:"reemisión-y-rotación-no-son-lo-mismo",children:"Reemisión y rotación no son lo mismo"}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Reemitir una CA"})," crea un certificado nuevo sobre la clave existente. Lamassu genera una CSR con esa clave, autofirma si es una raíz o pide a la CA padre que firme si es subordinada. El nuevo certificado queda activo y la CA apunta a su número de serie; los certificados anterior y nuevo quedan enlazados mediante metadatos."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Rotar una CA"})," crea una clave y una autoridad sucesoras. Es la opción adecuada ante compromiso, cambio criptográfico, migración de motor o política de claves no exportables."]}),`
`,e.jsx(a.p,{children:"Lamassu no permite reemitir una CA ya revocada ni una CA cuya fecha de expiración haya pasado. Anticípate a ambas condiciones."}),`
`,e.jsx(a.h2,{id:"cuándo-elegir-cada-operación",children:"Cuándo elegir cada operación"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Reemite si la clave sigue siendo confiable y solo necesitas otro periodo de validez o un certificado actualizado."}),`
`,e.jsx(a.li,{children:"Rota la clave si existe sospecha de compromiso, cambia el algoritmo o quieres mover la custodia a otro motor."}),`
`,e.jsx(a.li,{children:"Crea una rama paralela si no puedes actualizar todos los consumidores al mismo tiempo."}),`
`,e.jsx(a.li,{children:"Revoca inmediatamente solo cuando el riesgo de mantener la CA supera el impacto de interrumpir la flota."}),`
`]}),`
`,e.jsx(a.h2,{id:"procedimiento-de-rotación-de-clave",children:"Procedimiento de rotación de clave"}),`
`,e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsx(a.h3,{id:"inventaría-las-dependencias",children:"Inventaría las dependencias"}),e.jsx(a.p,{children:"Localiza CAs hijas, certificados emitidos, DMS, conectores y almacenes de confianza externos. Incluye dispositivos que pueden permanecer desconectados durante semanas o meses."})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"crea-la-ca-sucesora",children:"Crea la CA sucesora"}),e.jsx(a.p,{children:"Genera una clave nueva en el motor previsto, crea la CA y asígnale un perfil explícito. No reutilices el identificador operativo para ocultar que es una generación distinta."})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"distribuye-la-nueva-confianza",children:"Distribuye la nueva confianza"}),e.jsxs(a.p,{children:["Añade la nueva raíz o cadena a los consumidores antes de emitir con ella. En un DMS, utiliza las CAs gestionadas de ",e.jsx(a.code,{children:"/cacerts"})," para mantener temporalmente las cadenas antigua y nueva."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"cambia-la-emisión",children:"Cambia la emisión"}),e.jsx(a.p,{children:"Actualiza la CA de enrolamiento y el perfil de los DMS. Mantén las CAs de validación adicionales si todavía deben aceptarse certificados antiguos durante el re-enrolamiento."})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"renueva-por-lotes",children:"Renueva por lotes"}),e.jsx(a.p,{children:"Migra una cohorte pequeña, valida mTLS, OCSP y CRL desde el consumidor y amplía progresivamente. Supervisa qué dispositivos siguen presentando la cadena antigua."})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"cierra-el-solapamiento",children:"Cierra el solapamiento"}),e.jsx(a.p,{children:"Cuando ningún consumidor legítimo dependa de la autoridad anterior, retírala de la emisión y de las CAs distribuidas. Revócala si la política lo exige."})]})]}),`
`,e.jsx(a.h2,{id:"revocación-en-cascada",children:"Revocación en cascada"}),`
`,e.jsxs(a.p,{children:["Al revocar una CA, Lamassu actualiza también sus CAs hijas y certificados emitidos a ",e.jsx(a.code,{children:"REVOKED"})," con razón ",e.jsx(a.code,{children:"CessationOfOperation"}),". Las revocaciones de las hijas propagan el efecto a sus propias ramas."]}),`
`,e.jsx(a.p,{children:"Esto protege la coherencia de la jerarquía, pero convierte la revocación en una acción de gran impacto. No la utilices como mecanismo ordinario para dejar de emitir: primero completa la migración y elimina la CA de los flujos operativos."}),`
`,e.jsx(a.h2,{id:"comprobaciones-después-del-cambio",children:"Comprobaciones después del cambio"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"La cadena nueva termina en un ancla instalada por el consumidor."}),`
`,e.jsx(a.li,{children:"Los certificados nuevos contienen AKI, SKI, KU, EKU y SAN esperados."}),`
`,e.jsxs(a.li,{children:["El DMS entrega la cadena correcta mediante EST ",e.jsx(a.code,{children:"/cacerts"}),"."]}),`
`,e.jsx(a.li,{children:"El re-enrolamiento acepta la identidad antigua durante el periodo previsto."}),`
`,e.jsx(a.li,{children:"OCSP y CRL responden para las autoridades que siguen activas."}),`
`,e.jsx(a.li,{children:"No quedan DMS emitiendo accidentalmente desde la CA anterior."}),`
`]}),`
`,e.jsxs(a.p,{children:["Consulta el ",e.jsx(a.a,{href:"/docs/platform/pki/concepts/trust-model",children:"Modelo de confianza"})," para entender los conjuntos de CAs del DMS y ",e.jsx(a.a,{href:"/docs/platform/pki/concepts/certificate-lifecycle",children:"Ciclo de vida de un certificado"})," para los estados y efectos de revocación."]})]})}function m(n={}){const{wrapper:a}=n.components||{};return a?e.jsx(a,{...n,children:e.jsx(c,{...n})}):c(n)}function o(n,a){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const v=Object.freeze(Object.defineProperty({__proto__:null,_markdown:t,default:m,frontmatter:d,structuredData:l,toc:u},Symbol.toStringTag,{value:"Module"}));export{v as _};
