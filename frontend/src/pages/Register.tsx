import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import GoogleIcon from "@mui/icons-material/Google";
import OrcidImage from "../assets/ORCID-iD_icon_vector.svg";
import { Header, Footer } from "../components/HeaderFooter";
import { useAuth } from "../components/AuthContext";
import {
  getPendingRegistration,
  checkUsernameAvailability,
} from "../API/API_GetMethods";
import { registerUser } from "../API/API_CreateMethods";
import { APIPendingRegistration } from "../API/API_Interfaces";
import { AUTH_URL } from "../API/API_config";
import { validateUsernameFormat } from "../helpers/userValidation";
import "../styles/Home.css";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [pending, setPending] = useState<APIPendingRegistration | null>(null);

  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  const [checkingAvailability, setCheckingAvailability] =
    useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPending() {
      try {
        const data = await getPendingRegistration();
        if (isMounted) {
          if (data) {
            setPending(data);
            setUsername(data.suggestedUsername || "");
            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
          }
          setLoadingSession(false);
        }
      } catch {
        if (isMounted) {
          setLoadingSession(false);
        }
      }
    }
    loadPending();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!username || username.trim() === "") {
      setIsAvailable(null);
      setAvailabilityMessage("");
      setCheckingAvailability(false);
      return;
    }

    const trimmed = username.trim();
    const formatCheck = validateUsernameFormat(trimmed);
    if (!formatCheck.valid) {
      setIsAvailable(false);
      setAvailabilityMessage(formatCheck.message || "Invalid username format.");
      setCheckingAvailability(false);
      return;
    }

    setCheckingAvailability(true);
    const handler = setTimeout(async () => {
      const res = await checkUsernameAvailability(trimmed);
      setIsAvailable(res.available);
      setAvailabilityMessage(res.message);
      setCheckingAvailability(false);
    }, 300);

    return () => clearTimeout(handler);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const createdUser = await registerUser({
        username: username.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      setUser(createdUser);
      navigate("/");
    } catch (err: unknown) {
      let msg =
        "An error occurred while creating your account. Please try again.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setSubmitError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="layout-home">
      <header>
        <Header />
      </header>
      <section className="content-home">
        {loadingSession ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography>Loading registration details...</Typography>
          </Box>
        ) : !pending ? (
          <Card
            sx={{ maxWidth: 500, width: "100%", p: 2, textAlign: "center" }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom>
                No Pending Registration Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                To create an account, please sign in with one of our
                authentication providers.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  onClick={() =>
                    window.location.assign(`${AUTH_URL}/google/login`)
                  }
                >
                  Sign in with Google
                </Button>
                <Button
                  variant="outlined"
                  startIcon={
                    <img
                      src={OrcidImage}
                      alt="ORCID iD"
                      style={{ width: 18, height: 18 }}
                    />
                  }
                  onClick={() =>
                    window.location.assign(`${AUTH_URL}/orcid/login`)
                  }
                >
                  Sign in with ORCID
                </Button>
                <Button
                  variant="text"
                  onClick={() => navigate("/")}
                  sx={{ mt: 1 }}
                >
                  Back to Home
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ maxWidth: 550, width: "100%", p: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Complete Your Registration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Please choose a unique username for your Chemistry Cafe account.
              </Typography>

              <Alert
                severity="info"
                icon={
                  pending.provider === "Google" ? (
                    <GoogleIcon fontSize="inherit" />
                  ) : (
                    <img
                      src={OrcidImage}
                      alt="ORCID"
                      style={{ width: 16, height: 16 }}
                    />
                  )
                }
                sx={{ mb: 3 }}
              >
                Signing in with <strong>{pending.provider}</strong>
                {pending.email ? ` (${pending.email})` : ""}
              </Alert>

              {submitError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {submitError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  fullWidth
                  required
                  id="username-input"
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  error={isAvailable === false}
                  helperText={
                    checkingAvailability
                      ? "Checking availability..."
                      : availabilityMessage
                  }
                  sx={{ mb: 2 }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          {checkingAvailability ? (
                            <CircularProgress size={20} />
                          ) : isAvailable === true ? (
                            <CheckCircleIcon color="success" />
                          ) : isAvailable === false ? (
                            <ErrorOutlineIcon color="error" />
                          ) : null}
                        </InputAdornment>
                      ),
                    },
                    formHelperText: {
                      sx: {
                        color:
                          isAvailable === true
                            ? "success.main"
                            : isAvailable === false
                              ? "error.main"
                              : "text.secondary",
                      },
                    },
                  }}
                />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <TextField
                    size="small"
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <TextField
                    size="small"
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={!isAvailable || checkingAvailability || submitting}
                  startIcon={
                    submitting ? <CircularProgress size={20} /> : undefined
                  }
                >
                  {submitting ? "Creating Account..." : "Create Account"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </section>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Register;
