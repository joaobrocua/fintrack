export type RuleMatchType =
  "CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "EQUALS" | "REGEX";

export type CategorizationRule = {
  id: string;
  matchType: RuleMatchType;
  pattern: string;
  categoryId: string;
  priority: number;
  enabled: boolean;
  createdAt?: Date | string;
};

function matchesRule(description: string, rule: CategorizationRule): boolean {
  const haystack = description.toLowerCase().trim();
  const needle = rule.pattern.toLowerCase().trim();
  if (!needle) return false;

  switch (rule.matchType) {
    case "CONTAINS":
      return haystack.includes(needle);
    case "STARTS_WITH":
      return haystack.startsWith(needle);
    case "ENDS_WITH":
      return haystack.endsWith(needle);
    case "EQUALS":
      return haystack === needle;
    case "REGEX":
      try {
        return new RegExp(rule.pattern, "i").test(description);
      } catch {
        return false;
      }
    default:
      return false;
  }
}

/** Higher priority first; ties broken by age (older rule wins). */
export function sortRules(rules: CategorizationRule[]): CategorizationRule[] {
  return [...rules].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return at - bt;
  });
}

/** First enabled rule that matches wins. Returns its categoryId, or null. */
export function categorize(
  description: string,
  rules: CategorizationRule[],
): string | null {
  for (const rule of sortRules(rules)) {
    if (!rule.enabled) continue;
    if (matchesRule(description, rule)) return rule.categoryId;
  }
  return null;
}

/** Returns true if `pattern` is a valid regular expression. */
export function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}
