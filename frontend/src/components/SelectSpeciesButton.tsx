import { MouseEvent, ReactNode, useState } from "react";
import { Species } from "../types/chemistryModels";
import {
  Autocomplete,
  AutocompleteProps,
  Button,
  IconButton,
  Popover,
  PopperProps,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

/**
 * Sorts species by name in alphabetical order. Numbers in names sort by
 * value, so "C2H6" comes before "C10H22".
 */
export const bySpeciesName = (a: Species, b: Species) =>
  a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: "base",
  });

// Shows the list of the search under the field, inside the popover, and not
// in a separate floating layer.
const InlineList = ({ className, children }: PopperProps) => (
  <div className={className}>{children as ReactNode}</div>
);

const listProps: Partial<
  AutocompleteProps<Species, false, false, false>
>["slotProps"] = {
  paper: { elevation: 0 },
  listbox: { style: { maxHeight: "16em" } },
};

export type SelectSpeciesButtonProps = {
  onSelect: (species: Species) => void;
  "aria-label": string;
  species: Array<Species>;
  text?: string;
};

/**
 * A button that opens a search field with the given species in alphabetical
 * order. A selection calls onSelect and closes the search.
 */
export const SelectSpeciesButton: React.FC<SelectSpeciesButtonProps> = ({
  "aria-label": ariaLabel,
  onSelect,
  species,
  text,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {text ? (
        <Button startIcon={<AddIcon />} color="primary" onClick={handleOpen}>
          {text}
        </Button>
      ) : (
        <IconButton aria-label={ariaLabel} color="primary" onClick={handleOpen}>
          <AddIcon />
        </IconButton>
      )}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Autocomplete
          open
          size="small"
          sx={{ width: "16em", padding: 1 }}
          options={[...species].sort(bySpeciesName)}
          getOptionLabel={(option) => option.name || "<No Name>"}
          noOptionsText="No species found"
          PopperComponent={InlineList}
          slotProps={listProps}
          renderInput={(params) => (
            <TextField {...params} autoFocus placeholder="Search species" />
          )}
          onChange={(_, selected) => {
            if (selected) {
              onSelect(selected);
              handleClose();
            }
          }}
        />
      </Popover>
    </>
  );
};
