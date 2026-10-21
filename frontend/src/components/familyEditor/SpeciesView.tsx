import { useState } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Species } from "../../types/chemistryModels";
import { applySpeciesRowUpdate } from "../../helpers/editorHelpers";
import { SpeciesEditorModal } from "../modals/SpeciesEditorModal";
import { RowActionsButton } from "../RowActionsButton";
import { UUID } from "crypto";
import { generateID } from "../../helpers/localFamilies";
import { ViewProps } from "./ViewProps";
import { SpeciesTable } from "./SpeciesTable";

export const SpeciesView = ({ family, updateFamily }: ViewProps) => {
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

  const removeSpecies = (id: UUID) => {
    const originalSpecies: Species | undefined = family.species.find(
      (value) => value.id === id,
    );
    if (!originalSpecies) {
      return;
    }

    updateFamily({
      ...family,
      species: family.species.filter((element) => element.id !== id),
      // Strip every reference to the removed species so the graph stays valid.
      phases: family.phases.map((phase) => ({
        ...phase,
        speciesIds: phase.speciesIds.filter((sid) => sid !== id),
        diffusionCoefficients: Object.fromEntries(
          Object.entries(phase.diffusionCoefficients ?? {}).filter(
            ([sid]) => sid !== id,
          ),
        ),
      })),
      mechanisms: family.mechanisms.map((mechanism) => ({
        ...mechanism,
        speciesIds: mechanism.speciesIds.filter((sid) => sid !== id),
      })),
      reactions: family.reactions.map((reaction) => ({
        ...reaction,
        reactants: reaction.reactants.filter((r) => r.speciesId !== id),
        products: reaction.products.filter((p) => p.speciesId !== id),
        gasPhaseSpeciesId:
          reaction.gasPhaseSpeciesId === id
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
        species={family.species}
        getRowActions={(id) => [
          <RowActionsButton
            handleDeleteButtonClick={() => {
              removeSpecies(id);
            }}
            handleEditButtonClick={() => {
              setSelectedSpecies(
                family.species.find((element) => element.id === id),
              );
              setSpeciesEditorOpen(true);
            }}
          />,
        ]}
        onRowUpdate={handleSpeciesRowUpdate}
        onAdd={createSpecies}
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
