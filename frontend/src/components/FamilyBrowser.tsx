import React, { memo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItem,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Family, Mechanism } from "../types/chemistryModels";
import { APIFamily } from "../API/API_Interfaces";
import { UUID } from "crypto";
import { useAuth } from "./AuthContext";
import { DownloadMechanismButton } from "./DownloadMechanismButton";
import { apiToFrontendFamily } from "../helpers/backendInteractions";

export type FamilyBrowserProps = {
  families?: Array<Family | APIFamily>;
  openFamilyIds?: Set<string>;
  onToggleExpand?: (familyId: string) => void;
  onOpenFamily?: (family: Family) => void;
  onCloneFamily?: (family: Family) => void;
  onEditMechanism?: (family: Family, mechanism: Mechanism) => void;
  onCloneMechanism?: (family: Family, mechanism: Mechanism) => void;
  // Legacy callbacks for backward compatibility
  handleEditButtonClick?: (id: UUID) => void;
  handleCloneButtonClick?: (id: UUID) => void;
};

export function getMechanismVerification(mechanism: Mechanism): {
  isVerified: boolean;
  verifiedDate?: string;
  verifiedBy?: string;
} {
  const props = mechanism.otherProperties as
    | Record<string, unknown>
    | undefined;
  if (!props) {
    return { isVerified: false };
  }
  const isVerified = Boolean(
    props.verified ||
      props.isVerified ||
      props.verifiedDate ||
      props.verifiedBy,
  );
  const verifiedDate = (props.verifiedDate ||
    props.verified_at ||
    props.date) as string | undefined;
  const verifiedBy = (props.verifiedBy ||
    props.verifier ||
    props.verified_by) as string | undefined;
  return { isVerified, verifiedDate, verifiedBy };
}

const FamilyBrowser: React.FC<FamilyBrowserProps> = ({
  families,
  openFamilyIds,
  onToggleExpand,
  onOpenFamily,
  onCloneFamily,
  onEditMechanism,
  onCloneMechanism,
  handleEditButtonClick,
  handleCloneButtonClick,
}) => {
  return (
    <List disablePadding>
      {families?.map((item: Family | APIFamily, index: number) => {
        // Ensure family is in frontend Family structure
        const family: Family =
          "isInDatabase" in item
            ? (item as Family)
            : apiToFrontendFamily(item as APIFamily);

        return (
          <FamilyInfoCard
            key={`${family.id}-${index}`}
            family={family}
            isOpen={openFamilyIds ? openFamilyIds.has(family.id) : undefined}
            onToggleExpand={onToggleExpand}
            onOpenFamily={onOpenFamily}
            onCloneFamily={onCloneFamily}
            onEditMechanism={onEditMechanism}
            onCloneMechanism={onCloneMechanism}
            handleEditButtonClick={handleEditButtonClick}
            handleCloneButtonClick={handleCloneButtonClick}
          />
        );
      })}
    </List>
  );
};

