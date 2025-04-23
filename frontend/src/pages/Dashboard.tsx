import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { Header, Footer } from "../components/HeaderFooter";

import "../styles/Dashboard.css";
import {
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { APIFamily } from "../API/API_Interfaces";
import { useEffect, useState } from "react";
import { getAllFamilies } from "../API/API_GetMethods";
import FamilyBrowser from "../components/FamilyBrowser";
import { UUID } from "crypto";

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
              let uploadedFamilyIds: Array<UUID> = [];
              try {
                uploadedFamilyIds = JSON.parse(localStorage.getItem("uploadedFamilyIds") || "[]");
                if (Array.isArray(uploadedFamilyIds)) {
                  if (!uploadedFamilyIds.find((e) => e == familyId)) {
                    uploadedFamilyIds.unshift(familyId);
                  }
                }
                else {
                  uploadedFamilyIds = [familyId];
                }
                localStorage.setItem("uploadedFamilyIds", JSON.stringify(uploadedFamilyIds));
              }
              catch (err) {
                console.error(err);
                alert(`An error occurred: ${err}`);
              }
              handleClickFamily();
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
