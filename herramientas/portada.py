#!/usr/bin/env python3
"""Portada del sitio (alcaldealdia.github.io): página neutra, sin lista de municipalidades (desde el 21/11/2026).
Cada municipalidad entra a su portal con el enlace que se le entregó; el cuadro de mando con todas está fuera del sitio.
La tarea automática la rehace al publicar. Uso: python herramientas/portada.py"""
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))



def pagina(nombre, dia, lema, que, quien, acento, fondo1, fondo2, desc):
    return f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{nombre}{dia}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@700&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono:wght@500&display=swap">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Ccircle cx=%228%22 cy=%228%22 r=%227%22 fill=%22%2313294b%22/%3E%3C/svg%3E">
<style>
:root{{--bg:#f7f6f2;--ink:#1d2433;--muted:#5f6878;--line:#e2ded3;--acento:{acento}}}
*{{box-sizing:border-box}}
body{{margin:0;min-height:100vh;display:flex;flex-direction:column;background:var(--bg);color:var(--ink);font:16px/1.6 "IBM Plex Sans","Segoe UI",Arial,sans-serif}}
header{{background:linear-gradient(135deg,{fondo1} 0%,{fondo2} 100%);color:#fff;padding:64px 18px 70px;position:relative}}
header:after{{content:"";position:absolute;left:0;right:0;bottom:0;height:6px;background:var(--acento)}}
.w{{max-width:860px;margin:0 auto}}
.eb{{font:500 12px "IBM Plex Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--acento)}}
h1{{font:700 clamp(38px,7vw,64px)/1.04 "Source Serif 4",Georgia,serif;margin:10px 0 14px}}
h1 span{{color:var(--acento)}}
header p{{margin:0;max-width:60ch;color:#d6dde8;font-size:18px}}
main{{flex:1;padding:40px 18px}}
.caja{{background:#fff;border:1px solid var(--line);border-radius:14px;padding:22px 24px;display:grid;gap:10px}}
.caja h2{{margin:0;font:600 19px/1.3 "IBM Plex Sans",sans-serif}}
.caja p{{margin:0;color:var(--muted)}}
footer{{padding:20px 18px;color:var(--muted);font-size:13px;border-top:1px solid var(--line)}}
</style>
</head><body>
<header><div class="w"><div class="eb">{lema}</div><h1>{nombre}<span>{dia}</span></h1><p>{que}</p></div></header>
<main><div class="w"><div class="caja"><h2>Acceso a su portal</h2><p>Cada {quien} tiene su propio portal y entra con el enlace que se le entregó. Si no lo tiene, solicítelo a quien le presta el servicio.</p></div></div></main>
<footer><div class="w">{nombre}{dia} · Plataforma independiente, no es un sitio oficial. Información pública del Estado peruano (MEF).</div></footer>
</body></html>
"""


ALCALDE = dict(nombre="Alcalde al ", dia="Día", lema="Análisis presupuestal municipal · Perú",
               que="Qué recibe la próxima gestión municipal: presupuesto, deuda, obras y riesgos, con datos públicos del MEF y una ruta para los primeros 30 días.",
               quien="municipalidad", acento="#e0a83c", fondo1="#0d1d36", fondo2="#1f3d6b",
               desc="Análisis presupuestal municipal con datos públicos del MEF.")

if __name__ == "__main__":
    with open(os.path.join(RAIZ, "index.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(pagina(**ALCALDE))
    print("portada neutra escrita")
