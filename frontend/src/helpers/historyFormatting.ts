import { ChangeSet, Family, Reaction, Species } from "../types/chemistryModels";

/**
 * Normalizes an ISO date-time string to UTC and formats it in the local user's timezone.
 */
export function formatLocalDateTime(isoString?: string | null): string {
  if (!isoString) return "";
  // If the ISO string lacks timezone info (no Z and no +/- offset), assume UTC and append 'Z'
  const hasTimezone = isoString.endsWith("Z") || /[+-]\d{2}(:\d{2})?$/.test(isoString);
  const normalized = hasTimezone ? isoString : `${isoString}Z`;
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return isoString;

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Checks whether a key is an internal GUID or ID that should not be displayed in UI diffs.
 */
export function isIdOrInternalKey(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    lower === "id" ||
    lower === "sourceobjectid" ||
    lower === "familyid" ||
    lower === "familyversionid" ||
    lower === "verifierid" ||
    lower === "speciesids" ||
    lower === "reactionids" ||
    lower === "phaseids" ||
    lower === "reactants" ||
    lower === "products" ||
    lower.endsWith("id") ||
    lower.endsWith("ids") ||
    lower.endsWith("guid") ||
    lower === "createddate" ||
    lower === "updateddate" ||
    lower === "isreadonly"
  );
}

/**
 * Checks whether a value is a UUID string.
 */
export function isUuidString(val: unknown): boolean {
  return (
    typeof val === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)
  );
}

/**
 * Formats camelCase or PascalCase field names into user-friendly labels.
 */
export function formatFieldLabel(key: string): string {
  const lower = key.toLowerCase();
  switch (lower) {
    case "ispublic":
      return "Visibility";
    case "reactiontype":
      return "Reaction Type";
    case "isthirdbody":
      return "Third Body";
    case "absolutetolerance":
      return "Absolute Tolerance";
    case "constantconcentration":
      return "Constant Concentration";
    case "constantmixingratio":
      return "Constant Mixing Ratio";
    case "molecularweight":
      return "Molecular Weight";
    case "otherproperties":
      return "Other Properties";
    case "description":
      return "Description";
    case "name":
      return "Name";
    default:
      // Insert space before uppercase letters
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
  }
}

/**
 * Deep equality helper for primitive values, arrays, and objects.
 */
export function areValuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null && b === undefined) return true;
  if (a === undefined && b === null) return true;
  if (a === "" && (b === null || b === undefined)) return true;
  if (b === "" && (a === null || a === undefined)) return true;

  if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  return false;
}

/**
 * Formats a value cleanly for table display without JSON quotes or null clutter.
 */
export function formatFieldValue(val: unknown, fieldKey?: string): string {
  if (val === null || val === undefined) return "—";
  if (val === "") return "(empty)";

  if (typeof val === "boolean") {
    if (fieldKey?.toLowerCase() === "ispublic") {
      return val ? "Public" : "Private";
    }
    return val ? "Yes" : "No";
  }

  if (typeof val === "number") {
    return val.toString();
  }

  if (typeof val === "string") {
    return val;
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return "(empty)";
    // Filter out raw UUID strings
    const readable = val.filter((item) => !isUuidString(item));
    if (readable.length === 0) return "(empty)";
    return readable.map((item) => formatFieldValue(item)).join(", ");
  }

  if (typeof val === "object") {
    const entries = Object.entries(val as Record<string, unknown>)
      .filter(([k, v]) => !isIdOrInternalKey(k) && !isUuidString(v) && v !== null && v !== undefined)
      .map(([k, v]) => `${formatFieldLabel(k)}: ${formatFieldValue(v)}`);
    return entries.length > 0 ? entries.join("; ") : "—";
  }

  return String(val);
}

export type PropertyDiffRow = {
  key: string;
  label: string;
  before: any;
  after: any;
};

/**
 * Computes the list of modified properties between two JSON states.
 * Filters out internal IDs, UUIDs, and unchanged values.
 */
export function computePropertyDiffs(
  beforeJson?: string | null,
  afterJson?: string | null,
): PropertyDiffRow[] {
  let beforeObj: Record<string, unknown> = {};
  let afterObj: Record<string, unknown> = {};

  try {
    if (beforeJson) beforeObj = JSON.parse(beforeJson);
  } catch {
    // raw fallback
  }

  try {
    if (afterJson) afterObj = JSON.parse(afterJson);
  } catch {
    // raw fallback
  }

  const allKeys = Array.from(
    new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]),
  );

  const rows: PropertyDiffRow[] = [];

  for (const key of allKeys) {
    if (isIdOrInternalKey(key)) continue;

    const beforeVal = beforeObj[key];
    const afterVal = afterObj[key];

    if (isUuidString(beforeVal) || isUuidString(afterVal)) continue;

    if (!areValuesEqual(beforeVal, afterVal)) {
      rows.push({
        key,
        label: formatFieldLabel(key),
        before: formatFieldValue(beforeVal, key),
        after: formatFieldValue(afterVal, key),
      });
    }
  }

  return rows;
}

