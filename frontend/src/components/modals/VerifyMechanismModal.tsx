import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import { modalStyle } from "./modalStyle";

type VerifyMechanismModalProps = {
  open: boolean;
  defaultName: string;
  onClose: () => void;
  onSubmit: (name: string, note: string) => Promise<void> | void;
  loading?: boolean;
};

export const VerifyMechanismModal: React.FC<VerifyMechanismModalProps> = ({
  open,
  defaultName,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [name, setName] = useState<string>(defaultName);
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setNote("");
      setError(null);
    }
  }, [open, defaultName]);

  const handleVerify = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setError(null);
    await onSubmit(name.trim(), note.trim());
  };

  return (
    <Modal open={open} onClose={loading ? undefined : onClose} aria-labelledby="verify-mechanism-modal-title">
      <Box sx={{ ...modalStyle, maxWidth: 500 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <VerifiedIcon color="success" />
          <Typography id="verify-mechanism-modal-title" variant="h6">
            Verify Chemical Mechanism
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Mark this mechanism as scientifically valid. This creates a frozen snapshot of the mechanism and its referenced species, phases, and reactions.
        </Typography>

        <TextField
          label="Version Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setError(null);
          }}
          error={Boolean(error)}
          helperText={error}
          fullWidth
          disabled={loading}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Notes (Optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Checked against JPL 19-5 Tables 1 and 2..."
          multiline
          minRows={3}
          maxRows={6}
          fullWidth
          disabled={loading}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleVerify}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <VerifiedIcon />}
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

