// Lightweight admin-only gate for simple Express routes (src/routes/*).
// Must run AFTER require-auth (needs req.session populated). Checks
// req.session.roleId directly rather than going through the Manager-layer
// userHasRole()/checkAbsolute() machinery, per the same "sade" pattern as
// the rest of src/routes/.
const ADMIN_ROLES = ["admin", "superAdmin"];

module.exports = function requireAdmin(req, res, next) {
  const roleId = req.session?.roleId;
  const roles = Array.isArray(roleId) ? roleId : [roleId];
  const isAdmin = roles.some((r) => ADMIN_ROLES.includes(r));

  if (!isAdmin) {
    return res.status(403).json({ error: "Admin role required" });
  }
  next();
};
