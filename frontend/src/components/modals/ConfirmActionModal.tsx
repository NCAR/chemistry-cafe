import { Box, Button, Modal, Typography } from "@mui/material";
import React from "react";
import WarningIcon from "@mui/icons-material/Warning";
import { modalStyle } from "./modalStyle";

type ConfirmActionModalProps = {
  open: boolean;
  onClose: () => void;
  onAction: () => void;
  message: string;
  subtitle: string;
  confirmColor?: "primary" | "secondary" | "warning" | "error";
};

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  open,
  onClose,
  onAction,
  message,
  subtitle,
  confirmColor,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          ...modalStyle,
          width: "60%",
          maxHeight: "80%",
          overflowY: "auto",
        }}
        role="menu"
      >
        <Typography
          sx={{
            display: "flex",
            columnGap: "0.5em",
            alignItems: "center",
          }}
          color="textPrimary"
          variant="h5"
        >
          <WarningIcon color="warning" />
          Attention
        </Typography>
        <Typography color="textPrimary" variant="h6">
          {message}
        </Typography>
        <Typography color="textSecondary" variant="body1">
          {subtitle}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            columnGap: "1em",
          }}
        >
          <Button
            sx={{
              flex: 1,
            }}
            aria-label="Confirm Irreversable Action"
            data-testid="confirm-action"
            color={confirmColor ?? "primary"}
            variant="contained"
            onClick={onAction}
          >
            Confirm
          </Button>
          <Button
            sx={{
              flex: 1,
            }}
            aria-label="Cancel Irreversable Action"
            variant="outlined"
            color="primary"
            onClick={onClose}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
