import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { ConfirmActionModal } from "../FamilyEditorModals";
import { ViewProps } from "./ViewProps";

type ExtraGeneralInfoViewProps = {
  onDelete: () => any;
  onPublish: () => any;
};

export const GeneralInfoView = ({
  family,
  updateFamily,
  onDelete,
  onPublish,
}: ViewProps & ExtraGeneralInfoViewProps) => {
  const [name, setName] = useState<string>(family.name);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [description, setDescription] = useState<string>(family.description);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openPublishModal, setOpenPublishModal] = useState<boolean>(false);

  const handleSave = () => {
    if (name.length === 0) {
      setErrorMessage("Name must not be empty");
      setShowAlert(true);
      return;
    }
    setShowAlert(false);
    updateFamily({
      ...family,
      name: name,
      description: description,
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
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
          General Info
        </Typography>
        <Tooltip title="Chemical reactions consist of reactants which create products during a certain phase. They can also be tuned with specific parameters given by the reaction type.">
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          columnGap: "1em",
        }}
      ></Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: "1.5em",
          paddingY: "2em",
          maxWidth: "50em",
        }}
      >
        <TextField
          label="Name"
          required
          data-testid="family-name-input-general-info"
          defaultValue={family.name}
          error={name.length === 0}
          onChange={(event) => {
            setName(event.target.value);
          }}
          onBlur={handleSave}
        />
        <TextField
          label="Description"
          required
          data-testid="family-description-input-general-info"
          defaultValue={family.description}
          multiline
          minRows={3}
          maxRows={5}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
          onBlur={handleSave}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "start",
            columnGap: "3em",
            width: "100%",
          }}
        >
          {!family.isInDatabase && (
            <Button
              startIcon={<CloudUploadIcon />}
              color="secondary"
              variant="contained"
              onClick={() => setOpenPublishModal(true)}
            >
              Upload Family
            </Button>
          )}
          <Button
            startIcon={<DeleteForeverIcon />}
            color="error"
            variant="contained"
            onClick={() => setOpenDeleteModal(true)}
          >
            Delete Family
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={showAlert}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity="warning"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      <ConfirmActionModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onAction={() => {
          onDelete();
          setOpenDeleteModal(false);
        }}
        message="This will permanently delete the entire family! This includes any Species, Reactions, Phases, and Mechanisms associated with this family."
        subtitle="Are you sure you want to continue?"
        confirmColor="error"
      />
      <ConfirmActionModal
        open={openPublishModal}
        onClose={() => setOpenPublishModal(false)}
        onAction={() => {
          onPublish();
          setOpenPublishModal(false);
        }}
        message="This will make the family configuration publicly available."
        subtitle="Are you sure you want to continue?"
        confirmColor="secondary"
      />
    </Box>
  );
};
