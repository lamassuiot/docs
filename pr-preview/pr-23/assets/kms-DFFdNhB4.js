import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let s=`

Gestión de claves criptográficas [#gestión-de-claves-criptográficas]

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

Actualmente, Lamassu soporta los siguientes motores:

| Crypto Engine       | Nivel de seguridad | OnPrem / Cloud        | Coste adicional                                                                                             | Generación de claves                                                                    | Persistencia *at-rest* segura                     | Filtración de claves                                                                       | Consideraciones                                                                                               |
| :------------------ | :----------------: | :-------------------- | :---------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- | :------------------------------------------------ | :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| File System         |          1         | OnPrem y Cloud        | No                                                                                                          | **Entropía software**. La generación se realiza con las librerías criptográficas de Go. | **Insegura**. Delegada en el sistema de archivos. | **Insegura**. Delegada en el sistema de archivos.                                          | No recomendado para producción.                                                                               |
| HashiCorp Vault     |          2         | OnPrem y Cloud        | No                                                                                                          | Depende de la configuración de Vault.                                                   | **Segura**                                        | **Insegura**. Un administrador con permisos suficientes puede visualizar la clave privada. | Conviene limitar al máximo el acceso administrativo y custodiar correctamente las claves de *unseal*.         |
| AWS Secrets Manager |          2         | Cloud                 | Sí                                                                                                          | Depende del proceso de alta de la clave.                                                | **Segura**                                        | **Insegura**. Un administrador con permisos suficientes puede visualizar la clave privada. | La protección *at-rest* la proporciona AWS, pero no evita el acceso administrativo al material privado.       |
| AWS KMS             |          3         | Cloud                 | Sí                                                                                                          | **Entropía hardware**                                                                   | **Segura**                                        | **Segura**                                                                                 | Aunque la clave privada no se expone, un actor con permisos suficientes podría usarla para firmar artefactos. |
| PKCS11              |         3\\*        | AirGap OnPrem y Cloud | Depende del hardware o del servicio usado. Puede integrarse con HSMs OnPrem o con ofertas Key as a Service. | **Entropía hardware**                                                                   | **Segura**\\*                                      | Depende del HSM                                                                            | El nivel real depende de la implementación PKCS11 y del HSM utilizado.                                        |

Lamassu muestra en la consola el listado completo de motores habilitados.

Cada motor define qué algoritmos soporta, como RSA o ECC/ECDSA, y qué tamaños de clave puede generar.

Durante el despliegue es obligatorio definir un motor por defecto. Ese motor se utilizará cuando un proceso necesite crear o persistir una clave y el usuario no haya seleccionado uno específico, por ejemplo al crear o importar una CA.

Claves compartidas entre varios motores [#claves-compartidas-entre-varios-motores]

Una misma clave puede existir en más de un motor criptográfico a la vez. El caso habitual es que la clave privada quede custodiada en un motor aislado (por ejemplo, un HSM air-gapped) mientras una copia de la clave pública se registra en un motor online, disponible para verificar firmas sin necesidad de acceder al HSM.

Cuando esto ocurre, el inventario de claves muestra una fila por cada motor que custodia una copia: comparten el mismo \`Key ID\`, pero difieren en **Crypto Engine** y en el campo **Public/Private**.

La identidad real de una clave es la combinación de su \`Key ID\` y el motor que la custodia, no el \`Key ID\` en solitario:

* El **PKCS#11 URI** (\`pkcs11:token-id=<engine_id>;id=<key_id>;type=public|private\`) y los **Aliases** identifican siempre una copia concreta, sin ambigüedad.
* Un \`Key ID\` por sí solo funciona como atajo de búsqueda, pero sólo mientras exista en un único motor. En cuanto la misma clave se replica en un segundo motor, ese atajo deja de resolver a una copia concreta: cualquier operación por API que dependa de él (reutilizar la clave al crear una CA o un certificado, firmar, actualizar tags o alias, eliminar la clave) debe indicar en su lugar el PKCS#11 URI o un alias.
* Un alias no puede coincidir con un \`Key ID\` ya existente en el sistema; Lamassu rechaza el alta o la actualización en ese caso.

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

El alta de claves se realiza desde el asistente que se abre con **Create New Key**.

Generar un nuevo par de claves [#generar-un-nuevo-par-de-claves]

Si la clave va a nacer dentro de Lamassu, el flujo recomendado es generar un nuevo par gestionado directamente por uno de los motores configurados.

En la primera pantalla del asistente, elija **Generate New Key Pair** y después defina los parámetros principales:

* **Key Name**: nombre único y descriptivo.
* **Crypto Engine**: motor que custodiará la clave.
* **Key Type** y **Key Size**: algoritmo y tamaño o curva.
* **Tags**: metadatos para clasificar la clave.
* **Metadata**: información adicional para usos avanzados.

Importar un par existente [#importar-un-par-existente]

La importación permite registrar en Lamassu una clave generada fuera de la plataforma. Es el flujo habitual en escenarios BYOK, migraciones o integración con material criptográfico que ya está en producción.

* Cuando la clave se ha generado en un entorno aislado o en un HSM externo.
* Cuando se necesita migrar una PKI existente sin reemitir certificados.
* Cuando Lamassu debe operar con una raíz de confianza creada por un tercero.

En el asistente, elija **Import Existing Key Pair** y complete los campos solicitados:

* **Key Name**: nombre descriptivo dentro de Lamassu IoT.
* **Crypto Engine**: motor que custodiará la clave importada.
* **Tags**: etiquetas para organización y búsqueda.
* **Metadata**: información adicional opcional.
* **Private Key (PEM)**: clave privada en formato PEM.

Una vez completado el asistente, la clave queda almacenada en el motor seleccionado y puede utilizarse para firma, generación de CSR y el resto de operaciones soportadas por KMS.

Operaciones sobre una clave [#operaciones-sobre-una-clave]

Cada clave registrada dispone de una vista de detalle y de varias acciones operativas.

Ver detalles [#ver-detalles]

La pantalla **View Details** concentra la información técnica y administrativa de la clave.

En la pestaña **Overview** se muestran, entre otros, estos campos:

* **Key Name**: nombre descriptivo.
* **Key Identifier**: identificador PKCS#11 de esta copia de la clave. Es único para esta copia; si la misma clave existe en varios motores, cada una tiene su propio Key Identifier (ver [Claves compartidas entre varios motores](#claves-compartidas-entre-varios-motores)).
* **Tags**: etiquetas asociadas.
* **Aliases**: nombres alternativos.
* **Crypto Engine**: motor en el que reside la clave.
* **Algorithm, Key Size & Strength**: algoritmo, parámetros y nivel de fortaleza.

La sección **Related Entities** muestra qué objetos de Lamassu dependen de esa clave.

La pestaña **Public Key** presenta la clave pública en formato PEM, lista para consulta o copia.

Firmar y verificar [#firmar-y-verificar]

La acción **Sign / Verify** sirve para validar que la clave y el motor criptográfico funcionan correctamente.

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

Una vez completado el formulario, Lamassu genera la CSR y la presenta para su descarga o copia.

Firma local con PKCS#11 [#firma-local-con-pkcs11]

Lamassu también ofrece una ayuda específica para integraciones locales mediante **Sign locally with OpenSSL & PKCS11 tools**.

Esta opción muestra los pasos necesarios para configurar el entorno local, cargar el módulo PKCS#11 y ejecutar firmas con herramientas como OpenSSL sin extraer la clave privada del entorno custodiado.
`,o={title:"[KMS] Gestión de Claves Criptográficas",description:"Gestión y operación de claves criptográficas en Lamassu IoT"},t={contents:[{heading:"gestión-de-claves-criptográficas",content:"El servicio de Gestión de Claves Criptográficas (KMS) de Lamassu IoT centraliza la generación, importación, custodia y uso de las claves de la plataforma. Desde aquí se gestionan las claves que soportan a las CAs y al resto de operaciones de firma que dependen de la PKI."},{heading:"gestión-de-claves-criptográficas",content:"En la configuración actual, Lamassu IoT trabaja exclusivamente con claves asimétricas, como RSA y curvas elípticas. Estas claves se usan para emitir certificados X.509, firmar solicitudes y realizar operaciones de autenticación y validación dentro del sistema."},{heading:"qué-resuelve-el-kms",content:"El KMS unifica la gestión del ciclo de vida de las claves y evita que cada servicio tenga que integrarse directamente con un proveedor criptográfico concreto."},{heading:"qué-resuelve-el-kms",content:"En la práctica, permite:"},{heading:"qué-resuelve-el-kms",content:"Generar nuevos pares de claves desde Lamassu IoT."},{heading:"qué-resuelve-el-kms",content:"Importar claves creadas externamente."},{heading:"qué-resuelve-el-kms",content:"Delegar la custodia y las operaciones criptográficas en motores externos."},{heading:"qué-resuelve-el-kms",content:"Reutilizar claves ya existentes para CAs, CSR y tareas de firma o verificación."},{heading:"motores-criptográficos",content:"Lamassu puede trabajar con distintos motores criptográficos según los requisitos del despliegue. En algunos entornos bastará con un motor software; en otros será necesario delegar la custodia en un HSM, en un servicio cloud o en una plataforma especializada."},{heading:"motores-criptográficos",content:"Una misma instancia puede tener varios motores configurados al mismo tiempo, incluso varias instancias del mismo tipo. Esto permite adaptar la operación a distintos niveles de seguridad, coste y requisitos regulatorios."},{heading:"motores-criptográficos",content:"Actualmente, Lamassu soporta los siguientes motores:"},{heading:"motores-criptográficos",content:"Crypto Engine"},{heading:"motores-criptográficos",content:"Nivel de seguridad"},{heading:"motores-criptográficos",content:"OnPrem / Cloud"},{heading:"motores-criptográficos",content:"Coste adicional"},{heading:"motores-criptográficos",content:"Generación de claves"},{heading:"motores-criptográficos",content:"Persistencia *at-rest* segura"},{heading:"motores-criptográficos",content:"Filtración de claves"},{heading:"motores-criptográficos",content:"Consideraciones"},{heading:"motores-criptográficos",content:"File System"},{heading:"motores-criptográficos",content:"1"},{heading:"motores-criptográficos",content:"OnPrem y Cloud"},{heading:"motores-criptográficos",content:"No"},{heading:"motores-criptográficos",content:"**Entropía software**. La generación se realiza con las librerías criptográficas de Go."},{heading:"motores-criptográficos",content:"**Insegura**. Delegada en el sistema de archivos."},{heading:"motores-criptográficos",content:"**Insegura**. Delegada en el sistema de archivos."},{heading:"motores-criptográficos",content:"No recomendado para producción."},{heading:"motores-criptográficos",content:"HashiCorp Vault"},{heading:"motores-criptográficos",content:"2"},{heading:"motores-criptográficos",content:"OnPrem y Cloud"},{heading:"motores-criptográficos",content:"No"},{heading:"motores-criptográficos",content:"Depende de la configuración de Vault."},{heading:"motores-criptográficos",content:"**Segura**"},{heading:"motores-criptográficos",content:"**Insegura**. Un administrador con permisos suficientes puede visualizar la clave privada."},{heading:"motores-criptográficos",content:"Conviene limitar al máximo el acceso administrativo y custodiar correctamente las claves de *unseal*."},{heading:"motores-criptográficos",content:"AWS Secrets Manager"},{heading:"motores-criptográficos",content:"2"},{heading:"motores-criptográficos",content:"Cloud"},{heading:"motores-criptográficos",content:"Sí"},{heading:"motores-criptográficos",content:"Depende del proceso de alta de la clave."},{heading:"motores-criptográficos",content:"**Segura**"},{heading:"motores-criptográficos",content:"**Insegura**. Un administrador con permisos suficientes puede visualizar la clave privada."},{heading:"motores-criptográficos",content:"La protección *at-rest* la proporciona AWS, pero no evita el acceso administrativo al material privado."},{heading:"motores-criptográficos",content:"AWS KMS"},{heading:"motores-criptográficos",content:"3"},{heading:"motores-criptográficos",content:"Cloud"},{heading:"motores-criptográficos",content:"Sí"},{heading:"motores-criptográficos",content:"**Entropía hardware**"},{heading:"motores-criptográficos",content:"**Segura**"},{heading:"motores-criptográficos",content:"**Segura**"},{heading:"motores-criptográficos",content:"Aunque la clave privada no se expone, un actor con permisos suficientes podría usarla para firmar artefactos."},{heading:"motores-criptográficos",content:"PKCS11"},{heading:"motores-criptográficos",content:"3\\*"},{heading:"motores-criptográficos",content:"AirGap OnPrem y Cloud"},{heading:"motores-criptográficos",content:"Depende del hardware o del servicio usado. Puede integrarse con HSMs OnPrem o con ofertas Key as a Service."},{heading:"motores-criptográficos",content:"**Entropía hardware**"},{heading:"motores-criptográficos",content:"**Segura**\\*"},{heading:"motores-criptográficos",content:"Depende del HSM"},{heading:"motores-criptográficos",content:"El nivel real depende de la implementación PKCS11 y del HSM utilizado."},{heading:"motores-criptográficos",content:"Lamassu muestra en la consola el listado completo de motores habilitados."},{heading:"motores-criptográficos",content:"Cada motor define qué algoritmos soporta, como RSA o ECC/ECDSA, y qué tamaños de clave puede generar."},{heading:"motores-criptográficos",content:"Durante el despliegue es obligatorio definir un motor por defecto. Ese motor se utilizará cuando un proceso necesite crear o persistir una clave y el usuario no haya seleccionado uno específico, por ejemplo al crear o importar una CA."},{heading:"claves-compartidas-entre-varios-motores",content:"Una misma clave puede existir en más de un motor criptográfico a la vez. El caso habitual es que la clave privada quede custodiada en un motor aislado (por ejemplo, un HSM air-gapped) mientras una copia de la clave pública se registra en un motor online, disponible para verificar firmas sin necesidad de acceder al HSM."},{heading:"claves-compartidas-entre-varios-motores",content:"Cuando esto ocurre, el inventario de claves muestra una fila por cada motor que custodia una copia: comparten el mismo `Key ID`, pero difieren en **Crypto Engine** y en el campo **Public/Private**."},{heading:"claves-compartidas-entre-varios-motores",content:"La identidad real de una clave es la combinación de su `Key ID` y el motor que la custodia, no el `Key ID` en solitario:"},{heading:"claves-compartidas-entre-varios-motores",content:"El **PKCS#11 URI** (`pkcs11:token-id=<engine_id>;id=<key_id>;type=public|private`) y los **Aliases** identifican siempre una copia concreta, sin ambigüedad."},{heading:"claves-compartidas-entre-varios-motores",content:"Un `Key ID` por sí solo funciona como atajo de búsqueda, pero sólo mientras exista en un único motor. En cuanto la misma clave se replica en un segundo motor, ese atajo deja de resolver a una copia concreta: cualquier operación por API que dependa de él (reutilizar la clave al crear una CA o un certificado, firmar, actualizar tags o alias, eliminar la clave) debe indicar en su lugar el PKCS#11 URI o un alias."},{heading:"claves-compartidas-entre-varios-motores",content:"Un alias no puede coincidir con un `Key ID` ya existente en el sistema; Lamassu rechaza el alta o la actualización en ese caso."},{heading:"inventario-de-claves",content:"La pantalla principal de KMS muestra el inventario completo de claves registradas en el sistema. Es la vista de referencia para revisar qué claves existen, dónde están custodiadas y con qué entidades están relacionadas."},{heading:"inventario-de-claves",content:"La tabla incluye los siguientes campos:"},{heading:"inventario-de-claves",content:"**Name**: nombre descriptivo de la clave."},{heading:"inventario-de-claves",content:"**Type**: algoritmo y tamaño de clave, por ejemplo RSA 2048 o EC P-256."},{heading:"inventario-de-claves",content:"**Strength**: indicador visual de fortaleza criptográfica."},{heading:"inventario-de-claves",content:"**Public/Private**: indica si Lamassu gestiona el par completo o solo la clave pública."},{heading:"inventario-de-claves",content:"**Crypto Engine**: motor criptográfico que custodia la clave."},{heading:"inventario-de-claves",content:"**Aliases**: nombres alternativos asociados a la clave."},{heading:"inventario-de-claves",content:"**Tags**: etiquetas para clasificación y búsqueda."},{heading:"inventario-de-claves",content:"**Related Entities**: certificados u otras entidades vinculadas a esa clave."},{heading:"inventario-de-claves",content:"Desde esta vista también se accede a las acciones más habituales:"},{heading:"inventario-de-claves",content:"**View Details** para consultar metadatos, identificadores y relaciones."},{heading:"inventario-de-claves",content:"**Generate CSR** para crear una solicitud PKCS#10 con la clave seleccionada."},{heading:"inventario-de-claves",content:"**Sign / Verify** para probar operaciones criptográficas sobre la clave."},{heading:"inventario-de-claves",content:"**Delete Key** para eliminar la clave del sistema."},{heading:"crear-o-importar-claves",content:"El alta de claves se realiza desde el asistente que se abre con **Create New Key**."},{heading:"generar-un-nuevo-par-de-claves",content:"Si la clave va a nacer dentro de Lamassu, el flujo recomendado es generar un nuevo par gestionado directamente por uno de los motores configurados."},{heading:"generar-un-nuevo-par-de-claves",content:"En la primera pantalla del asistente, elija **Generate New Key Pair** y después defina los parámetros principales:"},{heading:"generar-un-nuevo-par-de-claves",content:"**Key Name**: nombre único y descriptivo."},{heading:"generar-un-nuevo-par-de-claves",content:"**Crypto Engine**: motor que custodiará la clave."},{heading:"generar-un-nuevo-par-de-claves",content:"**Key Type** y **Key Size**: algoritmo y tamaño o curva."},{heading:"generar-un-nuevo-par-de-claves",content:"**Tags**: metadatos para clasificar la clave."},{heading:"generar-un-nuevo-par-de-claves",content:"**Metadata**: información adicional para usos avanzados."},{heading:"importar-un-par-existente",content:"La importación permite registrar en Lamassu una clave generada fuera de la plataforma. Es el flujo habitual en escenarios BYOK, migraciones o integración con material criptográfico que ya está en producción."},{heading:"importar-un-par-existente",content:"Cuando la clave se ha generado en un entorno aislado o en un HSM externo."},{heading:"importar-un-par-existente",content:"Cuando se necesita migrar una PKI existente sin reemitir certificados."},{heading:"importar-un-par-existente",content:"Cuando Lamassu debe operar con una raíz de confianza creada por un tercero."},{heading:"importar-un-par-existente",content:"En el asistente, elija **Import Existing Key Pair** y complete los campos solicitados:"},{heading:"importar-un-par-existente",content:"**Key Name**: nombre descriptivo dentro de Lamassu IoT."},{heading:"importar-un-par-existente",content:"**Crypto Engine**: motor que custodiará la clave importada."},{heading:"importar-un-par-existente",content:"**Tags**: etiquetas para organización y búsqueda."},{heading:"importar-un-par-existente",content:"**Metadata**: información adicional opcional."},{heading:"importar-un-par-existente",content:"**Private Key (PEM)**: clave privada en formato PEM."},{heading:"importar-un-par-existente",content:"Una vez completado el asistente, la clave queda almacenada en el motor seleccionado y puede utilizarse para firma, generación de CSR y el resto de operaciones soportadas por KMS."},{heading:"operaciones-sobre-una-clave",content:"Cada clave registrada dispone de una vista de detalle y de varias acciones operativas."},{heading:"ver-detalles",content:"La pantalla **View Details** concentra la información técnica y administrativa de la clave."},{heading:"ver-detalles",content:"En la pestaña **Overview** se muestran, entre otros, estos campos:"},{heading:"ver-detalles",content:"**Key Name**: nombre descriptivo."},{heading:"ver-detalles",content:"**Key Identifier**: identificador PKCS#11 de esta copia de la clave. Es único para esta copia; si la misma clave existe en varios motores, cada una tiene su propio Key Identifier (ver Claves compartidas entre varios motores)."},{heading:"ver-detalles",content:"**Tags**: etiquetas asociadas."},{heading:"ver-detalles",content:"**Aliases**: nombres alternativos."},{heading:"ver-detalles",content:"**Crypto Engine**: motor en el que reside la clave."},{heading:"ver-detalles",content:"**Algorithm, Key Size & Strength**: algoritmo, parámetros y nivel de fortaleza."},{heading:"ver-detalles",content:"La sección **Related Entities** muestra qué objetos de Lamassu dependen de esa clave."},{heading:"ver-detalles",content:"La pestaña **Public Key** presenta la clave pública en formato PEM, lista para consulta o copia."},{heading:"firmar-y-verificar",content:"La acción **Sign / Verify** sirve para validar que la clave y el motor criptográfico funcionan correctamente."},{heading:"firmar-y-verificar",content:"Al abrirla aparecen dos áreas: **Sign** y **Verify**."},{heading:"sign",content:"Esta pestaña usa la clave privada para generar una firma digital sobre un mensaje o sobre un *digest* ya calculado."},{heading:"sign",content:"Campos principales:"},{heading:"sign",content:"**Algorithm**: algoritmo de firma disponible para el tipo de clave."},{heading:"sign",content:"**Message Type**: `Raw` para datos en claro o `Digest` para un hash precalculado."},{heading:"sign",content:"**Payload Encoding**: codificación de entrada, como UTF-8, Hex o Base64."},{heading:"sign",content:"**Message**: contenido que se va a firmar."},{heading:"sign",content:"**Signature**: resultado de la operación, mostrado en hexadecimal."},{heading:"verify",content:"Esta pestaña comprueba si una firma corresponde a la clave pública asociada."},{heading:"verify",content:"Campos principales:"},{heading:"verify",content:"**Algorithm**: debe coincidir con el algoritmo usado para la firma."},{heading:"verify",content:"**Message Type**: `Raw` o `Digest`."},{heading:"verify",content:"**Payload Encoding**: codificación del mensaje."},{heading:"verify",content:"**Message**: mensaje original o hash."},{heading:"verify",content:"**Signature**: firma que se desea comprobar."},{heading:"verify",content:"**Result**: indicador del resultado de la validación."},{heading:"generar-un-csr",content:"La acción **Generate CSR** crea una solicitud PKCS#10 firmada con la clave privada custodiada en Lamassu, sin exponerla fuera del motor criptográfico."},{heading:"generar-un-csr",content:"Este flujo es útil para:"},{heading:"generar-un-csr",content:"Solicitar certificados a una CA externa."},{heading:"generar-un-csr",content:"Renovar una identidad manteniendo la misma clave."},{heading:"generar-un-csr",content:"Al abrir el formulario se solicitan los datos del sujeto y los atributos principales del certificado:"},{heading:"generar-un-csr",content:"**Common Name (CN)**: nombre principal de la identidad."},{heading:"generar-un-csr",content:"**Organization (O)**: organización o empresa."},{heading:"generar-un-csr",content:"**Organizational Unit (OU)**: departamento o unidad."},{heading:"generar-un-csr",content:"**Country (C)**: código de país de dos letras."},{heading:"generar-un-csr",content:"**State / Province (ST)**: estado o provincia."},{heading:"generar-un-csr",content:"**Locality (L)**: ciudad o localidad."},{heading:"generar-un-csr",content:"**Email Address**: correo de contacto."},{heading:"generar-un-csr",content:"**Subject Alternative Names (SANs)**: nombres o identificadores alternativos, como DNS o IP."},{heading:"generar-un-csr",content:"Una vez completado el formulario, Lamassu genera la CSR y la presenta para su descarga o copia."},{heading:"firma-local-con-pkcs11",content:"Lamassu también ofrece una ayuda específica para integraciones locales mediante **Sign locally with OpenSSL & PKCS11 tools**."},{heading:"firma-local-con-pkcs11",content:"Esta opción muestra los pasos necesarios para configurar el entorno local, cargar el módulo PKCS#11 y ejecutar firmas con herramientas como OpenSSL sin extraer la clave privada del entorno custodiado."}],headings:[{id:"gestión-de-claves-criptográficas",content:"Gestión de claves criptográficas"},{id:"qué-resuelve-el-kms",content:"Qué resuelve el KMS"},{id:"motores-criptográficos",content:"Motores criptográficos"},{id:"claves-compartidas-entre-varios-motores",content:"Claves compartidas entre varios motores"},{id:"inventario-de-claves",content:"Inventario de claves"},{id:"crear-o-importar-claves",content:"Crear o importar claves"},{id:"generar-un-nuevo-par-de-claves",content:"Generar un nuevo par de claves"},{id:"importar-un-par-existente",content:"Importar un par existente"},{id:"operaciones-sobre-una-clave",content:"Operaciones sobre una clave"},{id:"ver-detalles",content:"Ver detalles"},{id:"firmar-y-verificar",content:"Firmar y verificar"},{id:"sign",content:"Sign"},{id:"verify",content:"Verify"},{id:"generar-un-csr",content:"Generar un CSR"},{id:"firma-local-con-pkcs11",content:"Firma local con PKCS#11"}]};const c=[{depth:1,url:"#gestión-de-claves-criptográficas",title:e.jsx(e.Fragment,{children:"Gestión de claves criptográficas"})},{depth:2,url:"#qué-resuelve-el-kms",title:e.jsx(e.Fragment,{children:"Qué resuelve el KMS"})},{depth:2,url:"#motores-criptográficos",title:e.jsx(e.Fragment,{children:"Motores criptográficos"})},{depth:2,url:"#claves-compartidas-entre-varios-motores",title:e.jsx(e.Fragment,{children:"Claves compartidas entre varios motores"})},{depth:2,url:"#inventario-de-claves",title:e.jsx(e.Fragment,{children:"Inventario de claves"})},{depth:2,url:"#crear-o-importar-claves",title:e.jsx(e.Fragment,{children:"Crear o importar claves"})},{depth:3,url:"#generar-un-nuevo-par-de-claves",title:e.jsx(e.Fragment,{children:"Generar un nuevo par de claves"})},{depth:3,url:"#importar-un-par-existente",title:e.jsx(e.Fragment,{children:"Importar un par existente"})},{depth:2,url:"#operaciones-sobre-una-clave",title:e.jsx(e.Fragment,{children:"Operaciones sobre una clave"})},{depth:3,url:"#ver-detalles",title:e.jsx(e.Fragment,{children:"Ver detalles"})},{depth:3,url:"#firmar-y-verificar",title:e.jsx(e.Fragment,{children:"Firmar y verificar"})},{depth:4,url:"#sign",title:e.jsx(e.Fragment,{children:"Sign"})},{depth:4,url:"#verify",title:e.jsx(e.Fragment,{children:"Verify"})},{depth:3,url:"#generar-un-csr",title:e.jsx(e.Fragment,{children:"Generar un CSR"})},{depth:3,url:"#firma-local-con-pkcs11",title:e.jsx(e.Fragment,{children:"Firma local con PKCS#11"})}];function i(n){const a={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(a.h1,{id:"gestión-de-claves-criptográficas",children:"Gestión de claves criptográficas"}),`
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
`,e.jsx(a.p,{children:"Actualmente, Lamassu soporta los siguientes motores:"}),`
`,e.jsxs(a.table,{children:[e.jsx(a.thead,{children:e.jsxs(a.tr,{children:[e.jsx(a.th,{style:{textAlign:"left"},children:"Crypto Engine"}),e.jsx(a.th,{style:{textAlign:"center"},children:"Nivel de seguridad"}),e.jsx(a.th,{style:{textAlign:"left"},children:"OnPrem / Cloud"}),e.jsx(a.th,{style:{textAlign:"left"},children:"Coste adicional"}),e.jsx(a.th,{style:{textAlign:"left"},children:"Generación de claves"}),e.jsxs(a.th,{style:{textAlign:"left"},children:["Persistencia ",e.jsx(a.em,{children:"at-rest"})," segura"]}),e.jsx(a.th,{style:{textAlign:"left"},children:"Filtración de claves"}),e.jsx(a.th,{style:{textAlign:"left"},children:"Consideraciones"})]})}),e.jsxs(a.tbody,{children:[e.jsxs(a.tr,{children:[e.jsx(a.td,{style:{textAlign:"left"},children:"File System"}),e.jsx(a.td,{style:{textAlign:"center"},children:"1"}),e.jsx(a.td,{style:{textAlign:"left"},children:"OnPrem y Cloud"}),e.jsx(a.td,{style:{textAlign:"left"},children:"No"}),e.jsxs(a.td,{style:{textAlign:"left"},children:[e.jsx(a.strong,{children:"Entropía software"}),". La generación se realiza con las librerías criptográficas de Go."]}),e.jsxs(a.td,{style:{textAlign:"left"},children:[e.jsx(a.strong,{children:"Insegura"}),". Delegada en el sistema de archivos."]}),e.jsxs(a.td,{style:{textAlign:"left"},children:[e.jsx(a.strong,{children:"Insegura"}),". Delegada en el sistema de archivos."]}),e.jsx(a.td,{style:{textAlign:"left"},children:"No recomendado para producción."})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{style:{textAlign:"left"},children:"HashiCorp Vault"}),e.jsx(a.td,{style:{textAlign:"center"},children:"2"}),e.jsx(a.td,{style:{textAlign:"left"},children:"OnPrem y Cloud"}),e.jsx(a.td,{style:{textAlign:"left"},children:"No"}),e.jsx(a.td,{style:{textAlign:"left"},children:"Depende de la configuración de Vault."}),e.jsx(a.td,{style:{textAlign:"left"},children:e.jsx(a.strong,{children:"Segura"})}),e.jsxs(a.td,{style:{textAlign:"left"},children:[e.jsx(a.strong,{children:"Insegura"}),". Un administrador con permisos suficientes puede visualizar la clave privada."]}),e.jsxs(a.td,{style:{textAlign:"left"},children:["Conviene limitar al máximo el acceso administrativo y custodiar correctamente las claves de ",e.jsx(a.em,{children:"unseal"}),"."]})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{style:{textAlign:"left"},children:"AWS Secrets Manager"}),e.jsx(a.td,{style:{textAlign:"center"},children:"2"}),e.jsx(a.td,{style:{textAlign:"left"},children:"Cloud"}),e.jsx(a.td,{style:{textAlign:"left"},children:"Sí"}),e.jsx(a.td,{style:{textAlign:"left"},children:"Depende del proceso de alta de la clave."}),e.jsx(a.td,{style:{textAlign:"left"},children:e.jsx(a.strong,{children:"Segura"})}),e.jsxs(a.td,{style:{textAlign:"left"},children:[e.jsx(a.strong,{children:"Insegura"}),". Un administrador con permisos suficientes puede visualizar la clave privada."]}),e.jsxs(a.td,{style:{textAlign:"left"},children:["La protección ",e.jsx(a.em,{children:"at-rest"})," la proporciona AWS, pero no evita el acceso administrativo al material privado."]})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{style:{textAlign:"left"},children:"AWS KMS"}),e.jsx(a.td,{style:{textAlign:"center"},children:"3"}),e.jsx(a.td,{style:{textAlign:"left"},children:"Cloud"}),e.jsx(a.td,{style:{textAlign:"left"},children:"Sí"}),e.jsx(a.td,{style:{textAlign:"left"},children:e.jsx(a.strong,{children:"Entropía hardware"})}),e.jsx(a.td,{style:{textAlign:"left"},children:e.jsx(a.strong,{children:"Segura"})}),e.jsx(a.td,{style:{textAlign:"left"},children:e.jsx(a.strong,{children:"Segura"})}),e.jsx(a.td,{style:{textAlign:"left"},children:"Aunque la clave privada no se expone, un actor con permisos suficientes podría usarla para firmar artefactos."})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{style:{textAlign:"left"},children:"PKCS11"}),e.jsx(a.td,{style:{textAlign:"center"},children:"3*"}),e.jsx(a.td,{style:{textAlign:"left"},children:"AirGap OnPrem y Cloud"}),e.jsx(a.td,{style:{textAlign:"left"},children:"Depende del hardware o del servicio usado. Puede integrarse con HSMs OnPrem o con ofertas Key as a Service."}),e.jsx(a.td,{style:{textAlign:"left"},children:e.jsx(a.strong,{children:"Entropía hardware"})}),e.jsxs(a.td,{style:{textAlign:"left"},children:[e.jsx(a.strong,{children:"Segura"}),"*"]}),e.jsx(a.td,{style:{textAlign:"left"},children:"Depende del HSM"}),e.jsx(a.td,{style:{textAlign:"left"},children:"El nivel real depende de la implementación PKCS11 y del HSM utilizado."})]})]})]}),`
`,e.jsx(a.p,{children:"Lamassu muestra en la consola el listado completo de motores habilitados."}),`
`,e.jsx(a.p,{children:"Cada motor define qué algoritmos soporta, como RSA o ECC/ECDSA, y qué tamaños de clave puede generar."}),`
`,e.jsx(a.p,{children:"Durante el despliegue es obligatorio definir un motor por defecto. Ese motor se utilizará cuando un proceso necesite crear o persistir una clave y el usuario no haya seleccionado uno específico, por ejemplo al crear o importar una CA."}),`
`,e.jsx(a.h2,{id:"claves-compartidas-entre-varios-motores",children:"Claves compartidas entre varios motores"}),`
`,e.jsx(a.p,{children:"Una misma clave puede existir en más de un motor criptográfico a la vez. El caso habitual es que la clave privada quede custodiada en un motor aislado (por ejemplo, un HSM air-gapped) mientras una copia de la clave pública se registra en un motor online, disponible para verificar firmas sin necesidad de acceder al HSM."}),`
`,e.jsxs(a.p,{children:["Cuando esto ocurre, el inventario de claves muestra una fila por cada motor que custodia una copia: comparten el mismo ",e.jsx(a.code,{children:"Key ID"}),", pero difieren en ",e.jsx(a.strong,{children:"Crypto Engine"})," y en el campo ",e.jsx(a.strong,{children:"Public/Private"}),"."]}),`
`,e.jsxs(a.p,{children:["La identidad real de una clave es la combinación de su ",e.jsx(a.code,{children:"Key ID"})," y el motor que la custodia, no el ",e.jsx(a.code,{children:"Key ID"})," en solitario:"]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:["El ",e.jsx(a.strong,{children:"PKCS#11 URI"})," (",e.jsx(a.code,{children:"pkcs11:token-id=<engine_id>;id=<key_id>;type=public|private"}),") y los ",e.jsx(a.strong,{children:"Aliases"})," identifican siempre una copia concreta, sin ambigüedad."]}),`
`,e.jsxs(a.li,{children:["Un ",e.jsx(a.code,{children:"Key ID"})," por sí solo funciona como atajo de búsqueda, pero sólo mientras exista en un único motor. En cuanto la misma clave se replica en un segundo motor, ese atajo deja de resolver a una copia concreta: cualquier operación por API que dependa de él (reutilizar la clave al crear una CA o un certificado, firmar, actualizar tags o alias, eliminar la clave) debe indicar en su lugar el PKCS#11 URI o un alias."]}),`
`,e.jsxs(a.li,{children:["Un alias no puede coincidir con un ",e.jsx(a.code,{children:"Key ID"})," ya existente en el sistema; Lamassu rechaza el alta o la actualización en ese caso."]}),`
`]}),`
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
`,e.jsxs(a.p,{children:["El alta de claves se realiza desde el asistente que se abre con ",e.jsx(a.strong,{children:"Create New Key"}),"."]}),`
`,e.jsx(a.h3,{id:"generar-un-nuevo-par-de-claves",children:"Generar un nuevo par de claves"}),`
`,e.jsx(a.p,{children:"Si la clave va a nacer dentro de Lamassu, el flujo recomendado es generar un nuevo par gestionado directamente por uno de los motores configurados."}),`
`,e.jsxs(a.p,{children:["En la primera pantalla del asistente, elija ",e.jsx(a.strong,{children:"Generate New Key Pair"})," y después defina los parámetros principales:"]}),`
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
`,e.jsx(a.li,{children:"Cuando la clave se ha generado en un entorno aislado o en un HSM externo."}),`
`,e.jsx(a.li,{children:"Cuando se necesita migrar una PKI existente sin reemitir certificados."}),`
`,e.jsx(a.li,{children:"Cuando Lamassu debe operar con una raíz de confianza creada por un tercero."}),`
`]}),`
`,e.jsxs(a.p,{children:["En el asistente, elija ",e.jsx(a.strong,{children:"Import Existing Key Pair"})," y complete los campos solicitados:"]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Key Name"}),": nombre descriptivo dentro de Lamassu IoT."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Crypto Engine"}),": motor que custodiará la clave importada."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Tags"}),": etiquetas para organización y búsqueda."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Metadata"}),": información adicional opcional."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Private Key (PEM)"}),": clave privada en formato PEM."]}),`
`]}),`
`,e.jsx(a.p,{children:"Una vez completado el asistente, la clave queda almacenada en el motor seleccionado y puede utilizarse para firma, generación de CSR y el resto de operaciones soportadas por KMS."}),`
`,e.jsx(a.h2,{id:"operaciones-sobre-una-clave",children:"Operaciones sobre una clave"}),`
`,e.jsx(a.p,{children:"Cada clave registrada dispone de una vista de detalle y de varias acciones operativas."}),`
`,e.jsx(a.h3,{id:"ver-detalles",children:"Ver detalles"}),`
`,e.jsxs(a.p,{children:["La pantalla ",e.jsx(a.strong,{children:"View Details"})," concentra la información técnica y administrativa de la clave."]}),`
`,e.jsxs(a.p,{children:["En la pestaña ",e.jsx(a.strong,{children:"Overview"})," se muestran, entre otros, estos campos:"]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Key Name"}),": nombre descriptivo."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Key Identifier"}),": identificador PKCS#11 de esta copia de la clave. Es único para esta copia; si la misma clave existe en varios motores, cada una tiene su propio Key Identifier (ver ",e.jsx(a.a,{href:"#claves-compartidas-entre-varios-motores",children:"Claves compartidas entre varios motores"}),")."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Tags"}),": etiquetas asociadas."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Aliases"}),": nombres alternativos."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Crypto Engine"}),": motor en el que reside la clave."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Algorithm, Key Size & Strength"}),": algoritmo, parámetros y nivel de fortaleza."]}),`
`]}),`
`,e.jsxs(a.p,{children:["La sección ",e.jsx(a.strong,{children:"Related Entities"})," muestra qué objetos de Lamassu dependen de esa clave."]}),`
`,e.jsxs(a.p,{children:["La pestaña ",e.jsx(a.strong,{children:"Public Key"})," presenta la clave pública en formato PEM, lista para consulta o copia."]}),`
`,e.jsx(a.h3,{id:"firmar-y-verificar",children:"Firmar y verificar"}),`
`,e.jsxs(a.p,{children:["La acción ",e.jsx(a.strong,{children:"Sign / Verify"})," sirve para validar que la clave y el motor criptográfico funcionan correctamente."]}),`
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
`,e.jsx(a.p,{children:"Una vez completado el formulario, Lamassu genera la CSR y la presenta para su descarga o copia."}),`
`,e.jsx(a.h3,{id:"firma-local-con-pkcs11",children:"Firma local con PKCS#11"}),`
`,e.jsxs(a.p,{children:["Lamassu también ofrece una ayuda específica para integraciones locales mediante ",e.jsx(a.strong,{children:"Sign locally with OpenSSL & PKCS11 tools"}),"."]}),`
`,e.jsx(a.p,{children:"Esta opción muestra los pasos necesarios para configurar el entorno local, cargar el módulo PKCS#11 y ejecutar firmas con herramientas como OpenSSL sin extraer la clave privada del entorno custodiado."})]})}function l(n={}){const{wrapper:a}=n.components||{};return a?e.jsx(a,{...n,children:e.jsx(i,{...n})}):i(n)}export{s as _markdown,l as default,o as frontmatter,t as structuredData,c as toc};
