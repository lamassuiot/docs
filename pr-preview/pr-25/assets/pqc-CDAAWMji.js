import{j as e}from"./chunk-LFPYN7LY-rz7-nU66.js";let o=`

<div className="lm-diff-ins lm-diff-block">
  Criptografía post-cuántica (LamassuQ) [#criptografía-post-cuántica-lamassuq]
</div>

<div className="lm-diff-ins lm-diff-block">
  LamassuQ incorpora soporte de criptografía post-cuántica (PQC) a la plataforma: el servicio [KMS](/docs/manual/servicios-core/kms) puede generar e importar claves post-cuánticas, firmar y verificar con ellas, y el servicio de [CA](/docs/manual/servicios-core/cas) puede emitir certificados X.509 apoyados en estas claves, incluidas cadenas de certificación mixtas en las que conviven algoritmos clásicos y post-cuánticos.
</div>

<div className="lm-diff-ins lm-diff-block">
  El objetivo es preparar la PKI ante la amenaza de un computador cuántico suficiente para romper la criptografía asimétrica actual, manteniendo al mismo tiempo la compatibilidad con los algoritmos clásicos ya desplegados.
</div>

<div className="lm-diff-ins lm-diff-block">
  Qué aporta LamassuQ [#qué-aporta-lamassuq]
</div>

<div className="lm-diff-ins lm-diff-block">
  * **Nuevos algoritmos de firma** en el KMS: ML-DSA, SLH-DSA y firmas compuestas (*composite*) que combinan ML-DSA con RSA, ECDSA o Ed25519.
  * **Generación e importación de claves** post-cuánticas a través del flujo habitual de claves del KMS.
  * **Firma y verificación** con los nuevos algoritmos, sobre el mensaje en claro (*pure signing*).
  * **CAs post-cuánticas**: creación e importación de autoridades de certificación con claves ML-DSA, SLH-DSA o compuestas, y emisión de certificados a partir de ellas.
  * **Cadenas mixtas**: un motor X.509 puede firmar certificados cruzando familias de algoritmos (por ejemplo, una CA SLH-DSA que emite una hoja ECDSA, o una CA ECDSA que firma un CSR firmado con SLH-DSA).
</div>

<div className="lm-diff-ins lm-diff-block">
  Alcance y limitaciones [#alcance-y-limitaciones]
</div>

<div className="lm-diff-ins lm-diff-block">
  * La funcionalidad se expone a través de la **API REST y el SDK de Go**. Los ejemplos de esta página utilizan ambos canales.
  * El soporte PQC está disponible de forma completa en el **motor criptográfico software** (y en el motor File System, que delega en él). Consulte la [matriz de compatibilidad](#compatibilidad-con-motores-criptográficos) para conocer el estado del resto de motores.
  * Los algoritmos PQC de Lamassu son **algoritmos de firma**. No se ha añadido soporte de cifrado/encapsulación de claves (ML-KEM) ni mecanismos de cifrado post-cuántico.
  * LamassuQ se distribuye mediante **imágenes de contenedor específicas** y una **imagen de Go con soporte PQC**. Consulte la sección de [despliegue](#despliegue).
</div>

<div className="lm-diff-ins lm-diff-block">
  Algoritmos soportados [#algoritmos-soportados]
</div>

<div className="lm-diff-ins lm-diff-block">
  El KMS identifica cada tipo de clave con un valor de \`algorithm\` y un parámetro \`size\`. Los algoritmos añadidos por LamassuQ son los siguientes:
</div>

<div className="lm-diff-ins lm-diff-block">
  | Algoritmo (\`algorithm\`)    | Parámetros (\`size\`)           | Estándar                   | Descripción                                                                                          |
  | :------------------------- | :---------------------------- | :------------------------- | :--------------------------------------------------------------------------------------------------- |
  | \`ML-DSA\`                   | 44, 65, 87                    | FIPS 204 (ML-DSA-44/65/87) | Firma post-cuántica basada en retículos (*lattice*).                                                 |
  | \`SLH-DSA\`                  | 1–12 (conjunto de parámetros) | FIPS 205                   | Firma post-cuántica basada en hash (*stateless hash-based*), considerada el enfoque más conservador. |
  | \`Composite-ML-DSA-RSA\`     | variante 1–8                  | firma híbrida              | Combina ML-DSA con una firma RSA (RSA-PSS o RSA-PKCS#1 v1.5).                                        |
  | \`Composite-ML-DSA-ECDSA\`   | variante 9–13                 | firma híbrida              | Combina ML-DSA con una firma ECDSA.                                                                  |
  | \`Composite-ML-DSA-Ed25519\` | variante 14–15                | firma híbrida              | Combina ML-DSA con Ed25519.                                                                          |
  | \`Ed25519\`                  | 256 (fijo)                    | firma clásica              | Incluido en el mismo flujo de generación e importación.                                              |
</div>

<div className="lm-diff-ins lm-diff-block">
  Las firmas compuestas (*composite*) producen una única firma que valida contra las dos claves del par: la post-cuántica y la clásica. Son útiles durante la migración, cuando el verificador aún no soporta algoritmos PQC o se exige redundancia criptográfica.
</div>

<div className="lm-diff-ins lm-diff-block">
  Conjuntos de parámetros SLH-DSA [#conjuntos-de-parámetros-slh-dsa]
</div>

<div className="lm-diff-ins lm-diff-block">
  Para \`SLH-DSA\` el valor de \`size\` selecciona el conjunto de parámetros FIPS 205:
</div>

<div className="lm-diff-ins lm-diff-block">
  | \`size\` | Conjunto de parámetros |
  | :----- | :--------------------- |
  | 1      | SLH-DSA-SHA2-128s      |
  | 2      | SLH-DSA-SHA2-128f      |
  | 3      | SLH-DSA-SHA2-192s      |
  | 4      | SLH-DSA-SHA2-192f      |
  | 5      | SLH-DSA-SHA2-256s      |
  | 6      | SLH-DSA-SHA2-256f      |
  | 7      | SLH-DSA-SHAKE-128s     |
  | 8      | SLH-DSA-SHAKE-128f     |
  | 9      | SLH-DSA-SHAKE-192s     |
  | 10     | SLH-DSA-SHAKE-192f     |
  | 11     | SLH-DSA-SHAKE-256s     |
  | 12     | SLH-DSA-SHAKE-256f     |
</div>

<div className="lm-diff-ins lm-diff-block">
  Los conjuntos terminados en \`s\` (*small*) optimizan el tamaño de firma y los terminados en \`f\` (*fast*) la velocidad de firma.
</div>

<div className="lm-diff-ins lm-diff-block">
  Variantes compuestas [#variantes-compuestas]
</div>

<div className="lm-diff-ins lm-diff-block">
  Para las claves compuestas, el valor de \`size\` selecciona la variante dentro del registro de algoritmos compuestos de la librería criptográfica con la que se ha construido Lamassu (un *fork* con soporte PQC de la librería estándar de Go):
</div>

<div className="lm-diff-ins lm-diff-block">
  | Familia                    | Variantes admitidas | Composiciones disponibles                                                                                                                                                                                                                                       |
  | :------------------------- | :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | \`Composite-ML-DSA-RSA\`     | 1–8                 | MLDSA44\\_RSA2048\\_PSS\\_SHA256, MLDSA44\\_RSA2048\\_PKCS15\\_SHA256, MLDSA65\\_RSA3072\\_PSS\\_SHA512, MLDSA65\\_RSA3072\\_PKCS15\\_SHA512, MLDSA65\\_RSA4096\\_PSS\\_SHA512, MLDSA65\\_RSA4096\\_PKCS15\\_SHA512, MLDSA87\\_RSA3072\\_PSS\\_SHA512, MLDSA87\\_RSA4096\\_PSS\\_SHA512 |
  | \`Composite-ML-DSA-ECDSA\`   | 9–13                | MLDSA44\\_ECDSA\\_P256\\_SHA256, MLDSA65\\_ECDSA\\_P256\\_SHA512, MLDSA65\\_ECDSA\\_P384\\_SHA512, MLDSA87\\_ECDSA\\_P384\\_SHA512, MLDSA87\\_ECDSA\\_P521\\_SHA512                                                                                                            |
  | \`Composite-ML-DSA-Ed25519\` | 14–15               | MLDSA44\\_Ed25519\\_SHA512, MLDSA65\\_Ed25519\\_SHA512                                                                                                                                                                                                              |
</div>

<div className="lm-diff-ins lm-diff-block">
  La primera parte del nombre indica la variante ML-DSA (44, 65 o 87) y la segunda el algoritmo clásico que la acompaña. El algoritmo exacto asociado a cada variante queda reflejado en los metadatos de la clave y en los certificados que se emitan con ella.
</div>

<div className="lm-diff-ins lm-diff-block">
  Compatibilidad con motores criptográficos [#compatibilidad-con-motores-criptográficos]
</div>

<div className="lm-diff-ins lm-diff-block">
  Al crear o importar una clave, Lamassu comprueba que la especificación de clave (tipo y tamaño) esté declarada como soportada por el motor criptográfico seleccionado.
</div>

<div className="lm-diff-ins lm-diff-block">
  | Motor                  | Claves PQC en su catálogo | Crear / importar claves PQC | Firmar / verificar con PQC |
  | :--------------------- | :------------------------ | :-------------------------- | :------------------------- |
  | Software (Go)          | Sí                        | Sí                          | Sí                         |
  | File System            | Sí                        | Sí                          | Sí                         |
  | HashiCorp Vault KV2    | Sí\\*                      | No                          | Sí                         |
  | AWS Secrets Manager    | Sí\\*                      | No                          | Sí                         |
  | AWS KMS                | No                        | No                          | No                         |
  | Azure KeyVault         | No                        | No                          | No                         |
  | Azure KeyVault Secrets | No                        | No                          | No                         |
  | PKCS#11                | No                        | No                          | No                         |
</div>

<div className="lm-diff-ins lm-diff-block">
  El motor Software admite la matriz completa: RSA 1024–15360, ECDSA P-224/P-256/P-384/P-521, ML-DSA 44/65/87, SLH-DSA 1–12, compuestas 1–15 y Ed25519. El motor File System delega la generación, la importación y la firma en el motor software, por lo que hereda su soporte completo.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="warn" title="Motores con catálogo PQC pero sin generación ni importación">
    HashiCorp Vault KV2 y AWS Secrets Manager anuncian el mismo catálogo de tipos de clave que el motor software, por lo que las claves PQC **aparecen en sus listados**. Sin embargo, sus operaciones de generación e importación de claves PQC no están implementadas todavía y devuelven errores del tipo \`vaultvk2: unsupported key type (ML-DSA)\` o \`aws/secretsmanager: unsupported key type (ML-DSA)\`.

    Estos motores **sí pueden custodiar y firmar** con una clave PQC: el motor descarga la clave privada del almacén y las operaciones de firma se ejecutan mediante las primitivas PQC del motor software. La limitación afecta a la creación y a la importación, no al uso posterior de la clave.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  Los motores AWS KMS, Azure KeyVault, Azure KeyVault Secrets y PKCS#11 no incluyen tipos de clave PQC en su catálogo y rechazan cualquier especificación de clave post-cuántica con un error de tipo *unsupported key type*. Para despliegues con HSM, considere una estrategia híbrida: claves clásicas custodiadas en el HSM y claves PQC en el motor software (consulte [Recomendaciones de migración](#recomendaciones-de-migración-a-pqc)).
</div>

<div className="lm-diff-ins lm-diff-block">
  Crear claves post-cuánticas [#crear-claves-post-cuánticas]
</div>

<div className="lm-diff-ins lm-diff-block">
  La generación de claves PQC utiliza el mismo endpoint del KMS que los algoritmos clásicos: \`POST /v1/keys\`. El cuerpo de la petición indica el algoritmo y el tamaño o variante:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`json
  POST /v1/keys
  {
    "algorithm": "ML-DSA",
    "size": 65,
    "engine_id": "default",
    "name": "pqc-signing-key",
    "tags": ["pqc", "fips204"],
    "metadata": {}
  }
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Valores admitidos de \`algorithm\` y \`size\`:
</div>

<div className="lm-diff-ins lm-diff-block">
  | \`algorithm\`                | \`size\`                          |
  | :------------------------- | :------------------------------ |
  | \`ML-DSA\`                   | 44, 65 o 87                     |
  | \`SLH-DSA\`                  | 1 a 12                          |
  | \`Composite-ML-DSA-RSA\`     | 1 a 8                           |
  | \`Composite-ML-DSA-ECDSA\`   | 9 a 13                          |
  | \`Composite-ML-DSA-Ed25519\` | 14 a 15                         |
  | \`Ed25519\`                  | 256 (se aplica automáticamente) |
</div>

<div className="lm-diff-ins lm-diff-block">
  Si no se indica \`engine_id\`, la clave se crea en el motor por defecto configurado en el despliegue. Para las claves compuestas, la variante debe pertenecer a la familia indicada en \`algorithm\`; por ejemplo, la variante 9 (ECDSA) no es válida para \`Composite-ML-DSA-RSA\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="warn" title="Errores frecuentes">
    * \`invalid MLDSA key size\`: el tamaño indicado no es 44, 65 ni 87.
    * \`invalid SLH-DSA parameter set (use 1-12)\`: el conjunto de parámetros está fuera del rango 1–12.
    * \`invalid Composite-ML-DSA variant (use 1-15)\`: la variante está fuera del rango 1–15.
    * \`composite variant N is not valid for key type X\`: la variante existe, pero pertenece a otra familia compuesta.
    * *unsupported key type* procedente del motor: el motor seleccionado no admite la especificación de clave PQC. Consulte la [matriz de compatibilidad](#compatibilidad-con-motores-criptográficos).
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  Con el SDK de Go, la misma operación se realiza con \`CreateKey\`, que admite exactamente los mismos valores de algoritmo y tamaño:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`go
  key, err := kmsClient.CreateKey(ctx, services.CreateKeyInput{
      Algorithm: "ML-DSA",
      Size:      65,
      EngineID:  "default",
      Name:      "pqc-signing-key",
      Tags:      []string{"pqc", "fips204"},
      Metadata:  map[string]any{},
  })
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Importar claves post-cuánticas [#importar-claves-post-cuánticas]
</div>

<div className="lm-diff-ins lm-diff-block">
  La importación también reutiliza el endpoint clásico del KMS: \`POST /v1/keys/import\`. Lamassu parsea la clave privada en formato **PKCS#8** (PEM, codificada en Base64 en el campo \`private_key\`) e identifica automáticamente el algoritmo y los parámetros:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`json
  POST /v1/keys/import
  {
    "private_key": "<PEM de la clave privada en Base64>",
    "engine_id": "default",
    "name": "pqc-imported-key",
    "tags": ["pqc"],
    "metadata": {}
  }
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Al parsear la clave, Lamassu deduce el tipo y el tamaño sin que sea necesario indicarlos:
</div>

<div className="lm-diff-ins lm-diff-block">
  * Claves ML-DSA: se reconocen los parámetros ML-DSA-44, ML-DSA-65 y ML-DSA-87.
  * Claves SLH-DSA: se reconocen a partir del nombre del esquema del parámetro, con el prefijo \`SLH-DSA-\` (por ejemplo, \`SLH-DSA-SHA2-128s\`). El nombre del esquema se traduce al conjunto de parámetros correspondiente de la [tabla anterior](#conjuntos-de-parámetros-slh-dsa).
  * Claves compuestas: se reconoce el algoritmo compuesto del par ML-DSA + clásico y se deriva la variante correspondiente.
  * Claves Ed25519: tamaño fijo 256.
</div>

<div className="lm-diff-ins lm-diff-block">
  Como en el caso de la generación, la especificación deducida debe estar soportada por el motor de destino.
</div>

<div className="lm-diff-ins lm-diff-block">
  Firmar y verificar con claves post-cuánticas [#firmar-y-verificar-con-claves-post-cuánticas]
</div>

<div className="lm-diff-ins lm-diff-block">
  Las operaciones de firma y verificación se realizan con los endpoints habituales del KMS (\`POST /v1/keys/:id/sign\` y \`POST /v1/keys/:id/verify\`). Los algoritmos de firma disponibles para claves PQC son los siguientes:
</div>

<div className="lm-diff-ins lm-diff-block">
  | Clave                    | Algoritmo de firma             |
  | :----------------------- | :----------------------------- |
  | ML-DSA 44                | \`MLDSA_44_PURE\`                |
  | ML-DSA 65                | \`MLDSA_65_PURE\`                |
  | ML-DSA 87                | \`MLDSA_87_PURE\`                |
  | SLH-DSA                  | \`SLHDSA_PURE\`                  |
  | Composite-ML-DSA-RSA     | \`COMPOSITE_MLDSA_RSA_PURE\`     |
  | Composite-ML-DSA-ECDSA   | \`COMPOSITE_MLDSA_ECDSA_PURE\`   |
  | Composite-ML-DSA-Ed25519 | \`COMPOSITE_MLDSA_ED25519_PURE\` |
  | Ed25519                  | \`Ed25519_PURE\`                 |
</div>

<div className="lm-diff-ins lm-diff-block">
  Todos estos algoritmos son de modo *pure*: la firma se calcula **directamente sobre el mensaje en claro**, sin un paso previo de resumen (*digest*). Por ello, la petición debe usar el tipo de mensaje \`raw\`; los algoritmos PQC no aceptan firmar sobre un hash precalculado. El campo \`message\` es un array de bytes, por lo que el mensaje se envía codificado en **Base64**:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`json
  POST /v1/keys/{key_id}/sign
  {
    "algorithm": "MLDSA_65_PURE",
    "message": "bWVuc2FqZSBhIGZpcm1hcg==",
    "message_type": "raw"
  }
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  En el caso de las claves compuestas, la firma devuelta es la firma compuesta completa, y la verificación valida simultáneamente la parte ML-DSA y la parte clásica (RSA, ECDSA o Ed25519) según la variante de la clave.
</div>

<div className="lm-diff-ins lm-diff-block">
  La verificación (\`POST /v1/keys/:id/verify\`) usa el mismo cuerpo que la firma, añadiendo el campo \`signature\` (también en Base64) con la firma que se desea comprobar, obtenida del endpoint de firma.
</div>

<div className="lm-diff-ins lm-diff-block">
  Autoridades de certificación post-cuánticas [#autoridades-de-certificación-post-cuánticas]
</div>

<div className="lm-diff-ins lm-diff-block">
  Crear una CA con clave PQC [#crear-una-ca-con-clave-pqc]
</div>

<div className="lm-diff-ins lm-diff-block">
  La creación de una CA utiliza el endpoint \`POST /v1/cas\` con el bloque \`key_metadata\`, que indica el tipo de clave y su tamaño o variante. Lamassu genera la clave en el motor indicado reutilizando el flujo de [creación de claves](#crear-claves-post-cuánticas):
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`json
  POST /v1/cas
  {
    "id": "pqc-root-ca",
    "subject": {
      "common_name": "PQC Root CA"
    },
    "key_metadata": {
      "type": "SLH-DSA",
      "bits": 1
    },
    "engine_id": "default",
    "profile_id": "b1a7d0c3-4e2f-4a8b-9c6d-5f0e1a2b3c4d",
    "ca_expiration": {
      "type": "Duration",
      "duration": "1y"
    }
  }
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Los valores admitidos en \`key_metadata.type\` son los mismos que los algoritmos del KMS: \`ML-DSA\`, \`SLH-DSA\`, \`Composite-ML-DSA-RSA\`, \`Composite-ML-DSA-ECDSA\`, \`Composite-ML-DSA-Ed25519\`, junto con los clásicos \`RSA\`, \`ECDSA\` y \`Ed25519\`. En \`bits\` se indica el tamaño o variante según la [tabla de algoritmos](#algoritmos-soportados).
</div>

<div className="lm-diff-ins lm-diff-block">
  El campo \`profile_id\` es obligatorio y debe referenciar un perfil de emisión de tipo CA existente: si se omite, la petición responde con un error de validación (400), y si el perfil indicado no existe, con un 404. La expiración se expresa con el bloque \`ca_expiration\`, que admite una duración relativa (\`"type": "Duration"\`, con valores como \`"1y"\`, \`"6m"\` o \`"30d"\`) o una fecha absoluta (\`"type": "Time"\`).
</div>

<div className="lm-diff-ins lm-diff-block">
  Importar una CA con clave PQC [#importar-una-ca-con-clave-pqc]
</div>

<div className="lm-diff-ins lm-diff-block">
  La importación de CAs (\`POST /v1/cas/import\`) admite claves privadas post-cuánticas generadas externamente. La clave privada se envía en formato PEM codificado en Base64 y el SDK la serializa internamente a PKCS#8, soportando los mismos tipos de clave que la importación de claves del KMS: ML-DSA, SLH-DSA, compuestas y Ed25519, además de RSA y ECDSA.
</div>

<div className="lm-diff-ins lm-diff-block">
  Cadenas de certificación mixtas [#cadenas-de-certificación-mixtas]
</div>

<div className="lm-diff-ins lm-diff-block">
  El motor X.509 de Lamassu puede firmar certificados cruzando familias de algoritmos entre la CA emisora y el certificado emitido. Esto habilita arquitecturas de migración graduales, entre otras:
</div>

<div className="lm-diff-ins lm-diff-block">
  * CA raíz SLH-DSA que emite certificados de hoja ECDSA.
  * CA ECDSA que firma solicitudes de certificado (CSR) firmadas con SLH-DSA.
  * Cadenas en las que raíz e intermedia son post-cuánticas y la hoja es clásica, o viceversa.
</div>

<div className="lm-diff-ins lm-diff-block">
  La cadena elegida debe ser verificable por los consumidores finales de los certificados: si un dispositivo o servicio no soporta todavía los algoritmos PQC, las firmas compuestas pueden servir como punto de transición.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="warn" title="Expiración e inconsistencias con claves PQC">
    Durante la creación o importación de una CA, el servicio puede devolver el error \`incompatible expiration time ref\` si la referencia temporal de validez no es compatible con el certificado que se intenta registrar. El SDK de Go lo mapea a un error de tipo \`400\` (y \`500\` en la creación de CA) para facilitar su gestión desde las integraciones.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  SDK de Go y utilidades criptográficas [#sdk-de-go-y-utilidades-criptográficas]
</div>

<div className="lm-diff-ins lm-diff-block">
  El SDK de Go de LamassuQ expone la funcionalidad PQC a través de los mismos clientes de KMS y CA, además de añadir utilidades criptográficas para generar material PQC de forma local:
</div>

<div className="lm-diff-ins lm-diff-block">
  * \`GenerateMLDSAKey(dimensions)\`: genera una clave ML-DSA (44, 65 o 87).
  * \`GenerateSLHDSAKey(paramSet)\`: genera una clave SLH-DSA para el conjunto de parámetros indicado.
  * \`GenerateCompositeMLDSAKey(variant)\`: genera una clave compuesta para la variante 1–15. Se mantiene también el alias \`GenerateCompositeMLDSARSAKey(variant)\` por compatibilidad.
  * \`GenerateEd25519Key()\`: genera una clave Ed25519.
  * \`ValidateCertAndPrivKey(...)\`: valida que un certificado y su clave privada coincidan, extendida para admitir claves ML-DSA y Ed25519 junto a RSA y ECDSA.
</div>

<div className="lm-diff-ins lm-diff-block">
  Estas utilidades son útiles para preparar material de prueba, automatizar la importación de claves o construir CSR firmadas con algoritmos PQC antes de registrarlas en la plataforma.
</div>

<div className="lm-diff-ins lm-diff-block">
  Despliegue [#despliegue]
</div>

<div className="lm-diff-ins lm-diff-block">
  LamassuQ se construye sobre una cadena de herramientas con soporte criptográfico post-cuántico:
</div>

<div className="lm-diff-ins lm-diff-block">
  * Las imágenes de los servicios se compilan con la imagen de Go con soporte PQC \`ghcr.io/lamassuiot/golang-pqc:latest\`, que incluye las primitivas ML-DSA (paquete \`crypto/mldsa\` del *fork* de la librería estándar de Go) y las primitivas SLH-DSA y compuestas de la librería \`cloudflare/circl\`.
  * Las imágenes de contenedor de cada servicio se publican con la etiqueta \`:pqc\`, por ejemplo \`ghcr.io/lamassuiot/lamassu-ca:pqc\` o \`ghcr.io/lamassuiot/lamassu-kms:pqc\`.
  * Existe una imagen *monolítica* adicional (\`ci/monolithic.dockerfile\`) que agrupa los servicios en un único contenedor.
</div>

<div className="lm-diff-ins lm-diff-block">
  El script \`deploy-lamassuq.sh\` automatiza la construcción y publicación de las imágenes \`:pqc\` de cada servicio a partir de los ficheros \`ci/pq_<componente>.dockerfile\`. La cadena de herramientas se basa en Go 1.27.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="warn" title="Migración del despliegue">
    Para activar el soporte PQC, las imágenes de los servicios y la imagen de Go de compilación deben actualizarse a las versiones PQC. Un despliegue que mezcle imágenes PQC y no-PQC puede provocar inconsistencias, ya que los binarios no-PQC no reconocen los algoritmos añadidos.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  Recomendaciones de migración a PQC [#recomendaciones-de-migración-a-pqc]
</div>

<div className="lm-diff-ins lm-diff-block">
  * **Inventariar el estado actual**: identifique las CAs, las claves y los perfiles de emisión que operan con RSA y ECDSA, y los consumidores que dependen de ellos.
  * **Empezar por los motores soportados**: despliegue un motor Software o File System para alojar las primeras claves PQC de prueba. Hasta que los motores externos y los HSM soporten PQC, mantenga las claves clásicas de producción en sus motores actuales.
  * **Usar firmas compuestas como puente**: durante la transición, las claves compuestas ML-DSA + RSA/ECDSA/Ed25519 permiten emitir certificados verificables tanto por consumidores clásicos como por consumidores preparados para PQC.
  * **Probar cadenas mixtas**: antes de migrar una raíz de confianza, valide en un entorno de pruebas que los dispositivos y servicios objetivo verifican correctamente las cadenas mixtas y las firmas *pure*.
  * **Planificar la renovación de las raíces**: la migración definitiva exige emitir nuevas raíces e intermedias post-cuánticas y reemplazar progresivamente las clásicas, respetando los periodos de vida de los certificados ya emitidos.
</div>
`,c={title:"[PQC] Criptografía post-cuántica (LamassuQ)",description:"Soporte de criptografía post-cuántica en el KMS, la CA y el SDK de Lamassu IoT",sidebar:{group:"PQC",label:"Visión general"}},r={isNew:!0,changes:71,title:void 0,description:void 0},d={contents:[{heading:"criptografía-post-cuántica-lamassuq",content:"LamassuQ incorpora soporte de criptografía post-cuántica (PQC) a la plataforma: el servicio KMS puede generar e importar claves post-cuánticas, firmar y verificar con ellas, y el servicio de CA puede emitir certificados X.509 apoyados en estas claves, incluidas cadenas de certificación mixtas en las que conviven algoritmos clásicos y post-cuánticos."},{heading:"criptografía-post-cuántica-lamassuq",content:"El objetivo es preparar la PKI ante la amenaza de un computador cuántico suficiente para romper la criptografía asimétrica actual, manteniendo al mismo tiempo la compatibilidad con los algoritmos clásicos ya desplegados."},{heading:"qué-aporta-lamassuq",content:"**Nuevos algoritmos de firma** en el KMS: ML-DSA, SLH-DSA y firmas compuestas (*composite*) que combinan ML-DSA con RSA, ECDSA o Ed25519."},{heading:"qué-aporta-lamassuq",content:"**Generación e importación de claves** post-cuánticas a través del flujo habitual de claves del KMS."},{heading:"qué-aporta-lamassuq",content:"**Firma y verificación** con los nuevos algoritmos, sobre el mensaje en claro (*pure signing*)."},{heading:"qué-aporta-lamassuq",content:"**CAs post-cuánticas**: creación e importación de autoridades de certificación con claves ML-DSA, SLH-DSA o compuestas, y emisión de certificados a partir de ellas."},{heading:"qué-aporta-lamassuq",content:"**Cadenas mixtas**: un motor X.509 puede firmar certificados cruzando familias de algoritmos (por ejemplo, una CA SLH-DSA que emite una hoja ECDSA, o una CA ECDSA que firma un CSR firmado con SLH-DSA)."},{heading:"alcance-y-limitaciones",content:"La funcionalidad se expone a través de la **API REST y el SDK de Go**. Los ejemplos de esta página utilizan ambos canales."},{heading:"alcance-y-limitaciones",content:"El soporte PQC está disponible de forma completa en el **motor criptográfico software** (y en el motor File System, que delega en él). Consulte la matriz de compatibilidad para conocer el estado del resto de motores."},{heading:"alcance-y-limitaciones",content:"Los algoritmos PQC de Lamassu son **algoritmos de firma**. No se ha añadido soporte de cifrado/encapsulación de claves (ML-KEM) ni mecanismos de cifrado post-cuántico."},{heading:"alcance-y-limitaciones",content:"LamassuQ se distribuye mediante **imágenes de contenedor específicas** y una **imagen de Go con soporte PQC**. Consulte la sección de despliegue."},{heading:"algoritmos-soportados",content:"El KMS identifica cada tipo de clave con un valor de `algorithm` y un parámetro `size`. Los algoritmos añadidos por LamassuQ son los siguientes:"},{heading:"algoritmos-soportados",content:"Algoritmo (`algorithm`)"},{heading:"algoritmos-soportados",content:"Parámetros (`size`)"},{heading:"algoritmos-soportados",content:"Estándar"},{heading:"algoritmos-soportados",content:"Descripción"},{heading:"algoritmos-soportados",content:"`ML-DSA`"},{heading:"algoritmos-soportados",content:"44, 65, 87"},{heading:"algoritmos-soportados",content:"FIPS 204 (ML-DSA-44/65/87)"},{heading:"algoritmos-soportados",content:"Firma post-cuántica basada en retículos (*lattice*)."},{heading:"algoritmos-soportados",content:"`SLH-DSA`"},{heading:"algoritmos-soportados",content:"1–12 (conjunto de parámetros)"},{heading:"algoritmos-soportados",content:"FIPS 205"},{heading:"algoritmos-soportados",content:"Firma post-cuántica basada en hash (*stateless hash-based*), considerada el enfoque más conservador."},{heading:"algoritmos-soportados",content:"`Composite-ML-DSA-RSA`"},{heading:"algoritmos-soportados",content:"variante 1–8"},{heading:"algoritmos-soportados",content:"firma híbrida"},{heading:"algoritmos-soportados",content:"Combina ML-DSA con una firma RSA (RSA-PSS o RSA-PKCS#1 v1.5)."},{heading:"algoritmos-soportados",content:"`Composite-ML-DSA-ECDSA`"},{heading:"algoritmos-soportados",content:"variante 9–13"},{heading:"algoritmos-soportados",content:"firma híbrida"},{heading:"algoritmos-soportados",content:"Combina ML-DSA con una firma ECDSA."},{heading:"algoritmos-soportados",content:"`Composite-ML-DSA-Ed25519`"},{heading:"algoritmos-soportados",content:"variante 14–15"},{heading:"algoritmos-soportados",content:"firma híbrida"},{heading:"algoritmos-soportados",content:"Combina ML-DSA con Ed25519."},{heading:"algoritmos-soportados",content:"`Ed25519`"},{heading:"algoritmos-soportados",content:"256 (fijo)"},{heading:"algoritmos-soportados",content:"firma clásica"},{heading:"algoritmos-soportados",content:"Incluido en el mismo flujo de generación e importación."},{heading:"algoritmos-soportados",content:"Las firmas compuestas (*composite*) producen una única firma que valida contra las dos claves del par: la post-cuántica y la clásica. Son útiles durante la migración, cuando el verificador aún no soporta algoritmos PQC o se exige redundancia criptográfica."},{heading:"conjuntos-de-parámetros-slh-dsa",content:"Para `SLH-DSA` el valor de `size` selecciona el conjunto de parámetros FIPS 205:"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"`size`"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"Conjunto de parámetros"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"1"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"SLH-DSA-SHA2-128s"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"2"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"SLH-DSA-SHA2-128f"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"3"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"SLH-DSA-SHA2-192s"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"4"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"SLH-DSA-SHA2-192f"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"5"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"SLH-DSA-SHA2-256s"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"6"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"SLH-DSA-SHA2-256f"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"7"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"SLH-DSA-SHAKE-128s"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"8"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"SLH-DSA-SHAKE-128f"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"9"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"SLH-DSA-SHAKE-192s"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"10"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"SLH-DSA-SHAKE-192f"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"11"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"SLH-DSA-SHAKE-256s"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"12"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"SLH-DSA-SHAKE-256f"},{heading:"conjuntos-de-parámetros-slh-dsa",content:"Los conjuntos terminados en `s` (*small*) optimizan el tamaño de firma y los terminados en `f` (*fast*) la velocidad de firma."},{heading:"variantes-compuestas",content:"Para las claves compuestas, el valor de `size` selecciona la variante dentro del registro de algoritmos compuestos de la librería criptográfica con la que se ha construido Lamassu (un *fork* con soporte PQC de la librería estándar de Go):"},{heading:"variantes-compuestas",content:"Familia"},{heading:"variantes-compuestas",content:"Variantes admitidas"},{heading:"variantes-compuestas",content:"Composiciones disponibles"},{heading:"variantes-compuestas",content:"`Composite-ML-DSA-RSA`"},{heading:"variantes-compuestas",content:"1–8"},{heading:"variantes-compuestas",content:"MLDSA44\\_RSA2048\\_PSS\\_SHA256, MLDSA44\\_RSA2048\\_PKCS15\\_SHA256, MLDSA65\\_RSA3072\\_PSS\\_SHA512, MLDSA65\\_RSA3072\\_PKCS15\\_SHA512, MLDSA65\\_RSA4096\\_PSS\\_SHA512, MLDSA65\\_RSA4096\\_PKCS15\\_SHA512, MLDSA87\\_RSA3072\\_PSS\\_SHA512, MLDSA87\\_RSA4096\\_PSS\\_SHA512"},{heading:"variantes-compuestas",content:"`Composite-ML-DSA-ECDSA`"},{heading:"variantes-compuestas",content:"9–13"},{heading:"variantes-compuestas",content:"MLDSA44\\_ECDSA\\_P256\\_SHA256, MLDSA65\\_ECDSA\\_P256\\_SHA512, MLDSA65\\_ECDSA\\_P384\\_SHA512, MLDSA87\\_ECDSA\\_P384\\_SHA512, MLDSA87\\_ECDSA\\_P521\\_SHA512"},{heading:"variantes-compuestas",content:"`Composite-ML-DSA-Ed25519`"},{heading:"variantes-compuestas",content:"14–15"},{heading:"variantes-compuestas",content:"MLDSA44\\_Ed25519\\_SHA512, MLDSA65\\_Ed25519\\_SHA512"},{heading:"variantes-compuestas",content:"La primera parte del nombre indica la variante ML-DSA (44, 65 o 87) y la segunda el algoritmo clásico que la acompaña. El algoritmo exacto asociado a cada variante queda reflejado en los metadatos de la clave y en los certificados que se emitan con ella."},{heading:"compatibilidad-con-motores-criptográficos",content:"Al crear o importar una clave, Lamassu comprueba que la especificación de clave (tipo y tamaño) esté declarada como soportada por el motor criptográfico seleccionado."},{heading:"compatibilidad-con-motores-criptográficos",content:"Motor"},{heading:"compatibilidad-con-motores-criptográficos",content:"Claves PQC en su catálogo"},{heading:"compatibilidad-con-motores-criptográficos",content:"Crear / importar claves PQC"},{heading:"compatibilidad-con-motores-criptográficos",content:"Firmar / verificar con PQC"},{heading:"compatibilidad-con-motores-criptográficos",content:"Software (Go)"},{heading:"compatibilidad-con-motores-criptográficos",content:"Sí"},{heading:"compatibilidad-con-motores-criptográficos",content:"Sí"},{heading:"compatibilidad-con-motores-criptográficos",content:"Sí"},{heading:"compatibilidad-con-motores-criptográficos",content:"File System"},{heading:"compatibilidad-con-motores-criptográficos",content:"Sí"},{heading:"compatibilidad-con-motores-criptográficos",content:"Sí"},{heading:"compatibilidad-con-motores-criptográficos",content:"Sí"},{heading:"compatibilidad-con-motores-criptográficos",content:"HashiCorp Vault KV2"},{heading:"compatibilidad-con-motores-criptográficos",content:"Sí\\*"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"Sí"},{heading:"compatibilidad-con-motores-criptográficos",content:"AWS Secrets Manager"},{heading:"compatibilidad-con-motores-criptográficos",content:"Sí\\*"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"Sí"},{heading:"compatibilidad-con-motores-criptográficos",content:"AWS KMS"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"Azure KeyVault"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"Azure KeyVault Secrets"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"PKCS#11"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"No"},{heading:"compatibilidad-con-motores-criptográficos",content:"El motor Software admite la matriz completa: RSA 1024–15360, ECDSA P-224/P-256/P-384/P-521, ML-DSA 44/65/87, SLH-DSA 1–12, compuestas 1–15 y Ed25519. El motor File System delega la generación, la importación y la firma en el motor software, por lo que hereda su soporte completo."},{heading:"compatibilidad-con-motores-criptográficos",content:"HashiCorp Vault KV2 y AWS Secrets Manager anuncian el mismo catálogo de tipos de clave que el motor software, por lo que las claves PQC **aparecen en sus listados**. Sin embargo, sus operaciones de generación e importación de claves PQC no están implementadas todavía y devuelven errores del tipo `vaultvk2: unsupported key type (ML-DSA)` o `aws/secretsmanager: unsupported key type (ML-DSA)`."},{heading:"compatibilidad-con-motores-criptográficos",content:"Estos motores **sí pueden custodiar y firmar** con una clave PQC: el motor descarga la clave privada del almacén y las operaciones de firma se ejecutan mediante las primitivas PQC del motor software. La limitación afecta a la creación y a la importación, no al uso posterior de la clave."},{heading:"compatibilidad-con-motores-criptográficos",content:"Los motores AWS KMS, Azure KeyVault, Azure KeyVault Secrets y PKCS#11 no incluyen tipos de clave PQC en su catálogo y rechazan cualquier especificación de clave post-cuántica con un error de tipo *unsupported key type*. Para despliegues con HSM, considere una estrategia híbrida: claves clásicas custodiadas en el HSM y claves PQC en el motor software (consulte Recomendaciones de migración)."},{heading:"crear-claves-post-cuánticas",content:"La generación de claves PQC utiliza el mismo endpoint del KMS que los algoritmos clásicos: `POST /v1/keys`. El cuerpo de la petición indica el algoritmo y el tamaño o variante:"},{heading:"crear-claves-post-cuánticas",content:"Valores admitidos de `algorithm` y `size`:"},{heading:"crear-claves-post-cuánticas",content:"`algorithm`"},{heading:"crear-claves-post-cuánticas",content:"`size`"},{heading:"crear-claves-post-cuánticas",content:"`ML-DSA`"},{heading:"crear-claves-post-cuánticas",content:"44, 65 o 87"},{heading:"crear-claves-post-cuánticas",content:"`SLH-DSA`"},{heading:"crear-claves-post-cuánticas",content:"1 a 12"},{heading:"crear-claves-post-cuánticas",content:"`Composite-ML-DSA-RSA`"},{heading:"crear-claves-post-cuánticas",content:"1 a 8"},{heading:"crear-claves-post-cuánticas",content:"`Composite-ML-DSA-ECDSA`"},{heading:"crear-claves-post-cuánticas",content:"9 a 13"},{heading:"crear-claves-post-cuánticas",content:"`Composite-ML-DSA-Ed25519`"},{heading:"crear-claves-post-cuánticas",content:"14 a 15"},{heading:"crear-claves-post-cuánticas",content:"`Ed25519`"},{heading:"crear-claves-post-cuánticas",content:"256 (se aplica automáticamente)"},{heading:"crear-claves-post-cuánticas",content:"Si no se indica `engine_id`, la clave se crea en el motor por defecto configurado en el despliegue. Para las claves compuestas, la variante debe pertenecer a la familia indicada en `algorithm`; por ejemplo, la variante 9 (ECDSA) no es válida para `Composite-ML-DSA-RSA`."},{heading:"crear-claves-post-cuánticas",content:"`invalid MLDSA key size`: el tamaño indicado no es 44, 65 ni 87."},{heading:"crear-claves-post-cuánticas",content:"`invalid SLH-DSA parameter set (use 1-12)`: el conjunto de parámetros está fuera del rango 1–12."},{heading:"crear-claves-post-cuánticas",content:"`invalid Composite-ML-DSA variant (use 1-15)`: la variante está fuera del rango 1–15."},{heading:"crear-claves-post-cuánticas",content:"`composite variant N is not valid for key type X`: la variante existe, pero pertenece a otra familia compuesta."},{heading:"crear-claves-post-cuánticas",content:"*unsupported key type* procedente del motor: el motor seleccionado no admite la especificación de clave PQC. Consulte la matriz de compatibilidad."},{heading:"crear-claves-post-cuánticas",content:"Con el SDK de Go, la misma operación se realiza con `CreateKey`, que admite exactamente los mismos valores de algoritmo y tamaño:"},{heading:"importar-claves-post-cuánticas",content:"La importación también reutiliza el endpoint clásico del KMS: `POST /v1/keys/import`. Lamassu parsea la clave privada en formato **PKCS#8** (PEM, codificada en Base64 en el campo `private_key`) e identifica automáticamente el algoritmo y los parámetros:"},{heading:"importar-claves-post-cuánticas",content:"Al parsear la clave, Lamassu deduce el tipo y el tamaño sin que sea necesario indicarlos:"},{heading:"importar-claves-post-cuánticas",content:"Claves ML-DSA: se reconocen los parámetros ML-DSA-44, ML-DSA-65 y ML-DSA-87."},{heading:"importar-claves-post-cuánticas",content:"Claves SLH-DSA: se reconocen a partir del nombre del esquema del parámetro, con el prefijo `SLH-DSA-` (por ejemplo, `SLH-DSA-SHA2-128s`). El nombre del esquema se traduce al conjunto de parámetros correspondiente de la tabla anterior."},{heading:"importar-claves-post-cuánticas",content:"Claves compuestas: se reconoce el algoritmo compuesto del par ML-DSA + clásico y se deriva la variante correspondiente."},{heading:"importar-claves-post-cuánticas",content:"Claves Ed25519: tamaño fijo 256."},{heading:"importar-claves-post-cuánticas",content:"Como en el caso de la generación, la especificación deducida debe estar soportada por el motor de destino."},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"Las operaciones de firma y verificación se realizan con los endpoints habituales del KMS (`POST /v1/keys/:id/sign` y `POST /v1/keys/:id/verify`). Los algoritmos de firma disponibles para claves PQC son los siguientes:"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"Clave"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"Algoritmo de firma"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"ML-DSA 44"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"`MLDSA_44_PURE`"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"ML-DSA 65"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"`MLDSA_65_PURE`"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"ML-DSA 87"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"`MLDSA_87_PURE`"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"SLH-DSA"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"`SLHDSA_PURE`"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"Composite-ML-DSA-RSA"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"`COMPOSITE_MLDSA_RSA_PURE`"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"Composite-ML-DSA-ECDSA"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"`COMPOSITE_MLDSA_ECDSA_PURE`"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"Composite-ML-DSA-Ed25519"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"`COMPOSITE_MLDSA_ED25519_PURE`"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"Ed25519"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"`Ed25519_PURE`"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"Todos estos algoritmos son de modo *pure*: la firma se calcula **directamente sobre el mensaje en claro**, sin un paso previo de resumen (*digest*). Por ello, la petición debe usar el tipo de mensaje `raw`; los algoritmos PQC no aceptan firmar sobre un hash precalculado. El campo `message` es un array de bytes, por lo que el mensaje se envía codificado en **Base64**:"},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"En el caso de las claves compuestas, la firma devuelta es la firma compuesta completa, y la verificación valida simultáneamente la parte ML-DSA y la parte clásica (RSA, ECDSA o Ed25519) según la variante de la clave."},{heading:"firmar-y-verificar-con-claves-post-cuánticas",content:"La verificación (`POST /v1/keys/:id/verify`) usa el mismo cuerpo que la firma, añadiendo el campo `signature` (también en Base64) con la firma que se desea comprobar, obtenida del endpoint de firma."},{heading:"crear-una-ca-con-clave-pqc",content:"La creación de una CA utiliza el endpoint `POST /v1/cas` con el bloque `key_metadata`, que indica el tipo de clave y su tamaño o variante. Lamassu genera la clave en el motor indicado reutilizando el flujo de creación de claves:"},{heading:"crear-una-ca-con-clave-pqc",content:"Los valores admitidos en `key_metadata.type` son los mismos que los algoritmos del KMS: `ML-DSA`, `SLH-DSA`, `Composite-ML-DSA-RSA`, `Composite-ML-DSA-ECDSA`, `Composite-ML-DSA-Ed25519`, junto con los clásicos `RSA`, `ECDSA` y `Ed25519`. En `bits` se indica el tamaño o variante según la tabla de algoritmos."},{heading:"crear-una-ca-con-clave-pqc",content:'El campo `profile_id` es obligatorio y debe referenciar un perfil de emisión de tipo CA existente: si se omite, la petición responde con un error de validación (400), y si el perfil indicado no existe, con un 404. La expiración se expresa con el bloque `ca_expiration`, que admite una duración relativa (`"type": "Duration"`, con valores como `"1y"`, `"6m"` o `"30d"`) o una fecha absoluta (`"type": "Time"`).'},{heading:"importar-una-ca-con-clave-pqc",content:"La importación de CAs (`POST /v1/cas/import`) admite claves privadas post-cuánticas generadas externamente. La clave privada se envía en formato PEM codificado en Base64 y el SDK la serializa internamente a PKCS#8, soportando los mismos tipos de clave que la importación de claves del KMS: ML-DSA, SLH-DSA, compuestas y Ed25519, además de RSA y ECDSA."},{heading:"cadenas-de-certificación-mixtas",content:"El motor X.509 de Lamassu puede firmar certificados cruzando familias de algoritmos entre la CA emisora y el certificado emitido. Esto habilita arquitecturas de migración graduales, entre otras:"},{heading:"cadenas-de-certificación-mixtas",content:"CA raíz SLH-DSA que emite certificados de hoja ECDSA."},{heading:"cadenas-de-certificación-mixtas",content:"CA ECDSA que firma solicitudes de certificado (CSR) firmadas con SLH-DSA."},{heading:"cadenas-de-certificación-mixtas",content:"Cadenas en las que raíz e intermedia son post-cuánticas y la hoja es clásica, o viceversa."},{heading:"cadenas-de-certificación-mixtas",content:"La cadena elegida debe ser verificable por los consumidores finales de los certificados: si un dispositivo o servicio no soporta todavía los algoritmos PQC, las firmas compuestas pueden servir como punto de transición."},{heading:"cadenas-de-certificación-mixtas",content:"Durante la creación o importación de una CA, el servicio puede devolver el error `incompatible expiration time ref` si la referencia temporal de validez no es compatible con el certificado que se intenta registrar. El SDK de Go lo mapea a un error de tipo `400` (y `500` en la creación de CA) para facilitar su gestión desde las integraciones."},{heading:"sdk-de-go-y-utilidades-criptográficas",content:"El SDK de Go de LamassuQ expone la funcionalidad PQC a través de los mismos clientes de KMS y CA, además de añadir utilidades criptográficas para generar material PQC de forma local:"},{heading:"sdk-de-go-y-utilidades-criptográficas",content:"`GenerateMLDSAKey(dimensions)`: genera una clave ML-DSA (44, 65 o 87)."},{heading:"sdk-de-go-y-utilidades-criptográficas",content:"`GenerateSLHDSAKey(paramSet)`: genera una clave SLH-DSA para el conjunto de parámetros indicado."},{heading:"sdk-de-go-y-utilidades-criptográficas",content:"`GenerateCompositeMLDSAKey(variant)`: genera una clave compuesta para la variante 1–15. Se mantiene también el alias `GenerateCompositeMLDSARSAKey(variant)` por compatibilidad."},{heading:"sdk-de-go-y-utilidades-criptográficas",content:"`GenerateEd25519Key()`: genera una clave Ed25519."},{heading:"sdk-de-go-y-utilidades-criptográficas",content:"`ValidateCertAndPrivKey(...)`: valida que un certificado y su clave privada coincidan, extendida para admitir claves ML-DSA y Ed25519 junto a RSA y ECDSA."},{heading:"sdk-de-go-y-utilidades-criptográficas",content:"Estas utilidades son útiles para preparar material de prueba, automatizar la importación de claves o construir CSR firmadas con algoritmos PQC antes de registrarlas en la plataforma."},{heading:"despliegue",content:"LamassuQ se construye sobre una cadena de herramientas con soporte criptográfico post-cuántico:"},{heading:"despliegue",content:"Las imágenes de los servicios se compilan con la imagen de Go con soporte PQC `ghcr.io/lamassuiot/golang-pqc:latest`, que incluye las primitivas ML-DSA (paquete `crypto/mldsa` del *fork* de la librería estándar de Go) y las primitivas SLH-DSA y compuestas de la librería `cloudflare/circl`."},{heading:"despliegue",content:"Las imágenes de contenedor de cada servicio se publican con la etiqueta `:pqc`, por ejemplo `ghcr.io/lamassuiot/lamassu-ca:pqc` o `ghcr.io/lamassuiot/lamassu-kms:pqc`."},{heading:"despliegue",content:"Existe una imagen *monolítica* adicional (`ci/monolithic.dockerfile`) que agrupa los servicios en un único contenedor."},{heading:"despliegue",content:"El script `deploy-lamassuq.sh` automatiza la construcción y publicación de las imágenes `:pqc` de cada servicio a partir de los ficheros `ci/pq_<componente>.dockerfile`. La cadena de herramientas se basa en Go 1.27."},{heading:"despliegue",content:"Para activar el soporte PQC, las imágenes de los servicios y la imagen de Go de compilación deben actualizarse a las versiones PQC. Un despliegue que mezcle imágenes PQC y no-PQC puede provocar inconsistencias, ya que los binarios no-PQC no reconocen los algoritmos añadidos."},{heading:"recomendaciones-de-migración-a-pqc",content:"**Inventariar el estado actual**: identifique las CAs, las claves y los perfiles de emisión que operan con RSA y ECDSA, y los consumidores que dependen de ellos."},{heading:"recomendaciones-de-migración-a-pqc",content:"**Empezar por los motores soportados**: despliegue un motor Software o File System para alojar las primeras claves PQC de prueba. Hasta que los motores externos y los HSM soporten PQC, mantenga las claves clásicas de producción en sus motores actuales."},{heading:"recomendaciones-de-migración-a-pqc",content:"**Usar firmas compuestas como puente**: durante la transición, las claves compuestas ML-DSA + RSA/ECDSA/Ed25519 permiten emitir certificados verificables tanto por consumidores clásicos como por consumidores preparados para PQC."},{heading:"recomendaciones-de-migración-a-pqc",content:"**Probar cadenas mixtas**: antes de migrar una raíz de confianza, valide en un entorno de pruebas que los dispositivos y servicios objetivo verifican correctamente las cadenas mixtas y las firmas *pure*."},{heading:"recomendaciones-de-migración-a-pqc",content:"**Planificar la renovación de las raíces**: la migración definitiva exige emitir nuevas raíces e intermedias post-cuánticas y reemplazar progresivamente las clásicas, respetando los periodos de vida de los certificados ya emitidos."}],headings:[{id:"criptografía-post-cuántica-lamassuq",content:"Criptografía post-cuántica (LamassuQ)"},{id:"qué-aporta-lamassuq",content:"Qué aporta LamassuQ"},{id:"alcance-y-limitaciones",content:"Alcance y limitaciones"},{id:"algoritmos-soportados",content:"Algoritmos soportados"},{id:"conjuntos-de-parámetros-slh-dsa",content:"Conjuntos de parámetros SLH-DSA"},{id:"variantes-compuestas",content:"Variantes compuestas"},{id:"compatibilidad-con-motores-criptográficos",content:"Compatibilidad con motores criptográficos"},{id:"crear-claves-post-cuánticas",content:"Crear claves post-cuánticas"},{id:"importar-claves-post-cuánticas",content:"Importar claves post-cuánticas"},{id:"firmar-y-verificar-con-claves-post-cuánticas",content:"Firmar y verificar con claves post-cuánticas"},{id:"autoridades-de-certificación-post-cuánticas",content:"Autoridades de certificación post-cuánticas"},{id:"crear-una-ca-con-clave-pqc",content:"Crear una CA con clave PQC"},{id:"importar-una-ca-con-clave-pqc",content:"Importar una CA con clave PQC"},{id:"cadenas-de-certificación-mixtas",content:"Cadenas de certificación mixtas"},{id:"sdk-de-go-y-utilidades-criptográficas",content:"SDK de Go y utilidades criptográficas"},{id:"despliegue",content:"Despliegue"},{id:"recomendaciones-de-migración-a-pqc",content:"Recomendaciones de migración a PQC"}]};const m=[{depth:1,url:"#criptografía-post-cuántica-lamassuq",title:e.jsx(e.Fragment,{children:"Criptografía post-cuántica (LamassuQ)"})},{depth:2,url:"#qué-aporta-lamassuq",title:e.jsx(e.Fragment,{children:"Qué aporta LamassuQ"})},{depth:2,url:"#alcance-y-limitaciones",title:e.jsx(e.Fragment,{children:"Alcance y limitaciones"})},{depth:2,url:"#algoritmos-soportados",title:e.jsx(e.Fragment,{children:"Algoritmos soportados"})},{depth:3,url:"#conjuntos-de-parámetros-slh-dsa",title:e.jsx(e.Fragment,{children:"Conjuntos de parámetros SLH-DSA"})},{depth:3,url:"#variantes-compuestas",title:e.jsx(e.Fragment,{children:"Variantes compuestas"})},{depth:2,url:"#compatibilidad-con-motores-criptográficos",title:e.jsx(e.Fragment,{children:"Compatibilidad con motores criptográficos"})},{depth:2,url:"#crear-claves-post-cuánticas",title:e.jsx(e.Fragment,{children:"Crear claves post-cuánticas"})},{depth:2,url:"#importar-claves-post-cuánticas",title:e.jsx(e.Fragment,{children:"Importar claves post-cuánticas"})},{depth:2,url:"#firmar-y-verificar-con-claves-post-cuánticas",title:e.jsx(e.Fragment,{children:"Firmar y verificar con claves post-cuánticas"})},{depth:2,url:"#autoridades-de-certificación-post-cuánticas",title:e.jsx(e.Fragment,{children:"Autoridades de certificación post-cuánticas"})},{depth:3,url:"#crear-una-ca-con-clave-pqc",title:e.jsx(e.Fragment,{children:"Crear una CA con clave PQC"})},{depth:3,url:"#importar-una-ca-con-clave-pqc",title:e.jsx(e.Fragment,{children:"Importar una CA con clave PQC"})},{depth:3,url:"#cadenas-de-certificación-mixtas",title:e.jsx(e.Fragment,{children:"Cadenas de certificación mixtas"})},{depth:2,url:"#sdk-de-go-y-utilidades-criptográficas",title:e.jsx(e.Fragment,{children:"SDK de Go y utilidades criptográficas"})},{depth:2,url:"#despliegue",title:e.jsx(e.Fragment,{children:"Despliegue"})},{depth:2,url:"#recomendaciones-de-migración-a-pqc",title:e.jsx(e.Fragment,{children:"Recomendaciones de migración a PQC"})}];function n(a){const i={a:"a",code:"code",div:"div",em:"em",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...a.components},{Callout:s}=i;return s||l("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h1,{id:"criptografía-post-cuántica-lamassuq",children:"Criptografía post-cuántica (LamassuQ)"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["LamassuQ incorpora soporte de criptografía post-cuántica (PQC) a la plataforma: el servicio ",e.jsx(i.a,{href:"/docs/manual/servicios-core/kms",children:"KMS"})," puede generar e importar claves post-cuánticas, firmar y verificar con ellas, y el servicio de ",e.jsx(i.a,{href:"/docs/manual/servicios-core/cas",children:"CA"})," puede emitir certificados X.509 apoyados en estas claves, incluidas cadenas de certificación mixtas en las que conviven algoritmos clásicos y post-cuánticos."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"El objetivo es preparar la PKI ante la amenaza de un computador cuántico suficiente para romper la criptografía asimétrica actual, manteniendo al mismo tiempo la compatibilidad con los algoritmos clásicos ya desplegados."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"qué-aporta-lamassuq",children:"Qué aporta LamassuQ"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Nuevos algoritmos de firma"})," en el KMS: ML-DSA, SLH-DSA y firmas compuestas (",e.jsx(i.em,{children:"composite"}),") que combinan ML-DSA con RSA, ECDSA o Ed25519."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Generación e importación de claves"})," post-cuánticas a través del flujo habitual de claves del KMS."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Firma y verificación"})," con los nuevos algoritmos, sobre el mensaje en claro (",e.jsx(i.em,{children:"pure signing"}),")."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"CAs post-cuánticas"}),": creación e importación de autoridades de certificación con claves ML-DSA, SLH-DSA o compuestas, y emisión de certificados a partir de ellas."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Cadenas mixtas"}),": un motor X.509 puede firmar certificados cruzando familias de algoritmos (por ejemplo, una CA SLH-DSA que emite una hoja ECDSA, o una CA ECDSA que firma un CSR firmado con SLH-DSA)."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"alcance-y-limitaciones",children:"Alcance y limitaciones"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["La funcionalidad se expone a través de la ",e.jsx(i.strong,{children:"API REST y el SDK de Go"}),". Los ejemplos de esta página utilizan ambos canales."]}),`
`,e.jsxs(i.li,{children:["El soporte PQC está disponible de forma completa en el ",e.jsx(i.strong,{children:"motor criptográfico software"})," (y en el motor File System, que delega en él). Consulte la ",e.jsx(i.a,{href:"#compatibilidad-con-motores-criptogr%C3%A1ficos",children:"matriz de compatibilidad"})," para conocer el estado del resto de motores."]}),`
`,e.jsxs(i.li,{children:["Los algoritmos PQC de Lamassu son ",e.jsx(i.strong,{children:"algoritmos de firma"}),". No se ha añadido soporte de cifrado/encapsulación de claves (ML-KEM) ni mecanismos de cifrado post-cuántico."]}),`
`,e.jsxs(i.li,{children:["LamassuQ se distribuye mediante ",e.jsx(i.strong,{children:"imágenes de contenedor específicas"})," y una ",e.jsx(i.strong,{children:"imagen de Go con soporte PQC"}),". Consulte la sección de ",e.jsx(i.a,{href:"#despliegue",children:"despliegue"}),"."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"algoritmos-soportados",children:"Algoritmos soportados"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["El KMS identifica cada tipo de clave con un valor de ",e.jsx(i.code,{children:"algorithm"})," y un parámetro ",e.jsx(i.code,{children:"size"}),". Los algoritmos añadidos por LamassuQ son los siguientes:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsxs(i.th,{style:{textAlign:"left"},children:["Algoritmo (",e.jsx(i.code,{children:"algorithm"}),")"]}),e.jsxs(i.th,{style:{textAlign:"left"},children:["Parámetros (",e.jsx(i.code,{children:"size"}),")"]}),e.jsx(i.th,{style:{textAlign:"left"},children:"Estándar"}),e.jsx(i.th,{style:{textAlign:"left"},children:"Descripción"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"ML-DSA"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"44, 65, 87"}),e.jsx(i.td,{style:{textAlign:"left"},children:"FIPS 204 (ML-DSA-44/65/87)"}),e.jsxs(i.td,{style:{textAlign:"left"},children:["Firma post-cuántica basada en retículos (",e.jsx(i.em,{children:"lattice"}),")."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"SLH-DSA"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"1–12 (conjunto de parámetros)"}),e.jsx(i.td,{style:{textAlign:"left"},children:"FIPS 205"}),e.jsxs(i.td,{style:{textAlign:"left"},children:["Firma post-cuántica basada en hash (",e.jsx(i.em,{children:"stateless hash-based"}),"), considerada el enfoque más conservador."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"Composite-ML-DSA-RSA"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"variante 1–8"}),e.jsx(i.td,{style:{textAlign:"left"},children:"firma híbrida"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Combina ML-DSA con una firma RSA (RSA-PSS o RSA-PKCS#1 v1.5)."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"Composite-ML-DSA-ECDSA"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"variante 9–13"}),e.jsx(i.td,{style:{textAlign:"left"},children:"firma híbrida"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Combina ML-DSA con una firma ECDSA."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"Composite-ML-DSA-Ed25519"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"variante 14–15"}),e.jsx(i.td,{style:{textAlign:"left"},children:"firma híbrida"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Combina ML-DSA con Ed25519."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"Ed25519"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"256 (fijo)"}),e.jsx(i.td,{style:{textAlign:"left"},children:"firma clásica"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Incluido en el mismo flujo de generación e importación."})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Las firmas compuestas (",e.jsx(i.em,{children:"composite"}),") producen una única firma que valida contra las dos claves del par: la post-cuántica y la clásica. Son útiles durante la migración, cuando el verificador aún no soporta algoritmos PQC o se exige redundancia criptográfica."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"conjuntos-de-parámetros-slh-dsa",children:"Conjuntos de parámetros SLH-DSA"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Para ",e.jsx(i.code,{children:"SLH-DSA"})," el valor de ",e.jsx(i.code,{children:"size"})," selecciona el conjunto de parámetros FIPS 205:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"size"})}),e.jsx(i.th,{style:{textAlign:"left"},children:"Conjunto de parámetros"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"1"}),e.jsx(i.td,{style:{textAlign:"left"},children:"SLH-DSA-SHA2-128s"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"2"}),e.jsx(i.td,{style:{textAlign:"left"},children:"SLH-DSA-SHA2-128f"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"3"}),e.jsx(i.td,{style:{textAlign:"left"},children:"SLH-DSA-SHA2-192s"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"4"}),e.jsx(i.td,{style:{textAlign:"left"},children:"SLH-DSA-SHA2-192f"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"5"}),e.jsx(i.td,{style:{textAlign:"left"},children:"SLH-DSA-SHA2-256s"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"6"}),e.jsx(i.td,{style:{textAlign:"left"},children:"SLH-DSA-SHA2-256f"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"7"}),e.jsx(i.td,{style:{textAlign:"left"},children:"SLH-DSA-SHAKE-128s"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"8"}),e.jsx(i.td,{style:{textAlign:"left"},children:"SLH-DSA-SHAKE-128f"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"9"}),e.jsx(i.td,{style:{textAlign:"left"},children:"SLH-DSA-SHAKE-192s"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"10"}),e.jsx(i.td,{style:{textAlign:"left"},children:"SLH-DSA-SHAKE-192f"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"11"}),e.jsx(i.td,{style:{textAlign:"left"},children:"SLH-DSA-SHAKE-256s"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"12"}),e.jsx(i.td,{style:{textAlign:"left"},children:"SLH-DSA-SHAKE-256f"})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Los conjuntos terminados en ",e.jsx(i.code,{children:"s"})," (",e.jsx(i.em,{children:"small"}),") optimizan el tamaño de firma y los terminados en ",e.jsx(i.code,{children:"f"})," (",e.jsx(i.em,{children:"fast"}),") la velocidad de firma."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"variantes-compuestas",children:"Variantes compuestas"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Para las claves compuestas, el valor de ",e.jsx(i.code,{children:"size"})," selecciona la variante dentro del registro de algoritmos compuestos de la librería criptográfica con la que se ha construido Lamassu (un ",e.jsx(i.em,{children:"fork"})," con soporte PQC de la librería estándar de Go):"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{style:{textAlign:"left"},children:"Familia"}),e.jsx(i.th,{style:{textAlign:"left"},children:"Variantes admitidas"}),e.jsx(i.th,{style:{textAlign:"left"},children:"Composiciones disponibles"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"Composite-ML-DSA-RSA"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"1–8"}),e.jsx(i.td,{style:{textAlign:"left"},children:"MLDSA44_RSA2048_PSS_SHA256, MLDSA44_RSA2048_PKCS15_SHA256, MLDSA65_RSA3072_PSS_SHA512, MLDSA65_RSA3072_PKCS15_SHA512, MLDSA65_RSA4096_PSS_SHA512, MLDSA65_RSA4096_PKCS15_SHA512, MLDSA87_RSA3072_PSS_SHA512, MLDSA87_RSA4096_PSS_SHA512"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"Composite-ML-DSA-ECDSA"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"9–13"}),e.jsx(i.td,{style:{textAlign:"left"},children:"MLDSA44_ECDSA_P256_SHA256, MLDSA65_ECDSA_P256_SHA512, MLDSA65_ECDSA_P384_SHA512, MLDSA87_ECDSA_P384_SHA512, MLDSA87_ECDSA_P521_SHA512"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"Composite-ML-DSA-Ed25519"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"14–15"}),e.jsx(i.td,{style:{textAlign:"left"},children:"MLDSA44_Ed25519_SHA512, MLDSA65_Ed25519_SHA512"})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"La primera parte del nombre indica la variante ML-DSA (44, 65 o 87) y la segunda el algoritmo clásico que la acompaña. El algoritmo exacto asociado a cada variante queda reflejado en los metadatos de la clave y en los certificados que se emitan con ella."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"compatibilidad-con-motores-criptográficos",children:"Compatibilidad con motores criptográficos"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Al crear o importar una clave, Lamassu comprueba que la especificación de clave (tipo y tamaño) esté declarada como soportada por el motor criptográfico seleccionado."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{style:{textAlign:"left"},children:"Motor"}),e.jsx(i.th,{style:{textAlign:"left"},children:"Claves PQC en su catálogo"}),e.jsx(i.th,{style:{textAlign:"left"},children:"Crear / importar claves PQC"}),e.jsx(i.th,{style:{textAlign:"left"},children:"Firmar / verificar con PQC"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"Software (Go)"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Sí"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Sí"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Sí"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"File System"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Sí"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Sí"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Sí"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"HashiCorp Vault KV2"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Sí*"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Sí"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"AWS Secrets Manager"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Sí*"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Sí"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"AWS KMS"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"Azure KeyVault"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"Azure KeyVault Secrets"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"PKCS#11"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"}),e.jsx(i.td,{style:{textAlign:"left"},children:"No"})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"El motor Software admite la matriz completa: RSA 1024–15360, ECDSA P-224/P-256/P-384/P-521, ML-DSA 44/65/87, SLH-DSA 1–12, compuestas 1–15 y Ed25519. El motor File System delega la generación, la importación y la firma en el motor software, por lo que hereda su soporte completo."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s,{type:"warn",title:"Motores con catálogo PQC pero sin generación ni importación",children:[e.jsxs(i.p,{children:["HashiCorp Vault KV2 y AWS Secrets Manager anuncian el mismo catálogo de tipos de clave que el motor software, por lo que las claves PQC ",e.jsx(i.strong,{children:"aparecen en sus listados"}),". Sin embargo, sus operaciones de generación e importación de claves PQC no están implementadas todavía y devuelven errores del tipo ",e.jsx(i.code,{children:"vaultvk2: unsupported key type (ML-DSA)"})," o ",e.jsx(i.code,{children:"aws/secretsmanager: unsupported key type (ML-DSA)"}),"."]}),e.jsxs(i.p,{children:["Estos motores ",e.jsx(i.strong,{children:"sí pueden custodiar y firmar"})," con una clave PQC: el motor descarga la clave privada del almacén y las operaciones de firma se ejecutan mediante las primitivas PQC del motor software. La limitación afecta a la creación y a la importación, no al uso posterior de la clave."]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Los motores AWS KMS, Azure KeyVault, Azure KeyVault Secrets y PKCS#11 no incluyen tipos de clave PQC en su catálogo y rechazan cualquier especificación de clave post-cuántica con un error de tipo ",e.jsx(i.em,{children:"unsupported key type"}),". Para despliegues con HSM, considere una estrategia híbrida: claves clásicas custodiadas en el HSM y claves PQC en el motor software (consulte ",e.jsx(i.a,{href:"#recomendaciones-de-migraci%C3%B3n-a-pqc",children:"Recomendaciones de migración"}),")."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"crear-claves-post-cuánticas",children:"Crear claves post-cuánticas"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["La generación de claves PQC utiliza el mismo endpoint del KMS que los algoritmos clásicos: ",e.jsx(i.code,{children:"POST /v1/keys"}),". El cuerpo de la petición indica el algoritmo y el tamaño o variante:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"POST /v"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/keys"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "algorithm"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ML-DSA"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "size"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"65"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "engine_id"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"default"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "name"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"pqc-signing-key"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "tags"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ["}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"pqc"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"fips204"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"],"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "metadata"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {}"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Valores admitidos de ",e.jsx(i.code,{children:"algorithm"})," y ",e.jsx(i.code,{children:"size"}),":"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"algorithm"})}),e.jsx(i.th,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"size"})})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"ML-DSA"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"44, 65 o 87"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"SLH-DSA"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"1 a 12"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"Composite-ML-DSA-RSA"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"1 a 8"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"Composite-ML-DSA-ECDSA"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"9 a 13"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"Composite-ML-DSA-Ed25519"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"14 a 15"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"Ed25519"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"256 (se aplica automáticamente)"})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Si no se indica ",e.jsx(i.code,{children:"engine_id"}),", la clave se crea en el motor por defecto configurado en el despliegue. Para las claves compuestas, la variante debe pertenecer a la familia indicada en ",e.jsx(i.code,{children:"algorithm"}),"; por ejemplo, la variante 9 (ECDSA) no es válida para ",e.jsx(i.code,{children:"Composite-ML-DSA-RSA"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s,{type:"warn",title:"Errores frecuentes",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"invalid MLDSA key size"}),": el tamaño indicado no es 44, 65 ni 87."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"invalid SLH-DSA parameter set (use 1-12)"}),": el conjunto de parámetros está fuera del rango 1–12."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"invalid Composite-ML-DSA variant (use 1-15)"}),": la variante está fuera del rango 1–15."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"composite variant N is not valid for key type X"}),": la variante existe, pero pertenece a otra familia compuesta."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.em,{children:"unsupported key type"})," procedente del motor: el motor seleccionado no admite la especificación de clave PQC. Consulte la ",e.jsx(i.a,{href:"#compatibilidad-con-motores-criptogr%C3%A1ficos",children:"matriz de compatibilidad"}),"."]}),`
`]})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Con el SDK de Go, la misma operación se realiza con ",e.jsx(i.code,{children:"CreateKey"}),", que admite exactamente los mismos valores de algoritmo y tamaño:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.77.105-.13.198-.27.315-.434H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.97.596-1.274a.315.315 0 01.292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 01-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.07 3.096.571.62.41 1.063.97 1.356 1.648.07.105.023.164-.117.2m3.868 6.461c-1.064-.024-2.034-.328-2.852-1.029a3.665 3.665 0 01-1.262-2.255c-.21-1.32.152-2.489.947-3.529.853-1.122 1.881-1.706 3.272-1.95 1.192-.21 2.314-.095 3.33.595.923.63 1.496 1.484 1.648 2.605.198 1.578-.257 2.863-1.344 3.962-.771.783-1.718 1.273-2.805 1.495-.315.06-.63.07-.934.106zm2.78-4.72c-.011-.153-.011-.27-.034-.387-.21-1.157-1.274-1.81-2.384-1.554-1.087.245-1.788.935-2.045 2.033-.21.912.234 1.835 1.075 2.21.643.28 1.285.244 1.905-.07.923-.48 1.425-1.228 1.484-2.233z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"key, err "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" kmsClient."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CreateKey"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ctx, "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"services"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CreateKeyInput"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Algorithm: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ML-DSA"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Size:      "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"65"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    EngineID:  "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"default"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Name:      "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"pqc-signing-key"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Tags:      []"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"string"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"pqc"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"fips204"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"},"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Metadata:  "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"map"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"["}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"string"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"any"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{},"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"})"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"importar-claves-post-cuánticas",children:"Importar claves post-cuánticas"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["La importación también reutiliza el endpoint clásico del KMS: ",e.jsx(i.code,{children:"POST /v1/keys/import"}),". Lamassu parsea la clave privada en formato ",e.jsx(i.strong,{children:"PKCS#8"})," (PEM, codificada en Base64 en el campo ",e.jsx(i.code,{children:"private_key"}),") e identifica automáticamente el algoritmo y los parámetros:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"POST /v"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/keys/import"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "private_key"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"<PEM de la clave privada en Base64>"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "engine_id"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"default"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "name"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"pqc-imported-key"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "tags"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ["}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"pqc"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"],"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "metadata"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {}"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Al parsear la clave, Lamassu deduce el tipo y el tamaño sin que sea necesario indicarlos:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Claves ML-DSA: se reconocen los parámetros ML-DSA-44, ML-DSA-65 y ML-DSA-87."}),`
`,e.jsxs(i.li,{children:["Claves SLH-DSA: se reconocen a partir del nombre del esquema del parámetro, con el prefijo ",e.jsx(i.code,{children:"SLH-DSA-"})," (por ejemplo, ",e.jsx(i.code,{children:"SLH-DSA-SHA2-128s"}),"). El nombre del esquema se traduce al conjunto de parámetros correspondiente de la ",e.jsx(i.a,{href:"#conjuntos-de-par%C3%A1metros-slh-dsa",children:"tabla anterior"}),"."]}),`
`,e.jsx(i.li,{children:"Claves compuestas: se reconoce el algoritmo compuesto del par ML-DSA + clásico y se deriva la variante correspondiente."}),`
`,e.jsx(i.li,{children:"Claves Ed25519: tamaño fijo 256."}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Como en el caso de la generación, la especificación deducida debe estar soportada por el motor de destino."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"firmar-y-verificar-con-claves-post-cuánticas",children:"Firmar y verificar con claves post-cuánticas"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Las operaciones de firma y verificación se realizan con los endpoints habituales del KMS (",e.jsx(i.code,{children:"POST /v1/keys/:id/sign"})," y ",e.jsx(i.code,{children:"POST /v1/keys/:id/verify"}),"). Los algoritmos de firma disponibles para claves PQC son los siguientes:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{style:{textAlign:"left"},children:"Clave"}),e.jsx(i.th,{style:{textAlign:"left"},children:"Algoritmo de firma"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"ML-DSA 44"}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"MLDSA_44_PURE"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"ML-DSA 65"}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"MLDSA_65_PURE"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"ML-DSA 87"}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"MLDSA_87_PURE"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"SLH-DSA"}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"SLHDSA_PURE"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"Composite-ML-DSA-RSA"}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"COMPOSITE_MLDSA_RSA_PURE"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"Composite-ML-DSA-ECDSA"}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"COMPOSITE_MLDSA_ECDSA_PURE"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"Composite-ML-DSA-Ed25519"}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"COMPOSITE_MLDSA_ED25519_PURE"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:"Ed25519"}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"Ed25519_PURE"})})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Todos estos algoritmos son de modo ",e.jsx(i.em,{children:"pure"}),": la firma se calcula ",e.jsx(i.strong,{children:"directamente sobre el mensaje en claro"}),", sin un paso previo de resumen (",e.jsx(i.em,{children:"digest"}),"). Por ello, la petición debe usar el tipo de mensaje ",e.jsx(i.code,{children:"raw"}),"; los algoritmos PQC no aceptan firmar sobre un hash precalculado. El campo ",e.jsx(i.code,{children:"message"})," es un array de bytes, por lo que el mensaje se envía codificado en ",e.jsx(i.strong,{children:"Base64"}),":"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"POST /v"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/keys/{"}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"key_id"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}/sign"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "algorithm"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"MLDSA_65_PURE"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "message"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"bWVuc2FqZSBhIGZpcm1hcg=="'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "message_type"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"raw"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"En el caso de las claves compuestas, la firma devuelta es la firma compuesta completa, y la verificación valida simultáneamente la parte ML-DSA y la parte clásica (RSA, ECDSA o Ed25519) según la variante de la clave."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["La verificación (",e.jsx(i.code,{children:"POST /v1/keys/:id/verify"}),") usa el mismo cuerpo que la firma, añadiendo el campo ",e.jsx(i.code,{children:"signature"})," (también en Base64) con la firma que se desea comprobar, obtenida del endpoint de firma."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"autoridades-de-certificación-post-cuánticas",children:"Autoridades de certificación post-cuánticas"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"crear-una-ca-con-clave-pqc",children:"Crear una CA con clave PQC"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["La creación de una CA utiliza el endpoint ",e.jsx(i.code,{children:"POST /v1/cas"})," con el bloque ",e.jsx(i.code,{children:"key_metadata"}),", que indica el tipo de clave y su tamaño o variante. Lamassu genera la clave en el motor indicado reutilizando el flujo de ",e.jsx(i.a,{href:"#crear-claves-post-cu%C3%A1nticas",children:"creación de claves"}),":"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"POST /v"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/cas"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "id"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"pqc-root-ca"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "subject"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'    "common_name"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"PQC Root CA"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "key_metadata"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'    "type"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"SLH-DSA"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'    "bits"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "engine_id"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"default"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "profile_id"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"b1a7d0c3-4e2f-4a8b-9c6d-5f0e1a2b3c4d"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "ca_expiration"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'    "type"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Duration"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'    "duration"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1y"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Los valores admitidos en ",e.jsx(i.code,{children:"key_metadata.type"})," son los mismos que los algoritmos del KMS: ",e.jsx(i.code,{children:"ML-DSA"}),", ",e.jsx(i.code,{children:"SLH-DSA"}),", ",e.jsx(i.code,{children:"Composite-ML-DSA-RSA"}),", ",e.jsx(i.code,{children:"Composite-ML-DSA-ECDSA"}),", ",e.jsx(i.code,{children:"Composite-ML-DSA-Ed25519"}),", junto con los clásicos ",e.jsx(i.code,{children:"RSA"}),", ",e.jsx(i.code,{children:"ECDSA"})," y ",e.jsx(i.code,{children:"Ed25519"}),". En ",e.jsx(i.code,{children:"bits"})," se indica el tamaño o variante según la ",e.jsx(i.a,{href:"#algoritmos-soportados",children:"tabla de algoritmos"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["El campo ",e.jsx(i.code,{children:"profile_id"})," es obligatorio y debe referenciar un perfil de emisión de tipo CA existente: si se omite, la petición responde con un error de validación (400), y si el perfil indicado no existe, con un 404. La expiración se expresa con el bloque ",e.jsx(i.code,{children:"ca_expiration"}),", que admite una duración relativa (",e.jsx(i.code,{children:'"type": "Duration"'}),", con valores como ",e.jsx(i.code,{children:'"1y"'}),", ",e.jsx(i.code,{children:'"6m"'})," o ",e.jsx(i.code,{children:'"30d"'}),") o una fecha absoluta (",e.jsx(i.code,{children:'"type": "Time"'}),")."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"importar-una-ca-con-clave-pqc",children:"Importar una CA con clave PQC"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["La importación de CAs (",e.jsx(i.code,{children:"POST /v1/cas/import"}),") admite claves privadas post-cuánticas generadas externamente. La clave privada se envía en formato PEM codificado en Base64 y el SDK la serializa internamente a PKCS#8, soportando los mismos tipos de clave que la importación de claves del KMS: ML-DSA, SLH-DSA, compuestas y Ed25519, además de RSA y ECDSA."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"cadenas-de-certificación-mixtas",children:"Cadenas de certificación mixtas"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"El motor X.509 de Lamassu puede firmar certificados cruzando familias de algoritmos entre la CA emisora y el certificado emitido. Esto habilita arquitecturas de migración graduales, entre otras:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"CA raíz SLH-DSA que emite certificados de hoja ECDSA."}),`
`,e.jsx(i.li,{children:"CA ECDSA que firma solicitudes de certificado (CSR) firmadas con SLH-DSA."}),`
`,e.jsx(i.li,{children:"Cadenas en las que raíz e intermedia son post-cuánticas y la hoja es clásica, o viceversa."}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"La cadena elegida debe ser verificable por los consumidores finales de los certificados: si un dispositivo o servicio no soporta todavía los algoritmos PQC, las firmas compuestas pueden servir como punto de transición."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s,{type:"warn",title:"Expiración e inconsistencias con claves PQC",children:e.jsxs(i.p,{children:["Durante la creación o importación de una CA, el servicio puede devolver el error ",e.jsx(i.code,{children:"incompatible expiration time ref"})," si la referencia temporal de validez no es compatible con el certificado que se intenta registrar. El SDK de Go lo mapea a un error de tipo ",e.jsx(i.code,{children:"400"})," (y ",e.jsx(i.code,{children:"500"})," en la creación de CA) para facilitar su gestión desde las integraciones."]})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"sdk-de-go-y-utilidades-criptográficas",children:"SDK de Go y utilidades criptográficas"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"El SDK de Go de LamassuQ expone la funcionalidad PQC a través de los mismos clientes de KMS y CA, además de añadir utilidades criptográficas para generar material PQC de forma local:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"GenerateMLDSAKey(dimensions)"}),": genera una clave ML-DSA (44, 65 o 87)."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"GenerateSLHDSAKey(paramSet)"}),": genera una clave SLH-DSA para el conjunto de parámetros indicado."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"GenerateCompositeMLDSAKey(variant)"}),": genera una clave compuesta para la variante 1–15. Se mantiene también el alias ",e.jsx(i.code,{children:"GenerateCompositeMLDSARSAKey(variant)"})," por compatibilidad."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"GenerateEd25519Key()"}),": genera una clave Ed25519."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"ValidateCertAndPrivKey(...)"}),": valida que un certificado y su clave privada coincidan, extendida para admitir claves ML-DSA y Ed25519 junto a RSA y ECDSA."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Estas utilidades son útiles para preparar material de prueba, automatizar la importación de claves o construir CSR firmadas con algoritmos PQC antes de registrarlas en la plataforma."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"despliegue",children:"Despliegue"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"LamassuQ se construye sobre una cadena de herramientas con soporte criptográfico post-cuántico:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Las imágenes de los servicios se compilan con la imagen de Go con soporte PQC ",e.jsx(i.code,{children:"ghcr.io/lamassuiot/golang-pqc:latest"}),", que incluye las primitivas ML-DSA (paquete ",e.jsx(i.code,{children:"crypto/mldsa"})," del ",e.jsx(i.em,{children:"fork"})," de la librería estándar de Go) y las primitivas SLH-DSA y compuestas de la librería ",e.jsx(i.code,{children:"cloudflare/circl"}),"."]}),`
`,e.jsxs(i.li,{children:["Las imágenes de contenedor de cada servicio se publican con la etiqueta ",e.jsx(i.code,{children:":pqc"}),", por ejemplo ",e.jsx(i.code,{children:"ghcr.io/lamassuiot/lamassu-ca:pqc"})," o ",e.jsx(i.code,{children:"ghcr.io/lamassuiot/lamassu-kms:pqc"}),"."]}),`
`,e.jsxs(i.li,{children:["Existe una imagen ",e.jsx(i.em,{children:"monolítica"})," adicional (",e.jsx(i.code,{children:"ci/monolithic.dockerfile"}),") que agrupa los servicios en un único contenedor."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["El script ",e.jsx(i.code,{children:"deploy-lamassuq.sh"})," automatiza la construcción y publicación de las imágenes ",e.jsx(i.code,{children:":pqc"})," de cada servicio a partir de los ficheros ",e.jsx(i.code,{children:"ci/pq_<componente>.dockerfile"}),". La cadena de herramientas se basa en Go 1.27."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s,{type:"warn",title:"Migración del despliegue",children:e.jsx(i.p,{children:"Para activar el soporte PQC, las imágenes de los servicios y la imagen de Go de compilación deben actualizarse a las versiones PQC. Un despliegue que mezcle imágenes PQC y no-PQC puede provocar inconsistencias, ya que los binarios no-PQC no reconocen los algoritmos añadidos."})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"recomendaciones-de-migración-a-pqc",children:"Recomendaciones de migración a PQC"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Inventariar el estado actual"}),": identifique las CAs, las claves y los perfiles de emisión que operan con RSA y ECDSA, y los consumidores que dependen de ellos."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Empezar por los motores soportados"}),": despliegue un motor Software o File System para alojar las primeras claves PQC de prueba. Hasta que los motores externos y los HSM soporten PQC, mantenga las claves clásicas de producción en sus motores actuales."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Usar firmas compuestas como puente"}),": durante la transición, las claves compuestas ML-DSA + RSA/ECDSA/Ed25519 permiten emitir certificados verificables tanto por consumidores clásicos como por consumidores preparados para PQC."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Probar cadenas mixtas"}),": antes de migrar una raíz de confianza, valide en un entorno de pruebas que los dispositivos y servicios objetivo verifican correctamente las cadenas mixtas y las firmas ",e.jsx(i.em,{children:"pure"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Planificar la renovación de las raíces"}),": la migración definitiva exige emitir nuevas raíces e intermedias post-cuánticas y reemplazar progresivamente las clásicas, respetando los periodos de vida de los certificados ya emitidos."]}),`
`]})})]})}function p(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(n,{...a})}):n(a)}function l(a,i){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}export{o as _markdown,p as default,c as frontmatter,r as lmDiff,d as structuredData,m as toc};
