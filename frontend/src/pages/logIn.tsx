import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "../pages/AuthContext"; // Import the AuthContext

import "../styles/logIn.css";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import GoogleIcon from "@mui/icons-material/Google";
import NoAccountsIcon from "@mui/icons-material/NoAccounts";
import { Footer } from "../components/HeaderFooter";
import Holidays from "../components/Holidays"; // Import the Holidays component
import { getUserByEmail } from "../API/API_GetMethods";
import { createUser } from "../API/API_CreateMethods";

interface AuthUser {
  access_token: string;
}

interface Profile {
  name: string;
  email: string;
}

const LogIn = () => {
  const { setUser } = useAuth(); // Get setUser from AuthContext
  const [user, setLocalUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();
  const handleClick = () => navigate("/LoggedIn");
  const [aboutOpen, setAboutOpen] = useState(false);
  const handleAboutOpen = () => setAboutOpen(true);
  const handleAboutClose = () => setAboutOpen(false);

  const handleAbout = () => {
    handleAboutOpen();
  };

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setLocalUser(codeResponse); // Set local user
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
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
          }
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
              const updatedUser = {
                access_token: user.access_token,
                ...existingUser,
              };
              setLocalUser(updatedUser);

              const contextUser = {
                id: existingUser.id,
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role || "unverified",
              };
              setUser(contextUser);
            } else {
              const newUser = {
                id: "",
                username: profileData.name,
                email: profileData.email,
                role: "unverified",
              };
              const createdUser = await createUser(newUser);
              const updatedUser = {
                access_token: user.access_token,
                ...createdUser,
              };
              setLocalUser(updatedUser);

              const contextUser = {
                id: createdUser.id,
                username: createdUser.username,
                email: createdUser.email,
                role: createdUser.role || "unverified",
              };
              setUser(contextUser);
              console.log("Context user ", contextUser);
              alert("New user created successfully");
            }
          } catch (error) {
            console.error("Error checking or creating user:", error);
            alert("Error checking or creating user");
          }
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          alert("Error fetching profile");
        });
    }
  }, [user, setUser]);

  // Log out function to log the user out of Google and set the profile array to null
  const logOut = () => {
    googleLogout();
    setProfile(null);
    setUser(null); // Clear user from AuthContext on logout
  };

  const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <section className="layoutLogIn">
      <Holidays /> {/* Include the Holidays component here */}
      <div className="M2">
        <Box sx={{ width: "100%", maxWidth: 700 }}>
          <Typography variant="h2" sx={{ color: "white" }}>
            Chemistry Cafe
          </Typography>
        </Box>
      </div>
      <div className="M3">
        <Box>
          <Typography variant="h6" sx={{ color: "#C3D7EE" }}>
            A collaborative tool to share, edit, manage, and export chemical
            mechanisms across the scientific community and into MusicBox
            Interactive. <br />
          </Typography>
        </Box>
      </div>
      <div className="M4">
        <br />
        <br />
        <p></p>
        {profile ? (
          <div>
            <Box sx={{ bgcolor: "#C3D7EE", borderWidth: "2px" }}>
              <h3>User Logged in</h3>
              <p>Name: {profile.name}</p>
              <p>Email Address: {profile.email}</p>
              <br />
              <br />
            </Box>
            <p></p>
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
            <p></p>
          </div>
        ) : (
          <Button
            variant="contained"
            onClick={() => login()}
            endIcon={<GoogleIcon />}
            sx={{ width: "50%" }}
          >
            Sign in
          </Button>
        )}
      </div>
      <div className="M5">
        <Button
          variant="contained"
          onClick={handleClick}
          endIcon={<NoAccountsIcon />}
          sx={{ width: "50%" }}
        >
          Continue as Guest
        </Button>
      </div>
      <div className="M7">
        <Button variant="contained" onClick={handleAbout} sx={{ width: "50%" }}>
          About
        </Button>
      </div>
      <div>
        <Modal open={aboutOpen} onClose={handleAboutClose}>
          <Box sx={style}>
            <Typography variant="h4">About</Typography>
            <Box
              component="img"
              src={"src/assets/NSF-NCAR_Lockup-UCAR-Dark.png"}
              alt={"Texas A&M"}
              sx={{ height: "100px", width: "auto" }}
            />
            <Box
              component="img"
              src={"src/assets/TAMULogo.png"}
              alt={"Texas A&M"}
              sx={{ height: "100px", width: "auto" }}
            />
            <Typography variant="body1">
              The Chemistry Cafe tool was made possible by the collaboration
              between NCAR and Texas A&M through the CSCE Capstone program.
            </Typography>
            <p></p>
            <Typography variant="h6">Credits</Typography>
            <Typography variant="body1">
              Paul Cyr, Brandon Longuet, Brian Nguyen <br></br> Spring 2024
              Capstone Team <br></br> <p></p>
              Kyle Shores <br></br> Spring 2024 Capstone Sponsor Representative
            </Typography>
          </Box>
        </Modal>
      </div>
      <div className="L9LogIn">
        <Footer></Footer>
      </div>
    </section>
  );
};

export default LogIn;