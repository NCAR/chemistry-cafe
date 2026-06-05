import { Box, FormLabel, Input, SxProps, Theme } from "@mui/material";
import React from "react";
import { Family } from "../types/chemistryModels";
import { deserializeV1Mechanism } from "../helpers/serialization";

type FileUploadProps = {
  onFileParse: (family: Family | null) => any;
  sx?: SxProps<Theme>;
};

const FileUpload: React.FC<FileUploadProps> = ({ onFileParse, sx }) => {
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (!event.target.files) {
      console.info("Cancelled file upload");
      return;
    }
    const file: File = event.target.files[0];
    const fileText = await file.text();

    try {
      const parsedFamily = deserializeV1Mechanism(fileText);
      onFileParse(parsedFamily);
    } catch (err) {
      console.error(err);
      onFileParse(null);
      return;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        ...sx,
      }}
    >
      <FormLabel id="file-upload-label">Upload V1 Data:</FormLabel>
      <Input
        aria-labelledby="file-upload-label"
        aria-label="Upload mechanism file"
        type="file"
        slotProps={{
          input: {
            accept: "application/json, application/yaml, .yml, .yaml",
          },
        }}
        onChange={handleFileUpload}
      />
    </Box>
  );
};

export default FileUpload;
