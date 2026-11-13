import { useEffect, useState } from "react";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { UUID } from "crypto";
import { Phase, Species } from "../../types/chemistryModels";
import {
  PhaseSpeciesTable,
  PhaseSpeciesValues,
} from "../familyEditor/PhaseSpeciesTable";
import { modalStyle } from "./modalStyle";

type PhaseCreationModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    description: string | null,
    speciesIds: UUID[],
    diffusionCoefficients: Record<UUID, number>,
    densities: Record<UUID, number>,
  ) => void;
  phase?: Phase;
  species: Species[];
};

/** Keeps only the values of the given species. */
const valuesOf = (values: Record<UUID, number>, speciesIds: Set<UUID>) =>
  Object.fromEntries(
    Object.entries(values).filter(([id]) => speciesIds.has(id as UUID)),
  ) as Record<UUID, number>;

export const PhaseCreationModal = ({
  open,
  onClose,
  onSubmit,
  phase,
  species,
}: PhaseCreationModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<UUID[]>([]);
  const [nameError, setNameError] = useState(false);
  // The values of the species in this phase. A species that leaves the phase
  // keeps its values here until the save, so that they come back when the
  // species comes back.
  const [values, setValues] = useState<PhaseSpeciesValues>({
    diffusionCoefficients: {},
    densities: {},
  });

  useEffect(() => {
    if (open) {
      setName(phase?.name ?? "");
      setDescription(phase?.description ?? "");
      setSelectedSpeciesIds(phase?.speciesIds ?? []);
      setValues({
        diffusionCoefficients: { ...phase?.diffusionCoefficients },
        densities: { ...phase?.densities },
      });
      setNameError(false);
    }
  }, [open, phase]);

  const handleCreate = () => {
    const phaseName = name.trim();
    if (!phaseName) {
      setNameError(true);
      return;
    }

    // Only a species in the phase keeps its values.
    const members = new Set(selectedSpeciesIds);
    onSubmit(
      phaseName,
      description.trim() || null,
      selectedSpeciesIds,
      valuesOf(values.diffusionCoefficients, members),
      valuesOf(values.densities, members),
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle} role="menu">
        <Typography color="textPrimary" variant="h5">
          {phase ? "Edit Phase" : "Create Phase"}
        </Typography>
        <TextField
          autoFocus
          color="primary"
          error={nameError}
          helperText={nameError ? "Name must not be empty." : undefined}
          id="phase-name"
          slotProps={{ htmlInput: { "aria-label": "Name" } }}
          label="Name"
          required
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setNameError(false);
          }}
        />
        <TextField
          color="primary"
          id="phase-description"
          slotProps={{ htmlInput: { "aria-label": "Descrption" } }}
          label="Description"
          multiline
          minRows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Typography color="textPrimary" variant="subtitle1">
          Species
        </Typography>
        {/* The modal is a flex column. Without flexShrink, the modal makes
            the table shorter than its rows. */}
        <Box sx={{ height: "32em", flexShrink: 0, display: "flex" }}>
          <PhaseSpeciesTable
            species={species}
            memberIds={selectedSpeciesIds}
            onMembersChange={setSelectedSpeciesIds}
            values={values}
            onValuesChange={(speciesId, diffusionCoefficient, density) => {
              const set = (
                current: Record<UUID, number>,
                value: number | null,
              ) => {
                const next = { ...current };
                if (value === null) {
                  delete next[speciesId];
                } else {
                  next[speciesId] = value;
                }
                return next;
              };
              setValues((current) => ({
                diffusionCoefficients: set(
                  current.diffusionCoefficients,
                  diffusionCoefficient,
                ),
                densities: set(current.densities, density),
              }));
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            columnGap: "1em",
          }}
        >
          <Button
            sx={{ flex: 1 }}
            aria-label={phase ? "Save Phase" : "Create Phase"}
            data-testid={
              phase ? "save-phase-button" : "create-new-phase-button"
            }
            color="primary"
            variant="contained"
            onClick={handleCreate}
          >
            {phase ? "Save" : "Create"}
          </Button>
          <Button
            sx={{ flex: 1 }}
            aria-label="Cancel Phase Creation"
            variant="outlined"
            onClick={onClose}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
