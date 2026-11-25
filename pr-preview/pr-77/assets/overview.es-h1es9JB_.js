import{j as e}from"./index-DqgIL_Rv.js";let l=`

Enrollment with PKI reúne el recorrido desde la admisión del dispositivo hasta la instalación y renovación de su identidad. El DMS actúa como autoridad de registro: autentica la solicitud, aplica la política de registro y pide a la CA que firme. El cliente conserva o recibe la clave, instala el resultado y lo presenta al consumidor.

El recorrido [#el-recorrido]

1. El administrador prepara CA, [perfil de emisión](/docs/platform/pki/certificate-profiles) y DMS.
2. El integrador instala confianza inicial en el servidor EST y una credencial de admisión.
3. El cliente solicita una identidad para su \`Device ID\` mediante EST.
4. Se comprueban certificado, vinculación al dispositivo e instalación de la pareja clave/certificado.
5. El consumidor valida y autoriza la identidad; el cliente programa renovación y recuperación.

EST utiliza \`/.well-known/est/{DMS_ID}\`. Las APIs administrativas y la asignación manual siguen siendo recorridos distintos. [Enrola y conecta un dispositivo](/docs/platform/iot-fleets/quickstarts/enroll-device) completa una primera prueba con mTLS.

Para el administrador [#para-el-administrador]

<Cards>
  <Card title="Estrategias de aprovisionamiento" description="Elige registro automático, prerregistro o asignación manual." href="/docs/platform/iot-fleets/enrollment/provisioning-strategies" />

  <Card title="Configura el DMS" description="Separa admisión, autenticación por operación, perfil y distribución." href="/docs/platform/iot-fleets/enrollment/dms" />

  <Card title="Identidad inicial y autenticación" description="Decide qué prueba permite solicitar la primera identidad." href="/docs/platform/iot-fleets/enrollment/bootstrap-identity" />

  <Card title="Distribución de confianza" description="Actualiza raíces y cadenas con un solapamiento comprobado." href="/docs/platform/iot-fleets/enrollment/trust-distribution" />
</Cards>

Para el integrador [#para-el-integrador]

<Cards>
  <Card title="Cliente EST" description="Prepara la solicitud, verifica la respuesta e instala la identidad." href="/docs/platform/iot-fleets/enrollment/est-client" />

  <Card title="Renovación y recuperación" description="Genera el sucesor y trata credenciales vencidas o perdidas." href="/docs/platform/iot-fleets/enrollment/renewal-and-recovery" />

  <Card title="Referencia EST" description="Consulta rutas, formatos, autenticación y ServerKeyGen." href="/docs/platform/iot-fleets/enrollment/est-reference" />

  <Card title="Diagnóstico" description="Distingue fallos de transporte, política, emisión e instalación." href="/docs/platform/iot-fleets/enrollment/troubleshooting" />
</Cards>

La configuración del Gateway, TLS, proveedores y servicios pertenece a [Despliegue](/docs/deployment/overview). El uso de la identidad en AWS u otros destinos corresponde a [Integraciones](/docs/platform/iot-fleets/overview#integraciones).
`,d={title:"Enrolamiento con PKI",description:"Elige la política de admisión y conecta DMS, confianza inicial y cliente EST."},s={contents:[{heading:void 0,content:"Enrollment with PKI reúne el recorrido desde la admisión del dispositivo hasta la instalación y renovación de su identidad. El DMS actúa como autoridad de registro: autentica la solicitud, aplica la política de registro y pide a la CA que firme. El cliente conserva o recibe la clave, instala el resultado y lo presenta al consumidor."},{heading:"el-recorrido",content:"El administrador prepara CA, perfil de emisión y DMS."},{heading:"el-recorrido",content:"El integrador instala confianza inicial en el servidor EST y una credencial de admisión."},{heading:"el-recorrido",content:"El cliente solicita una identidad para su `Device ID` mediante EST."},{heading:"el-recorrido",content:"Se comprueban certificado, vinculación al dispositivo e instalación de la pareja clave/certificado."},{heading:"el-recorrido",content:"El consumidor valida y autoriza la identidad; el cliente programa renovación y recuperación."},{heading:"el-recorrido",content:"EST utiliza `/.well-known/est/{DMS_ID}`. Las APIs administrativas y la asignación manual siguen siendo recorridos distintos. Enrola y conecta un dispositivo completa una primera prueba con mTLS."},{heading:"para-el-administrador",content:'<Card title="Estrategias de aprovisionamiento" description="Elige registro automático, prerregistro o asignación manual." href="/docs/platform/iot-fleets/enrollment/provisioning-strategies" />'},{heading:"para-el-administrador",content:'<Card title="Configura el DMS" description="Separa admisión, autenticación por operación, perfil y distribución." href="/docs/platform/iot-fleets/enrollment/dms" />'},{heading:"para-el-administrador",content:'<Card title="Identidad inicial y autenticación" description="Decide qué prueba permite solicitar la primera identidad." href="/docs/platform/iot-fleets/enrollment/bootstrap-identity" />'},{heading:"para-el-administrador",content:'<Card title="Distribución de confianza" description="Actualiza raíces y cadenas con un solapamiento comprobado." href="/docs/platform/iot-fleets/enrollment/trust-distribution" />'},{heading:"para-el-integrador",content:'<Card title="Cliente EST" description="Prepara la solicitud, verifica la respuesta e instala la identidad." href="/docs/platform/iot-fleets/enrollment/est-client" />'},{heading:"para-el-integrador",content:'<Card title="Renovación y recuperación" description="Genera el sucesor y trata credenciales vencidas o perdidas." href="/docs/platform/iot-fleets/enrollment/renewal-and-recovery" />'},{heading:"para-el-integrador",content:'<Card title="Referencia EST" description="Consulta rutas, formatos, autenticación y ServerKeyGen." href="/docs/platform/iot-fleets/enrollment/est-reference" />'},{heading:"para-el-integrador",content:'<Card title="Diagnóstico" description="Distingue fallos de transporte, política, emisión e instalación." href="/docs/platform/iot-fleets/enrollment/troubleshooting" />'},{heading:"para-el-integrador",content:"La configuración del Gateway, TLS, proveedores y servicios pertenece a Despliegue. El uso de la identidad en AWS u otros destinos corresponde a Integraciones."}],headings:[{id:"el-recorrido",content:"El recorrido"},{id:"para-el-administrador",content:"Para el administrador"},{id:"para-el-integrador",content:"Para el integrador"}]};const c=[{depth:2,url:"#el-recorrido",title:e.jsx(e.Fragment,{children:"El recorrido"})},{depth:2,url:"#para-el-administrador",title:e.jsx(e.Fragment,{children:"Para el administrador"})},{depth:2,url:"#para-el-integrador",title:e.jsx(e.Fragment,{children:"Para el integrador"})}];function t(r){const i={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",...r.components},{Card:a,Cards:n}=i;return a||o("Card"),n||o("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"Enrollment with PKI reúne el recorrido desde la admisión del dispositivo hasta la instalación y renovación de su identidad. El DMS actúa como autoridad de registro: autentica la solicitud, aplica la política de registro y pide a la CA que firme. El cliente conserva o recibe la clave, instala el resultado y lo presenta al consumidor."}),`
`,e.jsx(i.h2,{id:"el-recorrido",children:"El recorrido"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:["El administrador prepara CA, ",e.jsx(i.a,{href:"/docs/platform/pki/certificate-profiles",children:"perfil de emisión"})," y DMS."]}),`
`,e.jsx(i.li,{children:"El integrador instala confianza inicial en el servidor EST y una credencial de admisión."}),`
`,e.jsxs(i.li,{children:["El cliente solicita una identidad para su ",e.jsx(i.code,{children:"Device ID"})," mediante EST."]}),`
`,e.jsx(i.li,{children:"Se comprueban certificado, vinculación al dispositivo e instalación de la pareja clave/certificado."}),`
`,e.jsx(i.li,{children:"El consumidor valida y autoriza la identidad; el cliente programa renovación y recuperación."}),`
`]}),`
`,e.jsxs(i.p,{children:["EST utiliza ",e.jsx(i.code,{children:"/.well-known/est/{DMS_ID}"}),". Las APIs administrativas y la asignación manual siguen siendo recorridos distintos. ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/quickstarts/enroll-device",children:"Enrola y conecta un dispositivo"})," completa una primera prueba con mTLS."]}),`
`,e.jsx(i.h2,{id:"para-el-administrador",children:"Para el administrador"}),`
`,e.jsxs(n,{children:[e.jsx(a,{title:"Estrategias de aprovisionamiento",description:"Elige registro automático, prerregistro o asignación manual.",href:"/docs/platform/iot-fleets/enrollment/provisioning-strategies"}),e.jsx(a,{title:"Configura el DMS",description:"Separa admisión, autenticación por operación, perfil y distribución.",href:"/docs/platform/iot-fleets/enrollment/dms"}),e.jsx(a,{title:"Identidad inicial y autenticación",description:"Decide qué prueba permite solicitar la primera identidad.",href:"/docs/platform/iot-fleets/enrollment/bootstrap-identity"}),e.jsx(a,{title:"Distribución de confianza",description:"Actualiza raíces y cadenas con un solapamiento comprobado.",href:"/docs/platform/iot-fleets/enrollment/trust-distribution"})]}),`
`,e.jsx(i.h2,{id:"para-el-integrador",children:"Para el integrador"}),`
`,e.jsxs(n,{children:[e.jsx(a,{title:"Cliente EST",description:"Prepara la solicitud, verifica la respuesta e instala la identidad.",href:"/docs/platform/iot-fleets/enrollment/est-client"}),e.jsx(a,{title:"Renovación y recuperación",description:"Genera el sucesor y trata credenciales vencidas o perdidas.",href:"/docs/platform/iot-fleets/enrollment/renewal-and-recovery"}),e.jsx(a,{title:"Referencia EST",description:"Consulta rutas, formatos, autenticación y ServerKeyGen.",href:"/docs/platform/iot-fleets/enrollment/est-reference"}),e.jsx(a,{title:"Diagnóstico",description:"Distingue fallos de transporte, política, emisión e instalación.",href:"/docs/platform/iot-fleets/enrollment/troubleshooting"})]}),`
`,e.jsxs(i.p,{children:["La configuración del Gateway, TLS, proveedores y servicios pertenece a ",e.jsx(i.a,{href:"/docs/deployment/overview",children:"Despliegue"}),". El uso de la identidad en AWS u otros destinos corresponde a ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/overview#integraciones",children:"Integraciones"}),"."]})]})}function p(r={}){const{wrapper:i}=r.components||{};return i?e.jsx(i,{...r,children:e.jsx(t,{...r})}):t(r)}function o(r,i){throw new Error("Expected component `"+r+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,_markdown:l,default:p,frontmatter:d,structuredData:s,toc:c},Symbol.toStringTag,{value:"Module"}));export{u as _};
