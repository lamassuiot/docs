import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let t=`

Gestión de claves criptográficas [#gestión-de-claves-criptográficas]

El servicio de Gestión de Claves Criptográficas (KMS) de Lamassu IoT centraliza la generación, importación, custodia y uso de las claves de la plataforma. Desde aquí se gestionan las claves que soportan a las CAs y al resto de operaciones de firma que dependen de la PKI.

<del className="lm-diff-del">En la configuración actual, </del>Lamassu IoT trabaja <del className="lm-diff-del">exclusivamente </del>con claves asimétricas<del className="lm-diff-del">, como RSA y curvas elípticas</del><ins className="lm-diff-ins">: además de los algoritmos clásicos (RSA, curvas elípticas y Ed25519), soporta algoritmos de criptografía post-cuántica (PQC), como ML-DSA, SLH-DSA y las claves compuestas </ins>*<ins className="lm-diff-ins">Composite ML-DSA</ins>*<ins className="lm-diff-ins">, pensadas para resistir los ataques de los ordenadores cuánticos</ins>. Estas claves se usan para emitir certificados X.509, firmar solicitudes y realizar operaciones de autenticación y validación dentro del sistema.

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

Cada motor define qué algoritmos soporta, como RSA o ECC/ECDSA, y qué tamaños de clave puede generar.<ins className="lm-diff-ins"> La matriz de algoritmos declarada por el motor también determina si en él se pueden crear claves post-cuánticas: si un motor no declara soporte para un tipo de clave, Lamassu rechazará su creación o importación con el error </ins>*<ins className="lm-diff-ins">unsupported key type</ins>*<ins className="lm-diff-ins">.</ins>

Durante el despliegue es obligatorio definir un motor por defecto. Ese motor se utilizará cuando un proceso necesite crear o persistir una clave y el usuario no haya seleccionado uno específico, por ejemplo al crear o importar una CA.

<div className="lm-diff-ins lm-diff-block">
  Tipos de clave y algoritmos soportados [#tipos-de-clave-y-algoritmos-soportados]
</div>

<div className="lm-diff-ins lm-diff-block">
  Lamassu admite claves clásicas y claves de criptografía post-cuántica. Los algoritmos post-cuánticos se alinean con las nuevas generaciones de estándares NIST (ML-DSA, FIPS 204, y SLH-DSA, FIPS 205). También se admiten certificados compuestos (*composite*), que combinan una firma clásica y una firma post-cuántica en el mismo certificado X.509 para facilitar la transición.
</div>

<div className="lm-diff-ins lm-diff-block">
  Algoritmos clásicos [#algoritmos-clásicos]
</div>

<div className="lm-diff-ins lm-diff-block">
  | Algoritmo | Parámetros                                                                      |
  | :-------- | :------------------------------------------------------------------------------ |
  | RSA       | 1024, 2048, 3072 y 4096 bits (los motores software admiten además 7680 y 15360) |
  | ECDSA     | Curvas P-224, P-256, P-384 y P-521, según el motor                              |
  | Ed25519   | 256 bits                                                                        |
</div>

<div className="lm-diff-ins lm-diff-block">
  Algoritmos post-cuánticos [#algoritmos-post-cuánticos]
</div>

<div className="lm-diff-ins lm-diff-block">
  | Familia                  | Parámetros                                                                                                   |
  | :----------------------- | :----------------------------------------------------------------------------------------------------------- |
  | ML-DSA                   | Niveles de seguridad 44, 65 y 87                                                                             |
  | SLH-DSA                  | Juegos de parámetros del 1 al 12 (por ejemplo, 1 = SHA2-128s y 5 = SHA2-256s)                                |
  | Composite-ML-DSA-RSA     | Variantes 1 a 8: combinación de ML-DSA con firmas RSA (por ejemplo, variante 1 = MLDSA44-RSA2048-PSS-SHA256) |
  | Composite-ML-DSA-ECDSA   | Variantes 9 a 13: combinación de ML-DSA con firmas ECDSA                                                     |
  | Composite-ML-DSA-Ed25519 | Variantes 14 y 15: combinación de ML-DSA con firmas Ed25519                                                  |
</div>

<div className="lm-diff-ins lm-diff-block">
  Disponibilidad por motor [#disponibilidad-por-motor]
</div>

<div className="lm-diff-ins lm-diff-block">
  La disponibilidad de estos tipos de clave depende del motor criptográfico que custodie la clave:
</div>

<div className="lm-diff-ins lm-diff-block">
  * El motor software (File System) soporta la matriz completa de algoritmos, incluidos todos los post-cuánticos.
  * Los motores externos solo exponen los algoritmos que declara su proveedor. Los algoritmos post-cuánticos aún no están disponibles en ellos, por lo que las solicitudes de creación o importación de claves de este tipo se rechazarán.
</div>

<div className="lm-diff-ins lm-diff-block">
  Importación de claves post-cuánticas [#importación-de-claves-post-cuánticas]
</div>

<div className="lm-diff-ins lm-diff-block">
  Además de generarse en Lamassu, las claves post-cuánticas pueden importarse como claves privadas en formato PKCS#8/PEM de los algoritmos soportados: ML-DSA (niveles 44, 65 y 87), SLH-DSA (esquemas \`SLH-DSA-*\`) y claves privadas compuestas (\`CompositePrivateKey\`). El motor de destino debe declarar soporte para el algoritmo de la clave importada.
</div>

Inventario de claves [#inventario-de-claves]

La pantalla principal de KMS muestra el inventario completo de claves registradas en el sistema. Es la vista de referencia para revisar qué claves existen, dónde están custodiadas y con qué entidades están relacionadas.

La tabla incluye los siguientes campos:

* **Name**: nombre descriptivo de la clave.
* **Type**: algoritmo y tamaño de clave, por ejemplo RSA 2048<del className="lm-diff-del"> o</del><ins className="lm-diff-ins">,</ins> EC P-256<ins className="lm-diff-ins"> o ML-DSA 65</ins>.
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
* **Key Type** y **Key Size**: algoritmo y tamaño o curva.<ins className="lm-diff-ins"> Consulte la sección </ins>[<ins className="lm-diff-ins">Tipos de clave y algoritmos soportados</ins>](#tipos-de-clave-y-algoritmos-soportados)<ins className="lm-diff-ins"> para ver las opciones disponibles y su disponibilidad por motor.</ins>
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
* **Key Identifier**: identificador único del sistema. Lamassu utiliza formatos de ID basados en PKCS11.
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

<div className="lm-diff-ins lm-diff-block">
  <Callout type="info" title="Firmas PURE para claves post-cuánticas">
    Para las claves post-cuánticas y Ed25519, los algoritmos de firma son de tipo *PURE* (\`MLDSA_44_PURE\`, \`MLDSA_65_PURE\`, \`MLDSA_87_PURE\`, \`SLHDSA_PURE\`, \`Ed25519_PURE\`, \`COMPOSITE_MLDSA_RSA_PURE\`, \`COMPOSITE_MLDSA_ECDSA_PURE\` y \`COMPOSITE_MLDSA_ED25519_PURE\`). En este modo la firma se calcula sobre el mensaje tal cual se proporciona, sin calcular ningún *digest* intermedio, por lo que el campo **Message Type** no interviene.
  </Callout>
</div>

Verify [#verify]

Esta pestaña comprueba si una firma corresponde a la clave pública asociada.

Campos principales:

* **Algorithm**: debe coincidir con el algoritmo usado para la firma.
* **Message Type**: \`Raw\` o \`Digest\`.
* **Payload Encoding**: codificación del mensaje.
* **Message**: mensaje original o hash.
* **Signature**: firma que se desea comprobar.
* **Result**: indicador del resultado de la validación.

<div className="lm-diff-ins lm-diff-block">
  Al igual que en la firma, los algoritmos *PURE* de las claves post-cuánticas y Ed25519 verifican el mensaje tal cual se proporciona, sin aplicar ningún *digest*, por lo que el campo **Message Type** no interviene.
</div>

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
`,l={title:"[KMS] Gestión de Claves Criptográficas",description:"Gestión y operación de claves criptográficas en Lamassu IoT",sidebar:{group:"KMS",label:"Visión general"}},c={isNew:!1,changes:20,title:void 0,description:void 0},d={contents:[{heading:"gestión-de-claves-criptográficas",content:"El servicio de Gestión de Claves Criptográficas (KMS) de Lamassu IoT centraliza la generación, importación, custodia y uso de las claves de la plataforma. Desde aquí se gestionan las claves que soportan a las CAs y al resto de operaciones de firma que dependen de la PKI."},{heading:"gestión-de-claves-criptográficas",content:"Lamassu IoT trabaja con claves asimétricas: además de los algoritmos clásicos (RSA, curvas elípticas y Ed25519), soporta algoritmos de criptografía post-cuántica (PQC), como ML-DSA, SLH-DSA y las claves compuestas *Composite ML-DSA*, pensadas para resistir los ataques de los ordenadores cuánticos. Estas claves se usan para emitir certificados X.509, firmar solicitudes y realizar operaciones de autenticación y validación dentro del sistema."},{heading:"qué-resuelve-el-kms",content:"El KMS unifica la gestión del ciclo de vida de las claves y evita que cada servicio tenga que integrarse directamente con un proveedor criptográfico concreto."},{heading:"qué-resuelve-el-kms",content:"En la práctica, permite:"},{heading:"qué-resuelve-el-kms",content:"Generar nuevos pares de claves desde Lamassu IoT."},{heading:"qué-resuelve-el-kms",content:"Importar claves creadas externamente."},{heading:"qué-resuelve-el-kms",content:"Delegar la custodia y las operaciones criptográficas en motores externos."},{heading:"qué-resuelve-el-kms",content:"Reutilizar claves ya existentes para CAs, CSR y tareas de firma o verificación."},{heading:"motores-criptográficos",content:"Lamassu puede trabajar con distintos motores criptográficos según los requisitos del despliegue. En algunos entornos bastará con un motor software; en otros será necesario delegar la custodia en un HSM, en un servicio cloud o en una plataforma especializada."},{heading:"motores-criptográficos",content:"Una misma instancia puede tener varios motores configurados al mismo tiempo, incluso varias instancias del mismo tipo. Esto permite adaptar la operación a distintos niveles de seguridad, coste y requisitos regulatorios."},{heading:"motores-criptográficos",content:"Actualmente, Lamassu soporta los siguientes motores:"},{heading:"motores-criptográficos",content:"Crypto Engine"},{heading:"motores-criptográficos",content:"Nivel de seguridad"},{heading:"motores-criptográficos",content:"OnPrem / Cloud"},{heading:"motores-criptográficos",content:"Coste adicional"},{heading:"motores-criptográficos",content:"Generación de claves"},{heading:"motores-criptográficos",content:"Persistencia *at-rest* segura"},{heading:"motores-criptográficos",content:"Filtración de claves"},{heading:"motores-criptográficos",content:"Consideraciones"},{heading:"motores-criptográficos",content:"File System"},{heading:"motores-criptográficos",content:"1"},{heading:"motores-criptográficos",content:"OnPrem y Cloud"},{heading:"motores-criptográficos",content:"No"},{heading:"motores-criptográficos",content:"**Entropía software**. La generación se realiza con las librerías criptográficas de Go."},{heading:"motores-criptográficos",content:"**Insegura**. Delegada en el sistema de archivos."},{heading:"motores-criptográficos",content:"**Insegura**. Delegada en el sistema de archivos."},{heading:"motores-criptográficos",content:"No recomendado para producción."},{heading:"motores-criptográficos",content:"HashiCorp Vault"},{heading:"motores-criptográficos",content:"2"},{heading:"motores-criptográficos",content:"OnPrem y Cloud"},{heading:"motores-criptográficos",content:"No"},{heading:"motores-criptográficos",content:"Depende de la configuración de Vault."},{heading:"motores-criptográficos",content:"**Segura**"},{heading:"motores-criptográficos",content:"**Insegura**. Un administrador con permisos suficientes puede visualizar la clave privada."},{heading:"motores-criptográficos",content:"Conviene limitar al máximo el acceso administrativo y custodiar correctamente las claves de *unseal*."},{heading:"motores-criptográficos",content:"AWS Secrets Manager"},{heading:"motores-criptográficos",content:"2"},{heading:"motores-criptográficos",content:"Cloud"},{heading:"motores-criptográficos",content:"Sí"},{heading:"motores-criptográficos",content:"Depende del proceso de alta de la clave."},{heading:"motores-criptográficos",content:"**Segura**"},{heading:"motores-criptográficos",content:"**Insegura**. Un administrador con permisos suficientes puede visualizar la clave privada."},{heading:"motores-criptográficos",content:"La protección *at-rest* la proporciona AWS, pero no evita el acceso administrativo al material privado."},{heading:"motores-criptográficos",content:"AWS KMS"},{heading:"motores-criptográficos",content:"3"},{heading:"motores-criptográficos",content:"Cloud"},{heading:"motores-criptográficos",content:"Sí"},{heading:"motores-criptográficos",content:"**Entropía hardware**"},{heading:"motores-criptográficos",content:"**Segura**"},{heading:"motores-criptográficos",content:"**Segura**"},{heading:"motores-criptográficos",content:"Aunque la clave privada no se expone, un actor con permisos suficientes podría usarla para firmar artefactos."},{heading:"motores-criptográficos",content:"PKCS11"},{heading:"motores-criptográficos",content:"3\\*"},{heading:"motores-criptográficos",content:"AirGap OnPrem y Cloud"},{heading:"motores-criptográficos",content:"Depende del hardware o del servicio usado. Puede integrarse con HSMs OnPrem o con ofertas Key as a Service."},{heading:"motores-criptográficos",content:"**Entropía hardware**"},{heading:"motores-criptográficos",content:"**Segura**\\*"},{heading:"motores-criptográficos",content:"Depende del HSM"},{heading:"motores-criptográficos",content:"El nivel real depende de la implementación PKCS11 y del HSM utilizado."},{heading:"motores-criptográficos",content:"Lamassu muestra en la consola el listado completo de motores habilitados."},{heading:"motores-criptográficos",content:"Cada motor define qué algoritmos soporta, como RSA o ECC/ECDSA, y qué tamaños de clave puede generar. La matriz de algoritmos declarada por el motor también determina si en él se pueden crear claves post-cuánticas: si un motor no declara soporte para un tipo de clave, Lamassu rechazará su creación o importación con el error *unsupported key type*."},{heading:"motores-criptográficos",content:"Durante el despliegue es obligatorio definir un motor por defecto. Ese motor se utilizará cuando un proceso necesite crear o persistir una clave y el usuario no haya seleccionado uno específico, por ejemplo al crear o importar una CA."},{heading:"tipos-de-clave-y-algoritmos-soportados",content:"Lamassu admite claves clásicas y claves de criptografía post-cuántica. Los algoritmos post-cuánticos se alinean con las nuevas generaciones de estándares NIST (ML-DSA, FIPS 204, y SLH-DSA, FIPS 205). También se admiten certificados compuestos (*composite*), que combinan una firma clásica y una firma post-cuántica en el mismo certificado X.509 para facilitar la transición."},{heading:"algoritmos-clásicos",content:"Algoritmo"},{heading:"algoritmos-clásicos",content:"Parámetros"},{heading:"algoritmos-clásicos",content:"RSA"},{heading:"algoritmos-clásicos",content:"1024, 2048, 3072 y 4096 bits (los motores software admiten además 7680 y 15360)"},{heading:"algoritmos-clásicos",content:"ECDSA"},{heading:"algoritmos-clásicos",content:"Curvas P-224, P-256, P-384 y P-521, según el motor"},{heading:"algoritmos-clásicos",content:"Ed25519"},{heading:"algoritmos-clásicos",content:"256 bits"},{heading:"algoritmos-post-cuánticos",content:"Familia"},{heading:"algoritmos-post-cuánticos",content:"Parámetros"},{heading:"algoritmos-post-cuánticos",content:"ML-DSA"},{heading:"algoritmos-post-cuánticos",content:"Niveles de seguridad 44, 65 y 87"},{heading:"algoritmos-post-cuánticos",content:"SLH-DSA"},{heading:"algoritmos-post-cuánticos",content:"Juegos de parámetros del 1 al 12 (por ejemplo, 1 = SHA2-128s y 5 = SHA2-256s)"},{heading:"algoritmos-post-cuánticos",content:"Composite-ML-DSA-RSA"},{heading:"algoritmos-post-cuánticos",content:"Variantes 1 a 8: combinación de ML-DSA con firmas RSA (por ejemplo, variante 1 = MLDSA44-RSA2048-PSS-SHA256)"},{heading:"algoritmos-post-cuánticos",content:"Composite-ML-DSA-ECDSA"},{heading:"algoritmos-post-cuánticos",content:"Variantes 9 a 13: combinación de ML-DSA con firmas ECDSA"},{heading:"algoritmos-post-cuánticos",content:"Composite-ML-DSA-Ed25519"},{heading:"algoritmos-post-cuánticos",content:"Variantes 14 y 15: combinación de ML-DSA con firmas Ed25519"},{heading:"disponibilidad-por-motor",content:"La disponibilidad de estos tipos de clave depende del motor criptográfico que custodie la clave:"},{heading:"disponibilidad-por-motor",content:"El motor software (File System) soporta la matriz completa de algoritmos, incluidos todos los post-cuánticos."},{heading:"disponibilidad-por-motor",content:"Los motores externos solo exponen los algoritmos que declara su proveedor. Los algoritmos post-cuánticos aún no están disponibles en ellos, por lo que las solicitudes de creación o importación de claves de este tipo se rechazarán."},{heading:"importación-de-claves-post-cuánticas",content:"Además de generarse en Lamassu, las claves post-cuánticas pueden importarse como claves privadas en formato PKCS#8/PEM de los algoritmos soportados: ML-DSA (niveles 44, 65 y 87), SLH-DSA (esquemas `SLH-DSA-*`) y claves privadas compuestas (`CompositePrivateKey`). El motor de destino debe declarar soporte para el algoritmo de la clave importada."},{heading:"inventario-de-claves",content:"La pantalla principal de KMS muestra el inventario completo de claves registradas en el sistema. Es la vista de referencia para revisar qué claves existen, dónde están custodiadas y con qué entidades están relacionadas."},{heading:"inventario-de-claves",content:"La tabla incluye los siguientes campos:"},{heading:"inventario-de-claves",content:"**Name**: nombre descriptivo de la clave."},{heading:"inventario-de-claves",content:"**Type**: algoritmo y tamaño de clave, por ejemplo RSA 2048, EC P-256 o ML-DSA 65."},{heading:"inventario-de-claves",content:"**Strength**: indicador visual de fortaleza criptográfica."},{heading:"inventario-de-claves",content:"**Public/Private**: indica si Lamassu gestiona el par completo o solo la clave pública."},{heading:"inventario-de-claves",content:"**Crypto Engine**: motor criptográfico que custodia la clave."},{heading:"inventario-de-claves",content:"**Aliases**: nombres alternativos asociados a la clave."},{heading:"inventario-de-claves",content:"**Tags**: etiquetas para clasificación y búsqueda."},{heading:"inventario-de-claves",content:"**Related Entities**: certificados u otras entidades vinculadas a esa clave."},{heading:"inventario-de-claves",content:"Desde esta vista también se accede a las acciones más habituales:"},{heading:"inventario-de-claves",content:"**View Details** para consultar metadatos, identificadores y relaciones."},{heading:"inventario-de-claves",content:"**Generate CSR** para crear una solicitud PKCS#10 con la clave seleccionada."},{heading:"inventario-de-claves",content:"**Sign / Verify** para probar operaciones criptográficas sobre la clave."},{heading:"inventario-de-claves",content:"**Delete Key** para eliminar la clave del sistema."},{heading:"crear-o-importar-claves",content:"El alta de claves se realiza desde el asistente que se abre con **Create New Key**."},{heading:"generar-un-nuevo-par-de-claves",content:"Si la clave va a nacer dentro de Lamassu, el flujo recomendado es generar un nuevo par gestionado directamente por uno de los motores configurados."},{heading:"generar-un-nuevo-par-de-claves",content:"En la primera pantalla del asistente, elija **Generate New Key Pair** y después defina los parámetros principales:"},{heading:"generar-un-nuevo-par-de-claves",content:"**Key Name**: nombre único y descriptivo."},{heading:"generar-un-nuevo-par-de-claves",content:"**Crypto Engine**: motor que custodiará la clave."},{heading:"generar-un-nuevo-par-de-claves",content:"**Key Type** y **Key Size**: algoritmo y tamaño o curva. Consulte la sección Tipos de clave y algoritmos soportados para ver las opciones disponibles y su disponibilidad por motor."},{heading:"generar-un-nuevo-par-de-claves",content:"**Tags**: metadatos para clasificar la clave."},{heading:"generar-un-nuevo-par-de-claves",content:"**Metadata**: información adicional para usos avanzados."},{heading:"importar-un-par-existente",content:"La importación permite registrar en Lamassu una clave generada fuera de la plataforma. Es el flujo habitual en escenarios BYOK, migraciones o integración con material criptográfico que ya está en producción."},{heading:"importar-un-par-existente",content:"Cuando la clave se ha generado en un entorno aislado o en un HSM externo."},{heading:"importar-un-par-existente",content:"Cuando se necesita migrar una PKI existente sin reemitir certificados."},{heading:"importar-un-par-existente",content:"Cuando Lamassu debe operar con una raíz de confianza creada por un tercero."},{heading:"importar-un-par-existente",content:"En el asistente, elija **Import Existing Key Pair** y complete los campos solicitados:"},{heading:"importar-un-par-existente",content:"**Key Name**: nombre descriptivo dentro de Lamassu IoT."},{heading:"importar-un-par-existente",content:"**Crypto Engine**: motor que custodiará la clave importada."},{heading:"importar-un-par-existente",content:"**Tags**: etiquetas para organización y búsqueda."},{heading:"importar-un-par-existente",content:"**Metadata**: información adicional opcional."},{heading:"importar-un-par-existente",content:"**Private Key (PEM)**: clave privada en formato PEM."},{heading:"importar-un-par-existente",content:"Una vez completado el asistente, la clave queda almacenada en el motor seleccionado y puede utilizarse para firma, generación de CSR y el resto de operaciones soportadas por KMS."},{heading:"operaciones-sobre-una-clave",content:"Cada clave registrada dispone de una vista de detalle y de varias acciones operativas."},{heading:"ver-detalles",content:"La pantalla **View Details** concentra la información técnica y administrativa de la clave."},{heading:"ver-detalles",content:"En la pestaña **Overview** se muestran, entre otros, estos campos:"},{heading:"ver-detalles",content:"**Key Name**: nombre descriptivo."},{heading:"ver-detalles",content:"**Key Identifier**: identificador único del sistema. Lamassu utiliza formatos de ID basados en PKCS11."},{heading:"ver-detalles",content:"**Tags**: etiquetas asociadas."},{heading:"ver-detalles",content:"**Aliases**: nombres alternativos."},{heading:"ver-detalles",content:"**Crypto Engine**: motor en el que reside la clave."},{heading:"ver-detalles",content:"**Algorithm, Key Size & Strength**: algoritmo, parámetros y nivel de fortaleza."},{heading:"ver-detalles",content:"La sección **Related Entities** muestra qué objetos de Lamassu dependen de esa clave."},{heading:"ver-detalles",content:"La pestaña **Public Key** presenta la clave pública en formato PEM, lista para consulta o copia."},{heading:"firmar-y-verificar",content:"La acción **Sign / Verify** sirve para validar que la clave y el motor criptográfico funcionan correctamente."},{heading:"firmar-y-verificar",content:"Al abrirla aparecen dos áreas: **Sign** y **Verify**."},{heading:"sign",content:"Esta pestaña usa la clave privada para generar una firma digital sobre un mensaje o sobre un *digest* ya calculado."},{heading:"sign",content:"Campos principales:"},{heading:"sign",content:"**Algorithm**: algoritmo de firma disponible para el tipo de clave."},{heading:"sign",content:"**Message Type**: `Raw` para datos en claro o `Digest` para un hash precalculado."},{heading:"sign",content:"**Payload Encoding**: codificación de entrada, como UTF-8, Hex o Base64."},{heading:"sign",content:"**Message**: contenido que se va a firmar."},{heading:"sign",content:"**Signature**: resultado de la operación, mostrado en hexadecimal."},{heading:"sign",content:"Para las claves post-cuánticas y Ed25519, los algoritmos de firma son de tipo *PURE* (`MLDSA_44_PURE`, `MLDSA_65_PURE`, `MLDSA_87_PURE`, `SLHDSA_PURE`, `Ed25519_PURE`, `COMPOSITE_MLDSA_RSA_PURE`, `COMPOSITE_MLDSA_ECDSA_PURE` y `COMPOSITE_MLDSA_ED25519_PURE`). En este modo la firma se calcula sobre el mensaje tal cual se proporciona, sin calcular ningún *digest* intermedio, por lo que el campo **Message Type** no interviene."},{heading:"verify",content:"Esta pestaña comprueba si una firma corresponde a la clave pública asociada."},{heading:"verify",content:"Campos principales:"},{heading:"verify",content:"**Algorithm**: debe coincidir con el algoritmo usado para la firma."},{heading:"verify",content:"**Message Type**: `Raw` o `Digest`."},{heading:"verify",content:"**Payload Encoding**: codificación del mensaje."},{heading:"verify",content:"**Message**: mensaje original o hash."},{heading:"verify",content:"**Signature**: firma que se desea comprobar."},{heading:"verify",content:"**Result**: indicador del resultado de la validación."},{heading:"verify",content:"Al igual que en la firma, los algoritmos *PURE* de las claves post-cuánticas y Ed25519 verifican el mensaje tal cual se proporciona, sin aplicar ningún *digest*, por lo que el campo **Message Type** no interviene."},{heading:"generar-un-csr",content:"La acción **Generate CSR** crea una solicitud PKCS#10 firmada con la clave privada custodiada en Lamassu, sin exponerla fuera del motor criptográfico."},{heading:"generar-un-csr",content:"Este flujo es útil para:"},{heading:"generar-un-csr",content:"Solicitar certificados a una CA externa."},{heading:"generar-un-csr",content:"Renovar una identidad manteniendo la misma clave."},{heading:"generar-un-csr",content:"Al abrir el formulario se solicitan los datos del sujeto y los atributos principales del certificado:"},{heading:"generar-un-csr",content:"**Common Name (CN)**: nombre principal de la identidad."},{heading:"generar-un-csr",content:"**Organization (O)**: organización o empresa."},{heading:"generar-un-csr",content:"**Organizational Unit (OU)**: departamento o unidad."},{heading:"generar-un-csr",content:"**Country (C)**: código de país de dos letras."},{heading:"generar-un-csr",content:"**State / Province (ST)**: estado o provincia."},{heading:"generar-un-csr",content:"**Locality (L)**: ciudad o localidad."},{heading:"generar-un-csr",content:"**Email Address**: correo de contacto."},{heading:"generar-un-csr",content:"**Subject Alternative Names (SANs)**: nombres o identificadores alternativos, como DNS o IP."},{heading:"generar-un-csr",content:"Una vez completado el formulario, Lamassu genera la CSR y la presenta para su descarga o copia."},{heading:"firma-local-con-pkcs11",content:"Lamassu también ofrece una ayuda específica para integraciones locales mediante **Sign locally with OpenSSL & PKCS11 tools**."},{heading:"firma-local-con-pkcs11",content:"Esta opción muestra los pasos necesarios para configurar el entorno local, cargar el módulo PKCS#11 y ejecutar firmas con herramientas como OpenSSL sin extraer la clave privada del entorno custodiado."}],headings:[{id:"gestión-de-claves-criptográficas",content:"Gestión de claves criptográficas"},{id:"qué-resuelve-el-kms",content:"Qué resuelve el KMS"},{id:"motores-criptográficos",content:"Motores criptográficos"},{id:"tipos-de-clave-y-algoritmos-soportados",content:"Tipos de clave y algoritmos soportados"},{id:"algoritmos-clásicos",content:"Algoritmos clásicos"},{id:"algoritmos-post-cuánticos",content:"Algoritmos post-cuánticos"},{id:"disponibilidad-por-motor",content:"Disponibilidad por motor"},{id:"importación-de-claves-post-cuánticas",content:"Importación de claves post-cuánticas"},{id:"inventario-de-claves",content:"Inventario de claves"},{id:"crear-o-importar-claves",content:"Crear o importar claves"},{id:"generar-un-nuevo-par-de-claves",content:"Generar un nuevo par de claves"},{id:"importar-un-par-existente",content:"Importar un par existente"},{id:"operaciones-sobre-una-clave",content:"Operaciones sobre una clave"},{id:"ver-detalles",content:"Ver detalles"},{id:"firmar-y-verificar",content:"Firmar y verificar"},{id:"sign",content:"Sign"},{id:"verify",content:"Verify"},{id:"generar-un-csr",content:"Generar un CSR"},{id:"firma-local-con-pkcs11",content:"Firma local con PKCS#11"}]};const m=[{depth:1,url:"#gestión-de-claves-criptográficas",title:e.jsx(e.Fragment,{children:"Gestión de claves criptográficas"})},{depth:2,url:"#qué-resuelve-el-kms",title:e.jsx(e.Fragment,{children:"Qué resuelve el KMS"})},{depth:2,url:"#motores-criptográficos",title:e.jsx(e.Fragment,{children:"Motores criptográficos"})},{depth:2,url:"#tipos-de-clave-y-algoritmos-soportados",title:e.jsx(e.Fragment,{children:"Tipos de clave y algoritmos soportados"})},{depth:3,url:"#algoritmos-clásicos",title:e.jsx(e.Fragment,{children:"Algoritmos clásicos"})},{depth:3,url:"#algoritmos-post-cuánticos",title:e.jsx(e.Fragment,{children:"Algoritmos post-cuánticos"})},{depth:3,url:"#disponibilidad-por-motor",title:e.jsx(e.Fragment,{children:"Disponibilidad por motor"})},{depth:3,url:"#importación-de-claves-post-cuánticas",title:e.jsx(e.Fragment,{children:"Importación de claves post-cuánticas"})},{depth:2,url:"#inventario-de-claves",title:e.jsx(e.Fragment,{children:"Inventario de claves"})},{depth:2,url:"#crear-o-importar-claves",title:e.jsx(e.Fragment,{children:"Crear o importar claves"})},{depth:3,url:"#generar-un-nuevo-par-de-claves",title:e.jsx(e.Fragment,{children:"Generar un nuevo par de claves"})},{depth:3,url:"#importar-un-par-existente",title:e.jsx(e.Fragment,{children:"Importar un par existente"})},{depth:2,url:"#operaciones-sobre-una-clave",title:e.jsx(e.Fragment,{children:"Operaciones sobre una clave"})},{depth:3,url:"#ver-detalles",title:e.jsx(e.Fragment,{children:"Ver detalles"})},{depth:3,url:"#firmar-y-verificar",title:e.jsx(e.Fragment,{children:"Firmar y verificar"})},{depth:4,url:"#sign",title:e.jsx(e.Fragment,{children:"Sign"})},{depth:4,url:"#verify",title:e.jsx(e.Fragment,{children:"Verify"})},{depth:3,url:"#generar-un-csr",title:e.jsx(e.Fragment,{children:"Generar un CSR"})},{depth:3,url:"#firma-local-con-pkcs11",title:e.jsx(e.Fragment,{children:"Firma local con PKCS#11"})}];function s(i){const a={a:"a",code:"code",del:"del",div:"div",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",ins:"ins",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Callout:n}=a;return n||o("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(a.h1,{id:"gestión-de-claves-criptográficas",children:"Gestión de claves criptográficas"}),`
`,e.jsx(a.p,{children:"El servicio de Gestión de Claves Criptográficas (KMS) de Lamassu IoT centraliza la generación, importación, custodia y uso de las claves de la plataforma. Desde aquí se gestionan las claves que soportan a las CAs y al resto de operaciones de firma que dependen de la PKI."}),`
`,e.jsxs(a.p,{children:[e.jsx(a.del,{className:"lm-diff-del",children:"En la configuración actual, "}),"Lamassu IoT trabaja ",e.jsx(a.del,{className:"lm-diff-del",children:"exclusivamente "}),"con claves asimétricas",e.jsx(a.del,{className:"lm-diff-del",children:", como RSA y curvas elípticas"}),e.jsx(a.ins,{className:"lm-diff-ins",children:": además de los algoritmos clásicos (RSA, curvas elípticas y Ed25519), soporta algoritmos de criptografía post-cuántica (PQC), como ML-DSA, SLH-DSA y las claves compuestas "}),e.jsx(a.em,{children:e.jsx(a.ins,{className:"lm-diff-ins",children:"Composite ML-DSA"})}),e.jsx(a.ins,{className:"lm-diff-ins",children:", pensadas para resistir los ataques de los ordenadores cuánticos"}),". Estas claves se usan para emitir certificados X.509, firmar solicitudes y realizar operaciones de autenticación y validación dentro del sistema."]}),`
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
`,e.jsxs(a.p,{children:["Cada motor define qué algoritmos soporta, como RSA o ECC/ECDSA, y qué tamaños de clave puede generar.",e.jsx(a.ins,{className:"lm-diff-ins",children:" La matriz de algoritmos declarada por el motor también determina si en él se pueden crear claves post-cuánticas: si un motor no declara soporte para un tipo de clave, Lamassu rechazará su creación o importación con el error "}),e.jsx(a.em,{children:e.jsx(a.ins,{className:"lm-diff-ins",children:"unsupported key type"})}),e.jsx(a.ins,{className:"lm-diff-ins",children:"."})]}),`
`,e.jsx(a.p,{children:"Durante el despliegue es obligatorio definir un motor por defecto. Ese motor se utilizará cuando un proceso necesite crear o persistir una clave y el usuario no haya seleccionado uno específico, por ejemplo al crear o importar una CA."}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.h2,{id:"tipos-de-clave-y-algoritmos-soportados",children:"Tipos de clave y algoritmos soportados"})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(a.p,{children:["Lamassu admite claves clásicas y claves de criptografía post-cuántica. Los algoritmos post-cuánticos se alinean con las nuevas generaciones de estándares NIST (ML-DSA, FIPS 204, y SLH-DSA, FIPS 205). También se admiten certificados compuestos (",e.jsx(a.em,{children:"composite"}),"), que combinan una firma clásica y una firma post-cuántica en el mismo certificado X.509 para facilitar la transición."]})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.h3,{id:"algoritmos-clásicos",children:"Algoritmos clásicos"})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(a.table,{children:[e.jsx(a.thead,{children:e.jsxs(a.tr,{children:[e.jsx(a.th,{style:{textAlign:"left"},children:"Algoritmo"}),e.jsx(a.th,{style:{textAlign:"left"},children:"Parámetros"})]})}),e.jsxs(a.tbody,{children:[e.jsxs(a.tr,{children:[e.jsx(a.td,{style:{textAlign:"left"},children:"RSA"}),e.jsx(a.td,{style:{textAlign:"left"},children:"1024, 2048, 3072 y 4096 bits (los motores software admiten además 7680 y 15360)"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{style:{textAlign:"left"},children:"ECDSA"}),e.jsx(a.td,{style:{textAlign:"left"},children:"Curvas P-224, P-256, P-384 y P-521, según el motor"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{style:{textAlign:"left"},children:"Ed25519"}),e.jsx(a.td,{style:{textAlign:"left"},children:"256 bits"})]})]})]})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.h3,{id:"algoritmos-post-cuánticos",children:"Algoritmos post-cuánticos"})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(a.table,{children:[e.jsx(a.thead,{children:e.jsxs(a.tr,{children:[e.jsx(a.th,{style:{textAlign:"left"},children:"Familia"}),e.jsx(a.th,{style:{textAlign:"left"},children:"Parámetros"})]})}),e.jsxs(a.tbody,{children:[e.jsxs(a.tr,{children:[e.jsx(a.td,{style:{textAlign:"left"},children:"ML-DSA"}),e.jsx(a.td,{style:{textAlign:"left"},children:"Niveles de seguridad 44, 65 y 87"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{style:{textAlign:"left"},children:"SLH-DSA"}),e.jsx(a.td,{style:{textAlign:"left"},children:"Juegos de parámetros del 1 al 12 (por ejemplo, 1 = SHA2-128s y 5 = SHA2-256s)"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{style:{textAlign:"left"},children:"Composite-ML-DSA-RSA"}),e.jsx(a.td,{style:{textAlign:"left"},children:"Variantes 1 a 8: combinación de ML-DSA con firmas RSA (por ejemplo, variante 1 = MLDSA44-RSA2048-PSS-SHA256)"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{style:{textAlign:"left"},children:"Composite-ML-DSA-ECDSA"}),e.jsx(a.td,{style:{textAlign:"left"},children:"Variantes 9 a 13: combinación de ML-DSA con firmas ECDSA"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{style:{textAlign:"left"},children:"Composite-ML-DSA-Ed25519"}),e.jsx(a.td,{style:{textAlign:"left"},children:"Variantes 14 y 15: combinación de ML-DSA con firmas Ed25519"})]})]})]})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.h3,{id:"disponibilidad-por-motor",children:"Disponibilidad por motor"})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.p,{children:"La disponibilidad de estos tipos de clave depende del motor criptográfico que custodie la clave:"})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"El motor software (File System) soporta la matriz completa de algoritmos, incluidos todos los post-cuánticos."}),`
`,e.jsx(a.li,{children:"Los motores externos solo exponen los algoritmos que declara su proveedor. Los algoritmos post-cuánticos aún no están disponibles en ellos, por lo que las solicitudes de creación o importación de claves de este tipo se rechazarán."}),`
`]})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a.h3,{id:"importación-de-claves-post-cuánticas",children:"Importación de claves post-cuánticas"})}),`
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(a.p,{children:["Además de generarse en Lamassu, las claves post-cuánticas pueden importarse como claves privadas en formato PKCS#8/PEM de los algoritmos soportados: ML-DSA (niveles 44, 65 y 87), SLH-DSA (esquemas ",e.jsx(a.code,{children:"SLH-DSA-*"}),") y claves privadas compuestas (",e.jsx(a.code,{children:"CompositePrivateKey"}),"). El motor de destino debe declarar soporte para el algoritmo de la clave importada."]})}),`
`,e.jsx(a.h2,{id:"inventario-de-claves",children:"Inventario de claves"}),`
`,e.jsx(a.p,{children:"La pantalla principal de KMS muestra el inventario completo de claves registradas en el sistema. Es la vista de referencia para revisar qué claves existen, dónde están custodiadas y con qué entidades están relacionadas."}),`
`,e.jsx(a.p,{children:"La tabla incluye los siguientes campos:"}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Name"}),": nombre descriptivo de la clave."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Type"}),": algoritmo y tamaño de clave, por ejemplo RSA 2048",e.jsx(a.del,{className:"lm-diff-del",children:" o"}),e.jsx(a.ins,{className:"lm-diff-ins",children:","})," EC P-256",e.jsx(a.ins,{className:"lm-diff-ins",children:" o ML-DSA 65"}),"."]}),`
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
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Key Type"})," y ",e.jsx(a.strong,{children:"Key Size"}),": algoritmo y tamaño o curva.",e.jsx(a.ins,{className:"lm-diff-ins",children:" Consulte la sección "}),e.jsx(a.a,{href:"#tipos-de-clave-y-algoritmos-soportados",children:e.jsx(a.ins,{className:"lm-diff-ins",children:"Tipos de clave y algoritmos soportados"})}),e.jsx(a.ins,{className:"lm-diff-ins",children:" para ver las opciones disponibles y su disponibilidad por motor."})]}),`
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
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Key Identifier"}),": identificador único del sistema. Lamassu utiliza formatos de ID basados en PKCS11."]}),`
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
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n,{type:"info",title:"Firmas PURE para claves post-cuánticas",children:e.jsxs(a.p,{children:["Para las claves post-cuánticas y Ed25519, los algoritmos de firma son de tipo ",e.jsx(a.em,{children:"PURE"})," (",e.jsx(a.code,{children:"MLDSA_44_PURE"}),", ",e.jsx(a.code,{children:"MLDSA_65_PURE"}),", ",e.jsx(a.code,{children:"MLDSA_87_PURE"}),", ",e.jsx(a.code,{children:"SLHDSA_PURE"}),", ",e.jsx(a.code,{children:"Ed25519_PURE"}),", ",e.jsx(a.code,{children:"COMPOSITE_MLDSA_RSA_PURE"}),", ",e.jsx(a.code,{children:"COMPOSITE_MLDSA_ECDSA_PURE"})," y ",e.jsx(a.code,{children:"COMPOSITE_MLDSA_ED25519_PURE"}),"). En este modo la firma se calcula sobre el mensaje tal cual se proporciona, sin calcular ningún ",e.jsx(a.em,{children:"digest"})," intermedio, por lo que el campo ",e.jsx(a.strong,{children:"Message Type"})," no interviene."]})})}),`
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
`,e.jsx(a.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(a.p,{children:["Al igual que en la firma, los algoritmos ",e.jsx(a.em,{children:"PURE"})," de las claves post-cuánticas y Ed25519 verifican el mensaje tal cual se proporciona, sin aplicar ningún ",e.jsx(a.em,{children:"digest"}),", por lo que el campo ",e.jsx(a.strong,{children:"Message Type"})," no interviene."]})}),`
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
`,e.jsx(a.p,{children:"Esta opción muestra los pasos necesarios para configurar el entorno local, cargar el módulo PKCS#11 y ejecutar firmas con herramientas como OpenSSL sin extraer la clave privada del entorno custodiado."})]})}function p(i={}){const{wrapper:a}=i.components||{};return a?e.jsx(a,{...i,children:e.jsx(s,{...i})}):s(i)}function o(i,a){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{t as _markdown,p as default,l as frontmatter,c as lmDiff,d as structuredData,m as toc};
