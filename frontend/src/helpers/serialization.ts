import { Family, Mechanism } from "../types/chemistryModels";

/**
 * Stub of serialization of mechanism
 * @param mechanism
 * @param family
 * @returns
 */
export const serializeMechanismJSON = (
  mechanism: Mechanism,
  family: Family,
): string => {
  const jsonObject = {
    version: "1.0.0",
    name: mechanism.name,
    species: family.species.filter((e) => mechanism.speciesIds.includes(e.id)),
    phases: [
      {
        name: "gas",
        species: family.species.filter((e) =>
          mechanism.speciesIds.includes(e.id),
        ),
      },
    ],
    reactions: family.reactions.filter((e) =>
      mechanism.reactionIds.includes(e.id),
    ),
  };

  return JSON.stringify(jsonObject);
};
