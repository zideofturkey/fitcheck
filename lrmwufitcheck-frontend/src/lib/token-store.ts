/**
 * Token storage utility
 * Stores the access token in memory (with localStorage and cookie fallback).

 * The server sets a cookie named "lrmwufitcheck-access-token" on login.

 */

const BASE_COOKIE_NAME = "lrmwufitcheck-access-token";
const LS_KEY = "lrmwufitcheck-access-token";

let _accessToken: string | null = null;

function _cookieName(): string {
  return BASE_COOKIE_NAME;
}

function _readCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

export function setAccessToken(token: string | null): void {
  _accessToken = token;
  if (token) {
    localStorage.setItem(LS_KEY, token);
  } else {
    localStorage.removeItem(LS_KEY);
  }
}

export function getAccessToken(): string | null {
  if (_accessToken) return _accessToken;
  const fromStorage = localStorage.getItem(LS_KEY);
  if (fromStorage) {
    _accessToken = fromStorage;
    return fromStorage;
  }
  // Fall back to the server-set cookie
  const fromCookie = _readCookie(_cookieName());
  if (fromCookie) {
    _accessToken = fromCookie;
    return fromCookie;
  }
  return null;
}

export function clearAccessToken(): void {
  _accessToken = null;
  localStorage.removeItem(LS_KEY);
  document.cookie = `${_cookieName()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
