import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import axios, { AxiosHeaders, AxiosResponse } from 'axios';
import {
    downloadOAJSON,
    downloadOAYAML,
    downloadOAMusicbox,
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
    getPropertyBySpeciesAndMechanism,
    getUsers,
    getUserByEmail,
    getUserById,
    getPropertyById,
    getSpeciesPropertiesByMechanismIDAsync
} from '../src/API/API_GetMethods';
import { Mechanism } from '../src/API/API_Interfaces';

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
 
// Tests for getFamilies
it('should successfully get all families', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
    const result = await getFamilies();

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/families`);
    expect(result).toEqual(mockResponseData);
});

it('should return an empty list if the API call fails for getFamilies', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const result = await getFamilies();
    expect(result).toEqual([]);
});
  

it('should throw an error if the getFamilies() API call fails', async () => {
    const mockError = { response: { status: 500, statusText: 'Internal Server Error' } };
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);
    
    const result = await getFamilies();

    expect(result).toEqual([]);    
});
  

// Tests for getFamily
it('should successfully get a family with valid uuid', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

    const uuid = 'valid-uuid';
    const result = await getFamily(uuid);

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/families/${uuid}`);
    expect(result).toEqual(mockResponseData);
});


it('should throw an error if the getFamily() API call fails', async () => {
    const mockError = { response: { status: 500, statusText: 'Internal Server Error' } };
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);
    
    const uuid = 'valid-uuid';
    await expect(getFamily(uuid)).rejects.toThrow('Failed to fetch family. Please try again later.');
});

   // Tests for getTagMechanisms
it('should successfully get all tag mechanisms', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
    const result = await getMechanisms();

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/mechanism`);
    expect(result).toEqual(mockResponseData);
});

it('should return an empty list if the API call fails for getMechanisms', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const result = await getMechanisms();
    expect(result).toEqual([]);
});

// Tests for getTagMechanismsFromFamily
it('should successfully get tag mechanisms from family with valid family_uuid', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

    const family_uuid = 'valid-uuid';
    const result = await getMechanismsByFamilyId(family_uuid);

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/mechanism/family/${family_uuid}`);
    expect(result).toEqual(mockResponseData);
});

it('should return an empty list if the API call fails for getMechanismsByFamilyID', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const family_uuid = 'valid-uuid';
    const result = await getMechanismsByFamilyId(family_uuid);
    expect(result).toEqual([]);
});

// Tests for getTagMechanism
it('should successfully get a tag mechanism with valid uuid', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

    const uuid = 'valid-uuid';
    const result = await getMechanism(uuid);

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/mechanism/${uuid}`);
    expect(result).toEqual(mockResponseData);
});

it('should throw an error if the getMechanism() API call fails', async () => {
    const mockError = { response: { status: 500, statusText: 'Internal Server Error' } };
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);
    
    const uuid = 'valid-uuid';
    await expect(getMechanism(uuid)).rejects.toThrow('Failed to fetch mechanism. Please try again later.');
});


 // Tests for getAllSpecies
 it('should successfully get all species', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
    const result = await getAllSpecies();

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/species`);
    expect(result).toEqual(mockResponseData);
});

it('should return an empty list if the API call fails for getSpecies', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const result = await getAllSpecies();
    expect(result).toEqual([]);
});

// Tests for getSpecies
it('should successfully get a species with valid uuid', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

    const uuid = 'valid-uuid';
    const result = await getSpecies(uuid);

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/species/${uuid}`);
    expect(result).toEqual(mockResponseData);
});

it('should throw an error if the API call fails for getSpeciesById', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const uuid = 'valid-uuid';
    await expect(getSpecies(uuid)).rejects.toThrow('Failed to fetch species. Please try again later.');
});


 it('should successfully get species with valid familyId', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

    const familyId = 'valid-family-id';
    const result = await getSpeciesByFamilyId(familyId);

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/species/family/${familyId}`);
    expect(result).toEqual(mockResponseData);
});

it('should return an empty list if the API call fails for getSpeciesByFamilyId', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const family_uuid = 'valid-uuid';
    const result = await getSpeciesByFamilyId(family_uuid);
    expect(result).toEqual([]);
});

