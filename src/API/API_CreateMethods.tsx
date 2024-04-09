import axios from 'axios';
import { FamilyMechList, MechTagMechList, TagMechanismReactionList, TagMechanismSpeciesList, PropertyType, PropertyList, PropertyVersion, ReactantProductList } from "./API_Interfaces";

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

export async function createFamilyMechList(familyMechListData: FamilyMechList) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/FamilyMechList/create',
            JSON.stringify(familyMechListData),
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

export async function createMechanism(name: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/Mechanism/create',
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

export async function createMechTagMechList(mechTagMechListData: MechTagMechList) {
    try {
        const requestData = {
            mechanism_uuid: mechTagMechListData.mechanism_uuid,
            tag_mechanism_uuid: mechTagMechListData.tag_mechanism_uuid,
            version: mechTagMechListData.version,
        };
        
        const response = await axios.post(
            'http://localhost:5134/api/MechTagMechList/create',
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

export async function createTagMechanism(tag: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/TagMechanism/create',
            "\"" + tag + "\"",
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

export async function createTagMechanismReactionList(tagMechanismReactionListData: TagMechanismReactionList) {
    try {
        const requestData = {
            reaction_uuid: tagMechanismReactionListData.reaction_uuid,
            tag_mechanism_uuid: tagMechanismReactionListData.tag_mechanism_uuid,
            version: tagMechanismReactionListData.version,
        };
        
        const response = await axios.post(
            'http://localhost:5134/api/TagMechanismReactionList/create',
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

export async function createTagMechanismSpeciesList(tagMechanismSpeciesListData: TagMechanismSpeciesList) {
    try {
        const requestData = {
            species_uuid: tagMechanismSpeciesListData.species_uuid,
            tag_mechanism_uuid: tagMechanismSpeciesListData.tag_mechanism_uuid,
            version: tagMechanismSpeciesListData.version,
        };

        const response = await axios.post(
            'http://localhost:5134/api/TagMechanismSpeciesList/create',
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

export async function createPropertyType(propertyType: PropertyType) {
    try {
        const requestData = {
            name: propertyType.name,
            units: propertyType.units,
            validation: propertyType.validation,
        };

        const response = await axios.post(
            'http://localhost:5134/api/PropertyType/create',
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
            mechanism_uuid: propertyVersion.mechanism_uuid,
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