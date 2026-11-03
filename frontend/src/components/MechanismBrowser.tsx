import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { Family, Mechanism } from "../types/chemistryModels";
import { DownloadMechanismButton } from "./DownloadMechanismButton";
import EditIcon from "@mui/icons-material/Edit";
import { useFamilyValidation } from "./familyEditor/FamilyValidationContext";
import { ProblemCount } from "./familyEditor/IssueIndicators";

export type MechanismBrowserProps = {
  family: Family;
  onEditButtonClick?: (mechanism: Mechanism) => void;
};

/**
 * Component for viewing mechanisms in a family and
 */
export const MechanismBrowser: React.FC<MechanismBrowserProps> = ({
  family,
  onEditButtonClick,
}) => {
  const { issues } = useFamilyValidation();

  if (family.mechanisms.length == 0) {
    return <Typography>No Mechanisms Found</Typography>;
  }

  return family.mechanisms.map((mechanism, index) => {
    return (
      <Card
        key={`mechanism-${mechanism.id}-${index}`}
        sx={{
          padding: 1,
        }}
        variant="elevation"
        elevation={3}
      >
        <CardContent>
          <Box>
            <Typography color="textPrimary">
              {mechanism.name}
              <ProblemCount
                count={
                  issues.filter((issue) => issue.mechanismId === mechanism.id)
                    .length
                }
              />
            </Typography>
            <Typography color="textSecondary">
              {mechanism.description}
            </Typography>
          </Box>
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
