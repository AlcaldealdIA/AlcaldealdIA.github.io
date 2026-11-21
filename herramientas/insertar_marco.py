#!/usr/bin/env python3
"""Herramienta común de los portales de pliegos (Ministro al Día y GORE al Día).

Agrega el marco común (menú y efectos: herramientas/marco.css, portal.js y marco.js) a las páginas de una entidad y a la
portada, genera herramientas/portal.js desde herramientas/portal.json (identidad propia de cada portal) y agrega la vista
previa al compartir (imagen herramientas/compartir.png, título y descripción de cada página).

Uso: python herramientas/insertar_marco.py <id>
Las páginas del informe las genera el núcleo y se reemplazan en cada actualización; esta herramienta vuelve a poner esas
líneas en su <head>. Si una página ya las tiene, no la toca; si tiene la línea anterior del marco (sin portal.js), la
reemplaza. Se puede correr las veces que haga falta.
"""
import glob
import html
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIEJA = '<link rel="stylesheet" href="/herramientas/marco.css"><script src="/herramientas/marco.js"></script>'
LINEA = ('<link rel="stylesheet" href="/herramientas/marco.css"><script src="/herramientas/portal.js"></script>'
         '<script src="/herramientas/marco.js"></script>')


def escribir(ruta, texto):
    with open(ruta, "w", encoding="utf-8", newline="\n") as f:
        f.write(texto)


# portal.js: identidad del portal para el menú (nombre, sello, colores, repositorio), desde portal.json
P = {}
fp = os.path.join(RAIZ, "herramientas", "portal.json")
if os.path.isfile(fp):
    P = json.load(open(fp, encoding="utf-8"))
    js = "window.MC_PORTAL = " + json.dumps({k: v for k, v in P.items() if k != "commit"}, ensure_ascii=False) + ";\n"
    fj = os.path.join(RAIZ, "herramientas", "portal.js")
    if not os.path.isfile(fj) or open(fj, encoding="utf-8").read() != js:
        escribir(fj, js)
        print("portal.js actualizado")

URL = P.get("url", "").rstrip("/")
SITIO = re.sub(r"<[^>]+>", "", P.get("nombre", ""))


def punto(s):
    """Dónde insertar en el <head>: antes de </head>; si la página no lo cierra (es opcional en HTML), antes de <body> o, si tampoco está, después de <title>."""
    m = re.search(r"</head\s*>", s, re.I) or re.search(r"<body[\s>]", s, re.I)
    if m:
        return m.start()
    t = re.search(r"</title\s*>", s, re.I)   # sin </head> ni <body> (ambos opcionales): justo después del título
    return t.end() if t else -1


def _esc(x):
    return html.escape(html.unescape(x or ""), quote=True)


def vista_previa(s, ruta):
    """Etiquetas para la vista previa al compartir (WhatsApp, redes). Necesita "url" en portal.json y compartir.png."""
    if not URL or 'property="og:image"' in s or not os.path.isfile(os.path.join(RAIZ, "herramientas", "compartir.png")):
        return s
    t = re.search(r"<title>(.*?)</title>", s, re.S)
    dsc = re.search(r'<meta name="description" content="([^"]*)"', s)
    rel = os.path.relpath(ruta, RAIZ).replace(os.sep, "/")
    rel = "" if rel == "index.html" else re.sub(r"index\.html$", "", rel)
    meta = ('<meta property="og:type" content="website">'
            f'<meta property="og:site_name" content="{_esc(SITIO)}">'
            f'<meta property="og:title" content="{_esc(t.group(1).strip() if t else SITIO)}">'
            f'<meta property="og:description" content="{_esc(dsc.group(1) if dsc else "")}">'
            f'<meta property="og:url" content="{URL}/{rel}">'
            f'<meta property="og:image" content="{URL}/herramientas/compartir.png">'
            '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
            '<meta property="og:locale" content="es_PE"><meta name="twitter:card" content="summary_large_image">\n')
    i = punto(s)
    return s if i < 0 else s[:i] + meta + s[i:]


eid = sys.argv[1] if len(sys.argv) > 1 else ""
if not eid or not os.path.isdir(os.path.join(RAIZ, eid)):
    sys.exit(f"Entidad desconocida: «{eid}»")
# Todas las páginas de la entidad, en cualquier subcarpeta (ro/, dia/, reportes/, informe/…), y la portada.
paginas = [os.path.join(RAIZ, "index.html")] + sorted(glob.glob(os.path.join(RAIZ, eid, "**", "*.html"), recursive=True))
for p in paginas:
    if not os.path.isfile(p):
        continue
    s0 = open(p, encoding="utf-8").read()
    s = vista_previa(s0, p)
    if LINEA not in s:
        if VIEJA in s:
            s = s.replace(VIEJA, LINEA)
        else:
            i = punto(s)
            if i < 0:
                print(f"sin <head>, no se cambia: {os.path.relpath(p, RAIZ)}")
                continue
            s = s[:i] + LINEA + "\n" + s[i:]
    if s != s0:
        escribir(p, s)
        print(f"marco y vista previa al día: {os.path.relpath(p, RAIZ)}")
