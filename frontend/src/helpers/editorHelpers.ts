import { Family, Species } from "../types/chemistryModels";

export const applySpeciesRowUpdate = (
  family: Family,
  updatedSpecies: Species,
): Family => {
  const speciesList = [...family.species];
  const existingIndex = speciesList.findIndex(
    (element) => element.id === updatedSpecies.id,
  );

  if (existingIndex >= 0) {
    speciesList[existingIndex] = {
      ...speciesList[existingIndex],
      ...updatedSpecies,
    };
  } else {
    speciesList.unshift({
      ...updatedSpecies,
    });
  }

  return {
    ...family,
    species: speciesList,
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
