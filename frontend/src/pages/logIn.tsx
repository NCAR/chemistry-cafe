import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "../pages/AuthContext"; // Import the AuthContext

import "../styles/logIn.css";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
//import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import GoogleIcon from "@mui/icons-material/Google";
import NoAccountsIcon from "@mui/icons-material/NoAccounts";
import { Footer, Header } from "../components/HeaderFooter";
import { getUserByEmail } from "../API/API_GetMethods";
import { createUser } from "../API/API_CreateMethods";

interface AuthUser {
  access_token: string;
}

interface Profile {
  name: string;
  email: string;
}

const LogIn: React.FC = () => {
  const { setUser } = useAuth(); // Get setUser from AuthContext
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();
  const handleClick = () => navigate("/LoggedIn");

  const setUserInformation = async (user: AuthUser) => {
    if (user) {
      // Fetch the user profile using the access token
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          },
        )
        .then(async (res) => {
          const profileData = res.data;
          setProfile(profileData);

          if (!profileData.email) {
            console.error("Profile data does not contain an email.");
            alert("Profile data is missing email information.");
            return;
          }

          // Check if the user already exists in the database
          try {
            const existingUser = await getUserByEmail(profileData.email);
            if (existingUser) {

              const contextUser = {
                id: existingUser.id,
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role || "unverified",
              };
              setUser(contextUser);
            } else {
              const newUser = {
                username: profileData.name,
                email: profileData.email,
                role: "unverified",
              };
              const createdUser = await createUser(newUser);

              const contextUser = {
                id: createdUser.id,
                username: createdUser.username,
                email: createdUser.email,
                role: createdUser.role || "unverified",
              };

              setUser(createdUser);
              console.log("Context user ", contextUser);
            }
          } catch (error) {
            console.error("Error checking or creating user:", error);
            alert("Error checking or creating user" + error);
          }
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          alert("Error fetching profile");
        });
    }
  }

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setUserInformation(codeResponse).then(() => navigate("/LoggedIn"));
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  // Log out function to log the user out of Google and set the profile array to null
  const logOut = () => {
    googleLogout();
    setProfile(null);
    setUser(null); // Clear user from AuthContext on logout
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
            {profile ? (
              <div>
                <Box sx={{ bgcolor: "#C3D7EE", borderWidth: "2px" }}>
                  <h3>User Logged in</h3>
                  <p>Name: {profile.name}</p>
                  <p>Email Address: {profile.email}</p>
                </Box>
                <Button
                  variant="contained"
                  onClick={handleClick}
                  color="success"
                  sx={{ width: "50%" }}
                >
                  PROCEED
                </Button>
                <Button
                  variant="contained"
                  onClick={logOut}
                  color="error"
                  sx={{ width: "50%" }}
                >
                  Log out
                </Button>
              </div>
            ) : (
              <Button
                variant="contained"
                onClick={() => login()}
                endIcon={<GoogleIcon />}
                sx={{ width: "100%", my: "0.5rem" }}
              >
                Sign in
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleClick}
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
