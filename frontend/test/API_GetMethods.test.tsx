import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import axios, { AxiosHeaders, AxiosResponse } from 'axios';
import {
    downloadOAJSON,
    downloadOAYAML,
    getFamilies,
    getFamily,
    getReactions,
    getReaction,
    getReactionsFromTagMechanism,
    getAllSpecies,
    getSpecies,
    getSpeciesFromTagMechanism,
    getTagMechanisms,
    getTagMechanism,
    getTagMechanismsFromFamily,
    getPropertyTypesFromValidation,
    getPropertiesFromParent,
    getReactantsFromReactionReactantList,
    getProductsFromReactionReactantList
} from '../src/API/API_GetMethods';

// Mock axios using vitest's built-in mock function
vi.mock('axios');

describe('API get functions tests', () => {
    const mockResponseData = { success: true };

    function createMockResponse() {
        return {
            data: mockResponseData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {
                headers: new AxiosHeaders({ 'Content-Type': 'text/plain' }),
            },
        } as AxiosResponse;
    }
    
    // Tests for downloadOAJSON
    it('should successfully get OAJSON with valid tag_mechanism_uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const tag_mechanism_uuid = 'valid-uuid';
        const result = await downloadOAJSON(tag_mechanism_uuid);

        expect(mockedGet).toHaveBeenCalledWith(
            `http://localhost:5134/api/OpenAtmos/JSON/${tag_mechanism_uuid}`,
            {
                headers: { 'Content-Type': 'text/plain' },
                responseType: 'text',
            }
        );

        expect(result).toBe(mockResponseData);
    });

    it('should return an empty string when tag_mechanism_uuid is not provided', async () => {
        const mockedGet = vi.spyOn(axios, 'get');
    
        const result = await downloadOAJSON();
    
        expect(result).toBe("");
        expect(mockedGet).not.toHaveBeenCalled();
    
        mockedGet.mockRestore();
    });
    
    it('should handle error correctly for downloadOAJSON', async () => {
        const mockError = new Error('Network error');
        vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

        const tag_mechanism_uuid = 'invalid-uuid';
        await expect(downloadOAJSON(tag_mechanism_uuid)).rejects.toThrow('Network error');

        expect(axios.get).toHaveBeenCalledWith(
            `http://localhost:5134/api/OpenAtmos/JSON/${tag_mechanism_uuid}`,
            {
                headers: { 'Content-Type': 'text/plain' },
                responseType: 'text',
            }
        );
    });

    // Tests for downloadOAYAML
    it('should successfully get OAYAML with valid tag_mechanism_uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const tag_mechanism_uuid = 'valid-uuid';
        const result = await downloadOAYAML(tag_mechanism_uuid);

        expect(mockedGet).toHaveBeenCalledWith(
            `http://localhost:5134/api/OpenAtmos/YAML/${tag_mechanism_uuid}`,
            {
                headers: { 'Content-Type': 'text/plain' },
                responseType: 'text',
            }
        );

        expect(result).toBe(mockResponseData);
    });

    // Tests for getFamilies
    it('should successfully get all families', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
        const result = await getFamilies();

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/Family/all`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getFamily
    it('should successfully get a family with valid uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const uuid = 'valid-uuid';
        const result = await getFamily(uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/Family/${uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getReactions
    it('should successfully get all reactions', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
        const result = await getReactions();

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/Reaction/all`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getReaction
    it('should successfully get a reaction with valid uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const uuid = 'valid-uuid';
        const result = await getReaction(uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/Reaction/${uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getReactionsFromTagMechanism
    it('should successfully get reactions from tag mechanism with valid tag_mechanism_uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const tag_mechanism_uuid = 'valid-uuid';
        const result = await getReactionsFromTagMechanism(tag_mechanism_uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/Reaction/TagMechanism/${tag_mechanism_uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getAllSpecies
    it('should successfully get all species', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
        const result = await getAllSpecies();

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/Species/all`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getSpecies
    it('should successfully get a species with valid uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const uuid = 'valid-uuid';
        const result = await getSpecies(uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/Species/${uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getSpeciesFromTagMechanism
    it('should successfully get species from tag mechanism with valid tag_mechanism_uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const tag_mechanism_uuid = 'valid-uuid';
        const result = await getSpeciesFromTagMechanism(tag_mechanism_uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/Species/TagMechanism/${tag_mechanism_uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getTagMechanisms
    it('should successfully get all tag mechanisms', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
        const result = await getTagMechanisms();

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/TagMechanism/all`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getTagMechanism
    it('should successfully get a tag mechanism with valid uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const uuid = 'valid-uuid';
        const result = await getTagMechanism(uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/TagMechanism/${uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getTagMechanismsFromFamily
    it('should successfully get tag mechanisms from family with valid family_uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const family_uuid = 'valid-uuid';
        const result = await getTagMechanismsFromFamily(family_uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/TagMechanism/Family/${family_uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getPropertyTypesFromValidation
    it('should successfully get property types from validation', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
        
        const validation = 'Species';
        const result = await getPropertyTypesFromValidation(validation);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/PropertyType/Validation/${validation}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getPropertiesFromParent
    it('should successfully get properties from parent with valid parent_uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const parent_uuid = 'valid-uuid';
        const result = await getPropertiesFromParent(parent_uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/PropertyList/Properties/${parent_uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getReactantsFromReactionReactantList
    it('should successfully get reactants from reaction reactant list with valid reactant_list_uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const reactant_list_uuid = 'valid-uuid';
        const result = await getReactantsFromReactionReactantList(reactant_list_uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/ReactantProductList/Reactants/${reactant_list_uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getProductsFromReactionReactantList
    it('should successfully get products from reaction reactant list with valid reactant_list_uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const reactant_list_uuid = 'valid-uuid';
        const result = await getProductsFromReactionReactantList(reactant_list_uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:5134/api/ReactantProductList/Products/${reactant_list_uuid}`);
        expect(result).toEqual(mockResponseData);
    });
});