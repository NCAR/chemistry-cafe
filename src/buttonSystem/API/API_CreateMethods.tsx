import axios from 'axios';
import { FamilyMechList, MechTagMechList, TagMechanismReactionList, TagMechanismSpeciesList} from "./API_Interfaces";

async function createFamily(name: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/Family/create',
            name ,
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function createFamilyMechList(familyMechListData: FamilyMechList) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/FamilyMechList/create',
            familyMechListData,
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function createMechanism(name: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/Mechanism/create',
            name,
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function createMechTagMechList(mechTagMechListData: MechTagMechList) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/MechTagMechList/create',
            mechTagMechListData,
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function createReaction(type: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/Mechanism/create',
            type,
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function createSpecies(type: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/Species/create',
            type,
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function createTagMechanism(tag: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/TagMechanism/create',
            tag,
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function createTagMechanismReactionList(tagMechanismReactionListData: TagMechanismReactionList) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/TagMechanismReactionList/create',
            tagMechanismReactionListData,
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function createTagMechanismSpeciesList(tagMechanismSpeciesListData: TagMechanismSpeciesList) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/TagMechanismSpeciesList/create',
            tagMechanismSpeciesListData,
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}