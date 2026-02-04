
// Structured prerequisite model and helpers.

export function emptyRules() {
  return { allOf: [] };
}

export function cloneRules(rules) {
  return JSON.parse(JSON.stringify(rules || emptyRules()));
}

export function ensureGroup(rules, idx) {
  const next = cloneRules(rules);
  while (next.allOf.length <= idx) {
    next.allOf.push({ anyOf: [] });
  }
  return next;
}

export function addRequirement(rules, groupIndex, item) {
  const next = ensureGroup(rules, groupIndex);
  const list = next.allOf[groupIndex].anyOf;
  const exists = list.some(
    (i) => i.code === item.code && (i.minMark || null) === (item.minMark || null)
  );
  if (!exists) list.push({ code: item.code, ...(item.minMark ? { minMark: item.minMark } : {}) });
  return next;
}

export function removeRequirement(rules, groupIndex, code) {
  const next = cloneRules(rules);
  if (!next.allOf[groupIndex]) return next;
  next.allOf[groupIndex].anyOf = (next.allOf[groupIndex].anyOf || []).filter(
    (i) => i.code !== code
  );
  // empty groups
  next.allOf = next.allOf.filter((g) => (g.anyOf || []).length > 0);
  return next;
}

export function addGroup(rules) {
  const next = cloneRules(rules);
  next.allOf.push({ anyOf: [] });
  return next;
}

export function removeGroup(rules, groupIndex) {
  const next = cloneRules(rules);
  if (groupIndex >= 0 && groupIndex < next.allOf.length) {
    next.allOf.splice(groupIndex, 1);
  }
  return next;
}

export function formatRules(rules) {
  if (!rules || !Array.isArray(rules.allOf)) return '—';
  const parts = rules.allOf
    .map((g) => (g.anyOf || [])
      .map((i) => `${i.code}${i.minMark ? ` (≥${i.minMark}%)` : ''}`)
      .join(' OR ')
    )
    .filter((s) => s && s.trim().length > 0);

  return parts.length ? parts.join(' AND ') : '—';
}
