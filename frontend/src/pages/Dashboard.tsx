import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/Dashboard.css";
import { CircularProgress, Paper, Typography } from "@mui/material";
import { APIFamily } from "../API/API_Interfaces";
import { useEffect, useState } from "react";
import { getAllFamilies, getFamily } from "../API/API_GetMethods";
import FamilyBrowser from "../components/FamilyBrowser";
import {
  addFamilyLocally,
  addUploadedFamilyIdLocally,
  cloneFamily,
} from "../helpers/localFamilies";
import { apiToFrontendFamily } from "../helpers/backendInteractions";

const Dashboard = () => {
  const navigate = useNavigate();
  const handleClickFamily = () => navigate("/familyeditor");
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
      } catch (err) {
        if (!abortController.signal.aborted) {
          alert(err);
        }
        setFamilies([]);
      } finally {
        setLoadingFamilies(false);
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
          <Typography variant="h5">Other Families of Mechanisms</Typography>
          {loadingFamilies && <CircularProgress />}
          <FamilyBrowser
            families={families}
            handleInfoButtonClick={() => alert("This is not implemented yet")}
            handleEditButtonClick={(familyId) => {
              addUploadedFamilyIdLocally(familyId);
              navigate("/familyeditor");
            }}
            handleCloneButtonClick={(id) => {
              getFamily(id)
                .then((family) => {
                  const clonedFamily = cloneFamily(apiToFrontendFamily(family));
                  addFamilyLocally(clonedFamily);
                  navigate("/familyeditor");
                })
                .catch((err) => {
                  console.error("An issue occurred cloning the family:", err);
                  alert("An issue occurred cloning the family");
                });
            }}
          />
        </div>
      </Paper>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Dashboard;
