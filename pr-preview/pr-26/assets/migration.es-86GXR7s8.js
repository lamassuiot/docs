import{j as e}from"./index-prc0XQdj.js";let o=`

<div className="lm-diff-ins lm-diff-block">
  Actualiza el chart de Helm [#actualiza-el-chart-de-helm]
</div>

<div className="lm-diff-ins lm-diff-block">
  Usa esta guía para actualizar un despliegue gestionado con Helm. Recorre la migración del chart de 3.8.0 a 4.0.0 por completo: los valores que debes revisar, los cambios de base de datos que el chart aplica automáticamente y los pasos manuales para las instalaciones que mantienen claves KMS o CRL de VA en volúmenes locales. Las notas específicas de otras versiones están en el directorio [\`charts/lamassu/CHANGELOG/\`](https://github.com/lamassuiot/lamassu-helm/tree/main/charts/lamassu/CHANGELOG) del repositorio \`lamassu-helm\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="info" title="Las instalaciones nuevas no tienen nada que migrar">
    Si no actualizas un release existente, ve directamente a [Instala con Helm](/docs/deployment/self-hosted/helm). Los pasos manuales de datos de esta página solo aplican a despliegues actualizados desde 3.8.x que usan almacenamiento local de KMS o VA.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  Qué cambia en la 4.0.0 [#qué-cambia-en-la-400]
</div>

<div className="lm-diff-ins lm-diff-block">
  La versión 4.0.0 es un release de hardening de seguridad. Tres cambios afectan a las actualizaciones:
</div>

<div className="lm-diff-ins lm-diff-block">
  * **Nombres de recursos dependientes del release.** Todos los recursos gestionados por el chart se llaman ahora \`<release>-lamassu-<componente>\`, por ejemplo \`lamassu-kms\`, en lugar de los nombres fijos sin ámbito usados en 3.8.0 (\`kms\`, \`va\`, \`ca\`, ...). Con un release llamado \`prod\`, los StatefulSets pasan a ser \`prod-lamassu-kms\` y \`prod-lamassu-va\`, no \`prod-kms\`. Los valores \`nameOverride\` y \`fullnameOverride\` cambian el prefijo.
  * **Contenedores sin root.** Todas las cargas de trabajo se ejecutan como el usuario numérico \`65532:65532\` con perfil seccomp \`RuntimeDefault\` y capacidades eliminadas. Los pods no montan el token del service account por defecto y el chart crea una ServiceAccount dedicada.
  * **Validación estricta de valores.** \`values.schema.json\` rechaza claves de nivel superior desconocidas, por lo que los bloques heredados de 3.8.0 fallan en \`helm lint\` y \`helm upgrade\` en lugar de ignorarse en silencio.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`services.connectors\` pasa además a ser un mapa indexado por el ID del conector, y el chart ya no inyecta anti-afinidad de pods ni reglas de topology spread.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="warn" title="El renombrado no es cosmético para KMS y VA">
    Kubernetes deriva el nombre del PVC del nombre del pod del StatefulSet (\`<volumeClaimTemplate>-<nombre-del-pod>\`). Renombrar los StatefulSets \`kms\` y \`va\` hace que \`helm upgrade\` enlace PVC nuevos y vacíos en lugar de los existentes. Tu material de claves de KMS y las CRL de VA no se eliminan — los PVC antiguos quedan huérfanos, no destruidos — pero los pods actualizados no los encuentran y fallan con \`no such file or directory\` (KMS) o \`code=NotFound\` (VA) hasta que muevas los datos manualmente. Todos los demás recursos renombrados son sin estado y se recrean sin riesgo de pérdida de datos.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  Qué hace automáticamente el job de upgrade [#qué-hace-automáticamente-el-job-de-upgrade]
</div>

<div className="lm-diff-ins lm-diff-block">
  Antes de que arranque cualquier servicio, el job de pre-install/pre-upgrade del chart prepara PostgreSQL:
</div>

<div className="lm-diff-ins lm-diff-block">
  1. Crea las bases de datos \`pki\`, \`authz\` y \`wfx\` si no existen.
  2. Garantiza un schema por base de datos de servicio (\`alerts\`, \`ca\`, \`va\`, \`devicemanager\`, \`dmsmanager\`, \`kms\`) dentro de la base de datos compartida \`pki\` y consolida en ella las bases de datos separadas por servicio de 3.8.0, importando sus datos.
  3. Ejecuta las migraciones de base de datos de cada schema.
  4. Migra authz, precarga sus políticas y provisiona los principales de \`services.authz.bootstrap\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  El job es idempotente, por lo que un upgrade fallido puede reintentarse. Requiere un rol de PostgreSQL autorizado para crear bases de datos y schemas, como se describe en [Instala con Helm](/docs/deployment/self-hosted/helm#antes-de-comenzar).
</div>

<div className="lm-diff-ins lm-diff-block">
  Antes de actualizar [#antes-de-actualizar]
</div>

<div className="lm-diff-ins lm-diff-block">
  1. Anota los nombres de tus PVC existentes de almacenamiento local:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  export NAMESPACE=lamassu   # namespace de tu instalación 3.8.0
  export RELEASE=lamassu     # nombre de tu release de Helm

  kubectl get pvc -n $NAMESPACE -l app.kubernetes.io/instance=$RELEASE
  # en una instalación 3.8.0 también puedes listar los nombres fijos directamente:
  kubectl get pvc -n $NAMESPACE golang-engine-storage-kms-0 local-crl-file-storage-va-0
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  \`helm upgrade\` no toca ni elimina los PVC antiguos, pero tras el upgrade nada los referencia. Necesitas sus nombres para copiar los datos y limpiar después; no los elimines hasta verificar los volúmenes nuevos.
</div>

<div className="lm-diff-ins lm-diff-block">
  2. Elimina los valores que el schema estricto ahora rechaza, por ejemplo el bloque antiguo \`toolbox:\`. [Actualiza el archivo de valores](#actualiza-el-archivo-de-valores) recoge cada renombrado.
</div>

<div className="lm-diff-ins lm-diff-block">
  Actualiza el archivo de valores [#actualiza-el-archivo-de-valores]
</div>

<div className="lm-diff-ins lm-diff-block">
  **Añade \`services.authz\` (obligatorio).** La 3.8.0 no tenía servicio de autorización: toda ruta aceptaba cualquier token válido. La 4.0.0 añade autorización fina a nivel de entidad, y un archivo de valores de 3.8.0 no tiene nada que migrar — debes añadir la configuración:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`yaml
  services:
    authz:
      credentials:
        pki:
          database: pki
        authz:
          database: authz
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  * \`authz\` es el almacenamiento propio del servicio de autorización para principales, grants y políticas (\`services.authz.database\`, \`authz\` por defecto).
  * \`pki\` es la base de datos que el motor de autorización consulta al evaluar políticas contra entidades como CA, certificados, dispositivos, DMS, claves KMS y roles de VA.
  * De cada entrada de credentials solo se lee el campo \`database\`. Los parámetros de conexión siempre provienen de los valores globales \`postgres.hostname\`, \`postgres.port\`, \`postgres.username\` y \`postgres.password\`.
  * Comprueba que \`services.authz.bootstrap\` (presente por defecto en el chart) coincide con cómo tu proveedor OIDC asigna el rol de realm \`pki-admin\`. Sin un principal que coincida con la regla de bootstrap, nadie podrá administrar la PKI — no existe un superusuario implícito.
</div>

<div className="lm-diff-ins lm-diff-block">
  **Renombra \`toolbox\` a \`connectivityTest\`.** El hook de conectividad de \`helm test\` usa ahora la imagen \`curlimages/curl\`, mantenida upstream y fijada por digest, en lugar de la imagen de toolbox propia del chart:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`yaml
  # ANTIGUO (3.8.0)
  toolbox:
    image: ghcr.io/lamassuiot/toolbox:2.2.0

  # NUEVO (4.0.0)
  connectivityTest:
    image: curlimages/curl@sha256:58adaa4e8dca9c988bae2aba4ab3434a0bb2da16bbe3f92dec39ec7785166777
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  **Elimina las sobrecargas de identidad por servicio.** \`services.kms.securityContext.runAsGroup: 0\` y \`services.authz.securityContext.runAsUser\`/\`runAsGroup: 999\` ya no existen. Todos los servicios se ejecutan con el \`65532:65532\` global del chart, y el acceso de grupo a los volúmenes de KMS y al socket PKCS#11 se gestiona automáticamente mediante el \`fsGroup: 65532\` del pod.
</div>

<div className="lm-diff-ins lm-diff-block">
  **Convierte \`services.connectors\` en un mapa.** Cada entrada se indexa por su ID estable de conector y declara \`type\` e \`image\`:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`yaml
  services:
    connectors:
      aws.myconnector:
        type: awsiot
        image: ghcr.io/lamassuiot/lamassu-aws-connector:dev-v4
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  **Revisa los valores del emisor TLS.** Con \`tls.certManagerOptions.issuer\` vacío (el valor por defecto), el chart crea un emisor self-signed dependiente del release — por ejemplo \`lamassu-downstream-ca-selfsigned-issuer\` con el release \`lamassu\`. El valor legado literal \`downstream-ca-selfsigned-issuer\` de los values de la era 3.8.0 sigue aceptándose y resuelve al mismo emisor dependiente del release; apunta \`tls.certManagerOptions.clusterIssuer\` a tu propio emisor para TLS corporativo.
</div>

<div className="lm-diff-ins lm-diff-block">
  **Revisa scheduling y puertos.** El chart ya no inyecta anti-afinidad de pods ni restricciones de topology spread — configura \`affinity\` y \`topologySpreadConstraints\` explícitamente donde tu clúster las necesite. El valor por defecto de \`services.ui.port\` es ahora \`8085\`, el puerto sin privilegios global del chart que usa la imagen sin root, así que actualiza las sobrecargas que fijaban \`80\`. El bloque compartido \`probes:\` se sustituye por bloques independientes \`livenessProbe\`, \`readinessProbe\` y \`startupProbe\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  Ejecuta el upgrade [#ejecuta-el-upgrade]
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  helm upgrade --install "$RELEASE" lamassu/lamassu \\
    --namespace $NAMESPACE \\
    --values values.yaml \\
    --wait
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Helm ejecuta el job de base de datos antes de aplicar cualquier carga de trabajo, por lo que ningún servicio arranca contra una base de datos sin preparar. Si la validación rechaza valores desconocidos, corrige el archivo y vuelve a ejecutarlo.
</div>

<div className="lm-diff-ins lm-diff-block">
  Migra los datos de KMS y VA [#migra-los-datos-de-kms-y-va]
</div>

<div className="lm-diff-ins lm-diff-block">
  Omite esta sección en instalaciones nuevas, o si \`services.kms.cryptoEngines\` nunca usó un motor \`filesystem\` y \`services.va.fileStore.type\` nunca fue \`local\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  1. **Identifica los nuevos StatefulSets y PVC.** Sus nombres dependen del nombre del release y de cualquier \`nameOverride\`/\`fullnameOverride\`; el nombre del PVC es \`<volumeClaimTemplate>-<nombre-del-StatefulSet>-0\`:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  KMS_STS=$(kubectl get statefulset -n "$NAMESPACE" \\
    -l "app.kubernetes.io/instance=$RELEASE,app.kubernetes.io/component=kms" \\
    -o jsonpath='{.items[0].metadata.name}')
  VA_STS=$(kubectl get statefulset -n "$NAMESPACE" \\
    -l "app.kubernetes.io/instance=$RELEASE,app.kubernetes.io/component=va" \\
    -o jsonpath='{.items[0].metadata.name}')

  KMS_PVC="golang-engine-storage-\${KMS_STS}-0"
  VA_PVC="local-crl-file-storage-\${VA_STS}-0"

  kubectl get pvc -n "$NAMESPACE" \\
    golang-engine-storage-kms-0 "$KMS_PVC" \\
    local-crl-file-storage-va-0 "$VA_PVC"
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Con el release \`lamassu\` y el nombre de chart por defecto, los nuevos PVC son \`golang-engine-storage-lamassu-kms-0\` y \`local-crl-file-storage-lamassu-va-0\`; con el release \`prod\` son \`golang-engine-storage-prod-lamassu-kms-0\` y \`local-crl-file-storage-prod-lamassu-va-0\`. Comprueba que existen los PVC antiguos y nuevos antes de continuar.
</div>

<div className="lm-diff-ins lm-diff-block">
  2. **Reduce a cero los nuevos StatefulSets** para que nada escriba en ninguno de los volúmenes mientras copias:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  kubectl scale statefulset -n "$NAMESPACE" "$KMS_STS" "$VA_STS" --replicas=0
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  3. **Arranca un pod auxiliar efímero** que monte las cuatro PVC:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  cat <<EOF | kubectl apply -f -
  apiVersion: v1
  kind: Pod
  metadata:
    name: pvc-migrate-helper
    namespace: $NAMESPACE
  spec:
    restartPolicy: Never
    containers:
      - name: migrate
        image: docker.io/library/alpine:3.20
        command: ["sh", "-c", "sleep 3600"]
        volumeMounts:
          - {name: old-kms, mountPath: /old/kms}
          - {name: new-kms, mountPath: /new/kms}
          - {name: old-va,  mountPath: /old/va}
          - {name: new-va,  mountPath: /new/va}
    volumes:
      - {name: old-kms, persistentVolumeClaim: {claimName: golang-engine-storage-kms-0}}
      - {name: new-kms, persistentVolumeClaim: {claimName: $KMS_PVC}}
      - {name: old-va,  persistentVolumeClaim: {claimName: local-crl-file-storage-va-0}}
      - {name: new-va,  persistentVolumeClaim: {claimName: $VA_PVC}}
  EOF

  kubectl wait -n $NAMESPACE --for=condition=Ready pod/pvc-migrate-helper --timeout=60s
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  4. **Inspecciona antes de escribir** para no machacar datos que los pods nuevos pudieran haber escrito ya:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  kubectl exec -n $NAMESPACE pvc-migrate-helper -- sh -c 'find /new/kms /new/va -type f'
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Un resultado vacío es lo habitual: el pod propio de un StatefulSet rara vez llega a escribir nada cuando le faltan sus datos.
</div>

<div className="lm-diff-ins lm-diff-block">
  5. **Copia los datos y ajusta la propiedad**:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  kubectl exec -n $NAMESPACE pvc-migrate-helper -- sh -c '
    cp -a /old/kms/. /new/kms/ &&
    cp -a /old/va/. /new/va/ &&
    chown -R 65532:65532 /new/kms /new/va
  '
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  El \`chown\` es obligatorio aunque los archivos antiguos ya parezcan ser de un usuario sin root. La 3.8.0 no fijaba la identidad del contenedor, por lo que los archivos podían llevar cualquier UID declarado por la imagen; la 4.0.0 exige exactamente \`65532:65532\` y no retrocede a lo que declare la imagen.
</div>

<div className="lm-diff-ins lm-diff-block">
  6. **Vuelve a escalar y elimina el auxiliar**:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  kubectl delete pod -n $NAMESPACE pvc-migrate-helper
  kubectl scale statefulset -n "$NAMESPACE" "$KMS_STS" "$VA_STS" --replicas=1
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Verifica la migración [#verifica-la-migración]
</div>

<div className="lm-diff-ins lm-diff-block">
  * Los logs de KMS y VA no muestran errores \`no such file or directory\` ni \`code=NotFound\`.
  * Una CRL emitida anteriormente vuelve a servirse: \`GET /crl/<ca-ski>\` sobre VA.
  * \`helm test "$RELEASE" -n $NAMESPACE --logs\` pasa; el hook de conectividad comprueba los endpoints de salud de CA, DMS Manager, Device Manager y VA, y la respuesta de la UI.
  * Inicia sesión con una identidad de administrador y confirma que las operaciones están autorizadas.
</div>

<div className="lm-diff-ins lm-diff-block">
  Elimina los volúmenes antiguos [#elimina-los-volúmenes-antiguos]
</div>

<div className="lm-diff-ins lm-diff-block">
  Solo cuando todo funcione, elimina los volúmenes huérfanos de 3.8.0 para recuperar almacenamiento:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  kubectl delete pvc -n $NAMESPACE golang-engine-storage-kms-0 local-crl-file-storage-va-0
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Resolución de problemas [#resolución-de-problemas]
</div>

<div className="lm-diff-ins lm-diff-block">
  * **Los pods de KMS o VA fallan con \`no such file or directory\` o \`code=NotFound\` justo después del upgrade.** Los pods nuevos están enlazados a los PVC nuevos y vacíos y la migración de datos todavía no se ha ejecutado, o se copió en el PVC equivocado. Sigue [Migra los datos de KMS y VA](#migra-los-datos-de-kms-y-va) y comprueba que existen las cuatro PVC.
  * **\`helm upgrade\` falla con un error de validación de clave desconocida.** Elimina o renombra los valores heredados — normalmente el bloque \`toolbox:\` — porque el schema estricto rechaza claves de nivel superior desconocidas.
  * **El upgrade falla en el job de base de datos.** El rol de PostgreSQL no puede crear bases de datos ni schemas; concede los privilegios necesarios, o crea tú mismo las bases de datos \`pki\`, \`authz\` y \`wfx\`, y vuelve a ejecutar el upgrade.
  * **Nadie puede iniciar sesión tras el upgrade.** Comprueba que \`services.authz.bootstrap\` coincide con un rol que tu proveedor OIDC asigna realmente (ver [Control de acceso](/docs/platform/pki/access-control)) y que el job de migración terminó correctamente.
</div>

<div className="lm-diff-ins lm-diff-block">
  Páginas relacionadas [#páginas-relacionadas]
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Instala con Helm" description="Prepara dependencias, configura valores e instala un despliegue controlado." href="/docs/deployment/self-hosted/helm" />

    <Card title="Expón el Gateway" description="Elige un diseño de tráfico externo y gestiona el direccionamiento del Gateway." href="/docs/deployment/self-hosted/networking" />
  </Cards>
</div>
`,c={title:"Actualiza el chart de Helm",description:"Actualiza un despliegue de Lamassu gestionado con Helm, incluida la migración del chart de 3.8.0 a 4.0.0 y los pasos de datos persistentes de KMS y VA."},t={isNew:!0,changes:57,title:void 0,description:void 0},h={contents:[{heading:"actualiza-el-chart-de-helm",content:"Usa esta guía para actualizar un despliegue gestionado con Helm. Recorre la migración del chart de 3.8.0 a 4.0.0 por completo: los valores que debes revisar, los cambios de base de datos que el chart aplica automáticamente y los pasos manuales para las instalaciones que mantienen claves KMS o CRL de VA en volúmenes locales. Las notas específicas de otras versiones están en el directorio `charts/lamassu/CHANGELOG/` del repositorio `lamassu-helm`."},{heading:"actualiza-el-chart-de-helm",content:"Si no actualizas un release existente, ve directamente a Instala con Helm. Los pasos manuales de datos de esta página solo aplican a despliegues actualizados desde 3.8.x que usan almacenamiento local de KMS o VA."},{heading:"qué-cambia-en-la-400",content:"La versión 4.0.0 es un release de hardening de seguridad. Tres cambios afectan a las actualizaciones:"},{heading:"qué-cambia-en-la-400",content:"**Nombres de recursos dependientes del release.** Todos los recursos gestionados por el chart se llaman ahora `<release>-lamassu-<componente>`, por ejemplo `lamassu-kms`, en lugar de los nombres fijos sin ámbito usados en 3.8.0 (`kms`, `va`, `ca`, ...). Con un release llamado `prod`, los StatefulSets pasan a ser `prod-lamassu-kms` y `prod-lamassu-va`, no `prod-kms`. Los valores `nameOverride` y `fullnameOverride` cambian el prefijo."},{heading:"qué-cambia-en-la-400",content:"**Contenedores sin root.** Todas las cargas de trabajo se ejecutan como el usuario numérico `65532:65532` con perfil seccomp `RuntimeDefault` y capacidades eliminadas. Los pods no montan el token del service account por defecto y el chart crea una ServiceAccount dedicada."},{heading:"qué-cambia-en-la-400",content:"**Validación estricta de valores.** `values.schema.json` rechaza claves de nivel superior desconocidas, por lo que los bloques heredados de 3.8.0 fallan en `helm lint` y `helm upgrade` en lugar de ignorarse en silencio."},{heading:"qué-cambia-en-la-400",content:"`services.connectors` pasa además a ser un mapa indexado por el ID del conector, y el chart ya no inyecta anti-afinidad de pods ni reglas de topology spread."},{heading:"qué-cambia-en-la-400",content:"Kubernetes deriva el nombre del PVC del nombre del pod del StatefulSet (`<volumeClaimTemplate>-<nombre-del-pod>`). Renombrar los StatefulSets `kms` y `va` hace que `helm upgrade` enlace PVC nuevos y vacíos en lugar de los existentes. Tu material de claves de KMS y las CRL de VA no se eliminan — los PVC antiguos quedan huérfanos, no destruidos — pero los pods actualizados no los encuentran y fallan con `no such file or directory` (KMS) o `code=NotFound` (VA) hasta que muevas los datos manualmente. Todos los demás recursos renombrados son sin estado y se recrean sin riesgo de pérdida de datos."},{heading:"qué-hace-automáticamente-el-job-de-upgrade",content:"Antes de que arranque cualquier servicio, el job de pre-install/pre-upgrade del chart prepara PostgreSQL:"},{heading:"qué-hace-automáticamente-el-job-de-upgrade",content:"Crea las bases de datos `pki`, `authz` y `wfx` si no existen."},{heading:"qué-hace-automáticamente-el-job-de-upgrade",content:"Garantiza un schema por base de datos de servicio (`alerts`, `ca`, `va`, `devicemanager`, `dmsmanager`, `kms`) dentro de la base de datos compartida `pki` y consolida en ella las bases de datos separadas por servicio de 3.8.0, importando sus datos."},{heading:"qué-hace-automáticamente-el-job-de-upgrade",content:"Ejecuta las migraciones de base de datos de cada schema."},{heading:"qué-hace-automáticamente-el-job-de-upgrade",content:"Migra authz, precarga sus políticas y provisiona los principales de `services.authz.bootstrap`."},{heading:"qué-hace-automáticamente-el-job-de-upgrade",content:"El job es idempotente, por lo que un upgrade fallido puede reintentarse. Requiere un rol de PostgreSQL autorizado para crear bases de datos y schemas, como se describe en Instala con Helm."},{heading:"antes-de-actualizar",content:"Anota los nombres de tus PVC existentes de almacenamiento local:"},{heading:"antes-de-actualizar",content:"`helm upgrade` no toca ni elimina los PVC antiguos, pero tras el upgrade nada los referencia. Necesitas sus nombres para copiar los datos y limpiar después; no los elimines hasta verificar los volúmenes nuevos."},{heading:"antes-de-actualizar",content:"Elimina los valores que el schema estricto ahora rechaza, por ejemplo el bloque antiguo `toolbox:`. Actualiza el archivo de valores recoge cada renombrado."},{heading:"actualiza-el-archivo-de-valores",content:"**Añade `services.authz` (obligatorio).** La 3.8.0 no tenía servicio de autorización: toda ruta aceptaba cualquier token válido. La 4.0.0 añade autorización fina a nivel de entidad, y un archivo de valores de 3.8.0 no tiene nada que migrar — debes añadir la configuración:"},{heading:"actualiza-el-archivo-de-valores",content:"`authz` es el almacenamiento propio del servicio de autorización para principales, grants y políticas (`services.authz.database`, `authz` por defecto)."},{heading:"actualiza-el-archivo-de-valores",content:"`pki` es la base de datos que el motor de autorización consulta al evaluar políticas contra entidades como CA, certificados, dispositivos, DMS, claves KMS y roles de VA."},{heading:"actualiza-el-archivo-de-valores",content:"De cada entrada de credentials solo se lee el campo `database`. Los parámetros de conexión siempre provienen de los valores globales `postgres.hostname`, `postgres.port`, `postgres.username` y `postgres.password`."},{heading:"actualiza-el-archivo-de-valores",content:"Comprueba que `services.authz.bootstrap` (presente por defecto en el chart) coincide con cómo tu proveedor OIDC asigna el rol de realm `pki-admin`. Sin un principal que coincida con la regla de bootstrap, nadie podrá administrar la PKI — no existe un superusuario implícito."},{heading:"actualiza-el-archivo-de-valores",content:"**Renombra `toolbox` a `connectivityTest`.** El hook de conectividad de `helm test` usa ahora la imagen `curlimages/curl`, mantenida upstream y fijada por digest, en lugar de la imagen de toolbox propia del chart:"},{heading:"actualiza-el-archivo-de-valores",content:"**Elimina las sobrecargas de identidad por servicio.** `services.kms.securityContext.runAsGroup: 0` y `services.authz.securityContext.runAsUser`/`runAsGroup: 999` ya no existen. Todos los servicios se ejecutan con el `65532:65532` global del chart, y el acceso de grupo a los volúmenes de KMS y al socket PKCS#11 se gestiona automáticamente mediante el `fsGroup: 65532` del pod."},{heading:"actualiza-el-archivo-de-valores",content:"**Convierte `services.connectors` en un mapa.** Cada entrada se indexa por su ID estable de conector y declara `type` e `image`:"},{heading:"actualiza-el-archivo-de-valores",content:"**Revisa los valores del emisor TLS.** Con `tls.certManagerOptions.issuer` vacío (el valor por defecto), el chart crea un emisor self-signed dependiente del release — por ejemplo `lamassu-downstream-ca-selfsigned-issuer` con el release `lamassu`. El valor legado literal `downstream-ca-selfsigned-issuer` de los values de la era 3.8.0 sigue aceptándose y resuelve al mismo emisor dependiente del release; apunta `tls.certManagerOptions.clusterIssuer` a tu propio emisor para TLS corporativo."},{heading:"actualiza-el-archivo-de-valores",content:"**Revisa scheduling y puertos.** El chart ya no inyecta anti-afinidad de pods ni restricciones de topology spread — configura `affinity` y `topologySpreadConstraints` explícitamente donde tu clúster las necesite. El valor por defecto de `services.ui.port` es ahora `8085`, el puerto sin privilegios global del chart que usa la imagen sin root, así que actualiza las sobrecargas que fijaban `80`. El bloque compartido `probes:` se sustituye por bloques independientes `livenessProbe`, `readinessProbe` y `startupProbe`."},{heading:"ejecuta-el-upgrade",content:"Helm ejecuta el job de base de datos antes de aplicar cualquier carga de trabajo, por lo que ningún servicio arranca contra una base de datos sin preparar. Si la validación rechaza valores desconocidos, corrige el archivo y vuelve a ejecutarlo."},{heading:"migra-los-datos-de-kms-y-va",content:"Omite esta sección en instalaciones nuevas, o si `services.kms.cryptoEngines` nunca usó un motor `filesystem` y `services.va.fileStore.type` nunca fue `local`."},{heading:"migra-los-datos-de-kms-y-va",content:"**Identifica los nuevos StatefulSets y PVC.** Sus nombres dependen del nombre del release y de cualquier `nameOverride`/`fullnameOverride`; el nombre del PVC es `<volumeClaimTemplate>-<nombre-del-StatefulSet>-0`:"},{heading:"migra-los-datos-de-kms-y-va",content:"Con el release `lamassu` y el nombre de chart por defecto, los nuevos PVC son `golang-engine-storage-lamassu-kms-0` y `local-crl-file-storage-lamassu-va-0`; con el release `prod` son `golang-engine-storage-prod-lamassu-kms-0` y `local-crl-file-storage-prod-lamassu-va-0`. Comprueba que existen los PVC antiguos y nuevos antes de continuar."},{heading:"migra-los-datos-de-kms-y-va",content:"**Reduce a cero los nuevos StatefulSets** para que nada escriba en ninguno de los volúmenes mientras copias:"},{heading:"migra-los-datos-de-kms-y-va",content:"**Arranca un pod auxiliar efímero** que monte las cuatro PVC:"},{heading:"migra-los-datos-de-kms-y-va",content:"**Inspecciona antes de escribir** para no machacar datos que los pods nuevos pudieran haber escrito ya:"},{heading:"migra-los-datos-de-kms-y-va",content:"Un resultado vacío es lo habitual: el pod propio de un StatefulSet rara vez llega a escribir nada cuando le faltan sus datos."},{heading:"migra-los-datos-de-kms-y-va",content:"**Copia los datos y ajusta la propiedad**:"},{heading:"migra-los-datos-de-kms-y-va",content:"El `chown` es obligatorio aunque los archivos antiguos ya parezcan ser de un usuario sin root. La 3.8.0 no fijaba la identidad del contenedor, por lo que los archivos podían llevar cualquier UID declarado por la imagen; la 4.0.0 exige exactamente `65532:65532` y no retrocede a lo que declare la imagen."},{heading:"migra-los-datos-de-kms-y-va",content:"**Vuelve a escalar y elimina el auxiliar**:"},{heading:"verifica-la-migración",content:"Los logs de KMS y VA no muestran errores `no such file or directory` ni `code=NotFound`."},{heading:"verifica-la-migración",content:"Una CRL emitida anteriormente vuelve a servirse: `GET /crl/<ca-ski>` sobre VA."},{heading:"verifica-la-migración",content:'`helm test "$RELEASE" -n $NAMESPACE --logs` pasa; el hook de conectividad comprueba los endpoints de salud de CA, DMS Manager, Device Manager y VA, y la respuesta de la UI.'},{heading:"verifica-la-migración",content:"Inicia sesión con una identidad de administrador y confirma que las operaciones están autorizadas."},{heading:"elimina-los-volúmenes-antiguos",content:"Solo cuando todo funcione, elimina los volúmenes huérfanos de 3.8.0 para recuperar almacenamiento:"},{heading:"resolución-de-problemas",content:"**Los pods de KMS o VA fallan con `no such file or directory` o `code=NotFound` justo después del upgrade.** Los pods nuevos están enlazados a los PVC nuevos y vacíos y la migración de datos todavía no se ha ejecutado, o se copió en el PVC equivocado. Sigue Migra los datos de KMS y VA y comprueba que existen las cuatro PVC."},{heading:"resolución-de-problemas",content:"**`helm upgrade` falla con un error de validación de clave desconocida.** Elimina o renombra los valores heredados — normalmente el bloque `toolbox:` — porque el schema estricto rechaza claves de nivel superior desconocidas."},{heading:"resolución-de-problemas",content:"**El upgrade falla en el job de base de datos.** El rol de PostgreSQL no puede crear bases de datos ni schemas; concede los privilegios necesarios, o crea tú mismo las bases de datos `pki`, `authz` y `wfx`, y vuelve a ejecutar el upgrade."},{heading:"resolución-de-problemas",content:"**Nadie puede iniciar sesión tras el upgrade.** Comprueba que `services.authz.bootstrap` coincide con un rol que tu proveedor OIDC asigna realmente (ver Control de acceso) y que el job de migración terminó correctamente."},{heading:"páginas-relacionadas",content:'<Card title="Instala con Helm" description="Prepara dependencias, configura valores e instala un despliegue controlado." href="/docs/deployment/self-hosted/helm" />'},{heading:"páginas-relacionadas",content:'<Card title="Expón el Gateway" description="Elige un diseño de tráfico externo y gestiona el direccionamiento del Gateway." href="/docs/deployment/self-hosted/networking" />'}],headings:[{id:"actualiza-el-chart-de-helm",content:"Actualiza el chart de Helm"},{id:"qué-cambia-en-la-400",content:"Qué cambia en la 4.0.0"},{id:"qué-hace-automáticamente-el-job-de-upgrade",content:"Qué hace automáticamente el job de upgrade"},{id:"antes-de-actualizar",content:"Antes de actualizar"},{id:"actualiza-el-archivo-de-valores",content:"Actualiza el archivo de valores"},{id:"ejecuta-el-upgrade",content:"Ejecuta el upgrade"},{id:"migra-los-datos-de-kms-y-va",content:"Migra los datos de KMS y VA"},{id:"verifica-la-migración",content:"Verifica la migración"},{id:"elimina-los-volúmenes-antiguos",content:"Elimina los volúmenes antiguos"},{id:"resolución-de-problemas",content:"Resolución de problemas"},{id:"páginas-relacionadas",content:"Páginas relacionadas"}]};const m=[{depth:1,url:"#actualiza-el-chart-de-helm",title:e.jsx(e.Fragment,{children:"Actualiza el chart de Helm"})},{depth:2,url:"#qué-cambia-en-la-400",title:e.jsx(e.Fragment,{children:"Qué cambia en la 4.0.0"})},{depth:2,url:"#qué-hace-automáticamente-el-job-de-upgrade",title:e.jsx(e.Fragment,{children:"Qué hace automáticamente el job de upgrade"})},{depth:2,url:"#antes-de-actualizar",title:e.jsx(e.Fragment,{children:"Antes de actualizar"})},{depth:2,url:"#actualiza-el-archivo-de-valores",title:e.jsx(e.Fragment,{children:"Actualiza el archivo de valores"})},{depth:2,url:"#ejecuta-el-upgrade",title:e.jsx(e.Fragment,{children:"Ejecuta el upgrade"})},{depth:2,url:"#migra-los-datos-de-kms-y-va",title:e.jsx(e.Fragment,{children:"Migra los datos de KMS y VA"})},{depth:2,url:"#verifica-la-migración",title:e.jsx(e.Fragment,{children:"Verifica la migración"})},{depth:2,url:"#elimina-los-volúmenes-antiguos",title:e.jsx(e.Fragment,{children:"Elimina los volúmenes antiguos"})},{depth:2,url:"#resolución-de-problemas",title:e.jsx(e.Fragment,{children:"Resolución de problemas"})},{depth:2,url:"#páginas-relacionadas",title:e.jsx(e.Fragment,{children:"Páginas relacionadas"})}];function r(a){const s={a:"a",code:"code",div:"div",h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...a.components},{Callout:i,Card:l,Cards:d}=s;return i||n("Callout"),l||n("Card"),d||n("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h1,{id:"actualiza-el-chart-de-helm",children:"Actualiza el chart de Helm"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Usa esta guía para actualizar un despliegue gestionado con Helm. Recorre la migración del chart de 3.8.0 a 4.0.0 por completo: los valores que debes revisar, los cambios de base de datos que el chart aplica automáticamente y los pasos manuales para las instalaciones que mantienen claves KMS o CRL de VA en volúmenes locales. Las notas específicas de otras versiones están en el directorio ",e.jsx(s.a,{href:"https://github.com/lamassuiot/lamassu-helm/tree/main/charts/lamassu/CHANGELOG",children:e.jsx(s.code,{children:"charts/lamassu/CHANGELOG/"})})," del repositorio ",e.jsx(s.code,{children:"lamassu-helm"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i,{type:"info",title:"Las instalaciones nuevas no tienen nada que migrar",children:e.jsxs(s.p,{children:["Si no actualizas un release existente, ve directamente a ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/helm",children:"Instala con Helm"}),". Los pasos manuales de datos de esta página solo aplican a despliegues actualizados desde 3.8.x que usan almacenamiento local de KMS o VA."]})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"qué-cambia-en-la-400",children:"Qué cambia en la 4.0.0"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"La versión 4.0.0 es un release de hardening de seguridad. Tres cambios afectan a las actualizaciones:"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Nombres de recursos dependientes del release."})," Todos los recursos gestionados por el chart se llaman ahora ",e.jsx(s.code,{children:"<release>-lamassu-<componente>"}),", por ejemplo ",e.jsx(s.code,{children:"lamassu-kms"}),", en lugar de los nombres fijos sin ámbito usados en 3.8.0 (",e.jsx(s.code,{children:"kms"}),", ",e.jsx(s.code,{children:"va"}),", ",e.jsx(s.code,{children:"ca"}),", ...). Con un release llamado ",e.jsx(s.code,{children:"prod"}),", los StatefulSets pasan a ser ",e.jsx(s.code,{children:"prod-lamassu-kms"})," y ",e.jsx(s.code,{children:"prod-lamassu-va"}),", no ",e.jsx(s.code,{children:"prod-kms"}),". Los valores ",e.jsx(s.code,{children:"nameOverride"})," y ",e.jsx(s.code,{children:"fullnameOverride"})," cambian el prefijo."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Contenedores sin root."})," Todas las cargas de trabajo se ejecutan como el usuario numérico ",e.jsx(s.code,{children:"65532:65532"})," con perfil seccomp ",e.jsx(s.code,{children:"RuntimeDefault"})," y capacidades eliminadas. Los pods no montan el token del service account por defecto y el chart crea una ServiceAccount dedicada."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Validación estricta de valores."})," ",e.jsx(s.code,{children:"values.schema.json"})," rechaza claves de nivel superior desconocidas, por lo que los bloques heredados de 3.8.0 fallan en ",e.jsx(s.code,{children:"helm lint"})," y ",e.jsx(s.code,{children:"helm upgrade"})," en lugar de ignorarse en silencio."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsx(s.code,{children:"services.connectors"})," pasa además a ser un mapa indexado por el ID del conector, y el chart ya no inyecta anti-afinidad de pods ni reglas de topology spread."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i,{type:"warn",title:"El renombrado no es cosmético para KMS y VA",children:e.jsxs(s.p,{children:["Kubernetes deriva el nombre del PVC del nombre del pod del StatefulSet (",e.jsx(s.code,{children:"<volumeClaimTemplate>-<nombre-del-pod>"}),"). Renombrar los StatefulSets ",e.jsx(s.code,{children:"kms"})," y ",e.jsx(s.code,{children:"va"})," hace que ",e.jsx(s.code,{children:"helm upgrade"})," enlace PVC nuevos y vacíos en lugar de los existentes. Tu material de claves de KMS y las CRL de VA no se eliminan — los PVC antiguos quedan huérfanos, no destruidos — pero los pods actualizados no los encuentran y fallan con ",e.jsx(s.code,{children:"no such file or directory"})," (KMS) o ",e.jsx(s.code,{children:"code=NotFound"})," (VA) hasta que muevas los datos manualmente. Todos los demás recursos renombrados son sin estado y se recrean sin riesgo de pérdida de datos."]})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"qué-hace-automáticamente-el-job-de-upgrade",children:"Qué hace automáticamente el job de upgrade"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"Antes de que arranque cualquier servicio, el job de pre-install/pre-upgrade del chart prepara PostgreSQL:"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:["Crea las bases de datos ",e.jsx(s.code,{children:"pki"}),", ",e.jsx(s.code,{children:"authz"})," y ",e.jsx(s.code,{children:"wfx"})," si no existen."]}),`
`,e.jsxs(s.li,{children:["Garantiza un schema por base de datos de servicio (",e.jsx(s.code,{children:"alerts"}),", ",e.jsx(s.code,{children:"ca"}),", ",e.jsx(s.code,{children:"va"}),", ",e.jsx(s.code,{children:"devicemanager"}),", ",e.jsx(s.code,{children:"dmsmanager"}),", ",e.jsx(s.code,{children:"kms"}),") dentro de la base de datos compartida ",e.jsx(s.code,{children:"pki"})," y consolida en ella las bases de datos separadas por servicio de 3.8.0, importando sus datos."]}),`
`,e.jsx(s.li,{children:"Ejecuta las migraciones de base de datos de cada schema."}),`
`,e.jsxs(s.li,{children:["Migra authz, precarga sus políticas y provisiona los principales de ",e.jsx(s.code,{children:"services.authz.bootstrap"}),"."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["El job es idempotente, por lo que un upgrade fallido puede reintentarse. Requiere un rol de PostgreSQL autorizado para crear bases de datos y schemas, como se describe en ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/helm#antes-de-comenzar",children:"Instala con Helm"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"antes-de-actualizar",children:"Antes de actualizar"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{children:[`
`,e.jsx(s.li,{children:"Anota los nombres de tus PVC existentes de almacenamiento local:"}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"export"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" NAMESPACE"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"lamassu   "}),e.jsx(s.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# namespace de tu instalación 3.8.0"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"export"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" RELEASE"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"lamassu     "}),e.jsx(s.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# nombre de tu release de Helm"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pvc"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"-l"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" app.kubernetes.io/instance="}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"$RELEASE"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# en una instalación 3.8.0 también puedes listar los nombres fijos directamente:"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pvc"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"golang-engine-storage-kms-0"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" local-crl-file-storage-va-0"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsx(s.code,{children:"helm upgrade"})," no toca ni elimina los PVC antiguos, pero tras el upgrade nada los referencia. Necesitas sus nombres para copiar los datos y limpiar después; no los elimines hasta verificar los volúmenes nuevos."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{start:"2",children:[`
`,e.jsxs(s.li,{children:["Elimina los valores que el schema estricto ahora rechaza, por ejemplo el bloque antiguo ",e.jsx(s.code,{children:"toolbox:"}),". ",e.jsx(s.a,{href:"#actualiza-el-archivo-de-valores",children:"Actualiza el archivo de valores"})," recoge cada renombrado."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"actualiza-el-archivo-de-valores",children:"Actualiza el archivo de valores"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsxs(s.strong,{children:["Añade ",e.jsx(s.code,{children:"services.authz"})," (obligatorio)."]})," La 3.8.0 no tenía servicio de autorización: toda ruta aceptaba cualquier token válido. La 4.0.0 añade autorización fina a nivel de entidad, y un archivo de valores de 3.8.0 no tiene nada que migrar — debes añadir la configuración:"]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"services"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  authz"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    credentials"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      pki"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        database"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      authz"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        database"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" authz"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"authz"})," es el almacenamiento propio del servicio de autorización para principales, grants y políticas (",e.jsx(s.code,{children:"services.authz.database"}),", ",e.jsx(s.code,{children:"authz"})," por defecto)."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"pki"})," es la base de datos que el motor de autorización consulta al evaluar políticas contra entidades como CA, certificados, dispositivos, DMS, claves KMS y roles de VA."]}),`
`,e.jsxs(s.li,{children:["De cada entrada de credentials solo se lee el campo ",e.jsx(s.code,{children:"database"}),". Los parámetros de conexión siempre provienen de los valores globales ",e.jsx(s.code,{children:"postgres.hostname"}),", ",e.jsx(s.code,{children:"postgres.port"}),", ",e.jsx(s.code,{children:"postgres.username"})," y ",e.jsx(s.code,{children:"postgres.password"}),"."]}),`
`,e.jsxs(s.li,{children:["Comprueba que ",e.jsx(s.code,{children:"services.authz.bootstrap"})," (presente por defecto en el chart) coincide con cómo tu proveedor OIDC asigna el rol de realm ",e.jsx(s.code,{children:"pki-admin"}),". Sin un principal que coincida con la regla de bootstrap, nadie podrá administrar la PKI — no existe un superusuario implícito."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsxs(s.strong,{children:["Renombra ",e.jsx(s.code,{children:"toolbox"})," a ",e.jsx(s.code,{children:"connectivityTest"}),"."]})," El hook de conectividad de ",e.jsx(s.code,{children:"helm test"})," usa ahora la imagen ",e.jsx(s.code,{children:"curlimages/curl"}),", mantenida upstream y fijada por digest, en lugar de la imagen de toolbox propia del chart:"]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# ANTIGUO (3.8.0)"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"toolbox"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  image"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" ghcr.io/lamassuiot/toolbox:2.2.0"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# NUEVO (4.0.0)"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"connectivityTest"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  image"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" curlimages/curl@sha256:58adaa4e8dca9c988bae2aba4ab3434a0bb2da16bbe3f92dec39ec7785166777"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Elimina las sobrecargas de identidad por servicio."})," ",e.jsx(s.code,{children:"services.kms.securityContext.runAsGroup: 0"})," y ",e.jsx(s.code,{children:"services.authz.securityContext.runAsUser"}),"/",e.jsx(s.code,{children:"runAsGroup: 999"})," ya no existen. Todos los servicios se ejecutan con el ",e.jsx(s.code,{children:"65532:65532"})," global del chart, y el acceso de grupo a los volúmenes de KMS y al socket PKCS#11 se gestiona automáticamente mediante el ",e.jsx(s.code,{children:"fsGroup: 65532"})," del pod."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsxs(s.strong,{children:["Convierte ",e.jsx(s.code,{children:"services.connectors"})," en un mapa."]})," Cada entrada se indexa por su ID estable de conector y declara ",e.jsx(s.code,{children:"type"})," e ",e.jsx(s.code,{children:"image"}),":"]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"services"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  connectors"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    aws.myconnector"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      type"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" awsiot"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      image"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" ghcr.io/lamassuiot/lamassu-aws-connector:dev-v4"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Revisa los valores del emisor TLS."})," Con ",e.jsx(s.code,{children:"tls.certManagerOptions.issuer"})," vacío (el valor por defecto), el chart crea un emisor self-signed dependiente del release — por ejemplo ",e.jsx(s.code,{children:"lamassu-downstream-ca-selfsigned-issuer"})," con el release ",e.jsx(s.code,{children:"lamassu"}),". El valor legado literal ",e.jsx(s.code,{children:"downstream-ca-selfsigned-issuer"})," de los values de la era 3.8.0 sigue aceptándose y resuelve al mismo emisor dependiente del release; apunta ",e.jsx(s.code,{children:"tls.certManagerOptions.clusterIssuer"})," a tu propio emisor para TLS corporativo."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Revisa scheduling y puertos."})," El chart ya no inyecta anti-afinidad de pods ni restricciones de topology spread — configura ",e.jsx(s.code,{children:"affinity"})," y ",e.jsx(s.code,{children:"topologySpreadConstraints"})," explícitamente donde tu clúster las necesite. El valor por defecto de ",e.jsx(s.code,{children:"services.ui.port"})," es ahora ",e.jsx(s.code,{children:"8085"}),", el puerto sin privilegios global del chart que usa la imagen sin root, así que actualiza las sobrecargas que fijaban ",e.jsx(s.code,{children:"80"}),". El bloque compartido ",e.jsx(s.code,{children:"probes:"})," se sustituye por bloques independientes ",e.jsx(s.code,{children:"livenessProbe"}),", ",e.jsx(s.code,{children:"readinessProbe"})," y ",e.jsx(s.code,{children:"startupProbe"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"ejecuta-el-upgrade",children:"Ejecuta el upgrade"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" upgrade"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --install"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$RELEASE"'}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu/lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --values"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" values.yaml"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --wait"})})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"Helm ejecuta el job de base de datos antes de aplicar cualquier carga de trabajo, por lo que ningún servicio arranca contra una base de datos sin preparar. Si la validación rechaza valores desconocidos, corrige el archivo y vuelve a ejecutarlo."})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"migra-los-datos-de-kms-y-va",children:"Migra los datos de KMS y VA"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Omite esta sección en instalaciones nuevas, o si ",e.jsx(s.code,{children:"services.kms.cryptoEngines"})," nunca usó un motor ",e.jsx(s.code,{children:"filesystem"})," y ",e.jsx(s.code,{children:"services.va.fileStore.type"})," nunca fue ",e.jsx(s.code,{children:"local"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Identifica los nuevos StatefulSets y PVC."})," Sus nombres dependen del nombre del release y de cualquier ",e.jsx(s.code,{children:"nameOverride"}),"/",e.jsx(s.code,{children:"fullnameOverride"}),"; el nombre del PVC es ",e.jsx(s.code,{children:"<volumeClaimTemplate>-<nombre-del-StatefulSet>-0"}),":"]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"KMS_STS"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"$("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -l"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "app.kubernetes.io/instance=$RELEASE,app.kubernetes.io/component=kms"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -o"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" jsonpath="}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"'{.items[0].metadata.name}'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"VA_STS"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"$("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -l"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "app.kubernetes.io/instance=$RELEASE,app.kubernetes.io/component=va"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -o"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" jsonpath="}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"'{.items[0].metadata.name}'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:")"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"KMS_PVC"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"golang-engine-storage-${KMS_STS}-0"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"VA_PVC"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"local-crl-file-storage-${VA_STS}-0"'})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pvc"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  golang-engine-storage-kms-0"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$KMS_PVC"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  local-crl-file-storage-va-0"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$VA_PVC"'})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Con el release ",e.jsx(s.code,{children:"lamassu"})," y el nombre de chart por defecto, los nuevos PVC son ",e.jsx(s.code,{children:"golang-engine-storage-lamassu-kms-0"})," y ",e.jsx(s.code,{children:"local-crl-file-storage-lamassu-va-0"}),"; con el release ",e.jsx(s.code,{children:"prod"})," son ",e.jsx(s.code,{children:"golang-engine-storage-prod-lamassu-kms-0"})," y ",e.jsx(s.code,{children:"local-crl-file-storage-prod-lamassu-va-0"}),". Comprueba que existen los PVC antiguos y nuevos antes de continuar."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{start:"2",children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Reduce a cero los nuevos StatefulSets"})," para que nada escriba en ninguno de los volúmenes mientras copias:"]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" scale"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$KMS_STS"'}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$VA_STS"'}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --replicas=0"})]})})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{start:"3",children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Arranca un pod auxiliar efímero"})," que monte las cuatro PVC:"]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cat"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <<"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"EOF"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" |"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" apply"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -f"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"apiVersion: v1"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"kind: Pod"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"metadata:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  name: pvc-migrate-helper"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  namespace: $NAMESPACE"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"spec:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  restartPolicy: Never"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  containers:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - name: migrate"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"      image: docker.io/library/alpine:3.20"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:'      command: ["sh", "-c", "sleep 3600"]'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"      volumeMounts:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"        - {name: old-kms, mountPath: /old/kms}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"        - {name: new-kms, mountPath: /new/kms}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"        - {name: old-va,  mountPath: /old/va}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"        - {name: new-va,  mountPath: /new/va}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  volumes:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - {name: old-kms, persistentVolumeClaim: {claimName: golang-engine-storage-kms-0}}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - {name: new-kms, persistentVolumeClaim: {claimName: $KMS_PVC}}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - {name: old-va,  persistentVolumeClaim: {claimName: local-crl-file-storage-va-0}}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - {name: new-va,  persistentVolumeClaim: {claimName: $VA_PVC}}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"EOF"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" wait"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"--for=condition=Ready"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pod/pvc-migrate-helper"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --timeout=60s"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{start:"4",children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Inspecciona antes de escribir"})," para no machacar datos que los pods nuevos pudieran haber escrito ya:"]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" exec"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"pvc-migrate-helper"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" sh"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -c"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" 'find /new/kms /new/va -type f'"})]})})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"Un resultado vacío es lo habitual: el pod propio de un StatefulSet rara vez llega a escribir nada cuando le faltan sus datos."})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{start:"5",children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Copia los datos y ajusta la propiedad"}),":"]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" exec"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"pvc-migrate-helper"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" sh"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -c"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" '"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"  cp -a /old/kms/. /new/kms/ &&"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"  cp -a /old/va/. /new/va/ &&"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"  chown -R 65532:65532 /new/kms /new/va"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"'"})})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["El ",e.jsx(s.code,{children:"chown"})," es obligatorio aunque los archivos antiguos ya parezcan ser de un usuario sin root. La 3.8.0 no fijaba la identidad del contenedor, por lo que los archivos podían llevar cualquier UID declarado por la imagen; la 4.0.0 exige exactamente ",e.jsx(s.code,{children:"65532:65532"})," y no retrocede a lo que declare la imagen."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{start:"6",children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Vuelve a escalar y elimina el auxiliar"}),":"]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" delete"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pod"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"pvc-migrate-helper"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" scale"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$KMS_STS"'}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$VA_STS"'}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --replicas=1"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"verifica-la-migración",children:"Verifica la migración"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Los logs de KMS y VA no muestran errores ",e.jsx(s.code,{children:"no such file or directory"})," ni ",e.jsx(s.code,{children:"code=NotFound"}),"."]}),`
`,e.jsxs(s.li,{children:["Una CRL emitida anteriormente vuelve a servirse: ",e.jsx(s.code,{children:"GET /crl/<ca-ski>"})," sobre VA."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:'helm test "$RELEASE" -n $NAMESPACE --logs'})," pasa; el hook de conectividad comprueba los endpoints de salud de CA, DMS Manager, Device Manager y VA, y la respuesta de la UI."]}),`
`,e.jsx(s.li,{children:"Inicia sesión con una identidad de administrador y confirma que las operaciones están autorizadas."}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"elimina-los-volúmenes-antiguos",children:"Elimina los volúmenes antiguos"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"Solo cuando todo funcione, elimina los volúmenes huérfanos de 3.8.0 para recuperar almacenamiento:"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" delete"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pvc"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"golang-engine-storage-kms-0"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" local-crl-file-storage-va-0"})]})})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"resolución-de-problemas",children:"Resolución de problemas"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsxs(s.strong,{children:["Los pods de KMS o VA fallan con ",e.jsx(s.code,{children:"no such file or directory"})," o ",e.jsx(s.code,{children:"code=NotFound"})," justo después del upgrade."]})," Los pods nuevos están enlazados a los PVC nuevos y vacíos y la migración de datos todavía no se ha ejecutado, o se copió en el PVC equivocado. Sigue ",e.jsx(s.a,{href:"#migra-los-datos-de-kms-y-va",children:"Migra los datos de KMS y VA"})," y comprueba que existen las cuatro PVC."]}),`
`,e.jsxs(s.li,{children:[e.jsxs(s.strong,{children:[e.jsx(s.code,{children:"helm upgrade"})," falla con un error de validación de clave desconocida."]})," Elimina o renombra los valores heredados — normalmente el bloque ",e.jsx(s.code,{children:"toolbox:"})," — porque el schema estricto rechaza claves de nivel superior desconocidas."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"El upgrade falla en el job de base de datos."})," El rol de PostgreSQL no puede crear bases de datos ni schemas; concede los privilegios necesarios, o crea tú mismo las bases de datos ",e.jsx(s.code,{children:"pki"}),", ",e.jsx(s.code,{children:"authz"})," y ",e.jsx(s.code,{children:"wfx"}),", y vuelve a ejecutar el upgrade."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Nadie puede iniciar sesión tras el upgrade."})," Comprueba que ",e.jsx(s.code,{children:"services.authz.bootstrap"})," coincide con un rol que tu proveedor OIDC asigna realmente (ver ",e.jsx(s.a,{href:"/docs/platform/pki/access-control",children:"Control de acceso"}),") y que el job de migración terminó correctamente."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"páginas-relacionadas",children:"Páginas relacionadas"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(d,{children:[e.jsx(l,{title:"Instala con Helm",description:"Prepara dependencias, configura valores e instala un despliegue controlado.",href:"/docs/deployment/self-hosted/helm"}),e.jsx(l,{title:"Expón el Gateway",description:"Elige un diseño de tráfico externo y gestiona el direccionamiento del Gateway.",href:"/docs/deployment/self-hosted/networking"})]})})]})}function p(a={}){const{wrapper:s}=a.components||{};return s?e.jsx(s,{...a,children:e.jsx(r,{...a})}):r(a)}function n(a,s){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}const k=Object.freeze(Object.defineProperty({__proto__:null,_markdown:o,default:p,frontmatter:c,lmDiff:t,structuredData:h,toc:m},Symbol.toStringTag,{value:"Module"}));export{k as _};
