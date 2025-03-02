import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { Header, Footer } from "../components/HeaderFooter";

import "../styles/Dashboard.css";
import { ButtonGroup, Card, CardActions, CardContent, List, ListItem, Typography } from "@mui/material";
import { Family } from "../API/API_Interfaces";
import { memo } from "react";

const dummyData: Array<Family> = [
  {
    name: "Test Family",
    description: "A test family that doesn't exist and is purely for UI testing",
    createdBy: "Test User",
    id: "123-456-7890",
  },
  {
    name: "The Amazing Digital Family",
    description: "Another cool family that is purely for UI testing",
    createdBy: "Bomni",
    id: "098-765-4321",
  },
  {
    name: "Test Family",
    description: "A test family that doesn't exist",
    createdBy: "Test User",
    id: "927-564-2221",
  },
  {
    name: "The funniest family",
    description: "They call me the UI tester",
    createdBy: "Test User",
    id: "123-456-7890",
  },
  {
    name: "This is a reaally loooongggg family name just to make sure it doesn't overflow",
    description: "This is a really long description to make sure that the component doesn't overflow when there's too much text on screen. This is on purpose and not an accident. Hopefully this is long enough now and I don't have to keep going",
    createdBy: "Test User",
    id: "123-456-7890",
  },
  {
    name: "XSS test <script>alert('Uh Oh')</script>",
    description: "<script>alert('Uh Oh')</script>",
    createdBy: "Test User",
    id: "123-456-7890",
  },
  {
    name: "Family at the bottom",
    description: "This is used to test the situation when a family has \"overflowed\" the element. This happens on certain screen resolutions.",
    createdBy: "Test User",
    id: "123-456-7890",
  },
]

const Dashboard = () => {
  const navigate = useNavigate();
  const handleClickFamily = () => navigate("/familypage");
  const handleClickSettings = () => navigate("/settings");

  const buttonStyle = {
    height: "5rem",
    width: "90%",
  };

  return (
    <div className="layout-dashboard">
      <header>
        <Header />
      </header>
      <section className="content-dashboard">
        <div className="dashboard-navigation-buttons">
          <Button variant="contained" sx={buttonStyle} onClick={handleClickFamily}>
            Family Editor
          </Button>
          <Button variant="contained" sx={buttonStyle} onClick={handleClickSettings}>
            Settings
          </Button>
        </div>
        <div className="dashboard-family-explorer">
          <Typography variant="h5">
            Recent Mechanism Families
          </Typography>
          <List>
            {dummyData.map((family: Family, index: number) => {
              return (
                <FamilyInfoCard key={`${family.id}-${index}`} family={family} />
              );
            })}
          </List>
        </div>
      </section>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

const FamilyInfoCard = memo(function FamilyInfoCard({ family }: { family: Family }) {
  return (
    <ListItem>
      <Card sx={{ flex: 1 }} variant="outlined">
        <CardContent>
          <Typography sx={{ fontWeight: "bold" }} noWrap variant="h6" color="textPrimary">
            {family.name}
          </Typography>
          <Typography noWrap variant="inherit" color="textSecondary">
            {family.createdBy}
          </Typography>
          <Typography sx={{ marginY: 1 }}>
            {family.description}
          </Typography>
        </CardContent>
        <CardActions>
          <ButtonGroup variant="outlined">
            <Button color="info" onClick={() => alert("Not Implemented")} size="small">Learn More</Button>
            <Button color="primary" onClick={() => alert("Not Implemented")} size="small">Edit Family</Button>
          </ButtonGroup>
        </CardActions>
      </Card>
    </ListItem>
  )
});

export default Dashboard;
