import { UUID } from "crypto";
import {Family, Reaction, Species} from "../types/chemistryModels";

export const applySpeciesRowUpdate = (
  family: Family,
  ...updatedSpecies: Species[]
): Family => {
  const speciesList = [...family.species];
  const idxMap = new Map<UUID,number>(speciesList.map((s,i) => [s.id,i]));
  const temp = [];
  for (const upSpec of updatedSpecies) {
    const idx= idxMap.get(upSpec.id)
    if (idx!==undefined) {
      speciesList[idx] = {
        ...speciesList[idx],
        ...upSpec,
      };
    } else {
      idxMap.set(upSpec.id,speciesList.length)
      temp.push({
        ...upSpec,
      });
    }
  }
  speciesList.unshift(...temp)

  return {
    ...family,
    species: speciesList,
  };
};
export const applyReactionRowUpdate = (
    family: Family,
    ...updatedReactions: Reaction[]
): Family => {
  const reactionList = [...family.reactions];
  const idxMap = new Map<UUID,number>(reactionList.map((s,i) => [s.id,i]));
  const temp = [];
  for (const upReac of updatedReactions) {
    const idx= idxMap.get(upReac.id)
    if (idx!==undefined) {
      reactionList[idx] = {
        ...upReac,
      };
    } else {
      idxMap.set(upReac.id,reactionList.length)
      temp.push({
        ...upReac,
      });
    }
  }
  reactionList.unshift(...temp)

  return {
    ...family,
    reactions: reactionList,
  };
};

const isOptionSet = (value: unknown): boolean => {
  return (
    value != null && value != "" && !(typeof value === "number" && isNaN(value))
  );
};

export const speciesExclusiveConflict = (species: Species): boolean => {
  return (
    (isOptionSet(species.constantConcentration) ? 1 : 0) +
      (isOptionSet(species.constantMixingRatio) ? 1 : 0) +
      (species.isThirdBody ? 1 : 0) >
    1
  );
};

/** Deletes reactions from a family and from each mechanism that has them. */
export function removeReactions(
  family: Family,
  reactionIds: Array<UUID>,
): Family {
  const ids = new Set<string>(reactionIds);
  return {
    ...family,
    reactions: family.reactions.filter((reaction) => !ids.has(reaction.id)),
    mechanisms: family.mechanisms.map((mechanism) => ({
      ...mechanism,
      reactionIds: mechanism.reactionIds.filter((id) => !ids.has(id)),
    })),
    isModified: true,
  };
}
