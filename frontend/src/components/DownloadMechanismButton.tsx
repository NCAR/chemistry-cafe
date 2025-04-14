import { Button, ButtonGroup, Popover, Tooltip } from "@mui/material";
import { useState, MouseEvent } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import { Family, Mechanism } from "../types/chemistryModels";
import {
  serializeMechanismJSON,
  serializeMechanismMusicBox,
  serializeMechanismYAML,
} from "../helpers/serialization";

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
        anchor.download = "campData.json";
        break;
      case "YAML":
        anchor.download = "campData.yml";
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
          <Tooltip title="CAMP V1 configuration" arrow>
            <Button
              aria-label="Download as a CAMP V1 JSON file"
              data-testid="download-v1-json"
              sx={{
                textTransform: "none",
              }}
              onClick={() => {
                const serializedMechanism = serializeMechanismJSON(
                  mechanism,
                  family,
                );
                const blob = new Blob([serializedMechanism], {
                  type: "octet/stream",
                });
                downloadBlob(blob, "JSON");
              }}
            >
              JSON
            </Button>
          </Tooltip>
          <Tooltip title="CAMP V1 configuration" arrow>
            <Button
              aria-label="Download as a CAMP V1 YAML file"
              data-testid="download-v1-yaml"
              sx={{
                textTransform: "none",
              }}
              onClick={() => {
                const serializedMechanism = serializeMechanismYAML(
                  mechanism,
                  family,
                );
                const blob = new Blob([serializedMechanism], {
                  type: "octet/stream",
                });
                downloadBlob(blob, "YAML");
              }}
            >
              YAML
            </Button>
          </Tooltip>
          <Tooltip title="CAMP V0 configuration" arrow>
            <Button
              aria-label="Download as a CAMP V0 ZIP file"
              data-testid="download-v0-zip"
              sx={{
                textTransform: "none",
              }}
              onClick={() => {
                serializeMechanismMusicBox(mechanism, family).then((blob) => {
                  console.log(blob);
                  downloadBlob(blob, "MusicBox");
                });
              }}
            >
              MusicBox
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Popover>
    </>
  );
};
