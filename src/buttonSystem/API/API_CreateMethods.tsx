import axios from 'axios';
import { FamilyMechList, MechTagMechList, TagMechanismReactionList, TagMechanismSpeciesList} from "./API_Interfaces";

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
        const response = await axios.post(
            'http://localhost:5134/api/MechTagMechList/create',
            JSON.stringify(mechTagMechListData),
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
            'http://localhost:5134/api/Mechanism/create',
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
        return response.data;
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
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function createTagMechanismReactionList(tagMechanismReactionListData: TagMechanismReactionList) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/TagMechanismReactionList/create',
            JSON.stringify(tagMechanismReactionListData),
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
        const response = await axios.post(
            'http://localhost:5134/api/TagMechanismSpeciesList/create',
            JSON.stringify(tagMechanismSpeciesListData),
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