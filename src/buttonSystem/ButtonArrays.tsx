import { Family, Mechanism, ProperyType, Reaction, Species, TagMechanism } from "./API_Interfaces";
import { getFamilies, getMechanisms, getProperyTypes, getReactions, getSpecies, getTagMechanism } from "./API_Methods";

export const FamilyButtons: Promise<Family[]>[] = [getFamilies()];

export const MechanismButtons: Promise<Mechanism[]>[] = [getMechanisms()];

export const PropertyTypeButtons: Promise<ProperyType[]>[] = [getProperyTypes()];

export const ReactionButtons: Promise<Reaction[]>[] = [getReactions()];

export const SpeciesButtons: Promise<Species[]>[] = [getSpecies()];

export const TagMechanismButtons: Promise<TagMechanism[]>[] = [getTagMechanism()];
