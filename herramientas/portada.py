#!/usr/bin/env python3
"""Portada del sitio (alcaldealdia.github.io): una tarjeta por municipalidad de herramientas/municipios.json.
Lee de cada portal publicado su fecha de datos y las cifras del día por día (si existe). La tarea automática la rehace
al publicar. Uso: python herramientas/portada.py"""
import html
import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
E = html.escape
MUN = json.load(open(os.path.join(AQUI, "municipios.json"), encoding="utf-8"))
F = lambda s: "/".join(reversed(s[:10].split("-"))) if s else "—"
M = lambda v: f"S/ {v/1e6:,.1f} M"


def tarjeta(k, v):
    slug = v.get("slug", k)
    if not os.path.isfile(os.path.join(RAIZ, slug, "index.html")):
        return ""
    dj = os.path.join(RAIZ, slug, "dia", "datos.json")
    D = json.load(open(dj, encoding="utf-8")) if os.path.isfile(dj) else None
    if D:
        T, S = D["total"], D["semana"]
        cif = (f'<div class="c3"><div><span>Presupuesto {D["anio"]}</span><b>{M(T["pim"])}</b></div><div><span>Gastado</span><b>{100*T["ejec"]:.1f} %</b></div>'
               f'<div><span>Obras sin gasto en {E(D["mes"])}</span><b>{len(D["obras_sin_gasto"])}</b></div></div>'
               f'<p class="dato">Datos al {F(D["corte"])}</p>')
        dia = f'<a class="b2" href="{slug}/dia/">Día por día</a>'
    else:
        cif, dia = '<p class="dato">Portal en actualización</p>', ""
    return (f'<article class="m"><h2>{E(v["nombre"])}</h2>{cif}<div class="acc"><a class="b1" href="{slug}/">Ver el portal</a>{dia}</div></article>')


cards = "".join(tarjeta(k, v) for k, v in MUN.items())
PAG = f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Alcalde al Día · análisis presupuestal municipal</title>
<meta name="description" content="Qué recibe la próxima gestión, sus riesgos y qué hacer: análisis presupuestal municipal con datos públicos del MEF.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@700&family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
:root{{--bg:#faf8f3;--ink:#1d2433;--muted:#5f6878;--line:#e3dccd;--navy:#13294b;--gold:#d7a03a;--turq:#19c39c}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 "IBM Plex Sans","Segoe UI",Arial,sans-serif}}
.wrap{{max-width:1080px;margin:0 auto;padding:0 18px}}
header{{background:var(--navy);color:#f3efe6;border-bottom:4px solid var(--gold);padding:34px 0 28px}}
.eb{{font:500 12px "IBM Plex Mono",monospace;letter-spacing:.09em;text-transform:uppercase;color:var(--gold)}}
h1{{font:700 clamp(28px,4.4vw,42px)/1.1 "Source Serif 4",Georgia,serif;margin:8px 0 8px}}
header p{{margin:0;color:#cfd6e2;max-width:62ch}}
main{{padding:26px 0 10px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:16px}}
.m{{background:#fff;border:1px solid var(--line);border-top:4px solid var(--navy);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;gap:10px}}
.m h2{{margin:0;font:700 19px/1.25 "IBM Plex Sans",sans-serif;color:var(--navy)}}
.c3{{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}}.c3 div{{background:#f3f5f9;border-radius:10px;padding:8px 10px}}
.c3 span{{display:block;font-size:12px;color:var(--muted);line-height:1.3}}.c3 b{{font:700 17px "IBM Plex Sans",sans-serif;color:var(--navy);white-space:nowrap}}
.dato{{margin:0;font:500 12.5px "IBM Plex Mono",monospace;color:var(--muted)}}
.acc{{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto}}
.acc a{{text-decoration:none;font-weight:700;border-radius:10px;padding:10px 16px;min-height:44px;display:inline-flex;align-items:center}}
.b1{{background:var(--navy);color:#fff}}.b2{{background:#e3f4ef;color:#0b5e4a;border:1px solid var(--turq)}}
footer{{border-top:1px solid var(--line);margin-top:30px;padding:18px 0 40px;color:var(--muted);font-size:13px}}
@media (max-width:420px){{.c3{{grid-template-columns:1fr 1fr}}}}
</style></head><body>
<header><div class="wrap"><div class="eb">Alcalde al Día · plataforma independiente</div>
<h1>Qué recibe la próxima gestión municipal</h1>
<p>Presupuesto, deuda, obras y riesgos de cada municipalidad, con datos públicos del MEF y una ruta para los primeros 30 días.</p></div></header>
<main><div class="wrap"><div class="grid">{cards}</div></div></main>
<footer><div class="wrap">Plataforma independiente; no es un sitio oficial de ninguna municipalidad. Fuente: MEF, Datos Abiertos. Panta Quiroga Corporativo E.I.R.L. · KRONOS · 997 817 252.</div></footer>
</body></html>
"""
open(os.path.join(RAIZ, "index.html"), "w", encoding="utf-8").write(PAG)
print("portada:", PAG.count('class="m"'), "municipalidades")
