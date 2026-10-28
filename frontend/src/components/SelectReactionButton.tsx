import { Button, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export type SelectReactionButtonProps = {
  /** Called when the button is clicked. The parent opens its dialog. */
  onSelect: () => void;
  "aria-label": string;
  text?: string;
};

/**
 * The add button of a table of the mechanism editor. With text it shows a
 * button with the text, and without text it shows an icon button.
 */
export const SelectReactionButton: React.FC<SelectReactionButtonProps> = ({
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
