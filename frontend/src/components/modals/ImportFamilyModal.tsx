import { Box, Button, List, ListItem, Modal, Typography } from "@mui/material";
import React, { useState } from "react";
import { Family } from "../../types/chemistryModels";
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
  const [family, setFamily] = useState<Family | null>(null);

  const onFileParse = (uploadedFamily: Family | null) => {
    setFamily(uploadedFamily);
    if (!uploadedFamily) {
      alert("Could not parse input file");
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setFamily(null);
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
              setFamily(null);
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
