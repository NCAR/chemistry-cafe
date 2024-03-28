export interface Family {
    uuid: string;
    name: string;
    isdel: boolean;
}

export interface FamilyMechList {
    uuid: string;
    family_uuid: string;
    mechanism_uuid: string;
    version: string;
    isdel: boolean;
}

export interface Mechanism {
    uuid: string;
    name: string;
    isdel: boolean;
}

export interface MechTagMechList {
  uuid: string;
  family_uuid: string;
  mechanism_uuid: string;
  version: string;
  isdel: boolean;
}

export interface Reaction {
  uuid: string;
  type: string;
  isdel: boolean;
}

export interface Species {
  uuid: string;
  type: string;
  isdel: boolean;
}

export interface TagMechanism {
  uuid: string;
  tag: string;
  isdel: boolean;
}

export interface TagMechanismReactionList {
  uuid: string;
  reaction_uuid: string;
  tag_mechanism_uuid: string;
  version: string;
  isdel: boolean;
}

export interface TagMechanismSpeciesList {
  uuid: string;
  species_uuid: string;
  tag_mechanism_uuid: string;
  version: string;
  isdel: boolean;
}

export interface ProperyType {
  uuid: string;
  name: string;
  units: string;
  validation: string;
  isdel: boolean;
}