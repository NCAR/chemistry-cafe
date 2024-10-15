import axios from 'axios';
import { PropertyList, ReactantProductList } from "./API_Interfaces";

export async function updatePropertyList(propertyList: PropertyList) {
    try {
        const requestData = {
            uuid: propertyList.uuid,
            parent_uuid: propertyList.parent_uuid,
            version: propertyList.version,
            isDel: propertyList.isDel,
        };

        const response = await axios.put(
            'http://localhost:8080/api/PropertyList/update',
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

export async function updateReactantProductList(reactantProductList: ReactantProductList) {
    try {
        const requestData = {
            reactant_product_uuid: reactantProductList.reactant_product_uuid,
            reaction_uuid: reactantProductList.reaction_uuid,
            species_uuid: reactantProductList.species_uuid,
            quantity: reactantProductList.quantity,
        };

        const response = await axios.put(
            'http://localhost:8080/api/ReactantProductList/update',
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