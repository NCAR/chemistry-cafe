import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import axios, { AxiosHeaders, AxiosResponse } from 'axios';
import {
    createFamily,
    createFamilyTagMechList,
    createTagMechanism,
    createReaction,
    createSpecies,
    createPropertyList,
    createPropertyVersion,
    createReactantProduct,
} from '../src/API/API_CreateMethods';

// Mock axios using vitest's built-in mock function
vi.mock('axios');

describe('API methods', () => {
    const mockResponseData = { success: true };

    function createMockResponse() {
        return {
            data: mockResponseData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {
                headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
            },
        } as AxiosResponse;
    }

    it('should create family and return data', async () => {
        const mockedCreate = vi.spyOn(axios, 'post').mockResolvedValue(createMockResponse()) as Mock;

        const name = 'family_name';
        const result = await createFamily(name);

        expect(mockedCreate).toHaveBeenCalledWith(
            `http://localhost:8080/api/Family/create`,
            `"${name}"`,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        // Verify the function returns the expected data
        expect(result).toEqual(mockResponseData);
    });

    it('should create family tag mechanism list and return data', async () => {
        const mockedPost = vi.spyOn(axios, 'post').mockResolvedValue(createMockResponse()) as Mock;

        const familyMechListData: any = {
            family_uuid: 'family_uuid',
            tag_mechanism_uuid: 'tag_mechanism_uuid',
            version: 1,
        };

        const result = await createFamilyTagMechList(familyMechListData);

        expect(mockedPost).toHaveBeenCalledWith(
            'http://localhost:8080/api/FamilyTagMechList/create',
            familyMechListData,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        expect(result).toEqual(mockResponseData);
    });

    it('should create tag mechanism and return data', async () => {
        const mockedPost = vi.spyOn(axios, 'post').mockResolvedValue(createMockResponse()) as Mock;

        const name = 'tag_mechanism_name';
        const result = await createTagMechanism(name);

        expect(mockedPost).toHaveBeenCalledWith(
            'http://localhost:8080/api/TagMechanism/create',
            `"${name}"`,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        expect(result).toEqual(mockResponseData);
    });

    it('should create reaction and return data', async () => {
        const mockedPost = vi.spyOn(axios, 'post').mockResolvedValue(createMockResponse()) as Mock;

        const type = 'reaction_type';
        const result = await createReaction(type);

        expect(mockedPost).toHaveBeenCalledWith(
            'http://localhost:8080/api/Reaction/create',
            `"${type}"`,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        expect(result).toEqual(mockResponseData);
    });

    it('should create species and return data', async () => {
        const mockedPost = vi.spyOn(axios, 'post').mockResolvedValue(createMockResponse()) as Mock;

        const type = 'species_type';
        const result = await createSpecies(type);

        expect(mockedPost).toHaveBeenCalledWith(
            'http://localhost:8080/api/Species/create',
            `"${type}"`,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        expect(result).toEqual(mockResponseData);
    });

    it('should create property list and return data', async () => {
        const mockedPost = vi.spyOn(axios, 'post').mockResolvedValue(createMockResponse()) as Mock;

        const propertyList: any = {
            parent_uuid: 'parent_uuid',
            version: 1,
        };

        const result = await createPropertyList(propertyList);

        expect(mockedPost).toHaveBeenCalledWith(
            'http://localhost:8080/api/PropertyList/create',
            propertyList,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        expect(result).toEqual(mockResponseData);
    });

    it('should create property version and return data', async () => {
        const mockedPost = vi.spyOn(axios, 'post').mockResolvedValue(createMockResponse()) as Mock;

        const propertyVersion: any = {
            parent_property_uuid: 'parent_property_uuid',
            frozen_version: 1,
            tag_mechanism_uuid: 'tag_mechanism_uuid',
            property_type: 'property_type',
            float_value: 0.5,
            double_value: 0.25,
            int_value: 10,
            string_value: 'string_value',
            action: 'create',
            user_uuid: 'user_uuid',
            datetime: '2024-01-01T00:00:00Z',
        };

        const result = await createPropertyVersion(propertyVersion);

        expect(mockedPost).toHaveBeenCalledWith(
            'http://localhost:8080/api/PropertyVersion/create',
            propertyVersion,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        expect(result).toEqual(mockResponseData);
    });

    it('should create reactant product list and return data', async () => {
        const mockedPost = vi.spyOn(axios, 'post').mockResolvedValue(createMockResponse()) as Mock;

        const reactantProduct: any = {
            reactant_product_uuid: 'reactant_product_uuid',
            reaction_uuid: 'reaction_uuid',
            species_uuid: 'species_uuid',
            quantity: 1,
        };

        const result = await createReactantProduct(reactantProduct);

        expect(mockedPost).toHaveBeenCalledWith(
            'http://localhost:8080/api/ReactantProductList/create',
            reactantProduct,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        expect(result).toEqual(mockResponseData);
    });
    
});
