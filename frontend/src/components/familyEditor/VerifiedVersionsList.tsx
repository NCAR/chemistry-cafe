import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { Family, Mechanism, VerifiedMechanismVersion } from "../../types/chemistryModels";
import { useAuth } from "../AuthContext";
import { getFamilyVersion } from "../../API/API_GetMethods";
import {
  archiveMechanism,
  deprecateMechanism,
  verifyMechanism,
} from "../../API/API_CreateMethods";
import {
  deleteVerifiedMechanism,
  undeprecateMechanism,
} from "../../API/API_DeleteMethods";
import {
  apiToFrontendFamily,
} from "../../helpers/backendInteractions";
import {
  cloneFamily,
  addFamilyLocally,
  addUploadedFamilyIdLocally,
} from "../../helpers/localFamilies";
import {
  serializeMechanismJSON,
  serializeMechanismYAML,
} from "../../helpers/serialization";
import { VerifyMechanismModal } from "../modals/VerifyMechanismModal";
import { DeprecateMechanismModal } from "../modals/DeprecateMechanismModal";
import { ConfirmActionModal } from "../modals/ConfirmActionModal";

export type VerifiedVersionsListProps = {
  family: Family;
  mechanism: Mechanism;
  onUpdateFamily?: (updatedFamily: Family) => void;
  onViewVersion?: (version: VerifiedMechanismVersion) => void;
  onStartFromVersion?: (version: VerifiedMechanismVersion) => void;
  readOnly?: boolean;
};

