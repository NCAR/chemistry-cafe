export interface Family {
    uuid: string;
    name: string;
    super_tag_mechanism_uuid: string;
    isDel: boolean;
}

export interface FamilyMechList {
    uuid: string;
    family_uuid: string;
    tag_mechanism_uuid: string;
    version: string;
    isDel: boolean;
}

export interface ReactantProductList {
  reactant_product_uuid: string;
  reaction_uuid: string;
  species_uuid: string;
  quantity: number;
  type: string;
}

export interface Reaction {
  uuid: string;
  type: string;
  isDel: boolean;
  reactant_list_uuid: string;
  product_list_uuid: string;
  reaction_string: string;
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

export interface PropertyType {
  uuid: string;
  name: string;
  units: string;
  validation: string;
  isDel: boolean;
}

export interface PropertyList {
  uuid: string;
  parent_uuid: string;
  version: string;
  isDel: boolean;
}

export interface PropertyVersion {
  property_list_uuid: string;
  parent_uuid: string;
  version: string;
  property_list_isDel: boolean;
  property_version_uuid: string;
  parent_property_uuid: string;
  frozen_version: string;
  tag_mechanism_uuid: string;
  property_type: string;
  float_value: number | null;
  double_value: number | null;
  int_value: number | null;
  string_value: string | null;
  action: string;
  user_uuid: string;
  datetime: string;
  property_version_isDel: boolean;
  property_type_uuid: string;
  name: string;
  units: string;
  validation: string;
  property_type_isDel: boolean;
}