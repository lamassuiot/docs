import{j as e}from"./index-DqgIL_Rv.js";let l=`

<div className="lm-diff-ins lm-diff-block">
  This guide describes the contract between a device and Lamassu Updates, for each backend. The device software is [SWUpdate](https://swupdate.org/): this page covers what the device must send and receive, not SWUpdate's own installation and configuration, which its documentation describes. Use it when a launch is running and no device moves.
</div>

<div className="lm-diff-ins lm-diff-block">
  Before you begin [#before-you-begin]
</div>

<div className="lm-diff-ins lm-diff-block">
  * A device with SWUpdate installed, and a way to run an update client: a small agent, or SWUpdate's \`suricatta\` module.
  * A device identity: one ID that is the same everywhere. It is the WFX client ID in native mode and the hawkBit controller ID in hawkBit mode, and it must equal the device's ID in the Lamassu device registry (see [Device management](/docs/platform/iot-fleets/device-management)).
  * The device must be a member of a Lamassu IoT device group, because a pack belongs to a group and a launch targets the group's devices. In hawkBit mode group membership is also read from the registry when \`dms_endpoint\` is set.
  * Native mode only: \`update_domain\` must be an address the device can reach. See [Configuration](/docs/platform/updates/reference/configuration). In hawkBit mode devices download from hawkBit.
</div>

<div className="lm-diff-ins lm-diff-block">
  Native mode: the device polls WFX [#native-mode-the-device-polls-wfx]
</div>

<div className="lm-diff-ins lm-diff-block">
  In native mode a launch creates one WFX job per device. The device polls WFX for jobs addressed to its ID, downloads the deliverable from the Updates API, installs it and reports each state back to WFX. Lamassu Updates reads those states from WFX to drive the launch.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    participant U as Lamassu Updates
    participant W as WFX
    participant D as Device
    U->>W: create a job for the device ID
    D->>W: poll jobs addressed to its ID
    D->>U: download the .swu for its device ID
    D->>W: report INSTALLING, INSTALLED, ACTIVATED
    W-->>U: job events
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  The sample device in \`docker-compose.yml\` (\`swupdate-device1\`) shows the minimum configuration. It takes three variables: \`DEVICE_NAME\` (its ID), \`WFX_URI\` (the WFX **client** API, \`http://custom-wfx:8080/api/wfx/v1\` inside the Compose network, \`localhost:9080\` from the host) and \`PORT\`. The WFX management API on \`9081\` is for the service, not for devices.
</div>

<div className="lm-diff-ins lm-diff-block">
  The job the device receives [#the-job-the-device-receives]
</div>

<div className="lm-diff-ins lm-diff-block">
  The job is addressed to the device (the WFX \`clientId\` is the device ID), names a workflow and is tagged with the launch (\`lms://secure-updates/<launch id>\`) and the group (\`lms://dms/<group id>\`). Its definition looks like this:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`json
  {
    "type": ["firmware"],
    "launchID": "<launch id>",
    "version": "1.0.0",
    "groupID": "<group id>",
    "artifacts": [
      {
        "name": "my-firmware",
        "uri": "http://updates:10090/updates/v1/groups/<group>/distribution-sets/my-firmware/swu/download/<device-id>",
        "algorithm": "<algorithm name>",
        "iv": "<hex>"
      }
    ]
  }
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  | Field                                                              | Meaning                                                                                                                                                            |
  | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | \`type\`                                                             | The pack type: \`rawfile\`, \`firmware\`, or both (\`["rawfile","firmware"]\`)                                                                                           |
  | \`artifacts[0].uri\`                                                 | Where to download the deliverable. The service appends the device ID, so each device fetches its own file. A \`.swu\` for SWU packs, a \`.tar.gz\` for \`non-swu\` packs |
  | \`algorithm\`, \`iv\`                                                  | Present only for an encrypted pack: the algorithm and, for shared-key packs, the hex IV or nonce. A per-device pack carries the algorithm but no \`iv\`              |
  | \`signature_key_id\`, \`signature_algorithm\`, \`signature_certificate\` | Present only for a signed pack                                                                                                                                     |
</div>

<div className="lm-diff-ins lm-diff-block">
  The device needs the key to decrypt, and holds it itself. For a per-device pack it is the key that SymKMS assigned to that device, and each device downloads a different file.
</div>

<div className="lm-diff-ins lm-diff-block">
  Downloading [#downloading]
</div>

<div className="lm-diff-ins lm-diff-block">
  The download answers with the bytes, or with \`302\` to a short-lived signed URL when presigned downloads are enabled for the build store. Make sure the device's HTTP client follows redirects. The route also answers \`HEAD\` and byte-range requests (\`206\`), so an interrupted download can resume. The URL is fixed when the pack is built, so a device never sees a new \`update_domain\` until you rebuild.
</div>

<div className="lm-diff-ins lm-diff-block">
  The states the device reports [#the-states-the-device-reports]
</div>

<div className="lm-diff-ins lm-diff-block">
  The device moves its job through the workflow's states, and the workflow decides who may make each move. For the \`direct\` workflow:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`text
  INSTALL → INSTALLING → INSTALLED → (WFX, automatic) ACTIVATE → ACTIVATING → ACTIVATED
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  The device reports \`INSTALLING\`, \`INSTALLED\`, \`ACTIVATING\` and \`ACTIVATED\`. WFX itself makes the \`INSTALLED → ACTIVATE\` step. From \`INSTALL\`, \`INSTALLING\`, \`ACTIVATE\` and \`ACTIVATING\` the device can move to \`TERMINATED\` to report a failure; \`INSTALLED\` has no failure transition.
</div>

<div className="lm-diff-ins lm-diff-block">
  | Workflow                            | Used for                                                                     | Terminal states                               |
  | ----------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------- |
  | \`wfx.workflow.dau.direct\`           | SWU packs, no confirmation                                                   | \`ACTIVATED\` (success), \`TERMINATED\` (failure) |
  | \`wfx.workflow.dau.phased\`           | SWU packs with confirmation steps (\`CREATED → DOWNLOAD → ... → ACTIVATED\`)   | \`ACTIVATED\`, \`TERMINATED\`                     |
  | \`wfx.workflow.dau.download-install\` | \`non-swu\` packs: \`DOWNLOAD → ... → INSTALLED\`, every move made by the device | \`INSTALLED\`, \`TERMINATED\`                     |
  | \`wfx.workflow.dau.simple\`           | Minimal \`DOWNLOAD → INSTALL → INSTALLED\`                                     | \`INSTALLED\`, \`TERMINATED\`                     |
</div>

<div className="lm-diff-ins lm-diff-block">
  A \`phased\` job has moves that WFX or an operator makes, and nothing in Lamassu Updates advances them: it stays at \`CREATED\` until someone confirms it through WFX (the dashboard's **Next** button does that). The launch endpoints \`force-version\` and \`sync-to-latest\` use \`phased\` for SWU packs unless you pass a \`workflow\`. The workflow files are in \`wfx/workflow/dau/\` of the repository. The WFX HTTP API (listing jobs, updating status) is documented by [WFX](https://github.com/siemens/wfx).
</div>

<div className="lm-diff-ins lm-diff-block">
  hawkBit mode: the device polls hawkBit [#hawkbit-mode-the-device-polls-hawkbit]
</div>

<div className="lm-diff-ins lm-diff-block">
  In hawkBit mode devices do not poll Lamassu Updates. They poll hawkBit's DDI API, and Lamassu Updates reads the resulting action state from hawkBit.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  sequenceDiagram
    participant U as Lamassu Updates
    participant H as hawkBit
    participant D as Device
    U->>H: create the rollout
    D->>H: poll the DDI API
    D->>H: download the module artifacts
    D->>H: post DDI feedback
    U->>H: read action and rollout state
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  <Steps>
    <Step>
      Make the device a hawkBit target [#make-the-device-a-hawkbit-target]

      The device needs a controller ID, and a target tagged \`group:<id>\` for its group. With \`dms_endpoint\` set, the service does this itself: when it reads a group's devices from the registry it creates the missing targets and tags them. Without \`dms_endpoint\` you create the targets and tags yourself. Either way the device must poll hawkBit with valid credentials.
    </Step>

    <Step>
      Configure SWUpdate [#configure-swupdate]

      Point the device's SWUpdate (\`suricatta\`) at hawkBit's URL (\`hawkbit.ddi_url\`, which defaults to \`hawkbit.base_url\`), with the tenant, the controller ID and an authentication method that your hawkBit tenant accepts. hawkBit refuses unauthenticated devices by default. With target security tokens, enable them for the tenant (\`PUT /rest/v1/system/configs/authentication.targettoken.enabled\` with \`{"value":true}\`) and give each device its target's \`securityToken\`, which it sends as \`Authorization: TargetToken <token>\`. The [hawkBit curl guide](/docs/platform/updates/guides/hawkbit-curl) shows every request.
    </Step>

    <Step>
      Point it at the right hawkBit [#point-it-at-the-right-hawkbit]

      The device must poll the **same hawkBit** that the service is configured for. A service pointed at a hawkBit with no targets builds and launches without error, and nothing downloads it. See [Troubleshooting](/docs/platform/updates/troubleshooting).
    </Step>
  </Steps>
</div>

<div className="lm-diff-ins lm-diff-block">
  hawkBit then hands the device every artifact of its distribution set. A pack with several modules runs several independent installs.
</div>

<div className="lm-diff-ins lm-diff-block">
  When your gateway routes hawkBit's device artifact URLs (the path of \`hawkbit.ddi_url\`, \`.../<tenant>/controller/v1/<controller>/softwaremodules/<id>/artifacts/<file>\`) to Lamassu Updates, the service serves them only for modules assigned to or installed on that controller, and answers \`404\` otherwise. With presigned downloads on, it redirects to a signed URL of hawkBit's S3 bucket instead of streaming the file.
</div>

<div className="lm-diff-ins lm-diff-block">
  Signed and encrypted images [#signed-and-encrypted-images]
</div>

<div className="lm-diff-ins lm-diff-block">
  If the device verifies signatures, set its public key (\`public-key-file\` in SWUpdate's configuration) and sign the package with the matching key. If it decrypts, it needs the same key and algorithm the pack was built with. A mismatch is the usual reason an install fails silently after a successful download. [Signing and encryption](/docs/platform/updates/signing-and-encryption) explains which key, algorithm and IV each mode uses, and what the device receives.
</div>

<div className="lm-diff-ins lm-diff-block">
  Verify the result [#verify-the-result]
</div>

<div className="lm-diff-ins lm-diff-block">
  After a launch, the device's job reaches \`ACTIVATED\` (or \`INSTALLED\` for a \`non-swu\` pack), the launch counters update, and the device inventory lists the pack:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  API=http://localhost:10090/updates/v1
  curl -s $API/devices/<device-id>/distribution-set-inventory
  curl -s $API/launch/<launch-id>/jobs
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  See [Publish and roll out an update](/docs/platform/updates/guides/publish-and-roll-out#verify-the-result) for the rest of the checks.
</div>

<div className="lm-diff-ins lm-diff-block">
  Troubleshooting [#troubleshooting]
</div>

<div className="lm-diff-ins lm-diff-block">
  | Symptom                                                     | Likely cause                                                                                                                                                       |
  | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | The device never sees a job (native)                        | It polls the wrong WFX endpoint or uses a different ID than the group member. The WFX \`clientId\` must equal the device ID                                          |
  | The job stays at \`CREATED\`                                  | The launch uses \`phased\`. Confirm it through WFX or the dashboard, or relaunch with \`direct\`                                                                       |
  | The download fails with \`404\`                               | The pack is per-device encrypted and the device has no key, or the URL names another device. Check the pack's coverage and that the URL ends with this device's ID |
  | The download succeeds and the install fails                 | The signature or the key does not match what the device holds. See [Signing and encryption](/docs/platform/updates/signing-and-encryption)                         |
  | A \`non-swu\` launch looks stuck although the device finished | It was launched with \`direct\` or \`phased\`, which wait for \`ACTIVATED\`. Launch \`non-swu\` packs with \`download-install\`                                              |
  | The launch never advances (hawkBit)                         | The device is not polling this hawkBit, is not tagged into the group, or cannot authenticate                                                                       |
</div>

<div className="lm-diff-ins lm-diff-block">
  Next steps [#next-steps]
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Signing and encryption" href="/docs/platform/updates/signing-and-encryption" description="Keys, algorithms and what the device must hold." />

    <Card title="hawkBit mode" href="/docs/platform/updates/hawkbit-mode" description="How the adapter maps packs and campaigns onto hawkBit." />

    <Card title="Troubleshooting" href="/docs/platform/updates/troubleshooting" description="Updates not reaching devices, and other failures." />
  </Cards>
</div>
`,o={title:"Connect a device",description:"What a device must do to receive updates from Lamassu Updates, in native mode and in hawkBit mode."},c={isNew:!0,changes:36,title:void 0,description:void 0},f={contents:[{heading:void 0,content:"This guide describes the contract between a device and Lamassu Updates, for each backend. The device software is SWUpdate: this page covers what the device must send and receive, not SWUpdate's own installation and configuration, which its documentation describes. Use it when a launch is running and no device moves."},{heading:"before-you-begin",content:"A device with SWUpdate installed, and a way to run an update client: a small agent, or SWUpdate's `suricatta` module."},{heading:"before-you-begin",content:"A device identity: one ID that is the same everywhere. It is the WFX client ID in native mode and the hawkBit controller ID in hawkBit mode, and it must equal the device's ID in the Lamassu device registry (see Device management)."},{heading:"before-you-begin",content:"The device must be a member of a Lamassu IoT device group, because a pack belongs to a group and a launch targets the group's devices. In hawkBit mode group membership is also read from the registry when `dms_endpoint` is set."},{heading:"before-you-begin",content:"Native mode only: `update_domain` must be an address the device can reach. See Configuration. In hawkBit mode devices download from hawkBit."},{heading:"native-mode-the-device-polls-wfx",content:"In native mode a launch creates one WFX job per device. The device polls WFX for jobs addressed to its ID, downloads the deliverable from the Updates API, installs it and reports each state back to WFX. Lamassu Updates reads those states from WFX to drive the launch."},{heading:"native-mode-the-device-polls-wfx",content:"The sample device in `docker-compose.yml` (`swupdate-device1`) shows the minimum configuration. It takes three variables: `DEVICE_NAME` (its ID), `WFX_URI` (the WFX **client** API, `http://custom-wfx:8080/api/wfx/v1` inside the Compose network, `localhost:9080` from the host) and `PORT`. The WFX management API on `9081` is for the service, not for devices."},{heading:"the-job-the-device-receives",content:"The job is addressed to the device (the WFX `clientId` is the device ID), names a workflow and is tagged with the launch (`lms://secure-updates/<launch id>`) and the group (`lms://dms/<group id>`). Its definition looks like this:"},{heading:"the-job-the-device-receives",content:"Field"},{heading:"the-job-the-device-receives",content:"Meaning"},{heading:"the-job-the-device-receives",content:"`type`"},{heading:"the-job-the-device-receives",content:'The pack type: `rawfile`, `firmware`, or both (`["rawfile","firmware"]`)'},{heading:"the-job-the-device-receives",content:"`artifacts[0].uri`"},{heading:"the-job-the-device-receives",content:"Where to download the deliverable. The service appends the device ID, so each device fetches its own file. A `.swu` for SWU packs, a `.tar.gz` for `non-swu` packs"},{heading:"the-job-the-device-receives",content:"`algorithm`, `iv`"},{heading:"the-job-the-device-receives",content:"Present only for an encrypted pack: the algorithm and, for shared-key packs, the hex IV or nonce. A per-device pack carries the algorithm but no `iv`"},{heading:"the-job-the-device-receives",content:"`signature_key_id`, `signature_algorithm`, `signature_certificate`"},{heading:"the-job-the-device-receives",content:"Present only for a signed pack"},{heading:"the-job-the-device-receives",content:"The device needs the key to decrypt, and holds it itself. For a per-device pack it is the key that SymKMS assigned to that device, and each device downloads a different file."},{heading:"downloading",content:"The download answers with the bytes, or with `302` to a short-lived signed URL when presigned downloads are enabled for the build store. Make sure the device's HTTP client follows redirects. The route also answers `HEAD` and byte-range requests (`206`), so an interrupted download can resume. The URL is fixed when the pack is built, so a device never sees a new `update_domain` until you rebuild."},{heading:"the-states-the-device-reports",content:"The device moves its job through the workflow's states, and the workflow decides who may make each move. For the `direct` workflow:"},{heading:"the-states-the-device-reports",content:"The device reports `INSTALLING`, `INSTALLED`, `ACTIVATING` and `ACTIVATED`. WFX itself makes the `INSTALLED → ACTIVATE` step. From `INSTALL`, `INSTALLING`, `ACTIVATE` and `ACTIVATING` the device can move to `TERMINATED` to report a failure; `INSTALLED` has no failure transition."},{heading:"the-states-the-device-reports",content:"Workflow"},{heading:"the-states-the-device-reports",content:"Used for"},{heading:"the-states-the-device-reports",content:"Terminal states"},{heading:"the-states-the-device-reports",content:"`wfx.workflow.dau.direct`"},{heading:"the-states-the-device-reports",content:"SWU packs, no confirmation"},{heading:"the-states-the-device-reports",content:"`ACTIVATED` (success), `TERMINATED` (failure)"},{heading:"the-states-the-device-reports",content:"`wfx.workflow.dau.phased`"},{heading:"the-states-the-device-reports",content:"SWU packs with confirmation steps (`CREATED → DOWNLOAD → ... → ACTIVATED`)"},{heading:"the-states-the-device-reports",content:"`ACTIVATED`, `TERMINATED`"},{heading:"the-states-the-device-reports",content:"`wfx.workflow.dau.download-install`"},{heading:"the-states-the-device-reports",content:"`non-swu` packs: `DOWNLOAD → ... → INSTALLED`, every move made by the device"},{heading:"the-states-the-device-reports",content:"`INSTALLED`, `TERMINATED`"},{heading:"the-states-the-device-reports",content:"`wfx.workflow.dau.simple`"},{heading:"the-states-the-device-reports",content:"Minimal `DOWNLOAD → INSTALL → INSTALLED`"},{heading:"the-states-the-device-reports",content:"`INSTALLED`, `TERMINATED`"},{heading:"the-states-the-device-reports",content:"A `phased` job has moves that WFX or an operator makes, and nothing in Lamassu Updates advances them: it stays at `CREATED` until someone confirms it through WFX (the dashboard's **Next** button does that). The launch endpoints `force-version` and `sync-to-latest` use `phased` for SWU packs unless you pass a `workflow`. The workflow files are in `wfx/workflow/dau/` of the repository. The WFX HTTP API (listing jobs, updating status) is documented by WFX."},{heading:"hawkbit-mode-the-device-polls-hawkbit",content:"In hawkBit mode devices do not poll Lamassu Updates. They poll hawkBit's DDI API, and Lamassu Updates reads the resulting action state from hawkBit."},{heading:"make-the-device-a-hawkbit-target",content:"The device needs a controller ID, and a target tagged `group:<id>` for its group. With `dms_endpoint` set, the service does this itself: when it reads a group's devices from the registry it creates the missing targets and tags them. Without `dms_endpoint` you create the targets and tags yourself. Either way the device must poll hawkBit with valid credentials."},{heading:"configure-swupdate",content:"Point the device's SWUpdate (`suricatta`) at hawkBit's URL (`hawkbit.ddi_url`, which defaults to `hawkbit.base_url`), with the tenant, the controller ID and an authentication method that your hawkBit tenant accepts. hawkBit refuses unauthenticated devices by default. With target security tokens, enable them for the tenant (`PUT /rest/v1/system/configs/authentication.targettoken.enabled` with `{\"value\":true}`) and give each device its target's `securityToken`, which it sends as `Authorization: TargetToken <token>`. The hawkBit curl guide shows every request."},{heading:"point-it-at-the-right-hawkbit",content:"The device must poll the **same hawkBit** that the service is configured for. A service pointed at a hawkBit with no targets builds and launches without error, and nothing downloads it. See Troubleshooting."},{heading:"point-it-at-the-right-hawkbit",content:"hawkBit then hands the device every artifact of its distribution set. A pack with several modules runs several independent installs."},{heading:"point-it-at-the-right-hawkbit",content:"When your gateway routes hawkBit's device artifact URLs (the path of `hawkbit.ddi_url`, `.../<tenant>/controller/v1/<controller>/softwaremodules/<id>/artifacts/<file>`) to Lamassu Updates, the service serves them only for modules assigned to or installed on that controller, and answers `404` otherwise. With presigned downloads on, it redirects to a signed URL of hawkBit's S3 bucket instead of streaming the file."},{heading:"signed-and-encrypted-images",content:"If the device verifies signatures, set its public key (`public-key-file` in SWUpdate's configuration) and sign the package with the matching key. If it decrypts, it needs the same key and algorithm the pack was built with. A mismatch is the usual reason an install fails silently after a successful download. Signing and encryption explains which key, algorithm and IV each mode uses, and what the device receives."},{heading:"verify-the-result",content:"After a launch, the device's job reaches `ACTIVATED` (or `INSTALLED` for a `non-swu` pack), the launch counters update, and the device inventory lists the pack:"},{heading:"verify-the-result",content:"See Publish and roll out an update for the rest of the checks."},{heading:"troubleshooting",content:"Symptom"},{heading:"troubleshooting",content:"Likely cause"},{heading:"troubleshooting",content:"The device never sees a job (native)"},{heading:"troubleshooting",content:"It polls the wrong WFX endpoint or uses a different ID than the group member. The WFX `clientId` must equal the device ID"},{heading:"troubleshooting",content:"The job stays at `CREATED`"},{heading:"troubleshooting",content:"The launch uses `phased`. Confirm it through WFX or the dashboard, or relaunch with `direct`"},{heading:"troubleshooting",content:"The download fails with `404`"},{heading:"troubleshooting",content:"The pack is per-device encrypted and the device has no key, or the URL names another device. Check the pack's coverage and that the URL ends with this device's ID"},{heading:"troubleshooting",content:"The download succeeds and the install fails"},{heading:"troubleshooting",content:"The signature or the key does not match what the device holds. See Signing and encryption"},{heading:"troubleshooting",content:"A `non-swu` launch looks stuck although the device finished"},{heading:"troubleshooting",content:"It was launched with `direct` or `phased`, which wait for `ACTIVATED`. Launch `non-swu` packs with `download-install`"},{heading:"troubleshooting",content:"The launch never advances (hawkBit)"},{heading:"troubleshooting",content:"The device is not polling this hawkBit, is not tagged into the group, or cannot authenticate"},{heading:"next-steps",content:'<Card title="Signing and encryption" href="/docs/platform/updates/signing-and-encryption" description="Keys, algorithms and what the device must hold." />'},{heading:"next-steps",content:'<Card title="hawkBit mode" href="/docs/platform/updates/hawkbit-mode" description="How the adapter maps packs and campaigns onto hawkBit." />'},{heading:"next-steps",content:'<Card title="Troubleshooting" href="/docs/platform/updates/troubleshooting" description="Updates not reaching devices, and other failures." />'}],headings:[{id:"before-you-begin",content:"Before you begin"},{id:"native-mode-the-device-polls-wfx",content:"Native mode: the device polls WFX"},{id:"the-job-the-device-receives",content:"The job the device receives"},{id:"downloading",content:"Downloading"},{id:"the-states-the-device-reports",content:"The states the device reports"},{id:"hawkbit-mode-the-device-polls-hawkbit",content:"hawkBit mode: the device polls hawkBit"},{id:"make-the-device-a-hawkbit-target",content:"Make the device a hawkBit target"},{id:"configure-swupdate",content:"Configure SWUpdate"},{id:"point-it-at-the-right-hawkbit",content:"Point it at the right hawkBit"},{id:"signed-and-encrypted-images",content:"Signed and encrypted images"},{id:"verify-the-result",content:"Verify the result"},{id:"troubleshooting",content:"Troubleshooting"},{id:"next-steps",content:"Next steps"}]};const m=[{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:2,url:"#native-mode-the-device-polls-wfx",title:e.jsx(e.Fragment,{children:"Native mode: the device polls WFX"})},{depth:3,url:"#the-job-the-device-receives",title:e.jsx(e.Fragment,{children:"The job the device receives"})},{depth:3,url:"#downloading",title:e.jsx(e.Fragment,{children:"Downloading"})},{depth:3,url:"#the-states-the-device-reports",title:e.jsx(e.Fragment,{children:"The states the device reports"})},{depth:2,url:"#hawkbit-mode-the-device-polls-hawkbit",title:e.jsx(e.Fragment,{children:"hawkBit mode: the device polls hawkBit"})},{depth:3,url:"#make-the-device-a-hawkbit-target",title:e.jsx(e.Fragment,{children:"Make the device a hawkBit target"})},{depth:3,url:"#configure-swupdate",title:e.jsx(e.Fragment,{children:"Configure SWUpdate"})},{depth:3,url:"#point-it-at-the-right-hawkbit",title:e.jsx(e.Fragment,{children:"Point it at the right hawkBit"})},{depth:2,url:"#signed-and-encrypted-images",title:e.jsx(e.Fragment,{children:"Signed and encrypted images"})},{depth:2,url:"#verify-the-result",title:e.jsx(e.Fragment,{children:"Verify the result"})},{depth:2,url:"#troubleshooting",title:e.jsx(e.Fragment,{children:"Troubleshooting"})},{depth:2,url:"#next-steps",title:e.jsx(e.Fragment,{children:"Next steps"})}];function r(t){const i={a:"a",code:"code",div:"div",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components},{Card:s,Cards:d,Step:n,Steps:h}=i;return s||a("Card"),d||a("Cards"),n||a("Step"),h||a("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["This guide describes the contract between a device and Lamassu Updates, for each backend. The device software is ",e.jsx(i.a,{href:"https://swupdate.org/",children:"SWUpdate"}),": this page covers what the device must send and receive, not SWUpdate's own installation and configuration, which its documentation describes. Use it when a launch is running and no device moves."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"before-you-begin",children:"Before you begin"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["A device with SWUpdate installed, and a way to run an update client: a small agent, or SWUpdate's ",e.jsx(i.code,{children:"suricatta"})," module."]}),`
`,e.jsxs(i.li,{children:["A device identity: one ID that is the same everywhere. It is the WFX client ID in native mode and the hawkBit controller ID in hawkBit mode, and it must equal the device's ID in the Lamassu device registry (see ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/device-management",children:"Device management"}),")."]}),`
`,e.jsxs(i.li,{children:["The device must be a member of a Lamassu IoT device group, because a pack belongs to a group and a launch targets the group's devices. In hawkBit mode group membership is also read from the registry when ",e.jsx(i.code,{children:"dms_endpoint"})," is set."]}),`
`,e.jsxs(i.li,{children:["Native mode only: ",e.jsx(i.code,{children:"update_domain"})," must be an address the device can reach. See ",e.jsx(i.a,{href:"/docs/platform/updates/reference/configuration",children:"Configuration"}),". In hawkBit mode devices download from hawkBit."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"native-mode-the-device-polls-wfx",children:"Native mode: the device polls WFX"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"In native mode a launch creates one WFX job per device. The device polls WFX for jobs addressed to its ID, downloads the deliverable from the Updates API, installs it and reports each state back to WFX. Lamassu Updates reads those states from WFX to drive the launch."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant U as Lamassu Updates"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant W as WFX"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant D as Device"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  U->>W: create a job for the device ID"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  D->>W: poll jobs addressed to its ID"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  D->>U: download the .swu for its device ID"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  D->>W: report INSTALLING, INSTALLED, ACTIVATED"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  W-->>U: job events"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The sample device in ",e.jsx(i.code,{children:"docker-compose.yml"})," (",e.jsx(i.code,{children:"swupdate-device1"}),") shows the minimum configuration. It takes three variables: ",e.jsx(i.code,{children:"DEVICE_NAME"})," (its ID), ",e.jsx(i.code,{children:"WFX_URI"})," (the WFX ",e.jsx(i.strong,{children:"client"})," API, ",e.jsx(i.code,{children:"http://custom-wfx:8080/api/wfx/v1"})," inside the Compose network, ",e.jsx(i.code,{children:"localhost:9080"})," from the host) and ",e.jsx(i.code,{children:"PORT"}),". The WFX management API on ",e.jsx(i.code,{children:"9081"})," is for the service, not for devices."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"the-job-the-device-receives",children:"The job the device receives"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The job is addressed to the device (the WFX ",e.jsx(i.code,{children:"clientId"})," is the device ID), names a workflow and is tagged with the launch (",e.jsx(i.code,{children:"lms://secure-updates/<launch id>"}),") and the group (",e.jsx(i.code,{children:"lms://dms/<group id>"}),"). Its definition looks like this:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:'  "type"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": ["}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"firmware"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"],"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:'  "launchID"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"<launch id>"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:'  "version"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"1.0.0"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:'  "groupID"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"<group id>"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:'  "artifacts"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": ["})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:'      "name"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"my-firmware"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:'      "uri"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"http://updates:10090/updates/v1/groups/<group>/distribution-sets/my-firmware/swu/download/<device-id>"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:'      "algorithm"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"<algorithm name>"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:'      "iv"'}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"<hex>"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  ]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"}"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Meaning"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"type"})}),e.jsxs(i.td,{children:["The pack type: ",e.jsx(i.code,{children:"rawfile"}),", ",e.jsx(i.code,{children:"firmware"}),", or both (",e.jsx(i.code,{children:'["rawfile","firmware"]'}),")"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"artifacts[0].uri"})}),e.jsxs(i.td,{children:["Where to download the deliverable. The service appends the device ID, so each device fetches its own file. A ",e.jsx(i.code,{children:".swu"})," for SWU packs, a ",e.jsx(i.code,{children:".tar.gz"})," for ",e.jsx(i.code,{children:"non-swu"})," packs"]})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"algorithm"}),", ",e.jsx(i.code,{children:"iv"})]}),e.jsxs(i.td,{children:["Present only for an encrypted pack: the algorithm and, for shared-key packs, the hex IV or nonce. A per-device pack carries the algorithm but no ",e.jsx(i.code,{children:"iv"})]})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"signature_key_id"}),", ",e.jsx(i.code,{children:"signature_algorithm"}),", ",e.jsx(i.code,{children:"signature_certificate"})]}),e.jsx(i.td,{children:"Present only for a signed pack"})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"The device needs the key to decrypt, and holds it itself. For a per-device pack it is the key that SymKMS assigned to that device, and each device downloads a different file."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"downloading",children:"Downloading"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The download answers with the bytes, or with ",e.jsx(i.code,{children:"302"})," to a short-lived signed URL when presigned downloads are enabled for the build store. Make sure the device's HTTP client follows redirects. The route also answers ",e.jsx(i.code,{children:"HEAD"})," and byte-range requests (",e.jsx(i.code,{children:"206"}),"), so an interrupted download can resume. The URL is fixed when the pack is built, so a device never sees a new ",e.jsx(i.code,{children:"update_domain"})," until you rebuild."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"the-states-the-device-reports",children:"The states the device reports"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The device moves its job through the workflow's states, and the workflow decides who may make each move. For the ",e.jsx(i.code,{children:"direct"})," workflow:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"INSTALL → INSTALLING → INSTALLED → (WFX, automatic) ACTIVATE → ACTIVATING → ACTIVATED"})})})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The device reports ",e.jsx(i.code,{children:"INSTALLING"}),", ",e.jsx(i.code,{children:"INSTALLED"}),", ",e.jsx(i.code,{children:"ACTIVATING"})," and ",e.jsx(i.code,{children:"ACTIVATED"}),". WFX itself makes the ",e.jsx(i.code,{children:"INSTALLED → ACTIVATE"})," step. From ",e.jsx(i.code,{children:"INSTALL"}),", ",e.jsx(i.code,{children:"INSTALLING"}),", ",e.jsx(i.code,{children:"ACTIVATE"})," and ",e.jsx(i.code,{children:"ACTIVATING"})," the device can move to ",e.jsx(i.code,{children:"TERMINATED"})," to report a failure; ",e.jsx(i.code,{children:"INSTALLED"})," has no failure transition."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Workflow"}),e.jsx(i.th,{children:"Used for"}),e.jsx(i.th,{children:"Terminal states"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"wfx.workflow.dau.direct"})}),e.jsx(i.td,{children:"SWU packs, no confirmation"}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"ACTIVATED"})," (success), ",e.jsx(i.code,{children:"TERMINATED"})," (failure)"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"wfx.workflow.dau.phased"})}),e.jsxs(i.td,{children:["SWU packs with confirmation steps (",e.jsx(i.code,{children:"CREATED → DOWNLOAD → ... → ACTIVATED"}),")"]}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"ACTIVATED"}),", ",e.jsx(i.code,{children:"TERMINATED"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"wfx.workflow.dau.download-install"})}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"non-swu"})," packs: ",e.jsx(i.code,{children:"DOWNLOAD → ... → INSTALLED"}),", every move made by the device"]}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"INSTALLED"}),", ",e.jsx(i.code,{children:"TERMINATED"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"wfx.workflow.dau.simple"})}),e.jsxs(i.td,{children:["Minimal ",e.jsx(i.code,{children:"DOWNLOAD → INSTALL → INSTALLED"})]}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"INSTALLED"}),", ",e.jsx(i.code,{children:"TERMINATED"})]})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["A ",e.jsx(i.code,{children:"phased"})," job has moves that WFX or an operator makes, and nothing in Lamassu Updates advances them: it stays at ",e.jsx(i.code,{children:"CREATED"})," until someone confirms it through WFX (the dashboard's ",e.jsx(i.strong,{children:"Next"})," button does that). The launch endpoints ",e.jsx(i.code,{children:"force-version"})," and ",e.jsx(i.code,{children:"sync-to-latest"})," use ",e.jsx(i.code,{children:"phased"})," for SWU packs unless you pass a ",e.jsx(i.code,{children:"workflow"}),". The workflow files are in ",e.jsx(i.code,{children:"wfx/workflow/dau/"})," of the repository. The WFX HTTP API (listing jobs, updating status) is documented by ",e.jsx(i.a,{href:"https://github.com/siemens/wfx",children:"WFX"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"hawkbit-mode-the-device-polls-hawkbit",children:"hawkBit mode: the device polls hawkBit"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"In hawkBit mode devices do not poll Lamassu Updates. They poll hawkBit's DDI API, and Lamassu Updates reads the resulting action state from hawkBit."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"sequenceDiagram"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant U as Lamassu Updates"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant H as hawkBit"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  participant D as Device"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  U->>H: create the rollout"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  D->>H: poll the DDI API"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  D->>H: download the module artifacts"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  D->>H: post DDI feedback"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  U->>H: read action and rollout state"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(h,{children:[e.jsxs(n,{children:[e.jsx(i.h3,{id:"make-the-device-a-hawkbit-target",children:"Make the device a hawkBit target"}),e.jsxs(i.p,{children:["The device needs a controller ID, and a target tagged ",e.jsx(i.code,{children:"group:<id>"})," for its group. With ",e.jsx(i.code,{children:"dms_endpoint"})," set, the service does this itself: when it reads a group's devices from the registry it creates the missing targets and tags them. Without ",e.jsx(i.code,{children:"dms_endpoint"})," you create the targets and tags yourself. Either way the device must poll hawkBit with valid credentials."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"configure-swupdate",children:"Configure SWUpdate"}),e.jsxs(i.p,{children:["Point the device's SWUpdate (",e.jsx(i.code,{children:"suricatta"}),") at hawkBit's URL (",e.jsx(i.code,{children:"hawkbit.ddi_url"}),", which defaults to ",e.jsx(i.code,{children:"hawkbit.base_url"}),"), with the tenant, the controller ID and an authentication method that your hawkBit tenant accepts. hawkBit refuses unauthenticated devices by default. With target security tokens, enable them for the tenant (",e.jsx(i.code,{children:"PUT /rest/v1/system/configs/authentication.targettoken.enabled"})," with ",e.jsx(i.code,{children:'{"value":true}'}),") and give each device its target's ",e.jsx(i.code,{children:"securityToken"}),", which it sends as ",e.jsx(i.code,{children:"Authorization: TargetToken <token>"}),". The ",e.jsx(i.a,{href:"/docs/platform/updates/guides/hawkbit-curl",children:"hawkBit curl guide"})," shows every request."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"point-it-at-the-right-hawkbit",children:"Point it at the right hawkBit"}),e.jsxs(i.p,{children:["The device must poll the ",e.jsx(i.strong,{children:"same hawkBit"})," that the service is configured for. A service pointed at a hawkBit with no targets builds and launches without error, and nothing downloads it. See ",e.jsx(i.a,{href:"/docs/platform/updates/troubleshooting",children:"Troubleshooting"}),"."]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"hawkBit then hands the device every artifact of its distribution set. A pack with several modules runs several independent installs."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["When your gateway routes hawkBit's device artifact URLs (the path of ",e.jsx(i.code,{children:"hawkbit.ddi_url"}),", ",e.jsx(i.code,{children:".../<tenant>/controller/v1/<controller>/softwaremodules/<id>/artifacts/<file>"}),") to Lamassu Updates, the service serves them only for modules assigned to or installed on that controller, and answers ",e.jsx(i.code,{children:"404"})," otherwise. With presigned downloads on, it redirects to a signed URL of hawkBit's S3 bucket instead of streaming the file."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"signed-and-encrypted-images",children:"Signed and encrypted images"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["If the device verifies signatures, set its public key (",e.jsx(i.code,{children:"public-key-file"})," in SWUpdate's configuration) and sign the package with the matching key. If it decrypts, it needs the same key and algorithm the pack was built with. A mismatch is the usual reason an install fails silently after a successful download. ",e.jsx(i.a,{href:"/docs/platform/updates/signing-and-encryption",children:"Signing and encryption"})," explains which key, algorithm and IV each mode uses, and what the device receives."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"verify-the-result",children:"Verify the result"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["After a launch, the device's job reaches ",e.jsx(i.code,{children:"ACTIVATED"})," (or ",e.jsx(i.code,{children:"INSTALLED"})," for a ",e.jsx(i.code,{children:"non-swu"})," pack), the launch counters update, and the device inventory lists the pack:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"API"}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"http://localhost:10090/updates/v1"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"curl"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -s"}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" $API"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"/devices/"}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"device-i"}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"d"}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"/distribution-set-inventory"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"curl"}),e.jsx(i.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -s"}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" $API"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"/launch/"}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"launch-i"}),e.jsx(i.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"d"}),e.jsx(i.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"/jobs"})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/docs/platform/updates/guides/publish-and-roll-out#verify-the-result",children:"Publish and roll out an update"})," for the rest of the checks."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"troubleshooting",children:"Troubleshooting"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Symptom"}),e.jsx(i.th,{children:"Likely cause"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"The device never sees a job (native)"}),e.jsxs(i.td,{children:["It polls the wrong WFX endpoint or uses a different ID than the group member. The WFX ",e.jsx(i.code,{children:"clientId"})," must equal the device ID"]})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:["The job stays at ",e.jsx(i.code,{children:"CREATED"})]}),e.jsxs(i.td,{children:["The launch uses ",e.jsx(i.code,{children:"phased"}),". Confirm it through WFX or the dashboard, or relaunch with ",e.jsx(i.code,{children:"direct"})]})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:["The download fails with ",e.jsx(i.code,{children:"404"})]}),e.jsx(i.td,{children:"The pack is per-device encrypted and the device has no key, or the URL names another device. Check the pack's coverage and that the URL ends with this device's ID"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"The download succeeds and the install fails"}),e.jsxs(i.td,{children:["The signature or the key does not match what the device holds. See ",e.jsx(i.a,{href:"/docs/platform/updates/signing-and-encryption",children:"Signing and encryption"})]})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:["A ",e.jsx(i.code,{children:"non-swu"})," launch looks stuck although the device finished"]}),e.jsxs(i.td,{children:["It was launched with ",e.jsx(i.code,{children:"direct"})," or ",e.jsx(i.code,{children:"phased"}),", which wait for ",e.jsx(i.code,{children:"ACTIVATED"}),". Launch ",e.jsx(i.code,{children:"non-swu"})," packs with ",e.jsx(i.code,{children:"download-install"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"The launch never advances (hawkBit)"}),e.jsx(i.td,{children:"The device is not polling this hawkBit, is not tagged into the group, or cannot authenticate"})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"next-steps",children:"Next steps"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(d,{children:[e.jsx(s,{title:"Signing and encryption",href:"/docs/platform/updates/signing-and-encryption",description:"Keys, algorithms and what the device must hold."}),e.jsx(s,{title:"hawkBit mode",href:"/docs/platform/updates/hawkbit-mode",description:"How the adapter maps packs and campaigns onto hawkBit."}),e.jsx(s,{title:"Troubleshooting",href:"/docs/platform/updates/troubleshooting",description:"Updates not reaching devices, and other failures."})]})})]})}function p(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(r,{...t})}):r(t)}function a(t,i){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}const k=Object.freeze(Object.defineProperty({__proto__:null,_markdown:l,default:p,frontmatter:o,lmDiff:c,structuredData:f,toc:m},Symbol.toStringTag,{value:"Module"}));export{k as _};
