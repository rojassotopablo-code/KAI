// Servidor de KAI (Cloudflare Worker).
// Cada 5 minutos lee tus datos sincronizados (repositorio privado kai-datos) y envía notificaciones:
// recordatorios de eventos, rutinas (resumen diario, informes, alertas de KPIs) y prueba de notificaciones.
// No guarda datos propios: todo vive en tu repositorio. Secretos: GH_TOKEN, GH_REPO.
import { sendPush } from './webpush.js';

const TZ = 'America/Santiago';
const DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
const FREQ = {diaria:1, semanal:7, mensual:30, trimestral:91, anual:365};

/* ---------- GitHub (repositorio privado de datos) ---------- */
function gh(env, path, opts = {}){
  return fetch(`https://api.github.com/repos/${env.GH_REPO}/contents/${path}`, {
    ...opts,
    headers:{'Authorization':'Bearer ' + env.GH_TOKEN, 'Accept':opts.raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json', 'X-GitHub-Api-Version':'2022-11-28', 'User-Agent':'kai-servidor', ...(opts.body ? {'Content-Type':'application/json'} : {})}
  });
}
async function readJSON(env, path){
  const r = await gh(env, path, {raw:true});
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub ${r.status} al leer ${path}`);
  return JSON.parse(await r.text());
}
const b64 = s => { const b = new TextEncoder().encode(s); let bin = ''; for (let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(bin); };
async function writeJSON(env, path, data, message){
  for (let i = 0; i < 3; i++){
    const cur = await gh(env, path);
    const sha = cur.ok ? (await cur.json()).sha : undefined;
    const r = await gh(env, path, {method:'PUT', body:JSON.stringify({message, content:b64(JSON.stringify(data, null, 1)), ...(sha ? {sha} : {})})});
    if (r.ok) return true;
    if (r.status !== 409 && r.status !== 422) throw new Error(`GitHub ${r.status} al guardar ${path}`);
  }
  return false;
}

/* ---------- Fecha y hora de Chile ---------- */
export function ahoraChile(d = new Date()){
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone:TZ, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', weekday:'short', hourCycle:'h23'}).formatToParts(d).map(x => [x.type, x.value]));
  const fecha = `${p.year}-${p.month}-${p.day}`, hm = `${p.hour}:${p.minute}`;
  const dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday);
  return {fecha, hm, min:+p.hour * 60 + +p.minute, dia:DIAS[dow]};
}
const toMin = hm => { const m = String(hm || '').match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const fmtFecha = iso => { const [y, m, d] = iso.split('-'); return `${+d}/${+m}`; };

/* ---------- Contenido de las notificaciones ---------- */
export function resumenDelDia(stores, hoy){
  const ev = (stores.eventos || []).filter(e => e.fecha === hoy).sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''));
  const venc = [], hoyT = [];
  for (const p of stores.proyectos || []){
    if ((p.estado || 'activo') !== 'activo') continue;
    for (const t of p.tareas || []){ if (t.hecha || !t.fecha) continue; if (t.fecha < hoy) venc.push(t.texto); else if (t.fecha === hoy) hoyT.push(t.texto); }
  }
  const kp = kpisPendientes(stores, hoy);
  const partes = [];
  if (ev.length) partes.push(`Agenda: ${ev.slice(0, 4).map(e => (e.hora_inicio ? e.hora_inicio + ' ' : '') + e.titulo).join(' · ')}`);
  if (venc.length) partes.push(`${venc.length} tarea${venc.length > 1 ? 's' : ''} vencida${venc.length > 1 ? 's' : ''}: ${venc.slice(0, 3).join(', ')}`);
  if (hoyT.length) partes.push(`Para hoy: ${hoyT.slice(0, 3).join(', ')}`);
  if (kp.length) partes.push(`KPIs por registrar: ${kp.slice(0, 3).join(', ')}`);
  return partes.length ? partes.join('\n') : 'Día despejado: sin eventos, tareas vencidas ni pendientes.';
}
export function kpisPendientes(stores, hoy){
  const regs = stores.kpireg || [];
  return (stores.kpis || []).filter(k => {
    const last = regs.filter(r => r.kpi === k.id).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    if (!last) return true;
    const dias = Math.round((new Date(hoy + 'T12:00:00Z') - new Date(last.fecha + 'T12:00:00Z')) / 864e5);
    return FREQ[k.frecuencia] && dias >= FREQ[k.frecuencia];
  }).map(k => k.nombre);
}
export function kpisEnRojo(stores){
  const regs = stores.kpireg || [];
  return (stores.kpis || []).filter(k => {
    if (k.meta === '' || k.meta === null || k.meta === undefined || !isFinite(+k.meta)) return false;
    const last = regs.filter(r => r.kpi === k.id).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    if (!last) return false;
    return k.sentido === 'menor' ? +last.valor > +k.meta : +last.valor < +k.meta;
  }).map(k => {
    const last = regs.filter(r => r.kpi === k.id).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    return `${k.nombre}: ${last.valor}${k.unidad && k.unidad !== '$' ? ' ' + k.unidad : ''} (meta ${k.sentido === 'menor' ? '≤' : '≥'} ${k.meta})`;
  });
}

/* ---------- Qué toca avisar ahora ---------- */
// Devuelve notificaciones pendientes y el estado actualizado (para no repetir avisos)
export function planificar(datos, config, estado, now = new Date()){
  const {fecha:hoy, min, dia} = ahoraChile(now);
  const stores = (datos && datos.stores) || {};
  const est = {enviados:{}, rutinas:{}, ...estado};
  const out = [];
  // 1) Recordatorios de eventos con hora
  for (const e of stores.eventos || []){
    if (e.fecha !== hoy) continue;
    const ini = toMin(e.hora_inicio); if (ini === null) continue;
    const aviso = ini - (e.recordatorio === 0 ? 0 : (+e.recordatorio || 15));
    const key = `ev:${e.id}:${e.fecha}:${e.hora_inicio}`;
    if (min >= aviso && min < ini + 10 && !est.enviados[key]){
      est.enviados[key] = now.toISOString();
      out.push(e.envio
        ? {title:`Publicar: ${e.titulo}`, body:'Tu publicación está lista. Toca para abrirla en KAI.', url:'./', tag:key}
        : {title:`${e.hora_inicio} · ${e.titulo}`, body:[e.lugar, e.notas].filter(Boolean).join(' · ') || `Empieza ${aviso === ini ? 'ahora' : 'en ' + (ini - min) + ' min'}.`, url:'./', tag:key});
    }
  }
  // 2) Rutinas programadas
  for (const r of stores.rutinas || []){
    if (r.activa === false) continue;
    const h = toMin(r.hora); if (h === null) continue;
    const dias = Array.isArray(r.dias) && r.dias.length ? r.dias : DIAS;
    if (!dias.includes(dia) || min < h || min > h + 90 || est.rutinas[r.id] === hoy) continue;
    est.rutinas[r.id] = hoy;
    if (r.tipo === 'resumen') out.push({title:r.nombre || 'Resumen del día', body:resumenDelDia(stores, hoy), url:'./', tag:'rut:' + r.id});
    else if (r.tipo === 'alerta_kpi'){
      const rojo = kpisEnRojo(stores);
      if (rojo.length) out.push({title:`⚠ ${rojo.length} KPI${rojo.length > 1 ? 's' : ''} fuera de meta`, body:rojo.slice(0, 4).join('\n'), url:'./#vista=kpis', tag:'rut:' + r.id});
    }
    else if (r.tipo === 'tarea_kai') out.push({title:`KAI: ${r.nombre}`, body:'Toca y lo preparo ahora.', url:`./#rutina=${encodeURIComponent(r.id)}`, tag:'rut:' + r.id});
    else out.push({title:r.nombre || 'Recordatorio', body:r.mensaje || '', url:'./', tag:'rut:' + r.id});
  }
  // 3) Prueba solicitada desde KAI › Ajustes
  if (config && config.probar && config.probar !== est.probado){
    est.probado = config.probar;
    out.push({title:'KAI ✓ Notificaciones funcionando', body:`El servidor está activo (${ahoraChile(now).hm} h). Te avisaré aunque KAI esté cerrado.`, url:'./', tag:'prueba'});
  }
  // limpiar registros de avisos de días anteriores
  for (const k of Object.keys(est.enviados)) if (!k.includes(':' + hoy + ':') && est.enviados[k] < addDays(hoy, -2)) delete est.enviados[k];
  return {notifs:out, estado:est};
}

