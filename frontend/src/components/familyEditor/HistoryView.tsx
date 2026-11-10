import React, { useEffect, useMemo, useState } from "react";
import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import HistoryIcon from "@mui/icons-material/History";
import {
  ChangeAction,
  ChangeSet,
  Family,
  Species,
} from "../../types/chemistryModels";
import { getFamilyHistory } from "../../API/API_GetMethods";
import {
  areReactionEquationsDifferent,
  computePropertyDiffs,
  computeStructuralChanges,
  createEntityNameResolver,
  createReactionResolver,
  formatLocalDateTime,
  getAllAvailableSpecies,
  parseReactionFromJson,
  PropertyDiffRow,
  StructuralChanges,
} from "../../helpers/historyFormatting";
import { EquationText } from "../EquationText";

export type HistoryViewProps = {
  family: Family;
};

const actionColor = (action: ChangeAction): "success" | "info" | "error" | "default" => {
  switch (action) {
    case "Added":
      return "success";
    case "Updated":
      return "info";
    case "Deleted":
      return "error";
    default:
      return "default";
  }
};

/**
 * Material UI table displaying only modified properties with friendly labels and clean values.
 */
const PropertyDiffTable: React.FC<{ rows: PropertyDiffRow[] }> = ({ rows }) => {
  if (rows.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
        No direct property changes.
      </Typography>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        mt: 1,
        borderRadius: 1.5,
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04) }}>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "text.secondary",
                py: 0.75,
                width: "25%",
              }}
            >
              FIELD
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "text.secondary",
                py: 0.75,
                width: "37.5%",
              }}
            >
              BEFORE
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "text.secondary",
                py: 0.75,
                width: "37.5%",
              }}
            >
              AFTER
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.key}
              hover
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell sx={{ py: 0.75, fontSize: "0.82rem", fontWeight: 500 }}>
                {row.label}
              </TableCell>
              <TableCell sx={{ py: 0.75, fontSize: "0.82rem", color: "text.secondary" }}>
                {row.before}
              </TableCell>
              <TableCell
                sx={{
                  py: 0.75,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {row.after}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * Material UI list of chips showing reactions, phases, and species added or removed.
 */
const StructuralChangesView: React.FC<{
  structural: StructuralChanges;
  allSpecies: Species[];
}> = ({ structural, allSpecies }) => {
  const hasChanges =
    structural.addedReactions.length > 0 ||
    structural.removedReactions.length > 0 ||
    structural.addedSpecies.length > 0 ||
    structural.removedSpecies.length > 0 ||
    structural.addedPhases.length > 0 ||
    structural.removedPhases.length > 0;

  if (!hasChanges) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
      {/* Reactions Added */}
      {structural.addedReactions.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.75 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.secondary", minWidth: 125 }}
          >
            Reactions Added:
          </Typography>
          {structural.addedReactions.map((item) => (
            <Chip
              key={item.id}
              label={
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                  <Typography component="span" variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                    + {item.name}
                  </Typography>
                  {item.reaction && (
                    <Typography component="span" variant="body2" sx={{ color: "text.primary", fontSize: "0.8rem" }}>
                      (<EquationText reaction={item.reaction} species={allSpecies} />)
                    </Typography>
                  )}
                </Box>
              }
              size="small"
              color="success"
              variant="outlined"
              sx={{ height: "auto", py: 0.4, px: 0.2 }}
            />
          ))}
        </Box>
      )}

      {/* Reactions Removed */}
      {structural.removedReactions.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.75 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.secondary", minWidth: 125 }}
          >
            Reactions Removed:
          </Typography>
          {structural.removedReactions.map((item) => (
            <Chip
              key={item.id}
              label={
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                  <Typography component="span" variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                    - {item.name}
                  </Typography>
                  {item.reaction && (
                    <Typography component="span" variant="body2" sx={{ color: "text.primary", fontSize: "0.8rem" }}>
                      (<EquationText reaction={item.reaction} species={allSpecies} />)
                    </Typography>
                  )}
                </Box>
              }
              size="small"
              color="error"
              variant="outlined"
              sx={{ height: "auto", py: 0.4, px: 0.2 }}
            />
          ))}
        </Box>
      )}

      {/* Species Added */}
      {structural.addedSpecies.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.75 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.secondary", minWidth: 125 }}
          >
            Species Added:
          </Typography>
          {structural.addedSpecies.map((name) => (
            <Chip
              key={name}
              label={`+ ${name}`}
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontSize: "0.75rem", height: 24 }}
            />
          ))}
        </Box>
      )}

      {/* Species Removed */}
      {structural.removedSpecies.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.75 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.secondary", minWidth: 125 }}
          >
            Species Removed:
          </Typography>
          {structural.removedSpecies.map((name) => (
            <Chip
              key={name}
              label={`- ${name}`}
              size="small"
              color="error"
              variant="outlined"
              sx={{ fontSize: "0.75rem", height: 24 }}
            />
          ))}
        </Box>
      )}

      {/* Phases Added */}
      {structural.addedPhases.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.75 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.secondary", minWidth: 125 }}
          >
            Phases Added:
          </Typography>
          {structural.addedPhases.map((name) => (
            <Chip
              key={name}
              label={`+ ${name}`}
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontSize: "0.75rem", height: 24 }}
            />
          ))}
        </Box>
      )}

      {/* Phases Removed */}
      {structural.removedPhases.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.75 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.secondary", minWidth: 125 }}
          >
            Phases Removed:
          </Typography>
          {structural.removedPhases.map((name) => (
            <Chip
              key={name}
              label={`- ${name}`}
              size="small"
              color="error"
              variant="outlined"
              sx={{ fontSize: "0.75rem", height: 24 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export const HistoryView: React.FC<HistoryViewProps> = ({ family }) => {
  const [history, setHistory] = useState<Array<ChangeSet>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTargetType, setSelectedTargetType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedChangeSets, setExpandedChangeSets] = useState<Set<string>>(new Set());

  const fetchHistory = () => {
    if (!family.id) return;
    setLoading(true);
    setError(null);
    getFamilyHistory(family.id)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setHistory(list);
        // Expand the first two by default
        setExpandedChangeSets(new Set(list.slice(0, 2).map((cs) => cs.id)));
      })
      .catch((err) => {
        console.error("Failed to fetch family history:", err);
        setError("Unable to load history. Ensure you have owner or contributor access.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, [family.id]);

  const toggleExpand = (id: string) => {
    setExpandedChangeSets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const nameResolver = useMemo(
    () => createEntityNameResolver(family, history),
    [family, history],
  );

  const reactionResolver = useMemo(
    () => createReactionResolver(family, history),
    [family, history],
  );

  const allSpecies = useMemo(
    () => getAllAvailableSpecies(family, history),
    [family, history],
  );

  const safeHistory = Array.isArray(history) ? history : [];
  const filteredHistory = safeHistory
    .map((cs) => {
      const filteredEntries = cs.entries.filter((entry) => {
        if (selectedTargetType !== "ALL" && entry.targetType !== selectedTargetType) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTarget = entry.targetName.toLowerCase().includes(q);
          const matchesType = entry.targetType.toLowerCase().includes(q);
          const matchesNote = cs.note?.toLowerCase().includes(q) ?? false;
          return matchesTarget || matchesType || matchesNote;
        }
        return true;
      });
      return { ...cs, entries: filteredEntries };
    })
    .filter((cs) => cs.entries.length > 0 || (!selectedTargetType && !searchQuery));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 2 }}>
      {/* Header and Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HistoryIcon color="primary" />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Audit History
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchHistory}
            variant="outlined"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Filter toolbar */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="target-type-filter-label">Filter by type</InputLabel>
          <Select
            labelId="target-type-filter-label"
            label="Filter by type"
            value={selectedTargetType}
            onChange={(e) => setSelectedTargetType(e.target.value)}
          >
            <MenuItem value="ALL">All Types</MenuItem>
            <MenuItem value="Family">Family Properties</MenuItem>
            <MenuItem value="Species">Species</MenuItem>
            <MenuItem value="Reaction">Reactions</MenuItem>
            <MenuItem value="Phase">Phases</MenuItem>
            <MenuItem value="Mechanism">Mechanisms</MenuItem>
            <MenuItem value="Group">Groups</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Search changes or notes"
          placeholder="e.g. O3, rate constant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 260 }}
        />
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={36} />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ py: 3 }}>
          {error}
        </Typography>
      ) : filteredHistory.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No change sets recorded yet. Changes made during saves will appear here.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 4 }}>
          {filteredHistory.map((cs) => {
            const isExpanded = expandedChangeSets.has(cs.id);
            const formattedDate = formatLocalDateTime(cs.timestamp);
            const author = cs.user?.username || "Unknown user";

            const addedCount = cs.entries.filter((e) => e.action === "Added").length;
            const updatedCount = cs.entries.filter((e) => e.action === "Updated").length;
            const deletedCount = cs.entries.filter((e) => e.action === "Deleted").length;

            return (
              <Paper
                key={cs.id}
                variant="outlined"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 1.5,
                  overflow: "hidden",
                }}
              >
                {/* ChangeSet Card Header */}
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: cs.note ? 0.75 : 0,
                    bgcolor: "action.hover",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleExpand(cs.id)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formattedDate}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        by <strong>{author}</strong>
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {addedCount > 0 && (
                        <Chip
                          label={`+${addedCount} Added`}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ height: 22, fontSize: "0.75rem", fontWeight: 600 }}
                        />
                      )}
                      {updatedCount > 0 && (
                        <Chip
                          label={`~${updatedCount} Updated`}
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ height: 22, fontSize: "0.75rem", fontWeight: 600 }}
                        />
                      )}
                      {deletedCount > 0 && (
                        <Chip
                          label={`-${deletedCount} Deleted`}
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ height: 22, fontSize: "0.75rem", fontWeight: 600 }}
                        />
                      )}
                      <IconButton size="small" onClick={() => toggleExpand(cs.id)}>
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </Box>

                  {cs.note && (
                    <>
                      <Divider sx={{ my: 0.5 }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.primary",
                          whiteSpace: "pre-wrap",
                          fontSize: "0.88rem",
                        }}
                      >
                        {cs.note}
                      </Typography>
                    </>
                  )}
                </Box>

                {/* Change Entries */}
                <Collapse in={isExpanded}>
                  <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                    {cs.entries.map((entry) => {
                      const structural = computeStructuralChanges(
                        entry.targetType,
                        entry.before,
                        entry.after,
                        nameResolver,
                        reactionResolver,
                      );
                      const propertyDiffs = computePropertyDiffs(
                        entry.before,
                        entry.after,
                      );

                      // For reactions, check if equation itself changed
                      let currentReaction = null;
                      if (entry.targetType === "Reaction") {
                        currentReaction =
                          reactionResolver(entry.targetId) ||
                          parseReactionFromJson(entry.after || entry.before);

                        const beforeReaction = parseReactionFromJson(entry.before);
                        const afterReaction = parseReactionFromJson(entry.after);

                        if (areReactionEquationsDifferent(beforeReaction, afterReaction)) {
                          propertyDiffs.unshift({
                            key: "equation",
                            label: "Equation",
                            before: beforeReaction ? (
                              <EquationText reaction={beforeReaction} species={allSpecies} />
                            ) : (
                              "—"
                            ),
                            after: afterReaction ? (
                              <EquationText reaction={afterReaction} species={allSpecies} />
                            ) : (
                              "—"
                            ),
                          });
                        }
                      }

                      return (
                        <Box
                          key={entry.id}
                          sx={{
                            p: 2,
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              flexWrap: "wrap",
                              mb: 0.5,
                            }}
                          >
                            <Chip
                              label={entry.targetType}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600, height: 22, fontSize: "0.75rem" }}
                            />
                            <Chip
                              label={entry.action}
                              size="small"
                              color={actionColor(entry.action)}
                              sx={{ fontWeight: 600, height: 22, fontSize: "0.75rem" }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {entry.targetName}
                            </Typography>
                            {entry.targetType === "Reaction" && currentReaction && (
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                — <EquationText reaction={currentReaction} species={allSpecies} />
                              </Typography>
                            )}
                          </Box>

                          {entry.action === "Updated" && (
                            <>
                              <StructuralChangesView
                                structural={structural}
                                allSpecies={allSpecies}
                              />
                              <PropertyDiffTable rows={propertyDiffs} />
                            </>
                          )}
                          {entry.action === "Added" && (
                            <>
                              {entry.targetType === "Mechanism" && (
                                <StructuralChangesView
                                  structural={structural}
                                  allSpecies={allSpecies}
                                />
                              )}
                              <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="caption" color="success.main">
                                  Added to family
                                </Typography>
                                {entry.targetType === "Reaction" && currentReaction && (
                                  <Typography variant="body2" sx={{ color: "text.primary" }}>
                                    (<EquationText reaction={currentReaction} species={allSpecies} />)
                                  </Typography>
                                )}
                              </Box>
                            </>
                          )}
                          {entry.action === "Deleted" && (
                            <Typography
                              variant="caption"
                              color="error.main"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              Deleted from family.
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
