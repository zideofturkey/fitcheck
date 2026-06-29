const ARRAY_MUTATION_KEYS = ["$add", "$rem", "$addIf"];

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const isArrayMutationObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return ARRAY_MUTATION_KEYS.some((k) => hasOwn(value, k));
};

const hasArrayMutations = (dataClause) =>
  Object.values(dataClause || {}).some((value) => isArrayMutationObject(value));

const normalizeArray = (value) => (Array.isArray(value) ? [...value] : []);

const toComparable = (value) => {
  try {
    return JSON.stringify(value);
  } catch (err) {
    return String(value);
  }
};

const containsValue = (arr, val) => {
  const target = toComparable(val);
  return arr.some((item) => toComparable(item) === target);
};

const removeValues = (arr, values) =>
  arr.filter((item) => !containsValue(values, item));

const applyArrayMutation = (currentValue, mutationSpec) => {
  let next = normalizeArray(currentValue);
  const rem = normalizeArray(mutationSpec.$rem);
  const add = normalizeArray(mutationSpec.$add);
  const addIf = normalizeArray(mutationSpec.$addIf);

  if (rem.length) next = removeValues(next, rem);
  if (add.length) next.push(...add);
  if (addIf.length) {
    for (const item of addIf) {
      if (!containsValue(next, item)) next.push(item);
    }
  }
  return next;
};

const resolveArrayMutationsInClause = (dataClause, currentData) => {
  const resolved = { ...(dataClause || {}) };
  for (const [fieldName, fieldValue] of Object.entries(dataClause || {})) {
    if (isArrayMutationObject(fieldValue)) {
      resolved[fieldName] = applyArrayMutation(
        currentData?.[fieldName],
        fieldValue,
      );
    }
  }
  return resolved;
};

module.exports = {
  ARRAY_MUTATION_KEYS,
  isArrayMutationObject,
  hasArrayMutations,
  resolveArrayMutationsInClause,
};
