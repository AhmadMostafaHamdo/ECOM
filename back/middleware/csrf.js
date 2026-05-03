const crypto = require("crypto");

module.exports = (req, res, next) => {
  const cookieName = process.env.CSRF_COOKIE_NAME || "csrfToken";
  const headerName = (process.env.CSRF_HEADER_NAME || "x-csrf-token").toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";

  const normalizeCookieDomain = (domain) => {
    if (!domain) return undefined;
    const trimmed = domain.trim();
    if (!trimmed) return undefined;
    if (trimmed === "localhost" || trimmed.endsWith(".localhost")) return undefined;
    if (!trimmed.includes(".")) return undefined;
    return trimmed.startsWith(".") ? trimmed : `.${trimmed}`;
  };

  const deriveCookieDomainFromOrigins = () => {
    const origins = (process.env.CLIENT_ORIGINS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const candidates = [];
    for (const origin of origins) {
      try {
        const url = new URL(origin);
        let host = url.hostname;
        if (!host || host === "localhost" || host === "127.0.0.1") continue;
        if (host.startsWith("www.")) host = host.slice(4);
        const normalized = normalizeCookieDomain(host);
        if (normalized) candidates.push(normalized);
      } catch {
        // ignore invalid origins
      }
    }

    candidates.sort((a, b) => a.length - b.length);
    return candidates[0];
  };

  const cookieDomain = normalizeCookieDomain(process.env.CSRF_COOKIE_DOMAIN || process.env.COOKIE_DOMAIN) ||
    (isProduction ? deriveCookieDomainFromOrigins() : undefined);

  const cookieOptions = {
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    httpOnly: false,
    path: "/",
  };

  if (cookieDomain) {
    cookieOptions.domain = cookieDomain;
    // Migrate from older host-only cookie (api.*) to a shared parent-domain cookie.
    // This prevents duplicate cookie names (host-only + domain cookie) causing mismatches.
    res.clearCookie(cookieName, { path: "/" });
  }

  const currentToken = req.cookies?.[cookieName];
  const token = currentToken || crypto.randomBytes(32).toString("hex");

  // Always ensure the CSRF cookie exists with the desired scope (especially in production subdomain setups).
  res.cookie(cookieName, token, cookieOptions);
  req.csrfToken = token;

  // Exempt safe methods and login/register from CSRF if you wish, or apply to all mutations
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  // Verify token for state-changing methods
  if (!safeMethods.includes(req.method)) {
    const receivedToken = req.headers[headerName];

    if (!receivedToken || receivedToken !== token) {
      return res
        .status(403)
        .json({ error: "Invalid CSRF Token. Request mitigated." });
    }
  }

  next();
};
