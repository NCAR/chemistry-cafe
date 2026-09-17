import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { memo, useState } from "react";
import { APIFamily } from "../API/API_Interfaces";
import { UUID } from "crypto";
import { useAuth } from "./AuthContext";

type FamilyBrowserProps = {
  families?: Array<APIFamily>;
  handleEditButtonClick?: (id: UUID) => any;
  handleCloneButtonClick?: (id: UUID) => any;
};

const FamilyBrowser: React.FC<FamilyBrowserProps> = ({
  families,
  handleEditButtonClick,
  handleCloneButtonClick,
}) => {
  return (
    <List>
      {families?.map((family: APIFamily, index: number) => {
        return (
          <FamilyInfoCard
            key={`${family.id}-${index}`}
            family={family}
            handleEditButtonClick={handleEditButtonClick}
            handleCloneButtonClick={handleCloneButtonClick}
          />
        );
      })}
    </List>
  );
};

const FamilyInfoCard = memo(function FamilyInfoCard({
  family,
  handleEditButtonClick,
  handleCloneButtonClick,
}: {
  family: APIFamily;
} & FamilyBrowserProps) {
  const { user } = useAuth();
  const [mechanismsOpen, setMechanismsOpen] = useState(false);
  const mechanismCount = family.mechanisms?.length ?? 0;

  return (
    <ListItem>
      <Card sx={{ flex: 1 }} variant="outlined">
        <CardContent>
          <Typography
            sx={{ fontWeight: "bold" }}
            noWrap
            variant="h6"
            color="textPrimary"
          >
            {family.name}
          </Typography>
          <Typography noWrap variant="inherit" color="textSecondary">
            {family.owner.username}
          </Typography>
          <Typography sx={{ marginY: 1 }}>{family.description}</Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              width: "fit-content",
            }}
            onClick={() => setMechanismsOpen((open) => !open)}
            aria-expanded={mechanismsOpen}
            aria-label={`${mechanismsOpen ? "Hide" : "Show"} mechanisms for ${family.name}`}
            role="button"
          >
            <Typography variant="body2" color="textSecondary">
              {mechanismCount} mechanism{mechanismCount === 1 ? "" : "s"}
            </Typography>
            <IconButton
              size="small"
              sx={{
                transform: mechanismsOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </Box>
          <Collapse in={mechanismsOpen} unmountOnExit>
            {mechanismCount === 0 ? (
              <Typography variant="body2" color="textSecondary">
                This family has no mechanisms yet.
              </Typography>
            ) : (
              <List dense disablePadding>
                {family.mechanisms.map((mechanism) => (
                  <ListItem key={mechanism.id} disableGutters>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {mechanism.name}
                      </Typography>
                      {mechanism.description && (
                        <Typography variant="body2" color="textSecondary">
                          {mechanism.description}
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Collapse>
        </CardContent>
        <CardActions>
          <ButtonGroup variant="outlined">
            {handleEditButtonClick && user?.id === family.owner.id && (
              <Button
                color="primary"
                onClick={() => handleEditButtonClick(family.id)}
                size="small"
              >
                Edit Family
              </Button>
            )}
            {handleCloneButtonClick && (
              <Button
                color="primary"
                onClick={() => handleCloneButtonClick(family.id)}
                size="small"
              >
                Clone Family
              </Button>
            )}
          </ButtonGroup>
        </CardActions>
      </Card>
    </ListItem>
  );
});

export default FamilyBrowser;
