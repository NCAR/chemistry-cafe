import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Footer, Header } from "../components/HeaderFooter";
import { useCustomTheme } from "../components/CustomThemeContext";
import "../styles/About.css";
import TAMUlogo from "../assets/TAMULogo.png";
import NSF_NCARlogo_color from "../assets/branding/nsf-ncar-lockup-color.png";
import NSF_NCARlogo_white from "../assets/branding/nsf-ncar-lockup-white.png";

const About = () => {
  const { appearanceSettings } = useCustomTheme();
  const isDark = appearanceSettings.mode === "dark";
  const NSF_NCARlogo = isDark ? NSF_NCARlogo_white : NSF_NCARlogo_color;

  return (
    <div className="layout-about">
      <header>
        <Header />
      </header>
      <Paper square component="section" className="content-about">
        <div className="about-card">
          <Typography variant="h4" component="h1">
            About Chemistry Cafe
          </Typography>
          <div className="about-logos">
            <Box
              component="img"
              src={NSF_NCARlogo}
              alt="NSF NCAR"
              sx={{ height: "80px", width: "auto" }}
            />
            <Box
              component="img"
              src={TAMUlogo}
              alt="Texas A&M"
              sx={{ height: "80px", width: "auto" }}
            />
          </div>
          <Typography color="textPrimary" variant="body1">
            The Chemistry Cafe tool was made possible by the collaboration
            between NSF NCAR and Texas A&M through the CSCE Capstone program.
          </Typography>

          <div className="about-credits">
            <Typography color="textPrimary" variant="h6" gutterBottom>
              Credits
            </Typography>
            <Typography color="textPrimary" variant="body1">
              Paul Cyr, Brandon Longuet, Brian Nguyen
              <br />
              Spring 2024 Capstone Team
            </Typography>
            <br />
            <Typography color="textPrimary" variant="body1">
              Britt Schiller, Ore Ogunleye, Nishka Mittal, Josh Hare, Sydney
              Ferris
              <br />
              Fall 2024 Capstone Team
            </Typography>
            <br />
            <Typography color="textPrimary" variant="body1">
              Jackson Stewart, Kaili Fogle, Robbie Cook, Donato Curvino, James
              Fontenot
              <br />
              Spring 2025 Capstone Team
            </Typography>
            <br />
            <Typography color="textPrimary" variant="body1">
              Kyle Shores
              <br />
              Capstone Sponsor Representative
            </Typography>
          </div>
        </div>
      </Paper>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default About;
