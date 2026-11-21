/* Marco común de los portales (Ministro al Día, GORE al Día y Alcalde al Día; una sola versión, en el núcleo): menú vertical (barra inferior en el celular) y efectos sobrios.
   Cada entidad es un portal aparte: dentro de una entidad el menú solo lleva a sus páginas, nunca a otra entidad.
   La lista de entidades sale de /herramientas/pliegos.json (o del archivo que diga portal.json en «entidades»).
   Un portal puede definir sus propias opciones de menú en portal.json («menu»); si no, usa las de los pliegos. Sin librerías. */
(function () {
  'use strict';
  // Identidad del portal: herramientas/portal.js (lo genera insertar_marco.py desde portal.json, propio de cada portal).
  var PORTAL = Object.assign({
    sello: 'M<i>D</i>', nombre: 'Ministro al <i>Día</i>', corto: 'Ministro<br>al <i>Día</i>',
    lema: 'Ejecución presupuestal · Perú', repo: 'MinistroaldIA/MinistroaldIA.github.io',
    elegir: 'Elige la entidad', portada: 'Entidades', quien: 'cada entidad', colores: null
  }, window.MC_PORTAL || {});
  if (PORTAL.colores) Object.keys(PORTAL.colores).forEach(function (k) { document.documentElement.style.setProperty('--mc-' + k, PORTAL.colores[k]); });
  var RAIZ = '/';
  var SIN_MOV = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DEMO = /[?&]demo=cambio\b/.test(location.search);
  var CIFRAS_ANIMADAS = 4;   // solo las cifras principales de cada página entran con un fundido (su valor no cambia)

  /* ---------- Dónde estamos ---------- */
  var partes = location.pathname.split('/').filter(Boolean);
  if (partes[0] === 'index.html') partes = [];
  var ID = partes.length ? partes[0] : null;
  if (ID === 'herramientas' || ID === 'auditoria') return;
  var VISTA = !ID ? 'portada'
    : partes[1] === 'ro' ? 'control'
    : partes[1] === 'prioridades.html' ? 'prioridades'
    : partes[1] === 'anexos.html' ? 'anexos'
    : 'resumen';
  if (PORTAL.menu && ID) {
    // Menú propio: la vista es la opción cuya ruta (sin #) coincide con la página; una página fuera del menú no marca ninguna.
    var sub = partes.slice(1).join('/').replace(/index\.html$/, '').replace(/\/$/, '');
    VISTA = sub ? 'otra' : 'resumen';
    PORTAL.menu.forEach(function (m) {
      var r = (m.ruta || '').replace(/index\.html$/, '').replace(/\/$/, '');
      if (!m.panel && (m.ruta || '').indexOf('#') < 0 && r === sub) VISTA = m.k;
    });
  }

  /* La entrada animada solo se ve en la portada, una vez por sesión. */
  // La entrada animada se ve una vez por sesión, en la primera página (portada o resumen ejecutivo).
  var conIntro = (VISTA === 'portada' || VISTA === 'resumen') && !SIN_MOV && guardado('s', 'mc-intro') !== '1';
  if (conIntro) document.documentElement.classList.add('mc-arranca');

  // Con una sola entidad publicada, la portada lleva directo a su resumen ejecutivo (con varias, muestra la lista).
  var LISTA = fetch(RAIZ + 'herramientas/' + (PORTAL.entidades || 'pliegos.json')).then(function (r) { return r.json(); });
  if (VISTA === 'portada') {
    document.documentElement.classList.add('mc-arranca');
    var destapar = function () { if (!conIntro) document.documentElement.classList.remove('mc-arranca'); };
    var tope = setTimeout(destapar, 1500);   // si la lista tarda, se muestra la portada
    LISTA.then(function (P) {
      var ids = Object.keys(P).filter(function (k) { return P[k].nombre; });
      if (ids.length === 1) { location.replace(RAIZ + ids[0] + '/' + location.hash); return; }
      clearTimeout(tope); destapar();
    }).catch(function () { clearTimeout(tope); destapar(); });
  }

  var ICO = {
    portada: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    resumen: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    prioridades: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    control: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    sede: '<path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/><path d="M12 5V2"/>',
    anexos: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
    descargas: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 21h16"/>',
    mas: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    presupuesto: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/>',
    ingresos: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/><path d="m14 7 3-3 3 3"/>',
    nino: '<path d="M7 15a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 6.5 3.75 3.75 0 0 1 17.5 15H7z"/><path d="M8 18.5 7 21M12 18.5 11 21M16 18.5 15 21"/>',
    ruta: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
    informe: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 17v-3M12 17v-6M15 17v-4"/>'
  };
  // solo: 'e' = solo escritorio, 'c' = solo celular
  var VISTAS = [
    { k: 'portada', t: 'Portada', solo: 'e', url: function () { return RAIZ; } },
    { k: 'resumen', t: 'Resumen ejecutivo', url: function (id) { return RAIZ + id + '/'; } },
    { k: 'prioridades', t: 'Prioridades', url: function (id) { return RAIZ + id + '/prioridades.html'; } },
    { k: 'control', t: 'Control diario', url: function (id) { return RAIZ + id + '/ro/'; } },
    { k: 'sede', t: 'Sede', url: function (id) { return ENT[id] && ENT[id].sede ? RAIZ + id + '/ro/#ue=' + ENT[id].sede : null; } },
    { k: 'anexos', t: 'Anexos', solo: 'e', url: function (id) { return RAIZ + id + '/anexos.html'; } },
    { k: 'descargas', t: 'Descargas', solo: 'e', panel: 'descargas' },
    { k: 'mas', t: 'Más', solo: 'c', panel: 'mas' }
  ];

  if (PORTAL.menu) {
    VISTAS = [VISTAS[0]].concat(PORTAL.menu.map(function (m) {
      return { k: m.k, t: m.t, solo: m.solo, ico: m.ico, panel: m.panel,
               url: m.panel ? null : function (id) { return RAIZ + id + '/' + (m.ruta || ''); } };
    }), [VISTAS[VISTAS.length - 1]]);
  }

  var ENT = {};
  var riel, panel, velo;
  // Nombre corto y tipo de la entidad: sigla y pliego en los pliegos; en las municipalidades, a partir del nombre.
  function corto(e) { return e.sigla || (e.nombre || '').replace(/^Municipalidad (Provincial|Distrital) (del? |de la )?/, ''); }
  function tipo(e) {
    if (e.pliego) return 'Pliego ' + e.pliego;
    var m = (e.nombre || '').match(/^Municipalidad (Provincial|Distrital)/);
    return m ? 'Municipalidad ' + m[1].toLowerCase() : 'Entidad';
  }

  function svg(k) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[k] + '</svg>';
  }
  function guardado(tipo, clave, valor) {
    try {
      var s = tipo === 's' ? sessionStorage : localStorage;
      if (valor === undefined) return s.getItem(clave);
      s.setItem(clave, valor);
    } catch (e) { return null; }
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sedeActual() { var m = location.hash.match(/^#ue=(\w+)$/); return m && ENT[ID] && ENT[ID].sede === m[1]; }

  /* ---------- Menú ---------- */
  function htmlItems() {
    var h = '';
    VISTAS.forEach(function (v, i) {
      var cls = 'mc-item' + (v.solo === 'e' ? ' mc-solo-escritorio' : v.solo === 'c' ? ' mc-solo-celular' : '');
      var li = '<li' + (v.solo === 'e' ? ' class="mc-solo-escritorio"' : v.solo === 'c' ? ' class="mc-solo-celular"' : '') + ' style="animation-delay:' + (120 + i * 45) + 'ms">';
      if (v.panel) { h += li + '<button type="button" class="' + cls + '" data-panel="' + v.panel + '">' + svg(v.ico || v.k) + v.t + '</button></li>'; return; }
      if (v.k === 'portada') return;   // cada entidad ve solo lo suyo: sin salida a la portada ni a otras entidades
      if (v.k === 'portada') { h += li + '<a class="' + cls + '" href="' + RAIZ + '"' + (VISTA === 'portada' ? ' aria-current="page"' : '') + '>' + svg(v.ico || v.k) + v.t + '</a></li>'; return; }
      if (!ID) {   // en la portada todavía no hay entidad
        h += li + '<button type="button" class="' + cls + '" data-panel="entidades" data-destino="' + v.k + '">' + svg(v.ico || v.k) + v.t + '</button></li>';
        return;
      }
      var url = v.url(ID);
      if (!url) return;   // por ejemplo, Sede si la entidad no tiene sede registrada
      var actual = v.k === 'sede' ? (VISTA === 'control' && sedeActual()) : (v.k === VISTA && !(VISTA === 'control' && sedeActual()));
      var titulo = v.k === 'sede' && ENT[ID].siglas_ue ? ' title="' + esc(ENT[ID].siglas_ue[ENT[ID].sede] || 'Sede') + '"' : '';
      h += li + '<a class="' + cls + '" data-k="' + v.k + '" href="' + url + '"' + titulo + (actual ? ' aria-current="page"' : '') + '>' + svg(v.ico || v.k) + v.t + '</a></li>';
    });
    return h;
  }
  function construirRiel() {
    riel = document.createElement('nav');
    riel.className = 'mc-riel';
    riel.setAttribute('aria-label', 'Navegación del portal');
    riel.innerHTML = '<a class="mc-marca" href="' + (ID ? RAIZ + ID + '/' : RAIZ) + '" title="' + PORTAL.nombre.replace(/<[^>]+>/g, '') + '">' +
      '<span class="mc-sello"><b>' + PORTAL.sello + '</b></span><small>' + PORTAL.corto + '</small></a>' +
      '<div class="mc-entidad mc-fija"><small>' + (ID ? '…' : 'Portal') + '</small><span class="mc-entidad-t">' + (ID ? '…' : PORTAL.portada) + '</span></div>' +
      '<ul class="mc-items">' + htmlItems() + '</ul>' +
      '<div class="mc-vivo mc-pausa" title="Cargando el estado de la revisión automática">' +
      '<span class="mc-et"><span class="mc-punto"></span><span class="mc-vivo-t">EN VIVO</span></span>' +
      '<span class="mc-cuenta">--:--</span><span class="mc-cuenta-t">próxima revisión</span></div>';
    document.body.insertBefore(riel, document.body.firstChild);
    document.body.classList.add('mc-con-riel');

    velo = document.createElement('div'); velo.className = 'mc-velo';
    panel = document.createElement('aside'); panel.className = 'mc-panel';
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'Opciones');
    document.body.appendChild(velo); document.body.appendChild(panel);
    riel.addEventListener('click', function (e) {
      var b = e.target.closest('[data-panel]');
      if (b) alternar(b.getAttribute('data-panel'), b.getAttribute('data-destino'));
    });
    velo.addEventListener('click', cerrar);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
    window.addEventListener('hashchange', marcarActual);
  }
  function marcarActual() {
    riel.querySelectorAll('.mc-item[data-k]').forEach(function (a) {
      var k = a.getAttribute('data-k');
      var act = k === 'sede' ? (VISTA === 'control' && sedeActual()) : (k === VISTA && !(VISTA === 'control' && sedeActual()));
      if (act) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  function conEntidades() {
    if (ID) {
      var e = ENT[ID];
      riel.querySelector('.mc-entidad-t').textContent = e ? corto(e) : ID.toUpperCase();
      if (e) riel.querySelector('.mc-entidad small').textContent = tipo(e);
      riel.querySelector('.mc-items').innerHTML = htmlItems();   // agrega «Sede» con el código de pliegos.json
    } else if (Object.keys(ENT).length === 1) {
      // Con una sola entidad publicada, desde la portada se va directo a ella.
      ID = Object.keys(ENT)[0];
      riel.querySelector('.mc-items').innerHTML = htmlItems();
      riel.querySelectorAll('.mc-item[data-k]').forEach(function (a) { a.removeAttribute('aria-current'); });
      ID = null;
    }
    riel.querySelectorAll('.mc-items li').forEach(function (li) { li.style.animation = 'none'; });
  }

  var abierto = null;
  function alternar(tipo, destino) { if (abierto === tipo) cerrar(); else abrir(tipo, destino); }
  function cerrar() {
    if (!abierto) return;
    abierto = null;
    panel.classList.remove('mc-abierto'); velo.classList.remove('mc-abierto');
  }
  function abrir(tipo, destino) {
    abierto = tipo;
    if (tipo === 'entidades') pintarEntidades(destino);
    else if (tipo === 'descargas') pintarDescargas();
    else pintarMas();
    panel.classList.remove('mc-abierto'); void panel.offsetWidth;
    panel.classList.add('mc-abierto'); velo.classList.add('mc-abierto');
    var x = panel.querySelector('.mc-cerrar'); if (x) x.focus({ preventScroll: true });
  }
  function cabecera(t, sub) {
    return '<div class="mc-panel-cab"><div><h2>' + t + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') +
      '</div><button type="button" class="mc-cerrar" aria-label="Cerrar">×</button></div>';
  }
  function escalonar() {
    panel.querySelectorAll('.mc-lista li').forEach(function (li, i) { li.style.animationDelay = (60 + i * 45) + 'ms'; });
    panel.querySelector('.mc-cerrar').addEventListener('click', cerrar);
  }
  function op(url, ic, t, sub, extra) {
    return '<li><a class="mc-op" href="' + url + '"' + (extra || '') + '><span class="mc-ic">' + ic + '</span><span><b>' + t + '</b><small>' + sub + '</small></span></a></li>';
  }
  // Solo en la portada: elegir a qué entidad entrar. Dentro de una entidad no se ofrece ir a otra.
  function pintarEntidades(destino) {
    var v = VISTAS.filter(function (x) { return x.k === destino; })[0] || VISTAS[1];
    panel.innerHTML = cabecera(PORTAL.elegir, 'Para ver su ' + v.t.toLowerCase() + '.') + '<ul class="mc-lista">' +
      Object.keys(ENT).map(function (id) {
        var e = ENT[id], url = v.url ? v.url(id) : RAIZ + id + '/';
        return op(url || RAIZ + id + '/', esc(corto(e).replace(/^GORE\s*/, '').slice(0, 5)), esc(e.nombre), esc(tipo(e)));
      }).join('') + '</ul>';
    escalonar();
  }
  var cacheDescargas = null;
  function listaDescargas(lista) {
    return lista.length ? '<ul class="mc-lista">' + lista.map(function (d) { return op(d.url, d.tipo, esc(d.t), esc(d.sub), ' download'); }).join('') + '</ul>'
      : '<p class="mc-nota">Todavía no hay archivos para descargar.</p>';
  }
  function pintarDescargas() {
    var sigla = ENT[ID] ? corto(ENT[ID]) : ID;
    var poner = function () { panel.innerHTML = cabecera('Descargas', esc(sigla) + ' · archivos del último informe') + listaDescargas(cacheDescargas); escalonar(); };
    if (cacheDescargas) return poner();
    panel.innerHTML = cabecera('Descargas', 'Buscando los archivos…');
    panel.querySelector('.mc-cerrar').addEventListener('click', cerrar);
    var base = RAIZ + ID + '/';
    fetch(base).then(function (r) { return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html'), vistos = {};
      cacheDescargas = Array.prototype.slice.call(doc.querySelectorAll('a[href*="descargas/"], a[download], a[href$=".pdf"], a[href$=".xlsx"]')).map(function (a) {
        var href = a.getAttribute('href'), url = new URL(href, location.origin + base).pathname;
        if (vistos[url]) return null; vistos[url] = 1;
        var sm = a.querySelector('small'), sub = sm ? sm.textContent.trim() : '';
        var ext = (href.split('.').pop() || '').toUpperCase();
        return { url: url, t: a.textContent.replace(sub, '').trim() || href.split('/').pop(), sub: sub || href.split('/').pop(), tipo: ext === 'XLSX' ? 'XLS' : ext };
      }).filter(Boolean);
      if (abierto === 'descargas') poner();
    }).catch(function () { cacheDescargas = []; if (abierto === 'descargas') poner(); });
  }
  function pintarMas() {
    var e = ID && ENT[ID];
    var h = cabecera('Más', e ? esc(e.nombre) : PORTAL.nombre) + '<ul class="mc-lista">';
    if (ID) {
      // Las opciones que en el celular no caben en la barra inferior
      VISTAS.forEach(function (v) {
        if (v.solo === 'e' && v.url && v.k !== 'portada') h += op(v.url(ID), svg(v.ico || v.k), v.t, v.sub || '');
      });
      h += '<li><button type="button" class="mc-op" data-sub="descargas"><span class="mc-ic">' + svg('descargas') + '</span><span><b>Descargas</b><small>Informes y Excel verificable</small></span></button></li>';
    }
    panel.innerHTML = h + '</ul>';
    escalonar();
    var b = panel.querySelector('[data-sub="descargas"]');
    if (b) b.addEventListener('click', function () { abrir('descargas'); });
  }

  /* ---------- EN VIVO: estado real de la revisión automática ---------- */
  function limaAhora() { var d = new Date(); return new Date(d.getTime() + d.getTimezoneOffset() * 60000 - 5 * 3600000); }
  function proximaRevision() {
    var l = limaAhora(), p = new Date(l.getTime());
    p.setSeconds(0, 0);
    if (l.getHours() < 7) p.setHours(7, 23);
    else if (l.getHours() === 23 && l.getMinutes() >= 23) { p.setDate(p.getDate() + 1); p.setHours(7, 23); }
    else { p.setMinutes(23); if (l.getMinutes() >= 23) p.setHours(p.getHours() + 1); }
    return p.getTime() - l.getTime();
  }
  function dos(n) { return (n < 10 ? '0' : '') + n; }
  function iniciarVivo() {
    var caja = riel.querySelector('.mc-vivo'), cuenta = caja.querySelector('.mc-cuenta');
    var tic = function () {
      var s = Math.max(0, Math.round(proximaRevision() / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
      cuenta.textContent = (h ? h + ':' + dos(m) : dos(m)) + ':' + dos(s % 60);
    };
    tic(); setInterval(tic, 1000);
    var quien = ID && ENT[ID] ? corto(ENT[ID]) : PORTAL.quien;
    var HOR = 'Revisa los datos del MEF de ' + quien + ' cada hora, de 7:23 a 23:23 (hora de Lima).';
    var poner = function (modo, titulo) {
      caja.classList.toggle('mc-pausa', modo !== 'vivo' && modo !== 'revisa');
      caja.querySelector('.mc-vivo-t').textContent = modo === 'vivo' ? 'EN VIVO' : modo === 'revisa' ? 'REVISANDO' : 'EN PAUSA';
      caja.querySelector('.mc-cuenta-t').textContent = modo === 'noche' ? 'vuelve a las 7:23' : 'próxima revisión';
      caja.title = titulo;
    };
    if (limaAhora().getHours() < 7) { poner('noche', HOR + ' De noche no hay revisiones.'); return; }
    var leer = function (run) {
      if (!run) { poner('vivo', HOR); return; }
      var hace = (Date.now() - new Date(run.created_at).getTime()) / 3600000;
      var hora = new Date(new Date(run.created_at).getTime() - 5 * 3600000).toISOString().slice(11, 16);
      if (run.status !== 'completed') poner('revisa', HOR + ' Revisión en curso desde las ' + hora + '.');
      else if (run.conclusion !== 'success') poner('pausa', HOR + ' La última revisión (' + hora + ') no terminó bien; se reintenta en la próxima hora.');
      else if (hace > 2.5) poner('pausa', HOR + ' Última revisión a las ' + hora + ', hace más de dos horas (GitHub puede demorar las tareas programadas).');
      else poner('vivo', HOR + ' Última revisión a las ' + hora + ', sin errores.');
    };
    var c = guardado('s', 'mc-run');
    if (c) { try { c = JSON.parse(c); if (Date.now() - c.t < 600000) { leer(c.run); return; } } catch (e) {} }
    fetch('https://api.github.com/repos/' + PORTAL.repo + '/actions/workflows/' + (PORTAL.tarea || 'control-ro.yml') + '/runs?per_page=1&branch=main')
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { var run = j.workflow_runs && j.workflow_runs[0]; guardado('s', 'mc-run', JSON.stringify({ t: Date.now(), run: run })); leer(run); })
      .catch(function () { poner('vivo', HOR + ' No se pudo leer el resultado de la última revisión.'); });
  }

  /* ---------- Las cifras principales entran con un fundido, siempre con su valor real ---------- */
  var RX = /^(S\/\s?)?([−-])?(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(\s?(?:%|M|mil|pts))?$/;
  var vistos = new WeakSet(), animadas = 0;
  function candidatoCifra(el) {
    if (vistos.has(el) || el.children.length || el.closest('.mc-riel,.mc-panel,.mc-intro,script,style,table,select,option,svg')) return null;
    var t = el.textContent.replace(/ /g, ' ').trim();
    if (t.length > 16) return null;
    var m = t.match(RX); if (!m) return null;
    return parseFloat(getComputedStyle(el).fontSize) >= 20 ? m : null;
  }
  // La cifra se muestra siempre con su valor real: solo entra con un fundido breve. Nunca se escribe un número intermedio
  // (una captura de pantalla en ese instante mostraría un dato falso).
  function contar(el) {
    if (SIN_MOV) return;
    el.classList.add('mc-cifra-entra');
    setTimeout(function () { el.classList.remove('mc-cifra-entra'); }, 700);
  }
  var obsVista = 'IntersectionObserver' in window ? new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      if (!en.isIntersecting) return;
      obsVista.unobserve(en.target);
      if (en.target._mcCifra) contar(en.target, en.target._mcCifra);
      if (en.target._mcBarra) en.target.classList.add(en.target._mcBarra);
    });
  }, { threshold: 0.35 }) : null;
  var efectosListos = false;
  function revisar() {
    if (!obsVista || !efectosListos) return;
    document.querySelectorAll('main *, body > header *').forEach(function (el) {
      if (vistos.has(el)) return;
      if (animadas < CIFRAS_ANIMADAS) {
        var m = candidatoCifra(el);
        if (m) { vistos.add(el); animadas++; el._mcCifra = m; obsVista.observe(el); return; }
      }
      var st = el.getAttribute('style') || '';
      if (/width\s*:\s*[\d.]+%/.test(st)) {
        var hgt = el.offsetHeight;
        if (hgt > 1 && hgt <= 18) { vistos.add(el); el._mcBarra = 'mc-llena'; obsVista.observe(el); }
      }
    });
    document.querySelectorAll('main svg rect[rx]').forEach(function (r) {
      if (vistos.has(r)) return; vistos.add(r);
      if ((parseFloat(r.getAttribute('height')) || 0) > 2) {
        r.style.animationDelay = Math.min(600, (parseFloat(r.getAttribute('x')) || 0) / 2) + 'ms';
        r._mcBarra = 'mc-crece'; obsVista.observe(r);
      }
    });
  }

  /* ---------- Lo que cambió desde la última visita ---------- */
  function avisoCambio() {
    if (!ID) return;
    // Dónde está la fecha de corte de cada página (portal.json «cortes»; por defecto, las de los pliegos)
    var C = PORTAL.cortes || { informe: 'estado_informe.json', control: 'ro/datos.json' };
    var esControl = VISTA === 'control' || VISTA === 'dia';
    var url = RAIZ + ID + '/' + (esControl ? C.control : C.informe);
    fetch(url, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (D) {
      var corte = D.corte || '';
      if (!corte) return;
      var clave = 'mc-visto-' + ID + '-' + (esControl ? 'control' : 'informe');
      var antes = DEMO ? '2000-01-01' : guardado('l', clave);
      guardado('l', clave, corte);
      if (!antes || antes === corte) return;
      var f = function (c) { return c.split('-').reverse().join('/'); };
      var caja = document.createElement('div');
      caja.className = 'mc-aviso'; caja.setAttribute('role', 'status');
      caja.innerHTML = '<div>Desde tu última visita hay un <b>corte nuevo</b>: ' + (DEMO ? '' : f(antes) + ' → ') + '<b>' + f(corte) +
        '</b>. Las cifras principales se resaltan un momento.' + (DEMO ? ' <small>(simulación)</small>' : '') + '</div><button type="button" aria-label="Cerrar aviso">×</button>';
      document.body.appendChild(caja);
      caja.querySelector('button').addEventListener('click', function () { caja.remove(); });
      setTimeout(function () { if (caja.isConnected) caja.remove(); }, 9000);
      setTimeout(function () {
        document.querySelectorAll('main *').forEach(function (el) { if (el._mcCifra) el.classList.add('mc-destello'); });
      }, 1300);
    }).catch(function () {});
  }

  /* ---------- Contenido que sube con fundido ---------- */
  function subirContenido() {
    if (SIN_MOV) return;
    var lista = [];
    var cab = document.querySelector('body > header .wrap, body > header .w, body > header');
    if (cab) lista = lista.concat(Array.prototype.slice.call(cab.children).slice(0, 4));
    var sec = document.querySelector('main > section, main > div, main');
    if (sec) lista = lista.concat(Array.prototype.slice.call(sec.children).slice(0, 6));
    lista.forEach(function (el, i) { el.classList.add('mc-sube'); el.style.animationDelay = (i * 70) + 'ms'; });
    setTimeout(function () { lista.forEach(function (el) { el.classList.remove('mc-sube'); el.style.animationDelay = ''; }); }, 1600);
  }

  /* ---------- Entrada (solo portada) ---------- */
  function entrada(listo) {
    if (!conIntro) { listo(); return; }
    guardado('s', 'mc-intro', '1');
    var cap = document.createElement('div');
    cap.className = 'mc-intro'; cap.setAttribute('aria-hidden', 'true');
    cap.innerHTML = '<button type="button" class="mc-saltar">Saltar</button><div class="mc-intro-c">' +
      '<div class="mc-sello"><b>' + PORTAL.sello + '</b></div><h1>' + PORTAL.nombre + '</h1>' +
      '<p>' + PORTAL.lema + '</p><div class="mc-barra"><i></i></div></div>';
    document.body.appendChild(cap);
    document.documentElement.classList.remove('mc-arranca');
    var barra = cap.querySelector('.mc-barra i'), t0 = Date.now(), hecho = false;
    requestAnimationFrame(function () { barra.style.width = '35%'; });
    var fin = function () {
      if (hecho) return; hecho = true;
      barra.style.width = '100%';
      setTimeout(function () { cap.classList.add('mc-sale'); listo(); setTimeout(function () { cap.remove(); }, 500); }, 260);
    };
    cap.querySelector('.mc-saltar').addEventListener('click', fin);
    var alCargar = function () { barra.style.width = '80%'; setTimeout(fin, Math.max(0, 1100 - (Date.now() - t0))); };
    if (document.readyState === 'complete') alCargar(); else window.addEventListener('load', alCargar);
    setTimeout(fin, 2200);
  }

  /* ---------- Arranque ---------- */
  function arrancar() {
    // La portada es una página neutra del portal: no lleva menú ni lista de entidades (con una sola, ya se va a ella).
    if (VISTA !== 'portada') seguir();
  }
  function seguir() {
    construirRiel();
    entrada(function () { efectosListos = true; subirContenido(); revisar(); avisoCambio(); });
    LISTA.then(function (P) {
      Object.keys(P).forEach(function (id) { if (P[id].nombre) ENT[id] = P[id]; });
      conEntidades();
      iniciarVivo();
    }).catch(function () { iniciarVivo(); });
    var pend = null;
    new MutationObserver(function () {
      if (pend) return;
      pend = setTimeout(function () { pend = null; revisar(); }, 200);
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
