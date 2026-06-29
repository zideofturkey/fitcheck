// clientInfo.js

/**
 * Safely get header by name (Node.js usually lowercases header names).
 */
function h(headers, name) {
  if (!headers) return undefined;
  return headers[name.toLowerCase()];
}

/**
 * Parse Sec-CH-UA style header (brands + versions).
 * Example: "Chromium";v="120", "Not.A/Brand";v="8"
 */
function parseSecChUa(value) {
  if (!value) return [];
  const re = /"([^"]+)"\s*;\s*v="([^"]+)"/g;
  const brands = [];
  let match;
  while ((match = re.exec(value)) !== null) {
    brands.push({ brand: match[1], version: match[2] });
  }
  return brands;
}

/**
 * Basic UA parsing (browser, engine, os, device, cpu) using heuristics.
 * No external dependencies.
 */
function parseUserAgent(ua) {
  ua = ua || "";

  // ---------- Browser ----------
  let browserName = null;
  let browserVersion = null;

  const browserRegexes = [
    { name: "Edge", regex: /Edg\/([\d.]+)/ },
    { name: "Opera", regex: /OPR\/([\d.]+)/ },
    { name: "Chrome", regex: /Chrome\/([\d.]+)/ },
    { name: "Firefox", regex: /Firefox\/([\d.]+)/ },
    { name: "Safari", regex: /Version\/([\d.]+).*Safari/ },
  ];

  for (const br of browserRegexes) {
    const m = ua.match(br.regex);
    if (m) {
      browserName = br.name;
      browserVersion = m[1];
      break;
    }
  }

  // ---------- Engine ----------
  let engineName = null;
  let engineVersion = null;

  if (/AppleWebKit\/([\d.]+)/.test(ua)) {
    engineName = "WebKit";
    engineVersion = RegExp.$1;
  }

  if (/Gecko\/([\d.]+)/.test(ua) && /Firefox\//.test(ua)) {
    engineName = "Gecko";
    engineVersion = RegExp.$1;
  }

  // Rough Blink detection (Chrome, Edge, Opera on WebKit base)
  if (
    browserName === "Chrome" ||
    browserName === "Edge" ||
    browserName === "Opera"
  ) {
    engineName = "Blink";
    // we keep engineVersion as whatever WebKit/Gecko gave us, if any
  }

  // ---------- OS ----------
  let osName = null;
  let osVersion = null;
  let m;

  // Windows
  if ((m = ua.match(/Windows NT ([\d.]+)/))) {
    osName = "Windows";
    const map = {
      "10.0": "10",
      6.3: "8.1",
      6.2: "8",
      6.1: "7",
      "6.0": "Vista",
      5.1: "XP",
    };
    osVersion = map[m[1]] || m[1];
  }
  // macOS
  else if ((m = ua.match(/Mac OS X ([0-9_]+)/))) {
    osName = "macOS";
    osVersion = m[1].replace(/_/g, ".");
  }
  // iOS
  else if ((m = ua.match(/(iPhone|iPad|iPod).*OS ([0-9_]+)/))) {
    osName = "iOS";
    osVersion = m[2].replace(/_/g, ".");
  }
  // Android
  else if ((m = ua.match(/Android ([\d.]+)/))) {
    osName = "Android";
    osVersion = m[1];
  }
  // Linux
  else if (/Linux/i.test(ua)) {
    osName = "Linux";
  }

  // ---------- Device ----------
  let deviceType = null; // 'mobile' | 'tablet' | 'desktop'
  let deviceModel = null;
  let deviceVendor = null;

  if (/Mobile|iPhone|Android.*Mobile/i.test(ua)) {
    deviceType = "mobile";
  } else if (/iPad|Tablet/i.test(ua)) {
    deviceType = "tablet";
  } else {
    deviceType = "desktop";
  }

  // Normalize well-known Apple devices
  if (/iPhone/.test(ua)) {
    deviceVendor = "Apple";
    deviceModel = "iPhone";
  } else if (/iPad/.test(ua)) {
    deviceVendor = "Apple";
    deviceModel = "iPad";
  } else if (/Mac OS X/.test(ua)) {
    // We know it's macOS desktop/laptop, but UA never gives MacBook vs iMac etc.
    deviceVendor = "Apple";
    deviceModel = null;
  }

  // ---------- CPU ----------
  let cpuArch = null;

  if (/x86_64|Win64|WOW64|amd64/i.test(ua)) {
    cpuArch = "x86_64";
  } else if (/i686|i386/i.test(ua)) {
    cpuArch = "x86";
  } else if (/arm64|aarch64/i.test(ua)) {
    cpuArch = "arm64";
  } else if (/arm/i.test(ua)) {
    cpuArch = "arm";
  }

  return {
    browser: {
      name: browserName,
      version: browserVersion,
      major: browserVersion ? browserVersion.split(".")[0] : null,
    },
    engine: {
      name: engineName,
      version: engineVersion,
    },
    os: {
      name: osName,
      version: osVersion,
    },
    device: {
      vendor: deviceVendor,
      model: deviceModel,
      type: deviceType, // 'mobile' | 'tablet' | 'desktop'
    },
    cpu: {
      architecture: cpuArch,
    },
  };
}

/**
 * Parse client hints from headers into structured data.
 */
function parseClientHints(headers = {}) {
  const secChUa = h(headers, "sec-ch-ua");
  const secChUaFull =
    h(headers, "sec-ch-ua-full-version-list") ||
    h(headers, "sec-ch-ua-full-version");
  const secChUaMobile = h(headers, "sec-ch-ua-mobile");
  const secChUaPlatform = h(headers, "sec-ch-ua-platform");
  const secChUaPlatformVersion = h(headers, "sec-ch-ua-platform-version");
  const secChUaModel = h(headers, "sec-ch-ua-model");
  const secChUaArch = h(headers, "sec-ch-ua-arch");
  const secChUaBitness = h(headers, "sec-ch-ua-bitness");

  const downlink = h(headers, "downlink");
  const rtt = h(headers, "rtt");
  const ect = h(headers, "ect");
  const saveData = h(headers, "save-data");

  return {
    brands: parseSecChUa(secChUa),
    fullVersionList: parseSecChUa(secChUaFull),
    mobile:
      typeof secChUaMobile === "string" ? secChUaMobile.trim() === "?1" : null,
    platform: {
      name: secChUaPlatform ? secChUaPlatform.replace(/"/g, "") : null,
      version: secChUaPlatformVersion
        ? secChUaPlatformVersion.replace(/"/g, "")
        : null,
    },
    model: secChUaModel ? secChUaModel.replace(/"/g, "") : null,
    arch: secChUaArch ? secChUaArch.replace(/"/g, "") : null,
    bitness: secChUaBitness ? secChUaBitness.replace(/"/g, "") : null,
    network: {
      downlinkMbps: downlink ? Number(downlink) || null : null,
      rttMs: rtt ? Number(rtt) || null : null,
      effectiveConnectionType: ect || null,
      saveData:
        typeof saveData === "string" ? saveData.toLowerCase() === "on" : null,
    },
  };
}

/**
 * Derive a device type from UA + Client Hints.
 */
function deriveDeviceType(uaDevice, ch) {
  // Prefer UA device type if present
  if (uaDevice && uaDevice.type) {
    return uaDevice.type; // 'mobile' | 'tablet' | 'desktop'
  }

  // Use Client Hints
  if (ch.mobile === true) return "mobile";

  const platform = (ch.platform.name || "").toLowerCase();
  if (platform.includes("android") || platform.includes("ios")) {
    return "mobile";
  }

  // Fallback
  return "desktop";
}

/**
 * Main function: parse user agent + client hints into unified object.
 * @param {IncomingMessage|{headers: object}} reqOrHeaders - Node req or plain { headers }
 */
function parseClientInfo(reqOrHeaders) {
  const headers =
    reqOrHeaders && reqOrHeaders.headers
      ? reqOrHeaders.headers
      : reqOrHeaders || {};

  const userAgent = h(headers, "user-agent") || "";

  // Base UA parsing (manual, no deps)
  const uaResult = parseUserAgent(userAgent);

  // Client hints
  const ch = parseClientHints(headers);

  // Languages
  const acceptLanguage = h(headers, "accept-language");
  const languages = acceptLanguage
    ? acceptLanguage.split(",").map((s) => s.trim())
    : [];

  const deviceType = deriveDeviceType(uaResult.device, ch);

  return {
    raw: {
      userAgent,
      headers: {
        "user-agent": userAgent,
        "sec-ch-ua": h(headers, "sec-ch-ua"),
        "sec-ch-ua-mobile": h(headers, "sec-ch-ua-mobile"),
        "sec-ch-ua-platform": h(headers, "sec-ch-ua-platform"),
        "sec-ch-ua-platform-version": h(headers, "sec-ch-ua-platform-version"),
        "sec-ch-ua-model": h(headers, "sec-ch-ua-model"),
        "sec-ch-ua-arch": h(headers, "sec-ch-ua-arch"),
        "sec-ch-ua-bitness": h(headers, "sec-ch-ua-bitness"),
        "sec-ch-ua-full-version-list": h(
          headers,
          "sec-ch-ua-full-version-list",
        ),
        "accept-language": acceptLanguage,
        downlink: h(headers, "downlink"),
        rtt: h(headers, "rtt"),
        ect: h(headers, "ect"),
        "save-data": h(headers, "save-data"),
      },
    },

    ua: uaResult, // { browser, engine, os, device, cpu }
    clientHints: ch,

    locale: {
      raw: acceptLanguage || null,
      primary: languages[0] || null,
      all: languages,
    },

    summary: {
      deviceType, // 'mobile' | 'tablet' | 'desktop'
      os: ch.platform.name || uaResult.os.name || null,
      osVersion: ch.platform.version || uaResult.os.version || null,
      browserName: uaResult.browser.name || null,
      browserVersion: uaResult.browser.version || null,
      architecture: ch.arch || uaResult.cpu.architecture || null,
      model: ch.model || uaResult.device.model || null,
      vendor: uaResult.device.vendor || null,
    },
  };
}

module.exports = {
  parseClientInfo,
};
