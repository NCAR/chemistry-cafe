export interface Family {
    uuid: string;
    name: string;
    isDel: boolean;
}

export interface FamilyMechList {
    uuid: string;
    family_uuid: string;
    mechanism_uuid: string;
    version: string;
    isDel: boolean;
}

export interface Mechanism {
    uuid: string;
    name: string;
    isDel: boolean;
}

export interface MechTagMechList {
  uuid: string;
  family_uuid: string;
  mechanism_uuid: string;
  version: string;
  isDel: boolean;
}

export interface ReactantProductList {
  reactant_product_uuid: string;
  reaction_uuid: string;
  species_uuid: string;
  quantity: Int16Array;
}

export interface Reaction {
  uuid: string;
  type: string;
  isDel: boolean;
  reactant_list_uuid: string;
  product_list_uuid: string;
}

export interface Species {
  uuid: string;
  type: string;
  isDel: boolean;
}

export interface TagMechanism {
  uuid: string;
  tag: string;
  isDel: boolean;
}

export interface TagMechanismReactionList {
  uuid: string;
  reaction_uuid: string;
  tag_mechanism_uuid: string;
  version: string;
  isDel: boolean;
}

export interface TagMechanismSpeciesList {
  uuid: string;
  species_uuid: string;
  tag_mechanism_uuid: string;
  version: string;
  isDel: boolean;
}

export interface ProperyType {
  uuid: string;
  name: string;
  units: string;
  validation: string;
  isdel: boolean;
}