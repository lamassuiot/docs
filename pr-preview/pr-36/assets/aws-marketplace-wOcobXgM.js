import{j as e}from"./index-prc0XQdj.js";let a=`

The AWS Marketplace offering reduces initial setup to an EC2 instance inside your account. You keep control of the network, storage and operation of the machine.

Before you begin [#before-you-begin]

* Permissions to subscribe to AWS Marketplace products and launch EC2 instances.
* A VPC and a subnet from which administrators and devices can reach the instance.
* A security group allowing the necessary endpoints.

Infrastructure requirements [#infrastructure-requirements]

* **Compute:** a \`t3.large\` instance at minimum. Use \`t3.xlarge\` or higher when the load requires it.
* **Storage:** an EBS \`gp3\` volume of at least 50 GB, sized to your inventory and retention needs.
* **Network:** HTTPS access from the necessary consumers, restricted to trusted networks.

<Steps>
  <Step>
    Open the offer [#open-the-offer]

    Go to [Lamassu IoT on AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-fyfailowg3ewc) and review the terms before subscribing.
  </Step>

  <Step>
    Configure the instance [#configure-the-instance]

    Select \`t3.large\` or higher, assign at least 50 GB of \`gp3\` storage and choose the target VPC and subnet.
  </Step>

  <Step>
    Limit network access [#limit-network-access]

    Configure the security group for ports \`443\`, \`8443\` and \`9443\`. Restrict the origins to the administrative and device networks that really need to connect.
  </Step>

  <Step>
    Launch and verify [#launch-and-verify]

    Start the instance and open the console at \`https://<public-ip>\`. Check you can authenticate before continuing.
  </Step>
</Steps>

Next step [#next-step]

Continue with [Create your first CA](/docs/platform/pki/quickstarts/create-certificate-authority) to validate the instance's cryptographic configuration.
`,c={title:"Deploy from AWS Marketplace",description:"Run a preconfigured Lamassu IoT instance on Amazon EC2."},h={contents:[{heading:void 0,content:"The AWS Marketplace offering reduces initial setup to an EC2 instance inside your account. You keep control of the network, storage and operation of the machine."},{heading:"before-you-begin",content:"Permissions to subscribe to AWS Marketplace products and launch EC2 instances."},{heading:"before-you-begin",content:"A VPC and a subnet from which administrators and devices can reach the instance."},{heading:"before-you-begin",content:"A security group allowing the necessary endpoints."},{heading:"infrastructure-requirements",content:"**Compute:** a `t3.large` instance at minimum. Use `t3.xlarge` or higher when the load requires it."},{heading:"infrastructure-requirements",content:"**Storage:** an EBS `gp3` volume of at least 50 GB, sized to your inventory and retention needs."},{heading:"infrastructure-requirements",content:"**Network:** HTTPS access from the necessary consumers, restricted to trusted networks."},{heading:"open-the-offer",content:"Go to Lamassu IoT on AWS Marketplace and review the terms before subscribing."},{heading:"configure-the-instance",content:"Select `t3.large` or higher, assign at least 50 GB of `gp3` storage and choose the target VPC and subnet."},{heading:"limit-network-access",content:"Configure the security group for ports `443`, `8443` and `9443`. Restrict the origins to the administrative and device networks that really need to connect."},{heading:"launch-and-verify",content:"Start the instance and open the console at `https://<public-ip>`. Check you can authenticate before continuing."},{heading:"next-step",content:"Continue with Create your first CA to validate the instance's cryptographic configuration."}],headings:[{id:"before-you-begin",content:"Before you begin"},{id:"infrastructure-requirements",content:"Infrastructure requirements"},{id:"open-the-offer",content:"Open the offer"},{id:"configure-the-instance",content:"Configure the instance"},{id:"limit-network-access",content:"Limit network access"},{id:"launch-and-verify",content:"Launch and verify"},{id:"next-step",content:"Next step"}]};const d=[{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:2,url:"#infrastructure-requirements",title:e.jsx(e.Fragment,{children:"Infrastructure requirements"})},{depth:3,url:"#open-the-offer",title:e.jsx(e.Fragment,{children:"Open the offer"})},{depth:3,url:"#configure-the-instance",title:e.jsx(e.Fragment,{children:"Configure the instance"})},{depth:3,url:"#limit-network-access",title:e.jsx(e.Fragment,{children:"Limit network access"})},{depth:3,url:"#launch-and-verify",title:e.jsx(e.Fragment,{children:"Launch and verify"})},{depth:2,url:"#next-step",title:e.jsx(e.Fragment,{children:"Next step"})}];function o(n){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...n.components},{Step:r,Steps:i}=t;return r||s("Step"),i||s("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"The AWS Marketplace offering reduces initial setup to an EC2 instance inside your account. You keep control of the network, storage and operation of the machine."}),`
`,e.jsx(t.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Permissions to subscribe to AWS Marketplace products and launch EC2 instances."}),`
`,e.jsx(t.li,{children:"A VPC and a subnet from which administrators and devices can reach the instance."}),`
`,e.jsx(t.li,{children:"A security group allowing the necessary endpoints."}),`
`]}),`
`,e.jsx(t.h2,{id:"infrastructure-requirements",children:"Infrastructure requirements"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Compute:"})," a ",e.jsx(t.code,{children:"t3.large"})," instance at minimum. Use ",e.jsx(t.code,{children:"t3.xlarge"})," or higher when the load requires it."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Storage:"})," an EBS ",e.jsx(t.code,{children:"gp3"})," volume of at least 50 GB, sized to your inventory and retention needs."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Network:"})," HTTPS access from the necessary consumers, restricted to trusted networks."]}),`
`]}),`
`,e.jsxs(i,{children:[e.jsxs(r,{children:[e.jsx(t.h3,{id:"open-the-offer",children:"Open the offer"}),e.jsxs(t.p,{children:["Go to ",e.jsx(t.a,{href:"https://aws.amazon.com/marketplace/pp/prodview-fyfailowg3ewc",children:"Lamassu IoT on AWS Marketplace"})," and review the terms before subscribing."]})]}),e.jsxs(r,{children:[e.jsx(t.h3,{id:"configure-the-instance",children:"Configure the instance"}),e.jsxs(t.p,{children:["Select ",e.jsx(t.code,{children:"t3.large"})," or higher, assign at least 50 GB of ",e.jsx(t.code,{children:"gp3"})," storage and choose the target VPC and subnet."]})]}),e.jsxs(r,{children:[e.jsx(t.h3,{id:"limit-network-access",children:"Limit network access"}),e.jsxs(t.p,{children:["Configure the security group for ports ",e.jsx(t.code,{children:"443"}),", ",e.jsx(t.code,{children:"8443"})," and ",e.jsx(t.code,{children:"9443"}),". Restrict the origins to the administrative and device networks that really need to connect."]})]}),e.jsxs(r,{children:[e.jsx(t.h3,{id:"launch-and-verify",children:"Launch and verify"}),e.jsxs(t.p,{children:["Start the instance and open the console at ",e.jsx(t.code,{children:"https://<public-ip>"}),". Check you can authenticate before continuing."]})]})]}),`
`,e.jsx(t.h2,{id:"next-step",children:"Next step"}),`
`,e.jsxs(t.p,{children:["Continue with ",e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/create-certificate-authority",children:"Create your first CA"})," to validate the instance's cryptographic configuration."]})]})}function u(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(o,{...n})}):o(n)}function s(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:a,default:u,frontmatter:c,structuredData:h,toc:d},Symbol.toStringTag,{value:"Module"}));export{p as _};
