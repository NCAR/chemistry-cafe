import React, { useEffect, useMemo, useState } from "react";
import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { UUID } from "crypto";
import {
  ChangeAction,
  ChangeSet,
  ChangeTargetType,
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

export type EntityHistoryModalProps = {
  open: boolean;
  onClose: () => void;
  familyId: UUID;
  targetType: ChangeTargetType;
  targetId: UUID;
  targetName: string;
  family?: Family | null;
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

export const EntityHistoryModal: React.FC<EntityHistoryModalProps> = ({
  open,
  onClose,
  familyId,
  targetType,
  targetId,
  targetName,
  family,
}) => {
  const [history, setHistory] = useState<Array<ChangeSet>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && familyId && targetId) {
      setLoading(true);
      setError(null);
      getFamilyHistory(familyId, targetType, targetId)
        .then((data) => setHistory(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error("Failed to load entity history:", err);
          setError("Failed to load change history.");
        })
        .finally(() => setLoading(false));
    }
  }, [open, familyId, targetType, targetId]);

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

  const currentReaction = useMemo(() => {
    if (targetType !== "Reaction") return null;
    return reactionResolver(targetId);
  }, [targetType, targetId, reactionResolver]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="h6" component="div">
            History: {targetType} &quot;{targetName}&quot;
          </Typography>
          {targetType === "Reaction" && currentReaction && (
            <Typography
              component="span"
              variant="body1"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              (<EquationText reaction={currentReaction} species={allSpecies} />)
            </Typography>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary">
          Audit trail of saves that added, updated, or removed this {targetType.toLowerCase()}.
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ py: 2 }}>
            {error}
          </Typography>
        ) : history.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
            No changes recorded for this {targetType.toLowerCase()} yet.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {history.map((changeSet) => {
              const formattedDate = formatLocalDateTime(changeSet.timestamp);
              const author = changeSet.user?.username || "Unknown user";

              return (
                <Paper
                  key={changeSet.id}
                  variant="outlined"
                  sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: changeSet.note ? 0.75 : 0,
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

                    {changeSet.note && (
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
                          {changeSet.note}
                        </Typography>
                      </>
                    )}
                  </Box>

                  {changeSet.entries.map((entry) => {
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

                    let entryReaction = null;
                    if (entry.targetType === "Reaction") {
                      entryReaction =
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
                      <Box key={entry.id} sx={{ mt: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
                          <Chip
                            label={entry.action}
                            size="small"
                            color={actionColor(entry.action)}
                            sx={{ fontWeight: 600, height: 22, fontSize: "0.75rem" }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {entry.targetName}
                          </Typography>
                          {entry.targetType === "Reaction" && entryReaction && (
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
                              — <EquationText reaction={entryReaction} species={allSpecies} />
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
                              {entry.targetType === "Reaction" && entryReaction && (
                                <Typography variant="body2" sx={{ color: "text.primary" }}>
                                  (<EquationText reaction={entryReaction} species={allSpecies} />)
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
                </Paper>
              );
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
