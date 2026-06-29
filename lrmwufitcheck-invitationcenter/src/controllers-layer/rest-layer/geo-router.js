const express = require("express");
const router = express.Router();
const { BadRequestError } = require("common");
const path = require("path");
const fs = require("fs").promises;

function toNumberOrThrow(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new BadRequestError(`${name} must be a finite number`);
  }
  return n;
}

router.get("/", (req, res, next) => {
  const filePath = path.join(__dirname, "geoDemo", "geo-demo-index.html");
  res.sendFile(filePath, (err) => {
    if (err) next(err);
  });
});

router.get("/index", (req, res) => {
  res.redirect("./");
});

router.get("/demo", (req, res) => {
  res.redirect("./");
});

router.get("/home", (req, res) => {
  res.redirect("./");
});

router.get("/examples", (req, res) => {
  res.redirect("./");
});

/**
 * Catch miscellaneous mistyped paths in /geo/
 * Examples:
 *   /geo/INDEX   → /geo
 *   /geo/demo/   → /geo
 *   /geo/demos   → /geo
 */
router.get("/:maybe", (req, res, next) => {
  const p = (req.params.maybe || "").toLowerCase();

  // If the segment is one we want to redirect, do so:
  const redirectables = ["index", "demo", "demos", "home"];
  if (redirectables.includes(p)) {
    return res.redirect("../");
  }

  // If it looks like static HTML without full path:
  if (p.endsWith(".html")) {
    return res.redirect("../");
  }

  // Otherwise, fall through: don't break real geo routes, like /store/location/*
  next();
});

module.exports = router;
