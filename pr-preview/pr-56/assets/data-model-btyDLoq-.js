import{j as e}from"./index-DqgIL_Rv.js";let r=`

<div className="lm-diff-ins lm-diff-block">
  The tables Lamassu Updates keeps in Postgres, how they relate, and how the schema is created and migrated. This is a reference for operators and integrators who query the database, size it, or plan an upgrade.
</div>

<div className="lm-diff-ins lm-diff-block">
  Native mode tables [#native-mode-tables]
</div>

<div className="lm-diff-ins lm-diff-block">
  Created in Postgres at startup, in the \`updates\` database. The Go types are in \`pkg/models/updates.go\` of the [ota repository](https://github.com/lamassuiot/ota).
</div>

<div className="lm-diff-ins lm-diff-block">
  | Table                             | Holds                                                                                                                                                                                    |
  | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | \`distribution_set\`                | An update pack: name, version, group, type, packaging, status, the sw-description (\`sw_descriptor\`), preconditions, encryption and signature settings, and the per-device build coverage |
  | \`distribution_set_version\`        | A snapshot of each built version, with its signed manifest                                                                                                                               |
  | \`distribution_set_module\`         | The modules of a pack version, keyed by pack, version, module type and name. It also holds catalog modules that belong to no pack, with an empty pack ID                                 |
  | \`artifact\`                        | A global artifact: the catalog entry for an uploaded file, unique by name and version                                                                                                    |
  | \`distribution_set_artifact\`       | The link between a pack version, an artifact and optionally one module                                                                                                                   |
  | \`launchtrack\`                     | A launch campaign: strategy, status, thresholds and batch bookkeeping                                                                                                                    |
  | \`launch_device_assignments\`       | Each device's status within a launch: \`pending\`, \`active\`, \`completed\` or \`failed\`                                                                                                       |
  | \`device_distribution_set_version\` | Which pack version a device currently carries                                                                                                                                            |
  | \`device_distribution_set_update\`  | A device's update history                                                                                                                                                                |
  | \`latest_distribution_set_version\` | The declared latest version per group and pack                                                                                                                                           |
  | \`updates_schema_migrations\`       | One row per data migration that must run only once (the approval-threshold migration)                                                                                                    |
</div>

<div className="lm-diff-ins lm-diff-block">
  File bytes (artifacts, builds, keys) are not in Postgres. They live in the blob stores described under [Configuration](/docs/platform/updates/reference/configuration). The sw-description is in Postgres (a column of the pack and of each module).
</div>

<div className="lm-diff-ins lm-diff-block">
  hawkBit mode tables [#hawkbit-mode-tables]
</div>

<div className="lm-diff-ins lm-diff-block">
  In hawkBit mode, packs, rollouts and jobs live in hawkBit. This service keeps only the following in the same Postgres (the \`updates\` database), for the things hawkBit has no equivalent of:
</div>

<div className="lm-diff-ins lm-diff-block">
  | Table                             | Holds                                                                                                                                                                                          |
  | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | \`hawkbit_staged_artifact\`         | Bytes from \`POST /artifacts\`. Uploads older than 30 minutes are discarded the next time anyone uploads an artifact, and stay readable until then. They cannot be linked to a pack in this mode |
  | \`hawkbit_artifact_alias\`          | Read when resolving an artifact ID, but nothing writes it any more                                                                                                                             |
  | \`hawkbit_sw_descriptor_v2\`        | sw-descriptions, launch preconditions and rollout flags (a general key-value text store, keyed by instance, kind and ID)                                                                       |
  | \`hawkbit_set_manifest_v2\`         | Signed manifests of built sets                                                                                                                                                                 |
  | \`hawkbit_cancelled_rollout_v2\`    | Rollouts cancelled through this service                                                                                                                                                        |
  | \`latest_distribution_set_version\` | Declared latest versions (shared with native mode)                                                                                                                                             |
</div>

<div className="lm-diff-ins lm-diff-block">
  Rows keyed by a hawkBit ID carry an \`instance_id\`, a marker of the hawkBit data they describe. If hawkBit loses its data and starts again, IDs repeat, and the service stops reading rows written for the old instance. The service re-checks the marker every 30 seconds.
</div>

<div className="lm-diff-ins lm-diff-block">
  hawkBit keeps its own schema in its own \`hawkbit\` database. In the Docker Compose stack, \`init.sql\` creates both databases when the Postgres container first starts.
</div>

<div className="lm-diff-ins lm-diff-block">
  Entity-relationship diagrams [#entity-relationship-diagrams]
</div>

<div className="lm-diff-ins lm-diff-block">
  The native-mode tables, with their main columns. \`*_id\` columns that point at another table are drawn as the relationship lines. These are logical references: the service creates no database foreign-key constraints, and \`FK\` only marks which column holds the reference.
</div>

<div className="lm-diff-ins lm-diff-block">
  Packs, modules and artifacts [#packs-modules-and-artifacts]
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  erDiagram
    DISTRIBUTION_SET ||--o{ DISTRIBUTION_SET_VERSION : "snapshot per built version"
    DISTRIBUTION_SET |o--o{ DISTRIBUTION_SET_MODULE : "composed of"
    DISTRIBUTION_SET ||--o{ DISTRIBUTION_SET_ARTIFACT : "links"
    ARTIFACT ||--o{ DISTRIBUTION_SET_ARTIFACT : "referenced by"
    DISTRIBUTION_SET_MODULE |o--o{ DISTRIBUTION_SET_ARTIFACT : "owns"
    DISTRIBUTION_SET_MODULE |o--o{ DISTRIBUTION_SET_MODULE : "copied from"
    DISTRIBUTION_SET ||--o{ LATEST_DISTRIBUTION_SET_VERSION : "declared latest"

    DISTRIBUTION_SET {
      string id PK
      string name
      string version
      string group_id
      string type
      string packaging
      string status
      string uri
      string encryption_mode
      string sw_descriptor
      string last_build_error
    }
    DISTRIBUTION_SET_VERSION {
      string id PK
      string distribution_set_id FK
      string version
      string checksum
      string manifest_json
      string manifest_signature
    }
    DISTRIBUTION_SET_MODULE {
      string id PK
      string distribution_set_id FK
      string distribution_set_version
      string type
      string name
      string version
      string delivery_intent
      boolean built
      string sw_descriptor
      string release_notes
      string source_module_id FK
    }
    ARTIFACT {
      string id PK
      string name
      string version
      string filename
      string checksum
      int size
    }
    DISTRIBUTION_SET_ARTIFACT {
      string id PK
      string distribution_set_id FK
      string distribution_set_version
      string artifact_id FK
      string distribution_set_module_id FK
    }
    LATEST_DISTRIBUTION_SET_VERSION {
      string id PK
      string group_id
      string distribution_set_id FK
      string version
    }
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Launches and devices [#launches-and-devices]
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  erDiagram
    DISTRIBUTION_SET ||--o{ LAUNCHTRACK : "launched as"
    LAUNCHTRACK ||--o{ LAUNCH_DEVICE_ASSIGNMENTS : "targets"
    DISTRIBUTION_SET ||--o{ DEVICE_DISTRIBUTION_SET_VERSION : "installed on"
    DISTRIBUTION_SET ||--o{ DEVICE_DISTRIBUTION_SET_UPDATE : "update attempts"
    LAUNCHTRACK |o--o{ DEVICE_DISTRIBUTION_SET_UPDATE : "caused by"
    LAUNCHTRACK |o--o{ DEVICE_DISTRIBUTION_SET_VERSION : "installed by"

    DISTRIBUTION_SET {
      string id PK
      string name
      string group_id
    }
    LAUNCHTRACK {
      string id PK
      string group_id
      string distribution_set_id FK
      string name
      string status
      string workflow_type
      string rollout_type
      int rollout_value
      string test_device_id
      boolean auto
      int approval_threshold
      int error_threshold
      int total_devices
      int current_batch_size
      int current_batch_index
      boolean aborted
      timestamp scheduled_at
    }
    LAUNCH_DEVICE_ASSIGNMENTS {
      string launch_id PK
      string device_id PK
      string status
      int batch_index
      timestamp dispatched_at
      timestamp completed_at
    }
    DEVICE_DISTRIBUTION_SET_VERSION {
      string id PK
      string device_id
      string distribution_set_id FK
      string version
      string launch_id
      string job_id
      timestamp installed_at
    }
    DEVICE_DISTRIBUTION_SET_UPDATE {
      string id PK
      string device_id
      string distribution_set_id FK
      string launch_id
      string job_id
      string version_from
      string version_to
      string status
      timestamp timestamp_completed
    }
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Values worth knowing:
</div>

<div className="lm-diff-ins lm-diff-block">
  * \`distribution_set.status\` is \`draft\`, \`built\` or \`build_failed\`. \`packaging\` is \`swu\` or \`non-swu\`. \`encryption_mode\` is empty, \`shared\` or \`per-device\`.
  * \`launchtrack.status\` is \`running\`, \`paused\`, \`cancelled\` or \`completed\`. A new launch is stored with an empty status, which means running. \`aborted\` is true for a cancelled launch (operator or error threshold) and stops every rollout path. The precondition outcome of the launch (\`forced_preconditions\`, \`precondition_failures\`) is stored on the row, but not the preconditions themselves: those live on the pack.
  * \`rollout_type\` is not validated: only the value \`percentage\` makes \`rollout_value\` a percentage, and any other value (the dashboard sends \`numeric\`, the examples use \`fixed\`) makes it a device count.
  * \`launch_device_assignments.status\` is \`pending\`, \`active\`, \`completed\` or \`failed\`. (\`cancelled\` also exists as a value, but only hawkBit mode reports it, for a canary whose launch was cancelled; it is never stored.)
  * \`device_distribution_set_update.status\` is \`pending\`, \`running\`, \`success\` or \`failed\` (hawkBit mode can also report \`cancelled\`), and its \`source\` is \`service\`.
  * \`distribution_set_module\` is unique by pack, pack version, type and name. A standalone catalog module has an empty \`distribution_set_id\`, and its \`distribution_set_version\` equals its own \`version\`.
  * \`distribution_set_version\` is unique by pack and version, and \`distribution_set_artifact\` by pack, version and artifact.
</div>

<div className="lm-diff-ins lm-diff-block">
  Not drawn: \`updates_schema_migrations\`, a marker table the start-up data migrations use, and the hawkBit-mode tables listed above.
</div>

<div className="lm-diff-ins lm-diff-block">
  Reading the diagram [#reading-the-diagram]
</div>

<div className="lm-diff-ins lm-diff-block">
  * A **pack** (\`distribution_set\`) is one row that moves through versions. Each built version is snapshotted into \`distribution_set_version\`, with its signed manifest.
  * **Modules** and **artifacts** are separate: an artifact is a file in the global catalog, and \`distribution_set_artifact\` links it to a pack version (and optionally to one module). A module whose \`distribution_set_id\` is empty is a catalog module that no pack holds yet.
  * A **launch** (\`launchtrack\`) targets a group through one assignment row per device. The assignment moves \`pending\` → \`active\` → \`completed\` or \`failed\`, and \`batch_index\` records which batch dispatched it.
  * Two device tables answer different questions. \`device_distribution_set_version\` is what a device carries **now**. \`device_distribution_set_update\` is the **history** of attempts, with \`version_from\` and \`version_to\`.
  * \`latest_distribution_set_version\` is the version an operator declared devices of a group should be on, used for drift and compliance.
</div>

<div className="lm-diff-ins lm-diff-block">
  Schema creation and migrations [#schema-creation-and-migrations]
</div>

<div className="lm-diff-ins lm-diff-block">
  There are no migration files. In native mode the service creates and upgrades its own schema when it starts, holding a Postgres lock so that replicas starting together do not race. It runs these steps in order (hawkBit mode only creates its six tables):
</div>

<div className="lm-diff-ins lm-diff-block">
  1. **Rename step** (\`MigrateDistributionSetNaming\`). Databases created before the "update pack" → "distribution set" rename have their tables and columns renamed. It runs before step 2 so that the new tables are not created empty beside the old ones.
  2. **Create and add** (GORM \`AutoMigrate\`). Missing tables and columns are created. It never drops or renames anything.
  3. **Data migrations.** Standalone modules (\`software_module_definition\` rows move into the module and artifact tables, keeping IDs and files, and the old table is dropped), device assignments (rebuilt from the legacy launch columns), and approval-threshold semantics.
</div>

<div className="lm-diff-ins lm-diff-block">
  Most steps check the current schema instead of a version number, and the approval-threshold migration records a row in \`updates_schema_migrations\` so it runs only once. Repeated starts are safe, and a new database has nothing to migrate. After the schema steps the service also copies binaries from the legacy pack-scoped layout on disk into the artifact store, skipping any that are already there.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`init.sql\` is a Docker Compose seed: it creates the \`updates\` and \`hawkbit\` databases and still contains older table definitions, so do not use it to define the schema yourself.
</div>

<div className="lm-diff-ins lm-diff-block">
  See [Operations](/docs/platform/updates/operations#upgrades) for what to do before upgrading.
</div>

<div className="lm-diff-ins lm-diff-block">
  Next steps [#next-steps]
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Configuration" description="Blob stores, storage and every config field." href="/docs/platform/updates/reference/configuration" />

    <Card title="Operations" description="Back up, scale and upgrade the database." href="/docs/platform/updates/operations" />
  </Cards>
</div>
`,l={title:"Data model",description:"The tables the service keeps, how they relate, and how the schema is created and migrated."},o={isNew:!0,changes:29,title:void 0,description:void 0},c={contents:[{heading:void 0,content:"The tables Lamassu Updates keeps in Postgres, how they relate, and how the schema is created and migrated. This is a reference for operators and integrators who query the database, size it, or plan an upgrade."},{heading:"native-mode-tables",content:"Created in Postgres at startup, in the `updates` database. The Go types are in `pkg/models/updates.go` of the ota repository."},{heading:"native-mode-tables",content:"Table"},{heading:"native-mode-tables",content:"Holds"},{heading:"native-mode-tables",content:"`distribution_set`"},{heading:"native-mode-tables",content:"An update pack: name, version, group, type, packaging, status, the sw-description (`sw_descriptor`), preconditions, encryption and signature settings, and the per-device build coverage"},{heading:"native-mode-tables",content:"`distribution_set_version`"},{heading:"native-mode-tables",content:"A snapshot of each built version, with its signed manifest"},{heading:"native-mode-tables",content:"`distribution_set_module`"},{heading:"native-mode-tables",content:"The modules of a pack version, keyed by pack, version, module type and name. It also holds catalog modules that belong to no pack, with an empty pack ID"},{heading:"native-mode-tables",content:"`artifact`"},{heading:"native-mode-tables",content:"A global artifact: the catalog entry for an uploaded file, unique by name and version"},{heading:"native-mode-tables",content:"`distribution_set_artifact`"},{heading:"native-mode-tables",content:"The link between a pack version, an artifact and optionally one module"},{heading:"native-mode-tables",content:"`launchtrack`"},{heading:"native-mode-tables",content:"A launch campaign: strategy, status, thresholds and batch bookkeeping"},{heading:"native-mode-tables",content:"`launch_device_assignments`"},{heading:"native-mode-tables",content:"Each device's status within a launch: `pending`, `active`, `completed` or `failed`"},{heading:"native-mode-tables",content:"`device_distribution_set_version`"},{heading:"native-mode-tables",content:"Which pack version a device currently carries"},{heading:"native-mode-tables",content:"`device_distribution_set_update`"},{heading:"native-mode-tables",content:"A device's update history"},{heading:"native-mode-tables",content:"`latest_distribution_set_version`"},{heading:"native-mode-tables",content:"The declared latest version per group and pack"},{heading:"native-mode-tables",content:"`updates_schema_migrations`"},{heading:"native-mode-tables",content:"One row per data migration that must run only once (the approval-threshold migration)"},{heading:"native-mode-tables",content:"File bytes (artifacts, builds, keys) are not in Postgres. They live in the blob stores described under Configuration. The sw-description is in Postgres (a column of the pack and of each module)."},{heading:"hawkbit-mode-tables",content:"In hawkBit mode, packs, rollouts and jobs live in hawkBit. This service keeps only the following in the same Postgres (the `updates` database), for the things hawkBit has no equivalent of:"},{heading:"hawkbit-mode-tables",content:"Table"},{heading:"hawkbit-mode-tables",content:"Holds"},{heading:"hawkbit-mode-tables",content:"`hawkbit_staged_artifact`"},{heading:"hawkbit-mode-tables",content:"Bytes from `POST /artifacts`. Uploads older than 30 minutes are discarded the next time anyone uploads an artifact, and stay readable until then. They cannot be linked to a pack in this mode"},{heading:"hawkbit-mode-tables",content:"`hawkbit_artifact_alias`"},{heading:"hawkbit-mode-tables",content:"Read when resolving an artifact ID, but nothing writes it any more"},{heading:"hawkbit-mode-tables",content:"`hawkbit_sw_descriptor_v2`"},{heading:"hawkbit-mode-tables",content:"sw-descriptions, launch preconditions and rollout flags (a general key-value text store, keyed by instance, kind and ID)"},{heading:"hawkbit-mode-tables",content:"`hawkbit_set_manifest_v2`"},{heading:"hawkbit-mode-tables",content:"Signed manifests of built sets"},{heading:"hawkbit-mode-tables",content:"`hawkbit_cancelled_rollout_v2`"},{heading:"hawkbit-mode-tables",content:"Rollouts cancelled through this service"},{heading:"hawkbit-mode-tables",content:"`latest_distribution_set_version`"},{heading:"hawkbit-mode-tables",content:"Declared latest versions (shared with native mode)"},{heading:"hawkbit-mode-tables",content:"Rows keyed by a hawkBit ID carry an `instance_id`, a marker of the hawkBit data they describe. If hawkBit loses its data and starts again, IDs repeat, and the service stops reading rows written for the old instance. The service re-checks the marker every 30 seconds."},{heading:"hawkbit-mode-tables",content:"hawkBit keeps its own schema in its own `hawkbit` database. In the Docker Compose stack, `init.sql` creates both databases when the Postgres container first starts."},{heading:"entity-relationship-diagrams",content:"The native-mode tables, with their main columns. `*_id` columns that point at another table are drawn as the relationship lines. These are logical references: the service creates no database foreign-key constraints, and `FK` only marks which column holds the reference."},{heading:"launches-and-devices",content:"Values worth knowing:"},{heading:"launches-and-devices",content:"`distribution_set.status` is `draft`, `built` or `build_failed`. `packaging` is `swu` or `non-swu`. `encryption_mode` is empty, `shared` or `per-device`."},{heading:"launches-and-devices",content:"`launchtrack.status` is `running`, `paused`, `cancelled` or `completed`. A new launch is stored with an empty status, which means running. `aborted` is true for a cancelled launch (operator or error threshold) and stops every rollout path. The precondition outcome of the launch (`forced_preconditions`, `precondition_failures`) is stored on the row, but not the preconditions themselves: those live on the pack."},{heading:"launches-and-devices",content:"`rollout_type` is not validated: only the value `percentage` makes `rollout_value` a percentage, and any other value (the dashboard sends `numeric`, the examples use `fixed`) makes it a device count."},{heading:"launches-and-devices",content:"`launch_device_assignments.status` is `pending`, `active`, `completed` or `failed`. (`cancelled` also exists as a value, but only hawkBit mode reports it, for a canary whose launch was cancelled; it is never stored.)"},{heading:"launches-and-devices",content:"`device_distribution_set_update.status` is `pending`, `running`, `success` or `failed` (hawkBit mode can also report `cancelled`), and its `source` is `service`."},{heading:"launches-and-devices",content:"`distribution_set_module` is unique by pack, pack version, type and name. A standalone catalog module has an empty `distribution_set_id`, and its `distribution_set_version` equals its own `version`."},{heading:"launches-and-devices",content:"`distribution_set_version` is unique by pack and version, and `distribution_set_artifact` by pack, version and artifact."},{heading:"launches-and-devices",content:"Not drawn: `updates_schema_migrations`, a marker table the start-up data migrations use, and the hawkBit-mode tables listed above."},{heading:"reading-the-diagram",content:"A **pack** (`distribution_set`) is one row that moves through versions. Each built version is snapshotted into `distribution_set_version`, with its signed manifest."},{heading:"reading-the-diagram",content:"**Modules** and **artifacts** are separate: an artifact is a file in the global catalog, and `distribution_set_artifact` links it to a pack version (and optionally to one module). A module whose `distribution_set_id` is empty is a catalog module that no pack holds yet."},{heading:"reading-the-diagram",content:"A **launch** (`launchtrack`) targets a group through one assignment row per device. The assignment moves `pending` → `active` → `completed` or `failed`, and `batch_index` records which batch dispatched it."},{heading:"reading-the-diagram",content:"Two device tables answer different questions. `device_distribution_set_version` is what a device carries **now**. `device_distribution_set_update` is the **history** of attempts, with `version_from` and `version_to`."},{heading:"reading-the-diagram",content:"`latest_distribution_set_version` is the version an operator declared devices of a group should be on, used for drift and compliance."},{heading:"schema-creation-and-migrations",content:"There are no migration files. In native mode the service creates and upgrades its own schema when it starts, holding a Postgres lock so that replicas starting together do not race. It runs these steps in order (hawkBit mode only creates its six tables):"},{heading:"schema-creation-and-migrations",content:'**Rename step** (`MigrateDistributionSetNaming`). Databases created before the "update pack" → "distribution set" rename have their tables and columns renamed. It runs before step 2 so that the new tables are not created empty beside the old ones.'},{heading:"schema-creation-and-migrations",content:"**Create and add** (GORM `AutoMigrate`). Missing tables and columns are created. It never drops or renames anything."},{heading:"schema-creation-and-migrations",content:"**Data migrations.** Standalone modules (`software_module_definition` rows move into the module and artifact tables, keeping IDs and files, and the old table is dropped), device assignments (rebuilt from the legacy launch columns), and approval-threshold semantics."},{heading:"schema-creation-and-migrations",content:"Most steps check the current schema instead of a version number, and the approval-threshold migration records a row in `updates_schema_migrations` so it runs only once. Repeated starts are safe, and a new database has nothing to migrate. After the schema steps the service also copies binaries from the legacy pack-scoped layout on disk into the artifact store, skipping any that are already there."},{heading:"schema-creation-and-migrations",content:"`init.sql` is a Docker Compose seed: it creates the `updates` and `hawkbit` databases and still contains older table definitions, so do not use it to define the schema yourself."},{heading:"schema-creation-and-migrations",content:"See Operations for what to do before upgrading."},{heading:"next-steps",content:'<Card title="Configuration" description="Blob stores, storage and every config field." href="/docs/platform/updates/reference/configuration" />'},{heading:"next-steps",content:'<Card title="Operations" description="Back up, scale and upgrade the database." href="/docs/platform/updates/operations" />'}],headings:[{id:"native-mode-tables",content:"Native mode tables"},{id:"hawkbit-mode-tables",content:"hawkBit mode tables"},{id:"entity-relationship-diagrams",content:"Entity-relationship diagrams"},{id:"packs-modules-and-artifacts",content:"Packs, modules and artifacts"},{id:"launches-and-devices",content:"Launches and devices"},{id:"reading-the-diagram",content:"Reading the diagram"},{id:"schema-creation-and-migrations",content:"Schema creation and migrations"},{id:"next-steps",content:"Next steps"}]};const h=[{depth:2,url:"#native-mode-tables",title:e.jsx(e.Fragment,{children:"Native mode tables"})},{depth:2,url:"#hawkbit-mode-tables",title:e.jsx(e.Fragment,{children:"hawkBit mode tables"})},{depth:2,url:"#entity-relationship-diagrams",title:e.jsx(e.Fragment,{children:"Entity-relationship diagrams"})},{depth:3,url:"#packs-modules-and-artifacts",title:e.jsx(e.Fragment,{children:"Packs, modules and artifacts"})},{depth:3,url:"#launches-and-devices",title:e.jsx(e.Fragment,{children:"Launches and devices"})},{depth:3,url:"#reading-the-diagram",title:e.jsx(e.Fragment,{children:"Reading the diagram"})},{depth:2,url:"#schema-creation-and-migrations",title:e.jsx(e.Fragment,{children:"Schema creation and migrations"})},{depth:2,url:"#next-steps",title:e.jsx(e.Fragment,{children:"Next steps"})}];function a(s){const i={a:"a",code:"code",div:"div",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components},{Card:n,Cards:t}=i;return n||d("Card"),t||d("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"The tables Lamassu Updates keeps in Postgres, how they relate, and how the schema is created and migrated. This is a reference for operators and integrators who query the database, size it, or plan an upgrade."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"native-mode-tables",children:"Native mode tables"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Created in Postgres at startup, in the ",e.jsx(i.code,{children:"updates"})," database. The Go types are in ",e.jsx(i.code,{children:"pkg/models/updates.go"})," of the ",e.jsx(i.a,{href:"https://github.com/lamassuiot/ota",children:"ota repository"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Table"}),e.jsx(i.th,{children:"Holds"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"distribution_set"})}),e.jsxs(i.td,{children:["An update pack: name, version, group, type, packaging, status, the sw-description (",e.jsx(i.code,{children:"sw_descriptor"}),"), preconditions, encryption and signature settings, and the per-device build coverage"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"distribution_set_version"})}),e.jsx(i.td,{children:"A snapshot of each built version, with its signed manifest"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"distribution_set_module"})}),e.jsx(i.td,{children:"The modules of a pack version, keyed by pack, version, module type and name. It also holds catalog modules that belong to no pack, with an empty pack ID"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"artifact"})}),e.jsx(i.td,{children:"A global artifact: the catalog entry for an uploaded file, unique by name and version"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"distribution_set_artifact"})}),e.jsx(i.td,{children:"The link between a pack version, an artifact and optionally one module"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"launchtrack"})}),e.jsx(i.td,{children:"A launch campaign: strategy, status, thresholds and batch bookkeeping"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"launch_device_assignments"})}),e.jsxs(i.td,{children:["Each device's status within a launch: ",e.jsx(i.code,{children:"pending"}),", ",e.jsx(i.code,{children:"active"}),", ",e.jsx(i.code,{children:"completed"})," or ",e.jsx(i.code,{children:"failed"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"device_distribution_set_version"})}),e.jsx(i.td,{children:"Which pack version a device currently carries"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"device_distribution_set_update"})}),e.jsx(i.td,{children:"A device's update history"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"latest_distribution_set_version"})}),e.jsx(i.td,{children:"The declared latest version per group and pack"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"updates_schema_migrations"})}),e.jsx(i.td,{children:"One row per data migration that must run only once (the approval-threshold migration)"})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["File bytes (artifacts, builds, keys) are not in Postgres. They live in the blob stores described under ",e.jsx(i.a,{href:"/docs/platform/updates/reference/configuration",children:"Configuration"}),". The sw-description is in Postgres (a column of the pack and of each module)."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"hawkbit-mode-tables",children:"hawkBit mode tables"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["In hawkBit mode, packs, rollouts and jobs live in hawkBit. This service keeps only the following in the same Postgres (the ",e.jsx(i.code,{children:"updates"})," database), for the things hawkBit has no equivalent of:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Table"}),e.jsx(i.th,{children:"Holds"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"hawkbit_staged_artifact"})}),e.jsxs(i.td,{children:["Bytes from ",e.jsx(i.code,{children:"POST /artifacts"}),". Uploads older than 30 minutes are discarded the next time anyone uploads an artifact, and stay readable until then. They cannot be linked to a pack in this mode"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"hawkbit_artifact_alias"})}),e.jsx(i.td,{children:"Read when resolving an artifact ID, but nothing writes it any more"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"hawkbit_sw_descriptor_v2"})}),e.jsx(i.td,{children:"sw-descriptions, launch preconditions and rollout flags (a general key-value text store, keyed by instance, kind and ID)"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"hawkbit_set_manifest_v2"})}),e.jsx(i.td,{children:"Signed manifests of built sets"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"hawkbit_cancelled_rollout_v2"})}),e.jsx(i.td,{children:"Rollouts cancelled through this service"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"latest_distribution_set_version"})}),e.jsx(i.td,{children:"Declared latest versions (shared with native mode)"})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Rows keyed by a hawkBit ID carry an ",e.jsx(i.code,{children:"instance_id"}),", a marker of the hawkBit data they describe. If hawkBit loses its data and starts again, IDs repeat, and the service stops reading rows written for the old instance. The service re-checks the marker every 30 seconds."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["hawkBit keeps its own schema in its own ",e.jsx(i.code,{children:"hawkbit"})," database. In the Docker Compose stack, ",e.jsx(i.code,{children:"init.sql"})," creates both databases when the Postgres container first starts."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"entity-relationship-diagrams",children:"Entity-relationship diagrams"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The native-mode tables, with their main columns. ",e.jsx(i.code,{children:"*_id"})," columns that point at another table are drawn as the relationship lines. These are logical references: the service creates no database foreign-key constraints, and ",e.jsx(i.code,{children:"FK"})," only marks which column holds the reference."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"packs-modules-and-artifacts",children:"Packs, modules and artifacts"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"erDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET ||--o{ DISTRIBUTION_SET_VERSION : "snapshot per built version"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET |o--o{ DISTRIBUTION_SET_MODULE : "composed of"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET ||--o{ DISTRIBUTION_SET_ARTIFACT : "links"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ARTIFACT ||--o{ DISTRIBUTION_SET_ARTIFACT : "referenced by"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET_MODULE |o--o{ DISTRIBUTION_SET_ARTIFACT : "owns"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET_MODULE |o--o{ DISTRIBUTION_SET_MODULE : "copied from"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET ||--o{ LATEST_DISTRIBUTION_SET_VERSION : "declared latest"'})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DISTRIBUTION_SET {"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string name"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string group_id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string type"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string packaging"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string status"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string uri"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string encryption_mode"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string sw_descriptor"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string last_build_error"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DISTRIBUTION_SET_VERSION {"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string checksum"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string manifest_json"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string manifest_signature"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DISTRIBUTION_SET_MODULE {"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_version"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string type"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string name"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string delivery_intent"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    boolean built"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string sw_descriptor"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string release_notes"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string source_module_id FK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  ARTIFACT {"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string name"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string filename"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string checksum"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int size"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DISTRIBUTION_SET_ARTIFACT {"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_version"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string artifact_id FK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_module_id FK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  LATEST_DISTRIBUTION_SET_VERSION {"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string group_id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"launches-and-devices",children:"Launches and devices"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"erDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET ||--o{ LAUNCHTRACK : "launched as"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  LAUNCHTRACK ||--o{ LAUNCH_DEVICE_ASSIGNMENTS : "targets"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET ||--o{ DEVICE_DISTRIBUTION_SET_VERSION : "installed on"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  DISTRIBUTION_SET ||--o{ DEVICE_DISTRIBUTION_SET_UPDATE : "update attempts"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  LAUNCHTRACK |o--o{ DEVICE_DISTRIBUTION_SET_UPDATE : "caused by"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  LAUNCHTRACK |o--o{ DEVICE_DISTRIBUTION_SET_VERSION : "installed by"'})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DISTRIBUTION_SET {"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string name"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string group_id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  LAUNCHTRACK {"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string group_id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string name"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string status"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string workflow_type"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string rollout_type"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int rollout_value"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string test_device_id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    boolean auto"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int approval_threshold"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int error_threshold"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int total_devices"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int current_batch_size"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int current_batch_index"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    boolean aborted"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    timestamp scheduled_at"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  LAUNCH_DEVICE_ASSIGNMENTS {"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string launch_id PK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string device_id PK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string status"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    int batch_index"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    timestamp dispatched_at"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    timestamp completed_at"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DEVICE_DISTRIBUTION_SET_VERSION {"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string device_id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string launch_id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string job_id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    timestamp installed_at"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  DEVICE_DISTRIBUTION_SET_UPDATE {"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string id PK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string device_id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string distribution_set_id FK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string launch_id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string job_id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version_from"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string version_to"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    string status"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    timestamp timestamp_completed"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Values worth knowing:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"distribution_set.status"})," is ",e.jsx(i.code,{children:"draft"}),", ",e.jsx(i.code,{children:"built"})," or ",e.jsx(i.code,{children:"build_failed"}),". ",e.jsx(i.code,{children:"packaging"})," is ",e.jsx(i.code,{children:"swu"})," or ",e.jsx(i.code,{children:"non-swu"}),". ",e.jsx(i.code,{children:"encryption_mode"})," is empty, ",e.jsx(i.code,{children:"shared"})," or ",e.jsx(i.code,{children:"per-device"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"launchtrack.status"})," is ",e.jsx(i.code,{children:"running"}),", ",e.jsx(i.code,{children:"paused"}),", ",e.jsx(i.code,{children:"cancelled"})," or ",e.jsx(i.code,{children:"completed"}),". A new launch is stored with an empty status, which means running. ",e.jsx(i.code,{children:"aborted"})," is true for a cancelled launch (operator or error threshold) and stops every rollout path. The precondition outcome of the launch (",e.jsx(i.code,{children:"forced_preconditions"}),", ",e.jsx(i.code,{children:"precondition_failures"}),") is stored on the row, but not the preconditions themselves: those live on the pack."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"rollout_type"})," is not validated: only the value ",e.jsx(i.code,{children:"percentage"})," makes ",e.jsx(i.code,{children:"rollout_value"})," a percentage, and any other value (the dashboard sends ",e.jsx(i.code,{children:"numeric"}),", the examples use ",e.jsx(i.code,{children:"fixed"}),") makes it a device count."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"launch_device_assignments.status"})," is ",e.jsx(i.code,{children:"pending"}),", ",e.jsx(i.code,{children:"active"}),", ",e.jsx(i.code,{children:"completed"})," or ",e.jsx(i.code,{children:"failed"}),". (",e.jsx(i.code,{children:"cancelled"})," also exists as a value, but only hawkBit mode reports it, for a canary whose launch was cancelled; it is never stored.)"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"device_distribution_set_update.status"})," is ",e.jsx(i.code,{children:"pending"}),", ",e.jsx(i.code,{children:"running"}),", ",e.jsx(i.code,{children:"success"})," or ",e.jsx(i.code,{children:"failed"})," (hawkBit mode can also report ",e.jsx(i.code,{children:"cancelled"}),"), and its ",e.jsx(i.code,{children:"source"})," is ",e.jsx(i.code,{children:"service"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"distribution_set_module"})," is unique by pack, pack version, type and name. A standalone catalog module has an empty ",e.jsx(i.code,{children:"distribution_set_id"}),", and its ",e.jsx(i.code,{children:"distribution_set_version"})," equals its own ",e.jsx(i.code,{children:"version"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"distribution_set_version"})," is unique by pack and version, and ",e.jsx(i.code,{children:"distribution_set_artifact"})," by pack, version and artifact."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Not drawn: ",e.jsx(i.code,{children:"updates_schema_migrations"}),", a marker table the start-up data migrations use, and the hawkBit-mode tables listed above."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"reading-the-diagram",children:"Reading the diagram"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["A ",e.jsx(i.strong,{children:"pack"})," (",e.jsx(i.code,{children:"distribution_set"}),") is one row that moves through versions. Each built version is snapshotted into ",e.jsx(i.code,{children:"distribution_set_version"}),", with its signed manifest."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Modules"})," and ",e.jsx(i.strong,{children:"artifacts"})," are separate: an artifact is a file in the global catalog, and ",e.jsx(i.code,{children:"distribution_set_artifact"})," links it to a pack version (and optionally to one module). A module whose ",e.jsx(i.code,{children:"distribution_set_id"})," is empty is a catalog module that no pack holds yet."]}),`
`,e.jsxs(i.li,{children:["A ",e.jsx(i.strong,{children:"launch"})," (",e.jsx(i.code,{children:"launchtrack"}),") targets a group through one assignment row per device. The assignment moves ",e.jsx(i.code,{children:"pending"})," → ",e.jsx(i.code,{children:"active"})," → ",e.jsx(i.code,{children:"completed"})," or ",e.jsx(i.code,{children:"failed"}),", and ",e.jsx(i.code,{children:"batch_index"})," records which batch dispatched it."]}),`
`,e.jsxs(i.li,{children:["Two device tables answer different questions. ",e.jsx(i.code,{children:"device_distribution_set_version"})," is what a device carries ",e.jsx(i.strong,{children:"now"}),". ",e.jsx(i.code,{children:"device_distribution_set_update"})," is the ",e.jsx(i.strong,{children:"history"})," of attempts, with ",e.jsx(i.code,{children:"version_from"})," and ",e.jsx(i.code,{children:"version_to"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"latest_distribution_set_version"})," is the version an operator declared devices of a group should be on, used for drift and compliance."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"schema-creation-and-migrations",children:"Schema creation and migrations"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"There are no migration files. In native mode the service creates and upgrades its own schema when it starts, holding a Postgres lock so that replicas starting together do not race. It runs these steps in order (hawkBit mode only creates its six tables):"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Rename step"})," (",e.jsx(i.code,{children:"MigrateDistributionSetNaming"}),'). Databases created before the "update pack" → "distribution set" rename have their tables and columns renamed. It runs before step 2 so that the new tables are not created empty beside the old ones.']}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Create and add"})," (GORM ",e.jsx(i.code,{children:"AutoMigrate"}),"). Missing tables and columns are created. It never drops or renames anything."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Data migrations."})," Standalone modules (",e.jsx(i.code,{children:"software_module_definition"})," rows move into the module and artifact tables, keeping IDs and files, and the old table is dropped), device assignments (rebuilt from the legacy launch columns), and approval-threshold semantics."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Most steps check the current schema instead of a version number, and the approval-threshold migration records a row in ",e.jsx(i.code,{children:"updates_schema_migrations"})," so it runs only once. Repeated starts are safe, and a new database has nothing to migrate. After the schema steps the service also copies binaries from the legacy pack-scoped layout on disk into the artifact store, skipping any that are already there."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.code,{children:"init.sql"})," is a Docker Compose seed: it creates the ",e.jsx(i.code,{children:"updates"})," and ",e.jsx(i.code,{children:"hawkbit"})," databases and still contains older table definitions, so do not use it to define the schema yourself."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/docs/platform/updates/operations#upgrades",children:"Operations"})," for what to do before upgrading."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"next-steps",children:"Next steps"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t,{children:[e.jsx(n,{title:"Configuration",description:"Blob stores, storage and every config field.",href:"/docs/platform/updates/reference/configuration"}),e.jsx(n,{title:"Operations",description:"Back up, scale and upgrade the database.",href:"/docs/platform/updates/operations"})]})})]})}function m(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(a,{...s})}):a(s)}function d(s,i){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}const g=Object.freeze(Object.defineProperty({__proto__:null,_markdown:r,default:m,frontmatter:l,lmDiff:o,structuredData:c,toc:h},Symbol.toStringTag,{value:"Module"}));export{g as _};
