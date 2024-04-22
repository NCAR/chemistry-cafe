import axios from 'axios';
import { FamilyTagMechList, TagMechanismReactionList, TagMechanismSpeciesList, PropertyList, PropertyVersion, ReactantProductList } from "./API_Interfaces";

export async function createFamily(name: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/Family/create',
            "\"" + name + "\"",
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function createFamilyTagMechList(familyMechListData: FamilyTagMechList) {
    try {
        const requestData = {
            family_uuid: familyMechListData.family_uuid,
            tag_mechanism_uuid: familyMechListData.tag_mechanism_uuid,
            version: familyMechListData.version,
        };
        
        const response = await axios.post(
            'http://localhost:5134/api/FamilyTagMechList/create',
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function createTagMechanism(name: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/TagMechanism/create',
            "\"" + name + "\"",
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function createReaction(type: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/Reaction/create',
            "\"" + type + "\"",
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function createSpecies(type: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/Species/create',
            "\"" + type + "\"",
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data as string;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function createTagMechanismReactionList(tagMechanismReactionListDataArray: TagMechanismReactionList[]) {
    try {
        const requests = tagMechanismReactionListDataArray.map((tagMechanismReactionListData) => {
            const requestData = {
                reaction_uuid: tagMechanismReactionListData.reaction_uuid,
                tag_mechanism_uuid: tagMechanismReactionListData.tag_mechanism_uuid,
                version: tagMechanismReactionListData.version,
            };
            return axios.post(
                'http://localhost:5134/api/TagMechanismReactionList/create',
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        });

        const responses = await Promise.all(requests);
        return responses.map((response) => response.data);
    } catch (error) {
        console.error(error);
        throw error;
    }
}


export async function createTagMechanismSpeciesList(tagMechanismSpeciesListDataArray: TagMechanismSpeciesList[]) {
    try {
        const requests = tagMechanismSpeciesListDataArray.map((tagMechanismSpeciesListData) => {
            const requestData = {
                species_uuid: tagMechanismSpeciesListData.species_uuid,
                tag_mechanism_uuid: tagMechanismSpeciesListData.tag_mechanism_uuid,
                version: tagMechanismSpeciesListData.version,
            };
            return axios.post(
                'http://localhost:5134/api/TagMechanismSpeciesList/create',
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        });

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
            'http://localhost:5134/api/PropertyList/create',
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
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
            'http://localhost:5134/api/PropertyVersion/create',
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function createReactantProduct(reactantProductList: ReactantProductList) {
    try {
        const requestData = {
            reactant_product_uuid: reactantProductList.reactant_product_uuid,
            reaction_uuid: reactantProductList.reaction_uuid,
            species_uuid: reactantProductList.species_uuid,
            quantity: reactantProductList.quantity,
        };

        const response = await axios.post(
            'http://localhost:5134/api/ReactantProductList/create',
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}