it('should successfully get species from mechanismId', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

    const mechanismId = 'valid-mechanism-id';
    const result = await getSpeciesByMechanismId(mechanismId);

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/mechanismspecies/mechanism/${mechanismId}`);
    expect(result).toEqual(mockResponseData);
});

it('should return an empty list if the API call fails for getSpeciesByMechanismID', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const mechanism_uuid = 'valid-uuid';
    const result = await getSpeciesByMechanismId(mechanism_uuid);
    expect(result).toEqual([]);
});

// Tests for getReactionsFromTagMechanism
it('should successfully get reactions from tag mechanism with valid tag_mechanism_uuid', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

    const tag_mechanism_uuid = 'valid-uuid';
    const result = await getReactionsByMechanismId(tag_mechanism_uuid);

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/reactions/mechanism/${tag_mechanism_uuid}`);
    expect(result).toEqual(mockResponseData);
});

it('should return an empty list if the API call fails for getReactionsByMechanismId', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const mechanism_uuid = 'valid-uuid';
    const result = await getReactionsByMechanismId(mechanism_uuid);
    expect(result).toEqual([]);
});


it('should successfully get reactions from family with valid familyId', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

    const familyId = 'valid-family-id';
    const result = await getReactionsByFamilyId(familyId);

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/reactions/family/${familyId}`);
    expect(result).toEqual(mockResponseData);
});

it('should return an empty list if the API call fails for getReactionsByFamilyId', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const family_uuid = 'valid-uuid';
    const result = await getReactionsByFamilyId(family_uuid);
    expect(result).toEqual([]);
});

// Tests for getReactions
it('should successfully get all reactions', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
    const result = await getReactions();

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/reactions`);
    expect(result).toEqual(mockResponseData);
});

it('should return an empty list if the API call fails for getReactions', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const result = await getReactions();

    expect(result).toEqual([]);
});

// Tests for getReaction
it('should successfully get a reaction with valid uuid', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

    const uuid = 'valid-uuid';
    const result = await getReaction(uuid);

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/reactions/${uuid}`);
    expect(result).toEqual(mockResponseData);
});

it('should throw an error if the API call fails', async () => {
    const mockError = { response: { status: 500, statusText: 'Internal Server Error' } };
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);
    
    const uuid = 'valid-uuid';
    await expect(getReaction(uuid)).rejects.toThrow('Failed to fetch reaction. Please try again later.');
});

it('should successfully get reactants by reaction ID', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

    const reactionId = 'valid-reaction-id';
    const result = await getReactantsByReactionIdAsync(reactionId);

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/reactionspecies/reaction/${reactionId}/reactants`);
    expect(result).toEqual(mockResponseData);
});

it('should return an empty list if the API call fails for getReactantsByReactionId', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const valid_uuid = 'valid-uuid';
    const result = await getReactantsByReactionIdAsync(valid_uuid);

    expect(result).toEqual([]);
});

it('should successfully get products by reaction ID', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

    const reactionId = 'valid-reaction-id';
    const result = await getProductsByReactionIdAsync(reactionId);

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/reactionspecies/reaction/${reactionId}/products`);
    expect(result).toEqual(mockResponseData);
});

it('should return an empty list if the API call fails for getProductsByReactionId', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const valid_uuid = 'valid-uuid';
    const result = await getProductsByReactionIdAsync(valid_uuid);

    expect(result).toEqual([]);
});

// Tests for getUsers
it('should successfully get all users', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
    const result = await getUsers();

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/users`);
    expect(result).toEqual(mockResponseData);
});

it('should return an empty list if the API call fails for getUsers', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const result = await getUsers();
    expect(result).toEqual([]);
});

it('should successfully get user by email', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
    const email = 'valid-user-email';
    const result = await getUserByEmail(email);

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/users/email/${email}`);
    expect(result).toEqual(mockResponseData);
});

it('should throw an error if the getUserByEmail call fails', async () => {
    const mockError = { response: { status: 500, statusText: 'Internal Server Error' } };
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);
    
    const email = 'valid-email';
    await expect(getUserByEmail(email)).rejects.toThrow('Failed to fetch user. Please try again later.');
});

it('should successfully get user by id', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
    const UserId = 'valid-user-id';
    const result = await getUserById(UserId);

    expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/users/id/${UserId}`);
    expect(result).toEqual(mockResponseData);
});

it('should throw an error if the getUserById call fails with 404', async () => {
    const mockError = { response: 'Internal Server Error'};
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);
    
    const uuid = 'valid-uuid';
    await expect(getUserById(uuid)).rejects.toThrow('Failed to fetch user. Please try again later.');
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
    await expect(getPropertyById(propertyId)).rejects.toThrow('Failed to fetch property. Please try again later.');

    expect(axios.get).toHaveBeenCalledWith(
      `http://localhost:8080/api/properties/id/${propertyId}`
    );
  });

