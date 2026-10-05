import{j as e}from"./index-prc0XQdj.js";let t=`

Empieza por localizar la capa que falla. Una respuesta del Gateway y un pod no preparado requieren evidencias distintas. Para emisión rechazada o resultados de validación, consulta el [diagnóstico PKI](/docs/platform/pki/troubleshooting); para enrolamiento, el [diagnóstico EST](/docs/platform/iot-fleets/enrollment/troubleshooting#diagnóstico-y-compatibilidad).

Secuencia de diagnóstico [#secuencia-de-diagnóstico]

<Steps>
  <Step>
    Reproduce una sola operación [#reproduce-una-sola-operación]

    Anota hora en UTC, usuario o principal, recurso, endpoint y resultado. Evita repetir una acción destructiva como revocación o eliminación.
  </Step>

  <Step>
    Separa cliente, Gateway y servicio [#separa-cliente-gateway-y-servicio]

    Comprueba el código HTTP. Un 401 apunta a autenticación; un 403, a autorización; un 404, a ruta o recurso; un 5xx, al servicio o una dependencia.
  </Step>

  <Step>
    Revisa el estado de Kubernetes [#revisa-el-estado-de-kubernetes]

    Localiza pods no preparados, reinicios, eventos recientes y el estado del release.
  </Step>

  <Step>
    Consulta el servicio afectado [#consulta-el-servicio-afectado]

    Revisa su endpoint /health y sus logs en la misma ventana temporal. Después sigue la dependencia indicada: PostgreSQL, RabbitMQ, proveedor OIDC o motor criptográfico.
  </Step>

  <Step>
    Valida el resultado desde fuera [#valida-el-resultado-desde-fuera]

    Para PKI, comprueba el certificado, la cadena, OCSP o CRL con el mismo tipo de cliente que utiliza producción.
  </Step>
</Steps>

Recogida mínima de evidencias [#recogida-mínima-de-evidencias]

Sustituye los marcadores por tu release, namespace y deployment reales.

\`\`\`bash
helm status <release> -n <namespace>
kubectl get pods -n <namespace> -o wide
kubectl get deployments,statefulsets,jobs -n <namespace>
kubectl get events -n <namespace> --sort-by=.lastTimestamp
kubectl describe pod <pod> -n <namespace>
kubectl logs <pod> -n <namespace> --all-containers --since=30m
\`\`\`

Ejecuta también la prueba de conectividad del chart:

\`\`\`bash
helm test <release> -n <namespace>
\`\`\`

El test consulta la salud de CA, DMS Manager, Device Manager y VA, y comprueba que la UI devuelve HTML. Un test correcto confirma conectividad básica, no un flujo completo de emisión.

<Callout type="info" title="Las sondas usan /health">
  Los servicios del chart exponen sondas de inicio, disponibilidad y vida sobre <code>/health</code>. Un pod puede estar ejecutándose pero no recibir tráfico si la readiness probe falla.
</Callout>

No puedo iniciar sesión [#no-puedo-iniciar-sesión]

Si recibes un 401:

* comprueba que la autoridad OIDC de la UI sea accesible desde el navegador;
* verifica emisor, audiencia y expiración del token;
* confirma que el Gateway puede obtener las claves de la URI JWKS;
* revisa que la ruta pública e interna del proveedor apunten al mismo realm.

Si el login termina pero las APIs devuelven 403:

* inspecciona los claims reales del token;
* confirma que coinciden con un principal activo;
* revisa las políticas concedidas al principal;
* verifica que authz alcanza PostgreSQL y su JWKS.

En una instalación nueva, confirma que el Job de migración terminó. Ese Job crea esquemas, migra authz, precarga políticas y provisiona los principales definidos en <code>services.authz.bootstrap</code>.

Todo devuelve 403 o 5xx [#todo-devuelve-403-o-5xx]

La autorización externa falla cerrada por defecto. Si authz no está disponible, las rutas protegidas se bloquean.

1. Localiza el pod y Service de authz.
2. Comprueba /health, logs y conexión a su base de datos.
3. Verifica el DNS y puerto configurados en externalAuthorization.
4. Comprueba que la ruta del check es /v1/ext\\_authz/check.
5. No cambies a <code>failOpen: true</code> como solución permanente: permitiría tráfico sin autorización durante la caída.

Un pod no está Ready [#un-pod-no-está-ready]

Revisa primero <code>kubectl describe pod</code>. Las causas habituales son:

* credenciales o DNS incorrectos para PostgreSQL o RabbitMQ;
* volumen persistente sin enlazar;
* imagen inaccesible o política de pull incorrecta;
* configuración inválida del motor criptográfico;
* límites de CPU o memoria demasiado bajos;
* migración previa incompleta.

Los valores genéricos solicitan 100 mCPU y 128 MiB y limitan a 500 mCPU y 512 MiB. Ajusta por servicio cuando haya OOMKills, throttling o arranques lentos.

Los motores KMS basados en filesystem y el almacenamiento local de VA utilizan volúmenes de acceso exclusivo. Mantén una réplica o migra a backends compartidos antes de habilitar autoscaling.

Los eventos no llegan [#los-eventos-no-llegan]

Los eventos de dominio y auditoría dependen del publisher del bus:

* verifica que esté habilitado en el servicio emisor;
* comprueba conectividad y credenciales AMQP;
* revisa exchange, routing key, colas y consumidores;
* inspecciona dead-letter queues;
* alerta sobre colas durables huérfanas y crecimiento de backlog.

Una caída del consumidor no siempre impide que la operación principal termine. Por eso debes monitorizar RabbitMQ y verificar de forma independiente la persistencia de [auditoría](/docs/platform/administration/audit-logs).

Observabilidad [#observabilidad]

El chart puede habilitar instrumentación OpenTelemetry. Las trazas se exportan por OTLP HTTP y los logs pueden dirigirse a un endpoint compatible, como VictoriaLogs. Usa un identificador de correlación y la misma ventana temporal para unir Gateway, authz, servicio y dependencia.

Antes de cerrar una incidencia, guarda:

* causa confirmada;
* alcance temporal y recursos afectados;
* comandos o consultas utilizados;
* cambio aplicado y forma de revertirlo;
* validación desde un consumidor;
* acción preventiva y propietario.
`,d={title:"Resolución de problemas de despliegue",description:"Diagnostica acceso, salud de los servicios y dependencias de infraestructura."},c={contents:[{heading:void 0,content:"Empieza por localizar la capa que falla. Una respuesta del Gateway y un pod no preparado requieren evidencias distintas. Para emisión rechazada o resultados de validación, consulta el diagnóstico PKI; para enrolamiento, el diagnóstico EST."},{heading:"reproduce-una-sola-operación",content:"Anota hora en UTC, usuario o principal, recurso, endpoint y resultado. Evita repetir una acción destructiva como revocación o eliminación."},{heading:"separa-cliente-gateway-y-servicio",content:"Comprueba el código HTTP. Un 401 apunta a autenticación; un 403, a autorización; un 404, a ruta o recurso; un 5xx, al servicio o una dependencia."},{heading:"revisa-el-estado-de-kubernetes",content:"Localiza pods no preparados, reinicios, eventos recientes y el estado del release."},{heading:"consulta-el-servicio-afectado",content:"Revisa su endpoint /health y sus logs en la misma ventana temporal. Después sigue la dependencia indicada: PostgreSQL, RabbitMQ, proveedor OIDC o motor criptográfico."},{heading:"valida-el-resultado-desde-fuera",content:"Para PKI, comprueba el certificado, la cadena, OCSP o CRL con el mismo tipo de cliente que utiliza producción."},{heading:"recogida-mínima-de-evidencias",content:"Sustituye los marcadores por tu release, namespace y deployment reales."},{heading:"recogida-mínima-de-evidencias",content:"Ejecuta también la prueba de conectividad del chart:"},{heading:"recogida-mínima-de-evidencias",content:"El test consulta la salud de CA, DMS Manager, Device Manager y VA, y comprueba que la UI devuelve HTML. Un test correcto confirma conectividad básica, no un flujo completo de emisión."},{heading:"recogida-mínima-de-evidencias",content:"Los servicios del chart exponen sondas de inicio, disponibilidad y vida sobre /health. Un pod puede estar ejecutándose pero no recibir tráfico si la readiness probe falla."},{heading:"no-puedo-iniciar-sesión",content:"Si recibes un 401:"},{heading:"no-puedo-iniciar-sesión",content:"comprueba que la autoridad OIDC de la UI sea accesible desde el navegador;"},{heading:"no-puedo-iniciar-sesión",content:"verifica emisor, audiencia y expiración del token;"},{heading:"no-puedo-iniciar-sesión",content:"confirma que el Gateway puede obtener las claves de la URI JWKS;"},{heading:"no-puedo-iniciar-sesión",content:"revisa que la ruta pública e interna del proveedor apunten al mismo realm."},{heading:"no-puedo-iniciar-sesión",content:"Si el login termina pero las APIs devuelven 403:"},{heading:"no-puedo-iniciar-sesión",content:"inspecciona los claims reales del token;"},{heading:"no-puedo-iniciar-sesión",content:"confirma que coinciden con un principal activo;"},{heading:"no-puedo-iniciar-sesión",content:"revisa las políticas concedidas al principal;"},{heading:"no-puedo-iniciar-sesión",content:"verifica que authz alcanza PostgreSQL y su JWKS."},{heading:"no-puedo-iniciar-sesión",content:"En una instalación nueva, confirma que el Job de migración terminó. Ese Job crea esquemas, migra authz, precarga políticas y provisiona los principales definidos en services.authz.bootstrap."},{heading:"todo-devuelve-403-o-5xx",content:"La autorización externa falla cerrada por defecto. Si authz no está disponible, las rutas protegidas se bloquean."},{heading:"todo-devuelve-403-o-5xx",content:"Localiza el pod y Service de authz."},{heading:"todo-devuelve-403-o-5xx",content:"Comprueba /health, logs y conexión a su base de datos."},{heading:"todo-devuelve-403-o-5xx",content:"Verifica el DNS y puerto configurados en externalAuthorization."},{heading:"todo-devuelve-403-o-5xx",content:"Comprueba que la ruta del check es /v1/ext\\_authz/check."},{heading:"todo-devuelve-403-o-5xx",content:"No cambies a failOpen: true como solución permanente: permitiría tráfico sin autorización durante la caída."},{heading:"un-pod-no-está-ready",content:"Revisa primero kubectl describe pod. Las causas habituales son:"},{heading:"un-pod-no-está-ready",content:"credenciales o DNS incorrectos para PostgreSQL o RabbitMQ;"},{heading:"un-pod-no-está-ready",content:"volumen persistente sin enlazar;"},{heading:"un-pod-no-está-ready",content:"imagen inaccesible o política de pull incorrecta;"},{heading:"un-pod-no-está-ready",content:"configuración inválida del motor criptográfico;"},{heading:"un-pod-no-está-ready",content:"límites de CPU o memoria demasiado bajos;"},{heading:"un-pod-no-está-ready",content:"migración previa incompleta."},{heading:"un-pod-no-está-ready",content:"Los valores genéricos solicitan 100 mCPU y 128 MiB y limitan a 500 mCPU y 512 MiB. Ajusta por servicio cuando haya OOMKills, throttling o arranques lentos."},{heading:"un-pod-no-está-ready",content:"Los motores KMS basados en filesystem y el almacenamiento local de VA utilizan volúmenes de acceso exclusivo. Mantén una réplica o migra a backends compartidos antes de habilitar autoscaling."},{heading:"los-eventos-no-llegan",content:"Los eventos de dominio y auditoría dependen del publisher del bus:"},{heading:"los-eventos-no-llegan",content:"verifica que esté habilitado en el servicio emisor;"},{heading:"los-eventos-no-llegan",content:"comprueba conectividad y credenciales AMQP;"},{heading:"los-eventos-no-llegan",content:"revisa exchange, routing key, colas y consumidores;"},{heading:"los-eventos-no-llegan",content:"inspecciona dead-letter queues;"},{heading:"los-eventos-no-llegan",content:"alerta sobre colas durables huérfanas y crecimiento de backlog."},{heading:"los-eventos-no-llegan",content:"Una caída del consumidor no siempre impide que la operación principal termine. Por eso debes monitorizar RabbitMQ y verificar de forma independiente la persistencia de auditoría."},{heading:"observabilidad",content:"El chart puede habilitar instrumentación OpenTelemetry. Las trazas se exportan por OTLP HTTP y los logs pueden dirigirse a un endpoint compatible, como VictoriaLogs. Usa un identificador de correlación y la misma ventana temporal para unir Gateway, authz, servicio y dependencia."},{heading:"observabilidad",content:"Antes de cerrar una incidencia, guarda:"},{heading:"observabilidad",content:"causa confirmada;"},{heading:"observabilidad",content:"alcance temporal y recursos afectados;"},{heading:"observabilidad",content:"comandos o consultas utilizados;"},{heading:"observabilidad",content:"cambio aplicado y forma de revertirlo;"},{heading:"observabilidad",content:"validación desde un consumidor;"},{heading:"observabilidad",content:"acción preventiva y propietario."}],headings:[{id:"secuencia-de-diagnóstico",content:"Secuencia de diagnóstico"},{id:"reproduce-una-sola-operación",content:"Reproduce una sola operación"},{id:"separa-cliente-gateway-y-servicio",content:"Separa cliente, Gateway y servicio"},{id:"revisa-el-estado-de-kubernetes",content:"Revisa el estado de Kubernetes"},{id:"consulta-el-servicio-afectado",content:"Consulta el servicio afectado"},{id:"valida-el-resultado-desde-fuera",content:"Valida el resultado desde fuera"},{id:"recogida-mínima-de-evidencias",content:"Recogida mínima de evidencias"},{id:"no-puedo-iniciar-sesión",content:"No puedo iniciar sesión"},{id:"todo-devuelve-403-o-5xx",content:"Todo devuelve 403 o 5xx"},{id:"un-pod-no-está-ready",content:"Un pod no está Ready"},{id:"los-eventos-no-llegan",content:"Los eventos no llegan"},{id:"observabilidad",content:"Observabilidad"}]};const h=[{depth:2,url:"#secuencia-de-diagnóstico",title:e.jsx(e.Fragment,{children:"Secuencia de diagnóstico"})},{depth:3,url:"#reproduce-una-sola-operación",title:e.jsx(e.Fragment,{children:"Reproduce una sola operación"})},{depth:3,url:"#separa-cliente-gateway-y-servicio",title:e.jsx(e.Fragment,{children:"Separa cliente, Gateway y servicio"})},{depth:3,url:"#revisa-el-estado-de-kubernetes",title:e.jsx(e.Fragment,{children:"Revisa el estado de Kubernetes"})},{depth:3,url:"#consulta-el-servicio-afectado",title:e.jsx(e.Fragment,{children:"Consulta el servicio afectado"})},{depth:3,url:"#valida-el-resultado-desde-fuera",title:e.jsx(e.Fragment,{children:"Valida el resultado desde fuera"})},{depth:2,url:"#recogida-mínima-de-evidencias",title:e.jsx(e.Fragment,{children:"Recogida mínima de evidencias"})},{depth:2,url:"#no-puedo-iniciar-sesión",title:e.jsx(e.Fragment,{children:"No puedo iniciar sesión"})},{depth:2,url:"#todo-devuelve-403-o-5xx",title:e.jsx(e.Fragment,{children:"Todo devuelve 403 o 5xx"})},{depth:2,url:"#un-pod-no-está-ready",title:e.jsx(e.Fragment,{children:"Un pod no está Ready"})},{depth:2,url:"#los-eventos-no-llegan",title:e.jsx(e.Fragment,{children:"Los eventos no llegan"})},{depth:2,url:"#observabilidad",title:e.jsx(e.Fragment,{children:"Observabilidad"})}];function l(a){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",ul:"ul",...a.components},{Callout:o,Step:n,Steps:r}=i;return o||s("Callout"),n||s("Step"),r||s("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["Empieza por localizar la capa que falla. Una respuesta del Gateway y un pod no preparado requieren evidencias distintas. Para emisión rechazada o resultados de validación, consulta el ",e.jsx(i.a,{href:"/docs/platform/pki/troubleshooting",children:"diagnóstico PKI"}),"; para enrolamiento, el ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/enrollment/troubleshooting#diagn%C3%B3stico-y-compatibilidad",children:"diagnóstico EST"}),"."]}),`
`,e.jsx(i.h2,{id:"secuencia-de-diagnóstico",children:"Secuencia de diagnóstico"}),`
`,e.jsxs(r,{children:[e.jsxs(n,{children:[e.jsx(i.h3,{id:"reproduce-una-sola-operación",children:"Reproduce una sola operación"}),e.jsx(i.p,{children:"Anota hora en UTC, usuario o principal, recurso, endpoint y resultado. Evita repetir una acción destructiva como revocación o eliminación."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"separa-cliente-gateway-y-servicio",children:"Separa cliente, Gateway y servicio"}),e.jsx(i.p,{children:"Comprueba el código HTTP. Un 401 apunta a autenticación; un 403, a autorización; un 404, a ruta o recurso; un 5xx, al servicio o una dependencia."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"revisa-el-estado-de-kubernetes",children:"Revisa el estado de Kubernetes"}),e.jsx(i.p,{children:"Localiza pods no preparados, reinicios, eventos recientes y el estado del release."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"consulta-el-servicio-afectado",children:"Consulta el servicio afectado"}),e.jsx(i.p,{children:"Revisa su endpoint /health y sus logs en la misma ventana temporal. Después sigue la dependencia indicada: PostgreSQL, RabbitMQ, proveedor OIDC o motor criptográfico."})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"valida-el-resultado-desde-fuera",children:"Valida el resultado desde fuera"}),e.jsx(i.p,{children:"Para PKI, comprueba el certificado, la cadena, OCSP o CRL con el mismo tipo de cliente que utiliza producción."})]})]}),`
`,e.jsx(i.h2,{id:"recogida-mínima-de-evidencias",children:"Recogida mínima de evidencias"}),`
`,e.jsx(i.p,{children:"Sustituye los marcadores por tu release, namespace y deployment reales."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" status"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"releas"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"namespac"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pods"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"namespac"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -o"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" wide"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" deployments,statefulsets,jobs"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"namespac"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" events"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"namespac"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --sort-by=.lastTimestamp"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" describe"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pod"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"po"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"d"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"namespac"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" logs"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"po"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"d"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"namespac"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --all-containers"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --since=30m"})]})]})})}),`
`,e.jsx(i.p,{children:"Ejecuta también la prueba de conectividad del chart:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" test"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"releas"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"namespac"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsx(i.p,{children:"El test consulta la salud de CA, DMS Manager, Device Manager y VA, y comprueba que la UI devuelve HTML. Un test correcto confirma conectividad básica, no un flujo completo de emisión."}),`
`,e.jsx(o,{type:"info",title:"Las sondas usan /health",children:e.jsxs(i.p,{children:["Los servicios del chart exponen sondas de inicio, disponibilidad y vida sobre ",e.jsx("code",{children:"/health"}),". Un pod puede estar ejecutándose pero no recibir tráfico si la readiness probe falla."]})}),`
`,e.jsx(i.h2,{id:"no-puedo-iniciar-sesión",children:"No puedo iniciar sesión"}),`
`,e.jsx(i.p,{children:"Si recibes un 401:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"comprueba que la autoridad OIDC de la UI sea accesible desde el navegador;"}),`
`,e.jsx(i.li,{children:"verifica emisor, audiencia y expiración del token;"}),`
`,e.jsx(i.li,{children:"confirma que el Gateway puede obtener las claves de la URI JWKS;"}),`
`,e.jsx(i.li,{children:"revisa que la ruta pública e interna del proveedor apunten al mismo realm."}),`
`]}),`
`,e.jsx(i.p,{children:"Si el login termina pero las APIs devuelven 403:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"inspecciona los claims reales del token;"}),`
`,e.jsx(i.li,{children:"confirma que coinciden con un principal activo;"}),`
`,e.jsx(i.li,{children:"revisa las políticas concedidas al principal;"}),`
`,e.jsx(i.li,{children:"verifica que authz alcanza PostgreSQL y su JWKS."}),`
`]}),`
`,e.jsxs(i.p,{children:["En una instalación nueva, confirma que el Job de migración terminó. Ese Job crea esquemas, migra authz, precarga políticas y provisiona los principales definidos en ",e.jsx("code",{children:"services.authz.bootstrap"}),"."]}),`
`,e.jsx(i.h2,{id:"todo-devuelve-403-o-5xx",children:"Todo devuelve 403 o 5xx"}),`
`,e.jsx(i.p,{children:"La autorización externa falla cerrada por defecto. Si authz no está disponible, las rutas protegidas se bloquean."}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Localiza el pod y Service de authz."}),`
`,e.jsx(i.li,{children:"Comprueba /health, logs y conexión a su base de datos."}),`
`,e.jsx(i.li,{children:"Verifica el DNS y puerto configurados en externalAuthorization."}),`
`,e.jsx(i.li,{children:"Comprueba que la ruta del check es /v1/ext_authz/check."}),`
`,e.jsxs(i.li,{children:["No cambies a ",e.jsx("code",{children:"failOpen: true"})," como solución permanente: permitiría tráfico sin autorización durante la caída."]}),`
`]}),`
`,e.jsx(i.h2,{id:"un-pod-no-está-ready",children:"Un pod no está Ready"}),`
`,e.jsxs(i.p,{children:["Revisa primero ",e.jsx("code",{children:"kubectl describe pod"}),". Las causas habituales son:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"credenciales o DNS incorrectos para PostgreSQL o RabbitMQ;"}),`
`,e.jsx(i.li,{children:"volumen persistente sin enlazar;"}),`
`,e.jsx(i.li,{children:"imagen inaccesible o política de pull incorrecta;"}),`
`,e.jsx(i.li,{children:"configuración inválida del motor criptográfico;"}),`
`,e.jsx(i.li,{children:"límites de CPU o memoria demasiado bajos;"}),`
`,e.jsx(i.li,{children:"migración previa incompleta."}),`
`]}),`
`,e.jsx(i.p,{children:"Los valores genéricos solicitan 100 mCPU y 128 MiB y limitan a 500 mCPU y 512 MiB. Ajusta por servicio cuando haya OOMKills, throttling o arranques lentos."}),`
`,e.jsx(i.p,{children:"Los motores KMS basados en filesystem y el almacenamiento local de VA utilizan volúmenes de acceso exclusivo. Mantén una réplica o migra a backends compartidos antes de habilitar autoscaling."}),`
`,e.jsx(i.h2,{id:"los-eventos-no-llegan",children:"Los eventos no llegan"}),`
`,e.jsx(i.p,{children:"Los eventos de dominio y auditoría dependen del publisher del bus:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"verifica que esté habilitado en el servicio emisor;"}),`
`,e.jsx(i.li,{children:"comprueba conectividad y credenciales AMQP;"}),`
`,e.jsx(i.li,{children:"revisa exchange, routing key, colas y consumidores;"}),`
`,e.jsx(i.li,{children:"inspecciona dead-letter queues;"}),`
`,e.jsx(i.li,{children:"alerta sobre colas durables huérfanas y crecimiento de backlog."}),`
`]}),`
`,e.jsxs(i.p,{children:["Una caída del consumidor no siempre impide que la operación principal termine. Por eso debes monitorizar RabbitMQ y verificar de forma independiente la persistencia de ",e.jsx(i.a,{href:"/docs/platform/administration/audit-logs",children:"auditoría"}),"."]}),`
`,e.jsx(i.h2,{id:"observabilidad",children:"Observabilidad"}),`
`,e.jsx(i.p,{children:"El chart puede habilitar instrumentación OpenTelemetry. Las trazas se exportan por OTLP HTTP y los logs pueden dirigirse a un endpoint compatible, como VictoriaLogs. Usa un identificador de correlación y la misma ventana temporal para unir Gateway, authz, servicio y dependencia."}),`
`,e.jsx(i.p,{children:"Antes de cerrar una incidencia, guarda:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"causa confirmada;"}),`
`,e.jsx(i.li,{children:"alcance temporal y recursos afectados;"}),`
`,e.jsx(i.li,{children:"comandos o consultas utilizados;"}),`
`,e.jsx(i.li,{children:"cambio aplicado y forma de revertirlo;"}),`
`,e.jsx(i.li,{children:"validación desde un consumidor;"}),`
`,e.jsx(i.li,{children:"acción preventiva y propietario."}),`
`]})]})}function p(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(l,{...a})}):l(a)}function s(a,i){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:t,default:p,frontmatter:d,structuredData:c,toc:h},Symbol.toStringTag,{value:"Module"}));export{m as _};
