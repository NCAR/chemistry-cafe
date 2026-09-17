import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ScienceIcon from "@mui/icons-material/Science";
import { Footer, Header } from "../components/HeaderFooter";
import FamilyBrowser from "../components/FamilyBrowser";
import { APIFamily } from "../API/API_Interfaces";
import { getAllFamilies, getFamily } from "../API/API_GetMethods";
import {
  addFamilyLocally,
  addUploadedFamilyIdLocally,
  cloneFamily,
} from "../helpers/localFamilies";
import { apiToFrontendFamily } from "../helpers/backendInteractions";

const Home: React.FC = () => {
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
          console.error(err);
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
    <div className="layout-home">
      <header>
        <Header />
      </header>
      <section className="content-home">
        <div className="home-hero">
          <Typography variant="h2">Chemistry Cafe</Typography>
          <Typography variant="h6" color="text.secondary">
            Chemical Mechanism Management Software
          </Typography>
          <div className="home-actions">
            <Button
              variant="contained"
              onClick={() => navigate("/dashboard")}
              startIcon={<DashboardIcon color="inherit" />}
            >
              Browse Families
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/familyeditor")}
              startIcon={<ScienceIcon color="inherit" />}
            >
              Family Editor
            </Button>
          </div>
        </div>
        <Box className="home-family-browser">
          <Typography variant="h5">Families of Mechanisms</Typography>
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
        </Box>
      </section>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Home;
