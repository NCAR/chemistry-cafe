import { useState, MouseEvent } from "react";
import { Reaction } from "../types/chemistryModels";
import { Button, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export type SelectReactionButtonProps = {
  onSelect: (reaction: Reaction) => void;
  "aria-label": string;
  reactions: Array<Reaction>;
  text?: string;
};

export const SelectReactionButton: React.FC<SelectReactionButtonProps> = ({
  "aria-label": ariaLabel,
  onSelect,
  reactions,
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
      {
        text ? (
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
        )
      }
      <Menu open={open} anchorEl={anchorEl} onClose={handleMenuClose}>
        {reactions.length == 0 ? (
          <MenuItem disabled>
            <Typography>No Reactions Found</Typography>
          </MenuItem>
        ) : (
          reactions.map((reaction, index) => {
            return (
              <MenuItem
                key={`selection-${reaction.id}-${index}`}
                onClick={() => {
                  onSelect(reaction);
                  handleMenuClose();
                }}
              >
                <Typography>{reaction.name || "<No Name>"}</Typography>
              </MenuItem>
            );
          })
        )}
      </Menu>
    </>
  );
};