import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let d=`

La oferta de AWS Marketplace reduce la preparación inicial a una instancia EC2 dentro de tu cuenta. Tú mantienes el control de la red, el almacenamiento y la operación de la máquina.

Antes de empezar [#antes-de-empezar]

* Permisos para suscribirte a productos de AWS Marketplace y lanzar instancias EC2.
* Una VPC y una subred desde la que puedan acceder administradores y dispositivos.
* Un grupo de seguridad que permita los endpoints necesarios.

Requisitos de infraestructura [#requisitos-de-infraestructura]

| Recurso   | Mínimo           | Recomendación                             |
| --------- | ---------------- | ----------------------------------------- |
| Instancia | \`t3.large\`       | \`t3.xlarge\` o superior según la carga     |
| Volumen   | EBS \`gp3\`, 50 GB | Ajustar al inventario y la retención      |
| Red       | HTTPS accesible  | Restringir el acceso a redes de confianza |

<Steps>
  <Step>
    Abre la oferta [#abre-la-oferta]

    Accede a [Lamassu IoT en AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-fyfailowg3ewc) y revisa las condiciones antes de suscribirte.
  </Step>

  <Step>
    Configura la instancia [#configura-la-instancia]

    Selecciona \`t3.large\` o superior, asigna al menos 50 GB de almacenamiento \`gp3\` y elige la VPC y subred de destino.
  </Step>

  <Step>
    Limita el acceso de red [#limita-el-acceso-de-red]

    Configura el grupo de seguridad para los puertos \`443\`, \`8443\` y \`9443\`. Restringe los orígenes a las redes administrativas y de dispositivos que realmente necesiten conectarse.
  </Step>

  <Step>
    Lanza y verifica [#lanza-y-verifica]

    Inicia la instancia y abre la consola en \`https://<ip-publica>\`. Comprueba que puedes autenticarte antes de continuar.
  </Step>
</Steps>

Siguiente paso [#siguiente-paso]

Continúa con [Crea tu primera CA](/docs/manual/inicio/primera-ca) para validar la configuración criptográfica de la instancia.
`,o={title:"Despliega desde AWS Marketplace",description:"Ejecuta una instancia preconfigurada de Lamassu IoT en Amazon EC2."},l={contents:[{heading:void 0,content:"La oferta de AWS Marketplace reduce la preparación inicial a una instancia EC2 dentro de tu cuenta. Tú mantienes el control de la red, el almacenamiento y la operación de la máquina."},{heading:"antes-de-empezar",content:"Permisos para suscribirte a productos de AWS Marketplace y lanzar instancias EC2."},{heading:"antes-de-empezar",content:"Una VPC y una subred desde la que puedan acceder administradores y dispositivos."},{heading:"antes-de-empezar",content:"Un grupo de seguridad que permita los endpoints necesarios."},{heading:"requisitos-de-infraestructura",content:"Recurso"},{heading:"requisitos-de-infraestructura",content:"Mínimo"},{heading:"requisitos-de-infraestructura",content:"Recomendación"},{heading:"requisitos-de-infraestructura",content:"Instancia"},{heading:"requisitos-de-infraestructura",content:"`t3.large`"},{heading:"requisitos-de-infraestructura",content:"`t3.xlarge` o superior según la carga"},{heading:"requisitos-de-infraestructura",content:"Volumen"},{heading:"requisitos-de-infraestructura",content:"EBS `gp3`, 50 GB"},{heading:"requisitos-de-infraestructura",content:"Ajustar al inventario y la retención"},{heading:"requisitos-de-infraestructura",content:"Red"},{heading:"requisitos-de-infraestructura",content:"HTTPS accesible"},{heading:"requisitos-de-infraestructura",content:"Restringir el acceso a redes de confianza"},{heading:"abre-la-oferta",content:"Accede a Lamassu IoT en AWS Marketplace y revisa las condiciones antes de suscribirte."},{heading:"configura-la-instancia",content:"Selecciona `t3.large` o superior, asigna al menos 50 GB de almacenamiento `gp3` y elige la VPC y subred de destino."},{heading:"limita-el-acceso-de-red",content:"Configura el grupo de seguridad para los puertos `443`, `8443` y `9443`. Restringe los orígenes a las redes administrativas y de dispositivos que realmente necesiten conectarse."},{heading:"lanza-y-verifica",content:"Inicia la instancia y abre la consola en `https://<ip-publica>`. Comprueba que puedes autenticarte antes de continuar."},{heading:"siguiente-paso",content:"Continúa con Crea tu primera CA para validar la configuración criptográfica de la instancia."}],headings:[{id:"antes-de-empezar",content:"Antes de empezar"},{id:"requisitos-de-infraestructura",content:"Requisitos de infraestructura"},{id:"abre-la-oferta",content:"Abre la oferta"},{id:"configura-la-instancia",content:"Configura la instancia"},{id:"limita-el-acceso-de-red",content:"Limita el acceso de red"},{id:"lanza-y-verifica",content:"Lanza y verifica"},{id:"siguiente-paso",content:"Siguiente paso"}]};const u=[{depth:2,url:"#antes-de-empezar",title:e.jsx(e.Fragment,{children:"Antes de empezar"})},{depth:2,url:"#requisitos-de-infraestructura",title:e.jsx(e.Fragment,{children:"Requisitos de infraestructura"})},{depth:3,url:"#abre-la-oferta",title:e.jsx(e.Fragment,{children:"Abre la oferta"})},{depth:3,url:"#configura-la-instancia",title:e.jsx(e.Fragment,{children:"Configura la instancia"})},{depth:3,url:"#limita-el-acceso-de-red",title:e.jsx(e.Fragment,{children:"Limita el acceso de red"})},{depth:3,url:"#lanza-y-verifica",title:e.jsx(e.Fragment,{children:"Lanza y verifica"})},{depth:2,url:"#siguiente-paso",title:e.jsx(e.Fragment,{children:"Siguiente paso"})}];function t(n){const a={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components},{Step:i,Steps:r}=a;return i||s("Step"),r||s("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(a.p,{children:"La oferta de AWS Marketplace reduce la preparación inicial a una instancia EC2 dentro de tu cuenta. Tú mantienes el control de la red, el almacenamiento y la operación de la máquina."}),`
`,e.jsx(a.h2,{id:"antes-de-empezar",children:"Antes de empezar"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Permisos para suscribirte a productos de AWS Marketplace y lanzar instancias EC2."}),`
`,e.jsx(a.li,{children:"Una VPC y una subred desde la que puedan acceder administradores y dispositivos."}),`
`,e.jsx(a.li,{children:"Un grupo de seguridad que permita los endpoints necesarios."}),`
`]}),`
`,e.jsx(a.h2,{id:"requisitos-de-infraestructura",children:"Requisitos de infraestructura"}),`
`,e.jsxs(a.table,{children:[e.jsx(a.thead,{children:e.jsxs(a.tr,{children:[e.jsx(a.th,{children:"Recurso"}),e.jsx(a.th,{children:"Mínimo"}),e.jsx(a.th,{children:"Recomendación"})]})}),e.jsxs(a.tbody,{children:[e.jsxs(a.tr,{children:[e.jsx(a.td,{children:"Instancia"}),e.jsx(a.td,{children:e.jsx(a.code,{children:"t3.large"})}),e.jsxs(a.td,{children:[e.jsx(a.code,{children:"t3.xlarge"})," o superior según la carga"]})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{children:"Volumen"}),e.jsxs(a.td,{children:["EBS ",e.jsx(a.code,{children:"gp3"}),", 50 GB"]}),e.jsx(a.td,{children:"Ajustar al inventario y la retención"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{children:"Red"}),e.jsx(a.td,{children:"HTTPS accesible"}),e.jsx(a.td,{children:"Restringir el acceso a redes de confianza"})]})]})]}),`
`,e.jsxs(r,{children:[e.jsxs(i,{children:[e.jsx(a.h3,{id:"abre-la-oferta",children:"Abre la oferta"}),e.jsxs(a.p,{children:["Accede a ",e.jsx(a.a,{href:"https://aws.amazon.com/marketplace/pp/prodview-fyfailowg3ewc",children:"Lamassu IoT en AWS Marketplace"})," y revisa las condiciones antes de suscribirte."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"configura-la-instancia",children:"Configura la instancia"}),e.jsxs(a.p,{children:["Selecciona ",e.jsx(a.code,{children:"t3.large"})," o superior, asigna al menos 50 GB de almacenamiento ",e.jsx(a.code,{children:"gp3"})," y elige la VPC y subred de destino."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"limita-el-acceso-de-red",children:"Limita el acceso de red"}),e.jsxs(a.p,{children:["Configura el grupo de seguridad para los puertos ",e.jsx(a.code,{children:"443"}),", ",e.jsx(a.code,{children:"8443"})," y ",e.jsx(a.code,{children:"9443"}),". Restringe los orígenes a las redes administrativas y de dispositivos que realmente necesiten conectarse."]})]}),e.jsxs(i,{children:[e.jsx(a.h3,{id:"lanza-y-verifica",children:"Lanza y verifica"}),e.jsxs(a.p,{children:["Inicia la instancia y abre la consola en ",e.jsx(a.code,{children:"https://<ip-publica>"}),". Comprueba que puedes autenticarte antes de continuar."]})]})]}),`
`,e.jsx(a.h2,{id:"siguiente-paso",children:"Siguiente paso"}),`
`,e.jsxs(a.p,{children:["Continúa con ",e.jsx(a.a,{href:"/docs/manual/inicio/primera-ca",children:"Crea tu primera CA"})," para validar la configuración criptográfica de la instancia."]})]})}function p(n={}){const{wrapper:a}=n.components||{};return a?e.jsx(a,{...n,children:e.jsx(t,{...n})}):t(n)}function s(n,a){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{d as _markdown,p as default,o as frontmatter,l as structuredData,u as toc};
