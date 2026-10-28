import { Species } from "../types/chemistryModels";
import { Button, IconButton } from "@mui/material";
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

export type SelectSpeciesButtonProps = {
  /** Called when the button is clicked. The parent opens its dialog. */
  onSelect: () => void;
  "aria-label": string;
  text?: string;
};

/**
 * The add button of a table of the mechanism editor. With text it shows a
 * button with the text, and without text it shows an icon button.
 */
export const SelectSpeciesButton: React.FC<SelectSpeciesButtonProps> = ({
  "aria-label": ariaLabel,
  onSelect,
  text,
}) =>
  text ? (
    <Button startIcon={<AddIcon />} color="primary" onClick={onSelect}>
      {text}
    </Button>
  ) : (
    <IconButton aria-label={ariaLabel} color="primary" onClick={onSelect}>
      <AddIcon />
    </IconButton>
  );
