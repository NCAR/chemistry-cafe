import { Box, Button, ButtonGroup, Card, CardContent, Typography } from "@mui/material";
import { Family, Mechanism } from "../types/chemistryModels";
import { DownloadMechanismButton } from "./DownloadMechanismButton";
import EditIcon from "@mui/icons-material/Edit";

export type MechanismBrowserProps = {
  family: Family;
  onEditButtonClick?: (mechanism: Mechanism) => void;
}

/**
 * Component for viewing mechanisms in a family and 
 */
export const MechanismBrowser: React.FC<MechanismBrowserProps> = ({ family, onEditButtonClick }) => {
  if (family.mechanisms.length == 0) {
    return (
      <Typography>No Mechanisms Found</Typography>
    )
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
            <Typography color="textPrimary">{mechanism.name}</Typography>
            <Typography color="textSecondary">
              {mechanism.description}
            </Typography>
          </Box>
          <ButtonGroup variant="contained">
            {
              onEditButtonClick &&
              <Button
                startIcon={<EditIcon />}
                sx={{ textTransform: "none" }}
                color="primary"
                onClick={() => onEditButtonClick(mechanism)}
              >
                Edit
              </Button>
            }
            <DownloadMechanismButton mechanism={mechanism} family={family} />
          </ButtonGroup>
        </CardContent>
      </Card>
    )
  })
}