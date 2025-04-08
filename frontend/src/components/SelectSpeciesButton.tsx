import { useState, MouseEvent } from "react";
import { Species } from "../types/chemistryModels";
import { Button, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export type SelectSpeciesButtonProps = {
  onSelect: (species: Species) => void;
  "aria-label": string;
  species: Array<Species>;
  text?: string;
};

export const SelectSpeciesButton: React.FC<SelectSpeciesButtonProps> = ({
  "aria-label": ariaLabel,
  onSelect,
  species,
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
        {species.length == 0 ? (
          <MenuItem disabled>
            <Typography>No Species Found</Typography>
          </MenuItem>
        ) : (
          species.map((reactant, index) => {
            return (
              <MenuItem
                key={`selection-${reactant.id}-${index}`}
                onClick={() => {
                  onSelect(reactant);
                  handleMenuClose();
                }}
              >
                <Typography>{reactant.name || "<No Name>"}</Typography>
              </MenuItem>
            );
          })
        )}
      </Menu>
    </>
  );
};
