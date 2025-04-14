import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { Header, Footer } from "../components/HeaderFooter";

import "../styles/Dashboard.css";
import {
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  Paper,
  Typography,
} from "@mui/material";
import { APIFamily } from "../API/API_Interfaces";
import { memo, useEffect, useState } from "react";
import { getAllFamilies } from "../API/API_GetMethods";

const Dashboard = () => {
  const navigate = useNavigate();
  const handleClickFamily = () => navigate("/familypage");
  const handleClickSettings = () => navigate("/settings");
  const [families, setFamilies] = useState<Array<APIFamily>>();
  const [loadingFamilies, setLoadingFamilies] = useState<boolean>(true);

  const buttonStyle = {
    height: "5rem",
    width: "90%",
  };

  useEffect(() => {
    const abortController = new AbortController();
    const fetchFamilyData = async () => {
      try {
        const allFamilies = await getAllFamilies();
        setFamilies(allFamilies);
        setLoadingFamilies(false);
      } catch (err) {
        if (!abortController.signal.aborted) {
          alert(err);
        }
      }
    };

    fetchFamilyData();

    return () => abortController.abort();
  }, []);

  return (
    <div className="layout-dashboard">
      <header>
        <Header />
      </header>
      <Paper square component="section" className="content-dashboard">
        <div className="dashboard-navigation-buttons">
          <Button
            variant="contained"
            sx={buttonStyle}
            onClick={handleClickFamily}
          >
            Family Editor
          </Button>
          <Button
            variant="contained"
            sx={buttonStyle}
            onClick={handleClickSettings}
          >
            Settings
          </Button>
        </div>
        <div className="dashboard-family-explorer">
          <Typography variant="h5">Recent Mechanism Families</Typography>
          {loadingFamilies && <CircularProgress />}
          <List>
            {families?.map((family: APIFamily, index: number) => {
              return (
                <FamilyInfoCard key={`${family.id}-${index}`} family={family} />
              );
            })}
          </List>
        </div>
      </Paper>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

const FamilyInfoCard = memo(function FamilyInfoCard({
  family,
}: {
  family: APIFamily;
}) {
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
            <Button
              color="primary"
              onClick={() => alert("Not Implemented")}
              size="small"
            >
              Learn More
            </Button>
            <Button
              color="primary"
              onClick={() => alert("Not Implemented")}
              size="small"
            >
              Edit Family
            </Button>
          </ButtonGroup>
        </CardActions>
      </Card>
    </ListItem>
  );
});

export default Dashboard;