const FamilyInfoCard = memo(function FamilyInfoCard({
  family,
  isOpen: controlledIsOpen,
  onToggleExpand,
  onOpenFamily,
  onCloneFamily,
  onEditMechanism,
  onCloneMechanism,
  handleEditButtonClick,
  handleCloneButtonClick,
}: {
  family: Family;
  isOpen?: boolean;
} & FamilyBrowserProps) {
  const { user } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  const toggleOpen = () => {
    if (onToggleExpand) {
      onToggleExpand(family.id);
    } else {
      setInternalOpen((prev) => !prev);
    }
  };

  const mechanismCount = family.mechanisms?.length ?? 0;

  const isOwner = Boolean(user?.id && family.owner?.id === user.id);
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isContributor = Boolean(
    user?.id && family.contributorIds?.includes(user.id),
  );
  const isDraft = !family.isInDatabase;
  const canEdit = isOwner || isAdmin || isContributor || isDraft;

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenFamily) {
      onOpenFamily(family);
    } else if (handleEditButtonClick) {
      handleEditButtonClick(family.id as UUID);
    }
  };

  const handleCloneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCloneFamily) {
      onCloneFamily(family);
    } else if (handleCloneButtonClick) {
      handleCloneButtonClick(family.id as UUID);
    }
  };

  return (
    <ListItem sx={{ px: 0, py: 1 }}>
      <Card sx={{ flex: 1 }} variant="outlined">
        <CardContent
          sx={{
            cursor: "pointer",
            "&:hover": { bgcolor: "action.hover" },
            pb: 2,
          }}
          onClick={toggleOpen}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? "Close" : "Open"} family ${family.name}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleOpen();
            }
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                flex: 1,
              }}
            >
              <IconButton
                size="small"
                aria-label={
                  isOpen ? "Collapse family details" : "Expand family details"
                }
                sx={{
                  transform: isOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                  mt: 0.5,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOpen();
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>

              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    {family.name}
                  </Typography>

                  {/* Visibility & Role indicators */}
                  {isDraft ? (
                    <Chip
                      size="small"
                      label="Draft in browser"
                      color="warning"
                      variant="outlined"
                    />
                  ) : family.isPublic ? (
                    <Chip
                      size="small"
                      label="Public"
                      color="success"
                      variant="outlined"
                    />
                  ) : (
                    <Tooltip title="Private: only the owner, contributors, and admins can view">
                      <Chip
                        size="small"
                        icon={<LockIcon fontSize="small" />}
                        label="Private"
                        variant="outlined"
                      />
                    </Tooltip>
                  )}

                  {isContributor && (
                    <Chip
                      size="small"
                      label="Contributor"
                      color="info"
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Owner */}
                <Typography variant="body2" color="text.secondary">
                  Owner: {family.owner?.username || "Local Draft"}
                </Typography>

                {/* Description */}
                {family.description && (
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ mt: 1, whiteSpace: "pre-line" }}
                  >
                    {family.description}
                  </Typography>
                )}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  {mechanismCount} mechanism{mechanismCount === 1 ? "" : "s"}
                </Typography>
              </Box>
            </Box>

            {/* Action buttons: Open for editable families; View + Edit a copy for other families */}
            <Box sx={{ mt: 0.5, display: "flex", gap: 1 }}>
              {canEdit ? (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handleOpenClick}
                  aria-label={`Open ${family.name}`}
                >
                  Open
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={handleOpenClick}
                    aria-label={`View ${family.name}`}
                  >
                    View
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={handleCloneClick}
                    aria-label={`Edit a copy of ${family.name}`}
                  >
                    Edit a copy
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* Collapsible Mechanisms list */}
          <Collapse in={isOpen} unmountOnExit sx={{ mt: 2 }}>
            <Box
              sx={{
                pt: 1.5,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {mechanismCount === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  This family has no mechanisms yet.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {family.mechanisms.map((mechanism) => {
                    const reactionCount = mechanism.reactionIds?.length ?? 0;
                    const { isVerified, verifiedDate } =
                      getMechanismVerification(mechanism);
                    const formattedDate = verifiedDate
                      ? new Date(verifiedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : null;

                    return (
                      <ListItem
                        key={mechanism.id}
                        className="mechanism-row"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          py: 1,
                          px: 1.5,
                          mb: 0.5,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <Box sx={{ flex: 1, pr: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              flexWrap: "wrap",
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: "bold" }}
                            >
                              {mechanism.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {reactionCount} reaction
                              {reactionCount === 1 ? "" : "s"}
                            </Typography>
                            {isVerified ? (
                              <Chip
                                size="small"
                                color="success"
                                variant="outlined"
                                label={
                                  formattedDate
                                    ? `Verified ${formattedDate}`
                                    : "Verified"
                                }
                              />
                            ) : (
                              <Chip
                                size="small"
                                variant="outlined"
                                label="Unverified"
                                sx={{ color: "text.secondary" }}
                              />
                            )}
                          </Box>
                          {mechanism.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              {mechanism.description}
                            </Typography>
                          )}
                        </Box>

                        {/* Mechanism actions: Download and Edit (or Edit a copy) */}
                        <Box
                          className="mechanism-actions"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <DownloadMechanismButton
                            mechanism={mechanism}
                            family={family}
                          />
                          {canEdit ? (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<EditIcon />}
                              sx={{ textTransform: "none" }}
                              onClick={() => {
                                if (onEditMechanism) {
                                  onEditMechanism(family, mechanism);
                                } else {
                                  handleOpenClick({} as React.MouseEvent);
                                }
                              }}
                              aria-label={`Edit ${mechanism.name}`}
                            >
                              Edit
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                startIcon={<VisibilityIcon />}
                                sx={{ textTransform: "none" }}
                                onClick={() => {
                                  if (onEditMechanism) {
                                    onEditMechanism(family, mechanism);
                                  } else {
                                    handleOpenClick({} as React.MouseEvent);
                                  }
                                }}
                                aria-label={`View ${mechanism.name}`}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                startIcon={<ContentCopyIcon />}
                                sx={{ textTransform: "none" }}
                                onClick={() => {
                                  if (onCloneMechanism) {
                                    onCloneMechanism(family, mechanism);
                                  } else {
                                    handleCloneClick({} as React.MouseEvent);
                                  }
                                }}
                                aria-label={`Edit a copy of ${mechanism.name}`}
                              >
                                Edit a copy
                              </Button>
                            </>
                          )}
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </ListItem>
  );
});

export default FamilyBrowser;
