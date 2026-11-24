#!/usr/bin/env python3
"""Apply the demo-only presentation and connection settings to SSH Easy."""
from pathlib import Path
import sys

path = Path(sys.argv[1])
html = path.read_text()
old = '    handleConnectFromQuery();'
new = '''    initConnection(term.rows, term.cols, "terminal", 22, "demo",
      "lamassu-demo-only", "", false, true, false);'''
if html.count(old) != 1:
    raise SystemExit('Unexpected SSH Easy version: connection hook not found')
html = html.replace(old, new)
terminal = "        term = new Terminal();"
if html.count(terminal) != 1:
    raise SystemExit('Unexpected SSH Easy version: terminal initialization not found')
html = html.replace(terminal, """        term = new Terminal({
          fontFamily: '"JetBrains Mono", "Cascadia Code", "Fira Code", monospace',
          fontSize: 14,
          lineHeight: 1.4,
          fontWeight: '400',
          fontWeightBold: '700',
          cursorBlink: true,
          cursorStyle: 'bar',
          cursorWidth: 2,
          allowTransparency: true,
          theme: {
            background: 'rgba(0,0,0,0)', foreground: '#c3d3d9',
            cursor: '#9fd6e6', cursorAccent: '#000',
            selectionBackground: 'rgba(111,177,214,0.28)',
            black: '#000', red: '#e58a8a', green: '#8fd5a6',
            yellow: '#e6cf97', blue: '#6fb1d6', magenta: '#b79ae0',
            cyan: '#74c3d4', white: '#c3d3d9',
            brightBlack: '#5d7480', brightRed: '#f2a5a5',
            brightGreen: '#a9e6bd', brightYellow: '#f3deae',
            brightBlue: '#8cc4e6', brightMagenta: '#cbb5ee',
            brightCyan: '#97dbe9', brightWhite: '#eef6f8'
          }
        });
        term.onTitleChange(function (t) {
          var el = document.getElementById('tabTitle');
          if (el) el.textContent = t;
        });
        // Ajuste de línea (wrap): activado = las columnas siguen al ancho de la ventana;
        // desactivado = ancho mínimo fijo y scroll horizontal.
        window.NOWRAP_COLS = 200;
        try { window.__wrapLines = localStorage.getItem('lamassuWrap') !== '0'; } catch (e) { window.__wrapLines = true; }
        function paintWrapState() {
          var on = window.__wrapLines !== false;
          var t = document.getElementById('terminal');
          if (t) t.classList.toggle('nowrap', !on);
          var b = document.getElementById('wrapBtn');
          if (b) { b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
        }
        window.toggleWrap = function () {
          window.__wrapLines = window.__wrapLines === false;
          try { localStorage.setItem('lamassuWrap', window.__wrapLines ? '1' : '0'); } catch (e) {}
          paintWrapState();
          if (typeof fitAddon !== 'undefined' && fitAddon) fitAddon.fit();
          if (typeof changeWindowSize === 'function') changeWindowSize(term.rows, term.cols);
          term.focus();
        };
        document.addEventListener('DOMContentLoaded', paintWrapState);
        paintWrapState();
        // Portapapeles: Ctrl+V pega (en vez de enviar ^V a la shell) y Ctrl+C copia
        // cuando hay texto seleccionado; sin selección sigue interrumpiendo (^C).
        function copySelection() {
          var text = term.getSelection();
          if (!text) return false;
          var fallback = function () {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
            term.focus();
          };
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).catch(fallback);
          } else {
            fallback();
          }
          return true;
        }
        term.attachCustomKeyEventHandler(function (ev) {
          if (ev.type === 'keydown' && ev.altKey && !ev.ctrlKey && !ev.metaKey && ev.key.toLowerCase() === 'z') {
            ev.preventDefault(); window.toggleWrap(); return false;
          }
          if (ev.type !== 'keydown' || !(ev.ctrlKey || ev.metaKey) || ev.altKey) return true;
          var k = ev.key.toLowerCase();
          if (k === 'v') return false; // deja pasar el evento "paste" del navegador
          if (k === 'c' && (ev.shiftKey || term.hasSelection())) {
            if (copySelection()) { ev.preventDefault(); return false; }
          }
          return true;
        });
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(function () {
            term.options.fontFamily = term.options.fontFamily; // vuelve a medir la fuente
            if (typeof fitAddon !== 'undefined') fitAddon.fit();
          });
        }""")
fit_old = "        fitAddon = new FitAddon.FitAddon(); // Initialize the shared fitAddon"
if html.count(fit_old) != 1:
    raise SystemExit('Unexpected SSH Easy version: fit addon initialization not found')
html = html.replace(fit_old, fit_old + """
        (function () {
          var origFit = fitAddon.fit.bind(fitAddon);
          fitAddon.fit = function () {
            if (window.__wrapLines !== false) return origFit();
            var d = fitAddon.proposeDimensions();
            if (!d || isNaN(d.cols) || isNaN(d.rows)) return;
            var cols = Math.max(d.cols, window.NOWRAP_COLS || 200);
            if (term.rows !== d.rows || term.cols !== cols) term.resize(cols, d.rows);
          };
        })();""")
