import { useState, MouseEvent } from "react";
import { Phase } from "../types/chemistryModels";
import { Button, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export type SelectPhaseButtonProps = {
  onSelect: (phase: Phase) => void;
  "aria-label": string;
  phases: Array<Phase>;
  text?: string;
};

export const SelectPhaseButton: React.FC<SelectPhaseButtonProps> = ({
  "aria-label": ariaLabel,
  onSelect,
  phases,
  text,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleMenuClose = () => {
    setOpen(false);
  };

  return (
    <>
      {text ? (
        <Button
          startIcon={<AddIcon />}
          color="primary"
          onClick={handleMenuOpen}
        >
          {text}
        </Button>
      ) : (
        <IconButton
          aria-label={ariaLabel}
          color="primary"
          onClick={handleMenuOpen}
        >
          <AddIcon />
        </IconButton>
      )}
      <Menu open={open} anchorEl={anchorEl} onClose={handleMenuClose}>
        {phases.length == 0 ? (
          <MenuItem disabled>
            <Typography>No Phases Found</Typography>
          </MenuItem>
        ) : (
          phases.map((phase, index) => {
            return (
              <MenuItem
                key={`selection-${phase.id}-${index}`}
                onClick={() => {
                  onSelect(phase);
                  handleMenuClose();
                }}
              >
                <Typography>{phase.name || "<No Name>"}</Typography>
              </MenuItem>
            );
          })
        )}
      </Menu>
    </>
  );
};