/* ---------- Ejecución ---------- */
export async function ejecutar(env, now = new Date(), fetchPush){
  if (!env.GH_TOKEN || !env.GH_REPO) throw new Error('Faltan los secretos GH_TOKEN y GH_REPO');
  const [datos, config, estado] = await Promise.all([readJSON(env, 'kai-datos.json'), readJSON(env, 'servidor/config.json'), readJSON(env, 'servidor/estado.json')]);
  const {notifs, estado:nuevo} = planificar(datos, config, estado || {}, now);
  nuevo.ultimaEjecucion = now.toISOString();
  let enviadas = 0, vencidas = [];
  if (notifs.length && config && config.vapid && (config.suscripciones || []).length){
    for (const n of notifs){
      for (const s of config.suscripciones){
        try {
          const st = await sendPush(s, n, config.vapid, fetchPush);
          if (st === 404 || st === 410){ if (!vencidas.includes(s.endpoint)) vencidas.push(s.endpoint); } else if (st < 300) enviadas++;
        } catch(_){}
      }
    }
  }
  nuevo.ultimasEnviadas = enviadas || nuevo.ultimasEnviadas || 0;
  // Se guarda el estado como mucho cada 30 min si no hubo avisos (evita llenar el historial del repositorio)
  const viejo = estado && estado.ultimaEjecucion ? new Date(estado.ultimaEjecucion) : 0;
  if (notifs.length || !viejo || now - viejo > 30 * 60000) await writeJSON(env, 'servidor/estado.json', nuevo, `KAI servidor: ${notifs.length} aviso(s)`);
  if (vencidas.length){
    config.suscripciones = config.suscripciones.filter(s => !vencidas.includes(s.endpoint));
    await writeJSON(env, 'servidor/config.json', config, 'KAI servidor: limpiar suscripciones vencidas');
  }
  return {avisos:notifs.length, enviadas, vencidas:vencidas.length};
}

export default {
  async scheduled(event, env, ctx){ ctx.waitUntil(ejecutar(env).catch(e => console.log('Error:', e.message))); },
  async fetch(){ return new Response('Servidor de KAI activo. Revisa tus datos cada 5 minutos.', {headers:{'content-type':'text/plain; charset=utf-8'}}); }
};
