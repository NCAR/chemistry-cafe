import axios from 'axios';
import { Family, FamilyMechList, PropertyType, PropertyVersion, Reaction, Species, TagMechanism, TagMechanismReactionList, TagMechanismSpeciesList, ReactantProductList} from "./API_Interfaces";

export async function downloadOA(tag_mechanism_uuid?: string){
    if (!tag_mechanism_uuid) return "";
    
    try {
        const response = await axios.get(`http://localhost:5134/api/OpenAtmos/JSON/${tag_mechanism_uuid}`, {
            responseType: 'text', 
            headers: {
                'Content-Type': 'text/plain',
            },
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getFamilies(): Promise<Family[]> {
    try {
        const response = await axios.get<Family[]>(`http://localhost:5134/api/Family/all`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getFamily(uuid?: string): Promise<Family> {
    try {
        const response = await axios.get<Family>(`http://localhost:5134/api/Family/${uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getFamilyMechLists(): Promise<FamilyMechList[]> {
    try {
        const response = await axios.get<FamilyMechList[]>(`http://localhost:5134/api/FamilyMechList/all`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getFamilyMechList(uuid?: string): Promise<FamilyMechList[]> {
    if (!uuid) return [];
    
    try {
        const response = await axios.get<FamilyMechList[]>(`http://localhost:5134/api/FamilyMechList/${uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getReactions(): Promise<Reaction[]> {
    try {
        const response = await axios.get<Reaction[]>(`http://localhost:5134/api/Reaction/all`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getReaction(uuid?: string): Promise<Reaction> {
    try {
        const response = await axios.get<Reaction>(`http://localhost:5134/api/Reaction/${uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch reaction');
    }
}

export async function getReactionsFromTagMechanism(tag_mechanism_uuid?: string): Promise<Reaction[]> {
    if (!tag_mechanism_uuid) return [];
    
    try {
        const response = await axios.get<Reaction[]>(`http://localhost:5134/api/Reaction/TagMechanism/${tag_mechanism_uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getAllSpecies(): Promise<Species[]> {
    try {
        const response = await axios.get<Species[]>(`http://localhost:5134/api/Species/all`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getSpecies(uuid?: string): Promise<Species[]> {
    if (!uuid) return [];
    
    try {
        const response = await axios.get<Species[]>(`http://localhost:5134/api/Species/${uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getSpeciesFromTagMechanism(tag_mechanism_uuid?: string): Promise<Species[]> {
    if (!tag_mechanism_uuid) return [];
    
    try {
        const response = await axios.get<Species[]>(`http://localhost:5134/api/Species/TagMechanism/${tag_mechanism_uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getTagMechanisms(): Promise<TagMechanism[]> {
    try {
        const response = await axios.get<TagMechanism[]>(`http://localhost:5134/api/TagMechanism/all`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getTagMechanism(uuid?: string): Promise<TagMechanism> {
    try {
        const response = await axios.get<TagMechanism>(`http://localhost:5134/api/TagMechanism/${uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch TagMechanism');
    }
}

export async function getTagMechanismsFromFamily(family_uuid?: string): Promise<TagMechanism[]> {
    if (!family_uuid) return [];
    
    try {
        const response = await axios.get<TagMechanism[]>(`http://localhost:5134/api/TagMechanism/Family/${family_uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch TagMechanism');
    }
}

export async function getTagMechanismReactionLists(): Promise<TagMechanismReactionList[]> {
    try {
        const response = await axios.get<TagMechanismReactionList[]>(`http://localhost:5134/api/TagMechanismReactionList/all`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getTagMechanismReactionList(uuid?: string): Promise<TagMechanismReactionList[]> {
    if (!uuid) return [];
    
    try {
        const response = await axios.get<TagMechanismReactionList[]>(`http://localhost:5134/api/TagMechanismReactionList/${uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getTagMechanismSpeciesLists(): Promise<TagMechanismSpeciesList[]> {
    try {
        const response = await axios.get<TagMechanismSpeciesList[]>(`http://localhost:5134/api/TagMechanismSpeciesList/all`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getTagMechanismSpeciesList(uuid?: string): Promise<TagMechanismSpeciesList[]> {
    if (!uuid) return [];
    
    try {
        const response = await axios.get<TagMechanismSpeciesList[]>(`http://localhost:5134/api/TagMechanismSpeciesList/${uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getPropertyTypesFromValidation(validation: string): Promise<PropertyType[]> {
try {
        const response = await axios.get<PropertyType[]>(`http://localhost:5134/api/PropertyType/Validation/${validation}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getPropertyiesFromParent(parent_uuid: string): Promise<PropertyVersion[]> {
    if (!parent_uuid) return [];
    
    try {
        const response = await axios.get<PropertyVersion[]>(`http://localhost:5134/api/PropertyList/Properties/${parent_uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getReactantsFromReactionReactantList(reaction_reactant_list_uuid: string): Promise<ReactantProductList[]> {
    if (!reaction_reactant_list_uuid) return [];
    
    try {
        const response = await axios.get<ReactantProductList[]>(`http://localhost:5134/api/ReactantProductList/Reactants/${reaction_reactant_list_uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getProductsFromReactionReactantList(reaction_product_list_uuid: string): Promise<ReactantProductList[]> {
    if (!reaction_product_list_uuid) return [];
    
    try {
        const response = await axios.get<ReactantProductList[]>(`http://localhost:5134/api/ReactantProductList/Products/${reaction_product_list_uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}