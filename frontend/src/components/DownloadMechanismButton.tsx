import { Button, ButtonGroup, Popover, Tooltip } from "@mui/material";
import { useState, MouseEvent } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import { Family, Mechanism } from "../types/chemistryModels";
import { serializeMechanismJSON } from "../helpers/serialization";

type RowActionsButtonProps = {
    mechanism: Mechanism;
    family: Family;
}

/**
 * Displays options to edit a row in a datagrid
 */
export const DownloadMechanismButton: React.FC<RowActionsButtonProps> =
    ({ mechanism, family }) => {
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
            anchor.style = "display: none";
            document.body.appendChild(anchor);

            // Setup blob rerefence
            const url = window.URL.createObjectURL(blob);
            anchor.href = url;
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
            window.URL.revokeObjectURL(url);
        }

        return (
            <>
                <Button
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
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <ButtonGroup variant="outlined">
                        <Tooltip title="V1 CAMP configuration" arrow>
                            <Button
                                sx={{
                                    textTransform: "none"
                                }}
                                onClick={() => {
                                    const serializedMechanism = serializeMechanismJSON(mechanism, family);
                                    const blob = new Blob([serializedMechanism], { type: "octet/stream" });
                                    downloadBlob(blob, "JSON");
                                }}
                            >
                                JSON
                            </Button>
                        </Tooltip>
                        <Tooltip title="V1 CAMP configuration" arrow>
                            <Button
                                sx={{
                                    textTransform: "none"
                                }}
                            >
                                YAML
                            </Button>
                        </Tooltip>
                        <Tooltip title="MusicBox CAMP configuration" arrow>
                            <Button
                                sx={{
                                    textTransform: "none"
                                }}
                            >
                                MusicBox
                            </Button>
                        </Tooltip>
                    </ButtonGroup>
                </Popover >
            </>
        );
    };