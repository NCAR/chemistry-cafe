import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { modalStyle } from "./modalStyle";

type DeprecateMechanismModalProps = {
  open: boolean;
  versionName: string;
  otherVersions?: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSubmit: (reason: string, betterVersionId?: string) => Promise<void> | void;
  loading?: boolean;
};

export const DeprecateMechanismModal: React.FC<DeprecateMechanismModalProps> = ({
  open,
  versionName,
  otherVersions = [],
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [reason, setReason] = useState<string>("");
  const [betterVersionId, setBetterVersionId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setBetterVersionId("");
      setError(null);
    }
  }, [open]);

  const handleDeprecate = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for deprecation.");
      return;
    }
    setError(null);
    await onSubmit(reason.trim(), betterVersionId ? betterVersionId : undefined);
  };

  return (
    <Modal open={open} onClose={loading ? undefined : onClose} aria-labelledby="deprecate-mechanism-modal-title">
      <Box sx={{ ...modalStyle, maxWidth: 500 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <WarningAmberIcon color="warning" />
          <Typography id="deprecate-mechanism-modal-title" variant="h6">
            Deprecate Verified Mechanism
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Mark &quot;{versionName}&quot; as deprecated. The version remains visible and downloadable, but users will be warned.
        </Typography>

        <TextField
          label="Deprecation Reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (e.target.value.trim()) setError(null);
          }}
          placeholder="e.g. Superseded by updated rate constants; use V2 instead."
          multiline
          minRows={3}
          maxRows={5}
          error={Boolean(error)}
          helperText={error}
          fullWidth
          disabled={loading}
          sx={{ mb: 2 }}
        />

        {otherVersions.length > 0 && (
          <FormControl fullWidth sx={{ mb: 3 }} disabled={loading}>
            <InputLabel id="better-version-select-label">Recommended Successor Version (Optional)</InputLabel>
            <Select
              labelId="better-version-select-label"
              value={betterVersionId}
              label="Recommended Successor Version (Optional)"
              onChange={(e) => setBetterVersionId(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {otherVersions.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleDeprecate}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <WarningAmberIcon />}
          >
            {loading ? "Deprecating..." : "Deprecate"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

