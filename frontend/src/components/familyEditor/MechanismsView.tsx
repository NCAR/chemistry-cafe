import { useLayoutEffect, useState } from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Mechanism } from "../../types/chemistryModels";
import { MechanismCreationModal } from "../modals/MechanismCreationModal";
import { MechanismEditor } from "../MechanismEditor";
import { MechanismBrowser } from "../MechanismBrowser";
import { ViewProps } from "./ViewProps";
import { saveFamilyChanges } from "../../helpers/backendInteractions";

let lastSelectedMechanismId: string | null = null;

export const MechanismsView = ({ family, updateFamily }: ViewProps) => {
  const [mechanismCreationModalOpen, setMechanismCreationModalOpen] =
    useState<boolean>(false);
  const [selectedMechanism, setSelectedMechanism] = useState<Mechanism | null>(
    () =>
      family.mechanisms.find((m) => m.id === lastSelectedMechanismId) ?? null,
  );
  const [menuComponent, setMenuComponent] = useState<React.JSX.Element | null>(
    null,
  );

  const selectMechanism = (mech: Mechanism | null) => {
    lastSelectedMechanismId = mech?.id ?? null;
    setSelectedMechanism(mech);
  };

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
    selectMechanism(mechanism);
  };

  const updateMechanism = (mechanism: Mechanism) => {
    updateFamily({
      ...family,
      mechanisms: family.mechanisms.map((element) => {
        if (element.id == mechanism.id) {
          return {
            ...mechanism,
          };
        }
        return element;
      }),
    });
    selectMechanism(mechanism);
  };

  const saveAndApplyMechanism = async (mechanism: Mechanism) => {
    const updatedFamily = {
      ...family,
      isModified: true,
      mechanisms: family.mechanisms.map((element) => {
        if (element.id == mechanism.id) {
          return {
            ...mechanism,
          };
        }
        return element;
      }),
    };
    if (family.isInDatabase) {
      try {
        const savedFamily = await saveFamilyChanges(updatedFamily);
        const savedMech =
          savedFamily.mechanisms.find((m) => m.id === mechanism.id) ??
          mechanism;
        selectMechanism(savedMech);
        updateFamily({ ...savedFamily, isModified: false }, false);
      } catch (err) {
        console.error("Failed to automatically save family:", err);
        alert("An error occurred while automatically saving the family");
      }
    } else {
      updateFamily(updatedFamily);
      selectMechanism(mechanism);
    }
  };

  const getMenuComponent = (mechanism: Mechanism | null): React.JSX.Element => {
    if (!mechanism) {
      return (
        <MechanismBrowser
          family={family}
          onEditButtonClick={selectMechanism}
          updateMechanism={updateMechanism}
        />
      );
    }

    return (
      <MechanismEditor
        family={family}
        mechanism={mechanism}
        updateMechanism={updateMechanism}
        onSaveMechanism={saveAndApplyMechanism}
        navigateBack={() => {
          selectMechanism(null);
        }}
      />
    );
  };

  useLayoutEffect(() => {
    const component = getMenuComponent(selectedMechanism);
    setMenuComponent(component);
  }, [selectedMechanism, family]);

  useLayoutEffect(() => {
    selectMechanism(null);
  }, [family.id]);

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
