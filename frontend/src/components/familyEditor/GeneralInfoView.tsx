import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Snackbar,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { ConfirmActionModal } from "../modals/ConfirmActionModal";
import { ViewProps } from "./ViewProps";
import { useAuth } from "../AuthContext";
import { ValidationErrorsModal } from "../modals/ValidationErrorsModal";
import {
  validateFamily,
  ValidationIssue,
} from "../../helpers/validationIssues";
import { ContributorsView } from "./ContributorsView";

type ExtraGeneralInfoViewProps = {
  onDelete: () => void;
  onPublish: () => void;
  onChangeVisibility: (isPublic: boolean) => void;
};

export const GeneralInfoView = ({
  family,
  updateFamily,
  readOnly,
  onDelete,
  onPublish,
  onChangeVisibility,
}: ViewProps & ExtraGeneralInfoViewProps) => {
  const [name, setName] = useState<string>(family.name);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [description, setDescription] = useState<string>(family.description);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openPublishModal, setOpenPublishModal] = useState<boolean>(false);
  const [openMakePublicModal, setOpenMakePublicModal] =
    useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationIssue[]>(
    [],
  );

  const { user } = useAuth();

  const isOwner = Boolean(user?.id && family.owner?.id === user.id);
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isContributor = Boolean(
    user?.id && family.contributorIds?.includes(user.id),
  );
  const canSeeContributors =
    !family.isInDatabase || isOwner || isAdmin || isContributor;

  const canChangeVisibility =
    !readOnly && ((family.isInDatabase && isOwner) || isAdmin);

  const isOwnerOrAdmin =
    !readOnly && (!family.isInDatabase || isOwner || isAdmin);

  /**
   * Checks each mechanism of the family. If all are valid, asks the user to
   * confirm the change to public. Otherwise, shows the validator messages.
   */
  const handleMakePublic = async () => {
    const errors = await validateFamily(family);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setOpenMakePublicModal(true);
  };

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
          disabled={readOnly}
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
          disabled={readOnly}
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
          {canChangeVisibility && (
            <Tooltip title={family.isModified ? "Save your changes first" : ""}>
              <FormControlLabel
                sx={{ ml: 0 }}
                label={family.isPublic ? "Public" : "Private"}
                control={
                  <Switch
                    checked={family.isPublic}
                    disabled={family.isModified}
                    onChange={(_, checked) => {
                      if (checked) {
                        handleMakePublic();
                      } else {
                        onChangeVisibility(false);
                      }
                    }}
                  />
                }
              />
            </Tooltip>
          )}
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
          {isOwnerOrAdmin && (
            <Button
              startIcon={<DeleteForeverIcon />}
              color="error"
              variant="contained"
              onClick={() => setOpenDeleteModal(true)}
            >
              Delete Family
            </Button>
          )}
        </Box>
      </Box>
      {canSeeContributors && (
        <>
          <Divider sx={{ my: 3, maxWidth: "60em" }} />
          <Box sx={{ maxWidth: "60em" }}>
            <ContributorsView family={family} updateFamily={updateFamily} />
          </Box>
        </>
      )}
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
        message="This saves the family to the server as a private family. Only you can see it until you make it public."
        subtitle="Are you sure you want to continue?"
        confirmColor="secondary"
      />
      <ConfirmActionModal
        open={openMakePublicModal}
        onClose={() => setOpenMakePublicModal(false)}
        onAction={() => {
          onChangeVisibility(true);
          setOpenMakePublicModal(false);
        }}
        message="All users can see and clone a public family."
        subtitle="Are you sure you want to make this family public?"
        confirmColor="secondary"
      />
      <ValidationErrorsModal
        open={validationErrors.length > 0}
        onClose={() => setValidationErrors([])}
        message="Fix these problems before you make the family public."
        family={family}
        errors={validationErrors}
      />
    </Box>
  );
};