export type ReactionChangeItem = {
  id: string;
  name: string;
  reaction: Reaction | null;
};

export type StructuralChanges = {
  addedReactions: ReactionChangeItem[];
  removedReactions: ReactionChangeItem[];
  addedSpecies: string[];
  removedSpecies: string[];
  addedPhases: string[];
  removedPhases: string[];
};

/**
 * Parses a JSON string into a Reaction model if valid.
 */
export function parseReactionFromJson(jsonString?: string | null): Reaction | null {
  if (!jsonString) return null;
  try {
    const raw = JSON.parse(jsonString);
    if (!raw || typeof raw !== "object") return null;

    const rawReactants = raw.reactants || raw.Reactants;
    const rawProducts = raw.products || raw.Products;

    const reactants = Array.isArray(rawReactants)
      ? rawReactants.map((r: any) => ({
          speciesId: r.speciesId || r.SpeciesId,
          coefficient: Number(r.coefficient ?? r.Coefficient ?? 1),
        }))
      : [];

    const products = Array.isArray(rawProducts)
      ? rawProducts.map((p: any) => ({
          speciesId: p.speciesId || p.SpeciesId,
          coefficient: Number(p.coefficient ?? p.Coefficient ?? 1),
          branch: p.branch || p.Branch,
        }))
      : [];

    return {
      id: raw.id || raw.Id || "",
      name: raw.name || raw.Name || "",
      type: (raw.type || raw.reactionType || raw.ReactionType || "ARRHENIUS") as any,
      reactants,
      products,
      description: raw.description ?? raw.Description ?? null,
      gasPhaseId: raw.gasPhaseId || raw.GasPhaseId,
      gasPhaseSpeciesId: raw.gasPhaseSpeciesId || raw.GasPhaseSpeciesId,
      attributes: raw.attributes || raw.Attributes || {},
    };
  } catch {
    return null;
  }
}

/**
 * Checks whether two reactions have different equations (reactants, products, or gas phase species).
 */
export function areReactionEquationsDifferent(
  r1?: Reaction | null,
  r2?: Reaction | null,
): boolean {
  if (!r1 || !r2) return r1 !== r2;
  const reactants1 = JSON.stringify(r1.reactants || []);
  const reactants2 = JSON.stringify(r2.reactants || []);
  const products1 = JSON.stringify(r1.products || []);
  const products2 = JSON.stringify(r2.products || []);
  const gasPhase1 = r1.gasPhaseSpeciesId || "";
  const gasPhase2 = r2.gasPhaseSpeciesId || "";
  return reactants1 !== reactants2 || products1 !== products2 || gasPhase1 !== gasPhase2;
}

/**
 * Extracts added and removed reactions, species, and phases from mechanism (or phase) JSON representations.
 */
