/**
 * User display helpers. Generated from the project's authentication
 * settings — when `userNameType === 'asNamePair'` the user record has
 * `name` + `surname` columns and no `fullname`; for `asFullname` the
 * record has a single `fullname`. These helpers paper over that
 * difference so call sites stay simple.
 *
 * For this project:
 *   userNameType:           'asFullname'
 *   primaryLoginIdentifier: 'email'
 */

const PRIMARY_LOGIN_FIELD = "email";

/**
 * Returns the user's display name. Falls back to the project's
 * primary login identifier (email or mobile) and finally `opts.fallback`
 * (default 'User') when nothing usable is set.
 */
export function userDisplayName(user, opts = {}) {
  if (!user) return opts.fallback ?? "User";
  const name = (user.fullname || "").trim();
  if (name) return name;
  return (
    user[PRIMARY_LOGIN_FIELD] ||
    user.email ||
    user.mobile ||
    opts.fallback ||
    "User"
  );
}

/**
 * First-letter initial for avatar placeholders. Uses display-name first,
 * then primary identifier, then '?'.
 */
export function userDisplayInitial(user) {
  const name = userDisplayName(user, { fallback: "" });
  if (name) return (name[0] || "?").toUpperCase();
  if (user?.email) return user.email[0].toUpperCase();
  if (user?.mobile) return user.mobile[0].toUpperCase();
  return "?";
}

/**
 * Build the request payload for create/update user APIs — picks the
 * right field set based on `userNameType`. Source object should expose
 * either `fullname` OR both `name` + `surname` (UI form state).
 *
 * Returns just the name-related slice; merge with the rest of the
 * form data at the call site.
 */
export function userNamePayload(source) {
  return source && source.fullname !== undefined
    ? { fullname: source.fullname }
    : {};
}

export const USER_NAME_TYPE = "asFullname";
