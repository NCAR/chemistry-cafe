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
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    if (open) {
      setName(phase?.name ?? "");
      setDescription(phase?.description ?? "");
      setSelectedSpeciesIds(phase?.speciesIds ?? []);
      setNameError(false);
    }
  }, [open, phase]);

  const handleCreate = () => {
    const phaseName = name.trim();
    if (!phaseName) {
      setNameError(true);
      return;
    }

    onSubmit(
      phaseName,
      description.trim() || null,
      selectedSpeciesIds,
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
          slotProps={{ htmlInput:{"aria-label": "Name"},}}
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
          slotProps={{ htmlInput:{"aria-label": "Descrption"},}}
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
          {species.length > 0 ? (
            species.map((option) => {
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
              No species available.
            </Typography>
          )}
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
