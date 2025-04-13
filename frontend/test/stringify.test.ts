import { describe, expect, it } from "vitest";
import { Reaction, ReactionTypeName, Species } from "../src/types/chemistryModels";
import { reactionToString, reactionTypeToString } from "../src/helpers/stringify";

describe("reactionTypeToString function", () => {
    it("Returns a string for each key", () => {
        const reactionTypeDict: {
            [Property in ReactionTypeName]: string
        } = {
            "AQUEOUS_EQUILIBRIUM": "Aqueous Equilibrium",
            "ARRHENIUS": "Arrhenius",
            "CONDENSED_PHASE_ARRHENIUS": "Condensed Phase Arrhenius",
            "CONDENSED_PHASE_PHOTOLYSIS": "Contendes Phase Photolysis",
            "FIRST_ORDER_LOSS": "First-Order Loss",
            "EMMISSION": "Emmission",
            "TUNNELING": "Tunneling",
            "TROE": "Troe (Fall-Off)",
            "PHOTOLYSIS": "Photolysis",
            "SURFACE": "Surface (Heterogenous)",
            "WET_DEPOSITION": "Wet Deposition",
            "HL_PHASE_TRANSFER": "HL Phase Transfer",
            "SIMPOL_PHASE_TRANSFER": "Simpol Phase Transfer",
            "BRANCHED_NO_RO2": "Branched NO RO2",
            "NONE": "NONE",
        };

        for (const [reactionKey, reactionHumanReadableName] of Object.entries(reactionTypeDict)) {
            const result = reactionTypeToString(reactionKey as ReactionTypeName);
            expect(result).toBe(reactionHumanReadableName);
        }
    });

    it("Returns the same string when given an invalid/user-defined key", () => {
        const result = reactionTypeToString("USER_DEFINED_REACTION_TYPE" as any);
        expect(result).toBe("USER_DEFINED_REACTION_TYPE");
    });
});

describe("reactionToString", () => {
    it("Returns a default string when reaction isn't defined", () => {
        const result1 = reactionToString(null, []);
        expect(result1).toBe("<none> -> <none>");

        const result2 = reactionToString(undefined, [{
            id: "",
            name: "",
            description: null,
            familyId: "",
            attributes: {}
        }]);
        expect(result2).toBe("<none> -> <none>");
    });

    it("Returns a string with reactants and products and their coefficients", () => {
        const speciesList: Array<Species> = [
            {
                id: "1",
                name: "CH4",
                description: null,
                familyId: "",
                attributes: {}
            },
            {
                id: "2",
                name: "O2",
                description: null,
                familyId: "",
                attributes: {}
            },
            {
                id: "3",
                name: "CO2",
                description: null,
                familyId: "",
                attributes: {}
            },
            {
                id: "4",
                name: "H20",
                description: null,
                familyId: "",
                attributes: {}
            },
        ];

        const reaction: Reaction = {
            id: "",
            name: "",
            description: null,
            type: "HL_PHASE_TRANSFER",
            reactants: [
                {
                    speciesId: "1",
                    "coefficient": 1
                },
                {
                    speciesId: "2",
                    "coefficient": 2
                },
            ],
            products: [
                {
                    speciesId: "3",
                    "coefficient": 1
                },
                {
                    speciesId: "4",
                    "coefficient": 2
                },
            ],
            attributes: {}
        }

        const result = reactionToString(reaction, speciesList);
        expect(result).toBe("CH4 + 2O2 -> CO2 + 2H20");
    });

    it("Does not add species to the string if they don't exist", () => {
        const reaction: Reaction = {
            id: "",
            name: "",
            description: null,
            type: "HL_PHASE_TRANSFER",
            reactants: [
                {
                    speciesId: "1",
                    "coefficient": 1
                },
                {
                    speciesId: "2",
                    "coefficient": 2
                },
            ],
            products: [
                {
                    speciesId: "3",
                    "coefficient": 1
                },
                {
                    speciesId: "4",
                    "coefficient": 2
                },
            ],
            attributes: {}
        }

        const result = reactionToString(reaction, []);
        expect(result).toBe("<none> -> <none>");
    });
});