import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let d=`

Gestión de entidades de confianza [#gestión-de-entidades-de-confianza]

Creación de entidades de certificación [#creación-de-entidades-de-certificación]

Para acceder a la creación de nuevas entidades certificación se debe acceder la opción de entidades de certificación del menú lateral y luego seleccionar la acción de creación de nueva CA.

Actualmente hay disponibles 3 acciones:

* **Creación de una nueva autoridad de certificación**, esta acción generará un nuevo par de claves para soportar la nueva autoridad de certificación.
* **Importar una nueva autoridad de certificación generada externamente**, permite importar en Lamassu una autoridad de certificación, cuyo par de claves ha sido generado de manera externa.
* **Importar un certificado de autoridad de certificación sin clave privada**, en este caso se importa la CA para poder usarla en procesos de validación y no como fuente de nuevos certificados gestionados por Lamassu.

Creación de una nueva autoridad de certificación [#creación-de-una-nueva-autoridad-de-certificación]

La creación de una Autoridad de Certificación (CA) es un proceso fundamental en el establecimiento de una infraestructura de clave pública (PKI). Lamassu IoT permite provisionar tanto autoridades raíz como intermedias mediante la generación automática de pares de claves criptográficas que son gestionados de forma segura por el sistema integrado de gestión de claves.

En el formulario de creación se definen los siguientes bloques de configuración.

**Motor criptográfico**

* **Selector:** Desplegable con motores disponibles, ofrece los configurados en el sistema.
* **Ejemplo mostrado:** go1.24.3
* **Función:** Permite seleccionar el motor criptográfico deseado

**Parámetros de clave**

* **Key Type:** RSA / EC (Elliptic Curve)
* **Key Size:**
  * RSA: 1024, 2048, 3072, 4096 bits
  * EC: P-256, P-384, P-521
* **Recomendado:** EC P-384

**Perfil de emisión del certificado de la CA**

Aquí se puede seleccionar un perfil existente o definir uno en línea para la operación. Ese perfil permite especificar la duración de la CA que se está creando y los \`Key Usage\` y \`Extended Key Usage\` del certificado de soporte.

Si no se proporciona ningún perfil se aplicará uno por defecto con los usos de clave básicos.

**Configuración de la CA**

**Tipo de CA**

* **Root CA:** Autoridad raíz autofirmada
* **Intermediate CA:** Autoridad subordinada

**Emisor**

* **Root CA:** Self-signed (auto-firmada)
* **Intermediate CA:** Selector desplegable de CA superior disponible
  * Permite seleccionar la CA padre que firmará la nueva CA intermedia

**Identificación**

* **CA ID:** Generado automáticamente (formato UUID),no puede ser modificado. Estos IDs los gestiona el sistema.
  * Ejemplo: 8f7c170-c84e-4c08-904f-8d3247c77fc2
* **CA Name:** Nombre descriptivo (obligatorio)
  * Ejemplo: Lamassu IoT Secure Services CA

**Subject Distinguished Name (DN)**

Campos opcionales:

* **Country (C):** Código país ISO 3166-1 (2 letras)
  * Ejemplo: US, ES, DE
* **State/Province (ST):** Estado o provincia
  * Ejemplo: California, Madrid
* **Locality (L):** Ciudad o localidad
  * Ejemplo: San Francisco, Arrasate
* **Organization (O):** Nombre de la organización
  * Ejemplo: Lamassu IoT Corp
* **Organizational Unit (OU):** Unidad organizacional
  * Ejemplo: Secure Devices Division

El "Certification Authority Name" configurado se utilizará como Common Name (CN) del subject del certificado de la CA.

**Configuración de expiración**
La configuración de expiración define la validez temporal tanto del certificado de la propia CA como de los certificados que ésta emitirá por defecto. Si se ha seleccionado un perfil se dará prioridad al dato proporcionado en el perfil.

Para el certificado de la CA (\`CA Certificate Expiration\`):

* **Función:** Establece la duración de validez del certificado de la Autoridad de Certificación
* **Implicación:** Una vez expirado, la CA no podrá emitir nuevos certificados válidos
* **Duración:** Configurable según necesidades organizacionales
* **Valor por defecto:** 10 años (10y)
* **Consideración:** Debe ser mayor que la duración de los certificados que emitirá

La expiración de la CA se puede definir como un expresión de duración, fijar una fecha fija, o marcarla como indefinida, lo que en términos prácticos permitirá la emisión de una CA sin caducidad.

En el caso de expresar una duración, las unidades permitidas son: y (años), w (semanas), d (días), h (horas), m (minutos) y s (segundos), pudiendo componer expresiones como la siguiente: *5y 8w 4d 2h 1m 2s*

En caso de elegir la opción de fecha específica, se ofrecerá un calendario para seleccionar la fecha de caducidad.

Para el caso de indefinido, se fijará la fecha de expiración máxima permitida.

Para la expiración por defecto de certificados finales (\`Default End-Entity Certificate Issuance Expiration\`):

* **Función:** Define la duración predeterminada para certificados emitidos por esta CA
* **Aplicación:** Se aplica automáticamente a nuevos certificados si no se especifica otra duración
* **Flexibilidad:** Puede ser modificada individualmente al emitir cada certificado
* **Valor por defecto:** 1 año (1y)

Se expresa en los mismos términos que la caducidad de la CA.

Una vez creada la CA debe ser visible en el listado de CAs del sistema.

Creación de CAs a partir de claves del KMS [#creación-de-cas-a-partir-de-claves-del-kms]

Lamassu IoT permite la creación de CAs a partir de claves previamente generadas o importadas en el servicio KMS. Una vez seleccionada la opción **Create New CA (Existing Key)** se muestra el formulario de creación de CAs con los siguientes elementos diferenciales respecto a la creación de la CA a partir de un nuevo par de claves descrito en el punto anterior.

En este caso, primero se solicita la selección de la clave de soporte para esta nueva CA.

Se abre un popup que permite al usuario seleccionar la clave deseada de entre las disponibles en el KMS. Una vez seleccionada la clave, el proceso continúa como se describe en el punto anterior.

Importación de autoridades de certificación [#importación-de-autoridades-de-certificación]

La importación de entidades de certificación permite importar en el sistema una CA que ha sido generada de manera externa. Para ello se sigue el siguiente proceso:

Se debe seleccionar el motor que gestionará el par de claves importado.

* **Selector:** Desplegable con motores disponibles, ofrece los configurados en el sistema.
* **Ejemplo mostrado:** go1.24.3
* **Función:** Permite seleccionar el motor criptográfico deseado

También se define la expiración por defecto de certificados finales (\`Default End-Entity Certificate Issuance Expiration\`):

* **Función:** Define la duración predeterminada para certificados emitidos por esta CA
* **Aplicación:** Se aplica automáticamente a nuevos certificados si no se especifica otra duración
* **Flexibilidad:** Puede ser modificada individualmente al emitir cada certificado
* **Valor por defecto:** 1 año (1y)

Se expresa en los mismos términos que la caducidad de la CA.

Se debe proporcionar de manera obligatoria:

* Certificado de la CA en formato PEM. Se comprueba que el certificado importado corresponda con el de una CA.
* Clave privada de la CA en formato PEM

De manera opcional se proporcionarán en formato PEM la cadena de certificados de la cadena de validación en caso de importar una CA subordinada.

Operando con entidades de confianza [#operando-con-entidades-de-confianza]

Visualización de autoridades de certificación [#visualización-de-autoridades-de-certificación]

Accediendo a la sección de autoridades de certificación se mostrará el listado de CAs registradas en el sistema. El listado permitirá el filtro mediante el nombre de la CA, el estado o el tipo de CA.

La acción de ver detalles da acceso a los detalles de la CA y a diferentes opciones de gestión.

En los detalles se muestra el resumen del estado de los certificados emitidos por la CA: certificados activos, expirados y revocados.

Se ofrecen dos acciones:

* la descarga de la CRL vinculada a la CA que permitirá a otros sistemas realizar comprobaciones de vigencia de los certificados emitidos por la CA de manera desconectada.
* la acción de revocación de la CA

Se muestra información detallada, el certificado en formato PEM y se da acceso a la relación de certificados emitidos por la CA a través de la pestaña “Issued Certificates”

Emisión de certificados [#emisión-de-certificados]

La acción de emisión de certificados se puede realizar desde la pestaña “Issued Certificates” de los detalles de la CA, mediante la acción “Issue New”.

La funcionalidad de emisión es accesible también desde el listado de CAs mediante la acción correspondiente de emisión.

Y desde la funcionalidad  listado completo de certificados emitidos por Lamassu mediante la acción “Issue Certificate”

En este caso se solicitará la selección de una CA antes de acceder al formulario de emisión.

El formulario de emisión de certificados ofrece 2 opciones para la emisión:

* Emisión a partir de una clave privada y el CSR generado en el browser
* Emisión a partir de un CSR generado de manera externa

**Emisión a partir de una clave privada y el CSR generados en el browser**

El usuario proporciona la información requerida para la creación del CSR, la consola genera una clave In Place y genera el CSR correspondiente mediante el cual se solicita la emisión del certificado a la CA.

**Método de emisión:** Seleccionar  "Generate Key & CSR in Browser" para la generación del par de claves y la solicitud de certificado (CSR) directamente en el navegador

**Certificate Subject (Sujeto del certificado)**

**Common Name (CN)**

* **Campo:** Obligatorio
* **Función:** Identifica de forma única al titular del certificado
* **Ejemplos:**
  * Para dispositivos: device001.company.com
  * Para usuarios: [john.doe@company.com](mailto:john.doe@company.com)
  * Para servicios: api.service.company.com

**Campos Organizacionales**

* **Organizational Unit (OU):** Unidad organizacional del titular
  * Ejemplo: IT Department, Manufacturing
* **Organization (O):** Nombre de la organización
  * Ejemplo: LamassuIoT Corp, Acme Industries

**Información Geográfica**

* **Locality (L):** Ciudad o localidad del titular
* **State/Province (ST):** Estado o provincia
* **Country (C):** Código de país ISO 3166-1 (2 letras)
  * Valor por defecto mostrado: US

**Subject Alternative Names (SANs)**
Los SANs proporcionan identificadores alternativos para el certificado, permitiendo que un mismo certificado sea válido para múltiples nombres o direcciones.

**Tipos de SAN Disponibles**

* **DNS:** Nombres de dominio
  * Ejemplo: example.com, \\*.example.com
* **IP Address:** Direcciones IP
* **Email:** Direcciones de correo electrónico
* **URI:** Identificadores de recursos uniformes

Es posible añadir múltiples SAN de cada tipo, se selecciona el tipo, añadiendo el valor y pulsando la acción “Add”.

**Key Generation Details (Detalles de generación de claves)**
Se debe especificar el tipo de clave a ser generada para la solicitud del certificado.

**Algorithm (Algoritmo)**

* **ECDSA:** Algoritmo de curva elíptica, se debe especificar la curva a utilizar
* **RSA:** Algoritmo RSA tradicional, se debe indicar el tamaño de clave

**Certificate Configuration (Configuración del certificado)**

**Validity Duration (Duración de validez)**

Indica la fecha de expiración del certificado a emitir como una expresión de duración

* **Campo:** Configurable según necesidades
* **Valor por defecto:** 1 año (1y)
* **Unidades válidas:** y (años), w (semanas), d (días), h (horas), m (minutos), s (segundos)
* **Consideración:** No puede exceder la validez de la CA emisora

**Key Usage (Uso de claves)**
Define los propósitos criptográficos para los que puede utilizarse la clave privada del certificado.

**Usos Básicos**

* **Digital Signature:** ✓ (marcado por defecto) - Firmas digitales
* **Content Commitment (Non-Repudiation):** No repudio
* **Key Encipherment:** Cifrado de claves
* **Data Encipherment:** Cifrado de datos
* **Key Agreement:** Acuerdo de claves
* **Certificate Signing:** Firma de certificados
* **CRL Signing:** Firma de listas de revocación
* **Encipher Only:** Solo cifrado
* **Decipher Only:** Solo descifrado

**Uso Extendido de Claves**

Especifica aplicaciones específicas para las que está autorizado el certificado.

* **Server Authentication:** ✓ (marcado por defecto) - Autenticación de servidor
* **Client Authentication:** ✓ (marcado por defecto) - Autenticación de cliente
* **Code Signing:** Firma de código
* **Email Protection:** Protección de correo electrónico
* **Time Stamping:** Sellado de tiempo
* **OCSP Signing:** Firma de respuestas OCSP

Una vez completado los campos del formulario se solicita la emisión del certificado obteniendo el certificado y la clave privada generada en formato PEM. Esta clave privada no se almacena debe ser descargada y custodiada por el usuario ya que no se podrá volver a obtener.

**Emisión a partir de un CSR generado de manera externa**

Mediante esta opción se podrá realizar la emisión de certificados a partir de CSRs que hayan sido generados de manera externa. Para ello en el selector de modo del formulario de emisión es necesario seleccionar “Upload Existing CSR”.

Se debe proporcionar un CSR válido que contenga los detalles del certificado a emitir, Subject Name, SANs,..

Adicionalmente se proporcionará la duración deseada para el certificado y los usos permitidos. Con esta información se procederá a la emisión como se describe en el apartado anterior.

Revocación de CAs y certificados [#revocación-de-cas-y-certificados]

La revocación de una Autoridad de Certificación (CA) es una acción crítica que invalida todos los certificados emitidos por esa CA, lo que puede causar interrupciones generalizadas en los dispositivos y servicios que confían en ella. Este proceso es irreversible y debe realizarse con extrema precaución.

Para iniciar el proceso, entra en la sección de Autoridades de Certificación y localiza la CA deseada usando los filtros por **Nombre**, **Estado** y **Tipo**.

Accede a la ficha de detalle de la CA. Allí se muestran la información general, los certificados PEM, los metadatos y los certificados emitidos, además del botón **Revoke CA**.

Al pulsar **Revoke CA** se abre una ventana de confirmación con una advertencia sobre el impacto de la acción. En ese cuadro hay que seleccionar una **Razón de Revocación**. Las opciones incluyen:

* Unspecified (No especificado)
* KeyCompromise (Compromiso de clave)
* CACompromise (Compromiso de CA)
* AffiliationChanged (Afiliación cambiada)
* Superseded (Sustituida)
* CessationOfOperation (Cese de operación)
* CertificateHold (Retención de certificado)
* RemoveFromCRL (Eliminar de la CRL)

Para evitar revocaciones accidentales, el sistema pedirá confirmar el nombre de la CA. En el campo de texto, escribe el **nombre exacto de la CA** que estás revocando. Una vez introducido correctamente, se habilitará el botón **Confirm Revocation**.

Haz clic en el botón **Confirm Revocation**. Una vez completada la revocación, la CA cambiará su estado a **REVOKED** (Revocada) en la página de detalles, y ya no podrás emitir certificados nuevos con ella. En su lugar, verás la opción **Permanently Delete** (Eliminar Permanentemente).

Consideraciones importantes:

* Impacto: La revocación de una CA es una acción irreversible que afectará a todos los dispositivos y servicios que dependen de ella. Asegúrate de comprender completamente las implicaciones antes de proceder.
* Eliminación Permanente: Después de la revocación, tendrás la opción de eliminar permanentemente la CA. Esta acción eliminará la CA del sistema de Lamassu IoT.
`,r={title:"[CA] Gestión de Entidades de Confianza",description:"Creación y gestión de Autoridades de Certificación en Lamassu IoT"},o={contents:[{heading:"creación-de-entidades-de-certificación",content:"Para acceder a la creación de nuevas entidades certificación se debe acceder la opción de entidades de certificación del menú lateral y luego seleccionar la acción de creación de nueva CA."},{heading:"creación-de-entidades-de-certificación",content:"Actualmente hay disponibles 3 acciones:"},{heading:"creación-de-entidades-de-certificación",content:"**Creación de una nueva autoridad de certificación**, esta acción generará un nuevo par de claves para soportar la nueva autoridad de certificación."},{heading:"creación-de-entidades-de-certificación",content:"**Importar una nueva autoridad de certificación generada externamente**, permite importar en Lamassu una autoridad de certificación, cuyo par de claves ha sido generado de manera externa."},{heading:"creación-de-entidades-de-certificación",content:"**Importar un certificado de autoridad de certificación sin clave privada**, en este caso se importa la CA para poder usarla en procesos de validación y no como fuente de nuevos certificados gestionados por Lamassu."},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"La creación de una Autoridad de Certificación (CA) es un proceso fundamental en el establecimiento de una infraestructura de clave pública (PKI). Lamassu IoT permite provisionar tanto autoridades raíz como intermedias mediante la generación automática de pares de claves criptográficas que son gestionados de forma segura por el sistema integrado de gestión de claves."},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"En el formulario de creación se definen los siguientes bloques de configuración."},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Motor criptográfico**"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Selector:** Desplegable con motores disponibles, ofrece los configurados en el sistema."},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Ejemplo mostrado:** go1.24.3"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Función:** Permite seleccionar el motor criptográfico deseado"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Parámetros de clave**"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Key Type:** RSA / EC (Elliptic Curve)"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Key Size:**"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"RSA: 1024, 2048, 3072, 4096 bits"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"EC: P-256, P-384, P-521"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Recomendado:** EC P-384"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Perfil de emisión del certificado de la CA**"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Aquí se puede seleccionar un perfil existente o definir uno en línea para la operación. Ese perfil permite especificar la duración de la CA que se está creando y los `Key Usage` y `Extended Key Usage` del certificado de soporte."},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Si no se proporciona ningún perfil se aplicará uno por defecto con los usos de clave básicos."},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Configuración de la CA**"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Tipo de CA**"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Root CA:** Autoridad raíz autofirmada"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Intermediate CA:** Autoridad subordinada"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Emisor**"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Root CA:** Self-signed (auto-firmada)"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Intermediate CA:** Selector desplegable de CA superior disponible"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Permite seleccionar la CA padre que firmará la nueva CA intermedia"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Identificación**"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**CA ID:** Generado automáticamente (formato UUID),no puede ser modificado. Estos IDs los gestiona el sistema."},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Ejemplo: 8f7c170-c84e-4c08-904f-8d3247c77fc2"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**CA Name:** Nombre descriptivo (obligatorio)"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Ejemplo: Lamassu IoT Secure Services CA"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Subject Distinguished Name (DN)**"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Campos opcionales:"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Country (C):** Código país ISO 3166-1 (2 letras)"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Ejemplo: US, ES, DE"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**State/Province (ST):** Estado o provincia"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Ejemplo: California, Madrid"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Locality (L):** Ciudad o localidad"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Ejemplo: San Francisco, Arrasate"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Organization (O):** Nombre de la organización"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Ejemplo: Lamassu IoT Corp"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Organizational Unit (OU):** Unidad organizacional"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Ejemplo: Secure Devices Division"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:'El "Certification Authority Name" configurado se utilizará como Common Name (CN) del subject del certificado de la CA.'},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:`**Configuración de expiración**
La configuración de expiración define la validez temporal tanto del certificado de la propia CA como de los certificados que ésta emitirá por defecto. Si se ha seleccionado un perfil se dará prioridad al dato proporcionado en el perfil.`},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Para el certificado de la CA (`CA Certificate Expiration`):"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Función:** Establece la duración de validez del certificado de la Autoridad de Certificación"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Implicación:** Una vez expirado, la CA no podrá emitir nuevos certificados válidos"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Duración:** Configurable según necesidades organizacionales"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Valor por defecto:** 10 años (10y)"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Consideración:** Debe ser mayor que la duración de los certificados que emitirá"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"La expiración de la CA se puede definir como un expresión de duración, fijar una fecha fija, o marcarla como indefinida, lo que en términos prácticos permitirá la emisión de una CA sin caducidad."},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"En el caso de expresar una duración, las unidades permitidas son: y (años), w (semanas), d (días), h (horas), m (minutos) y s (segundos), pudiendo componer expresiones como la siguiente: *5y 8w 4d 2h 1m 2s*"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"En caso de elegir la opción de fecha específica, se ofrecerá un calendario para seleccionar la fecha de caducidad."},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Para el caso de indefinido, se fijará la fecha de expiración máxima permitida."},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Para la expiración por defecto de certificados finales (`Default End-Entity Certificate Issuance Expiration`):"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Función:** Define la duración predeterminada para certificados emitidos por esta CA"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Aplicación:** Se aplica automáticamente a nuevos certificados si no se especifica otra duración"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Flexibilidad:** Puede ser modificada individualmente al emitir cada certificado"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"**Valor por defecto:** 1 año (1y)"},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Se expresa en los mismos términos que la caducidad de la CA."},{heading:"creación-de-una-nueva-autoridad-de-certificación",content:"Una vez creada la CA debe ser visible en el listado de CAs del sistema."},{heading:"creación-de-cas-a-partir-de-claves-del-kms",content:"Lamassu IoT permite la creación de CAs a partir de claves previamente generadas o importadas en el servicio KMS. Una vez seleccionada la opción &#x2A;*Create New CA (Existing Key)** se muestra el formulario de creación de CAs con los siguientes elementos diferenciales respecto a la creación de la CA a partir de un nuevo par de claves descrito en el punto anterior."},{heading:"creación-de-cas-a-partir-de-claves-del-kms",content:"En este caso, primero se solicita la selección de la clave de soporte para esta nueva CA."},{heading:"creación-de-cas-a-partir-de-claves-del-kms",content:"Se abre un popup que permite al usuario seleccionar la clave deseada de entre las disponibles en el KMS. Una vez seleccionada la clave, el proceso continúa como se describe en el punto anterior."},{heading:"importación-de-autoridades-de-certificación",content:"La importación de entidades de certificación permite importar en el sistema una CA que ha sido generada de manera externa. Para ello se sigue el siguiente proceso:"},{heading:"importación-de-autoridades-de-certificación",content:"Se debe seleccionar el motor que gestionará el par de claves importado."},{heading:"importación-de-autoridades-de-certificación",content:"**Selector:** Desplegable con motores disponibles, ofrece los configurados en el sistema."},{heading:"importación-de-autoridades-de-certificación",content:"**Ejemplo mostrado:** go1.24.3"},{heading:"importación-de-autoridades-de-certificación",content:"**Función:** Permite seleccionar el motor criptográfico deseado"},{heading:"importación-de-autoridades-de-certificación",content:"También se define la expiración por defecto de certificados finales (`Default End-Entity Certificate Issuance Expiration`):"},{heading:"importación-de-autoridades-de-certificación",content:"**Función:** Define la duración predeterminada para certificados emitidos por esta CA"},{heading:"importación-de-autoridades-de-certificación",content:"**Aplicación:** Se aplica automáticamente a nuevos certificados si no se especifica otra duración"},{heading:"importación-de-autoridades-de-certificación",content:"**Flexibilidad:** Puede ser modificada individualmente al emitir cada certificado"},{heading:"importación-de-autoridades-de-certificación",content:"**Valor por defecto:** 1 año (1y)"},{heading:"importación-de-autoridades-de-certificación",content:"Se expresa en los mismos términos que la caducidad de la CA."},{heading:"importación-de-autoridades-de-certificación",content:"Se debe proporcionar de manera obligatoria:"},{heading:"importación-de-autoridades-de-certificación",content:"Certificado de la CA en formato PEM. Se comprueba que el certificado importado corresponda con el de una CA."},{heading:"importación-de-autoridades-de-certificación",content:"Clave privada de la CA en formato PEM"},{heading:"importación-de-autoridades-de-certificación",content:"De manera opcional se proporcionarán en formato PEM la cadena de certificados de la cadena de validación en caso de importar una CA subordinada."},{heading:"visualización-de-autoridades-de-certificación",content:"Accediendo a la sección de autoridades de certificación se mostrará el listado de CAs registradas en el sistema. El listado permitirá el filtro mediante el nombre de la CA, el estado o el tipo de CA."},{heading:"visualización-de-autoridades-de-certificación",content:"La acción de ver detalles da acceso a los detalles de la CA y a diferentes opciones de gestión."},{heading:"visualización-de-autoridades-de-certificación",content:"En los detalles se muestra el resumen del estado de los certificados emitidos por la CA: certificados activos, expirados y revocados."},{heading:"visualización-de-autoridades-de-certificación",content:"Se ofrecen dos acciones:"},{heading:"visualización-de-autoridades-de-certificación",content:"la descarga de la CRL vinculada a la CA que permitirá a otros sistemas realizar comprobaciones de vigencia de los certificados emitidos por la CA de manera desconectada."},{heading:"visualización-de-autoridades-de-certificación",content:"la acción de revocación de la CA"},{heading:"visualización-de-autoridades-de-certificación",content:"Se muestra información detallada, el certificado en formato PEM y se da acceso a la relación de certificados emitidos por la CA a través de la pestaña “Issued Certificates”"},{heading:"emisión-de-certificados",content:"La acción de emisión de certificados se puede realizar desde la pestaña “Issued Certificates” de los detalles de la CA, mediante la acción “Issue New”."},{heading:"emisión-de-certificados",content:"La funcionalidad de emisión es accesible también desde el listado de CAs mediante la acción correspondiente de emisión."},{heading:"emisión-de-certificados",content:"Y desde la funcionalidad  listado completo de certificados emitidos por Lamassu mediante la acción “Issue Certificate”"},{heading:"emisión-de-certificados",content:"En este caso se solicitará la selección de una CA antes de acceder al formulario de emisión."},{heading:"emisión-de-certificados",content:"El formulario de emisión de certificados ofrece 2 opciones para la emisión:"},{heading:"emisión-de-certificados",content:"Emisión a partir de una clave privada y el CSR generado en el browser"},{heading:"emisión-de-certificados",content:"Emisión a partir de un CSR generado de manera externa"},{heading:"emisión-de-certificados",content:"**Emisión a partir de una clave privada y el CSR generados en el browser**"},{heading:"emisión-de-certificados",content:"El usuario proporciona la información requerida para la creación del CSR, la consola genera una clave In Place y genera el CSR correspondiente mediante el cual se solicita la emisión del certificado a la CA."},{heading:"emisión-de-certificados",content:'**Método de emisión:** Seleccionar  "Generate Key & CSR in Browser" para la generación del par de claves y la solicitud de certificado (CSR) directamente en el navegador'},{heading:"emisión-de-certificados",content:"**Certificate Subject (Sujeto del certificado)**"},{heading:"emisión-de-certificados",content:"**Common Name (CN)**"},{heading:"emisión-de-certificados",content:"**Campo:** Obligatorio"},{heading:"emisión-de-certificados",content:"**Función:** Identifica de forma única al titular del certificado"},{heading:"emisión-de-certificados",content:"**Ejemplos:**"},{heading:"emisión-de-certificados",content:"Para dispositivos: device001.company.com"},{heading:"emisión-de-certificados",content:"Para usuarios: john.doe\\@company.com"},{heading:"emisión-de-certificados",content:"Para servicios: api.service.company.com"},{heading:"emisión-de-certificados",content:"**Campos Organizacionales**"},{heading:"emisión-de-certificados",content:"**Organizational Unit (OU):** Unidad organizacional del titular"},{heading:"emisión-de-certificados",content:"Ejemplo: IT Department, Manufacturing"},{heading:"emisión-de-certificados",content:"**Organization (O):** Nombre de la organización"},{heading:"emisión-de-certificados",content:"Ejemplo: LamassuIoT Corp, Acme Industries"},{heading:"emisión-de-certificados",content:"**Información Geográfica**"},{heading:"emisión-de-certificados",content:"**Locality (L):** Ciudad o localidad del titular"},{heading:"emisión-de-certificados",content:"**State/Province (ST):** Estado o provincia"},{heading:"emisión-de-certificados",content:"**Country (C):** Código de país ISO 3166-1 (2 letras)"},{heading:"emisión-de-certificados",content:"Valor por defecto mostrado: US"},{heading:"emisión-de-certificados",content:`**Subject Alternative Names (SANs)**
Los SANs proporcionan identificadores alternativos para el certificado, permitiendo que un mismo certificado sea válido para múltiples nombres o direcciones.`},{heading:"emisión-de-certificados",content:"**Tipos de SAN Disponibles**"},{heading:"emisión-de-certificados",content:"**DNS:** Nombres de dominio"},{heading:"emisión-de-certificados",content:"Ejemplo: example.com, \\*.example.com"},{heading:"emisión-de-certificados",content:"**IP Address:** Direcciones IP"},{heading:"emisión-de-certificados",content:"**Email:** Direcciones de correo electrónico"},{heading:"emisión-de-certificados",content:"**URI:** Identificadores de recursos uniformes"},{heading:"emisión-de-certificados",content:"Es posible añadir múltiples SAN de cada tipo, se selecciona el tipo, añadiendo el valor y pulsando la acción “Add”."},{heading:"emisión-de-certificados",content:`**Key Generation Details (Detalles de generación de claves)**
Se debe especificar el tipo de clave a ser generada para la solicitud del certificado.`},{heading:"emisión-de-certificados",content:"**Algorithm (Algoritmo)**"},{heading:"emisión-de-certificados",content:"**ECDSA:** Algoritmo de curva elíptica, se debe especificar la curva a utilizar"},{heading:"emisión-de-certificados",content:"**RSA:** Algoritmo RSA tradicional, se debe indicar el tamaño de clave"},{heading:"emisión-de-certificados",content:"**Certificate Configuration (Configuración del certificado)**"},{heading:"emisión-de-certificados",content:"**Validity Duration (Duración de validez)**"},{heading:"emisión-de-certificados",content:"Indica la fecha de expiración del certificado a emitir como una expresión de duración"},{heading:"emisión-de-certificados",content:"**Campo:** Configurable según necesidades"},{heading:"emisión-de-certificados",content:"**Valor por defecto:** 1 año (1y)"},{heading:"emisión-de-certificados",content:"**Unidades válidas:** y (años), w (semanas), d (días), h (horas), m (minutos), s (segundos)"},{heading:"emisión-de-certificados",content:"**Consideración:** No puede exceder la validez de la CA emisora"},{heading:"emisión-de-certificados",content:`**Key Usage (Uso de claves)**
Define los propósitos criptográficos para los que puede utilizarse la clave privada del certificado.`},{heading:"emisión-de-certificados",content:"**Usos Básicos**"},{heading:"emisión-de-certificados",content:"**Digital Signature:** ✓ (marcado por defecto) - Firmas digitales"},{heading:"emisión-de-certificados",content:"**Content Commitment (Non-Repudiation):** No repudio"},{heading:"emisión-de-certificados",content:"**Key Encipherment:** Cifrado de claves"},{heading:"emisión-de-certificados",content:"**Data Encipherment:** Cifrado de datos"},{heading:"emisión-de-certificados",content:"**Key Agreement:** Acuerdo de claves"},{heading:"emisión-de-certificados",content:"**Certificate Signing:** Firma de certificados"},{heading:"emisión-de-certificados",content:"**CRL Signing:** Firma de listas de revocación"},{heading:"emisión-de-certificados",content:"**Encipher Only:** Solo cifrado"},{heading:"emisión-de-certificados",content:"**Decipher Only:** Solo descifrado"},{heading:"emisión-de-certificados",content:"**Uso Extendido de Claves**"},{heading:"emisión-de-certificados",content:"Especifica aplicaciones específicas para las que está autorizado el certificado."},{heading:"emisión-de-certificados",content:"**Server Authentication:** ✓ (marcado por defecto) - Autenticación de servidor"},{heading:"emisión-de-certificados",content:"**Client Authentication:** ✓ (marcado por defecto) - Autenticación de cliente"},{heading:"emisión-de-certificados",content:"**Code Signing:** Firma de código"},{heading:"emisión-de-certificados",content:"**Email Protection:** Protección de correo electrónico"},{heading:"emisión-de-certificados",content:"**Time Stamping:** Sellado de tiempo"},{heading:"emisión-de-certificados",content:"**OCSP Signing:** Firma de respuestas OCSP"},{heading:"emisión-de-certificados",content:"Una vez completado los campos del formulario se solicita la emisión del certificado obteniendo el certificado y la clave privada generada en formato PEM. Esta clave privada no se almacena debe ser descargada y custodiada por el usuario ya que no se podrá volver a obtener."},{heading:"emisión-de-certificados",content:"**Emisión a partir de un CSR generado de manera externa**"},{heading:"emisión-de-certificados",content:"Mediante esta opción se podrá realizar la emisión de certificados a partir de CSRs que hayan sido generados de manera externa. Para ello en el selector de modo del formulario de emisión es necesario seleccionar “Upload Existing CSR”."},{heading:"emisión-de-certificados",content:"Se debe proporcionar un CSR válido que contenga los detalles del certificado a emitir, Subject Name, SANs,.."},{heading:"emisión-de-certificados",content:"Adicionalmente se proporcionará la duración deseada para el certificado y los usos permitidos. Con esta información se procederá a la emisión como se describe en el apartado anterior."},{heading:"revocación-de-cas-y-certificados",content:"La revocación de una Autoridad de Certificación (CA) es una acción crítica que invalida todos los certificados emitidos por esa CA, lo que puede causar interrupciones generalizadas en los dispositivos y servicios que confían en ella. Este proceso es irreversible y debe realizarse con extrema precaución."},{heading:"revocación-de-cas-y-certificados",content:"Para iniciar el proceso, entra en la sección de Autoridades de Certificación y localiza la CA deseada usando los filtros por **Nombre**, **Estado** y **Tipo**."},{heading:"revocación-de-cas-y-certificados",content:"Accede a la ficha de detalle de la CA. Allí se muestran la información general, los certificados PEM, los metadatos y los certificados emitidos, además del botón **Revoke CA**."},{heading:"revocación-de-cas-y-certificados",content:"Al pulsar **Revoke CA** se abre una ventana de confirmación con una advertencia sobre el impacto de la acción. En ese cuadro hay que seleccionar una **Razón de Revocación**. Las opciones incluyen:"},{heading:"revocación-de-cas-y-certificados",content:"Unspecified (No especificado)"},{heading:"revocación-de-cas-y-certificados",content:"KeyCompromise (Compromiso de clave)"},{heading:"revocación-de-cas-y-certificados",content:"CACompromise (Compromiso de CA)"},{heading:"revocación-de-cas-y-certificados",content:"AffiliationChanged (Afiliación cambiada)"},{heading:"revocación-de-cas-y-certificados",content:"Superseded (Sustituida)"},{heading:"revocación-de-cas-y-certificados",content:"CessationOfOperation (Cese de operación)"},{heading:"revocación-de-cas-y-certificados",content:"CertificateHold (Retención de certificado)"},{heading:"revocación-de-cas-y-certificados",content:"RemoveFromCRL (Eliminar de la CRL)"},{heading:"revocación-de-cas-y-certificados",content:"Para evitar revocaciones accidentales, el sistema pedirá confirmar el nombre de la CA. En el campo de texto, escribe el **nombre exacto de la CA** que estás revocando. Una vez introducido correctamente, se habilitará el botón **Confirm Revocation**."},{heading:"revocación-de-cas-y-certificados",content:"Haz clic en el botón **Confirm Revocation**. Una vez completada la revocación, la CA cambiará su estado a **REVOKED** (Revocada) en la página de detalles, y ya no podrás emitir certificados nuevos con ella. En su lugar, verás la opción **Permanently Delete** (Eliminar Permanentemente)."},{heading:"revocación-de-cas-y-certificados",content:"Consideraciones importantes:"},{heading:"revocación-de-cas-y-certificados",content:"Impacto: La revocación de una CA es una acción irreversible que afectará a todos los dispositivos y servicios que dependen de ella. Asegúrate de comprender completamente las implicaciones antes de proceder."},{heading:"revocación-de-cas-y-certificados",content:"Eliminación Permanente: Después de la revocación, tendrás la opción de eliminar permanentemente la CA. Esta acción eliminará la CA del sistema de Lamassu IoT."}],headings:[{id:"gestión-de-entidades-de-confianza",content:"Gestión de entidades de confianza"},{id:"creación-de-entidades-de-certificación",content:"Creación de entidades de certificación"},{id:"creación-de-una-nueva-autoridad-de-certificación",content:"Creación de una nueva autoridad de certificación"},{id:"creación-de-cas-a-partir-de-claves-del-kms",content:"Creación de CAs a partir de claves del KMS"},{id:"importación-de-autoridades-de-certificación",content:"Importación de autoridades de certificación"},{id:"operando-con-entidades-de-confianza",content:"Operando con entidades de confianza"},{id:"visualización-de-autoridades-de-certificación",content:"Visualización de autoridades de certificación"},{id:"emisión-de-certificados",content:"Emisión de certificados"},{id:"revocación-de-cas-y-certificados",content:"Revocación de CAs y certificados"}]};const s=[{depth:1,url:"#gestión-de-entidades-de-confianza",title:e.jsx(e.Fragment,{children:"Gestión de entidades de confianza"})},{depth:2,url:"#creación-de-entidades-de-certificación",title:e.jsx(e.Fragment,{children:"Creación de entidades de certificación"})},{depth:2,url:"#creación-de-una-nueva-autoridad-de-certificación",title:e.jsx(e.Fragment,{children:"Creación de una nueva autoridad de certificación"})},{depth:2,url:"#creación-de-cas-a-partir-de-claves-del-kms",title:e.jsx(e.Fragment,{children:"Creación de CAs a partir de claves del KMS"})},{depth:2,url:"#importación-de-autoridades-de-certificación",title:e.jsx(e.Fragment,{children:"Importación de autoridades de certificación"})},{depth:2,url:"#operando-con-entidades-de-confianza",title:e.jsx(e.Fragment,{children:"Operando con entidades de confianza"})},{depth:3,url:"#visualización-de-autoridades-de-certificación",title:e.jsx(e.Fragment,{children:"Visualización de autoridades de certificación"})},{depth:3,url:"#emisión-de-certificados",title:e.jsx(e.Fragment,{children:"Emisión de certificados"})},{depth:3,url:"#revocación-de-cas-y-certificados",title:e.jsx(e.Fragment,{children:"Revocación de CAs y certificados"})}];function n(a){const i={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...a.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h1,{id:"gestión-de-entidades-de-confianza",children:"Gestión de entidades de confianza"}),`
`,e.jsx(i.h2,{id:"creación-de-entidades-de-certificación",children:"Creación de entidades de certificación"}),`
`,e.jsx(i.p,{children:"Para acceder a la creación de nuevas entidades certificación se debe acceder la opción de entidades de certificación del menú lateral y luego seleccionar la acción de creación de nueva CA."}),`
`,e.jsx(i.p,{children:"Actualmente hay disponibles 3 acciones:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Creación de una nueva autoridad de certificación"}),", esta acción generará un nuevo par de claves para soportar la nueva autoridad de certificación."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Importar una nueva autoridad de certificación generada externamente"}),", permite importar en Lamassu una autoridad de certificación, cuyo par de claves ha sido generado de manera externa."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Importar un certificado de autoridad de certificación sin clave privada"}),", en este caso se importa la CA para poder usarla en procesos de validación y no como fuente de nuevos certificados gestionados por Lamassu."]}),`
`]}),`
`,e.jsx(i.h2,{id:"creación-de-una-nueva-autoridad-de-certificación",children:"Creación de una nueva autoridad de certificación"}),`
`,e.jsx(i.p,{children:"La creación de una Autoridad de Certificación (CA) es un proceso fundamental en el establecimiento de una infraestructura de clave pública (PKI). Lamassu IoT permite provisionar tanto autoridades raíz como intermedias mediante la generación automática de pares de claves criptográficas que son gestionados de forma segura por el sistema integrado de gestión de claves."}),`
`,e.jsx(i.p,{children:"En el formulario de creación se definen los siguientes bloques de configuración."}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Motor criptográfico"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Selector:"})," Desplegable con motores disponibles, ofrece los configurados en el sistema."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Ejemplo mostrado:"})," go1.24.3"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Función:"})," Permite seleccionar el motor criptográfico deseado"]}),`
`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Parámetros de clave"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Key Type:"})," RSA / EC (Elliptic Curve)"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Key Size:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"RSA: 1024, 2048, 3072, 4096 bits"}),`
`,e.jsx(i.li,{children:"EC: P-256, P-384, P-521"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Recomendado:"})," EC P-384"]}),`
`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Perfil de emisión del certificado de la CA"})}),`
`,e.jsxs(i.p,{children:["Aquí se puede seleccionar un perfil existente o definir uno en línea para la operación. Ese perfil permite especificar la duración de la CA que se está creando y los ",e.jsx(i.code,{children:"Key Usage"})," y ",e.jsx(i.code,{children:"Extended Key Usage"})," del certificado de soporte."]}),`
`,e.jsx(i.p,{children:"Si no se proporciona ningún perfil se aplicará uno por defecto con los usos de clave básicos."}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Configuración de la CA"})}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Tipo de CA"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Root CA:"})," Autoridad raíz autofirmada"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Intermediate CA:"})," Autoridad subordinada"]}),`
`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Emisor"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Root CA:"})," Self-signed (auto-firmada)"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Intermediate CA:"})," Selector desplegable de CA superior disponible",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Permite seleccionar la CA padre que firmará la nueva CA intermedia"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Identificación"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"CA ID:"})," Generado automáticamente (formato UUID),no puede ser modificado. Estos IDs los gestiona el sistema.",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Ejemplo: 8f7c170-c84e-4c08-904f-8d3247c77fc2"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"CA Name:"})," Nombre descriptivo (obligatorio)",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Ejemplo: Lamassu IoT Secure Services CA"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Subject Distinguished Name (DN)"})}),`
`,e.jsx(i.p,{children:"Campos opcionales:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Country (C):"})," Código país ISO 3166-1 (2 letras)",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Ejemplo: US, ES, DE"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"State/Province (ST):"})," Estado o provincia",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Ejemplo: California, Madrid"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Locality (L):"})," Ciudad o localidad",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Ejemplo: San Francisco, Arrasate"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Organization (O):"})," Nombre de la organización",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Ejemplo: Lamassu IoT Corp"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Organizational Unit (OU):"})," Unidad organizacional",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Ejemplo: Secure Devices Division"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(i.p,{children:'El "Certification Authority Name" configurado se utilizará como Common Name (CN) del subject del certificado de la CA.'}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Configuración de expiración"}),`
La configuración de expiración define la validez temporal tanto del certificado de la propia CA como de los certificados que ésta emitirá por defecto. Si se ha seleccionado un perfil se dará prioridad al dato proporcionado en el perfil.`]}),`
`,e.jsxs(i.p,{children:["Para el certificado de la CA (",e.jsx(i.code,{children:"CA Certificate Expiration"}),"):"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Función:"})," Establece la duración de validez del certificado de la Autoridad de Certificación"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Implicación:"})," Una vez expirado, la CA no podrá emitir nuevos certificados válidos"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Duración:"})," Configurable según necesidades organizacionales"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Valor por defecto:"})," 10 años (10y)"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Consideración:"})," Debe ser mayor que la duración de los certificados que emitirá"]}),`
`]}),`
`,e.jsx(i.p,{children:"La expiración de la CA se puede definir como un expresión de duración, fijar una fecha fija, o marcarla como indefinida, lo que en términos prácticos permitirá la emisión de una CA sin caducidad."}),`
`,e.jsxs(i.p,{children:["En el caso de expresar una duración, las unidades permitidas son: y (años), w (semanas), d (días), h (horas), m (minutos) y s (segundos), pudiendo componer expresiones como la siguiente: ",e.jsx(i.em,{children:"5y 8w 4d 2h 1m 2s"})]}),`
`,e.jsx(i.p,{children:"En caso de elegir la opción de fecha específica, se ofrecerá un calendario para seleccionar la fecha de caducidad."}),`
`,e.jsx(i.p,{children:"Para el caso de indefinido, se fijará la fecha de expiración máxima permitida."}),`
`,e.jsxs(i.p,{children:["Para la expiración por defecto de certificados finales (",e.jsx(i.code,{children:"Default End-Entity Certificate Issuance Expiration"}),"):"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Función:"})," Define la duración predeterminada para certificados emitidos por esta CA"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Aplicación:"})," Se aplica automáticamente a nuevos certificados si no se especifica otra duración"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Flexibilidad:"})," Puede ser modificada individualmente al emitir cada certificado"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Valor por defecto:"})," 1 año (1y)"]}),`
`]}),`
`,e.jsx(i.p,{children:"Se expresa en los mismos términos que la caducidad de la CA."}),`
`,e.jsx(i.p,{children:"Una vez creada la CA debe ser visible en el listado de CAs del sistema."}),`
`,e.jsx(i.h2,{id:"creación-de-cas-a-partir-de-claves-del-kms",children:"Creación de CAs a partir de claves del KMS"}),`
`,e.jsxs(i.p,{children:["Lamassu IoT permite la creación de CAs a partir de claves previamente generadas o importadas en el servicio KMS. Una vez seleccionada la opción ",e.jsx(i.strong,{children:"Create New CA (Existing Key)"})," se muestra el formulario de creación de CAs con los siguientes elementos diferenciales respecto a la creación de la CA a partir de un nuevo par de claves descrito en el punto anterior."]}),`
`,e.jsx(i.p,{children:"En este caso, primero se solicita la selección de la clave de soporte para esta nueva CA."}),`
`,e.jsx(i.p,{children:"Se abre un popup que permite al usuario seleccionar la clave deseada de entre las disponibles en el KMS. Una vez seleccionada la clave, el proceso continúa como se describe en el punto anterior."}),`
`,e.jsx(i.h2,{id:"importación-de-autoridades-de-certificación",children:"Importación de autoridades de certificación"}),`
`,e.jsx(i.p,{children:"La importación de entidades de certificación permite importar en el sistema una CA que ha sido generada de manera externa. Para ello se sigue el siguiente proceso:"}),`
`,e.jsx(i.p,{children:"Se debe seleccionar el motor que gestionará el par de claves importado."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Selector:"})," Desplegable con motores disponibles, ofrece los configurados en el sistema."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Ejemplo mostrado:"})," go1.24.3"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Función:"})," Permite seleccionar el motor criptográfico deseado"]}),`
`]}),`
`,e.jsxs(i.p,{children:["También se define la expiración por defecto de certificados finales (",e.jsx(i.code,{children:"Default End-Entity Certificate Issuance Expiration"}),"):"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Función:"})," Define la duración predeterminada para certificados emitidos por esta CA"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Aplicación:"})," Se aplica automáticamente a nuevos certificados si no se especifica otra duración"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Flexibilidad:"})," Puede ser modificada individualmente al emitir cada certificado"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Valor por defecto:"})," 1 año (1y)"]}),`
`]}),`
`,e.jsx(i.p,{children:"Se expresa en los mismos términos que la caducidad de la CA."}),`
`,e.jsx(i.p,{children:"Se debe proporcionar de manera obligatoria:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Certificado de la CA en formato PEM. Se comprueba que el certificado importado corresponda con el de una CA."}),`
`,e.jsx(i.li,{children:"Clave privada de la CA en formato PEM"}),`
`]}),`
`,e.jsx(i.p,{children:"De manera opcional se proporcionarán en formato PEM la cadena de certificados de la cadena de validación en caso de importar una CA subordinada."}),`
`,e.jsx(i.h2,{id:"operando-con-entidades-de-confianza",children:"Operando con entidades de confianza"}),`
`,e.jsx(i.h3,{id:"visualización-de-autoridades-de-certificación",children:"Visualización de autoridades de certificación"}),`
`,e.jsx(i.p,{children:"Accediendo a la sección de autoridades de certificación se mostrará el listado de CAs registradas en el sistema. El listado permitirá el filtro mediante el nombre de la CA, el estado o el tipo de CA."}),`
`,e.jsx(i.p,{children:"La acción de ver detalles da acceso a los detalles de la CA y a diferentes opciones de gestión."}),`
`,e.jsx(i.p,{children:"En los detalles se muestra el resumen del estado de los certificados emitidos por la CA: certificados activos, expirados y revocados."}),`
`,e.jsx(i.p,{children:"Se ofrecen dos acciones:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"la descarga de la CRL vinculada a la CA que permitirá a otros sistemas realizar comprobaciones de vigencia de los certificados emitidos por la CA de manera desconectada."}),`
`,e.jsx(i.li,{children:"la acción de revocación de la CA"}),`
`]}),`
`,e.jsx(i.p,{children:"Se muestra información detallada, el certificado en formato PEM y se da acceso a la relación de certificados emitidos por la CA a través de la pestaña “Issued Certificates”"}),`
`,e.jsx(i.h3,{id:"emisión-de-certificados",children:"Emisión de certificados"}),`
`,e.jsx(i.p,{children:"La acción de emisión de certificados se puede realizar desde la pestaña “Issued Certificates” de los detalles de la CA, mediante la acción “Issue New”."}),`
`,e.jsx(i.p,{children:"La funcionalidad de emisión es accesible también desde el listado de CAs mediante la acción correspondiente de emisión."}),`
`,e.jsx(i.p,{children:"Y desde la funcionalidad  listado completo de certificados emitidos por Lamassu mediante la acción “Issue Certificate”"}),`
`,e.jsx(i.p,{children:"En este caso se solicitará la selección de una CA antes de acceder al formulario de emisión."}),`
`,e.jsx(i.p,{children:"El formulario de emisión de certificados ofrece 2 opciones para la emisión:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Emisión a partir de una clave privada y el CSR generado en el browser"}),`
`,e.jsx(i.li,{children:"Emisión a partir de un CSR generado de manera externa"}),`
`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Emisión a partir de una clave privada y el CSR generados en el browser"})}),`
`,e.jsx(i.p,{children:"El usuario proporciona la información requerida para la creación del CSR, la consola genera una clave In Place y genera el CSR correspondiente mediante el cual se solicita la emisión del certificado a la CA."}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Método de emisión:"}),' Seleccionar  "Generate Key & CSR in Browser" para la generación del par de claves y la solicitud de certificado (CSR) directamente en el navegador']}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Certificate Subject (Sujeto del certificado)"})}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Common Name (CN)"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Campo:"})," Obligatorio"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Función:"})," Identifica de forma única al titular del certificado"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Ejemplos:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Para dispositivos: device001.company.com"}),`
`,e.jsxs(i.li,{children:["Para usuarios: ",e.jsx(i.a,{href:"mailto:john.doe@company.com",children:"john.doe@company.com"})]}),`
`,e.jsx(i.li,{children:"Para servicios: api.service.company.com"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Campos Organizacionales"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Organizational Unit (OU):"})," Unidad organizacional del titular",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Ejemplo: IT Department, Manufacturing"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Organization (O):"})," Nombre de la organización",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Ejemplo: LamassuIoT Corp, Acme Industries"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Información Geográfica"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Locality (L):"})," Ciudad o localidad del titular"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"State/Province (ST):"})," Estado o provincia"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Country (C):"})," Código de país ISO 3166-1 (2 letras)",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Valor por defecto mostrado: US"}),`
`]}),`
`]}),`
`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Subject Alternative Names (SANs)"}),`
Los SANs proporcionan identificadores alternativos para el certificado, permitiendo que un mismo certificado sea válido para múltiples nombres o direcciones.`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Tipos de SAN Disponibles"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"DNS:"})," Nombres de dominio",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Ejemplo: example.com, *.example.com"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"IP Address:"})," Direcciones IP"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Email:"})," Direcciones de correo electrónico"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"URI:"})," Identificadores de recursos uniformes"]}),`
`]}),`
`,e.jsx(i.p,{children:"Es posible añadir múltiples SAN de cada tipo, se selecciona el tipo, añadiendo el valor y pulsando la acción “Add”."}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Key Generation Details (Detalles de generación de claves)"}),`
Se debe especificar el tipo de clave a ser generada para la solicitud del certificado.`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Algorithm (Algoritmo)"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"ECDSA:"})," Algoritmo de curva elíptica, se debe especificar la curva a utilizar"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"RSA:"})," Algoritmo RSA tradicional, se debe indicar el tamaño de clave"]}),`
`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Certificate Configuration (Configuración del certificado)"})}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Validity Duration (Duración de validez)"})}),`
`,e.jsx(i.p,{children:"Indica la fecha de expiración del certificado a emitir como una expresión de duración"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Campo:"})," Configurable según necesidades"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Valor por defecto:"})," 1 año (1y)"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Unidades válidas:"})," y (años), w (semanas), d (días), h (horas), m (minutos), s (segundos)"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Consideración:"})," No puede exceder la validez de la CA emisora"]}),`
`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Key Usage (Uso de claves)"}),`
Define los propósitos criptográficos para los que puede utilizarse la clave privada del certificado.`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Usos Básicos"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Digital Signature:"})," ✓ (marcado por defecto) - Firmas digitales"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Content Commitment (Non-Repudiation):"})," No repudio"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Key Encipherment:"})," Cifrado de claves"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Data Encipherment:"})," Cifrado de datos"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Key Agreement:"})," Acuerdo de claves"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Certificate Signing:"})," Firma de certificados"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"CRL Signing:"})," Firma de listas de revocación"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Encipher Only:"})," Solo cifrado"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Decipher Only:"})," Solo descifrado"]}),`
`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Uso Extendido de Claves"})}),`
`,e.jsx(i.p,{children:"Especifica aplicaciones específicas para las que está autorizado el certificado."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Server Authentication:"})," ✓ (marcado por defecto) - Autenticación de servidor"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Client Authentication:"})," ✓ (marcado por defecto) - Autenticación de cliente"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Code Signing:"})," Firma de código"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Email Protection:"})," Protección de correo electrónico"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Time Stamping:"})," Sellado de tiempo"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"OCSP Signing:"})," Firma de respuestas OCSP"]}),`
`]}),`
`,e.jsx(i.p,{children:"Una vez completado los campos del formulario se solicita la emisión del certificado obteniendo el certificado y la clave privada generada en formato PEM. Esta clave privada no se almacena debe ser descargada y custodiada por el usuario ya que no se podrá volver a obtener."}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Emisión a partir de un CSR generado de manera externa"})}),`
`,e.jsx(i.p,{children:"Mediante esta opción se podrá realizar la emisión de certificados a partir de CSRs que hayan sido generados de manera externa. Para ello en el selector de modo del formulario de emisión es necesario seleccionar “Upload Existing CSR”."}),`
`,e.jsx(i.p,{children:"Se debe proporcionar un CSR válido que contenga los detalles del certificado a emitir, Subject Name, SANs,.."}),`
`,e.jsx(i.p,{children:"Adicionalmente se proporcionará la duración deseada para el certificado y los usos permitidos. Con esta información se procederá a la emisión como se describe en el apartado anterior."}),`
`,e.jsx(i.h3,{id:"revocación-de-cas-y-certificados",children:"Revocación de CAs y certificados"}),`
`,e.jsx(i.p,{children:"La revocación de una Autoridad de Certificación (CA) es una acción crítica que invalida todos los certificados emitidos por esa CA, lo que puede causar interrupciones generalizadas en los dispositivos y servicios que confían en ella. Este proceso es irreversible y debe realizarse con extrema precaución."}),`
`,e.jsxs(i.p,{children:["Para iniciar el proceso, entra en la sección de Autoridades de Certificación y localiza la CA deseada usando los filtros por ",e.jsx(i.strong,{children:"Nombre"}),", ",e.jsx(i.strong,{children:"Estado"})," y ",e.jsx(i.strong,{children:"Tipo"}),"."]}),`
`,e.jsxs(i.p,{children:["Accede a la ficha de detalle de la CA. Allí se muestran la información general, los certificados PEM, los metadatos y los certificados emitidos, además del botón ",e.jsx(i.strong,{children:"Revoke CA"}),"."]}),`
`,e.jsxs(i.p,{children:["Al pulsar ",e.jsx(i.strong,{children:"Revoke CA"})," se abre una ventana de confirmación con una advertencia sobre el impacto de la acción. En ese cuadro hay que seleccionar una ",e.jsx(i.strong,{children:"Razón de Revocación"}),". Las opciones incluyen:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Unspecified (No especificado)"}),`
`,e.jsx(i.li,{children:"KeyCompromise (Compromiso de clave)"}),`
`,e.jsx(i.li,{children:"CACompromise (Compromiso de CA)"}),`
`,e.jsx(i.li,{children:"AffiliationChanged (Afiliación cambiada)"}),`
`,e.jsx(i.li,{children:"Superseded (Sustituida)"}),`
`,e.jsx(i.li,{children:"CessationOfOperation (Cese de operación)"}),`
`,e.jsx(i.li,{children:"CertificateHold (Retención de certificado)"}),`
`,e.jsx(i.li,{children:"RemoveFromCRL (Eliminar de la CRL)"}),`
`]}),`
`,e.jsxs(i.p,{children:["Para evitar revocaciones accidentales, el sistema pedirá confirmar el nombre de la CA. En el campo de texto, escribe el ",e.jsx(i.strong,{children:"nombre exacto de la CA"})," que estás revocando. Una vez introducido correctamente, se habilitará el botón ",e.jsx(i.strong,{children:"Confirm Revocation"}),"."]}),`
`,e.jsxs(i.p,{children:["Haz clic en el botón ",e.jsx(i.strong,{children:"Confirm Revocation"}),". Una vez completada la revocación, la CA cambiará su estado a ",e.jsx(i.strong,{children:"REVOKED"})," (Revocada) en la página de detalles, y ya no podrás emitir certificados nuevos con ella. En su lugar, verás la opción ",e.jsx(i.strong,{children:"Permanently Delete"})," (Eliminar Permanentemente)."]}),`
`,e.jsx(i.p,{children:"Consideraciones importantes:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Impacto: La revocación de una CA es una acción irreversible que afectará a todos los dispositivos y servicios que dependen de ella. Asegúrate de comprender completamente las implicaciones antes de proceder."}),`
`,e.jsx(i.li,{children:"Eliminación Permanente: Después de la revocación, tendrás la opción de eliminar permanentemente la CA. Esta acción eliminará la CA del sistema de Lamassu IoT."}),`
`]})]})}function t(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(n,{...a})}):n(a)}export{d as _markdown,t as default,r as frontmatter,o as structuredData,s as toc};
