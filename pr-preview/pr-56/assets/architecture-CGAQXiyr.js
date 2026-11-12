import{j as e}from"./index-DqgIL_Rv.js";let r=`

<div className="lm-diff-ins lm-diff-block">
  Lamassu Updates is one process that serves the Updates API (\`/updates/v1\`) and, embedded in it, SymKMS (\`/symkms/v1\`). It also answers \`GET /health\`. Behind the API there are two interchangeable backends. The \`mode\` setting picks one when the service starts. Clients, including the Lamassu dashboard, cannot tell them apart except through [capabilities](/docs/platform/updates/reference/capabilities).
</div>

<div className="lm-diff-ins lm-diff-block">
  Native mode [#native-mode]
</div>

<div className="lm-diff-ins lm-diff-block">
  In native mode the service owns the data. Postgres holds packs, launches and device history, WFX holds one job per device, and the service drives both.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  flowchart TB
    clients["<b>Clients</b><br/>dashboard, curl, scripts"]

    ota["<b>Lamassu Updates</b><br/>one process<br/>Updates API · SymKMS<br/>SWU builder<br/>Background work"]

    lamassu["<b>Lamassu IoT</b><br/>Device Manager<br/>(groups, devices)<br/>KMS (signing keys)"]
    storage[("<b>Storage</b><br/>Postgres: updates<br/>Blob stores:<br/>artifacts, builds, keys")]
    wfx["<b>WFX</b><br/>one job per device<br/>own database: wfx"]

    clients -- "/updates/v1<br/>/symkms/v1" --> ota
    ota -- "groups,<br/>signing" --> lamassu
    ota -- "data,<br/>files" --> storage
    ota -- "create jobs" --> wfx
    wfx -- "job events" --> ota
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  The service is one process. Its parts, and which of them use which dependency, are in [What runs inside the service](#what-runs-inside-the-service).
</div>

<div className="lm-diff-ins lm-diff-block">
  How devices connect [#how-devices-connect]
</div>

<div className="lm-diff-ins lm-diff-block">
  A device never talks to the service except to download its package. It polls WFX for jobs and reports each state change to WFX. The service learns about the changes from WFX's event stream.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  flowchart TB
    dev["<b>Devices</b><br/>SWUpdate"]
    ota["<b>Lamassu Updates</b>"]
    wfx["<b>WFX</b>"]

    dev -- "poll for jobs,<br/>report each state" --> wfx
    dev -- "download the .swu" --> ota
    ota -- "create jobs" --> wfx
    wfx -- "job events" --> ota
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  The download address in each job is the pack's download route under \`update_domain\`, with the device ID appended so per-device packages and gateway authorization work. When the \`builds\` blob store is on S3 with presigned downloads enabled, a download is answered with a \`302\` to a short-lived signed URL of the object instead of streaming the bytes through the service. Local storage always streams. Both support \`Range\` requests, so an interrupted download resumes.
</div>

<div className="lm-diff-ins lm-diff-block">
  hawkBit mode [#hawkbit-mode]
</div>

<div className="lm-diff-ins lm-diff-block">
  In hawkBit mode the service is a gateway. Packs become distribution sets, launches become rollouts, and hawkBit owns that data and is read live on every request. The service keeps in Postgres only what hawkBit has no place for. See [Data model](/docs/platform/updates/data-model).
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  flowchart TB
    clients["<b>Clients</b><br/>dashboard, curl, scripts"]

    ota["<b>Lamassu Updates</b><br/>one process<br/>Updates API · SymKMS<br/>SWU builder"]

    lamassu["<b>Lamassu IoT</b><br/>Device Manager<br/>(groups, optional)<br/>KMS (signing keys)"]
    storage[("<b>Postgres</b><br/>staging, descriptors,<br/>manifests,<br/>latest versions")]
    hb["<b>Eclipse hawkBit</b><br/>modules, sets, rollouts<br/>own database and<br/>artifact store"]

    clients -- "/updates/v1<br/>/symkms/v1" --> ota
    ota -- "groups,<br/>signing" --> lamassu
    ota -- "what hawkBit<br/>lacks" --> storage
    ota -- "Management API" --> hb
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  How devices connect [#how-devices-connect-1]
</div>

<div className="lm-diff-ins lm-diff-block">
  Devices talk to hawkBit and never to this service for polling. They poll hawkBit's DDI API and send their feedback to it. The service reads progress back from hawkBit whenever it is asked, and has no event stream to follow.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`mermaid
  flowchart TB
    dev["<b>Devices</b><br/>SWUpdate suricatta"]
    hb["<b>Eclipse hawkBit</b>"]
    ota["<b>Lamassu Updates</b>"]

    ota -- "create sets and rollouts,<br/>read progress<br/>(Management API)" --> hb
    dev -- "poll, send feedback<br/>(DDI API)" --> hb
    dev -. "artifact download,<br/>when routed here" .-> ota
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  The artifact download can also go through this service. It serves hawkBit's device artifact route (\`/{tenant}/controller/v1/{controllerId}/softwaremodules/{id}/artifacts/{filename}\`, under the path of \`hawkbit.ddi_url\`) unrewritten, so a gateway in front of both keeps matching its authorization rules. The service answers only for a module assigned to, or installed on, that device, and otherwise returns \`404\`. With presigning enabled on \`hawkbit.artifact_store\` it redirects (\`302\`) to a signed URL of hawkBit's S3 bucket. See [Connect a device](/docs/platform/updates/guides/connect-a-device).
</div>

