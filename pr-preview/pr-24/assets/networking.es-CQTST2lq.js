import{j as e}from"./index-prc0XQdj.js";let r=`

Expón el Gateway de Lamassu [#expón-el-gateway-de-lamassu]

El chart de Lamassu crea un Gateway compartido con listeners HTTP y HTTPS. Envoy Gateway crea normalmente un deployment de proxy dedicado y un Service \`LoadBalancer\`.

\`\`\`text
Cliente
  |
  v
dirección accesible:443
  |
  v
Service LoadBalancer -> proxy Envoy -> rutas del Gateway -> servicios
\`\`\`

La accesibilidad externa depende de toda la ruta. Un recurso \`Gateway\` no configura por sí mismo el router, firewall, DNS, balanceador cloud ni NAT upstream.

¿Necesitas gateway.addresses? [#necesitas-gatewayaddresses]

Normalmente no. Si lo omites, el controlador del Gateway y la implementación del balanceador pueden asignar una dirección y publicarla en \`Gateway.status.addresses\` y en el estado del Service generado.

Defínelo únicamente cuando:

* tu balanceador cloud o bare metal permite solicitar una dirección concreta
* esa dirección está asignada a este Gateway
* la red ya enruta el tráfico de esa dirección hasta el clúster

\`\`\`yaml
gateway:
  addresses:
    - 192.168.1.50
\`\`\`

Esto solicita \`192.168.1.50\`; no reclama la IP en tu LAN ni la vuelve accesible.

No confundas estos valores:

* \`gateway.addresses\` solicita una dirección para el Gateway.
* \`tls.certManagerOptions.certSpec.addresses\` añade direcciones IP a los SAN del certificado TLS.

Si los usuarios se conectan por DNS, añade el nombre a \`tls.certManagerOptions.certSpec.hostnames\`. No copies la IP pública de un proxy upstream en \`gateway.addresses\`.

Diseño recomendado para un solo nodo [#diseño-recomendado-para-un-solo-nodo]

Para una VM pequeña con K3s o MicroK8s, usa un único Gateway externo de Lamassu y enruta todos los endpoints a través de él:

\`\`\`text
Internet o LAN
      |
      | DNS: pki.example.com
      v
Dirección de la VM o balanceador :443
      |
      v
un Service LoadBalancer de Envoy
      |
      v
un Gateway de Lamassu
      |
      +-- /              -> UI
      +-- /api/...       -> APIs de Lamassu
      +-- /auth/...      -> Keycloak, si se configura
\`\`\`

Este diseño utiliza una IP, un punto de entrada TLS y un único par de puertos. El chart ya crea las rutas necesarias.

K3s [#k3s]

K3s ServiceLB implementa cada Service \`LoadBalancer\` mediante pods que reservan los puertos del Service en el nodo. En un único nodo, solo un Service puede ocupar el puerto 80 y otro el 443. El Service Traefik que K3s instala por defecto puede estar ocupando ambos.

Para el diseño recomendado:

1. Usa un único Gateway de Lamassu expuesto externamente.
2. Comprueba que los puertos 80 y 443 están libres. Deshabilita o reconfigura Traefik si no forma parte de la ruta de tráfico.
3. Permite esos puertos en el firewall de la VM y en cualquier security group upstream.
4. Apunta DNS a la dirección accesible de la VM.

Consulta la [documentación de K3s ServiceLB](https://docs.k3s.io/networking/networking-services) para conocer el uso de host ports y cómo sustituirlo por otro balanceador.

Bare metal con MetalLB o kube-vip [#bare-metal-con-metallb-o-kube-vip]

Asigna una VIP de un pool accesible desde la LAN. Puedes solicitarla con \`gateway.addresses\` si la implementación lo permite. Confirma la dirección asignada en el estado en lugar de asumir que la solicitud tuvo éxito.

Proxy externo, NAT o VPN [#proxy-externo-nat-o-vpn]

Una dirección pública externa puede reenviar TCP 80 y 443 a la VM o a una VIP de Kubernetes:

\`\`\`text
IP pública:443 -> proxy o DNAT -> VPN/LAN -> endpoint del clúster:443
\`\`\`

La IP pública pertenece al dispositivo externo. Deja \`gateway.addresses\` sin definir o usa la dirección real del lado de Kubernetes, nunca una IP que el clúster no pueda asociar.

¿Qué ocurre si necesitas tres Gateways? [#qué-ocurre-si-necesitas-tres-gateways]

Primero decide si necesitas tres data planes independientes o solo tres nombres de host.

| Requisito                                        | Diseño recomendado                                      | Consecuencia                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Varias URL o servicios de Lamassu                | Un Gateway con varias rutas                             | Una IP y un proxy fleet; es el comportamiento predeterminado del chart                         |
| Gateways independientes e IP externas distintas  | Una VIP por Gateway                                     | Todos pueden usar 80/443; requiere un balanceador con un pool de direcciones                   |
| Gateways independientes, un nodo y una IP        | Puertos externos diferentes                             | Los clientes deben indicar puertos no estándar                                                 |
| Terminación TLS/mTLS separada detrás de una IP   | Front door con enrutamiento SNI hacia Gateways internos | Diseño avanzado; el front door usa TLS passthrough y cada Gateway termina su propio TLS        |
| Recursos Gateway separados pero proxy compartido | Modo merged Gateway de Envoy                            | Solo separación lógica; cada listener necesita una tupla única de puerto, protocolo y hostname |

<Callout type="warn" title="Tres Gateways en un nodo K3s">
  Tres Services \`LoadBalancer\` independientes no pueden reservar a la vez los mismos puertos 80 y 443 mediante K3s ServiceLB. Usa un Gateway compartido, asigna VIP distintas con otro balanceador o utiliza puertos diferentes.
</Callout>

Envoy Gateway provisiona normalmente un proxy fleet por \`Gateway\`. Su [modo merged Gateway](https://gateway.envoyproxy.io/docs/tasks/operations/deployment-mode/) puede compartir un fleet y una dirección, pero no es un cambio directo para varias releases de Lamassu: los listeners generados usan los mismos puertos y protocolos sin hostnames distintos, por lo que entran en conflicto salvo que personalices el diseño.

Usa un front door con SNI solo cuando los Gateways internos deban mantener políticas TLS o mTLS independientes:

\`\`\`text
                     +-> Gateway interno A (termina api.example.com)
una IP pública:443
front door passthrough+-> Gateway interno B (termina pki.example.com)
                     +-> Gateway interno C (termina auth.example.com)
\`\`\`

Esto requiere hostnames SNI distintos y configuración de red externa al chart de Lamassu.

Guía de decisión [#guía-de-decisión]

1. Si un Gateway puede gestionar TLS y el enrutamiento, usa el valor predeterminado del chart.
2. Si los Gateways necesitan políticas independientes y puedes asignar IP, usa una VIP por Gateway.
3. Si solo necesitas separar los recursos Kubernetes, evalúa merged Gateway y usa tuplas de listener únicas.
4. Si los data planes y la terminación TLS deben ser independientes detrás de una IP, añade un front door con TLS passthrough y SNI.
5. Si nada de lo anterior es posible, usa puertos externos distintos o cambia el diseño de red.

Verifica la ruta de tráfico [#verifica-la-ruta-de-tráfico]

\`\`\`bash
kubectl get gateway -A
kubectl describe gateway -n <namespace> <gateway-name>
kubectl get service -A
kubectl get httproute -n <namespace>
\`\`\`

Comprueba, en orden:

1. El \`Gateway\` muestra \`Accepted=True\` y \`Programmed=True\`.
2. Su estado contiene la dirección esperada.
3. El Service \`LoadBalancer\` generado tiene una dirección externa utilizable.
4. El puerto 443 de esa dirección es accesible desde la red del cliente.
5. DNS resuelve al endpoint accesible externamente.
6. El certificado contiene el nombre DNS o la IP usada por el cliente.

Gateway API trata las direcciones como estado deseado que el controlador puede asignar o rechazar; consulta la [introducción a Gateway API](https://gateway-api.sigs.k8s.io/docs/concepts/api-overview/) para conocer el modelo.
`,t={title:"Expón el Gateway",description:"Elige cómo llegan los clientes a Lamassu, cuándo definir gateway.addresses y cómo diseñar varios Gateways."},o={contents:[{heading:"expón-el-gateway-de-lamassu",content:"El chart de Lamassu crea un Gateway compartido con listeners HTTP y HTTPS. Envoy Gateway crea normalmente un deployment de proxy dedicado y un Service `LoadBalancer`."},{heading:"expón-el-gateway-de-lamassu",content:"La accesibilidad externa depende de toda la ruta. Un recurso `Gateway` no configura por sí mismo el router, firewall, DNS, balanceador cloud ni NAT upstream."},{heading:"necesitas-gatewayaddresses",content:"Normalmente no. Si lo omites, el controlador del Gateway y la implementación del balanceador pueden asignar una dirección y publicarla en `Gateway.status.addresses` y en el estado del Service generado."},{heading:"necesitas-gatewayaddresses",content:"Defínelo únicamente cuando:"},{heading:"necesitas-gatewayaddresses",content:"tu balanceador cloud o bare metal permite solicitar una dirección concreta"},{heading:"necesitas-gatewayaddresses",content:"esa dirección está asignada a este Gateway"},{heading:"necesitas-gatewayaddresses",content:"la red ya enruta el tráfico de esa dirección hasta el clúster"},{heading:"necesitas-gatewayaddresses",content:"Esto solicita `192.168.1.50`; no reclama la IP en tu LAN ni la vuelve accesible."},{heading:"necesitas-gatewayaddresses",content:"No confundas estos valores:"},{heading:"necesitas-gatewayaddresses",content:"`gateway.addresses` solicita una dirección para el Gateway."},{heading:"necesitas-gatewayaddresses",content:"`tls.certManagerOptions.certSpec.addresses` añade direcciones IP a los SAN del certificado TLS."},{heading:"necesitas-gatewayaddresses",content:"Si los usuarios se conectan por DNS, añade el nombre a `tls.certManagerOptions.certSpec.hostnames`. No copies la IP pública de un proxy upstream en `gateway.addresses`."},{heading:"diseño-recomendado-para-un-solo-nodo",content:"Para una VM pequeña con K3s o MicroK8s, usa un único Gateway externo de Lamassu y enruta todos los endpoints a través de él:"},{heading:"diseño-recomendado-para-un-solo-nodo",content:"Este diseño utiliza una IP, un punto de entrada TLS y un único par de puertos. El chart ya crea las rutas necesarias."},{heading:"k3s",content:"K3s ServiceLB implementa cada Service `LoadBalancer` mediante pods que reservan los puertos del Service en el nodo. En un único nodo, solo un Service puede ocupar el puerto 80 y otro el 443. El Service Traefik que K3s instala por defecto puede estar ocupando ambos."},{heading:"k3s",content:"Para el diseño recomendado:"},{heading:"k3s",content:"Usa un único Gateway de Lamassu expuesto externamente."},{heading:"k3s",content:"Comprueba que los puertos 80 y 443 están libres. Deshabilita o reconfigura Traefik si no forma parte de la ruta de tráfico."},{heading:"k3s",content:"Permite esos puertos en el firewall de la VM y en cualquier security group upstream."},{heading:"k3s",content:"Apunta DNS a la dirección accesible de la VM."},{heading:"k3s",content:"Consulta la documentación de K3s ServiceLB para conocer el uso de host ports y cómo sustituirlo por otro balanceador."},{heading:"bare-metal-con-metallb-o-kube-vip",content:"Asigna una VIP de un pool accesible desde la LAN. Puedes solicitarla con `gateway.addresses` si la implementación lo permite. Confirma la dirección asignada en el estado en lugar de asumir que la solicitud tuvo éxito."},{heading:"proxy-externo-nat-o-vpn",content:"Una dirección pública externa puede reenviar TCP 80 y 443 a la VM o a una VIP de Kubernetes:"},{heading:"proxy-externo-nat-o-vpn",content:"La IP pública pertenece al dispositivo externo. Deja `gateway.addresses` sin definir o usa la dirección real del lado de Kubernetes, nunca una IP que el clúster no pueda asociar."},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Primero decide si necesitas tres data planes independientes o solo tres nombres de host."},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Requisito"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Diseño recomendado"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Consecuencia"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Varias URL o servicios de Lamassu"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Un Gateway con varias rutas"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Una IP y un proxy fleet; es el comportamiento predeterminado del chart"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Gateways independientes e IP externas distintas"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Una VIP por Gateway"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Todos pueden usar 80/443; requiere un balanceador con un pool de direcciones"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Gateways independientes, un nodo y una IP"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Puertos externos diferentes"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Los clientes deben indicar puertos no estándar"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Terminación TLS/mTLS separada detrás de una IP"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Front door con enrutamiento SNI hacia Gateways internos"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Diseño avanzado; el front door usa TLS passthrough y cada Gateway termina su propio TLS"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Recursos Gateway separados pero proxy compartido"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Modo merged Gateway de Envoy"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Solo separación lógica; cada listener necesita una tupla única de puerto, protocolo y hostname"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Tres Services `LoadBalancer` independientes no pueden reservar a la vez los mismos puertos 80 y 443 mediante K3s ServiceLB. Usa un Gateway compartido, asigna VIP distintas con otro balanceador o utiliza puertos diferentes."},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Envoy Gateway provisiona normalmente un proxy fleet por `Gateway`. Su modo merged Gateway puede compartir un fleet y una dirección, pero no es un cambio directo para varias releases de Lamassu: los listeners generados usan los mismos puertos y protocolos sin hostnames distintos, por lo que entran en conflicto salvo que personalices el diseño."},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Usa un front door con SNI solo cuando los Gateways internos deban mantener políticas TLS o mTLS independientes:"},{heading:"qué-ocurre-si-necesitas-tres-gateways",content:"Esto requiere hostnames SNI distintos y configuración de red externa al chart de Lamassu."},{heading:"guía-de-decisión",content:"Si un Gateway puede gestionar TLS y el enrutamiento, usa el valor predeterminado del chart."},{heading:"guía-de-decisión",content:"Si los Gateways necesitan políticas independientes y puedes asignar IP, usa una VIP por Gateway."},{heading:"guía-de-decisión",content:"Si solo necesitas separar los recursos Kubernetes, evalúa merged Gateway y usa tuplas de listener únicas."},{heading:"guía-de-decisión",content:"Si los data planes y la terminación TLS deben ser independientes detrás de una IP, añade un front door con TLS passthrough y SNI."},{heading:"guía-de-decisión",content:"Si nada de lo anterior es posible, usa puertos externos distintos o cambia el diseño de red."},{heading:"verifica-la-ruta-de-tráfico",content:"Comprueba, en orden:"},{heading:"verifica-la-ruta-de-tráfico",content:"El `Gateway` muestra `Accepted=True` y `Programmed=True`."},{heading:"verifica-la-ruta-de-tráfico",content:"Su estado contiene la dirección esperada."},{heading:"verifica-la-ruta-de-tráfico",content:"El Service `LoadBalancer` generado tiene una dirección externa utilizable."},{heading:"verifica-la-ruta-de-tráfico",content:"El puerto 443 de esa dirección es accesible desde la red del cliente."},{heading:"verifica-la-ruta-de-tráfico",content:"DNS resuelve al endpoint accesible externamente."},{heading:"verifica-la-ruta-de-tráfico",content:"El certificado contiene el nombre DNS o la IP usada por el cliente."},{heading:"verifica-la-ruta-de-tráfico",content:"Gateway API trata las direcciones como estado deseado que el controlador puede asignar o rechazar; consulta la introducción a Gateway API para conocer el modelo."}],headings:[{id:"expón-el-gateway-de-lamassu",content:"Expón el Gateway de Lamassu"},{id:"necesitas-gatewayaddresses",content:"¿Necesitas `gateway.addresses`?"},{id:"diseño-recomendado-para-un-solo-nodo",content:"Diseño recomendado para un solo nodo"},{id:"k3s",content:"K3s"},{id:"bare-metal-con-metallb-o-kube-vip",content:"Bare metal con MetalLB o kube-vip"},{id:"proxy-externo-nat-o-vpn",content:"Proxy externo, NAT o VPN"},{id:"qué-ocurre-si-necesitas-tres-gateways",content:"¿Qué ocurre si necesitas tres Gateways?"},{id:"guía-de-decisión",content:"Guía de decisión"},{id:"verifica-la-ruta-de-tráfico",content:"Verifica la ruta de tráfico"}]};const d=[{depth:1,url:"#expón-el-gateway-de-lamassu",title:e.jsx(e.Fragment,{children:"Expón el Gateway de Lamassu"})},{depth:2,url:"#necesitas-gatewayaddresses",title:e.jsxs(e.Fragment,{children:["¿Necesitas ",e.jsx("code",{children:"gateway.addresses"}),"?"]})},{depth:2,url:"#diseño-recomendado-para-un-solo-nodo",title:e.jsx(e.Fragment,{children:"Diseño recomendado para un solo nodo"})},{depth:3,url:"#k3s",title:e.jsx(e.Fragment,{children:"K3s"})},{depth:3,url:"#bare-metal-con-metallb-o-kube-vip",title:e.jsx(e.Fragment,{children:"Bare metal con MetalLB o kube-vip"})},{depth:3,url:"#proxy-externo-nat-o-vpn",title:e.jsx(e.Fragment,{children:"Proxy externo, NAT o VPN"})},{depth:2,url:"#qué-ocurre-si-necesitas-tres-gateways",title:e.jsx(e.Fragment,{children:"¿Qué ocurre si necesitas tres Gateways?"})},{depth:2,url:"#guía-de-decisión",title:e.jsx(e.Fragment,{children:"Guía de decisión"})},{depth:2,url:"#verifica-la-ruta-de-tráfico",title:e.jsx(e.Fragment,{children:"Verifica la ruta de tráfico"})}];function i(n){const a={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components},{Callout:s}=a;return s||l("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(a.h1,{id:"expón-el-gateway-de-lamassu",children:"Expón el Gateway de Lamassu"}),`
`,e.jsxs(a.p,{children:["El chart de Lamassu crea un Gateway compartido con listeners HTTP y HTTPS. Envoy Gateway crea normalmente un deployment de proxy dedicado y un Service ",e.jsx(a.code,{children:"LoadBalancer"}),"."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(a.code,{children:[e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"Cliente"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"  |"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"  v"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"dirección accesible:443"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"  |"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"  v"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"Service LoadBalancer -> proxy Envoy -> rutas del Gateway -> servicios"})})]})})}),`
`,e.jsxs(a.p,{children:["La accesibilidad externa depende de toda la ruta. Un recurso ",e.jsx(a.code,{children:"Gateway"})," no configura por sí mismo el router, firewall, DNS, balanceador cloud ni NAT upstream."]}),`
`,e.jsxs(a.h2,{id:"necesitas-gatewayaddresses",children:["¿Necesitas ",e.jsx(a.code,{children:"gateway.addresses"}),"?"]}),`
`,e.jsxs(a.p,{children:["Normalmente no. Si lo omites, el controlador del Gateway y la implementación del balanceador pueden asignar una dirección y publicarla en ",e.jsx(a.code,{children:"Gateway.status.addresses"})," y en el estado del Service generado."]}),`
`,e.jsx(a.p,{children:"Defínelo únicamente cuando:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"tu balanceador cloud o bare metal permite solicitar una dirección concreta"}),`
`,e.jsx(a.li,{children:"esa dirección está asignada a este Gateway"}),`
`,e.jsx(a.li,{children:"la red ya enruta el tráfico de esa dirección hasta el clúster"}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(a.code,{children:[e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"gateway"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  addresses"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    - "}),e.jsx(a.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:"192.168.1.50"})]})]})})}),`
`,e.jsxs(a.p,{children:["Esto solicita ",e.jsx(a.code,{children:"192.168.1.50"}),"; no reclama la IP en tu LAN ni la vuelve accesible."]}),`
`,e.jsx(a.p,{children:"No confundas estos valores:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"gateway.addresses"})," solicita una dirección para el Gateway."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"tls.certManagerOptions.certSpec.addresses"})," añade direcciones IP a los SAN del certificado TLS."]}),`
`]}),`
`,e.jsxs(a.p,{children:["Si los usuarios se conectan por DNS, añade el nombre a ",e.jsx(a.code,{children:"tls.certManagerOptions.certSpec.hostnames"}),". No copies la IP pública de un proxy upstream en ",e.jsx(a.code,{children:"gateway.addresses"}),"."]}),`
`,e.jsx(a.h2,{id:"diseño-recomendado-para-un-solo-nodo",children:"Diseño recomendado para un solo nodo"}),`
`,e.jsx(a.p,{children:"Para una VM pequeña con K3s o MicroK8s, usa un único Gateway externo de Lamassu y enruta todos los endpoints a través de él:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(a.code,{children:[e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"Internet o LAN"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"      |"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"      | DNS: pki.example.com"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"      v"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"Dirección de la VM o balanceador :443"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"      |"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"      v"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"un Service LoadBalancer de Envoy"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"      |"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"      v"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"un Gateway de Lamassu"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"      |"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"      +-- /              -> UI"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"      +-- /api/...       -> APIs de Lamassu"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"      +-- /auth/...      -> Keycloak, si se configura"})})]})})}),`
`,e.jsx(a.p,{children:"Este diseño utiliza una IP, un punto de entrada TLS y un único par de puertos. El chart ya crea las rutas necesarias."}),`
`,e.jsx(a.h3,{id:"k3s",children:"K3s"}),`
`,e.jsxs(a.p,{children:["K3s ServiceLB implementa cada Service ",e.jsx(a.code,{children:"LoadBalancer"})," mediante pods que reservan los puertos del Service en el nodo. En un único nodo, solo un Service puede ocupar el puerto 80 y otro el 443. El Service Traefik que K3s instala por defecto puede estar ocupando ambos."]}),`
`,e.jsx(a.p,{children:"Para el diseño recomendado:"}),`
`,e.jsxs(a.ol,{children:[`
`,e.jsx(a.li,{children:"Usa un único Gateway de Lamassu expuesto externamente."}),`
`,e.jsx(a.li,{children:"Comprueba que los puertos 80 y 443 están libres. Deshabilita o reconfigura Traefik si no forma parte de la ruta de tráfico."}),`
`,e.jsx(a.li,{children:"Permite esos puertos en el firewall de la VM y en cualquier security group upstream."}),`
`,e.jsx(a.li,{children:"Apunta DNS a la dirección accesible de la VM."}),`
`]}),`
`,e.jsxs(a.p,{children:["Consulta la ",e.jsx(a.a,{href:"https://docs.k3s.io/networking/networking-services",children:"documentación de K3s ServiceLB"})," para conocer el uso de host ports y cómo sustituirlo por otro balanceador."]}),`
`,e.jsx(a.h3,{id:"bare-metal-con-metallb-o-kube-vip",children:"Bare metal con MetalLB o kube-vip"}),`
`,e.jsxs(a.p,{children:["Asigna una VIP de un pool accesible desde la LAN. Puedes solicitarla con ",e.jsx(a.code,{children:"gateway.addresses"})," si la implementación lo permite. Confirma la dirección asignada en el estado en lugar de asumir que la solicitud tuvo éxito."]}),`
`,e.jsx(a.h3,{id:"proxy-externo-nat-o-vpn",children:"Proxy externo, NAT o VPN"}),`
`,e.jsx(a.p,{children:"Una dirección pública externa puede reenviar TCP 80 y 443 a la VM o a una VIP de Kubernetes:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"IP pública:443 -> proxy o DNAT -> VPN/LAN -> endpoint del clúster:443"})})})})}),`
`,e.jsxs(a.p,{children:["La IP pública pertenece al dispositivo externo. Deja ",e.jsx(a.code,{children:"gateway.addresses"})," sin definir o usa la dirección real del lado de Kubernetes, nunca una IP que el clúster no pueda asociar."]}),`
`,e.jsx(a.h2,{id:"qué-ocurre-si-necesitas-tres-gateways",children:"¿Qué ocurre si necesitas tres Gateways?"}),`
`,e.jsx(a.p,{children:"Primero decide si necesitas tres data planes independientes o solo tres nombres de host."}),`
`,e.jsxs(a.table,{children:[e.jsx(a.thead,{children:e.jsxs(a.tr,{children:[e.jsx(a.th,{children:"Requisito"}),e.jsx(a.th,{children:"Diseño recomendado"}),e.jsx(a.th,{children:"Consecuencia"})]})}),e.jsxs(a.tbody,{children:[e.jsxs(a.tr,{children:[e.jsx(a.td,{children:"Varias URL o servicios de Lamassu"}),e.jsx(a.td,{children:"Un Gateway con varias rutas"}),e.jsx(a.td,{children:"Una IP y un proxy fleet; es el comportamiento predeterminado del chart"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{children:"Gateways independientes e IP externas distintas"}),e.jsx(a.td,{children:"Una VIP por Gateway"}),e.jsx(a.td,{children:"Todos pueden usar 80/443; requiere un balanceador con un pool de direcciones"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{children:"Gateways independientes, un nodo y una IP"}),e.jsx(a.td,{children:"Puertos externos diferentes"}),e.jsx(a.td,{children:"Los clientes deben indicar puertos no estándar"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{children:"Terminación TLS/mTLS separada detrás de una IP"}),e.jsx(a.td,{children:"Front door con enrutamiento SNI hacia Gateways internos"}),e.jsx(a.td,{children:"Diseño avanzado; el front door usa TLS passthrough y cada Gateway termina su propio TLS"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{children:"Recursos Gateway separados pero proxy compartido"}),e.jsx(a.td,{children:"Modo merged Gateway de Envoy"}),e.jsx(a.td,{children:"Solo separación lógica; cada listener necesita una tupla única de puerto, protocolo y hostname"})]})]})]}),`
`,e.jsx(s,{type:"warn",title:"Tres Gateways en un nodo K3s",children:e.jsxs(a.p,{children:["Tres Services ",e.jsx(a.code,{children:"LoadBalancer"})," independientes no pueden reservar a la vez los mismos puertos 80 y 443 mediante K3s ServiceLB. Usa un Gateway compartido, asigna VIP distintas con otro balanceador o utiliza puertos diferentes."]})}),`
`,e.jsxs(a.p,{children:["Envoy Gateway provisiona normalmente un proxy fleet por ",e.jsx(a.code,{children:"Gateway"}),". Su ",e.jsx(a.a,{href:"https://gateway.envoyproxy.io/docs/tasks/operations/deployment-mode/",children:"modo merged Gateway"})," puede compartir un fleet y una dirección, pero no es un cambio directo para varias releases de Lamassu: los listeners generados usan los mismos puertos y protocolos sin hostnames distintos, por lo que entran en conflicto salvo que personalices el diseño."]}),`
`,e.jsx(a.p,{children:"Usa un front door con SNI solo cuando los Gateways internos deban mantener políticas TLS o mTLS independientes:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(a.code,{children:[e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"                     +-> Gateway interno A (termina api.example.com)"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"una IP pública:443"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"front door passthrough+-> Gateway interno B (termina pki.example.com)"})}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"                     +-> Gateway interno C (termina auth.example.com)"})})]})})}),`
`,e.jsx(a.p,{children:"Esto requiere hostnames SNI distintos y configuración de red externa al chart de Lamassu."}),`
`,e.jsx(a.h2,{id:"guía-de-decisión",children:"Guía de decisión"}),`
`,e.jsxs(a.ol,{children:[`
`,e.jsx(a.li,{children:"Si un Gateway puede gestionar TLS y el enrutamiento, usa el valor predeterminado del chart."}),`
`,e.jsx(a.li,{children:"Si los Gateways necesitan políticas independientes y puedes asignar IP, usa una VIP por Gateway."}),`
`,e.jsx(a.li,{children:"Si solo necesitas separar los recursos Kubernetes, evalúa merged Gateway y usa tuplas de listener únicas."}),`
`,e.jsx(a.li,{children:"Si los data planes y la terminación TLS deben ser independientes detrás de una IP, añade un front door con TLS passthrough y SNI."}),`
`,e.jsx(a.li,{children:"Si nada de lo anterior es posible, usa puertos externos distintos o cambia el diseño de red."}),`
`]}),`
`,e.jsx(a.h2,{id:"verifica-la-ruta-de-tráfico",children:"Verifica la ruta de tráfico"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(a.code,{children:[e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" gateway"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -A"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" describe"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" gateway"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"namespac"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"gateway-nam"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" service"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -A"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" httproute"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(a.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"namespac"}),e.jsx(a.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(a.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"})]})]})})}),`
`,e.jsx(a.p,{children:"Comprueba, en orden:"}),`
`,e.jsxs(a.ol,{children:[`
`,e.jsxs(a.li,{children:["El ",e.jsx(a.code,{children:"Gateway"})," muestra ",e.jsx(a.code,{children:"Accepted=True"})," y ",e.jsx(a.code,{children:"Programmed=True"}),"."]}),`
`,e.jsx(a.li,{children:"Su estado contiene la dirección esperada."}),`
`,e.jsxs(a.li,{children:["El Service ",e.jsx(a.code,{children:"LoadBalancer"})," generado tiene una dirección externa utilizable."]}),`
`,e.jsx(a.li,{children:"El puerto 443 de esa dirección es accesible desde la red del cliente."}),`
`,e.jsx(a.li,{children:"DNS resuelve al endpoint accesible externamente."}),`
`,e.jsx(a.li,{children:"El certificado contiene el nombre DNS o la IP usada por el cliente."}),`
`]}),`
`,e.jsxs(a.p,{children:["Gateway API trata las direcciones como estado deseado que el controlador puede asignar o rechazar; consulta la ",e.jsx(a.a,{href:"https://gateway-api.sigs.k8s.io/docs/concepts/api-overview/",children:"introducción a Gateway API"})," para conocer el modelo."]})]})}function c(n={}){const{wrapper:a}=n.components||{};return a?e.jsx(a,{...n,children:e.jsx(i,{...n})}):i(n)}function l(n,a){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:r,default:c,frontmatter:t,structuredData:o,toc:d},Symbol.toStringTag,{value:"Module"}));export{p as _};
