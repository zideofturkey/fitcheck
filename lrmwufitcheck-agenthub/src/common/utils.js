const concatListResults = (listArray) => {
  let result = [];
  for (const list of listArray) {
    if (list && list.items && Array.isArray(list.items)) {
      result = result.concat(list.items);
    }
  }
  return result;
};

const mapArrayItems = (itemArray, keys) => {
  return itemArray.map((item) => {
    const nItem = {};
    for (const key of keys) {
      nItem[key] = item[key];
    }
    return nItem;
  });
};

function normalizeElasticSearchResult(resp) {
  const items = [];

  // --- 1) Root hits → items[] (with collapse/inner_hits flattened) ---
  if (resp && resp.hits && Array.isArray(resp.hits.hits)) {
    for (const hit of resp.hits.hits) {
      // base: use _source as main object
      const base = hit && hit._source ? { ...hit._source } : { ...hit };

      // collapse / nested / parent-child inner_hits:
      // hit.inner_hits = { innerName: { hits: { hits: [...] } }, ... }
      if (hit.inner_hits && typeof hit.inner_hits === "object") {
        for (const [name, inner] of Object.entries(hit.inner_hits)) {
          if (inner && inner.hits && Array.isArray(inner.hits.hits)) {
            // inner_hits name becomes a direct array of _source docs
            base[name] = inner.hits.hits.map((ih) => ih._source ?? ih);
          } else {
            // fallback: keep raw shape if unexpected
            base[name] = inner;
          }
        }
      }

      items.push(base);
    }
  }

  // --- 2) Aggregations: turn top_hits into plain arrays of _source ---
  function transformNode(node) {
    if (!node || typeof node !== "object") return node;

    // In aggregations, a top_hits result looks like: { hits: { hits: [...] } }
    // We simplify it to: [ /* _source docs */ ]
    if (node.hits && Array.isArray(node.hits.hits)) {
      return node.hits.hits.map((h) => h._source ?? h);
    }

    if (Array.isArray(node)) {
      return node.map(transformNode);
    }

    const result = {};
    for (const [key, value] of Object.entries(node)) {
      result[key] = transformNode(value);
    }
    return result;
  }

  const aggregations = resp.aggregations
    ? transformNode(resp.aggregations)
    : {};

  return { items, aggregations };
}

/**
 * Logs all known client IP fields from an Express request object
 * covering Cloudflare, Akamai, Fastly, AppEngine, Forwarded headers,
 * Node socket info, and proxy variations.
 */
function logRequestIPs(req, label = "Client IP Debug") {
  const getHeader = (name) => req.headers[name.toLowerCase()] || null;

  const forwardedFor = getHeader("x-forwarded-for");
  const forwardedForFirst = forwardedFor
    ? forwardedFor.split(",").map((s) => s.trim())[0]
    : null;

  const forwarded = getHeader("forwarded");
  let forwardedParsed = null;
  if (forwarded) {
    try {
      // Forwarded: for=1.2.3.4;proto=https;host=example.com
      const parts = forwarded.split(";");
      const forPart = parts.find((p) => p.trim().startsWith("for="));
      if (forPart) {
        forwardedParsed = forPart.split("=")[1].replace(/"/g, "");
      }
    } catch {}
  }

  const ipInfo = {
    label,

    // CDN / Proxy headers
    "X-Client-IP": getHeader("x-client-ip"),
    "X-Forwarded-For": forwardedFor,
    "X-Forwarded-For (first)": forwardedForFirst,
    "CF-Connecting-IP": getHeader("cf-connecting-ip"),
    "True-Client-IP": getHeader("true-client-ip"),
    "Fastly-Client-Ip": getHeader("fastly-client-ip"),
    "X-Real-IP": getHeader("x-real-ip"),
    "X-Cluster-Client-IP": getHeader("x-cluster-client-ip"),

    // Forwarded variations
    "X-Forwarded": getHeader("x-forwarded"),
    Forwarded: forwarded,
    "Forwarded (parsed for=)": forwardedParsed,

    // Google App Engine
    "appengine-user-ip": getHeader("appengine-user-ip"),

    // Cloudflare fallback IPv4 header
    "Cf-Pseudo-IPv4": getHeader("cf-pseudo-ipv4"),

    // Node.js connection/socket internals
    "req.ip": req.ip,
    "req.ips": req.ips,
    "connection.remoteAddress": req.connection?.remoteAddress || null,
    "socket.remoteAddress": req.socket?.remoteAddress || null,
    "connection.socket.remoteAddress":
      req.connection?.socket?.remoteAddress || null,
    "req.info.remoteAddress": req.info?.remoteAddress || null,

    // Fastify raw (Express does not use this, included for completeness)
    "request.raw": req.raw || null,
  };

  /*

  console.log("====== IP DEBUG LOG ======");
  console.log(JSON.stringify(ipInfo, null, 2));
  console.log("==========================");
  */

  return ipInfo;
}

const checkSame = (right, left, seen = new WeakMap()) => {
  // Fast path: strict equality (covers most primitives & same ref objects)
  if (right === left) return true;

  // Handle NaN specially: NaN !== NaN by default
  if (
    typeof right === "number" &&
    typeof left === "number" &&
    Number.isNaN(right) &&
    Number.isNaN(left)
  ) {
    return true;
  }

  // Different types => not equal
  if (typeof right !== typeof left) return false;

  // Handle null (typeof null === "object")
  if (right === null || left === null) return false;

  // Handle special built-ins you may care about
  if (right instanceof Date && left instanceof Date) {
    return right.getTime() === left.getTime();
  }

  if (right instanceof RegExp && left instanceof RegExp) {
    return right.source === left.source && right.flags === left.flags;
  }

  // Functions are only equal by reference (already failed === above)
  if (typeof right === "function") return false;

  // Arrays
  const rightIsArray = Array.isArray(right);
  const leftIsArray = Array.isArray(left);

  if (rightIsArray || leftIsArray) {
    if (!rightIsArray || !leftIsArray) return false;
    if (right.length !== left.length) return false;

    // Circular reference check for this pair
    let inner = seen.get(right);
    if (inner && inner.has(left)) return true; // we've already compared this pair
    if (!inner) {
      inner = new WeakMap();
      seen.set(right, inner);
    }
    inner.set(left, true);

    for (let i = 0; i < right.length; i++) {
      if (!checkSame(right[i], left[i], seen)) return false;
    }
    return true;
  }

  // Objects (non-array)
  if (typeof right === "object") {
    // Circular reference check for this pair
    let inner = seen.get(right);
    if (inner && inner.has(left)) return true;
    if (!inner) {
      inner = new WeakMap();
      seen.set(right, inner);
    }
    inner.set(left, true);

    const rKeys = Object.keys(right);
    const lKeys = Object.keys(left);

    if (rKeys.length !== lKeys.length) return false;

    for (const key of rKeys) {
      if (!lKeys.includes(key)) return false;
      if (!checkSame(right[key], left[key], seen)) return false;
    }
    return true;
  }

  // For remaining primitive-like cases (bigint, symbol) that weren't ===
  return false;
};

module.exports = {
  concatListResults,
  mapArrayItems,
  normalizeElasticSearchResult,
  logRequestIPs,
  checkSame,
};
