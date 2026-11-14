#!/usr/bin/env python3
"""Revisa, sin descargar datos, si el MEF publicó un archivo diario de gasto nuevo (solo la cabecera Last-Modified).

Uso:  python herramientas/vigilar_municipal.py [--forzar] [entidad]
      python herramientas/vigilar_municipal.py --guardar "LAST-MODIFIED"
Escribe en GITHUB_OUTPUT: novedad (true/false), entidades (lista separada por espacios), anio, publicado y motivo.
Si nada cambió pero la última actualización tiene más de 24 horas, actualiza igual (red de seguridad).
Las entidades salen de herramientas/municipios.json («automatico»: true). El año que se descarga es el ejercicio
configurado de cada entidad («anio»), no el año del calendario: en enero se sigue leyendo el archivo del año que cerró
hasta que se configure el nuevo ejercicio. Si no se puede consultar al MEF, la tarea termina con error (la página dice
«No se pudo verificar si hay datos más recientes», no «sin novedades»).
"""
import datetime as dt
import json
import os
import sys
from email.utils import parsedate_to_datetime

AQUI = os.path.dirname(os.path.abspath(__file__))
EST = os.path.join(AQUI, "estado_municipal.json")
MUN = json.load(open(os.path.join(AQUI, "municipios.json"), encoding="utf-8"))
LIMA = dt.timezone(dt.timedelta(hours=-5))
DA_URL = "https://fs.datosabiertos.mef.gob.pe/datastorefiles/{anio}-Gasto-Diario.csv"
UA = {"User-Agent": "Mozilla/5.0 (portal presupuestal municipal)"}


def salida(**kw):
    f = os.environ.get("GITHUB_OUTPUT")
    for k, v in kw.items():
        print(f"{k}={v}")
        if f:
            open(f, "a", encoding="utf-8").write(f"{k}={v}\n")


def main():
    a = sys.argv[1:]
    est = json.load(open(EST, encoding="utf-8")) if os.path.isfile(EST) else {}
    if "--guardar" in a:
        est.update(gasto_publicado=a[a.index("--guardar") + 1], actualizado=dt.datetime.now(LIMA).isoformat(timespec="minutes"))
        json.dump(est, open(EST, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        return
    pedidas = [x for x in a if not x.startswith("--") and x.strip()]
    malas = [x for x in pedidas if x not in MUN]               # la entidad pedida llega como dato: solo claves conocidas
    if malas:
        print(f"::error::Entidad desconocida: {malas}. Válidas: {list(MUN)}")
        sys.exit(1)
    ents = pedidas or [k for k, v in MUN.items() if v.get("automatico")]
    anios = sorted({int(MUN[e].get("anio", dt.datetime.now(LIMA).year)) for e in ents})
    if len(anios) > 1:
        print(f"::error::Las entidades pedidas tienen ejercicios distintos ({anios}); actualícelas por separado.")
        sys.exit(1)
    ANIO = anios[0] if anios else dt.datetime.now(LIMA).year
    import requests
    try:
        r = requests.head(DA_URL.format(anio=ANIO), timeout=60, headers=UA, allow_redirects=True)
        r.raise_for_status()
        pub = r.headers.get("Last-Modified")
        if not pub:
            raise ValueError("el archivo no informa su fecha de publicación")
    except Exception as e:
        salida(novedad="false", entidades="", anio=ANIO, publicado="", motivo=f"no se pudo consultar el MEF: {str(e)[:200]}")
        print(f"::error::No se pudo verificar si el MEF publicó datos nuevos ({str(e)[:200]}); no se afirma que no haya novedades.")
        sys.exit(1)
    motivo = ""
    if "--forzar" in a:
        motivo = "actualización a pedido"
    elif pub and pub != est.get("gasto_publicado"):
        try:
            nuevo = not est.get("gasto_publicado") or parsedate_to_datetime(pub) > parsedate_to_datetime(est["gasto_publicado"])
        except Exception:
            nuevo = True
        motivo = f"Datos Abiertos publicó {pub} (antes {est.get('gasto_publicado') or 'sin registro'})" if nuevo else ""
    if not motivo and est.get("actualizado"):
        h = (dt.datetime.now(LIMA) - dt.datetime.fromisoformat(est["actualizado"])).total_seconds() / 3600
        if h >= 24:
            motivo = f"red de seguridad: {h:.0f} horas sin actualizar"
    salida(novedad="true" if motivo and ents else "false", entidades=" ".join(ents), anio=ANIO, publicado=pub or "", motivo=motivo or "sin novedades del MEF")


if __name__ == "__main__":
    main()
