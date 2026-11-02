import{j as e}from"./index-prc0XQdj.js";let r=`

<span id="gestión-de-claves-criptográficas" />

El servicio de Gestión de Claves Criptográficas (KMS) de Lamassu IoT centraliza la generación, importación, custodia y uso de las claves de la plataforma. Desde aquí se gestionan las claves que soportan a las CAs y al resto de operaciones de firma que dependen de la PKI.

En la configuración actual, Lamassu IoT trabaja exclusivamente con claves asimétricas, como RSA y curvas elípticas. Estas claves se usan para emitir certificados X.509, firmar solicitudes y realizar operaciones de autenticación y validación dentro del sistema.

Qué resuelve el KMS [#qué-resuelve-el-kms]

El KMS unifica la gestión del ciclo de vida de las claves y evita que cada servicio tenga que integrarse directamente con un proveedor criptográfico concreto.

En la práctica, permite:

* Generar nuevos pares de claves desde Lamassu IoT.
* Importar claves creadas externamente.
* Delegar la custodia y las operaciones criptográficas en motores externos.
* Reutilizar claves ya existentes para CAs, CSR y tareas de firma o verificación.

Motores criptográficos [#motores-criptográficos]

Lamassu puede trabajar con distintos motores criptográficos según los requisitos del despliegue. En algunos entornos bastará con un motor software; en otros será necesario delegar la custodia en un HSM, en un servicio cloud o en una plataforma especializada.

Una misma instancia puede tener varios motores configurados al mismo tiempo, incluso varias instancias del mismo tipo. Esto permite adaptar la operación a distintos niveles de seguridad, coste y requisitos regulatorios.

Esta guía se dirige al operador PKI: elige y utiliza un motor ya habilitado. La instalación, credenciales, almacenamiento persistente y conectividad corresponden a [Despliegue](/docs/deployment/self-hosted/helm). Antes de generar una CA, comprueba el motor predeterminado, los algoritmos publicados y que una firma de prueba funciona. La disponibilidad en tu instalación depende de su versión y configuración.

File System [#file-system]

Genera claves software y almacena el material privado en archivos. Su custodia depende de permisos, almacenamiento y copias de seguridad de la instalación. Antes de utilizarlo para una CA operativa, acuerda cómo se recuperará la clave y cómo accederán a ella las réplicas; el registro del KMS no sustituye esos archivos.

HashiCorp Vault [#hashicorp-vault]

El adaptador utiliza almacenamiento KV para el material privado. No equivale a una operación de firma dentro de Vault Transit: quien pueda leer el secreto puede recuperar la clave. Revisa los permisos de lectura, disponibilidad y recuperación con el responsable de Despliegue.

AWS Secrets Manager [#aws-secrets-manager]

Ofrece persistencia cifrada en AWS con coste asociado. Protege la clave en reposo, pero un administrador autorizado puede recuperarla; no proporciona la misma resistencia a la extracción que un KMS o HSM.

AWS KMS [#aws-kms]

Delega las firmas en el servicio AWS KMS. El adaptador también contempla importación de material externo, sujeta a las capacidades y permisos del proveedor. Una clave generada fuera del servicio ya ha existido fuera de su custodia; importarla no elimina esas copias. Comprueba generación, importación y firma como operaciones distintas.

PKCS#11 [#pkcs11]

Permite integrar HSMs locales, entornos aislados y servicios *Key as a Service*. La generación, persistencia y resistencia a la extracción dependen del dispositivo o proveedor concreto. Es la opción más flexible cuando la política exige custodia hardware.

Azure Key Vault [#azure-key-vault]

El backend también dispone de adaptadores para **Key Vault Keys** y **Key Vault Secrets**. El primero delega firmas al servicio de claves; el segundo conserva material privado como secretos y firma con ese material. No intercambies ambos modelos de custodia. Confirma qué adaptador está habilitado en tu instalación y prueba las operaciones necesarias.

Lamassu muestra en la consola el listado de motores habilitados.

Cada motor define qué algoritmos soporta, como RSA o ECC/ECDSA, y qué tamaños de clave puede generar.

Revisa con el operador de Despliegue qué motor está definido como predeterminado. Ese motor se utilizará cuando un proceso necesite crear o persistir una clave y el usuario no haya seleccionado uno específico, por ejemplo al crear o importar una CA.

Inventario de claves [#inventario-de-claves]

La pantalla principal de KMS muestra el inventario completo de claves registradas en el sistema. Es la vista de referencia para revisar qué claves existen, dónde están custodiadas y con qué entidades están relacionadas.

La tabla incluye los siguientes campos:

* **Name**: nombre descriptivo de la clave.
* **Type**: algoritmo y tamaño de clave, por ejemplo RSA 2048 o EC P-256.
* **Strength**: indicador visual de fortaleza criptográfica.
* **Public/Private**: indica si Lamassu gestiona el par completo o solo la clave pública.
* **Crypto Engine**: motor criptográfico que custodia la clave.
* **Aliases**: nombres alternativos asociados a la clave.
* **Tags**: etiquetas para clasificación y búsqueda.
* **Related Entities**: certificados u otras entidades vinculadas a esa clave.

Desde esta vista también se accede a las acciones más habituales:

* **View Details** para consultar metadatos, identificadores y relaciones.
* **Generate CSR** para crear una solicitud PKCS#10 con la clave seleccionada.
* **Sign / Verify** para probar operaciones criptográficas sobre la clave.
* **Delete Key** para eliminar la clave del sistema.

Crear o importar claves [#crear-o-importar-claves]

Necesitas permisos de administración de claves y un motor accesible. El perfil de emisión debe admitir el algoritmo que eliges si la clave va a utilizarse en una CA o CSR. Abre **Create New Key** y elige generación o importación.

Generar un nuevo par de claves [#generar-un-nuevo-par-de-claves]

Si la clave va a nacer dentro de Lamassu, el flujo recomendado es generar un nuevo par gestionado directamente por uno de los motores configurados.

En la primera pantalla del asistente, elige **Generate New Key Pair** y después define los parámetros principales:

* **Key Name**: nombre único y descriptivo.
* **Crypto Engine**: motor que custodiará la clave.
* **Key Type** y **Key Size**: algoritmo y tamaño o curva.
* **Tags**: metadatos para clasificar la clave.
* **Metadata**: información adicional para usos avanzados.

Importar un par existente [#importar-un-par-existente]

La importación permite registrar en Lamassu una clave generada fuera de la plataforma. Es el flujo habitual en escenarios BYOK, migraciones o integración con material criptográfico que ya está en producción.

* Cuando tienes una clave privada exportable y el motor de destino admite su importación.
* Cuando se necesita migrar una PKI existente sin reemitir certificados.
* Cuando Lamassu debe operar con una raíz de confianza creada por un tercero.

En el asistente, elige **Import Existing Key Pair** y completa los campos solicitados:

* **Key Name**: nombre descriptivo dentro de Lamassu IoT.
* **Crypto Engine**: motor que custodiará la clave importada.
* **Tags**: etiquetas para organización y búsqueda.
* **Metadata**: información adicional opcional.
* **Private Key (PEM)**: clave privada en formato PEM.

Si la importación termina correctamente, abre el registro, comprueba motor y clave pública y realiza una firma de prueba. Una clave no exportable en un HSM no puede cargarse mediante este formulario PEM: configura el acceso al motor y comprueba cómo se registra la clave existente. Revisa dependencias y recursos que puedan haberse creado en el proveedor si una operación falla a mitad.

Operaciones sobre una clave [#operaciones-sobre-una-clave]

Cada clave registrada dispone de una vista de detalle y de varias acciones operativas.

Ver detalles [#ver-detalles]

La pantalla **View Details** concentra la información técnica y administrativa de la clave.

En la pestaña **Overview** se muestran, entre otros, estos campos:

* **Key Name**: nombre descriptivo.
* **Key Identifier**: identificador único del sistema. Lamassu utiliza formatos de ID basados en PKCS11.
* **Tags**: etiquetas asociadas.
* **Aliases**: nombres alternativos.
* **Crypto Engine**: motor en el que reside la clave.
* **Algorithm, Key Size & Strength**: algoritmo, parámetros y nivel de fortaleza.

La sección **Related Entities** muestra qué objetos de Lamassu dependen de esa clave.

La pestaña **Public Key** muestra el material público en PEM. El identificador y la URI del registro sirven para localizar la clave; una URI con formato PKCS#11 no demuestra que el motor sea un HSM ni que exista un módulo local para acceder a ella.

Firmar y verificar [#firmar-y-verificar]

La acción **Sign / Verify** sirve para validar que la clave y el motor criptográfico funcionan correctamente.

Firma un mensaje de prueba, guarda la firma y verifícala con la misma clave pública, algoritmo y codificación. Cambia después el mensaje: la verificación debe fallar. Esto comprueba una operación concreta; no certifica todas las capacidades del motor ni la cadena de una CA.

Al abrirla aparecen dos áreas: **Sign** y **Verify**.

Sign [#sign]

Esta pestaña usa la clave privada para generar una firma digital sobre un mensaje o sobre un *digest* ya calculado.

Campos principales:

* **Algorithm**: algoritmo de firma disponible para el tipo de clave.
* **Message Type**: \`Raw\` para datos en claro o \`Digest\` para un hash precalculado.
* **Payload Encoding**: codificación de entrada, como UTF-8, Hex o Base64.
* **Message**: contenido que se va a firmar.
* **Signature**: resultado de la operación, mostrado en hexadecimal.

Verify [#verify]

Esta pestaña comprueba si una firma corresponde a la clave pública asociada.

Campos principales:

* **Algorithm**: debe coincidir con el algoritmo usado para la firma.
* **Message Type**: \`Raw\` o \`Digest\`.
* **Payload Encoding**: codificación del mensaje.
* **Message**: mensaje original o hash.
* **Signature**: firma que se desea comprobar.
* **Result**: indicador del resultado de la validación.

Generar un CSR [#generar-un-csr]

La acción **Generate CSR** crea una solicitud PKCS#10 firmada con la clave privada custodiada en Lamassu, sin exponerla fuera del motor criptográfico.

Este flujo es útil para:

* Solicitar certificados a una CA externa.
* Renovar una identidad manteniendo la misma clave.

Al abrir el formulario se solicitan los datos del sujeto y los atributos principales del certificado:

* **Common Name (CN)**: nombre principal de la identidad.
* **Organization (O)**: organización o empresa.
* **Organizational Unit (OU)**: departamento o unidad.
* **Country (C)**: código de país de dos letras.
* **State / Province (ST)**: estado o provincia.
* **Locality (L)**: ciudad o localidad.
* **Email Address**: correo de contacto.
* **Subject Alternative Names (SANs)**: nombres o identificadores alternativos, como DNS o IP.

Descarga la CSR y ejecuta \`openssl req -in request.csr -noout -verify -text\`. Comprueba firma, sujeto y SAN antes de enviarla. La CSR no determina por sí sola el certificado final: la [política de emisión](/docs/platform/pki/certificate-profiles) puede sustituir sus campos.

Firma local con PKCS#11 [#firma-local-con-pkcs11]

Lamassu también ofrece una ayuda específica para integraciones locales mediante **Sign locally with OpenSSL & PKCS11 tools**.

Requiere el módulo, token y permisos del proveedor correspondiente. Comprueba que el identificador de Lamassu se corresponde con el objeto accesible desde ese módulo. La configuración del módulo pertenece al entorno del cliente o al [Despliegue](/docs/deployment/self-hosted/helm).

Antes de eliminar una clave [#antes-de-eliminar-una-clave]

Revisa **Related Entities** y localiza CAs, certificados y procesos de validación que siguen necesitando firmas. Revocar una CA no elimina la necesidad de publicar estado durante su periodo de retención. Eliminar una clave tampoco revoca automáticamente sus certificados. Planifica sustitución y retención antes de usar **Delete Key**; el efecto de borrado en el proveedor depende del motor.
`,s={title:"Claves y motores criptográficos",description:"Genera, importa y opera claves sin acoplar la PKI a un proveedor concreto."},o={contents:[{heading:void 0,content:"El servicio de Gestión de Claves Criptográficas (KMS) de Lamassu IoT centraliza la generación, importación, custodia y uso de las claves de la plataforma. Desde aquí se gestionan las claves que soportan a las CAs y al resto de operaciones de firma que dependen de la PKI."},{heading:void 0,content:"En la configuración actual, Lamassu IoT trabaja exclusivamente con claves asimétricas, como RSA y curvas elípticas. Estas claves se usan para emitir certificados X.509, firmar solicitudes y realizar operaciones de autenticación y validación dentro del sistema."},{heading:"qué-resuelve-el-kms",content:"El KMS unifica la gestión del ciclo de vida de las claves y evita que cada servicio tenga que integrarse directamente con un proveedor criptográfico concreto."},{heading:"qué-resuelve-el-kms",content:"En la práctica, permite:"},{heading:"qué-resuelve-el-kms",content:"Generar nuevos pares de claves desde Lamassu IoT."},{heading:"qué-resuelve-el-kms",content:"Importar claves creadas externamente."},{heading:"qué-resuelve-el-kms",content:"Delegar la custodia y las operaciones criptográficas en motores externos."},{heading:"qué-resuelve-el-kms",content:"Reutilizar claves ya existentes para CAs, CSR y tareas de firma o verificación."},{heading:"motores-criptográficos",content:"Lamassu puede trabajar con distintos motores criptográficos según los requisitos del despliegue. En algunos entornos bastará con un motor software; en otros será necesario delegar la custodia en un HSM, en un servicio cloud o en una plataforma especializada."},{heading:"motores-criptográficos",content:"Una misma instancia puede tener varios motores configurados al mismo tiempo, incluso varias instancias del mismo tipo. Esto permite adaptar la operación a distintos niveles de seguridad, coste y requisitos regulatorios."},{heading:"motores-criptográficos",content:"Esta guía se dirige al operador PKI: elige y utiliza un motor ya habilitado. La instalación, credenciales, almacenamiento persistente y conectividad corresponden a Despliegue. Antes de generar una CA, comprueba el motor predeterminado, los algoritmos publicados y que una firma de prueba funciona. La disponibilidad en tu instalación depende de su versión y configuración."},{heading:"file-system",content:"Genera claves software y almacena el material privado en archivos. Su custodia depende de permisos, almacenamiento y copias de seguridad de la instalación. Antes de utilizarlo para una CA operativa, acuerda cómo se recuperará la clave y cómo accederán a ella las réplicas; el registro del KMS no sustituye esos archivos."},{heading:"hashicorp-vault",content:"El adaptador utiliza almacenamiento KV para el material privado. No equivale a una operación de firma dentro de Vault Transit: quien pueda leer el secreto puede recuperar la clave. Revisa los permisos de lectura, disponibilidad y recuperación con el responsable de Despliegue."},{heading:"aws-secrets-manager",content:"Ofrece persistencia cifrada en AWS con coste asociado. Protege la clave en reposo, pero un administrador autorizado puede recuperarla; no proporciona la misma resistencia a la extracción que un KMS o HSM."},{heading:"aws-kms",content:"Delega las firmas en el servicio AWS KMS. El adaptador también contempla importación de material externo, sujeta a las capacidades y permisos del proveedor. Una clave generada fuera del servicio ya ha existido fuera de su custodia; importarla no elimina esas copias. Comprueba generación, importación y firma como operaciones distintas."},{heading:"pkcs11",content:"Permite integrar HSMs locales, entornos aislados y servicios *Key as a Service*. La generación, persistencia y resistencia a la extracción dependen del dispositivo o proveedor concreto. Es la opción más flexible cuando la política exige custodia hardware."},{heading:"azure-key-vault",content:"El backend también dispone de adaptadores para **Key Vault Keys** y **Key Vault Secrets**. El primero delega firmas al servicio de claves; el segundo conserva material privado como secretos y firma con ese material. No intercambies ambos modelos de custodia. Confirma qué adaptador está habilitado en tu instalación y prueba las operaciones necesarias."},{heading:"azure-key-vault",content:"Lamassu muestra en la consola el listado de motores habilitados."},{heading:"azure-key-vault",content:"Cada motor define qué algoritmos soporta, como RSA o ECC/ECDSA, y qué tamaños de clave puede generar."},{heading:"azure-key-vault",content:"Revisa con el operador de Despliegue qué motor está definido como predeterminado. Ese motor se utilizará cuando un proceso necesite crear o persistir una clave y el usuario no haya seleccionado uno específico, por ejemplo al crear o importar una CA."},{heading:"inventario-de-claves",content:"La pantalla principal de KMS muestra el inventario completo de claves registradas en el sistema. Es la vista de referencia para revisar qué claves existen, dónde están custodiadas y con qué entidades están relacionadas."},{heading:"inventario-de-claves",content:"La tabla incluye los siguientes campos:"},{heading:"inventario-de-claves",content:"**Name**: nombre descriptivo de la clave."},{heading:"inventario-de-claves",content:"**Type**: algoritmo y tamaño de clave, por ejemplo RSA 2048 o EC P-256."},{heading:"inventario-de-claves",content:"**Strength**: indicador visual de fortaleza criptográfica."},{heading:"inventario-de-claves",content:"**Public/Private**: indica si Lamassu gestiona el par completo o solo la clave pública."},{heading:"inventario-de-claves",content:"**Crypto Engine**: motor criptográfico que custodia la clave."},{heading:"inventario-de-claves",content:"**Aliases**: nombres alternativos asociados a la clave."},{heading:"inventario-de-claves",content:"**Tags**: etiquetas para clasificación y búsqueda."},{heading:"inventario-de-claves",content:"**Related Entities**: certificados u otras entidades vinculadas a esa clave."},{heading:"inventario-de-claves",content:"Desde esta vista también se accede a las acciones más habituales:"},{heading:"inventario-de-claves",content:"**View Details** para consultar metadatos, identificadores y relaciones."},{heading:"inventario-de-claves",content:"**Generate CSR** para crear una solicitud PKCS#10 con la clave seleccionada."},{heading:"inventario-de-claves",content:"**Sign / Verify** para probar operaciones criptográficas sobre la clave."},{heading:"inventario-de-claves",content:"**Delete Key** para eliminar la clave del sistema."},{heading:"crear-o-importar-claves",content:"Necesitas permisos de administración de claves y un motor accesible. El perfil de emisión debe admitir el algoritmo que eliges si la clave va a utilizarse en una CA o CSR. Abre **Create New Key** y elige generación o importación."},{heading:"generar-un-nuevo-par-de-claves",content:"Si la clave va a nacer dentro de Lamassu, el flujo recomendado es generar un nuevo par gestionado directamente por uno de los motores configurados."},{heading:"generar-un-nuevo-par-de-claves",content:"En la primera pantalla del asistente, elige **Generate New Key Pair** y después define los parámetros principales:"},{heading:"generar-un-nuevo-par-de-claves",content:"**Key Name**: nombre único y descriptivo."},{heading:"generar-un-nuevo-par-de-claves",content:"**Crypto Engine**: motor que custodiará la clave."},{heading:"generar-un-nuevo-par-de-claves",content:"**Key Type** y **Key Size**: algoritmo y tamaño o curva."},{heading:"generar-un-nuevo-par-de-claves",content:"**Tags**: metadatos para clasificar la clave."},{heading:"generar-un-nuevo-par-de-claves",content:"**Metadata**: información adicional para usos avanzados."},{heading:"importar-un-par-existente",content:"La importación permite registrar en Lamassu una clave generada fuera de la plataforma. Es el flujo habitual en escenarios BYOK, migraciones o integración con material criptográfico que ya está en producción."},{heading:"importar-un-par-existente",content:"Cuando tienes una clave privada exportable y el motor de destino admite su importación."},{heading:"importar-un-par-existente",content:"Cuando se necesita migrar una PKI existente sin reemitir certificados."},{heading:"importar-un-par-existente",content:"Cuando Lamassu debe operar con una raíz de confianza creada por un tercero."},{heading:"importar-un-par-existente",content:"En el asistente, elige **Import Existing Key Pair** y completa los campos solicitados:"},{heading:"importar-un-par-existente",content:"**Key Name**: nombre descriptivo dentro de Lamassu IoT."},{heading:"importar-un-par-existente",content:"**Crypto Engine**: motor que custodiará la clave importada."},{heading:"importar-un-par-existente",content:"**Tags**: etiquetas para organización y búsqueda."},{heading:"importar-un-par-existente",content:"**Metadata**: información adicional opcional."},{heading:"importar-un-par-existente",content:"**Private Key (PEM)**: clave privada en formato PEM."},{heading:"importar-un-par-existente",content:"Si la importación termina correctamente, abre el registro, comprueba motor y clave pública y realiza una firma de prueba. Una clave no exportable en un HSM no puede cargarse mediante este formulario PEM: configura el acceso al motor y comprueba cómo se registra la clave existente. Revisa dependencias y recursos que puedan haberse creado en el proveedor si una operación falla a mitad."},{heading:"operaciones-sobre-una-clave",content:"Cada clave registrada dispone de una vista de detalle y de varias acciones operativas."},{heading:"ver-detalles",content:"La pantalla **View Details** concentra la información técnica y administrativa de la clave."},{heading:"ver-detalles",content:"En la pestaña **Overview** se muestran, entre otros, estos campos:"},{heading:"ver-detalles",content:"**Key Name**: nombre descriptivo."},{heading:"ver-detalles",content:"**Key Identifier**: identificador único del sistema. Lamassu utiliza formatos de ID basados en PKCS11."},{heading:"ver-detalles",content:"**Tags**: etiquetas asociadas."},{heading:"ver-detalles",content:"**Aliases**: nombres alternativos."},{heading:"ver-detalles",content:"**Crypto Engine**: motor en el que reside la clave."},{heading:"ver-detalles",content:"**Algorithm, Key Size & Strength**: algoritmo, parámetros y nivel de fortaleza."},{heading:"ver-detalles",content:"La sección **Related Entities** muestra qué objetos de Lamassu dependen de esa clave."},{heading:"ver-detalles",content:"La pestaña **Public Key** muestra el material público en PEM. El identificador y la URI del registro sirven para localizar la clave; una URI con formato PKCS#11 no demuestra que el motor sea un HSM ni que exista un módulo local para acceder a ella."},{heading:"firmar-y-verificar",content:"La acción **Sign / Verify** sirve para validar que la clave y el motor criptográfico funcionan correctamente."},{heading:"firmar-y-verificar",content:"Firma un mensaje de prueba, guarda la firma y verifícala con la misma clave pública, algoritmo y codificación. Cambia después el mensaje: la verificación debe fallar. Esto comprueba una operación concreta; no certifica todas las capacidades del motor ni la cadena de una CA."},{heading:"firmar-y-verificar",content:"Al abrirla aparecen dos áreas: **Sign** y **Verify**."},{heading:"sign",content:"Esta pestaña usa la clave privada para generar una firma digital sobre un mensaje o sobre un *digest* ya calculado."},{heading:"sign",content:"Campos principales:"},{heading:"sign",content:"**Algorithm**: algoritmo de firma disponible para el tipo de clave."},{heading:"sign",content:"**Message Type**: `Raw` para datos en claro o `Digest` para un hash precalculado."},{heading:"sign",content:"**Payload Encoding**: codificación de entrada, como UTF-8, Hex o Base64."},{heading:"sign",content:"**Message**: contenido que se va a firmar."},{heading:"sign",content:"**Signature**: resultado de la operación, mostrado en hexadecimal."},{heading:"verify",content:"Esta pestaña comprueba si una firma corresponde a la clave pública asociada."},{heading:"verify",content:"Campos principales:"},{heading:"verify",content:"**Algorithm**: debe coincidir con el algoritmo usado para la firma."},{heading:"verify",content:"**Message Type**: `Raw` o `Digest`."},{heading:"verify",content:"**Payload Encoding**: codificación del mensaje."},{heading:"verify",content:"**Message**: mensaje original o hash."},{heading:"verify",content:"**Signature**: firma que se desea comprobar."},{heading:"verify",content:"**Result**: indicador del resultado de la validación."},{heading:"generar-un-csr",content:"La acción **Generate CSR** crea una solicitud PKCS#10 firmada con la clave privada custodiada en Lamassu, sin exponerla fuera del motor criptográfico."},{heading:"generar-un-csr",content:"Este flujo es útil para:"},{heading:"generar-un-csr",content:"Solicitar certificados a una CA externa."},{heading:"generar-un-csr",content:"Renovar una identidad manteniendo la misma clave."},{heading:"generar-un-csr",content:"Al abrir el formulario se solicitan los datos del sujeto y los atributos principales del certificado:"},{heading:"generar-un-csr",content:"**Common Name (CN)**: nombre principal de la identidad."},{heading:"generar-un-csr",content:"**Organization (O)**: organización o empresa."},{heading:"generar-un-csr",content:"**Organizational Unit (OU)**: departamento o unidad."},{heading:"generar-un-csr",content:"**Country (C)**: código de país de dos letras."},{heading:"generar-un-csr",content:"**State / Province (ST)**: estado o provincia."},{heading:"generar-un-csr",content:"**Locality (L)**: ciudad o localidad."},{heading:"generar-un-csr",content:"**Email Address**: correo de contacto."},{heading:"generar-un-csr",content:"**Subject Alternative Names (SANs)**: nombres o identificadores alternativos, como DNS o IP."},{heading:"generar-un-csr",content:"Descarga la CSR y ejecuta `openssl req -in request.csr -noout -verify -text`. Comprueba firma, sujeto y SAN antes de enviarla. La CSR no determina por sí sola el certificado final: la política de emisión puede sustituir sus campos."},{heading:"firma-local-con-pkcs11",content:"Lamassu también ofrece una ayuda específica para integraciones locales mediante **Sign locally with OpenSSL & PKCS11 tools**."},{heading:"firma-local-con-pkcs11",content:"Requiere el módulo, token y permisos del proveedor correspondiente. Comprueba que el identificador de Lamassu se corresponde con el objeto accesible desde ese módulo. La configuración del módulo pertenece al entorno del cliente o al Despliegue."},{heading:"antes-de-eliminar-una-clave",content:"Revisa **Related Entities** y localiza CAs, certificados y procesos de validación que siguen necesitando firmas. Revocar una CA no elimina la necesidad de publicar estado durante su periodo de retención. Eliminar una clave tampoco revoca automáticamente sus certificados. Planifica sustitución y retención antes de usar **Delete Key**; el efecto de borrado en el proveedor depende del motor."}],headings:[{id:"qué-resuelve-el-kms",content:"Qué resuelve el KMS"},{id:"motores-criptográficos",content:"Motores criptográficos"},{id:"file-system",content:"File System"},{id:"hashicorp-vault",content:"HashiCorp Vault"},{id:"aws-secrets-manager",content:"AWS Secrets Manager"},{id:"aws-kms",content:"AWS KMS"},{id:"pkcs11",content:"PKCS#11"},{id:"azure-key-vault",content:"Azure Key Vault"},{id:"inventario-de-claves",content:"Inventario de claves"},{id:"crear-o-importar-claves",content:"Crear o importar claves"},{id:"generar-un-nuevo-par-de-claves",content:"Generar un nuevo par de claves"},{id:"importar-un-par-existente",content:"Importar un par existente"},{id:"operaciones-sobre-una-clave",content:"Operaciones sobre una clave"},{id:"ver-detalles",content:"Ver detalles"},{id:"firmar-y-verificar",content:"Firmar y verificar"},{id:"sign",content:"Sign"},{id:"verify",content:"Verify"},{id:"generar-un-csr",content:"Generar un CSR"},{id:"firma-local-con-pkcs11",content:"Firma local con PKCS#11"},{id:"antes-de-eliminar-una-clave",content:"Antes de eliminar una clave"}]};const t=[{depth:2,url:"#qué-resuelve-el-kms",title:e.jsx(e.Fragment,{children:"Qué resuelve el KMS"})},{depth:2,url:"#motores-criptográficos",title:e.jsx(e.Fragment,{children:"Motores criptográficos"})},{depth:3,url:"#file-system",title:e.jsx(e.Fragment,{children:"File System"})},{depth:3,url:"#hashicorp-vault",title:e.jsx(e.Fragment,{children:"HashiCorp Vault"})},{depth:3,url:"#aws-secrets-manager",title:e.jsx(e.Fragment,{children:"AWS Secrets Manager"})},{depth:3,url:"#aws-kms",title:e.jsx(e.Fragment,{children:"AWS KMS"})},{depth:3,url:"#pkcs11",title:e.jsx(e.Fragment,{children:"PKCS#11"})},{depth:3,url:"#azure-key-vault",title:e.jsx(e.Fragment,{children:"Azure Key Vault"})},{depth:2,url:"#inventario-de-claves",title:e.jsx(e.Fragment,{children:"Inventario de claves"})},{depth:2,url:"#crear-o-importar-claves",title:e.jsx(e.Fragment,{children:"Crear o importar claves"})},{depth:3,url:"#generar-un-nuevo-par-de-claves",title:e.jsx(e.Fragment,{children:"Generar un nuevo par de claves"})},{depth:3,url:"#importar-un-par-existente",title:e.jsx(e.Fragment,{children:"Importar un par existente"})},{depth:2,url:"#operaciones-sobre-una-clave",title:e.jsx(e.Fragment,{children:"Operaciones sobre una clave"})},{depth:3,url:"#ver-detalles",title:e.jsx(e.Fragment,{children:"Ver detalles"})},{depth:3,url:"#firmar-y-verificar",title:e.jsx(e.Fragment,{children:"Firmar y verificar"})},{depth:4,url:"#sign",title:e.jsx(e.Fragment,{children:"Sign"})},{depth:4,url:"#verify",title:e.jsx(e.Fragment,{children:"Verify"})},{depth:3,url:"#generar-un-csr",title:e.jsx(e.Fragment,{children:"Generar un CSR"})},{depth:3,url:"#firma-local-con-pkcs11",title:e.jsx(e.Fragment,{children:"Firma local con PKCS#11"})},{depth:2,url:"#antes-de-eliminar-una-clave",title:e.jsx(e.Fragment,{children:"Antes de eliminar una clave"})}];function i(n){const a={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",strong:"strong",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx("span",{id:"gestión-de-claves-criptográficas"}),`
`,e.jsx(a.p,{children:"El servicio de Gestión de Claves Criptográficas (KMS) de Lamassu IoT centraliza la generación, importación, custodia y uso de las claves de la plataforma. Desde aquí se gestionan las claves que soportan a las CAs y al resto de operaciones de firma que dependen de la PKI."}),`
`,e.jsx(a.p,{children:"En la configuración actual, Lamassu IoT trabaja exclusivamente con claves asimétricas, como RSA y curvas elípticas. Estas claves se usan para emitir certificados X.509, firmar solicitudes y realizar operaciones de autenticación y validación dentro del sistema."}),`
`,e.jsx(a.h2,{id:"qué-resuelve-el-kms",children:"Qué resuelve el KMS"}),`
`,e.jsx(a.p,{children:"El KMS unifica la gestión del ciclo de vida de las claves y evita que cada servicio tenga que integrarse directamente con un proveedor criptográfico concreto."}),`
`,e.jsx(a.p,{children:"En la práctica, permite:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Generar nuevos pares de claves desde Lamassu IoT."}),`
`,e.jsx(a.li,{children:"Importar claves creadas externamente."}),`
`,e.jsx(a.li,{children:"Delegar la custodia y las operaciones criptográficas en motores externos."}),`
`,e.jsx(a.li,{children:"Reutilizar claves ya existentes para CAs, CSR y tareas de firma o verificación."}),`
`]}),`
`,e.jsx(a.h2,{id:"motores-criptográficos",children:"Motores criptográficos"}),`
`,e.jsx(a.p,{children:"Lamassu puede trabajar con distintos motores criptográficos según los requisitos del despliegue. En algunos entornos bastará con un motor software; en otros será necesario delegar la custodia en un HSM, en un servicio cloud o en una plataforma especializada."}),`
`,e.jsx(a.p,{children:"Una misma instancia puede tener varios motores configurados al mismo tiempo, incluso varias instancias del mismo tipo. Esto permite adaptar la operación a distintos niveles de seguridad, coste y requisitos regulatorios."}),`
`,e.jsxs(a.p,{children:["Esta guía se dirige al operador PKI: elige y utiliza un motor ya habilitado. La instalación, credenciales, almacenamiento persistente y conectividad corresponden a ",e.jsx(a.a,{href:"/docs/deployment/self-hosted/helm",children:"Despliegue"}),". Antes de generar una CA, comprueba el motor predeterminado, los algoritmos publicados y que una firma de prueba funciona. La disponibilidad en tu instalación depende de su versión y configuración."]}),`
`,e.jsx(a.h3,{id:"file-system",children:"File System"}),`
`,e.jsx(a.p,{children:"Genera claves software y almacena el material privado en archivos. Su custodia depende de permisos, almacenamiento y copias de seguridad de la instalación. Antes de utilizarlo para una CA operativa, acuerda cómo se recuperará la clave y cómo accederán a ella las réplicas; el registro del KMS no sustituye esos archivos."}),`
`,e.jsx(a.h3,{id:"hashicorp-vault",children:"HashiCorp Vault"}),`
`,e.jsx(a.p,{children:"El adaptador utiliza almacenamiento KV para el material privado. No equivale a una operación de firma dentro de Vault Transit: quien pueda leer el secreto puede recuperar la clave. Revisa los permisos de lectura, disponibilidad y recuperación con el responsable de Despliegue."}),`
`,e.jsx(a.h3,{id:"aws-secrets-manager",children:"AWS Secrets Manager"}),`
`,e.jsx(a.p,{children:"Ofrece persistencia cifrada en AWS con coste asociado. Protege la clave en reposo, pero un administrador autorizado puede recuperarla; no proporciona la misma resistencia a la extracción que un KMS o HSM."}),`
`,e.jsx(a.h3,{id:"aws-kms",children:"AWS KMS"}),`
`,e.jsx(a.p,{children:"Delega las firmas en el servicio AWS KMS. El adaptador también contempla importación de material externo, sujeta a las capacidades y permisos del proveedor. Una clave generada fuera del servicio ya ha existido fuera de su custodia; importarla no elimina esas copias. Comprueba generación, importación y firma como operaciones distintas."}),`
`,e.jsx(a.h3,{id:"pkcs11",children:"PKCS#11"}),`
`,e.jsxs(a.p,{children:["Permite integrar HSMs locales, entornos aislados y servicios ",e.jsx(a.em,{children:"Key as a Service"}),". La generación, persistencia y resistencia a la extracción dependen del dispositivo o proveedor concreto. Es la opción más flexible cuando la política exige custodia hardware."]}),`
`,e.jsx(a.h3,{id:"azure-key-vault",children:"Azure Key Vault"}),`
`,e.jsxs(a.p,{children:["El backend también dispone de adaptadores para ",e.jsx(a.strong,{children:"Key Vault Keys"})," y ",e.jsx(a.strong,{children:"Key Vault Secrets"}),". El primero delega firmas al servicio de claves; el segundo conserva material privado como secretos y firma con ese material. No intercambies ambos modelos de custodia. Confirma qué adaptador está habilitado en tu instalación y prueba las operaciones necesarias."]}),`
`,e.jsx(a.p,{children:"Lamassu muestra en la consola el listado de motores habilitados."}),`
`,e.jsx(a.p,{children:"Cada motor define qué algoritmos soporta, como RSA o ECC/ECDSA, y qué tamaños de clave puede generar."}),`
`,e.jsx(a.p,{children:"Revisa con el operador de Despliegue qué motor está definido como predeterminado. Ese motor se utilizará cuando un proceso necesite crear o persistir una clave y el usuario no haya seleccionado uno específico, por ejemplo al crear o importar una CA."}),`
`,e.jsx(a.h2,{id:"inventario-de-claves",children:"Inventario de claves"}),`
`,e.jsx(a.p,{children:"La pantalla principal de KMS muestra el inventario completo de claves registradas en el sistema. Es la vista de referencia para revisar qué claves existen, dónde están custodiadas y con qué entidades están relacionadas."}),`
`,e.jsx(a.p,{children:"La tabla incluye los siguientes campos:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Name"}),": nombre descriptivo de la clave."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Type"}),": algoritmo y tamaño de clave, por ejemplo RSA 2048 o EC P-256."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Strength"}),": indicador visual de fortaleza criptográfica."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Public/Private"}),": indica si Lamassu gestiona el par completo o solo la clave pública."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Crypto Engine"}),": motor criptográfico que custodia la clave."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Aliases"}),": nombres alternativos asociados a la clave."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Tags"}),": etiquetas para clasificación y búsqueda."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Related Entities"}),": certificados u otras entidades vinculadas a esa clave."]}),`
`]}),`
`,e.jsx(a.p,{children:"Desde esta vista también se accede a las acciones más habituales:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"View Details"})," para consultar metadatos, identificadores y relaciones."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Generate CSR"})," para crear una solicitud PKCS#10 con la clave seleccionada."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Sign / Verify"})," para probar operaciones criptográficas sobre la clave."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Delete Key"})," para eliminar la clave del sistema."]}),`
`]}),`
`,e.jsx(a.h2,{id:"crear-o-importar-claves",children:"Crear o importar claves"}),`
`,e.jsxs(a.p,{children:["Necesitas permisos de administración de claves y un motor accesible. El perfil de emisión debe admitir el algoritmo que eliges si la clave va a utilizarse en una CA o CSR. Abre ",e.jsx(a.strong,{children:"Create New Key"})," y elige generación o importación."]}),`
`,e.jsx(a.h3,{id:"generar-un-nuevo-par-de-claves",children:"Generar un nuevo par de claves"}),`
`,e.jsx(a.p,{children:"Si la clave va a nacer dentro de Lamassu, el flujo recomendado es generar un nuevo par gestionado directamente por uno de los motores configurados."}),`
`,e.jsxs(a.p,{children:["En la primera pantalla del asistente, elige ",e.jsx(a.strong,{children:"Generate New Key Pair"})," y después define los parámetros principales:"]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Key Name"}),": nombre único y descriptivo."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Crypto Engine"}),": motor que custodiará la clave."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Key Type"})," y ",e.jsx(a.strong,{children:"Key Size"}),": algoritmo y tamaño o curva."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Tags"}),": metadatos para clasificar la clave."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Metadata"}),": información adicional para usos avanzados."]}),`
`]}),`
`,e.jsx(a.h3,{id:"importar-un-par-existente",children:"Importar un par existente"}),`
`,e.jsx(a.p,{children:"La importación permite registrar en Lamassu una clave generada fuera de la plataforma. Es el flujo habitual en escenarios BYOK, migraciones o integración con material criptográfico que ya está en producción."}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Cuando tienes una clave privada exportable y el motor de destino admite su importación."}),`
`,e.jsx(a.li,{children:"Cuando se necesita migrar una PKI existente sin reemitir certificados."}),`
`,e.jsx(a.li,{children:"Cuando Lamassu debe operar con una raíz de confianza creada por un tercero."}),`
`]}),`
`,e.jsxs(a.p,{children:["En el asistente, elige ",e.jsx(a.strong,{children:"Import Existing Key Pair"})," y completa los campos solicitados:"]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Key Name"}),": nombre descriptivo dentro de Lamassu IoT."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Crypto Engine"}),": motor que custodiará la clave importada."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Tags"}),": etiquetas para organización y búsqueda."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Metadata"}),": información adicional opcional."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Private Key (PEM)"}),": clave privada en formato PEM."]}),`
`]}),`
`,e.jsx(a.p,{children:"Si la importación termina correctamente, abre el registro, comprueba motor y clave pública y realiza una firma de prueba. Una clave no exportable en un HSM no puede cargarse mediante este formulario PEM: configura el acceso al motor y comprueba cómo se registra la clave existente. Revisa dependencias y recursos que puedan haberse creado en el proveedor si una operación falla a mitad."}),`
`,e.jsx(a.h2,{id:"operaciones-sobre-una-clave",children:"Operaciones sobre una clave"}),`
`,e.jsx(a.p,{children:"Cada clave registrada dispone de una vista de detalle y de varias acciones operativas."}),`
`,e.jsx(a.h3,{id:"ver-detalles",children:"Ver detalles"}),`
`,e.jsxs(a.p,{children:["La pantalla ",e.jsx(a.strong,{children:"View Details"})," concentra la información técnica y administrativa de la clave."]}),`
`,e.jsxs(a.p,{children:["En la pestaña ",e.jsx(a.strong,{children:"Overview"})," se muestran, entre otros, estos campos:"]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Key Name"}),": nombre descriptivo."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Key Identifier"}),": identificador único del sistema. Lamassu utiliza formatos de ID basados en PKCS11."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Tags"}),": etiquetas asociadas."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Aliases"}),": nombres alternativos."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Crypto Engine"}),": motor en el que reside la clave."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Algorithm, Key Size & Strength"}),": algoritmo, parámetros y nivel de fortaleza."]}),`
`]}),`
`,e.jsxs(a.p,{children:["La sección ",e.jsx(a.strong,{children:"Related Entities"})," muestra qué objetos de Lamassu dependen de esa clave."]}),`
`,e.jsxs(a.p,{children:["La pestaña ",e.jsx(a.strong,{children:"Public Key"})," muestra el material público en PEM. El identificador y la URI del registro sirven para localizar la clave; una URI con formato PKCS#11 no demuestra que el motor sea un HSM ni que exista un módulo local para acceder a ella."]}),`
`,e.jsx(a.h3,{id:"firmar-y-verificar",children:"Firmar y verificar"}),`
`,e.jsxs(a.p,{children:["La acción ",e.jsx(a.strong,{children:"Sign / Verify"})," sirve para validar que la clave y el motor criptográfico funcionan correctamente."]}),`
`,e.jsx(a.p,{children:"Firma un mensaje de prueba, guarda la firma y verifícala con la misma clave pública, algoritmo y codificación. Cambia después el mensaje: la verificación debe fallar. Esto comprueba una operación concreta; no certifica todas las capacidades del motor ni la cadena de una CA."}),`
`,e.jsxs(a.p,{children:["Al abrirla aparecen dos áreas: ",e.jsx(a.strong,{children:"Sign"})," y ",e.jsx(a.strong,{children:"Verify"}),"."]}),`
`,e.jsx(a.h4,{id:"sign",children:"Sign"}),`
`,e.jsxs(a.p,{children:["Esta pestaña usa la clave privada para generar una firma digital sobre un mensaje o sobre un ",e.jsx(a.em,{children:"digest"})," ya calculado."]}),`
`,e.jsx(a.p,{children:"Campos principales:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Algorithm"}),": algoritmo de firma disponible para el tipo de clave."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Message Type"}),": ",e.jsx(a.code,{children:"Raw"})," para datos en claro o ",e.jsx(a.code,{children:"Digest"})," para un hash precalculado."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Payload Encoding"}),": codificación de entrada, como UTF-8, Hex o Base64."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Message"}),": contenido que se va a firmar."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Signature"}),": resultado de la operación, mostrado en hexadecimal."]}),`
`]}),`
`,e.jsx(a.h4,{id:"verify",children:"Verify"}),`
`,e.jsx(a.p,{children:"Esta pestaña comprueba si una firma corresponde a la clave pública asociada."}),`
`,e.jsx(a.p,{children:"Campos principales:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Algorithm"}),": debe coincidir con el algoritmo usado para la firma."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Message Type"}),": ",e.jsx(a.code,{children:"Raw"})," o ",e.jsx(a.code,{children:"Digest"}),"."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Payload Encoding"}),": codificación del mensaje."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Message"}),": mensaje original o hash."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Signature"}),": firma que se desea comprobar."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Result"}),": indicador del resultado de la validación."]}),`
`]}),`
`,e.jsx(a.h3,{id:"generar-un-csr",children:"Generar un CSR"}),`
`,e.jsxs(a.p,{children:["La acción ",e.jsx(a.strong,{children:"Generate CSR"})," crea una solicitud PKCS#10 firmada con la clave privada custodiada en Lamassu, sin exponerla fuera del motor criptográfico."]}),`
`,e.jsx(a.p,{children:"Este flujo es útil para:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Solicitar certificados a una CA externa."}),`
`,e.jsx(a.li,{children:"Renovar una identidad manteniendo la misma clave."}),`
`]}),`
`,e.jsx(a.p,{children:"Al abrir el formulario se solicitan los datos del sujeto y los atributos principales del certificado:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Common Name (CN)"}),": nombre principal de la identidad."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Organization (O)"}),": organización o empresa."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Organizational Unit (OU)"}),": departamento o unidad."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Country (C)"}),": código de país de dos letras."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"State / Province (ST)"}),": estado o provincia."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Locality (L)"}),": ciudad o localidad."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Email Address"}),": correo de contacto."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Subject Alternative Names (SANs)"}),": nombres o identificadores alternativos, como DNS o IP."]}),`
`]}),`
`,e.jsxs(a.p,{children:["Descarga la CSR y ejecuta ",e.jsx(a.code,{children:"openssl req -in request.csr -noout -verify -text"}),". Comprueba firma, sujeto y SAN antes de enviarla. La CSR no determina por sí sola el certificado final: la ",e.jsx(a.a,{href:"/docs/platform/pki/certificate-profiles",children:"política de emisión"})," puede sustituir sus campos."]}),`
`,e.jsx(a.h3,{id:"firma-local-con-pkcs11",children:"Firma local con PKCS#11"}),`
`,e.jsxs(a.p,{children:["Lamassu también ofrece una ayuda específica para integraciones locales mediante ",e.jsx(a.strong,{children:"Sign locally with OpenSSL & PKCS11 tools"}),"."]}),`
`,e.jsxs(a.p,{children:["Requiere el módulo, token y permisos del proveedor correspondiente. Comprueba que el identificador de Lamassu se corresponde con el objeto accesible desde ese módulo. La configuración del módulo pertenece al entorno del cliente o al ",e.jsx(a.a,{href:"/docs/deployment/self-hosted/helm",children:"Despliegue"}),"."]}),`
`,e.jsx(a.h2,{id:"antes-de-eliminar-una-clave",children:"Antes de eliminar una clave"}),`
`,e.jsxs(a.p,{children:["Revisa ",e.jsx(a.strong,{children:"Related Entities"})," y localiza CAs, certificados y procesos de validación que siguen necesitando firmas. Revocar una CA no elimina la necesidad de publicar estado durante su periodo de retención. Eliminar una clave tampoco revoca automáticamente sus certificados. Planifica sustitución y retención antes de usar ",e.jsx(a.strong,{children:"Delete Key"}),"; el efecto de borrado en el proveedor depende del motor."]})]})}function c(n={}){const{wrapper:a}=n.components||{};return a?e.jsx(a,{...n,children:e.jsx(i,{...n})}):i(n)}const d=Object.freeze(Object.defineProperty({__proto__:null,_markdown:r,default:c,frontmatter:s,structuredData:o,toc:t},Symbol.toStringTag,{value:"Module"}));export{d as _};
