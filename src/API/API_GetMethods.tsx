import axios from 'axios';
import { Family, FamilyMechList, Mechanism, MechTagMechList, PropertyVersion, Reaction, Species, TagMechanism, TagMechanismReactionList, TagMechanismSpeciesList, ReactantProductList} from "./API_Interfaces";

export async function getFamilies(): Promise<Family[]> {
    try {
        const response = await axios.get<Family[]>(`http://localhost:5134/api/Family/all`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getFamily(uuid?: string): Promise<Family[]> {
    if (!uuid) return [];
    
    try {
        const response = await axios.get<Family[]>(`http://localhost:5134/api/Family/${uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
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

export async function getMechanisms(): Promise<Mechanism[]> {
    try {
        const response = await axios.get<Mechanism[]>(`http://localhost:5134/api/Mechanism/all`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getMechanism(uuid?: string): Promise<Mechanism[]> {
    if (!uuid) return [];
    
    try {
        const response = await axios.get<Family[]>(`http://localhost:5134/api/Mechanism/${uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getMechanismsFromFamily(family_uuid?: string): Promise<Mechanism[]> {
    if (!family_uuid) return [];
    
    try {
        const response = await axios.get<Mechanism[]>(`http://localhost:5134/api/Mechanism/Family/${family_uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getMechTagMechLists(): Promise<MechTagMechList[]> {
    try {
        const response = await axios.get<MechTagMechList[]>(`http://localhost:5134/api/MechTagMechList/all`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getMechTagMechList(uuid?: string): Promise<MechTagMechList[]> {
    if (!uuid) return [];
    
    try {
        const response = await axios.get<MechTagMechList[]>(`http://localhost:5134/api/MechTagMechList/${uuid}`);
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

export async function getTagMechanismsFromMechanism(mechanism_uuid?: string): Promise<TagMechanism[]> {
    if (!mechanism_uuid) return [];
    
    try {
        const response = await axios.get<TagMechanism[]>(`http://localhost:5134/api/TagMechanism/Mechanism/${mechanism_uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
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
        const response = await axios.get<ReactantProductList[]>(`http://localhost:5134/api/ReactantProductList/Reactants/${reaction_product_list_uuid}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}