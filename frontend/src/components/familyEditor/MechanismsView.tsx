import { useEffect, useState } from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Mechanism } from "../../types/chemistryModels";
import { MechanismCreationModal } from "../modals/MechanismCreationModal";
import { MechanismEditor } from "../MechanismEditor";
import { ViewProps } from "./ViewProps";

export type MechanismsViewProps = ViewProps & {
  initialMechanismId?: string;
  onSelectMechanism?: (mechanism: Mechanism | null) => void;
};

export const MechanismsView = ({
  family,
  updateFamily,
  readOnly,
  initialMechanismId,
  onSelectMechanism,
}: MechanismsViewProps) => {
  const [mechanismCreationModalOpen, setMechanismCreationModalOpen] =
    useState<boolean>(false);
  const [selectedMechanism, setSelectedMechanism] = useState<Mechanism | null>(
    () => {
      if (initialMechanismId) {
        return (
          family.mechanisms.find((m) => m.id === initialMechanismId) || null
        );
      }
      return null;
    },
  );

  useEffect(() => {
    if (initialMechanismId) {
      const match = family.mechanisms.find((m) => m.id === initialMechanismId);
      if (match && match.id !== selectedMechanism?.id) {
        setSelectedMechanism(match);
      }
    }
  }, [initialMechanismId, family.mechanisms, selectedMechanism?.id]);

  useEffect(() => {
    if (selectedMechanism) {
      const updated = family.mechanisms.find(
        (m) => m.id === selectedMechanism.id,
      );
      if (updated && updated !== selectedMechanism) {
        setSelectedMechanism(updated);
      }
    }
  }, [family.mechanisms, selectedMechanism]);

  const createMechanism = (mechanism: Mechanism) => {
    const newMech: Mechanism = {
      ...mechanism,
      familyId: family.id,
    };
    updateFamily({
      ...family,
      mechanisms: [newMech, ...family.mechanisms],
    });
    setMechanismCreationModalOpen(false);
    setSelectedMechanism(newMech);
    onSelectMechanism?.(newMech);
  };

  const updateMechanism = (mechanism: Mechanism) => {
    updateFamily({
      ...family,
      mechanisms: family.mechanisms.map((element) => {
        if (element.id === mechanism.id) {
          return {
            ...mechanism,
          };
        }
        return element;
      }),
    });
    setSelectedMechanism(mechanism);
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
          justifyContent: "space-between",
          mb: 1,
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
            Mechanisms
          </Typography>
          <Tooltip title="Mechanisms contain a subset of a family's entities. They represent an analytical model in a specific family.">
            <HelpOutlineIcon fontSize="small" />
          </Tooltip>
        </Box>

        {!readOnly && (
          <Tooltip title="Create a new chemical mechanism">
            <Button
              aria-label="Create a new mechanism"
              data-testid="create-mechanism-button"
              onClick={() => setMechanismCreationModalOpen(true)}
              startIcon={<AddIcon />}
              color="primary"
              size="small"
              sx={{ alignSelf: "flex-start" }}
            >
              <Typography variant="caption">Create New Mechanism</Typography>
            </Button>
          </Tooltip>
        )}
      </Box>

      {selectedMechanism ? (
        <MechanismEditor
          family={family}
          mechanism={selectedMechanism}
          readOnly={readOnly}
          updateMechanism={updateMechanism}
          navigateBack={() => {
            setSelectedMechanism(null);
            onSelectMechanism?.(null);
          }}
        />
      ) : (
        <Box
          sx={{
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No mechanism selected
          </Typography>
        </Box>
      )}

      <MechanismCreationModal
        open={mechanismCreationModalOpen}
        familyId={family.id}
        onClose={() => setMechanismCreationModalOpen(false)}
        onSubmit={createMechanism}
      />
    </Box>
  );
};
