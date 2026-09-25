import{j as e}from"./index-prc0XQdj.js";let r=`

Expose the Lamassu Gateway [#expose-the-lamassu-gateway]

The Lamassu chart creates one shared Gateway with HTTP and HTTPS listeners. Envoy Gateway normally creates a dedicated proxy deployment and a \`LoadBalancer\` Service for it.

\`\`\`text
Client
  |
  v
reachable address:443
  |
  v
LoadBalancer Service -> Envoy proxy -> Lamassu Gateway routes -> services
\`\`\`

External reachability is the result of the whole path. A \`Gateway\` resource alone does not configure your router, firewall, DNS, cloud load balancer or upstream NAT.

Do you need gateway.addresses? [#do-you-need-gatewayaddresses]

Usually, no. If you omit it, the Gateway controller and the cluster load-balancer implementation can assign an address and report it in \`Gateway.status.addresses\` and the generated Service status.

Set it only when:

* your cloud or bare-metal load balancer supports requesting a specific address
* that address is allocated to this Gateway
* the surrounding network already routes traffic for it to the cluster

\`\`\`yaml
gateway:
  addresses:
    - 192.168.1.50
\`\`\`

This requests \`192.168.1.50\`; it does not claim the IP on your LAN or make it reachable.

Keep these two settings separate:

* \`gateway.addresses\` requests an address for the Gateway.
* \`tls.certManagerOptions.certSpec.addresses\` adds IP subject alternative names to the TLS certificate.

If users connect by DNS name, put that name in \`tls.certManagerOptions.certSpec.hostnames\`. Do not copy an upstream proxy's public IP into \`gateway.addresses\`.

Recommended single-node design [#recommended-single-node-design]

For a small VM running K3s or MicroK8s, use one external Lamassu Gateway and route every Lamassu endpoint through it:

\`\`\`text
Internet or LAN
      |
      | DNS: pki.example.com
      v
VM or load-balancer address :443
      |
      v
one Envoy LoadBalancer Service
      |
      v
one Lamassu Gateway
      |
      +-- /              -> UI
      +-- /api/...       -> Lamassu APIs
      +-- /auth/...      -> Keycloak, when configured
\`\`\`

This design uses one IP, one TLS entry point and one pair of ports. The chart already creates the required routes.

K3s [#k3s]

K3s ServiceLB implements each \`LoadBalancer\` Service with pods that reserve the Service ports on the node. On a single node, only one Service can therefore own port 80 and one can own port 443. The default K3s Traefik Service may already hold both ports.

For the recommended design:

1. Use only one externally exposed Lamassu Gateway.
2. Ensure ports 80 and 443 are free. Disable or reconfigure Traefik if it is not part of your traffic path.
3. Allow those ports through the VM firewall and any upstream security group.
4. Point DNS at the VM's reachable address.

See the [K3s ServiceLB documentation](https://docs.k3s.io/networking/networking-services) for its host-port behavior and how to replace it with another load-balancer implementation.

Bare metal with MetalLB or kube-vip [#bare-metal-with-metallb-or-kube-vip]

Allocate a VIP from an address pool reachable on your LAN. You may request that VIP with \`gateway.addresses\` if the selected implementation supports it. Confirm the assigned address in status rather than assuming the request succeeded.

External reverse proxy, NAT or VPN [#external-reverse-proxy-nat-or-vpn]

An external public address can forward TCP 80 and 443 to the VM or to a Kubernetes-side VIP:

\`\`\`text
public IP:443 -> reverse proxy or DNAT -> VPN/LAN -> cluster endpoint:443
\`\`\`

The public IP belongs to the external device. Leave \`gateway.addresses\` unset or set it to the actual Kubernetes-side address, never to an address that the cluster cannot bind.

What if you need three Gateways? [#what-if-you-need-three-gateways]

First decide whether you need three independent data planes or only three hostnames.

| Requirement                                                | Recommended design                          | Consequence                                                                                           |
| ---------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Several Lamassu URLs or services                           | One Gateway with multiple routes            | One IP and one proxy fleet; this is the chart default                                                 |
| Independent Gateways and separate external IPs             | One VIP per Gateway                         | All Gateways can use 80/443; requires a load balancer with an address pool                            |
| Independent Gateways on one node and one IP                | Use different external ports                | Clients must include non-standard ports                                                               |
| Separate TLS/mTLS termination behind one IP                | Front-door SNI routing to internal Gateways | Advanced design; the front door uses TLS passthrough and each internal Gateway terminates its own TLS |
| Separate Gateway resources but shared proxy infrastructure | Envoy merged-Gateway mode                   | Logical separation only; listeners must have unique port, protocol and hostname tuples                |

<Callout type="warn" title="Three Gateways on one K3s node">
  Three independent \`LoadBalancer\` Services cannot all reserve the same node ports 80 and 443 through K3s ServiceLB. Use one shared Gateway, allocate distinct VIPs with another load-balancer implementation, or use different ports.
</Callout>

Envoy Gateway normally provisions a proxy fleet per \`Gateway\`. Its [merged-Gateway mode](https://gateway.envoyproxy.io/docs/tasks/operations/deployment-mode/) can share one fleet and address, but it is not a drop-in switch for multiple Lamassu releases: the generated Lamassu listeners use the same ports and protocols without distinct hostnames, so they conflict unless you deliberately customize the listener design.

Use a front-door SNI design only when the internal Gateways must retain independent TLS or mTLS policy:

\`\`\`text
                         +-> internal Gateway A (terminates api.example.com)
one public IP:443
front-door TLS passthrough+-> internal Gateway B (terminates pki.example.com)
                         +-> internal Gateway C (terminates auth.example.com)
\`\`\`

This requires distinct SNI hostnames and cluster networking outside the Lamassu chart.

Decision guide [#decision-guide]

1. If one Gateway can own TLS and routing, use the chart default.
2. If Gateways need independent policy and you can allocate IPs, use one VIP per Gateway.
3. If only the Kubernetes resources need separation, evaluate merged-Gateway mode and make every listener tuple unique.
4. If data planes and TLS termination must stay independent behind one IP, add a front-door SNI passthrough layer.
5. If none of those are possible, use different external ports or change the external network design.

Verify the traffic path [#verify-the-traffic-path]

\`\`\`bash
kubectl get gateway -A
kubectl describe gateway -n <namespace> <gateway-name>
kubectl get service -A
kubectl get httproute -n <namespace>
\`\`\`

Check, in order:

1. \`Gateway\` has \`Accepted=True\` and \`Programmed=True\`.
2. Its status contains the expected address.
3. The generated \`LoadBalancer\` Service has a usable external address.
4. Port 443 reaches that address from the client network.
5. DNS resolves to the externally reachable endpoint.
6. The certificate contains the DNS name or IP used by the client.

The Gateway API treats addresses as desired state that a controller may assign or reject; see the [Gateway API overview](https://gateway-api.sigs.k8s.io/docs/concepts/api-overview/) for the resource model.
`,i={title:"Expose the Gateway",description:"Choose how clients reach Lamassu, when to set gateway.addresses and how to design multiple Gateways."},d={contents:[{heading:"expose-the-lamassu-gateway",content:"The Lamassu chart creates one shared Gateway with HTTP and HTTPS listeners. Envoy Gateway normally creates a dedicated proxy deployment and a `LoadBalancer` Service for it."},{heading:"expose-the-lamassu-gateway",content:"External reachability is the result of the whole path. A `Gateway` resource alone does not configure your router, firewall, DNS, cloud load balancer or upstream NAT."},{heading:"do-you-need-gatewayaddresses",content:"Usually, no. If you omit it, the Gateway controller and the cluster load-balancer implementation can assign an address and report it in `Gateway.status.addresses` and the generated Service status."},{heading:"do-you-need-gatewayaddresses",content:"Set it only when:"},{heading:"do-you-need-gatewayaddresses",content:"your cloud or bare-metal load balancer supports requesting a specific address"},{heading:"do-you-need-gatewayaddresses",content:"that address is allocated to this Gateway"},{heading:"do-you-need-gatewayaddresses",content:"the surrounding network already routes traffic for it to the cluster"},{heading:"do-you-need-gatewayaddresses",content:"This requests `192.168.1.50`; it does not claim the IP on your LAN or make it reachable."},{heading:"do-you-need-gatewayaddresses",content:"Keep these two settings separate:"},{heading:"do-you-need-gatewayaddresses",content:"`gateway.addresses` requests an address for the Gateway."},{heading:"do-you-need-gatewayaddresses",content:"`tls.certManagerOptions.certSpec.addresses` adds IP subject alternative names to the TLS certificate."},{heading:"do-you-need-gatewayaddresses",content:"If users connect by DNS name, put that name in `tls.certManagerOptions.certSpec.hostnames`. Do not copy an upstream proxy's public IP into `gateway.addresses`."},{heading:"recommended-single-node-design",content:"For a small VM running K3s or MicroK8s, use one external Lamassu Gateway and route every Lamassu endpoint through it:"},{heading:"recommended-single-node-design",content:"This design uses one IP, one TLS entry point and one pair of ports. The chart already creates the required routes."},{heading:"k3s",content:"K3s ServiceLB implements each `LoadBalancer` Service with pods that reserve the Service ports on the node. On a single node, only one Service can therefore own port 80 and one can own port 443. The default K3s Traefik Service may already hold both ports."},{heading:"k3s",content:"For the recommended design:"},{heading:"k3s",content:"Use only one externally exposed Lamassu Gateway."},{heading:"k3s",content:"Ensure ports 80 and 443 are free. Disable or reconfigure Traefik if it is not part of your traffic path."},{heading:"k3s",content:"Allow those ports through the VM firewall and any upstream security group."},{heading:"k3s",content:"Point DNS at the VM's reachable address."},{heading:"k3s",content:"See the K3s ServiceLB documentation for its host-port behavior and how to replace it with another load-balancer implementation."},{heading:"bare-metal-with-metallb-or-kube-vip",content:"Allocate a VIP from an address pool reachable on your LAN. You may request that VIP with `gateway.addresses` if the selected implementation supports it. Confirm the assigned address in status rather than assuming the request succeeded."},{heading:"external-reverse-proxy-nat-or-vpn",content:"An external public address can forward TCP 80 and 443 to the VM or to a Kubernetes-side VIP:"},{heading:"external-reverse-proxy-nat-or-vpn",content:"The public IP belongs to the external device. Leave `gateway.addresses` unset or set it to the actual Kubernetes-side address, never to an address that the cluster cannot bind."},{heading:"what-if-you-need-three-gateways",content:"First decide whether you need three independent data planes or only three hostnames."},{heading:"what-if-you-need-three-gateways",content:"Requirement"},{heading:"what-if-you-need-three-gateways",content:"Recommended design"},{heading:"what-if-you-need-three-gateways",content:"Consequence"},{heading:"what-if-you-need-three-gateways",content:"Several Lamassu URLs or services"},{heading:"what-if-you-need-three-gateways",content:"One Gateway with multiple routes"},{heading:"what-if-you-need-three-gateways",content:"One IP and one proxy fleet; this is the chart default"},{heading:"what-if-you-need-three-gateways",content:"Independent Gateways and separate external IPs"},{heading:"what-if-you-need-three-gateways",content:"One VIP per Gateway"},{heading:"what-if-you-need-three-gateways",content:"All Gateways can use 80/443; requires a load balancer with an address pool"},{heading:"what-if-you-need-three-gateways",content:"Independent Gateways on one node and one IP"},{heading:"what-if-you-need-three-gateways",content:"Use different external ports"},{heading:"what-if-you-need-three-gateways",content:"Clients must include non-standard ports"},{heading:"what-if-you-need-three-gateways",content:"Separate TLS/mTLS termination behind one IP"},{heading:"what-if-you-need-three-gateways",content:"Front-door SNI routing to internal Gateways"},{heading:"what-if-you-need-three-gateways",content:"Advanced design; the front door uses TLS passthrough and each internal Gateway terminates its own TLS"},{heading:"what-if-you-need-three-gateways",content:"Separate Gateway resources but shared proxy infrastructure"},{heading:"what-if-you-need-three-gateways",content:"Envoy merged-Gateway mode"},{heading:"what-if-you-need-three-gateways",content:"Logical separation only; listeners must have unique port, protocol and hostname tuples"},{heading:"what-if-you-need-three-gateways",content:"Three independent `LoadBalancer` Services cannot all reserve the same node ports 80 and 443 through K3s ServiceLB. Use one shared Gateway, allocate distinct VIPs with another load-balancer implementation, or use different ports."},{heading:"what-if-you-need-three-gateways",content:"Envoy Gateway normally provisions a proxy fleet per `Gateway`. Its merged-Gateway mode can share one fleet and address, but it is not a drop-in switch for multiple Lamassu releases: the generated Lamassu listeners use the same ports and protocols without distinct hostnames, so they conflict unless you deliberately customize the listener design."},{heading:"what-if-you-need-three-gateways",content:"Use a front-door SNI design only when the internal Gateways must retain independent TLS or mTLS policy:"},{heading:"what-if-you-need-three-gateways",content:"This requires distinct SNI hostnames and cluster networking outside the Lamassu chart."},{heading:"decision-guide",content:"If one Gateway can own TLS and routing, use the chart default."},{heading:"decision-guide",content:"If Gateways need independent policy and you can allocate IPs, use one VIP per Gateway."},{heading:"decision-guide",content:"If only the Kubernetes resources need separation, evaluate merged-Gateway mode and make every listener tuple unique."},{heading:"decision-guide",content:"If data planes and TLS termination must stay independent behind one IP, add a front-door SNI passthrough layer."},{heading:"decision-guide",content:"If none of those are possible, use different external ports or change the external network design."},{heading:"verify-the-traffic-path",content:"Check, in order:"},{heading:"verify-the-traffic-path",content:"`Gateway` has `Accepted=True` and `Programmed=True`."},{heading:"verify-the-traffic-path",content:"Its status contains the expected address."},{heading:"verify-the-traffic-path",content:"The generated `LoadBalancer` Service has a usable external address."},{heading:"verify-the-traffic-path",content:"Port 443 reaches that address from the client network."},{heading:"verify-the-traffic-path",content:"DNS resolves to the externally reachable endpoint."},{heading:"verify-the-traffic-path",content:"The certificate contains the DNS name or IP used by the client."},{heading:"verify-the-traffic-path",content:"The Gateway API treats addresses as desired state that a controller may assign or reject; see the Gateway API overview for the resource model."}],headings:[{id:"expose-the-lamassu-gateway",content:"Expose the Lamassu Gateway"},{id:"do-you-need-gatewayaddresses",content:"Do you need `gateway.addresses`?"},{id:"recommended-single-node-design",content:"Recommended single-node design"},{id:"k3s",content:"K3s"},{id:"bare-metal-with-metallb-or-kube-vip",content:"Bare metal with MetalLB or kube-vip"},{id:"external-reverse-proxy-nat-or-vpn",content:"External reverse proxy, NAT or VPN"},{id:"what-if-you-need-three-gateways",content:"What if you need three Gateways?"},{id:"decision-guide",content:"Decision guide"},{id:"verify-the-traffic-path",content:"Verify the traffic path"}]};const o=[{depth:1,url:"#expose-the-lamassu-gateway",title:e.jsx(e.Fragment,{children:"Expose the Lamassu Gateway"})},{depth:2,url:"#do-you-need-gatewayaddresses",title:e.jsxs(e.Fragment,{children:["Do you need ",e.jsx("code",{children:"gateway.addresses"}),"?"]})},{depth:2,url:"#recommended-single-node-design",title:e.jsx(e.Fragment,{children:"Recommended single-node design"})},{depth:3,url:"#k3s",title:e.jsx(e.Fragment,{children:"K3s"})},{depth:3,url:"#bare-metal-with-metallb-or-kube-vip",title:e.jsx(e.Fragment,{children:"Bare metal with MetalLB or kube-vip"})},{depth:3,url:"#external-reverse-proxy-nat-or-vpn",title:e.jsx(e.Fragment,{children:"External reverse proxy, NAT or VPN"})},{depth:2,url:"#what-if-you-need-three-gateways",title:e.jsx(e.Fragment,{children:"What if you need three Gateways?"})},{depth:2,url:"#decision-guide",title:e.jsx(e.Fragment,{children:"Decision guide"})},{depth:2,url:"#verify-the-traffic-path",title:e.jsx(e.Fragment,{children:"Verify the traffic path"})}];function s(a){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...a.components},{Callout:t}=n;return t||l("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"expose-the-lamassu-gateway",children:"Expose the Lamassu Gateway"}),`
`,e.jsxs(n.p,{children:["The Lamassu chart creates one shared Gateway with HTTP and HTTPS listeners. Envoy Gateway normally creates a dedicated proxy deployment and a ",e.jsx(n.code,{children:"LoadBalancer"})," Service for it."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Client"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  |"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  v"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"reachable address:443"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  |"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  v"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"LoadBalancer Service -> Envoy proxy -> Lamassu Gateway routes -> services"})})]})})}),`
`,e.jsxs(n.p,{children:["External reachability is the result of the whole path. A ",e.jsx(n.code,{children:"Gateway"})," resource alone does not configure your router, firewall, DNS, cloud load balancer or upstream NAT."]}),`
`,e.jsxs(n.h2,{id:"do-you-need-gatewayaddresses",children:["Do you need ",e.jsx(n.code,{children:"gateway.addresses"}),"?"]}),`
`,e.jsxs(n.p,{children:["Usually, no. If you omit it, the Gateway controller and the cluster load-balancer implementation can assign an address and report it in ",e.jsx(n.code,{children:"Gateway.status.addresses"})," and the generated Service status."]}),`
`,e.jsx(n.p,{children:"Set it only when:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"your cloud or bare-metal load balancer supports requesting a specific address"}),`
`,e.jsx(n.li,{children:"that address is allocated to this Gateway"}),`
`,e.jsx(n.li,{children:"the surrounding network already routes traffic for it to the cluster"}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"gateway"}),e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  addresses"}),e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    - "}),e.jsx(n.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:"192.168.1.50"})]})]})})}),`
`,e.jsxs(n.p,{children:["This requests ",e.jsx(n.code,{children:"192.168.1.50"}),"; it does not claim the IP on your LAN or make it reachable."]}),`
`,e.jsx(n.p,{children:"Keep these two settings separate:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"gateway.addresses"})," requests an address for the Gateway."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"tls.certManagerOptions.certSpec.addresses"})," adds IP subject alternative names to the TLS certificate."]}),`
`]}),`
`,e.jsxs(n.p,{children:["If users connect by DNS name, put that name in ",e.jsx(n.code,{children:"tls.certManagerOptions.certSpec.hostnames"}),". Do not copy an upstream proxy's public IP into ",e.jsx(n.code,{children:"gateway.addresses"}),"."]}),`
`,e.jsx(n.h2,{id:"recommended-single-node-design",children:"Recommended single-node design"}),`
`,e.jsx(n.p,{children:"For a small VM running K3s or MicroK8s, use one external Lamassu Gateway and route every Lamassu endpoint through it:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Internet or LAN"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"      |"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"      | DNS: pki.example.com"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"      v"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"VM or load-balancer address :443"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"      |"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"      v"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"one Envoy LoadBalancer Service"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"      |"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"      v"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"one Lamassu Gateway"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"      |"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"      +-- /              -> UI"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"      +-- /api/...       -> Lamassu APIs"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"      +-- /auth/...      -> Keycloak, when configured"})})]})})}),`
`,e.jsx(n.p,{children:"This design uses one IP, one TLS entry point and one pair of ports. The chart already creates the required routes."}),`
`,e.jsx(n.h3,{id:"k3s",children:"K3s"}),`
`,e.jsxs(n.p,{children:["K3s ServiceLB implements each ",e.jsx(n.code,{children:"LoadBalancer"})," Service with pods that reserve the Service ports on the node. On a single node, only one Service can therefore own port 80 and one can own port 443. The default K3s Traefik Service may already hold both ports."]}),`
`,e.jsx(n.p,{children:"For the recommended design:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Use only one externally exposed Lamassu Gateway."}),`
`,e.jsx(n.li,{children:"Ensure ports 80 and 443 are free. Disable or reconfigure Traefik if it is not part of your traffic path."}),`
`,e.jsx(n.li,{children:"Allow those ports through the VM firewall and any upstream security group."}),`
`,e.jsx(n.li,{children:"Point DNS at the VM's reachable address."}),`
`]}),`
`,e.jsxs(n.p,{children:["See the ",e.jsx(n.a,{href:"https://docs.k3s.io/networking/networking-services",children:"K3s ServiceLB documentation"})," for its host-port behavior and how to replace it with another load-balancer implementation."]}),`
`,e.jsx(n.h3,{id:"bare-metal-with-metallb-or-kube-vip",children:"Bare metal with MetalLB or kube-vip"}),`
`,e.jsxs(n.p,{children:["Allocate a VIP from an address pool reachable on your LAN. You may request that VIP with ",e.jsx(n.code,{children:"gateway.addresses"})," if the selected implementation supports it. Confirm the assigned address in status rather than assuming the request succeeded."]}),`
`,e.jsx(n.h3,{id:"external-reverse-proxy-nat-or-vpn",children:"External reverse proxy, NAT or VPN"}),`
`,e.jsx(n.p,{children:"An external public address can forward TCP 80 and 443 to the VM or to a Kubernetes-side VIP:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"public IP:443 -> reverse proxy or DNAT -> VPN/LAN -> cluster endpoint:443"})})})})}),`
`,e.jsxs(n.p,{children:["The public IP belongs to the external device. Leave ",e.jsx(n.code,{children:"gateway.addresses"})," unset or set it to the actual Kubernetes-side address, never to an address that the cluster cannot bind."]}),`
`,e.jsx(n.h2,{id:"what-if-you-need-three-gateways",children:"What if you need three Gateways?"}),`
`,e.jsx(n.p,{children:"First decide whether you need three independent data planes or only three hostnames."}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Requirement"}),e.jsx(n.th,{children:"Recommended design"}),e.jsx(n.th,{children:"Consequence"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Several Lamassu URLs or services"}),e.jsx(n.td,{children:"One Gateway with multiple routes"}),e.jsx(n.td,{children:"One IP and one proxy fleet; this is the chart default"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Independent Gateways and separate external IPs"}),e.jsx(n.td,{children:"One VIP per Gateway"}),e.jsx(n.td,{children:"All Gateways can use 80/443; requires a load balancer with an address pool"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Independent Gateways on one node and one IP"}),e.jsx(n.td,{children:"Use different external ports"}),e.jsx(n.td,{children:"Clients must include non-standard ports"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Separate TLS/mTLS termination behind one IP"}),e.jsx(n.td,{children:"Front-door SNI routing to internal Gateways"}),e.jsx(n.td,{children:"Advanced design; the front door uses TLS passthrough and each internal Gateway terminates its own TLS"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Separate Gateway resources but shared proxy infrastructure"}),e.jsx(n.td,{children:"Envoy merged-Gateway mode"}),e.jsx(n.td,{children:"Logical separation only; listeners must have unique port, protocol and hostname tuples"})]})]})]}),`
`,e.jsx(t,{type:"warn",title:"Three Gateways on one K3s node",children:e.jsxs(n.p,{children:["Three independent ",e.jsx(n.code,{children:"LoadBalancer"})," Services cannot all reserve the same node ports 80 and 443 through K3s ServiceLB. Use one shared Gateway, allocate distinct VIPs with another load-balancer implementation, or use different ports."]})}),`
`,e.jsxs(n.p,{children:["Envoy Gateway normally provisions a proxy fleet per ",e.jsx(n.code,{children:"Gateway"}),". Its ",e.jsx(n.a,{href:"https://gateway.envoyproxy.io/docs/tasks/operations/deployment-mode/",children:"merged-Gateway mode"})," can share one fleet and address, but it is not a drop-in switch for multiple Lamassu releases: the generated Lamassu listeners use the same ports and protocols without distinct hostnames, so they conflict unless you deliberately customize the listener design."]}),`
`,e.jsx(n.p,{children:"Use a front-door SNI design only when the internal Gateways must retain independent TLS or mTLS policy:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"                         +-> internal Gateway A (terminates api.example.com)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"one public IP:443"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"front-door TLS passthrough+-> internal Gateway B (terminates pki.example.com)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"                         +-> internal Gateway C (terminates auth.example.com)"})})]})})}),`
`,e.jsx(n.p,{children:"This requires distinct SNI hostnames and cluster networking outside the Lamassu chart."}),`
`,e.jsx(n.h2,{id:"decision-guide",children:"Decision guide"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"If one Gateway can own TLS and routing, use the chart default."}),`
`,e.jsx(n.li,{children:"If Gateways need independent policy and you can allocate IPs, use one VIP per Gateway."}),`
`,e.jsx(n.li,{children:"If only the Kubernetes resources need separation, evaluate merged-Gateway mode and make every listener tuple unique."}),`
`,e.jsx(n.li,{children:"If data planes and TLS termination must stay independent behind one IP, add a front-door SNI passthrough layer."}),`
`,e.jsx(n.li,{children:"If none of those are possible, use different external ports or change the external network design."}),`
`]}),`
`,e.jsx(n.h2,{id:"verify-the-traffic-path",children:"Verify the traffic path"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" gateway"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -A"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" describe"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" gateway"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"namespac"}),e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"gateway-nam"}),e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" service"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -A"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" httproute"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"namespac"}),e.jsx(n.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(n.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"})]})]})})}),`
`,e.jsx(n.p,{children:"Check, in order:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Gateway"})," has ",e.jsx(n.code,{children:"Accepted=True"})," and ",e.jsx(n.code,{children:"Programmed=True"}),"."]}),`
`,e.jsx(n.li,{children:"Its status contains the expected address."}),`
`,e.jsxs(n.li,{children:["The generated ",e.jsx(n.code,{children:"LoadBalancer"})," Service has a usable external address."]}),`
`,e.jsx(n.li,{children:"Port 443 reaches that address from the client network."}),`
`,e.jsx(n.li,{children:"DNS resolves to the externally reachable endpoint."}),`
`,e.jsx(n.li,{children:"The certificate contains the DNS name or IP used by the client."}),`
`]}),`
`,e.jsxs(n.p,{children:["The Gateway API treats addresses as desired state that a controller may assign or reject; see the ",e.jsx(n.a,{href:"https://gateway-api.sigs.k8s.io/docs/concepts/api-overview/",children:"Gateway API overview"})," for the resource model."]})]})}function h(a={}){const{wrapper:n}=a.components||{};return n?e.jsx(n,{...a,children:e.jsx(s,{...a})}):s(a)}function l(a,n){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:r,default:h,frontmatter:i,structuredData:d,toc:o},Symbol.toStringTag,{value:"Module"}));export{p as _};
