// npm i tldts

const parseTld = require("tldts").parse;

/** Strip port and IPv6 brackets. e.g. "localhost:3011"->"localhost", "[::1]:8080"->"::1" */
function toHostname(hostHeader = "") {
  let h = hostHeader.toLowerCase().trim();
  if (!h) return "";
  // If multiple hosts (proxy), take the first
  if (h.includes(",")) h = h.split(",")[0].trim();

  // IPv6 with brackets: [::1]:3000 or [2001:db8::1]
  if (h.startsWith("[")) {
    const end = h.indexOf("]");
    if (end !== -1) return h.slice(1, end);
  }
  // Strip :port for IPv4/hostnames
  const idx = h.indexOf(":");
  return idx === -1 ? h : h.slice(0, idx);
}

function isDevHost(hostname) {
  return (
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"
  );
}

/**
 * Decide which Domain= to put on the cookie, given a request host and a mixed allow-list.
 * - allowed can include base domains: "xapp.com"
 * - allowed can include specific hostnames: "xapp.mindbricks.com"
 *
 * Returns:
 *   - a string like ".xapp.com" or ".xapp.mindbricks.com" for a shared cookie
 *   - null to indicate "host-only" cookie (omit Domain)
 *   - undefined if not allowed (no match)
 */
function determineCookieDomain(reqHost, allowed = []) {
  if (!reqHost) return undefined;

  const host = reqHost.toLowerCase();

  // Normalize allow list (strip any accidental ports there too)
  const normalizedAllowed = allowed.map(toHostname);

  // Dev hosts: host-only cookie if allowed
  if (
    isDevHost(host) &&
    normalizedAllowed.some((a) => isDevHost(a) || a === "localhost")
  ) {
    console.log("Host is dev, creating a lax cookie");
    return null; // host-only cookie for dev
  }

  // Normalize and precompute labels for comparisons
  const { domain: hostBase } = parseTld(host); // eTLD+1, e.g., "xapp.com" for "api.xapp.com"

  // Helper: is 'host' equal to or a subdomain of 'needle'
  const isHostEqOrSubOf = (needle) =>
    host === needle || host.endsWith(`.${needle}`);

  // First pass: base-domain entries (eTLD+1)
  for (const entryRaw of normalizedAllowed) {
    const entry = entryRaw.toLowerCase().trim();
    if (!entry) continue;

    const { domain: entryBase, subdomain: entrySub } = parseTld(entry);

    // If entry looks like a base domain (no subdomain component in tldts),
    // e.g., "xapp.com" or "yapp.com"
    if (entryBase && !entrySub && entryBase === entry) {
      if (hostBase && hostBase === entryBase) {
        // Host is this base or under it -> share cookie across *.entryBase
        return `.${entryBase}`;
      }
      continue;
    }
  }

  // Second pass: specific hostnames (e.g., "xapp.mindbricks.com")
  for (const entryRaw of normalizedAllowed) {
    const entry = entryRaw.toLowerCase().trim();
    if (!entry) continue;

    const { domain: entryBase, subdomain: entrySub } = parseTld(entry);

    // If entry is a specific hostname (has a subdomain portion)
    if (entryBase && entrySub) {
      if (isHostEqOrSubOf(entry)) {
        // Choose one of the two behaviors:

        // (A) Share across the specific hostname and its sub-subdomains:
        return `.${entry}`;

        // (B) If you want host-only when it matches exactly, use this instead:
        // return host === entry ? null : `.${entry}`;
      }
    }
  }

  // No match -> not allowed
  return undefined;
}

module.exports = (req, allowed = []) => {
  const rawHost = req.hostname;
  const hostname = toHostname(rawHost); // <-- strips ":port" safely

  console.log({
    expressHostname: req.hostname,
    rawHostHeader: req.get("host"),
    xForwardedHost: req.get("x-forwarded-host"),
    protocol: req.protocol,
    ip: req.ip,
    ips: req.ips,
  });

  console.log("Normalized hostname for cookie domain", hostname);

  const domainAttr = determineCookieDomain(hostname, allowed);
  console.log("DetermineCookieDomain:", domainAttr);

  if (domainAttr === undefined) {
    // Not allowed
    return null;
  }

  const cookieOpts = {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  };

  // Host-only cookie (null) — used for dev (localhost/127.0.0.1/::1)
  if (domainAttr === null) {
    // Dev relaxations: HTTP allowed, Lax is friendlier for local flows
    cookieOpts.sameSite = "Lax";
    cookieOpts.secure = false;
    // host-only -> no Domain attribute
  } else {
    // Real domains -> shared cookie across subdomains
    cookieOpts.domain = domainAttr;
  }

  return cookieOpts;
};
