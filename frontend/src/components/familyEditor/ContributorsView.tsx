import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { ViewProps } from "./ViewProps";
import { useAuth } from "../AuthContext";
import { APIFamilyContributor, ContributorRole } from "../../API/API_Interfaces";
import { getFamilyContributors } from "../../API/API_GetMethods";
import { addFamilyContributor } from "../../API/API_CreateMethods";
import { deleteFamilyContributor } from "../../API/API_DeleteMethods";

export const ContributorsView: React.FC<ViewProps> = ({
  family,
  updateFamily,
}) => {
  const { user } = useAuth();
  const [contributors, setContributors] = useState<Array<APIFamilyContributor>>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<ContributorRole>("Editor");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isOwnerOrAdmin =
    Boolean(family.isInDatabase) &&
    (user?.id === family.owner?.id || user?.role?.toLowerCase() === "admin");

  useEffect(() => {
    let active = true;

    if (!family.isInDatabase || !family.id) {
      setLoading(false);
      return;
    }

    const fetchContributors = async () => {
      setLoading(true);
      try {
        const data = await getFamilyContributors(family.id);
        if (active) {
          setContributors(data);
        }
      } catch (err) {
        if (active) {
          console.error("Failed to load contributors:", err);
          setErrorMessage("Failed to load contributors for this family.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchContributors();

    return () => {
      active = false;
    };
  }, [family.id, family.isInDatabase]);

  const handleAddContributor = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const trimmedEmail = searchEmail.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter an email address.");
      return;
    }

    if (
      family.owner?.email &&
      family.owner.email.toLowerCase() === trimmedEmail.toLowerCase()
    ) {
      setErrorMessage("The owner cannot be added as a contributor.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const added = await addFamilyContributor(family.id, {
        email: trimmedEmail,
        role: selectedRole,
      });

      setContributors((prev) => {
        const filtered = prev.filter((c) => c.userId !== added.userId);
        return [...filtered, added];
      });

      // Update parent family contributorIds
      if (updateFamily) {
        const currentIds = family.contributorIds ?? [];
        if (!currentIds.includes(added.userId)) {
          updateFamily({
            ...family,
            contributorIds: [...currentIds, added.userId],
          });
        }
      }

      setSearchEmail("");
      setSuccessMessage(`Contributor added successfully with ${selectedRole} role.`);
    } catch (err: any) {
      console.error("Failed to add contributor:", err);
      if (err.response?.status === 404) {
        setErrorMessage(
          "User not found. Contributor must have logged in at least once so an account exists.",
        );
      } else if (err.response?.status === 400) {
        setErrorMessage(
          typeof err.response?.data === "string"
            ? err.response.data
            : "Cannot add this user as a contributor.",
        );
      } else if (err.response?.status === 403) {
        setErrorMessage("Only the family owner or admin can manage contributors.");
      } else {
        setErrorMessage("An error occurred while adding contributor.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (
    userId: APIFamilyContributor["userId"],
    newRole: ContributorRole,
  ) => {
    try {
      const updated = await addFamilyContributor(family.id, {
        userId,
        role: newRole,
      });

      setContributors((prev) =>
        prev.map((c) => (c.userId === userId ? { ...c, role: updated.role } : c)),
      );
      setSuccessMessage("Contributor role updated.");
    } catch (err: any) {
      console.error("Failed to update role:", err);
      setErrorMessage("Failed to update contributor role.");
    }
  };

  const handleRemoveContributor = async (contributor: APIFamilyContributor) => {
    try {
      await deleteFamilyContributor(family.id, contributor.userId);
      setContributors((prev) => prev.filter((c) => c.userId !== contributor.userId));

      if (updateFamily) {
        const currentIds = family.contributorIds ?? [];
        updateFamily({
          ...family,
          contributorIds: currentIds.filter((id) => id !== contributor.userId),
        });
      }

      setSuccessMessage("Contributor removed successfully.");
    } catch (err: any) {
      console.error("Failed to remove contributor:", err);
      setErrorMessage("Failed to remove contributor.");
    }
  };

  if (!family.isInDatabase) {
    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", columnGap: "0.5rem", mb: 1 }}>
          <Typography color="textPrimary" variant="h6">
            Contributors
          </Typography>
          <Tooltip title="Collaborators with Editor role can modify reactions, species, phases, and mechanisms. Viewers have read-only access to private families. Only the owner can edit permissions or add/remove contributors.">
            <HelpOutlineIcon fontSize="small" />
          </Tooltip>
        </Box>
        <Typography color="textSecondary" variant="body2">
          This family is only saved in your browser. Upload the family to the
          cloud to manage contributors and collaborate.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "60em",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", columnGap: "0.5rem", mb: 1 }}>
        <Typography color="textPrimary" variant="h6">
          Contributors
        </Typography>
        <Tooltip title="Collaborators with Editor role can modify reactions, species, phases, and mechanisms. Viewers have read-only access to private families. Only the owner can edit permissions or add/remove contributors.">
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        {isOwnerOrAdmin
          ? "Manage who has access to collaborate on this family. Search for users by their email address."
          : "List of contributors with access to collaborate on this family."}
      </Typography>

      {isOwnerOrAdmin && (
        <Paper
          component="form"
          onSubmit={handleAddContributor}
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="Add by email"
            type="email"
            size="small"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="colleague@example.com"
            sx={{ flexGrow: 1, minWidth: "220px" }}
            inputProps={{
              "aria-label": "Contributor email",
              "data-testid": "contributor-email-input",
            }}
          />
          <FormControl size="small" sx={{ minWidth: "130px" }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={selectedRole}
              label="Role"
              onChange={(e) => setSelectedRole(e.target.value as ContributorRole)}
              inputProps={{
                "aria-label": "Contributor role",
                "data-testid": "contributor-role-select",
              }}
            >
              <MenuItem value="Editor">Editor</MenuItem>
              <MenuItem value="Viewer">Viewer</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting || !searchEmail.trim()}
            startIcon={<PersonAddIcon />}
            data-testid="add-contributor-button"
          >
            {submitting ? "Adding..." : "Add Contributor"}
          </Button>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" aria-label="contributors table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>User</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                  {isOwnerOrAdmin && (
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {family.owner && (
                  <TableRow
                    key={`owner-${family.owner.id || "owner"}`}
                    data-testid="contributor-row-owner"
                  >
                    <TableCell>
                      {family.owner.username ||
                        (family.owner.firstName || family.owner.lastName
                          ? `${family.owner.firstName ?? ""} ${family.owner.lastName ?? ""}`.trim()
                          : "Owner")}
                    </TableCell>
                    <TableCell>
                      {family.owner.email || "—"}
                    </TableCell>
                    <TableCell>
                      <Chip label="Owner" size="small" color="primary" />
                    </TableCell>
                    {isOwnerOrAdmin && <TableCell align="right">—</TableCell>}
                  </TableRow>
                )}

                {contributors.map((contrib) => (
                  <TableRow
                    key={contrib.userId}
                    data-testid={`contributor-row-${contrib.userId}`}
                  >
                    <TableCell>
                      {contrib.username ||
                        (contrib.firstName || contrib.lastName
                          ? `${contrib.firstName ?? ""} ${contrib.lastName ?? ""}`.trim()
                          : "Unknown User")}
                    </TableCell>
                    <TableCell>{contrib.email || "—"}</TableCell>
                    <TableCell>
                      {isOwnerOrAdmin ? (
                        <FormControl size="small" variant="standard">
                          <Select
                            value={contrib.role}
                            onChange={(e) =>
                              handleRoleChange(
                                contrib.userId,
                                e.target.value as ContributorRole,
                              )
                            }
                            aria-label={`Change role for ${contrib.email || contrib.username}`}
                            data-testid={`role-select-${contrib.userId}`}
                          >
                            <MenuItem value="Editor">Editor</MenuItem>
                            <MenuItem value="Viewer">Viewer</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <Chip
                          label={contrib.role}
                          size="small"
                          variant="outlined"
                          data-testid={`role-badge-${contrib.userId}`}
                        />
                      )}
                    </TableCell>
                    {isOwnerOrAdmin && (
                      <TableCell align="right">
                        <Tooltip title="Remove contributor">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveContributor(contrib)}
                            aria-label={`Remove contributor ${contrib.email || contrib.username}`}
                            data-testid={`remove-contributor-${contrib.userId}`}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {contributors.length === 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5 }}>
              No contributors yet.
              {isOwnerOrAdmin
                ? " Add collaborators by their email address to share access."
                : ""}
            </Typography>
          )}
        </>
      )}

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorMessage(null)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

