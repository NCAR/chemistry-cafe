import { useNavigate } from "react-router-dom";
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
  const [families, setFamilies] = useState<Array<APIFamily>>();
  const [loadingFamilies, setLoadingFamilies] = useState<boolean>(true);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchFamilyData = async () => {
      try {
        const allFamilies = await getAllFamilies("?expand=true");
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
        <Typography variant="h5">Browse Families &amp; Mechanisms</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Every published family from the community. Clone one to start your own
          copy, or edit directly if you are the owner.
        </Typography>
        {loadingFamilies && <CircularProgress />}
        <FamilyBrowser
          families={families}
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
      </Paper>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Dashboard;
