import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import { Footer, Header } from "../components/HeaderFooter";

const Home: React.FC = () => {
  const navigate = useNavigate();

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
              startIcon={<TravelExploreIcon color="inherit" />}
            >
              Browse Mechanisms
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/familyeditor")}
              startIcon={<FolderSpecialIcon color="inherit" />}
            >
              My Families
            </Button>
          </div>
        </div>
      </section>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Home;
