import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useNavigate } from "react-router-dom";
import { Header, Footer } from "../components/HeaderFooter";
import { APIArchivedVerifiedVersion } from "../API/API_Interfaces";
import { getArchivedVerifiedVersions } from "../API/API_GetMethods";
import "../styles/Dashboard.css";

export const ArchivedVersions: React.FC = () => {
  const navigate = useNavigate();
  const [archivedVersions, setArchivedVersions] = useState<
    APIArchivedVerifiedVersion[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    getArchivedVerifiedVersions()
      .then((data) => {
        setArchivedVersions(data || []);
      })
      .catch((err) => {
        console.error("Failed to load archived versions:", err);
        setError("Failed to load archived versions. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredVersions = useMemo(() => {
    if (!searchQuery.trim()) {
      return archivedVersions;
    }
    const q = searchQuery.toLowerCase().trim();
    return archivedVersions.filter((v) => {
      const nameMatch = v.name?.toLowerCase().includes(q);
      const descMatch = v.description?.toLowerCase().includes(q);
      const familyMatch = v.originalFamilyName?.toLowerCase().includes(q);
      const ownerMatch = v.originalOwnerUsername?.toLowerCase().includes(q);
      const verifierMatch = v.verifierUsername?.toLowerCase().includes(q);
      const notesMatch = v.notes?.toLowerCase().includes(q);
      const deprecationMatch = v.deprecationReason?.toLowerCase().includes(q);
      return (
        nameMatch ||
        descMatch ||
        familyMatch ||
        ownerMatch ||
        verifierMatch ||
        notesMatch ||
        deprecationMatch
      );
    });
  }, [archivedVersions, searchQuery]);

  const handleView = (v: APIArchivedVerifiedVersion) => {
    navigate(
      `/editor?id=${v.familyId}&versionId=${v.familyVersionId}&mechanismId=${v.mechanismId}`,
    );
  };

  return (
    <div className="layout-dashboard">
      <header>
        <Header />
      </header>

      <Paper square component="main" className="content-dashboard">
        <Button
          size="small"
          variant="text"
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate("/")}
          sx={{
            mb: 2,
            color: "text.secondary",
            "&:hover": { color: "primary.main" },
          }}
        >
          Back to Browse
        </Button>

        {/* Title & Subtitle */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Archived Versions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Preserved verified mechanism versions from deleted families or
            versions archived by verifiers
          </Typography>
        </Box>

        {/* Search Toolbar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 2,
          }}
        >
          <TextField
            size="small"
            placeholder="Search archived versions by name, family, owner, verifier, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 260 }}
            inputProps={{ "data-testid": "archived-search-input" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    data-testid="clear-search-icon-button"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        {/* Count and Filter Status */}
        {!loading && !error && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {searchQuery.trim()
                ? `Showing ${filteredVersions.length} of ${archivedVersions.length} archived versions`
                : `Total archived versions: ${archivedVersions.length}`}
            </Typography>
            {searchQuery.trim() && (
              <Button
                size="small"
                onClick={() => setSearchQuery("")}
                data-testid="clear-search-text-button"
              >
                Clear search
              </Button>
            )}
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Empty State (no versions at all) */}
        {!loading && !error && archivedVersions.length === 0 && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No archived versions found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No verified mechanism versions have been archived yet.
            </Typography>
          </Box>
        )}

        {/* Empty Filtered State */}
        {!loading &&
          !error &&
          archivedVersions.length > 0 &&
          filteredVersions.length === 0 && (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                No matching archived versions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                No archived versions match &ldquo;{searchQuery}&rdquo;.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSearchQuery("")}
                data-testid="clear-search-text-button"
              >
                Clear search
              </Button>
            </Box>
          )}

        {/* Versions List */}
        {!loading && !error && filteredVersions.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredVersions.map((v) => {
              const formattedDate = v.verifiedDate
                ? new Date(v.verifiedDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Unknown date";

              return (
                <Card
                  key={v.mechanismId}
                  variant="outlined"
                  sx={{
                    bgcolor: "background.paper",
                    transition: "border-color 0.15s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                    {/* Header Row */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1.5,
                        mb: v.description ? 1 : 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <LockIcon fontSize="small" color="action" />
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{ fontWeight: "bold" }}
                        >
                          {v.name}
                        </Typography>
                        <Chip
                          label="Archived"
                          size="small"
                          variant="outlined"
                          color="default"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            height: "24px",
                          }}
                        />
                        {v.isDeprecated && (
                          <Tooltip
                            title={
                              v.deprecationReason
                                ? `Deprecated: ${v.deprecationReason}`
                                : "Deprecated version"
                            }
                            arrow
                          >
                            <Chip
                              icon={<WarningAmberIcon fontSize="small" />}
                              label="Deprecated"
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                height: "24px",
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={() => handleView(v)}
                        data-testid={`view-archived-${v.mechanismId}`}
                      >
                        View
                      </Button>
                    </Box>

                    {v.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                      >
                        {v.description}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    {/* Metadata Grid */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, 1fr)",
                          md: "repeat(4, 1fr)",
                        },
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            display: "block",
                          }}
                        >
                          Original Family
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ fontWeight: 500 }}
                        >
                          {v.originalFamilyName}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            display: "block",
                          }}
                        >
                          Original Owner
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ fontWeight: 500 }}
                        >
                          {v.originalOwnerUsername || "Unknown"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            display: "block",
                          }}
                        >
                          Verified By
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ fontWeight: 500 }}
                        >
                          {v.verifierUsername || "Unknown"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            display: "block",
                          }}
                        >
                          Verified Date
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ fontWeight: 500 }}
                        >
                          {formattedDate}
                        </Typography>
                      </Box>
                    </Box>

                    {v.notes && (
                      <Box
                        sx={{
                          mt: 1.5,
                          p: 1.5,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600, display: "block" }}
                        >
                          Notes
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: "italic" }}
                        >
                          {v.notes}
                        </Typography>
                      </Box>
                    )}

                    {v.isDeprecated && v.deprecationReason && (
                      <Alert
                        severity="warning"
                        variant="outlined"
                        sx={{ mt: 1.5, py: 0.5 }}
                      >
                        <Typography variant="body2">
                          <strong>Deprecation reason:</strong>{" "}
                          {v.deprecationReason}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Paper>

      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default ArchivedVersions;
