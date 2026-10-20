import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { UUID } from "crypto";
import { Phase, Species } from "../../types/chemistryModels";
import { modalStyle } from "./modalStyle";

type PhaseCreationModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    description: string | null,
    speciesIds: UUID[],
    diffusionCoefficients: Record<UUID, number>,
  ) => void;
  phase?: Phase;
  species: Species[];
};

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
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [nameError, setNameError] = useState(false);
  // The text in each diffusion coefficient field, by species id. An empty
  // field means that the species has no value.
  const [diffusionCoefficients, setDiffusionCoefficients] = useState<
    Record<UUID, string>
  >({});
  const [invalidCoefficientIds, setInvalidCoefficientIds] = useState<UUID[]>(
    [],
  );

  const filteredSpecies = species.filter((option) =>
    option.name.toLowerCase().includes(speciesSearch.trim().toLowerCase()),
  );
  const allFilteredSpeciesSelected =
    filteredSpecies.length > 0 &&
    filteredSpecies.every((option) => selectedSpeciesIds.includes(option.id));

  useEffect(() => {
    if (open) {
      setName(phase?.name ?? "");
      setDescription(phase?.description ?? "");
      setSelectedSpeciesIds(phase?.speciesIds ?? []);
      setDiffusionCoefficients(
        Object.fromEntries(
          Object.entries(phase?.diffusionCoefficients ?? {}).map(
            ([id, value]) => [id, String(value)],
          ),
        ),
      );
      setInvalidCoefficientIds([]);
      setSpeciesSearch("");
      setNameError(false);
    }
  }, [open, phase]);

  const handleCreate = () => {
    const phaseName = name.trim();
    if (!phaseName) {
      setNameError(true);
      return;
    }

    // Only a selected species keeps its diffusion coefficient.
    const coefficients: Record<UUID, number> = {};
    const invalidIds: UUID[] = [];
    for (const id of selectedSpeciesIds) {
      const text = diffusionCoefficients[id]?.trim();
      if (!text) {
        continue;
      }
      const value = Number(text);
      if (Number.isFinite(value) && value > 0) {
        coefficients[id] = value;
      } else {
        invalidIds.push(id);
      }
    }
    if (invalidIds.length > 0) {
      setInvalidCoefficientIds(invalidIds);
      // Clear the search, so that the search does not hide an invalid field.
      setSpeciesSearch("");
      return;
    }

    onSubmit(
      phaseName,
      description.trim() || null,
      selectedSpeciesIds,
      coefficients,
    );
  };

  // The species search also filters the diffusion coefficient fields.
  const filteredSelectedSpecies = filteredSpecies.filter((option) =>
    selectedSpeciesIds.includes(option.id),
  );

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
        <Typography
          component="label"
          id="add-species-label"
          color="textPrimary"
          variant="subtitle1"
        >
          Species
        </Typography>
        <TextField
          color="primary"
          id="phase-species-search"
          label="Search Species..."
          value={speciesSearch}
          onChange={(event) => setSpeciesSearch(event.target.value)}
        />
        <Button
          disabled={filteredSpecies.length === 0}
          onClick={() => {
            const filteredSpeciesIds = filteredSpecies.map(
              (option) => option.id,
            );
            setSelectedSpeciesIds((current) =>
              allFilteredSpeciesSelected
                ? current.filter((id) => !filteredSpeciesIds.includes(id))
                : [
                    ...current,
                    ...filteredSpeciesIds.filter((id) => !current.includes(id)),
                  ],
            );
          }}
        >
          {allFilteredSpeciesSelected ? "Deselect All" : "Select All"}
        </Button>
        <Box
          role="group"
          aria-label="Select species for phase"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "0.5em",
            maxHeight: "16em",
            overflowY: "auto",
          }}
        >
          {filteredSpecies.length > 0 ? (
            filteredSpecies.map((option) => {
              const checked = selectedSpeciesIds.includes(option.id);

              return (
                <FormControlLabel
                  key={option.id}
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={(event) => {
                        setSelectedSpeciesIds((current) =>
                          event.target.checked
                            ? [...current, option.id]
                            : current.filter((id) => id !== option.id),
                        );
                      }}
                    />
                  }
                  label={
                    <Typography noWrap title={option.name}>
                      {option.name}
                    </Typography>
                  }
                  sx={{
                    m: 0,
                    px: 1,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                />
              );
            })
          ) : (
            <Typography color="text.secondary" sx={{ gridColumn: "1 / -1" }}>
              {species.length > 0
                ? "No matching species."
                : "No species available."}
            </Typography>
          )}
        </Box>
        {selectedSpeciesIds.length > 0 && (
          <>
            <Typography
              component="label"
              id="diffusion-coefficients-label"
              color="textPrimary"
              variant="subtitle1"
            >
              Diffusion coefficients [m² s⁻¹]
            </Typography>
            <Box
              role="group"
              aria-labelledby="diffusion-coefficients-label"
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "0.5em",
                maxHeight: "16em",
                overflowY: "auto",
                pt: 1,
              }}
            >
              {filteredSelectedSpecies.length === 0 && (
                <Typography
                  color="text.secondary"
                  sx={{ gridColumn: "1 / -1" }}
                >
                  No matching species.
                </Typography>
              )}
              {filteredSelectedSpecies.map((option) => {
                const invalid = invalidCoefficientIds.includes(option.id);
                return (
                  <TextField
                    key={option.id}
                    size="small"
                    color="primary"
                    label={option.name}
                    placeholder="None"
                    error={invalid}
                    helperText={
                      invalid ? "Enter a positive number." : undefined
                    }
                    value={diffusionCoefficients[option.id] ?? ""}
                    onChange={(event) => {
                      setDiffusionCoefficients((current) => ({
                        ...current,
                        [option.id]: event.target.value,
                      }));
                      setInvalidCoefficientIds((current) =>
                        current.filter((id) => id !== option.id),
                      );
                    }}
                  />
                );
              })}
            </Box>
          </>
        )}
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