export function computeStructuralChanges(
  targetType: string,
  beforeJson?: string | null,
  afterJson?: string | null,
  resolveName?: (id: string, fallbackPrefix?: string) => string,
  resolveReaction?: (id: string) => Reaction | null,
): StructuralChanges {
  const result: StructuralChanges = {
    addedReactions: [],
    removedReactions: [],
    addedSpecies: [],
    removedSpecies: [],
    addedPhases: [],
    removedPhases: [],
  };

  if (targetType !== "Mechanism" && targetType !== "Phase") {
    return result;
  }

  let beforeObj: Record<string, any> = {};
  let afterObj: Record<string, any> = {};

  try {
    if (beforeJson) beforeObj = JSON.parse(beforeJson);
  } catch {
    // ignore
  }

  try {
    if (afterJson) afterObj = JSON.parse(afterJson);
  } catch {
    // ignore
  }

  const getName = resolveName || ((id: string, prefix = "Item") => `${prefix} (${id.slice(0, 8)})`);
  const getReaction = resolveReaction || (() => null);

  const extractIds = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => (typeof item === "string" ? item : String(item)));
  };

  // Reactions
  const beforeReactionIds = extractIds(beforeObj.reactionIds || beforeObj.ReactionIds);
  const afterReactionIds = extractIds(afterObj.reactionIds || afterObj.ReactionIds);
  const addedR = afterReactionIds.filter((id) => !beforeReactionIds.includes(id));
  const removedR = beforeReactionIds.filter((id) => !afterReactionIds.includes(id));

  result.addedReactions = addedR.map((id) => {
    const reaction = getReaction(id);
    return {
      id,
      name: reaction?.name || getName(id, "Reaction"),
      reaction,
    };
  });

  result.removedReactions = removedR.map((id) => {
    const reaction = getReaction(id);
    return {
      id,
      name: reaction?.name || getName(id, "Reaction"),
      reaction,
    };
  });

  // Species
  const beforeSpeciesIds = extractIds(beforeObj.speciesIds || beforeObj.SpeciesIds);
  const afterSpeciesIds = extractIds(afterObj.speciesIds || afterObj.SpeciesIds);
  const addedS = afterSpeciesIds.filter((id) => !beforeSpeciesIds.includes(id));
  const removedS = beforeSpeciesIds.filter((id) => !afterSpeciesIds.includes(id));
  result.addedSpecies = addedS.map((id) => getName(id, "Species"));
  result.removedSpecies = removedS.map((id) => getName(id, "Species"));

  // Phases
  const beforePhaseIds = extractIds(beforeObj.phaseIds || beforeObj.PhaseIds);
  const afterPhaseIds = extractIds(afterObj.phaseIds || afterObj.PhaseIds);
  const addedP = afterPhaseIds.filter((id) => !beforePhaseIds.includes(id));
  const removedP = beforePhaseIds.filter((id) => !afterPhaseIds.includes(id));
  result.addedPhases = addedP.map((id) => getName(id, "Phase"));
  result.removedPhases = removedP.map((id) => getName(id, "Phase"));

  return result;
}

/**
 * Creates an entity name lookup function from the current family graph and past change set entries.
 */
export function createEntityNameResolver(
  family?: Family | null,
  history?: ChangeSet[],
): (id: string, fallbackPrefix?: string) => string {
  const map = new Map<string, string>();

  family?.species?.forEach((s) => {
    if (s.id && s.name) map.set(s.id.toLowerCase(), s.name);
  });
  family?.reactions?.forEach((r) => {
    if (r.id && r.name) map.set(r.id.toLowerCase(), r.name);
  });
  family?.phases?.forEach((p) => {
    if (p.id && p.name) map.set(p.id.toLowerCase(), p.name);
  });
  family?.mechanisms?.forEach((m) => {
    if (m.id && m.name) map.set(m.id.toLowerCase(), m.name);
  });

  history?.forEach((cs) => {
    cs.entries?.forEach((e) => {
      if (e.targetId && e.targetName) {
        map.set(e.targetId.toLowerCase(), e.targetName);
      }
    });
  });

  return (id: string, fallbackPrefix: string = "Item") => {
    if (!id) return fallbackPrefix;
    const resolved = map.get(id.toLowerCase());
    if (resolved) return resolved;
    return `${fallbackPrefix} (${id.slice(0, 8)})`;
  };
}

/**
 * Creates a reaction lookup function from current family reactions and history entries.
 */
export function createReactionResolver(
  family?: Family | null,
  history?: ChangeSet[],
): (id: string) => Reaction | null {
  const map = new Map<string, Reaction>();

  family?.reactions?.forEach((r) => {
    if (r.id) map.set(r.id.toLowerCase(), r);
  });

  history?.forEach((cs) => {
    cs.entries?.forEach((e) => {
      if (e.targetType === "Reaction" && e.targetId) {
        const idKey = e.targetId.toLowerCase();
        if (!map.has(idKey)) {
          const parsed = parseReactionFromJson(e.after || e.before);
          if (parsed) {
            map.set(idKey, {
              ...parsed,
              id: e.targetId,
              name: e.targetName || parsed.name,
            });
          }
        }
      }
    });
  });

  return (id: string) => {
    if (!id) return null;
    return map.get(id.toLowerCase()) || null;
  };
}

/**
 * Gathers all species available from the family and change history.
 */
export function getAllAvailableSpecies(
  family?: Family | null,
  history?: ChangeSet[],
): Species[] {
  const map = new Map<string, Species>();

  family?.species?.forEach((s) => {
    if (s.id) map.set(s.id.toLowerCase(), s);
  });

  history?.forEach((cs) => {
    cs.entries?.forEach((e) => {
      if (e.targetType === "Species" && e.targetId && e.targetName) {
        const idKey = e.targetId.toLowerCase();
        if (!map.has(idKey)) {
          map.set(idKey, {
            id: e.targetId,
            name: e.targetName,
            description: "",
          } as Species);
        }
      }
    });
  });

  return Array.from(map.values());
}
