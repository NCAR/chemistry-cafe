import { useNavigate } from "react-router-dom";
import { useAuth } from "../pages/AuthContext"; // Import the AuthContext
import "../styles/logIn.css";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
//import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import GoogleIcon from "@mui/icons-material/Google";
import NoAccountsIcon from "@mui/icons-material/NoAccounts";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Footer, Header } from "../components/HeaderFooter";
import { AUTH_URL } from "../API/API_config";

const LogIn: React.FC = () => {
  const { setUser, user } = useAuth(); // Get setUser from AuthContext
  const navigate = useNavigate();

  const login = () => {
    window.location.href = `${AUTH_URL}/google/login`;
  };

  // Log out function to log the user out of Google and set the profile array to null
  const continueAsGuest = () => {
    if (user || localStorage.getItem("user")) {
      // Clear user from AuthContext
      setUser(null);
      localStorage.removeItem("user");

      const returnUrl = `${window.location.protocol}//${window.location.host}/loggedIn`;
      const loginUrl = encodeURI(
        `${AUTH_URL}/google/logout?returnUrl=${returnUrl}`,
      );
      window.location.assign(loginUrl);
    }
    else {
      navigate("loggedIn");
    }
  };

  return (
    <div className="layout-home">
      <header>
        <Header />
      </header>
      <section className="content-home">
        <div className="information-home">
          <div>
            <Box sx={{ width: "100%", maxWidth: 700 }}>
              <Typography variant="h2" sx={{ color: "white" }}>
                Chemistry Cafe
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: "#C3D7EE" }}>
                A collaborative tool to share, edit, manage, and export chemical
                mechanisms across the scientific community and into MusicBox
                Interactive.
              </Typography>
            </Box>
          </div>
          <div className="sign-in-controls">
            {user && (
              <Button
                variant="contained"
                onClick={() => navigate("/LoggedIn")}
                endIcon={<ArrowForwardIcon />}
                sx={{ width: "100%", my: "0.5rem" }}
              >
                Continue as {user.username}
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => login()}
              endIcon={<GoogleIcon />}
              sx={{ width: "100%", my: "0.5rem" }}
            >
              {user ? "Switch Account" : "Sign in"}
            </Button>
            <Button
              variant="contained"
              onClick={continueAsGuest}
              endIcon={<NoAccountsIcon />}
              sx={{ width: "100%", my: "0.5rem" }}
            >
              Continue as Guest
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

export default LogIn;
