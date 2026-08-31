import { useLayoutEffect, useState } from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Mechanism } from "../../types/chemistryModels";
import { MechanismCreationModal } from "../modals/MechanismCreationModal";
import { MechanismEditor } from "../MechanismEditor";
import { MechanismBrowser } from "../MechanismBrowser";
import { ViewProps } from "./ViewProps";

export const MechanismsView = ({ family, updateFamily }: ViewProps) => {
  const [mechanismCreationModalOpen, setMechanismCreationModalOpen] =
    useState<boolean>(false);
  const [selectedMechanism, setSelectedMechanism] = useState<Mechanism | null>(
    null,
  );
  const [menuComponent, setMenuComponent] = useState<React.JSX.Element | null>(
    null,
  );

  const createMechanism = (mechanism: Mechanism) => {
    updateFamily({
      ...family,
      mechanisms: [
        {
          ...mechanism,
          familyId: family.id,
        },
        ...family.mechanisms,
      ],
    });
    setMechanismCreationModalOpen(false);
    setSelectedMechanism(mechanism);
  };

  const updateMechanism = (mechanism: Mechanism) => {
    updateFamily({
      ...family,
      mechanisms: family.mechanisms.map((element) => {
        if (element.id == mechanism.id) {
          return {
            ...mechanism,
            isModified: true,
          };
        }
        return element;
      }),
    });
    setSelectedMechanism(mechanism);
  };

  const getMenuComponent = (mechanism: Mechanism | null): React.JSX.Element => {
    if (!mechanism) {
      return (
        <MechanismBrowser
          family={family}
          onEditButtonClick={setSelectedMechanism}
        />
      );
    }

    return (
      <MechanismEditor
        family={family}
        mechanism={mechanism}
        updateMechanism={updateMechanism}
        navigateBack={() => {
          setSelectedMechanism(null);
        }}
      />
    );
  };

  useLayoutEffect(() => {
    console.log(selectedMechanism);
    const component = getMenuComponent(selectedMechanism);
    setMenuComponent(component);
  }, [selectedMechanism, family]);

  useLayoutEffect(() => {
    setSelectedMechanism(null);
  }, [family]);

  return (
    <Box>
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

      {!selectedMechanism && (
        <Tooltip title="Create a new chemical mechanism">
          <Button
            aria-label="Create a new mechanism"
            data-testid="create-mechanism-button"
            onClick={() => setMechanismCreationModalOpen(true)}
            startIcon={<AddIcon />}
            color="primary"
          >
            <Typography variant="caption">Create New Mechanism</Typography>
          </Button>
        </Tooltip>
      )}
      {menuComponent}
      <MechanismCreationModal
        open={mechanismCreationModalOpen}
        familyId={family.id}
        onClose={() => setMechanismCreationModalOpen(false)}
        onSubmit={createMechanism}
      />
    </Box>
  );
};
