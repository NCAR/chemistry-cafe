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
    getReactionsByMechanismId,
    getAllSpecies,
    getSpecies,
    getSpeciesByMechanismId,
    getMechanisms,
    getMechanism,
    getMechanismsByFamilyId,
    getSpeciesByFamilyId,
    getReactionsByFamilyId,
    getReactantsByReactionIdAsync,
    getProductsByReactionIdAsync,
    getPropertyById
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
            `http://localhost:8080/api/openatmos/mechanism/${tag_mechanism_uuid}/json`,
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
            `http://localhost:8080/api/openatmos/mechanism/${tag_mechanism_uuid}/json`,
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
            `http://localhost:8080/api/openatmos/mechanism/${tag_mechanism_uuid}/yaml`,
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

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/families`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getFamily
    it('should successfully get a family with valid uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const uuid = 'valid-uuid';
        const result = await getFamily(uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/families/${uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getReactions
    it('should successfully get all reactions', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
        const result = await getReactions();

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/reactions`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getReaction
    it('should successfully get a reaction with valid uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const uuid = 'valid-uuid';
        const result = await getReaction(uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/reactions/${uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getReactionsFromTagMechanism
    it('should successfully get reactions from tag mechanism with valid tag_mechanism_uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const tag_mechanism_uuid = 'valid-uuid';
        const result = await getReactionsByMechanismId(tag_mechanism_uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/reactions/mechanism/${tag_mechanism_uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getAllSpecies
    it('should successfully get all species', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
        const result = await getAllSpecies();

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/species`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getSpecies
    it('should successfully get a species with valid uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const uuid = 'valid-uuid';
        const result = await getSpecies(uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/species/${uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getSpeciesFromTagMechanism
    // it('should successfully get species from tag mechanism with valid tag_mechanism_uuid', async () => {
    //     const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

    //     const tag_mechanism_uuid = 'valid-uuid';
    //     const result = await getSpeciesFromTagMechanism(tag_mechanism_uuid);

    //     expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/Species/TagMechanism/${tag_mechanism_uuid}`);
    //     expect(result).toEqual(mockResponseData);
    // });

    // Tests for getTagMechanisms
    it('should successfully get all tag mechanisms', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
        const result = await getMechanisms();

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/mechanism`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getTagMechanism
    it('should successfully get a tag mechanism with valid uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const uuid = 'valid-uuid';
        const result = await getMechanism(uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/mechanism/${uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    // Tests for getTagMechanismsFromFamily
    it('should successfully get tag mechanisms from family with valid family_uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const family_uuid = 'valid-uuid';
        const result = await getMechanismsByFamilyId(family_uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/mechanism/family/${family_uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    it('should successfully get species from family with valid familyId', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
    
        const familyId = 'valid-family-id';
        const result = await getSpeciesByFamilyId(familyId);
    
        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/species/family/${familyId}`);
        expect(result).toEqual(mockResponseData);
    });

    it('should successfully get reactions from family with valid familyId', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
    
        const familyId = 'valid-family-id';
        const result = await getReactionsByFamilyId(familyId);
    
        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/reactions/family/${familyId}`);
        expect(result).toEqual(mockResponseData);
    });

    it('should successfully get reactants by reaction ID', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
    
        const reactionId = 'valid-reaction-id';
        const result = await getReactantsByReactionIdAsync(reactionId);
    
        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/reactionspecies/reaction/${reactionId}/reactants`);
        expect(result).toEqual(mockResponseData);
    });

    it('should successfully get products by reaction ID', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
    
        const reactionId = 'valid-reaction-id';
        const result = await getProductsByReactionIdAsync(reactionId);
    
        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/reactionspecies/reaction/${reactionId}/products`);
        expect(result).toEqual(mockResponseData);
    });

    it('should successfully get a property by id', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
    
        const propertyId = 'valid-property-id';
        const result = await getPropertyById(propertyId);
    
        expect(mockedGet).toHaveBeenCalledWith(
          `http://localhost:8080/api/properties/id/${propertyId}`
        );
        expect(result).toEqual(mockResponseData);
      });
    
      it('should handle error correctly for getPropertyById', async () => {
        const mockError = new Error('Network error');
        vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);
    
        const propertyId = 'invalid-property-id';
        await expect(getPropertyById(propertyId)).rejects.toThrow('Network error');
    
        expect(axios.get).toHaveBeenCalledWith(
          `http://localhost:8080/api/properties/id/${propertyId}`
        );
      });
    
    
    
    
});