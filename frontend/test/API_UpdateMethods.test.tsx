import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import axios, { AxiosHeaders, AxiosResponse } from 'axios';
import { updatePropertyList, updateReactantProductList } from '../src/API/API_UpdateMethods';
import { PropertyList } from '../src/API/API_Interfaces';

// Mock axios using vitest's built-in mock function
vi.mock('axios');

describe('API delete functions tests', () => {
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
    
    it('should update property list and return data', async () => {
        const mockedPost = vi.spyOn(axios, 'put').mockResolvedValue(createMockResponse()) as Mock;

        const propertyList: PropertyList = {
            uuid: '',
            parent_uuid: 'parent_uuid',
            version: 'v1',
            isDel: false
        };

        const result = await updatePropertyList(propertyList);

        expect(mockedPost).toHaveBeenCalledWith(
            'http://localhost:8080/api/PropertyList/update',
            propertyList,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        expect(result).toEqual(mockResponseData);
    });

    it('should update reactant product list and return data', async () => {
        const mockedPost = vi.spyOn(axios, 'put').mockResolvedValue(createMockResponse()) as Mock;

        const reactantProduct: any = {
            reactant_product_uuid: 'reactant_product_uuid',
            reaction_uuid: 'reaction_uuid',
            species_uuid: 'species_uuid',
            quantity: 1,
        };

        const result = await updateReactantProductList(reactantProduct);

        expect(mockedPost).toHaveBeenCalledWith(
            'http://localhost:8080/api/ReactantProductList/update',
            reactantProduct,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        expect(result).toEqual(mockResponseData);
    });
});
