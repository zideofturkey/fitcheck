// Turkish-diacritic-insensitive search helper. Postgres ILIKE is only
// case-insensitive, not diacritic-insensitive - "kasar" would never match
// "Kaşar" without this. Folds ş/ğ/ü/ö/ç/ı (both cases) to their plain-ASCII
// Latin equivalent on both sides of the comparison, via SQL translate()
// + lower() at query time (no schema/column changes needed).
const { fn, col, where, Op } = require("sequelize");

const TURKISH_FOLD_MAP = {
  İ: "i",
  I: "i",
  ı: "i",
  Ş: "s",
  ş: "s",
  Ğ: "g",
  ğ: "g",
  Ü: "u",
  ü: "u",
  Ö: "o",
  ö: "o",
  Ç: "c",
  ç: "c",
};
const TURKISH_FOLD_FROM = Object.keys(TURKISH_FOLD_MAP).join("");
const TURKISH_FOLD_TO = Object.values(TURKISH_FOLD_MAP).join("");

function foldTurkish(str) {
  if (!str) return "";
  let out = "";
  for (const ch of str) {
    out += TURKISH_FOLD_MAP[ch] ?? ch;
  }
  return out.toLowerCase();
}

// Sequelize `where(...)` condition: turkishInsensitiveCondition("foodName", "kasar")
// matches a "Kaşar" row.
function turkishInsensitiveCondition(columnName, term) {
  return where(
    fn("lower", fn("translate", col(columnName), TURKISH_FOLD_FROM, TURKISH_FOLD_TO)),
    { [Op.like]: `%${foldTurkish(term)}%` },
  );
}

module.exports = {
  foldTurkish,
  turkishInsensitiveCondition,
  TURKISH_FOLD_FROM,
  TURKISH_FOLD_TO,
};
