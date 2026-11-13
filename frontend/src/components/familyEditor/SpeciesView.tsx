import { useState } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Species } from "../../types/chemistryModels";
import { applySpeciesRowUpdate } from "../../helpers/editorHelpers";
import { SpeciesEditorModal } from "../modals/SpeciesEditorModal";
import { UUID } from "crypto";
import { generateID } from "../../helpers/localFamilies";
import { ViewProps } from "./ViewProps";
import { useFamilyValidation } from "./FamilyValidationContext";
import { SpeciesTable } from "./SpeciesTable";
import {
  countOf,
  DeleteSelectedButton,
  EditSelectedButton,
} from "./SelectionButtons";

export const SpeciesView = ({ family, updateFamily, readOnly }: ViewProps) => {
  const { byItem } = useFamilyValidation();
  const [speciesEditorOpen, setSpeciesEditorOpen] = useState<boolean>(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();

  const handleSpeciesRowUpdate = (updatedSpecies: Species) => {
    updateFamily(applySpeciesRowUpdate(family, updatedSpecies));
    return updatedSpecies;
  };

  const createSpecies = () => {
    const frontendId: UUID = generateID();
    const species: Species = {
      description: "",
      id: frontendId,
      name: "",
    };
    setSelectedSpecies(species);
    setSpeciesEditorOpen(true);
  };

  const removeSpecies = (speciesIds: Array<UUID>) => {
    const ids = new Set<string>(speciesIds);
    updateFamily({
      ...family,
      species: family.species.filter((element) => !ids.has(element.id)),
      // Strip every reference to the removed species so the graph stays valid.
      phases: family.phases.map((phase) => ({
        ...phase,
        speciesIds: phase.speciesIds.filter((sid) => !ids.has(sid)),
        diffusionCoefficients: Object.fromEntries(
          Object.entries(phase.diffusionCoefficients ?? {}).filter(
            ([sid]) => !ids.has(sid),
          ),
        ),
        densities: Object.fromEntries(
          Object.entries(phase.densities ?? {}).filter(
            ([sid]) => !ids.has(sid),
          ),
        ),
      })),
      mechanisms: family.mechanisms.map((mechanism) => ({
        ...mechanism,
        speciesIds: mechanism.speciesIds.filter((sid) => !ids.has(sid)),
      })),
      reactions: family.reactions.map((reaction) => ({
        ...reaction,
        reactants: reaction.reactants.filter((r) => !ids.has(r.speciesId)),
        products: reaction.products.filter((p) => !ids.has(p.speciesId)),
        gasPhaseSpeciesId:
          reaction.gasPhaseSpeciesId && ids.has(reaction.gasPhaseSpeciesId)
            ? undefined
            : reaction.gasPhaseSpeciesId,
      })),
      isModified: true,
    });
  };

  /**
   * Updates a given species or inserts it if it doesn't already exist in the list
   * @param species
   */
  const updateSpecies = (species: Species) => {
    const speciesList = [...family.species];
    const existingIndex = speciesList.findIndex(
      (element) => element.id == species.id,
    );

    if (existingIndex >= 0) {
      speciesList[existingIndex] = { ...species };
    } else {
      speciesList.unshift({ ...species });
    }

    updateFamily({
      ...family,
      species: speciesList,
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          columnGap: "0.5rem",
        }}
      >
        <Typography color="textPrimary" variant="h6">
          Chemical Species
        </Typography>
        <Tooltip title="Chemical species are forms of a specific chemical entity. They can be named anything as long as it is clear what it represents. For example, a chemical species may be represented as either 'O3' or 'Ozone'.">
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>
      <SpeciesTable
        issues={byItem}
        species={family.species}
        selectionActions={
          readOnly
            ? undefined
            : (ids, clearSelection) => (
                <>
                  {ids.length === 1 && (
                    <EditSelectedButton
                      testId="edit-species-button"
                      onClick={() => {
                        setSelectedSpecies(
                          family.species.find(
                            (element) => element.id === ids[0],
                          ),
                        );
                        setSpeciesEditorOpen(true);
                      }}
                    />
                  )}
                  <DeleteSelectedButton
                    testId="delete-species-button"
                    message={`This deletes ${countOf(ids.length, "species", "species")} from the family, its phases, its mechanisms, and its reactions.`}
                    onDelete={() => {
                      removeSpecies(ids);
                      clearSelection();
                    }}
                  />
                </>
              )
        }
        onRowUpdate={readOnly ? undefined : handleSpeciesRowUpdate}
        onAdd={readOnly ? undefined : createSpecies}
      />
      <SpeciesEditorModal
        open={speciesEditorOpen}
        onClose={() => {
          setSpeciesEditorOpen(false);
          setSelectedSpecies(undefined);
        }}
        onUpdate={updateSpecies}
        species={selectedSpecies}
      />
    </Box>
  );
};
