import { describe, expect, it } from "vitest";
import {
  computePropertyDiffs,
  computeStructuralChanges,
  createEntityNameResolver,
  formatFieldLabel,
  formatFieldValue,
  formatLocalDateTime,
  isIdOrInternalKey,
  isUuidString,
} from "../src/helpers/historyFormatting";
import { ChangeSet, Family } from "../src/types/chemistryModels";
import { UUID } from "crypto";

describe("historyFormatting helper", () => {
  describe("formatLocalDateTime", () => {
    it("returns empty string for null or undefined", () => {
      expect(formatLocalDateTime(null)).toBe("");
      expect(formatLocalDateTime(undefined)).toBe("");
    });

    it("parses UTC timestamp and localizes correctly", () => {
      const utcString = "2026-11-10T22:30:00Z";
      const formatted = formatLocalDateTime(utcString);
      expect(formatted).toBeTruthy();
      expect(formatted).toContain("2026");
    });

    it("appends Z if missing timezone offset so local time is parsed from UTC", () => {
      const naiveString = "2026-11-10T22:30:00";
      const withZ = "2026-11-10T22:30:00Z";
      expect(formatLocalDateTime(naiveString)).toBe(formatLocalDateTime(withZ));
    });
  });

  describe("isIdOrInternalKey and isUuidString", () => {
    it("identifies ID keys", () => {
      expect(isIdOrInternalKey("id")).toBe(true);
      expect(isIdOrInternalKey("Id")).toBe(true);
      expect(isIdOrInternalKey("familyVersionId")).toBe(true);
      expect(isIdOrInternalKey("sourceObjectId")).toBe(true);
      expect(isIdOrInternalKey("speciesIds")).toBe(true);
      expect(isIdOrInternalKey("reactionIds")).toBe(true);
      expect(isIdOrInternalKey("phaseIds")).toBe(true);
      expect(isIdOrInternalKey("createdDate")).toBe(true);
      expect(isIdOrInternalKey("name")).toBe(false);
      expect(isIdOrInternalKey("description")).toBe(false);
    });

    it("identifies UUID strings", () => {
      expect(isUuidString("9361526d-3af1-4aea-98cc-bd96f03d7094")).toBe(true);
      expect(isUuidString("test")).toBe(false);
      expect(isUuidString(null)).toBe(false);
      expect(isUuidString(123)).toBe(false);
    });
  });

  describe("computePropertyDiffs", () => {
    it("filters out ID fields and unchanged fields", () => {
      const before = JSON.stringify({
        id: "9361526d-3af1-4aea-98cc-bd96f03d7094",
        name: "test",
        description: "",
        absoluteTolerance: 1,
        constantConcentration: null,
      });

      const after = JSON.stringify({
        id: "9361526d-3af1-4aea-98cc-bd96f03d7094",
        name: "test",
        description: "test description",
        absoluteTolerance: 1,
        constantConcentration: null,
      });

      const diffs = computePropertyDiffs(before, after);

      // ONLY Description should be in diffs!
      expect(diffs).toHaveLength(1);
      expect(diffs[0].key).toBe("description");
      expect(diffs[0].label).toBe("Description");
      expect(diffs[0].before).toBe("(empty)");
      expect(diffs[0].after).toBe("test description");
    });

    it("formats visibility properly", () => {
      const before = JSON.stringify({ isPublic: false });
      const after = JSON.stringify({ isPublic: true });

      const diffs = computePropertyDiffs(before, after);
      expect(diffs).toHaveLength(1);
      expect(diffs[0].label).toBe("Visibility");
      expect(diffs[0].before).toBe("Private");
      expect(diffs[0].after).toBe("Public");
    });
  });

  describe("computeStructuralChanges for Mechanism", () => {
    it("extracts added and removed reactions, species, and phases with resolved names", () => {
      const resolver = (id: string, prefix = "Item") => {
        if (id === "rx-1") return "O3 -> O2 + O";
        if (id === "rx-2") return "NO + O3 -> NO2 + O2";
        if (id === "sp-1") return "O3";
        if (id === "sp-2") return "NO";
        if (id === "ph-1") return "gas";
        return `${prefix} (${id})`;
      };

      const before = JSON.stringify({
        reactionIds: ["rx-1"],
        speciesIds: ["sp-1"],
        phaseIds: ["ph-1"],
      });

      const after = JSON.stringify({
        reactionIds: ["rx-2"],
        speciesIds: ["sp-1", "sp-2"],
        phaseIds: ["ph-1"],
      });

      const changes = computeStructuralChanges("Mechanism", before, after, resolver);

      expect(changes.addedReactions).toEqual([
        { id: "rx-2", name: "NO + O3 -> NO2 + O2", reaction: null },
      ]);
      expect(changes.removedReactions).toEqual([
        { id: "rx-1", name: "O3 -> O2 + O", reaction: null },
      ]);
      expect(changes.addedSpecies).toEqual(["NO"]);
      expect(changes.removedSpecies).toEqual([]);
      expect(changes.addedPhases).toEqual([]);
      expect(changes.removedPhases).toEqual([]);
    });
  });

  describe("createEntityNameResolver", () => {
    it("resolves names from family and history entries", () => {
      const family: Family = {
        id: "fam-1" as UUID,
        name: "Test Fam",
        description: "",
        isPublic: true,
        mechanisms: [],
        species: [{ id: "sp-1" as UUID, name: "Ozone", description: "" }],
        reactions: [{ id: "rx-1" as UUID, name: "Reaction Alpha" } as any],
        phases: [{ id: "ph-1" as UUID, name: "Gas Phase", description: "", speciesIds: [] }],
      };

      const history: ChangeSet[] = [
        {
          id: "cs-1",
          familyId: "fam-1" as UUID,
          timestamp: "2026-11-10T12:00:00Z",
          entries: [
            {
              id: "e-1",
              changeSetId: "cs-1",
              targetType: "Species",
              targetId: "sp-deleted" as UUID,
              targetName: "Old Deleted Species",
              action: "Deleted",
            },
          ],
        },
      ];

      const resolve = createEntityNameResolver(family, history);

      expect(resolve("sp-1")).toBe("Ozone");
      expect(resolve("rx-1")).toBe("Reaction Alpha");
      expect(resolve("ph-1")).toBe("Gas Phase");
      expect(resolve("sp-deleted")).toBe("Old Deleted Species");
      expect(resolve("unknown-id")).toBe("Item (unknown-)");
    });
  });
});

