import { describe, expect, it, beforeEach, afterEach, vi, test } from "vitest";
import { AuthProvider } from "../src/components/AuthContext";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { APIFamily, APIUser } from "../src/API/API_Interfaces";
import FamilyPage from "../src/pages/FamilyPage";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";

vi.mock("axios");

describe("FamilyPage", () => {
    const originalLocation = window.location;
    function createMockData(): AxiosResponse {
        return {
            data: [
                {
                    "id": "111-111-111-111-111",
                    "name": "Test Family",
                    "description": "Test Family",
                    "owner": {
                        id: "11-22-33-44-55",
                        username: "Test User",
                        role: "admin",
                    },
                }
            ] as Array<APIFamily>,
            status: 200,
            statusText: "OK",
            headers: {},
            config: {
                headers: new AxiosHeaders({ "Content-Type": "text/plain" }),
            },
        } as AxiosResponse;
    }

    beforeEach(() => {
        window.location = {
            ...originalLocation,
            assign: vi.fn((_: string | URL) => { }),
        } as any;
        vi.spyOn(axios, "get").mockResolvedValue(createMockData());

        render(
            <AuthProvider>
                <CustomThemeProvider>
                    <MemoryRouter initialEntries={["/", "/loggedIn"]}>
                        <FamilyPage />
                    </MemoryRouter>
                </CustomThemeProvider>
            </AuthProvider>,
        );
    });

    afterEach(() => {
        window.location = originalLocation as any;
        localStorage.clear();
        cleanup();
    });

    it("Renders families", async () => {
        await waitFor(() => {
            expect(screen.getByText("Test Family")).toBeTruthy();
        })
        const testFamilyTreeButton = screen.getByLabelText("Expand options for Test Family family");
        expect(testFamilyTreeButton).toBeTruthy();
        testFamilyTreeButton.ariaExpanded = "true";
        fireEvent.click(testFamilyTreeButton!);
    });

    it("Can create an entire family", async () => {
        await waitFor(() => {
            expect(screen.getByText("Test Family")).toBeTruthy();
        })
        const createFamilyButton = screen.getByLabelText("Create Family");
        expect(createFamilyButton).toBeTruthy();
        fireEvent.click(createFamilyButton);

        const nameBox = screen.getByLabelText("Name *");
        expect(nameBox).toBeTruthy();
        fireEvent.focus(nameBox);
        fireEvent.keyDown(nameBox, {
            key: "p"
        });

        const descriptionBox = screen.getByLabelText("Description");
        expect(descriptionBox).toBeTruthy();

        const creationButton = screen.getByText("Create");
        fireEvent.click(creationButton);

        // const familyButton = screen.getByText("p");
        // expect(familyButton).toBeTruthy();
    });

    it("Errors when name is empty for family", () => {
        const createFamilyButton = screen.getByLabelText("Create Family");
        expect(createFamilyButton).toBeTruthy();
        fireEvent.click(createFamilyButton);

        const nameBox = screen.getByLabelText("Name *");
        expect(nameBox).toBeTruthy();
        nameBox.innerText = "Test Family"

        const descriptionBox = screen.getByLabelText("Description");
        expect(descriptionBox).toBeTruthy();

        let creationButton = screen.getByText("Create");
        expect(creationButton).toBeTruthy();
        fireEvent.click(creationButton);
    });
});