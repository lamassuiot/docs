import{r as Z,j as me}from"./index-DqgIL_Rv.js";const A=e=>Number(e.toFixed(2));function uo({width:e,height:t,radius:o,side:s,tailOffset:n,tail:r}){const a=Math.max(0,Math.min(o,e/2,t/2)),f=r.width/2,p=r.height,l=Math.min(r.tipRadius,f),d={top:"bottom",bottom:"top",left:"right",right:"left"}[s];function m(h,b,w){const T=(E,Y)=>w(E,Y).map(A).join(" "),C=E=>h+b*E;return[`L ${T(C(-f),0)}`,`C ${T(C(.45*-f),0)} ${T(C(1.1*-l),p-.9*l)} ${T(C(.55*-l),p-.25*l)}`,`Q ${T(h,p+.25*l)} ${T(C(.55*l),p-.25*l)}`,`C ${T(C(1.1*l),p-.9*l)} ${T(C(.45*f),0)} ${T(C(f),0)}`].join(" ")}const c=h=>Math.min(Math.max(n,a+f),h-a-f),u=[`M ${A(a)} 0`];return d==="top"&&u.push(m(c(e),1,(h,b)=>[h,-b])),u.push(`L ${A(e-a)} 0`,`A ${A(a)} ${A(a)} 0 0 1 ${A(e)} ${A(a)}`),d==="right"&&u.push(m(c(t),1,(h,b)=>[e+b,h])),u.push(`L ${A(e)} ${A(t-a)}`,`A ${A(a)} ${A(a)} 0 0 1 ${A(e-a)} ${A(t)}`),d==="bottom"&&u.push(m(c(e),-1,(h,b)=>[h,t+b])),u.push(`L ${A(a)} ${A(t)}`,`A ${A(a)} ${A(a)} 0 0 1 0 ${A(t-a)}`),d==="left"&&u.push(m(c(t),-1,(h,b)=>[-b,h])),u.push(`L 0 ${A(a)}`,`A ${A(a)} ${A(a)} 0 0 1 ${A(a)} 0`,"Z"),u.join(" ")}const ee="translate(0%, 0%) scale(1)",fo=22,ho=8,Se=14;function mo(e,t,o,s){if(!e||!t||!o||!s)return{offsetX:0,offsetY:0,scale:1,stageW:e,stageH:t};const n=Math.min(e/o,t/s),r=o*n,a=s*n;return{offsetX:(e-r)/2,offsetY:(t-a)/2,scale:n,stageW:e,stageH:t}}function Fe(e){const t=e.scale*(.5-e.x)*100,o=e.scale*(.5-e.y)*100;return`translate(${t}%, ${o}%) scale(${e.scale})`}function go(e,t,o,s,n){const r={left:t.offsetX+e.x*o*t.scale,top:t.offsetY+e.y*s*t.scale};if(!n)return r;const{x:a,y:f,scale:p}=n;return{left:.5*t.stageW+(r.left-a*t.stageW)*p,top:.5*t.stageH+(r.top-f*t.stageH)*p}}const pt={top:"bottom",bottom:"top",left:"right",right:"left"},bo=["bottom","top","right","left"];function wo(e){const{anchor:t,tooltipSize:o,stageSize:s,gap:n=fo}=e,{width:r,height:a}=o,{width:f,height:p}=s,l=ho,d=C=>{switch(C){case"top":return{left:t.left-r/2,top:t.top-n-a};case"bottom":return{left:t.left-r/2,top:t.top+n};case"left":return{left:t.left-n-r,top:t.top-a/2};case"right":return{left:t.left+n,top:t.top-a/2}}},m=C=>{const E=d(C);return C==="top"||C==="bottom"?E.top>=l&&E.top+a<=p-l:E.left>=l&&E.left+r<=f-l},c=e.position??"auto";let u;u=c==="auto"?bo.find(m)??"bottom":m(c)||!m(pt[c])?c:pt[c];const h=d(u),b=Math.min(Math.max(h.left,l),Math.max(l,f-r-l)),w=Math.min(Math.max(h.top,l),Math.max(l,p-a-l)),T=u==="top"||u==="bottom"?Math.min(Math.max(t.left-b,Se),r-Se):Math.min(Math.max(t.top-w,Se),a-Se);return{left:b,top:w,side:u,arrowOffset:T}}const vo={lang:void 0,message:void 0,abortEarly:void 0,abortPipeEarly:void 0};function $t(e){return vo}let yo;function xo(e){return yo?.get(e)}let ko;function To(e){return ko?.get(e)}let So;function _o(e,t){return So?.get(e)?.get(t)}function J(e){const t=typeof e;return t==="string"?`"${e}"`:t==="number"||t==="bigint"||t==="boolean"?`${e}`:t==="object"||t==="function"?(e&&Object.getPrototypeOf(e)?.constructor?.name)??"null":t}function z(e,t,o,s,n){const r=n&&"input"in n?n.input:o.value,a=n?.expected??e.expects??null,f=n?.received??J(r),p={kind:e.kind,type:e.type,input:r,expected:a,received:f,message:`Invalid ${t}: ${a?`Expected ${a} but r`:"R"}eceived ${f}`,requirement:e.requirement,path:n?.path,issues:n?.issues,lang:s.lang,abortEarly:s.abortEarly,abortPipeEarly:s.abortPipeEarly},l=e.kind==="schema",d=n?.message??e.message??_o(e.reference,p.lang)??(l?To(p.lang):null)??s.message??xo(p.lang);d!==void 0&&(p.message=typeof d=="function"?d(p):d),l&&(o.typed=!1),o.issues?o.issues.push(p):o.issues=[p]}function Eo(e,t){return e===t||Number.isNaN(e)&&Number.isNaN(t)}function Ot(e,t){const o=[...new Set(e)];return o.length>1?`(${o.join(` ${t} `)})`:o[0]??"never"}function W(e){return e["~standard"]={version:1,vendor:"valibot",validate:t=>e["~run"]({value:t},$t())},e}function Co(e){if(e.path){let t="";for(const o of e.path)if(typeof o.key=="string"||typeof o.key=="number")t?t+=`.${o.key}`:t+=o.key;else return null;return t}return null}function He(e){return{kind:"validation",type:"finite",reference:He,async:!1,expects:null,requirement:Number.isFinite,message:e,"~run"(t,o){return t.typed&&!this.requirement(t.value)&&z(this,"finite",t,o),t}}}function At(e,t){return{kind:"validation",type:"gt_value",reference:At,async:!1,expects:`>${e instanceof Date?e.toJSON():J(e)}`,requirement:e,message:t,"~run"(o,s){return o.typed&&!(o.value>this.requirement)&&z(this,"value",o,s,{received:o.value instanceof Date?o.value.toJSON():J(o.value)}),o}}}function Ze(e,t){return{kind:"validation",type:"max_value",reference:Ze,async:!1,expects:`<=${e instanceof Date?e.toJSON():J(e)}`,requirement:e,message:t,"~run"(o,s){return o.typed&&!(o.value<=this.requirement)&&z(this,"value",o,s,{received:o.value instanceof Date?o.value.toJSON():J(o.value)}),o}}}function xe(e,t){return{kind:"validation",type:"min_value",reference:xe,async:!1,expects:`>=${e instanceof Date?e.toJSON():J(e)}`,requirement:e,message:t,"~run"(o,s){return o.typed&&!(o.value>=this.requirement)&&z(this,"value",o,s,{received:o.value instanceof Date?o.value.toJSON():J(o.value)}),o}}}const $o={abortEarly:!0};function Oo(e,t,o){return typeof e.fallback=="function"?e.fallback(t,o):e.fallback}function Mt(e,t,o){return typeof e.default=="function"?e.default(t,o):e.default}function Pt(e,t){return W({kind:"schema",type:"array",reference:Pt,expects:"Array",async:!1,item:e,message:t,"~run"(o,s){const n=o.value;if(Array.isArray(n)){o.typed=!0,o.value=[];for(let r=0;r<n.length;r++){const a=n[r],f=this.item["~run"]({value:a},s);if(f.issues){const p={type:"array",origin:"value",input:n,key:r,value:a};for(const l of f.issues)l.path?l.path.unshift(p):l.path=[p],o.issues?.push(l);if(o.issues||(o.issues=f.issues),s.abortEarly){o.typed=!1;break}}f.typed||(o.typed=!1),o.value.push(f.value)}}else z(this,"type",o,s);return o}})}function Dt(e){return W({kind:"schema",type:"boolean",reference:Dt,expects:"boolean",async:!1,message:e,"~run"(t,o){return typeof t.value=="boolean"?t.typed=!0:z(this,"type",t,o),t}})}function Be(e,t){return W({kind:"schema",type:"literal",reference:Be,expects:J(e),async:!1,literal:e,message:t,"~run"(o,s){return Eo(o.value,this.literal)?o.typed=!0:z(this,"type",o,s),o}})}function Oe(e){return W({kind:"schema",type:"number",reference:Oe,expects:"number",async:!1,message:e,"~run"(t,o){return typeof t.value=="number"&&!isNaN(t.value)?t.typed=!0:z(this,"type",t,o),t}})}function G(e,t){return W({kind:"schema",type:"object",reference:G,expects:"Object",async:!1,entries:e,message:t,"~run"(o,s){const n=o.value;if(n&&typeof n=="object"){o.typed=!0,o.value={};for(const r in this.entries){const a=this.entries[r];if(r in n||(a.type==="exact_optional"||a.type==="optional"||a.type==="nullish")&&a.default!==void 0){const f=r in n?n[r]:Mt(a),p=a["~run"]({value:f},s);if(p.issues){const l={type:"object",origin:"value",input:n,key:r,value:f};for(const d of p.issues)d.path?d.path.unshift(l):d.path=[l],o.issues?.push(d);if(o.issues||(o.issues=p.issues),s.abortEarly){o.typed=!1;break}}p.typed||(o.typed=!1),o.value[r]=p.value}else if(a.fallback!==void 0)o.value[r]=Oo(a);else if(a.type!=="exact_optional"&&a.type!=="optional"&&a.type!=="nullish"&&(z(this,"key",o,s,{input:void 0,expected:`"${r}"`,path:[{type:"object",origin:"key",input:n,key:r,value:n[r]}]}),s.abortEarly))break}}else z(this,"type",o,s);return o}})}function R(e,t){return W({kind:"schema",type:"optional",reference:R,expects:`(${e.expects} | undefined)`,async:!1,wrapped:e,default:t,"~run"(o,s){return o.value===void 0&&(this.default!==void 0&&(o.value=Mt(this,o,s)),o.value===void 0)?(o.typed=!0,o):this.wrapped["~run"](o,s)}})}function de(e,t){return W({kind:"schema",type:"picklist",reference:de,expects:Ot(e.map(J),"|"),async:!1,options:e,message:t,"~run"(o,s){return this.options.includes(o.value)?o.typed=!0:z(this,"type",o,s),o}})}function F(e){return W({kind:"schema",type:"string",reference:F,expects:"string",async:!1,message:e,"~run"(t,o){return typeof t.value=="string"?t.typed=!0:z(this,"type",t,o),t}})}function It(e,t,o){return W({kind:"schema",type:"variant",reference:It,expects:"Object",async:!1,key:e,options:t,message:o,"~run"(s,n){const r=s.value;if(r&&typeof r=="object"){let a,f=0,p=this.key,l=[];const d=(m,c)=>{for(const u of m.options){if(u.type==="variant")d(u,new Set(c).add(u.key));else{let h=!0,b=0;for(const w of c){const T=u.entries[w];if(w in r?T["~run"]({typed:!1,value:r[w]},$o).issues:T.type!=="exact_optional"&&T.type!=="optional"&&T.type!=="nullish"){h=!1,p!==w&&(f<b||f===b&&w in r&&!(p in r))&&(f=b,p=w,l=[]),p===w&&l.push(u.entries[w].expects);break}b++}if(h){const w=u["~run"]({value:r},n);(!a||!a.typed&&w.typed)&&(a=w)}}if(a&&!a.issues)break}};if(d(this,new Set([this.key])),a)return a;z(this,"type",s,n,{input:r[p],expected:Ot(l,"|"),path:[{type:"object",origin:"value",input:r,key:p,value:r[p]}]})}else z(this,"type",s,n);return s}})}function fe(...e){return W({...e[0],pipe:e,"~run"(t,o){for(const s of e)if(s.kind!=="metadata"){if(t.issues&&(s.kind==="schema"||s.kind==="transformation")){t.typed=!1;break}(!t.issues||!o.abortEarly&&!o.abortPipeEarly)&&(t=s["~run"](t,o))}return t}})}function Ao(e,t,o){const s=e["~run"]({value:t},$t());return{typed:s.typed,success:!s.issues,output:s.value,issues:s.issues}}const We=()=>fe(Oe(),He()),te=()=>fe(Oe(),He(),At(0)),Ce=fe(Oe(),xe(0),Ze(1)),Mo=G({src:F(),width:te(),height:te()}),Po=G({src:F(),width:te(),height:te(),durationSec:te()}),Do=de(["auto","top","bottom","left","right"]),Io=G({x:Ce,y:Ce,label:R(F()),bgColor:R(F()),textColor:R(F()),position:R(Do)}),ut={bgColor:"#C5F11E",textColor:"#0C0C0C"},Ro=de(["smooth","cinematic","fast","linear"]),Rt=G({x:Ce,y:Ce,scale:fe(We(),xe(1)),duration:R(te()),easing:R(Ro)}),Ue={duration:1e3,easing:"cinematic"},zo=de(["none","browser","bezel"]),Lo=de(["solid","soft","glow"]),No=G({color:F(),fill:R(Lo),padding:R(fe(We(),xe(0),Ze(25)))}),dt={fill:"solid",padding:5},jo=de(["light","dark"]),Vo=G({wrapper:zo,backdrop:R(No),autoplay:Dt(),appearance:jo}),Fo=G({id:F(),type:Be("photo"),image:Mo,hotspot:R(Io),panZoom:R(Rt)}),Uo=G({id:F(),type:Be("video"),startTime:fe(We(),xe(0)),endTime:te(),playbackRate:R(te()),panZoom:R(Rt)}),Ho=It("type",[Fo,Uo]),Zo=G({id:F(),title:F(),video:R(Po),theme:Vo,steps:Pt(Ho)});class Bo extends Error{name="DemoParseError";issues;constructor(t){const o=t.map(s=>`- ${s.path||"(root)"}: ${s.message}`);super(`Invalid demo:
${o.join(`
`)}`),this.issues=t}}function zt(e){const t=Ao(Zo,e);if(t.success)return t.output;throw new Bo(t.issues.map(o=>({path:Co(o)??"",message:o.message})))}const Wo=67324752,Go=33639248,Yo=101010256,qo=8,Jo=0;async function*Xo(e,t){const o=new Ko(e.getReader()),s=()=>o.cancel();t?.addEventListener("abort",s,{once:!0});try{for(;;){const n=ft(await o.read(4)).getUint32(0,!0);if(n===Go||n===Yo)return;if(n!==Wo)throw new Error("Not an OpenShowcase bundle (not a zip file)");const r=ft(await o.read(26)),a=r.getUint16(2,!0),f=r.getUint16(4,!0),p=r.getUint32(14,!0),l=r.getUint16(22,!0),d=r.getUint16(24,!0),m=new TextDecoder().decode(await o.read(l));if(f!==Jo||a&qo||p===4294967295)throw new Error(`Unsupported zip entry "${m}": re-export the demo with OpenShowcase`);await o.read(d);const c=await o.readParts(p);m.endsWith("/")||(yield{name:m,parts:c})}}finally{t?.removeEventListener("abort",s),o.cancel()}}function ft(e){return new DataView(e.buffer,e.byteOffset,e.byteLength)}class Ko{reader;chunk=new Uint8Array(0);offset=0;constructor(t){this.reader=t}async readParts(t){const o=[];let s=t;for(;s>0;){if(this.offset===this.chunk.length){const{done:r,value:a}=await this.reader.read();if(r)throw new Error("The demo bundle is truncated");this.chunk=a,this.offset=0;continue}const n=Math.min(s,this.chunk.length-this.offset);o.push(this.chunk.subarray(this.offset,this.offset+n)),this.offset+=n,s-=n}return o}async read(t){const o=await this.readParts(t);if(o.length===1&&o[0])return o[0];const s=new Uint8Array(t);let n=0;for(const r of o)s.set(r,n),n+=r.length;return s}cancel(){this.reader.cancel().catch(()=>{})}}const ht=[80,75,3,4],mt="steps.json",Qo={avif:"image/avif",jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",mp4:"video/mp4",webm:"video/webm"};async function es(e,{assetBaseUrl:t,signal:o}={}){const s=new AbortController;o?.addEventListener("abort",()=>s.abort(o.reason),{once:!0});const n=await fetch(e,{signal:s.signal});if(!n.ok)throw new Error(`Failed to load demo: ${n.status} ${n.statusText}`);if(!n.body)throw new Error("Failed to load demo: empty response");const[r,a]=await ss(n.body,ht.length);return ht.every((f,p)=>r[p]===f)?ts(a,s):{demo:zt(JSON.parse(await new Response(a).text())),assetBaseUrl:t??e.slice(0,e.lastIndexOf("/")),dispose(){}}}async function ts(e,t){const o=Xo(e,t.signal);let s;try{const r=await o.next();if(r.done||r.value.name!==mt)throw new Error(`Not an OpenShowcase bundle: it must start with ${mt}`);s=zt(JSON.parse(await new Blob(r.value.parts).text()))}catch(r){throw await o.return(void 0),r}const n=new os;return(async()=>{try{for await(const r of o)n.add(r);n.end()}catch(r){n.end(r)}})(),{demo:s,resolveAsset:r=>n.url(r),dispose(){t.abort(),n.dispose()}}}class os{urls=new Map;waiting=new Map;failure;ended=!1;url(t){const o=t.replace(/^\.?\//,""),s=this.urls.get(o);return s?Promise.resolve(s):this.ended?Promise.reject(this.failure??new Error(`The demo bundle has no "${o}"`)):new Promise((n,r)=>{const a=this.waiting.get(o)??[];a.push({resolve:n,reject:r}),this.waiting.set(o,a)})}add({name:t,parts:o}){if(this.ended)return;const s=t.slice(t.lastIndexOf(".")+1).toLowerCase(),n=URL.createObjectURL(new Blob(o,{type:Qo[s]??""}));this.urls.set(t,n);for(const{resolve:r}of this.waiting.get(t)??[])r(n);this.waiting.delete(t)}end(t){if(!this.ended){this.ended=!0,this.failure=t;for(const[o,s]of this.waiting)for(const{reject:n}of s)n(t??new Error(`The demo bundle has no "${o}"`));this.waiting.clear()}}dispose(){this.end(new Error("The demo was unloaded"));for(const t of this.urls.values())URL.revokeObjectURL(t);this.urls.clear()}}async function ss(e,t){const o=e.getReader(),s=[];let n=0;for(;n<t;){const{done:p,value:l}=await o.read();if(p)break;s.push(l),n+=l.length}const r=new Uint8Array(Math.min(n,t));let a=0;for(const p of s){if(a>=r.length)break;r.set(p.subarray(0,r.length-a),a),a+=p.length}const f=new ReadableStream({start(p){for(const l of s)p.enqueue(l)},async pull(p){const{done:l,value:d}=await o.read();l?p.close():p.enqueue(d)},cancel(p){return o.cancel(p)}});return[r,f]}function ns({update:e,notify:t,unwatched:o}){return{link:s,unlink:n,propagate:r,checkDirty:a,shallowPropagate:f};function s(l,d,m){const c=d.depsTail;if(c!==void 0&&c.dep===l)return;const u=c!==void 0?c.nextDep:d.deps;if(u!==void 0&&u.dep===l){u.version=m,d.depsTail=u;return}const h=l.subsTail;if(h!==void 0&&h.version===m&&h.sub===d)return;const b=d.depsTail=l.subsTail={version:m,dep:l,sub:d,prevDep:c,nextDep:u,prevSub:h,nextSub:void 0};u!==void 0&&(u.prevDep=b),c!==void 0?c.nextDep=b:d.deps=b,h!==void 0?h.nextSub=b:l.subs=b}function n(l,d=l.sub){const{dep:m,prevDep:c,nextDep:u,nextSub:h,prevSub:b}=l;return u!==void 0?u.prevDep=c:d.depsTail=c,c!==void 0?c.nextDep=u:d.deps=u,h!==void 0?h.prevSub=b:m.subsTail=b,b!==void 0?b.nextSub=h:(m.subs=h)===void 0&&o(m),u}function r(l,d){let m=l.nextSub,c;e:do{const u=l.sub;let h=u.flags;if(60&h?12&h?4&h?!(48&h)&&p(l,u)?(u.flags=40|h,h&=1):h=0:u.flags=-9&h|32:h=0:(u.flags=32|h,d&&(u.flags|=8)),2&h&&t(u),1&h){const b=u.subs;if(b!==void 0){const w=(l=b).nextSub;w!==void 0&&(c={value:m,prev:c},m=w);continue}}if((l=m)!==void 0){m=l.nextSub;continue}for(;c!==void 0;)if(l=c.value,c=c.prev,l!==void 0){m=l.nextSub;continue e}break}while(!0)}function a(l,d){let m,c=0,u=!1;e:do{const h=l.dep,b=h.flags;if(16&d.flags)u=!0;else if((17&b)===17){const w=h.subs;e(h)&&(w.nextSub!==void 0&&f(w),u=!0)}else if((33&b)===33){m={value:l,prev:m},l=h.deps,d=h,++c;continue}if(!u){const w=l.nextDep;if(w!==void 0){l=w;continue}}for(;c--;){if(l=m.value,m=m.prev,u){const T=d.subs;if(e(d)){T.nextSub!==void 0&&f(T),d=l.sub;continue}u=!1}else d.flags&=-33;d=l.sub;const w=l.nextDep;if(w!==void 0){l=w;continue e}}return u&&!!d.flags}while(!0)}function f(l){do{const d=l.sub,m=d.flags;(48&m)===32&&(d.flags=16|m,(6&m)===2&&t(d))}while((l=l.nextSub)!==void 0)}function p(l,d){let m=d.depsTail;for(;m!==void 0;){if(m===l)return!0;m=m.prevDep}return!1}}const we=64;let Ae=0,ve=0,Ge=0,re=0,ge=0,V;const q=[],{link:Me,unlink:ke,propagate:rs,checkDirty:Lt,shallowPropagate:Nt}=ns({update(e){return"getter"in e?jt(e):"currentValue"in e?Vt(e):(e.flags=1,!0)},notify(e){let t=ge,o=t;do if(q[t++]=e,e.flags&=-3,e=e.subs?.sub,e===void 0||!(2&e.flags))break;while(!0);for(ge=t;o<--t;){const s=q[o];q[o++]=q[t],q[t]=s}},unwatched(e){"getter"in e?e.depsTail!==void 0&&(e.flags=17,Zt(e)):"currentValue"in e||("fn"in e?Ht.call(e):Ye.call(e))}});function ae(e){const t=V;return V=e,t}function as(){++Ge}function is(){--Ge||Ft()}function k(e){return us.bind({currentValue:e,pendingValue:e,subs:void 0,subsTail:void 0,flags:1})}function $e(e){return ps.bind({value:void 0,subs:void 0,subsTail:void 0,deps:void 0,depsTail:void 0,flags:0,getter:e})}function P(e){const t={fn:e,cleanup:void 0,subs:void 0,subsTail:void 0,deps:void 0,depsTail:void 0,flags:6},o=ae(t);o!==void 0&&(Me(t,o,0),o.flags|=we);try{++ve,t.cleanup=t.fn()}finally{--ve,V=o,t.flags&=-5}return Ht.bind(t)}function ls(e){const t={deps:void 0,depsTail:void 0,subs:void 0,subsTail:void 0,flags:1},o=ae(t);o!==void 0&&(Me(t,o,0),o.flags|=we);try{e()}finally{V=o}return Ye.bind(t)}function jt(e){if(e.flags&we){let o=e.depsTail;for(;o!==void 0;){const s=o.prevDep,n=o.dep;!("getter"in n)&&!("currentValue"in n)&&ke(o,e),o=s}}e.depsTail=void 0,e.flags=5;const t=ae(e);try{++Ae;const o=e.value;return o!==(e.value=e.getter(o))}finally{V=t,e.flags&=-5,Bt(e)}}function Vt(e){return e.flags=1,e.currentValue!==(e.currentValue=e.pendingValue)}function cs(e){const t=e.flags;if(16&t||32&t&&Lt(e.deps,e)){if(t&we){let s=e.depsTail;for(;s!==void 0;){const n=s.prevDep,r=s.dep;!("getter"in r)&&!("currentValue"in r)&&ke(s,e),s=n}}if(e.cleanup&&(Ut(e),!e.flags))return;e.depsTail=void 0,e.flags=6;const o=ae(e);try{++Ae,++ve,e.cleanup=e.fn()}finally{--ve,V=o,e.flags&=-5,Bt(e)}}else e.deps!==void 0&&(e.flags=2|t&we)}function Ft(){try{for(;re<ge;){const e=q[re];q[re++]=void 0,cs(e)}}finally{for(;re<ge;){const e=q[re];q[re++]=void 0,e.flags|=10}re=0,ge=0}}function ps(){const e=this.flags;if(16&e||32&e&&(Lt(this.deps,this)||(this.flags=-33&e,!1))){if(jt(this)){const o=this.subs;o!==void 0&&Nt(o)}}else if(!e){this.flags=5;const o=ae(this);try{this.value=this.getter()}finally{V=o,this.flags&=-5}}const t=V;return t!==void 0&&Me(this,t,Ae),this.value}function us(...e){if(e.length){if(this.pendingValue!==(this.pendingValue=e[0])){this.flags=17;const t=this.subs;t!==void 0&&(rs(t,!!ve),Ge||Ft())}}else{if(16&this.flags&&Vt(this)){const o=this.subs;o!==void 0&&Nt(o)}const t=V;return t!==void 0&&Me(this,t,Ae),this.currentValue}}function Ut(e){const t=e.cleanup;e.cleanup=void 0;const o=V;V=void 0;try{t()}finally{V=o}}function Ht(){Ye.call(this),this.cleanup&&Ut(this)}function Ye(){this.flags=0,Zt(this);const e=this.subs;e!==void 0&&ke(e)}function Zt(e){let t=e.depsTail;for(;t!==void 0;){const o=t.prevDep;ke(t,e),t=o}}function Bt(e){const t=e.depsTail;let o=t!==void 0?t.nextDep:e.deps;for(;o!==void 0;)o=ke(o,e)}const ds="http://www.w3.org/2000/svg";function B(...e){return e.filter(Boolean).join(" ")}function pe(e){const t=ae(void 0);try{return e()}finally{ae(t)}}function qe(e){P(()=>e)}function Je(e){let t;const o=pe(()=>ls(()=>{t=e()}));return{view:t,stop:o}}function gt(e,t,o){t.startsWith("aria-")&&typeof o=="boolean"?e.setAttribute(t,String(o)):o===!1||o==null?e.removeAttribute(t):e.setAttribute(t,o===!0?"":String(o))}function Wt(e,t){if(!(t==null||t===!1||t===!0))if(Array.isArray(t))for(const o of t)Wt(e,o);else if(t instanceof Node)e.appendChild(t);else if(typeof t=="function"){const o=document.createTextNode("");P(()=>{const s=t();o.data=s==null||s===!1?"":String(s)}),e.appendChild(o)}else e.appendChild(document.createTextNode(String(t)))}function Gt(e,t,o){for(const[s,n]of Object.entries(t??{}))s.startsWith("on")&&typeof n=="function"?e.addEventListener(s.slice(2),n):typeof n=="function"?P(()=>gt(e,s,n())):gt(e,s,n);return Wt(e,o),e}function y(e,t,...o){return Gt(document.createElement(e),t,o)}function M(e,t,...o){return Gt(document.createElementNS(ds,e),t,o)}function fs(e,t){const{view:o,stop:s}=Je(e),n=o instanceof DocumentFragment?[...o.childNodes]:[o];return t.appendChild(o),()=>{s();for(const r of n)r.parentNode?.removeChild(r)}}function Q(e){as();try{e()}finally{is()}}function Ve(e){return $e(t=>e()??t)}function ue(e,t,o={}){const s=document.createComment(""),n=document.createDocumentFragment();n.appendChild(s);let r;const a=f=>{if(!r)return;const{view:p,stop:l}=r;r=void 0,l(),f&&o.exit&&p instanceof Element?o.exit(p).then(()=>p.remove()):p.parentNode?.removeChild(p)};return P(()=>{const f=!!e();pe(()=>{f&&!r?(r=Je(t),s.parentNode?.insertBefore(r.view,s)):f||a(!0)})}),qe(()=>a(!1)),n}function be(e,t,o){const s=document.createComment(""),n=document.createDocumentFragment();n.appendChild(s);let r=new Map;return P(()=>{const a=e();pe(()=>{const f=new Map;a.forEach((p,l)=>{const d=t(p,l);let m=r.get(d);if(m)m.set(p);else{const c=k(p);m={...Je(()=>o(()=>c(),l)),set:h=>c(h)}}f.set(d,m)});for(const[p,l]of r)f.has(p)||(l.stop(),l.view.parentNode?.removeChild(l.view));if(r=f,s.parentNode){let p=s;for(const{view:l}of[...f.values()].reverse())l.nextSibling!==p&&s.parentNode.insertBefore(l,p),p=l}})}),qe(()=>{for(const a of r.values())a.stop(),a.view.parentNode?.removeChild(a.view);r=new Map}),n}function Yt(e,t){return!t||/^https?:\/\//.test(e)||e.startsWith("data:")||e.startsWith("blob:")?e:`${t.replace(/\/$/,"")}/${e.replace(/^\//,"")}`}async function hs(e,t){const o=Yt(e,t);if(o.startsWith("blob:")||o.startsWith("data:"))return{src:o};try{const s=await(await fetch(o)).blob(),n=URL.createObjectURL(s);return{src:n,objectUrl:n}}catch{return{src:o}}}const ms={smooth:"ease-in-out",cinematic:"cubic-bezier(0.65, 0, 0.35, 1)",fast:"ease-out",linear:"linear"};function ye(e){const t=e?.duration??Ue.duration,o=e?.easing??Ue.easing;return{ms:t,css:ms[o]}}const qt={frame:e=>requestAnimationFrame(e),delay:(e,t)=>{setTimeout(e,t)}},Jt=180;function bt(e,t,o,s,n=qt){if(!t){const{ms:r,css:a}=ye(void 0);e.setTransitionTiming(r,a),e.setTransform(ee);return}o&&(e.setTransformInstant(!0),e.setTransform(ee),n.frame(()=>e.setTransformInstant(!1))),n.delay(()=>{if(s()){const{ms:r,css:a}=ye(t);e.setTransitionTiming(r,a),e.setTransform(Fe(t))}},Jt)}function wt(e,t,o,s,n=qt){e.setTransformInstant(!0),e.setTransform(Fe(t)),n.frame(()=>{if(!s())return;e.setTransformInstant(!1);const{ms:r,css:a}=ye(o??t);e.setTransitionTiming(r,a),e.setTransform(o?Fe(o):ee)})}function gs(e,t){const o=[...e.slice(t),...e.slice(0,t).reverse()];for(const s of o)if(s.type==="photo"&&s.hotspot)return s.hotspot}const vt=2,bs=220,ws=660;class vs{callbacks;style;lastAnchor;tooltipTimer;constructor(t,o={}){this.callbacks=t,this.style=o}setStyle(t={}){this.style=t}colors(t){return{bgColor:this.style.bgColor??t?.bgColor??ut.bgColor,textColor:this.style.textColor??t?.textColor??ut.textColor}}reveal(t,o,s){if(clearTimeout(this.tooltipTimer),!t||!o){this.callbacks.setHotspot(void 0),this.callbacks.setTooltip(void 0);return}const{bgColor:n,textColor:r}=this.colors(t),a=this.lastAnchor,f=a!=null&&(Math.abs(a.left-o.left)>vt||Math.abs(a.top-o.top)>vt);f?(this.callbacks.setHotspot({left:a.left,top:a.top,color:n,instant:!0,appear:!1}),requestAnimationFrame(()=>{s()&&this.callbacks.setHotspot({left:o.left,top:o.top,color:n,instant:!1,appear:!1})})):this.callbacks.setHotspot({left:o.left,top:o.top,color:n,instant:!0,appear:!a}),this.lastAnchor=o,t.label?(this.callbacks.setTooltip({anchor:o,position:t.position,visible:!1,text:t.label,bgColor:n,textColor:r}),this.tooltipTimer=setTimeout(()=>{s()&&this.callbacks.showTooltip()},f?ws:bs)):this.callbacks.setTooltip(void 0)}reposition(t,o,s){this.lastAnchor=s,this.callbacks.setHotspot({...t,left:s.left,top:s.top,instant:!0}),o&&this.callbacks.setTooltip({...o,anchor:s})}hide(){clearTimeout(this.tooltipTimer),this.callbacks.hideTooltip()}reset(){clearTimeout(this.tooltipTimer),this.lastAnchor=void 0,this.callbacks.setHotspot(void 0),this.callbacks.setTooltip(void 0)}dispose(){clearTimeout(this.tooltipTimer)}}class ys{stepCount;autoplay;callbacks;index=0;constructor(t,o,s){this.stepCount=t,this.autoplay=o,this.callbacks=s}get currentIndex(){return this.index}next(){if(this.index<this.stepCount-1){this.index+=1,this.callbacks.onChange(this.index);return}if(this.autoplay)return void this.goTo(0);this.callbacks.onFinish()}prev(){this.index>0&&(this.index-=1,this.callbacks.onChange(this.index))}goTo(t){t>=0&&t<this.stepCount&&(this.index=t,this.callbacks.onChange(t))}}function yt(e){return e.play().catch(t=>{if(!(t instanceof DOMException&&t.name==="AbortError"))throw t})}const xs=1/60;function ks(e,t,o,s=requestAnimationFrame,n=cancelAnimationFrame){let r,a=!1;const f=()=>{const p=t.endTime-t.startTime,l=p>0?(e.currentTime-t.startTime)/p:0;o.onProgress(Math.min(1,Math.max(0,l))),t.zoomOutLeadSec!=null&&!a&&t.endTime-e.currentTime<=t.zoomOutLeadSec&&(a=!0,o.onZoomOut());const d=t.endTime-e.currentTime,m=xs*(e.playbackRate||1);if(!e.paused&&d<=m){t.continuesIntoNext||e.pause(),r=void 0,o.onClipEnd();return}r=s(f)};return r=s(f),{cancel:()=>{r!=null&&n(r),r=void 0}}}const Xe=.05,Ts=.05;function Ss(e,t,o,s){return e===t-1&&Math.abs(o-s)<Xe}function _s(e,t){return t?.type==="video"&&Math.abs(t.startTime-e.endTime)<Xe}function Es(e){return e?.panZoom!=null}function Cs(e,t){let o=0,s=performance.now();const n=()=>o+(s===void 0?0:(performance.now()-s)/1e3);return{get currentTime(){return e+n()*t},get paused(){return s===void 0},playbackRate:t,pause(){o=n(),s=void 0},resume(){s??=performance.now()}}}function $s(e,t,o,s,n){e.playbackRate=t.playbackRate??1;const r=e.ended;r||yt(e);const a=t.panZoom&&!Es(n)?(t.panZoom.duration??Ue.duration)/1e3+Ts:void 0,f=r?Cs(t.startTime,e.playbackRate):void 0;return{cancel:ks(f??e,{startTime:t.startTime,endTime:t.endTime,zoomOutLeadSec:a,continuesIntoNext:_s(t,n)},{onProgress:s.onProgress,onZoomOut:s.onZoomOut,onClipEnd:s.onEnded}).cancel,pause:()=>(f??e).pause(),resume(){f?f.resume():e.ended?s.onEnded():yt(e)}}}const Os=400;function As(e,t){const o=Math.abs(e.currentTime-t)<Xe;return o&&!e.seeking?Promise.resolve():new Promise(s=>{const n=()=>{clearTimeout(r),e.removeEventListener("seeked",n),s()},r=setTimeout(n,Os);e.addEventListener("seeked",n,{once:!0}),o||(e.currentTime=t)})}const xt=new WeakMap;function ie(e,t,o){let s=xt.get(e);if(s||(s=new Set,xt.set(e,s)),s.has(t))return;s.add(t);const n=e.createElement("style");n.dataset.openshowcase=t,n.textContent=o,e.head.appendChild(n)}const Ms=`
.openshowcase-player .browser-chrome {
  flex: none;
  display: grid;
  grid-template-columns: 1fr minmax(0, auto) 1fr;
  align-items: center;
  column-gap: calc(var(--wd-u, 14px) * 0.7);
  height: calc(var(--wd-u, 14px) * 2.6);
  padding: 0 calc(var(--wd-u, 14px) * 0.95);
  background: linear-gradient(180deg, #fdfdfe, #f4f4f6);
  box-shadow:
    inset 0 0.5px 0 #fff,
    inset 0 -0.5px 0 rgb(15 23 42 / 0.12);
}
.openshowcase-player--dark .browser-chrome {
  background: linear-gradient(180deg, #2c2c31, #252529);
  box-shadow:
    inset 0 0.5px 0 rgb(255 255 255 / 0.09),
    inset 0 -0.5px 0 rgb(0 0 0 / 0.6);
}
.openshowcase-player .browser-chrome__lights {
  display: flex;
  gap: calc(var(--wd-u, 14px) * 0.46);
}
.openshowcase-player .browser-chrome__light {
  width: calc(var(--wd-u, 14px) * 0.78);
  height: calc(var(--wd-u, 14px) * 0.78);
  border-radius: 50%;
  box-shadow: inset 0 0 0 0.5px rgb(0 0 0 / 0.14);
}
.openshowcase-player .browser-chrome__light:nth-child(1) { background: #ff5f57; }
.openshowcase-player .browser-chrome__light:nth-child(2) { background: #febc2e; }
.openshowcase-player .browser-chrome__light:nth-child(3) { background: #28c840; }
.openshowcase-player .browser-chrome__address {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--wd-u, 14px) * 0.38);
  min-width: 0;
  width: min(50cqw, 400px);
  max-width: 100%;
  padding: calc(var(--wd-u, 14px) * 0.3) calc(var(--wd-u, 14px) * 0.7);
  border-radius: calc(var(--wd-u, 14px) * 0.5);
  background: #fff;
  box-shadow:
    0 0 0 0.5px rgb(15 23 42 / 0.13),
    0 0.5px 1px rgb(15 23 42 / 0.07);
  color: #52525c;
  font-size: calc(var(--wd-u, 14px) * 0.9);
  font-weight: 500;
  line-height: 1.2;
}
.openshowcase-player--dark .browser-chrome__address {
  background: rgb(255 255 255 / 0.07);
  box-shadow: inset 0 0 0 0.5px rgb(255 255 255 / 0.09);
  color: #c4c4cc;
}
.openshowcase-player .browser-chrome__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.openshowcase-player .browser-chrome__icon {
  flex: none;
  display: block;
  width: calc(var(--wd-u, 14px) * 0.88);
  height: calc(var(--wd-u, 14px) * 0.88);
  color: #8a8a94;
}
.openshowcase-player--dark .browser-chrome__icon {
  color: #80808a;
}
.openshowcase-player .browser-chrome__reload {
  justify-self: end;
  display: grid;
  place-items: center;
  padding: calc(var(--wd-u, 14px) * 0.3);
  margin-right: calc(var(--wd-u, 14px) * -0.3);
  border: 0;
  border-radius: calc(var(--wd-u, 14px) * 0.4);
  background: transparent;
  cursor: pointer;
}
.openshowcase-player .browser-chrome__reload:hover {
  background: rgb(15 23 42 / 0.07);
}
.openshowcase-player--dark .browser-chrome__reload:hover {
  background: rgb(255 255 255 / 0.1);
}

/* Inside the bezel the glass already frames the window: a quieter bar with a pill address */
.openshowcase-player .frame--bezel .browser-chrome {
  background: #fafafb;
  box-shadow: inset 0 -0.5px 0 rgb(15 23 42 / 0.1);
}
.openshowcase-player.openshowcase-player--dark .frame--bezel .browser-chrome {
  background: #232327;
  box-shadow: inset 0 -0.5px 0 rgb(255 255 255 / 0.08);
}
.openshowcase-player .frame--bezel .browser-chrome__address {
  border-radius: 99px;
  background: rgb(15 23 42 / 0.05);
  box-shadow: none;
}
.openshowcase-player.openshowcase-player--dark .frame--bezel .browser-chrome__address {
  background: rgb(255 255 255 / 0.07);
}
`,kt=(...e)=>M("svg",{class:"browser-chrome__icon",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2.2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":!0},e);function Ps(e){return ie(document,"browser-chrome",Ms),y("div",{class:"browser-chrome"},y("div",{class:"browser-chrome__lights"},[0,1,2].map(()=>y("span",{class:"browser-chrome__light"}))),y("div",{class:"browser-chrome__address"},kt(M("rect",{x:"4.5",y:"11",width:"15",height:"10",rx:"2.2"}),M("path",{d:"M8 11V7.5a4 4 0 0 1 8 0V11"})),y("span",{class:"browser-chrome__title"},()=>e.title())),y("button",{type:"button",title:"Back to start",class:"browser-chrome__reload",onclick:()=>e.onReload?.()},kt(M("path",{d:"M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"}))))}const Tt=e=>e.toFixed(1),St=e=>{const t=Math.floor(e);return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`};function Ds(e,t){const o=Math.min(Math.max(0,e),t);return t<60?`${Tt(o)} / ${Tt(t)}s`:`${St(o)} / ${St(t)}`}const Is=`
.openshowcase-player .navbar {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: calc(var(--wd-u, 14px) * 0.7);
  padding: calc(var(--wd-u, 14px) * 3.4) calc(var(--wd-u, 14px) * 1.1)
    calc(var(--wd-u, 14px) * 0.45);
  /* No box around the controls: this is what keeps them legible over whatever was recorded,
     dark or light, text included. */
  background: linear-gradient(
    to top,
    rgb(9 9 11 / 0.9),
    rgb(9 9 11 / 0.72) 40%,
    rgb(9 9 11 / 0)
  );
  color: #fff;
  opacity: 0;
  translate: 0 4px;
  pointer-events: none;
  /* leaving: unhurried, so it fades rather than blinks out */
  transition:
    opacity 360ms cubic-bezier(0.4, 0, 0.2, 1),
    translate 360ms cubic-bezier(0.4, 0, 0.2, 1);
}
/* :has(:focus-visible), not :focus-within: a clicked segment keeps the focus, and the bar
   would stay up after the pointer has left. */
.openshowcase-player .navbar--visible,
.openshowcase-player .navbar:has(:focus-visible) {
  opacity: 1;
  translate: 0 0;
  pointer-events: auto;
  /* arriving: quick, it answers the pointer */
  transition:
    opacity 180ms var(--wd-ease-out, ease-out),
    translate 180ms var(--wd-ease-out, ease-out);
}

.openshowcase-player .clip {
  flex: none;
  display: flex;
  align-items: center;
  gap: calc(var(--wd-u, 14px) * 0.45);
}
.openshowcase-player .clip-toggle {
  flex: none;
  display: grid;
  place-items: center;
  width: calc(var(--wd-u, 14px) * 2);
  height: calc(var(--wd-u, 14px) * 2);
  margin-left: calc(var(--wd-u, 14px) * -0.45);
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: none;
  color: #fff;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    scale 150ms ease;
}
.openshowcase-player .clip-toggle:hover {
  background: rgb(255 255 255 / 0.16);
}
.openshowcase-player .clip-toggle:active {
  scale: 0.9;
}
.openshowcase-player .clip-toggle:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 1px;
}
.openshowcase-player .clip-toggle svg {
  display: block;
  width: 55%;
  height: 55%;
  fill: currentColor;
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.35));
}
.openshowcase-player .clip-time {
  white-space: nowrap;
}

.openshowcase-player .segments {
  display: flex;
  flex: 1;
  align-items: center;
  gap: calc(var(--wd-u, 14px) * 0.2);
  min-width: 0;
}

/* A tall invisible hit row around a bar that thickens on hover. The current step gets more of
   the width, and its color: it's what the viewer is following. */
.openshowcase-player .segment {
  position: relative;
  flex: 1 1 0;
  min-width: 2px;
  height: calc(var(--wd-u, 14px) * 2);
  display: flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  transition: flex-grow 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.openshowcase-player .segment--active {
  flex-grow: 3;
}
.openshowcase-player .segment-track {
  position: relative;
  width: 100%;
  height: max(3px, calc(var(--wd-u, 14px) * 0.32));
  overflow: hidden;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.3);
  transition:
    height 180ms cubic-bezier(0.2, 0, 0, 1),
    background-color 180ms ease;
}
.openshowcase-player .segment--active .segment-track {
  height: max(4px, calc(var(--wd-u, 14px) * 0.46));
  background: color-mix(in srgb, var(--wd-accent, #fff) 34%, transparent);
}
.openshowcase-player .segment:hover .segment-track {
  height: max(6px, calc(var(--wd-u, 14px) * 0.6));
}
.openshowcase-player .segment:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
  border-radius: 4px;
}
.openshowcase-player .segment-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0%;
  border-radius: inherit;
  background-color: var(--wd-accent, #fff);
  /* fills and empties on a step change instead of snapping */
  transition:
    width 260ms cubic-bezier(0.2, 0, 0, 1),
    background-color 200ms ease;
}
/* The playing clip's fill is updated every frame: a short linear glide just smooths it. */
.openshowcase-player .segment--active .segment-fill {
  transition:
    width 120ms linear,
    background-color 200ms ease;
}
.openshowcase-player .segment-fill--done {
  background: rgb(255 255 255 / 0.9);
}

/* Which step a segment is, shown above it on hover. */
.openshowcase-player .segment::after {
  content: attr(data-label);
  position: absolute;
  bottom: 100%;
  left: 50%;
  translate: -50% 4px;
  padding: calc(var(--wd-u, 14px) * 0.2) calc(var(--wd-u, 14px) * 0.45);
  border-radius: 6px;
  background: rgb(9 9 11 / 0.85);
  color: #fff;
  font-size: calc(var(--wd-u, 14px) * 0.7);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 140ms ease,
    translate 140ms var(--wd-ease-out, ease-out);
}
.openshowcase-player .segment:hover::after {
  opacity: 1;
  translate: -50% 0;
}

.openshowcase-player .clip-time,
.openshowcase-player .counter {
  font-size: calc(var(--wd-u, 14px) * 0.8);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #fff;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.45);
}
.openshowcase-player .counter {
  flex-shrink: 0;
}
.openshowcase-player .counter-total {
  color: rgb(255 255 255 / 0.65);
}

@media (prefers-reduced-motion: reduce) {
  .openshowcase-player .navbar {
    translate: 0 0;
  }
  .openshowcase-player .segment,
  .openshowcase-player .segment-track,
  .openshowcase-player .segment-fill,
  .openshowcase-player .segment::after,
  .openshowcase-player .clip-toggle {
    transition: none;
  }
  .openshowcase-player .segment::after {
    translate: -50% 0;
  }
}
`,Rs="M5 3.2c0-.8.9-1.3 1.6-.9l6.3 4c.7.4.7 1.4 0 1.8l-6.3 4c-.7.4-1.6-.1-1.6-.9z",zs="M3.5 3.6c0-.6.5-1.1 1.1-1.1h1c.6 0 1.1.5 1.1 1.1v8.8c0 .6-.5 1.1-1.1 1.1h-1c-.6 0-1.1-.5-1.1-1.1zm5.8 0c0-.6.5-1.1 1.1-1.1h1c.6 0 1.1.5 1.1 1.1v8.8c0 .6-.5 1.1-1.1 1.1h-1c-.6 0-1.1-.5-1.1-1.1z";function Ls(e){ie(document,"navbar",Is);const t=$e(()=>e.segments().findIndex(s=>s.active)),o=y("div",{class:()=>B("navbar",e.visible?.()&&"navbar--visible")},ue(()=>e.clip?.()!=null,()=>y("div",{class:"clip"},y("button",{type:"button",class:"clip-toggle",title:()=>e.paused?.()?"Play":"Pause","aria-label":()=>e.paused?.()?"Play":"Pause",onclick:s=>{s.stopPropagation(),e.onTogglePlay?.()}},M("svg",{viewBox:"0 0 16 16","aria-hidden":"true"},M("path",{d:()=>e.paused?.()?Rs:zs}))),y("span",{class:"clip-time"},()=>{const s=e.clip?.();return s?Ds(s.elapsed,s.total):""}))),y("div",{class:"segments"},be(()=>e.segments(),(s,n)=>n,(s,n)=>y("button",{type:"button","aria-label":`Go to step ${n+1}`,"data-label":`${n+1}`,class:()=>B("segment",s().active&&"segment--active",s().done&&"segment--done"),onclick:r=>{r.stopPropagation(),e.onSeek?.(n)}},y("span",{class:"segment-track"},y("span",{class:()=>B("segment-fill",s().done&&"segment-fill--done"),style:()=>`width: ${100*s().progress}%`}))))),y("span",{class:"counter","aria-live":"polite",style:()=>`min-width: ${2*String(e.segments().length).length+1}ch;`},()=>Math.max(0,t())+1,y("span",{class:"counter-total"},()=>`/${e.segments().length}`)));return P(()=>{const s=e.accent?.();s?o.style.setProperty("--wd-accent",s):o.style.removeProperty("--wd-accent")}),o}const Ns=`
.openshowcase-player .hotspot {
  position: absolute;
  z-index: 3;
  width: max(44px, calc(var(--wd-u, 14px) * 3));
  height: max(44px, calc(var(--wd-u, 14px) * 3));
  translate: -50% -50%;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  /* travelling between steps: a spring glide, so it reads like a cursor moving over */
  transition:
    left 700ms var(--wd-spring-glide, ease-out),
    top 700ms var(--wd-spring-glide, ease-out);
}
.openshowcase-player .hotspot--still {
  transition: none;
}

.openshowcase-player .dot {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  transition: scale 420ms var(--wd-spring-pop, ease-out);
}
.openshowcase-player .hotspot--appear .dot {
  animation: openshowcase-hotspot-pop 480ms var(--wd-spring-pop, ease-out) both;
}
.openshowcase-player .hotspot--hover .dot {
  scale: 1.15;
}
.openshowcase-player .hotspot:active .dot {
  scale: 0.85;
  transition-duration: 120ms;
}

.openshowcase-player .pulse,
.openshowcase-player .ring,
.openshowcase-player .core {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

/* The dark hairlines keep it legible on light and dark screenshots alike */
.openshowcase-player .ring {
  width: calc(var(--wd-u, 14px) * 1.9);
  height: calc(var(--wd-u, 14px) * 1.9);
  border: 2px solid var(--openshowcase-color);
  box-shadow:
    0 0 0 1px rgb(0 0 0 / 0.25),
    inset 0 0 0 1px rgb(0 0 0 / 0.18);
  animation: openshowcase-hotspot-ring 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.openshowcase-player .pulse {
  width: calc(var(--wd-u, 14px) * 1.9);
  height: calc(var(--wd-u, 14px) * 1.9);
  border: 1.5px solid var(--openshowcase-color);
  opacity: 0;
  animation: openshowcase-hotspot-pulse 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
.openshowcase-player .core {
  width: calc(var(--wd-u, 14px) * 0.62);
  height: calc(var(--wd-u, 14px) * 0.62);
  background-color: var(--openshowcase-color);
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.22);
  transition: scale 160ms ease;
}
.openshowcase-player .hotspot:active .core {
  scale: 0.7;
}
.openshowcase-player .hotspot--hover .ring {
  animation-play-state: paused;
}
.openshowcase-player .hotspot--hover .pulse {
  animation: none;
}

.openshowcase-player .hotspot:focus-visible .ring {
  box-shadow:
    0 0 0 1px rgb(0 0 0 / 0.25),
    0 0 0 4px color-mix(in srgb, var(--openshowcase-color) 55%, transparent);
}

@keyframes openshowcase-hotspot-pop {
  from {
    scale: 0.4;
    opacity: 0;
  }
  to {
    scale: 1;
    opacity: 1;
  }
}
@keyframes openshowcase-hotspot-ring {
  50% {
    scale: 0.86;
  }
}
@keyframes openshowcase-hotspot-pulse {
  0%,
  20% {
    scale: 1;
    opacity: 0.7;
  }
  100% {
    scale: 2;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .openshowcase-player .hotspot,
  .openshowcase-player .dot,
  .openshowcase-player .core {
    transition: none;
  }
  .openshowcase-player .hotspot--appear .dot,
  .openshowcase-player .ring,
  .openshowcase-player .pulse {
    animation: none;
  }
}
`,js="#C5F11E";function Vs(e){ie(document,"hotspot",Ns);const t=y("button",{type:"button","aria-label":"Hotspot",class:()=>B("hotspot",e.instant?.()&&"hotspot--still",e.appear?.()&&"hotspot--appear",e.hovered?.()&&"hotspot--hover"),onclick:()=>e.onclick?.(),onmouseenter:()=>e.onhoverchange?.(!0),onmouseleave:()=>e.onhoverchange?.(!1)},y("span",{class:"dot"},y("span",{class:"pulse"}),y("span",{class:"ring"}),y("span",{class:"core"})));return P(()=>{t.style.left=`${e.left()}px`,t.style.top=`${e.top()}px`,t.style.setProperty("--openshowcase-color",e.color?.()??js)}),t}function Fs(e){return e.animate([{opacity:1,scale:1},{opacity:0,scale:.8}],{duration:160,easing:"cubic-bezier(0.32, 0, 0.67, 0)",fill:"forwards"}).finished.then(()=>{})}const Us=`
.openshowcase-player .tooltip {
  position: absolute;
  z-index: 4;
  width: max-content;
  min-width: calc(var(--wd-u, 14px) * 14);
  max-width: min(calc(var(--wd-u, 14px) * 19), 74cqw);
  padding: calc(var(--wd-u, 14px) * 0.78) calc(var(--wd-u, 14px) * 0.95)
    calc(var(--wd-u, 14px) * 0.62);
  border-radius: calc(var(--wd-u, 14px) * 0.95);
  /* Tooltip.ts recovers --wd-u from this: keep FONT_SIZE_U in sync */
  font-size: calc(var(--wd-u, 14px) * 0.92);
  font-weight: 500;
  line-height: 1.38;
  letter-spacing: -0.006em;
  text-align: left;
  text-wrap: pretty;
  overflow-wrap: anywhere;
  cursor: pointer;
  pointer-events: none;
  outline: none;
  /* The visible body is the SVG outline (box + tail as one shape, see .body below); the
     element itself stays transparent and just carries the text. */
  isolation: isolate;
  background: none;

  /* hidden: pulled in toward the hotspot, small */
  opacity: 0;
  translate: var(--wd-from, 0 0);
  scale: 0.82;
  /* exit: fast, eased in */
  transition:
    opacity 150ms var(--wd-ease-in, ease-in),
    translate 150ms var(--wd-ease-in, ease-in),
    scale 150ms var(--wd-ease-in, ease-in);
}

/* grows out of the arrow tip */
.openshowcase-player .tooltip--side-top {
  --wd-from: 0 10px;
  transform-origin: var(--wd-arrow) 100%;
}
.openshowcase-player .tooltip--side-bottom {
  --wd-from: 0 -10px;
  transform-origin: var(--wd-arrow) 0;
}
.openshowcase-player .tooltip--side-left {
  --wd-from: 10px 0;
  transform-origin: 100% var(--wd-arrow);
}
.openshowcase-player .tooltip--side-right {
  --wd-from: -10px 0;
  transform-origin: 0 var(--wd-arrow);
}

.openshowcase-player .tooltip--visible {
  pointer-events: auto;
  opacity: 1;
  translate: 0 0;
  scale: 1;
  /* enter: the box springs out softly, then its words settle in one after another */
  transition:
    opacity 140ms var(--wd-ease-out, ease-out),
    translate 620ms var(--wd-spring-tip, ease-out),
    scale 620ms var(--wd-spring-tip, ease-out);
}

.openshowcase-player .tip-word {
  display: inline-block;
}
/* The cap keeps a long label from taking its time: past it, words arrive together */
.openshowcase-player .tooltip--visible .tip-word {
  animation: openshowcase-tip-word 360ms var(--wd-ease-out, ease-out) both;
  animation-delay: calc(min(var(--wd-i), 18) * 24ms + 70ms);
}
.openshowcase-player .tooltip--visible .tip-foot {
  animation: openshowcase-tip-word 360ms var(--wd-ease-out, ease-out) 140ms both;
}
@keyframes openshowcase-tip-word {
  from {
    opacity: 0;
    translate: 0 0.35em;
  }
}

/* Only being pressed moves it: it gives under the pointer, and sits closer to the page */
.openshowcase-player .tooltip--visible:active {
  scale: 0.96;
  transition: scale 90ms var(--wd-ease-out, ease-out);
}
.openshowcase-player .tooltip--visible:active .body {
  filter: drop-shadow(0 1px 3px rgb(0 0 0 / 0.18));
  transition-duration: 90ms;
}

.openshowcase-player .tooltip:focus-visible .edge {
  stroke: rgb(255 255 255 / 0.95);
  stroke-width: 3px;
}

/* The body: its color with a touch of light from above, a light hairline along the top, and a
   darker edge, all following box and tail as one outline. The shadow is on the SVG so it
   follows the tail too, and takes the tooltip's color so it sits in the page. */
.openshowcase-player .body {
  position: absolute;
  inset: 0 auto auto 0;
  z-index: -1;
  overflow: visible;
  pointer-events: none;
  filter: drop-shadow(0 2px 3px rgb(0 0 0 / 0.12))
    drop-shadow(
      0 14px 18px
        color-mix(in srgb, color-mix(in srgb, var(--wd-tip-bg) 45%, black) 60%, transparent)
    );
  transition: filter 200ms ease;
}
.openshowcase-player .fill-top {
  stop-color: color-mix(in oklab, var(--wd-tip-bg) 94%, white);
}
.openshowcase-player .fill-base {
  stop-color: var(--wd-tip-bg);
}
.openshowcase-player .rim {
  fill: none;
  stroke-width: 2px;
}
.openshowcase-player .edge {
  fill: none;
  stroke: color-mix(in srgb, var(--wd-tip-bg) 60%, black);
  stroke-width: 0.75px;
}

/* The footer: how far into the demo this is, and where clicking leads */
.openshowcase-player .tip-foot {
  display: flex;
  align-items: center;
  gap: calc(var(--wd-u, 14px) * 0.55);
  margin-top: calc(var(--wd-u, 14px) * 0.55);
  padding-top: calc(var(--wd-u, 14px) * 0.5);
  box-shadow: inset 0 0.5px 0 color-mix(in srgb, currentColor 14%, transparent);
}
.openshowcase-player .tip-count {
  flex: none;
  font-size: 0.76em;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
  color: color-mix(in srgb, currentColor 62%, transparent);
}
.openshowcase-player .tip-bar {
  flex: 1;
  height: calc(var(--wd-u, 14px) * 0.24);
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 16%, transparent);
}
.openshowcase-player .tip-bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: currentColor;
  transition: width 420ms var(--wd-ease-out, ease-out);
}
.openshowcase-player .tip-go {
  flex: none;
  display: grid;
  place-items: center;
  width: calc(var(--wd-u, 14px) * 1.55);
  height: calc(var(--wd-u, 14px) * 1.55);
  border-radius: 50%;
  background: currentColor;
}
.openshowcase-player .tip-go svg {
  display: block;
  width: 56%;
  height: 56%;
  fill: none;
  color: var(--wd-tip-bg);
  stroke: currentColor;
  stroke-width: 2.3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (prefers-reduced-motion: reduce) {
  .openshowcase-player .tooltip,
  .openshowcase-player .tooltip--visible {
    translate: 0 0;
    scale: 1;
    transition: opacity 150ms ease;
  }
  .openshowcase-player .tooltip--visible .tip-word,
  .openshowcase-player .tooltip--visible .tip-foot {
    animation: none;
  }
  .openshowcase-player .tip-bar-fill {
    transition: none;
  }
}
`,Xt=150,Hs=.92;let Zs=0;function Bs(e){ie(document,"tooltip",Us);const t=`tip${++Zs}`,o=()=>({anchor:e.anchor(),text:e.text(),bgColor:e.bgColor?.()??"#C5F11E",textColor:e.textColor?.()??"#0C0C0C",position:e.position?.(),step:e.step?.()}),s=k(o());P(()=>{const c=o();if(e.visible())return void s(c);const u=setTimeout(()=>s(c),Xt);return()=>clearTimeout(u)});const n=$e(()=>{let c=0;return s().text.split(/(\s+)/).filter(Boolean).map(u=>({text:u,word:/\s/.test(u)?-1:c++}))}),r=k({width:0,height:0,unit:14}),a=k({left:0,top:0,side:"bottom",arrowOffset:0}),f=$e(()=>{const{width:c,height:u,unit:h}=r();if(c<=0)return"";const{side:b,arrowOffset:w}=a();return uo({width:c,height:u,radius:.95*h,side:b,tailOffset:w,tail:{width:1.2*h,height:.55*h,tipRadius:2}})}),p=(c,u,h)=>M("stop",{offset:c,"stop-color":u,"stop-opacity":h}),l=M("svg",{class:"body",width:()=>r().width,height:()=>r().height,"aria-hidden":"true"},M("defs",null,M("linearGradient",{id:`${t}-fill`,x1:"0",y1:"0",x2:"0",y2:"1"},M("stop",{offset:"0",class:"fill-top"}),M("stop",{offset:"1",class:"fill-base"})),M("linearGradient",{id:`${t}-rim`,x1:"0",y1:"0",x2:"0",y2:"1"},p("0","#fff","0.45"),p("0.25","#fff","0")),M("clipPath",{id:`${t}-clip`},M("path",{d:()=>f()}))),M("path",{d:()=>f(),fill:`url(#${t}-fill)`}),M("path",{d:()=>f(),class:"rim",stroke:`url(#${t}-rim)`,"clip-path":`url(#${t}-clip)`}),M("path",{d:()=>f(),class:"edge"})),d=y("div",{role:"button",tabindex:()=>e.visible()?0:-1,"aria-hidden":()=>!e.visible(),class:()=>{const c=a().side;return B("tooltip",e.visible()&&"tooltip--visible",c==="top"&&"tooltip--side-top",c==="bottom"&&"tooltip--side-bottom",c==="left"&&"tooltip--side-left",c==="right"&&"tooltip--side-right")},onclick:()=>e.onclick?.(),onkeydown:c=>{(c.key==="Enter"||c.key===" ")&&e.onclick?.()},onmouseenter:()=>e.onhoverchange?.(!0),onmouseleave:()=>e.onhoverchange?.(!1)},l,be(()=>n(),(c,u)=>`${u}:${c.text}`,c=>{const{text:u,word:h}=c();return h<0?document.createTextNode(u):y("span",{class:"tip-word",style:`--wd-i: ${h}`},u)}),ue(()=>s().step,()=>y("div",{class:"tip-foot","aria-hidden":"true"},y("span",{class:"tip-count"},()=>{const c=s().step;return c?`${c.current}/${c.total}`:""}),y("span",{class:"tip-bar"},y("span",{class:"tip-bar-fill",style:()=>{const c=s().step;return`width: ${c?c.current/c.total*100:0}%`}})),y("span",{class:"tip-go"},M("svg",{viewBox:"0 0 16 16"},M("path",{d:"M3.5 8h9M8.5 4l4 4-4 4"}))))));P(()=>{const{left:c,top:u,arrowOffset:h}=a();d.style.left=`${c}px`,d.style.top=`${u}px`,d.style.setProperty("--wd-arrow",`${h}px`)}),P(()=>{const{bgColor:c,textColor:u}=s();d.style.setProperty("--wd-tip-bg",c),d.style.color=u});const m=k(!1);return queueMicrotask(()=>m(!0)),P(()=>{s().text,s().step;const c=e.stageSize();if(!m()||!d.isConnected)return;const u=Number.parseFloat(getComputedStyle(d).fontSize)/Hs||14;r({width:d.offsetWidth,height:d.offsetHeight,unit:u}),a(wo({anchor:s().anchor,tooltipSize:{width:d.offsetWidth,height:d.offsetHeight},stageSize:c,position:s().position,gap:Math.round(1.55*u+4)}))}),qe(()=>m(!1)),d}function Ws(e){return e.animate([{opacity:1},{opacity:0}],{duration:Xt,easing:"cubic-bezier(0.32, 0, 0.67, 0)",fill:"forwards"}).finished.then(()=>{})}const Gs=`
.openshowcase-player img.media {
  pointer-events: none;
  will-change: transform;
}
/* the incoming frame stays transparent until decoded, then fades over the previous one */
.openshowcase-player .media--fading {
  animation: openshowcase-media-in 220ms cubic-bezier(0.4, 0, 0.2, 1) both;
}
.openshowcase-player .media--entering {
  opacity: 0;
  animation: none;
}
@keyframes openshowcase-media-in {
  from {
    opacity: 0;
  }
}

/* Dim the frame except a soft pool of light around the hotspot. The falloff is spread
   over many stops (roughly a smoothstep) so there's no visible edge — it reads like light,
   not like a hole cut in a gray sheet. --wd-spot-k (registered in app.css) scales the pool
   during the in/out transitions. */
.openshowcase-player .spotlight {
  /* enter: the room dims while the light gathers onto the hotspot */
  animation: openshowcase-light-in 900ms cubic-bezier(0.33, 1, 0.68, 1) both;
  --wd-spot-r: calc(var(--wd-u, 14px) * 1.5 * var(--wd-spot-k, 1));
  background: radial-gradient(
    circle at var(--wd-spot-x) var(--wd-spot-y),
    rgb(12 14 20 / 0) calc(var(--wd-spot-r) * 1),
    rgb(12 14 20 / 0.015) calc(var(--wd-spot-r) * 1.5),
    rgb(12 14 20 / 0.05) calc(var(--wd-spot-r) * 2.2),
    rgb(12 14 20 / 0.1) calc(var(--wd-spot-r) * 3.2),
    rgb(12 14 20 / 0.16) calc(var(--wd-spot-r) * 4.6),
    rgb(12 14 20 / 0.21) calc(var(--wd-spot-r) * 6.5),
    rgb(12 14 20 / 0.24) calc(var(--wd-spot-r) * 9)
  );
}

/* leave: the light lifts and spreads as it fades — in place, no sliding */
.openshowcase-player .spotlight--leaving {
  animation: openshowcase-light-out 500ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
}
@keyframes openshowcase-light-in {
  from {
    opacity: 0;
    --wd-spot-k: 1.6;
  }
}
@keyframes openshowcase-light-out {
  from {
    opacity: 1;
    --wd-spot-k: 1;
  }
  to {
    opacity: 0;
    --wd-spot-k: 1.35;
  }
}

.openshowcase-player .burst {
  position: absolute;
  z-index: 3;
  width: calc(var(--wd-u, 14px) * 2);
  height: calc(var(--wd-u, 14px) * 2);
  translate: -50% -50%;
  border-radius: 50%;
  border: 2px solid var(--openshowcase-color);
  pointer-events: none;
  animation: openshowcase-hotspot-burst 420ms cubic-bezier(0, 0, 0.2, 1) forwards;
}
@keyframes openshowcase-hotspot-burst {
  from {
    scale: 0.5;
    opacity: 1;
  }
  to {
    scale: 2.6;
    opacity: 0;
    border-width: 0.5px;
  }
}

/* What the hotspot leaves behind as it glides: a stroke drawn from where it was, its tail
   catching up on arrival. Pivots on its start, so it runs straight to the hotspot. */
.openshowcase-player .trail {
  position: absolute;
  z-index: 2;
  height: calc(var(--wd-u, 14px) * 0.4);
  transform-origin: 0 50%;
  translate: 0 -50%;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, var(--openshowcase-color));
  pointer-events: none;
  animation: openshowcase-hotspot-trail 620ms cubic-bezier(0.3, 0, 0.2, 1) forwards;
}
@keyframes openshowcase-hotspot-trail {
  0% {
    clip-path: inset(0 100% 0 0);
    opacity: 0.9;
  }
  55% {
    clip-path: inset(0 0 0 0);
    opacity: 0.9;
  }
  100% {
    clip-path: inset(0 0 0 100%);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .openshowcase-player .burst,
  .openshowcase-player .trail {
    display: none;
  }
  .openshowcase-player .spotlight {
    --wd-spot-k: 1 !important;
  }
}
`,Ys=220,qs=500,Js=640;function Xs(e){ie(document,"photo-layer",Gs);const t=k(!1),o=k(null),s=k(!1);let n=null;const r=y("img",{class:()=>B("media osp:absolute osp:inset-0 osp:h-full osp:w-full osp:object-contain",s()&&"media--entering",o()!==null&&"media--fading"),style:()=>{const g=e.transformInstant?.()?"none":`transform ${e.transitionMs?.()??1e3}ms ${e.transitionEasing?.()??"cubic-bezier(0.65, 0, 0.35, 1)"}`;return`display: ${e.visible()?"block":"none"}; transform: ${e.transform()}; transition: ${g};`},src:()=>e.src(),alt:()=>e.alt(),draggable:"false"});P(()=>{e.renderId?.();const g=e.src();return pe(()=>{const _=n;_?.visible&&_.src!==g&&(o({src:_.src,transform:_.transform}),s(!0));let $=!1,O;const N=()=>{$||(e.onReady?.(),s(!1),O=setTimeout(()=>o(null),Ys+40))};return r.decode().then(N,N),()=>{$=!0,clearTimeout(O)}})}),P(()=>{n={src:e.src(),transform:e.transform(),visible:e.visible()}}),P(()=>{e.src(),e.hotspot?.(),t(!1)});const a=k([]);let f=0,p;function l(){a().some(g=>!g.leaving)&&(a(a().map(g=>({...g,leaving:!0}))),setTimeout(()=>{a(a().filter(g=>!g.leaving))},qs))}function d(g,_){if(!g){p=void 0,l();return}const $=a().findLast(O=>!O.leaving);$&&_?a(a().map(O=>O.id===$.id?{...O,...g}:O)):(!$||!p||p.left!==g.left||p.top!==g.top)&&(l(),a([...a().filter(O=>O.leaving).slice(-1),{id:++f,...g,leaving:!1}])),p=g}P(()=>{const g=e.hotspot?.(),_=e.visible()&&g?{left:g.left,top:g.top}:void 0,$=g?.instant??!1;pe(()=>d(_,$))});const m=k([]);let c=0;function u(){const g=e.hotspot?.();if(g){const _={id:++c,left:g.left,top:g.top,color:g.color};m([...m(),_]),setTimeout(()=>{m(m().filter($=>$.id!==_.id))},500)}e.onHotspotAdvance?.()}const h=k([]);let b=0,w;P(()=>{const g=e.hotspot?.();pe(()=>{if(g&&w&&!g.instant&&(g.left!==w.left||g.top!==w.top)){const _=g.left-w.left,$=g.top-w.top,O={id:++b,...w,length:Math.hypot(_,$),angle:Math.atan2($,_),color:g.color};h([...h(),O]),setTimeout(()=>{h(h().filter(N=>N.id!==O.id))},Js)}w=g&&{left:g.left,top:g.top}})});const T=Ve(()=>o()??void 0),C=Ve(()=>e.hotspot?.()),E=Ve(()=>e.tooltip?.()),Y=document.createDocumentFragment();return Y.append(ue(()=>o(),()=>y("img",{class:"media osp:absolute osp:inset-0 osp:h-full osp:w-full osp:object-contain",style:()=>`transform: ${T().transform};`,src:()=>T().src,alt:"",draggable:"false"})),r,be(()=>a(),g=>g.id,g=>y("div",{class:()=>B("spotlight osp:pointer-events-none osp:absolute osp:inset-0 osp:z-1",g().leaving&&"spotlight--leaving"),style:()=>`--wd-spot-x: ${g().left}px; --wd-spot-y: ${g().top}px;`})),be(()=>h(),g=>g.id,g=>{const{left:_,top:$,length:O,angle:N,color:Te}=g(),x=y("span",{class:"trail",style:`left: ${_}px; top: ${$}px; width: ${O}px; rotate: ${N}rad;`});return x.style.setProperty("--openshowcase-color",Te),x}),ue(()=>e.visible()&&e.hotspot?.(),()=>Vs({left:()=>C().left,top:()=>C().top,color:()=>C().color,instant:()=>C().instant,appear:()=>C().appear,hovered:()=>t(),onclick:u,onhoverchange:g=>t(g)}),{exit:Fs}),be(()=>m(),g=>g.id,g=>{const{left:_,top:$,color:O}=g(),N=y("span",{class:"burst",style:`left: ${_}px; top: ${$}px;`});return N.style.setProperty("--openshowcase-color",O),N}),ue(()=>e.visible()&&e.tooltip?.(),()=>Bs({anchor:()=>E().anchor,stageSize:()=>e.stageSize(),position:()=>E().position,visible:()=>E().visible,text:()=>E().text,bgColor:()=>E().bgColor,textColor:()=>E().textColor,step:()=>E().step,onclick:u,onhoverchange:g=>t(g)}),{exit:Ws})),Y}const Ks=`
.openshowcase-player video.media {
  pointer-events: none;
}
`;function Qs(e){ie(document,"video-layer",Ks);const t=y("video",{class:"media osp:absolute osp:inset-0 osp:h-full osp:w-full osp:object-contain",style:()=>{const o=e.transformInstant?.()?"none":`transform ${e.transitionMs?.()??1e3}ms ${e.transitionEasing?.()??"cubic-bezier(0.65, 0, 0.35, 1)"}`;return`display: ${e.visible()?"block":"none"}; transform: ${e.transform()}; transition: ${o};`},playsinline:!0,onended:()=>e.onended?.()});return t.muted=!0,t}const en=`
.openshowcase-player .frame--browser,
.openshowcase-player .frame--browser .frame-window,
.openshowcase-player .frame--bezel .frame-window,
.openshowcase-player .frame-backdrop--on .frame,
.openshowcase-player .frame-backdrop--on .frame-window {
  border-radius: calc(var(--wd-u, 14px) * 0.95);
}
.openshowcase-player .frame--browser {
  box-shadow:
    0 0 0 0.5px rgb(15 23 42 / 0.1),
    0 1px 2px rgb(15 23 42 / 0.06),
    0 8px 20px -6px rgb(15 23 42 / 0.12),
    0 28px 56px -18px rgb(15 23 42 / 0.24);
}
.openshowcase-player--dark .frame--browser {
  box-shadow:
    0 0 0 0.5px rgb(255 255 255 / 0.12),
    0 1px 2px rgb(0 0 0 / 0.4),
    0 28px 56px -18px rgb(0 0 0 / 0.8);
}

.openshowcase-player .frame.frame--bezel {
  padding: calc(var(--wd-u, 14px) * 0.45);
  border-radius: calc(var(--wd-u, 14px) * 1.4);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.75), rgb(255 255 255 / 0.35));
  box-shadow:
    0 0 0 0.5px rgb(15 23 42 / 0.12),
    inset 0 0.5px 0 #fff,
    0 10px 24px -8px rgb(15 23 42 / 0.14),
    0 36px 70px -22px rgb(15 23 42 / 0.32);
}
.openshowcase-player.openshowcase-player--dark .frame--bezel {
  background: linear-gradient(180deg, rgb(255 255 255 / 0.11), rgb(255 255 255 / 0.04));
  box-shadow:
    0 0 0 0.5px rgb(255 255 255 / 0.12),
    inset 0 0.5px 0 rgb(255 255 255 / 0.14),
    0 36px 70px -22px #000;
}
.openshowcase-player .frame--bezel .frame-window {
  box-shadow: 0 0 0 0.5px rgb(15 23 42 / 0.1);
}
.openshowcase-player--dark .frame--bezel .frame-window {
  box-shadow: 0 0 0 0.5px rgb(255 255 255 / 0.12);
}

/* The color only ever reaches color properties (never a whole background shorthand), so a
   demo's value can't make the player load a url(). */
.openshowcase-player .frame-backdrop--on {
  --wd-backdrop-shadow: color-mix(
    in srgb,
    color-mix(in srgb, var(--wd-backdrop) 25%, black) 70%,
    transparent
  );
  padding: calc(var(--wd-backdrop-padding) * 1cqw);
  overflow: hidden;
  border-radius: calc(var(--wd-u, 14px) * 1.3);
  background-color: var(--wd-backdrop);
}
.openshowcase-player .frame-backdrop--soft {
  background-image: linear-gradient(
    155deg,
    color-mix(in srgb, var(--wd-backdrop) 72%, white),
    var(--wd-backdrop) 55%,
    color-mix(in srgb, var(--wd-backdrop) 82%, black)
  );
}
.openshowcase-player .frame-backdrop--glow {
  background-image: radial-gradient(
    90% 75% at 50% 112%,
    color-mix(in srgb, var(--wd-backdrop) 45%, white),
    transparent 72%
  );
}
.openshowcase-player .frame-backdrop--on .frame {
  box-shadow:
    0 0 0 0.5px rgb(15 23 42 / 0.16),
    0 26px 50px -16px var(--wd-backdrop-shadow);
}
/* Glass picks up the backdrop's color, in either appearance */
.openshowcase-player.openshowcase-player .frame-backdrop--on .frame--bezel {
  background: linear-gradient(180deg, rgb(255 255 255 / 0.42), rgb(255 255 255 / 0.16));
  box-shadow:
    0 0 0 0.5px rgb(255 255 255 / 0.35),
    inset 0 0.5px 0 rgb(255 255 255 / 0.6),
    0 26px 50px -16px var(--wd-backdrop-shadow);
}
`,_t=.5;function ce(e){return e.type==="photo"}function _e(e){return e.type==="video"}function Et(e={}){return{visible:k(!1),transform:k(ee),transformInstant:k(!1),transitionMs:k(1e3),transitionEasing:k("cubic-bezier(0.65, 0, 0.35, 1)"),...e}}function Ee(e){return{setTransform:t=>e.transform(t),setTransformInstant:t=>e.transformInstant(t),setTransitionTiming:(t,o)=>{e.transitionMs(t),e.transitionEasing(o)}}}function tn({demo:e,assetBaseUrl:t,resolveAsset:o=l=>Yt(l,t),hotspotStyle:s,appearance:n,wrapper:r,backdrop:a,startWhenVisible:f=!1,onStepChange:p}){ie(document,"player",en);const l=e.steps.find(ce),d=e.video?.width??l?.image.width??0,m=e.video?.height??l?.image.height??0;let c=0,u=!f;const h=[],b=i=>{u?i():h.push(i)};let w;const T=k(n),C=matchMedia("(prefers-color-scheme: dark)"),E=k(C.matches),Y=i=>E(i.matches),g=()=>{const i=T()??e.theme.appearance;return i==="auto"?E():i==="dark"},_=k(r),$=()=>_()??e.theme.wrapper,O=k(a),N=()=>{const i=O();return i===void 0?e.theme.backdrop:i},Te=k({width:0,height:0}),x={...Et(),src:k(""),renderId:k(0),alt:k(""),hotspot:k(void 0),tooltip:k(void 0)},j=Et(),oe=k(e.steps.map(()=>({progress:0,active:!1,done:!1})));let Pe,X;const he=k(void 0),se=k(!1),Ke=k(void 0);let D,Qe;const U=new vs({setHotspot:i=>x.hotspot(i),setTooltip:i=>x.tooltip(i&&{...i,step:{current:c+1,total:e.steps.length}}),showTooltip:()=>{const i=x.tooltip();i&&x.tooltip({...i,visible:!0})},hideTooltip:()=>{const i=x.tooltip();i&&x.tooltip({...i,visible:!1})}},s),De=new ys(e.steps.length,e.theme.autoplay,{onChange:i=>ot(i,c),onFinish:()=>eo()}),le=()=>De.next(),et=()=>De.prev(),Ie=i=>De.goTo(i),ne=Qs({visible:()=>j.visible(),transform:()=>j.transform(),transformInstant:()=>j.transformInstant(),transitionMs:()=>j.transitionMs(),transitionEasing:()=>j.transitionEasing(),onended:()=>le()});async function Kt(i){const v=await hs(await o(i));Pe=v.objectUrl,ne.src=v.src}const Qt=e.video?Kt(e.video.src).catch(()=>{}):Promise.resolve();function eo(){Q(()=>{U.reset(),he(void 0),se(!1),oe(oe().map(()=>({active:!1,done:!0,progress:1})))})}function to(){X&&(se()?X.resume():X.pause(),se(!se()))}function tt(){Ke(U.colors(gs(e.steps,c)).bgColor)}function oo(){const i=D;i&&ce(i)&&!i.hotspot&&le()}function ot(i,v){const S=e.steps[i];S&&(Q(()=>{c=i,Qe=e.steps[v],D=S,X?.cancel(),X=void 0,se(!1),he(_e(S)?{elapsed:0,total:(S.endTime-S.startTime)/(S.playbackRate??1)}:void 0),tt(),oe(oe().map((L,I)=>({active:I===i,done:I<i,progress:I===i?_e(S)?0:1:I<i?1:0}))),_e(S)?so(S,v):no(S,v)}),p?.(i,S))}function so(i,v){const S=e.steps[v],L=S&&ce(S)?S.panZoom:void 0,I=!j.visible(),H=()=>Q(()=>{x.visible(!1),j.visible(!0)});U.reset(),x.transform(ee),L?wt(Ee(j),L,i.panZoom,()=>D===i):bt(Ee(j),i.panZoom,I,()=>D===i),Qt.then(async()=>{D!==i||!Ss(v,c,ne.currentTime,i.startTime)&&(await As(ne,i.startTime),D!==i)||(H(),b(()=>{D===i&&(X=$s(ne,i,!0,{onProgress:lt=>{Q(()=>{oe(oe().map((ct,po)=>po===c?{...ct,progress:lt}:ct));const je=he();je&&he({...je,elapsed:lt*je.total})})},onZoomOut:()=>{j.transform(ee)},onEnded:()=>{X=void 0,le()}},e.steps[c+1]))}))})}function no(i,v){ne.pause();const S=e.steps[v];i.panZoom||S?.panZoom?U.reset():U.hide();const L=H=>Q(()=>{x.src(H),x.renderId(x.renderId()+1),x.alt(i.hotspot?.label??`Step ${c+1}`)}),I=o(i.image.src);typeof I=="string"?L(I):I.then(H=>D===i&&L(H),()=>{})}function ro(){const i=D;!i||!ce(i)||Q(()=>{const v=!x.visible(),S=!v&&!i.panZoom&&x.transform()!==ee;j.visible(!1),j.transform(ee),x.visible(!0),b(()=>{D===i&&Q(()=>ao(i,v,S))})})}function ao(i,v,S){const L=Qe;v&&i.panZoom&&L&&_e(L)&&L.panZoom?wt(Ee(x),L.panZoom,i.panZoom,()=>D===i):bt(Ee(x),i.panZoom,v,()=>D===i);const I=i.hotspot?st(i,i.hotspot):void 0,H=i.panZoom?Jt+ye(i.panZoom).ms:S?ye(void 0).ms:0;setTimeout(()=>{D===i&&U.reveal(i.hotspot,I,()=>D===i)},H)}function st(i,v){const S=mo(K.clientWidth,K.clientHeight,d,m);return go(v,S,d,m,i.panZoom)}function nt(){Te({width:K.clientWidth,height:K.clientHeight});const i=D,v=x.hotspot();if(!i||!ce(i)||!i.hotspot||!v)return;const S=st(i,i.hotspot);U.reposition(v,x.tooltip(),S)}const io=.2,lo=2200,Re=k(!1),ze=k(!1);let Le;function rt(i){if(i.pointerType==="touch")return;const{bottom:v,height:S}=K.getBoundingClientRect();Re(i.clientY>=v-S*io)}function co(i){if(i.pointerType!=="touch")return void rt(i);ze(!0),clearTimeout(Le),Le=setTimeout(()=>ze(!1),lo)}const K=y("div",{class:"stage osp:relative osp:flex-none osp:overflow-hidden osp:bg-[#fafafa] osp:dark:bg-[#0f0f10]",style:`aspect-ratio: ${d} / ${m};`,onclick:i=>{i.target===K&&oo()},role:"presentation"},ne,Xs({visible:()=>x.visible(),src:()=>x.src(),renderId:()=>x.renderId(),alt:()=>x.alt(),transform:()=>x.transform(),transformInstant:()=>x.transformInstant(),transitionMs:()=>x.transitionMs(),transitionEasing:()=>x.transitionEasing(),stageSize:()=>Te(),hotspot:()=>x.hotspot(),tooltip:()=>x.tooltip(),onReady:ro,onHotspotAdvance:le}),Ls({segments:()=>oe(),accent:()=>Ke(),clip:()=>he(),paused:()=>se(),visible:()=>Re()||ze()||se(),onTogglePlay:to,onSeek:Ie})),at=y("div",{class:()=>{const i=N(),v=i?.fill??dt.fill;return B("frame-backdrop",i&&"frame-backdrop--on",i&&v!=="solid"&&`frame-backdrop--${v}`)}},y("div",{class:()=>{const i=$();return B("frame osp:relative osp:w-full",i!=="none"&&`frame--${i}`)}},y("div",{class:"frame-window osp:flex osp:w-full osp:flex-col osp:overflow-hidden osp:bg-white osp:dark:bg-[#18181b]"},ue(()=>$()!=="none",()=>Ps({title:()=>e.title,onReload:()=>Ie(0)})),K)));P(()=>{const i=N(),{style:v}=at;i?(v.setProperty("--wd-backdrop",i.color),v.setProperty("--wd-backdrop-padding",String(i.padding??dt.padding))):(v.removeProperty("--wd-backdrop"),v.removeProperty("--wd-backdrop-padding"))});const it=y("div",{class:()=>B("openshowcase-player osp:relative osp:block osp:leading-[1.45] osp:select-none",g()&&"openshowcase-player--dark"),role:"application",tabindex:"0",onkeydown:i=>{i.key==="ArrowRight"&&le(),i.key==="ArrowLeft"&&et()},onpointermove:rt,onpointerdown:co,onpointerleave:()=>Re(!1)},at);let Ne;return{element:it,start(){nt(),ot(0,-1),Ne=new ResizeObserver(()=>nt()),Ne.observe(K),C.addEventListener("change",Y),u||(w=new IntersectionObserver(i=>{if(i.some(v=>v.intersectionRatio>=_t)){u=!0,w?.disconnect();for(const v of h.splice(0))v()}},{threshold:_t}),w.observe(it))},stop(){ne.pause(),X?.cancel(),U.dispose(),Pe&&URL.revokeObjectURL(Pe),Ne?.disconnect(),w?.disconnect(),C.removeEventListener("change",Y),clearTimeout(Le)},next:le,prev:et,goTo:Ie,setAppearance(i){T(i)},setWrapper(i){_(i)},setBackdrop(i){O(i)},setHotspotStyle(i){U.setStyle(i),tt();const v=D;if(!v||!ce(v)||!v.hotspot)return;const{bgColor:S,textColor:L}=U.colors(v.hotspot);Q(()=>{const I=x.hotspot();I&&x.hotspot({...I,color:S});const H=x.tooltip();H&&x.tooltip({...H,bgColor:S,textColor:L})})},currentIndex:()=>c,currentStep:()=>e.steps[c]}}class on{options;view;unmount;constructor(t){this.options={...t}}mount(){const{container:t,demo:o,assetBaseUrl:s,resolveAsset:n,hotspotStyle:r,appearance:a,wrapper:f,backdrop:p,startWhenVisible:l,onStepChange:d}=this.options;let m;this.unmount=fs(()=>(m=tn({demo:o,assetBaseUrl:s,resolveAsset:n,hotspotStyle:r,appearance:a,wrapper:f,backdrop:p,startWhenVisible:l,onStepChange:d}),m.element),t),this.view=m,m.start()}destroy(){this.view?.stop(),this.unmount?.(),this.view=void 0,this.unmount=void 0}next(){this.view?.next()}prev(){this.view?.prev()}goTo(t){this.view?.goTo(t)}setAppearance(t){this.options.appearance=t,this.view?.setAppearance(t)}setWrapper(t){this.options.wrapper=t,this.view?.setWrapper(t)}setBackdrop(t){this.options.backdrop=t,this.view?.setBackdrop(t)}setHotspotStyle(t){this.options.hotspotStyle=t,this.view?.setHotspotStyle(t)}get currentIndex(){return this.view?.currentIndex()??0}get currentStep(){return this.view?.currentStep()}}function rn({src:e,demo:t,assetBaseUrl:o,aspectRatio:s=16/9,className:n,style:r,hotspotStyle:a,appearance:f,wrapper:p,backdrop:l,startWhenVisible:d,onStepChange:m}){const[c,u]=Z.useState(t?{status:"ready",demo:t,assetBaseUrl:o}:{status:"loading"}),h=Z.useRef(null),b=Z.useRef(void 0),{bgColor:w,textColor:T}=a??{},C=JSON.stringify(l),E=Z.useRef({appearance:f,wrapper:p,backdrop:l,bgColor:w,textColor:T});E.current={appearance:f,wrapper:p,backdrop:l,bgColor:w,textColor:T},Z.useEffect(()=>{if(t)return void u({status:"ready",demo:t,assetBaseUrl:o});if(!e)return void u({status:"error",message:'InteractiveDemo needs either a "src" or a "demo" prop.'});const g=new AbortController;let _;return u({status:"loading"}),es(e,{assetBaseUrl:o,signal:g.signal}).then(({dispose:$,...O})=>{if(g.signal.aborted)return $();_=$,u({status:"ready",...O})}).catch($=>{g.signal.aborted||u({status:"error",message:$ instanceof Error?$.message:"Failed to load demo"})}),()=>{g.abort(),_?.()}},[e,t,o]),Z.useEffect(()=>{if(c.status!=="ready")return;const g=h.current;if(!g)return;const _=new on({container:g,demo:c.demo,assetBaseUrl:c.assetBaseUrl,resolveAsset:c.resolveAsset,hotspotStyle:{bgColor:E.current.bgColor,textColor:E.current.textColor},appearance:E.current.appearance,wrapper:E.current.wrapper,backdrop:E.current.backdrop,startWhenVisible:d,onStepChange:m});return _.mount(),b.current=_,()=>{_.destroy(),b.current=void 0}},[c,d,m]),Z.useEffect(()=>{b.current?.setAppearance(f)},[f]),Z.useEffect(()=>{b.current?.setWrapper(p)},[p]),Z.useEffect(()=>{b.current?.setBackdrop(E.current.backdrop)},[C]),Z.useEffect(()=>{b.current?.setHotspotStyle({bgColor:w,textColor:T})},[w,T]);const Y=c.status==="ready";return me.jsxs("div",{className:n,style:{position:"relative",width:"100%",...r},children:[me.jsx("div",{ref:h,style:{position:"relative"}}),!Y&&me.jsxs("div",{style:{position:"relative",width:"100%",aspectRatio:s},children:[c.status==="loading"&&me.jsx("div",{style:Ct,children:"Loading demo…"}),c.status==="error"&&me.jsx("div",{style:{...Ct,color:"#f87171"},children:c.message})]})]})}const Ct={position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#9ca3af",fontSize:14,fontFamily:"system-ui, sans-serif",background:"#f4f4f5"};export{rn as InteractiveDemo};
