import {
  Alert,
  Box,
  Button,
  List,
  ListItem,
  Modal,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Family } from "../../types/chemistryModels";
import { ImportResult } from "../../helpers/serialization";
import FileUpload from "../FileUpload";
import { modalStyle } from "./modalStyle";

type ImportFamilyModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (family: Family) => any;
};

export const ImportFamilyModal: React.FC<ImportFamilyModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const family: Family | null = result?.family ?? null;
  const problems = result?.errors ?? [];

  const onFileParse = (imported: ImportResult | null, parseError?: string) => {
    setResult(imported);
    setError(
      imported?.family
        ? null
        : (parseError ??
            (imported?.errors.map((e) => e.message).join("\n") ||
              "Could not parse input file")),
    );
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setResult(null);
        setError(null);
        onClose();
      }}
    >
      <Box
        sx={{
          ...modalStyle,
          width: "60%",
          maxHeight: "80%",
          overflowY: "auto",
        }}
        role="menu"
        component="div"
      >
        <FileUpload onFileParse={onFileParse} />
        {error && (
          <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>
            {error}
          </Alert>
        )}
        {family && (
          <Box>
            <Typography color="textPrimary">Configuration Info:</Typography>
            <List>
              <ListItem>
                <Typography color="textPrimary">Name: {family.name}</Typography>
              </ListItem>
              <ListItem>
                <Typography color="textPrimary">
                  Species Count: {family.species.length}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography color="textPrimary">
                  Reaction Count: {family.reactions.length}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography color="textPrimary">
                  Phase Count: {family.phases.length}
                </Typography>
              </ListItem>
            </List>
            {problems.length > 0 && (
              <Alert severity="warning" data-testid="import-problems">
                <Typography>
                  The configuration has {problems.length}{" "}
                  {problems.length === 1 ? "problem" : "problems"}. The family
                  has the items that the parser could read. Fix the problems in
                  the editor.
                </Typography>
                <List dense sx={{ maxHeight: "12em", overflowY: "auto" }}>
                  {problems.map((problem, index) => (
                    <ListItem key={index} sx={{ whiteSpace: "pre-wrap" }}>
                      {problem.message}
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}
            {result && result.addedSpecies.length > 0 && (
              <Alert severity="info" data-testid="import-added-species">
                The configuration uses species that it does not define. The
                family gets a species for each one:{" "}
                {result.addedSpecies.join(", ")}.
              </Alert>
            )}
          </Box>
        )}
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
            aria-label="Create imported Family"
            color="primary"
            variant="contained"
            disabled={!family}
            onClick={() => {
              if (!family) {
                alert("Cannnot create null family");
                return;
              }
              onSubmit(family);
              setResult(null);
              onClose();
            }}
          >
            Create new Family
          </Button>
          <Button
            sx={{
              flex: 1,
            }}
            aria-label="Cancel Family Creation"
            variant="outlined"
            onClick={onClose}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
