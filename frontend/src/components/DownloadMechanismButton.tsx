import {
  Box,
  Button,
  ButtonGroup,
  Link,
  Popover,
  Tooltip,
} from "@mui/material";
import { useState, MouseEvent } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import { Family, Mechanism } from "../types/chemistryModels";
import {
  serializeMechanismJSON,
  serializeMechanismMusicBox as serializeMusicBoxConfiguration,
  serializeMechanismYAML,
} from "../helpers/serialization";
import {
  validateMechanism,
  ValidationIssue,
} from "../helpers/validationIssues";
import { ValidationErrorsModal } from "./modals/ValidationErrorsModal";

type RowActionsButtonProps = {
  mechanism: Mechanism;
  family: Family;
};

/**
 * Displays options to edit a row in a datagrid
 */
export const DownloadMechanismButton: React.FC<RowActionsButtonProps> = ({
  mechanism,
  family,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationIssue[]>(
    [],
  );
  const [pendingDownload, setPendingDownload] = useState<{
    createBlob: () => Blob | Promise<Blob>;
    variant: "JSON" | "YAML" | "MusicBox";
  } | null>(null);

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const downloadBlob = (blob: Blob, variant: "JSON" | "YAML" | "MusicBox") => {
    // Create invisible anchor tag

    const anchor = document.createElement("a");
    document.body.appendChild(anchor);

    // Setup blob rerefence
    let url = "";
    /* istanbul ignore if */
    if (window.URL.createObjectURL != undefined) {
      url = window.URL.createObjectURL(blob);
      anchor.href = url;
    }
    switch (variant) {
      case "JSON":
        anchor.download = "mechanism.json";
        break;
      case "YAML":
        anchor.download = "mechanism.yml";
        break;
      case "MusicBox":
        anchor.download = "musicbox.zip";
        break;
    }

    // Download the blob by simulating a click and cleanup anchor
    anchor.click();

    /* istanbul ignore if */
    if (window.URL.revokeObjectURL != undefined) {
      window.URL.revokeObjectURL(url);
    }
  };

  /**
   * Checks the mechanism, then downloads it. If the check fails, shows the
   * validator messages and does not download.
   */
  const validateAndDownload = async (
    createBlob: () => Blob | Promise<Blob>,
    variant: "JSON" | "YAML" | "MusicBox",
  ) => {
    const errors = await validateMechanism(mechanism, family);
    if (errors.length > 0) {
      handleMenuClose();
      setPendingDownload({ createBlob, variant });
      setValidationErrors(errors);
      return;
    }
    downloadBlob(await createBlob(), variant);
  };

  const handleDownloadUnverified = () => {
    handleMenuClose();
    downloadBlob(
      new Blob([serializeMechanismJSON(mechanism, family)], {
        type: "octet/stream",
      }),
      "JSON",
    );
  };

  return (
    <>
      <Button
        aria-label="Download Mechanism Configuration"
        data-testid="download-mechanism"
        startIcon={<DownloadIcon />}
        sx={{ textTransform: "none" }}
        color="primary"
        onClick={handleMenuOpen}
      >
        Download
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <ButtonGroup variant="outlined">
          <Tooltip title="V1 configuration" arrow>
            <Button
              aria-label="Download as a V1 JSON file"
              data-testid="download-v1-json"
              sx={{
                textTransform: "none",
              }}
              onClick={() =>
                validateAndDownload(
                  () =>
                    new Blob([serializeMechanismJSON(mechanism, family)], {
                      type: "octet/stream",
                    }),
                  "JSON",
                )
              }
            >
              JSON
            </Button>
          </Tooltip>
          <Tooltip title="V1 configuration" arrow>
            <Button
              aria-label="Download as a V1 YAML file"
              data-testid="download-v1-yaml"
              sx={{
                textTransform: "none",
              }}
              onClick={() =>
                validateAndDownload(
                  () =>
                    new Blob([serializeMechanismYAML(mechanism, family)], {
                      type: "octet/stream",
                    }),
                  "YAML",
                )
              }
            >
              YAML
            </Button>
          </Tooltip>
          <Tooltip title="CAMP V0 MusicBox configuration" arrow>
            <Button
              aria-label="Download as a MusicBox CAMP V0 ZIP file"
              data-testid="download-v0-zip"
              sx={{
                textTransform: "none",
              }}
              onClick={() =>
                validateAndDownload(
                  () => serializeMusicBoxConfiguration(mechanism, family),
                  "MusicBox",
                )
              }
            >
              MusicBox
            </Button>
          </Tooltip>
          <Tooltip title="KPP export (coming soon)" arrow>
            <span>
              <Button
                aria-label="Download as a KPP file"
                data-testid="download-kpp"
                disabled
                sx={{
                  textTransform: "none",
                }}
              >
                KPP
              </Button>
            </span>
          </Tooltip>
        </ButtonGroup>
        <Box sx={{ pt: 1, pb: 0.5, textAlign: "center" }}>
          <Link
            component="button"
            variant="caption"
            color="text.secondary"
            onClick={handleDownloadUnverified}
            sx={{ cursor: "pointer", textDecoration: "underline" }}
          >
            Download current, unverified state
          </Link>
        </Box>
      </Popover>
      <ValidationErrorsModal
        open={validationErrors.length > 0}
        onClose={() => {
          setValidationErrors([]);
          setPendingDownload(null);
        }}
        message={`Fix these problems in "${mechanism.name}" before you download it.`}
        family={family}
        errors={validationErrors}
        onDownloadAnyway={
          pendingDownload
            ? async () => {
                const blob = await pendingDownload.createBlob();
                downloadBlob(blob, pendingDownload.variant);
                setPendingDownload(null);
              }
            : undefined
        }
      />
    </>
  );
};
