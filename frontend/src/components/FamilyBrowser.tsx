import {
  Button,
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import React, { memo } from "react";
import { APIFamily } from "../API/API_Interfaces";
import { UUID } from "crypto";
import { useAuth } from "./AuthContext";

type FamilyBrowserProps = {
  families?: Array<APIFamily>;
  handleInfoButtonClick?: (id: UUID) => any;
  handleEditButtonClick?: (id: UUID) => any;
  handleCloneButtonClick?: (id: UUID) => any;
};

const FamilyBrowser: React.FC<FamilyBrowserProps> = ({
  families,
  handleInfoButtonClick,
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
            handleInfoButtonClick={handleInfoButtonClick}
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
  handleInfoButtonClick,
  handleEditButtonClick,
  handleCloneButtonClick,
}: {
  family: APIFamily;
} & FamilyBrowserProps) {
  const { user } = useAuth();

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
        </CardContent>
        <CardActions>
          <ButtonGroup variant="outlined">
            {handleInfoButtonClick && (
              <Button
                color="primary"
                onClick={() => handleInfoButtonClick(family.id)}
                size="small"
              >
                Learn More
              </Button>
            )}
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
