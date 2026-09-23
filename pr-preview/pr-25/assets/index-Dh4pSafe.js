import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let r=`

Despliegue en AWS EC2 – AWS Marketplace [#despliegue-en-aws-ec2--aws-marketplace]

Lamassu IoT está disponible en **AWS Marketplace**, lo que permite lanzar una instancia preconfigurada en AWS EC2 con un único clic.

Pasos [#pasos]

1. Acceder a la página del producto de [Lamassu IoT en AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-fyfailowg3ewc)
2. Seleccionar el tipo de instancia recomendado (\`t3.large\` o superior)
3. Configurar el grupo de seguridad: puertos \`443\`, \`8443\` y \`9443\`
4. Lanzar la instancia y acceder a la consola de administración en \`https://<ip-publica>\`

Requisitos de infraestructura [#requisitos-de-infraestructura]

* Instancia EC2 \`t3.large\` mínimo (recomendado \`t3.xlarge\`)
* EBS \`gp3\` de al menos 50 GB
* Security Group con acceso HTTPS desde los dispositivos IoT
`,t={title:"AWS EC2 · AWS Marketplace",description:"Despliegue de Lamassu IoT en AWS EC2 mediante la suscripción en AWS Marketplace"},c={contents:[{heading:"despliegue-en-aws-ec2--aws-marketplace",content:"Lamassu IoT está disponible en **AWS Marketplace**, lo que permite lanzar una instancia preconfigurada en AWS EC2 con un único clic."},{heading:"pasos",content:"Acceder a la página del producto de Lamassu IoT en AWS Marketplace"},{heading:"pasos",content:"Seleccionar el tipo de instancia recomendado (`t3.large` o superior)"},{heading:"pasos",content:"Configurar el grupo de seguridad: puertos `443`, `8443` y `9443`"},{heading:"pasos",content:"Lanzar la instancia y acceder a la consola de administración en `https://<ip-publica>`"},{heading:"requisitos-de-infraestructura",content:"Instancia EC2 `t3.large` mínimo (recomendado `t3.xlarge`)"},{heading:"requisitos-de-infraestructura",content:"EBS `gp3` de al menos 50 GB"},{heading:"requisitos-de-infraestructura",content:"Security Group con acceso HTTPS desde los dispositivos IoT"}],headings:[{id:"despliegue-en-aws-ec2--aws-marketplace",content:"Despliegue en AWS EC2 – AWS Marketplace"},{id:"pasos",content:"Pasos"},{id:"requisitos-de-infraestructura",content:"Requisitos de infraestructura"}]};const o=[{depth:1,url:"#despliegue-en-aws-ec2--aws-marketplace",title:e.jsx(e.Fragment,{children:"Despliegue en AWS EC2 – AWS Marketplace"})},{depth:2,url:"#pasos",title:e.jsx(e.Fragment,{children:"Pasos"})},{depth:2,url:"#requisitos-de-infraestructura",title:e.jsx(e.Fragment,{children:"Requisitos de infraestructura"})}];function s(a){const n={a:"a",code:"code",h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...a.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"despliegue-en-aws-ec2--aws-marketplace",children:"Despliegue en AWS EC2 – AWS Marketplace"}),`
`,e.jsxs(n.p,{children:["Lamassu IoT está disponible en ",e.jsx(n.strong,{children:"AWS Marketplace"}),", lo que permite lanzar una instancia preconfigurada en AWS EC2 con un único clic."]}),`
`,e.jsx(n.h2,{id:"pasos",children:"Pasos"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Acceder a la página del producto de ",e.jsx(n.a,{href:"https://aws.amazon.com/marketplace/pp/prodview-fyfailowg3ewc",children:"Lamassu IoT en AWS Marketplace"})]}),`
`,e.jsxs(n.li,{children:["Seleccionar el tipo de instancia recomendado (",e.jsx(n.code,{children:"t3.large"})," o superior)"]}),`
`,e.jsxs(n.li,{children:["Configurar el grupo de seguridad: puertos ",e.jsx(n.code,{children:"443"}),", ",e.jsx(n.code,{children:"8443"})," y ",e.jsx(n.code,{children:"9443"})]}),`
`,e.jsxs(n.li,{children:["Lanzar la instancia y acceder a la consola de administración en ",e.jsx(n.code,{children:"https://<ip-publica>"})]}),`
`]}),`
`,e.jsx(n.h2,{id:"requisitos-de-infraestructura",children:"Requisitos de infraestructura"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Instancia EC2 ",e.jsx(n.code,{children:"t3.large"})," mínimo (recomendado ",e.jsx(n.code,{children:"t3.xlarge"}),")"]}),`
`,e.jsxs(n.li,{children:["EBS ",e.jsx(n.code,{children:"gp3"})," de al menos 50 GB"]}),`
`,e.jsx(n.li,{children:"Security Group con acceso HTTPS desde los dispositivos IoT"}),`
`]})]})}function d(a={}){const{wrapper:n}=a.components||{};return n?e.jsx(n,{...a,children:e.jsx(s,{...a})}):s(a)}export{r as _markdown,d as default,t as frontmatter,c as structuredData,o as toc};
