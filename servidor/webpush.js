// Web Push sin librerías: cifrado aes128gcm (RFC 8291) y firma VAPID (RFC 8292) con WebCrypto.
// Funciona igual en Cloudflare Workers y en Node 20+.

const enc = new TextEncoder();

export const b64u = {
  enc(bytes){
    let s = '';
    for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  dec(str){
    const s = String(str).replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(s + '==='.slice((s.length + 3) % 4));
    return Uint8Array.from(bin, c => c.charCodeAt(0));
  }
};

const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0; for (const p of parts){ out.set(p, o); o += p.length; }
  return out;
};

async function hmac(key, data){
  const k = await crypto.subtle.importKey('raw', key, {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, data));
}
// HKDF en dos pasos (extract / expand de un bloque), suficiente para largos ≤ 32 bytes
const hkdfExtract = (salt, ikm) => hmac(salt, ikm);
const hkdfExpand = async (prk, info, len) => (await hmac(prk, concat(info, new Uint8Array([1])))).slice(0, len);

// Clave privada P-256 (32 bytes) + su pública (65 bytes) → JWK importable
function jwkFromRaw(priv, pub, alg){
  return {kty:'EC', crv:'P-256', d:b64u.enc(priv), x:b64u.enc(pub.slice(1, 33)), y:b64u.enc(pub.slice(33, 65)), ext:true, ...(alg ? {alg} : {})};
}

/**
 * Cifra un mensaje para una suscripción push.
 * sub: {endpoint, keys:{p256dh, auth}}; payload: Uint8Array
 * opts (solo pruebas): {salt, asPrivate, asPublic} para reproducir el vector del RFC.
 */
export async function encryptPayload(sub, payload, opts = {}){
  const uaPublic = b64u.dec(sub.keys.p256dh), authSecret = b64u.dec(sub.keys.auth);
  let asPrivKey, asPublic;
  if (opts.asPrivate){
    asPublic = opts.asPublic;
    asPrivKey = await crypto.subtle.importKey('jwk', jwkFromRaw(opts.asPrivate, asPublic), {name:'ECDH', namedCurve:'P-256'}, false, ['deriveBits']);
  } else {
    const kp = await crypto.subtle.generateKey({name:'ECDH', namedCurve:'P-256'}, true, ['deriveBits']);
    asPrivKey = kp.privateKey; asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
  }
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, {name:'ECDH', namedCurve:'P-256'}, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH', public:uaKey}, asPrivKey, 256));

  const prkKey = await hkdfExtract(authSecret, shared);
  const ikm = await hkdfExpand(prkKey, concat(enc.encode('WebPush: info\0'), uaPublic, asPublic), 32);
  const salt = opts.salt || crypto.getRandomValues(new Uint8Array(16));
  const prk = await hkdfExtract(salt, ikm);
  const cek = await hkdfExpand(prk, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdfExpand(prk, enc.encode('Content-Encoding: nonce\0'), 12);

  const key = await crypto.subtle.importKey('raw', cek, {name:'AES-GCM'}, false, ['encrypt']);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM', iv:nonce}, key, concat(payload, new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 0x10, 0]); // tamaño de registro 4096
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, cipher);
}

/** Encabezado Authorization VAPID (JWT ES256). vapid: {publicKey (b64url raw), privateJwk, subject} */
export async function vapidHeader(endpoint, vapid){
  const aud = new URL(endpoint).origin;
  const header = b64u.enc(enc.encode(JSON.stringify({typ:'JWT', alg:'ES256'})));
  const claims = b64u.enc(enc.encode(JSON.stringify({aud, exp:Math.floor(Date.now() / 1000) + 12 * 3600, sub:vapid.subject || 'mailto:kai@example.com'})));
  const {key_ops, ...jwk} = vapid.privateJwk;
  const k = await crypto.subtle.importKey('jwk', {...jwk, ext:true}, {name:'ECDSA', namedCurve:'P-256'}, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign({name:'ECDSA', hash:'SHA-256'}, k, enc.encode(header + '.' + claims)));
  return `vapid t=${header}.${claims}.${b64u.enc(sig)}, k=${vapid.publicKey}`;
}

/** Envía una notificación. Devuelve el código HTTP (404/410 = suscripción vencida). */
export async function sendPush(sub, data, vapid, fetchImpl = fetch){
  const body = await encryptPayload(sub, enc.encode(JSON.stringify(data)));
  const r = await fetchImpl(sub.endpoint, {
    method:'POST',
    headers:{'Content-Encoding':'aes128gcm', 'Content-Type':'application/octet-stream', 'TTL':'86400', 'Urgency':'high', 'Authorization':await vapidHeader(sub.endpoint, vapid)},
    body
  });
  return r.status;
}
