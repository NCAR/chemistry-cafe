import { Box, Button, Modal, Typography } from "@mui/material";
import React from "react";
import ErrorIcon from "@mui/icons-material/Error";
import { modalStyle } from "./modalStyle";

type ValidationErrorsModalProps = {
  open: boolean;
  onClose: () => void;
  message: string;
  errors: string[];
};

/**
 * Shows the messages from the mechanism validator
 */
export const ValidationErrorsModal: React.FC<ValidationErrorsModalProps> = ({
  open,
  onClose,
  message,
  errors,
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
        data-testid="validation-errors-modal"
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
          <ErrorIcon color="error" />
          The mechanism is not valid
        </Typography>
        <Typography color="textPrimary" variant="h6">
          {message}
        </Typography>
        <Box component="ul" sx={{ m: 0 }}>
          {errors.map((error, index) => (
            <Typography
              key={index}
              component="li"
              color="textSecondary"
              variant="body1"
            >
              {error}
            </Typography>
          ))}
        </Box>
        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};
