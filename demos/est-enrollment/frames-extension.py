#!/usr/bin/env python3
"""Parche temporal de la extensión de OpenShowcase 0.6.2 para grabar la página
contenedora (view/index.html): el content script solo corre en el marco superior,
así que los clics dentro de los iframes (dashboard y terminal) no generan popups.

Uso: frames-extension.py <extension-1x> <salida>
  <extension-1x>  copia de dist/extension ya parcheada a 1x (ver la skill, "Reach 60 fps").
  <salida>        carpeta nueva; pásala a --extension en inspect/record/export.
Solo para la instalación temporal del recorder; no se usa en el sitio.
"""
import json, shutil, sys
from pathlib import Path

src, dst = Path(sys.argv[1]), Path(sys.argv[2])
shutil.copytree(src, dst)
manifest = json.loads((dst / 'manifest.json').read_text())
manifest['content_scripts'][0]['all_frames'] = True
(dst / 'manifest.json').write_text(json.dumps(manifest, separators=(',', ':')))
path = dst / 'content-scripts' / 'content.js'
text = path.read_text()
old = "main(e){let t=t=>{e.isInvalid||c(`marker`,t).catch(()=>{})},n={},"
if text.count(old) != 1:
    raise SystemExit('content.js cambió: revisa la versión instalada antes de parchear')
new = ("main(e){if(window===window.top)window.addEventListener(`message`,ev=>{let d=ev.data;"
       "if(!d||d.__osr!==1||e.isInvalid)return;for(let f of document.querySelectorAll(`iframe`)){"
       "if(f.contentWindow===ev.source){let r=f.getBoundingClientRect(),m=d.m;if(m.xFrac!=null){"
       "m.xFrac=(r.left+m.xFrac*r.width)/window.innerWidth;m.yFrac=(r.top+m.yFrac*r.height)/window.innerHeight}"
       "m.pageUrl=location.href;c(`marker`,m).catch(()=>{});return}}});"
       "let t=t=>{if(e.isInvalid)return;if(window!==window.top){try{window.parent.postMessage({__osr:1,m:t},`*`)}"
       "catch(_){}return}c(`marker`,t).catch(()=>{})},n={},")
path.write_text(text.replace(old, new))
