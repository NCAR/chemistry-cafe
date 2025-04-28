import { Box, FormLabel, Input, SxProps, Theme } from "@mui/material"
import React from "react"
import { Family } from "../types/chemistryModels"
import { deserializeFamilyCAMPV1 } from "../helpers/serialization"


type CAMPFileUploadProps = {
  onFileParse: (family: Family | null) => any,
  sx?: SxProps<Theme>,
}

const CAMPFileUpload: React.FC<CAMPFileUploadProps> = ({ onFileParse, sx }) => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!event.target.files) {
      console.info("Cancelled file upload");
      return;
    }
    const file: File = event.target.files[0]
    const fileText = await file.text();

    try {
      const parsedFamily = deserializeFamilyCAMPV1(fileText);
      onFileParse(parsedFamily);
    }
    catch (err) {
      console.error(err);
      onFileParse(null);
      return;
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        ...sx
      }}
    >
      <FormLabel id="file-upload-label">Upload CAMP V1 Data:</FormLabel>
      <Input
        aria-labelledby="file-upload-label"
        aria-label="Upload CAMP file"
        type="file"
        slotProps={{
          input: {
            accept: "application/json, application/yaml, .yml, .yaml"
          }
        }}
        onChange={handleFileUpload}
      />
    </Box>
  )
}

export default CAMPFileUpload;
