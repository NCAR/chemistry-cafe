import {
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { useState, MouseEvent } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type RowActionsButtonProps = {
  handleEditButtonClick: () => void;
  handleDeleteButtonClick: () => void;
};

/**
 * Displays options to edit a row in a datagrid
 */
export const RowActionsButton: React.FC<RowActionsButtonProps> = ({
  handleEditButtonClick,
  handleDeleteButtonClick,
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

  return (
    <>
      <Tooltip title="Row Actions" disableInteractive>
        <GridActionsCellItem
          aria-label="Expand Row Actions"
          data-testid="row-actions-button"
          icon={<MoreVertIcon />}
          label="View Properties"
          onClick={handleMenuOpen}
        ></GridActionsCellItem>
      </Tooltip>
      <Menu open={open} anchorEl={anchorEl} onClose={handleMenuClose}>
        <MenuItem
          aria-label="Edit this table row"
          data-testid="edit-row"
          onClick={handleEditButtonClick}
        >
          <ListItemIcon>
            <EditIcon color="action" />
          </ListItemIcon>
          <Typography>Edit</Typography>
        </MenuItem>
        <MenuItem
          aria-label="Delete this table row"
          data-testid="delete-row"
          onClick={handleDeleteButtonClick}
        >
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          <Typography>Delete</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
