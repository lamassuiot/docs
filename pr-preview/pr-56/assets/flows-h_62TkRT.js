import{j as e}from"./index-DqgIL_Rv.js";let d=`

<div className="lm-diff-ins lm-diff-block">
  These diagrams follow what the service does, step by step. Routes are relative to \`/updates/v1\`. For runnable commands see the [native](/docs/platform/updates/guides/native-curl) and [hawkBit](/docs/platform/updates/guides/hawkbit-curl) curl guides, and the [API reference](/docs/platform/updates/reference/api) for every route and body.
</div>

<div className="lm-diff-ins lm-diff-block">
  Native mode [#native-mode]
</div>

<div className="lm-diff-ins lm-diff-block">
  1. Publish and build a pack [#1-publish-and-build-a-pack]
</div>

<div className="lm-diff-ins lm-diff-block">
  Building turns the uploaded artifacts and the sw-description into one \`.swu\`. Nothing is signed or encrypted unless the build request asks for it.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    actor Op as Operator
    participant API as Updates API
    participant DB as Postgres
    participant FS as Blob stores and scratch dir
    participant SWG as swugenerator
    participant KMS as Lamassu KMS

    Op->>API: POST /groups/{g}/distribution-sets
    API->>DB: insert pack (status draft)
    API-->>Op: 201 pack
    Op->>API: POST .../descriptor/upload (sw-description)
    API->>DB: store the sw-description
    Op->>API: POST .../artifact/upload (file, artifact_name, version)
    API->>FS: store artifact bytes in the artifacts store
    API->>DB: insert artifact and link it to the pack
    API-->>Op: artifact id
    Op->>API: POST .../swu {selected_artifact_ids, encryption, signature}
    API->>FS: stage the descriptor and the selected artifacts in a build directory
    opt shared or per-device encryption
      API->>API: fetch the key from SymKMS
    end
    API->>SWG: build the .swu
    opt signing requested
      SWG->>KMS: sign the sw-description
      KMS-->>SWG: signature
    end
    SWG-->>API: .swu file
    API->>FS: publish the build to the builds store
    API->>DB: snapshot the version and its manifest
    opt signing requested
      API->>KMS: sign the version manifest
      KMS-->>API: signature
    end
    API->>DB: set status built and uri
    API-->>Op: 200 Update pack executed successfully
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Things to know about the build:
</div>

<div className="lm-diff-ins lm-diff-block">
  * The pack is created with a name, a semantic \`version\`, a \`group_id\`, a \`type\` and an optional \`packaging\`. A duplicate name in the group is a \`409\`.
  * Uploading an artifact (or a prebuilt deliverable) to a version that is already built is refused with \`409\`: create a new version first. A build or change that collides with another one on the same pack answers \`409\` too.
  * A file larger than \`max_artifact_size_mb\` (10240 MiB by default) is refused with \`413\`.
  * Encryption is chosen by the build body: \`user\` plus \`encryption_key_name\` is shared-key encryption, and \`encryption_alg_name\` alone is per-device encryption (flow 5).
  * If the build fails, the pack becomes \`build_failed\`, \`last_build_error\` says why, and the pack stays editable. The selected artifacts replace the pack version's earlier artifact links.
  * Without signing fields the manifest is stored unsigned. If a signing key is given but no certificate, the build fails instead.
  * A \`non-swu\` pack is built with \`POST .../package\` into a \`.tar.gz\`, and a deliverable built elsewhere is attached with \`POST .../swu/upload\` or \`.../package/upload\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  2. Create a launch [#2-create-a-launch]
</div>

<div className="lm-diff-ins lm-diff-block">
  Creating a launch decides who is targeted, and checks the pack is deliverable. Nothing is sent to a device yet.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    actor Op as Operator
    participant API as Updates API
    participant DMS as Lamassu Device Manager
    participant DB as Postgres

    Op->>API: POST /groups/{g}/launch {pack name, strategy, test_device_id}
    API->>DB: load the pack by group and name
    alt pack is not built
      API-->>Op: 400 build the pack first
    else per-device pack with uncovered devices
      API-->>Op: 400 devices without a package
    else
      API->>DMS: list the devices of the group
      DMS-->>API: device ids
      API->>API: evaluate the pack's preconditions per device
      alt no device to target
        API-->>Op: 500 the group has no devices to launch to
      else canary not in the group, or not qualifying
        API-->>Op: 400 test device is not a qualifying member
      else
        API->>DB: insert the launch and one pending assignment per device
        API-->>Op: 201 launch_id, precondition_failures, forced
      end
    end
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  \`?dry_run=true\` stops after the precondition check and answers \`200\` with \`qualifying_devices\`, \`precondition_failures\`, \`superseded_devices\` and \`never_seen_devices\`. \`force_preconditions\` targets every device of the group and still records who failed. \`distribution_set_name\`, \`workflow_type\` and \`rollout_type\` are required, and so is a \`rollout_value\` above zero. \`approval_threshold\` and \`error_threshold\` must be between 0 and 100, and each violation is a \`400\`. A launch can also carry \`auto\`, \`scheduled_at\`, \`name\`, \`description\` and \`weight\` (see [Concepts](/docs/platform/updates/concepts#launch-campaigns)).
</div>

<div className="lm-diff-ins lm-diff-block">
  3. Roll out a batch and update a device [#3-roll-out-a-batch-and-update-a-device]
</div>

<div className="lm-diff-ins lm-diff-block">
  One \`rollout\` call sends the next batch. The canary goes alone first, then batches of the configured size, chosen at random from the devices still pending. The device side below is the \`direct\` workflow, where a job starts in \`INSTALL\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    actor Op as Operator
    participant API as Updates API
    participant DB as Postgres
    participant WFX as WFX
    participant Dev as Device (SWUpdate)

    Op->>API: POST /groups/{g}/launch/{id}/rollout
    API->>DB: claim the next batch index (atomic, one dispatcher per launch)
    loop each device in the batch
      API->>WFX: create job (workflow, uri, algorithm, iv, version)
      WFX-->>API: job id
      API->>DB: record a pending update-history row
      API->>DB: mark the device's assignment active
    end
    API-->>Op: 200

    Dev->>WFX: poll for jobs of this client
    WFX-->>Dev: job in state INSTALL
    Dev->>API: GET .../swu/download/{deviceId}
    API-->>Dev: the .swu
    Dev->>WFX: PUT status INSTALLING
    Dev->>WFX: PUT status INSTALLED
    WFX->>WFX: automatic transition to ACTIVATE
    Dev->>WFX: PUT status ACTIVATING
    Dev->>WFX: PUT status ACTIVATED
    WFX-->>API: event stream: every job state change
    Note over API,DB: Flow 4 handles each event
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  With the \`phased\` workflow a job starts in \`CREATED\`, and some transitions need a person or system to confirm them in WFX. This service does not advance them. The \`download-install\` workflow, used by \`non-swu\` packs, runs \`DOWNLOAD → DOWNLOADING → DOWNLOADED → INSTALL → INSTALLING → INSTALLED\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  With \`auto\` on, one \`rollout\` call starts the launch and the following batches are released by flow 4. A launch with \`scheduled_at\` is started by the scheduled-launch trigger on the leader replica once that time passes.
</div>

<div className="lm-diff-ins lm-diff-block">
  The \`rollout\` call is not always a plain \`200\`:
</div>

<div className="lm-diff-ins lm-diff-block">
  * It is refused with \`400\` when the launch is paused, cancelled, completed or aborted, and on an \`auto\` launch once any batch has gone out.
  * It does nothing and answers \`200\` while \`scheduled_at\` is still in the future, and while the canary is still active. It returns an error if the canary failed.
  * If some jobs cannot be created, those devices stay \`pending\` and the call returns a "partial rollout" error (\`500\`).
</div>

<div className="lm-diff-ins lm-diff-block">
  4. React to a device finishing [#4-react-to-a-device-finishing]
</div>

<div className="lm-diff-ins lm-diff-block">
  Every state change WFX reports runs the same logic. This is what makes automatic batching, the canary gate and the error threshold work.
</div>

<div className="lm-diff-ins lm-diff-block">
  On **every** event the service updates the device's update history and writes the event to the device's metadata in Lamassu. Then, only if the state is a terminal one of the workflow, it runs these checks in order, and the first one that applies decides what happens:
</div>

<div className="lm-diff-ins lm-diff-block">
  | # | Check                                                                                       | If it applies                                                                                  |
  | - | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
  | 1 | Is the state terminal in the workflow?                                                      | If not, nothing more happens                                                                   |
  | 2 | (always)                                                                                    | Mark the device's assignment \`completed\` or \`failed\`. On success, record the installed version |
  | 3 | Did the canary device fail?                                                                 | Pause the launch. Resume to retry                                                              |
  | 4 | Is the launch paused, cancelled or completed?                                               | Stop: no further batches                                                                       |
  | 5 | Is \`error_threshold\` set, and have failures reached that share of all devices (rounded up)? | Cancel the launch. Pending devices are not sent                                                |
  | 6 | Is nothing pending and nothing active?                                                      | Mark the launch \`completed\`                                                                    |
  | 7 | Is \`auto\` off, or is nothing left to send?                                                  | Wait for the operator's next \`rollout\` call, or for the devices still in flight                |
  | 8 | Did at least \`approval_threshold\` of this batch succeed? (0 or 100 or more means all of it) | Dispatch the next batch. Otherwise wait for more results                                       |
</div>

<div className="lm-diff-ins lm-diff-block">
  Only devices dispatched in the current batch count toward its approval: a straggler from an earlier batch never does. The checks move the launch between these states:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  stateDiagram-v2
    direction LR
    [*] --> running: launch created
    running --> paused: operator pauses, or the canary fails
    paused --> running: resume
    running --> cancelled: operator cancels, or error_threshold reached
    paused --> cancelled: operator cancels
    running --> completed: nothing pending and nothing active, or operator completes
    paused --> completed: operator completes
    completed --> running: retry-failed
    cancelled --> running: retry-failed
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  A new launch is stored with an empty status, which means \`running\`. Resuming after a failed canary re-queues the canary so it is tried again. Cancelling stops further batches but does not recall jobs that are already running on devices.
</div>

<div className="lm-diff-ins lm-diff-block">
  5. Build a per-device encrypted pack [#5-build-a-per-device-encrypted-pack]
</div>

<div className="lm-diff-ins lm-diff-block">
  Each device gets its own package, encrypted with its own key. The build first resolves every device's key, then builds. A device without a key is skipped, and a launch on a pack with skipped devices is refused.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    actor Op as Operator
    participant API as Updates API
    participant SYM as SymKMS
    participant DMS as Lamassu Device Manager
    participant SWG as swugenerator

    loop each device
      Op->>SYM: POST /symkms/v1/ create key
      Op->>SYM: POST /symkms/v1/inventory/{device}/keys/{key} {purpose: firmware-encryption}
    end
    Op->>API: POST .../swu {encryption_alg_name, selected_artifact_ids}
    API->>DMS: list the group's devices
    Note over API: build fails if the group has no devices, or the sw-description marks no file encrypted = true
    par each device, concurrently
      API->>SYM: GET /symkms/v1/inventory/{device}/key
    end
    Note over API: build fails if no device has a key
    par each device with a key, concurrently
      API->>SWG: build a .swu encrypted with that key
    end
    API->>API: record built_device_count, total_device_count, uncovered_devices
    API-->>Op: 200
    Note over Op,API: Launch creation returns 400 while uncovered_devices is not empty
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  \`uncovered_devices\` lists devices without a key and also devices whose own build failed. A build where no device got a package leaves the pack \`build_failed\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  hawkBit mode [#hawkbit-mode]
</div>

<div className="lm-diff-ins lm-diff-block">
  6. Build a module and create a pack [#6-build-a-module-and-create-a-pack]
</div>

<div className="lm-diff-ins lm-diff-block">
  hawkBit itself has no notion of a built module, and this service links only built modules into a hawkBit distribution set. A set is never built directly: \`POST .../swu\` and \`.../package\` answer \`501\` in this mode. The module is built first, in the catalog, and the pack is created from it. The diagram shows the \`swu-build\` intent.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    actor Op as Operator
    participant API as Updates API
    participant DB as Postgres
    participant SWG as swugenerator
    participant HB as hawkBit

    Op->>API: POST /softwaremodules {type, name, version, delivery_intent}
    API->>HB: create software module
    API-->>Op: module id
    Op->>API: POST /softwaremodules/by-id/{id}/artifacts (file)
    API->>HB: upload the artifact to the module
    Op->>API: POST /softwaremodules/by-id/{id}/descriptor (sw-description)
    API->>DB: store the sw-description
    Op->>API: POST /softwaremodules/by-id/{id}/build
    API->>HB: read the module's input files
    API->>SWG: build the .swu
    SWG-->>API: .swu file
    API->>HB: upload the .swu, then remove the module's input artifacts
    API-->>Op: module built
    Op->>API: POST /groups/{g}/distribution-sets {modules: [{source_module_id}]}
    API->>HB: create the distribution set linking the built module
    API->>HB: tag it with the group
    opt the modules were signed
      API->>DB: store the signed set manifest
    end
    API-->>Op: 201 pack (already built)
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  The other delivery intents skip steps: \`swu-prebuilt\` only uploads the finished \`.swu\`, which is what builds the module, and \`raw\` only encrypts or signs the files, with no swugenerator and no sw-description (signing adds a \`.sha256\` checksum document and its detached signature as extra artifacts). A build can sign through the KMS and encrypt with a shared SymKMS key. Per-device encryption is refused in hawkBit mode. A linked module is frozen: to change it, edit and build it in the catalog, then link it again.
</div>

<div className="lm-diff-ins lm-diff-block">
  7. Launch and device update [#7-launch-and-device-update]
</div>

<div className="lm-diff-ins lm-diff-block">
  The device talks to hawkBit, not to this service. The service reads progress back from hawkBit whenever it is asked.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    actor Op as Operator
    participant API as Updates API
    participant DMS as Lamassu Device Manager
    participant HB as hawkBit
    participant Dev as Device (SWUpdate suricatta)

    Op->>API: POST /groups/{g}/launch {pack, strategy}
    API->>DMS: list the devices of the group
    API->>HB: create the missing targets and tag them group:{g}
    API->>API: check the canary, the pack's group and the preconditions
    API->>HB: create a rollout (optional canary group, then batches, then the rest)
    API-->>Op: 201 launch_id, never_seen_devices
    Op->>API: POST .../rollout
    API->>HB: start the rollout, or release the next group
    Dev->>HB: DDI poll, authenticated per the tenant's settings
    HB-->>Dev: deploymentBase with the module's artifact
    Dev->>HB: download the .swu
    Dev->>HB: feedback proceeding, then closed with result success
    HB->>HB: rollout group counters, success and error conditions
    Op->>API: GET /groups/{g}/launch
    API->>HB: read the rollout and its groups
    API-->>Op: status and counters
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  A canary group exists only when \`test_device_id\` is given. hawkBit decides when a group succeeds and the next group starts, using the approval and error thresholds the service gave it. With \`auto\` off, hawkBit pauses after each group and the next \`rollout\` call releases the following one. The launch response also lists \`superseded_devices\` (devices whose in-flight update the new rollout replaces) and \`never_seen_devices\` (devices that have never polled, which can stall a group that must reach its success threshold).
</div>

<div className="lm-diff-ins lm-diff-block">
  The \`rollout\` call depends on the rollout's state:
</div>

<div className="lm-diff-ins lm-diff-block">
  * A \`ready\` rollout is started, and nothing happens while its start time is in the future.
  * A paused rollout is resumed only if it is paused between batches. An operator pause needs \`resume\`, and a rollout stopped by its error threshold cannot be resumed.
  * A running manual rollout releases its next group.
  * An \`auto\` rollout that is already running is refused with \`400\`.
  * A second \`rollout\` on the same launch while one is in progress answers \`409\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  Device authentication is a hawkBit tenant setting. Target security tokens are off by default. See [Connect a device](/docs/platform/updates/guides/connect-a-device).
</div>

<div className="lm-diff-ins lm-diff-block">
  Next steps [#next-steps]
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Publish and roll out an update" description="Run flows 1 to 4 end to end." href="/docs/platform/updates/guides/publish-and-roll-out" />

    <Card title="Data model" description="The tables behind these flows." href="/docs/platform/updates/data-model" />

    <Card title="Signing and encryption" description="Keys, signatures and the manifest." href="/docs/platform/updates/signing-and-encryption" />
  </Cards>
</div>
`,r={title:"Flows",description:"Sequence diagrams of the important operations, for the native and hawkBit backends."},c={isNew:!0,changes:43,title:void 0,description:void 0},h={contents:[{heading:void 0,content:"These diagrams follow what the service does, step by step. Routes are relative to `/updates/v1`. For runnable commands see the native and hawkBit curl guides, and the API reference for every route and body."},{heading:"1-publish-and-build-a-pack",content:"Building turns the uploaded artifacts and the sw-description into one `.swu`. Nothing is signed or encrypted unless the build request asks for it."},{heading:"1-publish-and-build-a-pack",content:"Things to know about the build:"},{heading:"1-publish-and-build-a-pack",content:"The pack is created with a name, a semantic `version`, a `group_id`, a `type` and an optional `packaging`. A duplicate name in the group is a `409`."},{heading:"1-publish-and-build-a-pack",content:"Uploading an artifact (or a prebuilt deliverable) to a version that is already built is refused with `409`: create a new version first. A build or change that collides with another one on the same pack answers `409` too."},{heading:"1-publish-and-build-a-pack",content:"A file larger than `max_artifact_size_mb` (10240 MiB by default) is refused with `413`."},{heading:"1-publish-and-build-a-pack",content:"Encryption is chosen by the build body: `user` plus `encryption_key_name` is shared-key encryption, and `encryption_alg_name` alone is per-device encryption (flow 5)."},{heading:"1-publish-and-build-a-pack",content:"If the build fails, the pack becomes `build_failed`, `last_build_error` says why, and the pack stays editable. The selected artifacts replace the pack version's earlier artifact links."},{heading:"1-publish-and-build-a-pack",content:"Without signing fields the manifest is stored unsigned. If a signing key is given but no certificate, the build fails instead."},{heading:"1-publish-and-build-a-pack",content:"A `non-swu` pack is built with `POST .../package` into a `.tar.gz`, and a deliverable built elsewhere is attached with `POST .../swu/upload` or `.../package/upload`."},{heading:"2-create-a-launch",content:"Creating a launch decides who is targeted, and checks the pack is deliverable. Nothing is sent to a device yet."},{heading:"2-create-a-launch",content:"`?dry_run=true` stops after the precondition check and answers `200` with `qualifying_devices`, `precondition_failures`, `superseded_devices` and `never_seen_devices`. `force_preconditions` targets every device of the group and still records who failed. `distribution_set_name`, `workflow_type` and `rollout_type` are required, and so is a `rollout_value` above zero. `approval_threshold` and `error_threshold` must be between 0 and 100, and each violation is a `400`. A launch can also carry `auto`, `scheduled_at`, `name`, `description` and `weight` (see Concepts)."},{heading:"3-roll-out-a-batch-and-update-a-device",content:"One `rollout` call sends the next batch. The canary goes alone first, then batches of the configured size, chosen at random from the devices still pending. The device side below is the `direct` workflow, where a job starts in `INSTALL`."},{heading:"3-roll-out-a-batch-and-update-a-device",content:"With the `phased` workflow a job starts in `CREATED`, and some transitions need a person or system to confirm them in WFX. This service does not advance them. The `download-install` workflow, used by `non-swu` packs, runs `DOWNLOAD → DOWNLOADING → DOWNLOADED → INSTALL → INSTALLING → INSTALLED`."},{heading:"3-roll-out-a-batch-and-update-a-device",content:"With `auto` on, one `rollout` call starts the launch and the following batches are released by flow 4. A launch with `scheduled_at` is started by the scheduled-launch trigger on the leader replica once that time passes."},{heading:"3-roll-out-a-batch-and-update-a-device",content:"The `rollout` call is not always a plain `200`:"},{heading:"3-roll-out-a-batch-and-update-a-device",content:"It is refused with `400` when the launch is paused, cancelled, completed or aborted, and on an `auto` launch once any batch has gone out."},{heading:"3-roll-out-a-batch-and-update-a-device",content:"It does nothing and answers `200` while `scheduled_at` is still in the future, and while the canary is still active. It returns an error if the canary failed."},{heading:"3-roll-out-a-batch-and-update-a-device",content:'If some jobs cannot be created, those devices stay `pending` and the call returns a "partial rollout" error (`500`).'},{heading:"4-react-to-a-device-finishing",content:"Every state change WFX reports runs the same logic. This is what makes automatic batching, the canary gate and the error threshold work."},{heading:"4-react-to-a-device-finishing",content:"On **every** event the service updates the device's update history and writes the event to the device's metadata in Lamassu. Then, only if the state is a terminal one of the workflow, it runs these checks in order, and the first one that applies decides what happens:"},{heading:"4-react-to-a-device-finishing",content:"#"},{heading:"4-react-to-a-device-finishing",content:"Check"},{heading:"4-react-to-a-device-finishing",content:"If it applies"},{heading:"4-react-to-a-device-finishing",content:"1"},{heading:"4-react-to-a-device-finishing",content:"Is the state terminal in the workflow?"},{heading:"4-react-to-a-device-finishing",content:"If not, nothing more happens"},{heading:"4-react-to-a-device-finishing",content:"2"},{heading:"4-react-to-a-device-finishing",content:"(always)"},{heading:"4-react-to-a-device-finishing",content:"Mark the device's assignment `completed` or `failed`. On success, record the installed version"},{heading:"4-react-to-a-device-finishing",content:"3"},{heading:"4-react-to-a-device-finishing",content:"Did the canary device fail?"},{heading:"4-react-to-a-device-finishing",content:"Pause the launch. Resume to retry"},{heading:"4-react-to-a-device-finishing",content:"4"},{heading:"4-react-to-a-device-finishing",content:"Is the launch paused, cancelled or completed?"},{heading:"4-react-to-a-device-finishing",content:"Stop: no further batches"},{heading:"4-react-to-a-device-finishing",content:"5"},{heading:"4-react-to-a-device-finishing",content:"Is `error_threshold` set, and have failures reached that share of all devices (rounded up)?"},{heading:"4-react-to-a-device-finishing",content:"Cancel the launch. Pending devices are not sent"},{heading:"4-react-to-a-device-finishing",content:"6"},{heading:"4-react-to-a-device-finishing",content:"Is nothing pending and nothing active?"},{heading:"4-react-to-a-device-finishing",content:"Mark the launch `completed`"},{heading:"4-react-to-a-device-finishing",content:"7"},{heading:"4-react-to-a-device-finishing",content:"Is `auto` off, or is nothing left to send?"},{heading:"4-react-to-a-device-finishing",content:"Wait for the operator's next `rollout` call, or for the devices still in flight"},{heading:"4-react-to-a-device-finishing",content:"8"},{heading:"4-react-to-a-device-finishing",content:"Did at least `approval_threshold` of this batch succeed? (0 or 100 or more means all of it)"},{heading:"4-react-to-a-device-finishing",content:"Dispatch the next batch. Otherwise wait for more results"},{heading:"4-react-to-a-device-finishing",content:"Only devices dispatched in the current batch count toward its approval: a straggler from an earlier batch never does. The checks move the launch between these states:"},{heading:"4-react-to-a-device-finishing",content:"A new launch is stored with an empty status, which means `running`. Resuming after a failed canary re-queues the canary so it is tried again. Cancelling stops further batches but does not recall jobs that are already running on devices."},{heading:"5-build-a-per-device-encrypted-pack",content:"Each device gets its own package, encrypted with its own key. The build first resolves every device's key, then builds. A device without a key is skipped, and a launch on a pack with skipped devices is refused."},{heading:"5-build-a-per-device-encrypted-pack",content:"`uncovered_devices` lists devices without a key and also devices whose own build failed. A build where no device got a package leaves the pack `build_failed`."},{heading:"6-build-a-module-and-create-a-pack",content:"hawkBit itself has no notion of a built module, and this service links only built modules into a hawkBit distribution set. A set is never built directly: `POST .../swu` and `.../package` answer `501` in this mode. The module is built first, in the catalog, and the pack is created from it. The diagram shows the `swu-build` intent."},{heading:"6-build-a-module-and-create-a-pack",content:"The other delivery intents skip steps: `swu-prebuilt` only uploads the finished `.swu`, which is what builds the module, and `raw` only encrypts or signs the files, with no swugenerator and no sw-description (signing adds a `.sha256` checksum document and its detached signature as extra artifacts). A build can sign through the KMS and encrypt with a shared SymKMS key. Per-device encryption is refused in hawkBit mode. A linked module is frozen: to change it, edit and build it in the catalog, then link it again."},{heading:"7-launch-and-device-update",content:"The device talks to hawkBit, not to this service. The service reads progress back from hawkBit whenever it is asked."},{heading:"7-launch-and-device-update",content:"A canary group exists only when `test_device_id` is given. hawkBit decides when a group succeeds and the next group starts, using the approval and error thresholds the service gave it. With `auto` off, hawkBit pauses after each group and the next `rollout` call releases the following one. The launch response also lists `superseded_devices` (devices whose in-flight update the new rollout replaces) and `never_seen_devices` (devices that have never polled, which can stall a group that must reach its success threshold)."},{heading:"7-launch-and-device-update",content:"The `rollout` call depends on the rollout's state:"},{heading:"7-launch-and-device-update",content:"A `ready` rollout is started, and nothing happens while its start time is in the future."},{heading:"7-launch-and-device-update",content:"A paused rollout is resumed only if it is paused between batches. An operator pause needs `resume`, and a rollout stopped by its error threshold cannot be resumed."},{heading:"7-launch-and-device-update",content:"A running manual rollout releases its next group."},{heading:"7-launch-and-device-update",content:"An `auto` rollout that is already running is refused with `400`."},{heading:"7-launch-and-device-update",content:"A second `rollout` on the same launch while one is in progress answers `409`."},{heading:"7-launch-and-device-update",content:"Device authentication is a hawkBit tenant setting. Target security tokens are off by default. See Connect a device."},{heading:"next-steps",content:'<Card title="Publish and roll out an update" description="Run flows 1 to 4 end to end." href="/docs/platform/updates/guides/publish-and-roll-out" />'},{heading:"next-steps",content:'<Card title="Data model" description="The tables behind these flows." href="/docs/platform/updates/data-model" />'},{heading:"next-steps",content:'<Card title="Signing and encryption" description="Keys, signatures and the manifest." href="/docs/platform/updates/signing-and-encryption" />'}],headings:[{id:"native-mode",content:"Native mode"},{id:"1-publish-and-build-a-pack",content:"1\\. Publish and build a pack"},{id:"2-create-a-launch",content:"2\\. Create a launch"},{id:"3-roll-out-a-batch-and-update-a-device",content:"3\\. Roll out a batch and update a device"},{id:"4-react-to-a-device-finishing",content:"4\\. React to a device finishing"},{id:"5-build-a-per-device-encrypted-pack",content:"5\\. Build a per-device encrypted pack"},{id:"hawkbit-mode",content:"hawkBit mode"},{id:"6-build-a-module-and-create-a-pack",content:"6\\. Build a module and create a pack"},{id:"7-launch-and-device-update",content:"7\\. Launch and device update"},{id:"next-steps",content:"Next steps"}]};const o=[{depth:2,url:"#native-mode",title:e.jsx(e.Fragment,{children:"Native mode"})},{depth:3,url:"#1-publish-and-build-a-pack",title:e.jsx(e.Fragment,{children:"1. Publish and build a pack"})},{depth:3,url:"#2-create-a-launch",title:e.jsx(e.Fragment,{children:"2. Create a launch"})},{depth:3,url:"#3-roll-out-a-batch-and-update-a-device",title:e.jsx(e.Fragment,{children:"3. Roll out a batch and update a device"})},{depth:3,url:"#4-react-to-a-device-finishing",title:e.jsx(e.Fragment,{children:"4. React to a device finishing"})},{depth:3,url:"#5-build-a-per-device-encrypted-pack",title:e.jsx(e.Fragment,{children:"5. Build a per-device encrypted pack"})},{depth:2,url:"#hawkbit-mode",title:e.jsx(e.Fragment,{children:"hawkBit mode"})},{depth:3,url:"#6-build-a-module-and-create-a-pack",title:e.jsx(e.Fragment,{children:"6. Build a module and create a pack"})},{depth:3,url:"#7-launch-and-device-update",title:e.jsx(e.Fragment,{children:"7. Launch and device update"})},{depth:2,url:"#next-steps",title:e.jsx(e.Fragment,{children:"Next steps"})}];function t(s){const i={a:"a",code:"code",div:"div",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components},{Card:n,Cards:a}=i;return n||l("Card"),a||l("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["These diagrams follow what the service does, step by step. Routes are relative to ",e.jsx(i.code,{children:"/updates/v1"}),". For runnable commands see the ",e.jsx(i.a,{href:"/docs/platform/updates/guides/native-curl",children:"native"})," and ",e.jsx(i.a,{href:"/docs/platform/updates/guides/hawkbit-curl",children:"hawkBit"})," curl guides, and the ",e.jsx(i.a,{href:"/docs/platform/updates/reference/api",children:"API reference"})," for every route and body."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"native-mode",children:"Native mode"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"1-publish-and-build-a-pack",children:"1. Publish and build a pack"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Building turns the uploaded artifacts and the sw-description into one ",e.jsx(i.code,{children:".swu"}),". Nothing is signed or encrypted unless the build request asks for it."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  actor Op as Operator"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant API as Updates API"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DB as Postgres"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant FS as Blob stores and scratch dir"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant SWG as swugenerator"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant KMS as Lamassu KMS"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /groups/{g}/distribution-sets"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: insert pack (status draft)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: 201 pack"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST .../descriptor/upload (sw-description)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: store the sw-description"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST .../artifact/upload (file, artifact_name, version)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>FS: store artifact bytes in the artifacts store"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: insert artifact and link it to the pack"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: artifact id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST .../swu {selected_artifact_ids, encryption, signature}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>FS: stage the descriptor and the selected artifacts in a build directory"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  opt shared or per-device encryption"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>API: fetch the key from SymKMS"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>SWG: build the .swu"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  opt signing requested"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    SWG->>KMS: sign the sw-description"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    KMS-->>SWG: signature"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  SWG-->>API: .swu file"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>FS: publish the build to the builds store"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: snapshot the version and its manifest"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  opt signing requested"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>KMS: sign the version manifest"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    KMS-->>API: signature"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: set status built and uri"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: 200 Update pack executed successfully"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Things to know about the build:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["The pack is created with a name, a semantic ",e.jsx(i.code,{children:"version"}),", a ",e.jsx(i.code,{children:"group_id"}),", a ",e.jsx(i.code,{children:"type"})," and an optional ",e.jsx(i.code,{children:"packaging"}),". A duplicate name in the group is a ",e.jsx(i.code,{children:"409"}),"."]}),`
`,e.jsxs(i.li,{children:["Uploading an artifact (or a prebuilt deliverable) to a version that is already built is refused with ",e.jsx(i.code,{children:"409"}),": create a new version first. A build or change that collides with another one on the same pack answers ",e.jsx(i.code,{children:"409"})," too."]}),`
`,e.jsxs(i.li,{children:["A file larger than ",e.jsx(i.code,{children:"max_artifact_size_mb"})," (10240 MiB by default) is refused with ",e.jsx(i.code,{children:"413"}),"."]}),`
`,e.jsxs(i.li,{children:["Encryption is chosen by the build body: ",e.jsx(i.code,{children:"user"})," plus ",e.jsx(i.code,{children:"encryption_key_name"})," is shared-key encryption, and ",e.jsx(i.code,{children:"encryption_alg_name"})," alone is per-device encryption (flow 5)."]}),`
`,e.jsxs(i.li,{children:["If the build fails, the pack becomes ",e.jsx(i.code,{children:"build_failed"}),", ",e.jsx(i.code,{children:"last_build_error"})," says why, and the pack stays editable. The selected artifacts replace the pack version's earlier artifact links."]}),`
`,e.jsx(i.li,{children:"Without signing fields the manifest is stored unsigned. If a signing key is given but no certificate, the build fails instead."}),`
`,e.jsxs(i.li,{children:["A ",e.jsx(i.code,{children:"non-swu"})," pack is built with ",e.jsx(i.code,{children:"POST .../package"})," into a ",e.jsx(i.code,{children:".tar.gz"}),", and a deliverable built elsewhere is attached with ",e.jsx(i.code,{children:"POST .../swu/upload"})," or ",e.jsx(i.code,{children:".../package/upload"}),"."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"2-create-a-launch",children:"2. Create a launch"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Creating a launch decides who is targeted, and checks the pack is deliverable. Nothing is sent to a device yet."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  actor Op as Operator"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant API as Updates API"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DMS as Lamassu Device Manager"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DB as Postgres"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /groups/{g}/launch {pack name, strategy, test_device_id}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: load the pack by group and name"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  alt pack is not built"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API-->>Op: 400 build the pack first"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  else per-device pack with uncovered devices"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API-->>Op: 400 devices without a package"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  else"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>DMS: list the devices of the group"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    DMS-->>API: device ids"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>API: evaluate the pack's preconditions per device"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    alt no device to target"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"      API-->>Op: 500 the group has no devices to launch to"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    else canary not in the group, or not qualifying"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"      API-->>Op: 400 test device is not a qualifying member"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    else"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"      API->>DB: insert the launch and one pending assignment per device"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"      API-->>Op: 201 launch_id, precondition_failures, forced"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.code,{children:"?dry_run=true"})," stops after the precondition check and answers ",e.jsx(i.code,{children:"200"})," with ",e.jsx(i.code,{children:"qualifying_devices"}),", ",e.jsx(i.code,{children:"precondition_failures"}),", ",e.jsx(i.code,{children:"superseded_devices"})," and ",e.jsx(i.code,{children:"never_seen_devices"}),". ",e.jsx(i.code,{children:"force_preconditions"})," targets every device of the group and still records who failed. ",e.jsx(i.code,{children:"distribution_set_name"}),", ",e.jsx(i.code,{children:"workflow_type"})," and ",e.jsx(i.code,{children:"rollout_type"})," are required, and so is a ",e.jsx(i.code,{children:"rollout_value"})," above zero. ",e.jsx(i.code,{children:"approval_threshold"})," and ",e.jsx(i.code,{children:"error_threshold"})," must be between 0 and 100, and each violation is a ",e.jsx(i.code,{children:"400"}),". A launch can also carry ",e.jsx(i.code,{children:"auto"}),", ",e.jsx(i.code,{children:"scheduled_at"}),", ",e.jsx(i.code,{children:"name"}),", ",e.jsx(i.code,{children:"description"})," and ",e.jsx(i.code,{children:"weight"})," (see ",e.jsx(i.a,{href:"/docs/platform/updates/concepts#launch-campaigns",children:"Concepts"}),")."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"3-roll-out-a-batch-and-update-a-device",children:"3. Roll out a batch and update a device"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["One ",e.jsx(i.code,{children:"rollout"})," call sends the next batch. The canary goes alone first, then batches of the configured size, chosen at random from the devices still pending. The device side below is the ",e.jsx(i.code,{children:"direct"})," workflow, where a job starts in ",e.jsx(i.code,{children:"INSTALL"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  actor Op as Operator"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant API as Updates API"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DB as Postgres"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant WFX as WFX"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant Dev as Device (SWUpdate)"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /groups/{g}/launch/{id}/rollout"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: claim the next batch index (atomic, one dispatcher per launch)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  loop each device in the batch"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>WFX: create job (workflow, uri, algorithm, iv, version)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    WFX-->>API: job id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>DB: record a pending update-history row"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>DB: mark the device's assignment active"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: 200"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>WFX: poll for jobs of this client"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  WFX-->>Dev: job in state INSTALL"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>API: GET .../swu/download/{deviceId}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Dev: the .swu"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>WFX: PUT status INSTALLING"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>WFX: PUT status INSTALLED"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  WFX->>WFX: automatic transition to ACTIVATE"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>WFX: PUT status ACTIVATING"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>WFX: PUT status ACTIVATED"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  WFX-->>API: event stream: every job state change"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Note over API,DB: Flow 4 handles each event"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["With the ",e.jsx(i.code,{children:"phased"})," workflow a job starts in ",e.jsx(i.code,{children:"CREATED"}),", and some transitions need a person or system to confirm them in WFX. This service does not advance them. The ",e.jsx(i.code,{children:"download-install"})," workflow, used by ",e.jsx(i.code,{children:"non-swu"})," packs, runs ",e.jsx(i.code,{children:"DOWNLOAD → DOWNLOADING → DOWNLOADED → INSTALL → INSTALLING → INSTALLED"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["With ",e.jsx(i.code,{children:"auto"})," on, one ",e.jsx(i.code,{children:"rollout"})," call starts the launch and the following batches are released by flow 4. A launch with ",e.jsx(i.code,{children:"scheduled_at"})," is started by the scheduled-launch trigger on the leader replica once that time passes."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"rollout"})," call is not always a plain ",e.jsx(i.code,{children:"200"}),":"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["It is refused with ",e.jsx(i.code,{children:"400"})," when the launch is paused, cancelled, completed or aborted, and on an ",e.jsx(i.code,{children:"auto"})," launch once any batch has gone out."]}),`
`,e.jsxs(i.li,{children:["It does nothing and answers ",e.jsx(i.code,{children:"200"})," while ",e.jsx(i.code,{children:"scheduled_at"})," is still in the future, and while the canary is still active. It returns an error if the canary failed."]}),`
`,e.jsxs(i.li,{children:["If some jobs cannot be created, those devices stay ",e.jsx(i.code,{children:"pending"}),' and the call returns a "partial rollout" error (',e.jsx(i.code,{children:"500"}),")."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"4-react-to-a-device-finishing",children:"4. React to a device finishing"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Every state change WFX reports runs the same logic. This is what makes automatic batching, the canary gate and the error threshold work."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["On ",e.jsx(i.strong,{children:"every"})," event the service updates the device's update history and writes the event to the device's metadata in Lamassu. Then, only if the state is a terminal one of the workflow, it runs these checks in order, and the first one that applies decides what happens:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"#"}),e.jsx(i.th,{children:"Check"}),e.jsx(i.th,{children:"If it applies"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"1"}),e.jsx(i.td,{children:"Is the state terminal in the workflow?"}),e.jsx(i.td,{children:"If not, nothing more happens"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"2"}),e.jsx(i.td,{children:"(always)"}),e.jsxs(i.td,{children:["Mark the device's assignment ",e.jsx(i.code,{children:"completed"})," or ",e.jsx(i.code,{children:"failed"}),". On success, record the installed version"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"3"}),e.jsx(i.td,{children:"Did the canary device fail?"}),e.jsx(i.td,{children:"Pause the launch. Resume to retry"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"4"}),e.jsx(i.td,{children:"Is the launch paused, cancelled or completed?"}),e.jsx(i.td,{children:"Stop: no further batches"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"5"}),e.jsxs(i.td,{children:["Is ",e.jsx(i.code,{children:"error_threshold"})," set, and have failures reached that share of all devices (rounded up)?"]}),e.jsx(i.td,{children:"Cancel the launch. Pending devices are not sent"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"6"}),e.jsx(i.td,{children:"Is nothing pending and nothing active?"}),e.jsxs(i.td,{children:["Mark the launch ",e.jsx(i.code,{children:"completed"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"7"}),e.jsxs(i.td,{children:["Is ",e.jsx(i.code,{children:"auto"})," off, or is nothing left to send?"]}),e.jsxs(i.td,{children:["Wait for the operator's next ",e.jsx(i.code,{children:"rollout"})," call, or for the devices still in flight"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"8"}),e.jsxs(i.td,{children:["Did at least ",e.jsx(i.code,{children:"approval_threshold"})," of this batch succeed? (0 or 100 or more means all of it)"]}),e.jsx(i.td,{children:"Dispatch the next batch. Otherwise wait for more results"})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Only devices dispatched in the current batch count toward its approval: a straggler from an earlier batch never does. The checks move the launch between these states:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"stateDiagram-v2"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  direction LR"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  [*] --> running: launch created"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  running --> paused: operator pauses, or the canary fails"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  paused --> running: resume"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  running --> cancelled: operator cancels, or error_threshold reached"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  paused --> cancelled: operator cancels"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  running --> completed: nothing pending and nothing active, or operator completes"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  paused --> completed: operator completes"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  completed --> running: retry-failed"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  cancelled --> running: retry-failed"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["A new launch is stored with an empty status, which means ",e.jsx(i.code,{children:"running"}),". Resuming after a failed canary re-queues the canary so it is tried again. Cancelling stops further batches but does not recall jobs that are already running on devices."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"5-build-a-per-device-encrypted-pack",children:"5. Build a per-device encrypted pack"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Each device gets its own package, encrypted with its own key. The build first resolves every device's key, then builds. A device without a key is skipped, and a launch on a pack with skipped devices is refused."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  actor Op as Operator"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant API as Updates API"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant SYM as SymKMS"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DMS as Lamassu Device Manager"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant SWG as swugenerator"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  loop each device"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    Op->>SYM: POST /symkms/v1/ create key"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    Op->>SYM: POST /symkms/v1/inventory/{device}/keys/{key} {purpose: firmware-encryption}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST .../swu {encryption_alg_name, selected_artifact_ids}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DMS: list the group's devices"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Note over API: build fails if the group has no devices, or the sw-description marks no file encrypted = true"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  par each device, concurrently"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>SYM: GET /symkms/v1/inventory/{device}/key"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Note over API: build fails if no device has a key"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  par each device with a key, concurrently"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>SWG: build a .swu encrypted with that key"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>API: record built_device_count, total_device_count, uncovered_devices"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: 200"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Note over Op,API: Launch creation returns 400 while uncovered_devices is not empty"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.code,{children:"uncovered_devices"})," lists devices without a key and also devices whose own build failed. A build where no device got a package leaves the pack ",e.jsx(i.code,{children:"build_failed"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"hawkbit-mode",children:"hawkBit mode"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"6-build-a-module-and-create-a-pack",children:"6. Build a module and create a pack"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["hawkBit itself has no notion of a built module, and this service links only built modules into a hawkBit distribution set. A set is never built directly: ",e.jsx(i.code,{children:"POST .../swu"})," and ",e.jsx(i.code,{children:".../package"})," answer ",e.jsx(i.code,{children:"501"})," in this mode. The module is built first, in the catalog, and the pack is created from it. The diagram shows the ",e.jsx(i.code,{children:"swu-build"})," intent."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  actor Op as Operator"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant API as Updates API"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DB as Postgres"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant SWG as swugenerator"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant HB as hawkBit"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /softwaremodules {type, name, version, delivery_intent}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: create software module"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: module id"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /softwaremodules/by-id/{id}/artifacts (file)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: upload the artifact to the module"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /softwaremodules/by-id/{id}/descriptor (sw-description)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DB: store the sw-description"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /softwaremodules/by-id/{id}/build"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: read the module's input files"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>SWG: build the .swu"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  SWG-->>API: .swu file"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: upload the .swu, then remove the module's input artifacts"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: module built"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /groups/{g}/distribution-sets {modules: [{source_module_id}]}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: create the distribution set linking the built module"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: tag it with the group"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  opt the modules were signed"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    API->>DB: store the signed set manifest"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  end"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: 201 pack (already built)"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The other delivery intents skip steps: ",e.jsx(i.code,{children:"swu-prebuilt"})," only uploads the finished ",e.jsx(i.code,{children:".swu"}),", which is what builds the module, and ",e.jsx(i.code,{children:"raw"})," only encrypts or signs the files, with no swugenerator and no sw-description (signing adds a ",e.jsx(i.code,{children:".sha256"})," checksum document and its detached signature as extra artifacts). A build can sign through the KMS and encrypt with a shared SymKMS key. Per-device encryption is refused in hawkBit mode. A linked module is frozen: to change it, edit and build it in the catalog, then link it again."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"7-launch-and-device-update",children:"7. Launch and device update"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"The device talks to hawkBit, not to this service. The service reads progress back from hawkBit whenever it is asked."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  actor Op as Operator"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant API as Updates API"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant DMS as Lamassu Device Manager"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant HB as hawkBit"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant Dev as Device (SWUpdate suricatta)"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST /groups/{g}/launch {pack, strategy}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>DMS: list the devices of the group"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: create the missing targets and tag them group:{g}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>API: check the canary, the pack's group and the preconditions"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: create a rollout (optional canary group, then batches, then the rest)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: 201 launch_id, never_seen_devices"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: POST .../rollout"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: start the rollout, or release the next group"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>HB: DDI poll, authenticated per the tenant's settings"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  HB-->>Dev: deploymentBase with the module's artifact"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>HB: download the .swu"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Dev->>HB: feedback proceeding, then closed with result success"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  HB->>HB: rollout group counters, success and error conditions"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  Op->>API: GET /groups/{g}/launch"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API->>HB: read the rollout and its groups"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  API-->>Op: status and counters"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["A canary group exists only when ",e.jsx(i.code,{children:"test_device_id"})," is given. hawkBit decides when a group succeeds and the next group starts, using the approval and error thresholds the service gave it. With ",e.jsx(i.code,{children:"auto"})," off, hawkBit pauses after each group and the next ",e.jsx(i.code,{children:"rollout"})," call releases the following one. The launch response also lists ",e.jsx(i.code,{children:"superseded_devices"})," (devices whose in-flight update the new rollout replaces) and ",e.jsx(i.code,{children:"never_seen_devices"})," (devices that have never polled, which can stall a group that must reach its success threshold)."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"rollout"})," call depends on the rollout's state:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["A ",e.jsx(i.code,{children:"ready"})," rollout is started, and nothing happens while its start time is in the future."]}),`
`,e.jsxs(i.li,{children:["A paused rollout is resumed only if it is paused between batches. An operator pause needs ",e.jsx(i.code,{children:"resume"}),", and a rollout stopped by its error threshold cannot be resumed."]}),`
`,e.jsx(i.li,{children:"A running manual rollout releases its next group."}),`
`,e.jsxs(i.li,{children:["An ",e.jsx(i.code,{children:"auto"})," rollout that is already running is refused with ",e.jsx(i.code,{children:"400"}),"."]}),`
`,e.jsxs(i.li,{children:["A second ",e.jsx(i.code,{children:"rollout"})," on the same launch while one is in progress answers ",e.jsx(i.code,{children:"409"}),"."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Device authentication is a hawkBit tenant setting. Target security tokens are off by default. See ",e.jsx(i.a,{href:"/docs/platform/updates/guides/connect-a-device",children:"Connect a device"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"next-steps",children:"Next steps"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(a,{children:[e.jsx(n,{title:"Publish and roll out an update",description:"Run flows 1 to 4 end to end.",href:"/docs/platform/updates/guides/publish-and-roll-out"}),e.jsx(n,{title:"Data model",description:"The tables behind these flows.",href:"/docs/platform/updates/data-model"}),e.jsx(n,{title:"Signing and encryption",description:"Keys, signatures and the manifest.",href:"/docs/platform/updates/signing-and-encryption"})]})})]})}function p(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(t,{...s})}):t(s)}function l(s,i){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}const k=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:p,frontmatter:r,lmDiff:c,structuredData:h,toc:o},Symbol.toStringTag,{value:"Module"}));export{k as _};
