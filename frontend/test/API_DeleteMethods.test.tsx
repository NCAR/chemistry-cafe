import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import axios, { AxiosHeaders, AxiosResponse } from 'axios';
import { deleteFamily, deleteFamMechList, deleteTagMechanism } from '../src/API/API_DeleteMethods';

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
    
    it('should successfully delete a family', async () => {
        // Use type assertion to tell TypeScript this is a mock function
        const mockedDelete = vi.spyOn(axios, 'delete').mockResolvedValue(createMockResponse()) as Mock;

        const uuid = '12345';
        const result = await deleteFamily(uuid);

        // Verify axios.delete was called with the correct URL and headers
        expect(mockedDelete).toHaveBeenCalledWith(
            `http://localhost:8080/api/Family/delete/${uuid}`,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        // Verify the function returns the expected data
        expect(result).toEqual(mockResponseData);
    });

    it('should successfully delete a family mechanism list', async () => {
        // Use type assertion to tell TypeScript this is a mock function
        const mockedDelete = vi.spyOn(axios, 'delete').mockResolvedValue(createMockResponse()) as Mock;

        const uuid = '12345';
        const result = await deleteFamMechList(uuid);

        // Verify axios.delete was called with the correct URL and headers
        expect(mockedDelete).toHaveBeenCalledWith(
            `http://localhost:8080/api/FamilyMechList/delete/${uuid}`,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        // Verify the function returns the expected data
        expect(result).toEqual(mockResponseData);
    });

    it('should successfully delete a tag mechanism', async () => {
        // Use type assertion to tell TypeScript this is a mock function
        const mockedDelete = vi.spyOn(axios, 'delete').mockResolvedValue(createMockResponse()) as Mock;

        const uuid = '12345';
        const result = await deleteTagMechanism(uuid);

        // Verify axios.delete was called with the correct URL and headers
        expect(mockedDelete).toHaveBeenCalledWith(
            `http://localhost:8080/api/TagMechanism/delete/${uuid}`,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        // Verify the function returns the expected data
        expect(result).toEqual(mockResponseData);
    });
});