export const VerifiedVersionsList: React.FC<VerifiedVersionsListProps> = ({
  family,
  mechanism,
  onUpdateFamily,
  onViewVersion,
  onStartFromVersion,
  readOnly,
}) => {
  const { user } = useAuth();

  const [expanded, setExpanded] = useState<boolean>(true);
  const [downloadAnchor, setDownloadAnchor] = useState<{
    el: HTMLElement;
    version: VerifiedMechanismVersion;
  } | null>(null);

  // Modals state
  const [verifyModalOpen, setVerifyModalOpen] = useState<boolean>(false);
  const [deprecateModalVersion, setDeprecateModalVersion] =
    useState<VerifiedMechanismVersion | null>(null);
  const [deleteModalVersion, setDeleteModalVersion] =
    useState<VerifiedMechanismVersion | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  // Check roles: only Verifiers and Admins can verify, deprecate, archive or delete
  const isVerifierOrAdmin =
    user?.role?.toLowerCase() === "verifier" ||
    user?.role?.toLowerCase() === "admin";

  // Filter verified versions associated with this mechanism
  const allVerifiedVersions: VerifiedMechanismVersion[] =
    family.verifiedVersions || [];
  const mechanismVersions = allVerifiedVersions.filter(
    (v) =>
      v.sourceMechanismId === mechanism.id ||
      v.mechanismId === mechanism.id ||
      (mechanism.sourceObjectId &&
        (v.sourceMechanismId === mechanism.sourceObjectId ||
          v.mechanismId === mechanism.sourceObjectId)),
  );

  // Suggested default name for new verification: Family-Mechanism-Date
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultVerifyName = `${family.name}-${mechanism.name}-${todayStr}`;

  const handleVerifySubmit = async (name: string, note: string) => {
    setModalLoading(true);
    try {
      const createdDto = await verifyMechanism(family.id, mechanism.id, {
        name,
        note,
      });
      const newVersion: VerifiedMechanismVersion = {
        ...createdDto,
      };

      const updatedVersions = [newVersion, ...allVerifiedVersions];
      const updatedMechanisms = (family.mechanisms || []).map((m) =>
        m.id === mechanism.id
          ? {
              ...m,
              verified: true,
              verifiedDate: newVersion.verifiedDate,
              verifiedBy:
                newVersion.verifierName || newVersion.verifierUsername,
            }
          : m,
      );
      const updatedFam: Family = {
        ...family,
        mechanisms: updatedMechanisms,
        verifiedVersions: updatedVersions,
      };
      onUpdateFamily?.(updatedFam);
      setVerifyModalOpen(false);
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeprecateSubmit = async (
    reason: string,
    betterVersionId?: string,
  ) => {
    if (!deprecateModalVersion) return;
    setModalLoading(true);
    try {
      const updatedDto = await deprecateMechanism(
        family.id,
        deprecateModalVersion.mechanismId,
        {
          reason,
          betterVersionId: betterVersionId as any,
        },
      );

      const updatedVersions = allVerifiedVersions.map((v) =>
        v.id === updatedDto.id ? { ...v, ...updatedDto } : v,
      );
      const updatedFam: Family = {
        ...family,
        verifiedVersions: updatedVersions,
      };
      onUpdateFamily?.(updatedFam);
      setDeprecateModalVersion(null);
    } catch (err) {
      console.error("Deprecation failed:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUndeprecate = async (v: VerifiedMechanismVersion) => {
    try {
      const updatedDto = await undeprecateMechanism(family.id, v.mechanismId);
      const updatedVersions = allVerifiedVersions.map((ver) =>
        ver.id === updatedDto.id ? { ...ver, ...updatedDto } : ver,
      );
      const updatedFam: Family = {
        ...family,
        verifiedVersions: updatedVersions,
      };
      onUpdateFamily?.(updatedFam);
    } catch (err) {
      console.error("Undeprecation failed:", err);
    }
  };

  const handleToggleArchive = async (v: VerifiedMechanismVersion) => {
    try {
      const updatedDto = await archiveMechanism(family.id, v.mechanismId, {
        isArchived: !v.isArchived,
      });
      const updatedVersions = allVerifiedVersions.map((ver) =>
        ver.id === updatedDto.id ? { ...ver, ...updatedDto } : ver,
      );
      const updatedFam: Family = {
        ...family,
        verifiedVersions: updatedVersions,
      };
      onUpdateFamily?.(updatedFam);
    } catch (err) {
      console.error("Archive toggle failed:", err);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteModalVersion) return;
    setModalLoading(true);
    try {
      await deleteVerifiedMechanism(family.id, deleteModalVersion.mechanismId);
      const updatedVersions = allVerifiedVersions.filter(
        (v) => v.id !== deleteModalVersion.id,
      );
      const updatedFam: Family = {
        ...family,
        verifiedVersions: updatedVersions,
      };
      onUpdateFamily?.(updatedFam);
      setDeleteModalVersion(null);
    } catch (err) {
      console.error("Deletion failed:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleView = (v: VerifiedMechanismVersion) => {
    if (onViewVersion) {
      onViewVersion(v);
      return;
    }
    const sourceMechId = v.sourceMechanismId || mechanism.id;
    if (sourceMechId) {
      localStorage.setItem("selectedEditorMechanismId", sourceMechId);
    }
    const returnUrl = sourceMechId
      ? `/familyeditor?id=${family.id}&mechanismId=${sourceMechId}`
      : `/familyeditor?id=${family.id}`;
    const returnTo = encodeURIComponent(returnUrl);
    window.location.assign(
      `/familyeditor?id=${family.id}&versionId=${v.familyVersionId}&mechanismId=${v.mechanismId}&returnTo=${returnTo}`,
    );
  };

  const handleStartFromVersion = async (v: VerifiedMechanismVersion) => {
    if (onStartFromVersion) {
      onStartFromVersion(v);
      return;
    }
    try {
      const apiFam = await getFamilyVersion(family.id, v.familyVersionId);
      const frontFam = apiToFrontendFamily(apiFam);
      const cloned = cloneFamily(frontFam);
      cloned.name = `${v.name} (Draft)`;
      addFamilyLocally(cloned);
      addUploadedFamilyIdLocally(cloned.id);
      localStorage.setItem("selectedEditorFamilyId", cloned.id);
      if (cloned.mechanisms && cloned.mechanisms.length > 0) {
        localStorage.setItem(
          "selectedEditorMechanismId",
          cloned.mechanisms[0].id,
        );
      }
      window.location.assign(`/familyeditor?id=${cloned.id}`);
    } catch (err) {
      console.error("Failed to start from version snapshot:", err);
    }
  };

  const downloadFile = async (
    v: VerifiedMechanismVersion,
    format: "json" | "yaml",
  ) => {
    setDownloadAnchor(null);
    try {
      const apiFam = await getFamilyVersion(family.id, v.familyVersionId);
      const frontFam = apiToFrontendFamily(apiFam);
      const mech =
        frontFam.mechanisms.find((m) => m.id === v.mechanismId) ||
        frontFam.mechanisms[0];
      if (!mech) return;

      const metadata = {
        verifier: v.verifierName || v.verifierUsername,
        verifiedDate: v.verifiedDate,
        versionName: v.name,
        notes: v.notes || undefined,
        deprecation: v.isDeprecated
          ? {
              reason: v.deprecationReason,
              deprecatedDate: v.deprecatedDate,
              deprecatedBy: v.deprecatedByUsername,
            }
          : undefined,
      };

      let content = "";
      let mimeType = "application/json";
      let ext = "json";
      if (format === "yaml") {
        content = serializeMechanismYAML(mech, frontFam, metadata as any);
        mimeType = "text/yaml";
        ext = "yml";
      } else {
        content = serializeMechanismJSON(mech, frontFam, metadata as any);
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${v.name}.${ext}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download verified version:", err);
    }
  };

  return (
    <Box sx={{ mt: 3, mb: 2 }}>
      {/* Collapsible header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
          py: 0.5,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {expanded ? (
            <ArrowDropDownIcon fontSize="medium" sx={{ ml: -0.5 }} />
          ) : (
            <ArrowRightIcon fontSize="medium" sx={{ ml: -0.5 }} />
          )}
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Verified versions ({mechanismVersions.length})
          </Typography>
        </Box>

        {isVerifierOrAdmin && family.isPublic && !readOnly && (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={(e) => {
              e.stopPropagation();
              setVerifyModalOpen(true);
            }}
          >
            Verify this mechanism
          </Button>
        )}
      </Box>

      {/* Accordion list */}
      <Collapse in={expanded}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
          {mechanismVersions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ pl: 3, py: 1 }}>
              No verified versions recorded yet.
            </Typography>
          ) : (
            mechanismVersions.map((v) => {
              const formattedDate = v.verifiedDate
                ? v.verifiedDate.slice(0, 10)
                : "";

              return (
                <Paper
                  key={v.id}
                  variant="outlined"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    px: 2,
                    py: 1.5,
                    gap: 1,
                    borderStyle: v.isArchived ? "dashed" : "solid",
                    opacity: v.isArchived ? 0.75 : 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    {/* Date */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        fontFamily: "monospace",
                        fontSize: "0.95rem",
                      }}
                    >
                      {formattedDate}
                    </Typography>

                    {/* Status Badge */}
                    {v.isDeprecated ? (
                      <Tooltip
                        title={`Deprecated: ${v.deprecationReason || "No reason given"}`}
                        arrow
                      >
                        <Chip
                          label="Deprecated"
                          size="small"
                          color="warning"
                          variant="outlined"
                          icon={<WarningAmberIcon fontSize="small" />}
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            height: "26px",
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <Chip
                        label="Verified"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          height: "26px",
                        }}
                      />
                    )}

                    {/* Verifier Username */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      {v.verifierName || v.verifierUsername}
                    </Typography>

                    {v.isArchived && (
                      <Chip
                        label="Archived"
                        size="small"
                        variant="outlined"
                        color="default"
                        sx={{ fontSize: "0.7rem", height: 20 }}
                      />
                    )}

                    {/* Spacer */}
                    <Box sx={{ flex: 1 }} />

                    {/* Actions matching wireframe */}
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={(e) =>
                        setDownloadAnchor({ el: e.currentTarget, version: v })
                      }
                    >
                      Download
                    </Button>

                    <Button
                      variant="text"
                      size="small"
                      color="primary"
                      onClick={() => handleView(v)}
                    >
                      View
                    </Button>

                    <Button
                      variant="text"
                      size="small"
                      color="primary"
                      onClick={() => handleStartFromVersion(v)}
                    >
                      Start from this version
                    </Button>

                    {/* Verifier / Admin Management Controls */}
                    {isVerifierOrAdmin && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 1 }}>
                        {v.isDeprecated ? (
                          <Tooltip title="Remove deprecation" arrow>
                            <Button
                              size="small"
                              color="inherit"
                              onClick={() => handleUndeprecate(v)}
                              sx={{ fontSize: "0.75rem" }}
                            >
                              Undeprecate
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Deprecate this version" arrow>
                            <Button
                              size="small"
                              color="warning"
                              onClick={() => setDeprecateModalVersion(v)}
                              sx={{ fontSize: "0.75rem" }}
                            >
                              Deprecate
                            </Button>
                          </Tooltip>
                        )}

                        <Tooltip
                          title={v.isArchived ? "Unarchive version" : "Archive version"}
                          arrow
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleToggleArchive(v)}
                            color={v.isArchived ? "primary" : "default"}
                          >
                            {v.isArchived ? (
                              <UnarchiveIcon fontSize="small" />
                            ) : (
                              <ArchiveIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Permanently delete version" arrow>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteModalVersion(v)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>

                  {/* Description under existing context with a line divider */}
                  {v.notes && (
                    <>
                      <Divider />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic", px: 0.5 }}
                      >
                        {v.notes}
                      </Typography>
                    </>
                  )}
                </Paper>
              );
            })
          )}
        </Box>
      </Collapse>

      {/* Download menu (JSON / YAML) */}
      <Menu
        anchorEl={downloadAnchor?.el}
        open={Boolean(downloadAnchor)}
        onClose={() => setDownloadAnchor(null)}
      >
        <MenuItem
          onClick={() =>
            downloadAnchor && downloadFile(downloadAnchor.version, "json")
          }
        >
          Download JSON (.json)
        </MenuItem>
        <MenuItem
          onClick={() =>
            downloadAnchor && downloadFile(downloadAnchor.version, "yaml")
          }
        >
          Download YAML (.yml)
        </MenuItem>
      </Menu>

      {/* Verify modal */}
      <VerifyMechanismModal
        open={verifyModalOpen}
        defaultName={defaultVerifyName}
        onClose={() => setVerifyModalOpen(false)}
        onSubmit={handleVerifySubmit}
        loading={modalLoading}
      />

      {/* Deprecate modal */}
      <DeprecateMechanismModal
        open={Boolean(deprecateModalVersion)}
        versionName={deprecateModalVersion?.name || ""}
        otherVersions={allVerifiedVersions
          .filter((ver) => ver.id !== deprecateModalVersion?.id)
          .map((ver) => ({ id: ver.id, name: ver.name }))}
        onClose={() => setDeprecateModalVersion(null)}
        onSubmit={handleDeprecateSubmit}
        loading={modalLoading}
      />

      {/* Delete confirmation modal */}
      <ConfirmActionModal
        open={Boolean(deleteModalVersion)}
        message={`Delete verified version "${deleteModalVersion?.name}"?`}
        subtitle="This action is permanent and will completely remove this frozen version snapshot."
        onClose={() => setDeleteModalVersion(null)}
        onAction={handleDeleteSubmit}
        confirmLabel="Delete Version"
      />
    </Box>
  );
};
