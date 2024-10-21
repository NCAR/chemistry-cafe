import axios from "axios";
import {
  FamilyTagMechList,
  TagMechanismReactionList,
  TagMechanismSpeciesList,
  PropertyList,
  PropertyVersion,
  ReactantProductList,
  Family,
  Mechanism,
  Species,
  Reaction,
  ReactionSpecies,
  MechanismReaction,
} from "./API_Interfaces";

export async function createFamily(familyData: Family) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/families",
      familyData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as Family;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createMechanism(mechanismData: Mechanism) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/species",
      mechanismData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as Mechanism;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createReaction(reactionData: Reaction) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/reactions",
      reactionData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as Reaction;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createSpecies(speciesData: Species) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/species",
      speciesData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as Species;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addSpeciesToReaction(
  reactionSpeciesData: ReactionSpecies
) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/reaction_species",
      reactionSpeciesData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as ReactionSpecies;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addReactionToMechanism(
  mechanismReactionData: MechanismReaction
) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/mechanism_reactions",
      mechanismReactionData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as MechanismReaction;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createTagMechanismSpeciesList(
  tagMechanismSpeciesListDataArray: TagMechanismSpeciesList[]
) {
  try {
    const requests = tagMechanismSpeciesListDataArray.map(
      (tagMechanismSpeciesListData) => {
        const requestData = {
          species_uuid: tagMechanismSpeciesListData.species_uuid,
          tag_mechanism_uuid: tagMechanismSpeciesListData.tag_mechanism_uuid,
          version: tagMechanismSpeciesListData.version,
        };
        return axios.post(
          "http://localhost:8080/api/TagMechanismSpeciesList/create",
          requestData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    );

    const responses = await Promise.all(requests);
    return responses.map((response) => response.data);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createPropertyList(propertyList: PropertyList) {
  try {
    const requestData = {
      parent_uuid: propertyList.parent_uuid,
      version: propertyList.version,
    };

    const response = await axios.post(
      "http://localhost:8080/api/PropertyList/create",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createPropertyVersion(propertyVersion: PropertyVersion) {
  try {
    const requestData = {
      parent_property_uuid: propertyVersion.parent_property_uuid,
      frozen_version: propertyVersion.frozen_version,
      tag_mechanism_uuid: propertyVersion.tag_mechanism_uuid,
      property_type: propertyVersion.property_type,
      float_value: propertyVersion.float_value,
      double_value: propertyVersion.double_value,
      int_value: propertyVersion.int_value,
      string_value: propertyVersion.string_value,
      action: propertyVersion.action,
      user_uuid: propertyVersion.user_uuid,
      datetime: propertyVersion.datetime,
    };

    const response = await axios.post(
      "http://localhost:8080/api/PropertyVersion/create",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createReactantProduct(
  reactantProductList: ReactantProductList
) {
  try {
    const requestData = {
      reactant_product_uuid: reactantProductList.reactant_product_uuid,
      reaction_uuid: reactantProductList.reaction_uuid,
      species_uuid: reactantProductList.species_uuid,
      quantity: reactantProductList.quantity,
    };

    const response = await axios.post(
      "http://localhost:8080/api/ReactantProductList/create",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
