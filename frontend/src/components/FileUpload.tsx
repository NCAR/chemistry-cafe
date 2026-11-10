import { Box, FormLabel, Input, SxProps, Theme } from "@mui/material";
import React from "react";
import { ImportResult, importMechanismFiles } from "../helpers/serialization";

type FileUploadProps = {
  /** Called with the import result, or with null and the error message */
  onFileParse: (result: ImportResult | null, error?: string) => any;
  sx?: SxProps<Theme>;
};

const FileUpload: React.FC<FileUploadProps> = ({ onFileParse, sx }) => {
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (!event.target.files || event.target.files.length === 0) {
      console.info("Cancelled file upload");
      return;
    }
    const files = Array.from(event.target.files);

    try {
      onFileParse(await importMechanismFiles(files));
    } catch (err) {
      console.error(err);
      onFileParse(null, err instanceof Error ? err.message : String(err));
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
      <FormLabel id="file-upload-label">
        Upload a mechanism configuration: one JSON or YAML file, all the files
        of the configuration, or a .zip file
      </FormLabel>
      <Input
        aria-labelledby="file-upload-label"
        aria-label="Upload mechanism file"
        type="file"
        slotProps={{
          input: {
            accept: [
              ".json",
              ".yml",
              ".yaml",
              ".zip",
              "application/json",
              "application/yaml",
              "application/zip",
            ].join(","),
            multiple: true,
          },
        }}
        onChange={handleFileUpload}
      />
    </Box>
  );
};

export default FileUpload;