<div className="lm-diff-ins lm-diff-block">
  What runs inside the service [#what-runs-inside-the-service]
</div>

<div className="lm-diff-ins lm-diff-block">
  | Part                     | What it does                                                                                                                                  | Native       | hawkBit                                                                               |
  | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------- |
  | Updates API              | Packs, modules, artifacts, launches, device inventory, version compliance                                                                     | Yes          | Yes (translated to hawkBit calls)                                                     |
  | SymKMS                   | Stores symmetric keys and assigns them to devices. Used by shared and per-device encryption                                                   | Yes          | Yes, for shared-key encryption, when a SymKMS storage or \`sym_keys_dir\` is configured |
  | SWU builder              | Runs \`swugenerator\` to assemble, sign and encrypt \`.swu\` packages                                                                             | Yes          | Yes (per module), when \`swugenerator_path\` is set                                     |
  | Blob stores              | Artifacts, builds and keys, on local disk or S3, optionally encrypted at rest                                                                 | Yes          | Keys only (artifact bytes live in hawkBit's artifact store)                           |
  | WFX event consumer       | Reads WFX's server-sent event stream, updates each device's state in its launch, releases the next batch                                      | Yes          | No                                                                                    |
  | Scheduled-launch trigger | Starts launches whose \`scheduled_at\` has passed, polling every 30 seconds, and repairs batches whose dispatch was interrupted                 | Yes          | No (hawkBit's own scheduler)                                                          |
  | Leader election          | Makes sure one replica runs the background work                                                                                               | Yes          | Not needed                                                                            |
  | Reconciliation           | Each time the event stream connects (at start-up and after an outage), replays device completions it missed, because the stream has no replay | Yes          | No                                                                                    |
  | Presigned downloads      | Answers downloads with a redirect to a signed object-store URL                                                                                | Builds store | \`hawkbit.artifact_store\`                                                              |
</div>

<div className="lm-diff-ins lm-diff-block">
  Dependencies [#dependencies]
</div>

<div className="lm-diff-ins lm-diff-block">
  | System                 | Role                                                    | Needed in                                                                                                     |
  | ---------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
  | Postgres               | The service's own data                                  | Both                                                                                                          |
  | Lamassu Device Manager | Source of device groups and devices                     | Native. Optional in hawkBit mode: without it the service reads the \`group:<id>\` tags on hawkBit's own targets |
  | Lamassu KMS            | Signing keys, for the package and for version manifests | When signing                                                                                                  |
  | WFX                    | Job orchestration                                       | Native                                                                                                        |
  | Eclipse hawkBit        | The update server                                       | hawkBit                                                                                                       |
  | swugenerator (bundled) | Builds \`.swu\` files                                     | When building                                                                                                 |
</div>

<div className="lm-diff-ins lm-diff-block">
  Where things are stored [#where-things-are-stored]
</div>

<div className="lm-diff-ins lm-diff-block">
  | Data                            | Native                                            | hawkBit                       |
  | ------------------------------- | ------------------------------------------------- | ----------------------------- |
  | Packs, versions, modules        | Postgres (\`updates\`)                              | hawkBit                       |
  | Artifact bytes                  | Blob store (\`artifacts\`)                          | hawkBit's artifact store      |
  | Built \`.swu\` and packages       | Blob store (\`builds\`)                             | hawkBit (as module artifacts) |
  | sw-descriptions                 | Postgres (a column of the pack and of the module) | Postgres                      |
  | Launches and device assignments | Postgres                                          | hawkBit rollouts and actions  |
  | Device jobs                     | WFX                                               | hawkBit actions               |
  | Device update history           | Postgres                                          | Read from hawkBit             |
  | Encryption keys                 | SymKMS blob store                                 | SymKMS blob store             |
</div>

<div className="lm-diff-ins lm-diff-block">
  Native mode also uses \`update_files_base_dir\` as build scratch space: it stages a build's inputs there, and the built outputs are published to the \`builds\` store.
</div>

<div className="lm-diff-ins lm-diff-block">
  Running more than one replica [#running-more-than-one-replica]
</div>

<div className="lm-diff-ins lm-diff-block">
  The background work (the WFX event consumer and the scheduled-launch trigger) runs on exactly one replica at a time. Leader election picks it: Kubernetes Leases when running inside a cluster, a Postgres advisory lock elsewhere, configurable with \`leader_election.mode\` (\`""\`, \`kubernetes\` or \`database\`). Without election every replica would count the same job completions and release batches early, so a failure to configure it stops the service at start-up. Batch dispatch is also protected by a per-launch lock, so two callers never send the same batch twice.
</div>

<div className="lm-diff-ins lm-diff-block">
  If \`builds\` is on local disk the service logs a warning and the deployment is limited to one replica, because other replicas could not serve the builds. Put \`builds\`, \`artifacts\` and the SymKMS store on S3 to scale out. See [Operations](/docs/platform/updates/operations).
</div>

<div className="lm-diff-ins lm-diff-block">
  Next steps [#next-steps]
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Flows" description="The sequence of every important operation." href="/docs/platform/updates/flows" />

    <Card title="Data model" description="The tables the service keeps and how they relate." href="/docs/platform/updates/data-model" />

    <Card title="Operations" description="Deploy, scale, back up and upgrade." href="/docs/platform/updates/operations" />
  </Cards>
</div>
`,c={title:"Architecture",description:"The components of Lamassu Updates, how they connect in each backend, and what runs in the background."},o={isNew:!0,changes:28,title:void 0,description:void 0},h={contents:[{heading:void 0,content:"Lamassu Updates is one process that serves the Updates API (`/updates/v1`) and, embedded in it, SymKMS (`/symkms/v1`). It also answers `GET /health`. Behind the API there are two interchangeable backends. The `mode` setting picks one when the service starts. Clients, including the Lamassu dashboard, cannot tell them apart except through capabilities."},{heading:"native-mode",content:"In native mode the service owns the data. Postgres holds packs, launches and device history, WFX holds one job per device, and the service drives both."},{heading:"native-mode",content:"The service is one process. Its parts, and which of them use which dependency, are in What runs inside the service."},{heading:"how-devices-connect",content:"A device never talks to the service except to download its package. It polls WFX for jobs and reports each state change to WFX. The service learns about the changes from WFX's event stream."},{heading:"how-devices-connect",content:"The download address in each job is the pack's download route under `update_domain`, with the device ID appended so per-device packages and gateway authorization work. When the `builds` blob store is on S3 with presigned downloads enabled, a download is answered with a `302` to a short-lived signed URL of the object instead of streaming the bytes through the service. Local storage always streams. Both support `Range` requests, so an interrupted download resumes."},{heading:"hawkbit-mode",content:"In hawkBit mode the service is a gateway. Packs become distribution sets, launches become rollouts, and hawkBit owns that data and is read live on every request. The service keeps in Postgres only what hawkBit has no place for. See Data model."},{heading:"how-devices-connect-1",content:"Devices talk to hawkBit and never to this service for polling. They poll hawkBit's DDI API and send their feedback to it. The service reads progress back from hawkBit whenever it is asked, and has no event stream to follow."},{heading:"how-devices-connect-1",content:"The artifact download can also go through this service. It serves hawkBit's device artifact route (`/{tenant}/controller/v1/{controllerId}/softwaremodules/{id}/artifacts/{filename}`, under the path of `hawkbit.ddi_url`) unrewritten, so a gateway in front of both keeps matching its authorization rules. The service answers only for a module assigned to, or installed on, that device, and otherwise returns `404`. With presigning enabled on `hawkbit.artifact_store` it redirects (`302`) to a signed URL of hawkBit's S3 bucket. See Connect a device."},{heading:"what-runs-inside-the-service",content:"Part"},{heading:"what-runs-inside-the-service",content:"What it does"},{heading:"what-runs-inside-the-service",content:"Native"},{heading:"what-runs-inside-the-service",content:"hawkBit"},{heading:"what-runs-inside-the-service",content:"Updates API"},{heading:"what-runs-inside-the-service",content:"Packs, modules, artifacts, launches, device inventory, version compliance"},{heading:"what-runs-inside-the-service",content:"Yes"},{heading:"what-runs-inside-the-service",content:"Yes (translated to hawkBit calls)"},{heading:"what-runs-inside-the-service",content:"SymKMS"},{heading:"what-runs-inside-the-service",content:"Stores symmetric keys and assigns them to devices. Used by shared and per-device encryption"},{heading:"what-runs-inside-the-service",content:"Yes"},{heading:"what-runs-inside-the-service",content:"Yes, for shared-key encryption, when a SymKMS storage or `sym_keys_dir` is configured"},{heading:"what-runs-inside-the-service",content:"SWU builder"},{heading:"what-runs-inside-the-service",content:"Runs `swugenerator` to assemble, sign and encrypt `.swu` packages"},{heading:"what-runs-inside-the-service",content:"Yes"},{heading:"what-runs-inside-the-service",content:"Yes (per module), when `swugenerator_path` is set"},{heading:"what-runs-inside-the-service",content:"Blob stores"},{heading:"what-runs-inside-the-service",content:"Artifacts, builds and keys, on local disk or S3, optionally encrypted at rest"},{heading:"what-runs-inside-the-service",content:"Yes"},{heading:"what-runs-inside-the-service",content:"Keys only (artifact bytes live in hawkBit's artifact store)"},{heading:"what-runs-inside-the-service",content:"WFX event consumer"},{heading:"what-runs-inside-the-service",content:"Reads WFX's server-sent event stream, updates each device's state in its launch, releases the next batch"},{heading:"what-runs-inside-the-service",content:"Yes"},{heading:"what-runs-inside-the-service",content:"No"},{heading:"what-runs-inside-the-service",content:"Scheduled-launch trigger"},{heading:"what-runs-inside-the-service",content:"Starts launches whose `scheduled_at` has passed, polling every 30 seconds, and repairs batches whose dispatch was interrupted"},{heading:"what-runs-inside-the-service",content:"Yes"},{heading:"what-runs-inside-the-service",content:"No (hawkBit's own scheduler)"},{heading:"what-runs-inside-the-service",content:"Leader election"},{heading:"what-runs-inside-the-service",content:"Makes sure one replica runs the background work"},{heading:"what-runs-inside-the-service",content:"Yes"},{heading:"what-runs-inside-the-service",content:"Not needed"},{heading:"what-runs-inside-the-service",content:"Reconciliation"},{heading:"what-runs-inside-the-service",content:"Each time the event stream connects (at start-up and after an outage), replays device completions it missed, because the stream has no replay"},{heading:"what-runs-inside-the-service",content:"Yes"},{heading:"what-runs-inside-the-service",content:"No"},{heading:"what-runs-inside-the-service",content:"Presigned downloads"},{heading:"what-runs-inside-the-service",content:"Answers downloads with a redirect to a signed object-store URL"},{heading:"what-runs-inside-the-service",content:"Builds store"},{heading:"what-runs-inside-the-service",content:"`hawkbit.artifact_store`"},{heading:"dependencies",content:"System"},{heading:"dependencies",content:"Role"},{heading:"dependencies",content:"Needed in"},{heading:"dependencies",content:"Postgres"},{heading:"dependencies",content:"The service's own data"},{heading:"dependencies",content:"Both"},{heading:"dependencies",content:"Lamassu Device Manager"},{heading:"dependencies",content:"Source of device groups and devices"},{heading:"dependencies",content:"Native. Optional in hawkBit mode: without it the service reads the `group:<id>` tags on hawkBit's own targets"},{heading:"dependencies",content:"Lamassu KMS"},{heading:"dependencies",content:"Signing keys, for the package and for version manifests"},{heading:"dependencies",content:"When signing"},{heading:"dependencies",content:"WFX"},{heading:"dependencies",content:"Job orchestration"},{heading:"dependencies",content:"Native"},{heading:"dependencies",content:"Eclipse hawkBit"},{heading:"dependencies",content:"The update server"},{heading:"dependencies",content:"hawkBit"},{heading:"dependencies",content:"swugenerator (bundled)"},{heading:"dependencies",content:"Builds `.swu` files"},{heading:"dependencies",content:"When building"},{heading:"where-things-are-stored",content:"Data"},{heading:"where-things-are-stored",content:"Native"},{heading:"where-things-are-stored",content:"hawkBit"},{heading:"where-things-are-stored",content:"Packs, versions, modules"},{heading:"where-things-are-stored",content:"Postgres (`updates`)"},{heading:"where-things-are-stored",content:"hawkBit"},{heading:"where-things-are-stored",content:"Artifact bytes"},{heading:"where-things-are-stored",content:"Blob store (`artifacts`)"},{heading:"where-things-are-stored",content:"hawkBit's artifact store"},{heading:"where-things-are-stored",content:"Built `.swu` and packages"},{heading:"where-things-are-stored",content:"Blob store (`builds`)"},{heading:"where-things-are-stored",content:"hawkBit (as module artifacts)"},{heading:"where-things-are-stored",content:"sw-descriptions"},{heading:"where-things-are-stored",content:"Postgres (a column of the pack and of the module)"},{heading:"where-things-are-stored",content:"Postgres"},{heading:"where-things-are-stored",content:"Launches and device assignments"},{heading:"where-things-are-stored",content:"Postgres"},{heading:"where-things-are-stored",content:"hawkBit rollouts and actions"},{heading:"where-things-are-stored",content:"Device jobs"},{heading:"where-things-are-stored",content:"WFX"},{heading:"where-things-are-stored",content:"hawkBit actions"},{heading:"where-things-are-stored",content:"Device update history"},{heading:"where-things-are-stored",content:"Postgres"},{heading:"where-things-are-stored",content:"Read from hawkBit"},{heading:"where-things-are-stored",content:"Encryption keys"},{heading:"where-things-are-stored",content:"SymKMS blob store"},{heading:"where-things-are-stored",content:"SymKMS blob store"},{heading:"where-things-are-stored",content:"Native mode also uses `update_files_base_dir` as build scratch space: it stages a build's inputs there, and the built outputs are published to the `builds` store."},{heading:"running-more-than-one-replica",content:'The background work (the WFX event consumer and the scheduled-launch trigger) runs on exactly one replica at a time. Leader election picks it: Kubernetes Leases when running inside a cluster, a Postgres advisory lock elsewhere, configurable with `leader_election.mode` (`""`, `kubernetes` or `database`). Without election every replica would count the same job completions and release batches early, so a failure to configure it stops the service at start-up. Batch dispatch is also protected by a per-launch lock, so two callers never send the same batch twice.'},{heading:"running-more-than-one-replica",content:"If `builds` is on local disk the service logs a warning and the deployment is limited to one replica, because other replicas could not serve the builds. Put `builds`, `artifacts` and the SymKMS store on S3 to scale out. See Operations."},{heading:"next-steps",content:'<Card title="Flows" description="The sequence of every important operation." href="/docs/platform/updates/flows" />'},{heading:"next-steps",content:'<Card title="Data model" description="The tables the service keeps and how they relate." href="/docs/platform/updates/data-model" />'},{heading:"next-steps",content:'<Card title="Operations" description="Deploy, scale, back up and upgrade." href="/docs/platform/updates/operations" />'}],headings:[{id:"native-mode",content:"Native mode"},{id:"how-devices-connect",content:"How devices connect"},{id:"hawkbit-mode",content:"hawkBit mode"},{id:"how-devices-connect-1",content:"How devices connect"},{id:"what-runs-inside-the-service",content:"What runs inside the service"},{id:"dependencies",content:"Dependencies"},{id:"where-things-are-stored",content:"Where things are stored"},{id:"running-more-than-one-replica",content:"Running more than one replica"},{id:"next-steps",content:"Next steps"}]};const l=[{depth:2,url:"#native-mode",title:e.jsx(e.Fragment,{children:"Native mode"})},{depth:3,url:"#how-devices-connect",title:e.jsx(e.Fragment,{children:"How devices connect"})},{depth:2,url:"#hawkbit-mode",title:e.jsx(e.Fragment,{children:"hawkBit mode"})},{depth:3,url:"#how-devices-connect-1",title:e.jsx(e.Fragment,{children:"How devices connect"})},{depth:2,url:"#what-runs-inside-the-service",title:e.jsx(e.Fragment,{children:"What runs inside the service"})},{depth:2,url:"#dependencies",title:e.jsx(e.Fragment,{children:"Dependencies"})},{depth:2,url:"#where-things-are-stored",title:e.jsx(e.Fragment,{children:"Where things are stored"})},{depth:2,url:"#running-more-than-one-replica",title:e.jsx(e.Fragment,{children:"Running more than one replica"})},{depth:2,url:"#next-steps",title:e.jsx(e.Fragment,{children:"Next steps"})}];function a(n){const s={a:"a",code:"code",div:"div",h2:"h2",h3:"h3",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...n.components},{Card:t,Cards:i}=s;return t||d("Card"),i||d("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Lamassu Updates is one process that serves the Updates API (",e.jsx(s.code,{children:"/updates/v1"}),") and, embedded in it, SymKMS (",e.jsx(s.code,{children:"/symkms/v1"}),"). It also answers ",e.jsx(s.code,{children:"GET /health"}),". Behind the API there are two interchangeable backends. The ",e.jsx(s.code,{children:"mode"})," setting picks one when the service starts. Clients, including the Lamassu dashboard, cannot tell them apart except through ",e.jsx(s.a,{href:"/docs/platform/updates/reference/capabilities",children:"capabilities"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"native-mode",children:"Native mode"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"In native mode the service owns the data. Postgres holds packs, launches and device history, WFX holds one job per device, and the service drives both."})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"flowchart TB"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  clients["<b>Clients</b><br/>dashboard, curl, scripts"]'})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ota["<b>Lamassu Updates</b><br/>one process<br/>Updates API · SymKMS<br/>SWU builder<br/>Background work"]'})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  lamassu["<b>Lamassu IoT</b><br/>Device Manager<br/>(groups, devices)<br/>KMS (signing keys)"]'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  storage[("<b>Storage</b><br/>Postgres: updates<br/>Blob stores:<br/>artifacts, builds, keys")]'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  wfx["<b>WFX</b><br/>one job per device<br/>own database: wfx"]'})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  clients -- "/updates/v1<br/>/symkms/v1" --> ota'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ota -- "groups,<br/>signing" --> lamassu'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ota -- "data,<br/>files" --> storage'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ota -- "create jobs" --> wfx'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  wfx -- "job events" --> ota'})})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["The service is one process. Its parts, and which of them use which dependency, are in ",e.jsx(s.a,{href:"#what-runs-inside-the-service",children:"What runs inside the service"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h3,{id:"how-devices-connect",children:"How devices connect"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"A device never talks to the service except to download its package. It polls WFX for jobs and reports each state change to WFX. The service learns about the changes from WFX's event stream."})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"flowchart TB"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  dev["<b>Devices</b><br/>SWUpdate"]'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ota["<b>Lamassu Updates</b>"]'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  wfx["<b>WFX</b>"]'})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  dev -- "poll for jobs,<br/>report each state" --> wfx'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  dev -- "download the .swu" --> ota'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ota -- "create jobs" --> wfx'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  wfx -- "job events" --> ota'})})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["The download address in each job is the pack's download route under ",e.jsx(s.code,{children:"update_domain"}),", with the device ID appended so per-device packages and gateway authorization work. When the ",e.jsx(s.code,{children:"builds"})," blob store is on S3 with presigned downloads enabled, a download is answered with a ",e.jsx(s.code,{children:"302"})," to a short-lived signed URL of the object instead of streaming the bytes through the service. Local storage always streams. Both support ",e.jsx(s.code,{children:"Range"})," requests, so an interrupted download resumes."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"hawkbit-mode",children:"hawkBit mode"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["In hawkBit mode the service is a gateway. Packs become distribution sets, launches become rollouts, and hawkBit owns that data and is read live on every request. The service keeps in Postgres only what hawkBit has no place for. See ",e.jsx(s.a,{href:"/docs/platform/updates/data-model",children:"Data model"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"flowchart TB"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  clients["<b>Clients</b><br/>dashboard, curl, scripts"]'})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ota["<b>Lamassu Updates</b><br/>one process<br/>Updates API · SymKMS<br/>SWU builder"]'})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  lamassu["<b>Lamassu IoT</b><br/>Device Manager<br/>(groups, optional)<br/>KMS (signing keys)"]'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  storage[("<b>Postgres</b><br/>staging, descriptors,<br/>manifests,<br/>latest versions")]'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  hb["<b>Eclipse hawkBit</b><br/>modules, sets, rollouts<br/>own database and<br/>artifact store"]'})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  clients -- "/updates/v1<br/>/symkms/v1" --> ota'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ota -- "groups,<br/>signing" --> lamassu'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ota -- "what hawkBit<br/>lacks" --> storage'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ota -- "Management API" --> hb'})})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h3,{id:"how-devices-connect-1",children:"How devices connect"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"Devices talk to hawkBit and never to this service for polling. They poll hawkBit's DDI API and send their feedback to it. The service reads progress back from hawkBit whenever it is asked, and has no event stream to follow."})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"flowchart TB"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  dev["<b>Devices</b><br/>SWUpdate suricatta"]'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  hb["<b>Eclipse hawkBit</b>"]'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ota["<b>Lamassu Updates</b>"]'})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  ota -- "create sets and rollouts,<br/>read progress<br/>(Management API)" --> hb'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  dev -- "poll, send feedback<br/>(DDI API)" --> hb'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:'  dev -. "artifact download,<br/>when routed here" .-> ota'})})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["The artifact download can also go through this service. It serves hawkBit's device artifact route (",e.jsx(s.code,{children:"/{tenant}/controller/v1/{controllerId}/softwaremodules/{id}/artifacts/{filename}"}),", under the path of ",e.jsx(s.code,{children:"hawkbit.ddi_url"}),") unrewritten, so a gateway in front of both keeps matching its authorization rules. The service answers only for a module assigned to, or installed on, that device, and otherwise returns ",e.jsx(s.code,{children:"404"}),". With presigning enabled on ",e.jsx(s.code,{children:"hawkbit.artifact_store"})," it redirects (",e.jsx(s.code,{children:"302"}),") to a signed URL of hawkBit's S3 bucket. See ",e.jsx(s.a,{href:"/docs/platform/updates/guides/connect-a-device",children:"Connect a device"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"what-runs-inside-the-service",children:"What runs inside the service"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Part"}),e.jsx(s.th,{children:"What it does"}),e.jsx(s.th,{children:"Native"}),e.jsx(s.th,{children:"hawkBit"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Updates API"}),e.jsx(s.td,{children:"Packs, modules, artifacts, launches, device inventory, version compliance"}),e.jsx(s.td,{children:"Yes"}),e.jsx(s.td,{children:"Yes (translated to hawkBit calls)"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"SymKMS"}),e.jsx(s.td,{children:"Stores symmetric keys and assigns them to devices. Used by shared and per-device encryption"}),e.jsx(s.td,{children:"Yes"}),e.jsxs(s.td,{children:["Yes, for shared-key encryption, when a SymKMS storage or ",e.jsx(s.code,{children:"sym_keys_dir"})," is configured"]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"SWU builder"}),e.jsxs(s.td,{children:["Runs ",e.jsx(s.code,{children:"swugenerator"})," to assemble, sign and encrypt ",e.jsx(s.code,{children:".swu"})," packages"]}),e.jsx(s.td,{children:"Yes"}),e.jsxs(s.td,{children:["Yes (per module), when ",e.jsx(s.code,{children:"swugenerator_path"})," is set"]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Blob stores"}),e.jsx(s.td,{children:"Artifacts, builds and keys, on local disk or S3, optionally encrypted at rest"}),e.jsx(s.td,{children:"Yes"}),e.jsx(s.td,{children:"Keys only (artifact bytes live in hawkBit's artifact store)"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"WFX event consumer"}),e.jsx(s.td,{children:"Reads WFX's server-sent event stream, updates each device's state in its launch, releases the next batch"}),e.jsx(s.td,{children:"Yes"}),e.jsx(s.td,{children:"No"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Scheduled-launch trigger"}),e.jsxs(s.td,{children:["Starts launches whose ",e.jsx(s.code,{children:"scheduled_at"})," has passed, polling every 30 seconds, and repairs batches whose dispatch was interrupted"]}),e.jsx(s.td,{children:"Yes"}),e.jsx(s.td,{children:"No (hawkBit's own scheduler)"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Leader election"}),e.jsx(s.td,{children:"Makes sure one replica runs the background work"}),e.jsx(s.td,{children:"Yes"}),e.jsx(s.td,{children:"Not needed"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Reconciliation"}),e.jsx(s.td,{children:"Each time the event stream connects (at start-up and after an outage), replays device completions it missed, because the stream has no replay"}),e.jsx(s.td,{children:"Yes"}),e.jsx(s.td,{children:"No"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Presigned downloads"}),e.jsx(s.td,{children:"Answers downloads with a redirect to a signed object-store URL"}),e.jsx(s.td,{children:"Builds store"}),e.jsx(s.td,{children:e.jsx(s.code,{children:"hawkbit.artifact_store"})})]})]})]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"dependencies",children:"Dependencies"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"System"}),e.jsx(s.th,{children:"Role"}),e.jsx(s.th,{children:"Needed in"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Postgres"}),e.jsx(s.td,{children:"The service's own data"}),e.jsx(s.td,{children:"Both"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Lamassu Device Manager"}),e.jsx(s.td,{children:"Source of device groups and devices"}),e.jsxs(s.td,{children:["Native. Optional in hawkBit mode: without it the service reads the ",e.jsx(s.code,{children:"group:<id>"})," tags on hawkBit's own targets"]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Lamassu KMS"}),e.jsx(s.td,{children:"Signing keys, for the package and for version manifests"}),e.jsx(s.td,{children:"When signing"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"WFX"}),e.jsx(s.td,{children:"Job orchestration"}),e.jsx(s.td,{children:"Native"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Eclipse hawkBit"}),e.jsx(s.td,{children:"The update server"}),e.jsx(s.td,{children:"hawkBit"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"swugenerator (bundled)"}),e.jsxs(s.td,{children:["Builds ",e.jsx(s.code,{children:".swu"})," files"]}),e.jsx(s.td,{children:"When building"})]})]})]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"where-things-are-stored",children:"Where things are stored"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Data"}),e.jsx(s.th,{children:"Native"}),e.jsx(s.th,{children:"hawkBit"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Packs, versions, modules"}),e.jsxs(s.td,{children:["Postgres (",e.jsx(s.code,{children:"updates"}),")"]}),e.jsx(s.td,{children:"hawkBit"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Artifact bytes"}),e.jsxs(s.td,{children:["Blob store (",e.jsx(s.code,{children:"artifacts"}),")"]}),e.jsx(s.td,{children:"hawkBit's artifact store"})]}),e.jsxs(s.tr,{children:[e.jsxs(s.td,{children:["Built ",e.jsx(s.code,{children:".swu"})," and packages"]}),e.jsxs(s.td,{children:["Blob store (",e.jsx(s.code,{children:"builds"}),")"]}),e.jsx(s.td,{children:"hawkBit (as module artifacts)"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"sw-descriptions"}),e.jsx(s.td,{children:"Postgres (a column of the pack and of the module)"}),e.jsx(s.td,{children:"Postgres"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Launches and device assignments"}),e.jsx(s.td,{children:"Postgres"}),e.jsx(s.td,{children:"hawkBit rollouts and actions"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Device jobs"}),e.jsx(s.td,{children:"WFX"}),e.jsx(s.td,{children:"hawkBit actions"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Device update history"}),e.jsx(s.td,{children:"Postgres"}),e.jsx(s.td,{children:"Read from hawkBit"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Encryption keys"}),e.jsx(s.td,{children:"SymKMS blob store"}),e.jsx(s.td,{children:"SymKMS blob store"})]})]})]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Native mode also uses ",e.jsx(s.code,{children:"update_files_base_dir"})," as build scratch space: it stages a build's inputs there, and the built outputs are published to the ",e.jsx(s.code,{children:"builds"})," store."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"running-more-than-one-replica",children:"Running more than one replica"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["The background work (the WFX event consumer and the scheduled-launch trigger) runs on exactly one replica at a time. Leader election picks it: Kubernetes Leases when running inside a cluster, a Postgres advisory lock elsewhere, configurable with ",e.jsx(s.code,{children:"leader_election.mode"})," (",e.jsx(s.code,{children:'""'}),", ",e.jsx(s.code,{children:"kubernetes"})," or ",e.jsx(s.code,{children:"database"}),"). Without election every replica would count the same job completions and release batches early, so a failure to configure it stops the service at start-up. Batch dispatch is also protected by a per-launch lock, so two callers never send the same batch twice."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["If ",e.jsx(s.code,{children:"builds"})," is on local disk the service logs a warning and the deployment is limited to one replica, because other replicas could not serve the builds. Put ",e.jsx(s.code,{children:"builds"}),", ",e.jsx(s.code,{children:"artifacts"})," and the SymKMS store on S3 to scale out. See ",e.jsx(s.a,{href:"/docs/platform/updates/operations",children:"Operations"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"next-steps",children:"Next steps"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i,{children:[e.jsx(t,{title:"Flows",description:"The sequence of every important operation.",href:"/docs/platform/updates/flows"}),e.jsx(t,{title:"Data model",description:"The tables the service keeps and how they relate.",href:"/docs/platform/updates/data-model"}),e.jsx(t,{title:"Operations",description:"Deploy, scale, back up and upgrade.",href:"/docs/platform/updates/operations"})]})})]})}function p(n={}){const{wrapper:s}=n.components||{};return s?e.jsx(s,{...n,children:e.jsx(a,{...n})}):a(n)}function d(n,s){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,_markdown:r,default:p,frontmatter:c,lmDiff:o,structuredData:h,toc:l},Symbol.toStringTag,{value:"Module"}));export{u as _};