it('should successfully get a property by species and mechanism', async () => {
    const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

    const species = "species";
    const mechanism = "mechanism";
    const result = await getPropertyBySpeciesAndMechanism(species, mechanism);

    expect(mockedGet).toHaveBeenCalledWith(
      `http://localhost:8080/api/properties/id/${species}/${mechanism}`
    );
    expect(result).toEqual(mockResponseData);
  });

it('should handle error correctly for property by species and mechanism', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

    const species = "species";
    const mechanism = "mechanism";
    await expect(getPropertyBySpeciesAndMechanism(species, mechanism)).rejects.toThrow('Failed to fetch property by species and mechanism. Please try again later.');

    expect(axios.get).toHaveBeenCalledWith(
      `http://localhost:8080/api/properties/id/${species}/${mechanism}`
    );
  });

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

    it('should return an empty string when tag_mechanism_uuid is not provided for OAYAML', async () => {
        const mockedGet = vi.spyOn(axios, 'get');
    
        const result = await downloadOAYAML();
    
        expect(result).toBe("");
        expect(mockedGet).not.toHaveBeenCalled();
    
        mockedGet.mockRestore();
    });
    
    it('should handle error correctly for downloadOAYAML', async () => {
        const mockError = new Error('Network error');
        vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

        const tag_mechanism_uuid = 'invalid-uuid';
        await expect(downloadOAYAML(tag_mechanism_uuid)).rejects.toThrow('Network error');

        expect(axios.get).toHaveBeenCalledWith(
            `http://localhost:8080/api/openatmos/mechanism/${tag_mechanism_uuid}/yaml`,
            {
                headers: { 'Content-Type': 'text/plain' },
                responseType: 'text',
            }
        );
    }); 

    // Tests for downloadOAMusicbox
    it('should successfully get OAMusicbox with valid tag_mechanism_uuid', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;

        const tag_mechanism_uuid = 'valid-uuid';
        const result = await downloadOAMusicbox(tag_mechanism_uuid);

        expect(mockedGet).toHaveBeenCalledWith(
            `http://localhost:8080/api/openatmos/mechanism/${tag_mechanism_uuid}/musicbox`,
            {
                responseType: "arraybuffer", 
                headers: { Accept: "application/zip" }
            }
        );

        expect(result).toBe(mockResponseData);
    });

    it('should return an empty string when tag_mechanism_uuid is not provided for OAMusicbox', async () => {
        const mockedGet = vi.spyOn(axios, 'get');
    
        const result = await downloadOAMusicbox();
    
        expect(result).toBe("");
        expect(mockedGet).not.toHaveBeenCalled();
    
        mockedGet.mockRestore();
    });
    
    it('should handle error correctly for downloadOAMusicbox', async () => {
        const mockError = new Error('Network error');
        vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);

        const tag_mechanism_uuid = 'invalid-uuid';
        await expect(downloadOAMusicbox(tag_mechanism_uuid)).rejects.toThrow('Network error');

        expect(axios.get).toHaveBeenCalledWith(
            `http://localhost:8080/api/openatmos/mechanism/${tag_mechanism_uuid}/musicbox`,
            {
                responseType: "arraybuffer", 
                headers: { Accept: "application/zip" }
            }
        );
    });        

    // Tests for getSpeciesPropertiesByMechanismIDAsync
    it('should successfully getSpeciesPropertiesByMechanismIDAsync', async () => {
        const mockedGet = vi.spyOn(axios, 'get').mockResolvedValueOnce(createMockResponse()) as Mock;
        const uuid = 'valid-uuid';
        const result = await getSpeciesPropertiesByMechanismIDAsync(uuid);

        expect(mockedGet).toHaveBeenCalledWith(`http://localhost:8080/api/initialconditionspecies/mechanism/${uuid}`);
        expect(result).toEqual(mockResponseData);
    });

    it('should return an empty list if the API call fails for getSpeciesPropertiesByMechanismIDAsync', async () => {
        const mockError = new Error('Network error');
        vi.spyOn(axios, 'get').mockRejectedValueOnce(mockError);
        const uuid = 'valid-uuid';
    
        const result = await getSpeciesPropertiesByMechanismIDAsync(uuid);
        expect(result).toEqual([]);
    });
    
});