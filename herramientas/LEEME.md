# Actualización automática de los portales municipales

La tarea `.github/workflows/actualizar-municipal.yml` revisa cada hora (de 7:23 a 23:23, hora de Lima) si el MEF
publicó un archivo diario de gasto nuevo en Datos Abiertos. Solo entonces descarga los datos, regenera el portal,
lo verifica y lo publica. Si algo falla, se conserva la última versión válida.

- **Qué entidades:** `herramientas/municipios.json` («automatico»: true).
- **Portal completo:** se publica solo si la verificación está limpia y las lecturas siguen aprobadas (si solo
  cambiaron cifras y no palabras, siguen aprobadas).
- **Solo el día por día:** si una lectura cambió de redacción, se publica únicamente `<entidad>/dia/` y el motivo
  queda en `<entidad>/dia/estado_portal.json` hasta que se aprueben las lecturas.
- **A pedido:** pestaña *Actions* → *Actualizar portales municipales* → *Run workflow* (opción «forzar» y entidad).

## Configuración (una sola vez)

La tarea necesita leer el núcleo privado `AlcaldealdIA/kronos-nucleo`. Se le da un acceso de solo lectura:

1. En GitHub (cuenta AlcaldealdIA): *Settings* → *Developer settings* → *Personal access tokens* → *Fine-grained tokens* →
   *Generate new token*. Nombre: «portales municipales». Vencimiento: el que prefiera. *Repository access*: «Only select
   repositories» → `kronos-nucleo`. *Permissions* → *Repository permissions* → *Contents*: **Read-only**. Generar y copiar.
2. En este repositorio (`AlcaldealdIA.github.io`): *Settings* → *Secrets and variables* → *Actions* → *New repository secret*.
   Nombre: `KRONOS_TOKEN`. Valor: el token copiado. Guardar.
3. *Actions* → *Actualizar portales municipales* → *Run workflow*: la primera corrida debe terminar en verde.

(Alternativa: una clave SSH de despliegue de solo lectura en kronos-nucleo, guardada aquí como `KRONOS_DEPLOY_KEY`.)
