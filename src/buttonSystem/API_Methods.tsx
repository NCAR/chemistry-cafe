import axios from 'axios';
import { Family, Mechanism, ProperyType, Reaction, Species, TagMechanism } from "./API_Interfaces";

export async function getFamilies(): Promise<Family[]> {
    try {
        const response = await axios.get<Family[]>('http://localhost:5134/api/Family/all');
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getMechanisms(): Promise<Mechanism[]> {
    try {
        const response = await axios.get<Mechanism[]>('http://localhost:5134/api/Mechanism/all');
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getProperyTypes(): Promise<ProperyType[]> {
    try {
        const response = await axios.get<ProperyType[]>('http://localhost:5134/api/ProperyType/all');
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getReactions(): Promise<Reaction[]> {
    try {
        const response = await axios.get<Reaction[]>('http://localhost:5134/api/Reaction/all');
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getSpecies(): Promise<Species[]> {
    try {
        const response = await axios.get<Species[]>('http://localhost:5134/api/Species/all');
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getTagMechanism(): Promise<TagMechanism[]> {
    try {
        const response = await axios.get<TagMechanism[]>('http://localhost:5134/api/TagMechanism/all');
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}
