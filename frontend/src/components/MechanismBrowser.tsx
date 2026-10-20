import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import { Family, Mechanism } from "../types/chemistryModels";
import { DownloadMechanismButton } from "./DownloadMechanismButton";
import EditIcon from "@mui/icons-material/Edit";

export type MechanismBrowserProps = {
  family: Family;
  onEditButtonClick?: (mechanism: Mechanism) => void;
  updateMechanism?: (mechanism: Mechanism) => void;
};

/**
 * Component for viewing mechanisms in a family and
 */
export const MechanismBrowser: React.FC<MechanismBrowserProps> = ({
  family,
  onEditButtonClick,
}) => {
  if (family.mechanisms.length === 0) {
    return <Typography>No Mechanisms Found</Typography>;
  }

  return family.mechanisms.map((mechanism, index) => {
    return (
      <Card
        key={`mechanism-${mechanism.id}-${index}`}
        sx={{
          padding: 1,
          mb: 1,
        }}
        variant="elevation"
        elevation={3}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography color="textPrimary" variant="h6">{mechanism.name}</Typography>
            {(mechanism.validationStatus === "Validated" ||
              mechanism.validationStatus === "Pending Validation") && (
              <Chip
                label={mechanism.validationStatus}
                size="small"
                color={
                  mechanism.validationStatus === "Validated"
                    ? "success"
                    : "warning"
                }
              />
            )}
            {mechanism.validationStatus === "Validated" && mechanism.validatedBy && (
              <Typography variant="caption" color="textSecondary">
                Validated by {mechanism.validatedBy}
              </Typography>
            )}
          </Box>
          <Typography color="textSecondary" sx={{ mb: 1 }}>
            {mechanism.description}
          </Typography>


          <ButtonGroup variant="contained">
            {onEditButtonClick && (
              <Button
                aria-label="Edit this mechanism"
                data-testid="edit-mechanism"
                startIcon={<EditIcon />}
                sx={{ textTransform: "none" }}
                color="primary"
                onClick={() => onEditButtonClick(mechanism)}
              >
                Edit
              </Button>
            )}
            <DownloadMechanismButton mechanism={mechanism} family={family} />
          </ButtonGroup>
        </CardContent>
      </Card>
    );
  });
};