start = html.index("        term.write('SSH to your machine")
end = html.index('        fitAddon.fit();', start)
html = html[:start] + html[end:]
style = '''
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap">
    <style>
      html, body, body > .container-fluid { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background: #000; }
      body > .container-fluid { display: flex; flex-direction: column; }
      #conPan, #footerRow, #fileBrowserRow, #termContainer > .row + .row { display: none !important; }
      #headerRow { display: none !important; }
      #mainContentArea {
        flex: 1 1 0 !important; min-width: 0; min-height: 0; width: auto; height: auto !important;
        display: flex; flex-direction: column; overflow: hidden;
        background: #000;
      }
      #tabBar {
        position: relative; flex: none; height: 48px; display: flex; align-items: stretch;
        border-bottom: 1px solid rgba(255,255,255,.12); color: #b9c8ce;
        font: 400 15px/1 "JetBrains Mono", monospace; user-select: none;
      }
      #tabBar .lights { display: flex; align-items: center; gap: 8px; padding: 0 12px 0 16px; }
      #tabBar .lights i { width: 13px; height: 13px; border-radius: 50%; display: block; }
      #tabBar .tab { position: relative; display: flex; align-items: center; justify-content: center; flex: 0 1 266px; min-width: 0; margin-left: 4px; color: #d3e0e4; }
      #tabBar .tab::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 3px; background: #2c6577; }
      #tabBar .tabAdd { width: 52px; display: flex; align-items: center; justify-content: center; font-size: 26px; opacity: .75; }
      #tabBar .spacer { flex: 1; }
      #tabBar .right { display: flex; align-items: center; gap: 22px; padding-right: 20px; opacity: .7; }
      #tabBar .tbtn { display: flex; align-items: center; justify-content: center; cursor: pointer; color: inherit; }
      #tabBar .tbtn:hover { opacity: 1; }
      #wrapBtn { padding: 6px; margin: -6px; border-radius: 6px; }
      #wrapBtn.active { color: #19a7e8; opacity: 1; }
      #tabTitle { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      #termContainer { flex: 1 1 0 !important; min-height: 0; height: auto; width: 100%; }
      #termContainer > .row { margin: 0; padding: 0; }
      #terminal { padding: 6px 28px 14px; }
      .xterm { height: 100%; padding: 0; }
      #terminal.nowrap { overflow-x: auto; overflow-y: hidden; }
      #terminal.nowrap .xterm { flex: none; width: max-content; min-width: 100%; }
      #terminal.nowrap::-webkit-scrollbar { height: 8px; }
      #terminal.nowrap::-webkit-scrollbar-track { background: transparent; }
      #terminal.nowrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,.18); border-radius: 4px; }
      .xterm .xterm-viewport { background-color: transparent !important; }
      .xterm-viewport::-webkit-scrollbar { width: 8px; }
      .xterm-viewport::-webkit-scrollbar-button { display: none; }
      .xterm-viewport::-webkit-scrollbar-track { background: transparent; }
      .xterm-viewport::-webkit-scrollbar-thumb { background: rgba(255,255,255,.18); border-radius: 4px; }
    </style>
'''
html = html.replace('</head>', style + '</head>', 1)
main = '<div id="mainContentArea">'
if html.count(main) != 1:
    raise SystemExit('Unexpected SSH Easy version: main content area not found')
svg = lambda body: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>'
tabs = '''<div id="mainContentArea">
        <div id="tabBar">
          <div class="lights"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></div>
          <div class="tab"><span id="tabTitle">~</span></div>
          <div class="tabAdd">+</div>
          <div class="spacer"></div>
          <div class="right"><div id="wrapBtn" class="tbtn" role="button" tabindex="-1" title="Ajuste de línea (Alt+Z)" aria-pressed="true" onmousedown="event.preventDefault()" onclick="window.toggleWrap()">''' + svg('<path d="M3 6h18M3 12h14a3 3 0 0 1 0 6h-4m0 0 2.500-2.500M13 18l2.500 2.500M3 18h5"/>') + '''</div>''' + svg('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>') + svg('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.800 1-2.500A6 6 0 0 0 12 3z"/>') + svg('<circle cx="12" cy="12" r="3"/><path d="M19.400 15a1.700 1.700 0 0 0 .3 1.800l.1.100a2 2 0 1 1-2.800 2.800l-.1-.1a1.700 1.700 0 0 0-1.800-.3 1.700 1.700 0 0 0-1 1.500V21a2 2 0 1 1-4 0v-.1a1.700 1.700 0 0 0-1.100-1.500 1.700 1.700 0 0 0-1.800.3l-.1.100a2 2 0 1 1-2.800-2.800l.1-.1a1.700 1.700 0 0 0 .3-1.800 1.700 1.700 0 0 0-1.500-1H3a2 2 0 1 1 0-4h.1a1.700 1.700 0 0 0 1.500-1.100 1.700 1.700 0 0 0-.3-1.800l-.1-.1a2 2 0 1 1 2.800-2.800l.1.100a1.700 1.700 0 0 0 1.800.3H9a1.700 1.700 0 0 0 1-1.500V3a2 2 0 1 1 4 0v.1a1.700 1.700 0 0 0 1 1.500 1.700 1.700 0 0 0 1.800-.3l.1-.1a2 2 0 1 1 2.800 2.800l-.1.100a1.700 1.700 0 0 0-.3 1.800V9a1.700 1.700 0 0 0 1.500 1H21a2 2 0 1 1 0 4h-.1a1.700 1.700 0 0 0-1.500 1z"/>') + '''</div>
        </div>'''
html = html.replace(main, tabs, 1)
path.write_text(html)
