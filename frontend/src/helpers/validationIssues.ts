import { initModule } from "@ncar/musica";
import { Family, Mechanism } from "../types/chemistryModels";
import { mechanismItems, toMusicaMechanism } from "./musicaAdapter";

/** The kinds of items that a validator message can point to. */
export type IssueItemKind = "species" | "phase" | "reaction";

/**
 * The item that causes a validator message, and the part of the item when the
 * validator gives it.
 */
export type IssueTarget = {
  kind: IssueItemKind;
  /** The ID of the species, phase, or reaction. */
  id: string;
  /**
   * The key in the item that has the problem, for example "products",
   * "gas phase", or "species". It is undefined when the message is about the
   * whole item.
   */
  field?: string;
  /** The species that the problem part names, if it names one. */
  speciesId?: string;
};

/** A validator message and the item that causes it. */
export type ValidationIssue = {
  message: string;
  mechanismId: string;
  mechanismName: string;
  /** Undefined when the message is not about one item. */
  target?: IssueTarget;
};

const sectionKinds: Record<string, IssueItemKind> = {
  species: "species",
  phases: "phase",
  reactions: "reaction",
};

/** Gives the keys of a JSON Pointer (RFC 6901), with "~1" and "~0" undone. */
const pointerKeys = (path: string): string[] =>
  path
    .split("/")
    .slice(1)
    .map((key) => key.replace(/~1/g, "/").replace(/~0/g, "~"));

/** Gives the value at the keys of a JSON Pointer, or undefined. */
const valueAt = (json: unknown, keys: string[]): unknown =>
  keys.reduce<unknown>(
    (value, key) =>
      value !== null && typeof value === "object"
        ? (value as Record<string, unknown>)[key]
        : undefined,
    json,
  );

/** Gives the name that a reference in the JSON gives: "A" or { name: "A" }. */
const nameOf = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const name = record["name"] ?? record["species name"];
    return typeof name === "string" ? name : undefined;
  }
  return undefined;
};

/**
 * Finds the item and the part of the item that a path of the validator points
 * to, for example "/reactions/3/products/0" is the first product of the fourth
 * reaction of the mechanism.
 * @param json The JSON of the mechanism that the validator checked
 * @returns The target, or undefined when the path is not in an item
 */
export function targetOfPath(
  mechanism: Mechanism,
  family: Family,
  json: unknown,
  path: string | null | undefined,
): IssueTarget | undefined {
  if (!path) return undefined;
  const keys = pointerKeys(path);
  const kind = sectionKinds[keys[0]];
  const index = Number(keys[1]);
  if (!kind || !Number.isInteger(index)) return undefined;

  const items = mechanismItems(mechanism, family);
  const item =
    kind === "species"
      ? items.species[index]
      : kind === "phase"
        ? items.phases[index]
        : items.reactions[index];
  if (!item) return undefined;

  const target: IssueTarget = { kind, id: item.id };
  if (keys.length > 2) {
    target.field = keys[2];
    // A reference below the item names a species, except the gas phase of a
    // reaction, which names a phase.
    if (target.field !== "gas phase") {
      const name = nameOf(valueAt(json, keys));
      target.speciesId = family.species.find((s) => s.name === name)?.id;
    }
  }
  return target;
}

/**
 * Checks a mechanism with the musica (MechanismConfiguration) validator.
 * @param mechanism Mechanism to check
 * @param family Family mechanism is in
 * @returns The problems. The list is empty when the mechanism is valid.
 */
export const validateMechanism = async (
  mechanism: Mechanism,
  family: Family,
): Promise<ValidationIssue[]> => {
  await initModule();
  const about = { mechanismId: mechanism.id, mechanismName: mechanism.name };
  try {
    const musicaMechanism = toMusicaMechanism(mechanism, family);
    const json = musicaMechanism.getJSON();
    return musicaMechanism
      .validate()
      .map((error: { message: string; path?: string | null }) => ({
        ...about,
        // The validator checks one line of JSON, so the ":line:column error:"
        // prefix does not help the user.
        message: error.message.replace(/^:\d+:\d+ error: /, ""),
        target: targetOfPath(mechanism, family, json, error.path),
      }));
  } catch (e) {
    return [{ ...about, message: e instanceof Error ? e.message : String(e) }];
  }
};

/** Checks each mechanism of a family. */
export const validateFamily = async (
  family: Family,
): Promise<ValidationIssue[]> => {
  const issues: ValidationIssue[] = [];
  for (const mechanism of family.mechanisms) {
    issues.push(...(await validateMechanism(mechanism, family)));
  }
  return issues;
};

/** Groups problems by the ID of the item that causes them. */
export const issuesByItem = (
  issues: ValidationIssue[],
): Map<string, ValidationIssue[]> => {
  const byItem = new Map<string, ValidationIssue[]>();
  for (const issue of issues) {
    if (!issue.target) continue;
    byItem.set(issue.target.id, [
      ...(byItem.get(issue.target.id) ?? []),
      issue,
    ]);
  }
  return byItem;
};

/** Counts the items of each kind that have at least one problem. */
export const countItemsWithIssues = (
  issues: ValidationIssue[],
): Record<IssueItemKind, number> => {
  const ids: Record<IssueItemKind, Set<string>> = {
    species: new Set(),
    phase: new Set(),
    reaction: new Set(),
  };
  for (const issue of issues) {
    if (issue.target) ids[issue.target.kind].add(issue.target.id);
  }
  return {
    species: ids.species.size,
    phase: ids.phase.size,
    reaction: ids.reaction.size,
  };
};
